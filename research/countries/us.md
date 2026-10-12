# United States: New York City and Houston (research notes, 2026-10-12)

All amounts are USD at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- New York City has state and city income tax, paid family leave and free 3-K/Pre-K, and very high rents.
- Houston has no state income tax and cheap homes, but high property tax and insurance, and you need a car.

## 1. Exchange rate
- 1 USD = 31.92 TWD (close, 2026-10-12) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/usd-pairs/USDTWD-exchange-rate

## 2. Wages (full-time wage and salary workers)

Source: BLS usual weekly earnings, Q2 2026 [OFFICIAL]
- Deciles: https://www.bls.gov/news.release/wkyeng.t05.htm
- By age: https://www.bls.gov/news.release/wkyeng.t03.htm

**Weekly earnings distribution**

| Point | Weekly | Ratio to median |
|---|---|---|
| P10 | 642 | 0.513 |
| P25 | 850 | 0.679 |
| Median | 1,251 | 1 |
| P75 | 1,915 | 1.531 |
| P90 | 2,924 | 2.337 |

**Median weekly earnings by age**

| Age | 20–24 | 25–34 | 35–44 | 45–54 | 55–64 | 65+ |
|---|---|---|---|---|---|---|
| Weekly | 831 | 1,160 | 1,436 | 1,421 | 1,367 | 1,233 |

**Model choices**
- Annual median = 1,251 × 52 = 65,052, plus about 1.5% for bonuses = 66,000 [DERIVED].
- Comparison pool:
  - The model uses full-time workers. Including part-timers would push the bottom of the distribution down (OEWS all-occupations mean was $69,770 in May 2025, and no all-worker median was retrievable).
  - Taiwan's distribution has a similarly narrow bottom (P10 0.60).
  - Japan uses all workers including part-timers, so it is not strictly comparable.

## 3. Taxes (2026)

### 3.1 Federal
Brackets from Rev. Proc. 2025-32 (KPMG summary) [OFFICIAL]:

| Rate | MFJ, taxable income up to | Single, up to |
|---|---|---|
| 10% | 24,800 | 12,400 |
| 12% | 100,800 | 50,400 |
| 22% | 211,400 | 105,700 |
| 24% | 403,550 | 201,775 |
| 32% | 512,450 | 256,225 |
| 35% | 768,700 | 640,600 |
| 37% | above | above |

- **Standard deduction:** MFJ 32,200, single 16,100, head of household 24,150.
- **Child Tax Credit:** 2,200 per child under 17, of which up to 1,700 is refundable (15% of earnings above 2,500). Phase-out starts at 400k MFJ / 200k other, $50 per $1,000 [SECONDARY] https://ustax.tools/tax-insights/child-tax-credit-guide/
- **Other dependents:** 500 credit.
- **SALT cap:** 40,000 for 2025–2029, reduced by 30% of income above 500k, with a floor of 10,000. Mortgage interest is deductible on up to 750k of debt.

### 3.2 Payroll
- Social Security 6.2% up to the 2026 wage base of 184,500 [NEWS].
- Medicare 1.45%, plus 0.9% on income above 250k MFJ.

### 3.3 New York State
**2025 brackets (MFJ)** [SECONDARY] https://www.nerdwallet.com/taxes/learn/new-york-state-tax

| Rate | Up to |
|---|---|
| 4% | 17,150 |
| 4.5% | 23,600 |
| 5.25% | 27,900 |
| 5.5% | 161,550 |
| 6% | 323,200 |
| 6.85% | 2,155,350 |
| 9.65% | 5M |
| 10.3% | 25M |
| 10.9% | above |

- **2026 rate cut:** The FY2026 budget cuts the bottom five rates by 0.1 point in 2026 and another 0.1 in 2027, for joint income up to 323,200 [NEWS] https://www.anchin.com/articles/new-york-states-2026-fiscal-year-budget-finally-passes/. The model uses 3.9 / 4.4 / 5.15 / 5.4 / 5.9 for 2026 [DERIVED].
- **Deductions:** standard deduction MFJ 16,050; dependent exemption 1,000.
- **Not modeled:** the "tax benefit recapture" for income above 107,650. This understates NY tax slightly in the 110k–160k range.

**Empire State Child Credit, 2026** [OFFICIAL] https://www.governor.ny.gov/news/governor-hochul-announces-expanded-child-tax-credit-new-york-families
- 1,000 per child under 4; 500 per child aged 4–16.
- Full credit up to 110k MFJ (75k other). The phase-out rate isn't stated; the model uses $16.50 per $1,000, which matches the governor's example (household with two children, $170k, gets "over $500"). Refundable.

### 3.4 New York City resident tax (MFJ)
3.078% up to 21,600; 3.762% up to 45,000; 3.819% up to 90,000; 3.876% above [SECONDARY].

### 3.5 Child and dependent care
- **Credit (2026, after OBBBA)** [SECONDARY] https://instead.com/resources/blog/dependent-care-credit-rate-rises-to-50-percent
  - Rate: 50% at AGI up to 15k, falling to 35% by 45k. Above 150k MFJ (75k other) it falls 1 point per 4k (per 2k for other filers), with a floor of 20%.
  - Expense limits: 3,000 for one child, 6,000 for two or more. Nonrefundable.
- **Dependent care FSA:** 7,500 per household, pre-tax.
- **Model:** uses the FSA first; the credit applies to the remaining expense limit.

### 3.6 New York payroll programs
Paid Family Leave contribution 0.432% (cap 411.91) [OFFICIAL]; disability insurance 0.60 per week.

## 4. Housing

### 4.1 Rent

**New York City** (StreetEasy median asking rent) [SECONDARY]

| Unit | Rent | Basis |
|---|---|---|
| All units | 4,200 | Aug 2026 |
| 2BR | 4,800 | Aug 2026 |
| 3BR+ | 4,995 → ≈5,400 | Feb 2026 figure, scaled by the 2BR rise to Aug [DERIVED] |
| 1BR | 3,900 | [ESTIMATE] |
| 4BR | 6,700 | [ESTIMATE] |

https://streeteasy.com/blog/nyc-homes-sell-above-asking-highest-rate-four-years

**Houston** (Rentometer, 2026-05, all property types) [SECONDARY]

| Unit | Rent |
|---|---|
| 1BR | 1,352 |
| 2BR | 1,717 |
| 3BR | 2,510 (apartment average 2,620; house median 2,250) → model 2,300 |
| 4BR+ | 2,953 |

### 4.2 Home prices

**New York City**
- Citywide median asking price $980k; Queens $695k (Aug 2026) [SECONDARY].
- Brooklyn new development closes at $1,370 per sq ft, and the Brooklyn condo median is $1.49M (Q2 2026) [SECONDARY] https://www.brickunderground.com/sell/brooklyn-queens-sales-market-report-nyc-second-quarter-2026
- Model: resale $10,500 per ㎡ (≈ $975 per sq ft, a mix of co-ops and condos) [ESTIMATE]; new development $14,700 per ㎡.

**Houston**
- HAR median single-family price $332,000 (Apr 2026) [SECONDARY].
- About 2,000 sq ft gives $1,850 per ㎡ [DERIVED].

### 4.3 Property tax and insurance
- **Houston:** Harris County rate 0.6241 per $100; Texas average effective rate 1.74%. The model uses 1.7% after homestead exemptions [ESTIMATE]. Homeowners insurance 3,800 [ESTIMATE].
- **New York City:** condo or co-op ≈ 0.8% of value plus common charges of $11 per ㎡ per month [ESTIMATE].

### 4.4 Mortgage
- 30-year fixed 6.71% (Freddie Mac, 2026-09-03) [OFFICIAL]; the model uses 6.7%.
- Down payment: 20% in New York City (co-op and condo norms); 10% plus PMI of 0.55% a year for 9 years in Houston [ESTIMATE].
- Loan cap: principal and interest no more than 36% of gross income in the year of purchase [ESTIMATE].

## 5. Living costs

### 5.1 Consumer Expenditure Survey 2024 [OFFICIAL] https://www.bls.gov/news.release/cesan.nr0.htm
- Average annual expenditures per consumer unit: 78,535.
  - Housing 26,266, of which shelter plus utilities is about 20,300 [ESTIMATE]
  - Healthcare 6,197, of which health insurance 4,055
  - Food 10,169
  - Transportation 13,318
- adultBase = (78,535 − 20,300 − 4,055) ÷ 2.5 × 0.716 ÷ 12 ≈ 1,293 (2024) × 1.056 ≈ 1,365 a month (2026) [DERIVED]

### 5.2 City consumption (2023–24 metro releases) [OFFICIAL]

| Area | Spending per household | Household size | Per person | Ratio to U.S. |
|---|---|---|---|---|
| U.S. | 77,907 | 2.5 | — | 1 |
| New York metro | 91,520 | 2.5 | — | 1.175 |
| Houston metro | 85,377 | 2.8 | 30,492 | 0.978 |

### 5.3 Health insurance (KFF 2025) [OFFICIAL]
- Worker contribution: single 1,440; family 6,850. The model raises these by 6% for 2026.
- Couple plan: 4,900 [ESTIMATE].

### 5.4 Transportation
- NYC fare: base $3.00; OMNY weekly cap $35 (2026) [NEWS].
- AAA 2025: total yearly cost of a new vehicle 11,577, including depreciation of 4,334 [NEWS].

## 6. Birth and childcare

### 6.1 Out-of-pocket cost of giving birth
$2,854 for people with employer coverage (2018–20 claims) [OFFICIAL, KFF]. The model uses 3,300 for NYC and 3,000 for Houston.

### 6.2 Childcare center prices (Child Care Aware, 2024) [OFFICIAL]

| Place | Infant center | Toddler center | Infant, family child care |
|---|---|---|---|
| New York State average | 20,439 | 18,661 | 16,415 |
| Texas average | 11,349 | 10,921 | — |

- Model: NYC infant 26,000, toddler 24,000; Houston infant 13,200, toddler 12,500 [DERIVED / ESTIMATE].
- New York's subsidy reaches 85% of state median income, but only about 1 in 5 eligible families get vouchers, so it is not modeled [NEWS] https://nysfocus.com/2025/02/07/child-care-assistance-voucher-program-new-youk

### 6.3 Parental leave
- New York Paid Family Leave 2026: 12 weeks at 67% of the average weekly wage, maximum 1,228.53 a week [OFFICIAL] https://paidfamilyleave.ny.gov/2026
- Texas has only unpaid FMLA leave.

## 7. College

### 7.1 Average prices (College Board, 2025–26) [OFFICIAL]
- Public in-state 11,950; private nonprofit 45,000.
- Average net tuition after grants: public 2,300; private 16,910.

### 7.2 Model assumptions
- CUNY tuition 6,930 plus about 500 in fees; Excelsior covers tuition for families at or below 125k [SECONDARY].
- Texas public universities: 10,300 plus 1,500; tuition is free at or below 65k (University of Houston Cougar Promise) [ESTIMATE].
- Private colleges, net price by income [ESTIMATE]:

| Family income | Net price |
|---|---|
| < 75k | 12,000 |
| < 150k | 25,000 |
| < 250k | 38,000 |
| above | full price, 47,000 |

## 8. Benchmarks
- Model, one child aged 0–17 (excluding the extra housing a child needs): NYC ≈ $346k; Houston ≈ $295k.
- The USDA 2017 estimate for a middle-income married couple is $233,610, including a housing share of about 29%. Inflated to 2026, the non-housing part is about $220k. The model is about 30% higher, mainly because it uses Taiwan's child-to-adult spending ratios on top of a high U.S. adult baseline. Childcare in New York City is also far above the national average.
