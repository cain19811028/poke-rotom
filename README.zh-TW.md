<p align="center">
  <img src="assets/hero.svg" width="100%" alt="voltdex - AI 助手的非官方寶可夢資料圖鑑">
</p>

<p align="center">
  <a href="https://github.com/cain19811028/voltdex"><img src="https://img.shields.io/badge/Pok%C3%A9mon-Gen%201~9%20(1025%20Pok%C3%A9mon)-FF5A1F?style=flat-square" alt="Pokémon Gen 1-9"></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/MCP-Ready%20(Stdio)-00F0FF?style=flat-square&logo=anthropic&logoColor=black" alt="MCP Server"></a>
  <a href="https://claude.ai/"><img src="https://img.shields.io/badge/Claude%20Code-Skill%20Supported-D97757?style=flat-square&logo=claude&logoColor=white" alt="Claude Code Skill"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.3.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#-voltdex---benchmark-token-瘦身大作戰"><img src="https://img.shields.io/badge/Token%20Saved-99.6%25-10B981?style=flat-square&logo=speedtest&logoColor=white" alt="Token Saved 99.6%"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <b>繁體中文</b>
</p>

---

### `$ voltdex --whoami`

> ⚡ **「替你的 AI 助手充飽電的隨身圖鑑。」**

**`voltdex`** 是專為 **AI Coding Agent（Claude Code、Cursor、Gemini CLI 等）** 量身打造的非官方**超輕量寶可夢資料 MCP Server & Skill 雙模工具**。  
吉祥物 Spark 是一團住在圖鑑裡的小電光，每一次查詢都由它供電。

徹底解決直接調用 PokéAPI 官方原生 REST API 時容易引發的 **「404 報錯、官方不支援中文輸入、單隻資料回傳高達 200KB（40,000+ Tokens）巨型 JSON、缺乏對戰弱點計算」** 等痛點，提供極速、精準且超省 Token 的全新圖鑑體驗。

---

### `$ voltdex --features`

- 🌐 **多國語言秒查（繁中 / 簡中 / 英文 / 日文 / 編號）**
  - 內建離線圖鑑索引表，輸入 `噴火龍`、`皮卡丘`、`リザードン`、`charizard` 或 `25` 皆可秒回。
  - 基本資訊查詢 **0 網路請求、0 延遲（5ms 本地秒回）**，杜絕英文拼寫猜測與 404 報錯。
- ⚡ **Token 暴省 99.6%（拒絕 200KB 巨型 JSON）**
  - PokéAPI 官方原生端點單隻回傳高達 200KB（包含所有歷代學習機、形態與各語系多餘資訊）。
  - `voltdex` 在本機預先萃取純粹精華，將 **~40,000 tokens 壓縮至不到 150 tokens**，大幅延長對話上下文壽命。
- 🛡️ **戰鬥數值與弱點相剋計算器**
  - 一鍵獲取六維種族值（HP / 物攻 / 物防 / 特攻 / 特防 / 速度）與總和（BST）。
  - 自動計算防禦面屬性弱點倍率（4x 致命弱點、2x 弱點、0.5x 抗性、0x 無效），對戰分析一目瞭然。
- 🎨 **多世代高清視覺資源下載（避免 AI 繪圖幻覺）**
  - 不再讓 AI 用生圖模型憑空幻想山寨寶可夢！
  - 支援 **475x475 官方高畫質向量立繪（Official Artwork）**、**Showdown 戰鬥待機動態 GIF**、**第三世代翡翠版像素點陣圖**，並支援 **色違（Shiny）** 切換。
- 🔌 **雙模一體（Dual-Mode: MCP Server + Skill）**
  - 既可以作為 **MCP Server** 讓 Claude / Cursor 原生調用工具；也可以作為 **Skill 腳本** 隨插即用。

---

### `$ voltdex --benchmark (Token 瘦身大作戰)`

當 AI Agent 需要查詢一隻寶可夢的完整數值與背景時：

| 評估維度 | PokéAPI 官方原生 REST API (`pokeapi.co`) | `voltdex` 最佳化處理 | 效益改善 |
| :--- | :--- | :--- | :--- |
| **回應大小 (Payload)** | `~200,000 Bytes` (200 KB) | **`~350 Bytes`** | 🪶 **縮小 99.8%** |
| **Token 消耗** | **~40,000 Tokens** / 次 | **~120 Tokens** / 次 | 💰 **節省 99.6% 費用與空間** |
| **中文支援** | ❌ 僅英文小寫，中文直接報錯 | ✔️ **繁體 / 簡體 / 日文 / 英文全支援** | 🌏 零翻譯摩擦 |
| **查詢耗時** | 1,200 ~ 2,500 ms (外網連線) | **< 10 ms (本地離線索引)** | 🚀 **快 150 倍** |
| **對戰弱點** | ❌ 需抓多個端點手動計算 | ✔️ **自動算好 4x / 2x / 0.5x / 0x 弱點** | ⚔️ 即問即答 |

---

### `$ voltdex query 噴火龍 --output demo`

#### 1. 精煉 JSON 模式 (`--json`，預設)
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

#### 2. 超緊湊單行模式 (`--brief`，極致壓榨 Token)
```bash
$ node index.mjs 噴火龍 --brief
#006 噴火龍 (Charizard) | 火/飛行 | BST:534 (HP:78 攻:84 防:78 特攻:109 特防:85 速:100) | 弱點: 岩石(4x), 水(2x), 電(2x) | 免疫: 地面(0x)
```

---

### `$ voltdex --install (安裝與整合指南)`

`voltdex` 支援隨插即用的 Agent Skill 與標準 MCP Server 兩種整合方式：

#### 方案 A：作為 Agent 技能（Claude Code / Cursor / 專案 Skills）
先將專案 Clone 至本機：
```bash
git clone https://github.com/cain19811028/voltdex.git
```
接著複製（或建立 Symlink 捷徑）至你的目標技能目錄：
```bash
# 1. 全域安裝給 Claude Code：
cp -r voltdex ~/.claude/skills/voltdex

# 2. 全域安裝給 Cursor：
cp -r voltdex ~/.cursor/skills/voltdex

# 3. 或整合至你的特定專案 / AI 工作區的 skills 目錄：
cp -r voltdex ./skills/voltdex
```
AI Agent 將根據目錄中的 [`SKILL.md`](SKILL.md) 自主調用工具。

#### 方案 B：作為 MCP Server（Model Context Protocol）
在你的 Claude Desktop / Claude Code 或專案的 MCP 設定檔（例如 `~/.claude.json` 或專案 `.mcp.json`）中加入：

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
> 💡 *Windows 使用者請替換為實際路徑，如 `"C:/tools/voltdex/index.mjs"`。*

> 🔒 *`download_sprite` 只會寫入 `VOLTDEX_OUTPUT_DIR`（未設定時為 server 的工作目錄）之內，不會經由 symlink 寫到外面，也不會覆蓋既有檔案（除非呼叫時帶 `overwrite: true`）。若該目錄是檔案系統根目錄（部分 MCP client 會以此為工作目錄），會直接拒絕寫入。*

---

### `$ voltdex --sprites (立繪與外觀支援)`

| 參數值 | 樣式說明 | 預覽示例 |
| :--- | :--- | :--- |
| `--sprite official` | **官方透明高清立繪 (475x475)** *(預設推薦)* | 高解析宣傳與卡片展示 |
| `--sprite showdown` | **Pokémon Showdown 戰鬥待機動態 GIF** | 網頁對戰動畫效果 |
| `--sprite gen3` | **GBA 第三世代《綠寶石》復古像素點陣圖** | 經典 Retro 懷舊風格 |
| `--sprite default` | **當代標準 96x96 像素正面圖** | 輕量小圖示使用 |
| `--shiny` | **附加旗標：取得異色（色違）版本** | 金色鯉魚王、黑噴火龍 |
| `--force` | **附加旗標：`--out` 檔案已存在時覆蓋** | 重新下載立繪 |

```bash
# 下載黑色異色噴火龍官方高清立繪
node index.mjs 噴火龍 --sprite official --shiny --out charizard_shiny.png
```

---

### `$ voltdex --license & 免責聲明`

- **程式碼授權**：原始碼以 [MIT License](LICENSE) 授權 © 2026 [cain19811028](https://github.com/cain19811028)，授權範圍僅限程式碼。
- **商標聲明**：寶可夢（Pokémon）及寶可夢角色名稱為 **Nintendo、Creatures Inc.、GAME FREAK Inc. 及 The Pokémon Company** 的商標。
- **非官方聲明**：本專案為獨立、非營利的粉絲專案，與上述公司**無任何隸屬、贊助或背書關係**。
- **資料與圖像**：`data/pokedex.json` 為衍生自 [PokéAPI](https://pokeapi.co/)（BSD 3-Clause）的事實性參考資料。本 repo **不含任何寶可夢圖像**；立繪是在使用者要求時才從 [PokeAPI/sprites](https://github.com/PokeAPI/sprites) 下載，並非由本專案授權給你，權利仍屬原權利人，使用方式由你自行負責。
- **完整說明**：請見 [NOTICE.md](NOTICE.md) 與 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- **權利人聯絡**：權利人若對內容有疑慮，請[開 Issue](https://github.com/cain19811028/voltdex/issues) 告知，將盡速處理，必要時直接移除。
