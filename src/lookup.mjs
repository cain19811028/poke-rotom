import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateWeaknesses, calculateStabCoverage } from "./type-chart.mjs";

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
 * Enrich Pokémon object with weaknesses and STAB offensive advantages.
 */
function enrichPokemon(p) {
  return {
    ...p,
    weaknesses: calculateWeaknesses(p.types || []),
    stab_coverage: calculateStabCoverage(p.types || []),
  };
}

/**
 * Get Sprite URL based on set and shiny flag.
 * @param {number} id
 * @param {string} spriteSet - "official", "showdown", "gen3", "default"
 * @param {boolean} shiny
 */
/**
 * Get Sprite URL based on set and shiny flag.
 * @param {number} id
 * @param {string} spriteSet - "official", "showdown", "gen3", "default"
 * @param {boolean} shiny
 */
export function getSpriteUrl(id, spriteSet = "official", shiny = false) {
  const isShiny = Boolean(shiny);
  const set = (typeof spriteSet === "string" ? spriteSet : "official").toLowerCase();

  switch (set) {
    case "official":
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? "shiny/" : ""}${id}.png`;
    case "showdown":
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? "shiny/" : ""}${id}.gif`;
    case "gen3":
      // Emerald sprites only exist for Gen 1~3 (#1 to #386)
      if (id <= 386) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${isShiny ? "shiny/" : ""}${id}.png`;
      }
      // Automatic fallback to official artwork for Gen 4+ Pokémon
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? "shiny/" : ""}${id}.png`;
    case "default":
    default:
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? "shiny/" : ""}${id}.png`;
  }
}

const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".gif", ".jpg", ".jpeg", ".webp", ".svg"]);
const ALLOWED_ORIGIN_PREFIX = "https://raw.githubusercontent.com/PokeAPI/";

function isInside(dir, target) {
  const rel = path.relative(dir, target);
  return !path.isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${path.sep}`);
}

function lstatOrNull(p) {
  try {
    return fs.lstatSync(p);
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "ENOTDIR") return null;
    throw err;
  }
}

/**
 * Resolve where a sprite may be written. Rejects any path that would land outside `root`
 * once symlinks are followed, and any existing file unless `overwrite` is set.
 */
function resolveOutputPath(outPath, root, overwrite) {
  const rootDir = path.resolve(root);
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Output directory does not exist: ${rootDir}`);
  }
  const realRoot = fs.realpathSync(rootDir);
  // MCP clients may launch the server with "/" as its working directory; a boundary there allows everything.
  if (path.parse(realRoot).root === realRoot) {
    throw new Error(
      "Security error: Refusing to use the filesystem root as the output directory. " +
        "Run from a project directory or set POKE_ROTOM_OUTPUT_DIR."
    );
  }

  const fullPath = path.resolve(rootDir, outPath);
  if (!isInside(rootDir, fullPath)) {
    throw new Error(`Security error: Output path must be within the output directory (${rootDir})`);
  }

  // path.resolve does not follow symlinks, so check where the deepest existing ancestor really
  // lives before any directory gets created through it.
  let ancestor = path.dirname(fullPath);
  while (!lstatOrNull(ancestor)) ancestor = path.dirname(ancestor);
  if (!isInside(realRoot, fs.realpathSync(ancestor))) {
    throw new Error(`Security error: Output path leaves the output directory through a symlink (${rootDir})`);
  }

  const target = lstatOrNull(fullPath);
  if (target?.isSymbolicLink()) {
    throw new Error(`Security error: Refusing to write through a symlink: ${fullPath}`);
  }
  if (target?.isDirectory()) {
    throw new Error(`Target path is an existing directory: ${fullPath}`);
  }
  if (target && !overwrite) {
    throw new Error(`File already exists: ${fullPath}. Use --force (CLI) or overwrite: true (MCP) to replace it.`);
  }
  return fullPath;
}

/**
 * Download sprite to target file path.
 * Enforces image extension restriction, URL origin validation, an output directory boundary
 * that symlinks cannot escape, no silent overwrites, and automatic fallback to official
 * artwork when target style returns 404.
 * @param {string} url
 * @param {string} outPath - relative paths resolve against `options.root`
 * @param {object} [options]
 * @param {string} [options.root=process.cwd()] - directory the file must stay inside
 * @param {boolean} [options.overwrite=false] - replace an existing file
 * @returns {Promise<string>} absolute path of written file
 */
export async function downloadSprite(url, outPath, options = {}) {
  if (typeof url !== "string" || !url.startsWith(ALLOWED_ORIGIN_PREFIX)) {
    throw new Error(`Untrusted sprite URL source: ${url}`);
  }

  if (typeof outPath !== "string" || !outPath.trim()) {
    throw new Error("Invalid output file path specified");
  }

  const ext = path.extname(outPath).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    throw new Error(
      `Disallowed file extension "${ext}". Only image formats are permitted: ${[...ALLOWED_IMAGE_EXTENSIONS].join(", ")}`
    );
  }

  const overwrite = options.overwrite === true;
  const fullPath = resolveOutputPath(outPath, options.root ?? process.cwd(), overwrite);

  let res = await fetch(url, {
    headers: { "User-Agent": "poke-rotom" },
    signal: AbortSignal.timeout(30000),
  });

  // If a showdown GIF or custom sprite returns 404, fallback to official HD artwork
  if (!res.ok && res.status === 404 && !url.includes("official-artwork")) {
    const numMatch = url.match(/\/(\d+)\.(gif|png)$/);
    if (numMatch) {
      const pokeId = numMatch[1];
      const isShinyUrl = url.includes("/shiny/");
      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShinyUrl ? "shiny/" : ""}${pokeId}.png`;
      console.warn(`⚠️ Sprite not available at requested style (${url}), falling back to official artwork...`);
      res = await fetch(fallbackUrl, {
        headers: { "User-Agent": "poke-rotom" },
        signal: AbortSignal.timeout(30000),
      });
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to download sprite: HTTP ${res.status} from ${url}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`Unexpected content-type received from source: ${contentType}`);
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await res.arrayBuffer());
  // "wx" keeps the no-overwrite promise even if the file appeared while downloading.
  fs.writeFileSync(fullPath, buffer, { flag: overwrite ? "w" : "wx" });
  return fullPath;
}
