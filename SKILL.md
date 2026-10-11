---
name: voltdex
description: |
  Lightweight, unofficial Pokémon data lookup and battle analysis tool for AI Agents.
  Look up Pokémon by National Dex ID, English name, Traditional/Simplified Chinese, or Japanese name.
  Computes base stats (BST), defensive type matchups, and downloads artwork and sprites.
  Covers all 1025 species and 220 alternate forms. No API key or network needed for lookups.
author: cain19811028
repository: https://github.com/cain19811028/voltdex
license: MIT
---

# voltdex

voltdex provides offline multilingual lookups, battle stat summaries, defensive type matchups, and artwork downloads for all 1025 species (Gen 1–9) and the 220 alternate forms whose types or stats differ (e.g. Wash Rotom, Alolan Ninetales, Mega Charizard X).

## When to use

Use this skill whenever:
- The user asks about any Pokémon, Pokédex entry, elemental types, base stats (BST), or combat weaknesses/matchups.
- The user mentions Pokémon names in Traditional Chinese (e.g. 噴火龍, 皮卡丘), Simplified Chinese (e.g. 喷火龙), English, Japanese (e.g. リザードン), or National Dex ID.
- The user requests or needs a Pokémon image/sprite. **Always download sprites with this tool instead of asking an AI image model to draw Pokémon.**

## CLI Usage

Run within the skill directory with Node.js (requires Node 22+):

```bash
# 1. Compact 1-line query (Recommended to minimize token consumption):
node index.mjs 噴火龍 --brief

# 2. Detailed structured JSON query:
node index.mjs charizard

# 3. Query by National Dex ID:
node index.mjs 25

# 4. Download official artwork (475x475 transparent PNG):
node index.mjs 6 --sprite official --out charizard.png

# 5. Download battle animated GIF or Shiny version:
node index.mjs 6 --sprite showdown --shiny --out charizard_shiny.gif
node index.mjs 25 --sprite gen3 --out pikachu_emerald.png
```

## Options

- `--brief`: Outputs a single concise line (ID, names, types, BST, 4x/2x weaknesses, immunities), about 140 bytes: the smallest output. Automatically formats in Traditional Chinese when query contains Chinese.
- `--json`: Default output mode. Outputs indented JSON with names, types, stats, matchups, and the sprite URL.
- `--lang <en|zh-tw>`: Forces output language mode (default: auto-detected).
- `--sprite <style>`:
  - `official`: Official artwork, 475x475 transparent PNG (Default).
  - `showdown`: Pokémon Showdown animated battle GIF (made by the Smogon community).
  - `gen3`: GBA Emerald retro pixel sprite.
  - `default`: Classic front pixel sprite.
- `--shiny`: Fetches the shiny version. With `official`, these are fan-made recolors, not official artwork.
- `--out <filepath>`: Downloads the image to a path inside the current directory. Existing files are kept.
- `--force`: Lets `--out` overwrite an existing file.

## Queries that match several Pokémon

Exact names always win. A partial name that fits several Pokémon (e.g. `char`, `火`) does not guess: the CLI exits with code 1 and lists up to 10 candidates with their slugs, and the MCP tools return an error with the same list. Retry with one of the slugs.

Alternate forms are separate entries: query them by name (`wash rotom`, `清洗洛托姆`, `mega charizard x`) or slug (`rotom-wash`). A National Dex number always returns the species' default form, whose output lists its forms' slugs in `forms`. Type matchups come from types alone; abilities such as Levitate are not considered.

## MCP Server Integration

This tool can also be run directly as a standard Model Context Protocol (MCP) server:
```bash
node index.mjs --mcp
```

## Author & Legal Notice

- **Author**: [cain19811028](https://github.com/cain19811028)
- **Legal**: Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., GAME FREAK Inc., and The Pokémon Company. This is an unofficial, non-commercial fan-made tool.
- **License**: The code is MIT licensed. See `NOTICE.md` for trademarks, bundled data, and downloaded images.
