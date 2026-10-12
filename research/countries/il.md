# Israel: Tel Aviv and Haifa (research notes, 2026-10-12)

All amounts are ILS (new shekels) at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why Israel and these cities:**
- Israel has the highest fertility in the developed world (about 2.9), so it is a useful contrast to Taiwan's 0.9.
- Tel Aviv is one of the most expensive housing markets in the world.
- Haifa is a large, much cheaper city in the north.

**What is different from Taiwan:**
- **Tax:** individual filing with "credit points" (נקודות זיכוי). Everyone gets 2.25 points; mothers get 0.5 more; young children add 1.5–2.5 points to each parent. Low and middle earners with small children pay little income tax.
- **Social insurance:** National Insurance plus health tax, with a low rate below 60% of the average wage, plus a 6% mandatory employee pension contribution.
- **Childcare:** free public kindergarten from age 3 (afternoon programme extra). Ages 0–2 are expensive; recognised daycare (מעון) is subsidised by income.
- **Leave:** 15 weeks of maternity pay at full wage (capped), paid by National Insurance; can be shared with the father.
- **Military service:** children serve at 18–20, receive a soldier's stipend, and start university at about 21.

## 1. Exchange rate
- 1 ILS = 10.38 TWD (2026-10-12) [SECONDARY] https://fxfeed.io/currencies/pairs/ils-twd?range=7d

## 2. Wages
- **Average monthly wage:** 14,334 (December 2024 record), covering all employees including part-time and high-tech (Globes) [NEWS] https://en.globes.co.il/en/article-average-monthly-wage-in-israel-reaches-record-high-1001501282
- **Model full-time median:** about 12,400 a month in 2026 × 12, plus recreation pay (דמי הבראה), ≈ **150,000 a year** [ESTIMATE].
- **Distribution:** very wide.
  - The minimum wage is about 6,250 a month, about 0.5 of the median.
  - High-tech average pay is around 30,000 a month [NEWS / ESTIMATE].
  - The model uses P10 0.50, P25 0.66, P75 1.52, P90 2.35, P95 3.0, α 2.2 [ESTIMATE].
- **Age curve:** starts lower and later because most people enter work after military service [ESTIMATE].

## 3. Taxes and transfers

**Income tax brackets, 2026 (annual)** (PwC Worldwide Tax Summaries) [SECONDARY] https://taxsummaries.pwc.com/Israel/individual/taxes-on-personal-income

| Taxable income | Rate |
|---|---|
| up to 84,120 | 10% |
| 84,120–120,720 | 14% |
| 120,720–228,000 | 20% |
| 228,000–301,200 | 31% |
| 301,200–560,280 | 35% |
| 560,280–721,560 | 47% |
| above 721,560 | 50% (includes 3% surtax) |

- Brackets and credit points were frozen at 2025 values for 2025–2027. For 2026 the 20% and 31% bands were widened, which the table above reflects. The Finance Ministry has also discussed lifting the freeze (Globes) [NEWS] https://en.globes.co.il/en/article-1001521417

**Credit points**
- One point is worth 242 a month (2,904 a year) [ESTIMATE: 2025 value, frozen].
- How points are allocated in the model:
  - Each resident: 2.25 points. Women: +0.5.
  - Child in the year of birth: +1.5 points to each parent.
  - Child aged 1–5: +2.5 points to each parent.
  - Child aged 6–17: +1 point to the mother.
  - Child aged 18: +0.5 point to the mother.
- The model assigns the mother's extra points to partner B when B has earnings, otherwise to A.
- Pension contributions earn a 35% tax credit on contributions up to 7% of a capped wage.

**National Insurance plus health tax (employee)** [ESTIMATE, cross-checked against 2026 calculators]
- 4.27% on income up to 7,522 a month (90,264 a year, about 60% of the average wage).
- 12.17% above that, up to a cap of about 50,700 a month (608,340 a year).
- These combine National Insurance (1.04% / 7%) and health tax (3.23% / 5.17%) after the 2025 increase. One 2026 calculator still shows the older 0.4% low rate for National Insurance alone; the model keeps the post-2025 combined rate [ESTIMATE]. https://tool.teamzlab.com/il/bituach-leumi-2026-calculator/
- **Mandatory pension:** employee pays 6% of wages; modelled as a deduction from take-home pay (like social insurance) [OFFICIAL rule, ESTIMATE base].

**Take-home check, single, Tel Aviv**

| Gross | Take-home |
|---|---|
| 80k | 89.7% |
| 150k | 80.8% |
| 220k | 74.8% |
| 330k | 66.7% |
| 500k | 59.9% |

**Child allowance (קצבת ילדים), monthly** [ESTIMATE: 2025 National Insurance amounts]

| Child | Amount |
|---|---|
| 1st | 173 |
| 2nd–4th | 219 |
| 5th and later | 173 |

- National Insurance publishes the 2026 indexed amounts at https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx (the page could not be fetched from this environment).
- Some English-language guides still list older base amounts (140 / 210) (EasyAliyah) [SECONDARY] https://help.easyaliyah.com/en/article/complete-guide-to-child-allowances-family-grants-in-israel-28tx2

**Birth grant (מענק לידה)** [ESTIMATE: 2025 values]
- 2,069 for the first child, 931 for the second, 621 for the third and later.

**Not modelled:**
- Savings for Every Child (government deposits about 57 a month into a savings account the child receives at 18–21).
- Income support and other means-tested benefits.

## 4. Housing

**Rents, monthly** [SECONDARY / ESTIMATE]
- Source: CBS averages, Q3 2025, as summarised by EasyAliyah. https://www.easyaliyah.com/blog/the-israeli-rental-market-2026
  - Tel Aviv: 3 rooms 7,004, 4 rooms 8,739.
  - Haifa: 3 rooms 3,082, 4 rooms 3,937.
- Israeli room counts include the living room (2 bedrooms = 3 rooms).

| Rooms (incl. living room) | Tel Aviv | Haifa |
|---|---|---|
| 2 | 5,500 | 2,600 |
| 3 | 7,200 | 3,200 |
| 4 | 9,000 | 4,050 |
| 5 | 11,500 | 4,900 |

- Values are about 3% above the CBS figures for 2026.

**Municipal tax and building fees**
- Tenants pay municipal tax (ארנונה) and building committee fees (ועד בית).
- The model adds about 90 / 70 per m² a year of arnona plus 250 / 180 a month of building fees, in Tel Aviv and Haifa respectively [ESTIMATE].

**Prices per m²** [ESTIMATE]

| City | Existing | New |
|---|---|---|
| Tel Aviv | 60,000 | 68,000 |
| Haifa | 20,000 | 25,000 |

- Cross-check (Sands of Wealth, based on CBS data, June 2026) [SECONDARY] https://sandsofwealth.com/blogs/news/tel-aviv-how-much-apartment
  - Tel Aviv resale: about 55,000–70,000 per m²; new builds 70,000–90,000.
  - A three-bedroom flat costs about 5.8 million.

**Purchase tax, first home** [ESTIMATE: 2025 brackets, frozen]

| Price | Rate |
|---|---|
| up to 1,978,745 | 0% |
| to 2,347,040 | 3.5% |
| to 6,055,070 | 5% |
| above that | 8% |

- Other buying costs: lawyer about 0.5%, agent about 2% including VAT (resale only).

**Mortgage**
- **Loan size:** Bank of Israel limits first-home loans to 75% of value [OFFICIAL rule]. Repayments are capped at about one third of income.
- **Term:** 30 years.
- **Rate:** about 4.8% average across a mixed mortgage (prime-linked and fixed tracks) [ESTIMATE].
- **Bank of Israel policy:** policy rate 3.5% and prime rate 5% after the July 2026 cut (Ynet) [NEWS] https://www.ynetnews.com/business/article/s111bt7txzx

## 5. Living costs
- **Household budget survey:** about 17,600 per household a month. Housing is about 25%, and the average household has 3.2 people [ESTIMATE from CBS figures].
- **Adult base:** 17,600 × 0.75 ÷ 3.2 × 0.716 × 1.12 (Tel Aviv) ≈ 3,300. The model uses **3,200** [DERIVED / ESTIMATE].
- **City factors:** Tel Aviv 1.12, Haifa 0.95 [ESTIMATE].
- **Children:** use Taiwan's child-to-adult ratios, as for all countries.

## 6. Childcare, school, army and university

**Ages 0–2**
- Recognised daycare (מעון / משפחתון) costs about 3,000 a month in Tel Aviv and 2,500 in Haifa.
- The real cost is about 4,500; the gap is counted as a subsidy.
- Low per-capita household income gets up to 2,000 a month more off (simplified income test) [ESTIMATE].
- Private daycare: 4,800 / 3,300. Full-time nanny: about 7,500 [ESTIMATE].

**Ages 3–5**
- Public kindergarten is free.
- The afternoon programme (צהרון) costs about 1,050 / 900 a month for 10 months.
- Private kindergarten: 3,500 / 2,800; bilingual: 5,000 / 4,000 [ESTIMATE].

**School**
- **Ages:** primary 6–11, middle 12–14, high school 15–17.
- **Costs:**
  - Public school: parents pay about 2,500 a year in fees and trips.
  - Private school: about 25,000 / 20,000 a year.
  - International school: 130,000 / 90,000 a year [ESTIMATE].
- **After school:** the Nitzanim programme for young pupils costs about 800 / 700 a month [ESTIMATE].

**Army and university**
- **Ages 18–20:** military service.
  - The model counts a soldier's stipend of about 18,000 a year as income to the family [ESTIMATE].
  - There is no university fee in these years.
- **From age 21:** university.
  - Public university tuition is about 11,000 a year.
  - The game's public/private/mixed choices all map to this.

**Maternity leave**
- 15 weeks of full pay, capped at about 1,730 a day, and taxed. The model pays 85% of the gross equivalent.
- If one parent takes leave, the model counts 6 months off work, of which 15 weeks are paid.
- If both share it, each takes about 3.5 months and about 7.5 paid weeks.

## 7. Benchmarks

**One child aged 0–17** (excluding housing): about 596k in Tel Aviv and 570k in Haifa.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Tel Aviv | PR 63 | PR 99 |
| Haifa | PR 42 | PR 79 |

**Why Tel Aviv is so high to buy:** a 100 m² flat costs about 6 million ILS (about 62 million TWD). With a 25% down payment, the purchase tax and the one-third income cap, a family needs a very high income.
