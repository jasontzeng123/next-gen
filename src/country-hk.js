/* =========================================================================
   香港模組（城市，一個城市）。金額為港幣、2026 年水準。
   來源與可信度見 research/countries/hk.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：薪俸稅很低（累進或標準稅率 15% 取低者）、子女免稅額 14 萬、租金或房貸利息可扣除、
   強積金（員工 5%，每月最多 1,500）、0–2 歲托育名額很少（多數家庭請外籍家庭傭工）、
   幼稚園有免費半日、私樓很貴但有居屋（資助出售房屋）、產假 14 週（8 成薪）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 4.092;   // 1 港幣 = 4.092 台幣（聯繫匯率 7.80；美元 31.92，2026-10-12）§1［DERIVED］
  var RATE = 0.034; // 新造按揭：H 按封頂 P − 1.75%（最優惠利率 5%）約 3.25%，取 3.4%§4.4［NEWS／ESTIMATE］

  // ---------- 制度參數（2026/27 課稅年度）§3 ----------
  var PROG = [[50000, 0.02], [100000, 0.06], [150000, 0.10], [200000, 0.14], [Infinity, 0.17]]; // ［OFFICIAL］
  // 2026/27 起：基本免稅額 14.5 萬、已婚 29 萬；子女 14 萬，出生後兩個課稅年度都可再加一份［OFFICIAL：財政預算案，2026-10 核對］
  var BASIC = 145000, MARRIED = 290000, CHILD = 140000;
  var MPF_MAX = 18000;

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 薪俸稅：累進稅率（扣免稅額）與標準稅率 15%（不扣免稅額）取低者
  function salTax(income, ded, allow) {
    var net = Math.max(0, income - ded);
    return Math.min(tax(Math.max(0, net - allow), PROG), 0.15 * Math.min(net, 5000000) + 0.16 * Math.max(0, net - 5000000));
  }
  function mpf(g) { var m = g / 12; return m < 7100 ? 0 : Math.min(0.05 * g, MPF_MAX); }
  // 從價印花稅第 2 標準（2025/26 起 400 萬以下 100 元）；邊際寬減以近似計算 §4.3［OFFICIAL 稅率］
  function avd(p) {
    if (p <= 4000000) return 100;
    var steps = [[4500000, 0.015], [6000000, 0.0225], [9000000, 0.03], [20000000, 0.0375], [Infinity, 0.0425]], r = 0.0425;
    for (var i = 0; i < steps.length; i++) if (p <= steps[i][0]) { r = steps[i][1]; break; }
    return Math.min(r * p, 100 + 0.2 * (p - 4000000));
  }

  var K = {
    id: 'HK', name: '香港', cur: 'HKD', curName: '港幣', flag: '🇭🇰',
    fx: { toTWD: FX, pppToTWD: 2.4, date: '2026-10-12' }, // PPP：香港約 5.7、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['統計處 2025 年收入及工時按年統計調查', 'https://www.info.gov.hk/gia/general/202603/23/P2026032300370.htm'],
      ['統計處 2024/25 住戶開支統計調查', 'https://www.info.gov.hk/gia/general/202606/09/P2026060900321.htm'],
      ['立法會答問：鼓勵生育措施（2026-06）', 'https://www.info.gov.hk/gia/general/202606/17/P2026061700336p.htm'],
      ['差餉物業估價署 2026-08 樓價與租金指數（The Standard）', 'https://www.thestandard.com.hk/property/article/344033/HK-home-prices-edge-up-in-August-rent-hits-new-high'],
      ['外籍家庭傭工最低工資 2026-10', 'https://www.thestandard.com.hk/news/article/344449/HK-raises-minimum-wage-for-foreign-domestic-helpers-to-5220'],
      ['最優惠利率與 HIBOR（The Standard）', 'https://www.thestandard.com.hk/finance/article/319048/Hong-Kong-lenders-keep-prime-rate-unchanged-at-5-percent']
    ],
    notes: [
      '薪俸稅：累進稅率（2%–17%）與標準稅率 15% 取低者；基本免稅額 13.2 萬、子女免稅額每名 14 萬；有子女時住宅租金或房貸利息每年最多扣 12 萬。',
      '強積金員工自付 5%（每月最多 1,500），算在社保。',
      '0–2 歲資助托兒名額很少，多數雙薪家庭請外籍家庭傭工（最低工資 5,220＋膳食津貼 1,236）。',
      '幼稚園教育計劃：半日免費，全日每月約 1,500 起。',
      '新生嬰兒獎勵金 2 萬元只適用 2026 年 10 月 24 日前出生的嬰兒（政府檢討中），模型沒有算。',
      '「新建案」選項算成居屋（家庭月入 7 萬以下、約市價 5 成多、要抽籤）；超過收入上限改買一手私樓。'
    ],

    // ---------- 薪資（全體僱員，月薪 × 12.5）§2 ----------
    W: {
      // 2025 年 5–6 月僱員每月工資中位數 21,200［OFFICIAL］× 2026 年 1.035 × 12.5（年終雙糧）≈ 275,000［DERIVED］
      median: 275000,
      // 分位：P10 11,000、P25 15,300、P75 33,000、P90 51,300［OFFICIAL］；其他以對數內插［DERIVED］
      q: [[10, 0.519], [20, 0.66], [25, 0.722], [30, 0.78], [40, 0.89], [50, 1], [60, 1.17], [70, 1.40], [75, 1.557], [80, 1.80], [90, 2.42], [95, 3.2]],
      paretoAlpha: 2.2,
      ageSpread: 0.85,
      // 年齡：每小時工資中位數 25–34 歲 90、35–44 歲 100、45–54 歲 86.4［OFFICIAL］的形狀［DERIVED／ESTIMATE］
      age: [[22, 0.62], [29.5, 0.98], [39.5, 1.13], [49.5, 1.0], [59.5, 0.8], [63, 0.7]],
      bonus: 0.5
    },
    CHECK_SALARIES: [150000, 220000, 275000, 400000, 600000, 1000000],

    // ---------- 城市 ----------
    CITY: {
      hongkong: {
        id: 'hongkong', name: '香港', short: '香港', capital: true,
        cons: 1.0,
        // 私樓租金（實用面積每呎約 36 元，2026 年創新高）：1 房 28 ㎡、2 房 40 ㎡、3 房 58 ㎡、4 房 80 ㎡［ESTIMATE］§4.1
        rent: [11000, 15500, 21500, 30000], rentAdj: 1.0,
        // 二手實用面積每呎約 13,000（2026 年樓價年升約 11%）→ 每 ㎡ 約 140,000；一手私樓約 183,000；居屋約 90,000［ESTIMATE］§4.2
        price: 140000, priceNew: 183000, hos: 90000,
        mgmt: 38, propTax: 0.0018, // 管理費（每 ㎡ 每月）、差餉與地租（占樓價）［ESTIMATE］
        park: 3500, tpass: 700, // 車位月租；八達通交通費每人每月［ESTIMATE］
        ccc: 6000, ccPrivate: 10000, kgWhole: 1500, kgPrivate: 6000, kgIntl: 9000, // 托兒所與幼稚園每月［ESTIMATE］
        afterSchool: 2500, dss: 60000, intl: 200000, // 補習社託管（每月）；直資、國際學校（每年）［ESTIMATE］
        hobby: 800, cram: { none: 0, some: 2000, full: 5000 },
        uniFee: 49500, // 教資會資助學士學費：2025/26 44,500、2026/27 47,000、2027/28 49,500（政府新聞處 2024-06）［OFFICIAL］
        doula: 15000, nurse: 30000 // 陪月員（26 天）［ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2024/25 住戶開支每月 32,472 ×（1 − 住屋 39.3% − 水電約 2.5%）÷ 每戶約 2.66 人 × 0.716 × 物價 1.02 ≈ 5,200［DERIVED］§5.1
      adultBase: 5200, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 2600], [2, 2236], [6, 2808], [12, 3692], [18, 4108]], // 台灣「孩子／大人」比例 × 香港大人開銷［ESTIMATE］
      utilBase: 700, utilPerPerson: 150,
      gearFirst: { frugal: 5000, normal: 10000, comfy: 20000 }, gearLater: 3000,
      postpartumFamily: 2000,
      grandPaid: 0,
      helper: 6900, // 外籍家庭傭工：最低工資 5,220＋膳食 1,236＋保險與中介費攤提［OFFICIAL／ESTIMATE］
      uniAwayRent: 2000,
      master: 150000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 150000, resale: 0.25, life: 8, run: 30000 }, // 保險、牌費、油錢、隧道費［ESTIMATE］
        new: { buy: 350000, resale: 0.3, life: 10, run: 32000 },
        import: { buy: 600000, resale: 0.35, life: 10, run: 40000 }
      },
      scooter: { buy: 30000, resale: 0.2, life: 8, run: 6000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 60000, // 65 歲後每人每年：強積金提取＋長者生活津貼［ESTIMATE］
      houseSize: { 1: 28, 2: 40, 3: 58, 4: 80 }, // 實用面積［ESTIMATE］
      reno: { basic: 1000, light: 4000, full: 12000 },
      closing: { used: 0.013, new: 0.003 }, homeInsurance: 2000, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 6 歲上小一，12 歲上中一，15–17 歲讀高中（中四到中六），18 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    // 產假 14 週（8 成薪）；男士侍產假只有 5 天。夫妻都請時算各 2 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 2 : 3.5; },

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
      housing: { rent: '租私樓', buy: '買樓（首置按揭保險最高 9 成）', family: '和長輩同住' },
      build: { used: '二手私樓', new: '居屋（家庭月入 7 萬以下，要抽籤；超過改買一手私樓）' },
      loan: { qingan: '沒有新青安，改用一般按揭', qinganNoGrace: '沒有新青安，改用一般按揭', bank: '一般按揭（H 按）' },
      postpartum: { center: '香港月子中心少：請陪月員（26 天）', nanny: '陪月員（26 天）', family: '家人幫忙坐月' },
      leave: { none: '不請育嬰假', A: '我請 3.5 個月（產假 14 週，8 成薪）', B: '伴侶請 3.5 個月（14 週，8 成薪）', both: '夫妻各請 2 個月' },
      care: { quasi: '資助托兒所（名額很少）', public: '資助托兒所（名額很少）', private: '私立托兒所', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '請外籍家庭傭工（最常見）', quit: '一方辭職在家照顧' },
      preschool: { public: '幼稚園教育計劃（全日）', quasi: '幼稚園教育計劃（全日）', private: '非計劃私立幼稚園', bilingual: '國際幼稚園', home: '在家照顧' },
      school: { public: '官立／資助學校（免學費）', privateJH: '12 歲起讀直資學校', private: '直資學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '補習社功課輔導', anqin1: '功課輔導＋1 項興趣班', anqin3: '功課輔導＋3 項興趣班' },
      cram: { none: '不補習', some: '補習（每週 1–2 堂）', full: '密集補習（中學文憑試）' },
      uni: { public: '資助大學（學費約 4.45 萬）', private: '資助大學（學費約 4.45 萬）', mixed: '資助大學' },
      transport: { transit: '大眾運輸（港鐵、巴士）', scooter: '機車不常見，改用大眾運輸', used: '二手車', new: '新車', import: '進口名車' }
    },

    // ---------- 生產：公立醫院費用很低，多數中產在私家醫院生產 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' || s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 90000 : ls === 'normal' ? 8000 : 2000), grant: 0, local: 0 }; // 寬裕：私家醫院套餐
    },
    allowance: function () { return 0; },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0;
      if (cs === 'quasi' || cs === 'public') fee = c.ccc * careMonths;
      else if (cs === 'private') fee = c.ccPrivate * careMonths;
      else if (cs === 'helper') x.helperMonths = Math.max(x.helperMonths || 0, careMonths);
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: 0 };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var m = ps === 'private' ? c.kgPrivate : ps === 'bilingual' ? c.kgIntl : c.kgWhole;
      return { fee: m * 12, kg: ps === 'public' || ps === 'quasi' ? 3000 * 12 : 0 }; // 計劃每名學童資助約每月 3,000（只統計）［ESTIMATE］
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.dss : 5000;
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.afterSchool * 11 : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 居屋：家庭月入 7 萬以下，用居屋價；否則一手私樓。印花稅、代理佣金 1%、律師費 §4.3
    housePlan: function (x) {
      var C = x.C, c = x.c, s = x.s, inc = (incomeAt(x, 'A', x.tb) + incomeAt(x, 'B', x.tb)) / 12;
      var hos = s.build === 'new' && inc <= 70000, keep = c.priceNew;
      if (hos) c.priceNew = c.hos;
      var h;
      try { h = WD.stdHousePlan(x); } finally { c.priceNew = keep; }
      h.hos = hos;
      h.closing = avd(h.total) + (s.build === 'new' ? 0 : 0.01 * h.total) + 15000 + (h.loanAmt > 0.7 * h.total ? 0.025 * h.loanAmt : 0); // 按揭保險保費約 2.5%
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax * h.total;
      return h;
    },
    // 按揭：一般 7 成；樓價 1,000 萬以下首置可用按揭保險到 9 成；居屋擔保到 95%；供款不超過收入 50%，30 年 §4.4
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var hos = s.build === 'new' && inc / 12 <= 70000;
      var ltv = hos ? 0.95 : total <= 10000000 ? 0.9 : 0.7;
      var amt = Math.max(0, Math.min(total * ltv, 0.5 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: hos ? '居屋按揭（房委會擔保）' : '按揭（H 按）' }], note: amt < total * ltv - 1 ? '供款不能超過收入 50%' : '' };
    },

    // ---------- 產假：14 週、平均工資 8 成 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 8.7 : 14);
      return weeks * 0.8 * g / 52 * nb;
    },

    // ---------- 薪俸稅與強積金 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 25; }).length;
      var nb = (x.kAges || []).filter(function (a) { return a === 0 || a === 1; }).length; // 出生年度與下一年度各另加一份子女免稅額
      var childAllow = CHILD * (kids + nb);
      // 住宅租金或居所貸款利息扣除（有子女每年最多 12 萬，否則 10 萬），算給收入較高的一方
      var housing = x.renting ? (x.rentM || 0) * 12 : (x.mortInt || 0);
      var hd = Math.min(housing, kids ? 120000 : 100000);
      var mA = mpf(gA), mB = mpf(gB), hiA = gA >= gB, tx;
      if (s.partner && (gA <= 0 || gB <= 0)) { // 一方沒收入：合併評稅，用已婚人士免稅額
        tx = salTax(gA + gB, mA + mB + hd, MARRIED + childAllow);
      } else {
        tx = salTax(gA, mA + (hiA ? hd : 0), BASIC + (hiA ? childAllow : 0)) + (s.partner ? salTax(gB, mB + (hiA ? 0 : hd), BASIC + (hiA ? 0 : childAllow)) : 0);
      }
      return { si: mA + mB, tax: tx };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
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
  K.avd = avd; K.salTax = salTax;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
