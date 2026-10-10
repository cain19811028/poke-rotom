import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateWeaknesses } from "./type-chart.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../data/pokedex.json");

let pokedex = null;

export function loadPokedex() {
  if (!pokedex) {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    pokedex = JSON.parse(raw);
  }
  return pokedex;
}

/**
 * Find Pokémon by ID, English name, Traditional/Simplified Chinese, or Japanese name.
 * @param {string|number} rawQuery
 * @returns {object|null}
 */
export function findPokemon(rawQuery) {
  if (rawQuery === undefined || rawQuery === null) return null;
  const list = loadPokedex();
  const qStr = String(rawQuery).trim();
  if (!qStr) return null;

  // 1. Numeric ID matching (#025, 25)
  const numMatch = qStr.replace(/^#/, "");
  if (/^\d+$/.test(numMatch)) {
    const id = parseInt(numMatch, 10);
    const found = list.find((p) => p.id === id);
    if (found) return enrichPokemon(found);
  }

  const qLower = qStr.toLowerCase();
  const qNorm = qLower.replace(/[\s_.-]/g, "");

  // 2. Exact match on slug, en, zh_tw, zh_cn, ja
  for (const p of list) {
    if (
      p.slug.toLowerCase() === qLower ||
      p.slug.replace(/[-]/g, "") === qNorm ||
      p.en.toLowerCase() === qLower ||
      p.zh_tw === qStr ||
      p.zh_cn === qStr ||
      p.ja === qStr
    ) {
      return enrichPokemon(p);
    }
  }

  // 3. Fuzzy / Partial match
  for (const p of list) {
    if (
      p.en.toLowerCase().includes(qLower) ||
      p.zh_tw.includes(qStr) ||
      p.zh_cn.includes(qStr) ||
      p.ja.includes(qStr)
    ) {
      return enrichPokemon(p);
    }
  }

  return null;
}

/**
 * Enrich Pokémon object with weaknesses.
 */
function enrichPokemon(p) {
  return {
    ...p,
    weaknesses: calculateWeaknesses(p.types || []),
  };
}

/**
 * Get Sprite URL based on set and shiny flag.
 * @param {number} id
 * @param {string} spriteSet - "official", "showdown", "gen3", "default"
 * @param {boolean} shiny
 */
export function getSpriteUrl(id, spriteSet = "official", shiny = false) {
  const isShiny = Boolean(shiny);
  const set = (spriteSet || "official").toLowerCase();

  switch (set) {
    case "official":
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? "shiny/" : ""}${id}.png`;
    case "showdown":
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? "shiny/" : ""}${id}.gif`;
    case "gen3":
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`;
    case "default":
    default:
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? "shiny/" : ""}${id}.png`;
  }
}

/**
 * Download sprite to target file path.
 * @param {string} url
 * @param {string} outPath
 * @returns {Promise<string>} absolute path of written file
 */
export async function downloadSprite(url, outPath) {
  const res = await fetch(url, {
    headers: { "User-Agent": "poke-rotom" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error(`Failed to download sprite: HTTP ${res.status} from ${url}`);
  }
  const fullPath = path.resolve(outPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);
  return fullPath;
}
