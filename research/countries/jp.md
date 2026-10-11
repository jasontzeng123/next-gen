# 日本（Japan）：「你有資格生下一代嗎？」跨國比較資料

Compiled 2026-10-12. Every number gives its data year and a source URL. Amounts are JPY (円) unless marked. 万円 = 10,000 円.

**Confidence labels** (same convention as `income.md`):
- **[OFFICIAL]**: read directly on a government or public-agency page or PDF.
- **[NEWS]**: a news or trade-press report quoting an official release.
- **[SECONDARY]**: a private data site or bank copying an official or industry table.
- **[DERIVED]**: my own arithmetic on sourced numbers. The method is shown.
- **[ESTIMATE]**: my judgement. The reasoning is shown.
- **[UNVERIFIED]**: background knowledge I could not re-check this session.

**Limits of this session:**
- The shared web-search budget ran out near the end, so a few items are marked "not found".
- `curl` to mhlw.go.jp, imf.org and similar hosts is blocked by the proxy, so xlsx tables could not be downloaded. Numbers come from pages the fetch tool could read.

---

## 摘要（繁體中文）

日本的養育條件和台灣有幾個根本差異：
- **補助是「普及式」的。** 兒童手當沒有排富，一路發到高中畢業。0–2 歲托育費依所得計算，而東京與大阪市已改為免費。3–5 歲托育與幼兒園全面免費。出生時的「出產育兒一時金」50 萬日圓，約可涵蓋一般分娩費用。
- **稅與社會保險另成一套。** 日本採個人分開課稅。16 歲以下子女沒有扶養扣除，因為已改發兒童手當。社會保險的員工負擔約占薪資 14.7–15.5%。
- **房價、房貸與台灣不同。** 東京 23 區新成屋每坪價格已經超過台北。但日本的面積是「專有面積」（不含公設），台灣的權狀坪數含公設，兩者不能直接比。房貸以浮動利率為主，2026 年起利率明顯上升。

### 最重要的 15 個數字

| 項目 | 數值 | 年份 | 來源 |
|---|---|---|---|
| 匯率（台銀即期，買賣中價） | 1 日圓 ≈ **0.2017 新台幣**（買 0.1997／賣 0.2037） | 2026-10-08 | [台灣銀行](https://rate.bot.com.tw/xrt/quote/l6m/JPY) |
| 購買力平價（PPP）換算 | 日本 94.69 日圓／國際元（IMF）；台灣約 13.65 元／國際元（推算）。PPP 下 1 日圓 ≈ **0.144 新台幣**，市場匯率高估日本購買力約 40% | 2025 | [IMF](https://www.imf.org/external/datamapper/api/v1/PPPEX/JPN/TWN)；台灣為推算，見 §1 |
| 受薪者平均年薪（含獎金，全年在職，含非正職） | **487 萬日圓**（約 98 萬台幣）。正職 559 萬，非正職 210 萬。獎金占 15% | 2025 | [國稅廳 民間給与実態統計調査](https://www.nta.go.jp/information/release/kokuzeicho/2026/minkan_2026/pdf/01.pdf) |
| 一般勞工月薪（所定內薪資） | 34.06 萬日圓／月，年增 3.1% | 2025 | [厚勞省 賃金構造基本統計調査](https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2025/index.html) |
| 家戶所得中位數 | **451 萬日圓**（平均 575.2 萬）。有兒童家戶平均 857.3 萬 | 2024 年所得（2025 調查） | [厚勞省 国民生活基礎調査](https://www.mhlw.go.jp/toukei/saikin/hw/k-tyosa/k-tyosa25/dl/03.pdf) |
| 東京 23 區新成屋大樓 | 平均 **1 億 3,613 萬日圓**；每 ㎡ **210.9 萬**（約 140.6 萬台幣／坪，專有面積） | 2025 | [nippon.com](https://www.nippon.com/ja/japan-data/h02685/)；[CREX](https://www.crex-data.com/industry/realestate/condominium/price-trend)（不動產經濟研究所） |
| 東京 23 區中古大樓成交 | 每 ㎡ **137.96 萬**；平均 7,941 萬日圓、57.6 ㎡ | 2026 Q1 | [東日本 REINS](https://www.reins.or.jp/pdf/trend/sf/sf_202601-03.pdf) |
| 房價所得比（Flat35 貸款戶） | 新成屋大樓：全國 7.5、首都圈 8.4 倍；中古大樓：全國 5.6 倍 | FY2025 | [住宅金融支援機構](https://www.jhf.go.jp/files/topics/4941_ext_99_1.pdf) |
| 房貸利率 | 浮動 **約 1.0–1.3%**（三菱 UFJ 1.195%）；Flat35 全期固定 **3.83%**（歷史新高）；日銀政策利率 1.25% | 2026-10 | [0systems](https://0systems.com/2026/10/03/53465/)；[熊日](https://kumanichi.com/articles/2041676)；[熊日](https://kumanichi.com/articles/2037289) |
| 員工社會保險負擔 | 約 **14.7%** 薪資（40–64 歲 15.5%）：厚生年金 9.15%、健保 4.925%（東京）、介護 0.81%、子育支援金 0.115%、雇用 0.5% | 2026 | 見 §5 |
| 兒童手當 | 0–2 歲 **15,000 日圓／月**；3 歲至高中 **10,000**；第 3 子起 **30,000**；無排富 | 2024-10 起 | [大阪府](https://www.pref.osaka.lg.jp/o090135/kateishien/teate/jite_202410.html) |
| 生產 | 出產育兒一時金 **50 萬**；一般分娩平均約 **52 萬**（東京 64.8 萬）。另有妊婦支援給付 5 萬 + 5 萬／每名新生兒 | FY2024–2025 | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=18784)；[港區](https://www.city.minato.tokyo.jp/chiikihoken/kodomo/syusankosodate07.html) |
| 育嬰給付 | 前 180 天 **67%**，之後 50%，至 1 歲（最長 2 歲）。月上限 332,454 / 248,100 日圓。雙親各請 14 天以上，再加 13%（最多 28 天）達 80%，約等於實領全薪 | 2026-08 起 | [MMEA](https://www.mmea.biz/news/52483-2/)；[MoneyForward](https://biz.moneyforward.com/payroll/basic/111917/) |
| 教育費（文科省，每年） | 公立：小學 33.6 萬、國中 54.2 萬、高中 59.8 萬。私立：小學 182.8 萬、國中 156.0 萬、高中 103.0 萬。幼稚園到高中 15 年：全公立 **596 萬**、全私立 **1,976 萬** | 2023 學年度 | [文部科學省](https://www.mext.go.jp/content/20241225-mxt_chousa01_000039333_1.pdf) |
| 生育狀況 | 出生 **671,270** 人；總生育率 **1.14**（歷史新低）；第一胎母親平均年齡 31.0 歲（2024）。理想子女數未達成的首要原因：「養育與教育太花錢」52.6% | 2025 | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=24336)；[JILI](https://www.jili.or.jp/lifeplan/lifeevent/801.html) |

### 對應到遊戲模型（How this maps to the game's model）

| 台灣參數（`src/data.js`） | 日本對應數字 | 備註 |
|---|---|---|
| `WAGE.median`（全體受僱者全年總薪資中位數） | 國稅廳平均 487 萬（2025）。中位數**未公布**；由 2024 年級距推算約 **410 萬** [DERIVED] | 國稅廳只公布平均數與級距。見 §2.2 |
| `WAGE.q`（十分位比值） | 只有粗略級距：P32≈300 萬、P48≈400 萬、P63≈500 萬、P88≈800 萬、P94≈1,000 萬 | **D1–D9 精確值未找到**。OECD 有日本全職者十分位比，本次未取得 |
| `WAGE.age`（年齡別／全體） | 厚勞省 2025 年齡別月薪比（對平均）：20–24 0.71；25–29 0.82；30–34 0.92；35–39 1.00；40–44 1.07；45–49 1.11；50–54 1.14；55–59 1.16；60–64 0.97；65–69 0.84 | 這是對**平均數**的比值，不是中位數；只含一般勞工（全職）。§2.3 |
| `INDUSTRIES[].bonus`（年終月數） | 平均獎金 75 萬 ≈ **2.2 個月**月薪；正職 102 萬 ≈ 2.7 個月 [DERIVED] | 日本獎金分夏、冬兩次發 |
| `WAGE.toBase`（2024→2026 薪資換算） | 2025 一般勞工月薪 +3.1% | 2026 年漲幅**未找到**。建議暫用 ×1.03 [ESTIMATE] |
| `HOUSEHOLD.disposable` / `consumption`（五分位） | 年收五分位表**未找到**。可用的有：國民生活基礎調查所得中位數 451 萬、平均 575.2 萬；家計調查勤勞者家戶可支配所得 53.2 萬／月、消費 34.6 萬／月 | 見 §3 |
| `TAX.*`（綜所稅） | 全部改為日本制度：所得稅 7 級 5–45%（加 2.1% 復興稅）、住民稅 10% + 均等割 5,000、給與所得控除、基礎控除（2026 年最高 104 萬） | **個人分開課稅**。16 歲以下子女無扶養扣除。見 §5 |
| `SI.*`（勞健保） | 厚生年金 9.15%（月薪上限 65 萬）；健保約 4.925%；介護 0.81%（40–64 歲）；子育支援金 0.115%；雇用 0.5% | **健保不按眷屬人數加收**，這點與台灣不同 |
| `BENEFIT.birthPerBaby` | 出產育兒一時金 50 萬，加妊婦支援給付 5 萬 + 5 萬／新生兒 | 一時金幾乎等於分娩費，淨效果接近免費生產 |
| `BENEFIT.allowance02` / `allowance26` | 兒童手當 15,000（0–2 歲）／10,000（3–18 歲）；第 3 子起 30,000 | **與是否送托無關**，一律發放到高中畢業（18 歲後的 3/31） |
| `CARE.*` / `BENEFIT.carePublic` / `careQuasi` | 0–2 歲認可保育所月費依住民稅計算。年收 600 萬家庭在東京各區約 2.2–3.5 萬（未免費前）。**東京 2025-09 起第 1 子免費**；大阪市 2026-09 起免費 | 全國其他地方：0–2 歲只有非課稅家戶與第 3 子起免費 |
| `KG.*` / `BENEFIT.kgCap` | 3–5 歲全面免費（2019-10 起）。家長仍付伙食費、雜費。學習費：公立幼稚園 18.5 萬／年，私立 34.7 萬／年 | |
| `BENEFIT.leaveRate`、`leaveInsMax`、`leaveMonths` | 0.67（前 180 天）→ 0.50；月上限 332,454 / 248,100；可請到 12 個月（最長 24 個月）；雙親各請 14 天以上可加成至 0.80（28 天） | 給付**免稅**，且請假期間**免繳社保**，所以 67% 約等於實領 80% |
| `COST.elementaryPublic` 等學費 | 見 §7.2（文科省各學制每年費用） | 公立國中補習等「補助學習費」27.2 萬／年 |
| `COST.uni` | 國立學費標準 535,800／年（入學金 282,000）。私立平均：學費 968,069、入學金 240,365、設施費 172,550（2025） | 多子家庭（同時扶養 3 名以上子女）學費免費，無排富 |
| `COST.uniAwayRent` | 大學生在外租屋，含學費的年總花費：國立 180.1 萬、私立 268.9 萬 | JASSO 2024 |
| `COUNTIES[].price` / `priceNew` | 東京 23 區：新屋 210.9 萬／㎡、中古 137.96 萬／㎡。大阪市新屋 116.0 萬／㎡；大阪府中古 55.67 萬／㎡。全國新屋 104.5 萬／㎡ | **專有面積，不含公設**。換成台灣權狀坪比較時，台灣價格要先除以 (1−公設比) |
| `COUNTIES[].rent` | 23 區單身套房（≤30㎡）募集租金 111,922；分讓大樓出租每 ㎡：23 區 5,078、大阪市 3,508、福岡市 2,577、名古屋 2,343 | 依間取（格局）分的官方租金**未找到**。§4.4 有推算表 |
| `COUNTIES[].pir` | Flat35 貸款戶：首都圈新屋大樓 8.4、近畿 7.7、全國 7.5 | 這是購屋者的所得，高於一般家戶 |
| `BANK` / `QINGAN` | 浮動 ~1.2%、Flat35 3.83%；期間 35 年（50 年房貸已普及）；自備款平均約 13%（新屋大樓 23.5%） | 日本**沒有**類似新青安的政策利率。有「住宅ローン減税」：年底餘額 0.7% 抵稅 13 年 |
| `COST.houseSize` | 新屋大樓平均：23 區約 64.5 ㎡ [DERIVED]、大阪市 43.3 ㎡、近畿 55.9 ㎡ | |
| `HISTORY.tfr` / `births` | TFR 1.14、出生 671,270（2025） | |

### 模型需要的結構性調整

1. **稅制改成個人課稅。** 夫妻各自計算所得稅與住民稅，不需要「合併 vs 分開」的比較。配偶收入低時，另一方可用配偶控除 38 萬。住民稅依前一年所得計算，所以有一年的時間差。
2. **子女扣除邏輯不同。**
   - 0–15 歲：沒有扶養扣除，以兒童手當取代。
   - 16–18 歲：扶養控除 38 萬（住民稅 33 萬）。
   - 19–22 歲：特定扶養 63 萬。
   - 台灣的「幼兒學前特別扣除額」在日本沒有對應項目。
3. **健保沒有眷屬加費。** 台灣模型的 `nhi × (1 + deps)` 要改成固定費率乘以本人薪資。年收約 130 萬以下的配偶可成為被扶養者，免繳保費。
4. **0–2 歲托育費依城市差很大。** 東京與大阪市免費，其他城市依所得計費。建議日本版的「縣市」至少分成東京 23 區、大阪市、地方都市三類。
5. **育嬰期間免繳社保，給付免稅。** 這會讓實際替代率比台灣高很多。雙親都請假時，前 28 天可達到實領全薪。
6. **兒童手當不因送托而停發。** 台灣的育兒津貼在使用公共或準公共托育時會改成托育補助；日本兩者並存。
7. **面積口徑不同。** 日本房價與租金都以專有面積計算。遊戲的 `houseSize`（坪，含公設）在日本要改用 ㎡ 專有面積，例如 2LDK 約 55–65 ㎡、3LDK 約 65–75 ㎡。
8. **建物折舊大。** 日本建物會明顯折舊，中古屋比新屋便宜很多，23 區中古單價約是新屋的 65%。房價上漲情境不宜直接套用台灣的 `usedFactor`。
9. **高中與大學。** 2026 年起高中學費補助不分所得：公立 11.88 萬、私立最高 45.72 萬，私立仍可能有自付差額。大學只有多子家庭與低收入家庭有全額減免。
10. **生產幾乎不花錢，但「月子中心」不是常態。** 日本的產後照護屬於市町村的「產後ケア事業」，本次未查價。遊戲可以把月子中心選項改成「產後ケア」，或在日本版直接拿掉。

---

## 1. Currency

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| JPY→TWD spot, Bank of Taiwan, buying / selling | 0.1997 / 0.2037. Mid **0.2017**. | 2026-10-08 | [rate.bot.com.tw](https://rate.bot.com.tw/xrt/quote/l6m/JPY) | [OFFICIAL] |
| 6-month range of the spot buying rate | 0.1937 (06-22) to 0.2051 (08-03) | 2026-04-13 to 2026-10-08 | same | [OFFICIAL] |
| Japan implied PPP conversion rate (IMF WEO, GDP basis) | 2023: 93.50; 2024: 94.157; **2025: 94.694**; 2026f: 93.306 JPY per international $ | WEO | [IMF DataMapper API](https://www.imf.org/external/datamapper/api/v1/PPPEX/JPN/TWN) | [OFFICIAL] |
| Taiwan PPP conversion rate | **≈13.65 TWD per international $** (2025) | 2025 | Derived. Measured World quotes IMF WEO (May 2026): Taiwan GDP PPP 2,102 bn and nominal 920 bn USD, ratio 2.285 ([page](https://measuredworld.com/countries/taiwan/economy/gdp)). The IMF 2025 exchange rate is 31.19 TWD/USD ([GlobalNote](https://www.globalnote.jp/post-2796.html?cat_no=104)). 31.19 / 2.285 = 13.65. 2024 cross-check: ≈13.67. | [DERIVED] |
| PPP cross rate JPY→TWD | 13.65 / 94.69 = **0.144 TWD per JPY** | 2025 | from the two rows above | [DERIVED] |
| Market rate relative to PPP | 0.2017 / 0.144 = **1.40**. At market rates, yen amounts look about 40% "bigger" in TWD than their purchasing power in Taiwan. | 2025–26 | same | [DERIVED] |

The World Bank page (PA.NUS.PPP) and GlobalNote did not show values to the fetch tool, and the World Bank does not cover Taiwan. The IMF Taiwan series could not be read directly, which is why the Taiwan figure is derived.

**Recommendation.**
- Run the Japan simulation entirely in JPY and convert only for display.
- Show both market-rate TWD and PPP-TWD.
- For "the same household in Japan", map the household by **income percentile**, not by converting its TWD salary. The verdict depends on cost-to-income ratios, which need no currency conversion.

---

## 2. Wages

### 2.1 MHLW 賃金構造基本統計調査 2025 (令和7年; released 2026-03-24)

General workers (一般労働者, roughly full-time), monthly 賃金 (所定内給与), June 2025 pay. Source: [MHLW z2025 index](https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2025/index.html), summarised by [かいけつ人事労務](https://www.kaiketsu-j.com/?p=21324). [OFFICIAL / NEWS]

| Group | Monthly wage | YoY | Average age |
|---|---|---|---|
| All | **340,600** | +3.1% (record high) | 44.4 |
| Men | 373,400 | +2.8% | 45.2 |
| Women | 285,900 | +3.9% | 43.2 |
| Large firms | 385,100 | +5.7% | |
| Medium firms | 326,200 | +1.0% | |
| Small firms | 305,600 | +2.1% | |

The gender gap is women = 76.6 (men = 100), the smallest on record.

The annual bonus (年間賞与その他特別給与額) for 2025 was **not found**. The overview pages did not include it, and the xlsx tables could not be downloaded.

### 2.2 NTA 民間給与実態統計調査 2025 (令和7年分; released 2026-09-29)

Covers people employed for the whole year (1年を通じて勤務した給与所得者): **51.63 million**, including part-timers. This is the closest analog to Taiwan's 「全年總薪資」 (all employees, bonuses included). Source: [NTA release PDF](https://www.nta.go.jp/information/release/kokuzeicho/2026/minkan_2026/pdf/01.pdf). [OFFICIAL]

| Group | Average annual pay | of which salary and allowances | of which bonus |
|---|---|---|---|
| All | **487万** (+9.1万 YoY, 5th straight rise) | 412万 | 75万 (15.4%) |
| Men | 597万 | 501万 | 96万 |
| Women | 342万 | 295万 | 47万 |
| 正社員 (regular staff) | 559万 | 457万 | 102万 (18.2%) |
| 正社員以外 (non-regular) | 210万 | 198万 | 12万 |

**Bonus in months [DERIVED]:**
- All workers: 75 / (412 / 12) ≈ **2.2 months**.
- Regular staff: 102 / (457 / 12) ≈ **2.7 months**.

**Distribution (2024, 令和6年分; 51.37 million workers, average 478万)** [NEWS, [All About](https://allabout.co.jp/gm/gc/514385/)]:

| Pay band | Share |
|---|---|
| ≤300万 | 32.0% |
| 300–500万 | 31.4% (of which 300–400万 = 16.1%, the modal band) |
| 500–800万 | 24.7% |
| 800–1000万 | 5.8% |
| >1000万 | 6.2% |

**Percentiles derived from the cumulative shares [DERIVED]:**
- P32 ≈ 300万
- P48 ≈ 400万
- P63 ≈ 500万
- P88 ≈ 800万
- P94 ≈ 1000万
- **Median ≈ 410万.** I assumed the 400–500万 band holds about 15.3% and interpolated linearly.

As ratios to the median: P32 ≈ 0.73, P63 ≈ 1.22, P88 ≈ 1.95, P94 ≈ 2.4. Linear interpolation puts P90 at about **2.1×** the median. Taiwan's P90 is 2.45×.

**Not found:**
- The NTA 100万-band table for 2025, so no D1–D3 for the lower tail.
- The OECD decile ratios (D9/D1, D5/D1) for Japan, which exist in the OECD Earnings database ([dataset](https://db.nomics.world/OECD/DSD_EARNINGS@DEC_I)).
- The MHLW 所定内給与 distribution (十分位数) for 2025. It is published as an e-Stat table that could not be downloaded.

### 2.3 Earnings by age, MHLW 2025 (general workers, monthly 賃金, 千円)

Source: [MHLW z2025 dl/02.pdf](https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2025/dl/02.pdf). [OFFICIAL]

| Age | All | Men | Women | Ratio to all-age average (340.6) [DERIVED] |
|---|---|---|---|---|
| ≤19 | 208.3 | 212.5 | 201.4 | 0.61 |
| 20–24 | 242.8 | 245.7 | 239.6 | 0.71 |
| 25–29 | 279.4 | 288.0 | 268.8 | 0.82 |
| 30–34 | 312.3 | 330.4 | 283.2 | 0.92 |
| 35–39 | 340.6 | 366.2 | 292.4 | 1.00 |
| 40–44 | 364.3 | 398.2 | 303.6 | 1.07 |
| 45–49 | 377.9 | 420.7 | 305.7 | 1.11 |
| 50–54 | 388.8 | 437.5 | 305.4 | 1.14 |
| 55–59 | 396.2 | 445.6 | 305.7 | 1.16 |
| 60–64 | 329.3 | 358.5 | 270.8 | 0.97 |
| 65–69 | 285.3 | 304.3 | 240.7 | 0.84 |

- Men's wages peak at 55–59, at 181.4 when 20–24 = 100. Women's curve is much flatter, peaking at 127.6.
- **Caution:** the 35–39 value is identical to the all-age figure (340.6). This may be a coincidence or an extraction error. Re-check against [zuhyo.xlsx](https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2025/xls/zuhyo.xlsx) before using it.
- The ratios use the mean, not the median, and cover full-time workers only. The Japanese age curve is steeper than Taiwan's: 50–59 reaches about 1.15 in Japan versus 1.06–1.14 in Taiwan.

---

## 3. Households

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Mean household income, all households | **575.2万** (+7.3%, the largest rise on record) | 2024 income (2025 survey) | [MHLW 国民生活基礎調査 2025, 03.pdf](https://www.mhlw.go.jp/toukei/saikin/hw/k-tyosa/k-tyosa25/dl/03.pdf) | [OFFICIAL] |
| Median household income | **451万** | 2024 | same | [OFFICIAL] |
| Mean income, households with children | **857.3万** | 2024 | same | [OFFICIAL] |
| Mean income, non-elderly households | 700.7万 | 2024 | same | [OFFICIAL] |
| Share of households at or below the mean | 61.5% | 2024 | same | [OFFICIAL] |
| Median equivalized disposable income / poverty line | 277万 / 138万 | 2024 | same | [OFFICIAL] |
| Households with children saying life is hard (苦しい) | **61.5%** (54.7% in 2022). All households 55.4%; single mothers 82.1%. | 2025 | same | [OFFICIAL] |
| Two-or-more-person **worker** households: monthly 実収入 / 可処分所得 / 消費支出 | 653,901 / **532,408** / **346,297**. Average propensity to consume 65.0%. 3.20 persons, 1.81 earners, head aged 51.0. | 2025 | [Statistics Bureau 家計調査 2025 summary](https://www.stat.go.jp/data/kakei/2025np/pdf/summary.pdf) | [OFFICIAL] |
| Two-or-more-person households (all): monthly 消費支出 | 314,001 (+0.9% real). 2.87 persons, head aged 60.7. | 2025 | same | [OFFICIAL] |
| Worker households incl. singles: monthly consumption by head's age | 30–39: 246,671 (2.56 persons); 40–49: 306,379 (3.15 persons) | 2024 | [JIL databook (家計調査)](https://www.jil.go.jp/kokunai/statistics/databook/2026/09/d2026_9T-03-1.pdf) | [OFFICIAL] |

The 家計調査 consumption and income **by annual-income quintile** (年間収入五分位) were **not found**. The tables are on e-Stat (家計調査 詳細結果表) but could not be reached. A fallback is the 2019 全国家計構造調査, which was not checked.

**Rough annualisation for the game [DERIVED]:** worker households have disposable income of about 6.39M per year and consumption of about 4.16M per year (×12).

---

## 4. Housing

### 4.1 New condominiums (不動産経済研究所), calendar 2025

| Area | Average price | Price per ㎡ (専有面積) | Average area | Source | Label |
|---|---|---|---|---|---|
| Tokyo 23 wards | **13,613万** (+21.8%) | **210.9万** | ≈64.5 ㎡ [DERIVED: price ÷ ㎡ price] | [nippon.com](https://www.nippon.com/ja/japan-data/h02685/); ㎡ price via [CREX](https://www.crex-data.com/industry/realestate/condominium/price-trend) | [NEWS] / [SECONDARY] |
| Tokyo 23 wards, central 6 wards | 19,503万 | n/a | | nippon.com | [NEWS] |
| Greater Tokyo (首都圏) | 9,182万 (+17.4%) | 139.2万 | | same | [NEWS] / [SECONDARY] |
| Kinki region | 5,328万 | 95.3万 | 55.91 | [Haseko HRI, Kinki 2025](https://www.haseko.co.jp/hri/pdf/data-shijo-doko-w-202601.pdf) | [SECONDARY] |
| Osaka City | 5,023万 | **116.0万** | 43.29 (many compact units) | same | [SECONDARY] |
| Osaka Prefecture | 5,088万 | 98.0万 | 51.90 | same | [SECONDARY] |
| Nationwide | 6,556万 | **104.5万** | | CREX | [SECONDARY] |

- FY2025 (Apr 2025–Mar 2026): Tokyo 23 wards average 13,784万 (+18.5%); Greater Tokyo 9,383万. Source: [Kyodo via OANDA](https://www.oanda.jp/lab-education/market_news/kn_2026042001000786/), 2026-04-20.
- Greater Tokyo supply in 2025 was 21,962 units, the lowest since 1973.

**Per 坪 conversion for Taiwanese readers [DERIVED]** (1 坪 = 3.3058 ㎡, at 0.2017 TWD per JPY):
- Tokyo 23 wards new: 697万円 per 坪 ≈ **NT$140.6萬 per 坪**
- Osaka City new: ≈ NT$77.3萬 per 坪
- Nationwide new: ≈ NT$69.7萬 per 坪

**These are net (専有) areas.** Taiwanese 權狀坪 include roughly 30–35% 公設. Divide a Taiwanese price by (1 − 公設比) before comparing. Taipei new builds at 128.88萬 per 權狀坪 come to about 190萬 per net 坪 at 32% 公設 [DERIVED].

### 4.2 Used condominiums

| Area | Price per ㎡ | Average price | Area | Building age | Period | Source | Label |
|---|---|---|---|---|---|---|---|
| Tokyo 23 wards (closed sales) | **137.96万** | 7,941万 | 57.57 ㎡ | 25.9 yrs | 2026 Q1 | [東日本 REINS](https://www.reins.or.jp/pdf/trend/sf/sf_202601-03.pdf) | [OFFICIAL] |
| Greater Tokyo (closed sales) | 86.26万 | 5,492万 | 63.67 ㎡ | 27.1 yrs | 2026 Q1 | same | [OFFICIAL] |
| Tama area / Kanagawa / Saitama / Chiba | 59.16万 / 61.21万 / 45.90万 / 41.44万 | | | | 2026 Q1 | same | [OFFICIAL] |
| Osaka Prefecture (closed sales) | **55.67万** | 3,498万 | | | 2026-07 | 近畿レインズ via [Diamond不動産](https://diamond-fudosan.jp/articles/-/1113296) | [NEWS] |
| Osaka City, central 6 wards / all 18 wards (closed sales) | n/a | 5,826万 / 2,935万 | | | 2026-07 | same | [NEWS] |
| Asking price, 70 ㎡ equivalent | Greater Tokyo 7,454万; Tokyo 23 wards 12,741万; Kinki 3,579万; Osaka Prefecture 4,396万; Chubu 2,291万 | | | | 2026-06 | 東京カンテイ via [MEC](https://www.mec-h.com/news/40) | [SECONDARY] |

- The REINS 2026 Q2 file was blocked by robots.
- **A nationwide used-condo ㎡ price was not found.** As a proxy, the Kinki asking price is 3,579万 per 70 ㎡ ≈ 51万 per ㎡, and Chubu is ≈ 33万 per ㎡ [DERIVED].

### 4.3 Typical family unit size

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Average new-condo area | Tokyo 23 wards ≈64.5 ㎡; Osaka City 43.3 ㎡; Kinki 55.9 ㎡ | 2025 | §4.1 | [DERIVED] / [SECONDARY] |
| Average used-condo sale area | Tokyo 23 wards 57.6 ㎡; Greater Tokyo 63.7 ㎡ | 2026 Q1 | REINS | [OFFICIAL] |
| Typical 2LDK / 3LDK | 2LDK about 55–65 ㎡; 3LDK about 65–75 ㎡ | n/a | | [ESTIMATE], consistent with the averages above |
| MLIT 誘導居住面積水準 (urban) | 3 persons 75 ㎡; 4 persons 95 ㎡. Minimum standard: 4 persons 50 ㎡. | 住生活基本計画 | not re-fetched | [UNVERIFIED] |

### 4.4 Rents

Official rents by floor plan for Tokyo, Osaka and a regional city were **not found** as text. The at home monthly report publishes them only as images. Here is what I could source:

| Item | Value | Period | Source | Label |
|---|---|---|---|---|
| Tokyo 23 wards, single-type condo (≤30 ㎡), asking rent | **111,922 per month** (+13.0% YoY) | 2026-03 | at home, via [fptrendy](https://fptrendy.com/2026/04/23/tokyo-23ku-rent-record-high-2026-03/) | [NEWS] |
| Osaka City, single-type asking rent (type implied) | 73,179 (+9.0%) | 2026-03 | same | [NEWS] |
| Fukuoka City, single-type asking rent | 65,527 (+3.2%) | 2026-03 | same | [NEWS] |
| Condo-for-rent asking rent per ㎡: Tokyo 23 wards / Greater Tokyo / Osaka City / Osaka Prefecture / Nagoya / Fukuoka City | **5,078 / 4,111 / 3,508 / 2,932 / 2,343 / 2,577 per ㎡ per month** | 2026-05 | 東京カンテイ, via [suminavi PDF](https://www.suminavi.com/report/pdf-cms/3cc577c3cf33d1397d17da4232d298c6f35276c4.pdf) | [SECONDARY] |
| Family-type rent, popular-ward example (2LDK–4K+): Nerima | 22.13万 | undated | [LIFULL HOME'S](https://www.homes.co.jp/chintai/tokyo/23ku/price/) | [SECONDARY] |
| Average existing private rent (民営借家, all sizes, sitting tenants): national / Tokyo / Tokyo 23 wards / cheapest (Miyazaki) | **65,496 / 94,802 / 100,530 / 46,290** | 2023 | 住宅・土地統計調査, via [JILI](https://www.jili.or.jp/lifeplan/houseeconomy/10111.html) | [SECONDARY], quoting official |
| Same, non-wooden apartment buildings: national / Tokyo 23 wards | 68,999 / 104,805 | 2023 | same | [SECONDARY] |

**Rent by size from the 東京カンテイ per-㎡ figures [DERIVED]** (per ㎡ price × area, rounded to the nearest 1,000):

| Area | 1K (25 ㎡) | 1LDK (45 ㎡) | 2LDK (60 ㎡) | 3LDK (70 ㎡) |
|---|---|---|---|---|
| Tokyo 23 wards | 127,000 | 229,000 | 305,000 | 355,000 |
| Osaka City | 88,000 | 158,000 | 210,000 | 246,000 |
| Fukuoka City (regional) | 64,000 | 116,000 | 155,000 | 180,000 |
| Nagoya City | 59,000 | 105,000 | 141,000 | 164,000 |

**This table is upward-biased.** 東京カンテイ tracks 分譲マンション (owner-built condos let out), which skew newer and better-located. Rent per ㎡ also falls with size. Sanity checks:
- The at home 23-ward single rent (111,922) is about 12% below the derived 1K.
- The HOME'S Nerima family rent (22.1万) is well below the derived 2LDK/3LDK.

**Suggested game values [ESTIMATE]:** take about 0.75–0.85× the derived family rents. For example, a Tokyo 23-ward 2LDK at about 23–26万 and a 3LDK at about 27–30万. Treat these as rough until an at home or SUUMO table by floor plan is read.

### 4.5 Mortgages

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| BOJ policy rate | 1.0% → **1.25%** (highest in 31 years) | 2026-09-18 | [熊本日日](https://kumanichi.com/articles/2037289) | [NEWS] |
| Flat35 (21–35 years, lowest rate) | **3.83%** (+0.37pt MoM; highest since the current system began in 2017-10). Was 1.89% in 2025-10 and 3.21% in 2026-06. | 2026-10 | [熊本日日](https://kumanichi.com/articles/2041676); [0systems](https://0systems.com/2026/10/03/53465/) | [NEWS] |
| Variable rate after discount | Aeon 1.040%; MUFG 1.195%; Resona 1.250%; Mizuho 1.275% (Mizuho 店頭基準 3.375%) | 2026-10 | 0systems | [SECONDARY] |
| 35-year fixed, other lenders | Chuo Rokin 4.000%; docomo SMTB 4.019%; Mizuho 4.160%; PayPay 4.210% | 2026-10 | same | [SECONDARY] |
| Share of borrowers by rate type | Variable 75.0% / fixed-period 14.9% / full-term fixed 10.1% | 2026-01 survey | JHF, via [SCBRI](https://www.scbri.jp/reports/.assets/newstopics_20260908.pdf) | [SECONDARY] |
| Loan term | 30 years or less 37.7%; over 35 years 23.4%. 57.5% of lenders offer 50-year variable loans. | 2026-01 / FY2025 | same | [SECONDARY] |
| Down payment (手持金 ÷ price), Flat35 borrowers | All 13.1%; new condo **23.5%**; used condo 16.4%; ready-built house 10.2%; used house 9.4% | FY2025 | [JHF Flat35 利用者調査 2025](https://www.jhf.go.jp/files/topics/4941_ext_99_1.pdf) | [OFFICIAL] |
| Repayment burden (総返済負担率) | All 22.8%; new condo 21.5% (158,000 per month) | FY2025 | same | [OFFICIAL] |
| Flat35 borrower profile: new condo | Household income 1,041万; required funds 5,882万. Average borrower age (all types) 43.3. | FY2025 | [JHF summary](https://www.jhf.go.jp/files/topics/4941_ext_99_0.pdf) | [OFFICIAL] |

**Game default suggestion [ESTIMATE]:**
- `BANK = { ltv: 0.85, years: 35, rate: 0.012 variable }`, with a scenario for rates rising toward 2–2.5% over the loan.
- A fixed alternative at 3.8%.
- Japanese banks commonly lend 90–100% of the price, and no macro-prudential LTV cap like Taiwan's 央行 rules was found.

### 4.6 住宅ローン減税 (from the FY2026 tax reform)

Source: [pay-route summary](https://pay-route.co.jp/article/2026/03/28/comprehensive-guide-to-2026-home-loan-tax-reduction-changes/). [SECONDARY]

- **Coverage:** move-ins from 2026-01-01 to 2030-12-31.
- **Credit:** 0.7% of the year-end loan balance per year, deducted from income tax (and partly from resident tax).
- **Duration:** 13 years for new homes that meet energy standards and for used homes rated 省エネ等級4 or above. Other used homes get 10 years.
- **Balance caps:**
  - New ZEH or 長期優良 homes: 3,500万, or **4,500万** for child-rearing households (a child under 19) and young couples (a spouse under 40).
  - Used homes, 一般: 2,000万. Used homes 省エネ4+: 3,500万 (4,500万 for child-rearing households).
- **Income cap:** total income ≤ 2,000万.
- **Floor area:** ≥ 40 ㎡ (≥ 50 ㎡ if income is over 1,000万).
- **Conflict:** the article gives 2,000万 in one place and 3,500万 in another for "省エネ基準適合" new homes, and mentions a 5,000万 maximum once. Check MLIT or NTA before coding.

### 4.7 Price-to-income ratios

| Measure | Value | Year | Source | Label |
|---|---|---|---|---|
| Flat35 年収倍率, new condo | National **7.5**; Greater Tokyo **8.4**; Kinki 7.7; Tokai 6.8 | FY2025 | [JHF](https://www.jhf.go.jp/files/topics/4941_ext_99_1.pdf) | [OFFICIAL] |
| Flat35 年収倍率, used condo | National 5.6; Greater Tokyo 6.2; Kinki 5.5; Tokai 4.5 | FY2025 | same | [OFFICIAL] |
| Flat35 年収倍率, all types | National 6.6; Greater Tokyo 7.1 | FY2025 | same | [OFFICIAL] |
| Income needed for an average 23-ward new condo (35-year full loan, 25% repayment burden) | about **2,000万** (about 1,000万 before COVID) | 2025 price | [MURC report, 2026-05](https://www.murc.jp/wp-content/uploads/2026/05/watch_2605_01.pdf) | [SECONDARY] |
| 23-ward new condo ÷ national median household income | 13,613 / 451 ≈ **30×** | 2025 / 2024 | | [DERIVED] (not a like-for-like measure) |

Flat35 ratios are based on **buyers' own incomes**, which are well above the median. They are not comparable to Taiwan's 內政部 房價所得比, which uses the area's median household income.

---

## 5. Taxes and social insurance (employee)

### 5.1 National income tax (所得税)

Source: [NTA No.2260](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm), as of 2026-04-01. [OFFICIAL]

| Taxable income | Rate | Deduction |
|---|---|---|
| ≤ 1,949,000 | 5% | 0 |
| 1,950,000–3,299,000 | 10% | 97,500 |
| 3,300,000–6,949,000 | 20% | 427,500 |
| 6,950,000–8,999,000 | 23% | 636,000 |
| 9,000,000–17,999,000 | 33% | 1,536,000 |
| 18,000,000–39,999,000 | 40% | 2,796,000 |
| ≥ 40,000,000 | 45% | 4,796,000 |

**Surtaxes.** A 復興特別所得税 of **2.1%** of income tax applies through 2037. From 2027-01 it becomes 1.1% plus a new 防衛特別所得税 of 1%, so the total stays 2.1%. Same NTA page.

**Taxation is individual.** There is no joint filing.

**給与所得控除 (employment income deduction), 2026 and 2027.** Source: [NTA No.1410](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm). [OFFICIAL]

| Salary | Deduction |
|---|---|
| ≤ 2.2M | 740,000 (the minimum rose from 650,000 in 2025) |
| 2.2–3.6M | 30% + 80,000 |
| 3.6–6.6M | 20% + 440,000 |
| 6.6–8.5M | 10% + 1,100,000 |
| > 8.5M | 1,950,000 (cap) |

The change was enacted 2026-12-01 and applies to 2026 income through the year-end adjustment.

**基礎控除 (basic deduction), 2026.** Sources: [NTA No.1199](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm) and [MOF FY2026 reform explanation](https://www.mof.go.jp/tax_policy/tax_reform/outline/fy2026/explanation/PDF/p0003-0010.pdf). [OFFICIAL]

| Total income (合計所得) | 2026 deduction | 2025 deduction |
|---|---|---|
| ≤ 1.32M | **1.04M** | 0.95M |
| 1.32–4.89M | Most likely 1.04M (see note) | 0.88M (≤3.36M) / 0.68M (3.36–4.89M) |
| 4.89–6.55M | 0.67M | 0.63M |
| 6.55–23.5M | 0.62M | 0.58M |
| Phase-out | 0.48M / 0.32M / 0.16M / 0 above 23.5M | same |

- **Note on the 1.32–4.89M rows.** The NTA table cells for these two bands were not captured. MOF describes a temporary add-on of 0.42M for salaries up to about 6.65M, which implies 1.04M across this range. **[UNVERIFIED: re-check before coding]**
- The tax-free threshold (年収の壁) is now **1.78M** for everyone.
- These amounts are temporary measures for 2026–2027 and are partly indexed to inflation.

**Dependants.** Source: [NTA No.1180](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm). [OFFICIAL]
- **Children under 16 give no deduction.** This was abolished when 子ども手当 was introduced.
- 一般扶養 (age 16+): **38万**.
- 特定扶養 (ages 19–22): **63万**.
- A dependant's income limit is total income ≤ 58万 (salary ≤ 123万); from 2026 it is ≤ 62万.
- The FY2026 reform **kept** the deduction for high-school-age dependants for 2026 and 2027, with review continuing ([MOF](https://www.mof.go.jp/tax_policy/tax_reform/outline/fy2026/explanation/PDF/p0003-0010.pdf)).
- 配偶者控除 (spouse deduction) is 38万 when the taxpayer's total income is ≤ 900万 and the spouse's income is low. **[UNVERIFIED this session]**

### 5.2 Resident tax (住民税)

Source: [Tokyo Metropolitan Tax Bureau](https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html). [OFFICIAL]

- **所得割 (income-based levy):** a flat **10%** (4% prefectural + 6% municipal) on the **previous year's** taxable income.
- **均等割 (flat levy):** 1,000 + 3,000, plus 森林環境税 1,000 from FY2024, for 5,000 per year in total.
- **調整控除 (adjustment credit):** at least 2,500 per year.
- **Deductions differ from income tax.** The resident-tax basic deduction is 43万 [UNVERIFIED]. Dependant deductions are 33万 (general) and 45万 (specified) [UNVERIFIED].
- **Timing:** the new 74万 minimum 給与所得控除 applies to resident tax from FY2027.

### 5.3 Employee social insurance contributions (employee share; employer pays the same)

| Item | Total rate | Employee share | Notes | Source | Label |
|---|---|---|---|---|---|
| 厚生年金 (employee pension) | 18.3% (fixed since 2017-09) | **9.15%** | Standard monthly remuneration cap 65万 [UNVERIFIED]; bonus cap 150万 per payment [UNVERIFIED] | [Japan Pension Service](https://www.nenkin.go.jp/service/kounen/hokenryo/ryogaku/ryogakuhyo/index.html) | [OFFICIAL] for the rate |
| 健康保険 (health insurance), 協会けんぽ | National average **9.9%** (FY2026; was 10.0%). Tokyo 9.85%; Chiba 9.73%. | ≈ **4.95%** | From the 2026-03 premium month. Large-company 健保組合 vary. | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=20457); [協会けんぽ 千葉](https://www.kyoukaikenpo.or.jp/shibu/chiba/public_relations/002) | [NEWS] / [OFFICIAL] |
| 介護保険 (long-term care), ages 40–64 | 1.62% | 0.81% | | same | [OFFICIAL] |
| **子ども・子育て支援金** (new) | **0.23%** | 0.115% | From the 2026-04 premium month. Average employee share about 450 (協会けんぽ) to 550 (健保組合) per month; about 192 per month at 200万 income and 959 at 1,000万. Rises in steps to FY2028. | [かいけつ人事労務 (こども家庭庁 estimate)](https://www.kaiketsu-j.com/?p=20025) | [NEWS] |
| 雇用保険 (employment insurance) | 1.35% (FY2026, down 0.1pt) | **0.5%** | No cap | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=21128) | [NEWS] |
| **Total employee share** | | **≈14.7%** under 40; **≈15.5%** at 40–64 | Pension is capped, so the rate falls at high pay | | [DERIVED] |

**Health insurance has no per-dependant premium.** Dependants (spouse or children with income under about 130万) are covered free. A dependent spouse also gets free 第3号 pension coverage. This differs from Taiwan's NHI, where the premium is multiplied by (1 + dependants).

### 5.4 Take-home pay, one employee, 2026 rules [DERIVED]

Computed with my script (`scratchpad/jp_tax.py`; not part of the repo). Assumptions:
- Tokyo 協会けんぽ rates; salary paid as 12 months plus 2 bonus months.
- Income tax uses the 2026 basic deduction (1.04M up to 4.89M total income) and the 2.1% surtax.
- Resident tax is 10% with a 43万 basic deduction, plus 5,000 flat levy minus 2,500 adjustment credit.
- No dependants unless stated.

| Gross pay | Social insurance | Income tax | Resident tax | Net | Net ÷ gross |
|---|---|---|---|---|---|
| 300万 | 44.1万 | 2.8万 | 11.7万 | 241.4万 | 80.5% |
| 400万 | 58.8万 | 5.8万 | 17.7万 | 317.8万 | 79.4% |
| 500万 | 73.5万 | 9.1万 | 24.2万 | 393.2万 | 78.6% |
| 600万 | 88.1万 | 14.9万 | 30.7万 | 466.2万 | 77.7% |
| 800万 | 117.5万 | 43.2万 | 45.2万 | 594.1万 | 74.3% |
| 1000万 | 139.8万 | 79.5万 | 62.5万 | 718.2万 | 71.8% |
| 1500万 | 174.1万 | 203.3万 | 109.0万 | 1013.6万 | 67.6% |

- Age 40–64 (adds 介護保険): 600万 → 77.1%; 1000万 → 71.3%.
- One earner with a non-working spouse: 600万 → 78.9%.

**Cross-check against Taiwan.** In Taiwan, 社保 plus 綜所稅 on 60萬 is only about 5–7%. Japan's social insurance alone takes about 15%. This is the largest single structural difference for take-home pay.

---

## 6. Child-related benefits (as of 2026-10)

### 6.1 Pregnancy and birth

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| 出産育児一時金 (childbirth lump sum, health insurance) | **50万 per baby** (since 2023-04) | 2026 | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=18784) | [NEWS] |
| Average normal-delivery cost | **≈52万** (+1.3万 YoY). Tokyo 648,309 (highest); Kumamoto 404,411 (lowest). | FY2024 | same, citing the MHLW 医療保険部会 of 2025-10-23 ([MHLW](https://www.mhlw.go.jp/stf/newpage_65085.html)) | [NEWS] |
| Plan: insurance-covered free normal delivery | A uniform national base price fully covered by health insurance, abolishing the 50万 lump sum. Extras such as celebration meals and photos stay self-paid. Bill planned for the 2026 Diet; start **FY2027 or later**. | 2025-12 | [さきがけ (Kyodo)](https://www.sakigake.jp/news/article/20251203CO0141/) | [NEWS]. Whether the 2026 Diet passed it was **not checked**. |
| 妊婦のための支援給付 (pregnancy support benefit) | **5万** at pregnancy notification plus **5万 per child** after birth (cash or coupons) | from 2025-04 | [Minato City](https://www.city.minato.tokyo.jp/chiikihoken/kodomo/syusankosodate07.html) | [OFFICIAL] |
| 出産手当金 (maternity allowance, employees in health insurance) | 2/3 of the standard daily pay for 42 days before and 56 days after birth (98 days) | | not fetched | [UNVERIFIED] |
| Social-insurance premiums during maternity and childcare leave | Exempt, for both employee and employer | | not fetched | [UNVERIFIED] |
| Tokyo 018サポート (5,000 per month per child aged 0–18) and the 赤ちゃんファースト gift | Not verified this session | | | not found |

### 6.2 児童手当 (child allowance), from the October 2024 payments

Source: [Osaka Prefecture](https://www.pref.osaka.lg.jp/o090135/kateishien/teate/jite_202410.html). [OFFICIAL]

| Age | 1st and 2nd child | 3rd child onward |
|---|---|---|
| 0–2 | **15,000 per month** | **30,000** |
| 3 to the end of high-school age (the March 31 after the 18th birthday) | **10,000 per month** | **30,000** |

- **Income cap:** abolished (high earners previously got 5,000 or nothing).
- **Payment:** six times a year, in even months.
- **Counting the "3rd child":** older children count up to the March 31 after age 22 if the parents still support them financially.
- **Lifetime total for one child (1st or 2nd) [DERIVED]:** 15,000 × 36 + 10,000 × 192 ≈ **246万**.

### 6.3 Parental-leave benefits (雇用保険)

| Item | Value | Source | Label |
|---|---|---|---|
| 育児休業給付金 (childcare leave benefit) | **67%** of pre-leave wage for the first 180 days, then **50%**. Paid until the child turns 1; up to 2 if no daycare place is found. | [MoneyForward (2026-03)](https://biz.moneyforward.com/payroll/basic/111917/) | [SECONDARY] |
| Monthly caps | 67% rate: **332,454** (was 323,811). 50% rate: **248,100** (was 241,650). Effective 2026-08-01. | [MMEA](https://www.mmea.biz/news/52483-2/) | [SECONDARY] |
| 出生後休業支援給付金 (from 2025-04) | **+13%** for up to **28 days** within 8 weeks of birth (for the father, or the mother after 産後休業), if both parents take ≥14 days. Total 80%, described as about 手取り10割 because the benefit is tax-free and premiums are waived. | MoneyForward | [SECONDARY] |
| 出生時育児休業 (産後パパ育休) | Up to 4 weeks within 8 weeks of birth, at 67% | same | [SECONDARY] |
| 育児時短就業給付 (from 2025-04) | **10%** of wages paid while working reduced hours with a child under 2 | same | [SECONDARY] |

**Game mapping.**
- `leaveRate`: 0.67 for 6 months, then 0.50 up to 12 months.
- `leaveInsMax` ≈ 496,000 per month, which is the wage ceiling implied by 332,454 / 0.67 [DERIVED].
- No income tax or social insurance is due on the benefit.

### 6.4 Childcare fees (保育料) ages 0–2, and free preschool ages 3–5

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| National rule, ages 3–5 | Nursery and kindergarten **free** since 2019-10 | 2019– | [BCN](https://www.bcnretail.com/market/detail/20250904_554110.html) | [NEWS] |
| National rule, ages 0–2 | Free only for resident-tax-exempt households and for 3rd-and-later children. Otherwise income-based (by municipal resident tax), set by each municipality under a national ceiling. | 2025 | BCN; [Financial Field](https://financial-field.com/living/entry-403726) | [NEWS] |
| Tokyo | **First-child 0–2 fees free from 2025-09-01, no income limit.** Second child was already free (from 2023-10, per BCN background). | 2025-09 | [BCN 2025-09-04](https://www.bcnretail.com/market/detail/20250904_554110.html) | [NEWS] |
| Osaka City | **First-child 0–2 fees free from 2026-09** (licensed facilities, plus 企業主導型 up to the national standard). Second child free since 2024-09. | 2026 | [Osaka City press release](https://www.city.osaka.lg.jp/hodoshiryo/seisakukikakushitsu/0000669117.html) | [OFFICIAL] |
| Typical fee before waivers, ages 0–2, standard hours, household income 600万 | Meguro 21,900; Setagaya 29,700; Sumida 34,900 per month | 2025 | Financial Field (citing ward tables) | [SECONDARY] |
| Saving from the first-child waiver (Meguro / Setagaya / Sumida) | Income 400万: 9,400 / 23,000 / 24,300 per month. Income 800万: 29,400 / 38,300 / 46,600 per month. | 2025 | same | [SECONDARY] |
| National ceiling table (国の基準, 3歳未満, standard hours) | Top bracket about 104,000 per month | | | [UNVERIFIED]; table not found |
| こども誰でも通園制度 | Nationwide from 2026-04: a few hours per month of drop-in care for unenrolled 0–2s | | | [UNVERIFIED] |

**Game suggestion [ESTIMATE].** Model 0–2 fees as:
- **0** in Tokyo 23 wards (from 2025-09) and Osaka City (from 2026-09).
- About **2–4万 per month** elsewhere, varying with income: roughly 1万 at 400万 household income and 4–6万 at 1,000万+.

Families still pay for meals and supplies under free 3–5 care. The 副食費 is exempt below about 360万 income and for 3rd+ children, otherwise about 4,500 per month [UNVERIFIED].

### 6.5 School-level support

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| School lunch, public elementary | National support from 2026-04 of up to 5,200 (or 6,200) per month for 11 months (≤ 68,200 per year). Parents pay any excess; many municipalities top up to fully free. Junior high **not** included. | 2026-04 | [BCN 2026-05-09](https://www.bcnretail.com/market/detail/20260509_626219.html); [MEXT](https://www.mext.go.jp/a_menu/sports/syokuiku/kyu-lighten.html) | [NEWS] / [OFFICIAL] |
| High-school tuition support (就学支援金) | **No income limit** from 2026-04. Public **118,800 per year**; private **457,200 per year** (correspondence 337,200). Tokyo top-up to 501,000. Tuition only (no textbooks, trips or uniforms). Law passed 2026-03-31. | 2026 | [vegcale (citing MEXT)](https://vegcale.com/2026/08/30/koukou-mushoka-shotoku-seigen-teppai-2026/); [さきがけ](https://www.sakigake.jp/news/article/20260227CO0031/) | [SECONDARY] / [NEWS] |
| University, 多子世帯 (3+ dependent children at once) | Tuition and entrance fee **free with no income limit**, from FY2025. Caps: national/public univ ≈54万 tuition and ≈28万 entrance; private 70万 tuition and 26万 entrance. | 2025– | [MEXT](https://www.mext.go.jp/content/20240426-mxt_gakushi_100001505_1.pdf) | [OFFICIAL] |
| University, low-income (高等教育の修学支援新制度) | Means-tested grants and fee waivers | | | [UNVERIFIED] for details |
| Children's medical care | Municipal subsidies make copays zero or near zero. Tokyo covers to age 18. Coverage varies by municipality. | 2025 | [MMEA](https://www.mmea.biz/4422/) (general) | [SECONDARY]. National share of municipalities **not found**. |

---

## 7. Childcare and education costs

### 7.1 Childcare
- Nursery fees: see §6.4.
- Kindergarten 学習費総額 (MEXT, FY2023, per year): public **184,646**; private **347,338**. These figures are after 幼保無償化. Of which:
  - School costs: 69,362 (public) / 154,062 (private).
  - School lunch: 15,235 / 35,741.
  - Out-of-school activities: 100,049 / 157,535.
  - Source: [MEXT 子供の学習費調査 令和5年度](https://www.mext.go.jp/content/20241225-mxt_chousa01_000039333_1.pdf). [OFFICIAL]

### 7.2 School (MEXT 子供の学習費調査, FY2023, annual per child, published 2024-12)

Source: [MEXT](https://www.mext.go.jp/content/20241225-mxt_chousa01_000039333_1.pdf). [OFFICIAL]

| Stage | Total | School costs | School lunch | Out-of-school (incl. 塾) |
|---|---|---|---|---|
| Public elementary | **336,265** | 81,753 | 38,405 | 216,107 |
| Private elementary | **1,828,112** | 1,054,083 | 53,601 | 720,428 |
| Public junior high | **542,475** | 150,747 | 35,667 | 356,061 |
| Private junior high | **1,560,359** | 1,128,061 | 9,317 | 422,981 |
| Public high school (full-time) | **597,752** | 351,452 | n/a | 246,300 |
| Private high school (full-time) | **1,030,283** | 766,490 | n/a | 263,793 |

- **15-year totals (kindergarten to high school, summed by grade):** all-public **5,963,096**; all-private **19,761,305**.
- **Cram-school share (補助学習費, includes 塾), junior high:** public 271,528 and private 236,986, out of 356,061 and 422,981 respectively. Source: [JILI](https://www.jili.or.jp/lifeplan/lifeevent/790.html). [SECONDARY]
  - Public junior high by grade: 1st year 172,669; 2nd 249,306; **3rd 389,928** (entrance-exam year).
- **These costs predate the reforms.** FY2023 is before the 2025–26 high-school tuition and lunch changes. Public high-school school costs (351,452) include tuition of 118,800 that is now fully covered. Private high-school costs will fall by up to 457,200.

**Game mapping [ESTIMATE].**
- `elementaryPublic` ≈ 82,000 school costs plus lunch ≈ 38,000. The lunch will fall to about 0–10,000 from 2026.
- `juniorPublic` ≈ 186,000.
- `cram.junior` levels: none 0; some ≈ 15,000 per month; full ≈ 32,000 per month in the final year.
- `seniorPublic` ≈ 233,000 after free tuition (351,452 − 118,800).

### 7.3 University

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| National university standard tuition / entrance fee | 535,800 / 282,000 | long-standing standard. Some, e.g. Univ. of Tokyo, raised to 642,960 in 2025 [UNVERIFIED]. | MEXT multi-child caps (§6.5) match ≈54万 / ≈28万 | [OFFICIAL] (approx.) |
| Private university average, 2025 entrants | Tuition **968,069**; entrance fee 240,365; facilities 172,550. First-year total **1,380,983** (+1.2%). | 2025 | [MEXT 私立大学等 学生納付金調査](https://www.mext.go.jp/content/20251226-mxt_sigakujo-000046463_1.pdf) | [OFFICIAL] |
| Private junior college average | Tuition 734,328; first-year total 1,140,514 | 2025 | same | [OFFICIAL] |
| Annual student budget (学費 + 生活費), by founder | National 1,577,100 (639,200 + 937,900); public 1,463,400; private 2,160,300 (1,399,100 + 761,200) | FY2024 | [JASSO 学生生活調査 令和6年度 (released 2026-03-31)](https://www.jasso.go.jp/statistics/gakusei_chosa/__icsFiles/afieldfile/2026/03/25/data24_1_3.pdf) | [OFFICIAL] |
| Annual student budget by residence: at home / renting away (下宿・アパート) | National 1,202,600 / **1,800,700**; public 1,067,200 / 1,750,600; private 1,905,400 / **2,689,100**; average 1,801,300 / 2,342,900 | FY2024 | same | [OFFICIAL] |
| Share of students living away | National 59.2%; public 55.8%; private 28.0% | FY2024 | same | [OFFICIAL] |
| Family support received per student (all residence types) | 1,029,700 per year | FY2024 | same | [OFFICIAL] |

**Implied extra cost of living away [DERIVED]:** about 60万 per year for national universities and about 78万 for private ones. This maps to `uniAwayRent` ≈ 5–6.5万 per month.

---

## 8. Total cost of raising a child

| Estimate | Value | Basis | Source | Label |
|---|---|---|---|---|
| NCCHD (国立成育医療研究センター), first child aged 0–18 | **≈2,170万** excluding savings and insurance; **≈2,570万** including them. Living costs (food, clothing, goods) are about half. | Online survey of mothers, 2024-11; 2024 spending; *Japanese Journal of Public Health*, 2025-10 | [NCCHD press release 2025-10-16](https://www.ncchd.go.jp/press/2025/1016.pdf) | [OFFICIAL] (research) |
| Cabinet Office FY2009 survey, first child, per year | Preschool 843,225; elementary 1,153,541; junior high 1,555,567 | 2009 survey | Quoted by [Financial Field](https://financial-field.com/living/entry-362684); original [CAO report (NDL archive)](https://warp.da.ndl.go.jp/info:ndljp/pid/13024511/www8.cao.go.jp/shoushi/shoushika/research/cyousa21/net_hiyo/mokuji_pdf.html) | [SECONDARY]. Other sources often cite about 104万 for preschool, so the 84.3万 figure may be a sub-total. **Flag: check the original.** |
| NCCHD comparison with 2009 (inflation-adjusted, ages 0–15) | The total rose only slightly. Living costs rose; childcare and medical costs fell because of subsidies and free care. | | NCCHD | [OFFICIAL] |
| Commonly cited "birth to university" figures | 2,000万–3,000万+ | popular finance media | e.g. [All About](https://allabout.co.jp/gm/gc/12003/image/) | [SECONDARY], not adopted |

**A rough build-up from §6–7 for comparison [DERIVED].** All-public schooling plus a national university while living away comes to about 600万 (education to age 18) plus about 720万 (4 × 180万 university). Add NCCHD-type living costs for the rest.

---

## 9. Fertility context

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Births (Japanese nationals in Japan) | **671,270** (−14,903; 10th straight fall; record low) | 2025 final (released 2026-09-30) | [かいけつ人事労務](https://www.kaiketsu-j.com/?p=24336); [MHLW kakutei25](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/kakutei25/index.html) | [NEWS], quoting official |
| Total fertility rate | **1.14** (−0.01; record low) | 2025 | same | [NEWS] |
| Marriages | 489,158 (+4,066) | 2025 | same | [NEWS] |
| Mean age of mother at first birth | **31.0** | 2024 | [JILI (人口動態統計)](https://www.jili.or.jp/lifeplan/lifeevent/803.html) | [SECONDARY]. The 2025 value was **not found**. |
| Ideal / planned number of children (married couples) | 2.25 / 2.01 | 2021 | 第16回出生動向基本調査, via [JILI](https://www.jili.or.jp/lifeplan/lifeevent/801.html) | [SECONDARY] |
| Reasons for having fewer children than ideal (multiple answers) | Child-rearing and education cost too much: **52.6%**. Don't want to give birth at an older age: 40.4%. Want more but cannot conceive: 23.9%. Psychological or physical burden: 23.0%. | 2021 | same | [SECONDARY] |
| Households with children finding life hard | 61.5% | 2025 | §3 | [OFFICIAL] |

---

## 10. Policy changes 2024–2026 and pending

| When | Change | Status |
|---|---|---|
| 2023-04 | 出産育児一時金 raised to 50万 | in force |
| 2024-09 | Osaka City: 0–2 nursery free for the 2nd child; multi-child income cap removed | in force |
| 2024-10 | 児童手当 expansion: through high-school age, no income cap, 30,000 from the 3rd child | in force |
| 2025-04 | 妊婦のための支援給付 (5万 + 5万 per child); 出生後休業支援給付 (+13%, 28 days); 育児時短就業給付 (10%) | in force |
| 2025-04 | University tuition and entrance fee free for 多子世帯 (3+ dependants), no income cap | in force |
| 2025-04 → 2026-04 | High-school tuition support made income-independent. The 2026 law fixed it for all (public 118,800; private 457,200). The exact FY2025 interim arrangement was not checked. | in force |
| 2025-09 | Tokyo: 0–2 nursery free for the 1st child, no income limit | in force |
| 2026 (tax year) | Basic deduction up to 104万; 給与所得控除 minimum 74万 (年収の壁 at 178万); 住宅ローン減税 extended to 2030 (0.7%, 13 years, higher caps for child-rearing households) | in force (temporary for 2026–27) |
| 2026-04 | 子ども・子育て支援金 collection starts (0.23%, rising to FY2028) | in force |
| 2026-04 | Private high-school support raised to 457,200 with no income cap | in force |
| 2026-04 | National support for public elementary school lunch (≤5,200 per month) | in force |
| 2026-04 | こども誰でも通園制度 nationwide | [UNVERIFIED] |
| 2026-08 | Parental-leave benefit caps raised (332,454 / 248,100) | in force |
| 2026-09 | Osaka City: 0–2 nursery free for the 1st child | in force |
| 2026-06 → 09 | BOJ raised the policy rate to 1.0% and then 1.25%; Flat35 at 3.83% in October | market |
| Pending: FY2027 or later | Normal delivery fully covered by health insurance (replaces the 50万 lump sum) | bill planned; passage **not checked** |
| Pending | Review of the 扶養控除 for high-school-age children (kept for 2026–27) | under review |
| Pending | Free school lunch for junior high | not decided (per BCN) |

---

## 11. Gaps and conflicts

1. **Wage deciles D1–D9** (an official full distribution) were not found. Only coarse NTA bands from 2024 are available. The median full-time salary is not published by NTA. I estimated the median from bands at about 410万 (all workers, part-time included).
2. **The 家計調査 income-quintile table** (consumption and disposable income by 五分位) was not found.
3. **Rents by floor plan** (1K/1LDK/2LDK/3LDK) for the 23 wards, Osaka and a regional city were not found as text. §4.4 gives derived numbers with a known upward bias.
4. **A nationwide used-condo ㎡ price** was not found. Kinki and Chubu proxies are given.
5. **The 2025 annual bonus** from 賃金構造 and the **2026 wage growth** (春闘 2026) were not found.
6. **The 基礎控除 for total income 132–489万 in 2026** comes from my reading of MOF (1.04M). The NTA table cells were not captured. Re-check before coding.
7. **The age-band anomaly:** the MHLW 35–39 band equals the all-age mean (340.6). Possibly an extraction error.
8. **住宅ローン減税 caps** for new 省エネ基準適合 homes conflict within the source (2,000万 vs 3,500万).
9. **Cabinet Office 2009 preschool cost:** 84.3万 versus the commonly cited ~104万 needs checking.
10. **Taiwan's PPP** is derived (IMF GDP-PPP ÷ nominal), not read directly.
11. **Not researched:**
    - Postpartum care (産後ケア) prices.
    - Utilities, food and car costs.
    - The regional-city housing price per ㎡ (e.g. Fukuoka, Sapporo).
    - Pension benefits after 65 (`COST.pension`).
    - 学童保育 (after-school care) fees.
    - The 2025 mean age at first birth.

---

## 12. Machine-readable summary (JSON, JPY, ready to adapt)

```json
{
  "country": "JP",
  "fx": { "jpyToTwd": 0.2017, "date": "2026-10-08", "pppJpyPerIntl": 94.694, "pppTwdPerIntl": 13.65, "pppJpyToTwd": 0.144, "pppYear": 2025, "pppTwdDerived": true },
  "wage": {
    "meanAllFullYear": 4870000, "meanRegular": 5590000, "meanNonRegular": 2100000, "year": 2025,
    "medianAllEst": 4100000, "medianEst": true,
    "q": [[32, 0.73], [48, 0.976], [50, 1], [63, 1.22], [88, 1.95], [94, 2.44]], "qYear": 2024, "qDerived": true,
    "ageVsMean": [[22, 0.713], [27, 0.82], [32, 0.917], [37, 1.0], [42, 1.07], [47, 1.11], [52, 1.142], [57, 1.163], [62, 0.967], [67, 0.838]],
    "bonusMonthsAll": 2.2, "bonusMonthsRegular": 2.7
  },
  "household": { "incomeMedian": 4510000, "incomeMean": 5752000, "incomeMeanWithKids": 8573000, "incomeYear": 2024,
    "workerHhDisposableMonthly": 532408, "workerHhConsumptionMonthly": 346297, "kakeiYear": 2025, "quintiles": null },
  "tax": {
    "brackets": [[1949000, 0.05, 0], [3299000, 0.10, 97500], [6949000, 0.20, 427500], [8999000, 0.23, 636000], [17999000, 0.33, 1536000], [39999000, 0.40, 2796000], [null, 0.45, 4796000]],
    "surtax": 0.021,
    "salaryDeduction2026": [[2200000, "740000"], [3600000, "0.30x+80000"], [6600000, "0.20x+440000"], [8500000, "0.10x+1100000"], [null, "1950000"]],
    "basic2026": [[4890000, 1040000, "132-489万 band unverified"], [6550000, 670000], [23500000, 620000]],
    "dependent16": 380000, "dependent19to22": 630000, "under16": 0, "spouse": 380000,
    "resident": { "rate": 0.10, "flat": 5000, "basic": 430000, "lagYears": 1 }
  },
  "si": { "pension": 0.0915, "pensionCapMonthly": 650000, "health": 0.04925, "care40to64": 0.0081, "childSupportLevy": 0.00115, "employment": 0.005, "perDependentPremium": false, "year": 2026 },
  "benefit": {
    "birthLumpSum": 500000, "deliveryCostAvg": 520000, "deliveryCostTokyo": 648309, "pregnancySupport": [50000, 50000],
    "childAllowance": { "under3": 15000, "3to18": 10000, "thirdPlus": 30000, "incomeCap": false, "endAge": 18 },
    "leave": { "rateFirst180d": 0.67, "rateAfter": 0.50, "capMonthly67": 332454, "capMonthly50": 248100, "bonus13pct28d": true, "taxFree": true, "siExempt": true, "maxMonths": 12, "maxMonthsExt": 24 },
    "nursery02": { "tokyoFirstChildFree": "2025-09", "osakaCityFirstChildFree": "2026-09", "elseMonthlyTypicalAt6M": [21900, 34900] },
    "preschool35Free": true,
    "highSchoolSupport": { "public": 118800, "private": 457200, "incomeCap": false, "from": "2026-04" },
    "uniMultiChildFree": { "nationalTuitionCap": 540000, "privateTuitionCap": 700000, "nationalEntryCap": 280000, "privateEntryCap": 260000 },
    "schoolLunchElemMonthlyCap": 5200
  },
  "education": {
    "mext2023": { "kgPublic": 184646, "kgPrivate": 347338, "elemPublic": 336265, "elemPrivate": 1828112, "jhPublic": 542475, "jhPrivate": 1560359, "hsPublic": 597752, "hsPrivate": 1030283, "jhPublicCram": 271528 },
    "uni": { "nationalTuition": 535800, "nationalEntry": 282000, "privateTuition": 968069, "privateEntry": 240365, "privateFacility": 172550, "privateYear": 2025 },
    "jasso2024": { "nationalAway": 1800700, "nationalHome": 1202600, "privateAway": 2689100, "privateHome": 1905400 }
  },
  "housing": {
    "newPerSqm": { "tokyo23": 2109000, "shutoken": 1392000, "osakaCity": 1160000, "kinki": 953000, "national": 1045000, "year": 2025 },
    "usedPerSqm": { "tokyo23": 1379600, "shutoken": 862600, "osakaPref": 556700, "period": "2026Q1 / 2026-07 (Osaka)" },
    "rentPerSqm": { "tokyo23": 5078, "osakaCity": 3508, "nagoya": 2343, "fukuokaCity": 2577, "period": "2026-05", "biasHigh": true },
    "rentSingleTokyo23": 111922, "rentExistingNational": 65496, "rentExistingTokyo23": 100530,
    "mortgage": { "variable": 0.012, "flat35": 0.0383, "boj": 0.0125, "date": "2026-10", "years": 35, "downPaymentAvg": 0.131, "downPaymentNewCondo": 0.235 },
    "pirFlat35NewCondo": { "national": 7.5, "shutoken": 8.4, "kinki": 7.7 },
    "netAreaBasis": true
  },
  "fertility": { "births": 671270, "tfr": 1.14, "year": 2025, "meanAgeFirstBirth": 31.0, "meanAgeYear": 2024, "costReasonShare": 0.526 },
  "childCostNCCHD": { "age0to18Excl": 21700000, "age0to18Incl": 25700000, "year": 2024 }
}
```
