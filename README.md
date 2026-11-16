# 華富歇腳線 v4 · Wah Fu Rest Route

2026-11-16：匯入你提供的 `map.osm` 作為詳細底圖，加入地標分類、搜尋選單及雙語資料卡。保留原有路線、時間和長者友善功能。

v3 介面功能：右上角加入登入示範、朗讀／停止及大字按鈕，調整長者使用介面，保留繁體中文／English、歇腳、逐段繼續及回家流程。

## 詳細地圖（v4）

- 597 個地圖圖形及 215 個標記；包含樓宇輪廓、內庭、街道、步道、樓梯、綠地、商店與公共設施。
- 「全部地標」總覽先顯示住宅和公共地標，放大後逐步加入其他設施。數字表示附近標記的組合，點擊可放大。
- 可選「常用設施」查看 8 個升降機、3 個廁所、2 個飲水點及 17 個有蓋設施，或篩選商店、巴士和樓梯。
- 選地標後地圖移到該位置，並在地圖下顯示資料卡及原始 OSM 連結。選單也可用鍵盤操作，不需要精確點小圖示。
- 可開關地名；分類切換保留地圖視角，中英文切換保留選中的地標及視角。「看路線」和「全邨」可重設視角。
- 缺少英文名稱的地標使用英文類別及編號，資料卡保留來源原名；不會猜測官方英譯。

這次更新的是地圖顯示層，沒有以 OSM 線條重新計算距離，也沒有將新地標自動加入歇腳候選或行程目的地。原有 288 項路線資料完整保留。設施標記不是即時運作、開放或無障礙保證；有蓋設施不等於已核實座椅。本版沒有新增 GPS 導航。

原始 `map.osm` 的檔案副本隨交付資料夾保存在 `reference/`，不需要上傳到網站。重新匯入可用 Python 3 執行：

```sh
python3 scripts/import-osm.py /path/to/map.osm map-data.js
python3 -m unittest discover -s tests -p test_osm_import.py
```

上傳套件採第一層排列時，輸出位置改為 `map-data.js`。詳細資料與授權見 `DATA_SOURCES.md`。

## 三個新按鈕

- **登入（示範）**：選常用住宅、語言及文字大小，按「儲存並使用」。不需要帳戶、電郵或密碼；資料只存在這個瀏覽器，沒有跨裝置同步。儲存後按鈕改成「我的設定」，可重新設定或清除示範資料。不登入也能使用全部路線功能。
- **朗讀／停止**：只在按下時朗讀目前行程及下一步，不會自動播放。中文優先選用裝置提供的廣東話聲線，英文選用英文聲線，語速較慢。再按一次停止；換路線、語言或完成一段後，舊指示會停止，請再按朗讀聽新內容。
- **大字**：加大主要內容、控制項及說明文字。已儲存示範設定時，語言與大字偏好會一併更新；常用住宅須在「我的設定」內明確儲存。

聲線和語音支援由瀏覽器／作業系統提供。沒有廣東話聲線時會說明使用其他中文語音；不支援語音或播放失敗時會顯示提示，畫面文字及路線仍可使用。部分裝置語音可能需要網絡。網站不使用麥克風，也不錄音。

## 長者友善的介面改動

- 功能圖示旁同時顯示文字，避免只靠認圖。
- 主要文字約 18–22 px、較深字色、較寬行距；主要按鈕約 56–60 px 或以上。
- 手機選完住宅及目的地，按「下一步：選擇位置」可收起選路線區，直接進入行程。
- 固定工具列讓朗讀、大字及語言切換更容易找到；焦點及畫面捲動會避開工具列。
- 詳細時間、路網指示及來源保留在可展開區域，主要畫面先顯示當前步驟。
- 登入示範視窗支援鍵盤、Escape 關閉及返回原按鈕焦點。

設計參考：[W3C older users and accessibility](https://www.w3.org/WAI/older-users/)。這是設計及程式測試結果，尚未完成長者實測或全面 WCAG 審核。

## 更新你現在的 GitHub / Vercel 網站

這個套件特別配合你目前網站把 `index.html`、`app.js`、`styles.css` 放在第一層的方式。2026-11-16 已比對線上的三個主要程式檔，與修改前的本機 v2 相同。

1. 解壓 ZIP，打開 `upload-to-github` 資料夾。
2. 把**裡面的所有檔案和資料夾**上傳至現有 repository 第一層並提交。不要只上傳 ZIP，也不要將 `upload-to-github` 本身變成 repository 子資料夾。
3. 確認第一層有新版 `index.html`、`map-data.js`、`map-details.js`、`accessibility.js`、`preferences.js`、`app.js`、`journey.js`、`styles.css`，以及 `api/route.js`。
4. 本套件的 Vercel 設定：Framework **Other**；Root Directory 為 repository 根目錄；Build / Install Command 空白；Output Directory **`.`**（一個句點）。`vercel.json` 已寫好。這是配合目前網站的排列，與之前 public 資料夾套件的設定不同。
5. 若 Dashboard 曾 Override 為 `public`，將它改成 `.`，或關閉 Override 使用新設定，再重新部署。
6. 開啟網站檢查右上角三個按鈕，以及頁尾 `v4`。試一次地標篩選、中文／英文切換，以及歇腳／返回住宅流程。

現有 repository：<https://github.com/xuxi2313810975-creator/Wah-Fu-PaceLink>。現有網站：<https://wafu-two.vercel.app/>。本次只交付新版檔案，尚未更新線上 deployment。

本機開啟與測試

這個上傳版本的 `index.html` 和網頁資源在第一層，路線服務在 `api/`。需要 Node.js 22 或以上，不需要安裝 production 套件或 API key。

```sh
node scripts/dev-server.cjs
```

開啟 <http://127.0.0.1:4173/>。雙擊 HTML 只能預覽已保存的路線，途中新查詢需要這個 server 或 Vercel Function。

```sh
node --test tests/*.test.cjs
```

12 項 Node 測試涵蓋路線分段、API 錯誤／補算及偏好資料的讀寫、清除和拒絕儲存；另有 3 項 Python 匯入測試。`tests/browser-map.mjs` 檢查地圖篩選、資料卡、語言、縮放及手機版。`tests/browser-accessibility.mjs` 為 UI／語音控制測試，`tests/browser-flow.mjs` 為完整路線流程測試；它們另外需要測試環境安裝 Playwright 與 Chromium，或以 `CHROME_PATH` 指定現有 Chrome。測試截圖會存入 `test-results/`。

## 使用一次完整流程

1. 按登入示範，選常用住宅、語言及大字，儲存。重新從首頁開啟可載入偏好。
2. 選住宅、目的地、方向，按「下一步：選擇位置」。
3. 選一個**示範位置**，按「我想歇一歇」、分段繼續或返回住宅。
4. 按右上角朗讀聽目前步驟；可隨時停止。
5. 每段按「我已到達這一段」才推進，歇好後再繼續或回家。

分享連結內明確指定的住宅及語言優先於儲存偏好。分享網址和重新整理不保留逐段進度。清除示範資料不會刪除路線資料；目前畫面與既有網址仍可使用。

## 資料邊界

- 位置由手動選擇／確認，並非 GPS 定位。住宅與設施入口尚未核實。
- 休憩空間為候選地點；座椅、遮蔭、空位及無障礙入口待實勘。
- 18 幢住宅 × 8 目的地 × 雙方向共 288 項，286 項報時；兩項因吸附位置近乎重合而暫停報時。
- 原始路線快照日期 2026-11-11；途中新查詢顯示取得時間，但不代表即時封路、升降機或座位空位資料。
- 每段約 120 米為分段目標、最多 12 段，以平面幾何比例分配總距離。分段並非已核實地標或休息點。
- 時間以假設步速計算，各段向上取整；不含樓內路程、升降機及過路等候、個人上落斜影響。40 米／分鐘並非所有長者的步速標準。

來源、授權及路線計算詳見 `DATA_SOURCES.md`。保留地政總署標誌與地圖來源。

## English

Version 4 renders the supplied OSM extract locally: 597 geometry features and 215 landmarks. Use the category and landmark lists to locate lifts, toilets, drinking water, shelters, homes, shops and transport stops. The overview progressively reveals more facilities as you zoom. Existing route distances and time estimates are unchanged. Source labels are not verified entrances or operating-status data, and shelters are not assumed to contain seats. Three additional Python tests cover import geometry. `tests/browser-map.mjs` exercises the new map interactions.


The top-right controls provide a clearly labelled sign-in demo, read-aloud/stop and larger text. The demo stores only home, language and text-size preferences in this browser; it is not authentication and has no password or account sync. Shared URL parameters take precedence over saved preferences.

Read-aloud is user initiated. It reads the current journey/section, prefers an available Cantonese voice for Chinese and an English voice for English, and stops when the content changes. Voice availability and audible quality depend on the device. Browser tests validate the control logic using a mocked speech engine; they do not establish audible playback quality on residents' devices.

Run `node scripts/dev-server.cjs` for local preview and `node --test tests/*.test.cjs` for the 12 unit/contract tests. The prototype retains all original route flows and bilingual labels. No field audit or resident usability testing has been completed.

Technical references: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js).
