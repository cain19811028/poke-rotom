<p align="center">
  <img src="assets/hero.svg" width="100%" alt="poke-rotom - 洛托姆圖鑑 AI 助手 Banner">
</p>

<p align="center">
  <a href="https://github.com/cain19811028/poke-rotom"><img src="https://img.shields.io/badge/Pok%C3%A9mon-Gen%201~9%20(1025%20Pok%C3%A9mon)-FF5A1F?style=flat-square&logo=pokemon&logoColor=white" alt="Pokémon Gen 1-9"></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/MCP-Ready%20(Stdio)-00F0FF?style=flat-square&logo=anthropic&logoColor=black" alt="MCP Server"></a>
  <a href="https://claude.ai/"><img src="https://img.shields.io/badge/Claude%20Code-Skill%20Supported-D97757?style=flat-square&logo=claude&logoColor=white" alt="Claude Code Skill"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#-rotom---benchmark-token-瘦身大作戰"><img src="https://img.shields.io/badge/Token%20Saved-99.6%25-10B981?style=flat-square&logo=speedtest&logoColor=white" alt="Token Saved 99.6%"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <b>繁體中文</b>
</p>

---

### `$ rotom --whoami`

> ⚡ **「洛托姆（Rotom）已成功附身你的 AI 助手！」**

在寶可夢正傳世界中，洛托姆附身在圖鑑與手機中成為訓練家最可靠的隨身百科。  
**`poke-rotom`** 是專為 **AI Coding Agent（Claude Code、Cursor、Gemini CLI 等）** 量身打造的**超輕量寶可夢 MCP Server & Skill 雙模助手**。

徹底解決直接調用 PokéAPI 官方原生 REST API 時容易引發的 **「404 報錯、官方不支援中文輸入、單隻資料回傳高達 200KB（40,000+ Tokens）巨型 JSON、缺乏對戰弱點計算」** 等痛點，提供極速、精準且超省 Token 的全新圖鑑體驗。

---

### `$ rotom --features`

- 🌐 **多國語言秒查（繁中 / 簡中 / 英文 / 日文 / 編號）**
  - 內建離線圖鑑索引表，輸入 `噴火龍`、`皮卡丘`、`リザードン`、`charizard` 或 `25` 皆可秒回。
  - 基本資訊查詢 **0 網路請求、0 延遲（5ms 本地秒回）**，杜絕英文拼寫猜測與 404 報錯。
- ⚡ **Token 暴省 99.6%（拒絕 200KB 巨型 JSON）**
  - PokéAPI 官方原生端點單隻回傳高達 200KB（包含所有歷代學習機、形態與各語系多餘資訊）。
  - `poke-rotom` 在本機預先萃取純粹精華，將 **~40,000 tokens 壓縮至不到 150 tokens**，大幅延長對話上下文壽命。
- 🛡️ **戰鬥數值與弱點相剋計算器**
  - 一鍵獲取六維種族值（HP / 物攻 / 物防 / 特攻 / 特防 / 速度）與總和（BST）。
  - 自動計算防禦面屬性弱點倍率（4x 致命弱點、2x 弱點、0.5x 抗性、0x 無效），對戰分析一目瞭然。
- 🎨 **多世代高清視覺資源下載（避免 AI 繪圖幻覺）**
  - 不再讓 AI 用生圖模型憑空幻想山寨寶可夢！
  - 支援 **475x475 官方高畫質向量立繪（Official Artwork）**、**Showdown 戰鬥待機動態 GIF**、**第三世代翡翠版像素點陣圖**，並支援 **色違（Shiny）** 切換。
- 🔌 **雙模一體（Dual-Mode: MCP Server + Skill）**
  - 既可以作為 **MCP Server** 讓 Claude / Cursor 原生調用工具；也可以作為 **Skill 腳本** 隨插即用。

---

### `$ rotom --benchmark (Token 瘦身大作戰)`

當 AI Agent 需要查詢一隻寶可夢的完整數值與背景時：

| 評估維度 | PokéAPI 官方原生 REST API (`pokeapi.co`) | `poke-rotom` 最佳化處理 | 效益改善 |
| :--- | :--- | :--- | :--- |
| **回應大小 (Payload)** | `~200,000 Bytes` (200 KB) | **`~350 Bytes`** | 🪶 **縮小 99.8%** |
| **Token 消耗** | **~40,000 Tokens** / 次 | **~120 Tokens** / 次 | 💰 **節省 99.6% 費用與空間** |
| **中文支援** | ❌ 僅英文小寫，中文直接報錯 | ✔️ **繁體 / 簡體 / 日文 / 英文全支援** | 🌏 零翻譯摩擦 |
| **查詢耗時** | 1,200 ~ 2,500 ms (外網連線) | **< 10 ms (本地離線索引)** | 🚀 **快 150 倍** |
| **對戰弱點** | ❌ 需抓多個端點手動計算 | ✔️ **自動算好 4x / 2x / 0.5x / 0x 弱點** | ⚔️ 即問即答 |

---

### `$ rotom query 噴火龍 --output demo`

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
  "weaknesses": { "4x": ["rock"], "2x": ["water", "electric"], "0.5x": ["fire", "fighting"], "0.25x": ["grass", "bug"], "0x": ["ground"] },
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
}
```

#### 2. 超緊湊單行模式 (`--brief`，極致壓榨 Token)
```bash
$ node index.mjs 噴火龍 --brief
#006 噴火龍 (Charizard) | 火/飛行 | BST:534 (HP:78 攻:84 防:78 特攻:109 特防:85 速:100) | 弱點:岩石(4x),水(2x),電(2x)
```

---

### `$ rotom --install (安裝與整合指南)`

`poke-rotom` 支援隨插即用的 Agent Skill 與標準 MCP Server 兩種整合方式：

#### 方案 A：作為 Agent 技能（Claude Code / Cursor / 專案 Skills）
先將專案 Clone 至本機：
```bash
git clone https://github.com/cain19811028/poke-rotom.git
```
接著複製（或建立 Symlink 捷徑）至你的目標技能目錄：
```bash
# 1. 全域安裝給 Claude Code：
cp -r poke-rotom ~/.claude/skills/poke-rotom

# 2. 全域安裝給 Cursor：
cp -r poke-rotom ~/.cursor/skills/poke-rotom

# 3. 或整合至你的特定專案 / AI 工作區的 skills 目錄：
cp -r poke-rotom ./skills/poke-rotom
```
AI Agent 將根據目錄中的 [`SKILL.md`](SKILL.md) 自主調用工具。

#### 方案 B：作為 MCP Server（Model Context Protocol）
在你的 Claude Desktop / Claude Code 或專案的 MCP 設定檔（例如 `~/.claude.json` 或專案 `.mcp.json`）中加入：

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
> 💡 *Windows 使用者請替換為實際路徑，如 `"C:/tools/poke-rotom/index.mjs"`。*

---

### `$ rotom --sprites (立繪與外觀支援)`

| 參數值 | 樣式說明 | 預覽示例 |
| :--- | :--- | :--- |
| `--sprite official` | **官方透明高清立繪 (475x475)** *(預設推薦)* | 高解析宣傳與卡片展示 |
| `--sprite showdown` | **Pokémon Showdown 戰鬥待機動態 GIF** | 網頁對戰動畫效果 |
| `--sprite gen3` | **GBA 第三世代《綠寶石》復古像素點陣圖** | 經典 Retro 懷舊風格 |
| `--sprite default` | **當代標準 96x96 像素正面圖** | 輕量小圖示使用 |
| `--shiny` | **附加旗標：取得異色（色違）版本** | 金色鯉魚王、黑噴火龍 |

```bash
# 下載黑色異色噴火龍官方高清立繪
node index.mjs 噴火龍 --sprite official --shiny --out charizard_shiny.png
```

---

### `$ rotom --license & 免責聲明`

- **程式碼授權**：基於 [MIT License](LICENSE) 開源 © 2026 [cain19811028](https://github.com/cain19811028)。
- **商標與智財權宣告**：寶可夢（Pokémon）、角色名稱、圖鑑數值與立繪為 **Nintendo、Creatures Inc.、GAME FREAK Inc. 及 The Pokémon Company** 的註冊商標與版權所有。
- **非官方聲明**：本專案為獨立非營利之個人／開發者學習工具，與任天堂（Nintendo）或寶可夢公司（The Pokémon Company）**無任何官方隸屬、贊助或合作關係**。
- **合理使用與資料來源**：圖鑑數值與圖像資源透過開源社群專案 [PokéAPI](https://pokeapi.co/) 引用，僅供技術研究、非營利與個人學習用途。使用者應自行遵守相關智財規範，不得將下載之立繪資產用於商業營利。
- **下架與聯絡管道**：權利人若對內容有任何疑慮，請透過 GitHub Issue 聯繫專案作者，將第一時間配合處置。
