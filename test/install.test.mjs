import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_FILES = ["install.sh", "SKILL.md", "index.mjs"];

// Every case runs against a throwaway clone and HOME, so the real repo and home are never touched.
function sandbox(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "poke-rotom-install-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const home = path.join(dir, "home");
  const skillDir = path.join(home, ".claude", "skills", "poke-rotom");
  fs.mkdirSync(path.dirname(skillDir), { recursive: true });
  return { dir, home, skillDir };
}

function makeClone(clone) {
  fs.mkdirSync(clone, { recursive: true });
  for (const f of SKILL_FILES) fs.copyFileSync(path.join(ROOT, f), path.join(clone, f));
  fs.writeFileSync(path.join(clone, "NOTES.md"), "uncommitted local work");
}

function install(clone, home) {
  return spawnSync("bash", [path.join(clone, "install.sh")], {
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });
}

test("install.sh", { skip: process.platform === "win32" && "needs bash" }, async (t) => {
  await t.test("copies the skill into a fresh home", (t) => {
    const { dir, home, skillDir } = sandbox(t);
    const clone = path.join(dir, "clone");
    makeClone(clone);

    const res = install(clone, home);

    assert.equal(res.status, 0, res.stderr);
    assert.ok(fs.existsSync(path.join(skillDir, "SKILL.md")));
  });

  await t.test("replaces a previous install", (t) => {
    const { dir, home, skillDir } = sandbox(t);
    const clone = path.join(dir, "clone");
    makeClone(clone);
    assert.equal(install(clone, home).status, 0);
    fs.writeFileSync(path.join(skillDir, "stale.txt"), "left over from an old version");

    const res = install(clone, home);

    assert.equal(res.status, 0, res.stderr);
    assert.ok(!fs.existsSync(path.join(skillDir, "stale.txt")));
  });

  await t.test("leaves a symlinked skill dir and the clone it points to intact", (t) => {
    const { dir, home, skillDir } = sandbox(t);
    const clone = path.join(dir, "clone");
    makeClone(clone);
    fs.symlinkSync(clone, skillDir);

    install(clone, home);

    assert.ok(fs.lstatSync(skillDir).isSymbolicLink());
    for (const f of [...SKILL_FILES, "NOTES.md"]) {
      assert.ok(fs.existsSync(path.join(clone, f)), `${f} was deleted from the clone`);
    }
  });

  await t.test("does not wipe a clone that already lives in the skill dir", (t) => {
    const { home, skillDir } = sandbox(t);
    makeClone(skillDir);

    install(skillDir, home);

    for (const f of [...SKILL_FILES, "NOTES.md"]) {
      assert.ok(fs.existsSync(path.join(skillDir, f)), `${f} was deleted from the clone`);
    }
  });

  await t.test("refuses to clear a directory that is not a poke-rotom install", (t) => {
    const { dir, home, skillDir } = sandbox(t);
    const clone = path.join(dir, "clone");
    makeClone(clone);
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, "someone-else.txt"), "not ours");

    const res = install(clone, home);

    assert.notEqual(res.status, 0);
    assert.ok(fs.existsSync(path.join(skillDir, "someone-else.txt")));
  });
});
