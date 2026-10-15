/* =========================================================================
   以色列模組（特拉維夫、海法）。金額為新謝克爾、2026 年水準。
   來源與可信度見 research/countries/il.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：已開發國家裡生育率最高（約 2.9）。個人課稅、「稅額點數」制度（母親與幼兒的點數多）、
   國民保險＋健保稅、兒童津貼與生育補助、3 歲起幼兒園免費、15 週全薪產假、18–20 歲服兵役（父母負擔較輕）、
   特拉維夫房價極高。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 10.38;  // 1 新謝克爾 = 10.38 台幣（2026-10-12）§1［SECONDARY］
  var RATE = 0.048; // 房貸組合（基本利率連動約 4.5%＋固定）平均約 4.8%；央行利率 3.5%、基本利率 5%（2026-07）§4.4［NEWS／ESTIMATE］

  // ---------- 制度參數 §3 ----------
  // 2026 級距：其餘凍結在 2025 值，但 20% 級距放寬到 228,000、31% 到 301,200（2026 預算）［SECONDARY：PwC］
  var BR = [[84120, 0.10], [120720, 0.14], [228000, 0.20], [301200, 0.31], [560280, 0.35], [721560, 0.47], [Infinity, 0.50]];
  var POINT = 242 * 12;            // 每個稅額點數每年抵稅［ESTIMATE：2025 值凍結］
  var NI_LO = 90264, NI_HI = 608340; // 國民保險＋健保：平均工資 60% 以下 4.27%、以上 12.17%，上限［ESTIMATE］
  var ALLOW = [173, 219, 219, 219, 173]; // 兒童津貼（每月，依胎次）［ESTIMATE：2025 值］
  var GRANT = [2069, 931, 621];          // 生育補助［ESTIMATE］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function person(g, points) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var ni = 0.0427 * Math.min(g, NI_LO) + 0.1217 * U.clamp(g - NI_LO, 0, NI_HI - NI_LO);
    var pen = 0.06 * g;                                   // 強制退休金員工 6%
    var credit = points * POINT + 0.35 * Math.min(pen, 0.07 * Math.min(g, 112000)); // 點數＋退休金 35% 抵稅
    return { si: ni + pen, tax: Math.max(0, tax(g, BR) - credit) };
  }

  var K = {
    id: 'IL', name: '以色列', cur: 'ILS', curName: '新謝克爾', flag: '🇮🇱',
    fx: { toTWD: FX, pppToTWD: 3.6, date: '2026-10-12' }, // PPP：以色列約 3.8、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['平均工資創新高 14,334（Globes）', 'https://en.globes.co.il/en/article-average-monthly-wage-in-israel-reaches-record-high-1001501282'],
      ['以色列央行降息到 3.5%（Ynet，2026-07）', 'https://www.ynetnews.com/business/article/s111bt7txzx'],
      ['以色列租金 2026（EasyAliyah 整理統計局資料）', 'https://www.easyaliyah.com/blog/the-israeli-rental-market-2026'],
      ['匯率 ILS／TWD', 'https://fxfeed.io/currencies/pairs/ils-twd?range=7d']
    ],
    notes: [
      '以色列是已開發國家中生育率最高的（約 2.9），宗教與家庭文化是重要原因。',
      '個人課稅；每人有基本「稅額點數」，母親多半個點，6 歲以下的孩子讓父母各多 1.5–2.5 點，所得稅很快被抵掉。',
      '國民保險＋健保稅：平均工資 6 成以下 4.27%、以上 12.17%；強制退休金員工自付 6%。',
      '3 歲起幼兒園免學費（下午班另付）；0–2 歲托育很貴，低收入有補助。',
      '產假 15 週全薪（國民保險給付）。孩子 18–20 歲服兵役，父母負擔較輕。',
      '特拉維夫房價每 ㎡ 約 6 萬謝克爾，是全世界最貴的城市之一；首購 198 萬以下免購屋稅。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 平均月薪 14,334（2024-12，含部分工時與高科技業）［NEWS］；全職中位數約 12,400（2026）× 12 ＋ 休養津貼 ≈ 150,000［ESTIMATE］
      median: 150000,
      // 分布很寬：最低工資約 6,250／月（約中位數 0.5），高科技業平均約 3 萬［NEWS／ESTIMATE］
      q: [[10, 0.50], [20, 0.60], [25, 0.66], [30, 0.72], [40, 0.85], [50, 1], [60, 1.17], [70, 1.38], [75, 1.52], [80, 1.70], [90, 2.35], [95, 3.0]],
      paretoAlpha: 2.2,
      ageSpread: 0.85,
      age: [[22, 0.55], [27, 0.78], [35, 1.0], [45, 1.15], [55, 1.15], [63, 1.05]], // 兵役後才進職場［ESTIMATE］
      bonus: 0.3
    },
    CHECK_SALARIES: [80000, 110000, 150000, 220000, 330000, 500000],

    CITY: {
      telaviv: {
        id: 'telaviv', name: '特拉維夫', short: '特拉維夫', capital: false,
        cons: 1.12,
        // 統計局平均：3 房 7,004、4 房 8,739（2025 Q3）［SECONDARY］＋ 2026 約 3%；以色列房數含客廳（2 臥＝3 房）
        rent: [5500, 7200, 9000, 11500], rentAdj: 1.0,
        arnona: 90, vaad: 250, // 市政稅（每 ㎡ 每年，租屋也要付）、大樓管理費（每月）［ESTIMATE］
        price: 60000, priceNew: 68000, // 每 ㎡［ESTIMATE］
        size: [55, 75, 100, 120],
        park: 500, tpass: 255,
        maon: 3000, ganon: 4800, tzaharon: 1050, gan: 3500, ganBiling: 5000,
        nitzanim: 800, privSchool: 25000, intl: 130000,
        hobby: 300, cram: { none: 0, some: 500, full: 1500 },
        doula: 6000, nurse: 12000
      },
      haifa: {
        id: 'haifa', name: '海法', short: '海法', capital: false,
        cons: 0.95,
        rent: [2600, 3200, 4050, 4900], rentAdj: 1.0, // 3 房 3,082、4 房 3,937（2025 Q3）［SECONDARY］
        arnona: 70, vaad: 180,
        price: 20000, priceNew: 25000,
        size: [55, 75, 100, 120],
        park: 200, tpass: 225,
        maon: 2500, ganon: 3300, tzaharon: 900, gan: 2800, ganBiling: 4000,
        nitzanim: 700, privSchool: 20000, intl: 90000,
        hobby: 250, cram: { none: 0, some: 450, full: 1300 },
        doula: 5000, nurse: 10000
      }
    },

    COST: {
      // 每位大人每月日常開銷：家計調查每戶每月約 17,600 ×（1 − 住房約 25%）÷ 3.2 人 × 0.716 × 物價 1.12 ≈ 3,300，取 3,200［ESTIMATE］§5
      adultBase: 3200, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 1600], [2, 1376], [6, 1728], [12, 2272], [18, 2528]], // ［ESTIMATE］
      utilBase: 600, utilPerPerson: 150,
      gearFirst: { frugal: 3000, normal: 6000, comfy: 12000 }, gearLater: 2000,
      postpartumFamily: 1000,
      grandPaid: 0, helper: 0,
      nanny: 7500,       // 全職保母每月［ESTIMATE］
      maonCost: 4500,    // 認證托嬰中心每月實際成本（只統計補助）［ESTIMATE］
      soldier: 18000,    // 服兵役期間的生活津貼（每年，抵掉部分生活費）［ESTIMATE］
      uniAwayRent: 2500,
      master: 15000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 60000, resale: 0.3, life: 8, run: 15000 },
        new: { buy: 140000, resale: 0.4, life: 10, run: 16000 },
        import: { buy: 220000, resale: 0.45, life: 10, run: 19000 }
      },
      scooter: { buy: 12000, resale: 0.25, life: 8, run: 3000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 70000, // 65 歲後每人每年：國民保險老年給付＋職業年金［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 100, 4: 120 },
      reno: { basic: 200, light: 800, full: 3000 },
      closing: { used: 0.03, new: 0.006 }, homeInsurance: 1500,
      rentFactor: 1
    },

    // 3–5 歲幼兒園（免費），6 歲小學，12 歲國中，15 歲高中，18–20 歲服兵役，21 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3.5 : 6; }, // 產假 15 週全薪，一人通常再請到 6 個月

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（租客也要付市政稅）', buy: '買房（首購 198 萬以下免購屋稅，貸款最多 75%）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（組合式利率）' },
      postpartum: { center: '產後恢復旅館（以色列常見）', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 6 個月（其中 15 週全薪）', B: '伴侶請 6 個月（15 週全薪）', both: '夫妻共用 15 週全薪產假（各約 3.5 個月）' },
      care: { quasi: '認證托嬰中心（依收入補助）', public: '認證托嬰中心（依收入補助）', private: '私立托嬰', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '全職保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（免學費）＋下午班', quasi: '公立幼兒園＋下午班', private: '私立幼兒園', bilingual: '雙語幼兒園', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀私立學校', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校課後照顧（低年級）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（高中會考）' },
      uni: { public: '18–20 歲服兵役，之後讀大學', private: '18–20 歲服兵役，之後讀大學', mixed: '18–20 歲服兵役，之後讀大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: GRANT[Math.min(k, 2)], local: 0 };
    },
    allowance: function (x, k, a) { return a < 18 ? ALLOW[Math.min(k, 4)] * 12 : 0; },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') {
        // 認證托嬰中心：每人月收入越低補助越多（簡化）［ESTIMATE］
        var pc = ((x.gA || 0) + (x.s.partner ? x.gB || 0 : 0)) / 12 / Math.max(1, x.persons || 1);
        var m = Math.max(800, c.maon - 2000 * Math.max(0, 1 - pc / 8000));
        fee = m * careMonths; sub = Math.max(0, C.maonCost - m) * careMonths;
      } else if (cs === 'private') fee = c.ganon * careMonths;
      else if (cs === 'helper') fee = C.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var m = ps === 'private' ? c.gan : ps === 'bilingual' ? c.ganBiling : c.tzaharon;
      return { fee: m * (ps === 'private' || ps === 'bilingual' ? 12 : 10), kg: ps === 'public' || ps === 'quasi' ? 20000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : 2500;
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) && a < 8 ? c.nitzanim * 10 : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 18–20 歲服兵役（有生活津貼，算成家庭收到的補助）；21 歲起大學學費約 11,000
    uni: function (x, k, a) { if (a < 21) { x.tr.allowance += x.C.soldier; return { fee: 0, sub: 0 }; } return { fee: 11000, sub: 0 }; },

    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor + c.arnona * c.size[r - 1] / 12 + c.vaad;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = purchaseTax(h.total) + h.total * (x.s.build === 'new' ? 0.006 : 0.0295); // 律師 0.5%＋仲介 2%（含加值稅）
      h.mgmt = c.vaad * 12; h.tax = c.arnona * h.size;
      return h;
    },
    // 房貸：首購最多 75%、30 年；月付不超過收入約 1/3 §4.4［OFFICIAL：央行規定 LTV 75%］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.75, 0.33 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '組合式房貸' }], note: amt < total * 0.75 - 1 ? '月付不能超過收入約 1/3' : '' };
    },

    // 產假：15 週全薪（國民保險，每日上限約 1,730）；夫妻共用時各約 7.5 週；要繳稅
    leavePay: function (g, ind, months, nb, x) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 7.5 : 15);
      return weeks * Math.min(g / 52, 1730 * 7) * 0.85 * nb;
    },

    // 稅：每人 2.25 點，母親多 0.5 點；孩子出生那年父母各 1.5 點、1–5 歲各 2.5 點；6–17 歲母親 1 點、18 歲 0.5 點
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = x.kAges || [], both = 0, mom = 0.5;
      kids.forEach(function (a) { if (a === 0) both += 1.5; else if (a <= 5) both += 2.5; else if (a <= 17) mom += 1; else if (a === 18) mom += 0.5; });
      var momIsB = s.partner && gB > 0;
      var pa = person(gA, 2.25 + both + (momIsB ? 0 : mom)), pb = person(gB, 2.25 + both + (momIsB ? mom : 0));
      return { si: pa.si + pb.si, tax: pa.tax + pb.tax };
    }
  };

  // 首購購屋稅：198 萬以下免稅、234.7 萬以下 3.5%、605.5 萬以下 5%、以上 8%［ESTIMATE：2025 值凍結］
  function purchaseTax(p) { return tax(p, [[1978745, 0], [2347040, 0.035], [6055070, 0.05], [Infinity, 0.08]]); }
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
  K.person = person;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
