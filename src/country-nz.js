/* =========================================================================
   紐西蘭模組（奧克蘭、基督城）。金額為紐幣、2026 年水準。
   來源與可信度見 research/countries/nz.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人課稅、意外保險稅、自動加入的退休儲蓄（KiwiSaver，可提領買第一間房）、
   家庭工作補助（Working for Families：家庭稅務補助、在職補助、Best Start）、
   3–5 歲每週 20 小時免費幼教、托育補助與 FamilyBoost 退稅、26 週育嬰給付、
   沒有印花稅、房貸頭期款 2 成、租屋補助（Accommodation Supplement，存款多就不能領）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 17.88;   // 1 紐幣 = 17.88 台幣（2026-10-12）§1［SECONDARY］
  var RATE = 0.052; // 1–2 年固定房貸約 5.0–5.4%（2026-09；央行 9 月升息到 2.75%）§4.4［SECONDARY］

  // ---------- 制度參數（2026–27）§3 ----------
  var BR = [[15600, 0.105], [53500, 0.175], [78100, 0.30], [180000, 0.33], [Infinity, 0.39]]; // 所得稅（2024-07 起）［OFFICIAL］
  var ACC = 0.0175, ACC_MAX = 156641;   // 意外保險稅［SECONDARY］
  var KS = 0.035, KS_ER = 0.029;        // KiwiSaver：員工 3.5%；雇主 3.5% 扣掉雇主提撥稅後約 2.9%（不算在薪資裡）［SECONDARY／ESTIMATE］
  var WFF = { ftc1: 7921, ftc2: 6454, iwtc: 5070, iwtcExtra: 780, thr: 44900, rate: 0.275, best: 4041, bestThr: 79000, bestRate: 0.21 }; // ［SECONDARY］
  var PPL = 811.05;                     // 育嬰給付每週上限（2026-07 起），26 週［OFFICIAL］
  // 托育補助（Work and Income）：每小時最多 6.72、每週最多 50 小時；依家庭週收入遞減（孩子數不同門檻不同）［SECONDARY］
  var CCS = { rate: 6.72, hours: 45, full: [1131, 1301, 1457], stop: [2404, 2748, 3091] };
  var FB = { pct: 0.4, cap: 6240, thr: 140000, rate: 0.07 }; // FamilyBoost：托育自付額 4 成退稅，每季最多 1,560［SECONDARY］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的稅與社保：所得稅、意外保險稅、KiwiSaver；沒領家庭補助時另有獨立工作者抵稅（最多 520）
  function person(g, wff) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var ietc = !wff && g >= 24000 && g <= 70000 ? (g <= 66000 ? 520 : Math.max(0, 520 - 0.13 * (g - 66000))) : 0;
    return { si: ACC * Math.min(g, ACC_MAX) + KS * g, tax: Math.max(0, tax(g, BR) - ietc) };
  }

  var K = {
    id: 'NZ', name: '紐西蘭', cur: 'NZD', curName: '紐幣', flag: '🇳🇿',
    fx: { toTWD: FX, pppToTWD: 9.6, date: '2026-10-12' }, // PPP：紐西蘭約 1.42、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['Stats NZ 2026 年 6 月週薪中位數（Figure.NZ）', 'https://figure.nz/chart/tsPtbVNvycc0iL4w-tZPxwbEKXYxHJu9S'],
      ['Working for Families 2026–27 金額', 'https://nztax.tools/tax-insights/working-for-families-rates-2026-27/'],
      ['2026-04 薪資相關變更（ACC、KiwiSaver、最低工資）', 'https://www.payhero.co.nz/blog/EOFY2026-april-payroll-changes'],
      ['育嬰給付 2026-07 起（IRD）', 'https://www.ird.govt.nz/updates/news-folder/2026/paid-parental-leave'],
      ['托育補助、20 小時免費幼教、FamilyBoost', 'https://moneybalance.co.nz/personal-finance/cost-of-living/childcare-costs-nz/'],
      ['租屋補助計算方式 2026', 'https://nztax.tools/accommodation-supplement-calculator/'],
      ['房價 2026-08（Opes Partners）', 'https://www.opespartners.co.nz/property-markets/nz-property-market-update'],
      ['租金（Tenancy Services 整理）', 'https://www.calculate.co.nz/reference/nz-average-rent.php'],
      ['房貸利率與央行利率 2026-09', 'https://www.calculate.co.nz/reference/nz-interest-rates.php'],
      ['Stats NZ 家庭支出 2023（Figure.NZ）', 'https://figure.nz/chart/t1esyohiJmbcElex'],
      ['匯率 NZD／TWD', 'https://www.poundsterlinglive.com/data/currencies/nzd-pairs/NZDTWD-exchange-rate']
    ],
    notes: [
      '紐西蘭是個人分開課稅（10.5%–39%），另繳 1.75% 意外保險稅；大多數人自動加入退休儲蓄 KiwiSaver（自付 3.5%，雇主另提撥），買第一間房時可以領出來。',
      '有孩子的家庭可領「家庭稅務補助」與「在職補助」，家庭年收入超過 44,900 後每多 1 元少 0.275；0–2 歲另有 Best Start（每個孩子每年約 4,041）。',
      '3–5 歲每週 20 小時免費幼教；0–2 歲托育全自費，中低收入有托育補助，另可用 FamilyBoost 退回自付額的 4 成。',
      '育嬰給付 26 週，每週最多 811 紐幣（要繳稅）。',
      '沒有印花稅；房貸頭期款 2 成，借款也受收入限制。',
      '租屋補助（Accommodation Supplement）要家庭存款 16,200 以下才能領，所以多數有存款的家庭領不到。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2026 年 6 月受僱者週薪中位數：男 1,538、女 1,280（含部分工時）［OFFICIAL：Stats NZ］；全職約 1,500 × 52 ≈ 78,000［ESTIMATE］
      median: 78000,
      // 最低工資 23.95 × 2,080 ≈ 49,800（約 0.64）［DERIVED］；其餘形狀［ESTIMATE］
      q: [[10, 0.64], [20, 0.72], [25, 0.76], [30, 0.81], [40, 0.90], [50, 1], [60, 1.10], [70, 1.22], [75, 1.30], [80, 1.40], [90, 1.72], [95, 2.10]],
      paretoAlpha: 2.8,
      ageSpread: 0.85,
      age: [[22, 0.66], [25, 0.78], [30, 0.93], [35, 1.03], [40, 1.08], [45, 1.10], [50, 1.10], [55, 1.08], [60, 1.04], [63, 1.0]], // ［ESTIMATE］
      bonus: 0.2
    },
    CHECK_SALARIES: [50000, 62000, 78000, 100000, 140000, 200000],

    // ---------- 城市 ----------
    CITY: {
      auckland: {
        id: 'auckland', name: '奧克蘭', short: '奧克蘭', capital: false,
        cons: 1.08,
        rentW: [480, 600, 700, 850], rentAdj: 1.0, // 每週租金（1–4 房）：全部約 680、3 房約 730［SECONDARY］→ 依房數［ESTIMATE］
        asMax: 305,                                // 租屋補助上限（第 1 區，有孩子的家庭）［SECONDARY］
        price: 8000, priceNew: 8800,               // 每 ㎡：房價中位數 95 萬（2026-08）÷ 3 房約 115 ㎡［DERIVED］
        rates: 3900, ins: 3000, maint: 1500,       // 地方稅、房屋保險、維修（每年）［ESTIMATE］
        park: 0, tpass: 200,
        ece: 475, ece35: 250, ecePremium: 560,     // 托育每週全日收費：0–2 歲、3–5 歲（扣掉 20 小時免費後）、高價位［ESTIMATE］
        oscar: 5500,                               // 課後與假期照顧每年［ESTIMATE］
        privSchool: 25000, intl: 32000,
        hobby: 60, cram: { none: 0, some: 240, full: 600 },
        doula: 3000, nurse: 3500
      },
      christchurch: {
        id: 'christchurch', name: '基督城', short: '基督城', capital: false,
        cons: 0.97,
        rentW: [400, 490, 560, 650], rentAdj: 1.0, // 全部約 540、2 房 500、3 房 540［SECONDARY］
        asMax: 220,                                // 第 2 區
        price: 6000, priceNew: 6400,               // 坎特伯雷房價中位數 70 萬（2026-08）［SECONDARY／DERIVED］
        rates: 3800, ins: 3500, maint: 1300,       // 地震保險較貴［ESTIMATE］
        park: 0, tpass: 110,
        ece: 400, ece35: 200, ecePremium: 470,
        oscar: 4800,
        privSchool: 22000, intl: 27000,
        hobby: 55, cram: { none: 0, some: 220, full: 520 },
        doula: 2600, nurse: 3000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：Stats NZ 2023 每戶每週約 1,597.5 −住房與水電 398 = 1,199.5 ÷ 每戶約 2.65 人 × 52 ÷ 12 ≈ 1,961
      // × 物價 2023→2026 約 1.09 × 0.716 ≈ 1,530，取 1,500［DERIVED／ESTIMATE］§5
      adultBase: 1500, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 750], [2, 645], [6, 810], [12, 1065], [18, 1185]], // 台灣「孩子／大人」比例 × 紐西蘭大人開銷［ESTIMATE］
      utilBase: 150, utilPerPerson: 45, // 電、網路、水（租金不含）［ESTIMATE］
      gearFirst: { frugal: 1500, normal: 3000, comfy: 6000 }, gearLater: 1000,
      postpartumFamily: 300,  // 公費助產士照護免費［OFFICIAL 制度］
      grandPaid: 0, helper: 0,
      auPair: 1800,           // 互惠生每月（零用錢＋食宿）［ESTIMATE］
      uniAwayRent: 1300,      // 學生宿舍每月［ESTIMATE］
      master: 9000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.3, life: 8, run: 4000 }, // 油錢、保險、驗車、牌照［ESTIMATE］
        new: { buy: 38000, resale: 0.4, life: 10, run: 4200 },
        import: { buy: 60000, resale: 0.45, life: 10, run: 5000 }
      },
      scooter: { buy: 4000, resale: 0.3, life: 8, run: 800 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 30000, // 65 歲起國民年金（已婚每人約 2.7 萬）＋ KiwiSaver［ESTIMATE］
      houseSize: { 1: 60, 2: 85, 3: 115, 4: 145 },
      reno: { basic: 80, light: 300, full: 1000 },
      closing: { used: 0.005, new: 0.004 }, homeInsurance: 0,
      rentFactor: 1
    },

    // 0–2 歲托育，3–4 歲幼教（每週 20 小時免費），5 歲上小學，11 歲中間學校，13 歲中學，18 歲大學
    BANDS: { care: 3, es: 5, jh: 11, sh: 13, uni: 18 },
    // 育嬰給付 26 週：一人請約 6 個月；夫妻分著請各約 3 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3 : 6; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（存款少時可領租屋補助）', buy: '買房（頭期款 2 成，可提領 KiwiSaver，沒有印花稅）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案（連棟屋）' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（1–2 年固定，30 年攤還）' },
      postpartum: { center: '產後休養旅館', nanny: '夜間保母 2 週', family: '公費助產士到府＋家人幫忙' },
      leave: { none: '不請育嬰假', A: '我請 26 週育嬰給付（每週最多 811）', B: '伴侶請 26 週育嬰給付', both: '夫妻分著請（各約 13 週給付）' },
      care: { quasi: '托育中心（全自費，中低收入有補助）', public: '托育中心（全自費，中低收入有補助）', private: '高價位托育中心', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '幼教中心（每週 20 小時免費）', quasi: '幼教中心（每週 20 小時免費）', private: '私立幼教中心（20 小時免費＋加收）', bilingual: '雙語幼教中心', home: '在家照顧' },
      school: { public: '公立學校（免學費，學校募款）', privateJH: '11 歲起讀私立學校', private: '私立學校', intl: '國際文憑（IB）私校' },
      after: { none: '不上課後班', anqin: '課後與假期照顧（OSCAR）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（NCEA）' },
      uni: { public: '大學（學費約 8,500，最後一年免學費）', private: '大學（學費約 8,500，最後一年免學費）', mixed: '大學（學費約 8,500，最後一年免學費）' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（公費醫療）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 家庭補助依所得計算，放在 taxes()
    // 0–2 歲托育：全日收費；托育補助（每小時最多 6.72）＋ FamilyBoost 退 4 成
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var wk = careMonths * 52 / 12, fee = (cs === 'private' ? c.ecePremium : c.ece) * wk;
        var sub = Math.min(fee, ccs(x) * CCS.hours * wk); fee -= sub;
        var fb = boost(x, fee); fee -= fb;
        return { fee: fee, sub: sub + fb };
      }
      if (cs === 'helper') return { fee: C.auPair * careMonths };
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      return {};
    },
    // 3–4 歲：每週 20 小時免費（只統計，約每小時 13）；其餘時數照收，可領托育補助與 FamilyBoost
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var w = ps === 'private' || ps === 'bilingual' ? c.ece35 * 1.3 : c.ece35, fee = w * 52;
      var sub = Math.min(fee, ccs(x) * (CCS.hours - 20) * 52); fee -= sub;
      var fb = boost(x, fee); fee -= fb;
      return { fee: fee, kg: 20 * 13 * 48 + sub + fb };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : level === 'es' ? 600 : level === 'jh' ? 800 : 1200; // 公立：學校募款、制服、文具與筆電、NCEA 報名
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        extra = (s.after !== 'none' ? c.oscar : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 大學 4 年：學費約 8,500；最後一年免學費（簡化成第 3 年）［NEWS／ESTIMATE］
    uni: function (x, k, a) { return a === 20 ? { fee: 0, sub: 8500 } : { fee: 8500, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentW[r - 1] * 52 / 12 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 租屋補助（有孩子的家庭）：(週租金 − 205) × 70%，上限依地區；家庭週收入超過 1,117 每 1 元少 0.25；存款 16,200 以上不能領［SECONDARY］
    rentSubsidy: function (x) {
      var s = x.s;
      if ((x.persons || 1) < 3 || (x.S || 0) > 16200) return;
      var wr = (x.rentM || 0) * 12 / 52, inc = ((x.gA || 0) + (s.partner ? x.gB || 0 : 0)) / 52;
      var as = Math.min(x.c.asMax, 0.7 * Math.max(0, wr - 205)) - 0.25 * Math.max(0, inc - 1117);
      if (as > 0) x.tr.rent = as * 52;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = 3500; // 律師、驗屋、土地資訊報告；沒有印花稅［ESTIMATE］
      h.mgmt = c.maint; h.tax = c.rates; h.ins = c.ins;
      return h;
    },
    // 房貸：最多房價 8 成、30 年；借款不超過年收入 6 倍（央行 DTI），且以 7% 試算的月付不超過稅前收入約 38%［OFFICIAL 規則；比例 ESTIMATE］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.8, 6 * inc, 0.38 * inc / ann(0.07, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '銀行房貸（1–2 年固定，到期重新議價）' }], note: amt < total * 0.8 - 1 ? '借款受收入限制，要多付頭期款' : '' };
    },

    // ---------- 育嬰給付：每週 min(週薪, 811.05)，最多 26 週；要繳稅（以 83% 計）----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var weeks = Math.min(26, months * 52 / 12);
      return weeks * Math.min(g / 52, PPL) * nb * 0.83;
    },

    // ---------- 稅、社保、家庭補助；KiwiSaver 買第一間房時提領 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0, F = gA + gB;
      var kids = (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; });
      // 家庭稅務補助＋在職補助，家庭收入超過 44,900 後每 1 元少 0.275（先減家庭稅務補助）
      var wff = 0;
      if (kids.length) {
        var ftc = WFF.ftc1 + WFF.ftc2 * (kids.length - 1);
        var iwtc = F > 0 ? WFF.iwtc + WFF.iwtcExtra * Math.max(0, kids.length - 3) : 0;
        wff = Math.max(0, ftc + iwtc - WFF.rate * Math.max(0, F - WFF.thr));
        // Best Start：0–2 歲每個孩子 4,041，家庭收入超過 79,000 每 1 元少 0.21；出生那年領育嬰給付的月份不能領
        var lm = (x.lmA || 0) + (x.lmB || 0), best = 0;
        kids.forEach(function (a) { if (a <= 2) best += WFF.best * (a === 0 ? Math.max(0, 12 - lm) / 12 : 1); });
        best = Math.max(0, best - WFF.bestRate * Math.max(0, F - WFF.bestThr));
        if (x.tr) x.tr.allowance += wff + best;
      }
      var pa = person(gA, wff > 0), pb = person(gB, wff > 0);
      // KiwiSaver：買房前每年累積員工＋雇主提撥（年報酬約 3%），買第一間房那年提領（各留 1,000）
      if (x.tr && s.housing === 'buy') {
        if (!x.t) x.ksBal = 0; // 和新加坡公積金一樣，從模擬開始那年起算
        if (x.ly == null || x.ly < 0) x.ksBal = (x.ksBal || 0) * 1.03 + (KS + KS_ER) * F;
        else if (x.ly === 0 && x.ksBal) { x.tr.fund = (x.tr.fund || 0) + Math.max(0, x.ksBal - (s.partner ? 2000 : 1000)); x.ksBal = 0; }
      }
      return { si: pa.si + pb.si, tax: pa.tax + pb.tax };
    }
  };

  // 托育補助每小時金額：家庭週收入在「全額」與「停止」門檻間線性遞減；夫妻都要有工作
  function ccs(x) {
    var s = x.s;
    if (!((x.gA || 0) > 0) || (s.partner && !((x.gB || 0) > 0))) return 0;
    var n = Math.min(3, Math.max(1, (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; }).length)) - 1;
    var wk = ((x.gA || 0) + (s.partner ? x.gB || 0 : 0)) / 52;
    return CCS.rate * U.clamp((CCS.stop[n] - wk) / (CCS.stop[n] - CCS.full[n]), 0, 1);
  }
  // FamilyBoost：自付托育費的 4 成，每個家庭每年最多 6,240，家庭收入超過 14 萬每 1 元少 0.07
  function boost(x, fee) {
    var F = (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0);
    var cap = Math.max(0, FB.cap - FB.rate * Math.max(0, F - FB.thr)) - (x.y.fb || 0);
    var v = Math.max(0, Math.min(FB.pct * fee, cap));
    x.y.fb = (x.y.fb || 0) + v;
    return v;
  }
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
