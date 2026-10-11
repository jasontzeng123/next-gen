# 你有資格生下一代嗎？

用你心中養孩子的標準，加上台灣真實的房價、薪資、補助與稅制，從孩子出生一路算到他獨立，看看存款撐不撐得過去，或者收入要在前百分之幾才撐得住。

- 網站：<https://jasontzeng123.github.io/next-gen/>
- 製作：[popo890827](https://www.threads.com/@popo890827) × Claude
- 授權：程式碼 [MIT](LICENSE)；文字、圖表與整理的資料 [CC BY 4.0](LICENSE-CONTENT.md)

## 想驗證計算？

1. **下載逐年明細**：在報告的「你的存摺」段落按「下載逐年明細」，會得到一份 Excel 打得開的 CSV。每一年都可以對帳：年底存款 ＝ 年初存款 ＋ 可用收入合計 － 支出合計，支出也拆成住房、教育、托育、孩子生活費等項目。
2. **看資料來源**：[docs/資料來源.md](docs/資料來源.md) 列出全部 51 個來源，標明是政府機關、新聞媒體還是民間整理。
3. **看研究筆記**：[research/](research/) 裡每個數字都附資料年份與原始連結（英文）。
4. **讀程式**：計算全部在瀏覽器裡完成，沒有隱藏的伺服器運算。

| 檔案 | 內容 |
| --- | --- |
| `src/data.js` | 所有參數：房價、租金、薪資分布、稅率、補助、教育與托育行情 |
| `src/engine.js` | 計算引擎：逐年現金流、稅與保費、房貸、門檻 PR 搜尋、「不生小孩的平行世界」 |
| `src/questions.js` | 題目與選項 |
| `src/screen-*.js` | 各個畫面（封面、問卷、報告、實驗室、方法與資料） |
| `src/community.js` | 匿名分享與統計（Supabase） |
| `research/` | 研究筆記與人口資料 |
| `test/` | 自動測試 |

## 發現錯誤？

請到 [Issues](https://github.com/jasontzeng123/next-gen/issues/new) 回報，最好附上你認為正確的數字與來源連結。

## 自己組裝與測試

需要 Node.js（18 以上）；畫面測試另外需要 Python 與 Playwright。

```bash
node build/build.js        # 組裝網站：產生 index.html 與 docs/資料來源.md
node test/sanity.js        # 計算引擎的檢查
python3 test/ledger_csv.py # 下載逐年明細並逐列對帳
python3 test/web.py        # 分享、取消分享、連線失敗等流程（用模擬的資料庫）
```

網站設定在 `build/web.config.json`（網址與 Supabase 的公開金鑰）。`index.html` 是組裝出來的成品，請改 `src/` 再重新組裝，不要直接改它。

重新產生地圖資料時（`build/geo.py`、`build/dotgrid.py`），需要先把 [Natural Earth](https://github.com/nvkelso/natural-earth-vector) 的 `geojson/ne_50m_admin_0_countries.geojson` 放到 `vendor-src/ne/geojson/`，把 [g0v twgeojson](https://github.com/g0v/twgeojson) 的 `json/twTown1982.topo.json` 放到 `vendor-src/twgeojson/json/`。

## 玩家的資料

只有玩家同意「匿名分享」後，才會把選擇送到 Supabase 的 `submissions` 表格。內容是各題的選擇、收入 PR（四捨五入到 5）、年齡區間（每 5 歲一組）與審查結果，**不含**姓名、帳號、確切年齡、年薪與存款。每台裝置用隨機的匿名代號，加上一組只有那台裝置知道的密語，所以只有本人能更新或取消自己的分享。資料庫的設定在 [supabase/setup.sql](supabase/setup.sql)。

### 示範資料

[seed/demo.json](seed/demo.json) 是 40 筆用試算引擎產生的示範資料（`"demo": true`），讓網站剛上線時就能看到統計的樣子。網站上凡是用到統計的地方都會註明「含示範資料」；真實分享累積到 20 筆後，示範資料就自動不再計入。

## 維運

- 免費方案的 Supabase 閒置一週會暫停。`.github/workflows/keepalive.yml` 每 3 天讀一次資料庫，避免暫停。萬一暫停了，到 Supabase 專案頁按 **Restore project** 即可，資料不會遺失；暫停期間網站仍可正常試算。
- 查看或匯出資料：Supabase → Table Editor → `submissions` → Export → CSV。
