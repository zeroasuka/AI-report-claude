# AI 實戰經驗報告 · 專案狀態

> 用 AI 寫的 AI 實戰簡報。互動式 HTML、26 頁、~26 分鐘演講份量。
> 主題：「言出法隨 · 幻化成真」 — Spoken Magic, Manifest Reality

---

## 1. 結構（26 頁）

| # | 章節 | 時長 | 內容亮點 |
|---|---|---|---|
| 01 | 封面 | 30s | 雙語標題（Cinzel + Orbitron）+ constellation 漂浮點線 + 四工具 chip |
| 02 | Ch1-1 打字 vs 說話 | 1m | counter-up 數字 87 vs 220 |
| 03 | Ch1-2 Typeless 介紹 | 45s | 三步驟卡 + typeless.png 跨平台截圖 |
| 04 | Ch1-3 Typeless 演示影片 | 1m | typeless-demo.mp4（單獨頁，全螢幕影片） |
| 05 | Ch2-1 一問一答 vs Agent | 1m30s | 左右對比卡（壞示範 vs 進階用法） |
| 06 | Ch2-2 規格書工作流 | 1m | 想 → 寫 → 做 三步驟橫向流程 |
| 07 | Ch3-1 工具盤雙陣營 | 1m | 聊天介面 / Agent 工具兩大陣營 |
| 08 | Ch3-2 Skill + 自動化 | 1m30s | Skill / Hook / Scheduled 三進階 |
| 09 | Ch3-3 心法 | 45s | 大圓「生態組合」+ 浮動工具衛星 |
| 10 | Ch4-A-1 part number 痛點 | 1m | 舊流程 3 步橫向 + 痛點 callout |
| 11 | Ch4-A-2 解法（終端機卡） | 1m30s | D 風格終端機卡（codex 對話模擬）+ 三步驟 |
| 12 | Ch4-A-3 iframe 雙版 demo | 2m | 桌面 + iPhone 17 Pro（402×874）並列嵌入 |
| 13 | Ch4-A-4 ROI 成果 | 1m | KPI 三格（⚡效率 / ✨方便度 / 🎯準確度）|
| 14 | Ch4-B-1 旅遊起心動念 | 1m | 三星堆實照當背景 + 6 功能 glass cards |
| 15 | Ch4-B-2 Gemini → 規格書 → Codex | 2m30s | **本場最關鍵頁**：三個聊天視窗 mock |
| 16 | Ch4-B-3 旅遊成品 | 1m | 熊貓主題介紹 + QR code 給觀眾掃 |
| 17 | Ch4-B-4 旅遊 iframe 雙版 | 1m30s | 桌面 + 手機 chengdu.zeroasuka.pp.ua |
| 18 | Ch5-1 修電腦場景 | 1m | linguist-error.png 截圖 + 痛點 |
| 19 | Ch5-2 影片 | 2m | codex-fix-pc.mp4 全螢幕 |
| 20 | Ch5-3 流程精煉 | 1m | 4 步驟橫向 + 心法 callout |
| 21 | Ch6-1 章扉 | 30s | shockwave FX + 紫卡 |
| 22 | Ch6-2 openclaw 機場追星 | 2m | 三欄：航班卡 / 影片 / openclaw 截圖 |
| 23 | Ch6-3 Hermes Lemonade 影片 | 1m30s | hermes-lemonade.mp4 + 紫卡指令 |
| 24 | Ch6-4 整合圖 | 1m | 4 階段水平流程節點 |
| 25 | 結尾心法 | 1m | 6 句逐句登場（CSS transition）|
| 26 | 致謝 Q&A | 30s-1m | confetti-cannon + email |

**合計：~26 分鐘**

> 📝 **變更歷史**：原 P23「Hermes 操控電腦」雙手機 + magnetic-field 連線頁已刪除（hermes-1.png / hermes-2.png 兩張手機截圖不再使用，但檔案還在 media/）。Ch6 的 Hermes 部分濃縮為「現場演示影片」+ 整合圖。

---

## 2. 視覺設計系統

### 主基調：Apple Keynote 深色風
- 背景 `#0a0a0f` + 徑向光暈（紫 #a855f7 / 藍 #60a5fa / 綠 #34d399）
- 字體：英文 Inter / 中文 Noto Sans TC / 等寬 JetBrains Mono / 古典 Cinzel / 科技感 Orbitron
- 頂端 1px 漸層進度條（紫→藍→綠）
- 右上頁碼、左下章節 chip

### 混搭元素（D 風移植）
- **終端機卡** — Ch4 vibe coding 章節主視覺
- **紫色 Hermes 卡** — Ch6 章扉
- **三星堆實照背景** — Ch4 旅遊起心動念

### 動畫策略
| 類型 | 用途 | 代表頁 |
|---|---|---|
| `data-anim` (runtime 觸發) | 入場 fade/rise/zoom-pop | 全 deck |
| CSS transition + `.is-active` | 必要動畫的可靠 fallback | P25 epilogue list |
| Inline `animation-delay` | 多元素 stagger | P13 KPI / P14 cards |
| Canvas FX | constellation / shockwave / particle-burst / magnetic-field / knowledge-graph / confetti-cannon / gradient-blob | Cover / Ch6 / 結尾 |

---

## 3. 檔案結構

```
ai-report/
├── index.html                  ← 主檔（26 頁）
├── deck.css                    ← A 風設計系統 + 自製組件
├── serve.py                    ← ★ Range-aware HTTP server（影片進度條必需）
├── PROJECT-STATUS.md           ← 本檔
│
├── assets/                     ← html-ppt skill 複製品
│   ├── base.css                ← 基礎 slide 框架
│   ├── fonts.css
│   ├── runtime.js              ← 鍵盤翻頁、presenter mode、counter
│   └── animations/
│       ├── animations.css      ← 27 個 CSS 動畫
│       ├── fx-runtime.js
│       └── fx/                 ← 7 個 canvas FX 模組
│
├── media/
│   ├── codex-fix-pc.mp4        ← 修電腦影片（1080p）
│   ├── openclaw-aespa.mp4      ← 機場追星影片（9:16 直式）
│   ├── typeless-demo.mp4       ← Typeless 演示
│   ├── hermes-lemonade.mp4     ← Hermes 操控電腦
│   ├── typeless.png            ← Typeless 跨平台截圖
│   ├── linguist-error.png      ← 修電腦錯誤截圖
│   ├── openclaw-screenshot.jpg ← openclaw 對話截圖
│   ├── hermes-1.png            ← Hermes 指令端
│   ├── hermes-2.png            ← Hermes 結果端
│   └── sanxingdui.webp         ← 三星堆面具實照（P14 背景）
│
└── style-preview/              ← 早期 4 種風格選擇樣稿（已過時）
```

---

## 4. 怎麼跑

### 正式用 `serve.py`（必需）

```powershell
cd "d:\Desktop\AI-report-claude\ai-report"
python serve.py
```

啟動成功會看到：
```
============================================================
  📺 Range-aware server
  📁 serving: d:\Desktop\AI-report-claude\ai-report
  🌐 http://127.0.0.1:8766/
  ✓ HTTP Range 已啟用 — 影片可拖移進度條
============================================================
```

如果出現「**port 8766 已被佔用**」→ 找到舊 `python -m http.server` 視窗關掉。

**為什麼不能用 `python -m http.server`**：內建版本不支援 HTTP Range 請求 → 影片無法拖拉進度條。

### 鍵盤操作

| 鍵 | 功能 |
|---|---|
| ← → / Space / PgUp PgDn | 翻頁 |
| Home / End | 首頁 / 末頁 |
| F | 全螢幕（F11 也可） |
| **S** | 🎤 演講者模式（新視窗：當前頁 + 下一頁 + 逐字稿提醒 + 計時器） |
| N | 底部 notes 抽屜 |
| O | 26 頁總覽 |
| `#/7` | URL 加 `#/7` 直跳第 7 頁 |

---

## 5. 演講者模式（S 鍵）

每頁有 `<div class="notes">` 條列式提醒（**不是逐字稿**，已全部濃縮成 bullet）：

```
⏱ 時長 · 頁面主題

• 重點 bullet
• 重點 bullet
• ★ 關鍵的特別標星

→ 下一頁串場
```

按 S 開新視窗，4 張磁吸卡片：
- 🔵 當前頁 pixel-perfect 預覽
- 🟣 下一頁預覽
- 🟠 SPEAKER SCRIPT（逐字稿大字版）
- 🟢 TIMER（計時器 + 上下頁按鈕）

---

## 6. 重要技術決策歷程

### 主題選擇
- 4 種風格樣圖（A Keynote / B Cyber / C 雜誌 / D Mixed）
- 選 A 為主、D 的終端卡 + 紫卡借到 Ch4 / Ch6

### 演講者模式 vs 主視圖動畫不一致
- 原因：base.css 給 `.slide` 0.5s opacity 漸入 + 30px 位移，蓋住子元素 data-anim
- 解法：deck.css 把 slide transition 縮到 .12s + transform 設 none

### anim-stagger-list 衝突
- 原因：`.anim-stagger-list > *` 與 runtime 加的 `.anim-X` class 特異性相等，CSS 順序壓過 → runtime 觸發失效
- 解法：移除 `anim-stagger-list`，子元素加 inline `animation-delay` 做手動 stagger
- 已修頁：P9（圓設計）、P13（KPI）、P14（cards）、P25（epilogue 用 CSS transition）

### 影片進度條無法拖
- 原因：Python 內建 http.server 不支援 HTTP Range
- 解法：自寫 serve.py，正確處理 `Range: bytes=N-M` header、回 206 Partial Content

### 切頁影片聲音延續
- 解法：index.html 結尾加 MutationObserver，監測 `.slide.is-active`，切頁時 pause 非當前頁所有 video

---

## 7. 已知問題 / 待補

### ⚠️ iframe 載入相依性
- **P12** 嵌 `parts.andyorbo.pp.ua/`（需密碼 KLA-LDI，現場輸入）
- **P16, P17** 嵌 `chengdu.zeroasuka.pp.ua/`
- 兩者**只有當 Firebase / VPS 沒設 X-Frame-Options: DENY 時才能載入**
- 現場前先用瀏覽器測一次

### 🎯 QR Code 連結（P16）
- 目前指向 `https://chengdu.zeroasuka.pp.ua/preview.html`
- 用 qrserver.com API 即時生成，需網路第一次載入後快取
- **若要保險**：可以改成本機 SVG 或在 build 時下載成靜態檔

### 🎬 影片轉檔
- 全部 4 支影片都已 `-movflags +faststart` 處理過
- 1080p / H.264 / faststart 啟用，搭配 `serve.py` 即可 seek

### 🗣️ 內容微調
- speaker notes 都已濃縮成條列（不是逐字稿）
- 章節故事順序：Ch4 part number / 旅遊；Ch5 修電腦；Ch6 openclaw / Hermes
- 可隨時微調個別頁面文字

---

## 8. 主要互動元件

| 元件 | 用途 | CSS class |
|---|---|---|
| 玻璃卡 | 章節主要卡片 | `.glass-card` |
| 終端機卡 | Ch4 vibe coding | `.term-card` |
| 紫光 Hermes 卡 | Ch6 章扉 / Lemonade 影片 | `.hermes-card` |
| 聊天視窗 mock | Ch4 Gemini / Codex 對話 | `.chat-window` |
| 瀏覽器外框 | P12 P17 桌面 iframe | `.browser-frame` |
| iPhone 17 Pro 框 | P12 P17 手機 iframe（402×874 native + scale .82） | `.phone-frame` |
| 手機外框（圖片） | P22 openclaw 截圖 | `.phone-mock` |
| 大圓核心 | P9 心法 | `.hero-circle` |
| 4 階段流程 | P24 整合圖 | `.flow-pipeline` |
| 三星堆背景 | P14 | `.slide.has-bgphoto + .bg-photo` |
| QR Code 卡 | P16 | `.qr-card` |
| 開啟線上版按鈕 | P13/P16/P17 | `.open-link` |
| epilogue 大字 | P25 | `.epilogue-list` |

---

## 9. 演講小提醒

- **開場 30 秒**極關鍵：第一句先停一拍，再說「這份簡報是 AI 寫的」
- **Ch4 P15** 是觀念傳遞最關鍵頁，慢慢講
- **Ch5 P19** 是 demo 高潮頁，影片時間軸內口頭強調 1:10「驗 MS 簽章」
- **結尾 P25** 6 句話一句句講，每句停 2 秒（CSS transition 已配好節奏）
- 全程目標：~28 分鐘，控場彈性 ±3 分鐘

---

## 10. 待辦 / 下次可做

- [ ] 彩排時跑一次完整 26 頁、調整時長
- [ ] P12 / P17 iframe 現場驗證（可能要 fallback 截圖）
- [ ] QR Code 可改成本機 SVG 或 png
- [ ] 視覺微調：個別頁文字、字級、間距
- [ ] 投影前用筆電接外接螢幕 1920×1080 全螢幕測一輪

---

*本檔生成時專案狀態：26 頁完整、4 支影片正常播放（搭 serve.py 可拖進度）、演講者模式運作、動畫穩定可見。剩下都是內容微調與彩排。*
