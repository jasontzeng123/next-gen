# Italy: Rome and Turin (research notes, 2026-10-12)

All amounts are EUR at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why Italy and these cities:**
- Italy's fertility is about 1.2, as low as Taiwan's, with low wages and high youth unemployment.
- Rome is the capital. Turin is a big northern city where homes cost about half as much as in Rome.

**What is different from Taiwan:**
- Income tax (IRPEF) is individual; the middle band drops from 35% to 33% in 2026.
- Low earners get a "cuneo fiscale" cash bonus.
- **Child benefits:**
  - Assegno Unico child benefit, scaled by the family means indicator (ISEE).
  - Nursery bonus (bonus nido).
- Free preschool from age 3.
- **Leave:** 5 months of maternity leave at 80% of pay (usually topped up to 100% by collective agreements), plus parental leave.
- Grandparents are a very common source of childcare.

## 1. Exchange rate
- 1 EUR = 35.768 TWD (2026-10-09, same as France and Germany).

## 2. Wages
- **ISTAT RACLI (2022, private non-farm sector)** [OFFICIAL] https://www.istat.it/wp-content/uploads/2025/02/REPORT_RACLI_2024.pdf
  - Median hourly wage 11.75; P10 8.42 (0.717 of median); P90 21.98 (1.87).
  - Under 30: 10.50 an hour; 50 and over: 12.85.
  - Annual figures are heavily affected by part-year jobs, so the model uses hourly data.
- **Model median:**
  - 11.75 × about 2,080 hours × 1.12 (2022→2026) ≈ 27,400.
  - Cross-check: the INPS full-time, full-year average is about 35k, which suggests a median near 28k for 2024.
  - The model uses **28,500** [DERIVED / ESTIMATE].
- **Deciles and age curve:** from the hourly ratios. P95 is 2.40 and the Pareto tail α is 2.6 [ESTIMATE].

## 3. Taxes and transfers (2026)

### 3.1 IRPEF (Budget Law 2026, via Money.it) [NEWS] https://www.money.it/riforma-irpef-regole-per-il-2026-come-calcolare-tasse

**Rates:** 23% up to 28k, 33% for 28–50k, 43% above.

**Employee deduction**

| Income | Deduction |
|---|---|
| ≤ 15k | 1,955 |
| 15–28k | 1,910 + 1,190 × (28k − income) / 13k |
| 28–50k | 1,910 × (50k − income) / 22k |
| > 50k | 0 |

**Cuneo fiscale measures**
- **Income ≤ 20k:** a bonus of 7.1% / 5.3% / 4.8% of employment income.
- **Income 20–32k:** an extra deduction of 1,000.
- **Income 32–40k:** the extra deduction tapers to 0.

**Social contributions:** employee INPS of about 9.49% (9.19% pension + 0.3%), plus 1% on income above 56,224 [OFFICIAL].

**Regional and municipal surcharges** [ESTIMATE]

| City | Regional rate | Municipal rate |
|---|---|---|
| Rome (Lazio) | 1.73–3.33% | 0.9% |
| Turin (Piedmont) | 1.62–3.32% | 0.8% |

**Take-home check, single, Rome**

| Gross | 20k | 28.5k | 40k | 60k | 90k |
|---|---|---|---|---|---|
| Take-home | 86% | 77.9% | 68.8% | 61.3% | 56.6% |

### 3.2 Assegno Unico 2026 (InformazioneFiscale) [NEWS] https://www.informazionefiscale.it/assegno-unico-inps-tabella-isee-2026-importo-calcolo-aumento
- **Base amount, per child per month:**
  - 203.80 when ISEE is 17,468.51 or less.
  - 58.30 at ISEE 46,582.71 or more, or with no ISEE.
  - Linear in between [ESTIMATE of the band shape].
- **Supplements:**
  - Under 1 year: +50%.
  - Second earner in the family: up to 34.9 per child [ESTIMATE].
  - 3rd and later children: 17.5–97.5 extra [ESTIMATE].
  - Aged 18–20 and studying: about half the base amount.

### 3.3 ISEE (simplified)
- **Income part:** income minus 20% (up to 3,000 per earner), minus rent (up to 7,000).
- **Assets part:** 20% of savings above 10,000.
- **Divided by the equivalence scale:** 1, 1.57, 2.04, 2.46, 2.85 for 1–5 people, +0.2 for 3+ children, +0.2 when both parents work [ESTIMATE].

### 3.4 Other measures
- **Newborn card:** 1,000 for ISEE ≤ 40k.
- **Bonus nido:** up to 3,600 a year for ISEE ≤ 40k (children born from 2024), otherwise 1,500, capped at fees paid [NEWS].

## 4. Housing
- **Immobiliare.it Insights, H1 2026** [SECONDARY] https://m.dellevittorie.it/mercato-immobiliare-h1-2026-insights/

  | Area | Asking price per m² | Asking rent per m² a month |
  |---|---|---|
  | Rome | 3,826 (+6.1%) | 18.7 |
  | Italy | 2,200 | 14.7 |
  | Turin | up 8.3% (level not reported) | — |

- **Model:**

  | | Rome | Turin |
  |---|---|---|
  | Price per m², existing | 3,500 | 1,950 |
  | Price per m², new build | 4,400 | 2,800 |
  | Rent per m² a month | 17 | 11.5 |

  - Rome prices are asking minus about 8%; Turin is [ESTIMATE].
  - Sizes: 50 / 75 / 95 / 120 m².
- **Purchase costs for a first home:**
  - Registration tax of 2% of the cadastral value (about 0.7% of the price), or 4% VAT on a new build.
  - Agency 3% + VAT; notary about 3,000.
  - The model uses 4.5% + 3,000 [ESTIMATE].
  - No IMU property tax on a first home.
- **Mortgage** (Facile.it, September 2026) [SECONDARY] https://www.facile.it/mutui/news/mutui-media-tassi-settembre-2026.html
  - Average fixed rate 3.46%; variable about 2.80%. The ECB is raising rates as inflation reached 3.8%.
  - Model: 3.5% fixed, 30 years, 80% loan-to-value.
  - Buyers under 36 with ISEE ≤ 40k can borrow 95% via the first-home guarantee fund (Fondo Prima Casa).
  - Payment at most about a third of net income.

## 5. Living costs — ISTAT 2025 (via Teleborsa) [OFFICIAL via NEWS] https://www.teleborsa.it/DettaglioNews/73_2026-10-08_TLB/Istat-spesa-media-delle-famiglie-stabile-a-2782-euro-nel-2025-cresce-lalimentare.html
- **Survey figures:** average household spending 2,782 a month, of which housing and energy is 36.0% (including imputed rent). Households average about 2.25 people [ESTIMATE].
- **Adult base:** 2,782 × 0.64 ÷ 2.25 × 0.716 × 1.03 ≈ **585** [DERIVED]. This is lower than France (763) and Germany (775).
- **Child spending:** Taiwan's ratios → 293 / 252 / 316 / 415 / 462 [ESTIMATE].
- **City factors:** Rome 1.06, Turin 1.08 [ESTIMATE].
- **Transport:** monthly transit passes are cheap (Rome 35, Turin 38). Cars cost 10k–38k, with running costs of about 2,800–3,600 a year [ESTIMATE].

## 6. Childcare, school and university
- **Public nursery (0–2):** fees are set by ISEE, up to about 560 a month in Rome (model: ISEE × 1.1% a month). Places are scarce. Private nurseries cost about 650 / 600. A nanny is about 1,300 [ESTIMATE].
- **Scuola dell'infanzia (3–5):** free; meals about 80 a month.
- **School ages:**
  - Primary 6–10.
  - Lower secondary 11–13.
  - Upper secondary 14–18 (5 years).
  - University from 19.
- **Fees:**
  - Paritarie (private) schools: 3,000–5,500 a year.
  - International schools: 13k–15k.
  - After-school programmes and summer camps: about 1,500–1,800 a year [ESTIMATE].
- **University:**
  - State universities charge nothing beyond the regional tax (about 156) when ISEE ≤ 22k [OFFICIAL threshold].
  - Above that, fees rise up to about 3,000 [ESTIMATE].
- **Leave:**
  - Maternity leave: 5 months at 80%, usually topped up to 100%.
  - Parental leave: 3 months at 80%, then 30%.
  - **Model:** one parent takes 9 months; "both" is 6 months each. The pay is taxable, so the model takes about 20% off.

## 7. Benchmarks

**Model results, one child aged 0–17** (excluding housing):
- Spending about 110k in Rome and 108k in Turin.
- Assegno Unico about 39k.
- Nursery subsidies about 32k.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Rome | PR 50 | PR 66 |
| Turin | PR 27 | PR 38 |
