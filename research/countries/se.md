# Sweden: Stockholm and Gothenburg (research notes, 2026-10-12)

All amounts are SEK at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why these two cities:**
- **Stockholm:**
  - Capital.
  - Regulated first-hand rents with years-long queues and expensive second-hand rentals.
  - Tenant-owned flats (bostadsrätt) at about 92,000 SEK/m² in the city.
- **Gothenburg:**
  - Second city.
  - Cheaper flats.
  - Higher municipal tax.

**What is different from Taiwan:**
- **Taxes:** individual taxation; flat municipal tax of about 30–33% after a basic deduction, and a large earned-income tax credit (jobbskatteavdrag).
- **Child benefits:**
  - Child benefit (barnbidrag) of 1,250 a month per child, with a large-family supplement.
  - 480 days of parental benefit per child, 390 of them at about 80% of pay.
- **Childcare and education:**
  - Childcare fees are capped at 3% of household income.
  - Free schools (including independent "friskolor") with free lunches.
  - Free university, where students get their own state grants and loans (CSN).
- **Home buying:** only 10% down, but mandatory amortization of 1–2% a year. Mortgage interest gets a 30% tax credit.

## 1. Exchange rate
- 1 SEK = 3.1868 TWD (close, 2026-10-12) [SECONDARY] https://www.poundsterlinglive.com/data/currencies/sek-pairs/SEKTWD-exchange-rate
- PPP factor in the model: about 1.59 TWD per SEK (Sweden about 8.6 SEK per international dollar, Taiwan about 13.65 TWD) [ESTIMATE]. The model does not use PPP for the threshold.

## 2. Wages
Source: SCB wage structure statistics 2025. Monthly salary converted to full time, all sectors, including part-timers at their full-time rate.

**Median** [OFFICIAL via Ekonomifakta] https://www.ekonomifakta.se/sakomraden/arbetsmarknad/loner/median-och-genomsnittslon_1210924.html
- Median: 38,300 a month. Mean: 42,900.

**Percentiles by sex, 2025** [OFFICIAL] https://www.scb.se/hitta-statistik/statistik-efter-amne/arbetsmarknad/loner-och-arbetskostnader/lonestrukturstatistik-hela-ekonomin/pong/tabell-och-diagram/lonespridning-efter-sektor-och-kon-2024/

| Percentile | Women | Men | Combined (model) | Ratio to median |
|---|---|---|---|---|
| P10 | 27,400 | 28,800 | about 28,000 | 0.731 |
| P25 | 31,000 | 33,200 | about 32,000 | 0.836 |
| P50 | 36,800 | 39,900 | 38,300 | 1 |
| P75 | 45,500 | 50,600 | about 48,000 | 1.253 |
| P90 | 57,000 | 66,100 | about 61,500 | 1.606 |

**Average monthly salary by age** (Medlingsinstitutet via Göteborgs-Posten / Dagens PS, 2026) [NEWS]

| Age | 18–24 | 25–34 | 35–44 | 45–54 | 55–64 |
|---|---|---|---|---|---|
| Average salary | 29,800 | 37,500 | 43,000 | 46,300 | 44,700 |

**Model choices**
- **Annual median:** 38,300 × 12.15 (holiday supplement) × about 1.033 for 2026 = **480,000** [DERIVED].
- **Other percentiles:** log-interpolated (P20 0.80, P30 0.865, P40 0.935, P60 1.075, P70 1.18, P80 1.34). P95 is 1.95 and the Pareto tail α is 2.8 [ESTIMATE]. Sweden's distribution is the most compressed of all the countries.
- **Age curve:**
  - Each age group's average is converted to a median using a mean/median gap of about 1.05 for the young and 1.14 for older workers.
  - Resulting ratios: 21: 0.74, 29.5: 0.906, 39.5: 1.0, 49.5: 1.06, 59.5: 1.02 [DERIVED / ESTIMATE].
- **Comparison pool:** full-time-equivalent salaries, as in France. Part-time workers are counted at their full-time rate, not their actual pay.

## 3. Taxes and transfers (2026)

### 3.1 Income tax
Sources: Skatteverket SKV 433 (2026) [OFFICIAL] https://skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf and Belopp och procent 2026 https://www.skatteverket.se/privat/skatter/beloppochprocent/2026

**Base amounts:** price base amount (PBB) 59,200; state tax threshold 643,000 taxable (breakpoint 660,400 gross).

**Basic deduction (under 66), by income (FFI):**

| FFI | Deduction |
|---|---|
| ≤ 0.99 PBB | 0.423 PBB |
| ≤ 2.72 PBB | 0.423 PBB + 20% of the part above 0.99 PBB |
| ≤ 3.11 PBB | 0.77 PBB |
| ≤ 7.88 PBB | 0.77 PBB − 10% of the part above 3.11 PBB |
| above | 0.293 PBB |

The deduction is rounded up to the nearest 100.

**Earned-income tax credit (jobbskatteavdrag, under 66):** the credit is (base − basic deduction) × municipal rate, where the base depends on earned income (AI):

| AI | Base |
|---|---|
| ≤ 0.91 PBB | AI |
| ≤ 3.24 PBB | 0.91 PBB + 0.3874 × (AI − 0.91 PBB) |
| ≤ 8.08 PBB | 1.813 PBB + 0.251 × (AI − 3.24 PBB) |
| above | 3.027 PBB |

- Ekonomifakta's 2026 example: 4,366 a month at a salary of 44,600 and a 32.38% municipal rate. The model formula reproduces this.

**Other items**
- **Tax reduction for earned income:** 0.75% of taxable income above 40,000, up to 1,500.
- **General pension contribution:** 7% of income up to 673,038, refunded in full as a tax credit. The model shows it as social insurance; it is a real extra payment only when income tax is too small to absorb it.
- **Public service fee:** 1% of taxable income, up to 1,184.
- **Municipal tax 2026** (municipality + region) [OFFICIAL] https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/
  - Stockholm 30.55%; Göteborg 32.60%; national average 32.38%.
- **Mortgage interest:** a tax credit of 30% of interest up to 100,000, then 21%.

**Take-home check, single, Stockholm**

| Gross | Take-home |
|---|---|
| 300k | 83.3% |
| 480k | 80.9% |
| 600k | 78.6% |
| 800k | 72.8% |
| 1.1m | 66.5% |

The employer pays a further 31.42% payroll tax, which is not part of gross pay.

### 3.2 Child benefits — Försäkringskassan, current amounts [OFFICIAL] https://www.forsakringskassan.se/privatperson/e-tjanster-blanketter-och-informationsmaterial/aktuella-belopp
- **Child benefit:** 1,250 a month per child up to 15. From 16, the study allowance pays 1,250 a month for 10 months a year while the child is in upper secondary school.
- **Large-family supplement, a month:**

  | Children | 2 | 3 | 4 | 5 |
  |---|---|---|---|---|
  | Supplement | 150 | 730 | 1,740 | 2,990 |

  Each child after the fifth adds 1,250.

### 3.3 Parental benefit (föräldrapenning)
- **Entitlement:** 480 days per child, of which 390 are at the sickness-benefit level.
  - Daily rate: income up to 10 PBB (592,000) × 0.97 × 0.8 ÷ 365, at most **1,259 a day**.
  - The remaining 90 days pay 180 a day.
  - 90 days are reserved for each parent.
- **Model:**
  - One parent alone takes 11 months: 300 days at the sickness-benefit level plus 30 days at 180.
  - "Both" is 7 months each, with 195 sickness-level days each.
  - Most collective agreements add 10% of pay for up to 6 months; the model includes this [ESTIMATE].
  - The benefit is taxable; the model takes about 25% tax.

### 3.4 Not modeled
- Housing allowance (bostadsbidrag) for low-income families with children. The rules could not be confirmed from an official source.
- Maintenance support and income support (försörjningsstöd).

## 4. Housing

### 4.1 Rent (rents include heating and water)
- **Stockholm city 2025, first-hand average** [OFFICIAL] https://start.stockholm/globalassets/start/om-stockholms-stad/utredningar-statistik-och-fakta/statistik/bostader/hyror/hyror_2025.pdf

  | Segment | SEK per m² a year |
  |---|---|
  | All flats | 1,734 |
  | 2 rooms | 1,795 |
  | 3 rooms | 1,652 |
  | 4+ rooms | 1,580 |
  | Built 2021 or later | 2,568 |
  | Built 2011–2020 | 2,312 |

- **Median for a 3-room flat in Stockholm, 2025** (Fastighetstidningen, January 2026) [NEWS] https://fastighetstidningen.se/nyhet/gapet-mellan-andrahands-och-forstahandshyror-minskar/
  - First-hand 9,622 a month (SCB); second-hand 18,000 (Qasa).
- **SCB 2026 averages, 3 rooms:** Greater Stockholm 10,600; Greater Gothenburg 9,346 [OFFICIAL] https://www.scb.se/hitta-statistik/statistik-efter-amne/boende-bebyggelse-och-mark/bostader-och-boende/hyror-i-bostadslagenheter/pong/statistiknyhet/hyror-i-bostadslagenheter-2026/
- **Model:**
  - A young family without queue time can realistically get a new-build first-hand flat or a second-hand let.
  - Stockholm is set at **2,400 per m² a year**: about 15,000 a month for a 75 m² 3-room flat [DERIVED / ESTIMATE].
  - Gothenburg is **1,950**: about 12,200 [ESTIMATE].
  - Sizes for 1–4 bedrooms (2–5 rooms): 55 / 75 / 95 / 115 m².

### 4.2 Tenant-owned flats (bostadsrätt) — Svensk Mäklarstatistik, July–September 2026 [SECONDARY via Boio] https://boio.se/priser/stockholm-2026

| Area | SEK per m² |
|---|---|
| Stockholm municipality | 92,000 |
| Inner city | 121,900 |
| Hägersten-Liljeholmen | 80,300 |
| Enskede-Skarpnäck | 66,500 |
| Bromma | 64,700 |
| Farsta-Vantör | 46,500 |
| Greater Gothenburg (September 2024; Börsvärlden) | 47,122 |

- **Model prices, per m²** [ESTIMATE]:

  | City | Existing | New build |
  |---|---|---|
  | Stockholm | 75,000 (family-oriented areas) | 85,000 |
  | Gothenburg | 50,000 | 60,000 |

- **Monthly association fee** (avgift, including heating, water and the building's costs): 55 SEK/m² in Stockholm, 58 in Gothenburg [ESTIMATE]. There is no property tax for the owner.
- **Closing costs:** no stamp duty on bostadsrätt. Pledge fee and bank charges come to about 0.3%.

### 4.3 Mortgage rules — lag 2026:226 (Boio summary) [SECONDARY] https://boio.se/guide/bolan-regler-2026-90-procent
- **Loan cap:** 90% of value since 1 April 2026.
- **Amortization:** 2% a year above 70% loan-to-value, 1% above 50%.
- **Debt-to-income:** banks usually cap lending at about 5.5× gross household income [ESTIMATE].

### 4.4 Rates — Nordea average rates, September 2026 [SECONDARY] https://www.nordea.se/privat/produkter/bolan/snittrantor.html

| Fixed period | Rate |
|---|---|
| 3 months | 2.75% |
| 1 year | 3.38% |
| 3 years | 3.67% |
| 5 years | 3.85% |

- **Model:**
  - Rate 3.0%.
  - A 35-year annuity approximates amortizing 2%, then 1%, of the original loan.
  - Down payment 10%.

## 5. Living costs

### 5.1 Adult base
- SCB's household budget survey (HUT 2021) publishes only spending shares: housing including utilities is 22.3% of the total. Kronor totals were not retrievable (the SCB API is blocked here).
- **Estimate:**
  - National-accounts household consumption is about 271,000 per person.
  - × 0.742, the survey-to-national-accounts ratio observed for Germany.
  - × (1 − 0.223) ÷ 12 × 0.716 × 1.04 ≈ **9,500 a month** [ESTIMATE].
  - This is about 850 EUR, higher than Germany (775) and France (763), consistent with Sweden's higher price level.
- **Child spending:** Taiwan's child-to-adult ratios × 9,500 → 4,750 / 4,085 / 5,130 / 6,745 / 7,505 [ESTIMATE].
- **Utilities:** 900 + 250 per person a month (electricity, broadband, phones, home insurance) [ESTIMATE].
- **City factors:** Stockholm 1.08, Gothenburg 1.0 [ESTIMATE].

### 5.2 Transport
- Stockholm (SL) 30-day ticket about 1,080 [ESTIMATE].
- Västtrafik 30-day zone A ticket for Gothenburg residents: 750 from June 2026 (890 full price) [OFFICIAL] https://via.tt.se/pressmeddelande/4344231/nu-ar-vasttrafiks-periodbiljetter-billigare-for-goteborgare?lang=sv
- Cars: used 150,000, new 350,000, premium 550,000. Running costs 30,000–40,000 a year [ESTIMATE].

## 6. Birth and childcare
- **Birth and postnatal care:** free (region-provided).
- **Childcare fee cap (maxtaxa), from 1 July 2026** [OFFICIAL, municipal notice] https://www.falkoping.se/download/18.7bdef21a19ac5f61f0122ef/1766138745363/Avgift%20f%C3%B6r%20f%C3%B6rskola%20och%20fritidshem%20%20-%20maxtaxa%20f%C3%B6r%20%C3%A5r%202026.pdf
  - Fee base: household gross income above a 10,000 allowance, capped at 51,560 a month.
  - Fee rates and caps, a month:

    | Child (youngest = 1st) | Preschool rate | Preschool max | After-school club rate | After-school club max |
    |---|---|---|---|---|
    | 1st | 3% | 1,547 | 2% | 1,031 |
    | 2nd | 2% | 1,031 | 1% | 516 |
    | 3rd | 1% | 516 | 1% | 516 |
    | 4th | free | free | — | — |

- **Age 3–5:** 525 free hours a year; the model takes 70% of the fee [ESTIMATE].
- **Private preschools:** charge the same maxtaxa.
- **Value of a place** (only for the "fee reductions" statistic): about 14,000 a month [ESTIMATE].
- **Au pair:** about 9,000 a month all-in [ESTIMATE].

## 7. School and university
- **School ages:**
  - Preschool class at 6.
  - Compulsory school from 7.
  - Lower secondary (högstadiet) at 13.
  - Upper secondary 16–18.
  - Model bands: care 0–2, preschool 3–5, primary 6–12, lower secondary 13–15, upper secondary 16–18, university from 19.
- **Fees:**
  - Public and independent schools are free, with free lunches. The model counts only incidentals of 500 / 1,500 a year.
  - Fee-paying international schools: about 150,000 / 120,000 a year [ESTIMATE].
- **After-school club (fritids):** maxtaxa for ages 6–9.
- **Activities and tutoring:** 350 / 300 a month per activity; tutoring "some" 600 / 550, "intensive" 2,000 / 1,800 [ESTIMATE].
- **University:**
  - No tuition. Students live on CSN: a grant of about 3,900 a month plus a loan, for about 9.5 months.
  - The model credits the grant (about 37,000 a year) to the family while the child is supported, and parents pay no student rent.

## 8. Benchmarks

**Model results, one child aged 0–17** (normal lifestyle, public preschool and school; excluding extra housing):

| City | Spending | Child benefits | Fee reductions |
|---|---|---|---|
| Stockholm | about 1.36m (about 121k EUR) | 265k | about 777k |
| Gothenburg | about 1.36m | — | — |

- Swedish bank estimates are about 1–2 million SEK to 18 including housing, so the model is in range [ESTIMATE].

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Stockholm | PR 22 | PR 60 |
| Gothenburg | PR 13 | PR 38 |

## 9. Known simplifications
- The national wage distribution is used for both cities.
- The rent level assumes no queue time. A family with long queue time would pay about 9,600 for a 3-room flat in Stockholm.
- Not modeled:
  - Housing allowance
  - Income support
  - The cost of a car-free life in the suburbs
- The adult spending base is estimated, not taken from a published kronor figure.
