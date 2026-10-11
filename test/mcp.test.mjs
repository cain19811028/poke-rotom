import test from "node:test";
import assert from "node:assert/strict";
import { callMcpTool } from "./fixtures/mcp.mjs";

function weaknessOf(types) {
  const result = callMcpTool("calculate_weakness", { types });
  return { result, body: result.isError ? null : JSON.parse(result.content[0].text) };
}

test("MCP calculate_weakness input validation", async (t) => {
  await t.test("computes matchups for valid types regardless of case", () => {
    const { result, body } = weaknessOf(["Fire", "Flying"]);

    assert.ok(!result.isError, result.content[0].text);
    assert.deepEqual(body.types, ["fire", "flying"]);
    assert.deepEqual(body.weaknesses["4x"], ["rock"]);
  });

  await t.test("rejects unknown types instead of ignoring them", () => {
    const { result } = weaknessOf(["fire", "banana"]);

    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /banana/);
  });

  await t.test("rejects more than two types", () => {
    const { result } = weaknessOf(["fire", "water", "grass"]);

    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /at most two/);
  });

  await t.test("treats a repeated type as a single type", () => {
    assert.deepEqual(weaknessOf(["fire", "fire"]).body.weaknesses, weaknessOf(["fire"]).body.weaknesses);
  });
});
