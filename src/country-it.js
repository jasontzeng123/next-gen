/* =========================================================================
   義大利模組（羅馬、杜林）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/it.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）。
   特色：個人課稅（IRPEF 2026 年中間級距降到 33%）、低薪的「勞動稅楔」減免、單一兒童津貼（依家庭經濟指標 ISEE）、
   托嬰補助（bonus nido）、3 歲起幼兒學校免費、5 個月產假（8 成薪，多數由公司補到全薪）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768;  // 1 歐元 = 35.768 台幣（2026-10-09，與法國、德國相同）
  var RATE = 0.035; // 固定利率房貸平均 3.46%（Facile.it，2026-09）§4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var IRPEF = [[28000, 0.23], [50000, 0.33], [Infinity, 0.43]];          // ［NEWS：2026 年預算法］
  var INPS_EE = 0.0949;                                                  // 員工社會保險（9.19% 年金＋0.3%）［OFFICIAL］
  var AUU = { max: 203.8, min: 58.3, lo: 17468.51, hi: 46582.71, dual: 34.9, third: [99.10, 17.5] }; // 單一兒童津貼（每月；INPS 2026-01-30 第 7 號通函）［OFFICIAL；第三胎加給下限 ESTIMATE］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的 IRPEF＋地方附加稅（依收入級距）＋勞動稅楔減免
  function person(g, c) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var si = INPS_EE * g + 0.01 * Math.max(0, g - 56224), ti = g - si;
    var gross = tax(ti, IRPEF);
    var det = ti <= 15000 ? Math.max(690, 1955) : ti <= 28000 ? 1910 + 1190 * (28000 - ti) / 13000 : ti <= 50000 ? 1910 * (50000 - ti) / 22000 : 0;
    var extra = ti <= 20000 ? 0 : ti <= 32000 ? 1000 : ti <= 40000 ? 1000 * (40000 - ti) / 8000 : 0; // 2–4 萬的額外扣抵
    var t = Math.max(0, gross - det - extra);
    var bonus = ti <= 20000 ? g * (g <= 8500 ? 0.071 : g <= 15000 ? 0.053 : 0.048) : 0;          // 2 萬以下的免稅補貼
    var reg = tax(ti, c.addReg) + c.addCom * ti;                                                   // 大區與市的附加稅
    return { si: si, tax: Math.max(-bonus, t - bonus) + reg };
  }
  // 家庭經濟指標（ISEE，簡化）：所得扣 20%（每人最多 3,000）、房租（最多 7,000）＋ 20% 存款，除以家庭人數權重 §3.3［簡化 ESTIMATE］
  function isee(x) {
    var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
    var isr = gA - Math.min(0.2 * gA, 3000) + gB - Math.min(0.2 * gB, 3000) - (x.renting ? Math.min((x.rentM || 0) * 12, 7000) : 0);
    var isp = 0.2 * Math.max(0, (x.S || 0) - 10000);
    var n = x.persons || 1, kids = (x.atHome || []).filter(function (a) { return a < 18; }).length;
    var scale = [1, 1, 1.57, 2.04, 2.46, 2.85][Math.min(n, 5)] + 0.35 * Math.max(0, n - 5) + (kids >= 3 ? 0.2 : 0) + (gA > 0 && gB > 0 && kids ? 0.2 : 0);
    return Math.max(0, isr + isp) / scale;
  }

  var K = {
    id: 'IT', name: '義大利', cur: 'EUR', curName: '歐元', flag: '🇮🇹',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 21.5, date: '2026-10-09' }, // PPP：義大利約 0.63、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ISTAT 民間薪資結構 2022（RACLI）', 'https://www.istat.it/wp-content/uploads/2025/02/REPORT_RACLI_2024.pdf'],
      ['IRPEF 2026 稅率與扣抵（Money.it）', 'https://www.money.it/riforma-irpef-regole-per-il-2026-come-calcolare-tasse'],
      ['單一兒童津貼 2026（InformazioneFiscale）', 'https://www.informazionefiscale.it/assegno-unico-inps-tabella-isee-2026-importo-calcolo-aumento'],
      ['ISTAT 2025 家庭消費（Teleborsa）', 'https://www.teleborsa.it/DettaglioNews/73_2026-10-08_TLB/Istat-spesa-media-delle-famiglie-stabile-a-2782-euro-nel-2025-cresce-lalimentare.html'],
      ['Immobiliare.it 2026 上半年房價與租金', 'https://m.dellevittorie.it/mercato-immobiliare-h1-2026-insights/'],
      ['房貸利率 2026-09（Facile.it）', 'https://www.facile.it/mutui/news/mutui-media-tassi-settembre-2026.html']
    ],
    notes: [
      '義大利是個人分開課稅：所得稅 23%／33%／43%，另有大區與市的附加稅；員工社會保險約 9.5%。',
      '單一兒童津貼每個孩子每月 58–204 歐元，依家庭經濟指標（ISEE）計算；1 歲以下多 5 成，雙薪家庭另有加給。',
      '0–2 歲公立托嬰依 ISEE 收費、名額不足；托嬰補助每年最多 3,600 歐元。3–5 歲幼兒學校免費，只付餐費。',
      '產假 5 個月（8 成薪，多數公司依團體協約補到全薪），之後的育兒假前 3 個月 8 成、之後 3 成。',
      '35 歲以下、ISEE 4 萬以下首購可用政府擔保貸到 9 成以上。'
    ],

    // ---------- 薪資（全職受僱者，全年，含第 13 個月）§2 ----------
    W: {
      // 民間時薪中位數 11.75（2022）［OFFICIAL：ISTAT］× 全職約 2,080 小時 × 2022→2026 約 1.12 ≈ 27,400；
      // INPS 全年全職平均約 3.5 萬 ÷ 平均／中位數 1.25 ≈ 2.8 萬（2024）→ 取 28,500［DERIVED／ESTIMATE］
      median: 28500,
      // 十分位：時薪 P10 8.42（0.717）、P90 21.98（1.87）［OFFICIAL］；其他內插［ESTIMATE］
      q: [[10, 0.70], [20, 0.78], [25, 0.81], [30, 0.85], [40, 0.92], [50, 1], [60, 1.09], [70, 1.21], [75, 1.29], [80, 1.40], [90, 1.87], [95, 2.40]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      // 年齡：30 歲以下時薪中位數 10.50（0.89）、50 歲以上 12.85（1.09）；義大利年資加薪明顯［DERIVED／ESTIMATE］
      age: [[22, 0.78], [27, 0.86], [35, 0.97], [45, 1.05], [55, 1.12], [63, 1.12]],
      bonus: 1
    },
    CHECK_SALARIES: [20000, 24000, 28500, 40000, 60000, 90000],

    // ---------- 城市 ----------
    CITY: {
      rome: {
        id: 'rome', name: '羅馬', short: '羅馬', capital: true,
        cons: 1.06, // 中部家庭支出略高於全國［ESTIMATE］
        // 刊登租金每 ㎡ 19.2（idealista 2026 Q3）× 0.9 ≈ 17.3（和台灣 591 × 0.9 同規則）［SECONDARY／DERIVED］；1–4 房 50／75／95／120 ㎡
        rentM2: 17.3, rentSize: [50, 75, 95, 120], rentAdj: 1.0,
        price: 3500, priceNew: 4400, // 刊登價 3,826，成交約低 8%［DERIVED］；新建約高 25%［ESTIMATE］§4.2
        mgmt: 2.2, // 公寓管理費（每 ㎡ 每月）［ESTIMATE］
        addReg: [[15000, 0.0173], [28000, 0.0273], [Infinity, 0.0333]], addCom: 0.009, // 拉齊奧大區、羅馬市附加稅［ESTIMATE］
        park: 80, tpass: 35, // 羅馬大眾運輸月票 35［OFFICIAL］
        nidoMax: 440, nidoPriv: 650, mensa: 60, // 市立托嬰最高每月 440（ISEE 5 萬以上），餐費每年最多約 720［SECONDARY，2026-10 核對］
        after: 1800, privFees: { es: 3500, jh: 4500, sh: 5500 }, intl: 15000,
        hobby: 60, cram: { none: 0, some: 120, full: 350 },
        doula: 1000, nurse: 2400
      },
      turin: {
        id: 'turin', name: '杜林', short: '杜林', capital: false,
        cons: 1.08, // 西北區家庭支出高於全國［ESTIMATE］
        rentM2: 12.2, rentSize: [50, 75, 95, 120], rentAdj: 1.0, // 刊登每 ㎡ 13.5（idealista 2026 Q3）× 0.9［SECONDARY／DERIVED］
        price: 1950, priceNew: 2800, // 2026 上半年漲 8.3%［SECONDARY］；每 ㎡［ESTIMATE］
        mgmt: 2.0,
        addReg: [[15000, 0.0162], [28000, 0.0213], [50000, 0.0275], [Infinity, 0.0332]], addCom: 0.008, // 皮埃蒙特大區、杜林市［ESTIMATE］
        park: 60, tpass: 38,
        nidoMax: 520, nidoPriv: 600, mensa: 80,
        after: 1500, privFees: { es: 3000, jh: 4000, sh: 5000 }, intl: 13000,
        hobby: 55, cram: { none: 0, some: 110, full: 320 },
        doula: 900, nurse: 2200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2025 家庭消費每月 2,782 ×（1 − 住房與能源 36%）÷ 每戶約 2.25 人 × 0.716 × 物價 1.03 ≈ 585［DERIVED］§5.1
      adultBase: 585, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 293], [2, 252], [6, 316], [12, 415], [18, 462]], // 台灣「孩子／大人」比例 × 義大利大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 35, // 電、瓦斯、水、網路、垃圾稅［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      tata: 1300,        // 保母（tata）全職每月［ESTIMATE］
      nidoCost: 900,     // 公立托嬰名額每月實際成本（只統計補助）［ESTIMATE］
      uniAwayRent: 550,
      master: 2000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 10000, resale: 0.25, life: 8, run: 2800 }, // 保險、油錢、保養、汽車稅［ESTIMATE］
        new: { buy: 22000, resale: 0.35, life: 10, run: 2900 },
        import: { buy: 38000, resale: 0.4, life: 10, run: 3600 }
      },
      scooter: { buy: 3000, resale: 0.2, life: 8, run: 600 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 19000, // 65 歲後每人每年（公共年金，稅後）［ESTIMATE］
      houseSize: { 1: 50, 2: 75, 3: 95, 4: 120 },
      reno: { basic: 50, light: 200, full: 800 },
      closing: { used: 0.045, new: 0.045 }, homeInsurance: 250,
      rentFactor: 1
    },

    // 3–5 歲幼兒學校，6 歲小學，11 歲初中，14–18 歲高中（5 年），19 歲上大學
    BANDS: { care: 3, es: 6, jh: 11, sh: 14, uni: 19 },
    // 一人請 9 個月（產假 5 個月＋育兒假 4 個月），夫妻都請時各 6 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6 : 9; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋', buy: '買房（首購稅費較低，35 歲以下可用政府擔保）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸（35 歲以下有政府擔保）', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（固定利率 30 年）' },
      postpartum: { center: '義大利沒有月子中心：請產後陪伴', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（產假 5 個月＋育兒假）', B: '伴侶請 9 個月', both: '夫妻各請 6 個月' },
      care: { quasi: '公立托嬰（依 ISEE 收費，名額不足）', public: '公立托嬰（依 ISEE 收費）', private: '私立托嬰', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶（很常見）', helper: '請保母（tata）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒學校（免學費，只付餐費）', quasi: '公立幼兒學校（免學費）', private: '私立幼兒學校', bilingual: '雙語幼兒學校', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '11 歲起讀私立學校', private: '私立學校（paritaria）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後班＋暑期營隊', anqin1: '課後班＋營隊＋1 項才藝', anqin3: '課後班＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '公立大學（學費依 ISEE）', private: '私立大學', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      var grant = isee(x) <= 40000 ? 1000 : 0; // 新生兒卡 1,000［NEWS］
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 3000 : 0), grant: grant, local: 0 };
    },
    // 單一兒童津貼（每個孩子，未滿 21 歲）
    allowance: function (x, k, a) {
      if (a >= 21) return 0;
      var I = isee(x), f = U.clamp((AUU.hi - I) / (AUU.hi - AUU.lo), 0, 1);
      var base = AUU.min + (AUU.max - AUU.min) * f;
      if (a >= 18) base *= 0.49; // 18–20 歲（在學）約一半
      // 未滿 1 歲加 5 成；有 3 個以上孩子時，1–2 歲也加 5 成；4 個以上孩子的家庭每月另加 150（算在老大）［OFFICIAL］
      var m = base * (a === 0 || (a < 3 && x.s.kids >= 3) ? 1.5 : 1) + ((x.gA > 0 && x.s.partner && x.gB > 0) ? AUU.dual * f : 0) + (k >= 2 ? AUU.third[1] + (AUU.third[0] - AUU.third[1]) * f : 0);
      if (k === 0 && x.s.kids >= 4) m += 150;
      return m * 12;
    },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0, I = isee(x);
      if (cs === 'quasi' || cs === 'public') { var m = U.clamp(I * 0.011, 50, c.nidoMax); fee = m * careMonths; sub = Math.max(0, C.nidoCost - m) * careMonths; }
      else if (cs === 'private') fee = c.nidoPriv * careMonths;
      else if (cs === 'helper') fee = C.tata * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      // 托嬰補助（bonus nido）：ISEE 4 萬以下每年 3,600、以上 1,500，不超過實付
      if (fee > 0 && (cs === 'quasi' || cs === 'public' || cs === 'private')) { var bn = Math.min(fee, (I <= 40000 ? 3600 : 1500) * careMonths / 12); fee -= bn; sub += bn; }
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var fee = ps === 'private' ? 3000 : ps === 'bilingual' ? 6000 : c.mensa * 10;
      return { fee: fee, kg: ps === 'public' || ps === 'quasi' ? 6000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privFees[level] : ({ es: 300, jh: 600, sh: 650 })[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.after : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 公立大學學費依 ISEE：2.2 萬以下只付地方稅約 156［OFFICIAL 免繳門檻；以上 ESTIMATE］
    uni: function (x, k, a) { var I = isee(x); return { fee: I <= 22000 ? 156 : Math.min(3000, 156 + 0.075 * (I - 22000)), sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var h = WD.stdHousePlan(x);
      h.closing = h.total * 0.045 + 3000; // 中古：登記稅（地籍價值 2%）＋仲介 3.66%；新建：增值稅 4%；另加公證［ESTIMATE］
      h.tax = 0;                           // 自住首購免房屋稅（IMU）
      return h;
    },
    // 房貸：貸 8 成、30 年；35 歲以下且 ISEE 4 萬以下可用首購擔保基金貸到 95%；月付不超過淨收入約 1/3（稅前 25%）§4.4
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var young = Math.min(s.ageA, s.partner ? s.ageB : 99) + tb < 36;
      var ltv = young && inc * 0.8 / 2.5 <= 40000 ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 0.25 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: ltv > 0.9 ? '首購擔保房貸（固定利率）' : '固定利率房貸' }], note: amt < total * ltv - 1 ? '月付不能超過收入約 1/3' : '' };
    },

    // ---------- 產假與育兒假：前 5 個月約全薪（法定 8 成＋公司補足），之後 3 個月 8 成、其餘 3 成；要繳稅 §6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner, m = g / 12, pay;
      if (both) pay = Math.min(months, 2.5) * m + Math.min(Math.max(months - 2.5, 0), 1.5) * 0.8 * m + Math.max(months - 4, 0) * 0.3 * m;
      else pay = Math.min(months, 5) * m + Math.min(Math.max(months - 5, 0), 3) * 0.8 * m + Math.max(months - 8, 0) * 0.3 * m;
      return pay * 0.8 * nb;
    },

    taxes: function (x) {
      var s = x.s, c = x.c;
      var a = person(x.gA || 0, c), b = person(s.partner ? x.gB || 0 : 0, c);
      return { si: a.si + b.si, tax: a.tax + b.tax };
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
