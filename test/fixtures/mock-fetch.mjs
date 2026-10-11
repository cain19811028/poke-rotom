// Preloaded with `node --import` so CLI and MCP tests never touch the network.
import { fakeSpriteFetch } from "./fake-sprite.mjs";

globalThis.fetch = fakeSpriteFetch;
