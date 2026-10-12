# Canada: Toronto and Calgary (research notes, 2026-10-12)

All amounts are CAD at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- **Toronto** is the largest city. It is in Ontario: free full-day kindergarten from age 4, CWELCC childcare at $22 a day, a land transfer tax charged twice (provincial and municipal), and very high home prices.
- **Calgary** is a big city with cheaper homes. It is in Alberta: no land transfer tax, a low 8% first provincial tax bracket, and CWELCC childcare at $15 a day.
- Ottawa is the capital but much smaller, so the largest city was used instead.

**What is different from Taiwan:**
- **Income tax:** individuals file separately, paying federal and provincial tax.
- **Child benefits:**
  - The federal Canada Child Benefit (CCB) is income-tested.
  - Provinces add their own (the Ontario Child Benefit; Alberta's ACFB).
- **Parental leave:** Employment Insurance pays 55% of earnings for maternity and parental leave.
- **Childcare:** national "$10-a-day" childcare (CWELCC), not yet at $10.
- **Buying a home:**
  - First-time buyers can put 5% down with mortgage default insurance.
  - Borrowers must pass a stress test at the contract rate + 2%.

## 1. Exchange rate
- 1 CAD = 22.40 TWD (close, 2026-10-09) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/cad-pairs/CADTWD-exchange-rate
- The model's PPP factor is about 11.7 [ESTIMATE].

## 2. Wages
- **2025 annual earnings, all employees (LFS weekly × 52)** [OFFICIAL via WealthNorth] https://wealthnorth.ca/income/average-income/average-salary-canada/

  | Area | Median | Average |
  |---|---|---|
  | Canada | $60,320 | $69,148 |
  | Ontario | $62,400 | — |
  | Alberta | $63,190 | — |

- **Median employment income by age, 2024** (Canadian Income Survey; includes part-time and part-year workers):

  | Age | 25–34 | 35–44 | 45–54 | 55–64 |
  |---|---|---|---|---|
  | Median | 50,300 | 65,200 | 70,100 | 55,400 |

- **Model choices:**
  - **Full-time median:** about 12% above all employees, so $67,500 for 2025 and **$70,000** for 2026 [ESTIMATE].
  - **Deciles:** no published full-time annual deciles were found. The full-time minimum wage (Ontario $17.60 × 2,000 h ≈ $35,200) is about 0.50 of the median. The model uses a shape between the US and the UK: P10 0.55, P25 0.72, P75 1.36, P90 1.92, P95 2.35, α 2.4 [ESTIMATE].
  - **Age curve:** 22: 0.62, 29.5: 0.86, 39.5: 1.06, 49.5: 1.12, 59.5: 1.06 [DERIVED / ESTIMATE].

## 3. Taxes and transfers (2026)

### 3.1 Federal tax and payroll [OFFICIAL, Memorial University payroll memo] https://www.mun.ca/hr/media/production/memorial/administrative/human-resources/media-library/services/2026-tax-changes.pdf

**Brackets**

| Taxable income | Rate |
|---|---|
| Up to 58,523 | 14% |
| 58,523–117,045 | 20.5% |
| 117,045–181,440 | 26% |
| 181,440–258,482 | 29% |
| Above 258,482 | 33% |

**Credits and deductions**
- **Basic personal amount:** 16,452, falling to 14,829 at high incomes.
- **Canada employment amount:** 1,501.
- **How the model applies them:**
  - Credits are taken at 14% on the basic personal amount, the employment amount, base CPP and EI.
  - Enhanced CPP and CPP2 are deducted from income.

**Payroll contributions**

| Plan | Rate | Earnings range | Maximum |
|---|---|---|---|
| CPP | 5.95% | 3,500–74,600 | 4,230.45 |
| CPP2 | 4% | 74,600–85,000 | — |
| EI | 1.63% | up to 68,900 | 1,123.07 |

### 3.2 Provincial tax [SECONDARY] https://www.fidelity.ca/en/insights/articles/canadian-income-tax-brackets/ and https://www.rcgt.com/contentassets/5142f7cf936d42d7aa7666314c21ccd1/individual_taxation_ontario_2026.pdf

**Ontario**
- **Brackets:**

  | Taxable income | Rate |
  |---|---|
  | Up to 53,891 | 5.05% |
  | 53,891–107,785 | 9.15% |
  | 107,785–150,000 | 11.16% |
  | 150,000–220,000 | 12.16% |
  | Above 220,000 | 13.16% |

- **Basic personal amount:** 12,989.
- **Surtax:** 20% of Ontario tax above 5,818, plus 36% of Ontario tax above 7,446.
- **Ontario Health Premium:** the statutory schedule, up to 900.
- **Not modeled:** the low-income Ontario tax reduction.

**Alberta**
- **Brackets:**

  | Taxable income | Rate |
  |---|---|
  | Up to 61,200 | 8% |
  | 61,200–154,259 | 10% |
  | 154,259–185,111 | 12% |
  | 185,111–246,813 | 13% |
  | 246,813–370,220 | 14% |
  | Above 370,220 | 15% |

- **Basic personal amount:** about 22,769 (2025's 22,323 indexed) [ESTIMATE].
- **Credits:** taken at 10% [ESTIMATE].

**Take-home check, single, Toronto**

| Gross | 40k | 70k | 100k | 150k | 220k |
|---|---|---|---|---|---|
| Take-home | 82.0% | 76.8% | 74.2% | 69.5% | 64.3% |

These match common calculators within about 1 point.

**Childcare expense deduction:** the lower earner deducts up to 8,000 per child under 7 and 5,000 per child aged 7–16, capped at 2/3 of their earnings.

### 3.3 Child benefits

**Canada Child Benefit, July 2026 – June 2027** [NEWS] https://www.mtlblog.com/canada-child-benefit-july-2026
- **Maximum per child a year:** 8,157 under 6; 6,883 aged 6–17.
- **Phase-out:** starts at adjusted family net income 38,237. The second threshold, about 82,847, is the 2025 value × 1.02 [ESTIMATE].
- **Reduction rates (statutory structure):**

  | Children | 1 | 2 | 3 | 4+ |
  |---|---|---|---|---|
  | Between the thresholds | 7% | 13.5% | 19% | 23% |
  | Above the second threshold | 3.2% | 5.7% | 8% | 9.5% |

- **Model check:**

  | Toronto family, 2 children under 6 | CCB + OCB |
  |---|---|
  | One earner, 40k | about 18,600 a year |
  | 60k + 50k | 8,800 |
  | 90k + 80k | 5,400 |

**Ontario Child Benefit:** about 1,762 per child, reduced by 8% above 26,364 (2025 values × 1.02) [ESTIMATE].

**Alberta Child and Family Benefit, July 2026** [NEWS] https://www.moneysense.ca/save/budgeting/alberta-child-and-family-august-2026-payment/

| Component | 1st child | Each further child | Income rule |
|---|---|---|---|
| Base | 1,529 | 764 | reduced above 28,116 (model rate 6% [ESTIMATE]) |
| Working | 782 | 712 / 426 / 141 | phases in at 15% above 2,760; reduced above 47,115 (model rate 15% [ESTIMATE]) |

### 3.4 Not modeled
- GST/HST credit
- Canada Workers Benefit
- Canada Education Savings Grant (20% on RESP savings)
- Employer top-ups to EI parental benefits

## 4. Housing

### 4.1 Rent
- **Toronto:** median asking rents (Door Insight via Moving2Canada, July 2026) [SECONDARY] https://moving2canada.com/2026/07/how-much-is-rent-in-toronto-in-july-2026/
  - 1BR 2,150, 2BR 2,600, 3BR 3,380 (down 4–6% year over year).
  - 4BR (house) 4,200 [ESTIMATE].
- **Calgary:** average unfurnished 1BR 1,442 (liv.rent, September 2026, down 5.3%) [SECONDARY] https://liv.rent/blog/?p=69419
  - 2BR 1,850, 3BR 2,250, 4BR 2,800 [ESTIMATE].
- Rents usually exclude hydro, so utilities are 160 + 45 per person [ESTIMATE].

### 4.2 Prices
- **Toronto, TRREB September 2026, City of Toronto average sale prices** [OFFICIAL] https://trreb.ca/hlfiles/pdf/mw_september_2026_564895214753249.pdf

  | Type | Average price |
  |---|---|
  | Condo apartment | 640,248 |
  | Townhouse | 922,445 |
  | Semi-detached | 1,207,884 |
  | Detached | 1,562,966 |

  - Model: about 8,500 per m² for existing homes, 12,000 for pre-construction [DERIVED / ESTIMATE].
- **Calgary, CREB September 2026 benchmark prices** [NEWS] https://dailyhive.com/calgary/calgary-housing-market-september

  | Type | Benchmark |
  |---|---|
  | Apartment | 291,400 |
  | Row | 412,400 |
  | Detached | 739,400 |

  - Model: 3,900 per m² existing, 4,800 new [DERIVED].
- **Sizes:** 1–2 bedroom condos 55 / 75 m², 3 bedrooms (townhouse) 100 m², 4 bedrooms (house) 140 m² [ESTIMATE].
- **Running costs:**

  | Item | Toronto | Calgary |
  |---|---|---|
  | Property tax (share of value a year) | 0.75% | 0.68% |
  | Condo fees, per m² a month | 7 | 5 |
  | Home insurance, a year | 600 | 1,500 (hail) |

  All [ESTIMATE].

### 4.3 Closing costs
- **Toronto:**
  - Ontario land transfer tax: 0.5% / 1% / 1.5% / 2% / 2.5% at 55k / 250k / 400k / 2M.
  - Toronto charges the same tax again.
  - First-time buyer rebates: up to 4,000 (Ontario) and 4,475 (Toronto).
  - Example: a 700k home pays 12,475 in total after rebates.
- **Calgary:** Alberta has only registration fees (about $50 + $5 per $5,000).
- **Plus** about 2,500 in legal fees and title insurance.

### 4.4 Mortgage — nesto, 2026-10-09 [SECONDARY] https://www.nesto.ca/mortgage-rates/fixed/5-year/?region=on
- **Market:** 5-year fixed 4.59% insured, about 5.09% uninsured; Big 6 banks average 5.17%. Bank of Canada policy rate 2.25%. The model uses 4.7%.
- **Rules** [OFFICIAL rules]:
  - **Minimum down payment:** 5% of the first 500k and 10% of the rest. Homes over 1.5M need 20%.
  - **Default insurance premium:** 4.0% / 3.1% / 2.8% for loan-to-value above 90 / 85 / 80%. Add 0.2% for 30-year amortization, which first-time buyers have been allowed since December 2024. The premium is added to the loan.
  - **Stress test:** qualify at max(rate + 2%, 5.25%). Housing costs (mortgage, property tax, heating 1,200 a year and half the condo fee) must stay within 39% of gross income.
- **Model:** the minimum down payment, and more if the stress test binds.

## 5. Living costs — Survey of Household Spending 2023 [OFFICIAL] https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2025026-eng.htm
- Average household spending 76,750, of which shelter (including utilities) 24,671.
- **Adult base:**
  - Non-shelter spending: 76,750 − 24,671 = 52,079.
  - ÷ about 2.4 people [ESTIMATE] ÷ 12 × 0.716 = 1,295.
  - × 2023→2026 prices (about 1.07) ≈ **1,385** [DERIVED].
- **Child spending:** Taiwan's child-to-adult ratios × 1,385 → 693 / 596 / 748 / 983 / 1,094 [ESTIMATE].
- **City factors:** Toronto 1.08, Calgary 1.02 [ESTIMATE].
- **Transport:**
  - Transit passes: TTC about 160 a month, Calgary Transit about 118 [ESTIMATE].
  - Cars: used 18,000, new 42,000, import 65,000. Running costs (insurance, fuel, maintenance) 5,200–6,500 a year [ESTIMATE].

## 6. Birth and childcare
- **Birth:** covered by provincial health insurance. The model adds a doula (1,800 / 1,500) or a 2-week night nurse (3,500 / 3,000) [ESTIMATE].
- **CWELCC fees in 2026** (CCPA) [NEWS] https://www.policyalternatives.ca/news-research/the-10-a-day-divide-child-care-fees-in-canada-in-2026/

  | City | Daily fee | Monthly |
  |---|---|---|
  | Toronto | $22 | about 477 |
  | Calgary | $15 | 326 |

  - Spaces are short and waitlists are common.
- **Non-CWELCC options:** private care about 2,000 a month in Toronto and 1,300 in Calgary; a live-in nanny 3,300 / 2,900 [ESTIMATE].
- **Value of a CWELCC place** (only for the "fee reductions" statistic): about 1,800 a month [ESTIMATE].
- **EI maternity and parental benefits** [OFFICIAL] https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental/benefit-amount.html
  - Pays 55% of earnings, up to 729 a week.
  - Maternity: 15 weeks. Parental: 35 weeks, or 40 if shared; one parent can take at most 35.
  - **Model:**
    - One parent takes 12 months (50 paid weeks after a 1-week wait).
    - "Both" is 6.5 months each (about 27 paid weeks each).
    - Benefits are taxable; the model takes about 15%.

## 7. School and university
- **Ontario:**
  - Free full-day junior kindergarten from 4 and senior kindergarten at 5.
  - Before- and after-school care for 4–5 year-olds is about 240 a month for 10 months [ESTIMATE].
- **Alberta:** half-day kindergarten at 5. Under 6, the model counts CWELCC care at $15 a day.
- **School-age care:** about 450 / 550 a month for 10 months, plus summer camps 2,000 / 1,800 [ESTIMATE].
- **Private and international schools:** private day schools about 30,000 / 18,000 a year; IB international schools 35,000 / 22,000 [ESTIMATE].
- **University:**
  - Ontario tuition is frozen at about 7,000, plus fees, so about 8,500.
  - Alberta about 9,500.
  - Student rent away from home is about 800 a month [ESTIMATE].

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, CWELCC care, public school; excluding extra housing):

| City | Spending | Cash benefits | Fee reductions |
|---|---|---|---|
| Toronto | about 256k | about 39k | about 48k |
| Calgary | about 256k | about 39k | about 88k |

- Published Canadian estimates are about 250k–300k to age 18 including housing. The model is in that range without housing, so it is somewhat high.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Toronto | PR 48 | PR 76 |
| Calgary | PR 33 | PR 42 |

## 9. Known simplifications
- **Wages:** the national distribution is used for both cities. The full-time decile shape is estimated.
- **Provincial benefits:** the Ontario Child Benefit and ACFB reduction rates are estimates.
- **Not modeled:**
  - GST credit
  - Canada Workers Benefit
  - Education savings grants
  - Low-income tax reductions
- **Mortgage:** assumes renewal at the same rate for 30 years. The stress test is applied only at purchase.
