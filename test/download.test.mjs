import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { downloadSprite } from "../src/lookup.mjs";
import { fakeSpriteFetch, FAKE_SPRITE_BYTES } from "./fixtures/fake-sprite.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOCK_FETCH = pathToFileURL(path.join(ROOT, "test/fixtures/mock-fetch.mjs")).href;
const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";

// An output root plus a sibling directory outside it. The process also moves into the root,
// so the default root (cwd) and an explicit one point at the same place.
function sandbox(t) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "poke-rotom-dl-")));
  const root = path.join(dir, "root");
  const outside = path.join(dir, "outside");
  fs.mkdirSync(root);
  fs.mkdirSync(outside);
  const prevCwd = process.cwd();
  process.chdir(root);
  t.mock.method(globalThis, "fetch", fakeSpriteFetch);
  t.after(() => {
    process.chdir(prevCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return { root, outside };
}

function callMcpDownload({ cwd, env, args }) {
  const request = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "download_sprite", arguments: args } };
  const res = spawnSync(process.execPath, ["--import", MOCK_FETCH, path.join(ROOT, "index.mjs"), "--mcp"], {
    cwd,
    env,
    input: JSON.stringify(request) + "\n",
    encoding: "utf8",
  });
  return JSON.parse(res.stdout.trim().split("\n").pop()).result;
}

function envWithout(name) {
  const env = { ...process.env };
  delete env[name];
  return env;
}

test("Sprite download boundary (downloadSprite)", async (t) => {
  await t.test("writes the sprite inside the output root", async (t) => {
    const { root } = sandbox(t);

    const saved = await downloadSprite(SPRITE_URL, "sprites/pikachu.png", { root });

    assert.equal(saved, path.join(root, "sprites", "pikachu.png"));
    assert.equal(fs.statSync(saved).size, FAKE_SPRITE_BYTES);
  });

  await t.test("rejects a symlinked directory that leads outside the root", async (t) => {
    const { root, outside } = sandbox(t);
    fs.symlinkSync(outside, path.join(root, "link"), "dir");

    await assert.rejects(downloadSprite(SPRITE_URL, "link/escaped.png", { root }), /symlink/);
    await assert.rejects(downloadSprite(SPRITE_URL, "link/new/escaped.png", { root }), /symlink/);
    assert.deepEqual(fs.readdirSync(outside), []);
  });

  await t.test("does not overwrite an existing file unless asked", async (t) => {
    const { root } = sandbox(t);
    const existing = path.join(root, "keep.png");
    fs.writeFileSync(existing, "precious");

    await assert.rejects(downloadSprite(SPRITE_URL, "keep.png", { root }), /already exists/);
    assert.equal(fs.readFileSync(existing, "utf8"), "precious");

    await downloadSprite(SPRITE_URL, "keep.png", { root, overwrite: true });
    assert.equal(fs.statSync(existing).size, FAKE_SPRITE_BYTES);
  });

  await t.test("never writes through a symlinked file, even with overwrite", async (t) => {
    const { root, outside } = sandbox(t);
    const victim = path.join(outside, "victim.png");
    fs.writeFileSync(victim, "victim");
    fs.symlinkSync(victim, path.join(root, "target.png"));

    await assert.rejects(downloadSprite(SPRITE_URL, "target.png", { root, overwrite: true }), /symlink/);
    assert.equal(fs.readFileSync(victim, "utf8"), "victim");
  });

  await t.test("refuses the filesystem root as the output root", async (t) => {
    const { root, outside } = sandbox(t);
    const fsRoot = path.parse(root).root;
    process.chdir(fsRoot);

    await assert.rejects(
      downloadSprite(SPRITE_URL, path.join(outside, "anywhere.png"), { root: fsRoot }),
      /filesystem root/
    );
    assert.deepEqual(fs.readdirSync(outside), []);
  });
});

test("CLI --out overwrite protection", async (t) => {
  const runCli = (cwd, ...args) =>
    spawnSync(process.execPath, ["--import", MOCK_FETCH, path.join(ROOT, "index.mjs"), ...args], {
      cwd,
      encoding: "utf8",
    });

  await t.test("keeps an existing file unless --force is given", (t) => {
    const { root } = sandbox(t);
    const existing = path.join(root, "pikachu.png");
    fs.writeFileSync(existing, "precious");

    const kept = runCli(root, "25", "--out", "pikachu.png");
    assert.match(kept.stderr, /already exists/);
    assert.equal(fs.readFileSync(existing, "utf8"), "precious");

    runCli(root, "25", "--out", "pikachu.png", "--force");
    assert.equal(fs.statSync(existing).size, FAKE_SPRITE_BYTES);
  });
});

test("MCP download_sprite output directory", async (t) => {
  await t.test("resolves relative paths against POKE_ROTOM_OUTPUT_DIR", (t) => {
    const { root, outside } = sandbox(t);

    const result = callMcpDownload({
      cwd: outside,
      env: { ...process.env, POKE_ROTOM_OUTPUT_DIR: root },
      args: { query: "pikachu", out: "pikachu.png" },
    });

    assert.ok(!result.isError, result.content?.[0]?.text);
    assert.equal(JSON.parse(result.content[0].text).saved_to, path.join(root, "pikachu.png"));
    assert.deepEqual(fs.readdirSync(outside), []);
  });

  await t.test("refuses to write when launched from the filesystem root", (t) => {
    const { root, outside } = sandbox(t);

    const result = callMcpDownload({
      cwd: path.parse(root).root,
      env: envWithout("POKE_ROTOM_OUTPUT_DIR"),
      args: { query: "pikachu", out: path.join(outside, "pikachu.png") },
    });

    assert.equal(result.isError, true);
    assert.deepEqual(fs.readdirSync(outside), []);
  });
});
