# Switzerland: Zurich and Bern (research notes, 2026-10-12)

All amounts are CHF at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why Switzerland and these cities:**
- Fertility is about 1.3.
- Switzerland has the highest wages in Europe, but also very high childcare, health-insurance and housing costs.
- Zurich is the largest and most expensive city. Bern is the capital, with higher taxes but much lower rents.

**What is different from Taiwan:**
- **Tax:** married couples file jointly. Federal tax is small; cantonal and municipal taxes depend heavily on the city, and are low for families with children.
- **Social insurance:** about 6.5% for the employee, plus occupational pension (BVG) contributions that rise with age.
- **Health insurance:** everyone buys their own (adults about 450–480 a month, children about 120). Premium subsidies (IPV) go to low and middle incomes.
- **Child allowances:** monthly, paid to age 25 if the child is in education.
- **Childcare:** full-day care costs 120–150 a day, subsidised by income.
- **School:** kindergarten starts at 4.
- **Leave:** only 14 weeks of maternity leave at 80% and 2 weeks of paternity leave.
- **Mortgages:** rates are very low, but a 20% deposit is required and affordability is tested at 5% interest.

## 1. Exchange rate
- 1 CHF = 38.344 TWD (closing rate, 2026-10-12) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/chf-pairs/CHFTWD-exchange-rate

## 2. Wages
- **Median 2024:** CHF 7,024 a month, standardised to full time and including the pro-rata 13th month and bonuses (FSO wage structure survey, via SRF) [OFFICIAL] https://www.srf.ch/news/schweiz/bundesamt-fuer-statistik-schweizer-medianlohn-liegt-bei-7024-franken-brutto
  - Annual: × 12 = 84,288. × about 1.03 to 2026 ≈ **87,000** [DERIVED].
- **Deciles:** the lowest 10% earn under 4,635 (0.66 of the median); the highest 10% earn over 12,526 (1.78) [OFFICIAL]. The other quantiles are [ESTIMATE], with α 2.6.

## 3. Taxes and transfers

**Cantonal, municipal and church tax** (BAK Economics, Zürcher Steuerbelastungsmonitor 2026, tax year 2025, from Federal Tax Administration data) [SECONDARY] https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/kantonsfinanzen/steuerbelastungsmonitor/BAK%20Economics_Zürcher_Steuerbelastungsmonitor_2026.pdf
- Shares of gross labour income:

| Gross income | Zurich: single | Zurich: married, no children | Zurich: married, 2 children | Bern: single | Bern: married, no children | Bern: married, 2 children |
|---|---|---|---|---|---|---|
| 50,000 | 6.50% | 3.47% | 0.32% | 11.40% | 7.03% | 0.98% |
| 80,000 | 9.41% | 6.33% | 2.88% | 14.03% | 10.58% | 6.19% |
| 100,000 | 10.85% | 7.80% | 4.50% | 15.30% | 11.82% | 8.31% |
| 150,000 | 13.45% | 10.26% | 7.70% | 17.70% | 14.29% | 11.53% |
| 200,000 | 15.61% | 12.33% | 10.16% | 19.54% | 16.55% | 14.14% |

- Cross-check: the City of Bern's own 2025 table matches. For example, single at 100,000 = 16.98% including church tax, and married single-earner with 2 children = 8.30%. https://www.bern.ch/themen/stadt-recht-und-politik/bern-in-zahlen/katost/18offver/jahresdaten/t-18-07-010-steuerbelastung-des-arbeitseinkommens.pdf/at_download/file
- **How the model uses the table:**
  - It interpolates linearly. Below 50,000 it tapers to 0 at 20,000. Above 200,000 it continues at 60% of the last slope, capped at 26% (Zurich) and 32% (Bern).
  - One child is half-way between "no children" and "2 children"; three or more extrapolate.
  - Single parents use the married columns (the Swiss parental tariff).
  - Childcare costs (up to 25,800 per child under 14) are subtracted from income first.
  - Church tax is included, so the figures are slightly high for people who are not members.

**Federal direct tax** [ESTIMATE: 2024 tariff]
- **Married tariff:**
  - 0% up to 30,800, then 1%, 2%, … up to 13% marginal from 145,000.
  - Above 895,900: a flat 11.5% of total income.
  - Minus 263 per child.
- **Single tariff:** 0.77%–13.2%.
- **Taxable income:** gross, minus social contributions, about 6,000 work expenses per earner, insurance (3,600 married, 1,800 single, +700 per child), 6,800 per child, the second-earner deduction (50% of the lower income, between 8,600 and 14,100) and childcare costs.

**Social insurance (employee)** [OFFICIAL rates; NBU ESTIMATE]
- AHV/IV/EO (old-age, disability and income-compensation insurance) 5.3%, unemployment insurance 1.1%, and non-occupational accident insurance about 1.2%. The last two apply up to 148,200.
- **Occupational pension (BVG):** half of the age-based credit (7 / 10 / 15 / 18%) on the coordinated salary (salary − 26,460, between 3,780 and 64,260), plus 0.5% risk premium.
  - The model adds about 4% on salary above 90,720 for typical above-minimum plans.

**Health insurance**
- **Average premiums 2026:** adults 465.30, young adults 326.30 and children 122.50 a month (Federal Office of Public Health) [OFFICIAL] https://www.priminfo.admin.ch/downloads/MM_Praemiengenehmigung%202026_DE.pdf
- **Model premiums:** adults 450 (Zurich) and 470 (Bern), assuming a typical cheaper plan; ages 19–25 pay 330 and children 120 [ESTIMATE].
- **Deductibles and co-pays:** about 600 per adult and 150 per child a year [ESTIMATE].
- **Premium subsidy (IPV):** canton-specific. The model approximates it as 85% of premiums minus 14% of federal taxable income [ESTIMATE].
- Premiums are counted under social insurance in the model.

**Family allowances, 2026** (bexio, citing the Federal Social Insurance Office; USZ fact sheet for Zurich) [SECONDARY] https://www.bexio.com/de-CH/blog/view/familienzulagen
- **Zurich:** 215 a month up to age 12, 268 over 12, and 268 education allowance (16–25).
- **Bern:** 250 a month, and 310 education allowance.
- There is no birth allowance in either canton.

**Maternity and paternity pay**
- Maternity: 14 weeks (98 days). Paternity: 2 weeks (14 days).
- Both pay 80% of earnings, capped at 220 a day [OFFICIAL]. Taxed, so the model counts 85%.
- The model counts about 4 months off work for the mother (14 weeks plus holiday).

**Not modelled:**
- The pillar 3a deduction
- Means-tested education grants
- Housing benefits in a few cities

## 4. Housing

**Rents**
- **Zurich city, asking rents 2025** (neho) [SECONDARY] https://neho.ch/de/blog/mietzins-zurich
  - 2.5 rooms about 2,820 a month; 3.5 rooms about 3,436.
  - Per m² a year: mean 565, median 497 (about 41 a month).
  - Sitting-tenant and cooperative rents are much lower, so the model uses **33 per m² a month plus 3 service charges** [ESTIMATE].
- **Bern city, existing rents (November 2025)** (Statistik Stadt Bern) [OFFICIAL] https://www.bern.ch/mediencenter/medienmitteilungen/aktuell_sta/mietpreise-sind-gegenueber-dem-vorjahr-um-1-4-prozent-gestiegen/dokumente/2026-02-17-mietpreiserhebung-2025-mm.pdf/download
  - 3 rooms 1,338; 4 rooms 1,666; 5 rooms 2,090 (net).
  - New contracts are higher, so the model uses **21 per m² plus 2.5 service charges** [ESTIMATE].
- **Unit sizes:** 60 / 80 / 100 / 120 m² for 1–4 bedrooms (Swiss "2.5–5.5 rooms").

**Prices** (neho, August 2026) [SECONDARY]
- Zurich 8002: apartments average 19,865 per m² https://neho.ch/de/quadratmeterpreis-zuerich-8002-0
- Bern 3018 (one of the cheaper districts): apartments average 7,763 per m² https://neho.ch/de/quadratmeterpreis-bern-3018-0
- Model: Zurich 16,500 existing, 19,000 new; Bern 8,800 / 10,500 [ESTIMATE].

**Buying costs and running costs**
- **Zurich:** no transfer tax and no property tax (canton Zurich). Notary and land registry about 0.5% [OFFICIAL / ESTIMATE].
- **Bern:** 1.8% transfer tax plus fees, about 2.3% in total, and property tax of about 0.1% a year [ESTIMATE].
- **Condominium fees and renovation fund:** 4–4.5 per m² a month [ESTIMATE].
- **Imputed rental value (Eigenmietwert):** its taxation and the matching interest deduction are not modelled. Voters approved abolishing it in September 2025, effective around 2028.

**Mortgage**
- **Rate:** policy rate 0%; money-market (SARON) mortgage about 1.17%, 5-year fixed 1.77%, 10-year fixed 2.04% (GKB, 29 July 2026) [SECONDARY] https://www.gkb.ch/content/dam/gkb/dokumente/private/zinskommentar/de/20260803_Zinskommentar_d.pdf
  - The model uses **1.8%**.
- **Loan size:**
  - At most 80% of the price; at least 10% must be cash rather than pension money.
  - Affordability: 5% notional interest + 1% of the price for maintenance + repayment of the second mortgage over 15 years ≤ 1/3 of gross income [OFFICIAL industry rule].
- **Repayment:**
  - The first mortgage (up to 2/3 of the price) is repaid slowly; the model uses 40 years.
  - The second mortgage is repaid over 15 years.
- **Pension money for the deposit:**
  - Like KiwiSaver and CPF in this game, the model accumulates employee plus employer BVG contributions from the start of the simulation.
  - At the first purchase it withdraws up to 10% of the price, less about 7% withdrawal tax.

## 5. Living costs — FSO Household Budget Survey 2023 [OFFICIAL] https://dam-api.bfs.admin.ch/hub/api/dam/assets/36192815/master
- **Survey figures:** gross income 10,341 per household a month; consumption 5,049; housing and energy 1,449; 2.07 people per household.
- **Adult base:** (5,049 − 1,449) ÷ 2.07 ≈ 1,739. × 1.016 for prices 2023→2026, × 0.716 ≈ **1,260** [DERIVED].
  - Health premiums are not part of consumption in this survey, so they are counted separately.
- **City factors:** Zurich 1.08, Bern 1.00 [ESTIMATE].

## 6. Childcare, school and university

**Ages 0–3: daycare (Kita)**
- Full cost: about 120–149 a day in Zurich and 110–130 in Bern; 2,400–3,200 a month full-time (Grenzgängerzentrum) [SECONDARY] https://grenzgaengerzentrum.de/ratgeber/allgemein/kita-kosten-schweiz/
- **Model:** 5 days a week (21.7 days a month) at 135 (Zurich) and 120 (Bern) a day.
- **Subsidy by income:**
  - Income measure: about 72% of gross minus 6,800 per child.
  - Zurich: parents pay from 13 a day, rising to the full price between incomes of 25,000 and 110,000 [ESTIMATE].
  - Bern: vouchers for families with relevant income below 170,000; parents always pay at least 7 a day (Canton Bern kiBon brochure) [OFFICIAL]. The model uses a minimum of 15 and a taper from 43,000 [ESTIMATE].

**Ages 4–5: kindergarten**
- Public kindergarten is free. Working parents pay for lunch and after-school care at about 45–50 a day full price, income-scaled from 8 a day [ESTIMATE].
- Private and bilingual kindergartens cost 22,000–30,000.

**School**
- Primary 6–11, lower secondary 12–14, Gymnasium or apprenticeship 15–18.
- Public school costs about 600–1,000 a year. Private schools cost 22,000–25,000; international schools 30,000–35,000.
- After-school care uses the same income scale as kindergarten.
- Tutoring for the Gymnasium entrance exam (common in Zurich) costs 220–600 a month.

**University (from 19):** about 1,500 a year in fees (ETH and University of Bern). A shared student flat costs about 900 a month.

## 7. Benchmarks

**One child aged 0–17 (excluding housing)**

| City | Spending | Cash allowances | Childcare subsidies |
|---|---|---|---|
| Zurich | about 403k | about 50k | about 5k |
| Bern | about 317k | about 55k | about 53k |

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Zurich | PR 42 | PR 87 |
| Bern | PR 15 | PR 59 |

**Why Bern is so much lower than Zurich:** Bern's tax is higher, but rents there are about two-thirds of Zurich's, flats cost about half as much per m², and the childcare vouchers reach incomes up to 170,000.
