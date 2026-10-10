#!/usr/bin/env node
import { findPokemon, getSpriteUrl, downloadSprite } from "./src/lookup.mjs";
import { startMcpServer } from "./src/mcp-server.mjs";

function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--mcp") {
      flags.mcp = true;
    } else if (arg === "--shiny") {
      flags.shiny = true;
    } else if (arg === "--brief") {
      flags.brief = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { flags, positionals };
}

function printHelp() {
  console.log(`
⚡ poke-rotom - Lightweight Pokémon MCP Server & Agent Skill

Usage:
  node index.mjs <name_or_id> [options]
  node index.mjs --mcp

Options:
  --brief             Print ultra-compact single line summary (maximum token savings)
  --json              Print structured JSON (default)
  --sprite <style>    Sprite set: 'official' (default), 'showdown' (GIF), 'gen3' (pixel), 'default'
  --shiny             Fetch shiny / alternate colorway
  --out <path>        Download sprite image to specified file path
  --mcp               Run as Model Context Protocol (MCP) stdio server
  --help, -h          Show this help message

Examples:
  node index.mjs 噴火龍
  node index.mjs charizard --brief
  node index.mjs 25 --sprite official --shiny --out pikachu_shiny.png
  node index.mjs リザードン --sprite showdown --out charizard.gif
`);
}

async function main() {
  const { flags, positionals } = parseArgs(process.argv.slice(2));

  // 1. MCP Server Mode
  if (flags.mcp) {
    startMcpServer();
    return;
  }

  // 2. Help
  if (flags.help || (positionals.length === 0 && !flags.mcp)) {
    printHelp();
    process.exit(flags.help ? 0 : 1);
  }

  const query = positionals.join(" ").trim();
  const pokemon = findPokemon(query);

  if (!pokemon) {
    console.error(`❌ Pokémon not found for query: "${query}"`);
    console.error(`   Tip: You can use Traditional/Simplified Chinese, English, Japanese, or National Dex ID.`);
    process.exit(1);
  }

  const spriteSet = flags.sprite || "official";
  const isShiny = Boolean(flags.shiny);
  const spriteUrl = getSpriteUrl(pokemon.id, spriteSet, isShiny);

  // Download if --out specified
  let downloadedPath = null;
  if (flags.out) {
    try {
      downloadedPath = await downloadSprite(spriteUrl, flags.out);
    } catch (err) {
      console.error(`⚠️ Failed to download sprite: ${err.message}`);
    }
  }

  // 3. Ultra-compact brief mode
  if (flags.brief) {
    const weaknesses = [];
    if (pokemon.weaknesses?.["4x"]?.length) weaknesses.push(`4x:${pokemon.weaknesses["4x"].join(",")}`);
    if (pokemon.weaknesses?.["2x"]?.length) weaknesses.push(`2x:${pokemon.weaknesses["2x"].join(",")}`);
    const weakStr = weaknesses.length ? ` | Weak: ${weaknesses.join(" ")}` : "";
    const padId = String(pokemon.id).padStart(3, "0");
    const outStr = downloadedPath ? ` | Saved: ${downloadedPath}` : "";

    console.log(
      `#${padId} ${pokemon.zh_tw || pokemon.en} (${pokemon.en}) | ${pokemon.types.join("/")} | BST:${pokemon.stats.bst} (HP:${pokemon.stats.hp} Atk:${pokemon.stats.atk} Def:${pokemon.stats.def} SpA:${pokemon.stats.spa} SpD:${pokemon.stats.spd} Spe:${pokemon.stats.spe})${weakStr}${outStr}`
    );
    return;
  }

  // 4. Structured JSON mode (default)
  const output = {
    ...pokemon,
    sprite: spriteUrl,
    sprite_style: spriteSet,
    is_shiny: isShiny,
  };
  if (downloadedPath) {
    output.saved_to = downloadedPath;
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
