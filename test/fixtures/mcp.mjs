import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const MOCK_FETCH = pathToFileURL(path.join(ROOT, "test/fixtures/mock-fetch.mjs")).href;

// Writes raw lines to a fresh `--mcp` process, with fetch mocked, and returns every JSON line it
// printed. Strings are sent as-is so tests can send malformed input; anything else is serialized.
export function mcpExchange(messages, { cwd = ROOT, env = process.env } = {}) {
  const input = messages.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join("\n") + "\n";
  const res = spawnSync(process.execPath, ["--import", MOCK_FETCH, path.join(ROOT, "index.mjs"), "--mcp"], {
    cwd,
    env,
    input,
    encoding: "utf8",
  });
  return res.stdout.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

// Sends one tools/call and returns its result.
export function callMcpTool(name, args, options) {
  const request = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } };
  return mcpExchange([request], options).pop().result;
}
