// SPDX-License-Identifier: MIT
// Copyright (c) 2026 cain19811028

import readline from "node:readline";
import { findPokemon, getSpriteUrl, downloadSprite } from "./lookup.mjs";
import { calculateWeaknesses, calculateStabCoverage, TYPES } from "./type-chart.mjs";

// Unknown or extra types used to be skipped silently, which returned a confident wrong matchup.
function parseTypes(raw) {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[,/\s]+/) : [];
  if (list.some((t) => typeof t !== "string")) {
    return { error: "Invalid 'types' parameter. Every type must be a string, e.g. ['fire', 'flying']" };
  }
  const types = [...new Set(list.map((t) => t.toLowerCase().trim()).filter(Boolean))];
  if (types.length === 0) {
    return { error: "Missing or invalid 'types' parameter. Expected array of types, e.g. ['fire', 'flying']" };
  }
  const unknown = types.filter((t) => !TYPES.includes(t));
  if (unknown.length > 0) {
    return { error: `Unknown type(s): ${unknown.join(", ")}. Valid types: ${TYPES.join(", ")}` };
  }
  if (types.length > 2) {
    return { error: `A Pokémon has at most two types, got ${types.length}: ${types.join(", ")}` };
  }
  return { types };
}

const TOOLS = [
  {
    name: "lookup_pokemon",
    description: "Look up Pokémon info by name (EN/ZH/JA) or National Dex ID. Returns multi-lingual names, types, base stats (BST), battle weaknesses, and sprite URL. Ultra token-efficient.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Pokémon name in English, Traditional Chinese (繁中), Simplified Chinese (簡中), Japanese (日文), or National Dex ID (e.g. '噴火龍', 'charizard', '25')",
        },
        sprite: {
          type: "string",
          enum: ["official", "showdown", "gen3", "default"],
          description: "Sprite set: 'official' (475x475 HD vector, default), 'showdown' (animated battle GIF), 'gen3' (GBA Emerald pixel), 'default' (classic front)",
        },
        shiny: {
          type: "boolean",
          description: "Whether to return shiny (色違) version sprite URL",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "calculate_weakness",
    description: "Calculate battle type matchups and defensive weaknesses/resistances for given Pokémon types.",
    inputSchema: {
      type: "object",
      properties: {
        types: {
          type: "array",
          items: { type: "string", enum: TYPES },
          minItems: 1,
          maxItems: 2,
          description: "One or two English type names (e.g. ['fire', 'flying'])",
        },
      },
      required: ["types"],
    },
  },
  {
    name: "download_sprite",
    description: "Download official Pokémon artwork or sprite to a local file path. Prevents AI image hallucination.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Pokémon name or ID",
        },
        out: {
          type: "string",
          description:
            "Output file path (e.g. 'charizard.png'). Relative paths resolve against POKE_ROTOM_OUTPUT_DIR, or the server's working directory when unset; the file must stay inside that directory.",
        },
        sprite: {
          type: "string",
          enum: ["official", "showdown", "gen3", "default"],
          description: "Sprite set style. Defaults to 'official'.",
        },
        shiny: {
          type: "boolean",
          description: "Whether to download shiny version",
        },
        overwrite: {
          type: "boolean",
          description: "Replace the file if it already exists. Defaults to false.",
        },
      },
      required: ["query", "out"],
    },
  },
];

export function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  function sendResponse(id, result, error = null) {
    const res = { jsonrpc: "2.0", id };
    if (error) {
      res.error = error;
    } else {
      res.result = result;
    }
    process.stdout.write(JSON.stringify(res) + "\n");
  }

  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let req;
    try {
      req = JSON.parse(trimmed);
    } catch {
      return;
    }

    const { id, method, params } = req;

    // Notifications (no response needed)
    if (method === "notifications/initialized") {
      return;
    }

    if (method === "initialize") {
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "poke-rotom",
          version: "1.0.0",
        },
      });
      return;
    }

    if (method === "ping") {
      sendResponse(id, {});
      return;
    }

    if (method === "tools/list") {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        if (toolName === "lookup_pokemon") {
          const pokemon = findPokemon(args.query);
          if (!pokemon) {
            sendResponse(id, {
              isError: true,
              content: [{ type: "text", text: `Pokémon not found for query: "${args.query}"` }],
            });
            return;
          }
          const spriteUrl = getSpriteUrl(pokemon.id, args.sprite || "official", args.shiny || false);
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({ ...pokemon, sprite: spriteUrl }),
              },
            ],
          });
          return;
        }

        if (toolName === "calculate_weakness") {
          const { types, error } = parseTypes(args.types);
          if (error) {
            sendResponse(id, { isError: true, content: [{ type: "text", text: error }] });
            return;
          }
          const weaknesses = calculateWeaknesses(types);
          const stabCoverage = calculateStabCoverage(types);
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({ types, weaknesses, stab_coverage: stabCoverage }),
              },
            ],
          });
          return;
        }

        if (toolName === "download_sprite") {
          if (typeof args.query !== "string" || !args.query.trim()) {
            sendResponse(id, {
              isError: true,
              content: [{ type: "text", text: "Missing or invalid 'query' parameter" }],
            });
            return;
          }
          if (typeof args.out !== "string" || !args.out.trim()) {
            sendResponse(id, {
              isError: true,
              content: [{ type: "text", text: "Missing or invalid 'out' parameter" }],
            });
            return;
          }

          const pokemon = findPokemon(args.query);
          if (!pokemon) {
            sendResponse(id, {
              isError: true,
              content: [{ type: "text", text: `Pokémon not found for query: "${args.query}"` }],
            });
            return;
          }
          const spriteUrl = getSpriteUrl(pokemon.id, args.sprite || "official", args.shiny || false);
          const savedPath = await downloadSprite(spriteUrl, args.out, {
            root: process.env.POKE_ROTOM_OUTPUT_DIR || process.cwd(),
            overwrite: args.overwrite === true,
          });
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  id: pokemon.id,
                  name: pokemon.slug,
                  sprite: spriteUrl,
                  saved_to: savedPath,
                }),
              },
            ],
          });
          return;
        }

        sendResponse(id, null, { code: -32601, message: `Tool not found: ${toolName}` });
      } catch (err) {
        sendResponse(id, {
          isError: true,
          content: [{ type: "text", text: `Error executing ${toolName}: ${err.message}` }],
        });
      }
      return;
    }

    if (id !== undefined) {
      sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
    }
  });

  // Keep alive
  process.on("SIGINT", () => process.exit(0));
}
