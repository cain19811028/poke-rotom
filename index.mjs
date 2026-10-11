#!/usr/bin/env node
import { findPokemon, getSpriteUrl, downloadSprite } from "./src/lookup.mjs";
import { startMcpServer } from "./src/mcp-server.mjs";
import { TYPE_NAMES_ZH } from "./src/type-chart.mjs";

function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--mcp") {
      flags.mcp = true;
    } else if (arg === "--shiny") {
      flags.shiny = true;
    } else if (arg === "--force") {
      flags.force = true;
    } else if (arg === "--brief") {
      flags.brief = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg.startsWith("--sprite=")) {
      flags.sprite = arg.slice("--sprite=".length);
    } else if (arg.startsWith("--out=")) {
      flags.out = arg.slice("--out=".length);
    } else if (arg.startsWith("--lang=")) {
      flags.lang = arg.slice("--lang=".length);
    } else if (arg === "--sprite" || arg === "--out" || arg === "--lang") {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = null;
      }
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
  --lang <en|zh-tw>   Language mode for output (default: auto-detected from query)
  --sprite <style>    Sprite set: 'official' (default), 'showdown' (GIF), 'gen3' (pixel), 'default'
  --shiny             Fetch shiny / alternate colorway
  --out <path>        Download sprite image to specified file path (inside the current directory)
  --force             Overwrite the --out file if it already exists
  --mcp               Run as Model Context Protocol (MCP) stdio server
  --help, -h          Show this help message

Examples:
  node index.mjs 噴火龍 --brief
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

  // Validate flags
  if (flags.sprite !== undefined) {
    if (!flags.sprite || typeof flags.sprite !== "string") {
      console.error("❌ Missing value for --sprite option. Expected: official, showdown, gen3, or default.");
      process.exit(1);
    }
    const validStyles = ["official", "showdown", "gen3", "default"];
    if (!validStyles.includes(flags.sprite.toLowerCase())) {
      console.error(`❌ Invalid sprite style: "${flags.sprite}". Expected one of: ${validStyles.join(", ")}`);
      process.exit(1);
    }
  }

  if (flags.out !== undefined && (!flags.out || typeof flags.out !== "string")) {
    console.error("❌ Missing or invalid file path for --out option.");
    process.exit(1);
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
      downloadedPath = await downloadSprite(spriteUrl, flags.out, { overwrite: Boolean(flags.force) });
    } catch (err) {
      console.error(`⚠️ Failed to download sprite: ${err.message}`);
    }
  }

  const isZh =
    flags.lang === "zh" ||
    flags.lang === "zh-tw" ||
    flags.lang === "zh_tw" ||
    (!flags.lang && /[\u4e00-\u9fa5]/.test(query));

  // 3. Ultra-compact brief mode
  if (flags.brief) {
    const padId = String(pokemon.id).padStart(3, "0");
    const outStr = downloadedPath ? ` | Saved: ${downloadedPath}` : "";

    if (isZh) {
      const zhTypes = pokemon.types.map((t) => TYPE_NAMES_ZH[t] || t).join("/");
      const zhStats = `BST:${pokemon.stats.bst} (HP:${pokemon.stats.hp} 攻:${pokemon.stats.atk} 防:${pokemon.stats.def} 特攻:${pokemon.stats.spa} 特防:${pokemon.stats.spd} 速:${pokemon.stats.spe})`;

      const zhWeaknesses = [];
      if (pokemon.weaknesses?.["4x"]?.length) {
        zhWeaknesses.push(...pokemon.weaknesses["4x"].map((t) => `${TYPE_NAMES_ZH[t] || t}(4x)`));
      }
      if (pokemon.weaknesses?.["2x"]?.length) {
        zhWeaknesses.push(...pokemon.weaknesses["2x"].map((t) => `${TYPE_NAMES_ZH[t] || t}(2x)`));
      }
      const weakStr = zhWeaknesses.length ? ` | 弱點: ${zhWeaknesses.join(", ")}` : "";
      const immuneStr = pokemon.weaknesses?.["0x"]?.length
        ? ` | 免疫: ${pokemon.weaknesses["0x"].map((t) => `${TYPE_NAMES_ZH[t] || t}(0x)`).join(", ")}`
        : "";

      console.log(
        `#${padId} ${pokemon.zh_tw || pokemon.en} (${pokemon.en}) | ${zhTypes} | ${zhStats}${weakStr}${immuneStr}${outStr}`
      );
      return;
    }

    const weaknesses = [];
    if (pokemon.weaknesses?.["4x"]?.length) weaknesses.push(`4x:${pokemon.weaknesses["4x"].join(",")}`);
    if (pokemon.weaknesses?.["2x"]?.length) weaknesses.push(`2x:${pokemon.weaknesses["2x"].join(",")}`);
    const weakStr = weaknesses.length ? ` | Weak: ${weaknesses.join(" ")}` : "";
    const immuneStr = pokemon.weaknesses?.["0x"]?.length
      ? ` | Immune: ${pokemon.weaknesses["0x"].join(",")}(0x)`
      : "";

    console.log(
      `#${padId} ${pokemon.zh_tw || pokemon.en} (${pokemon.en}) | ${pokemon.types.join("/")} | BST:${pokemon.stats.bst} (HP:${pokemon.stats.hp} Atk:${pokemon.stats.atk} Def:${pokemon.stats.def} SpA:${pokemon.stats.spa} SpD:${pokemon.stats.spd} Spe:${pokemon.stats.spe})${weakStr}${immuneStr}${outStr}`
    );
    return;
  }

  // 4. Structured JSON mode (default)
  const output = {
    ...pokemon,
    types_zh: pokemon.types.map((t) => TYPE_NAMES_ZH[t] || t),
    stab_coverage_zh: (pokemon.stab_coverage || []).map((t) => TYPE_NAMES_ZH[t] || t),
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
