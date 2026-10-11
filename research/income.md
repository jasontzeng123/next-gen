# Taiwan income and household spending data for 你有資格生下一代嗎？

Compiled 2026-10-10. Units are NT$ unless stated. 萬 = 10,000. Western years are used, with ROC years in brackets (113年 = 2024, 114年 = 2025, 115年 = 2026).

## Read this first: data access and reliability

- **Blocked sources.** The fetch tool is blocked by robots rules on `ws.dgbas.gov.tw`, the server that hosts every DGBAS xlsx, pdf and doc attachment. The outbound proxy blocks direct curl to every .gov.tw host. So I could read the official HTML release pages and some official PDFs on other hosts (fia.gov.tw, statdb.mol.gov.tw, mol.gov.tw, city governments), but not the DGBAS attachment tables. Gaps were filled from secondary sources (CNA, UDN, 104, 1111, city-government bulletins, a blog that copied DGBAS tables). Each number has a confidence label:
  - **[OFFICIAL]** read directly on a government page or PDF.
  - **[NEWS]** reported by news or a city government, quoting DGBAS, MOL or MOF.
  - **[SECONDARY]** copied from an official table by a non-government site, and consistent with official anchor numbers.
  - **[DERIVED]** my own arithmetic on sourced numbers. The method is shown.
  - **[ESTIMATE]** my best estimate. The reasoning is shown. Do not present these as official.
- **Search budget.** The web-search budget for this session ran out partway through. Sections B (nurses, mid-career civil servants), C6 (household types) and G (parental leave by sex, post-2016 motherhood survey) are therefore incomplete and carry ESTIMATE labels.
- **Definitions.** 「全年總薪資」 (A1–A3) is annual pay including bonuses, from tax and insurance records. It covers all employees in industry and services: local and foreign, full-time and part-time. Public-sector schools and government agencies are not covered. 「本國籍全時」 means local full-time employees only, which gives higher medians.

---

## A. DGBAS: annual total pay median and distribution (latest edition: 2024 data, released 2025-11-25)

Official release: https://www.stat.gov.tw/News_Content.aspx?n=2716&s=235514 (mirror: https://www.stat.gov.tw/News_Content.aspx?n=3703&s=235514)
Release PDF (I could not read it): https://ws.dgbas.gov.tw/001/Upload/463/relfile/10980/235514/113年受僱員工薪資中位數統計結果新聞稿.pdf
The 2025 (114年) edition has not been released. It is expected around late November or December 2026.

### A1. Overall distribution (2024, all employees, annual total pay, 萬元)

| Item | Value | YoY | Label / source |
|---|---|---|---|
| Median (P50) | **54.6萬** | +4.03% (largest rise since the series began in 2013) | [OFFICIAL] S1 |
| Mean | **73.2萬** | +4.42% | [NEWS] S4, S7 |
| Share of employees below the mean | **68.75%** | (2023: 68.70%; record 68.91% in 2022) | [NEWS] S4, S7 |
| Local full-time median | **58.5萬** | +4.52% | [OFFICIAL] S1 |
| D1 (P10) | **33.0萬** | +4.39% | [NEWS] S4, S5 |
| D2 (P20) | 38.1萬 | | [SECONDARY] S3 |
| D3 (P30) | 43.2萬 | | [SECONDARY] S3 |
| D4 (P40) | 48.7萬 | | [SECONDARY] S3 |
| D5 (P50) | 54.6萬 | | [OFFICIAL] |
| D6 (P60) | 62.8萬 | | [SECONDARY] S3 |
| D7 (P70) | 75.3萬 | | [SECONDARY] S3 |
| D8 (P80) | 95.9萬 | | [SECONDARY] S3 |
| D9 (P90) | **133.6萬** | +4.46% | [NEWS] S4, S10 |
| D9/D1 ratio | 4.05 (same as 2023; peak 4.33 in 2015) | | [NEWS] S10 |
| P25 / P75 | ESTIMATE ≈ 40.6萬 / ≈ 84.6萬 | | [ESTIMATE] linear interpolation between D2/D3 and D7/D8. The official values are in 表1, which I could not read. |

The D2–D4 and D6–D8 values come from joelin.cc (S3), which copies the DGBAS 十分位 table. Its D1, D5, D9 and mean match the official and news figures, so confidence is high but not verified at source.

Low pay (2024, local full-time): low-pay line = ⅔ × 58.5萬 = **39萬**. **16.8%**, about **126萬 people**, fall below it. [NEWS] S19

Historical decile table (萬元) [SECONDARY, S3]:

| Year | Median | Mean | D1 | D2 | D3 | D4 | D6 | D7 | D8 | D9 |
|---|---|---|---|---|---|---|---|---|---|---|
| 2014 | 45.2 | 57.3 | 24.8 | 29.0 | 33.8 | 39.6 | 52.0 | 61.2 | 75.6 | 104.6 |
| 2015 | 46.0 | 58.7 | 25.1 | 29.4 | 34.0 | 39.8 | 53.0 | 62.6 | 77.7 | 108.4 |
| 2016 | 46.2 | 59.1 | 25.3 | 29.7 | 34.6 | 40.2 | 53.0 | 62.5 | 78.3 | 108.9 |
| 2017 | 47.2 | 60.8 | 26.1 | 30.6 | 35.3 | 41.2 | 54.5 | 64.0 | 80.5 | 112.3 |
| 2018 | 48.7 | 63.0 | 27.6 | 32.1 | 36.9 | 42.7 | 55.7 | 65.8 | 82.6 | 115.8 |
| 2019 | 49.4 | 64.3 | 28.7 | 33.3 | 38.1 | 43.6 | 56.7 | 66.7 | 83.9 | 118.3 |
| 2020 | 49.8* | 65.1 | 29.3 | 34.1 | 38.8 | 44.2 | 57.1 | 67.4 | 84.8 | 119.5 |
| 2021 | 50.8 | 67.4 | 29.6 | 34.2 | 39.6 | 44.7 | 58.3 | 69.4 | 87.9 | 123.5 |
| 2022 | 51.8 | 69.7 | 30.4 | 35.2 | 40.3 | 45.4 | 59.4 | 71.3 | 90.6 | 128.1 |
| 2023 | 52.5 | 70.1 | 31.6 | 36.8 | 41.3 | 46.5 | 60.1 | 72.0 | 91.7 | 127.9 |
| 2024 | 54.6 | 73.2 | 33.0 | 38.1 | 43.2 | 48.7 | 62.8 | 75.3 | 95.9 | 133.6 |

\*CONFLICT: the 2020 median was first published as **50.1萬** (technews, Feb 2021). The current table gives 49.8. DGBAS revises back years.

### A2. Median annual total pay by industry (2024, all employees, 萬元)

| Industry | Median | YoY | Label / source |
|---|---|---|---|
| 金融及保險業 | **110.6** | +8.77% | [OFFICIAL] S1 |
| 電力及燃氣供應業 | **109.1** | | [OFFICIAL] S1 |
| 電腦、電子產品及光學製品製造業 | **89.9** | +4.56% | [NEWS] S6, S7 |
| 電子零組件製造業 (incl. semiconductors) | **87.6** | +9.55% | [NEWS] S4, S7 |
| 出版影音及資通訊業 | **80.7** | | [NEWS] S5, S7 |
| 礦業及土石採取業 | **68.2** | +8.67% | [NEWS] S6 |
| 製造業 (all) | **57.0** | +4.83% | [NEWS] S7 |
| 用水供應及污染整治業 | **50.5** | +5.98% | [NEWS] S6 |
| 食品及飼品製造業 | 49.6 | | [SECONDARY] S3 |
| 紡織業 | 46.6 | | [SECONDARY] S3 |
| 住宿及餐飲業 | **41.5** | (10-year +32.68%) | [NEWS] S7 |
| 教育業 (excl. schools, i.e. mostly cram schools) | **38.2** | | [OFFICIAL] S1 |
| 其他服務業 (beauty, hair, repair) | **38.1** | −0.48% | [OFFICIAL] S1 |
| 專業、科學及技術服務業 | ≈ 70 | | [ESTIMATE] |
| 醫療保健及社會工作服務業 | ≈ 66–70 | | [ESTIMATE] |
| 運輸及倉儲業 | ≈ 67 | | [ESTIMATE] |
| 不動產業 | ≈ 58 | | [ESTIMATE] |
| 批發及零售業 | ≈ 55 | (YoY > +5%) | [ESTIMATE] |
| 營建工程業 | ≈ 52 | | [ESTIMATE] |
| 藝術、娛樂及休閒服務業 | ≈ 44 | | [ESTIMATE] |
| 支援服務業 | ≈ 41–42 | | [ESTIMATE] |

How the ESTIMATE rows were made: 2024 industry average monthly total pay (S14) × 12 × 0.85. The 0.85 median/mean ratio is the typical value among industries where both numbers are known: 住宿餐飲 0.90, 礦業 0.89, 用水 0.88, 金融 0.86, 其他服務 0.79. Skewed industries such as manufacturing run at 0.72. The official medians for these industries are in DGBAS 表3, which I could not read.

Industry P25/P75: not obtained. They are in 表5 and 表6.

### A3. Median annual total pay by age, sex, education and firm size (2024, 萬元)

DGBAS publishes only these age bands: <25, 25–29, 30–39, 40–49, 50–64, 65+. There are no 5-year bands above 30.

| Age band | All employees | Local full-time | Label |
|---|---|---|---|
| Under 25 | 38.1 | 44.6 | [SECONDARY] S3 |
| 25–29 | 52.1 | 53.7 | [SECONDARY] S3 |
| (Under 30, combined) | **46.8** | | [OFFICIAL] S1 |
| 30–39 | 58.1 (+4.23%) | 60.8 | [SECONDARY] S3, growth rate [NEWS] |
| 40–49 | **62.0** (+4.27%, peak) | 64.6 | [OFFICIAL] S1 |
| 50–64 | 57.9 | 59.9 | [SECONDARY] S3 |
| 65+ | **43.9** | 45.1 | [OFFICIAL] S1 |

- **Sex (all employees):** female **51.2萬**, male **58.5萬**. Female/male = 0.875. [OFFICIAL] S1
- **Education:** 研究所 **109.9萬**; 專科及大學 **58.2萬**. [OFFICIAL] S1. Other levels not obtained.
- **Firm size:** 500+ employees **80.2萬**; 4 or fewer employees **39.5萬**. [OFFICIAL] S1
- **County (local full-time, by workplace), median:** 新竹市 **90.2**, 新竹縣 **73.6**, 臺北市 **73.5**, 桃園市 **61.6**, 新北市 **55.7**, 高雄市 **54.2**, 臺南市 **53.8**, 臺中市 **51.7**, 嘉義市 **49.1**, 彰化縣 **46.8** (lowest). [NEWS] S5, S9, S4
- **County mean (same population):** 新竹市 129.8, 新竹縣 100.3, 臺北市 94.7, 桃園市 78.6, 苗栗縣 75.9. [NEWS] S7, S8
- **臺北市 by sex (local full-time):** male median 79.9萬, female 68.7萬. [NEWS] S57

Monthly regular-pay medians, Jan–Jul 2026 (latest age profile, 經常性薪資中位數, all employees) [NEWS, S17]:

| Age | Median | YoY |
|---|---|---|
| <25 | 29,825 | +2.44% |
| 25–29 | 36,312 | +3.18% |
| 30–39 | 40,171 | +3.29% |
| 40–49 | 43,138 | +2.97% |
| 50–64 | 44,019 | +2.29% |
| 65+ | 38,935 | +1.71% |

By sex: male 41,189, female 37,445. Female/male = 90.9%.

Jan–Oct 2025 monthly regular medians [NEWS, S16]:
- **Overall:** 38,319.
- **By age:** <30 31,740; 30–39 39,019; 40–49 42,064; 50–64 43,143; 65+ 38,199.
- **By education:** 專科大學 40,501; 研究所 66,548.
- **By industry:** 住宿餐飲 31,566; 支援服務 32,721; 製造 36,726; 電子零組件 46,914; 出版資通訊 53,400; 金融 57,861.

2024 regular monthly medians by industry [NEWS, S20]: overall 37,274; 電力燃氣 62,682; 金融 56,332; 支援服務 31,441; 住宿餐飲 30,960; 教育 29,838; 其他服務 29,109.

### A4. Average wages (薪資與生產力統計), full-year 2025 (114年) [OFFICIAL, S11]

| Measure | All employees | Local full-time | Part-time |
|---|---|---|---|
| Avg monthly regular pay (經常性) | **47,884** (+3.09%) | 50,643 (+3.22%) | 20,612 |
| Median monthly regular pay | **38,406** (+3.03%) | 39,890 (+3.09%) | 15,788 |
| Avg annual total pay | **760,632** (+3.91%), i.e. 63,386/month | 806,448 | 262,272 |

Other 2025 figures:
- Average employees: 852.3萬.
- Share below the average regular pay: **69.74%** (record). [NEWS] S15
- Real regular pay +1.40%; real total pay +2.21%. CPI 2025 = **+1.66%**. [NEWS] S15; CPI [OFFICIAL] S52
- Labour compensation per employee 2025: 88.3萬 in total, of which salary 76.1萬 and non-salary (employer insurance and pension) 12.2萬. [OFFICIAL] S55

2024 for comparison [OFFICIAL, S51]: avg regular 46,450; avg total 60,984/month; regular median 37,274.

Latest 2026: July 2026 avg regular 49,491; total 71,165; regular median 39,629 (local full-time median 41,397) [OFFICIAL] S18. Jan–Jul 2026 [NEWS, S19]:
- Avg regular 49,054 (+2.94%)
- Cumulative total 483,077 (+4.18%)
- Real avg regular 44,113 (+1.12%)
- CPI Jan–Sep 2026 avg +1.94%; Sep 2026 +2.73% [OFFICIAL]

Industry averages, 2025 [NEWS, S13 (104, quoting DGBAS)]:

| Industry | Annual total avg | Monthly regular avg |
|---|---|---|
| 電子零組件製造業 | 1,332,924 | 57,096 |
| 金融及保險業 | 1,320,960 | 70,997 |
| 電力及燃氣供應業 | 1,175,532 | 66,135 |
| 電腦電子光學製造業 | 1,139,592 | 53,463 |
| 出版影音及資通訊業 | 1,037,184 | 69,595 |
| 醫療保健及社工 | 847,908 | 56,196 |
| 專業科學技術服務 | 844,140 | 58,377 |
| 製造業 | 832,476 | 45,850 |
| 運輸及倉儲業 | 813,972 | 51,211 |
| 批發及零售業 | 669,756 | 47,483 |
| 其他服務業 | n/a | 36,709 |
| 住宿及餐飲業 | n/a | 34,961 |

2024 industry averages (monthly regular / monthly total) [NEWS, S14]:

| Industry | Regular | Total |
|---|---|---|
| 專業科學 | 56,843 | 68,471 |
| 醫療保健 | 54,299 | 68,900 |
| 運輸倉儲 | 49,698 | 65,305 |
| 礦業 | 46,934 | 63,898 |
| 不動產 | 44,705 | 57,068 |
| 批發零售 | 45,834 | 53,797 |
| 營建工程 | 43,266 | 51,176 |
| 用水供應 | 39,162 | 48,030 |
| 藝術娛樂 | 39,020 | 42,697 |
| 支援服務 | 36,657 | 40,640 |
| 其他服務 | 35,811 | 40,129 |
| 住宿餐飲 | 34,322 | 38,555 |
| 金融 | 69,610 | 107,348 |
| 電子零組件 | 55,399 | 102,150 |

---

## B. Occupations and the public sector

### B1. MOL 職類別薪資調查, 2025 survey (published 2026-05-29) [OFFICIAL, S21]

Full-time employees in industry and services. Monthly = July 2025 經常性薪資. Annual = 2024 annual pay (includes bonuses, excludes overtime).

| Major group | Monthly (萬) | YoY | Annual (萬) | YoY |
|---|---|---|---|---|
| 主管及監督人員 | **8.1** | 3.5% | **131.7** | 3.7% |
| 專業人員 | **6.8** | 3.0% | **106.2** | 2.6% |
| 技術員及助理專業人員 | **5.1** | 2.5% | **78.9** | 5.3% |
| 事務支援人員 | **4.0** | 3.0% | **56.4** | 3.0% |
| 服務及銷售工作人員 | **3.7** | 4.6% | **49.7** | 3.9% |
| 技藝、機械設備操作及組裝人員 (published combined) | **3.8** | 3.3% | **54.0** | 1.5% |
| 基層技術工及勞力工 | **3.3** | 2.7% | **43.1** | 2.0% |

The previous survey (2024: July 2024 monthly / 2023 annual) [OFFICIAL, S22]: 主管 7.8/126.9; 專業 6.6/103.5; 基層 3.2/42.3.

Selected occupations, 2025 survey (monthly July 2025 / annual 2024, 萬元) [OFFICIAL PDF, S21]:

| Occupation | Monthly | Annual |
|---|---|---|
| 航空駕駛員 | 29.8 | 393.1 |
| 精算師 | 20.3 | 366.2 |
| **醫師** | **18.0** | **249.7** |
| 職業運動員 | 16.0 | 169.2 |
| 船舶監管 | 14.5 | 172.3 |
| 電信工程師 | 9.7 | 182.8 |
| 律師 | 9.3 | 158.0 |
| 證券交易員 | 8.1 | 153.8 |
| 財務投資分析 | 7.8 | 146.8 |
| 電機電子工程師 | n/a | 140.6 |

Professionals by industry: 醫療保健 7.8萬/month, 110.7萬/year; 金融 7.5/138.6; 製造 6.9/126.4.

- **Nurses (護理師):** not found in the sources I could read. [ESTIMATE] about 4.5–5.5萬/month regular pay; about 60–75萬/year including night-shift pay and bonuses. Reasoning: 醫療保健 industry 2025 average regular pay is 56,196, but that average includes doctors. Hospital new-graduate offers reported in 2024–25 news run about 4.3–5.4萬 (for example, the 新光 hospital "純白" starting offer of about 5.4萬, TVBS). **Verify before use.**
- **Self-employed / freelancers:** no survey number obtained. The household survey gives 產業主所得 (business-owner income) of 16.0萬 per average household in 2024 [OFFICIAL via S39]. That is a household average, not a per-person income.

### B2. Civil servants [NEWS, S24, S25]

| Entry route | 2026 (115年) starting monthly | 2027 (116年) after the 4% raise |
|---|---|---|
| 高考三級 (薦任6職等) | **55,160** | 59,460 |
| 普考 (委任3職等) | **42,970** | 47,700 |
| 初考 (委任1職等) | **34,880** | 38,360 |

- From 2026-07-01, the professional allowance (專業加給, and teachers' 學術研究加給) and the supervisory allowance each rise by a flat **+2,000/month**.
- From 2027-01-01, base pay rises by **4%**.
- 2026 itself had no percentage raise.
- Earlier raises: 2011 3%, 2018 3%, 2022 4%, 2024 4%, 2025 3%.
- Year-end bonus (年終) for public servants: **1.5 months** (standard practice). [ESTIMATE / well-known policy, not re-verified this session]
- Annual pay for a 2026 高考三級 new hire: about 55,160 × 13.5 + 2,000 × 6 ≈ **75.7萬**. [DERIVED]
- Mid-career (薦任7–9職等, about 10–15 years in): [ESTIMATE] about 6.5–8.0萬/month non-supervisory, about **90–110萬/year**. Reasoning: 薦任7–8職等 本俸 points 415–630 at about NT$139/point (S26 table) ≈ 5.8–8.7萬 base before the professional allowance. Treat this as rough.

### B3. Public primary and junior-high teachers

- **Starting pay (stated as "current" in Oct 2024):** bachelor **46,700**, master **54,170**, PhD **59,740** per month. Allowances: homeroom (導師) +3,000; special education +1,800; admin roles +4,190 to 7,520. [NEWS, S26]
- **2026 news:** new-teacher pay including allowances is about **48,000–51,000**. [NEWS, S27] This fits the 2025 3% raise plus the +2,000 from July 2026.
- **Salary steps:** bachelor teachers start at 190 points (range 190–450, seniority pay up to 625). Master teachers start at 245 points (up to 650). [OFFICIAL school table, S26b]
- **10-year teacher:** [ESTIMATE] about 6.3–6.8萬/month including the homeroom allowance, about 85–90萬/year with a 1.5-month bonus. Reasoning: about 10 annual steps takes a bachelor teacher from 190 to about 330 points.

---

## C. DGBAS 家庭收支調查, 2025 data (114年, released 2026-08-14)

Release: https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236591 · Full report index (tables blocked for me): https://www.stat.gov.tw/News_Content.aspx?n=3908&s=236588

### C1. Headline figures

| Item | 2025 | 2024 | Label |
|---|---|---|---|
| Households | **976.1萬** | 926.2萬 | [OFFICIAL via Taichung bulletin S30/S39] |
| Persons per household | **2.69** | 2.78 | [S30/S39] |
| Avg household income receipts (所得收入) | 145.7萬 | 141.0萬 | [S30/S39] |
| Avg household gross income (所得總額) | 152.9萬 (+3.3%) | 148.0萬 | [NEWS] S31 |
| **Avg household disposable income** | **121.0萬** (+3.9%; exact 1,210,xxx) | 116.5萬 (1,165,206) | [OFFICIAL] S28 |
| **Median household disposable income** | **101.8萬** (+3.4%) | 98.47萬 | [OFFICIAL] S28 |
| Per-person disposable income, mean | **45.0萬** (+7.4%) | 41.9萬 | [OFFICIAL] S28 |
| Per-person disposable income, median | **36.7萬** (+3.2%) | | [OFFICIAL] S28 |
| **Avg household consumption expenditure** | **92.0萬** (+3.6%) | 88.9萬 (888,699) | [NEWS] S33, S34; [S30] |
| Avg household savings | **29.0萬** (+4.9%) | 27.7萬 (276,507) | [NEWS] S33 |
| Propensity to consume / save | 76.0% / 24.0% | 76.3% / 23.7% | [S30] |
| Per-person monthly consumption | ≈ 28,500 | ≈ 26,640 | [DERIVED] 920,000 / 2.69 / 12 and 888,699 / 2.78 / 12 |
| Households of 1–2 persons | 51.6% (1-person 17.33%, 2-person 34.27%) | | [NEWS] S36 |

Note: average household size fell from 2.78 to 2.69 while household count jumped 5.4%. This looks like a re-benchmark of the household frame, and it pushes per-person figures up (per-person mean +7.4%). Use household-level figures for year-on-year comparisons.

### C2. Disposable income by household quintile (戶數五等分位), per household

[S30 for 2025, S39 for 2024. Both are city bulletins that reproduce the national DGBAS table.]

| Quintile | 2025 | 2024 |
|---|---|---|
| Q1 (lowest 20%) | **397,191** | 383,927 |
| Q2 | **726,390** | 701,178 |
| Q3 | **1,043,274** | 1,001,276 |
| Q4 | **1,435,638** | 1,382,254 |
| Q5 (highest 20%) | **2,449,344** | 2,357,393 |
| Q5/Q1 ratio | **6.17** (highest in about 14 years) | 6.14 |

Other distribution measures, 2025 [OFFICIAL / NEWS, S28, S31]:
- Gini **0.341**.
- Per-person quintile ratio **3.73** (2024: 3.91).
- Ratio before government transfers: 7.49. After in-kind benefits: 5.74.

Decile cut-points (表7): not obtained.

### C3. Consumption by quintile

Not obtained. These are in 表11 / 統計表第六表.

Official fragment: health care as a share of consumption, 2024, by quintile: Q1 16.99%, Q2 15.59%, Q3 14.86%, Q4 14.28%, Q5 14.07%; all households 14.76%. [OFFICIAL] S40

[ESTIMATE] 2025 consumption per household by quintile: Q1 ≈ 39–40萬, Q2 ≈ 67萬, Q3 ≈ 87–88萬, Q4 ≈ 112萬, Q5 ≈ 155萬. Reasoning: I assumed propensities to consume of 1.00 / 0.92 / 0.84 / 0.78 / 0.635. In Taiwan the bottom quintile typically saves almost nothing and the top quintile saves about a third. These propensities are calibrated so the mean comes to 92.3萬, against the actual 92.0萬.

### C4. By county/city

**Disposable income per household, 2025 (萬元):**

| City / county | 2025 | 2024 | Label |
|---|---|---|---|
| 新竹市 | **160.4** (+6.7%) | 150.3 | [NEWS] S33, S34 |
| 新竹縣 | **156.9** | 148.1 | [NEWS] |
| 臺北市 | **155.5** (155.46, +4.66%) | 148.5 | [OFFICIAL Taipei] S42 |
| 桃園市 | **128.2** | 124.1 | [S30 / S38] |
| 新北市 | **126.3** | 121.9 | |
| 臺中市 | **121.6** | 117.2 | |
| 高雄市 | **120.6** | 114.4 | |
| 臺南市 | **104.5** | 101.0 | |
| 全國 | **121.0** | 116.5 | |

For the other 12 counties, DGBAS 所得收入 (gross household income receipts, 2025) is known [NEWS, S35]. I estimated disposable income as receipts × 0.83 [ESTIMATE]. The six special municipalities run at a ratio of 0.82–0.84, and the 新竹 county/city at 0.78–0.79.

| County | 所得收入 2025 | Disposable (ESTIMATE) |
|---|---|---|
| 嘉義市 | 1,434,177 | ≈ 119 |
| 苗栗縣 | 1,384,012 | ≈ 115 |
| 宜蘭縣 | 1,191,108 | ≈ 99 |
| 基隆市 | 1,161,995 | ≈ 96 |
| 屏東縣 | 1,147,344 | ≈ 95 |
| 澎湖縣 | 1,127,048 | ≈ 94 |
| 彰化縣 | 1,097,348 | ≈ 91 |
| 雲林縣 | 1,089,198 | ≈ 90 |
| 南投縣 | 1,065,279 | ≈ 88 |
| 花蓮縣 | 1,041,688 | ≈ 86 |
| 嘉義縣 | 1,026,136 | ≈ 85 |
| 臺東縣 | 970,508 | ≈ 81 |

所得收入 2025 for the municipalities and 新竹 [NEWS, S35]: 新竹市 2,042,624; 新竹縣 2,007,347; 臺北市 1,857,943; 桃園市 1,557,567; 新北市 1,506,244; 高雄市 1,469,589; 臺中市 1,467,445.

金門縣 and 連江縣 are not in the published county rankings. DGBAS county samples outside the six municipalities are under 1,000 households, so expect sampling noise.

**Consumption per household, 2025 (萬元)** [S30]:

| City | 2025 | 2024 |
|---|---|---|
| 臺北市 | 117.0 | 113.7 |
| 臺中市 | 98.7 | 97.3 |
| 高雄市 | 95.5 | 87.9 |
| 桃園市 | 96.4 | 92.3 |
| 新北市 | 94.0 | 90.9 |
| 臺南市 | 81.1 | 77.7 |
| 全國 | 92.0 | 88.9 |

Other counties: not obtained.

Savings per household, 2025 (萬元): 臺北 38.5, 新北 32.3, 桃園 31.8, 高雄 25.1, 臺南 23.4, 臺中 22.9. [S30]

Household size: 臺中 2.76 (2025); 全國 2.69. Other counties not obtained.

**Per-person monthly consumption by county, 2023 (112年), the latest full county series I could get** [SECONDARY, a reproduction of the DGBAS table; S41]:

| County | 2023 | County | 2023 |
|---|---|---|---|
| 臺北市 | 34,014 | 宜蘭縣 | 23,808 |
| 新竹市 | 31,211 | 屏東縣 | 21,594 |
| 新竹縣 | 29,578 | 花蓮縣 | 21,484 |
| 臺中市 | 26,957 | 臺東縣 | 21,412 |
| 高雄市 | 26,399 | 苗栗縣 | 21,017 |
| 新北市 | 26,226 | 澎湖縣 | 20,971 |
| 嘉義市 | 25,599 | 雲林縣 | 20,356 |
| 桃園市 | 25,235 | 嘉義縣 | 19,410 |
| 基隆市 | 24,234 | 彰化縣 | 19,292 |
| 臺南市 | 22,661 | 南投縣 | 18,650 |
| **全國** | **25,726** | | |

For 2025 [ESTIMATE], scale each county by about 1.11. That is the national per-person change from 2023 to 2025 (25,726 → ≈ 28,500), which partly reflects the drop in household size.

Education spending per household, 2025: 新竹縣 46,365 (highest), 新竹市 32,750, 臺中 28,241, 桃園 26,609, 高雄 25,919, 臺北 24,626, 新北 21,843, 臺南 20,123; 全國 **22,398** (2021: 26,701). [NEWS] S36

Low-confidence source: a GVM article (2026-04-30) lists per-person income and spending for all 22 counties, but its values are rounded and do not match the official 2024 figures. **Do not use.** S58

### C5. Consumption by category (COICOP 2018, 13 categories; DGBAS changed to this system in 2024)

2024 national, exact shares [OFFICIAL via Taoyuan report, S38]. Amounts are [DERIVED] as 888,699 × share.

| Category | Share | Amount/yr |
|---|---|---|
| 食品及非酒精飲料 | 14.29% | 126,995 |
| 菸酒 | 1.01% | 8,976 |
| 衣著鞋襪 | 2.62% | 23,284 |
| 住宅服務、水電瓦斯及燃料 (includes 設算租金 imputed rent) | 23.96% | 212,932 |
| 家具設備及家務維護 | 2.92% | 25,950 |
| 醫療保健 | 14.76% | 131,172 |
| 交通 | 7.71% | 68,519 |
| 資訊及通訊 | 3.81% | 33,859 |
| 休閒、運動及文化 | 3.64% | 32,349 |
| 教育 | 2.65% | 23,551 |
| 餐廳及住宿服務 | 13.74% | 122,107 |
| 保險及金融服務 | 4.65% | 41,325 |
| 個人照顧及其他 | 4.26% | 37,859 |

2025 national (total 92.0萬). Known shares [NEWS, S37, quoting DGBAS]:
- 食品飲料及菸草 **15.36%**
- 衣著 **2.57%**
- 住宅水電 **24.09%**
- 醫療保健 **14.08%**
- 交通及通訊 **11.39%**
- 餐廳旅館 **14.19%**
- 教育 22,398 (2.43%) [S36]

The six-group summary [S30] constrains the rest: 食 27.2萬, 衣 2.4, 住 24.8, 行 10.5, 育樂醫療 19.1, 其他 8.2.

[DERIVED / ESTIMATE] 2025 amounts:

| Category | Amount/yr |
|---|---|
| 食品飲料菸酒 | 141,300 |
| 衣著 | 23,600 |
| 住宅水電 | 221,600 |
| 家具設備 | ≈ 26,400 |
| 醫療保健 | 129,500 |
| 交通+通訊 | 104,800 |
| 休閒文化 | ≈ 39,100 |
| 教育 | 22,400 |
| 餐廳旅館 | 130,500 |
| 保險金融 | ≈ 42,800 |
| 其他 | ≈ 39,200 |

臺北市 2025 shares: 住宅水電 28.12%, 食品 14.79%, 餐廳旅館 14.16%. [OFFICIAL Taipei] S42

For a middle (Q3) household, [ESTIMATE] about 87–88萬/year. Apply the national shares, but use health care 14.86% (the Q3 figure).

### C6. Households by type: 夫婦及未婚子女 (nuclear families)

Not obtained. This is 統計表第五表, which I could not read.

[ESTIMATE] disposable income ≈ 145–155萬, consumption ≈ 110–115萬, size ≈ 3.5–3.7 persons. Reasoning: these households have more earners than average, per-person income close to the national 45萬 less a child-dilution effect, and a consumption propensity of about 75%. **Verify before use.**

---

## D. MOF income-tax filing distribution (綜合所得稅, tax year 2023 / 112年度; published 2026-04-30)

The latest year available is 112年度. Source: https://www.fia.gov.tw/WEB/fia/ias/isa112/ISA112.html, tables 8-3-1, 8-3-2 and 6-3-1. [OFFICIAL, S43]

The unit is the **tax-filing unit**, often a couple plus dependents. "總所得" = 綜合所得總額 + separately taxed dividends, in 千元. Tax data exclude tax-exempt income and government transfers.

| Item | 2023 |
|---|---|
| Filing units | 6,880,883 |
| Mean | **1,115千** |
| Median (P50) | **747千** |
| P25 | **438千** |
| P75 | **1,315千** |
| Top 10%: average / median / its own Q1–Q3 | 4,038千 / 3,158千 / 2,622–4,301千 |
| Top 5%: average / median / its own Q1–Q3 | 5,414千 / 4,301千 / 3,599–5,729千 |

The "its own Q1–Q3" values are the 25th–75th percentile range within that top group.

Approximate thresholds [DERIVED]. Each is the midpoint between one group's Q3 and the next group's Q1 in the 20-group table.

| Threshold | Value (千) |
|---|---|
| P10 | ≈ 230 |
| P20 | ≈ 380 |
| P30 | ≈ 490 |
| P40 | ≈ 610 |
| P50 | 747 (exact) |
| P60 | ≈ 920 |
| P70 | ≈ 1,160 |
| P80 | ≈ 1,520 |
| P90 (top-10% threshold) | ≈ **2,290** |
| P95 (top-5% threshold) | ≈ **3,200** |

[ESTIMATE] P99 (top-1% threshold) ≈ **6.3百萬**, P99.5 ≈ 8.4百萬. Method: a Pareto tail fitted to the top 5% group (α ≈ 2.42).

Top-group shares of 總所得: top 10% 36.2%; top 5% 24.3%. [DERIVED] Effective tax rate on the top decile: 12.16%; all units 6.18%.

---

## E. Minimum living expense (最低生活費), per person per month

[OFFICIAL, Taipei City Social Welfare Dept compilation of MOHW and city announcements, S44]

| Region | **2026 (115年度)** | 2025 (114年度) |
|---|---|---|
| 臺北市 | **20,744** | 20,379 |
| 新北市 | **17,750** | 16,900 |
| 桃園市 | **17,186** | 16,768 |
| 臺中市 | **16,431** | 16,077 |
| 臺南市 | **15,515** | 15,515 |
| 高雄市 | **16,970** | 16,040 |
| 臺灣省 (all other counties) | **15,515** | 15,515 |
| 金門縣、連江縣 | **15,173** | 14,341 |

- 中低收入戶 line = 1.5× (for example, 新北 26,625; 桃園 25,779).
- 生活所必需 (the 1.2× amount protected from wage garnishment): 2025 臺灣省 18,618, 臺北 24,455. [OFFICIAL] S45
- Minimum wage: 2026 **29,500/month** [OFFICIAL]. 2025: 28,590/month, 190/hour.
- CONFLICT: uptogo.com.tw labels the 2026 figures as "114年". The Taipei government file is explicitly 115年度, and its 114年度 file shows the lower numbers, so the table above follows the Taipei government.

---

## F. Career wage growth and year-end bonuses

**Age profile (2024 annual total-pay median, all employees, 萬元)** — see A3:

| Age | <25 | 25–29 | 30–39 | 40–49 | 50–64 | 65+ |
|---|---|---|---|---|---|---|
| Median | 38.1 | 52.1 | 58.1 | **62.0** (peak) | 57.9 | 43.9 |

- From <25 to 40–49, the median rises 63%. From 25–29 to 40–49, it rises 19%.
- The local full-time profile is flatter: 44.6 → 64.6 (+45%).
- **Caveat:** these are cross-sections. A real career path also gets general wage growth: 2014–2024 nominal median growth was +20.8% in total, about 1.9% a year.
- Tenure (年資): not obtained. It is in MOL 職類別 detailed tables.

**Year-end bonuses paid in early 2026 (for 2025)** [NEWS quoting DGBAS, S46]:

| Group | Months | Amount |
|---|---|---|
| Industry and services overall | **1.70** | **82,753** |
| 金融保險 | **3.65** | 267,862 |
| 電腦電子光學製造 | 3.54 | 191,177 |
| 化學材料 | 3.06 | n/a |
| 電子零組件 | 2.97 | n/a |
| 製造業 | **2.20** | 102,583 |
| 運輸倉儲 | **1.86** | 96,544 |

The year before: 1.72 months overall; manufacturing 2.17.

Industries with low bonuses (住宿餐飲, 支援服務, 教育, 其他服務): not obtained. [ESTIMATE] about 0.3–0.8 months.

1111人力銀行 survey (bonuses for 2025, Jan 2026) [NEWS, S47]: average **1.58 months** (15-year high). 金融保險 1.97, 營建不動產 1.79, 電子資訊半導體 1.73, 運輸物流 1.72, 醫療照護 1.69.

Public servants and public-school teachers: 1.5 months. [ESTIMATE / policy]

---

## G. The motherhood penalty and women's work

**DGBAS 婦女婚育與就業調查.** The latest results I could verify are from **Oct 2016 (105年)** [OFFICIAL, S49]. The DGBAS tables page was updated 2026-10-01, so newer data may exist; I could not open the xlsx files.

| Measure | All ages 15–64 | Ages 25–49 |
|---|---|---|
| Left work because of marriage (share of those employed before marrying) | **29.92%** | 24.31% |
| Of those, returned to work | **51.10%** | 56.64% |
| Average time out after marriage | **72.95 months (≈ 6.1 yrs)** | 62.48 months |
| Left work at first pregnancy or birth (share of those employed before) | **24.99%** | 25.54% |
| Of those, returned to work | **55.57%** | 56.49% |
| Average time out after childbirth | **65.11 months (≈ 5.4 yrs)** | 55.35 months (≈ 4.6 yrs) |

Other 2016 figures:
- Married women's unpaid care work: 3.81 hrs/day; husbands' 1.13 hrs/day.
- Paid childcare cost: youngest child under 3, **16,007/month**; youngest child 3–6, **8,719/month**.

**Gender pay gap (MOL, 2025 data, released 2026-02-26)** [OFFICIAL, S48]:
- Hourly gap **16.1%**: female 340/hr vs male 405/hr. Women earn 83.9% of men's hourly pay.
- 同酬日 (equal pay day): 2026-02-28. Women need 59 extra days of work.
- The 2024 gap was ≈ 15.8%; the 2011 gap was 17.9%.
- Excluding 電子零組件, the gap is 11.3%. Within 電子零組件 it is 42.7%; within 醫療保健, 43.1%.
- Annual-median view (2024): female 51.2萬 vs male 58.5萬, a 12.5% gap [OFFICIAL, S1].
- Monthly regular median (Jan–Jul 2026): female 37,445 vs male 41,189, a 9.1% gap [NEWS, S17].

**Parental leave (育嬰留職停薪) applicants by sex: NOT OBTAINED.** MOL table 7-3 (https://statdb.mol.gov.tw/html/mon/27030.pdf) has case counts and amounts but no split by sex, and its columns did not extract cleanly.

[ESTIMATE] about 9–10萬 initial applications a year, with men at about 25–30% after the 2024 rules that allow leave in 30-day blocks and top up the allowance to 80% of insured salary. **Verify** with 勞保局 annual statistics.

---

## H. Historical series for the "time machine"

### H1. Average monthly wages (all employees, industry and services)

Labels: 2014, 2015, 2020, 2024, 2025 are [OFFICIAL] annual releases (S51, S11). 2000, 2005, 2010 are [ESTIMATE, from memory of the DGBAS series, not verified this session].

| Year | Avg regular (經常性) | Avg total (總薪資) | Real total, 2021 prices [DERIVED] | Real regular [DERIVED] | Minimum wage |
|---|---|---|---|---|---|
| 2000 | ≈ 34,700 (EST) | ≈ 41,860 (EST) | ≈ 51,080 | ≈ 42,300 | 15,840 |
| 2005 | ≈ 35,400 (EST) | ≈ 43,160 (EST) | ≈ 50,930 | ≈ 41,800 | 15,840 |
| 2010 | ≈ 36,200 (EST) | ≈ 44,360 (EST) | ≈ 49,330 | ≈ 40,300 | 17,280 |
| 2014 | 38,208 | 47,300 | 49,880 | 40,300 | 19,273 |
| 2015 | 38,716 | 48,490 | 51,300 | 40,960 | 20,008 (from Jul) |
| 2020 | 42,498 | 54,320 | 55,390 | 43,330 | 23,800 |
| 2024 | 46,450 | 60,984 | 56,560 | 43,080 | 27,470 |
| 2025 | 47,884 | 63,386 (760,632/yr) | 57,830 | 43,690 | 28,590 |
| 2026 YTD | 49,054 (Jan–Jul) | n/a | n/a | 44,113 (DGBAS real figure, Jan–Jul) | 29,500 |

Notes on the series:
- DGBAS later revised its historical series. MOL Table 1-1 (S50, current values) shows 2015 total 48,956 / regular 38,717; 2020 54,278 / 42,281; 2024 61,002 / 46,450; 2025 63,383 / 47,885.
- The column alignment in the extracted MOL table was ambiguous, so the original release values are used above.
- Minimum wages: [OFFICIAL] S50, S54.

### H2. Annual total-pay median

This series starts in 2012/13, so 2000, 2005 and 2010 are [ESTIMATE] at mean × about 0.79.

| Year | Median (萬元) | Label |
|---|---|---|
| 2000 | ≈ 40 | [ESTIMATE] |
| 2005 | ≈ 41 | [ESTIMATE] |
| 2010 | ≈ 42 | [ESTIMATE] |
| 2015 | 46.0 | [SECONDARY] |
| 2020 | 49.8 (first published as 50.1) | [SECONDARY] |
| 2024 | **54.6** | [OFFICIAL] |
| 2025 | not yet released | expected Nov/Dec 2026 |

### H3. CPI

CPI YoY 2011–2025 is [OFFICIAL] (MOL Table 1-1 / DGBAS). Pre-2011 YoY is from Wikipedia/IMF, rounded to 0.1. Index levels are [DERIVED] by chaining YoY with 2021 = 100 (DGBAS rebased to 2021 = 100 from Jan 2023).

| Year | CPI YoY | Index (2021 = 100) |
|---|---|---|
| 2000 | +1.3% | ≈ 81.9 |
| 2005 | +2.3% | ≈ 84.8 |
| 2010 | +1.0% | ≈ 89.9 |
| 2015 | −0.31% | ≈ 94.5 |
| 2020 | −0.23% | ≈ 98.1 |
| 2021 | +1.97% | 100.0 |
| 2022 | +2.95% | 103.0 |
| 2023 | +2.49% | 105.5 |
| 2024 | +2.18% | ≈ 107.8 |
| 2025 | +1.66% | ≈ 109.6 |
| 2026 (Jan–Sep) | +1.94% | ≈ 111.7 |

The official index levels are in https://ws.dgbas.gov.tw/001/Upload/463/relfile/10315/2703/cpispl.xls, which I could not read.

### H4. Births and total fertility rate (TFR)

[SECONDARY: Wikipedia "Demographics of Taiwan", citing the 內政部. Values for 2000–2020 agree with zh.wikipedia.]

| Year | Births | TFR |
|---|---|---|
| 2000 | 305,312 | 1.68 |
| 2005 | 205,854 | 1.12 |
| 2010 | 166,886 | 0.90 (0.895) |
| 2015 | 213,598 | 1.18 |
| 2020 | 165,249 | 0.99 |
| 2021 | 153,820 | 0.98 |
| 2022 | 138,986 | 0.87 |
| 2023 | 135,571 | 0.86 |
| 2024 | 134,856 | 0.89 |
| **2025** | **107,812** | **0.695** |
| **2026 Jan–Jul** | **54,250** (−15.6% vs 64,314 in Jan–Jul 2025) | n/a |

**Verify 2025 and 2026** at 內政部戶政司 (https://www.ris.gov.tw); I could not fetch it.

---

## Conflicts and caveats

1. **2020 median:** 50.1萬 as originally published vs 49.8萬 in the revised series.
2. **Average wage series:** the original annual releases differ from MOL Table 1-1's current revised values by up to about 0.5% (the 2015 total and the 2020 regular figure).
3. **2026 minimum living expense:** labelled "114年" by one secondary site. The Taipei government file says 115年度, and I follow it.
4. **"Household income":** 所得收入 (145.7萬, 2025) and 所得總額 (152.9萬, 2025) are different concepts, and both differ from 可支配所得 (121.0萬). The Storm county ranking uses 所得收入.
5. **Per-person figures in 2025** are inflated by the drop in household size (2.78 → 2.69). Prefer per-household figures.
6. **Coverage:** the DGBAS median and distribution statistics exclude public servants and public-school staff. Use section B for those groups.
7. **Not obtained, ESTIMATE only:** industry medians for 8 industries; P25/P75 by industry; quintile consumption; county consumption outside the 6 municipalities for 2025; nuclear-family household data; nurse pay; mid-career civil-servant and teacher pay; parental-leave split by sex; post-2016 motherhood survey; official 2000/2005/2010 wages; top-1% tax threshold.

---

## Sources

| ID | Description | URL |
|---|---|---|
| S1 | DGBAS 113年 median release | https://www.stat.gov.tw/News_Content.aspx?n=2716&s=235514 |
| S3 | joelin.cc decile table (copies DGBAS) | https://joelin.cc/p/9747 |
| S4 | 民報 | https://www.peoplenews.tw/articles/hot-news/1740 |
| S5 | CNA | https://www.cna.com.tw/news/afe/202511250287.aspx |
| S6 | 經理人 | https://www.managertoday.com.tw/articles/view/71321 |
| S7 | UDN | https://udn.com/news/story/7238/9162442 |
| S8 | 104 | https://blog.104.com.tw/taiwan-median-salary-2024/ |
| S9 | UDN county medians | https://money.udn.com/money/story/10869/9162951 |
| S10 | UDN D9/D1 ratio | https://money.udn.com/money/story/10869/9162416 |
| S11 | DGBAS 114年 full-year wages | https://www.stat.gov.tw/News_Content.aspx?n=2724&s=235863 |
| S12 | 旺得富 | https://wantrich.chinatimes.com/news/20260211900549-420501 |
| S13 | 104, 2025 industries | https://blog.104.com.tw/2025-taiwan-salary/ |
| S14 | 104, 2024 industries | https://blog.104.com.tw/2024-taiwan-salary/ |
| S15 | TechNews | https://finance.technews.tw/2026/02/11/2025-salary-47884ntd/ |
| S16 | CNA, Jan–Oct 2025 medians | https://www.cna.com.tw/news/afe/202512110079.aspx |
| S17 | 104, Jan–Jul 2026 by age | https://blog.104.com.tw/?p=249395 |
| S18 | DGBAS July 2026 | https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236702 |
| S19 | UDN low pay | https://udn.com/news/story/6656/9754517 (also https://udn.com/news/story/6656/9753990) |
| S20 | 經理人, 2024 regular medians | https://www.managertoday.com.tw/articles/view/69947 |
| S21 | MOL 114年 職類別 | https://www.mol.gov.tw/1607/1632/1633/90814/ ; PDF https://www.mol.gov.tw/media/ruzmmrko/附件_114年職類別薪資調查統計結果-含圖表.pdf?mediaDL=true |
| S22 | MOL 113年 職類別 | https://www.mol.gov.tw/1607/1632/1633/80495/ |
| S23 | UDN, doctors | https://udn.com/news/story/7269/9534539 |
| S24 | UDN / CNA, civil servants | https://udn.com/news/story/6656/9602712 |
| S25 | 商周 | https://www.businessweekly.com.tw/focus/blog/3021860 |
| S26 | 遠見, teachers | https://www.gvm.com.tw/article/116497 |
| S26b | 彰化 school 114年 pay table | https://hyjhes.chc.edu.tw/storage/074541/open_files/檔案下載/人事室/待遇福利/全國軍公教員工待遇支給要點(114.1.1起適用)/114年中小學校公教待遇一覽表-1140101.pdf |
| S27 | UDN, teachers 2026 | https://udn.com/news/story/7339/9605992 |
| S28 | DGBAS 114年 household survey release | https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236591 |
| S29 | DGBAS 114年 full report index | https://www.stat.gov.tw/News_Content.aspx?n=3908&s=236588 |
| S30 | 臺中市主計處 bulletin 115-03 (114年 data, national and 6-city tables) | https://www.dbas.taichung.gov.tw/media/1457179/第115-03號-經濟統計通報-臺中市114-年家庭收支狀況.pdf |
| S31 | NOWnews | https://www.nownews.com/news/6866041 |
| S32 | CNA, 6.17 ratio | https://www.cna.com.tw/news/afe/202608140322.aspx |
| S33 | CNA, county | https://www.cna.com.tw/news/afe/202608160020.aspx |
| S34 | 中時, county | https://www.chinatimes.com/realtimenews/20260816002902-260405 |
| S35 | 風傳媒, county 所得收入 | https://www.storm.mg/lifestyle/11156912 |
| S36 | UDN / CNA, education spending | https://udn.com/news/story/7272/9779558 |
| S37 | 風傳媒, consumption shares 1995 vs 2025 | https://www.storm.mg/article/11165306 |
| S38 | 桃園市主計處 113年 report | https://statbas.tycg.gov.tw/TCSTATRWD/Page/DownloadHandler.aspx?LN=SDB_StatProjReport&Uid=521&FN=113%E5%B9%B4%E6%A1%83%E5%9C%92%E5%B8%82%E5%AE%B6%E5%BA%AD%E6%94%B6%E6%94%AF%E6%A6%82%E6%B3%81%E5%88%86%E6%9E%90.pdf |
| S39 | 臺中市 bulletin 114-05 (113年 data) | https://www.dbas.taichung.gov.tw/media/1297899/%E7%AC%AC114-05%E8%99%9F-%E7%B6%93%E6%BF%9F%E7%B5%B1%E8%A8%88%E9%80%9A%E5%A0%B1-%E8%87%BA%E4%B8%AD%E5%B8%82113%E5%B9%B4%E5%AE%B6%E5%BA%AD%E6%94%B6%E6%94%AF%E6%A6%82%E6%B3%81.pdf |
| S40 | 行政院, health share by quintile | https://www.ey.gov.tw/File/27550CC8D82F9D5A?A=C |
| S41 | Per-person monthly consumption by county, 2011–2023 (DGBAS table reproduced) | https://csr.mcut.edu.tw/var/file/31/1031/img/2105/528706794.pdf |
| S42 | 臺北市主計處 | https://dbas.gov.taipei/cp.aspx?n=2757E651BE951667 |
| S43 | 財政資訊中心 112年度 tables | https://www.fia.gov.tw/WEB/fia/ias/isa112/112_8-3-1.pdf ; https://www.fia.gov.tw/WEB/fia/ias/isa112/112_8-3-2.pdf ; https://www.fia.gov.tw/WEB/fia/ias/isa112/112_6-3-1.pdf |
| S44 | Taipei, minimum living expense | https://service.docms.gov.taipei/attachments/115-income-limit.pdf ; https://service.docms.gov.taipei/attachments/114-income-limit.pdf |
| S45 | 司法院 生活所必需 | https://www.judicial.gov.tw/tw/dl-224568-c5cbf3f7e97b4745a7f06f791d466686.html |
| S46 | UDN / CNA, DGBAS bonuses | https://money.udn.com/money/story/5612/9443738 |
| S47 | 1111 bonus survey | https://www.1111.com.tw/news/jobns/164219 |
| S48 | MOL gender pay gap | https://www.mol.gov.tw/1607/1632/1633/88294/ |
| S49 | DGBAS 105年 婦女婚育與就業調查 | https://www.stat.gov.tw/News_Content.aspx?n=2807&s=26407 ; https://ws.dgbas.gov.tw/public/attachment/7911117100zt9y70g.pdf |
| S50 | MOL Table 1-1 | https://statdb.mol.gov.tw/html/mon/21010.pdf |
| S51 | DGBAS annual wage releases | 2014: https://www.stat.gov.tw/News_Content.aspx?n=2724&s=23566 ; 2015: https://www.stat.gov.tw/News_Content.aspx?n=2724&s=25282 ; 2020: https://www.stat.gov.tw/News_Content.aspx?n=2724&s=27309 ; 2024: https://www.stat.gov.tw/News_Content.aspx?n=2724&s=234606 |
| S52 | DGBAS CPI | https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236759 ; https://www.stat.gov.tw/News_Content.aspx?n=2668&s=235723 ; Wikipedia https://en.wikipedia.org/wiki/Economy_of_Taiwan |
| S53 | Births / TFR | https://en.wikipedia.org/wiki/Demographics_of_Taiwan |
| S54 | Minimum wage history | https://zh.wikipedia.org/wiki/中華民國基本工資 |
| S55 | DGBAS 114年 labour compensation | https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236709 |
| S57 | Taiwan News, Taipei by sex | https://www.taiwannews.com.tw/zh/news/6278114 |
| S58 | 遠見 (low confidence) | https://city.gvm.com.tw/article/129838 |

---

## Machine-readable summary (JSON)

```json
{
  "meta": {"compiled": "2026-10-10", "currency": "TWD", "notes": "labels: OFFICIAL/NEWS/SECONDARY/DERIVED/ESTIMATE"},
  "A_wage_distribution_annual_total_2024": {
    "data_year": 2024, "source": "DGBAS 113年全年總薪資中位數及分布 (released 2025-11-25)",
    "median": 546000, "mean": 732000, "share_below_mean": 0.6875,
    "median_local_fulltime": 585000,
    "deciles": {"P10": 330000, "P20": 381000, "P30": 432000, "P40": 487000, "P50": 546000, "P60": 628000, "P70": 753000, "P80": 959000, "P90": 1336000},
    "P25_estimate": 406000, "P75_estimate": 846000,
    "label_deciles": "P10,P50,P90 NEWS/OFFICIAL; P20-P40,P60-P80 SECONDARY; P25/P75 ESTIMATE",
    "low_pay_line_local_fulltime": 390000, "low_pay_share": 0.168,
    "by_industry_median": {
      "finance_insurance": 1106000, "electricity_gas": 1091000, "computer_electronic_optical_mfg": 899000,
      "electronic_components_mfg": 876000, "publishing_media_ict": 807000, "mining": 682000,
      "manufacturing": 570000, "water_supply_remediation": 505000, "food_feed_mfg": 496000, "textiles": 466000,
      "accommodation_food": 415000, "education_nonschool": 382000, "other_services": 381000,
      "professional_scientific_ESTIMATE": 700000, "health_social_ESTIMATE": 680000, "transport_storage_ESTIMATE": 666000,
      "real_estate_ESTIMATE": 582000, "wholesale_retail_ESTIMATE": 549000, "construction_ESTIMATE": 522000,
      "arts_entertainment_ESTIMATE": 436000, "support_services_ESTIMATE": 415000
    },
    "by_age_median_all": {"under25": 381000, "25_29": 521000, "under30": 468000, "30_39": 581000, "40_49": 620000, "50_64": 579000, "65plus": 439000},
    "by_age_median_local_fulltime": {"under25": 446000, "25_29": 537000, "30_39": 608000, "40_49": 646000, "50_64": 599000, "65plus": 451000},
    "by_sex_median": {"female": 512000, "male": 585000},
    "by_education_median": {"graduate": 1099000, "college_university": 582000},
    "by_firm_size_median": {"500plus": 802000, "4_or_fewer": 395000},
    "by_county_median_local_fulltime": {"hsinchu_city": 902000, "hsinchu_county": 736000, "taipei": 735000, "taoyuan": 616000, "new_taipei": 557000, "kaohsiung": 542000, "tainan": 538000, "taichung": 517000, "chiayi_city": 491000, "changhua": 468000},
    "history_median": {"2014": 452000, "2015": 460000, "2016": 462000, "2017": 472000, "2018": 487000, "2019": 494000, "2020": 498000, "2021": 508000, "2022": 518000, "2023": 525000, "2024": 546000},
    "history_mean": {"2014": 573000, "2015": 587000, "2020": 651000, "2023": 701000, "2024": 732000},
    "history_D1": {"2014": 248000, "2024": 330000}, "history_D9": {"2014": 1046000, "2024": 1336000}
  },
  "A4_average_wages": {
    "2025": {"avg_regular_monthly": 47884, "median_regular_monthly": 38406, "avg_total_annual": 760632, "avg_total_monthly": 63386,
             "local_fulltime": {"avg_regular": 50643, "median_regular": 39890, "avg_total_annual": 806448},
             "parttime": {"avg_regular": 20612, "median_regular": 15788, "avg_total_annual": 262272},
             "share_below_avg_regular": 0.6974, "real_regular_growth": 0.014, "real_total_growth": 0.0221, "cpi": 0.0166,
             "labour_compensation_per_employee": 883000},
    "2024": {"avg_regular_monthly": 46450, "avg_total_monthly": 60984, "median_regular_monthly": 37274},
    "2026_jan_jul": {"avg_regular_monthly": 49054, "cum_total_7m": 483077, "real_avg_regular": 44113},
    "2026_07": {"avg_regular": 49491, "avg_total": 71165, "median_regular": 39629, "median_regular_local_fulltime": 41397},
    "by_industry_2025_annual_total_avg": {"electronic_components": 1332924, "finance": 1320960, "electricity_gas": 1175532, "computer_electronic_optical": 1139592, "publishing_ict": 1037184, "health_social": 847908, "professional_sci": 844140, "manufacturing": 832476, "transport": 813972, "wholesale_retail": 669756},
    "by_industry_2025_regular_monthly_avg": {"finance": 70997, "publishing_ict": 69595, "electricity_gas": 66135, "professional_sci": 58377, "electronic_components": 57096, "health_social": 56196, "computer_electronic_optical": 53463, "transport": 51211, "wholesale_retail": 47483, "manufacturing": 45850, "other_services": 36709, "accommodation_food": 34961},
    "by_industry_2024_monthly_regular_total": {"professional_sci": [56843, 68471], "health_social": [54299, 68900], "transport": [49698, 65305], "mining": [46934, 63898], "real_estate": [44705, 57068], "wholesale_retail": [45834, 53797], "construction": [43266, 51176], "water": [39162, 48030], "arts_ent": [39020, 42697], "support_services": [36657, 40640], "other_services": [35811, 40129], "accommodation_food": [34322, 38555], "finance": [69610, 107348], "electronic_components": [55399, 102150]},
    "median_regular_by_age_2026_jan_jul": {"under25": 29825, "25_29": 36312, "30_39": 40171, "40_49": 43138, "50_64": 44019, "65plus": 38935, "male": 41189, "female": 37445}
  },
  "B_occupations": {
    "mol_2025_survey": {"monthly_ref": "2025-07", "annual_ref": 2024,
      "managers": [81000, 1317000], "professionals": [68000, 1062000], "technicians_associate": [51000, 789000],
      "clerical": [40000, 564000], "service_sales": [37000, 497000], "craft_machine_combined": [38000, 540000], "elementary": [33000, 431000],
      "doctor": [180000, 2497000], "pilot": [298000, 3931000], "lawyer": [93000, 1580000], "electrical_electronic_engineer_annual": 1406000},
    "nurse_monthly_ESTIMATE": [45000, 55000], "nurse_annual_ESTIMATE": [600000, 750000],
    "civil_servant_start_monthly_2026": {"gaokao3_rank6": 55160, "pukao_rank3": 42970, "chukao_rank1": 34880},
    "civil_servant_start_monthly_2027": {"gaokao3_rank6": 59460, "pukao_rank3": 47700, "chukao_rank1": 38360},
    "civil_servant_allowance_raise_2026_07": 2000, "civil_servant_raise_2027": 0.04,
    "civil_servant_bonus_months_ESTIMATE": 1.5, "gaokao3_newhire_annual_2026_DERIVED": 757000,
    "civil_servant_midcareer_annual_ESTIMATE": [900000, 1100000],
    "teacher_start_monthly_2024": {"bachelor": 46700, "master": 54170, "phd": 59740},
    "teacher_start_monthly_2026_incl_allowances": [48000, 51000],
    "teacher_10yr_monthly_ESTIMATE": [63000, 68000], "teacher_homeroom_allowance": 3000
  },
  "C_household_2025": {
    "data_year": 2025, "released": "2026-08-14",
    "households": 9761000, "persons_per_household": 2.69,
    "income_receipts_per_hh": 1457000, "gross_income_per_hh": 1529000,
    "disposable_mean_per_hh": 1210000, "disposable_median_per_hh": 1018000,
    "disposable_mean_per_person": 450000, "disposable_median_per_person": 367000,
    "consumption_per_hh": 920000, "savings_per_hh": 290000, "propensity_consume": 0.760,
    "consumption_per_person_month_DERIVED": 28500,
    "quintile_disposable": {"Q1": 397191, "Q2": 726390, "Q3": 1043274, "Q4": 1435638, "Q5": 2449344},
    "quintile_ratio": 6.17, "gini": 0.341, "per_person_quintile_ratio": 3.73,
    "quintile_consumption_ESTIMATE": {"Q1": 397000, "Q2": 668000, "Q3": 876000, "Q4": 1120000, "Q5": 1555000},
    "health_share_by_quintile_2024": {"all": 0.1476, "Q1": 0.1699, "Q2": 0.1559, "Q3": 0.1486, "Q4": 0.1428, "Q5": 0.1407},
    "consumption_categories_2025_DERIVED": {"food_bev_tobacco": 141300, "clothing": 23600, "housing_utilities_incl_imputed_rent": 221600, "furnishings": 26400, "health": 129500, "transport_and_ict": 104800, "recreation_culture": 39100, "education": 22398, "restaurants_hotels": 130500, "insurance_finance": 42800, "other": 39200},
    "consumption_shares_2024_official": {"food_nonalc": 0.1429, "alc_tobacco": 0.0101, "clothing": 0.0262, "housing_utilities": 0.2396, "furnishings": 0.0292, "health": 0.1476, "transport": 0.0771, "ict": 0.0381, "recreation": 0.0364, "education": 0.0265, "restaurants_hotels": 0.1374, "insurance_finance": 0.0465, "other": 0.0426},
    "household_size_share": {"one_person": 0.1733, "two_person": 0.3427},
    "nuclear_family_ESTIMATE": {"disposable": [1450000, 1550000], "consumption": [1100000, 1150000], "size": [3.5, 3.7]},
    "by_county_disposable_per_hh": {
      "hsinchu_city": 1604000, "hsinchu_county": 1569000, "taipei": 1554600, "taoyuan": 1282000, "new_taipei": 1263000,
      "taichung": 1216050, "kaohsiung": 1206000, "tainan": 1045000, "national": 1210000,
      "chiayi_city_ESTIMATE": 1190000, "miaoli_ESTIMATE": 1149000, "yilan_ESTIMATE": 989000, "keelung_ESTIMATE": 965000,
      "pingtung_ESTIMATE": 953000, "penghu_ESTIMATE": 936000, "changhua_ESTIMATE": 911000, "yunlin_ESTIMATE": 905000,
      "nantou_ESTIMATE": 885000, "hualien_ESTIMATE": 865000, "chiayi_county_ESTIMATE": 852000, "taitung_ESTIMATE": 806000,
      "kinmen_lienchiang": null
    },
    "by_county_income_receipts_per_hh": {"hsinchu_city": 2042624, "hsinchu_county": 2007347, "taipei": 1857943, "taoyuan": 1557567, "new_taipei": 1506244, "kaohsiung": 1469589, "taichung": 1467445, "chiayi_city": 1434177, "miaoli": 1384012, "tainan": 1263654, "yilan": 1191108, "keelung": 1161995, "pingtung": 1147344, "penghu": 1127048, "changhua": 1097348, "yunlin": 1089198, "nantou": 1065279, "hualien": 1041688, "chiayi_county": 1026136, "taitung": 970508},
    "by_county_consumption_per_hh": {"taipei": 1170000, "taichung": 987000, "kaohsiung": 955000, "taoyuan": 964000, "new_taipei": 940000, "tainan": 811000, "national": 920000},
    "by_county_consumption_per_person_month_2023": {"taipei": 34014, "hsinchu_city": 31211, "hsinchu_county": 29578, "taichung": 26957, "kaohsiung": 26399, "new_taipei": 26226, "chiayi_city": 25599, "taoyuan": 25235, "keelung": 24234, "yilan": 23808, "tainan": 22661, "pingtung": 21594, "hualien": 21484, "taitung": 21412, "miaoli": 21017, "penghu": 20971, "yunlin": 20356, "chiayi_county": 19410, "changhua": 19292, "nantou": 18650, "national": 25726},
    "by_county_education_spend_per_hh": {"hsinchu_county": 46365, "hsinchu_city": 32750, "taichung": 28241, "taoyuan": 26609, "kaohsiung": 25919, "taipei": 24626, "new_taipei": 21843, "tainan": 20123, "national": 22398}
  },
  "C_household_2024": {"disposable_mean": 1165206, "disposable_median": 984700, "consumption": 888699, "savings": 276507, "persons_per_hh": 2.78, "quintile_disposable": {"Q1": 383927, "Q2": 701178, "Q3": 1001276, "Q4": 1382254, "Q5": 2357393}, "ratio": 6.14},
  "D_tax_filing_2023": {
    "unit": "tax filing unit", "measure": "綜合所得總額+分開計稅股利 (thousand TWD -> TWD below)", "units": 6880883,
    "mean": 1115000, "median": 747000, "P25": 438000, "P75": 1315000,
    "thresholds_DERIVED": {"P10": 230000, "P20": 380000, "P30": 490000, "P40": 610000, "P60": 920000, "P70": 1160000, "P80": 1520000, "P90": 2290000, "P95": 3200000},
    "P99_ESTIMATE": 6300000, "P99_5_ESTIMATE": 8400000,
    "top10_avg": 4038000, "top5_avg": 5414000, "top10_income_share": 0.362, "top5_income_share": 0.243
  },
  "E_min_living_expense_per_person_month": {
    "2026": {"taiwan_province": 15515, "taipei": 20744, "new_taipei": 17750, "taoyuan": 17186, "taichung": 16431, "tainan": 15515, "kaohsiung": 16970, "kinmen_lienchiang": 15173},
    "2025": {"taiwan_province": 15515, "taipei": 20379, "new_taipei": 16900, "taoyuan": 16768, "taichung": 16077, "tainan": 15515, "kaohsiung": 16040, "kinmen_lienchiang": 14341},
    "minimum_wage_monthly": {"2025": 28590, "2026": 29500}
  },
  "F_bonus": {
    "dgbas_paid_early_2026": {"overall_months": 1.70, "overall_amount": 82753, "finance_months": 3.65, "finance_amount": 267862, "computer_electronic_months": 3.54, "computer_electronic_amount": 191177, "chemical_months": 3.06, "electronic_components_months": 2.97, "manufacturing_months": 2.20, "manufacturing_amount": 102583, "transport_months": 1.86, "transport_amount": 96544, "prior_year_overall_months": 1.72},
    "survey_1111_for_2025": {"avg_months": 1.58, "finance": 1.97, "construction_realestate": 1.79, "electronics_it": 1.73, "transport": 1.72, "healthcare": 1.69},
    "low_bonus_industries_months_ESTIMATE": [0.3, 0.8], "public_sector_months": 1.5
  },
  "G_women": {
    "survey_year": 2016,
    "left_at_marriage": 0.2992, "returned_after_marriage_exit": 0.5110, "months_out_after_marriage": 72.95,
    "left_at_first_birth": 0.2499, "returned_after_birth_exit": 0.5557, "months_out_after_birth": 65.11,
    "age25_49": {"left_at_marriage": 0.2431, "returned": 0.5664, "months_out_marriage": 62.48, "left_at_birth": 0.2554, "returned_birth": 0.5649, "months_out_birth": 55.35},
    "unpaid_care_hours_wife": 3.81, "unpaid_care_hours_husband": 1.13,
    "childcare_cost_month_2016": {"under3": 16007, "age3_6": 8719},
    "gender_pay_gap_hourly_2025": 0.161, "female_hourly": 340, "male_hourly": 405, "gap_2024": 0.158, "gap_2011": 0.179,
    "gap_excl_electronic_components": 0.113, "gap_electronic_components": 0.427, "gap_healthcare": 0.431,
    "parental_leave_male_share_ESTIMATE": [0.25, 0.30], "parental_leave_initial_apps_per_year_ESTIMATE": [90000, 100000]
  },
  "H_history": {
    "avg_regular_monthly": {"2000_ESTIMATE": 34700, "2005_ESTIMATE": 35400, "2010_ESTIMATE": 36200, "2014": 38208, "2015": 38716, "2020": 42498, "2024": 46450, "2025": 47884, "2026_jan_jul": 49054},
    "avg_total_monthly": {"2000_ESTIMATE": 41861, "2005_ESTIMATE": 43163, "2010_ESTIMATE": 44359, "2014": 47300, "2015": 48490, "2020": 54320, "2024": 60984, "2025": 63386},
    "real_total_monthly_2021prices_DERIVED": {"2000": 51080, "2005": 50930, "2010": 49330, "2015": 51300, "2020": 55390, "2024": 56560, "2025": 57830},
    "real_regular_monthly_2021prices_DERIVED": {"2000": 42300, "2005": 41800, "2010": 40300, "2015": 40960, "2020": 43330, "2024": 43080, "2025": 43690, "2026_jan_jul_official": 44113},
    "median_annual_total": {"2000_ESTIMATE": 400000, "2005_ESTIMATE": 410000, "2010_ESTIMATE": 420000, "2015": 460000, "2020": 498000, "2024": 546000},
    "cpi_index_2021eq100_DERIVED": {"2000": 81.9, "2005": 84.8, "2010": 89.9, "2015": 94.5, "2020": 98.1, "2021": 100.0, "2022": 103.0, "2023": 105.5, "2024": 107.8, "2025": 109.6, "2026_est": 111.7},
    "cpi_yoy": {"2000": 0.013, "2005": 0.023, "2010": 0.010, "2015": -0.0031, "2020": -0.0023, "2021": 0.0197, "2022": 0.0295, "2023": 0.0249, "2024": 0.0218, "2025": 0.0166, "2026_jan_sep": 0.0194},
    "minimum_wage_monthly": {"2000": 15840, "2005": 15840, "2010": 17280, "2015": 20008, "2020": 23800, "2024": 27470, "2025": 28590, "2026": 29500},
    "births": {"2000": 305312, "2005": 205854, "2010": 166886, "2015": 213598, "2020": 165249, "2021": 153820, "2022": 138986, "2023": 135571, "2024": 134856, "2025": 107812, "2026_jan_jul": 54250, "2025_jan_jul": 64314},
    "tfr": {"2000": 1.68, "2005": 1.12, "2010": 0.895, "2015": 1.18, "2020": 0.99, "2021": 0.98, "2022": 0.87, "2023": 0.865, "2024": 0.885, "2025": 0.695}
  }
}
```
