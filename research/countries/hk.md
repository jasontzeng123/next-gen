# Hong Kong (research notes, 2026-10-12)

All amounts are HKD at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**What is different from Taiwan:**
- **Very low salaries tax.** The tax is the lower of progressive rates (2–17% after allowances) or a 15% standard rate on net income.
- **Large tax allowances:**
  - The child allowance is 140,000 per child from YA 2026/27, doubled in the birth year.
  - Rent or home-loan interest is deductible up to 120,000 a year for families with children.
- **MPF pension:** employees pay 5%, capped at 1,500 a month.
- **Childcare:** almost no subsidised care for ages 0–2, so most dual-earner families hire a foreign domestic helper.
- **Kindergarten:** the Kindergarten Education Scheme makes half-day kindergarten free.
- **Housing:** private flats are very expensive, but subsidised Home Ownership Scheme (HOS) flats sell at about half the market price.
- **Maternity leave:** 14 weeks at 80% of pay; paternity leave is only 5 days.

## 1. Exchange rate
- 1 HKD = 4.092 TWD. This is derived from the USD peg (7.80) and USD/TWD 31.92 on 2026-10-12.
- The model's PPP factor is about 2.4 [ESTIMATE].

## 2. Wages — C&SD Annual Earnings and Hours Survey, May–June 2025 [OFFICIAL] https://www.info.gov.hk/gia/general/202603/23/P2026032300370.htm

**Monthly wages of all employees**

| Percentile | Monthly wage | Ratio to median |
|---|---|---|
| P10 | 11,000 | 0.519 |
| P25 | 15,300 | 0.722 |
| Median | 21,200 (+3.5%) | 1 |
| P75 | 33,000 | 1.557 |
| P90 | 51,300 | 2.42 |

**Hourly median by age:** 25–34 earn 90, 35–44 earn 100, 45–54 earn 86.4.

**Model choices**
- **Annual median:** 21,200 × 1.035 × 12.5 (a year-end double-pay month is common) ≈ **275,000** [DERIVED].
- **Other percentiles:** interpolated. P95 is 3.2 and the Pareto tail α is 2.2 [ESTIMATE].
- **Age curve:**

  | Age | 22 | 29.5 | 39.5 | 49.5 | 59.5 | 63 |
  |---|---|---|---|---|---|---|
  | Ratio | 0.62 | 0.98 | 1.13 | 1.0 | 0.8 | 0.7 |

  [DERIVED / ESTIMATE]
- **Comparison pool:** the survey covers all employees, including part-timers (a small share).

## 3. Taxes and transfers

### 3.1 Salaries tax (YA 2026/27) [OFFICIAL]
- **Progressive rates:** 2% / 6% / 10% / 14% on successive 50,000 bands, then 17%.
- **Standard rate:** 15% of net income up to 5M, 16% above.
- **Allowances:**
  - Basic allowance 132,000; married allowance 264,000 (used when one spouse has no income).
  - Child allowance 140,000 (2026-27 Budget), with an additional 140,000 in the birth year.
- **Deductions:**
  - MPF up to 18,000.
  - Domestic rent or home-loan interest: up to 100,000, or 120,000 with children (from YA 2024/25).
- **Model:**
  - Separate assessment. The child allowance and the housing deduction go to the higher earner.
  - Joint assessment applies if one spouse has no income.
  - One-off budget rebates are ignored.
- **Take-home check, single:**

  | Gross | 275k | 600k | 1M |
  |---|---|---|---|
  | Take-home | 92.5% | 87.3% | 85.5% |

### 3.2 MPF
- Employees pay 5% of relevant income. Nothing is due below 7,100 a month, and the cap is 1,500 a month.
- Counted as social insurance.

### 3.3 Fertility measures — LegCo reply, June 2026 [OFFICIAL] https://www.info.gov.hk/gia/general/202606/17/P2026061700336p.htm
- **Newborn Baby Bonus:** 20,000 for babies born from 25 October 2023 to 24 October 2026; a review is ongoing. Because it ends before most modeled births, it is **not modeled**.
- **Housing priority:** families with newborns get priority for HOS flat selection and public rental housing. Not modeled, except that HOS is available.
- **Childcare places:** aided child care places are being expanded, but remain very scarce.

## 4. Housing
- **Rents:**
  - The RVD rental index hit a record 210.3 in August 2026, its 10th straight monthly rise [NEWS] https://www.thestandard.com.hk/property/article/344033/HK-home-prices-edge-up-in-August-rent-hits-new-high
  - The model assumes about 36 a month per saleable square foot, giving 11,000 / 15,500 / 21,500 / 30,000 for 28 / 40 / 58 / 80 m² [ESTIMATE].
- **Prices:**
  - The RVD price index rose 10.95% year on year to August 2026.
  - Secondary homes cost about 13,000 per saleable square foot, about **140,000 per m²** [ESTIMATE].
  - New private flats are about 183,000 per m² [ESTIMATE].
- **Home Ownership Scheme (HOS):**
  - About 90,000 per m², roughly 52% of market value [ESTIMATE].
  - Family income limit about 70,000 a month. Flats are allocated by ballot, with priority for families with newborns.
  - In the model, the "new build" choice means HOS when the family is under the income limit; otherwise it is a new private flat.
- **Closing costs:**
  - Ad valorem stamp duty Scale 2: 100 up to 4M (from the 2025/26 Budget), then 1.5–4.25% with marginal relief [OFFICIAL rates, relief approximated].
  - Agent commission 1% (secondary homes), legal costs about 15,000.
  - Mortgage insurance premium about 2.5% of the loan when the loan-to-value is above 70%.
- **Running costs:** management fees about 38 per m² a month; rates and government rent about 0.18% of value a year [ESTIMATE].
- **Mortgage:**
  - Prime rate 5%, one-month HIBOR about 3.1%. H-plan mortgages are capped at prime − 1.75%, about 3.25% (The Standard) [NEWS] https://www.thestandard.com.hk/finance/article/319048/Hong-Kong-lenders-keep-prime-rate-unchanged-at-5-percent
  - The model uses 3.4%.
  - Loan-to-value: 90% with the Mortgage Insurance Programme for homes up to 10M, 95% for HOS (Housing Authority guarantee), otherwise 70%.
  - Debt servicing ratio 50%; 30 years.

## 5. Living costs — Household Expenditure Survey 2024/25 [OFFICIAL] https://www.info.gov.hk/gia/general/202606/09/P2026060900321.htm
- **Survey figures:**
  - Average spending 32,472 a month per household, 12,201 per person (about 2.66 people per household).
  - Housing is 39.3% of spending.
- **Adult base:** 32,472 × (1 − 0.393 − about 0.025 for utilities) ÷ 2.66 × 0.716 × 1.02 ≈ **5,200** [DERIVED].
- **Child spending:** Taiwan's child-to-adult ratios × 5,200 → 2,600 / 2,236 / 2,808 / 3,692 / 4,108 [ESTIMATE].
- **Foreign domestic helper:** minimum wage 5,220 from October 2026 plus a 1,236 food allowance [NEWS] https://www.thestandard.com.hk/news/article/344449/HK-raises-minimum-wage-for-foreign-domestic-helpers-to-5220. With insurance and agency fees, the model uses about 6,900 a month.
- **Transport:**
  - Public transport about 700 a month per adult.
  - Cars cost 150,000–600,000. Running costs are about 30,000+ a year, and a parking space about 3,500 a month [ESTIMATE].

## 6. Birth and childcare
- **Birth:** public hospital delivery is cheap. The model takes about 8,000 for a mix of private check-ups and a public birth; the "comfortable" lifestyle uses a private hospital package of about 90,000.
- **Confinement nanny:** about 30,000 for 26 days [ESTIMATE].
- **Childcare, ages 0–2:**
  - Aided child care centre about 6,000 a month, but places are very scarce.
  - Private about 10,000 a month.
  - Helper about 6,900 a month.
  All [ESTIMATE].
- **Kindergarten (3–5), a month:**
  - Scheme whole-day about 1,500.
  - Non-scheme private 6,000.
  - International 9,000.
  All [ESTIMATE].
- **Maternity leave:** 14 weeks at 80% of pay. "Both" is modeled as 2 months each.

## 7. School and university
- **School ages:** Primary 1 at 6, Secondary 1 at 12, Secondary 4–6 at 15–17, university at 18.
- **School fees:**
  - Government and aided schools are free; books and activities are about 5,000 a year.
  - Direct Subsidy Scheme schools about 60,000 a year; international schools about 200,000 [ESTIMATE].
- **After school:**
  - Homework tutoring centres about 2,500 a month; interest classes about 800 a month each.
  - Tutoring: "some" 2,000 a month, "intensive" (DSE) 5,000 [ESTIMATE].
- **University:** UGC-funded tuition about 44,500 a year; halls about 2,000 a month [ESTIMATE].

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, public school; excluding housing):
- Spending about 1.29 million.
- Popular estimates of 5–6 million assume private or international schooling and heavy tutoring.

**Thresholds (two children, Taipei 48)**

| Option | Threshold |
|---|---|
| Rent | PR 49 |
| Buy secondary | PR 75 |
| HOS ("new build" option) | PR 63 |

## 9. Known simplifications
- Not modeled:
  - The newborn baby bonus (expires October 2026)
  - Public rental housing
  - Waiting times for HOS ballots
  - Working Family Allowance
  - Student finance
- Rents and per-m² prices are estimates from indices rather than published per-sqft averages.
