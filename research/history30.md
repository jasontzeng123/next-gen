# 時光機 data: raising a child in 1996 vs today (Taiwan)

Compiled 2026-10-11 for「你有資格生下一代嗎？」. This file is research only; no game files were changed.

## How to read this file

**Labels**
- **OFFICIAL:** the number comes from a government table or release, read directly.
- **SECONDARY:** an official number quoted by a news outlet, a reprint or Wikipedia.
- **DERIVED:** arithmetic on OFFICIAL or SECONDARY numbers (rebasing, deflating, compounding). The method is stated each time.
- **ESTIMATE:** a judgement call. The reasoning is given each time. Do not present these as official.

**Access limits this session**
- The proxy blocks direct downloads from `ws.dgbas.gov.tw` (robots), `statis.moi.gov.tw`, `ris.gov.tw`, `pip.moi.gov.tw` and `data.gov.tw`.
- This blocked the official DGBAS xls files `cpispl.xls` and `cpisplrent.xls`.
- Workarounds:
  - Wages: the MOL yearbook Table 1-1, which reproduces the DGBAS series.
  - CPI: local-government and agency PDFs that reprint the DGBAS annual CPI.
  - Births and TFR: Wikipedia and news reports of 內政部 data, cross-checked against a 內政部戶政司 table reprinted by 新北市.

---

## 0. Headline comparison (for the game's "30 years ago" screen)

| Item | 1996 | Latest | Multiple | Label |
|---|---|---|---|---|
| CPI (2021=100) | 78.72 | 109.60 (2025) | ×1.39 | DERIVED from OFFICIAL |
| Avg monthly total earnings (nominal) | 36,655 | 63,383 (2025) | ×1.73 | OFFICIAL |
| Avg monthly regular earnings (nominal) | 29,722 | 47,885 (2025) | ×1.61 | OFFICIAL |
| Real total earnings (2021 prices) | 46,564 | 57,831 (2025) | ×1.24 | DERIVED |
| Real regular earnings (2021 prices) | 37,757 | 43,691 (2025) | ×1.16 | DERIVED |
| 台北 house price (Sinyi base) | ≈37.3 (1995) | 144.48 (2026Q2) | ≈×3.9 | ESTIMATE chain |
| 全台 house price (Sinyi base) | ≈46 (range 40–52) | 168.77 (2026Q2) | ≈×3.7 (range 3.2–4.2) | ESTIMATE |
| CPI rent index (2021=100) | ≈91.5 | 108.88 (2025) | ≈×1.19 | ESTIMATE / DERIVED |
| Births (registered) | 325,545 | 107,812 (2025) | ×0.33 | SECONDARY (內政部) |
| Total fertility rate | 1.760 | 0.695 (2025) | ×0.39 | SECONDARY (內政部) |
| 房價所得比, 台北 | ≈6 (range 5.3–6.7) | 14.72 (2026Q1) | ≈×2.5 | ESTIMATE / OFFICIAL |
| 房價所得比, 全國 | ≈4.5 (range 3.7–5.5) | 9.47 (2026Q1) | ≈×2.1 | ESTIMATE / OFFICIAL |

**Game-friendly framing (ESTIMATE)**
- **1995:** a 30-坪 Taipei home cost about 22.9萬/坪 × 30 = 687萬. That is about **15.6 years** of one average earner's total pay (36,655 × 12 = 44.0萬 a year).
- **2026Q2:** the same constant-quality home costs about 22.9 × 3.87 ≈ 88.6萬/坪, or 2,658萬 for 30 坪. That is about **35 years** of 2025 average pay (63,383 × 12 = 76.1萬 a year).
- **Cross-check:** 88.6萬/坪 sits between 住商's 2026 中古屋 average (96萬) and Leju's 大樓 average (107萬) in `housing.md`. It is lower because the chain is constant-quality.

---

## 1. 信義房價指數 (Sinyi housing price index)

**Source:** https://www.sinyinews.com.tw/quarterly, table「信義房價季指數：全台都會區季指數」, read 2026-10-11.

**Base and coverage**
- **Base:** 2016 Q1 = 100, stated on the page ("基期：2016年第一季").
- **Coverage:** the table starts at **2001/Q1**. It has no 1991–2000 rows, and the year selector starts at 2001.
- **台南:** "自2019年第一季起增列台南市指數", so 台南 starts at **2019Q1** (105.27).

**Methodology notes from the page**
- Hedonic model built with 政大商學院 from 2009.
- Laspeyres formula since 2012Q4, when 桃園 and 新竹 were added.
- A 2022 revision moved the base to 2016Q1, updated the standard house to 2021 transactions, and revised history back to 2001.
- Covers 公寓, 華廈 and 大樓 only. Excludes presales, industrial-residential and old-building transactions.

**Base check:** this is the current published base. All 5 reference values match: 台北 2005Q4 = 49.16, 2015Q4 = 100.96, 2026Q2 = 144.48; 全台 2005Q4 = 48.16, 2026Q2 = 168.77.

### 1a. Q4 values (OFFICIAL)

| Quarter | 台北 | 新北 | 桃園 | 新竹 | 台中 | 台南 | 高雄 | 全台 |
|---|---|---|---|---|---|---|---|---|
| 2001Q1 (first) | 36.85 | 34.82 | 35.09 | 48.24 | 35.97 | — | 40.31 | 36.47 |
| **2001Q4** | 34.81 | 33.75 | 37.96 | 46.88 | 33.61 | — | 39.44 | 35.15 |
| **2006Q4** | 56.45 | 52.77 | 50.39 | 58.83 | 52.74 | — | 46.45 | 53.66 |
| **2011Q4** | 92.75 | 82.02 | 81.90 | 78.76 | 81.28 | — | 68.06 | 82.77 |
| **2016Q4** | 99.86 | 101.00 | 102.78 | 102.39 | 103.46 | — | 97.30 | 101.04 |
| **2021Q4** | 119.68 | 125.87 | 141.74 | 167.43 | 149.30 | 162.73 | 134.94 | 132.00 |
| **2025Q4** | 140.69 | 157.11 | 186.07 | 242.57 | 186.93 | 189.56 | 173.15 | 163.25 |
| 2026Q1 | 142.20 | 161.63 | 189.55 | 246.57 | 186.26 | 184.06 | 171.25 | 167.53 |
| **2026Q2 (latest)** | 144.48 | 158.17 | 186.46 | 248.67 | 183.64 | 202.86 | 168.97 | 168.77 |

### 1b. Annual averages of the 4 quarters (DERIVED)

Single quarters are noisy. For example, 高雄 2016Q3 is 103.64 but 2016Q4 is 97.30, and 台南 swings ±10 between quarters. Annual averages are safer for the game.

| Year | 台北 | 新北 | 桃園 | 新竹 | 台中 | 台南 | 高雄 | 全台 |
|---|---|---|---|---|---|---|---|---|
| 2001 | 35.42 | 34.25 | 36.73 | 47.43 | 35.20 | — | 38.87 | 35.79 |
| 2006 | 53.73 | 50.38 | 50.77 | 58.18 | 50.57 | — | 49.26 | 51.06 |
| 2011 | 90.68 | 79.95 | 76.84 | 77.63 | 78.94 | — | 66.85 | 80.84 |
| 2016 | 100.29 | 101.78 | 101.23 | 101.47 | 102.58 | — | 100.48 | 101.20 |
| 2021 | 115.79 | 120.03 | 131.34 | 148.09 | 140.06 | 148.34 | 125.95 | 124.75 |
| 2025 | 139.77 | 159.03 | 188.72 | 244.77 | 190.68 | 198.13 | 174.18 | 166.20 |
| 2026H1 | 143.34 | 159.90 | 188.00 | 247.62 | 184.95 | 193.46 | 170.11 | 168.15 |

**Nominal multiples, 2001Q4 → 2025Q4 (DERIVED):** 台北 ×4.04, 全台 ×4.64, 新北 ×4.66, 桃園 ×4.90, 新竹 ×5.17, 台中 ×5.56, 高雄 ×4.39.

**台南 before 2019:** there is no Sinyi series. Proxy it with 高雄 or 全台, or use the 1995 per-坪 data in §2.

---

## 2. Going back to 1996: alternative series and how to chain

**Why the Sinyi series cannot simply be extended**
- Sinyi did compile an index from 1991. Lin et al. (2019, 南臺學報 4(1)) list Sinyi "1991–, base 2001Q1" and Cathay (國泰) "1992Q1–, base 2001". Source: https://journal.stust.edu.tw/Sysid/journal/files/attachfile/guid/s_17503_13402941-bf85-493a-8bc6-6b74165a4a96/01_B0311林靖中.pdf
- The pre-2009 Sinyi index was a different, non-hedonic method. It cannot be spliced proportionally:
  - Old-index 全台 2008Q2 was 115.39 (CBC 2008 Financial Stability Report: https://www.cbc.gov.tw/tw/public/Attachment/93189275071.pdf). The current base gives 59.72, a ratio of 1.93.
  - Old-index 2009Q4 was 151.7 (CBC 2010 FSR: https://www.cbc.gov.tw/en/public/Attachment/0111510544171.pdf). The current base gives 65.10, a ratio of 2.33.
  - The ratio drifts, so the old and current series differ in method, not just in scale.
- I found no published 1990s values of the old Sinyi index or of the Cathay index.

### 2a. Usable anchor: Sinyi average transaction price per 坪, 1995 vs 2014 (SECONDARY)

**Source:** Taipei Times, "Taipei house prices nearly triple in 20 years: realtor", 2015-06-14, citing a 信義房屋 research report: https://www.taipeitimes.com/News/biz/archives/2015/06/14/2003620627. The 2014 Taipei 67.9萬/坪 is confirmed by the 2015 台灣地區房地產年鑑, Taipei chapter (Sinyi data): https://www.ncscre.nccu.edu.tw/sites/default/files/2015_2-3.pdf

| Area | 1995 (萬/坪) | 2014 (萬/坪) | Change | 1995 value |
|---|---|---|---|---|
| 台北 | 22.9 | 67.9 | +196.5% | stated |
| 新北 | 15.0 | 36.8 | +145.3% | stated |
| 桃園 | ≈10.7 | 19.3 | +80.3% | derived |
| 台中 | ≈10.3 | 19.5 | +89.3% | derived |
| 台南 | ≈8.9 | 13.3 | +49.4% | derived |
| 高雄 | ≈11.2 | 16.5 | +47.3% | derived |

The same almanac says the average Taipei 中古屋 total price in 2014 was 2,188萬, "+182% over 20 years". That implies about 776萬 around 1994 (DERIVED).

### 2b. Chain to the current Sinyi base (ESTIMATE)

**Method:** idx_1995 = (2014 annual average Sinyi index) ÷ (1 + %change 1995→2014).

| Area | Implied 1995 index | ÷ 2001 annual avg | 2026Q2 ÷ 1995 |
|---|---|---|---|
| 台北 | **37.3** | ×1.05 | ×3.87 |
| 新北 | **44.0** | ×1.29 | ×3.59 |
| 桃園 | **60.3** | ×1.64 | ×3.09 |
| 台中 | **55.9** | ×1.59 | ×3.29 |
| 高雄 | **66.4** | ×1.71 | ×2.55 |

**Caveats**
- Per-坪 averages are not quality-adjusted, and housing-stock mix and age shift over 19 years. The chain is therefore much more reliable for 台北 than for other cities.
- The implied falls between 1995 and 2001 outside Taipei (−37% to −42%) look large. They are directionally consistent with the late-1990s slump (oversupply, the 1999 921 quake in 台中, the 2001 recession), but treat them as upper bounds.
- **1996 vs 1995:** use 1995 as a proxy for 1996. Prices were flat to slightly down in 1996.

**Recommended 1996 values on the current Sinyi base (ESTIMATE)**

| Area | Recommended | Range | Note |
|---|---|---|---|
| 台北 | **37** | 35–39 | |
| 新北 | **42** | 38–46 | |
| 桃園 | **52** | 45–60 | |
| 新竹 | **52** | 47–58 | No 1995 data. 2001Q1 was 48.24, and 新竹 was booming in the late 1990s. |
| 台中 | **50** | 45–56 | |
| 台南 | — | — | Use per-坪 ≈8.9萬 for 1995, or proxy with 高雄. |
| 高雄 | **58** | 50–66 | |
| 全台 | **46** | 40–52 | Transaction-weighted blend of the city ratios. 雙北 is weighted heavily, and the non-Taipei ratios are shaded down for the per-坪 bias. |

---

## 3. CPI (消費者物價指數), DGBAS

### 3a. Headline CPI, annual average, base 2021 (民國110年) = 100

| Year | Index | Label and source |
|---|---|---|
| 1996 | **78.72** | DERIVED: 86.31 (2011=100, OFFICIAL) × 0.9121. Chaining back from 2006 with the official YoY rates also gives 78.72. |
| 2001 | **81.92** | DERIVED: 89.82 (2011=100) × 0.9121. |
| 2006 | **85.26** | OFFICIAL |
| 2011 | **91.21** | OFFICIAL |
| 2016 | **95.86** | OFFICIAL |
| 2021 | **100.00** | OFFICIAL |
| 2022 | 102.95 | OFFICIAL |
| 2023 | 105.51 | OFFICIAL |
| 2024 | **107.81** | DERIVED: 105.51 × 1.0218 |
| 2025 | **109.60** | DERIVED: × 1.0166 |
| 2026 YTD (Jan–Sep) | ≈111.7 | DERIVED: Jan–Sep 2026 is +1.94% YoY. Sep 2026 alone is +2.73% YoY. Jan–Jul 2026 implied by DGBAS real wages is 111.20. |

**Sources**
- **2011-base long series, 1959–2012** (Appendix 2 of 臺中市物價統計月報, Feb 2013, reprinting the DGBAS 臺灣地區 series): https://www.dbas.taichung.gov.tw/media/155785/3321146228.pdf. Values: 1996 86.31, 2001 89.82, 2006 93.48, 2011 100.00.
- **2021-base, 2003–2023** (DGBAS 消費者物價總指數 table reprinted by 宜蘭縣醫師公會): https://yilandoctor.org.tw/web/images/ckfinder/files/20241226165842.pdf
  - 2003 81.53, 2004 82.84, 2005 84.75, 2006 85.26, 2007 86.79, 2008 89.86, 2009 89.07, 2010 89.93
  - 2011 91.21, 2012 92.97, 2013 93.71, 2014 94.83, 2015 94.54, 2016 95.86, 2017 96.45, 2018 97.76, 2019 98.30, 2020 98.07
  - 2021 100.00, 2022 102.95, 2023 105.51
- **YoY 1996–2025** (OFFICIAL, MOL 勞動統計年報 Table 1-1, https://statdb.mol.gov.tw/html/year/year14/31010.pdf): 1996 3.08, 1997 0.90, 1998 1.69, 1999 0.17, 2000 1.25, 2001 0.00 (printed as "－"), 2002 −0.20, 2003 −0.28, 2004 1.61, 2005 2.31, 2006 0.60, 2007 1.79, 2008 3.54, 2009 −0.88, 2010 0.97, 2011 1.42, 2012 1.93, 2013 0.80, 2014 1.20, 2015 −0.31, 2016 1.40, 2017 0.62, 2018 1.36, 2019 0.55, 2020 −0.23, 2021 1.97, 2022 2.95, 2023 2.49, 2024 2.18, 2025 1.66.
- **1996=100 cross-check** (衛生署 table): 2001 = 104.06, matching 81.92 ÷ 78.72 = 1.0407. https://data.nhi.gov.tw/ch/dl-16570-4cb78cd9c5f84659945aed9450b16ec5-1.pdf
- **2026:** DGBAS 115年9月 price release, https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236759 (2026-10-07).

### 3b. CPI rent sub-index (房租類指數), annual average, 2021=100

The official long series (`cpisplrent.xls`, listed at https://www.stat.gov.tw/cp.aspx?n=2665) could not be downloaded. Pre-2022 levels are **ESTIMATES** built from the verified anchors below.

| Year | Rent index | Label |
|---|---|---|
| 1996 | **≈91.5** | ESTIMATE ±2 |
| 2001 | **≈94.5** | ESTIMATE ±1.5 |
| 2006 | **≈92.0** | ESTIMATE ±1.5 |
| 2011 | **≈93.4** | ESTIMATE ±1 |
| 2016 | **≈95.7** | ESTIMATE ±0.5 |
| 2021 | 100.00 | base |
| 2022 | 101.68 | DERIVED: 103.88 ÷ 1.0216 |
| 2023 | **103.88** | SECONDARY (DGBAS via 鉅亨網) |
| 2024 | 106.43 | DERIVED: +2.45% |
| 2025 | **108.88** | DERIVED: +2.30% |
| 2026 H1 | ≈110.9 | ESTIMATE: H1 average +1.85% YoY |

**Anchors (all cite DGBAS)**
- **2023 = 103.88** (2021=100), +2.16%, then the fastest in 27 years: https://news.cnyes.com/news/id/5426320
- **2024 +2.45%, 2025 +2.3%:** the last time annual growth topped 2% was 1996. https://www.ctee.com.tw/news/20260108701438-430601
- **Nov 2025 = 109.67** (new high): https://www.ctee.com.tw/news/20251221700304-430503
- **2026 H1 average growth +1.85%:** https://www.sinyi.com.tw/expertise/corporate-views/96
- **On 2016=100** (理財周刊, 2022-05-13, https://www.moneyweekly.com.tw/_Article?AID=81639):
  - 1981 = 60.
  - "around 2000 the index nearly reached 100".
  - Rents fell after 2000 and then consolidated.
  - April 2022 = 105.70.
- **Oct 2022 = 106.89** (2016=100): https://www.moneyweekly.com.tw/_Article?AID=93714
- **2008Q1 → 2021Q4:** +9.2% (2008Q1=100 → 109.2), average 0.64% a year. NTU thesis 李祖福 2022: https://tdr.lib.ntu.edu.tw/handle/123456789/85619

**How the estimates were built**
- **Base link:** the 2022 average on the 2016 base is about 106.2 (from April 105.70 and October 106.89). On the 2021 base it is 101.68, so the link factor is about 1.0445. That makes 2016 ≈ 95.7 and 2021 ≈ 104.45 on the 2016 base.
- **2008 and 2011:** compounding back 0.64% a year gives 2008 ≈ 92.0, and interpolation gives 2011 ≈ 93.4.
- **2000:** "nearly 100" on the 2016 base, which is about 94.5–95 on the 2021 base.
- **Early 2000s:** the Taipei rent index (below) fell 4.5% from 2001 to 2004, so 2006 ≈ 92.
- **1996:** Taipei rent rose 3.4% from 1996 to 2000, so 1996 ≈ 91.5.

**Taipei City rent index (OFFICIAL, 臺北市主計處 weekly bulletins)**

| Base | Values | Source |
|---|---|---|
| 1996=100 | 1997 101.64, 1998 103.26, 1999 103.32, 2000 103.40, **2001 102.68** | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/7951117/62c6289b-480a-4808-89b5-2eff1f4ade3e.pdf |
| 2001=100 | 1999 100.62, 2000 100.70, 2002 98.22, 2003 96.66, **2004 95.53** | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/7951278/7b9ce059-d4d4-45aa-8456-30e301b91e27.pdf |
| 2011=100 | 2009 99.55, 2010 99.62, 2012 100.67, 2013 101.39, 2014 102.15 | https://www-ws.gov.taipei/001/Upload/367/relfile/48648/8017291/ec2b756d-9844-4456-8b4c-76652b9f51d3.pdf |

**Takeaway for the game:** over 1996–2025, official CPI rent rose only about +19% while CPI rose +39% and house prices about +270–290%. The NTU thesis argues the official rent index understates market rent growth by about 2.9 percentage points a year, based on 591 data for 2008–2021.

---

## 4. Wages: 工業及服務業受僱員工每人每月薪資 (DGBAS 薪資與生產力統計)

**Source:** MOL 勞動統計年報 2025 edition, 表1-1 主要經濟指標, columns「工業及服務業 每月總薪資 / 每月經常性薪資」(original source DGBAS), https://statdb.mol.gov.tw/html/year/year14/31010.pdf.

**Series notes**
- This is the current revised series. It includes later scope revisions: education support services added from 2009-01; R&D, pre-primary education and social work added from 2019-01.
- It differs slightly from the figures first published each year. Examples: 2016 was first published as 48,790 and is now 49,257; 2025 was published as 63,386 (760,632 ÷ 12) and is now 63,383.
- **Year alignment check:** the minimum-wage column in the same table matches the known history (2007 17,280; 2013 19,047; 2025 28,590).

**Real values (DERIVED):** nominal ÷ CPI (2021=100) × 100. This matches DGBAS's method: 2025 real total +2.21% = 1.0391 ÷ 1.0166, per https://finance.technews.tw/2026/02/11/2025-salary-47884ntd/

| Year | Total 總薪資 (nominal) | Regular 經常性薪資 (nominal) | Real total (2021 NT$) | Real regular (2021 NT$) | Minimum wage (month) |
|---|---|---|---|---|---|
| 1996 | **36,655** | **29,722** | 46,564 | 37,757 | 15,360 |
| 2001 | **41,952** | **34,480** | 51,211 | 42,090 | 15,840 |
| 2006 | **43,492** | **35,725** | 51,011 | 41,901 | 15,840 |
| 2011 | **45,963** | **36,737** | 50,393 | 40,277 | 17,880 |
| 2016 | **49,257** | **39,217** | 51,384 | 40,911 | 20,008 |
| 2021 | **56,127** | **43,045** | 56,127 | 43,045 | 24,000 |
| 2024 | 61,002 | 46,450 | 56,583 | 43,085 | 27,470 |
| 2025 | **63,383** | **47,885** | 57,831 | 43,691 | 28,590 |
| 2026 Jan–Jul | 483,077 cumulative over 7 months (≈69,011/month, inflated by Lunar New Year bonuses; not comparable with annual averages) | **49,054** (+2.94%) | real total +2.33% YoY | **44,113** (OFFICIAL, +1.12%) | 29,500 |

**Full 1996–2025 annual series (OFFICIAL)**

| Years | Total earnings | Regular earnings |
|---|---|---|
| 1996–2000 | 36,655, 38,435, 39,603, 40,781, 41,831 | 29,722, 30,930, 31,928, 33,019, 33,926 |
| 2001–2005 | 41,952, 41,533, 42,068, 42,684, 43,162 | 34,480, 34,746, 34,804, 35,096, 35,382 |
| 2006–2010 | 43,492, 44,411, 44,419, 42,300, 44,647 | 35,725, 36,318, 36,384, 35,624, 36,234 |
| 2011–2015 | 45,963, 46,075, 46,087, 47,744, 48,956 | 36,737, 37,195, 37,557, 38,220, 38,717 |
| 2016–2020 | 49,257, 50,634, 52,468, 53,551, 54,278 | 39,217, 39,937, 40,949, 41,700, 42,281 |
| 2021–2025 | 56,127, 58,042, 58,420, 61,002, 63,383 | 43,045, 44,210, 45,197, 46,450, 47,885 |

**Sources for 2025–2026**
- DGBAS 114年 release: https://www.stat.gov.tw/News_Content.aspx?n=2724&s=235863
- Jan–Jul 2026 (DGBAS via UDN, 2026-09-14): https://udn.com/news/story/6656/9754045
- Real total +2.33% (今周刊, 2026-09-15): https://www.businesstoday.com.tw/article/category/183030/post/202609150024/

**Note:** the same MOL page also has a manufacturing column (1996 33,839 → 2025 69,390). Do not mix it up with the industry-and-services column above.

**Observation:** real regular pay was about 42,000 in 2001 and still about 40,900 in 2016, roughly 15 flat years. Real total pay was about 51,000 from 2001 to 2016.

---

## 5. Births and total fertility rate (內政部)

| Year | Births (registered, 按登記) | TFR | Births by occurrence date (按發生) |
|---|---|---|---|
| 1996 | **325,545** | **1.760** | 324,317 |
| 2001 | **260,354** | **1.400** | 257,866 |
| 2006 | **204,459** | **1.115** | 205,720 |
| 2011 | **196,627** | **1.065** | 198,348 |
| 2016 | **208,440** | **1.170** | 207,600 |
| 2021 | **153,820** | **0.975** | — |
| 2022 | 138,986 | 0.870 | — |
| 2023 | 135,571 | 0.865 | — |
| 2024 | **134,856** | **0.885** | — |
| 2025 | **107,812** | **0.695** | — |
| 2026 Jan–Aug | **61,742** (≈11,000 fewer than Jan–Aug 2025's ≈72,800) | n/a | — |

**Sources**
- **Registered births, 1996–2025, and TFR to 2 decimals:** Wikipedia "Demographics of Taiwan" vital-statistics table, citing 主計總處/內政部 (SECONDARY): https://en.wikipedia.org/wiki/Demographics_of_Taiwan
- **Occurrence-based births and TFR in ‰ for 1996–2016:** 新北市民政局 analysis reprinting 內政部戶政司 表三 (2017-08): https://www.ca.ntpc.gov.tw/userfiles/1010800/files/(106%E5%B9%B48%E6%9C%88)%E6%88%91%E5%9C%8B%E5%87%BA%E7%94%9F%E7%8E%87%E5%8F%8A%E5%A9%A6%E5%A5%B3%E7%94%9F%E8%82%B2%E8%AE%8A%E5%8C%96%E8%B6%A8%E5%8B%A2%E5%88%86%E6%9E%90.pdf
  - TFR values: 1,760‰, 1,400‰, 1,115‰, 1,065‰, 1,170‰.
  - The same document's text and figure give 1.176 for 2016. Wikipedia rounds to 1.17.
- **2022–2025 births and TFR:** 自由時報 2026-04-05, citing 內政部: https://ec.ltn.com.tw/article/breakingnews/5393039
- **2024 TFR 0.885:** also on the 行政院 國情簡介 page, https://www.ey.gov.tw/state/99B2E89521FC31E1/d815e8d3-84e2-4395-8db3-fd80e3aea8b6. That page prints births as 134,865, which looks like a typo for 134,856.
- **2021 TFR 0.975:** from my knowledge of the 內政部 figure; Wikipedia shows 0.98. **Not directly verified this session.**
- **2026 Jan–Aug:** 今周刊 2026-09-10 (內政部 戶籍統計): https://www.businesstoday.com.tw/article/category/183027/post/202609100018/
  - August 2026: 7,492 births. Jan–Jul: 54,250.

**2026 full year:** ESTIMATE ≈ 93,000 (Jan–Aug × 12/8), the first year below 100,000.

---

## 6. 房價所得比 (house price ÷ household disposable income)

### 6a. 內政部 房價負擔能力指標 (official series from 2002)

**Definition:** median house price ÷ median household annual disposable income.

**Method break:** through 2012Q2 the price data came from 聯徵中心 appraisals. From 2012Q3 it uses 實價登錄. The pre-2012 levels (especially 台北) are therefore not fully comparable with today's.

| Period | 全國 | 台北市 | 新北市 |
|---|---|---|---|
| 2002 | **4.26** (2002Q4) | **6.01** (2002, period not stated) | **6.15** (2002) |
| 2006Q4 | **4.97** | ESTIMATE ≈7.3 (7.0–7.8) | ESTIMATE ≈7.0 |
| 2011Q4 | **7.29** | ESTIMATE ≈12 (11–13) | ESTIMATE ≈9.5 |
| 2016Q4 | **9.32** | **15.18** | **12.61** |
| 2021Q4 | **9.46** | **16.29** (record at the time) | 12.13 (2021, quarter unclear) |
| 2024Q3 (peak) | 10.82 | — | — |
| 2024Q4 | 10.76 | 16.43 | — |
| 2025Q4 | **9.32** | ESTIMATE ≈14.6 | — |
| 2026Q1 (latest) | **9.47** | **14.72** | **12.63** |

**National Q4 series, 2002–2025** (same NCCU source):

| Years | Q4 values |
|---|---|
| 2002–2006 | 4.26, 4.59, 4.84, 4.97, 4.97 |
| 2007–2011 | 5.76, 5.87, 6.67, 7.11, 7.29 |
| 2012–2016 | 7.79, 8.37, 8.41, 8.51, 9.32 |
| 2017–2021 | 9.16, 8.57, 8.58, 9.20, 9.46 |
| 2022–2024 | 9.61, 9.97, 10.76 |

2025Q3 was 9.71.

**Sources**
- **National series:** 政大不動產研究中心 page citing 內政部不動產資訊平台 (E1050), https://rer.nccu.edu.tw/article/detail/2210058908437
- **2016Q4:** TVBS 2017-06-22, https://news.tvbs.com.tw/life/739374
- **2021Q4:** 遠見/經濟日報 2022-04-01, https://www.gvm.com.tw/article/88556. 房貸負擔率 for 台北 was 65.09% (https://newtalk.tw/news/view/2022-03-31/732374).
- **2002 台北/台北縣 and 2021 新北:** 遠見 2022-04-07, https://www.gvm.com.tw/article/88701
- **2024Q4 台北 16.43:** https://www.ctee.com.tw/news/20250502701175-430104
- **2025Q4 national:** https://ec.ltn.com.tw/article/breakingnews/5466043. The 台北 figure is down 1.98 from its 2024Q3 peak; the 2025Q4 台北 房貸負擔率 was 63.92% vs 64.41% in 2026Q1, which is the basis for the ≈14.6 ESTIMATE.
- **2026Q1:** https://fangbian.tw/house-price-income-ratio/ and https://www.storm.mg/lifestyle/11160588
- **2026Q2:** not published or not reported as of 2026-10-11.

**Estimate reasoning**
- **台北 2006:** the national value times a 台北/全國 multiple of about 1.45–1.55. The multiple was 1.41 in 2002, 1.63 in 2016Q4 and 1.72 in 2021Q4.
- **台北 2011:** about 7.29 × 1.6. It must sit below the post-break 2012Q3 value of 14.0 and the 2012Q4 value of 13.1.

### 6b. 1996 estimates (no official series exists before 2002)

**Taipei: two chains**

- **Chain A, from 2026Q1:** 14.72 × (Sinyi 台北 1995 ÷ 2026Q1) × (台北 income 2025 ÷ 1996) = 14.72 × (37.3 ÷ 142.2) × (155.5萬 ÷ ≈113萬) ≈ **5.3**.
- **Chain B, from the 2002 MOI value:** 6.01 × (37.3 ÷ 35.76, the 2002 average) × (≈121.5萬 ÷ ≈113萬) ≈ **6.7**.
- **Recommendation:** **台北 1996 ≈ 6** (range 5.3–6.7, ESTIMATE).

The income figures behind these chains:

| Income figure | Value | Label | Source |
|---|---|---|---|
| 台北 1998 | 120萬 | OFFICIAL | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/7950978/57e305f7-1f92-43c1-b810-3e685cf6ccf8.pdf |
| 台北 1999 | 120.86萬 | OFFICIAL | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/7951038/02419f33-e4ac-4f02-91d5-fb859a3d6837.pdf |
| 台北 2004–2008 | 122.51, 123.60, 126.24, 128.78, 127.11萬 | OFFICIAL | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/7951711/16996be4-7c2a-473b-8fea-1c05805154ae.pdf |
| 台北 2025 | 155.5萬 | OFFICIAL | `income.md` |
| 台北 1996 | ≈113萬 | ESTIMATE | 1998 ÷ about 1.06 |

**National: two chains**

- **Chain A, from 2026Q1:** 9.47 × (46 ÷ 167.53) × (121.0萬 ÷ ≈86萬) ≈ **3.7**.
- **Chain B, from 2002:** 4.26 × (46 ÷ 36.23) × ≈1.02 ≈ **5.5**.
- **Recommendation:** **全國 1996 ≈ 4.5** (range 3.7–5.5, ESTIMATE).

The national 1996 household disposable income of ≈86萬 is an ESTIMATE, not verified. Verified national points: 2008 91.37萬 and 2012 92.36萬 (台北市主計處 bulletins), and 2025 121.0萬 (`income.md`).

**Why the two chains disagree:** the MOI ratio rose only ×2.19 from 2002Q4 to 2025Q4. The Sinyi price-and-income chain implies about ×3.2 over the same period. The pre-2012 MOI levels look low relative to today's 實價登錄-based levels.

**Recommendation for the game:** derive 1996 "years of income" directly from one consistent price series and one consistent income series (the §0 framing), rather than splicing MOI ratios across the 2012 break.

### 6c. A different survey: do not mix with 6a

營建署 住宅需求動向調查 reports price-to-income ratios for recent buyers.

| Period | Area | Ratio | Source |
|---|---|---|---|
| 2004–2009 | 五地區 | 6.0, 6.9, 6.6, 7.0, 7.1, 7.08 | https://www.nlma.gov.tw/uploads/files/91b7c0995a49528a4355456c5a926e78.pdf |
| 2009H2 | 台北 | 9.06 | CBC FSR 2010 |
| 2010Q4 | 台北 | 14.3 | https://www.nlma.gov.tw/uploads/files/f9a638982764cc26e891e4586d56090d.pdf |
| 2011Q4 | 台北 | 15.3 (report also says 14.3) | https://www.nlma.gov.tw/uploads/files/47bb731029881504ff0782a385c4a029.pdf |

No 1990s values were found. 張金鶚等 (2009, 住宅學報 18(2)) model Taipei 1973–2008, but the abstract gives only bubble shares: 47% in 1988–90 and 38% in 2008 (income model).

---

## 7. Child-related support that did NOT exist 30 years ago (start years)

**What already existed in 1996**
- 全民健保 (since 1995-03).
- 勞基法 8-week paid maternity leave (since 1984).
- 勞保生育給付 of 30 days' insured salary.
- Free 國中小 (九年國教, since 1968).

**Programs that started later**

| Program | Start | Notes | Label and source |
|---|---|---|---|
| 育嬰留職停薪 as a legal right (unpaid) and 陪產假 3 days | 2002-03 (性別工作平等法) | 陪產假 later became 5 days; since 2022-01-18 it is 7 days「陪產檢及陪產假」 | Start year from knowledge, UNVERIFIED. 7-day date: https://blog.104.com.tw/change-of-maternity-leave-to-7-days/ |
| 兒童醫療補助 (under 3) | ≈2002 | | UNVERIFIED |
| 托育費用補助 (保母/托嬰) | **2008** | NT$3,000 per child per month for dual-earner families | OFFICIAL, MOHW: https://www.mohw.gov.tw/cp-4431-43147-1.html |
| 育嬰留職停薪津貼 (就業保險) | **2009-05** | 60% of insured salary. 2021-07: +20% top-up to 80%. 2022-01: both parents can claim at the same time. | OFFICIAL, MOL: https://www.mol.gov.tw/1607/1632/1633/64841/ |
| 5歲幼兒免學費 | **2011-08** (100學年度) | | OFFICIAL, EY 2011 plan: https://www.ey.gov.tw/Page/9277F759E41CCD91/36b2a8f9-dd94-4956-9679-4e97ad6f5150 |
| 育兒津貼, 0–2 | **2012** | NT$2,500 a month, at first only when one parent was at home. Now 5,000 / 6,000 / 7,000 for the 1st / 2nd / 3rd+ child. | OFFICIAL, MOHW (start); current amounts: https://www.ey.gov.tw/File/79420A1FBA7AE2F0?A=C |
| 勞保生育給付 doubled | 2014 (passed 2014-05-16) | 30 → 60 days | https://www.thenewslens.com/article/3961 |
| 高職免學費 for all; 高中 free if family income ≤148萬 | **2014-08** (103學年度, 十二年國教) | | https://www.taiwannews.com.tw/zh/news/4925226 |
| 托育準公共化, 0–2 | **2018-08-01** | NT$6,000 a month at launch. Since 2024-01: 準公共 NT$13,000 a month, 公共化 NT$7,000. | https://www.society.taichung.gov.tw/media/427140/臺中市政府0-2歲托育補助政策專題報告.pdf |
| 準公共幼兒園 parent fee cap | **2018-08** (non-六都), nationwide 2019 | 4,500 a month; 3,500 from 2021-08; since 2022-08: 3,000 / 2,000 / 1,000 by birth order. | https://crc.sfaa.gov.tw/Uploadfile/Statiscs/80_20260907134941_9388632.pdf |
| 0–6歲國家一起養 (少子女化對策計畫) | 2018-07 | Expanded 2021 | Same source as above |
| 育兒津貼, 2 to under 5 | **2019-08** | Parental-leave exclusion dropped 2021-08; 20% tax-rate means test dropped 2023-01 | https://crc.sfaa.gov.tw/Uploadfile/Statiscs/80_20260904112645_011899.pdf |
| 高中職 fully free (no means test, public and private) | **2024-02** (112學年度 2nd semester) | | https://www.nownews.com/news/6355894 |
| Central 生育補助 top-up to NT$100,000 per child | Births from **2026-01-01** | Paid on top of 勞保/公保/國保 生育給付. In Dec 2025 the budget was still pending, so payment could lag. | https://www.cna.com.tw/news/aipl/202509170303.aspx ; https://www.ctee.com.tw/news/20251226701060-431401 |
| 0–18歲成長津貼, NT$5,000 a month | **Proposed** 2026-05, earliest 2027 | From age 6, half is saved. Needs legislation. | https://www.ettoday.net/news/20260521/3169441.htm |

**Housing-side support, for context**
- 新青安 loans: 2023-08.
- 青安 3.0: 2026-08-01.
- Details in `housing.md`.

---

## 8. Gaps and caveats

1. **Sinyi before 2001:** the current Sinyi series starts in 2001Q1, and 台南 starts in 2019Q1. All 1996 house-price values are chained ESTIMATES from Sinyi's 1995/2014 per-坪 report.
2. **CPI rent before 2022:** the official annual levels could not be downloaded. 1996–2016 are ESTIMATES (±0.5 to ±2). To verify, open `cpisplrent.xls` at https://www.stat.gov.tw/cp.aspx?n=2665 in a browser.
3. **CPI 2024 and 2025 levels:** compounded from official YoY rates (107.81 and 109.60), not read from the index table. Expect at most ±0.02 error.
4. **Wages are the current revised series.** Older press releases differ by up to about 1%.
5. **2021 TFR (0.975):** not directly verified (Wikipedia shows 0.98).
6. **房價所得比:** no official series before 2002, and the MOI series has a method break in 2012Q3. City values for 2006 and 2011 are ESTIMATES. 2026Q2 was not yet released.
7. **Household disposable income, 1996:** the national ≈86萬 and 台北 ≈113萬 are ESTIMATES. Verified points start in 1998 for 台北 and 2008 for the nation in this file.

---

## 9. Machine-readable summary (JSON)

```json
{
  "meta": {
    "compiled": "2026-10-11",
    "currency": "TWD",
    "labels": "OFFICIAL / SECONDARY / DERIVED / ESTIMATE",
    "target_years": [1996, 2001, 2006, 2011, 2016, 2021, 2025, "2026YTD"]
  },
  "sinyi_index": {
    "source": "https://www.sinyinews.com.tw/quarterly",
    "series": "信義房價季指數：全台都會區季指數",
    "base": "2016Q1=100",
    "starts": {"all_except_tainan": "2001Q1", "台南": "2019Q1"},
    "label": "OFFICIAL",
    "cities": ["台北", "新北", "桃園", "新竹", "台中", "台南", "高雄", "全台"],
    "q4": {
      "2001Q1": [36.85, 34.82, 35.09, 48.24, 35.97, null, 40.31, 36.47],
      "2001Q4": [34.81, 33.75, 37.96, 46.88, 33.61, null, 39.44, 35.15],
      "2006Q4": [56.45, 52.77, 50.39, 58.83, 52.74, null, 46.45, 53.66],
      "2011Q4": [92.75, 82.02, 81.90, 78.76, 81.28, null, 68.06, 82.77],
      "2016Q4": [99.86, 101.00, 102.78, 102.39, 103.46, null, 97.30, 101.04],
      "2021Q4": [119.68, 125.87, 141.74, 167.43, 149.30, 162.73, 134.94, 132.00],
      "2025Q4": [140.69, 157.11, 186.07, 242.57, 186.93, 189.56, 173.15, 163.25],
      "2026Q1": [142.20, 161.63, 189.55, 246.57, 186.26, 184.06, 171.25, 167.53],
      "2026Q2": [144.48, 158.17, 186.46, 248.67, 183.64, 202.86, 168.97, 168.77]
    },
    "annual_avg_DERIVED": {
      "2001": [35.42, 34.25, 36.73, 47.43, 35.20, null, 38.87, 35.79],
      "2006": [53.73, 50.38, 50.77, 58.18, 50.57, null, 49.26, 51.06],
      "2011": [90.68, 79.95, 76.84, 77.63, 78.94, null, 66.85, 80.84],
      "2014": [110.59, 108.02, 108.63, 100.47, 105.81, null, 97.79, 107.22],
      "2016": [100.29, 101.78, 101.23, 101.47, 102.58, null, 100.48, 101.20],
      "2021": [115.79, 120.03, 131.34, 148.09, 140.06, 148.34, 125.95, 124.75],
      "2025": [139.77, 159.03, 188.72, 244.77, 190.68, 198.13, 174.18, 166.20],
      "2026H1": [143.34, 159.90, 188.00, 247.62, 184.95, 193.46, 170.11, 168.15]
    },
    "1996_ESTIMATE_same_base": {
      "values": {"台北": 37, "新北": 42, "桃園": 52, "新竹": 52, "台中": 50, "台南": null, "高雄": 58, "全台": 46},
      "ranges": {"台北": [35, 39], "新北": [38, 46], "桃園": [45, 60], "新竹": [47, 58], "台中": [45, 56], "高雄": [50, 66], "全台": [40, 52]},
      "method": "2014 annual avg Sinyi index ÷ (1 + Sinyi per-坪 % change 1995→2014); 1995 used as proxy for 1996; non-Taipei shaded down for per-坪 mix bias",
      "raw_implied_1995": {"台北": 37.30, "新北": 44.04, "桃園": 60.25, "台中": 55.90, "高雄": 66.39}
    }
  },
  "price_per_ping_1995_vs_2014": {
    "source": "https://www.taipeitimes.com/News/biz/archives/2015/06/14/2003620627 (信義房屋 research); 2014 Taipei confirmed in https://www.ncscre.nccu.edu.tw/sites/default/files/2015_2-3.pdf",
    "unit": "萬元/坪",
    "1995": {"台北": 22.9, "新北": 15.0, "桃園_DERIVED": 10.7, "台中_DERIVED": 10.3, "台南_DERIVED": 8.9, "高雄_DERIVED": 11.2},
    "2014": {"台北": 67.9, "新北": 36.8, "桃園": 19.3, "台中": 19.5, "台南": 13.3, "高雄": 16.5},
    "pct_change": {"台北": 196.5, "新北": 145.3, "桃園": 80.3, "台中": 89.3, "台南": 49.4, "高雄": 47.3},
    "taipei_avg_total_price_2014_wan": 2188,
    "taipei_avg_total_price_1994_DERIVED_wan": 776
  },
  "cpi": {
    "base": "2021=100",
    "annual_avg": {
      "1996": 78.72, "2001": 81.92, "2006": 85.26, "2011": 91.21, "2016": 95.86,
      "2021": 100.00, "2022": 102.95, "2023": 105.51, "2024": 107.81, "2025": 109.60,
      "2026_JanSep_approx": 111.7
    },
    "labels": {"1996": "DERIVED", "2001": "DERIVED", "2006-2023": "OFFICIAL", "2024": "DERIVED", "2025": "DERIVED", "2026": "DERIVED"},
    "yoy_pct": {
      "1996": 3.08, "2001": 0.0, "2006": 0.60, "2011": 1.42, "2016": 1.40, "2021": 1.97,
      "2022": 2.95, "2023": 2.49, "2024": 2.18, "2025": 1.66,
      "2026_JanSep": 1.94, "2026_Sep": 2.73
    },
    "sources": [
      "https://www.dbas.taichung.gov.tw/media/155785/3321146228.pdf",
      "https://yilandoctor.org.tw/web/images/ckfinder/files/20241226165842.pdf",
      "https://statdb.mol.gov.tw/html/year/year14/31010.pdf",
      "https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236759"
    ]
  },
  "cpi_rent": {
    "base": "2021=100",
    "annual_avg": {
      "1996": 91.5, "2001": 94.5, "2006": 92.0, "2011": 93.4, "2016": 95.7,
      "2021": 100.0, "2022": 101.68, "2023": 103.88, "2024": 106.43, "2025": 108.88,
      "2026H1": 110.9
    },
    "labels": {"1996-2011": "ESTIMATE (±1 to ±2)", "2016": "ESTIMATE ±0.5", "2022": "DERIVED", "2023": "SECONDARY", "2024": "DERIVED", "2025": "DERIVED", "2026H1": "ESTIMATE"},
    "yoy_pct": {"2023": 2.16, "2024": 2.45, "2025": 2.30, "2026H1": 1.85},
    "anchors_2016base": {"1981": 60, "2000": "nearly 100", "2022-04": 105.70, "2022-10": 106.89},
    "taipei_rent_official": {
      "base1996": {"1997": 101.64, "1998": 103.26, "1999": 103.32, "2000": 103.40, "2001": 102.68},
      "base2001": {"1999": 100.62, "2000": 100.70, "2002": 98.22, "2003": 96.66, "2004": 95.53},
      "base2011": {"2009": 99.55, "2010": 99.62, "2012": 100.67, "2013": 101.39, "2014": 102.15}
    }
  },
  "wages_industry_services": {
    "source": "MOL 勞動統計年報 表1-1 (DGBAS 薪資與生產力統計), https://statdb.mol.gov.tw/html/year/year14/31010.pdf",
    "label": "OFFICIAL (current revised series); real = DERIVED (nominal ÷ CPI 2021=100)",
    "total_nominal": {"1996": 36655, "2001": 41952, "2006": 43492, "2011": 45963, "2016": 49257, "2021": 56127, "2024": 61002, "2025": 63383},
    "regular_nominal": {"1996": 29722, "2001": 34480, "2006": 35725, "2011": 36737, "2016": 39217, "2021": 43045, "2024": 46450, "2025": 47885, "2026_JanJul": 49054},
    "total_real_2021prices": {"1996": 46564, "2001": 51211, "2006": 51011, "2011": 50393, "2016": 51384, "2021": 56127, "2024": 56583, "2025": 57831},
    "regular_real_2021prices": {"1996": 37757, "2001": 42090, "2006": 41901, "2011": 40277, "2016": 40911, "2021": 43045, "2024": 43085, "2025": 43691, "2026_JanJul_OFFICIAL": 44113},
    "total_2026_JanJul_cumulative_7months": 483077,
    "minimum_wage_month": {"1996": 15360, "2001": 15840, "2006": 15840, "2011": 17880, "2016": 20008, "2021": 24000, "2025": 28590, "2026": 29500},
    "full_series_total_1996_2025": [36655, 38435, 39603, 40781, 41831, 41952, 41533, 42068, 42684, 43162, 43492, 44411, 44419, 42300, 44647, 45963, 46075, 46087, 47744, 48956, 49257, 50634, 52468, 53551, 54278, 56127, 58042, 58420, 61002, 63383],
    "full_series_regular_1996_2025": [29722, 30930, 31928, 33019, 33926, 34480, 34746, 34804, 35096, 35382, 35725, 36318, 36384, 35624, 36234, 36737, 37195, 37557, 38220, 38717, 39217, 39937, 40949, 41700, 42281, 43045, 44210, 45197, 46450, 47885]
  },
  "births_tfr": {
    "births_registered": {"1996": 325545, "2001": 260354, "2006": 204459, "2011": 196627, "2016": 208440, "2021": 153820, "2022": 138986, "2023": 135571, "2024": 134856, "2025": 107812, "2026_JanAug": 61742},
    "births_by_occurrence": {"1996": 324317, "2001": 257866, "2006": 205720, "2011": 198348, "2016": 207600},
    "tfr": {"1996": 1.760, "2001": 1.400, "2006": 1.115, "2011": 1.065, "2016": 1.170, "2021": 0.975, "2022": 0.870, "2023": 0.865, "2024": 0.885, "2025": 0.695},
    "births_2026_full_year_ESTIMATE": 93000,
    "labels": "SECONDARY (內政部 via Wikipedia/LTN/新北市民政局); 2021 TFR 0.975 not directly verified"
  },
  "house_price_to_income": {
    "moi_national_q4": {
      "2002": 4.26, "2003": 4.59, "2004": 4.84, "2005": 4.97, "2006": 4.97,
      "2007": 5.76, "2008": 5.87, "2009": 6.67, "2010": 7.11, "2011": 7.29,
      "2012": 7.79, "2013": 8.37, "2014": 8.41, "2015": 8.51, "2016": 9.32,
      "2017": 9.16, "2018": 8.57, "2019": 8.58, "2020": 9.20, "2021": 9.46,
      "2022": 9.61, "2023": 9.97, "2024": 10.76,
      "2025Q3": 9.71, "2025Q4": 9.32, "2026Q1": 9.47
    },
    "moi_taipei": {
      "2002": 6.01, "2006Q4_ESTIMATE": 7.3, "2011Q4_ESTIMATE": 12.0, "2016Q4": 15.18, "2021Q4": 16.29,
      "2024Q4": 16.43, "2025Q4_ESTIMATE": 14.6, "2026Q1": 14.72
    },
    "moi_newtaipei": {
      "2002": 6.15, "2006_ESTIMATE": 7.0, "2011_ESTIMATE": 9.5, "2016Q4": 12.61, "2021": 12.13, "2026Q1": 12.63
    },
    "1996_ESTIMATE": {"taipei": 6.0, "taipei_range": [5.3, 6.7], "national": 4.5, "national_range": [3.7, 5.5]},
    "method_break": "2012Q3 (appraisal → 實價登錄); pre-2012 levels not fully comparable",
    "years_of_avg_total_pay_for_30ping_taipei_ESTIMATE": {"1995": 15.6, "2026Q2": 35.0}
  },
  "subsidy_start_years": {
    "育嬰留停_legal_right_unpaid": 2002,
    "陪產假": {"3_days": 2002, "7_days": "2022-01-18"},
    "托育費用補助": 2008,
    "育嬰留職停薪津貼": {"start": "2009-05", "rate_60pct": "2009", "rate_80pct": "2021-07", "both_parents_simultaneous": "2022-01"},
    "5歲幼兒免學費": "2011-08",
    "育兒津貼_0to2": {"start": 2012, "initial_amount": 2500, "current": [5000, 6000, 7000]},
    "勞保生育給付_30to60days": 2014,
    "高職免學費_and_高中_meanstested_148萬": "2014-08",
    "托育準公共化_0to2": "2018-08-01",
    "準公共幼兒園_fee_cap": {"start": "2018-08", "caps": {"2018": 4500, "2021-08": 3500, "2022-08": [3000, 2000, 1000]}},
    "育兒津貼_2to5": "2019-08",
    "高中職全面免學費": "2024-02",
    "生育補助_100k_per_child": "births from 2026-01-01",
    "0to18_成長津貼_5000": "proposed 2026-05; earliest 2027; pending legislation",
    "existed_in_1996": ["全民健保 (1995-03)", "8-week maternity leave (1984)", "勞保生育給付 30 days", "九年國教 (1968)"]
  }
}
```
