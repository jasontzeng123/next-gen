# Germany: Berlin and Leipzig (research notes, 2026-10-12)

All amounts are EUR at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- Berlin is the capital: free public childcare from birth, free primary-school lunches, and asking rents around 16 €/m².
- Leipzig is the fastest-growing big city in the east. It has lower wages locally and cheaper homes, but charges childcare fees, and employees pay 0.5% more long-term-care contribution (Saxony).

**What is different from Taiwan:**
- Married couples file jointly with income splitting (Ehegattensplitting).
- Child benefit (Kindergeld) is 259 a month per child up to age 25 in education, or the child tax allowance (Kinderfreibetrag) if that saves more tax.
- Parental allowance (Elterngeld) replaces about 65% of net pay, 300–1,800 a month, for up to 12 months (14 if both parents take some).
- A legal right to a childcare place from age 1.
- Means-tested child supplement (Kinderzuschlag) and housing allowance (Wohngeld) for low-income working families.
- No university tuition.

## 1. Exchange rate
- 1 EUR = 35.768 TWD (2026-10-09, same as the France module) [NEWS]
- PPP factor in the model: about 18.7 TWD per EUR (Germany about 0.73 EUR per international dollar, Taiwan about 13.65 TWD) [ESTIMATE]. The model does not use PPP for the threshold.

## 2. Wages (full-time employees, annual, including special payments)

**2025 headline figures** — Destatis, earnings survey, press release 113/2026 [OFFICIAL] https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html

| Measure | Amount |
|---|---|
| Median | 54,066 |
| Mean | 64,441 |
| P10 | 33,828 |
| P90 | 100,719 |
| Top 1% threshold | 219,110 |
| East (excl. Berlin) median | 46,013 |
| West median | 55,435 |

**2024 deciles** — press release 134/2025 [OFFICIAL] https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_134_621.html

| Percentile | P10 | P20 | P30 | P40 | P50 | P60 | P70 | P80 | P90 | P99 |
|---|---|---|---|---|---|---|---|---|---|---|
| EUR | 32,526 | 37,944 | 42,700 | 47,244 | 52,159 | 58,214 | 65,843 | 77,105 | 97,680 | 213,286 |
| ÷ median | .624 | .727 | .819 | .906 | 1 | 1.116 | 1.262 | 1.478 | 1.873 | 4.089 |

**Age profile**
- Berlin, full-time annual pay by age, mean, 2025 [OFFICIAL] https://download.statistik-berlin-brandenburg.de/61d6def55d2f79bb/0c0e99b897e7/SB_N01-06-00_2025j01_BE.pdf

  | Age | ≤24 | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 | 60–64 |
  |---|---|---|---|---|---|---|---|---|---|
  | Mean pay | 42,948 | 53,984 | 64,996 | 70,364 | 70,034 | 71,894 | 71,880 | 71,913 | 67,468 |

- National hourly pay by age, 2025 (via richify.ai summary of Destatis):
  - Men: 19.62 at 25, 24.58 at 30, 27.62 at 35, 29.24 at 40, 30.65 at 45, 31.56 at 55, 32.10 at 60.
  - Women: flat at about 24–25 from age 35.

**Model choices**
- 2026 median = 54,066 × about 1.035 ≈ **56,000** [DERIVED].
- Deciles: the 2024 ratios above.
- Pareto tail: α = 2.95, from P90 → P99 (1.873 × 10^(1/α) = 4.089). P95 ≈ 2.37 [DERIVED].
- Age curve (ratio to the overall median), the hourly profile weighted by full-time shares (about 70% men) and checked against Berlin's annual means [DERIVED / ESTIMATE]:

  | Age | 22 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 63 |
  |---|---|---|---|---|---|---|---|---|---|---|
  | Ratio | 0.66 | 0.76 | 0.93 | 1.02 | 1.07 | 1.10 | 1.11 | 1.12 | 1.10 | 1.05 |

- **Comparison pool:** the model uses full-time employees only, like the UK and US modules.
  - Germany has a large part-time share (about half of employed women), so the full-time median is high relative to all workers.
  - The full-time minimum wage (13.90 × 40 × 52 ≈ 28,900) sits at about PR 3.

## 3. Taxes and transfers (2026)

### 3.1 Income tax, §32a EStG 2026 [OFFICIAL] https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026

| Taxable income (zvE) | Tax |
|---|---|
| ≤ 12,348 | 0 |
| ≤ 17,799 | (914.51 y + 1,400) y, where y = (zvE − 12,348)/10,000 |
| ≤ 69,878 | (173.10 z + 2,397) z + 1,034.87, where z = (zvE − 17,799)/10,000 |
| ≤ 277,825 | 0.42 zvE − 11,135.63 |
| above | 0.45 zvE − 19,470.38 |

**Joint filing:** tax = 2 × tax(zvE / 2). The model treats every couple as married.

**Deductions in the model**

| Deduction | Amount |
|---|---|
| Employee expenses, per earner | 1,230 |
| Special-expense lump sum | 36 (single) / 72 (joint) |
| Pension contributions | in full |
| Health insurance | × 0.96 |
| Long-term care | in full |
| Childcare costs | 80%, up to 4,800 per child under 14 |
| Single-parent relief | 4,260 + 240 per additional child |

**Children and solidarity surcharge** — 2026 values [SECONDARY] https://wundertax.de/en/tax-tips/tax-changes-2026/
- **Kindergeld vs. Kinderfreibetrag:**
  - Kindergeld is 259 a month per child (paid to age 25 in education).
  - The Kinderfreibetrag including the care/education allowance is 9,756 per child (couple).
  - The model pays Kindergeld. If the allowance saves more tax than the Kindergeld, the model uses the allowance and adds the Kindergeld back to tax (Günstigerprüfung).
- **Solidarity surcharge:** applies only when income tax exceeds 20,350 (40,700 joint). It is computed on tax after the child allowance, with an 11.9% phase-in zone.

### 3.2 Employee social insurance, 2026 [OFFICIAL] https://www.arbeitskammer.de/fileadmin/user_upload/---------------AK_Download_Datenbank-------------/Publikationen/Faltblaetter/Grenzwerte_Sozialversicherung/Sozialversicherungswerte_07_2026.pdf

| Insurance | Employee rate | Earnings ceiling (a year) |
|---|---|---|
| Pension | 9.3% | 101,400 |
| Unemployment | 1.3% | 101,400 |
| Health | 7.3% + half the average 2026 add-on of 2.9% = 8.75% | 69,750 |
| Long-term care (1 child) | 1.8% | 69,750 |

**Long-term care adjustments**
- Childless: 2.4%.
- −0.25 points for each child from the 2nd to the 5th.
- Saxony employees pay 0.5 points more.

**Notes**
- The AK leaflet still listed the 2025 average add-on of 2.5%. The model uses the official 2026 average of 2.9% [ESTIMATE that it applies].
- Non-working spouses and children are insured free under statutory health insurance, so the model has no extra premium.

**Take-home check, single, Berlin**

| Gross | Take-home |
|---|---|
| 30k | 70.7% |
| 56k | 63.4% |
| 100k | 58.0% |

This matches common gross-net calculators (for example, about 35.4k net at 56k, tax class I, no church tax).

### 3.3 Parental allowance (Elterngeld) [SECONDARY] https://www.kita.de/wissen/elterngeld-2026-was-sich-fuer-eltern-aendert-und-wie-du-das-elterngeld-optimal-beantragst/

**Rules**
- **Replacement rate:**
  - 65% of pre-birth net pay above 1,240 a month.
  - 67% between 1,000 and 1,200, tapering between 1,200 and 1,240.
  - Rising toward 100% below 1,000.
- **Limits:** minimum 300, maximum 1,800 a month.
- **Months:** 12 monthly payments for one parent; 14 if both take at least 2. Only one month can overlap.
- **Income limit:** no entitlement if household taxable income exceeds 175,000 (births from April 2025).
- **Net pay used:** gross minus a flat 21% for social insurance, minus income tax.

**Model**
- One parent takes 12 months. "Both" is modeled as 7 months each (14 in total), to avoid assuming which partner gave birth.
- Not modeled:
  - Maternity protection pay (full net pay for 8 weeks after birth, credited against Elterngeld).
  - ElterngeldPlus.

### 3.4 Child supplement (Kinderzuschlag) [OFFICIAL via SECONDARY] https://www.studierendenwerke.de/fileadmin/user_upload/Downloads/Studieren_mit_Familie/SFS-UEbersicht_gesetzliche_AEnderungen_2026.pdf

**Rules**
- Up to 297 a month per child.
- Minimum gross income: 900 (couple) / 600 (single).
- Parents' income above their own needs reduces it by 45 cents per euro.

**Model**
- Parents' needs = standard needs plus a share of housing costs:
  - Standard needs (2026): 506 per partner, 563 single. Single parents get an approximate +12% per child, up to 60%.
  - Housing share: 1/(1 + 0.2 n) for couples, 1/(1 + 0.3 n) for singles [ESTIMATE, approximating the subsistence report shares].
- Income counted = net pay minus the earnings allowance (up to 378 a month per earner).
- Asset test approximated as savings < 15,000 per person.

### 3.5 Housing allowance (Wohngeld, 2025–2026 parameters) [OFFICIAL] https://dserver.bundestag.de/brd/2024/0401-24.pdf and WoGG §12 https://gesetze.legal/bund/wogg/12

**Formula:** W = 1.15 × (M − (a + b·M + c·Y)·Y), where M is the monthly rent counted and Y the monthly income counted.

**Coefficients**

| Household size | a | b | c |
|---|---|---|---|
| 1 | 0.04 | 4.797e-4 | 4.080e-5 |
| 2 | 0.03 | 3.571e-4 | 3.040e-5 |
| 3 | 0.02 | 2.917e-4 | 2.450e-5 |
| 4 | 0.01 | 2.163e-4 | 1.760e-5 |
| 5 | 0 | 1.907e-4 | 1.720e-5 |
| 6 | −0.01 | 1.722e-4 | 1.660e-5 |

**Rent caps (gross cold rent)**

| Household size | 1 | 2 | 3 | 4 | 5 | each extra |
|---|---|---|---|---|---|---|
| Rent level III (Leipzig [ESTIMATE of level]) | 456 | 551 | 657 | 766 | 875 | +106 |
| Rent level IV (Berlin) | 511 | 619 | 737 | 858 | 982 | +119 |

**Added on top of the capped rent**

| Household size | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Heating relief | 110.40 | 142.60 | 170.20 | 197.80 | 225.40 |
| Climate component | 19.20 | 24.80 | 29.60 | 34.40 | 39.20 |

**Model rules**
- Minimum values of M and Y from Anlage 3.
- Y = (gross − 1,230) × 0.7 per earner ÷ 12. The 0.7 reflects 10% flat deductions each for tax, health and pension.
- Asset limit: 60,000 + 30,000 per extra person.
- Renters only. The homeowner version (Lastenzuschuss) is not modeled.

**Sample results**

| Household (Berlin, couple, 2 children, 75 m², one earner) | Kinderzuschlag | Wohngeld | Kindergeld |
|---|---|---|---|
| 30k | 594 a month | 722 a month | 518 a month |
| 50k | 260 | 286 | 518 |
| 65k | 0 | 0 | 518 |

## 4. Housing

### 4.1 Rent
- **Berlin** — Berlin Hyp / CBRE Wohnmarktreport 2026 [NEWS] https://www.berliner-zeitung.de/article/neue-daten-mieten-in-berlin-nach-rasantem-anstieg-stabiler-wohnungen-sind-knapp-10027092
  - Asking rents for new lets averaged **15.80 €/m²** in 2025 (+0.1%).
  - By district: Mitte 20.01, Marzahn-Hellersdorf 11.57.
  - Existing tenancies average under 9 €/m²; the official rent index 2026 median is 7.71.
  - Municipal companies re-let at about 7.50, mostly to WBS holders.
- **Leipzig** — PISA Marktbericht Miete 2026 [NEWS] https://www.l-iz.de/wirtschaft/verbraucher/2026/07/pisa-bericht-leipziger-mietmarkt-steigende-mieten-665289
  - Asking rent medians for 2025: all 10.55, re-lets 9.88, first lets 13.95.
- **Model rent per m² a month:**

  | Item | Berlin | Leipzig |
  |---|---|---|
  | Net cold rent | 14.0 [ESTIMATE] | 10.9 [DERIVED] |
  | Cold service charges | 1.9 | 1.8 |
  | Heating and hot water | 1.3 | 1.2 |

  - Berlin is between the new-let average and the cheaper municipal and index-bound re-lets.
  - Leipzig is 10.55 plus about 4% for 2026.
- **Model sizes:** 1–4 bedrooms (2–5 Zimmer) = 55 / 75 / 95 / 115 m² [ESTIMATE].
- **Example:** a 75 m² flat costs about 1,290 warm in Berlin and about 1,040 in Leipzig.

### 4.2 Purchase prices — ImmoScout24 WohnBarometer Q2 2026, asking prices per m², reference flat 80 m² [SECONDARY] https://www.immobilienscout24.de/unternehmen/fileadmin/user_upload/IS24_20260701_WBM_Q2_2026_Kauf.pdf

| City | Flat, existing | Flat, new build | House, existing | House, new build |
|---|---|---|---|---|
| Berlin | 4,954 | 6,913 | 4,871 | 6,445 |
| Leipzig | 3,054 | 5,417 | 3,895 | 4,566 |

**Model** (asking minus about 3%) [DERIVED]:

| City | Existing flat | New-build flat |
|---|---|---|
| Berlin | 4,800 | 6,900 |
| Leipzig | 2,950 | 5,300 |

### 4.3 Buying costs and running costs
- **Closing costs:**

  | City | Land transfer tax | Notary and land register | Buyer's agent share | Total, existing | Total, new build (no agent) |
  |---|---|---|---|---|---|
  | Berlin | 6.0% | about 2% | 3.57% | 11.57% | 8% |
  | Leipzig (Saxony) | 5.5% | about 2% | 3.57% | 11.07% | 7.5% |

  Transfer tax rates [OFFICIAL]; other parts [ESTIMATE].
- **Running costs:**
  - Owners' service charge (Hausgeld, including heating and the repair reserve): 4.0 €/m² a month in Berlin, 3.3 in Leipzig [ESTIMATE].
  - Property tax: about 400 / 350 a year.
  - Contents insurance: 150.

### 4.4 Mortgage — Baufi24 rate commentary, 2026-10-06 [NEWS] https://www.baufi24.de/presse/pressemitteilungen/zinskommentar-102026/
- 10-year fixed averaged **4.16%** in September 2026; early October offers were about 4.5%. The model uses 4.3%.
- **Model terms:**
  - 80% loan-to-value, so buyers bring 20% plus closing costs from savings. This is the usual advice; 100% financing is possible at higher rates.
  - 30-year annuity, with remortgaging at the same rate.
  - Payment cap about 35% of net household income, about 23% of gross [ESTIMATE].

### 4.5 KfW 300 family home loan [SECONDARY] https://nexvyra.de/fakten/kfw-300-wohneigentum-familien.html
- **Who qualifies:** families with at least one child, buying or building a new climate-friendly home (Efficiency House 40).
- **Taxable household income limit:** 90,000 with 1 child, plus 10,000 per extra child.
- **Maximum loan:**

  | Children | Standard | With QNG |
  |---|---|---|
  | 1–2 | 170,000 | 220,000 |
  | 3–4 | 200,000 | 250,000 |
  | 5+ | 220,000 | 270,000 |

- **Model:**
  - Applies to new builds when a child is already born at purchase and gross income × 0.8 is within the limit.
  - Uses the standard amounts.
  - Rate about 2% for 10 years [ESTIMATE], then the market rate.

## 5. Living costs

### 5.1 Consumption — Destatis household budget survey 2024 [NEWS] https://lebensmittelpraxis.de/handel-aktuell/49585-konsumausgaben-2024-deutsche-haushalte-geben-mehr-geld-fuer-freizeit-aus.html
- Average consumption 3,257 a month per household; housing, energy and maintenance 36.3%.
- **Adult base:**
  - 3,257 × 0.637 = 2,075 a month per household.
  - ÷ about 2.0 people [ESTIMATE] = 1,037 per person.
  - × 0.716 = 743.
  - × 2024→2026 prices (about 1.044) = **775** [DERIVED]. This is close to France's 763.
- **Child spending:** Taiwan's child-to-adult ratios × 775 → 388 / 333 / 419 / 550 / 612 [ESTIMATE].
- **Utilities:** 60 + 35 per person a month (electricity, internet, broadcasting fee; heating is in rent or service charge) [ESTIMATE].

### 5.2 City factors [ESTIMATE]
- Berlin per-person consumption about the national average (1.0).
- Leipzig about 0.9.

### 5.3 Transport
- Deutschlandticket: 63 a month nationwide, 2026 [OFFICIAL].
- Cars: used 15,000, new 32,000, premium 50,000. Running costs 2,800–3,800 a year [ESTIMATE].
- Parking: 60 a month in Berlin, 40 in Leipzig (a mix of cheap residents' permits and garages) [ESTIMATE].

## 6. Birth and childcare

### 6.1 Birth
- Covered by statutory health insurance, including midwife home visits.
- Model costs: baby gear, plus an optional postpartum doula (1,200 / 1,000) or 2 weeks of a maternity nurse (2,800 / 2,400) [ESTIMATE].

### 6.2 Childcare (Kita)

| Item, a month | Berlin | Leipzig |
|---|---|---|
| Public Kita, under 3 (9 h) | free | about 230 [ESTIMATE] |
| Public Kita, 3+ (9 h) | free | 130 [NEWS] |
| Meals and extras | about 30 | about 70 |
| Private / extras Kita | 120 | 330 |
| Bilingual Kita | 350 | 380 |

- **Berlin:** public Kita is free for all ages. Parents pay only the 23 meal contribution plus optional extras, which are capped at 90.
- **Leipzig:** the city proposes +37.86 (Krippe) and +25.88 (Kita) from 2027 (L-IZ, 2026-08) https://www.l-iz.de/politik/leipzig/2026/08/neuer-vorstoss-leipziger-elternbeitrage-steigende-betreuungskosten-angeglichen-666440
- **Au pair:** about 800 a month all-in (pocket money 280, board, insurance and course) [ESTIMATE].
- **Value of a Kita place** (only for the "fee reductions" statistic): about 1,500 a month under 3 and 1,000 at 3+ [ESTIMATE].

### 6.3 Parental leave
See §3.3. Maternity protection pay is not modeled separately.

## 7. School and university
- **School ages:**
  - Primary from 6 (4 years in most states; 6 in Berlin).
  - Secondary from 10.
  - Upper secondary 16–17.
  - Abitur after 12 years in Berlin and Saxony.
- **State schools:**

  | Cost | Berlin | Leipzig |
  |---|---|---|
  | Primary materials, a year | about 150 | about 150 |
  | Lunch, a month | free (grades 1–6) | about 70 |
  | Secondary trips and materials, a year | about 400 | about 400 |

  All [OFFICIAL / ESTIMATE].
- **After-school care (Hort):**
  - Berlin: free in grades 1–2, about 40 a month later.
  - Leipzig: about 85 a month.
  - Plus holiday camps of about 300 a year [ESTIMATE].
- **Private schools (Ersatzschulen):** income-based, about 250 a month in Berlin and 180 in Leipzig. International schools 20,000 / 14,000 a year [ESTIMATE].
- **Tutoring:** "some" 100 / 90 a month; "intensive" 280 / 250 [ESTIMATE].
- **University:**
  - No tuition. Semester fees, including the transit pass, are about 600–650 a year [ESTIMATE].
  - A student living away needs 990 a month, of which 440 is rent (Düsseldorf table 2026) [OFFICIAL]. The model adds 440 a month on top of the child's normal spending.
  - BAföG (income-based student aid) is not modeled.

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, public Kita and school; excluding extra housing):

| City | Spending | Kindergeld | Value of free or subsidized childcare |
|---|---|---|---|
| Berlin | about 114k | 56k | about 72k |
| Leipzig | about 132k (Kita fees and school lunches) | 56k | about 62k |

- **Destatis benchmark:** couples with one child spent about 763 a month on the child (EVS 2018), including about 30% housing. That is about 165k to age 18 in total, or about 115k excluding housing. The model is in line.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Berlin | PR 11 | PR 70 |
| Leipzig | PR 7 | PR 34 |

**Why renting is cheap and buying is hard**
- Renting with children is affordable on full-time wages because:
  - rents are moderate relative to the high full-time median;
  - childcare is free or cheap;
  - Kindergeld is generous;
  - low-income top-ups (Kinderzuschlag and Wohngeld) cover the parental-leave years.
- Buying is much harder: 20% down plus about 11.6% closing costs on a 95 m² flat is about 144k in cash in Berlin. Germany's low home-ownership rate (about 15% in Berlin) fits this.

## 9. Known simplifications
- National full-time wage distribution for both cities. Leipzig's local median is lower (East 46k), so Leipzig results are optimistic.
- Rent mixes new-let asking rents with cheaper re-lets. Actually finding a flat in Berlin is harder than the price suggests.
- Not modeled:
  - Bürgergeld (basic income support)
  - BAföG
  - Church tax
  - Maternity protection pay
  - Homeowner Lastenzuschuss
- The Kinderzuschlag is an approximation.
- Mortgage rates are held at 4.3% for 30 years. The KfW rate is an estimate.
