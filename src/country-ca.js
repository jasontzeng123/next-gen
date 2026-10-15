/* =========================================================================
   加拿大模組（多倫多、卡加利）。金額為加幣、2026 年水準。
   來源與可信度見 research/countries/ca.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：聯邦＋省所得稅（個人分開課稅）、加拿大兒童福利金（依家庭所得遞減）與省的兒童津貼、
   就業保險育兒給付（薪資 55%）、全國「每天 10 元托育」計畫（多倫多 22 元、卡加利 15 元）、
   公立學校 4 歲（安大略）起免費、首購 5% 頭期款＋房貸保險、房貸壓力測試。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 22.40;   // 1 加幣 = 22.40 台幣（2026-10-09 收盤）§1［SECONDARY］
  var RATE = 0.047; // 5 年固定：有房貸保險 4.59%、無保險約 5.1%（2026-10-09）§4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var FED = [[58523, 0.14], [117045, 0.205], [181440, 0.26], [258482, 0.29], [Infinity, 0.33]]; // ［OFFICIAL］
  var FED_BPA = 16452, FED_BPA_MIN = 14829, CEA = 1501;
  var CPP = { rate: 0.0595, ympe: 74600, exempt: 3500, rate2: 0.04, yampe: 85000 }, EI = { rate: 0.0163, mie: 68900 };
  var PROV = {
    ON: { br: [[53891, 0.0505], [107785, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]], bpa: 12989, credit: 0.0505, surtax: [5818, 7446] },
    AB: { br: [[61200, 0.08], [154259, 0.10], [185111, 0.12], [246813, 0.13], [370220, 0.14], [Infinity, 0.15]], bpa: 22769, credit: 0.10 }
  };
  // 加拿大兒童福利金（2026-07 起）：6 歲以下每年 8,157、6–17 歲 6,883；家庭淨所得 38,237 以上逐步減少 §3.3［NEWS］
  var CCB = { u6: 8157, o6: 6883, t1: 38237, t2: 82847, r1: [0.07, 0.135, 0.19, 0.23], r2: [0.032, 0.057, 0.08, 0.095] };
  var EI_MAX_WEEK = 729; // 育兒給付每週上限（薪資 55%）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function ohp(n) { // 安大略健康保費
    if (n <= 20000) return 0;
    if (n <= 36000) return Math.min(300, 0.06 * (n - 20000));
    if (n <= 48000) return Math.min(450, 300 + 0.06 * (n - 36000));
    if (n <= 72000) return Math.min(600, 450 + 0.25 * (n - 48000));
    if (n <= 200000) return Math.min(750, 600 + 0.25 * (n - 72000));
    return Math.min(900, 750 + 0.25 * (n - 200000));
  }
  // 一個人的稅與社保（g：薪資，ded：可扣除的托育費）
  function person(g, prov, ded) {
    if (!(g > 0)) return { si: 0, tax: 0, net: 0 };
    var cpp = CPP.rate * U.clamp(g - CPP.exempt, 0, CPP.ympe - CPP.exempt), cpp2 = CPP.rate2 * U.clamp(g - CPP.ympe, 0, CPP.yampe - CPP.ympe);
    var ei = EI.rate * Math.min(g, EI.mie);
    var enh = cpp * (1 / 5.95) + cpp2; // 加強版 CPP 可扣除所得
    var ti = Math.max(0, g - enh - (ded || 0));
    var bpa = FED_BPA - (FED_BPA - FED_BPA_MIN) * U.clamp((ti - 181440) / (258482 - 181440), 0, 1);
    var fed = Math.max(0, tax(ti, FED) - 0.14 * (bpa + Math.min(CEA, g) + cpp * 4.95 / 5.95 + ei));
    var P = PROV[prov], pt = Math.max(0, tax(ti, P.br) - P.credit * (P.bpa + cpp * 4.95 / 5.95 + ei));
    if (P.surtax) pt += 0.2 * Math.max(0, pt - P.surtax[0]) + 0.36 * Math.max(0, pt - P.surtax[1]);
    if (prov === 'ON') pt += ohp(ti);
    return { si: cpp + cpp2 + ei, tax: fed + pt, net: ti };
  }

  var K = {
    id: 'CA', name: '加拿大', cur: 'CAD', curName: '加幣', flag: '🇨🇦',
    fx: { toTWD: FX, pppToTWD: 11.7, date: '2026-10-09' }, // PPP：加拿大約 1.17、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['2026 聯邦稅級距、CPP 與 EI（Memorial University 薪資部門）', 'https://www.mun.ca/hr/media/production/memorial/administrative/human-resources/media-library/services/2026-tax-changes.pdf'],
      ['2026 安大略與亞伯達稅級距（Fidelity）', 'https://www.fidelity.ca/en/insights/articles/canadian-income-tax-brackets/'],
      ['安大略 2026 個人稅表（Raymond Chabot Grant Thornton）', 'https://www.rcgt.com/contentassets/5142f7cf936d42d7aa7666314c21ccd1/individual_taxation_ontario_2026.pdf'],
      ['加拿大兒童福利金 2026-07 起', 'https://www.mtlblog.com/canada-child-benefit-july-2026'],
      ['亞伯達兒童與家庭福利金 2026', 'https://www.moneysense.ca/save/budgeting/alberta-child-and-family-august-2026-payment/'],
      ['就業保險育兒給付金額', 'https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental/benefit-amount.html'],
      ['2026 各城市托育費（加拿大政策替代中心）', 'https://www.policyalternatives.ca/news-research/the-10-a-day-divide-child-care-fees-in-canada-in-2026/'],
      ['勞動力調查 2025 薪資（WealthNorth 整理）', 'https://wealthnorth.ca/income/average-income/average-salary-canada/'],
      ['家庭支出調查 2023', 'https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2025026-eng.htm'],
      ['多倫多租金 2026-07（Moving2Canada）', 'https://moving2canada.com/2026/07/how-much-is-rent-in-toronto-in-july-2026/'],
      ['卡加利租金 2026-09（liv.rent）', 'https://liv.rent/blog/?p=69419'],
      ['多倫多房價 2026-09（TRREB）', 'https://trreb.ca/hlfiles/pdf/mw_september_2026_564895214753249.pdf'],
      ['卡加利房價 2026-09（CREB）', 'https://dailyhive.com/calgary/calgary-housing-market-september'],
      ['房貸利率 2026-10（nesto）', 'https://www.nesto.ca/mortgage-rates/fixed/5-year/?region=on']
    ],
    notes: [
      '加拿大是個人分開課稅：聯邦稅＋省稅（多倫多在安大略省、卡加利在亞伯達省）。',
      '加拿大兒童福利金：6 歲以下每年最多 8,157 加幣，家庭淨所得超過約 3.8 萬開始遞減；省另有兒童津貼。',
      '育兒給付：生產的一方 15 週產假＋35 週育兒假，薪資 55%（每週最多 729 加幣），要繳稅。',
      '全國托育計畫：參與計畫的托育中心多倫多每天 22 元、卡加利每天 15 元，但名額不足、常要排隊。',
      '首購可以只付 5% 頭期款，但要買房貸保險（保費 2.8–4% 加進貸款）並通過利率 +2% 的壓力測試。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2025 年全體受僱者週薪中位數 × 52 = 60,320［OFFICIAL：勞動力調查］；全職約高 12% → 67,500 × 2026 年約 1.035 ≈ 70,000［DERIVED／ESTIMATE］
      median: 70000,
      // 十分位：沒有公布全職年薪分位；全職最低工資（安大略 17.60 × 2,000 小時）約中位數 0.50，形狀介於美國與英國之間［ESTIMATE］
      q: [[10, 0.55], [20, 0.66], [25, 0.72], [30, 0.77], [40, 0.88], [50, 1], [60, 1.12], [70, 1.26], [75, 1.36], [80, 1.48], [90, 1.92], [95, 2.35]],
      paretoAlpha: 2.4,
      ageSpread: 0.85,
      // 年齡：有工作收入者的中位數（2024 年 25–34 歲 50,300、35–44 歲 65,200、45–54 歲 70,100、55–64 歲 55,400）
      // 含部分工時，換成全職的形狀［DERIVED／ESTIMATE］
      age: [[22, 0.62], [29.5, 0.86], [39.5, 1.06], [49.5, 1.12], [59.5, 1.06], [63, 1.0]],
      bonus: 0.3
    },
    CHECK_SALARIES: [40000, 55000, 70000, 100000, 150000, 220000],

    // ---------- 城市 ----------
    CITY: {
      toronto: {
        id: 'toronto', name: '多倫多', short: '多倫多', capital: false, prov: 'ON',
        cons: 1.08, // ［ESTIMATE］
        // 刊登租金中位數（2026-07）：1 房 2,150、2 房 2,600、3 房 3,380［SECONDARY］；4 房（連棟屋）［ESTIMATE］§4.1
        rent: [2150, 2600, 3380, 4200], rentAdj: 1.0,
        // 公寓平均成交 640,248、連棟 922,445、半獨立 1,207,884（2026-09，多倫多市）［OFFICIAL：TRREB］→ 每 ㎡ 約 8,500；預售新建約 12,000［DERIVED／ESTIMATE］§4.2
        price: 8500, priceNew: 12000,
        propTax: 0.0075, condo: 7, homeIns: 600, // 地價稅率、管理費（每 ㎡ 每月）［ESTIMATE］
        ltt: 'toronto',
        park: 150, tpass: 160, // 公寓車位月租；TTC 月票［ESTIMATE］
        cw: 22 * 21.7, careFull: 2000, nanny: 3300, // 計畫內托育每天 22 元［NEWS］；計畫外私立、住家保母［ESTIMATE］
        kStart: 4, jkCare: 240, // 4 歲上公立幼兒班（JK）；上下學前後照顧每月［ESTIMATE］
        afterSchool: 450, camp: 2000, privateFees: 30000, intl: 35000,
        hobby: 100, cram: { none: 0, some: 250, full: 600 },
        uniFee: 8500, // 學費約 7,000（凍漲）＋雜費［ESTIMATE］
        doula: 1800, nurse: 3500
      },
      calgary: {
        id: 'calgary', name: '卡加利', short: '卡加利', capital: false, prov: 'AB',
        cons: 1.02,
        // 1 房 1,442（2026-09，年減 5.3%）［SECONDARY］；其他［ESTIMATE］
        rent: [1450, 1850, 2250, 2800], rentAdj: 1.0,
        // 基準價：公寓 291,400、連棟 412,400、獨立屋 739,400（2026-09）［NEWS：CREB］→ 每 ㎡ 約 3,900［DERIVED］
        price: 3900, priceNew: 4800,
        propTax: 0.0068, condo: 5, homeIns: 1500, // 冰雹多，保費較高［ESTIMATE］
        ltt: 'none',
        park: 75, tpass: 118,
        cw: 15 * 21.75, careFull: 1300, nanny: 2900, // 每天 15 元（月付 326.25）［NEWS］
        kStart: 6, jkCare: 0, // 5 歲幼兒園半天，算在托育
        afterSchool: 550, camp: 1800, privateFees: 18000, intl: 22000,
        hobby: 100, cram: { none: 0, some: 230, full: 550 },
        uniFee: 9500,
        doula: 1500, nurse: 3000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2023 家庭支出調查每戶 76,750 − 住房（含水電）24,671 = 52,079 ÷ 每戶約 2.4 人［ESTIMATE］
      // ÷ 12 × 0.716 = 1,295 × 物價 2023→2026 約 1.07 ≈ 1,385［DERIVED］§5.1
      adultBase: 1385, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 693], [2, 596], [6, 748], [12, 983], [18, 1094]], // 台灣「孩子／大人」比例 × 加拿大大人開銷［ESTIMATE］
      utilBase: 160, utilPerPerson: 45, // 電、暖氣（租屋常另付）、網路、手機、租屋保險［ESTIMATE］
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      careValue: 1800,   // 計畫內托育名額每月實際成本（只用來統計補助）［ESTIMATE］
      uniAwayRent: 800,
      master: 12000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 18000, resale: 0.25, life: 8, run: 5200 }, // 保險、油錢、保養［ESTIMATE］
        new: { buy: 42000, resale: 0.35, life: 10, run: 5500 },
        import: { buy: 65000, resale: 0.4, life: 10, run: 6500 }
      },
      scooter: { buy: 4000, resale: 0.2, life: 8, run: 800 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 22000, // 65 歲後每人每年：加拿大退休金＋老年保障金［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 100, 4: 140 }, // 1–2 房公寓、3 房連棟、4 房獨立屋［ESTIMATE］
      reno: { basic: 60, light: 200, full: 800 },
      closing: { used: 0.01, new: 0.01 }, homeInsurance: 800, // 後備值；過戶稅另外計算
      rentFactor: 1
    },

    // 安大略：4 歲上 JK、5 歲 SK、6 歲 1 年級；12 歲 7 年級；14 歲上高中
    BANDS: { care: 3, es: 4, jh: 12, sh: 14, uni: 18 },
    // 育兒給付：一人請約 12 個月（產假 15 週＋育兒 35 週）；夫妻共用 55 週，算成各 6.5 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6.5 : 12; },

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
      housing: { rent: '租屋', buy: '買房（首購頭期款最低 5%＋房貸保險，30 年）', family: '和長輩同住' },
      build: { used: '中古屋', new: '預售新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（5 年固定利率）' },
      postpartum: { center: '加拿大沒有月子中心：請產後陪伴（doula）', nanny: '產後夜間保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 12 個月（產假＋育兒假，薪資 55%，每週最多 729）', B: '伴侶請 12 個月（薪資 55%）', both: '夫妻共用 55 週（各約 6.5 個月）' },
      care: { quasi: '計畫內托育中心（每天 10–22 元）', public: '計畫內托育中心（每天 10–22 元）', private: '計畫外私立托育', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '住家保母（照護者移民計畫）', quit: '一方離職在家照顧' },
      preschool: { public: '計畫內托育中心', quasi: '計畫內托育中心', private: '計畫外私立托育', bilingual: '計畫外私立托育（雙語）', home: '在家照顧' },
      school: { public: '公立學校（安大略 4 歲起免費）', privateJH: '12 歲起讀私立學校', private: '私立學校', intl: '國際學校（IB）' },
      after: { none: '不上課後班', anqin: '課前課後照顧＋暑期營', anqin1: '課後照顧＋營隊＋1 項才藝', anqin3: '課後照顧＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '公立大學（學費約 7,000–8,000）', private: '公立大學（加拿大幾乎沒有私立大學）', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（省健保給付）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 1500 : 0), grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 兒童福利金在 taxes() 依家庭所得計算
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') { fee = c.cw * careMonths; sub = Math.max(0, C.careValue - c.cw) * careMonths; }
      else if (cs === 'private') fee = c.careFull * careMonths;
      else if (cs === 'helper') fee = c.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c, C = x.C;
      if (ps === 'home') return {};
      var m = (ps === 'private' || ps === 'bilingual') ? c.careFull * 0.85 : c.cw;
      var fee = m * 12;
      addDC(x, fee);
      return { fee: fee, kg: ps === 'private' || ps === 'bilingual' ? 0 : Math.max(0, C.careValue - c.cw) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      // 卡加利 6 歲前：幼兒園半天＋托育（每天 15 元）
      if (level === 'es' && a < c.kStart) { var f0 = c.cw * 12; addDC(x, f0); x.tr.kg += Math.max(0, x.C.careValue - c.cw) * 12; return f0; }
      var fee = intl ? c.intl : priv ? c.privateFees : (level === 'es' ? 300 : 600);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var care = 0;
        if (/^anqin/.test(s.after)) care = a < 6 ? c.jkCare * 10 : c.afterSchool * 10 + c.camp;
        addDC(x, care);
        extra = care + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

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
      h.closing = ltt(h.total, c.ltt) + 2500; // 過戶稅（首購減免後）＋律師與產權保險［ESTIMATE］
      h.down += K.loanPlan(x, h.total).downAdj || 0; // 房貸保險費加進貸款，不是自付的頭期款
      h.mgmt = c.condo * h.size * 12;
      return h;
    },
    // 房貸：頭期款最低（50 萬以下 5%、以上 10%），貸款 8 成以上要買房貸保險（保費加進貸款）；
    // 壓力測試：以 max(利率 + 2%, 5.25%)、30 年計，房貸＋地價稅＋暖氣＋一半管理費 ≤ 收入 39% §4.4［OFFICIAL 規則］
    loanPlan: function (x, total) {
      var c = x.c, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var size = (x.C.houseSize || {})[x.roomsFinal] || 75;
      var minDown = total >= 1500000 ? 0.2 * total : 0.05 * Math.min(total, 500000) + 0.1 * Math.max(0, total - 500000);
      var q = Math.max(RATE + 0.02, 0.0525), carry = c.propTax * total + 1200 + 0.5 * c.condo * size * 12;
      var maxLoan = Math.max(0, 0.39 * inc - carry) / ann(q, 30);
      var loan = Math.min(total - minDown, maxLoan), ltv = loan / total;
      var prem = ltv > 0.9 ? 0.04 : ltv > 0.85 ? 0.031 : ltv > 0.8 ? 0.028 : 0;
      if (prem) prem += 0.002; // 30 年攤還加收 0.2%
      return {
        parts: [{ amt: loan * (1 + prem), rate: RATE, years: 30, grace: 0, label: prem ? '5 年固定（含房貸保險費 ' + Math.round(prem * 1000) / 10 + '%）' : '5 年固定' }],
        note: loan < total - minDown - 1 ? '壓力測試：月付不能超過收入 39%，要多付頭期款' : '',
        // 保險費加進貸款，所以實際自付的頭期款要扣回來
        downAdj: loan * prem
      };
    },

    // ---------- 就業保險育兒給付：薪資 55%（每週最多 729），等待期 1 週；要繳稅（約 15%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.max(0, Math.min(months * 52 / 12 - 1, both ? 27.5 : 50));
      return weeks * Math.min(EI_MAX_WEEK, 0.55 * g / 52) * 0.85 * nb;
    },

    // ---------- 稅與社保；兒童福利金 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, prov = c.prov;
      var gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 18; });
      var u6 = kids.filter(function (a) { return a < 6; }).length, o6 = kids.length - u6, u7 = kids.filter(function (a) { return a < 7; }).length;
      var n16 = kids.filter(function (a) { return a < 17; }).length - u7;
      // 托育費扣除：收入較低的一方扣（7 歲以下每人 8,000、7–16 歲 5,000，最多其收入 2/3）
      var dc = x.y.dc || 0, lowA = s.partner ? gA <= gB : true;
      var dcd = Math.min(dc, 8000 * u7 + 5000 * n16, (2 / 3) * (lowA ? gA : gB));
      var pa = person(gA, prov, lowA ? dcd : 0), pb = person(gB, prov, lowA ? 0 : dcd);
      var si = pa.si + pb.si, tx = pa.tax + pb.tax;
      var afni = pa.net + pb.net, n = kids.length, add = 0;
      if (n) {
        var i = Math.min(n, 4) - 1, red = afni <= CCB.t1 ? 0 : afni <= CCB.t2 ? CCB.r1[i] * (afni - CCB.t1) : CCB.r1[i] * (CCB.t2 - CCB.t1) + CCB.r2[i] * (afni - CCB.t2);
        add += Math.max(0, CCB.u6 * u6 + CCB.o6 * o6 - red);
        if (prov === 'ON') add += Math.max(0, 1762 * n - 0.08 * Math.max(0, afni - 26364)); // 安大略兒童津貼［ESTIMATE：2025 年金額 × 1.02］
        else if (prov === 'AB') { // 亞伯達兒童與家庭福利金：基本部分＋工作部分［NEWS 金額；遞減率 ESTIMATE］
          var base = 1529 + 764 * (n - 1), work = [782, 1494, 1920, 2061][i];
          add += Math.max(0, base - 0.06 * Math.max(0, afni - 28116));
          add += Math.max(0, Math.min(work, 0.15 * Math.max(0, gA + gB - 2760)) - 0.15 * Math.max(0, afni - 47115));
        }
      }
      if (x.tr && add) x.tr.allowance = (x.tr.allowance || 0) + add;
      return { si: si, tax: tx };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
  // 過戶稅：安大略與多倫多市各一份（首購各減免 4,000／4,475）；亞伯達只有登記費 §4.3［OFFICIAL 級距］
  function ltt(p, kind) {
    if (kind !== 'toronto') return 50 + 2 * Math.ceil(p / 5000) * 5;
    var b = [[55000, 0.005], [250000, 0.01], [400000, 0.015], [2000000, 0.02], [Infinity, 0.025]];
    var one = tax(p, b);
    return Math.max(0, one - 4000) + Math.max(0, one - 4475);
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
  K.person = person; K.ltt = ltt;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
