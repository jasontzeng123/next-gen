# Spain: Madrid and Valencia (research notes, 2026-10-12)

All amounts are EUR at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why Spain and these cities:**
- Spain's fertility is about 1.1, as low as Taiwan's.
- Madrid has record rents and prices.
- Valencia is a large, cheaper city. Its region made 0–3 childcare free.

**What is different from Taiwan:**
- **Tax:** income tax (IRPF) is split half central, half regional. Madrid has the lowest regional rates; Valencia's are higher.
- **Child tax relief:** through "minimum" allowances, plus 1,200 a year per child under 3 for working mothers.
- **Leave:** each parent gets 19 weeks of fully paid, tax-free birth leave, and it cannot be transferred.
- **Childcare:** free 0–3 childcare (Madrid public centres; Valencia all participating centres); parents pay for meals.
- **Buying a home:** high purchase taxes — 6–10% on resale homes, 10% VAT on new builds.

## 1. Exchange rate
- 1 EUR = 35.768 TWD (2026-10-09).

## 2. Wages
- **INE annual wage structure survey 2024** [OFFICIAL] https://ine.es/dyngs/Prensa/EAES2024.htm
  - Median 24,497, mean 29,540 (+5.3%). These cover all workers, including part-time.
- **Model full-time median:** 24,497 × about 1.15 (full-time premium) × 1.045 (to 2026) ≈ **29,500** [DERIVED / ESTIMATE].
- **Deciles:** the 2026 minimum wage (1,221 × 14 ≈ 17,100) is about 0.58 of the median. The model uses P10 0.62, P25 0.74, P75 1.36, P90 1.85, P95 2.35, α 2.6 [ESTIMATE].
- **Age curve:** [ESTIMATE].

## 3. Taxes and transfers

**State scale, 2026** (GuiaFiscal) [OFFICIAL via SECONDARY] https://guiafiscal.es/irpf/tramos-irpf-2026/

| Taxable base | Rate |
|---|---|
| up to 12,450 | 9.5% |
| 12,450–20,200 | 12% |
| 20,200–35,200 | 15% |
| 35,200–60,000 | 18.5% |
| 60,000–300,000 | 22.5% |
| above 300,000 | 24.5% |

**Regional scales** [ESTIMATE, 2025 values]
- Madrid: 8.5% / 10.7% / 12.8% / 17.4% / 20.5%.
- Valencia: from 9% up to 29.5% at the top. Combined top rates are 45% in Madrid and 53.9% in Valencia, per GuiaFiscal.

**Allowances and reductions**
- **Minimum allowances:** personal 5,550. Per child: 2,400 / 2,700 / 4,000 / 4,500, plus 2,800 for each child under 3, split between the parents [OFFICIAL].
- **How the tax is computed:** tax = scale(base) − scale(minimum allowance), at both the state and regional level.
- **Work-income reduction:**
  - First, 2,000 of general expenses are deducted.
  - The reduction is 7,302 when net work income is ≤ 14,852.
  - It tapers to 0 at 19,747 [OFFICIAL formula, 2025].

**Social security:** the employee pays about 6.5% (including the MEI intergenerational contribution), up to a base of about 61,200 a year [ESTIMATE, 2026].

**Credits**
- 1,200 per child under 3 for working mothers, plus up to 1,000 for childcare costs (refundable).
- 1,200 for large families (3+ children).
- Regional birth credits: Madrid 721.70, Valencia 300, for the first 3 years [ESTIMATE].

**Take-home check, single, Madrid**

| Gross | Take-home |
|---|---|
| 29.5k | 78.2% |
| 60k | 70.2% |
| 90k | 66.2% |

**Not modeled:**
- Ingreso Mínimo Vital (minimum income) and its child supplement
- Joint filing

## 4. Housing
- **Rents:**
  - Madrid asking rent: 23.7 per m² in Q2 2026, +7.6% (idealista via El Diario) [NEWS] https://www.esdiario.com/economia/260701/192073/alquiler-espana-sigue-marcando-maximos-cierra-trimestre-subida-interanual-4-2.html
  - Model: Madrid 21 per m², Valencia 14 [ESTIMATE].
- **Prices:**
  - Madrid asking price: 6,458 per m² in September 2026, +2.4% (idealista) [SECONDARY] https://www.idealista.com/news/node/904703
  - Model: Madrid 5,800 existing / 7,000 new; Valencia 2,900 / 3,600 [DERIVED / ESTIMATE].
- **Purchase taxes:**
  - Resale homes: transfer tax (ITP) of 6% in Madrid, 10% in Valencia.
  - New builds: 10% VAT plus stamp duty (AJD) of 0.75% / 1.5%.
  - Plus about 2,000 for notary, registry and agency fees.
- **Mortgage:**
  - Fixed rate about 3.2% (the ECB is raising rates) [ESTIMATE]; 80% loan-to-value, 30 years.
  - Buyers under 35 can borrow 95% with the ICO state guarantee when their income is ≤ 37,800.
  - Repayments are limited to about 35% of net income.

## 5. Living costs — INE household budget survey 2025 [OFFICIAL] https://ine.es/dyngs/Prensa/EPF2025.pdf
- **Survey figures:** spending is 35,101 per household and 14,066 per person a year. Housing and utilities (including imputed rent) take 33.2%.
- **Adult base:** 14,066 × 0.668 ÷ 12 × 0.716 × 1.03 ≈ **578** [DERIVED].
- **City factors:** Madrid 1.12, Valencia 0.97 [ESTIMATE].

## 6. Childcare, school and university
- **Free 0–3 childcare:**
  - Madrid: public centres are free for the 7th consecutive year (Comunidad de Madrid) [OFFICIAL] https://www.comunidad.madrid/press-releases/download/110248
  - Valencia: free for all ages 0–3 regardless of income (from 2024-25) [NEWS] https://valencianews.es/politica/beatriz-gasco-mas-de-42-000-plazas-garantizan-la-gratuidad-de-la-educacion-de-0-a-3-anos-en-la-comunitat/
  - Parents pay meals of about 100–110 a month.
- **Other childcare options:** private centres cost about 500 / 400 a month; a nanny about 1,350 / 1,250 [ESTIMATE].
- **School ages:**
  - Infant education 3–5, free.
  - Primary 6–11.
  - Lower secondary (ESO) 12–15.
  - Upper secondary (Bachillerato) 16–17.
  - University from 18.
- **School costs:**
  - Concertada (state-funded private) schools: voluntary fees of about 150 a month.
  - Private schools: about 8,000; international: 10k–12k.
  - Lunch and after-school activities: about 1,700–2,000 a year [ESTIMATE].
- **Public university:** about 1,300 a year in Madrid and 400 in Valencia [ESTIMATE].

## 7. Benchmarks

**One child aged 0–17** (excluding housing): about 108k in Madrid, 104k in Valencia.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Madrid | PR 61 | PR 95 |
| Valencia | PR 43 | PR 56 |
