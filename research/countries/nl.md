# Netherlands: Amsterdam and Rotterdam (research notes, 2026-10-12)

All amounts are EUR at 2026 levels. Labels: OFFICIAL / NEWS / SECONDARY / DERIVED / ESTIMATE.

**Why the Netherlands and these cities:**
- Fertility is about 1.4.
- Amsterdam has one of Europe's tightest housing markets.
- Rotterdam is the second city and much cheaper.

**What is different from Taiwan:**
- **Tax:** individual taxation. The box 1 rates already include national insurance premiums. Tax credits (general, work, and a parent credit for children under 12) cut the bill a lot at low and middle incomes.
- **Health:** every adult pays a health insurance premium. Children are free. Low incomes get a health allowance.
- **Child benefits:** a quarterly child benefit plus an income-tested child budget.
- **Childcare:** expensive, but working parents receive a childcare allowance covering 36–96% of a capped hourly rate.
- **School:** starts at age 4, so there is no separate preschool stage.
- **Buying a home:** you can borrow up to 100% of the price, and mortgage interest is tax-deductible. Starters under 35 pay no transfer tax below €555,000.
- **Renting:** the rent allowance no longer has a hard rent ceiling from 2026. Rent above the limit simply isn't counted.

## 1. Exchange rate
- 1 EUR = 35.768 TWD (2026-10-09), the same rate as the other euro countries.

## 2. Wages
- **CPB modal income 2026:** €48,000 gross, including the 8% holiday allowance (Raisin, citing CPB) [NEWS] https://www.raisin.com/nl-nl/economie/modaal-inkomen/
- **Model full-time median:** about **€50,000**, adding typical 13th-month and bonus payments [ESTIMATE].
- **Minimum wage 2026:** €14.71 an hour [SECONDARY] https://arlettipartners.com/new-increase-in-the-dutch-minimum-hourly-wage-from-january-1st-2026/
  - Full-time with holiday pay: 14.71 × 2,080 × 1.08 ≈ €33,000, about 0.66 of the median [DERIVED].
- **Distribution:** compressed compared with the US or UK. The model uses P10 0.68, P25 0.80, P75 1.28, P90 1.70, P95 2.05, α 3.0 [ESTIMATE].

## 3. Taxes and transfers

**Box 1 rates, 2026 (below state pension age)** (Belastingdienst) [OFFICIAL] https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen

| Taxable income | Rate |
|---|---|
| up to 38,883 | 35.75% |
| 38,883–78,426 | 37.56% |
| above 78,426 | 49.50% |

**Tax credits, 2026** [OFFICIAL, same source]
- **General credit (algemene heffingskorting):** 3,115 up to 29,736. It falls by 6.398% of income above that and reaches 0 at 78,426.
- **Work credit (arbeidskorting):** 8.324% of work income up to 11,965.
  - 996 + 31.009% up to 25,845.
  - 5,300 + 1.95% up to 45,592 (maximum 5,685).
  - Then −6.51% per euro, reaching 0 at 132,920.
- **Parent credit (inkomensafhankelijke combinatiekorting):** for the lower-earning partner, or a single parent, with a child under 12. It is 11.45% of work income above 6,239, up to 3,032.
- Credits are not refundable in the model.

**Pension:** occupational pension, employee share about 7.5% of salary above a €18,000 franchise, deducted before tax [ESTIMATE].

**Health insurance**
- **Premium:** the average basic premium is about €159 a month per adult [SECONDARY]. The model adds about €250 a year of deductible (eigen risico €385).
- **Health allowance (zorgtoeslag):** up to 2,952 a year for couples and 1,548 for singles.
  - It reaches zero at a household income of 51,142 (couples) or 40,857 (singles).
  - The model uses a linear taper of 0.137 per euro above about 29,600 [SECONDARY / DERIVED]. https://www.overstappen.nl/zorgverzekering/zorgtoeslag/

**Child benefit (kinderbijslag)** [SECONDARY] https://rekenmachinepro.nl/blog/kinderbijslag-2026-complete-gids/
- Per quarter from July 2026: 298.40 (ages 0–5), 362.35 (6–11), 426.29 (12–17).

**Child budget (kindgebonden budget), 2026** [SECONDARY] https://bieb.knab.nl/inkomsten-uitgaven/alles-over-het-kindgebonden-budget-dit-jaar
- 2,580 per child a year, plus 724 for ages 12–15 and 964 for ages 16–17.
- Single parents get about 3,416 more (5,996 − 2,580).
- The amount falls by 7.6% of income above 39,141 (couples) or 29,736 (singles).
- Asset limits: 184,633 (couples) and 146,011 (singles).

**Childcare allowance (kinderopvangtoeslag), 2026** [OFFICIAL] https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026
- **Capped hourly rates:** daycare 11.23, after-school care (BSO) 9.98. At most 230 hours a month.
- **Share reimbursed:**

| Household income | First child | Other children |
|---|---|---|
| up to about 56,000 | 96% | 96% |
| about 60,000 | 93.9% | 95.6% |
| about 90,000 | 78.9% | 92.2% |
| about 120,000 | 60.6% | 87.9% |
| about 150,000 | 46.5% | 84.4% |
| top | 36.5% (from 165,658) | 68.2% (from 235,698) |

- The model interpolates linearly between these points.
- Both parents must work.

**Leave**
- **Maximum daily wage for benefits:** €304.25 in 2026 [SECONDARY] https://www.bruto-netto.nl/ouderschapsverlof-berekenen/
- **Mother:** 16 weeks at full pay, capped.
- **Partner:** 1 week at full pay, plus 5 weeks at 70%.
- **Each parent:** 9 weeks of paid parental leave at 70% in the first year. The remaining 17 weeks are unpaid.
- **How the model counts it:**
  - One parent on leave: 6 months, of which 16 weeks at full pay and 9 weeks at 70%.
  - Both parents: about 4 months each.
  - Leave pay is taxed, so the model counts 80% of it.

**Not modelled:**
- Supplementary student grants for low-income parents
- Municipal poverty schemes
- Early-education subsidies for toddlers (VVE)

## 4. Housing

**Rents**
- Free-sector rents in Q2 2026 (NVM and VGM NL) [NEWS] https://www.nvm.nl/media/2hsi0enf/20260730-analyse-nvm-vgmnl-huurontwikkelingen-q2-2026-def.pdf
  - Amsterdam: €25.70 per m². Rotterdam: €19.67 per m². National: €19.32 per m².
- The model uses 24.5 (Amsterdam) and 18.8 (Rotterdam) per m² [ESTIMATE]. These sit slightly below the free-sector averages because some new contracts fall under mid-rent regulation (the Affordable Rent Act).
- Service charges of 50–60 a month are added. Energy is counted separately.
- Social housing in Amsterdam has waiting lists of 10+ years, so the model uses market rents.

**Rent allowance (huurtoeslag), 2026** [SECONDARY] https://www.bruto-netto.nl/huurtoeslag-2026/
- Rent is counted up to 932.93 a month. From 2026, rent above that no longer disqualifies a household.
- **Income taper:** 0.22 per euro of household income above 31,500 (multi-person households) or 0.27 above 23,425 (singles).
- **Asset limit:** 76,958 for couples, 38,479 for singles.
- **Rent bands:** the model counts 100% of rent from about 225 to 477.20, 65% up to 731.93 (3+ people) or 682.96, and 40% above that [ESTIMATE: band values from earlier years].

**Prices**
- **Amsterdam:** NVM Q2 2026 median transaction price per m² 8,570 (apartments 8,799); median sale price 588,000 [SECONDARY] https://a.storyblok.com/f/311458/x/e0354d5d23/marktoverzicht-gemeente-amsterdam-2e-kwartaal-2026.pdf
  - Model: 8,400 existing, 9,200 new [ESTIMATE].
- **Rotterdam:** asking price per m² 4,984 (October 2026) [SECONDARY] https://huispedia.nl/rotterdam
  - Homes usually sell above asking, so the model uses 5,100 existing and 5,900 new [ESTIMATE].
- **National:** median transaction price 506,000, or 4,798 per m² (NVM Q2 2026).

**Buying costs**
- **Transfer tax:** 2% on resale homes.
  - Buyers aged 18–35 pay 0% when the price is ≤ €555,000; each partner counts for half.
  - New builds include VAT and pay no transfer tax.
- **Other costs:** notary, valuation and mortgage advice of about €6,000 [ESTIMATE].
- **NHG guarantee fee:** 0.4% of the loan when the price is ≤ €470,000 (Van Bruggen) [NEWS] https://www.vanbruggen.nl/actueel/nieuws/2026/wijzigingen-hypotheek-en-woningbezit-per-1-januari-2026

**Mortgage**
- **Loan size:**
  - Up to 100% of the value; buyers pay costs themselves.
  - The borrowing limit follows the Nibud income tables. The model caps yearly repayments at 20–30% of gross household income, rising with income. Example: 26.4% at €85,000, which matches the source example of a €397,643 loan at 3.8% [DERIVED].
- **Rate:** about 3.8% for 10-year fixed in 2026 (source example). NHG loans are about 0.3% cheaper [ESTIMATE].
- **Mortgage interest deduction:**
  - Deductible at up to 37.56%.
  - The imputed rental value (0.35% of the home's value) is added to income.
  - If the imputed value exceeds interest, 71.82% of the excess is deductible in 2026 (Hillen act).
- **Ongoing costs:**
  - Apartment owners' association: about 2.3–2.6 per m² a month.
  - Property tax: 0.05% (Amsterdam), 0.11% (Rotterdam).
  - Municipal waste and water board taxes: about 520–550 a year [ESTIMATE].
- **Amsterdam ground lease (erfpacht)** is common but not modelled.

## 5. Living costs — CBS household spending [OFFICIAL] https://www.cbs.nl/nl-nl/cijfers/detail/83676NED
- **Survey figures (2020, latest):** €35,211 per household a year. Housing, water and energy take 32.9%.
- **Adult base:** 35,211 × 0.671 ÷ 2.12 people ÷ 12 ≈ 929 a month. × 1.28 for prices 2020→2026, × 0.716 ≈ **850** [DERIVED / ESTIMATE].
  - 2020 was a pandemic year with depressed spending, so this may be slightly low.
- **City factors:** Amsterdam 1.10, Rotterdam 0.98 [ESTIMATE].
- **Health premiums** are counted under social insurance, not living costs.

## 6. Childcare, school and university

**Ages 0–3: daycare (kinderdagverblijf)**
- Actual hourly rates in big cities are €12–14 (rekenmachinepro) [SECONDARY]. The model uses Amsterdam 12.6 and Rotterdam 11.9 [ESTIMATE].
- About 200 hours a month (about 4.5 days a week).
- The allowance pays its share of min(rate, 11.23).
- The "private" option is a premium centre at 14.5 / 13.5.
- An au pair costs about 900 a month.

**Ages 4–11: primary school**
- Free; parents' voluntary contributions and trips come to about 150 a year.
- After-school care (BSO) about 70 hours a month including holidays, at 11.0 / 10.3 an hour, with the allowance at the 9.98 cap [ESTIMATE].

**Ages 12–17: secondary school**
- About 450 a year (contributions, laptop share).
- Fee-paying private schools are rare (about 14,000–15,000).
- International schools cost about 18,000–22,000. Subsidised international schools charge less.

**University (from 18)**
- Statutory tuition 2026–27: €2,694 (Erasmus University) [OFFICIAL via university] https://www.eur.nl/onderwijs/praktische-zaken/inschrijving/collegegeld/collegegeldtarieven-2026-2027
- Basic student grant 2026: €324.52 a month living away from home, €130.21 living at home (Brys) [SECONDARY] https://www.brys.nl/blog/hoeveel-studiefinanciering-krijg-je-in-2026/
- A student room costs about 650 a month [ESTIMATE].

**Transport:** the "scooter" option becomes an e-bike (about 2,500, 7 years).

## 7. Benchmarks

**One child aged 0–17** (excluding housing)
- Spending: about 179k in Amsterdam and 167k in Rotterdam.
- Cash benefits: about 26k.
- Childcare allowances: about 122k more, already netted off fees.

**Thresholds (two children, Taipei 48)**

| City | Rent | Buy existing |
|---|---|---|
| Amsterdam | PR 33 | PR 78 |
| Rotterdam | PR 9 | PR 33 |

**Why the rent thresholds are low:**
- For a dual-earner family on modest pay, the childcare allowance covers most daycare and after-school costs.
- Both partners also get a large work credit, plus the child budget and the rent allowance.
- Germany (Berlin 11, Leipzig 7) and Sweden show the same pattern.
- Buying in Amsterdam is far harder: a 95 m² flat costs about €800,000, and borrowing is capped by income.
