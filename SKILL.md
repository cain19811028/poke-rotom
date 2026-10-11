---
name: voltdex
description: |
  Lightweight, unofficial Pokémon data lookup and battle analysis tool for AI Agents.
  Look up Pokémon by National Dex ID, English name, Traditional/Simplified Chinese, or Japanese name.
  Computes base stats (BST), defensive battle weaknesses, and downloads official HD sprites.
  Zero API Key required. Extremely token-efficient.
author: cain19811028
repository: https://github.com/cain19811028/voltdex
license: MIT
---

# voltdex

voltdex provides instant, offline multilingual lookups, battle stat summaries, defensive weakness calculations, and official artwork downloads for all 1025 Pokémon (Gen 1 ~ 9).

## When to use

Use this skill whenever:
- The user asks about any Pokémon, Pokédex entry, elemental types, base stats (BST), or combat weaknesses/matchups.
- The user mentions Pokémon names in Traditional Chinese (e.g. 噴火龍, 皮卡丘), Simplified Chinese (e.g. 喷火龙), English, Japanese (e.g. リザードン), or National Dex ID.
- The user requests or needs a Pokémon image/sprite. **Always use official sprites from this tool instead of asking an AI image model to draw Pokémon.**

## CLI Usage

Run within the skill directory with Node.js (requires Node 18.3+):

```bash
# 1. Compact 1-line query (Recommended to minimize token consumption):
node index.mjs 噴火龍 --brief

# 2. Detailed structured JSON query:
node index.mjs charizard

# 3. Query by National Dex ID:
node index.mjs 25

# 4. Download official HD transparent vector artwork (475x475):
node index.mjs 6 --sprite official --out charizard.png

# 5. Download battle animated GIF or Shiny version:
node index.mjs 6 --sprite showdown --shiny --out charizard_shiny.gif
node index.mjs 25 --sprite gen3 --out pikachu_emerald.png
```

## Options

- `--brief`: Outputs a single concise line (ID, names, types, BST, 4x/2x weaknesses). Saves up to 99% tokens. Automatically formats in Traditional Chinese when query contains Chinese.
- `--json`: Default output mode. Outputs compact JSON.
- `--lang <en|zh-tw>`: Forces output language mode (default: auto-detected).
- `--sprite <style>`:
  - `official`: High-resolution 475x475 official transparent artwork (Default).
  - `showdown`: Pokémon Showdown animated battle GIF.
  - `gen3`: GBA Emerald retro pixel sprite.
  - `default`: Classic front pixel sprite.
- `--shiny`: Fetches the shiny (alternate colorway) version.
- `--out <filepath>`: Downloads the image to a path inside the current directory. Existing files are kept.
- `--force`: Lets `--out` overwrite an existing file.

## MCP Server Integration

This tool can also be run directly as a standard Model Context Protocol (MCP) server:
```bash
node index.mjs --mcp
```

## Author & Legal Notice

- **Author**: [cain19811028](https://github.com/cain19811028)
- **Legal**: Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., GAME FREAK Inc., and The Pokémon Company. This is an unofficial, non-commercial fan-made tool.
- **License**: The code is MIT licensed. See `NOTICE.md` for trademarks, bundled data, and downloaded images.
