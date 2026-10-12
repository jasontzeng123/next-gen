/* =========================================================================
   澳洲模組（雪梨、墨爾本）。金額為澳幣、2026 年水準。
   來源與可信度見 research/countries/au.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人分開課稅＋2% 健保稅、家庭稅務補助（FTB，依家庭所得遞減）、托育補助（家庭所得 8.9 萬以下補 9 成）、
   26 週育兒假給付（最低工資水準）、首購 5% 頭期款擔保、印花稅首購減免、2026 年升息後房貸利率約 6.25%。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 22.30;    // 1 澳幣 = 22.30 台幣（2026-10-09 收盤）§1［SECONDARY］
  var RATE = 0.0625; // 澳洲央行 2026-09-29 升息到 4.6%，自住浮動房貸平均約 6.25%［NEWS／ESTIMATE］§4.4

  // ---------- 制度參數（2026–27）§3 ----------
  var BR = [[18200, 0], [45000, 0.15], [135000, 0.30], [190000, 0.37], [Infinity, 0.45]]; // ［NEWS：15% 級距 2026-07 起］
  var CCS = { full: 88520, zero: 538520, capDay: 15.19, capSchool: 13.30, second: 372000 }; // 托育補助［NEWS］
  var FTB = { a12: 6139.30, a13: 7989.85, base: 1971, supp: 970.90, free: 69131, hi: 123078, b5: 5223.15, b18: 3646.35, bSupp: 478.15, bPrimary: 120000, bFree: 7100 }; // ［SECONDARY］
  var PPL_WEEK = 1004.70; // 育兒假給付每週（26 週，伴侶保留 4 週）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的所得稅＋健保稅（2%，低收入逐步加課）＋低收入抵減
  function person(g) {
    if (!(g > 0)) return 0;
    var t = tax(g, BR);
    var lito = g <= 37500 ? 700 : g <= 45000 ? 700 - 0.05 * (g - 37500) : Math.max(0, 325 - 0.015 * (g - 45000));
    var ml = g <= 27222 ? 0 : Math.min(0.02 * g, 0.1 * (g - 27222));
    return Math.max(0, t - lito) + ml;
  }
  function ccsRate(inc, younger) {
    var r = inc <= CCS.full ? 0.9 : Math.max(0, 0.9 - Math.ceil((inc - CCS.full) / 5000) * 0.01);
    if (younger && inc < CCS.second) r = Math.min(0.95, r + 0.3); // 第二個以上 5 歲以下的孩子
    return r;
  }
  // 印花稅（新南威爾斯、維多利亞）與首購減免 §4.3［OFFICIAL 級距；門檻為 2025–26 值］
  function duty(p, st) {
    var full, ex, top;
    if (st === 'NSW') {
      full = tax(p, [[17000, 0.0125], [36000, 0.015], [97000, 0.0175], [364000, 0.035], [1212000, 0.045], [Infinity, 0.055]]);
      ex = 800000; top = 1000000;
    } else {
      full = p > 960000 ? (p > 2000000 ? 110000 + 0.065 * (p - 2000000) : 0.055 * p) : tax(p, [[25000, 0.014], [130000, 0.024], [960000, 0.06]]);
      ex = 600000; top = 750000;
    }
    if (p <= ex) return 0;
    if (p < top) return full * (p - ex) / (top - ex);
    return full;
  }

  var K = {
    id: 'AU', name: '澳洲', cur: 'AUD', curName: '澳幣', flag: '🇦🇺',
    fx: { toTWD: FX, pppToTWD: 9.4, date: '2026-10-09' }, // PPP：澳洲約 1.45、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ABS 2025 年 8 月受僱者週薪', 'https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings/aug-2025'],
      ['2026–27 稅率（15% 級距）', 'https://www.countrytaxcalc.com/tax-guides/australia/tax-rates-2026-27/'],
      ['托育補助 2026-07 起的上限與所得門檻', 'https://www.thesector.com.au/article/ccs-hourly-rate-caps-income-thresholds-rise-6-july-2026'],
      ['家庭稅務補助 2026–27', 'https://austax.tools/tax-insights/family-tax-benefit-rates-2026-27/'],
      ['育兒假給付（Services Australia）', 'https://www.servicesaustralia.gov.au/sites/default/files/2026-06/factsheet-parental-leave-pay.pdf'],
      ['房價 2026-09（Cotality）', 'https://everstonefinance.com.au/median-house-prices-australia/'],
      ['Domain 租屋報告 2026（不吃緊的租屋所需年收入）', 'https://propertyupdate.com.au/renting-in-2026-when-lifestyle-dreams-come-with-a-six-figure-price-tag/'],
      ['澳洲央行 2026-09 升息', 'https://www.newcastleherald.com.au/story/9359064/interest-rates-hit-15-year-high-as-rba-hikes-again/']
    ],
    notes: [
      '澳洲是個人分開課稅，另加 2% 健保稅；雇主另外提撥 12% 退休金（不算在薪資裡）。',
      '托育補助：家庭年收入 8.9 萬澳幣以下補 9 成，之後每多 5,000 少 1%；第二個 5 歲以下的孩子多補 3 成。',
      '家庭稅務補助（FTB）依家庭所得遞減；單薪家庭另有 B 部分。',
      '育兒假給付 26 週、每週 1,004.70 澳幣（最低工資水準，要繳稅），伴侶保留 4 週。',
      '首購可用政府擔保只付 5% 頭期款（雪梨房價上限 150 萬、墨爾本 95 萬），印花稅首購有減免。',
      '2026 年 9 月澳洲央行升息到 4.6%，房貸利率約 6.25%。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2025 年 8 月全職受僱者週薪中位數 1,741 × 52 = 90,532［OFFICIAL：ABS］× 2026 年約 1.033 ≈ 93,500［DERIVED］
      median: 93500,
      // 十分位：全職最低工資（1,004.70 × 52）約中位數 0.56；澳洲薪資由產業標準工資撐住底部，分布較集中［ESTIMATE］
      q: [[10, 0.62], [20, 0.72], [25, 0.765], [30, 0.81], [40, 0.90], [50, 1], [60, 1.11], [70, 1.24], [75, 1.32], [80, 1.42], [90, 1.75], [95, 2.15]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      age: [[22, 0.66], [29.5, 0.93], [39.5, 1.08], [49.5, 1.10], [59.5, 1.03], [63, 0.98]], // ［ESTIMATE］
      bonus: 0.2
    },
    CHECK_SALARIES: [55000, 75000, 93500, 130000, 180000, 250000],

    // ---------- 城市 ----------
    CITY: {
      sydney: {
        id: 'sydney', name: '雪梨', short: '雪梨', capital: false, state: 'NSW',
        cons: 1.08, // ［ESTIMATE］
        // 不吃緊租屋所需年收入（Domain 2025）：獨棟 135,200、公寓 130,000 → 週租約 780／750，2026 +5.5%；各房數［DERIVED／ESTIMATE］§4.1
        rent: [2820, 3420, 3900, 4770], rentAdj: 1.0,
        // 中位數（2026-09）：獨棟 1,466,060、公寓 867,597［SECONDARY：Cotality］→ 每 ㎡ 約 9,500（含土地）［DERIVED／ESTIMATE］§4.2
        price: 9500, priceNew: 11000, hgsCap: 1500000,
        propTax: 0.0012, mgmt: 3.5, homeIns: 1500, // 市政費、公寓管理費（每 ㎡ 每月，平均）［ESTIMATE］
        park: 200, tpass: 200,
        dayFee: 170, prekRelief: 2000, // 托育中心每天（10 小時）；州政府學前補助（每年）［ESTIMATE］
        oshc: 12200, privateFees: { es: 25000, jh: 38000, sh: 40000 }, intl: 35000,
        hobby: 120, cram: { none: 0, some: 300, full: 800 },
        doula: 2000, nurse: 4000, nanny: 6800
      },
      melbourne: {
        id: 'melbourne', name: '墨爾本', short: '墨爾本', capital: false, state: 'VIC',
        cons: 1.0,
        // 不吃緊租屋所需年收入：獨棟 100,533、公寓 99,667 → 週租約 580／575，2026 +5.5%［DERIVED／ESTIMATE］
        rent: [2170, 2600, 2770, 3290], rentAdj: 1.0,
        // 中位數（2026-09）：獨棟 915,119、公寓 624,740［SECONDARY］→ 每 ㎡ 約 6,000［DERIVED／ESTIMATE］
        price: 6000, priceNew: 7000, hgsCap: 950000,
        propTax: 0.0022, mgmt: 3.0, homeIns: 1400,
        park: 150, tpass: 200,
        dayFee: 150, prekRelief: 2200, // 維多利亞「免費幼兒園」在托育中心的抵減［ESTIMATE］
        oshc: 11500, privateFees: { es: 22000, jh: 34000, sh: 36000 }, intl: 32000,
        hobby: 110, cram: { none: 0, some: 280, full: 700 },
        doula: 1800, nurse: 3600, nanny: 6200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：家計調查 2015–16 每戶每週 1,425 − 住房 279 − 能源約 40 = 1,106 × 物價 1.36 ÷ 2.6 人
      // × 52 ÷ 12 × 0.716 ≈ 1,800；以國民所得帳與物價水準交叉檢查約 1,600，取 1,700［ESTIMATE］§5.1
      adultBase: 1700, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 850], [2, 731], [6, 918], [12, 1207], [18, 1343]], // 台灣「孩子／大人」比例 × 澳洲大人開銷［ESTIMATE］
      utilBase: 220, utilPerPerson: 60,
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      auPair: 2000,
      careValue: 3600, // 托育中心每月實際費用（只用來統計補助）
      uniAwayRent: 1000,
      master: 0,       // 研究所也可用學貸（HECS）
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 20000, resale: 0.25, life: 8, run: 6000 }, // 牌照、強制險、保險、油錢、過路費［ESTIMATE］
        new: { buy: 42000, resale: 0.35, life: 10, run: 6200 },
        import: { buy: 65000, resale: 0.4, life: 10, run: 7200 }
      },
      scooter: { buy: 5000, resale: 0.2, life: 8, run: 900 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 35000, // 65 歲後每人每年：老人年金＋退休金帳戶［ESTIMATE］
      houseSize: { 1: 55, 2: 80, 3: 130, 4: 170 }, // 1–2 房公寓、3 房連棟、4 房獨棟［ESTIMATE］
      reno: { basic: 60, light: 200, full: 800 },
      closing: { used: 0.005, new: 0.005 }, homeInsurance: 1500,
      rentFactor: 1
    },

    // 5 歲上小學預備班（Kindergarten／Prep），12 歲上中學，16–17 歲讀 11–12 年級
    BANDS: { care: 3, es: 5, jh: 12, sh: 16, uni: 18 },
    // 一人請 9 個月（26 週有給付，伴侶保留的 4 週不能用），夫妻各 6 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6 : 9; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) {
      ls.loan = 'bank';
      if (ls.transport === 'scooter') ls.transport = 'transit';
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租屋', buy: '買房（首購政府擔保 5% 頭期款，印花稅首購減免）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般浮動利率房貸' },
      postpartum: { center: '澳洲沒有月子中心：請產後陪伴（doula）', nanny: '產後夜間保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（其中 22 週領育兒假給付，每週 1,004.70）', B: '伴侶請 9 個月（22 週有給付）', both: '夫妻各請 6 個月（共 26 週有給付）' },
      care: { quasi: '托育中心（政府托育補助）', public: '托育中心（政府托育補助）', private: '較高價的托育中心（政府托育補助）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '托育中心的學前班（州政府補助）', quasi: '托育中心的學前班（州政府補助）', private: '較高價的托育中心', bilingual: '較高價的托育中心（雙語）', home: '在家照顧' },
      school: { public: '公立學校（自願捐款與雜費）', privateJH: '12 歲起讀私立中學', private: '私立學校', intl: '國際學校（IB）' },
      after: { none: '不上課後班', anqin: '課前課後照顧＋假期營（有托育補助）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（精英中學考試）' },
      uni: { public: '大學（學費由學生的政府學貸支付）', private: '大學（學費由學生的政府學貸支付）', mixed: '大學（學費由學生的政府學貸支付）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（公立醫院免費）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 4000 : 0), grant: 0, local: 0 }; // 寬裕：私人產科醫師與私立醫院自付
    },
    allowance: function () { return 0; }, // 家庭稅務補助在 taxes() 依家庭所得計算
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var m = careMonths / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var day = c.dayFee * (cs === 'private' ? 1.2 : 1), r = ccsRate(famInc(x), younger(x, k));
        var gross = 240 * day, s2 = 240 * r * Math.min(day, CCS.capDay * 10);
        fee = (gross - s2) * m; sub = s2 * m;
      } else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var day = c.dayFee * (ps === 'private' || ps === 'bilingual' ? 1.2 : 1), r = ccsRate(famInc(x), younger(x, k));
      var gross = 240 * day, s2 = 240 * r * Math.min(day, CCS.capDay * 10), relief = Math.min(c.prekRelief, gross - s2);
      return { fee: gross - s2 - relief, kg: s2 + relief };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees[level] : (level === 'es' ? 800 : 1500);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        var oshc = s.after !== 'none' ? c.oshc * (1 - ccsRate(famInc(x), false)) : 0; // 學齡托育也有補助（每小時上限 13.30，課後每天約 45 元未超過）
        extra = oshc + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: 400, sub: 0 }; }, // 學費由學生自己的 HECS 學貸支付；只算學生服務費

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = C.homeInsurance;
      C.homeInsurance = c.homeIns;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.homeInsurance = keep; }
      h.closing = duty(h.total, c.state) + 3000; // 印花稅（首購減免後）＋律師、驗屋、貸款手續費［ESTIMATE］
      return h;
    },
    // 房貸：房價在首購擔保上限內 → 貸 95%（免房貸保險）；超過 → 貸 80%。銀行審核約年收入 5 倍上限［ESTIMATE］，30 年
    loanPlan: function (x, total) {
      var c = x.c, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var ltv = total <= c.hgsCap ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: ltv > 0.9 ? '浮動利率（首購擔保，免房貸保險）' : '浮動利率' }], note: amt < total * ltv - 1 ? '銀行審核最多約年收入 5 倍' : '' };
    },

    // ---------- 育兒假給付：每週 1,004.70，一人最多 22 週（伴侶保留 4 週）；要繳稅（約 15%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var hh = incomeAt(x, 'A', x.t) + incomeAt(x, 'B', x.t);
      if (g > 172000 && hh > 357000) return 0; // 所得門檻（個人與家庭都超過才不能領）［ESTIMATE：2025–26 值 × 物價］
      var weeks = Math.min(months * 52 / 12, both ? 13 : 22);
      return weeks * PPL_WEEK * 0.85 * nb;
    },

    // ---------- 稅；家庭稅務補助（FTB A／B）；高所得沒買私人醫療險的附加稅 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var t = person(gA) + person(gB), inc = gA + gB;
      var kids = (x.atHome || []).filter(function (a) { return a < 20; }), n = kids.length;
      // 高所得：買基本私人住院險（或繳附加稅），取較低者［ESTIMATE］
      var mlsTh = s.partner || n ? 202000 + 1500 * Math.max(0, n - 1) : 101000;
      if (inc > mlsTh) t += Math.min(0.01 * inc, s.partner || n ? 4000 : 2500);
      var add = 0;
      if (n) {
        var mx = 0, base = FTB.base * n;
        kids.forEach(function (a) { mx += a < 13 ? FTB.a12 : FTB.a13; });
        // A 部分：兩種算法取高者——最高額每 1 元減 0.2（69,131 起）；基本額每 1 元減 0.3（123,078 起）
        var a1 = Math.max(0, mx - 0.2 * Math.max(0, inc - FTB.free)), a2 = Math.max(0, base - 0.3 * Math.max(0, inc - FTB.hi));
        add += Math.max(a1, a2) + (inc <= 80000 ? FTB.supp * n : 0);
        // B 部分：主要收入者 12 萬以下；夫妻要最小的孩子未滿 13 歲；次要收入者 7,100 以上每 1 元減 0.2
        var yng = Math.min.apply(null, kids), hi = Math.max(gA, gB), lo = s.partner ? Math.min(gA, gB) : 0;
        if (hi <= FTB.bPrimary && (!s.partner || yng < 13)) {
          var b = yng < 5 ? FTB.b5 : FTB.b18;
          add += Math.max(0, b - (s.partner ? 0.2 * Math.max(0, lo - FTB.bFree) : 0)) + (inc <= 80000 ? FTB.bSupp : 0);
        }
      }
      if (x.tr && add) x.tr.allowance = (x.tr.allowance || 0) + add;
      return { si: 0, tax: t };
    }
  };

  // ---------- 工具 ----------
  function famInc(x) { return (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0); }
  function younger(x, k) { // 有比這個孩子大、也還沒上學的兄姊時，算「第二個以上」
    var B = x.births || [];
    for (var j = 0; j < k; j++) { var a = x.t - B[j]; if (a >= 0 && a < 6) return true; }
    return false;
  }
  function incomeAt(x, who, t) {
    var s = x.s, job = who === 'A' ? s.jobA : s.jobB, age0 = who === 'A' ? s.ageA : s.ageB;
    if (who === 'B' && !s.partner) return 0;
    var B = x.births || [];
    if (s.care === 'quit' && B.length && (s.partner ? s.quitWho : 'A') === who) {
      var last = B[B.length - 1], end = s.quitUntil === 'preschool' ? last + 2 : s.quitUntil === 'school' ? last + 6 : Infinity;
      if (t >= B[0] && t < end) return 0;
      if (t >= end) age0 -= end - B[0];
    }
    return age0 + t >= 65 ? 0 : E.grossAt(job, age0 + t, K);
  }
  K.person = person; K.duty = duty;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
