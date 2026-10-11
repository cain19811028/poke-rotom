<p align="center">
  <img src="assets/hero.svg" width="100%" alt="voltdex - an unofficial Pokémon data field guide for AI agents">
</p>

<p align="center">
  <a href="https://github.com/cain19811028/voltdex"><img src="https://img.shields.io/badge/Pok%C3%A9mon-Gen%201~9%20(1025%20Pok%C3%A9mon)-FF5A1F?style=flat-square" alt="Pokémon Gen 1-9"></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/MCP-Ready%20(Stdio)-00F0FF?style=flat-square&logo=anthropic&logoColor=black" alt="MCP Server"></a>
  <a href="https://claude.ai/"><img src="https://img.shields.io/badge/Claude%20Code-Skill%20Supported-D97757?style=flat-square&logo=claude&logoColor=white" alt="Claude Code Skill"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2022-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#-voltdex---benchmark-token-diet"><img src="https://img.shields.io/badge/Token%20Saved-99.6%25-10B981?style=flat-square&logo=speedtest&logoColor=white" alt="Token Saved 99.6%"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
</p>

<p align="center">
  <b>English</b> | <a href="README.zh-TW.md">繁體中文</a>
</p>

---

### `$ voltdex --whoami`

> ⚡ **"A charged-up field guide for your AI agent."**

**`voltdex`** is an unofficial, **lightweight Dual-Mode Pokémon data tool (MCP Server + Agent Skill)** built specifically for AI Coding Agents (**Claude Code, Cursor, Gemini CLI, etc.**).  
Its mascot, Spark, is a little bolt of energy that lives in a field guide and powers every lookup.

It eliminates the common pain points when agents query the official PokéAPI REST endpoints: **zero 404 translation failures, seamless multilingual search, instant battle weakness calculation, and eliminating the disastrous 200KB (~40,000 tokens) raw JSON payload down to concise, structured data**.

---

### `$ voltdex --features`

- 🌐 **Offline Multilingual Instant Lookup (EN / Traditional ZH / Simplified ZH / JA / ID)**
  - Embedded offline index covering all 1025 Pokémon across Gen 1~9.
  - Queries like `charizard`, `噴火龍`, `喷火龙`, `リザードン`, or `6` resolve in **< 5ms with 0 network requests**.
- ⚡ **99.6% Token Savings (Say Goodbye to 200KB Raw Payloads)**
  - A direct call to the official PokéAPI `GET /pokemon/{id}` returns ~200KB of raw JSON (all historical move pools, game indices, etc.).
  - `voltdex` distills essential battle and species data locally into ~150 bytes, saving **~40,000 tokens per query**.
- 🛡️ **Battle Analysis Engine & Weakness Multipliers**
  - Instant Base Stats (HP / Atk / Def / SpA / SpD / Spe) and Base Stat Total (BST).
  - Defensive type matchups computed automatically (4x critical weakness, 2x weakness, 0.5x resistance, 0x immunity).
- 🎨 **Multi-Tier Visual Sprites (No AI Diffusion Hallucinations)**
  - Direct downloads for **475x475 Official HD Vector Artwork**, **Showdown battle animated GIFs**, **Gen 3 Emerald retro pixel sprites**, and **Shiny variations**.
- 🔌 **Dual-Mode Integration (MCP Server + Agent Skill)**
  - Use it natively as an **MCP Server (stdio)** or plug it in as an **Agent Skill (`SKILL.md`)**.

---

### `$ voltdex --benchmark (Token Diet)`

When an AI Agent requests full Pokémon combat and species info:

| Metric | Official PokéAPI REST API (`pokeapi.co`) | `voltdex` Optimized | Improvement |
| :--- | :--- | :--- | :--- |
| **Payload Size** | `~200,000 Bytes` (200 KB) | **`~350 Bytes`** | 🪶 **99.8% Smaller** |
| **Token Consumption** | **~40,000 Tokens** / request | **~120 Tokens** / request | 💰 **99.6% Cost & Context Saved** |
| **Language Support** | ❌ English only (404 on others) | ✔️ **EN / ZH-TW / ZH-CN / JA / ID** | 🌏 Zero translation friction |
| **Query Latency** | 1,200 ~ 2,500 ms (Network IO) | **< 10 ms (Local Offline Index)** | 🚀 **150x Faster** |
| **Battle Weaknesses** | ❌ Not calculated (Requires multiple calls) | ✔️ **Auto-calculated 4x / 2x / 0.5x / 0x** | ⚔️ Instant ready-to-use |

---

### `$ voltdex query charizard --demo`

#### 1. Structured JSON Mode (`--json`, Default)
```json
{
  "id": 6,
  "name": "charizard",
  "name_zh_tw": "噴火龍",
  "name_zh_cn": "喷火龙",
  "name_ja": "リザードン",
  "types": ["fire", "flying"],
  "stats": { "hp": 78, "atk": 84, "def": 78, "spa": 109, "spd": 85, "spe": 100, "bst": 534 },
  "weaknesses": { "4x": ["rock"], "2x": ["water", "electric"], "0.5x": ["fire", "fighting", "steel", "fairy"], "0.25x": ["grass", "bug"], "0x": ["ground"] },
  "stab_coverage": ["grass", "ice", "bug", "steel", "fighting"],
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
}
```

#### 2. Ultra-Compact Mode (`--brief`, Maximum Token Efficiency)
```bash
$ node index.mjs charizard --brief
#006 Charizard | fire/flying | BST:534 (HP:78 Atk:84 Def:78 SpA:109 SpD:85 Spe:100) | Weak: 4x:rock 2x:water,electric | Immune: ground(0x)
```

---

### `$ voltdex --install`

`voltdex` supports seamless plug-and-play as an Agent Skill or a standard MCP Server:

#### Option A: As an Agent Skill (Claude Code / Cursor / Project Skills)
Clone the repository:
```bash
git clone https://github.com/cain19811028/voltdex.git
```
Then copy (or symlink) into your desired skills folder:
```bash
# 1. Install globally for Claude Code:
cp -r voltdex ~/.claude/skills/voltdex

# 2. Install globally for Cursor:
cp -r voltdex ~/.cursor/skills/voltdex

# 3. Or place inside your project / agent workspace skills directory:
cp -r voltdex ./skills/voltdex
```
AI Agents will automatically discover and utilize the tool via [`SKILL.md`](SKILL.md).

#### Option B: As an MCP Server (Model Context Protocol)
Add `voltdex` to your Claude Desktop, Claude Code, or project `.mcp.json` (e.g. `~/.claude.json`):

```json
{
  "mcpServers": {
    "voltdex": {
      "command": "node",
      "args": ["/path/to/voltdex/index.mjs", "--mcp"],
      "env": { "VOLTDEX_OUTPUT_DIR": "/path/to/your/sprites" }
    }
  }
}
```
> 💡 *Windows users: specify your path, e.g. `"C:/tools/voltdex/index.mjs"`.*

> 🔒 *`download_sprite` only writes inside `VOLTDEX_OUTPUT_DIR` (or the server's working directory when unset), never follows a symlink out of it, and keeps existing files unless called with `overwrite: true`. It refuses to write when that directory is the filesystem root, which some MCP clients use as the working directory.*

---

### `$ voltdex --sprites (Visual Assets Matrix)`

| Option | Description | Best For |
| :--- | :--- | :--- |
| `--sprite official` | **Official Transparent HD Vector Artwork (475x475)** *(Default)* | Modern UI cards, presentations |
| `--sprite showdown` | **Pokémon Showdown Battle Animated GIF** | Dynamic battle animations |
| `--sprite gen3` | **GBA Gen 3 Emerald Retro Pixel Sprite** | Retro pixel art applications |
| `--sprite default` | **Standard 96x96 Front Pixel Sprite** | Lightweight icon indicators |
| `--shiny` | **Flag: Download Shiny / Alternate Colorway** | Black Charizard, Gold Magikarp |
| `--force` | **Flag: Overwrite the `--out` file if it already exists** | Re-downloading a sprite |

```bash
# Download official HD artwork for Shiny Charizard
node index.mjs charizard --sprite official --shiny --out charizard_shiny.png
```

---

### `$ voltdex --license & disclaimer`

- **License**: The source code and original artwork are licensed under the [MIT License](LICENSE) © 2026 [cain19811028](https://github.com/cain19811028). It does not cover the third-party data and images described below.
- **Name & Mascot**: The voltdex name and the Spark mascot identify this project. The MIT License does not cover their use as a brand; forks are welcome under their own name.
- **Trademarks**: Pokémon and Pokémon character names are trademarks of **Nintendo, Creatures Inc., GAME FREAK Inc., and The Pokémon Company**.
- **Unofficial**: voltdex is an independent, non-commercial fan project. It is **not** affiliated with, sponsored by, or endorsed by any of them.
- **Data & Images**: `data/pokedex.json` holds factual reference data derived from [PokéAPI](https://pokeapi.co/) (BSD 3-Clause). This repository contains **no Pokémon artwork**; sprites are downloaded on request from [PokeAPI/sprites](https://github.com/PokeAPI/sprites), are not licensed to you by this project, and remain the property of their owners. You are responsible for how you use them.
- **Details**: See [NOTICE.md](NOTICE.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- **Rights Holders**: If you have a concern about any material referenced here, please [open an issue](https://github.com/cain19811028/voltdex/issues); it will be handled promptly, including removal where appropriate.
