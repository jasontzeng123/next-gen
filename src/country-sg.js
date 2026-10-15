/* =========================================================================
   新加坡模組（城市國家，一個城市）。金額為新加坡幣、2026 年水準。
   來源與可信度見 research/countries/sg.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：中央公積金（員工 20%＋雇主 17%，其中約 23% 進「普通帳戶」可付頭期款與房貸）、所得稅很低、
   嬰兒花紅與兒童發展帳戶、托育中心有政府補助與收費上限、組屋（HDB）有購屋津貼與 2.6% 組屋貸款、
   請外籍幫傭很普遍、買車要先標擁車證（COE）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 24.94;  // 1 新加坡幣 = 24.94 台幣（2026-10-12）§1［SECONDARY］
  var HDB_RATE = 0.026; // 組屋貸款利率（公積金普通帳戶利率 + 0.1%）§4.4［OFFICIAL］

  // ---------- 制度參數（2026）§3 ----------
  var BR = [[20000, 0], [30000, 0.02], [40000, 0.035], [80000, 0.07], [120000, 0.115], [160000, 0.15], [200000, 0.18], [240000, 0.19], [280000, 0.195], [320000, 0.20], [500000, 0.22], [1000000, 0.23], [Infinity, 0.24]]; // ［OFFICIAL：IRAS］
  var CPF_CAP = 102000; // 每年計算公積金的薪資上限（月薪上限 8,000 起）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 公積金：員工、雇主費率與普通帳戶（可買房）的比例，依年齡 §3.2［OFFICIAL：2026 年費率］
  function cpfRates(age) {
    if (age <= 35) return { ee: 0.20, er: 0.17, oa: 0.23 };
    if (age <= 45) return { ee: 0.20, er: 0.17, oa: 0.21 };
    if (age <= 50) return { ee: 0.20, er: 0.17, oa: 0.19 };
    if (age <= 55) return { ee: 0.20, er: 0.17, oa: 0.15 };
    if (age <= 60) return { ee: 0.18, er: 0.16, oa: 0.12 };
    return { ee: 0.125, er: 0.125, oa: 0.035 };
  }
  // 托育補助：基本補助（雙薪）＋額外補助（家庭月收入 12,000 以下，越低越多）§6.2［OFFICIAL 金額；額外補助的形狀 ESTIMATE］
  function careNet(fee, basic, asMax, inc) {
    var as = inc >= 12000 ? 0 : asMax * Math.min(1, (12000 - inc) / 9000);
    var minCo = U.clamp(3 + (inc - 3000) / 9000 * 97, 3, 100);
    return Math.max(minCo, fee - basic - as);
  }

  var K = {
    id: 'SG', name: '新加坡', cur: 'SGD', curName: '新加坡幣', flag: '🇸🇬',
    fx: { toTWD: FX, pppToTWD: 16.4, date: '2026-10-12' }, // PPP：新加坡約 0.83、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['人力部 2025 勞動力調查（收入分布，SmartCalculator 整理）', 'https://www.smartcalculator.sg/articles/singapore-income-percentiles-2026'],
      ['人力部 2025 勞動力調查重點', 'https://stats.mom.gov.sg/iMAS_Tables1/LabourForce/LabourForce_2025/mrsd_2025LabourForce_survey_highlights.pdf'],
      ['各年齡收入中位數 2025（Dollars and Sense 整理）', 'https://dollarsandsense.sg/earning-much-peers-much-average-salary-singapore-every-age-group/'],
      ['統計局 2023 家庭支出調查', 'https://www.singstat.gov.sg/-/media/files/visualising_data/infographics/households/HES-householdexpenditure.pdf'],
      ['建屋局 2026 Q2 組屋租金', 'https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260724-2nd-quarter-2026-public-housing-data-and-upcoming-flat-supply/Annex-D.pdf'],
      ['組屋轉售價 2026 Q3', 'https://propkaki.sg/market/questions/how-much-does-a-4-room-hdb-cost'],
      ['組屋轉售價指數 2026 Q3（EdgeProp）', 'https://www.edgeprop.sg/property-news/hdb-resale-prices-dip-02-q-o-q-3q2026-while-transaction-volumes-surge-hdb-flash-estimates'],
      ['托育補助 2026（SmartCalculator）', 'https://www.smartcalculator.sg/articles/childcare-infant-care-subsidy-guide-sg-2026']
    ],
    notes: [
      '只算新加坡公民家庭（可申請組屋與各項補助）。',
      '公積金：員工自付 20%（雇主另付 17%），其中約 23% 進普通帳戶，可付組屋頭期款與房貸；租屋時不能用，錢鎖在帳戶裡。',
      '所得稅很低：年薪 6 萬多約只繳 1,000 多元。',
      '每個孩子有嬰兒花紅現金 11,000（第三胎起 13,000）＋兒童發展帳戶（政府撥款與 1:1 配對，用於托育）。',
      '托育中心（政府指定業者）每月收費上限約 610，雙薪家庭每月至少補 300，收入較低補更多。',
      '買組屋：首購有購屋津貼（收入越低越多），組屋貸款利率 2.6%；新組屋（BTO）家庭月收入上限 16,000，實際要等 3–4 年才能入住（模型沒有算等待期）。',
      '買車要先標擁車證，新車約 18 萬新加坡幣。'
    ],

    // ---------- 薪資（全職受僱居民，全年）§2 ----------
    W: {
      // 2025 年全職受僱居民月收入中位數 5,000（不含雇主公積金，含 1/12 年終）［OFFICIAL via SECONDARY］× 12 × 2026 年約 1.04 ≈ 62,000［DERIVED］
      median: 62000,
      // 分位：P20 2,817（0.563）、P90 約 13,500（2.7）［OFFICIAL via SECONDARY］；其他以對數內插；高所得端很長［ESTIMATE］
      q: [[10, 0.45], [20, 0.563], [25, 0.62], [30, 0.68], [40, 0.84], [50, 1], [60, 1.18], [70, 1.42], [75, 1.58], [80, 1.78], [90, 2.7], [95, 3.6]],
      paretoAlpha: 2.0,
      ageSpread: 0.85,
      // 年齡：各年齡收入中位數（25–29 歲 4,333、30–34 歲 5,417、35–39 歲 6,250、40–44 歲 6,750、45–49 歲 6,608、50–54 歲 5,958、55–59 歲 4,410）÷ 5,775［DERIVED］
      age: [[22, 0.49], [27, 0.75], [32, 0.94], [37, 1.08], [42, 1.17], [47, 1.14], [52, 1.03], [57, 0.80], [63, 0.55]],
      bonus: 1
    },
    CHECK_SALARIES: [36000, 50000, 62000, 90000, 150000, 250000],

    // ---------- 城市 ----------
    CITY: {
      singapore: {
        id: 'singapore', name: '新加坡', short: '新加坡', capital: true,
        cons: 1.0,
        // 整間組屋租金（2026 Q2 各區中位數的平均）：3 房式約 2,850、4 房式 3,500、5 房式 3,780［OFFICIAL：HDB，DERIVED 平均］；1 房（2 房式或小公寓）［ESTIMATE］§4.1
        rent: [2500, 2850, 3500, 3800], rentAdj: 1.0,
        // 4 房式轉售中位數 628,000（2026 Q3）÷ 93 ㎡ ≈ 6,750；BTO 非成熟區 4 房式約 48 萬 → 約 5,200［OFFICIAL via SECONDARY／ESTIMATE］§4.2
        price: 6750, priceNew: 5200,
        mgmt: 0.9, propTax: 300, // 市鎮會雜費（每 ㎡ 每月）、自住組屋房地稅（每年）［ESTIMATE］
        park: 110, tpass: 120, // 組屋停車月票；大眾運輸每人每月（沒有成人月票）［ESTIMATE］
        infant: 1110, cc: 610, ccPremium: 1800, // 指定業者嬰兒托育、全日托育收費上限；高價私立托育［ESTIMATE］
        studentCare: 350, privateFees: 30000, intl: 45000,
        hobby: 150, cram: { none: 0, some: 400, full: 1200 }, // 補習在新加坡非常普遍［ESTIMATE］
        uniFee: 8500,
        doula: 2000, nurse: 3500 // 坐月子保母（confinement nanny）約 3,500–4,500／28 天［ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2023 家庭支出調查每戶每月 5,931（不含自有住宅設算租金）− 住房與水電 550 = 5,381 ÷ 3.0 人
      // × 0.716 = 1,284 × 物價 2023→2026 約 1.06 ≈ 1,360［DERIVED］§5.1
      adultBase: 1360, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 680], [2, 585], [6, 734], [12, 966], [18, 1074]], // 台灣「孩子／大人」比例 × 新加坡大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 45,
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 500,
      grandPaid: 0,
      helper: 1100, // 外籍家庭幫傭：薪資約 700＋人頭稅（有 16 歲以下孩子 60）＋食宿保險［ESTIMATE］
      uniAwayRent: 0,
      master: 15000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 80000, resale: 0.1, life: 5, run: 7000 },   // 擁車證剩 5 年左右的中古車；保險、路稅、電子道路收費、油錢［ESTIMATE］
        new: { buy: 180000, resale: 0.1, life: 10, run: 7500 }, // 含擁車證（10 年）
        import: { buy: 280000, resale: 0.1, life: 10, run: 9000 }
      },
      scooter: { buy: 15000, resale: 0.1, life: 10, run: 1500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 20000, // 65 歲後每人每年：公積金終身入息（CPF LIFE）［ESTIMATE］
      houseSize: { 1: 45, 2: 68, 3: 93, 4: 113 }, // 2 房式／3 房式／4 房式／5 房式組屋［OFFICIAL 標準面積的近似］
      reno: { basic: 100, light: 400, full: 1000 },
      closing: { used: 0.02, new: 0.02 }, homeInsurance: 300, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 3–6 歲讀幼兒園（K1–K2 在 5–6 歲），7 歲上小學，13 歲上中學，17–18 歲讀初級學院，19 歲上大學（男生多先服兵役 2 年，模型沒有算）
    BANDS: { care: 3, es: 7, jh: 13, sh: 17, uni: 19 },
    // 產假 16 週（全薪）＋陪產假 4 週＋共享育兒假 10 週（2026-04 起）：一人請 6 個月，夫妻各 3.5 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3.5 : 6; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) {
      ls.loan = 'bank';
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租整間組屋', buy: '買組屋（首購津貼、公積金付頭期款與房貸）', family: '和長輩同住（等新組屋時很常見）' },
      build: { used: '轉售組屋', new: '新組屋 BTO（家庭月收入 16,000 以下，要等 3–4 年）' },
      loan: { qingan: '沒有新青安，改用組屋貸款（2.6%）', qinganNoGrace: '沒有新青安，改用組屋貸款（2.6%）', bank: '組屋貸款（2.6%，最多 25 年）' },
      postpartum: { center: '月子中心很少：請坐月子保母（28 天）', nanny: '坐月子保母（28 天）', family: '家人幫忙坐月子' },
      leave: { none: '不請育嬰假', A: '我請 6 個月（產假＋共享育兒假約 26 週全薪，每週上限 2,500）', B: '伴侶請 6 個月（約 26 週全薪）', both: '夫妻各請 3.5 個月（全薪）' },
      care: { quasi: '指定業者托育中心（收費上限＋政府補助）', public: '指定業者托育中心（收費上限＋政府補助）', private: '私立托育中心（政府補助）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '請外籍家庭幫傭', quit: '一方離職在家照顧' },
      preschool: { public: '指定業者幼兒園（全日）', quasi: '指定業者幼兒園（全日）', private: '私立幼兒園', bilingual: '私立雙語幼兒園', home: '在家照顧' },
      school: { public: '政府學校（公民免學費）', privateJH: '13 歲起讀私立或國際學校', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學生託管中心', anqin1: '學生託管＋1 項才藝', anqin3: '學生託管＋3 項才藝' },
      cram: { none: '不補習', some: '補習（每週 1–2 堂）', full: '密集補習（小六會考、O 水準）' },
      uni: { public: '公立大學（政府資助學費）', private: '公立大學（政府資助學費）', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車（擁車證較便宜）', used: '中古車（含剩餘擁車證）', new: '新車（含擁車證）', import: '進口車（含擁車證）' }
    },

    // ---------- 生產：嬰兒花紅＋兒童發展帳戶（政府撥款＋1:1 配對）；第三胎起另有大家庭現金 §6.1 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle, third = k >= 2;
      var pp = s.postpartum === 'center' || s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      x._ptr = (x._ptr || 0) + [5000, 10000, 20000][Math.min(k, 2)]; // 生育稅務回扣（可分年抵稅）
      var bonus = third ? 13000 : 11000, cda = third ? 10000 + 12000 : 5000 + 6000;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 6000 : 1500), grant: bonus + cda, local: 0 }; // 公立醫院生產自付約 1,500，私立約 7,500
    },
    // 大家庭方案：第三胎起，前 6 年共 16,000 現金［NEWS／ESTIMATE］
    allowance: function (x, k, a) { return k >= 2 && a < 6 ? 16000 / 6 : 0; },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var inc = famInc(x) / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var inf = a === 0 ? 1 : a === 1 ? 0.5 : 0; // 18 個月以下算嬰兒托育
        var g = cs === 'private' ? c.ccPremium * (1 + 0.5 * inf) : c.infant * inf + c.cc * (1 - inf);
        var net = inf * careNet(cs === 'private' ? c.ccPremium * 1.5 : c.infant, 600, 710, inc) + (1 - inf) * careNet(cs === 'private' ? c.ccPremium : c.cc, 300, 467, inc);
        fee = net * careMonths; sub = (g - net) * careMonths;
      } else if (cs === 'helper') x.helperMonths = Math.max(x.helperMonths || 0, careMonths); // 外籍幫傭（一個家庭一位）
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var inc = famInc(x) / 12, g = ps === 'private' ? c.ccPremium : ps === 'bilingual' ? c.ccPremium * 1.15 : c.cc;
      var net = careNet(g, 300, 467, inc);
      return { fee: net * 12, kg: (g - net) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees : ({ es: 650, jh: 800, sh: 900 })[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.studentCare * 12 : 0) + hobbies * c.hobby * 12 + (c.cram[s.cram] || 0) * 0.5 * 11; // 小學也很多人補習
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 組屋：BTO 家庭月收入上限 16,000，超過改買轉售組屋；首購津貼（加強版 EHG＋轉售家庭津貼）直接抵房價 §4.3
    housePlan: function (x) {
      var C = x.C, c = x.c, s = x.s, inc = (incomeAt(x, 'A', x.tb) + incomeAt(x, 'B', x.tb)) / 12;
      var keep = s.build;
      if (s.build === 'new' && inc > 16000) s.build = 'used';
      var h;
      try { h = WD.stdHousePlan(x); } finally { s.build = keep; }
      var ehg = inc <= 1500 ? 120000 : inc <= 9000 ? Math.max(5000, 120000 - 5000 * Math.ceil((inc - 1500) / 500)) : 0;
      var fam = (s.build !== 'new' || inc > 16000) && inc <= 16000 ? (h.rooms >= 4 ? 50000 : 80000) : 0;
      var grant = ehg + fam;
      h.grant = grant;
      h.closing = bsd(h.total) + 3000; // 印花稅＋律師與手續費
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax;
      var useDown = Math.min(h.down, grant), left = grant - useDown;
      h.down -= useDown;
      if (left > 0 && h.parts && h.parts[0]) { var cut = Math.min(left, h.parts[0].amt); h.parts[0].amt -= cut; h.loanAmt -= cut; }
      return h;
    },
    // 組屋貸款：最多房價 75%、25 年；月付不能超過家庭月收入 30% §4.4［OFFICIAL］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.75, 0.30 * inc / ann(HDB_RATE, 25)));
      return { parts: [{ amt: amt, rate: HDB_RATE, years: 25, grace: 0, label: '組屋貸款 2.6%' }], note: amt < total * 0.75 - 1 ? '月付不能超過收入 30%' : '' };
    },

    // ---------- 育兒假：政府給付全薪，每週上限 2,500；一人最多約 26 週，夫妻共用時各約 15 週 §6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 15 : 26);
      return weeks * Math.min(2500, g / 52) * 0.8 * nb; // 照薪資扣公積金（約 2 成，進帳戶）
    },

    // ---------- 稅與公積金 §3 ----------
    taxes: function (x) {
      var s = x.s, t = x.t;
      if (!t) { x._oaBal = 0; }
      var kids = (x.atHome || []).filter(function (a) { return a < 19; });
      var ppl = [{ g: x.gA || 0, age: s.ageA + t }, { g: s.partner ? x.gB || 0 : 0, age: s.ageB + t }];
      // 子女扣除：合格子女扣除每人 4,000 給收入較高者；在職母親子女扣除（第 1、2、3 胎起 8,000／10,000／12,000）給另一方［OFFICIAL 金額］
      var hiIdx = ppl[0].g >= ppl[1].g ? 0 : 1, wm = 0;
      kids.forEach(function (a, i) { if (a < 16) wm += [8000, 10000, 12000][Math.min(i, 2)]; });
      var si = 0, tx = 0, eeOA = 0, erOA = 0;
      ppl.forEach(function (p, i) {
        if (!(p.g > 0)) return;
        var r = cpfRates(p.age), base = Math.min(p.g, CPF_CAP);
        var ee = r.ee * base, oa = r.oa * base;
        si += ee; eeOA += oa * r.ee / (r.ee + r.er); erOA += oa * r.er / (r.ee + r.er);
        var relief = 1000 + ee + (i === hiIdx ? 4000 * kids.length : 0) + (s.partner && i !== hiIdx ? wm : !s.partner ? wm : 0);
        tx += tax(Math.max(0, p.g - Math.min(relief, 80000 + ee)), BR);
      });
      // 生育稅務回扣：從應繳稅額扣，用不完留到之後
      var ptr = Math.min(x._ptr || 0, tx); tx -= ptr; x._ptr = (x._ptr || 0) - ptr;
      // 普通帳戶：買房後付房貸與頭期款；租屋或住長輩家時不能用（鎖到 55 歲後）
      var avail = (x._oaBal || 0) + eeOA + erOA;
      var owner = !x.renting && x.ly >= 0;
      var outlay = owner && x.e ? x.e.housing + x.e.housingOnce : 0;
      var use = Math.min(avail, outlay);
      x._oaBal = avail - use;
      // 員工自付的普通帳戶部分：拿來付房子就不算損失；雇主提撥或之前存的部分算成「公積金補助」
      var own = Math.min(use, eeOA);
      if (x.tr) x.tr.fund = (x.tr.fund || 0) + Math.max(0, use - eeOA);
      return { si: si - own, tax: tx };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  function famInc(x) { return (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0); }
  // 買方印花稅（BSD）：前 18 萬 1%、次 18 萬 2%、次 64 萬 3%、次 50 萬 4%、次 150 萬 5%、其餘 6%［OFFICIAL］
  function bsd(p) { return tax(p, [[180000, 0.01], [360000, 0.02], [1000000, 0.03], [1500000, 0.04], [3000000, 0.05], [Infinity, 0.06]]); }
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
  K.bsd = bsd;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
