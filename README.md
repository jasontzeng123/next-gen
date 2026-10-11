# 你有資格生下一代嗎？

用你心中養孩子的標準，加上台灣真實的房價、薪資、補助與稅制，算算你有沒有足夠的錢把孩子養大。

- 網站：https://jasontzeng123.github.io/next-gen/
- 製作：[jason890827](https://www.threads.com/@jason890827) × Claude

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 整個網站（程式、樣式、資料都在這一個檔案裡） |
| `og.png` | 分享到 Threads、Facebook、LINE 時顯示的預覽圖 |
| `favicon.svg`、`apple-touch-icon.png` | 瀏覽器分頁與手機主畫面的圖示 |
| `supabase/setup.sql` | 資料庫的設定（在 Supabase 的 SQL Editor 執行過一次即可） |
| `.github/workflows/keepalive.yml` | 每 3 天碰一下資料庫，避免免費方案因為閒置被暫停 |

## 玩家的選擇存在哪裡？

存在 Supabase 的 `submissions` 表格。只有玩家同意「匿名分享」後才會送出，內容是各題的選擇、收入 PR（四捨五入到 5）、年齡區間與審查結果，不含姓名、確切年齡、年薪與存款。

查看或匯出：Supabase 專案 → 左側 **Table Editor** → `submissions` → 右上角 **Export** → CSV。

## 如果網站顯示「暫時連不上資料庫」

免費方案的專案若閒置太久會被暫停。到 Supabase 專案頁面按 **Restore project** 即可，資料不會遺失。暫停期間網站仍可正常試算，只是無法分享與讀取統計。
