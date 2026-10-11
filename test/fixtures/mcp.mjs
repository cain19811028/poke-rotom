import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const MOCK_FETCH = pathToFileURL(path.join(ROOT, "test/fixtures/mock-fetch.mjs")).href;

// Sends one tools/call to a fresh `--mcp` process, with fetch mocked, and returns its result.
export function callMcpTool(name, args, { cwd = ROOT, env = process.env } = {}) {
  const request = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } };
  const res = spawnSync(process.execPath, ["--import", MOCK_FETCH, path.join(ROOT, "index.mjs"), "--mcp"], {
    cwd,
    env,
    input: JSON.stringify(request) + "\n",
    encoding: "utf8",
  });
  return JSON.parse(res.stdout.trim().split("\n").pop()).result;
}
