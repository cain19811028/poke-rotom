<p align="center">
  <img src="assets/hero.svg" width="100%" alt="poke-rotom - Rotom Pokédex for AI Agents">
</p>

<p align="center">
  <a href="https://github.com/cain19811028/poke-rotom"><img src="https://img.shields.io/badge/Pok%C3%A9mon-Gen%201~9%20(1025%20Pok%C3%A9mon)-FF5A1F?style=flat-square&logo=pokemon&logoColor=white" alt="Pokémon Gen 1-9"></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/MCP-Ready%20(Stdio)-00F0FF?style=flat-square&logo=anthropic&logoColor=black" alt="MCP Server"></a>
  <a href="https://claude.ai/"><img src="https://img.shields.io/badge/Claude%20Code-Skill%20Supported-D97757?style=flat-square&logo=claude&logoColor=white" alt="Claude Code Skill"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#-rotom---benchmark-token-diet"><img src="https://img.shields.io/badge/Token%20Saved-99.6%25-10B981?style=flat-square&logo=speedtest&logoColor=white" alt="Token Saved 99.6%"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
</p>

<p align="center">
  <b>English</b> | <a href="README.zh-TW.md">繁體中文</a>
</p>

---

### `$ rotom --whoami`

> ⚡ **"Rotom has entered your AI Agent's Pokédex!"**

In the Pokémon universe, Rotom inhabits smartphones and Pokédexes to act as a trainer's ultimate personal AI guide.  
**`poke-rotom`** is a **lightweight Dual-Mode Pokémon tool (MCP Server + Agent Skill)** built specifically for AI Coding Agents (**Claude Code, Cursor, Gemini CLI, etc.**).

It eliminates the common pain points when agents query the official PokéAPI REST endpoints: **zero 404 translation failures, seamless multilingual search, instant battle weakness calculation, and eliminating the disastrous 200KB (~40,000 tokens) raw JSON payload down to concise, structured data**.

---

### `$ rotom --features`

- 🌐 **Offline Multilingual Instant Lookup (EN / Traditional ZH / Simplified ZH / JA / ID)**
  - Embedded offline index covering all 1025 Pokémon across Gen 1~9.
  - Queries like `charizard`, `噴火龍`, `喷火龙`, `リザードン`, or `6` resolve in **< 5ms with 0 network requests**.
- ⚡ **99.6% Token Savings (Say Goodbye to 200KB Raw Payloads)**
  - A direct call to the official PokéAPI `GET /pokemon/{id}` returns ~200KB of raw JSON (all historical move pools, game indices, etc.).
  - `poke-rotom` distills essential battle and species data locally into ~150 bytes, saving **~40,000 tokens per query**.
- 🛡️ **Battle Analysis Engine & Weakness Multipliers**
  - Instant Base Stats (HP / Atk / Def / SpA / SpD / Spe) and Base Stat Total (BST).
  - Defensive type matchups computed automatically (4x critical weakness, 2x weakness, 0.5x resistance, 0x immunity).
- 🎨 **Multi-Tier Visual Sprites (No AI Diffusion Hallucinations)**
  - Direct downloads for **475x475 Official HD Vector Artwork**, **Showdown battle animated GIFs**, **Gen 3 Emerald retro pixel sprites**, and **Shiny variations**.
- 🔌 **Dual-Mode Integration (MCP Server + Agent Skill)**
  - Use it natively as an **MCP Server (stdio)** or plug it in as an **Agent Skill (`SKILL.md`)**.

---

### `$ rotom --benchmark (Token Diet)`

When an AI Agent requests full Pokémon combat and species info:

| Metric | Official PokéAPI REST API (`pokeapi.co`) | `poke-rotom` Optimized | Improvement |
| :--- | :--- | :--- | :--- |
| **Payload Size** | `~200,000 Bytes` (200 KB) | **`~350 Bytes`** | 🪶 **99.8% Smaller** |
| **Token Consumption** | **~40,000 Tokens** / request | **~120 Tokens** / request | 💰 **99.6% Cost & Context Saved** |
| **Language Support** | ❌ English only (404 on others) | ✔️ **EN / ZH-TW / ZH-CN / JA / ID** | 🌏 Zero translation friction |
| **Query Latency** | 1,200 ~ 2,500 ms (Network IO) | **< 10 ms (Local Offline Index)** | 🚀 **150x Faster** |
| **Battle Weaknesses** | ❌ Not calculated (Requires multiple calls) | ✔️ **Auto-calculated 4x / 2x / 0.5x / 0x** | ⚔️ Instant ready-to-use |

---

### `$ rotom query charizard --demo`

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
  "weaknesses": { "4x": ["rock"], "2x": ["water", "electric"], "0.5x": ["fire", "fighting"], "0.25x": ["grass", "bug"], "0x": ["ground"] },
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
}
```

#### 2. Ultra-Compact Mode (`--brief`, Maximum Token Efficiency)
```bash
$ node index.mjs charizard --brief
#006 Charizard (噴火龍) | Fire/Flying | BST:534 (HP:78 Atk:84 Def:78 SpA:109 SpD:85 Spe:100) | Weak: Rock(4x), Water(2x), Electric(2x)
```

---

### `$ rotom --install`

`poke-rotom` supports seamless plug-and-play as an Agent Skill or a standard MCP Server:

#### Option A: As an Agent Skill (Claude Code / Cursor / Project Skills)
Clone the repository:
```bash
git clone https://github.com/cain19811028/poke-rotom.git
```
Then copy (or symlink) into your desired skills folder:
```bash
# 1. Install globally for Claude Code:
cp -r poke-rotom ~/.claude/skills/poke-rotom

# 2. Install globally for Cursor:
cp -r poke-rotom ~/.cursor/skills/poke-rotom

# 3. Or place inside your project / agent workspace skills directory:
cp -r poke-rotom ./skills/poke-rotom
```
AI Agents will automatically discover and utilize the tool via [`SKILL.md`](SKILL.md).

#### Option B: As an MCP Server (Model Context Protocol)
Add `poke-rotom` to your Claude Desktop, Claude Code, or project `.mcp.json` (e.g. `~/.claude.json`):

```json
{
  "mcpServers": {
    "poke-rotom": {
      "command": "node",
      "args": ["/path/to/poke-rotom/index.mjs", "--mcp"]
    }
  }
}
```
> 💡 *Windows users: specify your path, e.g. `"C:/tools/poke-rotom/index.mjs"`.*

---

### `$ rotom --sprites (Visual Assets Matrix)`

| Option | Description | Best For |
| :--- | :--- | :--- |
| `--sprite official` | **Official Transparent HD Vector Artwork (475x475)** *(Default)* | Modern UI cards, presentations |
| `--sprite showdown` | **Pokémon Showdown Battle Animated GIF** | Dynamic battle animations |
| `--sprite gen3` | **GBA Gen 3 Emerald Retro Pixel Sprite** | Retro pixel art applications |
| `--sprite default` | **Standard 96x96 Front Pixel Sprite** | Lightweight icon indicators |
| `--shiny` | **Flag: Download Shiny / Alternate Colorway** | Black Charizard, Gold Magikarp |

```bash
# Download official HD artwork for Shiny Charizard
node index.mjs charizard --sprite official --shiny --out charizard_shiny.png
```

---

### `$ rotom --license & disclaimer`

- **Code License**: Licensed under the [MIT License](LICENSE) © 2026 [cain19811028](https://github.com/cain19811028).
- **Trademark & IP Disclaimer**: Pokémon and Pokémon character names, sprites, and trademarks are the intellectual property of **Nintendo, Creatures Inc., GAME FREAK inc., and The Pokémon Company**.
- **Non-Affiliation**: This is an independent, non-profit fan-made developer tool for educational and AI agent integration purposes. It is **not** endorsed by or affiliated with Nintendo, GAME FREAK, Creatures Inc., or The Pokémon Company.
- **Fair Use & Data Source**: Game data and sprites are provided via the open-source community [PokéAPI](https://pokeapi.co/) for personal, non-commercial reference. Users are solely responsible for compliance with applicable IP laws when using downloaded assets.
- **Takedown Notice**: If you are a rights holder and have concerns, please open a GitHub Issue or contact the repository author for prompt removal or resolution.
