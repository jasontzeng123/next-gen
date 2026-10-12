# New Zealand: Auckland and Christchurch (research notes, 2026-10-12)

All amounts are NZD at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why New Zealand and these cities:**
- Fertility is about 1.5.
- Housing is very expensive relative to income.
- Auckland is the largest city. Christchurch is the largest South Island city and much cheaper.

**What is different from Taiwan:**
- **Tax:** individual taxation plus an ACC accident levy.
- **KiwiSaver:** most employees are auto-enrolled in this retirement savings scheme (3.5% from April 2026). The balance can be withdrawn to buy a first home.
- **Family support:** Working for Families (Family Tax Credit, In-Work Tax Credit) abates steeply above $44,900. Best Start pays for ages 0–2.
- **Childcare:** 20 free hours a week of early childhood education (ECE) for ages 3–5. Under-3 care is fully user-paid, with an income-tested subsidy and the FamilyBoost rebate.
- **School:** starts at 5.
- **Buying a home:** no stamp duty, a 20% deposit, and a debt-to-income limit.

## 1. Exchange rate
- 1 NZD = 17.88 TWD (2026-10-12) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/nzd-pairs/NZDTWD-exchange-rate

## 2. Wages
- **Median weekly earnings, June 2026 quarter:** men $1,538, women $1,280. This covers all wage and salary earners, including part-time (Stats NZ via Figure.NZ) [OFFICIAL] https://figure.nz/chart/tsPtbVNvycc0iL4w-tZPxwbEKXYxHJu9S
- **Model full-time median:** about $1,500 a week × 52 ≈ **$78,000** [ESTIMATE].
- **Minimum wage:** $23.95 from April 2026 (PayHero) [SECONDARY] https://www.payhero.co.nz/blog/EOFY2026-april-payroll-changes
  - Full-time: 23.95 × 2,080 ≈ $49,800, about 0.64 of the median [DERIVED].
- **Distribution:** the model uses P25 0.76, P75 1.30, P90 1.72, P95 2.10, α 2.8 [ESTIMATE].

## 3. Taxes and transfers

**Income tax (from 31 July 2024)** [OFFICIAL]

| Income | Rate |
|---|---|
| up to 15,600 | 10.5% |
| 15,600–53,500 | 17.5% |
| 53,500–78,100 | 30% |
| 78,100–180,000 | 33% |
| above 180,000 | 39% |

- **Independent earner tax credit:** $520 for incomes of $24,000–$66,000, abating 13% to $70,000. Not available to people receiving Working for Families [OFFICIAL rule].

**Deductions from pay (2026–27)** (PayHero) [SECONDARY]
- **ACC earners' levy:** 1.75% up to $156,641.
- **KiwiSaver:** default employee and employer rate is 3.5% from 1 April 2026.
  - The model treats the employee 3.5% as a deduction.
  - It accumulates employee plus employer contributions (employer about 2.9% after employer superannuation contribution tax) at 3% a year until the first home purchase. The balance is then withdrawn, leaving $1,000 each.
  - Like Singapore's CPF in this game, the balance starts at zero when the simulation starts.

**Working for Families 2026–27** (nztax.tools) [SECONDARY] https://nztax.tools/tax-insights/working-for-families-rates-2026-27/
- **Family Tax Credit:** eldest child $7,921 a year; each other child $6,454.
- **In-Work Tax Credit:** $97.50 a week ($5,070 a year), plus $15 a week per child beyond three.
  - A temporary $50 boost to $147.50 runs until April 2027. The model uses the permanent rate.
- **Abatement:** 27.5 cents per dollar of family income above $44,900, applied to FTC first, then IWTC.
- **Best Start:** $4,041 a year per child aged 0–2.
  - Income-tested above $79,000 at 21%; fully gone at about $98,000.
  - Not paid in the weeks parental leave pay is received.
- **Minimum Family Tax Credit:** not modelled. It tops up very low working incomes.

**Paid parental leave**
- Up to 26 weeks at the lower of weekly earnings or $811.05 a week (from 1 July 2026) (IRD) [OFFICIAL] https://www.ird.govt.nz/updates/news-folder/2026/paid-parental-leave
- Taxable, so the model counts 83%.
- If both parents take leave, the model splits it about 13 weeks each.

## 4. Housing

**Rents** (Tenancy Services bond data, as summarised by calculate.co.nz, May 2026) [SECONDARY] https://www.calculate.co.nz/reference/nz-average-rent.php
- Source medians: Auckland about $680 a week (all), 3-bedroom about $730. Christchurch about $540 (all), 2-bedroom $500, 3-bedroom $540.
- The model's weekly rents by bedroom count [ESTIMATE]:

| Bedrooms | Auckland | Christchurch |
|---|---|---|
| 1 | 480 | 400 |
| 2 | 600 | 490 |
| 3 | 700 | 560 |
| 4 | 850 | 650 |

**Accommodation Supplement, 2026** (nztax.tools) [SECONDARY] https://nztax.tools/accommodation-supplement-calculator/
- **Formula:** 70% of weekly rent above $205, capped at $305 (Auckland, Area 1) or $220 (Christchurch, Area 2), for couples with children.
- **Income test:** abates 25c per dollar of gross weekly income above $1,117.
- **Asset test:** no payment if cash assets exceed $16,200.
- The model applies it to households of 3 or more people only.

**Prices** (Opes Partners, August 2026) [SECONDARY] https://www.opespartners.co.nz/property-markets/nz-property-market-update
- Auckland median sale price $950,000. Canterbury median $700,500.
- **Model prices per m²:** Auckland 8,000 existing, 8,800 new; Christchurch 6,000 / 6,400 [DERIVED]. A 3-bedroom home is about 115 m².

**Buying costs**
- No stamp duty.
- Legal fees, building inspection and LIM report: about $3,500 [ESTIMATE].

**Ongoing costs** [ESTIMATE]
- Council rates: about $3,900 (Auckland) and $3,800 (Christchurch) a year.
- House insurance: $3,000 / $3,500. Christchurch is higher because of earthquake risk.
- Maintenance: about $1,300–1,500 a year.

**Mortgage**
- **Rate:** the 1-year fixed average was about 5.02% and the 2-year about 5.41% (late September 2026), after the OCR was raised to 2.75% on 2 September 2026 (calculate.co.nz) [SECONDARY] https://www.calculate.co.nz/reference/nz-interest-rates.php
  - The model uses 5.2%, on a 30-year term.
- **Borrowing limits:**
  - At most 80% of the price (Reserve Bank LVR rules).
  - At most 6 times income (DTI rule).
  - Repayments tested at 7% must stay under about 38% of gross income [OFFICIAL rules; serviceability ratio ESTIMATE].
- Kāinga Ora's First Home Loan (5% deposit) is not modelled.

## 5. Living costs — Stats NZ Household Expenditure Statistics, year ended June 2023 [OFFICIAL] https://figure.nz/chart/t1esyohiJmbcElex
- **Survey figures:** total about $1,597.50 per household a week. Housing and household utilities are $398.
- **Adult base:** non-housing $1,199.50 ÷ about 2.65 people × 52 ÷ 12 ≈ $1,961 a month. × 1.09 for prices 2023→2026, × 0.716 ≈ 1,530. The model uses **1,500** [DERIVED / ESTIMATE].
- **City factors:** Auckland 1.08, Christchurch 0.97 [ESTIMATE].

## 6. Childcare, school and university

**Ages 0–2**
- Full-day centre fees: about $475 a week in Auckland and $400 in Christchurch [ESTIMATE]. The source only gives an example of $360 a week for 3 days.
- **Childcare Subsidy (Work and Income)**, from 1 April 2026 [SECONDARY] https://moneybalance.co.nz/personal-finance/cost-of-living/childcare-costs-nz/
  - Up to $6.72 an hour per child for up to 50 hours. The model uses 45.
  - Full rate below gross weekly family income of $1,131 / $1,301 / $1,457 (1 / 2 / 3+ children). Stops at $2,404 / $2,748 / $3,091.
  - The model interpolates linearly between these. The real subsidy has four steps.
- **FamilyBoost:** 40% of remaining ECE fees, up to $1,560 a quarter per household. The cap falls by 7c per dollar above $35,000 a quarter of household income.

**Ages 3–4**
- 20 free hours a week. The remaining hours cost about $250 / $200 a week [ESTIMATE].
- The free hours are recorded as a benefit of about $13 an hour.

**School**
- **Ages:** primary from 5, intermediate 11–12, secondary 13–17.
- **Costs:**
  - State schools are free. Donations, uniforms, devices and NCEA fees come to $600–1,200 a year [ESTIMATE].
  - Private schools: $22,000–25,000. IB private schools: $27,000–32,000.
- **After school:** after-school and holiday care (OSCAR) costs about $4,800–5,500 a year. The OSCAR subsidy is not modelled.

**University**
- About $8,500 a year in fees.
- The final year is fees-free; the model makes the 3rd of 4 years free.
- Student Allowance is parent-income-tested and not modelled.
- A student hall costs about $1,300 a month.

## 7. Benchmarks

**One child aged 0–17** (excluding housing): about $312k in Auckland and $293k in Christchurch.
- Cash support is near zero at the default incomes, because Working for Families abates fully above about $116k of family income.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Auckland | PR 49 | PR 81 |
| Christchurch | PR 32 | PR 65 |

**Comparison with Australia:** New Zealand is harder than Australia (Sydney 41 / 65, Melbourne 24 / 37). Wages are lower (and NZD weaker), childcare for under-3s is fully user-paid, and rents and prices are similar to Melbourne's.
