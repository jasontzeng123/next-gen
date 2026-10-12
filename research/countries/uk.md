# United Kingdom: London and Manchester (research notes, 2026-10-12)

All amounts are GBP at 2026 levels. Both cities are in England, so the model uses English rules (childcare entitlements, school ages, council tax, stamp duty). Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- London: very high rents and house prices, but the same national tax and benefit system as everywhere else.
- Manchester: the largest English city outside London, with rents and prices about half of London's.

**What is different from Taiwan:**
- The NHS makes giving birth free.
- Working parents get 30 funded childcare hours a week from 9 months old (38 weeks a year).
- Child Benefit is paid for every child, but is clawed back from the higher earner between 60k and 80k.
- Universal Credit is a means-tested top-up for low-income families. It covers rent up to a cap and 85% of childcare.
- University tuition is paid by the student's own loan and repaid from future earnings.

## 1. Exchange rate
- 1 GBP = 42.27 TWD (close, 2026-10-12) [SECONDARY]
- PPP factor in the model: about 20 TWD per GBP (UK about 0.68 GBP per international dollar, Taiwan about 13.65 TWD) [ESTIMATE]. The model does not use PPP for the threshold.

## 2. Wages (full-time employees)

Source: ONS Annual Survey of Hours and Earnings (ASHE) 2025 [OFFICIAL] https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025
- Median gross annual pay for full-time employees in the same job for at least a year (April 2025): **39,039**.
- Average pay by age group (full-time): 22–29: 35,760; 30–39: 48,421; 40–49: 54,591; 50–59: 53,349; 60+: 46,794.
- Age 30–39: P80 59,109, P90 75,041.

**Model choices**
- 2026 median = 39,039 × about 1.045 (regular pay growth of 4–5% a year) ≈ **40,800** [DERIVED].
- Bottom of the distribution: the full-time minimum wage (12.21 × 37.5 hours × 52 ≈ 23,800) is about 0.61 of the median, so P10 = 0.61 [DERIVED].
- Top: P80 ≈ 1.49 and P90 ≈ 1.84 of the median, scaled from the age 30–39 percentiles [DERIVED / ESTIMATE]; the points in between are log-interpolated.
- Age curve: the shape of the age-group averages, converted to ratios of the median: 22: 0.70, 25.5: 0.85, 34.5: 1.08, 44.5: 1.15, 54.5: 1.10, 63: 0.95 [DERIVED / ESTIMATE].

## 3. Taxes and benefits (England, 2026/27)

### 3.1 Employee deductions [OFFICIAL]

**Income tax**

| Band | Rate |
|---|---|
| Personal allowance up to 12,570 | 0% |
| Basic, next 37,700 | 20% |
| Higher, up to 125,140 | 40% |
| Additional, above | 45% |

- The personal allowance is withdrawn by 1 for every 2 of income above 100,000.
- Thresholds are frozen until 2028 (later 2030).

**Other deductions**
- **National Insurance (Class 1 employee):** 8% between 12,570 and 50,270, then 2%.
- **Workplace pension (auto-enrolment):** the employee pays 5% of qualifying earnings (6,240–50,270). This is modeled as salary-sacrifice-like, reducing income for tax. The model counts it as social insurance, like Taiwan's labor pension.

**Model take-home check, single:**

| Gross | Take-home |
|---|---|
| 24k | 83.7% |
| 40.8k | 77.2% |
| 60k | 73.4% |
| 90k | 68.3% |
| 130k | 61.1% |

These are consistent with HMRC calculators once the 5% pension is included.

### 3.2 Child Benefit [NEWS] https://salarytax.uk/news/child-benefit-rates-2026-27-uprating
- 27.05 a week for the eldest child, 17.90 for each other child.
- High Income Child Benefit Charge: 1% of the benefit for every 200 of adjusted net income above 60,000 (higher earner), so it is all repaid at 80,000.
- In the model the benefit is added to government transfers, and the charge is added to tax.

### 3.3 Universal Credit (simplified) [SECONDARY] https://uktax.tools/universal-credit-rates/

**Monthly amounts used, 2026/27**

| Element | Amount |
|---|---|
| Standard allowance, couple | 666.97 |
| Standard allowance, single | 424.90 |
| Child element, each child | 303.94 |
| Housing element | actual rent, capped at the Local Housing Allowance |
| Childcare element | 85% of costs, up to 1,071.09 (1 child) or 1,836.16 (2+) |

- The two-child limit was abolished from April 2026, so every child counts.

**Rules**
- **Earnings taper:** 55% of net earnings above the work allowance (427 with housing costs, 710 without).
- **Capital rules:**
  - No entitlement with savings of 16,000 or more.
  - Between 6,000 and 16,000, every 250 counts as 4.35 a month of income.
  - The model uses start-of-year savings.

**Local Housing Allowance caps (monthly, 1–4 bedrooms)** [ESTIMATE]

| Area | 1 bed | 2 bed | 3 bed | 4 bed |
|---|---|---|---|---|
| Outer London | 1,250 | 1,550 | 1,850 | 2,350 |
| Manchester | 725 | 850 | 995 | 1,350 |

**Not modeled**
- The benefit cap
- Council tax support
- Transitional protection
- Surplus earnings rules

**Sample results:**
- Manchester, one earner on 24k, two children, rent 1,500, little savings: about 1,580 a month of Universal Credit plus Child Benefit.
- The same family with 20k of savings: Child Benefit only.

### 3.4 Childcare support [OFFICIAL]
- **Working parents' entitlement:**
  - From 9 months old to school entry: 30 funded hours a week for 38 weeks (1,140 hours a year).
  - Each parent must expect to earn at least 16 hours × the minimum wage a week (about 10k a year) and less than 100k.
- **Universal entitlement:** every 3- and 4-year-old gets 15 hours (570 a year) regardless of work.
- **Tax-Free Childcare:** the government adds 2 for every 8 paid in, up to 2,000 per child under 12 a year. It cannot be combined with Universal Credit. Both parents must work and each must earn under 100k.
- **Model:**
  - Funded hours are valued at the nursery's own hourly price.
  - Parents still pay for the hours not covered, plus about 950 a year in meals and consumables for funded hours [ESTIMATE].

## 4. Housing

### 4.1 Rent (ONS Price Index of Private Rents) [OFFICIAL] https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/september2026
- **London:** average 2,332 a month (August 2026).
  - By bedrooms, using London's usual ratios plus about 5% for new lets.
  - Model: 1,950 / 2,400 / 2,900 / 3,800 [DERIVED / ESTIMATE].
- **Manchester (April 2026):** 1 bed 987, 2 bed 1,213, 3 bed 1,406, 4+ bed 1,986 [OFFICIAL via SECONDARY] https://housecheckup.co.uk/average-rent/manchester
  - Model: about +7% to reach August and new-let levels → 1,060 / 1,300 / 1,500 / 2,100 [DERIVED].

### 4.2 Home prices
- **London average price:** 569k (July 2026) [OFFICIAL, same ONS release].
  - Family homes in outer boroughs cost about 6,000–7,500 per m².
  - Model: 6,800 per m² for existing homes, 8,500 for new builds [ESTIMATE].
- **Manchester:** 3,300 per m² for existing homes, 4,000 for new builds [ESTIMATE].
- **Sizes:** 1–2 bedroom flats 50 / 70 m², 3–4 bedroom houses 90 / 120 m² [ESTIMATE]. English homes are small; a typical 3-bed semi is about 85–90 m².
- **Running costs:**

  | Item | London | Manchester |
  |---|---|---|
  | Service charge and repairs, per m² per month | 2.5 | 1.2 |
  | Buildings and contents insurance, per year | 400 | 350 |

  All [ESTIMATE].

### 4.3 Council tax
- Paid by tenants and owners alike.
- Band D averages for 2026/27 [ESTIMATE from 2025/26 plus about 5%]: London about 2,150 (including the GLA precept), Manchester about 2,420.
- The model maps 1–2 bedrooms to bands B/C (0.78 / 0.89 of D), 3 bedrooms to D, and 4 bedrooms to E (1.22).

### 4.4 Mortgage
- **Rate:** average 5-year fix 6.00% (Moneyfacts, 2026-10-05, first time at 6% in three years) [NEWS] https://www.itv.com/news/2026-10-05/mortgage-misery-as-average-five-year-deal-hits-6-for-first-time-in-three-years
- **Model terms:**
  - 30-year term at 6.0% throughout. The model assumes remortgaging at similar rates.
  - 90% loan-to-value.
  - Loan capped at 4.5× household income (the usual lender limit).

### 4.5 Stamp duty land tax (England, from April 2025) [OFFICIAL]
- **First-time buyers:**
  - 0% up to 300k, 5% on 300k–500k.
  - No relief if the price is above 500k.
- **Standard rates:**

  | Portion of price | Rate |
  |---|---|
  | Up to 125k | 0% |
  | 125k–250k | 2% |
  | 250k–925k | 5% |
  | 925k–1.5m | 10% |
  | Above 1.5m | 12% |

- Plus about 3,600 for legal fees, survey and mortgage fees [ESTIMATE].

## 5. Living costs

### 5.1 ONS Family Spending, April 2024 to March 2025 [OFFICIAL] https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/april2024tomarch2025
- Average household spending 676.60 a week, of which housing, fuel and power 118.40.
- Adult base:
  - Take 676.60, subtract 118.40, then subtract about 70 more for mortgage interest and council tax (which sit outside the main total) [ESTIMATE]. This leaves about 488 a week.
  - Per person: 488 ÷ 2.36 people.
  - Monthly per adult: × 52 × 0.716 ÷ 12 ≈ 642.
  - With 2026 prices (× 1.04): **670 a month** [DERIVED].
- Child spending: Taiwan's child-to-adult ratios × 670 → 335 (age 0–1), 288 (2–5), 362 (6–11), 476 (12–17), 529 (18+) [ESTIMATE].
- Utilities: 120 a month plus 50 per person (energy price cap, water, broadband) [ESTIMATE].

### 5.2 City factors [ESTIMATE]
- London per-person consumption about 1.15× the UK average (higher household spending with a similar household size).
- North West about 0.92×.

### 5.3 Transport [ESTIMATE]

| Item | London | Manchester |
|---|---|---|
| Public transport, per adult per month | 200 (zones 1–4 pay-as-you-go cap) | 80 (Bee Network bus and tram) |
| Resident parking permit, per month | 50 | 20 |

- Running a used car costs about 2,600 a year (insurance, fuel, MOT, servicing, road tax).
- Scooters are uncommon, so they are mapped to public transport.

## 6. Birth and childcare

### 6.1 Birth
- Free on the NHS. The model counts only baby gear and postpartum help.
- Postpartum help: a doula about 2,000 in London and 1,500 in Manchester; a maternity nurse for 2 weeks about 2,600 and 2,200 [ESTIMATE].
- The "comfortable" lifestyle adds 1,500 for private scans or a private room.

### 6.2 Nursery prices (Coram Childcare Survey 2026) [OFFICIAL] https://www.coram.org.uk/wp-content/uploads/2026/03/Childcare-Survey-2026.pdf

Weekly price for 25 hours, for hours that are not funded:

| Region | Under 2 | Age 2 |
|---|---|---|
| Outer London | 216.94 | 213.99 |
| North West | 178.01 | 158.01 |

**Model**
- Full time = 50 hours a week for 51 weeks.
- Working families get 1,140 funded hours deducted from 9 months old (a quarter of that in the birth year).
- Nanny share: 25,000 a year in London, 18,000 in Manchester [ESTIMATE].
- The au pair visa route ended with Brexit, so the "live-in helper" option maps to a nanny share.

### 6.3 Parental leave [SECONDARY] https://cintra.co.uk/blog/parental-pay-rates-26-27/
- Statutory Maternity Pay: 39 weeks.
  - First 6 weeks: 90% of average weekly earnings.
  - The other 33 weeks: 194.32 a week, or 90% if that is lower.
- Shared Parental Leave lets parents split the same pay. "Both take leave" is modeled as one parent taking 9 months.
- Paternity leave (2 weeks at 194.32) is not modeled separately.

## 7. School and university
- **School ages (England):**
  - Reception (school entry) at 4.
  - Secondary school at 11.
  - Sixth form 16–17.
  - Model bands: care 0–2, preschool 3, primary 4–10, secondary 11–15, sixth form 16–17.
- **State school costs** (uniform, trips, lunches): about 450–900 a year [ESTIMATE].
- **Private school fees, including 20% VAT since January 2025** [ESTIMATE]:

  | Level | London | Manchester |
  |---|---|---|
  | Primary | 24,000 | 15,000 |
  | Secondary | 28,000 | 17,500 |
  | Sixth form | 29,000 | 18,000 |

- **Out of school:**
  - Breakfast and after-school clubs plus holiday camps: about 415 a month in London, 360 in Manchester [ESTIMATE].
  - Private tutoring: "some" 150 / 130 a month; "intensive" 400 / 350 (11+, GCSE, A-level) [ESTIMATE].
- **University:**
  - Tuition of 9,790 a year (2026/27) is paid with a student loan.
  - Maintenance loans fall as household income rises above about 25k.
  - Model: parents top up living costs by 15% of household income above 25,000, up to 6,000 a year [ESTIMATE].

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, nursery, state school; excluding the extra bedroom):

| City | Spending | Cash benefits | Fee reductions |
|---|---|---|---|
| London | about 187k | about 39k | about 30k |
| Manchester | about 169k | about 38k | about 23k |

**CPAG Cost of a Child 2025** [SECONDARY / research] https://cpag.org.uk/sites/default/files/2025-10/CPAG-Cost-of-a-Child-2025.pdf
- Couple, average of first and second child, to age 18:
  - Basic cost (excluding rent, childcare and council tax): **167,679**.
  - Full cost (including them): **251,018**.
- CPAG uses the Minimum Income Standard: urban UK outside London, social housing in the East Midlands, and full-time formal childcare.
- **Comparison with the model:**
  - The model's child living costs alone (about 86k) are well below CPAG's basic cost.
  - CPAG's basic cost is a normative "minimum acceptable" budget built by focus groups. It includes the child's share of household goods, transport and social participation, which tend to be above what low- and middle-income families actually spend.
  - The model keeps the same method as the other countries (national consumption survey × Taiwan's ratios) for cross-country comparability. So UK child costs are probably on the low side rather than the high side.

**Thresholds (two children, renting, normal lifestyle; Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| London | PR 67 | PR 84 |
| Manchester | PR 34 | PR 48 |

## 9. Known simplifications
- National wage distribution for both cities, as in the other countries. London wages are about 20–25% above the national median, so London thresholds are pessimistic and Manchester's slightly optimistic. This is the same convention as the other countries, so the comparison stays consistent.
- Universal Credit is simplified: no benefit cap and no council tax support.
- Mortgage rates are held at 6% for 30 years.
- Council tax bands are mapped from bedroom counts, not property values.
