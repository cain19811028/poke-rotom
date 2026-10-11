#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 cain19811028
// Rebuilds data/pokedex.json from PokéAPI's CSV tables: `npm run build:data`.
// The source is pinned to one PokeAPI/pokeapi commit so the output is reproducible and its
// provenance is recorded here. Pass `--from <dir>` to read the CSV files from a local copy.
//
// The file holds one entry per species (its default form), followed by the alternate forms
// whose types or base stats differ, such as Wash Rotom, Alolan Ninetales or Mega Charizard X.
// Forms that only change appearance (Gigantamax, Totem, Pikachu's caps) would duplicate an
// existing entry's battle data and are left out.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const POKEAPI_REF = "c80757193bd0889054e36f4209762360bdaa4b95";
const CSV_BASE = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${POKEAPI_REF}/data/v2/csv`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = path.join(ROOT, "data/pokedex.json");

const SPECIES_COUNT = 1025;
// PokéAPI language ids for the names voltdex serves.
const LANGS = { en: "9", zh_tw: "4", zh_cn: "12", ja: "1" };
const CJK_FIELDS = ["zh_tw", "zh_cn", "ja"];
const STAT_KEYS = { 1: "hp", 2: "atk", 3: "def", 4: "spa", 5: "spd", 6: "spe" };

// Minimal RFC 4180 parser: quoted fields may hold commas, quotes ("") and newlines.
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some(Boolean));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

async function readTable(name, fromDir) {
  if (fromDir) return parseCsv(fs.readFileSync(path.join(fromDir, `${name}.csv`), "utf8"));
  const res = await fetch(`${CSV_BASE}/${name}.csv`, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${name}.csv`);
  return parseCsv(await res.text());
}

function groupBy(rows, key) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
}

function namesByLang(rows, column) {
  const names = {};
  for (const [field, langId] of Object.entries(LANGS)) {
    const name = rows?.find((r) => r.local_language_id === langId)?.[column];
    if (name) names[field] = name;
  }
  return names;
}

// PokéAPI gives a form's full name in English ("Wash Rotom") but often only a form label in
// Chinese and Japanese ("攻擊形態"), so the label is joined to the species name when it does
// not already contain it. Labels missing in a language fall back to the English one rather
// than to a made-up translation.
function formNames(species, pokemonNames, labels, taken) {
  const enLabel = labels.en || pokemonNames.en;
  const names = { en: pokemonNames.en || `${species.en} (${enLabel})` };
  for (const field of CJK_FIELDS) {
    const join = (label) => (label.includes(species[field]) ? label : `${species[field]}（${label}）`);
    const name = join(pokemonNames[field] || labels[field] || enLabel);
    // PokéAPI repeats some labels across forms (all three Paldean Tauros breeds are
    // "パルデアのすがた"), so a later form switches to its full English name to stay findable.
    names[field] = taken[field].has(name) ? join(names.en) : name;
  }
  return names;
}

// A name shared by two entries could never be looked up unambiguously.
function assertUniqueNames(entries) {
  for (const field of Object.keys(LANGS)) {
    const owner = new Map();
    for (const e of entries) {
      if (owner.has(e[field])) {
        throw new Error(`${field} name "${e[field]}" is shared by ${owner.get(e[field])} and ${e.slug}`);
      }
      owner.set(e[field], e.slug);
    }
  }
}

async function main() {
  const { values } = parseArgs({ options: { from: { type: "string" } }, strict: true });
  const t = Object.fromEntries(
    await Promise.all(
      ["pokemon", "pokemon_species_names", "pokemon_types", "types", "pokemon_stats", "pokemon_forms", "pokemon_form_names"].map(
        async (name) => [name, await readTable(name, values.from)]
      )
    )
  );

  const typeName = new Map(t.types.map((r) => [r.id, r.identifier]));
  const typesOf = groupBy(t.pokemon_types, "pokemon_id");
  const statsOf = groupBy(t.pokemon_stats, "pokemon_id");
  const speciesNames = groupBy(t.pokemon_species_names, "pokemon_species_id");
  const formNameRows = groupBy(t.pokemon_form_names, "pokemon_form_id");
  const defaultFormOf = new Map(t.pokemon_forms.filter((f) => f.is_default === "1").map((f) => [f.pokemon_id, f]));

  function battleData(pokemonId) {
    const types = (typesOf.get(pokemonId) ?? [])
      .sort((a, b) => a.slot - b.slot)
      .map((r) => typeName.get(r.type_id));
    const stats = {};
    for (const r of (statsOf.get(pokemonId) ?? []).sort((a, b) => a.stat_id - b.stat_id)) {
      if (STAT_KEYS[r.stat_id]) stats[STAT_KEYS[r.stat_id]] = Number(r.base_stat);
    }
    stats.bst = Object.values(stats).reduce((sum, v) => sum + v, 0);
    return { types, stats };
  }

  const inScope = t.pokemon.filter((p) => Number(p.species_id) <= SPECIES_COUNT);

  const species = new Map();
  for (const p of inScope.filter((p) => p.is_default === "1")) {
    const speciesId = Number(p.species_id);
    const names = namesByLang(speciesNames.get(p.species_id), "name");
    for (const field of Object.keys(LANGS)) {
      if (!names[field]) throw new Error(`#${speciesId} ${p.identifier} has no ${field} name`);
    }
    species.set(p.species_id, { id: speciesId, slug: p.identifier, ...names, ...battleData(p.id) });
  }
  if (species.size !== SPECIES_COUNT) {
    throw new Error(`Expected ${SPECIES_COUNT} species, built ${species.size}`);
  }

  // Among forms with identical battle data keep one, preferring the plainest identifier
  // (zygarde-10 over zygarde-10-power-construct); the species' default form always wins.
  const battleKey = (e) => JSON.stringify([e.types, e.stats]);
  const seen = new Set([...species.values()].map(battleKey));
  const kept = [];
  const candidates = inScope
    .filter((p) => p.is_default !== "1")
    .sort((a, b) => a.identifier.length - b.identifier.length || a.id - b.id);
  for (const p of candidates) {
    const data = battleData(p.id);
    if (seen.has(battleKey(data))) continue;
    seen.add(battleKey(data));
    kept.push({ p, data });
  }
  kept.sort((a, b) => a.p.species_id - b.p.species_id || a.p.id - b.p.id);

  const defaults = [...species.values()].sort((a, b) => a.id - b.id);
  const taken = Object.fromEntries(CJK_FIELDS.map((f) => [f, new Set(defaults.map((e) => e[f]))]));
  const forms = kept.map(({ p, data }) => {
    const base = species.get(p.species_id);
    const formRows = formNameRows.get(defaultFormOf.get(p.id)?.id);
    const names = formNames(base, namesByLang(formRows, "pokemon_name"), namesByLang(formRows, "form_name"), taken);
    for (const field of CJK_FIELDS) taken[field].add(names[field]);
    return { id: base.id, slug: p.identifier, form_of: base.slug, pokeapi_id: Number(p.id), ...names, ...data };
  });

  const entries = [...defaults, ...forms];
  assertUniqueNames(entries);
  fs.writeFileSync(OUT_PATH, JSON.stringify(entries));
  console.log(
    `Wrote ${species.size} species and ${forms.length} forms to ${path.relative(ROOT, OUT_PATH)} ` +
      `(PokeAPI/pokeapi@${POKEAPI_REF.slice(0, 7)})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
