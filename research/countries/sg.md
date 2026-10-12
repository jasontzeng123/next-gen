# Singapore (research notes, 2026-10-12)

All amounts are SGD at 2026 levels. Singapore is a city-state, so the model has one city. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Scope:** a Singapore-citizen family. Citizens can buy HDB flats and receive all subsidies.

**What is different from Taiwan:**
- **CPF (Central Provident Fund):** employees pay 20% and employers 17% on top. About 23% of pay goes to the Ordinary Account (OA), which can pay HDB down payments and mortgage instalments. Renters cannot use it.
- **Income tax:** very low.
- **Benefits at birth:** a Baby Bonus cash gift and a Child Development Account (CDA) with a government grant plus 1:1 matching.
- **Childcare:** anchor-operator fee caps and income-tested subsidies.
- **Housing:** HDB public flats with first-timer grants and a 2.6% HDB loan.
- **Foreign domestic helpers:** common.
- **Cars:** require a Certificate of Entitlement (COE), so a new car costs about $180k.

## 1. Exchange rate
- 1 SGD = 24.94 TWD (mid-market, 2026-10-12) [SECONDARY] https://currencyconvert.online/sgd/twd
- The model's PPP factor is about 16.4 [ESTIMATE].

## 2. Wages
Source: MOM Labour Force in Singapore 2025, full-time employed residents. Gross monthly income from work includes 1/12 of annual bonuses.
- Table C10, via SmartCalculator [OFFICIAL via SECONDARY] https://www.smartcalculator.sg/articles/singapore-income-percentiles-2026
- Survey highlights [OFFICIAL] https://stats.mom.gov.sg/iMAS_Tables1/LabourForce/LabourForce_2025/mrsd_2025LabourForce_survey_highlights.pdf

**Income points**

| Measure | Monthly |
|---|---|
| Median, excluding employer CPF | 5,000 |
| Median, including employer CPF | 5,775 (+5.0% nominal) |
| P20 | 2,817 (P20/P50 = 0.55–0.56) |
| P90 | about 13,000–14,000 |

**Median by age** (via Dollars and Sense) [SECONDARY] https://dollarsandsense.sg/earning-much-peers-much-average-salary-singapore-every-age-group/

| Age | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 |
|---|---|---|---|---|---|---|---|
| Median monthly | 4,333 | 5,417 | 6,250 | 6,750 | 6,608 | 5,958 | 4,410 |

**Model choices**
- **Annual median:** 5,000 × 12 × 1.04 ≈ **62,000** [DERIVED].
- **Percentiles:** P20 0.563 and P90 2.7 are from the data. The rest are interpolated: P10 0.45, P25 0.62, P75 1.58, P80 1.78, P95 3.6 [ESTIMATE].
- **Pareto tail:** α = 2.0. Singapore has the widest distribution of all the countries.
- **Age curve:** age medians ÷ 5,775.

## 3. Taxes and CPF

### 3.1 Income tax (resident, YA2027 on 2026 income) [OFFICIAL, IRAS schedule]

| Chargeable income band | Rate |
|---|---|
| First 20k | 0% |
| Next 10k | 2% |
| Next 10k | 3.5% |
| Up to 80k | 7% |
| Up to 120k | 11.5% |
| Up to 160k | 15% |
| Up to 200k | 18% |
| Up to 240k | 19% |
| Up to 280k | 19.5% |
| Up to 320k | 20% |
| Up to 500k | 22% |
| Up to 1M | 23% |
| Above 1M | 24% |

**Reliefs**
- Earned income relief 1,000 and CPF relief for employee contributions.
- Qualifying Child Relief: 4,000 per child, given to the higher earner.
- Working Mother's Child Relief, for children born from 2024: fixed 8,000 / 10,000 / 12,000 for the 1st / 2nd / 3rd+ child, given to the other parent.
- Personal relief cap: 80,000.
- **Parenthood Tax Rebate:** 5,000 / 10,000 / 20,000 for the 1st / 2nd / 3rd+ child, used against tax over the years.

**Take-home check (single)**

| Gross | Take-home |
|---|---|
| 62k | 78.1% |
| 150k | 80.2% |

Take-home rises at higher pay because CPF stops at the 102,000 wage ceiling.

### 3.2 CPF (2026) [OFFICIAL]

**Rates by age**

| Age | Employee | Employer | Ordinary Account share |
|---|---|---|---|
| ≤ 35 | 20% | 17% | 23% |
| 36–45 | 20% | 17% | 21% |
| 46–50 | 20% | 17% | 19% |
| 51–55 | 20% | 17% | 15% |
| 56–60 | 18% | 16% | 12% |

- **Wage ceiling:** 8,000 a month from January 2026; 102,000 a year in total.
- **Model** (same method as China's housing provident fund):
  - OA money accumulates in a family balance.
  - When the family owns a flat, the balance pays the mortgage and the purchase cash.
  - The employee's own OA share used this way is not counted as a cost. The employer's share and earlier balances count as a "CPF subsidy" transfer.
  - Renting or living with parents leaves the OA locked.
  - The Special and MediSave accounts are treated as locked savings.

## 4. Housing

### 4.1 Rent: whole HDB flat, Q2 2026 town medians (unweighted average) [OFFICIAL, HDB Annex D] https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260724-2nd-quarter-2026-public-housing-data-and-upcoming-flat-supply/Annex-D.pdf

| Flat type | Average of town medians |
|---|---|
| 3-room | about 2,850 (range 2,500–3,300) |
| 4-room | about 3,500 (range 3,000–4,600) |
| 5-room | about 3,780 |

- **Model:** 2,500 / 2,850 / 3,500 / 3,800 for 1–4 bedrooms. The 1-bedroom figure (2-room flat or studio) is [ESTIMATE].

### 4.2 Prices
- **4-room resale median:** 628,000 in Q3 2026, typically 90–105 m² [SECONDARY] https://propkaki.sg/market/questions/how-much-does-a-4-room-hdb-cost
  - The resale price index fell 0.2% quarter on quarter, its third quarterly fall [NEWS] https://www.edgeprop.sg/property-news/hdb-resale-prices-dip-02-q-o-q-3q2026-while-transaction-volumes-surge-hdb-flash-estimates
- **BTO income ceiling:** raised to 16,000 a month from August 2026 [NEWS].
- **Model prices** [DERIVED / ESTIMATE]:
  - Resale: 6,750 per m².
  - BTO (non-mature 4-room about 480k): 5,200 per m².
  - Families above 16,000 a month who choose BTO are switched to resale.
  - The 3–4 year BTO wait is not modeled.
- **Sizes:** 45 / 68 / 93 / 113 m² for 2-room / 3-room / 4-room / 5-room flats.
- **Running costs:** service and conservancy charges about 0.9 per m² a month; owner-occupier property tax about 300 a year [ESTIMATE].

### 4.3 Grants and stamp duty
- **Enhanced CPF Housing Grant (EHG):**
  - 120,000 at household income of 1,500 a month or less.
  - Down 5,000 for each 500 of extra income, ending at 9,000.
  - Applies to both BTO and resale flats [OFFICIAL schedule].
- **CPF Housing (Family) Grant, resale only:**
  - 80,000 for a 4-room flat or smaller; 50,000 for 5-room or larger.
  - Household income must be 16,000 or less [OFFICIAL; income ceiling assumed to follow the August 2026 change].
- **How grants are applied:** they reduce the cash down payment first, then the loan.
- **Buyer's stamp duty:**

  | Price band | Rate |
  |---|---|
  | First 180k | 1% |
  | Next 180k | 2% |
  | Next 640k | 3% |
  | Next 500k | 4% |
  | Next 1.5M | 5% |
  | Rest | 6% |

  - Plus about 3,000 in legal fees.

### 4.4 HDB loan [OFFICIAL]
- Interest 2.6% (the OA rate + 0.1%).
- Up to 75% of the price, for at most 25 years.
- Mortgage servicing ratio: 30% of gross household income.

## 5. Living costs — Household Expenditure Survey 2023 [OFFICIAL] https://www.singstat.gov.sg/-/media/files/visualising_data/infographics/households/HES-householdexpenditure.pdf
- **Survey figures:**
  - Average spending 5,931 a month, excluding imputed rent.
  - Housing and utilities (excluding imputed rent) 550.
  - Per member 1,986, implying about 3.0 people per household.
- **Adult base:** (5,931 − 550) ÷ 3.0 × 0.716 × 1.06 (2023→2026 prices) ≈ **1,360** [DERIVED].
- **Child spending:** Taiwan's child-to-adult ratios × 1,360 → 680 / 585 / 734 / 966 / 1,074 [ESTIMATE].
- **Foreign domestic helper:** about 1,100 a month in total (salary about 700, levy 60 with a child under 16, food and insurance) [ESTIMATE].
- **Cars** (COE included) [ESTIMATE]:
  - New 180,000 (COE lasts 10 years); used, with about 5 years of COE left, 80,000.
  - Running costs about 7,000 a year.
- **Other transport** [ESTIMATE]:
  - Public transport about 120 a month per adult.
  - HDB season parking 110 a month.

## 6. Birth and childcare
- **Baby Bonus cash gift:** 11,000 for the 1st and 2nd child, 13,000 for the 3rd and later.
- **CDA:**
  - First Step Grant: 5,000 (3rd+: 10,000).
  - Plus 1:1 matching up to 6,000 (3rd+: 12,000).
  - The model treats the matching as received, because childcare spending exceeds it.
- **Large Families Scheme** (3rd+ child, from 2025): cash of about 16,000 over 6 years [NEWS / ESTIMATE].
- **Delivery:** about 1,500 out of pocket in a public hospital; the "comfortable" lifestyle uses about 7,500 for private.
- **Confinement nanny:** about 3,500 for 28 days [ESTIMATE].
- **Childcare (full-day):**

  | Care | Gross fee | Basic subsidy (working family) |
  |---|---|---|
  | Anchor-operator infant care | about 1,110 | 600 |
  | Anchor-operator childcare | 610 cap | 300 |
  | Premium private | about 1,800 | 300 |

  - Fees are [ESTIMATE] except the 610 cap; subsidies are [OFFICIAL] (SmartCalculator) https://www.smartcalculator.sg/articles/childcare-infant-care-subsidy-guide-sg-2026
  - Additional subsidy for household income below 12,000: up to 710 (infant) / 467 (childcare), tapering to 0 at 12,000 [shape ESTIMATE].
  - Minimum co-payment: 3–100.
- **Parental leave:**
  - 16 weeks government-paid maternity leave, 4 weeks paternity, and 10 weeks shared parental leave from April 2026.
  - Full pay, capped at about 2,500 a week.
  - **Model:** one parent takes 6 months (26 paid weeks); "both" is 3.5 months each (15 paid weeks each).

## 7. School and university
- **School ages:**
  - Preschool and kindergarten to 6.
  - Primary 1 at 7.
  - Secondary 1 at 13.
  - Junior college 17–18.
  - University at 19. Most men do 2 years of National Service first; this is not modeled.
- **Government schools:** citizens pay only miscellaneous fees plus books and uniforms, about 650 / 800 / 900 a year [ESTIMATE].
- **Student care:** about 350 a month [ESTIMATE].
- **Tuition:** very common. "Some" is 400 a month and "intensive" 1,200 (PSLE, O-levels). Primary pupils are counted at half [ESTIMATE].
- **Private / international schools:** about 30,000 / 45,000 a year [ESTIMATE].
- **University:** subsidised fees about 8,500 a year [ESTIMATE].

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, anchor-operator preschool, government school, some tuition; excluding housing):
- Spending about 260k.
- Cash (Baby Bonus + CDA) about 22k.
- Childcare subsidies about 36k.
- Commonly quoted Singapore estimates are 300k–700k, depending on schooling and tuition, so the model is at the lower end for a government-school path.

**Thresholds (two children, Taipei 48)**
- Rent: PR 62.
- Buy a resale HDB flat: PR 45.
- Singapore is the one place where buying is easier than renting:
  - CPF can only be spent on a home.
  - Grants and the 2.6% HDB loan make buying cheap.
  - Renting a whole flat is expensive.

## 9. Known simplifications
- Citizens only. PR or foreign families cannot get new BTO flats or most grants.
- Not modeled:
  - The BTO waiting time (usually spent living with parents)
  - National Service
  - MediSave and MediShield
  - The CPF interest rates on balances
- The additional childcare subsidy schedule is approximated.
