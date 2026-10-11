# Taiwan housing cost research for「你有資格生下一代嗎？」

Compiled 2026-10-10. Every number below gives its data period and source URL.

## Ground rules and caveats

- **Access limits.** The official portals (pip.moi.gov.tw, lvr.land.moi.gov.tw, the MOI PDF uploads) rejected automated fetches during this session. Official MOI figures therefore come through secondary pages that quote them: news articles, 政大 (NCCU) research pages, and fangbian.tw. Where several outlets quote the same official number, they agree.
- **Search budget.** The web-search budget ran out near the end of the session. The remaining gaps (social-housing stock, the 2005/2010 city-level 房價所得比, 寬限期 usage share) were not filled by fresh searches. Those items are marked **ESTIMATE** or **UNVERIFIED**.
- **"ESTIMATE"** means I derived the figure from verified inputs, and the reasoning is given next to it. Treat it as a game default, not a statistic.
- **Units.** 萬 = NT$10,000. 坪 = 3.3058 m². 權狀坪數 includes 公設 (common area). Leju's figures exclude parking spaces.

---

## 1. Residential price per 坪 by county (all 22)

### 1a. Primary table: Leju 樂居, trailing 12 months as of 2026-10-10

**What the figures cover.** These are 大樓/華廈 transactions from 實價登錄. Leju excludes 透天, 公寓, 工業宅, 地上權, 員工宅, ground-floor units and special transactions, and subtracts parking before computing the unit price.

**Period.** "近一年", read on 2026-10-10. Because 實價登錄 lags, this is roughly 2025-Q4 to 2026-Q3.

**Columns.**
- 近一年: all deals in the trailing 12 months.
- 新案/新屋: new-build deals, including 預售 and 新成屋.
- 五年: the 5-year average.
- 戶數: the transaction count.

**Source.** Pages at `https://www.leju.com.tw/map/region?mode=price&city=<X>`. The city codes are A=台北, F=新北, H=桃園, B=台中, D=台南, E=高雄, O=新竹市, J=新竹縣, C=基隆, G=宜蘭, K=苗栗, N=彰化, M=南投, P=雲林, I=嘉義市, Q=嘉義縣, T=屏東, U=花蓮, V=台東, X=澎湖, W=金門, Z=連江.

| 縣市 | 近一年 (萬/坪) | 新案/新屋 (萬/坪) | 五年均 (萬/坪) | 近一年戶數 | 新案溢價 |
|---|---|---|---|---|---|
| 台北市 | 107.35 | 128.88 | 85.09 | 10,082 | +20% |
| 新北市 | 60.36 | 71.33 | 46.76 | 21,620 | +18% |
| 桃園市 | 38.63 | 43.62 | 30.43 | 15,022 | +13% |
| 台中市 | 40.89 | 52.46 | 31.79 | 13,180 | +28% |
| 台南市 | 32.53 | 38.56 | 26.99 | 7,165 | +19% |
| 高雄市 | 31.74 | 38.53 | 25.26 | 10,812 | +21% |
| 新竹市 | 50.73 | 62.15 | 39.55 | 1,847 | +23% |
| 新竹縣 | 51.43 | 56.90 | 43.38 | 3,093 | +11% |
| 基隆市 | 28.98 | 46.33 | 25.26 | 1,427 | +60% |
| 宜蘭縣 | 27.06 | 29.61 | 24.68 | 2,262 | +9% |
| 苗栗縣 | 30.80 | 34.16 | 27.47 | 1,698 | +11% |
| 彰化縣 | 28.70 | 32.88 | 24.75 | 2,043 | +15% |
| 南投縣 | 23.81 | 28.13 | 22.79 | 778 | +18% |
| 雲林縣 | 22.43 | 26.66 | 20.56 | 1,392 | +19% |
| 嘉義市 | 25.85 | 34.65 | 20.90 | 990 | +34% |
| 嘉義縣 | 27.55 | 31.78 | 25.33 | 657 | +15% |
| 屏東縣 | 21.86 | 26.29 | 19.29 | 1,520 | +20% |
| 花蓮縣 | 23.35 | 27.39 | 23.26 | 644 | +17% |
| 台東縣 | 20.95 | 29.10 | 19.60 | 378 | +39% |
| 澎湖縣 | 19.44 | 35.23 | 19.18 | 63 (small sample) | +81% (unreliable) |
| 金門縣 | 24.64 | 24.63 | 23.62 | 274 | 0% |
| 連江縣 | 30.53 | 28.98 | 28.53 | **1** (unusable) | — |

### 1b. Cross-check: HouseFeel 房感, "近一年成交單價", read 2026-10-10

Source: https://www.housefeel.com.tw/price-all/. The page states no exact quarter.

| 縣市 | 萬/坪 |
|---|---|
| 台北市 | 110.81 |
| 新北市 | 60.88 |
| 基隆市 | 21.31 |
| 桃園市 | 40.88 |
| 新竹縣 | 51.91 |
| 新竹市 | 56.52 |
| 苗栗縣 | 31.51 |
| 台中市 | 40.15 |
| 彰化縣 | 27.74 |
| 南投縣 | 23.21 |
| 雲林縣 | 24.48 |
| 嘉義縣 | 26.36 |
| 嘉義市 | 22.03 |
| 台南市 | 32.40 |
| 高雄市 | 31.22 |
| 屏東縣 | 18.28 |
| 宜蘭縣 | 29.26 |
| 花蓮縣 | 24.39 |
| 台東縣 | 24.05 |
| 澎湖縣 | 15.96 |
| 金門縣 | 22.89 |
| 連江縣 | 10.5 |

**Where the two sources conflict:**
- 基隆: Leju 28.98 vs HouseFeel 21.31.
- 嘉義市: 25.85 vs 22.03.
- 澎湖: 19.44 vs 15.96.
- 連江: 30.53 vs 10.5. Both are noise from tiny samples.
- For the six municipalities, the two sources agree within about 5%.

### 1c. 中古屋 (成屋) vs 新案, all building types (lower than Leju because 公寓/透天 are included)

**住商機構, 2026 Jan–Feb 實價登錄.** Source: https://fuhouse.setn.com/news/1808843 (published 2026-03-18).

| 城市 | 新案 (萬/坪) | 成屋/中古 (萬/坪) | 新/舊 ratio |
|---|---|---|---|
| 台北市 | 131.1 | 96.0 | 1.37 |
| 新北市 | 71.9 | 44.8 | 1.60 |
| 桃園市 | 42.3 | 30.7 | 1.38 |
| 台中市 | 53.6 | 31.7 | 1.69 |
| 台南市 | 39.6 | 25.1 | 1.58 |
| 高雄市 | 42.0 | 24.2 | 1.74 |

The article's own "差幅" column is internally inconsistent, so I recomputed the ratios.

**內政部, 2025Q2 成屋 average 成交單價** (all types, reported 2026-05-11). Source: https://money.udn.com/money/story/5621/9494011

| Area | 萬/坪 | YoY |
|---|---|---|
| 全國 | 35.43 | −3.1% |
| 台北 | 74.01 | −2.8% |
| 新北 | 43.45 | −0.3% |
| 桃園 | 29.61 | +3.9% |
| 台中 | 30.26 | −3.3% |
| 台南 | 24.61 | −1.3% |
| 高雄 | 27.05 | −4.2% |

The article's sentence assigning these numbers to cities is slightly ambiguous. This is the most plausible mapping.

**Gap between new and used homes widening.** 永慶 reports the median-total-price premium of 預售 over 中古 rose from 2020 to 2025:
- 台中: 45.5% → 103.1%
- 高雄: 38.5% → 86.1%
- 台南: 67.7% → 83.6%
- 桃園: 45.1% → 37.8%

Source: https://knowhow.yungching.com.tw/article/4537 (2025-07).

### 1d. Presale and new-project benchmarks, 2025–2026

- **台北市 presale average:**
  - 125.96萬/坪 in 2025Q4 (臺北市地政局, via https://money.udn.com/money/story/5621/9466827, published 2026-04-27).
  - Above 130萬/坪 in 2026H1, up 7% YoY (中信房屋, https://www.ctee.com.tw/news/20260818700100-430602).
- **591新建案, 2026Q2 new-project prices:** national average 開價 59萬 and 成交 55萬. 台北 成交 is close to 140萬 and 開價 close to 150萬, both record highs. 新北 is in the 70萬s. Source: https://udn.com/news/story/7241/9626002 (2026-07-14).
- **2026H1 new-project 成交 (591):**
  - 竹北 68.85萬, up 23.4% YoY.
  - 新竹市東區 73.48萬, up 21.8%.
  - Source: https://udn.com/news/story/7241/9620173.
- **台南 presale 2026H1:** close to 40萬/坪, the lowest of the six municipalities (ctee, link above).
- **2026H1 vs 2025H1 presale price change** (中信房屋), https://news.cnyes.com/news/id/6578933:
  - 台北 +7%
  - 新北 +4.4%
  - 桃園 +2.4%
  - 台中 +1.5%
  - 台南 +3.1%
  - 高雄 +1.9%

### 1e. Typical 總價 for 2房 and 3房

**Verified anchor.** 永慶, 中古大樓 3房 median 總價, trailing year to 2025-09. Source: https://money.udn.com/money/story/5621/9036492

| Area | Median 總價 |
|---|---|
| 台北市 | 3,652萬 |
| 高雄市 | 1,167萬 |
| 台南市 | 1,088萬 |
| 新竹縣 | over 2,000萬 |
| 桃園市, 台中市 | just over 1,000萬 |

**ESTIMATE for all counties.** Total = Leju price per 坪 × typical size, excluding parking.
- Sizes: 2房 = 26坪 in the north (北北基桃竹) and 23坪 elsewhere; 3房 = 34坪 (see §4).
- Check: this method gives 台北 3房 = 3,650萬, 台南 = 1,106萬 and 高雄 = 1,079萬. Those match the 永慶 medians within 1–8%, so the method is sound.
- To include a parking space, add the §6 price.

| 縣市 | 2房 all (萬) | 2房 new (萬) | 3房 all (萬) | 3房 new (萬) |
|---|---|---|---|---|
| 台北市 | 2,791 | 3,351 | 3,650 | 4,382 |
| 新北市 | 1,569 | 1,855 | 2,052 | 2,425 |
| 桃園市 | 1,004 | 1,134 | 1,313 | 1,483 |
| 台中市 | 940 | 1,207 | 1,390 | 1,784 |
| 台南市 | 748 | 887 | 1,106 | 1,311 |
| 高雄市 | 730 | 886 | 1,079 | 1,310 |
| 新竹市 | 1,319 | 1,616 | 1,725 | 2,113 |
| 新竹縣 | 1,337 | 1,479 | 1,749 | 1,935 |
| 基隆市 | 753 | 1,205 | 985 | 1,575 |
| 宜蘭縣 | 622 | 681 | 920 | 1,007 |
| 苗栗縣 | 708 | 786 | 1,047 | 1,161 |
| 彰化縣 | 660 | 756 | 976 | 1,118 |
| 南投縣 | 548 | 647 | 810 | 956 |
| 雲林縣 | 516 | 613 | 763 | 906 |
| 嘉義市 | 595 | 797 | 879 | 1,178 |
| 嘉義縣 | 634 | 731 | 937 | 1,081 |
| 屏東縣 | 503 | 605 | 743 | 894 |
| 花蓮縣 | 537 | 630 | 794 | 931 |
| 台東縣 | 482 | 669 | 712 | 989 |
| 澎湖縣 | 447 | 810* | 661 | 1,198* |
| 金門縣 | 567 | 566 | 838 | 837 |
| 連江縣 | 702* | 667* | 1,038* | 985* |

\* Tiny samples. Do not trust these.

**Other 總價 data points:**
- **台北市 標準住宅, Jan 2026:** 63.57萬/坪 and an average total of 1,996萬. By type: 大樓 80.42, 小宅 77.57, 公寓 47.57萬/坪. Source: 臺北市地政局 via https://news.591.com.tw/news/12306.
- **新北, 2026 Jan–Feb:** 1,000萬 buys about 22坪 of 中古屋 vs about 13坪 of 新案. Source: setn, link in §1c.

---

## 2. 房價所得比 and 房貸(貸款)負擔率, 內政部

**Latest available: 115年 (2026) Q1.** It was published around late August 2026. The 2026Q2 release was not yet out or not yet reported as of 2026-10-10.

**Method (MOI):**
- 房價所得比 = median housing price ÷ median household disposable income.
- 房貸負擔率 = monthly payment on a 70% loan over 20 years, at the 五大銀行 new-mortgage rate, ÷ median monthly household disposable income.
- MOI's ratings: below 30% reasonable; 30–40% somewhat low affordability; 40–50% low; 50% or above very low.

**Sources:**
- Full county table: https://fangbian.tw/house-price-income-ratio/ (citing 內政部不動產資訊平台《115年第1季房價負擔能力指標統計成果》).
- Six-municipality and national figures cross-verified at https://www.storm.mg/lifestyle/11160588 (2026-08-31) and https://money.udn.com/money/story/5648/9720149 (2026-08-28; national and 台中 match).

| 縣市 | 房價所得比 2026Q1 (倍) | 房貸負擔率 2026Q1 |
|---|---|---|
| 全國 | 9.47 | 41.46% |
| 台北市 | 14.72 | 64.41% |
| 新北市 | 12.63 | 55.30% |
| 台中市 | 11.35 | 49.67% |
| 高雄市 | 9.35 | 40.90% |
| 新竹縣 | 9.21 | 40.31% |
| 台南市 | 8.76 | 38.33% |
| 南投縣 | 8.47 | 37.08% |
| 桃園市 | 8.43 | 36.89% |
| 新竹市 | 8.43 | 36.88% |
| 金門縣* | 8.38 | 36.68% |
| 花蓮縣 | 8.31 | 36.38% |
| 彰化縣 | 8.23 | 36.01% |
| 台東縣 | 8.15 | 35.66% |
| 澎湖縣* | 8.05 | 35.22% |
| 苗栗縣 | 7.64 | 33.46% |
| 嘉義市 | 7.51 | 32.85% |
| 宜蘭縣 | 7.33 | 32.09% |
| 雲林縣 | 7.17 | 31.36% |
| 屏東縣 | 7.08 | 30.98% |
| 嘉義縣 | 6.67 | 29.21% |
| 基隆市 | 5.70 | 24.93% |
| 連江縣 | not published (insufficient sample) | — |

\* Fewer than 100 transactions in the sample, so the figure is volatile.

**連江縣 ESTIMATE:** use 金門's 8.4 as a proxy.

**Previous quarters (national):**
- **2025Q4:** 房價所得比 9.32, 房貸負擔率 40.75%. Five consecutive quarterly declines from the 2024Q3 peak of 10.82 and 46.8%. Source: https://ec.ltn.com.tw/article/breakingnews/5466043 (2026-06-14).
  - 台北's 2025Q4 房貸負擔率 was 63.92% (央行 金融穩定報告, https://money.udn.com/money/story/5613/9534162).
- **2025Q3:** 9.71 and 42.42% (https://rer.nccu.edu.tw/article/detail/2210058908437).
- **2025Q1:** 房貸負擔率 44.53%; median price 1,000萬; median household disposable income 97.67萬; 五大銀行 rate 2.249%. Source: https://annewsmedia.com/2025/09/05/market-news/11267/
- **2024Q4:** 10.76 and 46.62%; median price 1,028萬; income 95.56萬; rate 2.211%; 台北 16.43. Source: https://www.ctee.com.tw/news/20250502701175-430104
- **2025Q2 (UNVERIFIED):** national 9.89 and 43.12%; 台北 15.41, 新北 13.03, 台中 11.90, 高雄 9.61, 台南 9.38, 桃園 8.65. This appears only in an AI-generated Threads post, so treat it as low reliability.

---

## 3. Rents by county

### 3a. Official: 內政部 租金統計 (rent-subsidy contracts, median total rent)

**2026H1** (contracts in force at end-March 2026, n = 833,000). Source: https://www.cna.com.tw/news/aipl/202608130273.aspx (2026-08-13).
- National median: 8,600/month, up 1.2%.
- 新北 13,000; 台北 12,500; 桃園 10,000.
- Other counties are not published in the news text. They are in MOI's 表二, which was not reachable. The query platform is https://moisagis.moi.gov.tw/rent/ (not reachable from here).
- Elevator buildings rent 20–30% above walk-ups. New buildings (0–5 years) rent about 20% above 6–30-year-old ones. Buildings 6–30 years old rent 10–20% above those over 30.
- Median rent subsidy covers 41% of rent.
- **Caveat:** this sample is skewed toward older, cheaper units, because 65.4% of contracts are in buildings over 30 years old (2025H1, https://www.moi.gov.tw/News_Content.aspx?n=4&sms=9009&s=330350).

**2025H2 and 2025H1:** national 8,500; 新北 13,000; 台北 12,500; 桃園 10,000. Source: https://money.udn.com/money/story/5621/9253468

**Example, 台北市萬華區 整戶(層), 2025H1:** median 16,000; buildings under 30 years old 27,000; over 30 years old 15,000 (MOI, link above).

### 3b. Primary table for game use: 591租屋網 market pages

**What the figures are.** Medians of the last 3 months of listings (asking rents). They run higher than the MOI contract medians. The 1房/2房/3房 columns are listings by bedroom count, which in practice means 整層住家.

**Period.** "更新至" 2026-10-08 unless noted.

**Source.** `https://rent.591.com.tw/market/region?region_id=<id>&shape=0`. The region ids are 1 台北, 3 新北, 6 桃園, 8 台中, 15 台南, 17 高雄, 4 新竹市, 5 新竹縣, 2 基隆, 21 宜蘭, 7 苗栗, 10 彰化, 11 南投, 14 雲林, 12 嘉義市, 13 嘉義縣, 19 屏東, 23 花蓮, 22 台東, 24 澎湖, 25 金門, 26 連江.

| 縣市 | 雅房 | 分租套房 | 獨立套房 | 1房 | 2房 | 3房 | 4房+ | 更新 |
|---|---|---|---|---|---|---|---|---|
| 台北市 | 9,800 | 13,000 | 15,900 | 30,000 | 35,000 | 44,999 | 69,800 | 10/8 |
| 新北市 | 8,000 | 9,800 | 12,500 | 19,999 | 25,000 | 28,000 | 33,000 | 10/8 |
| 桃園市 | 6,800 | 8,500 | 9,500 | 16,000 | 22,000 | 25,000 | 28,000 | 10/8 |
| 台中市 | 5,400 | 8,000 | 9,466 | 15,000 | 22,000 | 25,000 | 30,000 | 10/8 |
| 台南市 | 4,800 | 7,000 | 7,500 | 13,500 | 21,000 | 23,287 | 28,000 | 9/28 |
| 高雄市 | 5,000 | 7,300 | 7,800 | 16,000 | 21,000 | 24,000 | 28,000 | 9/28 |
| 新竹市 | 6,500 | 8,000 | 9,500 | 16,000 | 24,000 | 28,950 | 34,999 | 10/8 |
| 新竹縣 | 7,000 | 9,500 | 10,000 | 20,000 | 25,000 | 30,000 | 38,000 | 9/28 |
| 基隆市 | 5,000 | 7,500 | 8,500 | 10,880 | 15,000 | 15,000 | 19,650 | 10/8 |
| 宜蘭縣 | n/a | 7,000 | 8,000 | 13,000 | 16,000 | 18,000 | 23,000 | 9/8 |
| 苗栗縣 | n/a | 7,500 | 7,500 | 13,800 | 20,000 | 23,000 | 25,000 | 10/8 |
| 彰化縣 | 4,500 | 6,500 | 6,800 | 12,250 | 18,000 | 18,000 | 24,000 | 8/28 |
| 南投縣 | n/a | 6,100 | 6,800 | n/a | 18,000 | 19,000 | 20,000 | 10/8 |
| 雲林縣 | n/a | 6,500 | 6,500 | n/a | 19,000 | 19,000 | 19,000 | 10/8 |
| 嘉義市 | 4,500 | 6,800 | 7,500 | n/a | 16,500 | 20,000 | 23,000 | 10/8 |
| 嘉義縣 | n/a | 7,000 | 7,500 | n/a | 23,000 | 23,800 | 30,000 | 10/8 |
| 屏東縣 | n/a | 6,000 | 6,500 | 11,750 | 17,500 | 17,500 | 20,000 | 10/8 |
| 花蓮縣 | n/a | 6,500 | 7,000 | 12,000 | 17,000 | 18,000 | 25,000 | 10/8 |
| 台東縣 | n/a | 6,500 | 7,000 | n/a | n/a | n/a | n/a | 10/8 |
| 澎湖縣 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | 10/8 |
| 金門縣 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | 9/28 |
| 連江縣 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | 10/8 |

**Small-county notes:**
- 雲林, 嘉義縣 and 南投 show nearly equal 2房 and 3房 rents. 透天 listings probably dominate there.
- 澎湖 listings: 3 分租套房 at 7,500–8,000.
- 金門 listings: 6 分租套房 at 3,500–6,500.

**ESTIMATES for the gaps.**
- 台東: 2房 ≈ 15,000; 3房 ≈ 17,000. Based on 花蓮 and 屏東, slightly lower.
- 澎湖: 套房 ≈ 7,500; 2房 ≈ 15,000; 3房 ≈ 17,000.
- 金門: 套房 ≈ 5,500; 2房 ≈ 14,000; 3房 ≈ 16,000.
- 連江: use the 金門 values.

**Per-坪 rent, for a size-based model:**
- **591 listing sample (4,557 listings, article dated 2026-06-30):** 台北 2,045 元/坪/月 (average rent 53,463); 新北 1,350 (24,557); 桃園 1,056 (18,896); 基隆 909 (13,453). Source: https://vocus.cc/article/6a4360c2fd8978000166e4cf
- **MOI lease registry, district medians (as of 2026Q3):**
  - 台北: 大安 2,076; 信義 1,886; 中山 1,760; 松山 1,756; 大同 1,743; 中正 1,741; 萬華 1,483; 士林 1,472; 內湖 1,314; 南港 1,232; 文山 1,177.
  - 新北: 永和 1,351; 板橋 1,234; 三重 1,191.
  - Source: https://housetw.com/rent
- **台北 2025 by district and type (買神探 BI):** 套房 1,255 (北投) to 1,907 (大安) per 坪. District median rent ranges from 15,000 (士林, 萬華) to 25,900 (大安). Source: https://www.oluckyo.org/blog/data/台北市租金行情大剖析｜2025-年各區價位、買租比較/
- **2023H1 (住商):** 台北 1,603/坪, 桃園 712/坪 (the lowest of the six municipalities). Source: https://www.moneydj.com/kmdj/news/newsviewer.aspx?a=49bdb1cc-c6ac-421e-b3eb-db6dd7277f8a
- **New-building premium:** a new 10.3坪 unit in 中山區 rented at 3,498/坪 (2025-10). Source: https://house.udn.com/house/story/123590/9045082

**雙北 rent ranges by district (2026).** Source: https://www.inn-taipei.com/rental-fee-2026/ (a commercial blog, 2026-06). These ranges are market references, not statistics.

| District | 套房 | 2房 | 3房 |
|---|---|---|---|
| 台北 overall | 14–26k | 32–65k | 45–90k+ |
| 大安 | 17–30k | 38–75k | 60–120k+ |
| 文山 | 12–22k | 28–48k | 38–70k |
| 新北 overall | 10–20k | 24–45k | 32–65k |
| 板橋 | 13–24k | 30–52k | 42–75k |
| 淡水 | 8–16k | 18–32k | 25–45k |

**Recommended game defaults (ESTIMATE):** use the 591 2房/3房 medians. For a "cheap/old" option, scale down by 0.75 to approach the MOI contract medians: 591's 台北 獨立套房 is 15,900, while MOI's all-type median is 12,500.

---

## 4. Typical unit sizes and 公設比

**Most-traded sizes (住商, 2025 full-year 實價登錄).** Source: https://udn.com/news/story/7241/9308572 (2026-02-04).
- National: 2房 25–28坪 is the most common, then 2房 21–24坪, then 3房 33–36坪.
- 新北 and 桃園: the 大二房 at 25–28坪 leads.
- 台中, 台南 and 高雄: the 小二房 at 21–24坪 leads.
- 台北: the 1房 under 14坪 is the most common.

**Average transaction area (內政部).** Source: https://udn.com/news/story/7241/9171712 (2025-12-01).
- National: 33.59坪 in 2015Q2 → 32.31 in 2020 → 31.52 in 2025Q2.
- 台北: 28.05 → 27.27.
- 新北: 28.75 → 27.70.
- 台南: 40.33 → 36.61.
- 高雄: 37.51 → 31.87.
- 台中 2025Q2: 30.72坪 (台灣房屋, https://money.udn.com/money/story/5621/9198575).
- In 雙北, the mainstream 2房 is "室內 about 20坪" (udn, link above).

**公設比:**
- **2025 new projects (華廈 and 大樓):** 台北 35.7%, a record high, with about 10% of projects at 40% or above. 新北 34.7%. Source: 住展, https://www.myhousing.com.tw/n/n02/n0203/n020301/264296/ (2026-01-24).
- **2024 first three quarters:** 台北 35.4%, 新北 34.2% (https://www.nownews.com/news/6562060).
- **Typical range by building type** (樂屋網, 2026-05, https://extra.rakuya.com.tw/house_news/33750.html):

| Building type | 公設比 |
|---|---|
| 公寓 (4–5F) | 8–15% |
| 電梯華廈 (7–10F) | 15–25% |
| 大樓 (11F+) | 32–36% |
| Small-lot tower | 38–45%+ |

- New towers rarely go below about 31%, because of the post-2005 fire code.

**Game defaults (ESTIMATE):**
- 2房 = 26坪 權狀 in the north and 23坪 in central/southern Taiwan.
- 3房 = 34坪 權狀.
- 公設比 = 35% for new 大樓 and 30% for used 大樓.
- At 35% 公設, 26坪 權狀 leaves about 17坪 of 主建物+陽台, roughly 15坪 indoors.
- **Conflict:** "室內20坪" for a 雙北 2房 would imply about 30坪 權狀. Some statistics count parking in the area, so the range of 2房 sizes is genuinely 22–30坪.

---

## 5. Core vs outer district price gaps (for multipliers)

**Main source.** Leju district pages (same method as §1a; trailing 12 months as of 2026-10-10). URL pattern: `https://www.leju.com.tw/map/region?mode=price&city=<C>&area=<code>`.

### 台北市 (city 107.35)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 大安 | 138.13 | 184.77 | 1.29 |
| 信義 | 116.84 | 153.92 | 1.09 |
| 北投 | 99.17 | 116.26 | 0.92 |
| 文山 | 92.72 | 105.79 | 0.86 |
| 萬華 | 85.70 | 106.89 | 0.80 |
| 內湖 | 85.54 | 109.05 | 0.80 |

Cross-checks:
- **臺北市地政局 標準住宅 2025Q4:** city 64.84; 大安 94.75; 中正 84.53; 松山 82.53; 萬華 54.03; 北投 51.26. This gives 大安/北投 = **1.85x**. Source: https://money.udn.com/money/story/5621/9466827
- **住商, 6 months to 2025-09-15, 大樓 only:** 大安 116.01; 松山 93.39; 信義 101.42; 中山 86.35; 士林 83.32; 南港 77.84; 文山 65.30; 北投 63.94. This gives 大安/文山 = 1.78x. Source: https://www.hbhousing.com.tw/news/detail.aspx?num=5828
- **2025 presale median (住展, MOI data):**

| District | 萬/坪 |
|---|---|
| 大安 | 177.12 |
| 中正 | 155.82 |
| 信義 | 148.26 |
| 中山 | 144.72 |
| 松山 | 141.78 |
| 南港 | 124.79 |
| 大同 | 114.02 |
| 北投 | 110.18 |
| 文山 | 106.04 |
| 士林 | 105.04 |
| 內湖 | 103.74 |
| 萬華 | 100.70 |

  Source: https://www.myhousing.com.tw/n/n02/n0203/n020301/267053/

**Note.** The gap is small in Leju's 大樓-only data (1.4–1.5x) and large in data that includes older stock (1.8x). For 中古 use about 1.8x; for 新案 use about 1.7x (184.77 vs 105.79).

### 新北市 (city 60.36)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 永和 | 81.04 | 92.27 | 1.34 |
| 板橋 | 76.85 | 84.86 | 1.27 |
| 新莊 | 62.82 | 72.04 | 1.04 |
| 林口 | 55.73 | 61.82 | 0.92 |
| 三峽 | 44.35 | 54.00 | 0.73 |
| 淡水 | 36.81 | 41.44 | 0.61 |

永和/淡水 = 2.2x; 板橋/三峽 = 1.73x.

### 台中市 (city 40.89)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 南屯 (七期) | 52.42 | 68.17 | 1.28 |
| 西屯 | 50.26 | 69.96 | 1.23 |
| 太平 | 34.29 | 40.73 | 0.84 |
| 大里 | 32.58 | 47.16 | 0.80 |

### 高雄市 (city 31.74)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 鼓山 | 40.21 | 57.78 | 1.27 |
| 苓雅 | 32.95 | 42.84 | 1.04 |
| 左營 | 32.54 | 40.89 | 1.03 |
| 楠梓 | 31.85 | 38.29 | 1.00 |
| 鳳山 | 27.74 | 33.02 | 0.87 |

The gap is **small**: 鼓山/鳳山 = 1.45x.

### 桃園市 (city 38.63)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 桃園區 | 44.17 | 52.37 | 1.14 |
| 中壢 | 41.87 | 49.36 | 1.08 |
| 八德 | 35.60 | 41.42 | 0.92 |

The flattest of the six municipalities.

### 台南市 (city 32.53)

| District | 萬/坪 | 新案 | ×city |
|---|---|---|---|
| 東區 | 42.71 | 54.11 | 1.31 |
| 永康 | 30.24 | 38.61 | 0.93 |
| 安平 | 27.46 | 37.38 | 0.84 |

The 安平 figure is odd, probably skewed by its mix of older stock.

### 新竹縣 (county 51.43)

竹北 63.04 (新案 72.82), ×1.23.

### Suggested multipliers (ESTIMATE)

| City | Core | Outer |
|---|---|---|
| 台北 | 1.3 | 0.85 |
| 新北 | 1.3 | 0.65 |
| 台中 | 1.25 | 0.8 |
| 高雄 | 1.25 | 0.87 |
| 桃園 | 1.12 | 0.9 |
| 台南 | 1.3 | 0.9 |
| 新竹縣 | 1.2 (竹北) | 0.75 |

The 新竹縣 outer value of 0.75 is a guess for 竹東/湖口, not verified.

---

## 6. Parking

**Flat (平面) space purchase price, 2025 average.** Source: 信義房屋 企研室 via https://www.peoplenews.tw/articles/lifestyle/14573 (2026-01-30), https://www.cna.com.tw/business/chinese/430704 (2026-04-14) and https://estate.ltn.com.tw/article/27501.

| City | 2015 (萬) | 2025 (萬) | 10-year change |
|---|---|---|---|
| 台北 | 223.2 | 287.8 | +29% |
| 新北 | 163.2 | 204.3 | +25% |
| 桃園 | 127.3 | 162.9 | +28% |
| 新竹 | 105.6 | 159.0 | +51% |
| 台中 | 100.9 | 165.6 | +64% |
| 台南 | 84.4 | 155.4 | +84% |
| 高雄 | 139.8 | 204.8 | +46% |

**Conflict for 台北.** 臺北市地政年報 / 住展 put the 2025 坡道平面 average at **269萬** (vs Sinyi's 287.8萬) and 機械 at **169萬**. Source: https://n.yam.com/Article/20260806366785 (2026-08-06).

**台北 by district, 2025 (坡道平面 / 機械, 萬):**

| District | 坡道平面 | 機械 |
|---|---|---|
| 大安 | 332 | 201 |
| 信義 | 306 | 166 |
| 中正 | 302 | 190 |
| 松山 | 293 | 175 |
| 中山 | 276 | 173 |
| 士林 | 273 | 156 |
| 大同 | 265 | 163 |
| 南港 | 250 | 155 |
| 北投 | 240 | 138 |
| 萬華 | 236 | 134 |
| 內湖 | 229 | 151 |
| 文山 | 210 | 130 |

**Mechanical spaces outside 台北.** The latest verified figures are for **2022** (大家房屋, https://www.hbhousing.com.tw/news/detail.aspx?num=5126):
- 新北 121.1, 桃園 103.8, 台中 73.4, 台南 72.9, 高雄 79.5 (萬).
- Flat spaces in 2022: 台北 260.5, 新北 191.3, 桃園 155.6, 台中 127.2, 台南 116.1, 高雄 155.9.

**ESTIMATE for 2025 mechanical prices.** I scaled the 2022 mechanical price by each city's flat-space growth from 2022 to 2025:
- 新北 ≈ 129萬
- 桃園 ≈ 109萬
- 台中 ≈ 96萬
- 台南 ≈ 98萬
- 高雄 ≈ 104萬

A simpler rule: mechanical ≈ 0.6 × flat.

**Kaohsiung examples:** in 北高雄 a B1 flat space sells for 250–280萬, and 左營 (HSR area) resales reach 300萬. Source: https://estate.ltn.com.tw/article/27598

**Share of households with their own parking** (official survey via Sinyi; period not stated):

| City | Share |
|---|---|
| 台北 | 55.6% |
| 新北 | 60.3% |
| 桃園 | 73.2% |
| 台中 | 71.2% |
| 台南 | 70.5% |
| 高雄 | 69% |

**Monthly parking rent:**
- **台北 (verified):** average 2,979元/month, the highest of the six municipalities and more than double other areas. 15% of renters pay over 4,500. Source: 信義房屋, 2026-04, https://udn.com/news/story/7241/9441113 and https://www.nownews.com/news/6807758
- **Other cities:** no official averages found. Listing samples (ohmi.com.tw page 1 of each city, read 2026-10-10):

| City | Listing median | Range | n |
|---|---|---|---|
| 台北 | 4,250 | 500–9,000 | 24 |
| 新北 | 3,000 | 1,000–4,200 | 23 |
| 桃園 | 2,000 | 500–3,800 | 24 |
| 台中 | 1,600 | 1,000–9,000 | 24 |
| 台南 | 1,800 | 1,000–5,400 | 23 |
| 高雄 | 1,800 | 1,000–6,600 | 24 |
| 新竹市 | 3,350 | 900–4,000 | 8, mostly near 清大/竹科 |

- **faqs.tw ranges (2026-03):** 台北 信義/大安 5,000–10,000; other 台北 districts 3,000–6,000; 新北 core 2,000–4,000; 台中 core 1,500–3,500; 高雄 core 1,500–3,000; suburbs 800–2,000. Source: https://www.faqs.tw/parking-fee-calc
- **Game defaults (ESTIMATE):**

| City | 月租 |
|---|---|
| 台北 | 3,000 |
| 新北 | 2,500 |
| 新竹 | 2,500 |
| 桃園 | 2,000 |
| 台中 | 1,800 |
| 高雄 | 1,800 |
| 台南 | 1,600 |
| Other counties | 1,000–1,500 |

  The 台北 ohmi listing median runs about 1.4x the Sinyi average, so I discounted the other listing medians accordingly.

---

## 7. Ongoing ownership costs

### 管理費 (per 坪 per month, 大樓)

**2024-11 (何世昌):** https://wantrich.chinatimes.com/news/20241104900196-420501

| Area | 元/坪/月 |
|---|---|
| 台北 new projects | 120–160 (some 170–180) |
| 新北 | 90–120 |
| 台中 | 80–120 (a few 60–65) |
| 桃園 | 70–100 |
| 台南, 高雄 | 60–80 |
| 台北 luxury | 250–550 |

**2021-05 (ETtoday):** 台北 about 150; 新北 80–100; 台中 70–80; 台南/高雄 50–60; 北投/文山/內湖 new homes 90–120. Source: https://house.ettoday.net/news/1984922

**Game defaults (ESTIMATE):**

| Area | 元/坪/月 |
|---|---|
| 台北 | 130 |
| 新北 | 100 |
| 新竹 | 90 |
| 桃園 | 85 |
| 台中 | 85 |
| 台南, 高雄 | 65 |
| Other counties | 40–60 |
| 透天 / 公寓 | 0–30 |

### 房屋稅 (房屋稅 2.0, in force from 2025 bills)

- **Rates:** 1% for 全國單一自住 below a local value threshold; 1.2% for general self-use (up to 3 homes in the household). Tax = 課稅現值 × rate.
- **Worked examples:** 課稅現值 80萬 × 1% = 8,000元; 120萬 × 1.2% = 14,400元. Source: https://applealmondrealty.com/posts/48293
- **台北 single self-use:** effective rate is cited as 0.6% → 0.7% (https://www.zuyou.com.tw/blog/landlordknowhow/house-tax2/).
- **ESTIMATE for a typical self-use apartment:**
  - New 大樓 (課稅現值 roughly 80–150萬): about **8,000–15,000元/年**.
  - Older 公寓 (課稅現值 usually under 30萬): about **1,000–3,000元/年**.
  - Reasoning: 課稅現值 is set far below market value, and the stated rates are applied to it. I did not verify a statistical average.

### 地價稅

- 自用住宅 rate: 2‰ of 申報地價 (= 公告地價 × 80%).
- An apartment's land share is typically 5–10坪, so the tax runs "幾百到幾千元/年". Source: https://govinfo.autumnsnow.work/guides/land-value-tax
- **ESTIMATE:** 1,000–3,000元/年 in 雙北 and 300–1,500 elsewhere.

### 裝潢

- **信義居家 (2025-08-11):** 新成屋 6–8萬/坪; 中古屋 8–12萬+/坪; 老屋 12萬+; design fee 4,000–15,000/坪. Source: https://livinglife.com.tw/article/67b5a8a763a27f0048a1b844
- **ISID (2026-04), 北部, per 坪 of 主建物, including design, construction and supervision, excluding furniture and appliances:** 新成屋 light 5–8萬/坪, designed 8–15萬/坪; 中古 full renovation 12萬+; 老屋 15萬+. A 30坪 old-house renovation runs 300–660萬. Source: https://www.inspacelab.com/design-knowledge/home-renovation-cost-per-ping-2026/
- **Budget ranges (faqs.tw):** general 30–150萬+; 中古 renovation 50–200萬; presale 客變 30–80萬; furniture and appliances 10–50萬. Source: https://www.faqs.tw/down-payment-calc
- **Game default (ESTIMATE):** about 6萬 × 主建物坪 for a new home, so about 100–130萬 for a 2房 and 130–180萬 for a 3房. Use a 0.8x factor in central and southern Taiwan.

### Transaction costs (buyer)

- **仲介費:** buyer 1–2%, seller 3–4%. The legal cap is 6% for buyer and seller combined (內政部 經紀業報酬計收標準; well known, but not re-fetched this session). Buying presale directly from the developer carries no 仲介費.
- **代書費:** 8,000–20,000 (https://buyhouse.tw/guide/home-buying-taxes-fees) or 1.5–3萬 (faqs.tw).
- **Taxes and fees:**
  - 契稅 6% of 房屋評定現值, not of the sale price.
  - 印花稅 0.1% of the 公契 value.
  - 登記規費 0.1%.
  - 房貸設定費: varies by bank (not verified).
- **Total:** sources say 3–8% of price including 裝潢, or about 2–3% excluding it (buyhouse's 1,000萬 example adds up to about 205,000, or 2.05%).
- **火險+地震基本險:** 2,000–5,000元/年 (faqs.tw) or 3,000–8,000 (buyhouse). Banks require it.

---

## 8. Mortgage practice (as of 2026-10-10)

### 央行 選擇性信用管制

**第七波, effective 2024-09-20.** Source: https://lawyer880.com/articles/article-seventh-credit-control-2026.html
- Expanded nationwide.
- A person who already owns a home and buys a "first" mortgaged home: **no 寬限期**.
- 自然人 第2戶: **5成**, no 寬限期.
- 第3戶 or more: 3成, no 寬限期.
- 法人: 3成.
- 高價住宅: 3成. The thresholds are 台北 7,000萬, 新北 6,000萬 and other areas 4,000萬.
- **Exemptions:** genuine first-time buyers (no home at all) are not restricted. Upgraders can sign a pledge to sell the old home within 18 months (extended from 12 months in 2025-09). Inherited homes do not count.

**2026-03-20:** 第2戶 cap raised from 5成 to **6成**. Sources: https://hakkanews.tw/2026/03/19/266946/ and lawyer880.

**2026-09-18:** 第2戶 cap for 自住 raised to **7成**, still with **no 寬限期**. The policy rate is unchanged (重貼現率 2%, the 10th straight hold). The 購地貸款 "pledge to build" condition was dropped. Sources: https://udn.com/news/story/7238/9761209 and https://www.businesstoday.com.tw/article/category/183025/post/202609170029/ (2026-09-17).

### Typical down payment (自備款)

- **首購 (no home):** about **2成**, because banks lend up to about 8成 (and 青安 lends 8成). Weaker borrowers or older buildings may get 7–7.5成, so they need 25–30% down.
- **第二戶:** **3成** since 2026-09-18 (4成 between 2026-03-20 and 2026-09-17; 5成 between 2024-09-20 and 2026-03-19).
- **第三戶 or more / 豪宅:** 7成.

### 青安貸款

**新青安 (2.0), 2023-08 to 2026-07-31 applications.** Loans up to 1,000萬, 8成, 40 years, 5-year 寬限期, 2-point interest subsidy. Disbursement deadline 2026-10-31. Source: https://dr-house.com.tw/blog/qingan-3-0-loan-guide/

**青安 3.0, effective 2026-08-01.** Sources: https://www.cna.com.tw/news/aipl/202607160093.aspx (2026-07-16) and dr-house.
- **Eligibility:**
  - Borrower's own annual income ≤ 200萬.
  - Under 50 years old.
  - Age + loan term ≤ 80.
  - One 青安 loan per lifetime.
- **Loan cap:** 1,000萬; 1,200萬 for newlyweds (within 2 years of marriage); 1,500萬 for households with minor children (pregnancy counts).
- **House price cap:** 台北 3,500萬; 新北, 新竹市 and 新竹縣 2,500萬; elsewhere 2,000萬.
- **Terms:** 8成, up to 40 years, 5-year 寬限期 (unchanged).
- **Rate:** 1.775% for years 1–3, then 1.900%, 2.025% and 2.150%, then 2.275% from year 7. The subsidy is phased out.
- **Conflict on duration:** CNA says "為期6年"; dr-house says the program runs to 2029-07-31. The 6 years may refer to the subsidy schedule.

### Market rate

The 五大銀行 average rate on new mortgages was 2.211% in 2024Q4 and 2.249% in 2025Q1. Sources: https://www.ctee.com.tw/news/20250502701175-430104 and https://annewsmedia.com/2025/09/05/market-news/11267/

**ESTIMATE:** 2.2–2.3% in 2026. The policy rate has been flat since 2024-03.

### Loan term

- **ESTIMATE / common practice:** 30 years for ordinary bank mortgages (20 years in MOI's affordability formula). 40 years under 青安 for borrowers aged 40 or under (because age + term ≤ 80).

### 寬限期 usage

- **UNVERIFIED:** I found no 2025–2026 statistic on the share of new mortgages that use a 寬限期.
- Qualitatively, it is common for 青安 first-time buyers (5 years) and banned for anyone who already owns a home (第七波).
- Game suggestion: let the player opt in to 0–5 years, with a warning that payments jump afterward.

---

## 9. Historical "time machine" series

### 9a. 房價所得比 and 房貸負擔率, 全國 (內政部)

Source: 政大不動產研究中心, https://rer.nccu.edu.tw/article/detail/2210058908437. The fetch summary labels these as Q4 of each year; that is consistent with 2024 = 10.76 = 2024Q4.

| Year | 房價所得比 | 房貸負擔率 |
|---|---|---|
| 2002 | 4.26 | 22.34% |
| 2005 | **4.97** | 21.70% |
| 2008 | 5.87 | 26.72% |
| 2010 | **7.11** | 29.34% |
| 2012 | 7.79 | 32.78% |
| 2015 | **8.51** | 35.81% |
| 2016 | 9.32 | 38.34% |
| 2018 | 8.57 | 35.12% |
| 2020 | **9.20** | 36.81% |
| 2022 | 9.61 | 40.25% |
| 2023 | 9.97 | 42.66% |
| 2024 | 10.76 (peak 10.82 in 2024Q3) | 46.62% |
| 2025Q3 | 9.71 | 42.42% |
| 2025Q4 | 9.32 | 40.75% |
| **2026Q1** | **9.47** | **41.46%** |

**Note on the early series.** Through 2012Q2 the series used 聯徵中心 appraisal data; from 2012Q3 it uses 實價登錄 (https://www.npf.org.tw/2/23363). Other quoted 2002 values: 2002Q1 4.47 (ctee 2014) and 2002 4.38 (LTN 2019). The early series is therefore uncertain by about ±0.2.

### 9b. City series (verified points)

**台北市:**

| Period | 房價所得比 | Source |
|---|---|---|
| 2002 | 6.01 | https://ec.ltn.com.tw/article/paper/1279715, https://www.gvm.com.tw/article/88701 |
| 2012Q3 | 14.0 (負擔率 51.4%) | https://www.ctee.com.tw/news/20121129700175-439901 |
| 2012Q4 | 13.1 | https://www.ctee.com.tw/news/20130228700019-439901 |
| 2013Q1 | 15.52 | https://www.ctee.com.tw/news/20140731700003-439901 |
| 2014Q1 | 14.6 | same as above |
| 2014 | 14.94 | https://www.thenewslens.com/article/123946 |
| 2018Q1 | 15.00 (61.54%) | MOI PDF https://www.nlma.gov.tw/uploads/files/261962ce1c3ccf8a045ad6003a722d75.pdf |
| 2018 | 15.32 | LTN |
| 2018Q3 | 14.07 | TNL |
| 2019Q1 | 14.15 | NPF |
| 2020Q3 | 13.94 | https://www.npf.org.tw/2/23363 |
| 2021 | 15.86 | GVM |
| 2023Q2 | 15.52 (66.54%) | https://www.cna.com.tw/news/ahel/202310130315.aspx |
| 2024Q4 | 16.43 | ctee |
| 2026Q1 | 14.72 (64.41%) | — |

**新北市 (台北縣 before 2010):**

| Period | 房價所得比 |
|---|---|
| 2002 | 6.15 |
| 2012Q3 | first time above 10 |
| 2014Q1 | 12.4 |
| 2018Q1 | 12.75 (52.30%) |
| 2018 | 12.6 |
| 2020Q3 | 11.71 |
| 2021 | 12.13 |
| 2023Q2 | 12.93 (55.41%) |
| 2026Q1 | 12.63 (55.30%) |

**台中市:**

| Period | 房價所得比 |
|---|---|
| 2014Q1 | 7.47 |
| 2018Q1 | 9.58 (39.31%) |
| 2023Q2 | 11.55 (49.53%) |
| 2026Q1 | 11.35 (49.67%) |

**高雄市:**

| Period | 房價所得比 |
|---|---|
| 2014Q1 | 7.51 (the source text is ambiguous) |
| 2018Q1 | 8.16 (33.50%) |
| 2023Q2 | 9.23 (39.58%) |
| 2026Q1 | 9.35 (40.90%) |

**ESTIMATES for missing years** (city-to-national multiples interpolated from the verified points above):

| | 2005 | 2010 | 2015 | 2020 |
|---|---|---|---|---|
| 台北 | **ESTIMATE ≈ 7.2** | **ESTIMATE ≈ 11.5** | **ESTIMATE ≈ 15** | 13.94 (2020Q3, verified) |
| 新北 | **ESTIMATE ≈ 7.0** | **ESTIMATE ≈ 9.0** | **ESTIMATE ≈ 12.5** | 11.71 (2020Q3, verified) |
| 台中 | ESTIMATE ≈ 5 | ESTIMATE ≈ 6.5 | ESTIMATE ≈ 8 | ESTIMATE ≈ 9.5 |
| 高雄 | ESTIMATE ≈ 5 | ESTIMATE ≈ 6 | ESTIMATE ≈ 7.8 | ESTIMATE ≈ 8.5 |

Reasoning:
- **台北 2005:** national 4.97 × about 1.45. The 台北/全國 multiple was 1.41 in 2002, 1.54 in 2012Q3 and about 1.55–1.65 in 2018–2026.
- **台北 2010:** national 7.11 × 1.6 ≈ 11.4. It must sit below the 2012 level of 13–14, and 台北's Sinyi index rose 77% from 2005 to 2010.
- **台北 2015:** between 14.94 (2014) and 15.00 (2018Q1).
- **新北 2010:** must be below 10, because 新北 first exceeded 10 in 2012Q3.
- **新北 2015:** between 12.4 (2014Q1) and 12.6 (2018).
- **台中 and 高雄:** rough interpolation. Use them with caution.

**A different survey (do not mix with the MOI series):** 住宅需求動向調查 gave 台北 9.06 in about 2009 and 14.7 in 2013Q3, and national 7.08 in 2009H2. Source: 住宅學報 paper at housing.org.tw.

### 9c. 信義房價指數 (nominal, quarterly)

Source: https://www.sinyinews.com.tw/quarterly. The base period is not stated on the page; the index sits at about 100 around 2015Q4–2016Q1, which suggests 2016Q1 = 100 (UNVERIFIED).

| Quarter | 台北 | 新北 | 桃園 | 新竹 | 台中 | 台南 | 高雄 | 全台 |
|---|---|---|---|---|---|---|---|---|
| 2005Q4 | 49.16 | 47.47 | 48.53 | 53.75 | 49.48 | — | 44.91 | 48.16 |
| 2010Q4 | 87.19 | 73.31 | 67.68 | 72.16 | 71.69 | — | 60.71 | 75.41 |
| 2015Q4 | 100.96 | 102.15 | 103.03 | 103.06 | 105.95 | — | 100.85 | 102.35 |
| 2020Q4 | 109.99 | 113.57 | 118.78 | 129.06 | 125.98 | 129.62 | 120.62 | 115.16 |
| **2026Q2** | **144.48** | **158.17** | **186.46** | **248.67** | **183.64** | **202.86** | **168.97** | **168.77** |

- **2026Q2 YoY change:** 台北 +2.69%, 新北 +2.17%, 桃園 −1.19%, 新竹 +3.16%, 台中 −4.47%, 台南 −0.51%, 高雄 −3.25%, 全台 +2.66%.
- **Nominal price multiple, 2005Q4 → 2026Q2:** 台北 ×2.94; 全台 ×3.50; 新北 ×3.33; 台中 ×3.71; 高雄 ×3.76; 新竹 ×4.63.
- **2010Q4 → 2026Q2:** 台北 ×1.66; 全台 ×2.24.
- **2020Q4 → 2026Q2:** 台北 ×1.31; 全台 ×1.47; 台中 ×1.46; 新竹 ×1.93.
- **Cumulative change from 2020 by index** (https://house.udn.com/house/story/123591/9624677): 國泰 +86%, 信義 +54.9%, 內政部 +39.7%.

### 9d. Other price-index points

- 臺北市住宅價格指數, 2025Q4: 126.88, down 0.02% QoQ and 2.93% YoY. Source: https://wantrich.chinatimes.com/news/20260428900649-420501
- 永慶 2026 outlook: prices down 3–7% (https://www.cna.com.tw/postwrite/chi/422541).

---

## 10. Social housing and rent subsidy (context)

**Not verified this session** (the search budget ran out, and official pages did not return data).

**Background from prior knowledge (UNVERIFIED):**
- The 2017–2024 national target was 20萬戶 of social housing: 12萬 built directly plus 8萬 via 包租代管.
- A later plan (2023–2032) raised the long-term target further.
- Built social housing is a very small share of the housing stock, well under 1%, versus about 30% in the Netherlands. Taipei has the most completed units of any city.
- **台北 rent-setting (UNVERIFIED):** 社宅 rents are set as a discount to the appraised market rent, at roughly 85% for general households, with deeper discounts by income tier (the 2026 portal lists 4 tiers, from Category 1 low-income to Category 4 general households: https://www.socialhousing.tw/portal/FindGoodHouseBuilding).
- **Game ESTIMATE:** a 台北 2房 社宅 costs about 15,000–22,000/month (about 0.85 × the 21–26k market rent for a comparable older 2房), plus management fee and parking.
- **Game ESTIMATE for allocation odds:** a lottery with low odds, at roughly 1–5% of renting households.

**Rent subsidy (verified):**
- 2026H1: 833,000 households had valid rent-subsidy contracts, and the median subsidy covered 41% of rent. Example: on 9,000 rent, the government pays about 3,600 (4,800 for disadvantaged households).
- Source: https://www.ettoday.net/news/20260813/3218864.htm
- This is the realistic "government help" for most young renters.

**Where to verify:** 國家住宅及都市更新中心 https://www.hurc.org.tw (a 2026 Q3 central 社宅 招租公告 exists) and the 臺北市都發局/住宅及都市更新中心.

---

## 11. Gaps and conflicts summary

1. **Official 2026Q2 房價所得比:** not yet reported as of 2026-10-10. Use 2026Q1.
2. **County-level MOI rent medians:** only 新北, 台北 and 桃園 are in the news text. The rest are in MOI's 表二, which could not be reached. The 591 listing medians fill the gap but run higher.
3. **Price definitions differ widely.** Leju and HouseFeel cover 大樓 only and exclude parking (highest). MOI 成屋 averages cover all types (lowest). 台北's "price per 坪" ranges from 64.84 (地政局 標準住宅) to 74.01 (MOI 2025Q2 成屋) to 96 (住商 2026 成屋) to 107–111 (Leju/HouseFeel 大樓) to 126–140 (presale). Pick one consistent source; I recommend Leju for all 22 counties.
4. **Small counties:** 澎湖, 金門 and 連江 prices and rents are unreliable (tiny samples). 連江 is not in the official 房價所得比.
5. **台北 parking:** 287.8萬 (Sinyi) vs 269萬 (地政年報/住展) for 2025 flat spaces.
6. **Mechanical parking outside 台北:** latest verified data is from 2022. The 2025 figures are ESTIMATES.
7. **Monthly parking rent outside 台北:** listing samples only (ESTIMATE).
8. **Historical city 房價所得比 for 2005 and 2010:** not found. These are ESTIMATES.
9. **寬限期 usage share and social-housing stock:** not verified.
10. **青安3.0 duration:** "6 years" (CNA) vs "to 2029-07-31" (dr-house).

---

## 12. Machine-readable summary (JSON)

Fields:
- `price_wan_per_ping_all`: Leju trailing 12 months as of 2026-10-10 (大樓, excluding parking).
- `price_wan_per_ping_new`: Leju 新案/新屋.
- `price_housefeel`: HouseFeel 近一年.
- `pir_2026q1` / `mortgage_burden_2026q1`: MOI 115Q1.
- `rent_591_*`: 591 listing medians, last 3 months to about 2026-10-08.
- `est_total_*`: ESTIMATE totals in 萬, excluding parking.
- `parking_*`: 萬 for purchase, 元/月 for rent.
- `mgmt_fee_per_ping`: ESTIMATE 元/坪/月.
- `null` means not available.

```json
{
  "meta": {
    "compiled": "2026-10-10",
    "units": {"price": "萬元/坪", "total": "萬元", "rent": "元/月", "parking_price": "萬元", "parking_rent": "元/月", "mgmt_fee": "元/坪/月"},
    "sources": {
      "price": "https://www.leju.com.tw/map/region?mode=price&city=<code> (近一年, read 2026-10-10)",
      "price_alt": "https://www.housefeel.com.tw/price-all/",
      "pir": "內政部 115年第1季房價負擔能力指標 via https://fangbian.tw/house-price-income-ratio/ ; cross-check https://www.storm.mg/lifestyle/11160588",
      "rent": "https://rent.591.com.tw/market/region?region_id=<id>&shape=0 (近3個月刊登中位數, 更新至~2026-10-08)",
      "rent_official": "內政部 115上半年租金統計 https://www.cna.com.tw/news/aipl/202608130273.aspx",
      "parking": "信義房屋 2025平面車位均價 https://www.peoplenews.tw/articles/lifestyle/14573"
    },
    "assumptions": {
      "size_2room_ping_north": 26, "size_2room_ping_south": 23, "size_3room_ping": 34,
      "common_area_ratio_new_tower": 0.35, "common_area_ratio_used_tower": 0.30,
      "north_counties": ["台北市","新北市","基隆市","桃園市","新竹市","新竹縣"]
    }
  },
  "national": {
    "pir_2026q1": 9.47, "mortgage_burden_2026q1": 0.4146,
    "pir_2025q4": 9.32, "mortgage_burden_2025q4": 0.4075,
    "pir_peak_2024q3": 10.82,
    "rent_median_official_2026h1": 8600,
    "mortgage_rate_5banks_2025q1": 0.02249,
    "used_home_avg_price_2025q2_moi": 35.43,
    "new_project_avg_2026q2_591": {"asking": 59, "transacted": 55}
  },
  "counties": {
    "台北市": {"price_wan_per_ping_all": 107.35, "price_wan_per_ping_new": 128.88, "price_5yr_avg": 85.09, "price_housefeel": 110.81, "price_used_all_types_2026JanFeb_hb": 96.0, "price_new_2026JanFeb_hb": 131.1, "presale_2025q4_landbureau": 125.96, "pir_2026q1": 14.72, "mortgage_burden_2026q1": 0.6441, "rent_591_shared_suite": 13000, "rent_591_studio": 15900, "rent_591_1room": 30000, "rent_591_2room": 35000, "rent_591_3room": 44999, "rent_official_median_2026h1": 12500, "rent_per_ping_2026": 2045, "est_total_2room_all": 2791, "est_total_2room_new": 3351, "est_total_3room_all": 3650, "est_total_3room_new": 4382, "verified_3room_used_tower_median_total": 3652, "parking_flat_price_2025": 287.8, "parking_flat_price_2025_alt_landbureau": 269, "parking_mech_price_2025": 169, "parking_rent_month": 2979, "own_parking_share": 0.556, "mgmt_fee_per_ping": 130},
    "新北市": {"price_wan_per_ping_all": 60.36, "price_wan_per_ping_new": 71.33, "price_5yr_avg": 46.76, "price_housefeel": 60.88, "price_used_all_types_2026JanFeb_hb": 44.8, "price_new_2026JanFeb_hb": 71.9, "pir_2026q1": 12.63, "mortgage_burden_2026q1": 0.5530, "rent_591_shared_suite": 9800, "rent_591_studio": 12500, "rent_591_1room": 19999, "rent_591_2room": 25000, "rent_591_3room": 28000, "rent_official_median_2026h1": 13000, "rent_per_ping_2026": 1350, "est_total_2room_all": 1569, "est_total_2room_new": 1855, "est_total_3room_all": 2052, "est_total_3room_new": 2425, "parking_flat_price_2025": 204.3, "parking_mech_price_2025_ESTIMATE": 129, "parking_rent_month_ESTIMATE": 2500, "own_parking_share": 0.603, "mgmt_fee_per_ping": 100},
    "桃園市": {"price_wan_per_ping_all": 38.63, "price_wan_per_ping_new": 43.62, "price_5yr_avg": 30.43, "price_housefeel": 40.88, "price_used_all_types_2026JanFeb_hb": 30.7, "price_new_2026JanFeb_hb": 42.3, "pir_2026q1": 8.43, "mortgage_burden_2026q1": 0.3689, "rent_591_shared_suite": 8500, "rent_591_studio": 9500, "rent_591_1room": 16000, "rent_591_2room": 22000, "rent_591_3room": 25000, "rent_official_median_2026h1": 10000, "rent_per_ping_2026": 1056, "est_total_2room_all": 1004, "est_total_2room_new": 1134, "est_total_3room_all": 1313, "est_total_3room_new": 1483, "parking_flat_price_2025": 162.9, "parking_mech_price_2025_ESTIMATE": 109, "parking_rent_month_ESTIMATE": 2000, "own_parking_share": 0.732, "mgmt_fee_per_ping": 85},
    "台中市": {"price_wan_per_ping_all": 40.89, "price_wan_per_ping_new": 52.46, "price_5yr_avg": 31.79, "price_housefeel": 40.15, "price_used_all_types_2026JanFeb_hb": 31.7, "price_new_2026JanFeb_hb": 53.6, "pir_2026q1": 11.35, "mortgage_burden_2026q1": 0.4967, "rent_591_shared_suite": 8000, "rent_591_studio": 9466, "rent_591_1room": 15000, "rent_591_2room": 22000, "rent_591_3room": 25000, "rent_official_median_2026h1": null, "est_total_2room_all": 940, "est_total_2room_new": 1207, "est_total_3room_all": 1390, "est_total_3room_new": 1784, "parking_flat_price_2025": 165.6, "parking_mech_price_2025_ESTIMATE": 96, "parking_rent_month_ESTIMATE": 1800, "own_parking_share": 0.712, "mgmt_fee_per_ping": 85},
    "台南市": {"price_wan_per_ping_all": 32.53, "price_wan_per_ping_new": 38.56, "price_5yr_avg": 26.99, "price_housefeel": 32.40, "price_used_all_types_2026JanFeb_hb": 25.1, "price_new_2026JanFeb_hb": 39.6, "pir_2026q1": 8.76, "mortgage_burden_2026q1": 0.3833, "rent_591_shared_suite": 7000, "rent_591_studio": 7500, "rent_591_1room": 13500, "rent_591_2room": 21000, "rent_591_3room": 23287, "rent_official_median_2026h1": null, "est_total_2room_all": 748, "est_total_2room_new": 887, "est_total_3room_all": 1106, "est_total_3room_new": 1311, "verified_3room_used_tower_median_total": 1088, "parking_flat_price_2025": 155.4, "parking_mech_price_2025_ESTIMATE": 98, "parking_rent_month_ESTIMATE": 1600, "own_parking_share": 0.705, "mgmt_fee_per_ping": 65},
    "高雄市": {"price_wan_per_ping_all": 31.74, "price_wan_per_ping_new": 38.53, "price_5yr_avg": 25.26, "price_housefeel": 31.22, "price_used_all_types_2026JanFeb_hb": 24.2, "price_new_2026JanFeb_hb": 42.0, "pir_2026q1": 9.35, "mortgage_burden_2026q1": 0.4090, "rent_591_shared_suite": 7300, "rent_591_studio": 7800, "rent_591_1room": 16000, "rent_591_2room": 21000, "rent_591_3room": 24000, "rent_official_median_2026h1": null, "est_total_2room_all": 730, "est_total_2room_new": 886, "est_total_3room_all": 1079, "est_total_3room_new": 1310, "verified_3room_used_tower_median_total": 1167, "parking_flat_price_2025": 204.8, "parking_mech_price_2025_ESTIMATE": 104, "parking_rent_month_ESTIMATE": 1800, "own_parking_share": 0.69, "mgmt_fee_per_ping": 65},
    "新竹市": {"price_wan_per_ping_all": 50.73, "price_wan_per_ping_new": 62.15, "price_5yr_avg": 39.55, "price_housefeel": 56.52, "pir_2026q1": 8.43, "mortgage_burden_2026q1": 0.3688, "rent_591_shared_suite": 8000, "rent_591_studio": 9500, "rent_591_1room": 16000, "rent_591_2room": 24000, "rent_591_3room": 28950, "est_total_2room_all": 1319, "est_total_2room_new": 1616, "est_total_3room_all": 1725, "est_total_3room_new": 2113, "parking_flat_price_2025_hsinchu_area": 159.0, "parking_rent_month_ESTIMATE": 2500, "mgmt_fee_per_ping": 90},
    "新竹縣": {"price_wan_per_ping_all": 51.43, "price_wan_per_ping_new": 56.90, "price_5yr_avg": 43.38, "price_housefeel": 51.91, "pir_2026q1": 9.21, "mortgage_burden_2026q1": 0.4031, "rent_591_shared_suite": 9500, "rent_591_studio": 10000, "rent_591_1room": 20000, "rent_591_2room": 25000, "rent_591_3room": 30000, "est_total_2room_all": 1337, "est_total_2room_new": 1479, "est_total_3room_all": 1749, "est_total_3room_new": 1935, "parking_flat_price_2025_hsinchu_area": 159.0, "parking_rent_month_ESTIMATE": 2000, "mgmt_fee_per_ping": 90},
    "基隆市": {"price_wan_per_ping_all": 28.98, "price_wan_per_ping_new": 46.33, "price_5yr_avg": 25.26, "price_housefeel": 21.31, "pir_2026q1": 5.70, "mortgage_burden_2026q1": 0.2493, "rent_591_shared_suite": 7500, "rent_591_studio": 8500, "rent_591_1room": 10880, "rent_591_2room": 15000, "rent_591_3room": 15000, "rent_per_ping_2026": 909, "est_total_2room_all": 753, "est_total_2room_new": 1205, "est_total_3room_all": 985, "est_total_3room_new": 1575, "mgmt_fee_per_ping": 60},
    "宜蘭縣": {"price_wan_per_ping_all": 27.06, "price_wan_per_ping_new": 29.61, "price_5yr_avg": 24.68, "price_housefeel": 29.26, "pir_2026q1": 7.33, "mortgage_burden_2026q1": 0.3209, "rent_591_shared_suite": 7000, "rent_591_studio": 8000, "rent_591_1room": 13000, "rent_591_2room": 16000, "rent_591_3room": 18000, "est_total_2room_all": 622, "est_total_2room_new": 681, "est_total_3room_all": 920, "est_total_3room_new": 1007, "mgmt_fee_per_ping": 50},
    "苗栗縣": {"price_wan_per_ping_all": 30.80, "price_wan_per_ping_new": 34.16, "price_5yr_avg": 27.47, "price_housefeel": 31.51, "pir_2026q1": 7.64, "mortgage_burden_2026q1": 0.3346, "rent_591_shared_suite": 7500, "rent_591_studio": 7500, "rent_591_1room": 13800, "rent_591_2room": 20000, "rent_591_3room": 23000, "est_total_2room_all": 708, "est_total_2room_new": 786, "est_total_3room_all": 1047, "est_total_3room_new": 1161, "mgmt_fee_per_ping": 50},
    "彰化縣": {"price_wan_per_ping_all": 28.70, "price_wan_per_ping_new": 32.88, "price_5yr_avg": 24.75, "price_housefeel": 27.74, "pir_2026q1": 8.23, "mortgage_burden_2026q1": 0.3601, "rent_591_shared_suite": 6500, "rent_591_studio": 6800, "rent_591_1room": 12250, "rent_591_2room": 18000, "rent_591_3room": 18000, "est_total_2room_all": 660, "est_total_2room_new": 756, "est_total_3room_all": 976, "est_total_3room_new": 1118, "mgmt_fee_per_ping": 50},
    "南投縣": {"price_wan_per_ping_all": 23.81, "price_wan_per_ping_new": 28.13, "price_5yr_avg": 22.79, "price_housefeel": 23.21, "pir_2026q1": 8.47, "mortgage_burden_2026q1": 0.3708, "rent_591_shared_suite": 6100, "rent_591_studio": 6800, "rent_591_1room": null, "rent_591_2room": 18000, "rent_591_3room": 19000, "est_total_2room_all": 548, "est_total_2room_new": 647, "est_total_3room_all": 810, "est_total_3room_new": 956, "mgmt_fee_per_ping": 40},
    "雲林縣": {"price_wan_per_ping_all": 22.43, "price_wan_per_ping_new": 26.66, "price_5yr_avg": 20.56, "price_housefeel": 24.48, "pir_2026q1": 7.17, "mortgage_burden_2026q1": 0.3136, "rent_591_shared_suite": 6500, "rent_591_studio": 6500, "rent_591_1room": null, "rent_591_2room": 19000, "rent_591_3room": 19000, "est_total_2room_all": 516, "est_total_2room_new": 613, "est_total_3room_all": 763, "est_total_3room_new": 906, "mgmt_fee_per_ping": 40},
    "嘉義市": {"price_wan_per_ping_all": 25.85, "price_wan_per_ping_new": 34.65, "price_5yr_avg": 20.90, "price_housefeel": 22.03, "pir_2026q1": 7.51, "mortgage_burden_2026q1": 0.3285, "rent_591_shared_suite": 6800, "rent_591_studio": 7500, "rent_591_1room": null, "rent_591_2room": 16500, "rent_591_3room": 20000, "est_total_2room_all": 595, "est_total_2room_new": 797, "est_total_3room_all": 879, "est_total_3room_new": 1178, "mgmt_fee_per_ping": 45},
    "嘉義縣": {"price_wan_per_ping_all": 27.55, "price_wan_per_ping_new": 31.78, "price_5yr_avg": 25.33, "price_housefeel": 26.36, "pir_2026q1": 6.67, "mortgage_burden_2026q1": 0.2921, "rent_591_shared_suite": 7000, "rent_591_studio": 7500, "rent_591_1room": null, "rent_591_2room": 23000, "rent_591_3room": 23800, "est_total_2room_all": 634, "est_total_2room_new": 731, "est_total_3room_all": 937, "est_total_3room_new": 1081, "mgmt_fee_per_ping": 40},
    "屏東縣": {"price_wan_per_ping_all": 21.86, "price_wan_per_ping_new": 26.29, "price_5yr_avg": 19.29, "price_housefeel": 18.28, "pir_2026q1": 7.08, "mortgage_burden_2026q1": 0.3098, "rent_591_shared_suite": 6000, "rent_591_studio": 6500, "rent_591_1room": 11750, "rent_591_2room": 17500, "rent_591_3room": 17500, "est_total_2room_all": 503, "est_total_2room_new": 605, "est_total_3room_all": 743, "est_total_3room_new": 894, "mgmt_fee_per_ping": 40},
    "花蓮縣": {"price_wan_per_ping_all": 23.35, "price_wan_per_ping_new": 27.39, "price_5yr_avg": 23.26, "price_housefeel": 24.39, "pir_2026q1": 8.31, "mortgage_burden_2026q1": 0.3638, "rent_591_shared_suite": 6500, "rent_591_studio": 7000, "rent_591_1room": 12000, "rent_591_2room": 17000, "rent_591_3room": 18000, "est_total_2room_all": 537, "est_total_2room_new": 630, "est_total_3room_all": 794, "est_total_3room_new": 931, "mgmt_fee_per_ping": 40},
    "台東縣": {"price_wan_per_ping_all": 20.95, "price_wan_per_ping_new": 29.10, "price_5yr_avg": 19.60, "price_housefeel": 24.05, "pir_2026q1": 8.15, "mortgage_burden_2026q1": 0.3566, "rent_591_shared_suite": 6500, "rent_591_studio": 7000, "rent_591_2room_ESTIMATE": 15000, "rent_591_3room_ESTIMATE": 17000, "est_total_2room_all": 482, "est_total_2room_new": 669, "est_total_3room_all": 712, "est_total_3room_new": 989, "mgmt_fee_per_ping": 40},
    "澎湖縣": {"price_wan_per_ping_all": 19.44, "price_wan_per_ping_new_UNRELIABLE": 35.23, "price_housefeel": 15.96, "sample_size_year": 63, "pir_2026q1": 8.05, "mortgage_burden_2026q1": 0.3522, "rent_studio_ESTIMATE": 7500, "rent_2room_ESTIMATE": 15000, "rent_3room_ESTIMATE": 17000, "est_total_2room_all": 447, "est_total_3room_all": 661, "mgmt_fee_per_ping": 30},
    "金門縣": {"price_wan_per_ping_all": 24.64, "price_wan_per_ping_new": 24.63, "price_housefeel": 22.89, "pir_2026q1": 8.38, "mortgage_burden_2026q1": 0.3668, "rent_studio_ESTIMATE": 5500, "rent_2room_ESTIMATE": 14000, "rent_3room_ESTIMATE": 16000, "est_total_2room_all": 567, "est_total_3room_all": 838, "mgmt_fee_per_ping": 30},
    "連江縣": {"price_wan_per_ping_all_UNRELIABLE_n1": 30.53, "price_housefeel_UNRELIABLE": 10.5, "price_ESTIMATE_use": 24.0, "pir_2026q1": null, "pir_ESTIMATE_proxy_kinmen": 8.4, "rent_studio_ESTIMATE": 5500, "rent_2room_ESTIMATE": 14000, "rent_3room_ESTIMATE": 16000, "mgmt_fee_per_ping": 30}
  },
  "district_multipliers_vs_city_leju": {
    "台北市": {"大安": 1.29, "信義": 1.09, "北投": 0.92, "文山": 0.86, "萬華": 0.80, "內湖": 0.80, "note": "older-stock datasets show 大安/北投 ≈ 1.8x"},
    "新北市": {"永和": 1.34, "板橋": 1.27, "新莊": 1.04, "林口": 0.92, "三峽": 0.73, "淡水": 0.61},
    "台中市": {"南屯": 1.28, "西屯": 1.23, "太平": 0.84, "大里": 0.80},
    "高雄市": {"鼓山": 1.27, "苓雅": 1.04, "左營": 1.03, "楠梓": 1.00, "鳳山": 0.87},
    "桃園市": {"桃園區": 1.14, "中壢": 1.08, "八德": 0.92},
    "台南市": {"東區": 1.31, "永康": 0.93, "安平": 0.84},
    "新竹縣": {"竹北": 1.23}
  },
  "ownership_costs": {
    "mgmt_fee_per_ping_ranges_2024": {"台北": [120, 160], "新北": [90, 120], "台中": [80, 120], "桃園": [70, 100], "台南高雄": [60, 80]},
    "house_tax_self_use_rate": {"single_self_use": 0.01, "general_self_use": 0.012},
    "house_tax_annual_ESTIMATE": {"new_tower": [8000, 15000], "old_walkup": [1000, 3000]},
    "land_tax_self_use_rate": 0.002,
    "land_tax_annual_ESTIMATE": {"雙北": [1000, 3000], "others": [300, 1500]},
    "renovation_wan_per_ping": {"new_light": [5, 8], "new_typical": [6, 8], "new_designed": [8, 15], "used": [8, 12], "old_full": [12, 22]},
    "buyer_agent_fee_pct": [0.01, 0.02],
    "seller_agent_fee_pct": [0.03, 0.04],
    "agent_fee_legal_cap_total_pct": 0.06,
    "scrivener_fee_ntd": [8000, 30000],
    "deed_tax": "6% of 房屋評定現值",
    "stamp_tax_pct": 0.001,
    "registration_fee_pct": 0.001,
    "fire_quake_insurance_annual_ntd": [2000, 8000],
    "buyer_closing_costs_pct_excl_renovation_ESTIMATE": [0.02, 0.03]
  },
  "mortgage": {
    "first_time_buyer_ltv_typical": 0.8,
    "second_home_ltv_since_2026_09_18": 0.7,
    "second_home_ltv_history": {"2024-09-20": 0.5, "2026-03-20": 0.6, "2026-09-18": 0.7},
    "third_plus_home_ltv": 0.3,
    "corporate_ltv": 0.3,
    "luxury_ltv": 0.3,
    "luxury_thresholds_wan": {"台北": 7000, "新北": 6000, "others": 4000},
    "grace_period_allowed_if_already_own_home": false,
    "qingan_3_0": {"effective": "2026-08-01", "ltv": 0.8, "max_term_years": 40, "grace_years": 5, "loan_cap_wan": {"base": 1000, "newlywed": 1200, "with_children": 1500}, "price_cap_wan": {"台北": 3500, "新北_新竹": 2500, "others": 2000}, "income_cap_wan_individual": 200, "age_limit_lt": 50, "age_plus_term_max": 80, "rates": {"y1_3": 0.01775, "y4": 0.019, "y5": 0.02025, "y6": 0.0215, "y7_plus": 0.02275}},
    "market_rate_5banks": {"2024Q4": 0.02211, "2025Q1": 0.02249},
    "typical_term_years_ESTIMATE": {"bank": 30, "qingan": 40},
    "moi_affordability_formula": {"ltv": 0.7, "term_years": 20}
  },
  "history": {
    "pir_national_moi": {"2002": 4.26, "2005": 4.97, "2010": 7.11, "2015": 8.51, "2020": 9.20, "2024": 10.76, "2024Q3_peak": 10.82, "2025Q4": 9.32, "2026Q1": 9.47},
    "mortgage_burden_national_moi": {"2002": 0.2234, "2005": 0.2170, "2010": 0.2934, "2015": 0.3581, "2020": 0.3681, "2024": 0.4662, "2026Q1": 0.4146},
    "pir_taipei": {"2002": 6.01, "2005_ESTIMATE": 7.2, "2010_ESTIMATE": 11.5, "2012Q3": 14.0, "2014": 14.94, "2015_ESTIMATE": 15.0, "2018Q1": 15.00, "2020Q3": 13.94, "2023Q2": 15.52, "2024Q4": 16.43, "2026Q1": 14.72},
    "pir_newtaipei": {"2002": 6.15, "2005_ESTIMATE": 7.0, "2010_ESTIMATE": 9.0, "2014Q1": 12.4, "2015_ESTIMATE": 12.5, "2018Q1": 12.75, "2020Q3": 11.71, "2023Q2": 12.93, "2026Q1": 12.63},
    "pir_taichung": {"2005_ESTIMATE": 5.0, "2010_ESTIMATE": 6.5, "2014Q1": 7.47, "2015_ESTIMATE": 8.0, "2018Q1": 9.58, "2020_ESTIMATE": 9.5, "2023Q2": 11.55, "2026Q1": 11.35},
    "pir_kaohsiung": {"2005_ESTIMATE": 5.0, "2010_ESTIMATE": 6.0, "2015_ESTIMATE": 7.8, "2018Q1": 8.16, "2020_ESTIMATE": 8.5, "2023Q2": 9.23, "2026Q1": 9.35},
    "sinyi_index": {
      "2005Q4": {"台北": 49.16, "新北": 47.47, "桃園": 48.53, "新竹": 53.75, "台中": 49.48, "高雄": 44.91, "全台": 48.16},
      "2010Q4": {"台北": 87.19, "新北": 73.31, "桃園": 67.68, "新竹": 72.16, "台中": 71.69, "高雄": 60.71, "全台": 75.41},
      "2015Q4": {"台北": 100.96, "新北": 102.15, "桃園": 103.03, "新竹": 103.06, "台中": 105.95, "高雄": 100.85, "全台": 102.35},
      "2020Q4": {"台北": 109.99, "新北": 113.57, "桃園": 118.78, "新竹": 129.06, "台中": 125.98, "台南": 129.62, "高雄": 120.62, "全台": 115.16},
      "2026Q2": {"台北": 144.48, "新北": 158.17, "桃園": 186.46, "新竹": 248.67, "台中": 183.64, "台南": 202.86, "高雄": 168.97, "全台": 168.77}
    }
  },
  "typical_sizes": {
    "most_traded_2025": {"2room_north_ping": [25, 28], "2room_central_south_ping": [21, 24], "3room_ping": [33, 36], "taipei_top": "1房 <14坪"},
    "avg_transaction_area_2025Q2": {"national": 31.52, "台北": 27.27, "新北": 27.70, "台中": 30.72, "台南": 36.61, "高雄": 31.87},
    "common_area_ratio_2025_new": {"台北": 0.357, "新北": 0.347},
    "common_area_ratio_by_type": {"walkup": [0.08, 0.15], "midrise_7_10F": [0.15, 0.25], "tower_11F_plus": [0.32, 0.36], "small_lot_tower": [0.38, 0.45]}
  },
  "social_housing_and_subsidy": {
    "rent_subsidy_contracts_2026h1": 833000,
    "rent_subsidy_median_coverage": 0.41,
    "taipei_2room_social_rent_ESTIMATE": [15000, 22000],
    "social_housing_share_of_stock_ESTIMATE": "<1% (UNVERIFIED)",
    "allocation_odds_ESTIMATE": "low (lottery), 1-5% of renting households (UNVERIFIED)"
  }
}
```
