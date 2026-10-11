#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 cain19811028
// Generates assets/hero.svg, the animated README banner: `npm run build:hero`.
// Entry data comes from the real lookup, so the card never drifts from the index.
//
// GitHub shows README images through <img>: no scripts, no external fonts or
// images. Motion is plain CSS on one shared clock, so every effect stays in
// sync, and it all stops under prefers-reduced-motion. Colours follow the
// viewer's light/dark preference.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findPokemon, loadPokedex } from "../src/lookup.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = path.join(ROOT, "assets/hero.svg");
const pokedex = loadPokedex();
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

const W = 920, H = 340;
const FONT = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

const LIGHT = {
  bg: "#fbfaf7", border: "#e3e1d9", fg: "#15171c", text: "#393c44", muted: "#80838c",
  accent: "#c26a0c", spark: "#0b93a8", hot: "#cf3f3f", track: "#ebe9e2", bar: "#e3901f",
  page: "#ffffff", line: "#dcd9cf", cover: "#3b4150", body: "#f2a23a", glow: "#ffe2a3",
  ink: "#15171c", chip: "#f3f1ea",
};
const DARK = {
  bg: "#16181d", border: "#2b2f37", fg: "#f2f3f5", text: "#d4d7dd", muted: "#8a8f99",
  accent: "#f2a33a", spark: "#52d6ea", hot: "#ff7b72", track: "#252930", bar: "#f2a33a",
  page: "#232831", line: "#3a404b", cover: "#4a5263", body: "#f2a23a", glow: "#ffe2a3",
  ink: "#0b0d10", chip: "#1e2127",
};
// Mid-tone swatches that read on both themes; only ever drawn as small squares.
const TYPE_COLORS = {
  normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#f7d02c", grass: "#7ac74c",
  ice: "#96d9d6", fighting: "#c22e28", poison: "#a33ea1", ground: "#e2bf65", flying: "#a98ff3",
  psychic: "#f95587", bug: "#a6b91a", rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc",
  dark: "#705746", steel: "#b7b7ce", fairy: "#d685ad",
};

// Each query shows off a different lookup key: English, 繁中, 日本語, national number.
const QUERIES = [
  { prompt: "rotom charizard", query: "charizard" },
  { prompt: "rotom 皮卡丘 --brief", query: "皮卡丘" },
  { prompt: "rotom ミュウツー --json", query: "ミュウツー" },
  { prompt: "rotom 445 --sprite gen3", query: "445" },
];

const PROMPT_SIZE = 13;
const ADVANCE = PROMPT_SIZE * 0.6;
const TYPE_S = 0.06, HOLD_S = 3.4, ERASE_S = 0.025, GAP_S = 0.4;
const ZAP_S = 0.35, FLIP_S = 0.5, PULSE_S = 0.45, GROW_S = 0.7, SCAN_S = 0.8;
// The entry lands on the card when the pulse from the book reaches it.
const REVEAL_S = 0.05 + PULSE_S;

// --- text helpers ----------------------------------------------------------------------
const num = (v) => String(Math.round(v * 100) / 100);
const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function isWide(cp) {
  return (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) || (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) || (cp >= 0x20000 && cp <= 0x3fffd);
}

/** Terminal columns: East Asian wide characters take two. */
const cols = (text) => [...text].reduce((n, ch) => n + (isWide(ch.codePointAt(0)) ? 2 : 1), 0);

/** Text with every glyph on a fixed grid, so overlays line up in any font. */
function mono(text, x, y, size, cls = "", style = "") {
  const advance = size * 0.6;
  const xs = [];
  let col = 0;
  for (const ch of text) {
    xs.push(num(x + col * advance));
    col += cols(ch);
  }
  const clsAttr = cls ? ` class="${cls}"` : "";
  const styleAttr = style ? ` style="${style}"` : "";
  return `<text${clsAttr} x="${xs.join(" ")}" y="${num(y)}" font-size="${num(size)}"${styleAttr}>${escape(text)}</text>`;
}

const monoRight = (text, right, y, size, cls) => mono(text, right - cols(text) * size * 0.6, y, size, cls);
const monoCentre = (text, cx, y, size, cls) => mono(text, cx - (cols(text) * size * 0.6) / 2, y, size, cls);

function rect(x, y, w, h, style, extra = "") {
  return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" style="${style}"${extra}/>`;
}

// --- timeline --------------------------------------------------------------------------
function schedule(lengths) {
  let t = 0;
  const slots = lengths.map((n) => {
    const start = t;
    const typed = start + n * TYPE_S;
    const erase = typed + HOLD_S;
    const end = erase + n * ERASE_S + GAP_S;
    t = end;
    return { start, typed, erase, end, reveal: typed + REVEAL_S };
  });
  return { total: t, slots };
}

const entries = QUERIES.map(({ prompt, query }) => {
  const mon = findPokemon(query);
  if (!mon) throw new Error(`hero query "${query}" matches no entry in data/pokedex.json`);
  return { prompt, mon };
});
const { total, slots } = schedule(entries.map((e) => cols(e.prompt)));
const pct = (s) => num((100 * s) / total) + "%";
const loop = (name, timing = "") => `animation:${name} ${num(total)}s ${timing} infinite`;

/** One keyframe list with a burst per query: `burst(slot)` returns its keyframes. */
function bursts(name, rest, burst) {
  const frames = [`0%{${rest};animation-timing-function:step-end}`];
  for (const slot of slots) frames.push(...burst(slot));
  frames.push(`100%{${rest}}`);
  return `@keyframes ${name}{${frames.join("")}}`;
}

// --- the spark: an original pixel mascot, deliberately no character likeness -----------
const SPARK_U = 5;
const DIAMOND = [1, 3, 5, 7, 9, 11, 13, 11, 9, 7, 5, 3, 1].map((w, r) => [6 - (w - 1) / 2, r, w, 1]);
const HIGHLIGHT = [[5, 2, 1, 1], [4, 3, 1, 2]];
const EYES = [[4, 6, 1, 2], [8, 6, 1, 2]];

const pixels = (boxes, style) => boxes.map(([x, y, w, h]) => rect(x, y, w, h, style)).join("");

function sparkle(x, y, delay) {
  return `<g class="tw" style="animation-delay:${delay}s">` +
    rect(x - 1, y - 4, 2, 8, "fill:var(--spark)") + rect(x - 4, y - 1, 8, 2, "fill:var(--spark)") + "</g>";
}

function spark(cx, top) {
  const ox = cx - (13 * SPARK_U) / 2;
  return [
    sparkle(cx - 48, top + 12, 0), sparkle(cx + 46, top + 6, 0.8),
    sparkle(cx - 42, top + 54, 1.6), sparkle(cx + 44, top + 50, 0.4),
    `<g transform="translate(${num(ox)} ${num(top)}) scale(${SPARK_U})" shape-rendering="crispEdges">` +
      '<g class="sp-bob">' +
      pixels(DIAMOND, "fill:var(--body)") +
      `<g class="zap">${pixels(DIAMOND, "fill:var(--glow)")}</g>` +
      pixels(HIGHLIGHT, "fill:var(--glow)") +
      `<g class="sp-eyes">${pixels(EYES, "fill:var(--ink)")}</g>` +
      "</g></g>",
  ].join("");
}

// --- the field guide -------------------------------------------------------------------
function book(cx, top) {
  const pageW = 78, pageH = 70;
  const left = cx - 2 - pageW, right = cx + 2;
  const lines = (x, widths, y0) => widths.map((w, k) => rect(x, y0 + k * 8, w, 2, "fill:var(--line)")).join("");
  const rightPage =
    rect(right + 8, top + 10, 16, 16, "fill:var(--line)") +
    rect(right + 30, top + 12, 40, 2, "fill:var(--line)") +
    rect(right + 30, top + 20, 28, 2, "fill:var(--line)") +
    [44, 56, 36, 50].map((w, k) => rect(right + 8, top + 36 + k * 8, w, 3, "fill:var(--bar);opacity:.7")).join("");
  const tabs = ["spark", "bar", "hot", "muted"]
    .map((c, k) => rect(cx + 86, top + 10 + k * 14, 6, 10, `fill:var(--${c})`))
    .join("");
  return [
    `<g shape-rendering="crispEdges">`,
    tabs,
    rect(cx - 86, top + 4, 172, pageH + 6, "fill:var(--cover)"),
    rect(left, top, pageW, pageH, "fill:var(--page)"),
    rect(right, top, pageW, pageH, "fill:var(--page)"),
    rect(cx - 2, top + 2, 4, pageH, "fill:var(--cover)"),
    lines(left + 8, [60, 52, 62, 40, 58, 48, 30], top + 10),
    rightPage,
    `<g class="flip">${rect(right, top, pageW, pageH, "fill:var(--page);stroke:var(--line)")}` +
      `${lines(right + 8, [58, 44, 60, 36, 52], top + 12)}</g>`,
    "</g>",
  ].join("");
}

// --- the entry card --------------------------------------------------------------------
const STATS = [["HP", "hp"], ["ATK", "atk"], ["DEF", "def"], ["SPA", "spa"], ["SPD", "spd"], ["SPE", "spe"]];
const CARD_X = 364, CARD_R = 884, BAR_W = 230, BAR_MAX = 200;

function chips(types, right, y) {
  const out = [];
  let x = right;
  for (const type of [...types].reverse()) {
    const label = type.toUpperCase();
    const w = 20 + cols(label) * 6.6 + 9;
    x -= w;
    out.push(
      rect(x, y, w, 19, "fill:var(--chip);stroke:var(--border)", ' rx="4"') +
      rect(x + 8, y + 6, 7, 7, `fill:${TYPE_COLORS[type]}`, ' rx="1.5"') +
      mono(label, x + 20, y + 13.5, 11, "fg"),
    );
    x -= 6;
  }
  return out.join("");
}

function weaknessRows(weaknesses) {
  const rows = [
    ...(weaknesses["4x"] ?? []).map((t) => [t, 4]),
    ...(weaknesses["2x"] ?? []).map((t) => [t, 2]),
  ];
  return rows.length > 4 ? [...rows.slice(0, 3), [`+${rows.length - 3} more`, 0]] : rows;
}

function card(i, { mon }) {
  const x0 = CARD_X, out = [];
  out.push(mono(`No.${String(mon.id).padStart(3, "0")}`, x0, 62, 13, "ac b"));
  out.push(mono(mon.en, x0 + 60, 62, 16, "fg b"));
  out.push(chips(mon.types, CARD_R, 48));
  const names = [mon.zh_tw, ...(mon.zh_cn !== mon.zh_tw ? [mon.zh_cn] : []), mon.ja].join(" · ");
  out.push(mono(names, x0, 84, 12, "mu"));

  STATS.forEach(([label, key], k) => {
    const y = 122 + k * 17, value = mon.stats[key];
    out.push(mono(label, x0, y, 11, "mu"));
    out.push(monoRight(String(value), x0 + 62, y, 12, "fg"));
    out.push(rect(x0 + 74, y - 7, BAR_W, 6, "fill:var(--track)", ' rx="3"'));
    const w = Math.min(value / BAR_MAX, 1) * BAR_W;
    out.push(rect(x0 + 74, y - 7, w, 6, "fill:var(--bar)", ` rx="3" class="gr${i}"`));
  });

  const wx = 712;
  out.push(`<line x1="694" y1="110" x2="694" y2="210" style="stroke:var(--border)"/>`);
  out.push(mono("weak to", wx, 122, 11, "mu"));
  weaknessRows(mon.weaknesses).forEach(([type, mult], k) => {
    const y = 139 + k * 17;
    if (mult === 0) return out.push(mono(type, wx, y, 12, "mu"));
    out.push(rect(wx, y - 8, 7, 7, `fill:${TYPE_COLORS[type]}`, ' rx="1.5"'));
    out.push(mono(type, wx + 14, y, 12, "fg"));
    out.push(monoRight(`×${mult}`, CARD_R, y, 12, mult === 4 ? "hot b" : "ac b"));
  });
  out.push(mono("BST", wx, 207, 11, "mu"));
  out.push(monoRight(String(mon.stats.bst), CARD_R, 207, 12, "fg b"));
  return `<g class="cd${i}">${out.join("")}</g>`;
}

// --- motion ----------------------------------------------------------------------------
function motionCss() {
  const css = [];
  const last = slots.length - 1;

  // Idle life: bobbing, blinking, twinkling, caret.
  css.push(
    ".sp-bob{animation:sp-bob 1.8s ease-in-out infinite}",
    "@keyframes sp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-.8px)}}",
    ".sp-eyes{transform-box:fill-box;transform-origin:center;animation:sp-blink 3.6s infinite}",
    "@keyframes sp-blink{0%,86%,94%,100%{transform:scaleY(1)}90%{transform:scaleY(.1)}}",
    ".tw{opacity:.15;animation:tw 2.4s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}",
    ".blink{animation:blink 1s step-end infinite}@keyframes blink{50%{opacity:0}}",
  );

  // Each query: the spark zaps, the page turns, a pulse runs to the card, the entry lands.
  css.push(
    bursts("zap", "opacity:0", (s) => [
      `${pct(s.typed)}{opacity:1;animation-timing-function:ease-out}`,
      `${pct(s.typed + ZAP_S)}{opacity:0;animation-timing-function:step-end}`,
    ]),
    `.zap,.bolt{opacity:0;${loop("zap")}}`,
    bursts("flip", "opacity:0;transform:scaleX(1)", (s) => [
      `${pct(s.typed)}{opacity:1;transform:scaleX(1);animation-timing-function:ease-in}`,
      `${pct(s.typed + FLIP_S / 2)}{opacity:1;transform:scaleX(0);animation-timing-function:ease-out}`,
      `${pct(s.typed + FLIP_S)}{opacity:0;transform:scaleX(-1);animation-timing-function:step-end}`,
    ]),
    `.flip{opacity:0;transform-box:fill-box;transform-origin:0 50%;${loop("flip")}}`,
    bursts("pulse", "stroke-dashoffset:-100", (s) => [
      `${pct(s.typed + 0.05)}{stroke-dashoffset:16;animation-timing-function:ease-in}`,
      `${pct(s.typed + 0.05 + PULSE_S)}{stroke-dashoffset:-100;animation-timing-function:step-end}`,
    ]),
    `.pulse{stroke-dasharray:16 116;stroke-dashoffset:-100;${loop("pulse")}}`,
    bursts("scan", "opacity:0;transform:translateY(0)", (s) => [
      `${pct(s.reveal)}{opacity:1;transform:translateY(0);animation-timing-function:linear}`,
      `${pct(s.reveal + SCAN_S)}{opacity:0;transform:translateY(112px);animation-timing-function:step-end}`,
    ]),
    `.scan{opacity:0;${loop("scan")}}`,
  );

  // Cards swap when the pulse arrives; the previous entry stays up while the next is typed.
  slots.forEach((s, i) => {
    const next = slots[(i + 1) % slots.length];
    const frames = i === last
      ? `0%{opacity:1}${pct(slots[0].reveal)}{opacity:0}${pct(s.reveal)}{opacity:1}100%{opacity:1}`
      : `0%{opacity:0}${pct(s.reveal)}{opacity:1}${pct(next.reveal)}{opacity:0}100%{opacity:0}`;
    css.push(`@keyframes cd${i}{${frames}}.cd${i}{opacity:${+(i === 0)};${loop(`cd${i}`, "step-end")}}`);
    // The last entry is still on screen when the loop wraps: hold its bars full until it hides.
    const rest = i === last ? `0%,${pct(slots[0].reveal)}{transform:scaleX(1)}` : "0%{transform:scaleX(0)}";
    css.push(
      `@keyframes gr${i}{${rest}` +
      `${pct(s.reveal)}{transform:scaleX(0);animation-timing-function:cubic-bezier(.2,.7,.2,1)}` +
      `${pct(s.reveal + GROW_S)}{transform:scaleX(1)}100%{transform:scaleX(1)}}` +
      `.gr${i}{transform-box:fill-box;transform-origin:0 50%;${loop(`gr${i}`)}}`,
    );
  });
  return css.join("");
}

/** Prompts typed one after another: a caret drags a cover that hides the untyped text. */
function typing(x, y) {
  const css = [], body = [];
  const move = ["0%{transform:translateX(0)}"];
  entries.forEach(({ prompt }, i) => {
    const s = slots[i], n = cols(prompt), width = num(n * ADVANCE);
    const steps = `animation-timing-function:steps(${n},end)`;
    move.push(
      `${pct(s.start)}{transform:translateX(0);${steps}}`,
      `${pct(s.typed)}{transform:translateX(${width}px)}`,
      `${pct(s.erase)}{transform:translateX(${width}px);${steps}}`,
      `${pct(s.erase + n * ERASE_S)}{transform:translateX(0)}`,
    );
    const first = +(i === 0);
    css.push(
      `@keyframes pr${i}{0%{opacity:${first}}${pct(s.start)}{opacity:1}${pct(s.end)}{opacity:0}}` +
      `.pr${i}{opacity:${first};${loop(`pr${i}`, "step-end")}}`,
    );
    body.push(mono(prompt, x, y, PROMPT_SIZE, `fg pr${i}`));
  });
  move.push("100%{transform:translateX(0)}");
  const first = num(cols(entries[0].prompt) * ADVANCE);
  css.push(`@keyframes caret{${move.join("")}}.caret{transform:translateX(${first}px);${loop("caret")}}`);
  const longest = Math.max(...entries.map((e) => cols(e.prompt))) * ADVANCE;
  body.push(
    `<g class="caret">${rect(x, y - 14, longest + 20, 20, "fill:var(--bg)")}` +
    `${rect(x, y - 12, ADVANCE, 16, "fill:var(--spark)", ' class="blink"')}</g>`,
  );
  return { css: css.join(""), body };
}

// --- document --------------------------------------------------------------------------
function themeCss() {
  const block = (c) => "svg{" + Object.entries(c).map(([k, v]) => `--${k}:${v};`).join("") + "}";
  return block(LIGHT) + `@media (prefers-color-scheme:dark){${block(DARK)}}` +
    `text{font-family:${FONT};fill:var(--text);white-space:pre}` +
    ".fg{fill:var(--fg)}.mu{fill:var(--muted)}.ac{fill:var(--accent)}.hot{fill:var(--hot)}.b{font-weight:700}";
}

function hero() {
  const cx = 165;
  const version = pkg.version.split(".").slice(0, 2).join(".");
  const title = ` ◆ poke-rotom v${version} `;
  const { css: typingCss, body: typingBody } = typing(54, 283);
  const body = [
    `<defs><linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" style="stop-color:var(--spark);stop-opacity:0"/>` +
      `<stop offset=".5" style="stop-color:var(--spark);stop-opacity:.22"/>` +
      `<stop offset="1" style="stop-color:var(--spark);stop-opacity:0"/></linearGradient></defs>`,
    rect(0.5, 0.5, W - 1, H - 1, "fill:var(--bg);stroke:var(--border)", ' rx="12"'),
    rect(20, 24, 880, 220, "fill:none;stroke:var(--accent);stroke-width:1.4", ' rx="10"'),
    rect(34, 16, cols(title) * 7.8, 16, "fill:var(--bg)"),
    mono(title, 34, 29, 13, "ac b"),

    // Left: the spark living in its field guide.
    spark(cx, 46),
    `<path class="bolt" d="M${cx} 116 L${cx - 5} 124 L${cx + 4} 128 L${cx - 1} 135" ` +
      'style="fill:none;stroke:var(--spark);stroke-width:2.5;stroke-linejoin:miter"/>',
    book(cx, 138),
    monoCentre(`${pokedex.length} entries · offline index`, cx, 233, 11, "mu"),

    // The wire from the book to the card, and the pulse that runs along it.
    `<path d="M${cx + 94} 181 H292 L304 169 V108 L316 96 H${CARD_X}" ` +
      'style="fill:none;stroke:var(--border);stroke-width:1.5"/>',
    `<path class="pulse" pathLength="100" d="M${cx + 94} 181 H292 L304 169 V108 L316 96 H${CARD_X}" ` +
      'style="fill:none;stroke:var(--spark);stroke-width:2.5;stroke-linecap:round"/>',
    `<circle cx="${cx + 94}" cy="181" r="2.5" style="fill:var(--spark)"/>`,
    `<line x1="${CARD_X}" y1="96" x2="${CARD_R}" y2="96" style="stroke:var(--border)"/>`,

    // Right: the entry card, one per query.
    ...entries.map((e, i) => card(i, e)),
    rect(CARD_X - 6, 98, CARD_R - CARD_X + 12, 26, "fill:url(#scan)", ' class="scan"'),

    // Prompt bar and footer.
    rect(20, 258, 880, 40, "fill:var(--bg);stroke:var(--muted);stroke-opacity:.6", ' rx="8"'),
    mono(">", 36, 283, PROMPT_SIZE, "ac b"),
    ...typingBody,
    mono("MCP server + agent skill", 26, 322, 11, "mu"),
    monoRight("~120 tokens per lookup vs ~40k of raw PokéAPI JSON", 894, 322, 11, "mu"),
  ];
  const head =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
    'role="img" aria-label="poke-rotom: a pixel spark powers a field guide and types Pokédex lookups into a terminal">';
  const css = themeCss() + motionCss() + typingCss +
    "@media (prefers-reduced-motion:reduce){*{animation:none!important}}";
  return [head, `<style>${css}</style>`, ...body, "</svg>"].join("\n") + "\n";
}

const svg = hero();
fs.writeFileSync(OUT_PATH, svg);
console.log(`${path.relative(ROOT, OUT_PATH)}: ${(svg.length / 1024).toFixed(1)} KB, ${num(total)}s loop`);
