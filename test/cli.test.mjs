import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function cli(...args) {
  return spawnSync(process.execPath, [path.join(ROOT, "index.mjs"), ...args], { cwd: ROOT, encoding: "utf8" });
}

test("CLI brief output", async (t) => {
  await t.test("uses the English name for an English query", () => {
    const res = cli("charizard", "--brief");

    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /^#006 Charizard \| fire\/flying \|/);
    assert.doesNotMatch(res.stdout, /噴火龍/);
  });

  await t.test("uses the Chinese name with the English one alongside for a Chinese query", () => {
    const res = cli("噴火龍", "--brief");

    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /^#006 噴火龍 \(Charizard\) \| 火\/飛行 \|/);
  });
});

test("CLI argument validation", async (t) => {
  await t.test("rejects an unknown option instead of swallowing the next argument", () => {
    const before = cli("--verbose", "charizard", "--brief");
    assert.equal(before.status, 1);
    assert.match(before.stderr, /--verbose/);

    const after = cli("charizard", "--verbose", "--brief");
    assert.equal(after.status, 1);
    assert.match(after.stderr, /--verbose/);
  });

  await t.test("rejects an unsupported --lang value", () => {
    const res = cli("charizard", "--lang", "ja", "--brief");

    assert.equal(res.status, 1);
    assert.match(res.stderr, /--lang/);
  });

  await t.test("reports a missing option value", () => {
    const res = cli("25", "--sprite");

    assert.equal(res.status, 1);
    assert.match(res.stderr, /--sprite/);
  });
});

test("CLI ambiguous query", async (t) => {
  await t.test("fails and lists candidates instead of printing a guess", () => {
    const res = cli("char", "--brief");

    assert.equal(res.status, 1);
    assert.equal(res.stdout, "");
    assert.match(res.stderr, /Charmander/);
    assert.match(res.stderr, /Charizard/);
  });
});

test("CLI exit status", async (t) => {
  await t.test("exits non-zero when the requested download fails", () => {
    const res = cli("25", "--out", "pikachu.txt");

    assert.equal(res.status, 1);
    assert.match(res.stderr, /Disallowed file extension/);
  });
});
