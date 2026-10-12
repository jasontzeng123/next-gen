/* =========================================================================
   西班牙模組（馬德里、瓦倫西亞）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/es.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）。
   特色：所得稅分中央與自治區兩半（馬德里最低、瓦倫西亞較高）、子女最低生活扣除、在職母親 3 歲以下每年 1,200 抵稅、
   父母各 19 週全薪產假／陪產假、0–3 歲公立托育免費（馬德里公立、瓦倫西亞全區）、買房稅費很高（中古 6–10%）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768;
  var RATE = 0.032; // 固定利率房貸約 3.0–3.3%（2026 年歐洲央行升息中）［ESTIMATE］§4.4

  // ---------- 制度參數（2026）§3 ----------
  var STATE = [[12450, 0.095], [20200, 0.12], [35200, 0.15], [60000, 0.185], [300000, 0.225], [Infinity, 0.245]]; // 中央［OFFICIAL］
  var SS_EE = 0.065, SS_MAX = 61200;   // 員工社會保險 6.5%（含世代公平機制），投保上限約每月 5,101［ESTIMATE：2026 年值］
  var DESC = [2400, 2700, 4000, 4500]; // 子女最低生活額（每位，父母各一半）；3 歲以下另加 2,800［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的稅：工作收入淨額 −「工作收入減除」→ 稅基；稅額 = 級距稅(稅基) − 級距稅(個人與家庭最低生活額)
  function person(g, c, minFam) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var si = SS_EE * Math.min(g, SS_MAX), net = g - si - 2000;
    var red = net <= 14852 ? 7302 : net <= 17673 ? 7302 - 1.75 * (net - 14852) : net <= 19747 ? 2364 - 1.14 * (net - 17673) : 0;
    var base = Math.max(0, net - red), m = Math.min(base, 5550 + minFam);
    var t = Math.max(0, tax(base, STATE) - tax(m, STATE)) + Math.max(0, tax(base, c.reg) - tax(m, c.reg));
    return { si: si, tax: t };
  }

  var K = {
    id: 'ES', name: '西班牙', cur: 'EUR', curName: '歐元', flag: '🇪🇸',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 22.0, date: '2026-10-09' }, // PPP：西班牙約 0.62、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['INE 2024 年薪資結構（中位數 24,497）', 'https://ine.es/dyngs/Prensa/EAES2024.htm'],
      ['INE 2025 家庭支出調查', 'https://ine.es/dyngs/Prensa/EPF2025.pdf'],
      ['所得稅 2026 中央級距（GuiaFiscal）', 'https://guiafiscal.es/irpf/tramos-irpf-2026/'],
      ['idealista 2026-09 馬德里房價', 'https://www.idealista.com/news/node/904703'],
      ['idealista 2026 第 2 季租金', 'https://www.esdiario.com/economia/260701/192073/alquiler-espana-sigue-marcando-maximos-cierra-trimestre-subida-interanual-4-2.html'],
      ['瓦倫西亞 0–3 歲免費教育', 'https://valencianews.es/politica/beatriz-gasco-mas-de-42-000-plazas-garantizan-la-gratuidad-de-la-educacion-de-0-a-3-anos-en-la-comunitat/'],
      ['馬德里公立 0–3 歲免費（自治區新聞稿）', 'https://www.comunidad.madrid/press-releases/download/110248']
    ],
    notes: [
      '西班牙是個人分開課稅：所得稅一半是中央、一半是自治區（馬德里稅率最低、瓦倫西亞較高）；員工社會保險約 6.5%。',
      '孩子透過「最低生活額」減稅；在職母親的孩子 3 歲以前每年另抵 1,200。',
      '父母各有 19 週全薪的出生假（免稅），不能互相轉讓。',
      '0–3 歲：馬德里公立托育免費、瓦倫西亞參加計畫的托育中心都免費（名額有限），只付餐費。',
      '買中古屋要付移轉稅（馬德里 6%、瓦倫西亞 10%），新成屋付 10% 增值稅；35 歲以下有政府擔保可貸到 9 成以上。'
    ],

    // ---------- 薪資（全職受僱者，全年，含 14 個月薪）§2 ----------
    W: {
      // 2024 年全體受僱者年薪中位數 24,497［OFFICIAL：INE］× 全職約 1.15 × 2024→2026 約 1.045 ≈ 29,500［DERIVED／ESTIMATE］
      median: 29500,
      // 十分位：法定最低工資 2026 年 1,221 × 14 ≈ 17,100（約 0.58）；形狀參考 INE 歷年分位［ESTIMATE］
      q: [[10, 0.62], [20, 0.70], [25, 0.74], [30, 0.79], [40, 0.89], [50, 1], [60, 1.12], [70, 1.27], [75, 1.36], [80, 1.48], [90, 1.85], [95, 2.35]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      age: [[22, 0.65], [27, 0.80], [35, 0.97], [45, 1.08], [55, 1.14], [63, 1.12]], // ［ESTIMATE］
      bonus: 2
    },
    CHECK_SALARIES: [18000, 24000, 29500, 40000, 60000, 90000],

    // ---------- 城市 ----------
    CITY: {
      madrid: {
        id: 'madrid', name: '馬德里', short: '馬德里', capital: true,
        cons: 1.12, // 馬德里家庭支出為全國最高之一［ESTIMATE］
        // 刊登租金每 ㎡ 23.7（2026 Q2，年增 7.6%）［NEWS］；新簽約混合約 21［ESTIMATE］
        rentM2: 21, rentSize: [55, 75, 95, 120], rentAdj: 1.0,
        price: 5800, priceNew: 7000, // 刊登價 6,458（2026-09）［SECONDARY］，成交約低 10%［DERIVED］
        mgmt: 1.2, propTax: 0.0015,
        closing: { used: 0.06, new: 0.1075 }, // 移轉稅 6%；新成屋增值稅 10%＋印花 0.75%［OFFICIAL 稅率］
        reg: [[13362, 0.085], [19004, 0.107], [35425, 0.128], [57320, 0.174], [Infinity, 0.205]], // 馬德里自治區級距［ESTIMATE：2025 值］
        birthDed: 721.70, // 馬德里出生扣抵（出生當年起 3 年）［ESTIMATE］
        park: 100, tpass: 35,
        careFree: true, carePriv: 500, nanny: 1350, meals: 110,
        privFees: { es: 1800, jh: 1800, sh: 2000 }, priv2: 8000, intl: 12000,
        after: 2000, hobby: 60, cram: { none: 0, some: 100, full: 280 },
        uniFee: 1300, doula: 900, nurse: 2200
      },
      valencia: {
        id: 'valencia', name: '瓦倫西亞', short: '瓦倫西亞', capital: false,
        cons: 0.97,
        rentM2: 14, rentSize: [55, 75, 95, 120], rentAdj: 1.0, // ［ESTIMATE：刊登約 15.5］
        price: 2900, priceNew: 3600, // 2026 年漲約 5%［SECONDARY］；每 ㎡［ESTIMATE］
        mgmt: 1.0, propTax: 0.002,
        closing: { used: 0.10, new: 0.115 },
        reg: [[12000, 0.09], [22000, 0.12], [32000, 0.15], [42000, 0.175], [52000, 0.20], [62000, 0.225], [72000, 0.25], [100000, 0.265], [150000, 0.275], [200000, 0.285], [Infinity, 0.295]], // ［ESTIMATE］
        birthDed: 300,
        park: 70, tpass: 30,
        careFree: true, carePriv: 400, nanny: 1250, meals: 100,
        privFees: { es: 1500, jh: 1500, sh: 1700 }, priv2: 6500, intl: 10000,
        after: 1700, hobby: 50, cram: { none: 0, some: 90, full: 250 },
        uniFee: 400, doula: 800, nurse: 2000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2025 家庭支出每人每年 14,066 ×（1 − 住房與水電 33.2%）÷ 12 × 0.716 × 物價 1.03 ≈ 578［DERIVED］§5.1
      adultBase: 578, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 289], [2, 249], [6, 312], [12, 410], [18, 457]], // ［ESTIMATE］
      utilBase: 90, utilPerPerson: 35,
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      careValue: 600, // 公立托育名額每月實際成本（只統計補助）［ESTIMATE］
      uniAwayRent: 450,
      master: 2500,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.25, life: 8, run: 2600 },
        new: { buy: 25000, resale: 0.35, life: 10, run: 2700 },
        import: { buy: 40000, resale: 0.4, life: 10, run: 3300 }
      },
      scooter: { buy: 3000, resale: 0.2, life: 8, run: 500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 18500, // 65 歲後每人每年（公共年金，稅後）［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 120 },
      reno: { basic: 50, light: 200, full: 800 },
      closing: { used: 0.08, new: 0.11 }, homeInsurance: 250,
      rentFactor: 1
    },

    // 3–5 歲幼兒教育（免費），6 歲小學，12 歲國中（ESO），16–17 歲高中（Bachillerato），18 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 16, uni: 18 },
    leaveMonths: function () { return 4.4; }, // 出生假 19 週（父母各自，不能轉讓）

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋', buy: '買房（中古屋移轉稅 6–10%、新成屋增值稅 10%）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新成屋' },
      loan: { qingan: '沒有新青安，改用一般房貸（35 歲以下有政府擔保）', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（固定利率 30 年）' },
      postpartum: { center: '西班牙沒有月子中心：請產後陪伴', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請出生假', A: '我請 19 週出生假（全薪、免稅）', B: '伴侶請 19 週出生假', both: '夫妻各請 19 週（全薪、不能轉讓）' },
      care: { quasi: '公立托育（免費，只付餐費；名額有限）', public: '公立托育（免費，只付餐費）', private: '私立托育', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶（很常見）', helper: '請保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒教育（免費）', quasi: '公辦民營學校（concertada）', private: '私立學校', bilingual: '雙語私立學校', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀公辦民營學校', private: '公辦民營學校（每月自願費）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校午餐＋課後與暑期營隊', anqin1: '午餐＋課後＋1 項才藝', anqin3: '午餐＋課後＋3 項才藝' },
      cram: { none: '不補習', some: '補習班（每週 1–2 堂）', full: '密集補習' },
      uni: { public: '公立大學', private: '私立大學', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 3500 : 0), grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 子女優惠都在稅（taxes）裡
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') { fee = c.meals * careMonths; sub = C.careValue * careMonths; }
      else if (cs === 'private') fee = c.carePriv * careMonths;
      else if (cs === 'helper') fee = c.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      if (fee > 0) x.y.dc = (x.y.dc || 0) + fee;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var fee = ps === 'public' ? c.meals * 9 : ps === 'quasi' ? c.privFees.es + c.meals * 9 : ps === 'bilingual' ? c.intl * 0.7 : c.priv2 * 0.8;
      return { fee: fee, kg: ps === 'public' ? 4000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privFees[level] : (level === 'es' ? 300 : 450);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        extra = (s.after !== 'none' ? c.after : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = h.total * c.closing[x.s.build === 'new' ? 'new' : 'used'] + 2000; // 公證、登記、代書
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax * h.total;
      return h;
    },
    // 房貸：貸 8 成、30 年；35 歲以下且每人年收入約 3.8 萬以下可用國家擔保（ICO）貸到 95%；月付不超過淨收入約 35%（稅前 28%）
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, gA = incomeAt(x, 'A', tb), gB = incomeAt(x, 'B', tb), inc = gA + gB;
      var young = Math.min(s.ageA, s.partner ? s.ageB : 99) + tb < 35 && Math.max(gA, gB) <= 37800;
      var ltv = young ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 0.28 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: young ? '國家擔保房貸（35 歲以下）' : '固定利率房貸' }], note: amt < total * ltv - 1 ? '月付不能超過淨收入約 35%' : '' };
    },

    // ---------- 出生假：19 週全薪（投保上限內）、免稅 ----------
    leavePay: function (g, ind, months, nb) {
      var weeks = Math.min(19, months * 52 / 12);
      return weeks * Math.min(g, SS_MAX) / 52 * nb;
    },

    // ---------- 稅與社保；子女最低生活額、在職母親抵稅、多子女 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 25; });
      var minFam = 0;
      kids.slice().sort(function (p, q) { return q - p; }).forEach(function (a, i) { minFam += DESC[Math.min(i, 3)] + (a < 3 ? 2800 : 0); });
      var share = s.partner && gA > 0 && gB > 0 ? 0.5 : 1;
      var pa = person(gA, c, gA > 0 ? minFam * share : 0), pb = person(gB, c, gB > 0 ? minFam * (s.partner && gA > 0 ? 0.5 : 1) : 0);
      var tx = pa.tax + pb.tax;
      // 在職母親：每個 3 歲以下的孩子每年 1,200，另加托育費最多 1,000（可退）；多子女家庭 1,200
      var u3 = kids.filter(function (a) { return a < 3; }).length, mom = s.partner ? (gB > 0 ? gB : gA) : gA;
      if (mom > 0 && u3) tx -= 1200 * u3 + Math.min(1000 * u3, x.y.dc || 0);
      if (kids.length >= 3 && gA + gB > 0) tx -= 1200;
      if (u3 && gA + gB > 0 && gA + gB <= 60000) tx -= c.birthDed * u3; // 自治區出生扣抵（3 歲內，所得上限［ESTIMATE］）
      return { si: pa.si + pb.si, tax: tx };
    }
  };

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
