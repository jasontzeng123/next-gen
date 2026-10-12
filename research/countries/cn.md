# 中國大陸（Mainland China）：「你有資格生下一代嗎？」跨國比較資料

Compiled 2026-10-12. Cities: **上海** (largest city) and **成都** (cheaper large city). Amounts are CNY (人民幣元) unless marked. 万 = 10,000.

**Confidence labels** (same convention as `jp.md`):
- **[OFFICIAL]**: read directly on a government or public-agency page or PDF.
- **[NEWS]**: a news or trade-press report quoting an official or industry release.
- **[SECONDARY]**: a private data site, consultancy, think tank or platform (e.g. 中指研究院, 育娲人口).
- **[DERIVED]**: my own arithmetic on sourced numbers. The method is shown.
- **[ESTIMATE]**: my judgement. The reasoning is shown.
- **[UNVERIFIED]**: background knowledge I could not re-check this session.

**Limits of this session:**
- `curl` to stats.gov.cn, tjj.sh.gov.cn, chengdu.gov.cn, chinatax.gov.cn and rate.bot.com.tw is blocked by the proxy (403). The fetch tool could read some stats.gov.cn pages and many news sites, but not Excel tables, docx files or listing platforms (安居客 shows an anti-bot page; 中国房价行情 creprice.cn was not reachable).
- City-level **absolute** house prices and rents therefore come from news reports quoting 中指研究院 or unnamed platform data. They are labelled.
- About 40 minutes of research. Items not found are listed in §12.

---

## 摘要（繁體中文）

中國大陸的養育條件和台灣有幾個根本差異：
- **平均薪資遠高於中位數，而且官方不公布薪資中位數。** 國家統計局公布的是「城鎮非私營單位平均工資」12.94 萬元，比私營單位的 7.16 萬高 81%。農民工（約 3 億人）平均月收入只有 5,075 元。最可靠的分布資料是「全國居民人均可支配收入」五等分：中位數 36,231 元，最高 20% 的平均是中位數的 2.86 倍，最低 20% 只有 0.28 倍，差距比台灣大得多。
- **社保加公積金，員工自付約 17.5%。** 養老 8%、醫療 2%、失業 0.4–0.5%，再加住房公積金 5–12%（上海基本 5–7%）。公積金是強制儲蓄，只能用在買房、租房等用途，等於「被鎖住的薪水」。所得稅起扣點高（每年 6 萬元），加上子女教育、3 歲以下托育每孩每月各 2,000 元的專項扣除，一般受薪家庭的所得稅很低。
- **補助以「生產」為主，3 歲後幾乎沒有現金給付。** 全國育兒補貼每孩每年 3,600 元，只發到 3 歲，不排富、免稅。生育保險支付產假期間的「生育津貼」（按單位平均工資，約等於全薪），上海從 2026-10-01 起合規的生產醫療費用「無自付」。幼兒園只有最後一年（大班）免保育教育費（2025 秋起）。
- **上海房價極高、成都相對便宜。** 上海新房 2025 年均價每 ㎡ 8.13 萬元（約 128 萬台幣／坪），二手房成交均價約 3.6 萬元；成都新房約 1.9 萬元、二手房約 1.2 萬元。大陸面積是「建築面積」，含公攤，跟台灣權狀坪的口徑比較接近（日本則是專有面積）。
- **戶籍（戶口）會影響福利、就學與買房。** 非上海戶籍的孩子要讀公辦幼兒園、在上海參加中考／高考，父母要有居住證並達到 120 積分；買房要先繳社保滿 1 年。建議模型預設「玩家符合當地居住證與積分條件」，再用一個切換開關模擬非戶籍的額外成本。

### 最重要的 15 個數字

| 項目 | 數值 | 年份 | 來源 |
|---|---|---|---|
| 匯率（台銀即期，買賣中價） | 1 人民幣 ≈ **4.758 新台幣**（買 4.733／賣 4.783） | 2026-10-08 | [台灣銀行](https://rate.bot.com.tw/xrt/quote/l6m/CNY) |
| 購買力平價（PPP） | 中國 3.399 元／國際元（IMF）；台灣約 13.65（推算，同日本報告）。PPP 下 1 人民幣 ≈ **4.02 新台幣**，市場匯率高估約 18% | 2025 | [IMF](https://www.imf.org/external/datamapper/api/v1/PPPEX/CHN/TWN) |
| 城鎮單位平均工資 | 非私營 **129,441**；私營 **71,590**；規模以上企業 106,080 | 2025 | [國家統計局](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202605/t20260515_1963707.html) |
| 上海平均工資（社保基數用） | 月 **12,577**（年 150,924） | 2025 | [Kaizen CPA 整理上海 2026 社保基數](https://www.kaizencpa.com/download/china/2026%20Shanghai%20New%20Social%20Security%20&%20HPF%20Base%20Rules(CHS).pdf) |
| 四川平均工資（社保基數用） | 月 **7,831**（年 93,972） | 2025 | [澎湃](https://m.thepaper.cn/newsDetail_forward_34052402) |
| 全國居民人均可支配收入 | 平均 43,377；**中位數 36,231**；城鎮中位數 51,115；五等分 10,150／22,702／35,536／55,586／103,778 | 2025 | [國家統計局](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202601/t20260119_1962321.html)；[界面](https://m.jiemian.com/article/14049006.html) |
| 上海／成都 人均可支配收入 | 上海全體 **91,987**、人均消費 54,765；成都城鎮 **59,509** | 2025 | [36氪](https://www.36kr.com/p/3679779235311494)；[聯合報](https://udn.com/news/story/7333/9292331)；[旺報](https://wantrich.chinatimes.com/news/20260522900007-420101) |
| 員工社保＋公積金自付 | 上海：養老 8%＋醫療 2%＋失業 0.5%＋公積金 5–7%（＋補充 1–5%）；基數上限 37,731／月 | 2026-07 起 | Kaizen CPA（同上） |
| 所得稅 | 綜合所得 3–45% 七級；基本扣除 60,000／年；**子女教育、3 歲以下照護各 2,000／孩／月** | 2026 | [本地寶](https://m.bendibao.com/bsy634679.html)；[本地寶](https://m.bendibao.com/bsy644838.html) |
| 房價（每 ㎡，建築面積） | 上海新房 **81,337**（2025）；上海二手成交 **35,972**（2026-05）；成都新房 **18,912**（2025 前三季）；成都二手 **約 12,200**（2026-01） | 2025–26 | [澎湃](https://m.thepaper.cn/newsDetail_forward_32389935)；[36氪](https://www.36kr.com/p/3845310705027328)；[36氪](https://www.36kr.com/p/3512605998013314) |
| 租金（每 ㎡ 每月） | 上海 **84.39**（2026-08，中指）；成都約 **49**（2024，自媒體報告）；50 城平均 34.02 | 2024–26 | [格隆匯](https://m.gelonghui.com/live/2655821)；[澎湃號](https://www.thepaper.cn/newsDetail_forward_29571003)；[財聞](https://www.caiwennews.com/article/1585663.shtml) |
| 房貸 | 5 年期以上 LPR **3.5%**（2025-05 起未變）；新發放房貸加權平均約 3.1%；公積金首套 5 年以上 **2.6%**；上海首套首付 **15%** | 2026-08/09 | [每經](https://www.mrjjxw.com/articles/2026-09-20/4586489.html)；[同花順](https://stock.10jqka.com.cn/20260820/c679130049.shtml) |
| 育兒補貼 | 每孩每年 **3,600**，至滿 3 歲；不分胎次、不排富、免個稅；2026 年中央下達 999 億元 | 2025-01 起 | [界面](https://www.jiemian.com/article/14520074.html)；[廣州市政府](https://www.gz.gov.cn/zt/shb/content/post_10391734.html) |
| 生產假 | 上海 98＋60＝**158 天**，配偶陪產 10 天；四川 2025-12 修法改為 98＋90＝**188 天**，男方護理假 30 天；育兒假上海每年 5 天、四川 10 個工作日（至 3 歲） | 2021／2025 | [澎湃](https://www.thepaper.cn/newsDetail_forward_15545857)；[川觀](https://cbgc.scol.com.cn/news/7052819) |
| 養到 18 歲的成本（育媧） | 全國平均每月 **2,544**（推算約 55 萬）；城鎮 3,127；**上海 4,751**（推算約 103 萬） | 2026-05 報告 | [界面](https://www.jiemian.com/article/14508365.html) |
| 生育狀況 | 2025 年出生 **792 萬**人，出生率 5.63‰（歷史新低）。總生育率官方未公布，學者估約 1.0 | 2025 | [科技日報](https://www.stdaily.com/web/gdxw/2026-08/28/content_571589.html) |

### 對應到遊戲模型（How this maps to the game's model）

| 台灣參數（`src/data.js`） | 中國大陸對應數字 | 備註 |
|---|---|---|
| `WAGE.median`（全年總薪資中位數） | **官方未公布薪資中位數。** 只有平均數：非私營 129,441、私營 71,590、農民工 60,900（5,075×12）。上海全口徑平均 150,924、四川 93,972 | 建議：全國城鎮受僱者中位數暫估 **7–8 萬**，上海約 **11–12 萬**，成都約 **7.5–8.5 萬** [ESTIMATE]，見 §2.4 |
| `WAGE.q`（十分位比值） | **薪資十分位未找到。** 可用代理：人均可支配收入五等分 ÷ 中位數 = 0.28／0.63／0.98／1.53／2.86（視為 P10／P30／P50／P70／P90） | 這是「每人家庭所得」，含城鄉差距，比城市受薪者的薪資分布更寬。§2.3 |
| `WAGE.age`（年齡別） | **未找到。** 國家統計局不公布年齡別薪資 | 建議暫用台灣曲線 [ESTIMATE] |
| `INDUSTRIES[].bonus` | 無官方統計。常見「13 薪」（年終 1 個月），金融、網路業更高 | 年終獎可在 **2027-12-31 前單獨計稅**，稅負較低 |
| `WAGE.toBase` | 2025 非私營 +4.3%、私營 +3.0%、人均可支配收入 +5.0% | 2025→2026 暫用 **×1.03** [ESTIMATE] |
| `HOUSEHOLD.disposable` / `consumption` | 人均可支配收入五等分（每人）；人均消費：全國 29,476、城鎮 35,869、上海 54,765 | **消費五等分 2025 年未找到**（統計年鑑才有）。以家庭計要乘戶規模（約 2.6–3 人，未查證） |
| `TAX.*` | 綜合所得 7 級 3–45%；基本扣除 60,000；專項附加扣除：子女教育 2,000／孩／月、3 歲以下照護 2,000／孩／月、房貸利息 1,000、房租 1,500（上海、成都）、贍養老人 3,000（獨生子女） | **個人課稅**，夫妻不合併。子女扣除可一方 100% 或各 50% |
| `SI.*` | 養老 8%、醫療 2%、失業 0.5%（上海）／0.4%（成都，未查證）；公積金 5–12% | 基數上限：上海 37,731／月；四川 23,493／月。**沒有眷屬加費** |
| `BENEFIT.birthPerBaby` | 無全國一次性出生補助；上海 2026-10 起合規生產與產檢「無自付」 | 生產幾乎免費，但伙食、單人房自費 |
| `BENEFIT.allowance02` / `allowance26` | 育兒補貼 **300／月**（3,600／年）至滿 3 歲；**3–18 歲沒有全國津貼** | 與是否送托無關 |
| `CARE.*`（0–2 歲托育） | 全國平均 1,978／月（2023，不含餐）；一線城市平均 >5,500；成都普惠托育上限 ≤4,000（約 3,967）；上海社區「寶寶屋」每年 12 次免費 2 小時臨托 | 上海、成都公立托育的實際月費**未找到** |
| `KG.*` / `BENEFIT.kgCap` | 上海公辦一級園 225、二級園 175、示範園 700／月（2012 標準）＋餐費約 8 元／餐；上海普惠民辦 ≤700／月；**大班免保育教育費**（2025 秋起） | 成都收費標準**未找到** |
| `BENEFIT.leaveRate`、`leaveMonths` | 生育津貼 ≈ **100%**（按單位上年度平均工資）；上海 158 天、四川 188 天；父親 10–30 天 | 給付來自生育保險，2025 年全國平均每人近 3 萬元 |
| `COST.elementaryPublic` 等 | 義務教育免學費；家庭教育支出（全國平均，含補習）：小學 4,651、國中 6,891、普通高中 13,346、學前 7,826 | 北大 CIEFR 2022–23 學年 |
| `COST.cram` | 雙減後學科類校外培訓參與率 **13.5%**、非學科類 13.6%（2022–23） | 實際月費**未找到**；最高 25% 家庭的學科類花費是最低 25% 的 6 倍 |
| `COST.uni` | 上海公辦高校平均學費 **7,215**／年（2023 秋起）；四川文科 4,800、理工 5,200、醫學 5,800 | 家庭高等教育支出平均 29,135／年 |
| `COUNTIES[].price` / `priceNew` | 見上表。上海新房 ≈ 128 萬台幣／坪；二手 ≈ 57 萬；成都新房 ≈ 30 萬；二手 ≈ 19 萬 [DERIVED] | 建築面積含公攤，可直接和台灣權狀坪比 |
| `COUNTIES[].rent` | 上海 84.39／㎡：50 ㎡ 約 4,200、70 ㎡ 約 5,900、90 ㎡ 約 7,600 [DERIVED] | 成都 34–49／㎡：70 ㎡ 約 2,400–3,400 [DERIVED] |
| `BANK` / `QINGAN` | 商貸約 3.1%（LPR 3.5% 減點），30 年；公積金貸款 2.6%；首付 15% | 公積金貸款上限：上海家庭首套 240 萬（多子女 +20%）；成都雙人 120 萬 |
| `COST.closing` | 契稅 1%（≤140 ㎡）、1.5–2%（>140 ㎡）；仲介費**未查證** | |
| `HISTORY.tfr` / `births` | 出生 792 萬（2025）、954 萬（2024，推算自文中「少 162 萬」）；TFR 學者估 ≈1.0 | 官方不公布每年 TFR |

### 模型需要的結構性調整

1. **薪資分布要另外處理。** 官方只有平均數，平均與中位數差距很大。建議用「人均可支配收入五等分」的形狀，搭配城市平均工資，推估各城市受薪者的 PR。這部分一定要在遊戲裡標示為估計。
2. **公積金是強制儲蓄。** 員工自付 5–12%，雇主再付同樣金額，存進個人帳戶，只能用於買房、還房貸或付房租。模型可把「員工＋雇主公積金」當成可用於住房的錢，但不能拿來付托育或學費。
3. **所得稅負擔低，子女扣除用「扣除額」而不是津貼。** 年收 15 萬元的上海受薪者，所得稅只有約 3,900 元（2.6%）。社保加公積金才是主要的扣款。
4. **產假長、給付接近全薪，但 3 歲後幾乎沒有現金補助。** 台灣的育嬰留停津貼（80%、最長 6 個月）在大陸對應的是「生育津貼」（約全薪、158–188 天，只限母親）。台灣 2–6 歲育兒津貼在大陸沒有對應項目。
5. **戶籍簡化。** 預設玩家「有當地戶籍，或有居住證且達到積分標準」。另設一個「非戶籍」開關：上海公辦幼兒園排在戶籍之後、高中與大學考試要回原籍（或改讀民辦／國際學校）、買房要先繳社保滿 1 年。全國育兒補貼不受影響。見 §11。
6. **祖父母帶孩子很普遍。** 「長輩帶」選項在大陸應該是主流選擇之一，但沒有找到比例數據。
7. **房子是毛胚或精裝。** 大陸新房常交「毛胚房」，裝修費用要另外算。本次沒有找到裝修費用數據。

---

## 1. Currency

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| CNY→TWD spot, Bank of Taiwan, buying / selling | 4.733 / 4.783. Mid **4.758**. | 2026-10-08 | [rate.bot.com.tw](https://rate.bot.com.tw/xrt/quote/l6m/CNY) | [OFFICIAL] |
| 6-month range of the spot buying rate | 4.584 (2026-04-24/27/28) to 4.783 (2026-08-04) | 2026-04-13 to 10-08 | same | [OFFICIAL] |
| China implied PPP conversion rate (IMF WEO) | 2023: 3.645; 2024: 3.531; **2025: 3.399**; 2026f: 3.293 CNY per international $ | WEO | [IMF DataMapper API](https://www.imf.org/external/datamapper/api/v1/PPPEX/CHN/TWN) | [OFFICIAL] |
| Taiwan PPP conversion rate | ≈13.65 TWD per international $ | 2025 | taken from `jp.md` §1 (IMF GDP-PPP ÷ nominal) | [DERIVED] |
| PPP cross rate CNY→TWD | 13.65 / 3.399 = **4.02 TWD per CNY** | 2025 | | [DERIVED] |
| Market rate ÷ PPP rate | 4.758 / 4.02 = **1.18**. Yuan amounts look about 18% "bigger" in TWD at market rates than their purchasing power in Taiwan. | | | [DERIVED] |

Recommendation (same as Japan): run the China simulation in CNY, map the household by **local income percentile**, and convert only for display.

---

## 2. Wages and incomes

### 2.1 NBS average wages, 2025 (released 2026-05-15)

Source: [NBS 2025年城镇单位就业人员年平均工资情况](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202605/t20260515_1963707.html). [OFFICIAL]

| Measure | 2025 annual | 2024 | Nominal growth |
|---|---|---|---|
| Urban **non-private** units (state, collective, listed firms etc.) | **129,441** | 124,110 | +4.3% |
| Urban **private** units | **71,590** | 69,476 | +3.0% |
| Enterprises above designated size (规模以上企业), all positions | 106,080 | | +3.5% |

By region (non-private / private): East 149,902 / 80,149; Central 102,645 / 58,627; **West 114,989 / 60,923**; Northeast 103,803 / 54,430.

Selected industries (non-private / private): IT and software 248,752 / 128,166; finance 211,164 / 140,451; manufacturing 113,594 / 76,055; education 133,539 / 63,908; health 146,266 / 75,631; construction 92,036 / 66,275; accommodation and catering 62,461 / 55,123; real estate 89,679 / 53,338 (−2.4% / −4.7%).

By position in 规模以上企业 (all ownership types): managers (中层及以上) **210,016**; professionals 155,491; clerical 94,936; service workers 79,857; production workers 80,739.

**NBS publishes no median.** Its definition is total wage bill ÷ average headcount. Non-private units over-represent state enterprises, public institutions and large firms, so 129,441 is far above what a typical worker earns.

### 2.2 Other wage benchmarks

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Migrant workers (农民工, 301.15 million), average monthly income | **5,075** (+2.3%); 外出 5,774; 本地 4,376. East 5,501; West 4,653. Average age 43.3. | 2025 | [NBS 2025年农民工监测调查报告](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202604/t20260430_1963472.html) | [OFFICIAL] |
| Shanghai 2025 average monthly wage (全口径, used for social-insurance bases) | **12,577** (×12 = 150,924) | 2025 | [Kaizen CPA summary of Shanghai 2026 base notice](https://www.kaizencpa.com/download/china/2026%20Shanghai%20New%20Social%20Security%20&%20HPF%20Base%20Rules(CHS).pdf) | [SECONDARY], quoting official notice |
| Sichuan 2025 average monthly wage (全省城镇全部单位) | **7,831** (×12 = 93,972) | 2025 | [The Paper, 2026-09-11](https://m.thepaper.cn/newsDetail_forward_34052402) | [NEWS] |
| Chengdu average wage | **not found** (Chengdu-specific 2025 figure; Chengdu uses the Sichuan provincial base) | | | |
| Implied minimum wages | Shanghai HPF lower base 2,740; Chengdu HPF lower base 2,330 (central districts) / 2,200 (counties). These usually equal the local minimum wage. | 2026 | §3.3 | [UNVERIFIED] that they equal the minimum wage |

### 2.3 Distribution: per-capita disposable income, 2025

Source: [NBS 2025年居民收入和消费支出情况](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202601/t20260119_1962321.html); quintiles via [Jiemian](https://m.jiemian.com/article/14049006.html) quoting the 2025 statistical communiqué. [OFFICIAL] / [NEWS]

| Measure | Value (per person, per year) |
|---|---|
| National mean / **median** | 43,377 / **36,231** (median = 83.5% of mean) |
| Urban mean / median | 56,502 / **51,115** (90.5%) |
| Rural mean / median | 24,456 / 20,711 (84.7%) |
| Quintile means: low / lower-middle / middle / upper-middle / high | **10,150 / 22,702 / 35,536 / 55,586 / 103,778** |
| Ratio to national median [DERIVED] | 0.280 / 0.627 / 0.981 / 1.534 / 2.864 |
| Shanghai, all residents | **91,987** (+4.3%), highest in China ([36Kr](https://www.36kr.com/p/3679779235311494)) |
| Sichuan, all residents | 36,120 (same source) |
| Chengdu, urban residents | **59,509** ([旺報](https://wantrich.chinatimes.com/news/20260522900007-420101)) |

- These are household incomes divided by household members, including children and retirees. They include the large urban–rural gap, so the spread is wider than among urban wage earners. Taiwan's P90/P50 for wages is 2.45; China's top-quintile mean is 2.86× the median.
- Urban-only quintiles for 2025 were **not found** (published in the yearbook).

### 2.4 Average vs median: the gap, and suggested model values

No official wage median or wage deciles exist for China. The gap between headline averages and typical pay is large:
- Private-sector average (71,590) is 55% of the non-private average (129,441).
- Migrant workers, about 40% of urban employment, average about 60,900 a year.
- Urban per-capita disposable income median is 51,115, which already includes the wages of all earners in a household.

**Suggested median full-time annual pay, bonuses included [ESTIMATE]:**

| Area | Suggested median | Reasoning |
|---|---|---|
| National urban employees | **≈ 75,000** | Between the private-unit average (71,590) and the 规模以上 average (106,080); migrant-worker average 60,900 sits below it. Averages exceed medians by roughly 20–40% in skewed wage distributions. |
| Shanghai | **≈ 115,000** (≈ 0.75 × 150,924) | Applies the same mean-to-median shrink to the Shanghai 全口径 average |
| Chengdu | **≈ 80,000** (≈ 0.85 × 93,972, Chengdu above Sichuan average) | Sichuan average used as a floor; Chengdu urban income 59,509 per person is 1.65× the Sichuan all-resident figure |

These are not sourced numbers. Replace them if a city 工资指导价位 (wage guidance price, which does publish P10/P50/P90 by occupation) is found. Both Shanghai and Chengdu publish such tables annually, but they were not reached this session.

### 2.5 Age profile, bonus, growth

- **Wages by age:** **not found.** NBS does not publish them. Suggest reusing Taiwan's curve [ESTIMATE].
- **Bonus:** no official statistic. A 13th-month salary is common; finance and tech pay more [UNVERIFIED]. Tax treatment: the annual bonus can be taxed separately (not added to comprehensive income) until **2027-12-31** ([Sina, 2025-05-15](https://finance.sina.cn/2025-05-15/detail-inewrcye0261594.d.html)). [NEWS]
- **Nominal growth:** 2025 wages +4.3% (non-private), +3.0% (private); per-capita disposable income +5.0% nominal. 2026 full-year data are not out. Suggested `toBase` 2025→2026: **×1.03** [ESTIMATE].

---

## 3. Taxes and social insurance (employee)

### 3.1 Individual income tax (个人所得税), 2026

Rates on annual comprehensive income (wages, labour fees, royalties) after deductions. Source: [本地宝 summary of the IIT law table](https://m.bendibao.com/bsy634679.html). [SECONDARY], quoting the law.

| Annual taxable income | Rate | Quick deduction |
|---|---|---|
| ≤ 36,000 | 3% | 0 |
| 36,000–144,000 | 10% | 2,520 |
| 144,000–300,000 | 20% | 16,920 |
| 300,000–420,000 | 25% | 31,920 |
| 420,000–660,000 | 30% | 52,920 |
| 660,000–960,000 | 35% | 85,920 |
| > 960,000 | 45% | 181,920 |

- **Basic deduction:** 60,000 per year (5,000 per month).
- Employee social-insurance and HPF contributions are deductible (HPF up to 12% of capped base).
- **Taxation is individual.** No joint filing.
- **No local income tax.**
- **Annual bonus, separate taxation (to 2027-12-31):** bonus ÷ 12 sets the rate from the monthly table (3% ≤3,000; 10% ≤12,000; 20% ≤25,000; 25% ≤35,000; 30% ≤55,000; 35% ≤80,000; 45% above). Quick deductions 0 / 210 / 1,410 / 2,660 / 4,410 / 7,160 / 15,160. [UNVERIFIED this session apart from the first bracket; standard 财税〔2018〕164号 table]

**专项附加扣除 (special additional deductions).** Source: [本地宝, 2026-01-04](https://m.bendibao.com/bsy644838.html). [SECONDARY]

| Item | Amount | Notes |
|---|---|---|
| **3岁以下婴幼儿照护** (child under 3) | **2,000 per child per month** | One parent 100%, or 50/50 |
| **子女教育** (age 3 to end of full-time education, incl. preschool, university, postgraduate) | **2,000 per child per month** | Same split rule |
| 住房贷款利息 (first-home mortgage interest) | 1,000 per month, max 240 months | Cannot combine with rent |
| 住房租金 (rent) | 1,500 per month in municipalities and provincial capitals (Shanghai, Chengdu); 1,100 or 800 elsewhere | |
| 赡养老人 (supporting parents ≥60) | 3,000 per month (only child); siblings share, max 1,500 each | |
| 大病医疗 | out-of-pocket above 15,000, cap 80,000 per year | |
| 继续教育 | 400 per month (degree) or 3,600 (certificate) | |

No 2026 change to these amounts was found. The national 育儿补贴 is **exempt from IIT** ([Guangzhou government](https://www.gz.gov.cn/zt/shb/content/post_10391734.html)). [OFFICIAL]

### 3.2 Social insurance, employee share

| Item | Shanghai | Chengdu / Sichuan | Source | Label |
|---|---|---|---|---|
| Pension | **8%** (employer 16%) | 8% (employer 16%) | Shanghai: Kaizen CPA (2026 notice) | [SECONDARY]; Chengdu [UNVERIFIED], national standard |
| Medical (incl. maternity) | **2%** (employer 9%) | 2% (employer rate not found) | same | [SECONDARY] / [UNVERIFIED] |
| Unemployment | **0.5%** (employer 0.5%) | 0.4% | same | [SECONDARY] / [UNVERIFIED] |
| Work injury | 0 (employer 0.2–1.9%) | 0 | same | [SECONDARY] |
| Contribution base, 2026 | **7,546–37,731** per month, effective 2026-07-01 to 2027-06-30 (60%–300% of 12,577) | **4,699–23,493** per month (Sichuan, 2026; 60%–300% of 7,831) | Kaizen CPA; [The Paper](https://m.thepaper.cn/newsDetail_forward_34052402) | [SECONDARY] / [NEWS] |
| **Total employee SI** | **10.5%** of capped wage | **10.4%** | | [DERIVED] |

**No per-dependant premium.** Children join resident medical insurance (城乡居民医保) separately, paying a flat annual premium [UNVERIFIED amount; not researched].

### 3.3 Housing provident fund (住房公积金)

| Item | Shanghai | Chengdu | Source | Label |
|---|---|---|---|---|
| Basic rate (employee = employer) | **5%, 6% or 7%** | **5%–12%** (whole numbers; 1–4% for firms in difficulty) | Kaizen CPA; [川观 2026](https://cbgc.scol.com.cn/news/7812483) | [SECONDARY] / [NEWS] |
| Supplementary fund | 1%–5% each side | n/a | Kaizen CPA | [SECONDARY] |
| Base limits, 2026 | 2,740–37,731 per month | 2,330 (central districts) or 2,200 (counties) to **32,969** | same | [SECONDARY] / [NEWS] |

The employer's matching contribution goes into the employee's own account. It is untaxed and can be withdrawn for home purchase, mortgage repayment and rent.

### 3.4 Take-home pay, one employee, 2026 rules [DERIVED]

Script `scratchpad/cn_tax.py` (not in the repo). Assumptions:
- Pay spread evenly over 12 months, no separate bonus.
- HPF at 7% employee rate. Bases capped as in §3.2–3.3, using the 2026-07 Shanghai bases for the whole year.
- Only the 60,000 basic deduction, no special deductions unless stated.

| Gross | Shanghai: SI / HPF / IIT | Shanghai net cash ÷ gross | Chengdu net cash ÷ gross | IIT with one child under 3 (24,000 deduction) — Shanghai |
|---|---|---|---|---|
| 60,000 | 9,508 / 4,200 / 0 | 77.2% (84.2% incl. own HPF) | 82.6% | 0 |
| 100,000 | 10,500 / 7,000 / 675 | 81.8% | 81.9% | 0 |
| 150,000 | 15,750 / 10,500 / 3,855 | 79.9% | 80.0% | 1,455 |
| 200,000 | 21,000 / 14,000 / 7,980 | 78.5% | 78.6% | 5,580 |
| 300,000 | 31,500 / 21,000 / 20,580 | 75.6% | 76.2% | 15,780 |
| 500,000 | 47,541 / 31,694 / 58,271 | 72.5% | 75.8% | 52,271 |
| 1,000,000 | 47,541 / 31,694 / 215,348 | 70.5% | 72.0% | 206,948 |

- At 60,000 in Shanghai, the floor base (7,546) makes SI 15.8% of pay. Low earners pay proportionally more.
- Income tax matters only above about 150,000. Most of the gap to gross is SI plus HPF.
- The employer's matching HPF (another 7%) is extra money the household can use for housing.

---

## 4. Housing

### 4.1 Prices per ㎡ (建筑面积, gross floor area including common-area share 公摊)

| City | Type | Value | Period | Source | Label |
|---|---|---|---|---|---|
| Shanghai | New homes, annual average | **81,337** (+6.93%) | 2025 | [The Paper, 2026-01-15](https://m.thepaper.cn/newsDetail_forward_32389935); paragraph cites 中指院 for volumes; price source not explicit | [NEWS] / [SECONDARY] |
| Shanghai | Second-hand, **transaction** average | **35,972** (+1.98% MoM) | 2026-05 | [36Kr / 丁祖昱评楼市, 2026-06-09](https://www.36kr.com/p/3845310705027328); provider not named | [SECONDARY] |
| Shanghai | Second-hand sales mix | 55% of 135,225 H1-2026 sales under 3M yuan per unit; 81% under 5M | H1 2026 | [36Kr / pti普睿](https://www.36kr.com/p/3909019242534022) | [SECONDARY] |
| Chengdu | New homes, average | **≈18,912** | 2025 Q1–Q3 | [36Kr, 2025-10-17](https://www.36kr.com/p/3512605998013314); source not named (CRIC cited for volumes) | [SECONDARY] |
| Chengdu | Second-hand transaction average | **≈12,200** (about 2,000 lower than early 2025) | 2026-01 | [The Paper](https://m.thepaper.cn/newsDetail_forward_32389935); source not named | [NEWS] |
| 100 cities (中指) | New / second-hand sample averages | **17,285 / 12,452** (YoY +2.12% / −6.94%) | 2026-09 | [Eastmoney](https://finance.eastmoney.com/a/202610013888223253.html) | [SECONDARY] |

**Why the Shanghai second-hand figure is "low":** it is a transaction average weighted to the units that actually sell, which are mostly smaller, older and suburban. Listing averages for central districts are much higher. Asking-price platform averages (中国房价行情, 安居客) could not be read. Treat 35,972 as a citywide typical-transaction value, not a central-city price.

**Trends (NBS 70-city index):** Shanghai, August 2026: new +0.4% MoM, **+3.0% YoY**; second-hand +0.3% MoM, **−0.8% YoY**. Tier-1 YoY: new −0.9%, second-hand −2.7%. Tier-2: −2.7% / −4.9%. ([NBS 2026-09-15](https://www.stats.gov.cn/zwfwck/sjfb/202609/t20260915_1965303.html)) [OFFICIAL]. Chengdu's index values were not captured. 中指 reports Chengdu new-home prices +9.23% YoY in June 2026 (structural, driven by premium projects) and Chengdu second-hand −5% to −8% YoY ([NBD](https://www.mrjjxw.com/articles/2026-07-01/4443842.html)). [SECONDARY]

**Per 坪 for Taiwanese readers [DERIVED]** (× 4.758 TWD, × 3.3058 ㎡):
- Shanghai new: **127.9萬 TWD per 坪**
- Shanghai second-hand transaction: 56.6萬
- Chengdu new: 29.7萬
- Chengdu second-hand: 19.2萬

Chinese 建筑面积 includes 公摊 (typically 20–30% in high-rises [UNVERIFIED]), so it is closer to Taiwan's 權狀坪 than Japan's net area.

**Typical unit size:** in Chengdu core districts, new-home average unit size is close to **140 ㎡**, and second-hand about **95 ㎡** (H1 2026, [NBD / 中指](https://www.nbd.com.cn/articles/2026-07-10/4467671.html)). [NEWS] Shanghai average unit size was **not found**. Suggested game sizes [ESTIMATE]: 2-room 60–75 ㎡, 3-room 90–110 ㎡, 4-room 130–150 ㎡ (gross).

### 4.2 Rents

| Item | Value | Period | Source | Label |
|---|---|---|---|---|
| Shanghai residential average rent | **84.39 per ㎡ per month** | 2026-08 | 中指研究院 via [格隆汇](https://m.gelonghui.com/live/2655821) | [SECONDARY] |
| Shenzhen (comparison) | 83.05 | 2026-08 | same | [SECONDARY] |
| Tier-1 city average | 73.21 | 2026-03 | 中指 via [Jiemian](https://m.jiemian.com/article/15051788.html) | [SECONDARY] |
| 50-city average | **34.02** (−2.45% YoY) | 2026-08 | 中指 via [财闻网](https://www.caiwennews.com/article/1585663.shtml) | [SECONDARY] |
| Chengdu, citywide | **≈49** (2021 peak 54.6) | 2024 | [澎湃号 contributor report, 2024-12](https://www.thepaper.cn/newsDetail_forward_29571003); underlying source not named | [SECONDARY], weak |
| Chengdu, by district | 锦江, 武侯 >60; 双流, 金牛, 青羊, 成华 40–55; 温江, 新都, 郫都, 龙泉驿 <40 | 2024 | same | [SECONDARY], weak |
| Chengdu, August 2026 trend | rents turned down MoM | 2026-08 | 中指 via [36Kr](https://eu.36kr.com/zh/p/3972723459895553) | [SECONDARY] |

**Conflict:** Chengdu's 49 per ㎡ looks high against the 50-city average of 34. It may be a listing average skewed to small central units. Use 35–45 as the central range [ESTIMATE].

**Rent by size [DERIVED]** (per-㎡ rent × area; per-㎡ rent falls with size, so larger units are overstated):

| City | 1-room 45 ㎡ | 2-room 70 ㎡ | 3-room 95 ㎡ | 4-room 130 ㎡ |
|---|---|---|---|---|
| Shanghai (84.39) | 3,800 | 5,900 | 8,000 | 11,000 |
| Chengdu (40, central estimate) | 1,800 | 2,800 | 3,800 | 5,200 |

Suggested game values [ESTIMATE]: Shanghai ≈ 3,500 / 5,500 / 7,000 / 9,500; Chengdu ≈ 1,700 / 2,600 / 3,400 / 4,500.

### 4.3 Mortgages, down payments, purchase costs

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| LPR 1-year / 5-year+ | **3.0% / 3.5%**, unchanged for 16 months (last cut −10bp in 2025-05) | 2026-09-20 | [每经](https://www.mrjjxw.com/articles/2026-09-20/4586489.html) | [NEWS] |
| Weighted average rate on new housing loans | **≈3.1%** (flat YoY) | 2026-08 | same | [NEWS] |
| 公积金 loan rate, first home | ≤5 yrs **2.1%**; >5 yrs **2.6%** (from 2025-05-08) | 2026 | same | [NEWS] |
| 公积金 loan rate, second home | ≥2.525% (≤5 yrs); ≥3.075% (>5 yrs) | 2026 | same | [NEWS] |
| Shanghai min. down payment, commercial loan | First home **15%**; second home 25% inside the outer ring, 15% outside (from 2026-08-21) | 2026-08 | [同花顺](https://stock.10jqka.com.cn/20260820/c679130049.shtml) | [NEWS] |
| Shanghai 公积金 loan cap | First home: family **2.4M** (from 1.6M), individual 1.2M; second home family 2.0M. Multi-child +20%, green building +15%, combined max **3.24M** (first) / 2.7M (second) | from 2026-02-26 | [华尔街见闻](https://wallstreetcn.com/articles/3766127) | [NEWS] |
| Chengdu 公积金 loan cap | Single depositor **0.8M**, two depositors **1.2M**; +20% (0.96M / 1.44M) for existing homes, resettlement purchases and green-building new homes | from 2026-03-25 | [Xinhua](https://www.news.cn/local/20260324/6b336c1049ad405b9c1c6acb5f77283f/c.html); [川观](https://cbgc.scol.com.cn/news/7885335) | [NEWS] |
| Chengdu 公积金 down payment and subsidy | Min. down payment **15%** on new homes; **20% interest subsidy** on 公积金 new-home loans, capped 25,000 per loan; valid 2026-08-25 to 2026-12-31 | 2026-08 | [川观](https://cbgc.scol.com.cn/news/7885335) | [NEWS] |
| National min. down payment | First home 15%, second 25% (2024-05 national rule) | | | [UNVERIFIED] this session |
| Deed tax (契税) | **1%** for homes ≤140 ㎡ (first or second home); >140 ㎡: 1.5% first home, 2% second home (from 2024-12-01) | 2024–26 | [People's Daily app](https://www.peopleapp.com/column/30047337135-500005914256); [Xinhua](https://www.news.cn/house/20241120/55512a4b95524b6d9ee2ac2013c28de1/c.html) | [NEWS] |
| Agent commission | about 1–2.7% of price in big cities | | | [UNVERIFIED] |
| Property management fee | Shanghai ~2–5, Chengdu ~1.5–3 per ㎡ per month | | | [ESTIMATE] |
| Recurring property tax | Shanghai pilot 房产税 since 2011 on some additional or non-hukou purchases (0.4–0.6% of 70% of value, with per-person exempt area); none in Chengdu | | | [UNVERIFIED] |
| Shanghai trade-in subsidy | Buy new outside outer ring + sell a Shanghai home within a year: 1% of loan, max 50,000 (or 30,000 / 80,000 combined); 2026-08-21 to 2027-03-31 | 2026-08 | [同花顺](https://stock.10jqka.com.cn/20260820/c679130049.shtml) | [NEWS] |

**Game default suggestion [ESTIMATE]:**
- `BANK = { ltv: 0.85, years: 30, rate: 0.031 }`.
- A 公积金 tranche at 2.6% up to the city cap (both spouses contributing), with the remainder commercial. This is the closest analog to Taiwan's 新青安.

### 4.4 Price-to-income (rough) [DERIVED]

| Case | Price | Two average earners | Ratio |
|---|---|---|---|
| Shanghai, 90 ㎡ new | 7.32M | 2 × 150,924 = 301,848 | **24×** |
| Shanghai, 90 ㎡ second-hand (transaction average) | 3.24M | 301,848 | **10.7×** |
| Chengdu, 90 ㎡ new | 1.70M | 2 × 93,972 (Sichuan average) = 187,944 | **9.1×** |
| Chengdu, 90 ㎡ second-hand | 1.10M | 187,944 | **5.8×** |

Mortgage example: a Shanghai 3.24M second-hand home with 15% down at 3.1% over 30 years costs about **11,760 per month**.

---

## 5. Households and living costs

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Per-capita consumption: national / urban / rural | **29,476 / 35,869 / 20,259** | 2025 | [NBS](https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202601/t20260119_1962321.html) | [OFFICIAL] |
| National composition | Food 8,631 (29.3%); housing 6,397 (21.7%); transport and communication 4,306 (14.6%); education, culture, recreation 3,489 (11.8%); health 2,573 (8.7%); clothing 1,554; household goods 1,667; other 859 | 2025 | same | [OFFICIAL] |
| Urban composition | Food 10,155; housing 8,095; transport and communication 5,251; education, culture, recreation 4,298; health 2,932; clothing 1,941; household goods 2,033; other 1,164 | 2025 | same | [OFFICIAL] |
| Shanghai per-capita consumption | **54,765** (highest; Beijing 50,667) | 2025 | [聯合報](https://udn.com/news/story/7333/9292331) | [NEWS] |
| Chengdu per-capita consumption | **not found** | | | |
| Consumption by income quintile | **not found** for 2025 (yearbook table) | | | |
| Utilities, telecom | **not found** | | | |
| Shanghai licence-plate auction (needed for a petrol car) | Average **94,159** (2026-01; 3,784 plates; 8.9% success); 93,679 average in 2026-07 | 2026 | [NetEase](https://m.163.com/dy/article/L3DPGPHB05563MK1.html) | [NEWS] |
| Chengdu car registration | No licence-plate quota; tail-number driving restrictions on weekdays | | | [UNVERIFIED] |
| Public-transport monthly pass | **not found** | | | |

**Mapping to 生活水準 [ESTIMATE]:** per-person consumption bands for a city household could be set as Shanghai ≈ 35,000 (frugal) / 55,000 (normal) / 80,000 (comfortable), Chengdu ≈ 25,000 / 35,000 / 50,000, scaled from the city averages with Taiwan's 0.7 / 1.0 / 1.4 multipliers. These include housing costs as NBS counts them (mostly imputed rent), so the game must not double-count rent.

---

## 6. Birth, leave and 0–2 care

### 6.1 Childbirth costs

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| National target | 政策范围内住院分娩个人「无自付」 basically nationwide in 2026. By 2026-07-09, **28 provinces** had achieved it for insured female employees; 9 provinces extended it to resident insurance. | 2026-07 | [Yicai](https://www.yicai.com/news/103267678.html) | [NEWS] |
| **Shanghai** | From **2026-10-01**, compliant maternity medical costs are **free at point of use** ("无自付"). 42 perinatal checks draw first on a **4,500** quota; maternity insurance pays the rest. Delivery in-policy costs fully covered. Resident-insurance mothers and unemployed spouses of insured men are covered at the same standard. Meals and single rooms are self-paid. Previously typical prenatal costs were 6,000–8,000. | 2026-09-08 announcement | [The Paper](https://m.thepaper.cn/newsDetail_forward_34036322); [Xinhua](https://www.news.cn/politics/20260908/cbb7adfb18bc41db878e87f1b75a043d/c.html) | [NEWS] |
| Sichuan / Chengdu | Whether Sichuan is among the 28 provinces was **not confirmed** | | | |
| Labour analgesia | Covered by insurance in 30 provinces | 2026 | Yicai | [NEWS] |
| 月子中心 (confinement centre), 28 days | Beijing high-end 113,000–185,000; tier-1 high-end range 50,000–800,000; tier-3/4 from about 16,000. **Shanghai and Chengdu prices not found.** | 2024 | [Jiemian](https://www.jiemian.com/article/11448767.html) | [NEWS] |
| Live-in nanny (Beijing example) | about 10,000 per month | 2025 | [Xinhua](https://www.news.cn/fortune/20250823/399d4bb4421c41d580e7ced56b874e6c/c.html) | [NEWS] |

### 6.2 Leave and maternity allowance

| Item | Shanghai | Sichuan (Chengdu) | Source | Label |
|---|---|---|---|---|
| National 产假 | 98 days (15 before birth) | 98 days | [The Paper](https://m.thepaper.cn/newsDetail_forward_33792100) | [NEWS] |
| Extra 生育假 | **+60 days → 158 days** (since 2021-11-25) | **+90 days → 188 days**; +30 more for a 3rd child with employer consent (revision announced 2025-12-10; effective date **not found**) | [The Paper 2021](https://www.thepaper.cn/newsDetail_forward_15545857); [川观 2025-12-10](https://cbgc.scol.com.cn/news/7052819) | [NEWS] |
| Father's leave | 配偶陪产假 10 days | 男方护理假 **30 days** (from 20) | Shanghai [UNVERIFIED this session]; Sichuan 川观 | |
| 育儿假 (each parent, until age 3) | 5 days per year | 10 working days per year | same | [NEWS] |
| Pay during leave | 生育假 treated as 产假 (maternity allowance); 育儿假 at normal wage | All leave counts as attendance; wages unaffected. A cost-sharing fund for the extra leave is still being drafted. | same | [NEWS] |
| 生育津贴 (maternity allowance) | Paid by maternity insurance; standard rule = employer's previous-year average monthly wage ÷ 30 × leave days | same | 社会保险法 | [UNVERIFIED] formula |
| Direct payment to individual | All regions now pay it directly to the mother. 2025 national average about **30,000** per recipient; 4.81 million recipients | | [Yicai](https://www.yicai.com/news/103267678.html) | [NEWS] |

**Game mapping [ESTIMATE]:** `leaveRate ≈ 1.0` of the mother's (employer-average) wage for 158 days in Shanghai and 188 in Chengdu, paid by insurance. No equivalent of Taiwan's 6-month 80% 育嬰留停 for fathers. Unpaid extended leave beyond this is possible but not standard.

### 6.3 Childcare 0–2 (托育)

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| National average fee, excl. meals | **1,978 per month**; tier-1 cities **>5,500** | 2023 (State Council report 2024-09) | [chinanews](https://www.chinanews.com.cn/sh/2026/02-07/10567764.shtml); [Huxiu](https://m.huxiu.com/article/4877597.html) | [NEWS] |
| Beijing Chaoyang 普惠 pilot | average fell from 8,000 to **3,130** per month | 2025 | [Xinhua](https://www.news.cn/fortune/20250823/399d4bb4421c41d580e7ced56b874e6c/c.html) | [NEWS] |
| Private kindergarten nursery class (example) | ~8,000 per semester (<3,000 per month) | 2026 | Huxiu | [NEWS] |
| **Chengdu 普惠托育 price cap** | Full-day fee ≤ **80%** of the district's previous-year urban per-capita monthly disposable income **and ≤ 4,000**; half-day ≤50% | 2023 rule | [The Paper](https://m.thepaper.cn/baijiahao_24882883) | [NEWS] |
| Chengdu cap at city level [DERIVED] | 59,509 / 12 × 0.8 ≈ **3,967** | 2025 income | | [DERIVED] |
| Chengdu operator subsidy | 300 per certified place per month | 2023 | same | [NEWS] |
| Shanghai 社区「宝宝屋」 | 350+ sites in 220+ streets; ≥30 drop-in places per day. Example (Fengxian): **12 free 2-hour sessions per year**, then 30 per session | end-2025 | [ifeng / CCTV](https://news.ifeng.com/c/8pwPf4UJTHj) | [NEWS] |
| Shanghai full-day 托育 or 托班 fees | **not found** | | | |

Suggested game values [ESTIMATE]:
- **Shanghai:** public 托班 ≈ 1,500–2,500; 普惠 private ≈ 3,500–4,500; private ≈ 6,000–8,000; nanny ≈ 9,000–12,000 per month.
- **Chengdu:** 普惠 ≈ 2,000–3,000; private ≈ 3,500–5,000; nanny ≈ 6,000–8,000 per month.

---

## 7. Ages 3–6 and schooling

### 7.1 Kindergarten

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| **Free final year (大班)** nationwide | From autumn 2025, public kindergartens waive the 保育教育费 in full for the last pre-school year; private kindergartens get the same amount off. Meals and sundry fees still paid. ~12–14 million children; ~20bn yuan per semester. | 2025-09 | [Xinhua](https://www.news.cn/politics/20250807/2439ab617ae84d6d8e058ce5ad52f7e9/c.html); [The Paper](https://www.thepaper.cn/newsDetail_forward_33119834) | [NEWS] |
| Expansion to other years in 2026 | **Not announced.** 2026 central funding 458亿 to "consolidate" the policy | 2026 | The Paper | [NEWS] |
| Shanghai rule | From 2025-09-01 large-class fees waived at the public full-day standard; private kindergartens get the public **demonstration-kindergarten** level off | 2025 | [Shanghai gov PDF](https://www.shanghai.gov.cn/cmsres/e4/e4e0ec8f0a0148fc815dc2c4d0586e0d/89a672cd17527d96989ad99009b31339.pdf) | [OFFICIAL] |
| Sichuan rule | Plan issued 2025-11-25; public 大班 waived; private reduced by the local public level | 2025 | [川观](https://cbgc.scol.com.cn/news/7001549) | [NEWS] |
| Shanghai public kindergarten fees (Jiading district list) | 示范园 **700**; 一级园 **225**; 二级园 **175** per month (2012 price basis); meals mostly 8 yuan per meal (5–8) | list dated 2019 | [Jiading education bureau PDF](https://www.jiading.gov.cn/upload/jiaoyu/infopublicity/publicinformation/file/201911151820414350.pdf) | [OFFICIAL], possibly outdated |
| Shanghai 普惠 private kindergartens | fee cap **≤700 per month** (from 2025-12-01) | 2025 | [The Paper](https://www.thepaper.cn/newsDetail_forward_32084569) | [NEWS] |
| Shanghai new fee-setting rules | New kindergarten fee measures effective 2026-05-01 to 2031-04-30; amounts set separately | 2026 | [Shanghai DRC PDF](https://fgw.sh.gov.cn/cmsres/de/de3cfd8fde364b0983f98af5321d457f/2244da0b89efdde3b8f29503b1c509b6.pdf) | [OFFICIAL] |
| Chengdu public / private kindergarten fees | **not found** | | | |
| National household spending on preschool | **7,826 per year** (includes fees, meals, activities) | 2022–23 | [PKU CIEFR](https://ciefr.pku.edu.cn/docs/2025-11/7a932131bc8443fbbbd19c713b746e78.pdf) | [OFFICIAL] (research) |

Suggested game values per month [ESTIMATE], fees plus meals:

| Type | Shanghai | Chengdu |
|---|---|---|
| Public | ≈ 400–900 | ≈ 400–700 |
| 普惠 private | ≈ 900 | ≈ 800–1,200 |
| Ordinary private | ≈ 3,000–6,000 | ≈ 1,500–3,000 |
| Bilingual or international | ≈ 10,000–20,000 | ≈ 5,000–10,000 |

The final year is lower by the public fee.

### 7.2 School years 6–18

- **Compulsory education (grades 1–9) is tuition-free in public schools.** Families pay for meals, uniforms, activities and after-school care.
- **Household education spending (CIEFR, 2022–23, national averages per student per year, all costs incl. tutoring):** primary **4,651**; junior secondary **6,891**; general senior secondary **13,346**; vocational secondary 8,419; higher education **29,135**. Urban households spend about 1.4× rural per household (17,565 vs 12,423). [OFFICIAL] (research) ([CIEFR](https://ciefr.pku.edu.cn/docs/2025-11/7a932131bc8443fbbbd19c713b746e78.pdf))
- **Tutoring after 双减 (2021):**
  - Academic tutoring participation, primary to senior secondary: 34.3% (2016–17) → 15.1% (2021–22) → **13.5%** (2022–23).
  - Non-academic: 17.7% → 18.9% → 13.6%.
  - The top 25% of spenders spend **6×** the bottom 25% on academic tutoring and 5.4× on non-academic.
  - Same CIEFR source. The actual monthly price of tutoring in Shanghai or Chengdu was **not found**. Academic tutoring for school-age children now operates mostly as one-to-one or small-group "家教" outside licensed institutions [UNVERIFIED].
- **Private and international school fees** for Shanghai and Chengdu: **not found**.
- Public senior-high tuition in Shanghai and Chengdu: **not found** (low, on the order of 1,000–3,000 per year [UNVERIFIED]).

Suggested `cram` levels [ESTIMATE]:

| Level | Shanghai, per month | Chengdu, per month |
|---|---|---|
| none | 0 | 0 |
| some | ≈ 1,500 | ≈ 800 |
| full (final exam years) | ≈ 4,000–6,000 | ≈ 2,000–3,000 |

### 7.3 University

| Item | Value | Date | Source | Label |
|---|---|---|---|---|
| Shanghai public universities, average tuition | **7,215 per year** (up 33% from 5,420) | from autumn 2023 | [The Paper](https://www.thepaper.cn/newsDetail_forward_31630614) | [NEWS] |
| Sichuan public universities | Arts **4,800**; science and engineering **5,200**; medicine **5,800** per year | from autumn 2023 | same | [NEWS] |
| Rule | Tuition ≤ 25% of per-student training cost | | same | [NEWS] |
| Private universities | Average minimum tuition up 5,734 per year between 2020 and 2025; levels not given | 2025 | same | [NEWS] |
| Dormitory fees, living costs | **not found** | | | |
| Household spending on higher education (all costs) | 29,135 per year (national average) | 2022–23 | CIEFR | [OFFICIAL] (research) |

Suggested values [ESTIMATE]:
- `uni.public` ≈ 6,000 per year tuition plus about 1,200 dormitory.
- `uniAwayRent` (living costs) ≈ 1,500–2,500 per month.
- `uni.private` ≈ 20,000–35,000 per year.

---

## 8. Government benefits

### 8.1 National 育儿补贴 (childcare subsidy)

| Item | Value | Source | Label |
|---|---|---|---|
| Amount | **3,600 per child per year** (300 per month), every child (1st, 2nd, 3rd), until age 3 | [Jiemian 2026-06-02](https://www.jiemian.com/article/14520074.html); [Sina](https://news.sina.com.cn/c/2026-06-02/doc-inhzzumh2971461.shtml) | [NEWS] |
| Start | Effective 2025-01-01; plan issued 2025-07-28 (中共中央办公厅, 国务院办公厅). Children born before 2025 who were under 3 get a pro-rated amount. | same; [Guangzhou gov](https://www.gz.gov.cn/zt/shb/content/post_10391734.html) | [NEWS] / [OFFICIAL] |
| 2026 status | Unchanged at 3,600. MoF pre-allocated **999亿** for 2026 (+10.6%); total spending about 1,100亿. A "dynamic adjustment mechanism" is being explored. | Jiemian / Sina | [NEWS] |
| Eligibility | Children under 3 born in line with the law. One guardian applies online (WeChat "育儿补贴" mini-program, provincial portals) or at the township/street office of the child's **hukou** location. No income test. | Guangzhou gov | [OFFICIAL] |
| Tax and welfare | **Exempt from IIT**; not counted as income for 低保 and other assistance tests | same | [OFFICIAL] |
| Payment | At least quarterly | Jiemian | [NEWS] |
| Lifetime total, child born 2025+ | 10,800 | same | [OFFICIAL] |

### 8.2 Local benefits

| City | Item | Status | Source |
|---|---|---|---|
| Shanghai | Cash birth bonus or extra 育儿补贴 | **None found.** Benefits are in-kind: free-at-point-of-use maternity care from 2026-10-01 (§6.1), 宝宝屋 drop-in care, larger 公积金 loans for multi-child families (+20%) | [The Paper 2025-07-30](https://m.thepaper.cn/newsDetail_forward_31253039) (lists no cash subsidy) |
| Shanghai | Kindergarten final year free; 普惠 private kindergarten ≤700 | in force | §7.1 |
| Chengdu | Cash birth bonus or extra 育儿补贴 | **None found** | |
| Chengdu | 普惠托育 price cap; 300 per place per month operator subsidy; 公积金 15% down payment and 20% interest subsidy (to 2026-12-31) | in force | §4.3, §6.3 |
| Sichuan | Longer leave (188 days, 30-day paternity); cost-sharing fund for employers being drafted | 2025-12 | §6.2 |

For comparison, other cities pay cash bonuses, e.g. Hohhot 10,000 / 50,000 / 100,000 for 1st / 2nd / 3rd child (hukou required) and Hangzhou 2,000 / 5,000 one-off for 2nd / 3rd ([Sina](https://news.sina.com.cn/c/2026-06-02/doc-inhzzumh2971461.shtml)). [NEWS]

---

## 9. Validation benchmarks

### 9.1 Cost of raising a child (育娲人口 YuWa Population Research, 2026 edition)

Released 2026-05-29. Based on CFPS microdata, a mixed-effects model and NBS macro data. Source: [Jiemian](https://www.jiemian.com/article/14508365.html); [NetEase](https://m.163.com/dy/article/L3ERMEQM055616Z4.html). [SECONDARY] (think tank, non-official)

| Measure | Per month | Pre-pregnancy to 18 [DERIVED, ×216 months] |
|---|---|---|
| National average | **2,544** | ≈ **549,500** |
| Urban | 3,127 | ≈ 675,400 |
| Rural | 1,719 | ≈ 371,300 |
| **Shanghai** (highest) | **4,751** | ≈ **1,026,200** |
| Essentials only (formula, basic clothing, compulsory schooling) | 1,733 | |
| Marginal cost of one more child | 1,109 (urban 1,481; rural 726) | |

- Economies of scale: 2nd child ≈ 70%, 3rd ≈ 60%, 4th+ ≈ 40% of the first.
- Ages 0–2 cost >2,600 per month; ages 18–21 >2,500 per month.
- Food is about 25% of spending.
- YuWa proposes 1,000 / 2,000 / 3,000 per month for 1st / 2nd / 3rd+ children.
- The ×216 total matches the ≈1.03M Shanghai figure YuWa used in earlier editions [UNVERIFIED].
- **Sichuan or Chengdu figure: not found.**

### 9.2 Fertility

| Item | Value | Year | Source | Label |
|---|---|---|---|---|
| Births | **7.92 million** (1.62 million fewer than 2024, i.e. ≈9.54 million in 2024 [DERIVED]) | 2025 | [Science and Technology Daily (NHC bulletin)](https://www.stdaily.com/web/gdxw/2026-08/28/content_571589.html); [CDT](https://chinadigitaltimes.net/chinese/?p=724503) | [NEWS] |
| Crude birth rate / death rate / natural growth | **5.63‰** (record low) / 8.04‰ / −2.41‰ | 2025 | same | [NEWS] |
| Sex ratio at birth | 111.5 | 2025 | same | [NEWS] |
| Population aged 0–15 / 65+ | 16.4% / 15.9% | 2025 | same | [NEWS] |
| TFR | **Not officially published.** Scholars estimate about 1.0–1.1 (2024); one author estimates 0.96 (2025) | | CDT | [SECONDARY] |
| Mean age of mother at first birth | **not found** | | | |
| Shanghai and Chengdu births / TFR | **not found** | | | |

---

## 10. Policy changes 2025–2026 and pending

| When | Change | Status |
|---|---|---|
| 2025-01 | National 育儿补贴 3,600 per child per year to age 3 (announced 2025-07) | in force |
| 2025-05 | LPR −10bp to 3.0% / 3.5%; 公积金 loan rate −25bp to 2.6% | in force (unchanged to 2026-09) |
| 2025-09 | Free 保育教育费 for the final kindergarten year | in force |
| 2025-12 | Shanghai 普惠 private kindergarten cap 700 per month | in force |
| 2025-12 | Sichuan: 生育假 +90 days (188 total), paternity leave 30 days, 婚假 20 days | passed; effective date not found |
| 2026-02-26 | Shanghai "沪七条": non-hukou buyers need 1 year of social insurance; unlimited purchases outside the outer ring; 公积金 cap 2.4M (3.24M max) | in force |
| 2026-03-25 | Chengdu 公积金 caps 0.8M / 1.2M | in force |
| 2026-05-01 | Shanghai new kindergarten fee-setting rules | in force |
| 2026-07-01 | Shanghai SI base 7,546–37,731 | in force |
| 2026-08-21 | Shanghai first-home down payment 15%; second home 15% outside the outer ring | in force |
| 2026-08-25 → 12-31 | Chengdu 公积金 15% down payment, 20% interest subsidy | temporary |
| 2026-10-01 | Shanghai maternity care "无自付" | in force |
| 2026 (target) | Childbirth "无自付" nationwide | 28 provinces by 2026-07 |
| to 2027-12-31 | Separate taxation of annual bonuses | temporary |
| Pending | 托育服务法 draft (普惠托育 as basic public service); possible extension of free preschool; 育儿补贴 adjustment mechanism | under discussion |

---

## 11. Hukou (户籍) and a proposed simplification

| Area | Hukou holder | Non-hukou with residence permit (居住证) | Source | Label |
|---|---|---|---|---|
| National 育儿补贴 | Eligible | Eligible; apply online or at the child's hukou location | §8.1 | [OFFICIAL] |
| Maternity insurance and 生育津贴 | Via employer insurance | Same, if insured in the city; flexible workers increasingly allowed | §6 | [NEWS] |
| Shanghai public kindergarten | Placed first | After hukou children. Priority if the parent's residence-permit points reach **120**; some districts accept property ownership or 6 months of social insurance instead | [QQ News 2026-07-24](https://news.qq.com/rain/a/20260724A075V700) | [NEWS] |
| Shanghai 中考 (senior-high entry exam) | Eligible | Parent's permit points ≥120 and child a current Grade 9 student in Shanghai | same | [NEWS] |
| Shanghai 高考 (university entry exam) | Eligible | Parent's points ≥120, plus child took 中考 in Shanghai **or** parent held the permit 3 continuous years; must graduate from a Shanghai high school | same | [NEWS] |
| Shanghai home purchase | Allowed (limits on number of units inside the outer ring) | 1 year of continuous social insurance or IIT: 1 unit inside the outer ring, unlimited outside; 3 years: 2 units inside; 5-year permit holders: 1 unit without proof | [华尔街见闻](https://wallstreetcn.com/articles/3766127) | [NEWS] |
| Chengdu | Purchase restrictions lifted (2024) | Schooling via residence permit plus social insurance / points | | [UNVERIFIED] |

**Proposed simplification for the model [ESTIMATE]:**
1. **Default:** the couple has local hukou or meets the residence-permit and 120-point thresholds. All local benefits, public schooling and exams apply. This matches the "same person in another country" framing: the player is assumed to be a settled, insured local worker.
2. **Optional toggle "非本地戶籍" (Shanghai only):**
   - Kindergarten falls back to 普惠 private (≈900 per month).
   - From junior secondary, either a private school (cost not found) or the child returns to the hometown for senior high, modelled as a boarding cost [ESTIMATE ≈ 15,000–25,000 per year].
   - No effect on 育儿补贴, maternity leave or the 1-unit home purchase.
3. **Chengdu:** ignore hukou for purchase. Treat schooling as accessible with a residence permit [UNVERIFIED].

---

## 12. Gaps and conflicts

1. **No official wage median or wage deciles.** The median suggestions in §2.4 are estimates. City 工资指导价位 tables (Shanghai and Chengdu human-resources bureaus publish P10/P50/P90 by occupation) were not reached and would be the best fix.
2. **Wages by age** are not published by NBS. Not found.
3. **Chengdu average wage** (city, not provincial) not found. The Sichuan 2025 figure (7,831 per month) is used.
4. **Absolute house prices** come from news reports of platform data with unnamed providers:
   - Shanghai second-hand 35,972 is a transaction average, skewed to suburban and small units.
   - Shanghai listing averages (commonly higher) could not be read.
   - Chengdu figures (18,912 new for 2025 Q1–Q3; ≈12,200 second-hand) have no named source.
5. **Chengdu rent:** the 49 per ㎡ (2024, weak source) conflicts with the 50-city average of 34. Shanghai 84.39 per ㎡ (中指, 2026-08) is solid.
6. **Consumption by income quintile** for 2025 not found. Chengdu per-capita consumption not found.
7. **Chengdu social-insurance rates** (unemployment 0.4%, employer medical rate) are unverified. Shanghai rates verified via a secondary copy of the 2026 notice.
8. **Childcare fees:** actual Shanghai full-day 托育 prices, Chengdu kindergarten fees, and private or international school fees in both cities were not found. Game values in §6.3 and §7 are estimates.
9. **Tutoring prices** (monthly) after 双减 not found. Only participation rates and relative spending (CIEFR) are sourced.
10. **University dormitory and living costs** not found.
11. **月子中心 prices** for Shanghai and Chengdu not found (Beijing and generic tier-1 ranges only).
12. **Sichuan's 188-day leave:** effective date and whether maternity insurance pays the extra 90 days are not confirmed.
13. **Shanghai paternity leave (10 days)** and the 生育津贴 formula are background knowledge, not re-fetched.
14. **TFR, mean age at first birth, city birth data** not found. China does not publish an annual TFR.
15. **Not researched:**
    - Utilities and telecom.
    - Transit passes.
    - Car running costs.
    - Children's resident medical-insurance premium.
    - Renovation costs for 毛胚房.
    - Pension income after retirement.
    - 孝亲费 norms and the share of grandparent childcare.
16. **Conflict, 育儿补贴 funding:** one fetch rendered the 2026 central allocation as "999 billion yuan"; the Chinese original is **999亿元** (99.9 billion). Total spending is about 1,100亿.

---

## 13. Machine-readable summary (JSON, CNY, ready to adapt)

```json
{
  "country": "CN",
  "cities": ["shanghai", "chengdu"],
  "A_fx": { "cnyToTwd": 4.758, "date": "2026-10-08", "pppCnyPerIntl": 3.399, "pppTwdPerIntl": 13.65, "pppCnyToTwd": 4.02, "pppYear": 2025, "pppTwdDerived": true },
  "B_wage": {
    "national": {
      "meanNonPrivate": 129441, "meanPrivate": 71590, "meanAboveScale": 106080, "year": 2025,
      "growth2025": { "nonPrivate": 0.043, "private": 0.030 },
      "byPosition": { "manager": 210016, "professional": 155491, "clerical": 94936, "service": 79857, "production": 80739 },
      "migrantMonthly": 5075, "migrantOutMonthly": 5774, "migrantLocalMonthly": 4376,
      "medianEst": 75000, "medianIsEstimate": true,
      "medianOfficial": null, "deciles": null, "ageProfile": null
    },
    "shanghai": { "meanMonthly2025": 12577, "meanAnnual": 150924, "medianEst": 115000, "medianIsEstimate": true },
    "chengdu": { "sichuanMeanMonthly2025": 7831, "sichuanMeanAnnual": 93972, "medianEst": 80000, "medianIsEstimate": true },
    "qProxyPerCapitaIncome": [[10, 0.280], [30, 0.627], [50, 0.981], [70, 1.534], [90, 2.864]],
    "qProxyNote": "per-capita household disposable income quintile means / national median, 2025",
    "bonus": { "officialStat": null, "typicalMonthsEst": 1, "separateTaxUntil": "2027-12-31" },
    "toBase2025to2026Est": 1.03
  },
  "B_householdIncome": {
    "national": { "mean": 43377, "median": 36231, "urbanMean": 56502, "urbanMedian": 51115, "ruralMedian": 20711,
      "quintileMeans": [10150, 22702, 35536, 55586, 103778], "year": 2025, "basis": "per capita" },
    "shanghai": { "perCapitaDisposable": 91987, "year": 2025 },
    "chengdu": { "urbanPerCapitaDisposable": 59509, "year": 2025 },
    "sichuan": { "perCapitaDisposable": 36120, "year": 2025 }
  },
  "C_tax": {
    "brackets": [[36000, 0.03, 0], [144000, 0.10, 2520], [300000, 0.20, 16920], [420000, 0.25, 31920], [660000, 0.30, 52920], [960000, 0.35, 85920], [null, 0.45, 181920]],
    "basicDeduction": 60000, "jointFiling": false, "localIncomeTax": 0,
    "special": { "childUnder3PerMonth": 2000, "childEducationPerMonth": 2000, "childSplit": "100/0 or 50/50",
      "mortgageInterestPerMonth": 1000, "rentPerMonthTier1": 1500, "rentPerMonthMid": 1100, "rentPerMonthSmall": 800,
      "elderOnlyChildPerMonth": 3000, "elderSiblingCapPerMonth": 1500 },
    "bonusMonthlyTable": [[3000, 0.03, 0], [12000, 0.10, 210], [25000, 0.20, 1410], [35000, 0.25, 2660], [55000, 0.30, 4410], [80000, 0.35, 7160], [null, 0.45, 15160]],
    "bonusTableVerified": false
  },
  "C_si": {
    "shanghai": { "pension": 0.08, "medical": 0.02, "unemployment": 0.005, "baseMin": 7546, "baseMax": 37731, "from": "2026-07-01",
      "hpfRates": [0.05, 0.06, 0.07], "hpfSupplementary": [0.01, 0.05], "hpfBaseMin": 2740, "hpfBaseMax": 37731, "employerMatchesHpf": true },
    "chengdu": { "pension": 0.08, "medical": 0.02, "unemployment": 0.004, "unemploymentVerified": false, "baseMin": 4699, "baseMax": 23493, "year": 2026,
      "hpfRateRange": [0.05, 0.12], "hpfBaseMin": 2330, "hpfBaseMax": 32969, "employerMatchesHpf": true },
    "perDependentPremium": false,
    "netShareExamplesHpf7": { "shanghai": { "100000": 0.818, "150000": 0.799, "200000": 0.785, "300000": 0.756, "500000": 0.725 },
                              "chengdu":  { "100000": 0.819, "150000": 0.800, "200000": 0.786, "300000": 0.762, "500000": 0.758 } }
  },
  "D_housing": {
    "areaBasis": "gross (建筑面积, incl. 公摊)",
    "shanghai": {
      "newPerSqm": 81337, "newYear": 2025,
      "usedTxnPerSqm": 35972, "usedPeriod": "2026-05", "usedNote": "transaction average skewed to suburban/small units",
      "rentPerSqmMonth": 84.39, "rentPeriod": "2026-08",
      "rentGameEst": { "1": 3500, "2": 5500, "3": 7000, "4": 9500 },
      "downPaymentFirst": 0.15, "downPaymentSecondInner": 0.25, "downPaymentSecondOuter": 0.15,
      "hpfLoanCapFamilyFirst": 2400000, "hpfLoanCapIndividualFirst": 1200000, "hpfLoanCapMax": 3240000, "multiChildUplift": 0.20,
      "nbsIndexAug2026": { "newYoY": 0.030, "usedYoY": -0.008 },
      "plateAuctionAvg": 94159
    },
    "chengdu": {
      "newPerSqm": 18912, "newPeriod": "2025Q1-Q3",
      "usedTxnPerSqm": 12200, "usedPeriod": "2026-01",
      "rentPerSqmMonth": 49, "rentYear": 2024, "rentWeak": true, "rentCentralEst": 40,
      "rentGameEst": { "1": 1700, "2": 2600, "3": 3400, "4": 4500 },
      "unitSizeCoreNew": 140, "unitSizeCoreUsed": 95,
      "hpfLoanCapSingle": 800000, "hpfLoanCapDual": 1200000, "hpfUplift": 0.20,
      "hpfDownPaymentNew": 0.15, "hpfInterestSubsidy": 0.20, "hpfInterestSubsidyCap": 25000, "hpfTempUntil": "2026-12-31"
    },
    "national": { "lpr1y": 0.030, "lpr5y": 0.035, "avgNewMortgageRate": 0.031, "hpfRateOver5y": 0.026, "hpfRateUpTo5y": 0.021,
      "hpfRateSecondOver5yMin": 0.03075, "date": "2026-09",
      "deedTax": { "upTo140": 0.01, "over140First": 0.015, "over140Second": 0.02 },
      "hundredCityNewPerSqm": 17285, "hundredCityUsedPerSqm": 12452, "hundredCityPeriod": "2026-09",
      "fiftyCityRentPerSqm": 34.02, "tier1RentPerSqmMar2026": 73.21 },
    "bankDefaultEst": { "ltv": 0.85, "years": 30, "rate": 0.031 }
  },
  "E_living": {
    "perCapitaConsumption": { "national": 29476, "urban": 35869, "rural": 20259, "shanghai": 54765, "chengdu": null, "year": 2025 },
    "urbanComposition": { "food": 10155, "clothing": 1941, "housing": 8095, "household": 2033, "transportComm": 5251, "eduCultureRec": 4298, "health": 2932, "other": 1164 },
    "consumptionQuintiles": null, "utilities": null, "transitPass": null
  },
  "F_birthAndCare": {
    "deliveryOutOfPocket": { "shanghaiFrom": "2026-10-01", "shanghai": 0, "shanghaiPrenatalQuota": 4500, "nationalProvincesAchieved": 28, "asOf": "2026-07-09" },
    "leave": {
      "shanghai": { "motherDays": 158, "fatherDays": 10, "fatherDaysVerified": false, "parentalDaysPerYearEach": 5, "untilAge": 3 },
      "chengdu": { "motherDays": 188, "motherDaysThirdChildExtra": 30, "fatherDays": 30, "parentalWorkdaysPerYearEach": 10, "untilAge": 3, "effectiveDate": null },
      "maternityAllowanceRateEst": 1.0, "maternityAllowanceBasis": "employer previous-year average wage", "avgMaternityAllowance2025": 30000
    },
    "care02": {
      "nationalAvgMonthly2023": 1978, "tier1AvgMonthly2023": 5500,
      "chengduPuhuiCapRule": "<=80% of district urban per-capita monthly disposable income and <=4000", "chengduPuhuiCapDerived": 3967,
      "shanghaiBaobaowuFreeSessionsPerYear": 12, "shanghaiBaobaowuExtraPerSession": 30,
      "gameEst": { "shanghai": { "public": 2000, "puhui": 4000, "private": 7000, "nanny": 10000 },
                   "chengdu":  { "puhui": 2500, "private": 4200, "nanny": 7000 } }
    },
    "confinementCenter28dBeijingHighEnd": [113000, 185000]
  },
  "G_school": {
    "kindergarten": {
      "finalYearFree": true, "finalYearFreeFrom": "2025-09",
      "shanghaiPublicMonthly": { "demonstration": 700, "grade1": 225, "grade2": 175, "priceBasis": "2012", "mealPerDay": 8 },
      "shanghaiPuhuiPrivateCap": 700,
      "chengduFees": null,
      "gameEst": { "shanghai": { "public": 650, "puhui": 900, "private": 4500, "bilingual": 15000 },
                   "chengdu":  { "public": 550, "puhui": 1000, "private": 2200, "bilingual": 7500 } }
    },
    "householdSpendingCIEFR": { "preschool": 7826, "primary": 4651, "junior": 6891, "seniorGeneral": 13346, "seniorVocational": 8419, "higher": 29135, "year": "2022-23" },
    "tutoringParticipation": { "academic": 0.135, "nonAcademic": 0.136, "year": "2022-23", "topVsBottomQuartileAcademic": 6.0 },
    "cramGameEst": { "shanghai": { "none": 0, "some": 1500, "full": 5000 }, "chengdu": { "none": 0, "some": 800, "full": 2500 } },
    "uni": { "shanghaiPublicTuition": 7215, "sichuanTuitionArts": 4800, "sichuanTuitionSci": 5200, "sichuanTuitionMed": 5800,
      "livingMonthlyEst": 2000, "privateTuitionEst": [20000, 35000], "dorm": null }
  },
  "H_benefits": {
    "childcareSubsidy": { "perYear": 3600, "untilAge": 3, "allBirthOrders": true, "incomeTest": false, "taxExempt": true, "from": "2025-01-01", "lifetimeMax": 10800 },
    "allowance3to18": 0,
    "shanghaiCashBirthBonus": null, "chengduCashBirthBonus": null,
    "iitChildDeductionPerMonth": 2000
  },
  "I_validation": {
    "yuwa2026": { "nationalMonthly": 2544, "urbanMonthly": 3127, "ruralMonthly": 1719, "shanghaiMonthly": 4751,
      "national0to18Derived": 549504, "shanghai0to18Derived": 1026216, "marginalChildMonthly": 1109,
      "scaleFactors": { "second": 0.7, "third": 0.6, "fourthPlus": 0.4 }, "released": "2026-05-29" },
    "births": { "2025": 7920000, "2024Derived": 9540000 }, "birthRate2025": 0.00563,
    "tfrOfficial": null, "tfrScholarEst2024": [1.0, 1.1], "tfrAuthorEst2025": 0.96, "meanAgeFirstBirth": null
  },
  "J_mapping": {
    "hukouDefault": "local hukou or residence permit with 120 points",
    "hukouToggleShanghai": { "kindergarten": "puhui private", "seniorHigh": "private or hometown boarding (est 15000-25000/yr)", "purchase": "1 year social insurance" },
    "hpfAsHousingOnlySavings": true,
    "grandparentCareCommon": true, "grandparentCareShare": null,
    "newHomesOftenUnfinished": true, "renovationCost": null
  }
}
```

## 14. Round 2 additions (2026-10-12)

### 14.1 City consumption per person (same definition as Taiwan: urban residents, incl. housing)

| Item | Value | Source |
|---|---|---|
| National urban per-capita consumption, 2025 | 35,869 | [OFFICIAL] NBS, 2026-01-19, https://www.stats.gov.cn/sj/zxfb/202601/t20260119_1962321.html |
| Shanghai urban (城镇常住居民) per-capita consumption, 2025 | 57,076 (all residents 54,765) | [OFFICIAL] Shanghai Statistics Bureau, https://www.shanghai.gov.cn/nw48810/20260203/2bed33e23b324e27ae846d3a88bade53.html |
| Chengdu urban per-capita consumption, 2025 | 37,100 (+5.3%) | [OFFICIAL] 2025 Chengdu statistical bulletin, reprinted at https://finance.sina.com.cn/jjxw/2026-04-15/doc-inhupeis3814625.shtml |

Model: Shanghai `cons` 57,076 ÷ 35,869 = **1.59** (was 1.53 using all residents). Chengdu 37,100 ÷ 35,869 = **1.03** (was the 1.05 estimate).

### 14.2 Chengdu rent (official street-level table)

Chengdu Housing and Urban-Rural Development Bureau, "2026年2季度成都市租赁住房平均租金水平" (published 2026-07-15; reprinted at https://news.qq.com/rain/a/20260716A04I7Y00 and https://www.sohu.com/a/1051000443_121106884) [OFFICIAL]. The first value per row, read as 住宅类, for the 65 streets of the central districts (锦江、青羊、金牛、武侯、成华、高新): median **33.8** yuan/㎡/month, quartiles 30.7–38.2, range 20.6–46.6. Outer districts are mostly 10–27.

Model: rent 1,700 / 2,500 / 3,200 / 4,000 for 50 / 75 / 100 / 130 ㎡ (≈34 / 33 / 32 / 31 per ㎡) [DERIVED]. This replaces the 38 per ㎡ estimate and settles the 49 vs 34 conflict in §12.

### 14.3 Housing provident fund rent withdrawal

Chengdu: per depositor 1,800/month (central districts, registered lease) or 1,200 (unregistered or suburban), +50% for multi-child families; a proposal (comment period 2026-07-14 to 07-20) would make 1,800 uniform [NEWS] https://cbgc.scol.com.cn/news/7758678. Shanghai's 2026 cap was not verified. At threshold incomes a couple's yearly contributions (employee + employer) are below these caps, so the model applies no cap [DERIVED].

### 14.4 Not changed

Shanghai second-hand price (52,000 per ㎡): one 2026 article cites a Lianjia figure of "above 110,000 per ㎡" with no clear basis, and a reported deal in Xuhui Meilong sold at about 47,400 per ㎡. The estimate stays.

### 14.5 Wage median: cross-checks (not changed)

The model's urban employee median (2025) is 7.5万, or 7.7万 for 2026. New anchors:

**Official (NBS, 2025 average wages)** [OFFICIAL]:
- 规模以上企业, by position:
  - production workers 80,739
  - service workers 79,857
  - clerical staff 94,936
  - professional and technical staff 155,491
  - managers 210,016
- Migrant workers earn 5,075 a month on average, about 60,900 a year.

**Hunan 2024 enterprise wage survey, industry medians** [NEWS] https://www.sohu.com/a/971336721_392415:

| Industry | Median |
|---|---|
| Accommodation and catering | 43,700 |
| Agriculture | 46,000 |
| IT | 68,400 |
| Utilities | 77,500 |
| Finance | 107,300 |

Hunan's wages are below the national level.

**Secondary estimate (zhihu; page could not be fetched):** the 2024 national employee median is 5,000–5,150 a month, and 7–9% earn over 10,000 a month. This includes rural employees.

**Reading:** the urban employee median may be about 5–10% lower than the model's 7.5万, and the evidence is not strong enough to change it. **Sensitivity:** a 10% lower median raises Shanghai's and Chengdu's threshold PR by about 6–7 points when renting.
