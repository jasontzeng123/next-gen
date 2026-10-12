# Australia: Sydney and Melbourne (research notes, 2026-10-12)

All amounts are AUD at 2026–27 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- **Sydney** is the largest city (Canberra, the capital, is small).
- **Melbourne** is the second-largest. It replaced Brisbane as the "cheaper big city" because Brisbane prices overtook Melbourne in 2026: median house 1,146,078 vs 915,119 (Cotality, September 2026).

**What is different from Taiwan:**
- **Tax:** individuals are taxed separately, plus a 2% Medicare levy. Employers add 12% superannuation on top of pay.
- **Child benefits:**
  - Family Tax Benefit (FTB) is income-tested.
  - The Child Care Subsidy (CCS) pays up to 90% of childcare fees.
- **Parental leave:** 26 weeks of Parental Leave Pay at the minimum-wage level.
- **Buying a home:**
  - First-home buyers get a government guarantee, so they can put 5% down without lender's insurance.
  - Stamp duty concessions for first-home buyers.
  - The RBA raised rates in September 2026.

## 1. Exchange rate
- 1 AUD = 22.30 TWD (close, 2026-10-09) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/aud-pairs/AUDTWD-exchange-rate
- The model's PPP factor is about 9.4 [ESTIMATE].

## 2. Wages — ABS Employee Earnings, August 2025 [OFFICIAL] https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings/aug-2025

**Median weekly earnings in main job, full-time employees**

| Group | Median weekly |
|---|---|
| All | 1,741 |
| Men | 1,841 |
| Women | 1,631 |

**All employees, including part-time**

| Percentile | P10 | P25 | P50 | P75 | P90 |
|---|---|---|---|---|---|
| Weekly earnings | 450 | 900 | 1,425 | 2,127 | 3,000 |

**Model choices**
- **Median:** 1,741 × 52 = 90,532, × about 1.033 for 2026 ≈ **93,500** [DERIVED].
- **Full-time deciles:** not retrieved. The full-time minimum wage (1,004.70 × 52 = 52,244) is about 0.56 of the median, and awards hold up the bottom. The model uses P10 0.62, P25 0.765, P75 1.32, P90 1.75, P95 2.15, α 2.6 [ESTIMATE].
- **Age curve:**

  | Age | 22 | 29.5 | 39.5 | 49.5 | 59.5 | 63 |
  |---|---|---|---|---|---|---|
  | Ratio to median | 0.66 | 0.93 | 1.08 | 1.10 | 1.03 | 0.98 |

  [ESTIMATE]

## 3. Taxes and transfers (2026–27)

### 3.1 Income tax [NEWS] https://www.countrytaxcalc.com/tax-guides/australia/tax-rates-2026-27/

| Taxable income | Rate |
|---|---|
| Up to 18,200 | 0% |
| 18,200–45,000 | 15% (cut from 16% on 1 July 2026) |
| 45,000–135,000 | 30% |
| 135,000–190,000 | 37% |
| Above 190,000 | 45% |

**Levies and offsets**
- **Medicare levy:** 2%, phased in at 10% above about 27,222.
- **Low income tax offset:** 700, reduced by 5% between 37,500 and 45,000, then by 1.5% to 66,667.
- **Medicare levy surcharge:** high earners (family income above 202,000, single 101,000) either buy basic private hospital cover or pay the surcharge. The model charges the lower of 1% and 4,000 (single 2,500) [ESTIMATE].
- **Take-home check, single:**

  | Gross | 55k | 93.5k | 130k | 180k | 250k |
  |---|---|---|---|---|---|
  | Take-home | 85.6% | 78.1% | 74.3% | 70.5% | 65.7% |

  Employer super (12%) is extra and not counted.

### 3.2 Family Tax Benefit, 2026–27 [SECONDARY] https://austax.tools/tax-insights/family-tax-benefit-rates-2026-27/

**Part A (per child, a year)**
- **Rates:** maximum 6,139.30 (0–12) or 7,989.85 (13–19); base 1,971.
- **Income tests:** the family gets the higher of two methods:
  - the maximum rate reduced by 20c per $ above 69,131;
  - the base rate reduced by 30c per $ above 123,078.
- **Supplement:** 970.90 per child when family income is 80,000 or less.

**Part B (per family, a year)**
- **Rates:** 5,223.15 if the youngest is under 5; 3,646.35 if the youngest is 5–18 (under 13 for couples). Supplement 478.15.
- **Income tests:**
  - Primary earner limit about 120,000 [ESTIMATE].
  - The secondary earner's income above about 7,100 reduces it by 20c per $ [ESTIMATE].

**Model check (Sydney)**

| Family | Children | FTB a year |
|---|---|---|
| One earner, 60k | 2 | 19,900 |
| One earner, 90k | 2 | 13,300 |
| 70k + 50k | 2 | 3,900 |
| 100k + 90k | 2 | 0 |

### 3.3 Child Care Subsidy, from 6 July 2026 [NEWS] https://www.thesector.com.au/article/ccs-hourly-rate-caps-income-thresholds-rise-6-july-2026
- **Subsidy rate:**
  - 90% up to family income 88,520.
  - Minus 1 point per 5,000 above that, reaching 0 at 538,520.
  - Second and younger children aged 5 or under get +30 points (up to 95%) below about 372,000.
- **Hourly caps:** centre-based care 15.19 below school age, 13.30 school age.
- **Hours:** the 3-day guarantee from 2026 subsidises at least 72 hours a fortnight; working families get 100.
- **Model fees:**
  - Long day care costs about 170 a day in Sydney and 150 in Melbourne (10 hours), for 240 days a year [ESTIMATE].
  - Out of pocket = fee − rate × min(fee, 151.90).
  - Example: Sydney at a family income of 180k has a 71% subsidy and pays about 62 a day.
- **State preschool relief** for 3–4 year-olds in long day care (NSW Start Strong, Victoria Free Kinder): about 2,000 / 2,200 a year [ESTIMATE].
- **Outside school hours care:** about 12,200 / 11,500 a year before subsidy, with the CCS rate applied.

### 3.4 Parental Leave Pay [OFFICIAL] https://www.servicesaustralia.gov.au/sites/default/files/2026-06/factsheet-parental-leave-pay.pdf
- **Entitlement:** 26 weeks (130 days) for births from 1 July 2026; 4 weeks are reserved for the partner.
- **Rate:** 1,004.70 a week, plus 12% super. It is taxable; the model takes about 15%.
- **Model:**
  - One parent takes 9 months, 22 of them paid weeks.
  - "Both" is 6 months each with 13 paid weeks each.
  - Employer-paid leave (common at large employers) is not modeled.
- **Income test:** individual about 172,000 or family about 357,000 (2025–26 values indexed) [ESTIMATE].

## 4. Housing

### 4.1 Rent
- **Source:** Domain's *Renting in 2026* gives the income needed to rent without stress (rent at 30% of income) [SECONDARY] https://propertyupdate.com.au/renting-in-2026-when-lifestyle-dreams-come-with-a-six-figure-price-tag/

  | City | Houses | Units |
  |---|---|---|
  | Sydney | 135,200 | 130,000 |
  | Melbourne | 100,533 | 99,667 |

  This implies weekly rents of about 780 / 750 (Sydney) and 580 / 575 (Melbourne). The national rent rise was about 5.5% over the year.
- **Model monthly rents for 1–4 bedrooms** [DERIVED / ESTIMATE]:

  | City | 1 bed | 2 bed | 3 bed | 4 bed |
  |---|---|---|---|---|
  | Sydney | 2,820 | 3,420 | 3,900 | 4,770 |
  | Melbourne | 2,170 | 2,600 | 2,770 | 3,290 |

### 4.2 Prices — Cotality Home Value Index, September 2026 [SECONDARY] https://everstonefinance.com.au/median-house-prices-australia/

| City | Houses | Units | 12-month change |
|---|---|---|---|
| Sydney | 1,466,060 | 867,597 | −7.0% |
| Melbourne | 915,119 | 624,740 | −6.2% |
| Brisbane | 1,146,078 | 834,627 | +5.9% |

- **Model prices per m², including land:**

  | City | Existing | New |
  |---|---|---|
  | Sydney | 9,500 | 11,000 |
  | Melbourne | 6,000 | 7,000 |

- **Sizes:** 55 / 80 / 130 / 170 m² for 1–4 bedrooms (units, then townhouse, then house) [DERIVED / ESTIMATE].
- **Running costs:**

  | Item | Sydney | Melbourne |
  |---|---|---|
  | Council rates (share of value a year) | 0.12% | 0.22% |
  | Strata (average, per m² a month) | 3.5 | 3.0 |
  | Insurance (a year) | 1,500 | 1,400 |

  All [ESTIMATE].

### 4.3 Stamp duty [OFFICIAL schedules; thresholds are 2025–26 values]

**NSW**

| Price band | Rate on that band |
|---|---|
| up to 17k | 1.25% |
| 17k–36k | 1.5% |
| 36k–97k | 1.75% |
| 97k–364k | 3.5% |
| 364k–1.212M | 4.5% |
| above 1.212M | 5.5% |

- First-home buyers are exempt up to 800k, with a concession up to 1M.

**Victoria**

| Price | Duty |
|---|---|
| up to 25k | 1.4% |
| 25k–130k | 350 + 2.4% of the part above 25k |
| 130k–960k | 2,870 + 6% of the part above 130k |
| 960k–2M | 5.5% of the whole price |
| above 2M | 110,000 + 6.5% of the part above 2M |

- First-home buyers are exempt up to 600k, with a concession up to 750k.

**Other costs and checks**
- Plus about 3,000 for conveyancing, inspection and loan fees [ESTIMATE].
- Checks: NSW 1.235M → 50,335; Victoria 780k → 41,870.

### 4.4 Mortgage
- **Rates:**
  - The RBA cash rate rose to **4.6%** on 29 September 2026, a 15-year high [NEWS] https://www.newcastleherald.com.au/story/9359064/interest-rates-hit-15-year-high-as-rba-hikes-again/
  - The average owner-occupier variable rate is about 6.25% (projected 6.5% after one more rise). The model uses 6.25%.
- **Home Guarantee Scheme** (expanded October 2025): 5% deposit with no lender's mortgage insurance. Price caps: Sydney 1.5M, Melbourne 950k [NEWS].
- **Model:**
  - 95% loan if the price is within the cap, otherwise 80%.
  - Bank serviceability is approximated as a loan of at most 5× gross household income [ESTIMATE].
  - 30-year variable loan.

## 5. Living costs
- **Household Expenditure Survey 2015–16** (latest full survey):
  - Average household spending on goods and services was 1,425 a week, of which current housing costs were 279.
  - Non-housing, non-energy spending: 1,106 × CPI to 2026 (1.36) ÷ 2.6 people × 52 ÷ 12 × 0.716 ≈ 1,800.
  - A national-accounts and price-level cross-check gives about 1,600.
  - The model uses **1,700** [ESTIMATE].
- **Child spending:** Taiwan's child-to-adult ratios × 1,700 → 850 / 731 / 918 / 1,207 / 1,343 [ESTIMATE].
- **City factors:** Sydney 1.08, Melbourne 1.0 [ESTIMATE].
- **Utilities:** 220 + 60 per person [ESTIMATE].
- **Transport:**
  - Public transport about 200 a month (Opal weekly cap, Myki fares) [ESTIMATE].
  - Cars: used 20,000, new 42,000, import 65,000. Running costs about 6,000–7,200 a year including registration, compulsory third-party insurance (CTP), tolls and fuel [ESTIMATE].

## 6. Birth and childcare
- **Birth:** free in public hospitals under Medicare. The "comfortable" lifestyle adds 4,000 for a private obstetrician and hospital.
- **Postpartum help:** a doula 2,000 / 1,800; a night nurse for 2 weeks 4,000 / 3,600 [ESTIMATE].
- **Childcare:** see §3.3. An au pair costs about 2,000 a month [ESTIMATE].

## 7. School and university
- **School ages:**
  - School starts at 5 (Kindergarten in NSW, Prep in Victoria).
  - Secondary school from Year 7 (age 12).
  - Years 11–12 at ages 16–17.
- **State schools:** voluntary contributions, uniforms and excursions cost about 800 a year (primary) and 1,500 (secondary) [ESTIMATE].
- **Independent schools:**

  | City | Primary | Years 7–10 | Years 11–12 | IB international |
  |---|---|---|---|---|
  | Sydney | 25,000 | 38,000 | 40,000 | 35,000 |
  | Melbourne | 22,000 | 34,000 | 36,000 | 32,000 |

  [ESTIMATE]
- **Tutoring:** "some" 300 / 280 a month; "intensive" (selective-school preparation) 800 / 700 [ESTIMATE].
- **University:**
  - Tuition is paid with the student's own HECS-HELP loan, so parents pay only the services fee (about 400).
  - Rent away from home is about 1,000 a month [ESTIMATE].

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, subsidised childcare, public school; excluding extra housing):

| City | Spending | Fee reductions (CCS and state relief) |
|---|---|---|
| Sydney | about 336k | about 113k |
| Melbourne | about 313k | — |

- Australian estimates (AIFS/NATSEM-based) are about 300k–400k to 18 including housing, so the model is in range or slightly high.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Sydney | PR 40 | PR 65 |
| Melbourne | PR 24 | PR 37 |

## 9. Known simplifications
- The national wage distribution is used for both cities; the full-time deciles are estimated.
- Not modeled:
  - Employer-paid parental leave
  - Youth Allowance
  - Rent Assistance
  - The Part B primary-earner limit for single parents
  - Superannuation balances, beyond a flat 35,000 retirement income per person
- Variable mortgage rates are held at 6.25% for 30 years.
