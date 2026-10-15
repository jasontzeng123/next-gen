/* =========================================================================
   英國模組（倫敦、曼徹斯特；英格蘭的制度）。金額為英鎊、2026 年水準。
   來源與可信度見 research/countries/uk.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：國民保健（生產免費）、雙薪家庭 9 個月大起每週 30 小時免費托育、兒童福利金（高所得逐步收回）、
   低收入的 Universal Credit、大學學費由學生貸款支付。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 42.27; // 1 英鎊 = 42.27 台幣（2026-10-12 收盤）§1［SECONDARY］
  var RATE = 0.060; // 5 年固定房貸平均利率 6.00%（Moneyfacts，2026-10-05）§4.4［NEWS］

  var K = {
    id: 'UK', name: '英國', cur: 'GBP', curName: '英鎊', flag: '🇬🇧',
    fx: { toTWD: FX, pppToTWD: 20.0, date: '2026-10-12' }, // PPP：英國約 0.68、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ONS 2025 年薪資調查（ASHE）', 'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025'],
      ['ONS 私人租金與房價（2026-09 發布）', 'https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/september2026'],
      ['ONS 家庭支出（2024/25）', 'https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/april2024tomarch2025'],
      ['Coram 2026 托育費用調查', 'https://www.coram.org.uk/wp-content/uploads/2026/03/Childcare-Survey-2026.pdf'],
      ['兒童福利金 2026/27', 'https://salarytax.uk/news/child-benefit-rates-2026-27-uprating'],
      ['Universal Credit 2026/27 費率', 'https://uktax.tools/universal-credit-rates/'],
      ['法定產假給付 2026/27', 'https://cintra.co.uk/blog/parental-pay-rates-26-27/'],
      ['Moneyfacts 房貸利率（2026-10）', 'https://www.itv.com/news/2026-10-05/mortgage-misery-as-average-five-year-deal-hits-6-for-first-time-in-three-years'],
      ['曼徹斯特各房數租金（ONS，2026-04）', 'https://housecheckup.co.uk/average-rent/manchester']
    ],
    notes: [
      '用英格蘭的制度（倫敦、曼徹斯特都在英格蘭）。',
      '雙薪家庭（每人年收入約 1 萬到 10 萬英鎊）的孩子 9 個月大起每週 30 小時免費托育（每年 38 週）；另有托育費 20% 的政府補貼。',
      '大學學費（每年 9,790 英鎊）由孩子自己的學生貸款支付、畢業後依收入償還；這裡只算父母補貼的生活費。',
      '兒童福利金算在「政府給的錢」；收入較高的一方超過 6 萬英鎊開始收回，8 萬全部收回。',
      '職場退休金（員工自付 5%）算在社保。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 全職受僱者年薪中位數 39,039（2025 年 4 月，在職滿一年）［OFFICIAL］× 2026 年約 1.045 ≈ 40,800［DERIVED］
      median: 40800,
      // 十分位：P10 以全職最低工資（12.21 × 37.5 小時 × 52 ≈ 23,800）約為中位數 0.61；P80、P90 依年齡別資料推約 1.49、1.84
      //（30–39 歲 P80 59,109、P90 75,041）［DERIVED／ESTIMATE］；中間以對數內插
      q: [[10, 0.61], [20, 0.72], [25, 0.765], [30, 0.81], [40, 0.90], [50, 1], [60, 1.11], [70, 1.27], [75, 1.37], [80, 1.49], [90, 1.84], [95, 2.35]],
      paretoAlpha: 2.4,
      ageSpread: 0.85,
      // 年齡：依各年齡層平均（22–29 歲 35,760、30–39 歲 48,421、40–49 歲 54,591、50–59 歲 53,349、60 歲以上 46,794）的形狀，
      // 收斂成中位數的比例［DERIVED／ESTIMATE］§2
      age: [[22, 0.70], [25.5, 0.85], [34.5, 1.08], [44.5, 1.15], [54.5, 1.10], [63, 0.95]],
      bonus: 0.5
    },
    CHECK_SALARIES: [24000, 32000, 40800, 60000, 90000, 130000],

    // ---------- 城市 ----------
    CITY: {
      london: {
        id: 'london', name: '倫敦', short: '倫敦', capital: true,
        cons: 1.15, // 每人消費：倫敦約為全英 1.15 倍（家庭支出調查，倫敦戶均支出較高、戶人數相近）［ESTIMATE］§5.2
        // ONS 私人租金：倫敦平均 2,332（2026-08）［OFFICIAL］；各房數依倫敦比例推估，再加新簽約約 5%［DERIVED／ESTIMATE］§4.1
        rent: [1950, 2400, 2900, 3800], rentAdj: 1.0,
        councilD: 2150, // 市政稅 D 級（含大倫敦市政府）2026/27 平均［ESTIMATE］§4.3
        lha: [1250, 1550, 1850, 2350], // Universal Credit 房租上限（外倫敦）［ESTIMATE］
        price: 6800,    // 每 ㎡：倫敦平均房價 56.9 萬（2026-07）［OFFICIAL］，外圍地區約每 ㎡ 6,000–7,500［ESTIMATE］§4.2
        priceNew: 8500,
        size: { 1: 50, 2: 70, 3: 90, 4: 120 }, // 1–2 房公寓、3–4 房連棟住宅［ESTIMATE］
        mgmt: 2.5,      // 公寓服務費與修繕（每 ㎡ 每月，平均）［ESTIMATE］
        homeIns: 400,
        park: 50, tpass: 200, // 居民停車證；倫敦交通（1–4 區按次扣款上限）［ESTIMATE］
        nurseryU2: 216.94, nursery2: 213.99, // 外倫敦托兒所，每週 25 小時，非免費時段的價格（2026）［OFFICIAL：Coram］§6.2
        nannyShare: 25000, wrap: 3500,
        preschoolBilingual: 18000,
        schoolPublic: { es: 500, jh: 900, sh: 900 }, privateFees: { es: 24000, jh: 28000, sh: 29000 }, intl: 32000, // 私校含 20% 加值稅［ESTIMATE］
        afterSchool: 415, hobby: 60, cram: { none: 0, some: 150, full: 400 },
        doula: 2000, maternityNurse: 2600
      },
      manchester: {
        id: 'manchester', name: '曼徹斯特', short: '曼徹斯特', capital: false,
        cons: 0.92, // 西北區每人消費略低於全英［ESTIMATE］§5.2
        // ONS 私人租金（2026-04）：1 房 987、2 房 1,213、3 房 1,406、4 房以上 1,986［OFFICIAL］，加到 8 月與新簽約約 7%［DERIVED］
        rent: [1060, 1300, 1500, 2100], rentAdj: 1.0,
        councilD: 2420, lha: [725, 850, 995, 1350],
        price: 3300, priceNew: 4000, // 每 ㎡［ESTIMATE］
        size: { 1: 50, 2: 70, 3: 90, 4: 120 },
        mgmt: 1.2, homeIns: 350,
        park: 20, tpass: 80, // Bee Network 公車與輕軌［ESTIMATE］
        nurseryU2: 178.01, nursery2: 158.01, // 西北區［OFFICIAL：Coram］
        nannyShare: 18000, wrap: 2800,
        preschoolBilingual: 12000,
        schoolPublic: { es: 450, jh: 800, sh: 800 }, privateFees: { es: 15000, jh: 17500, sh: 18000 }, intl: 22000,
        afterSchool: 360, hobby: 45, cram: { none: 0, some: 130, full: 350 },
        doula: 1500, maternityNurse: 2200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：「每人消費支出（不含住房與水電）× 0.716」。英國：2024/25 每戶每週支出 676.60
      // −住房與水電 118.40 −房貸利息與市政稅約 70［ESTIMATE］＝ 488 ÷ 2.36 人 × 52 × 0.716 ÷ 12 ≈ 642 × 物價 1.04 ≈ 670［DERIVED］§5.1
      adultBase: 670, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 335], [2, 288], [6, 362], [12, 476], [18, 529]], // 台灣「孩子／大人」比例 × 英國大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 50, // 能源價格上限、水費、網路［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      uniAwayRent: 300,   // 外地讀書：生活費大多由學生的生活費貸款支付，父母補貼［ESTIMATE］
      master: 12000,      // 碩士學費（國內）［ESTIMATE］
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 22000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.25, life: 8, run: 2600 },
        new: { buy: 28000, resale: 0.35, life: 10, run: 2900 },
        import: { buy: 45000, resale: 0.4, life: 10, run: 3600 }
      },
      scooter: { buy: 2500, resale: 0.2, life: 8, run: 500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 12500, // 新制國家年金 2026/27 每週 241.30［NEWS］
      houseSize: { 1: 50, 2: 70, 3: 90, 4: 120 },
      reno: { basic: 30, light: 120, full: 500 },
      closing: { used: 0.02, new: 0.02 }, homeInsurance: 400, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 英格蘭：4 歲入學（Reception），11 歲上中學，16–17 歲讀第六學級（sixth form）
    BANDS: { care: 3, es: 4, jh: 11, sh: 16, uni: 18 },
    leaveMonths: 9, // 法定產假給付 39 週

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) {
      ls.loan = 'bank';
      if (ls.transport === 'scooter') ls.transport = 'transit';
      if (ls.care === 'helper') ls.care = 'private'; // 脫歐後沒有互惠生簽證，改用共用保母
      if (ls.leave === 'both') ls.leave = 'B';       // 夫妻共用 39 週法定給付：算成一人請 9 個月
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租屋（另付市政稅）', buy: '買房（首購印花稅減免、5 年固定利率、貸款最多年收入 4.5 倍）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸（頭期款 10%）', qinganNoGrace: '沒有新青安，改用一般房貸（頭期款 10%）', bank: '一般房貸（頭期款 10%）' },
      postpartum: { center: '英國沒有月子中心：請產後陪伴（doula）', nanny: '產後保母（maternity nurse）2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（前 6 週薪資 90%，之後每週 194.32）', B: '伴侶請 9 個月（前 6 週薪資 90%，之後每週 194.32）', both: '夫妻共用 39 週法定給付（算成一人請 9 個月）' },
      care: { quasi: '托兒所（9 個月大起每週 30 小時免費，其餘自付）', public: '托兒所（9 個月大起每週 30 小時免費，其餘自付）', private: '共用保母（nanny share）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '英國沒有互惠生簽證，改用共用保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立學校附設幼兒班（免費時段＋課後延長照顧）', quasi: '私立托兒所全天（扣免費時段）', private: '私立托兒所全天（扣免費時段）', bilingual: '雙語托兒所', home: '在家照顧' },
      school: { public: '公立學校（4 歲入學，免學費）', privateJH: '11 歲起讀私立中學', private: '私立學校（含加值稅）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後俱樂部＋假期營隊', anqin1: '課後俱樂部＋營隊＋1 項才藝', anqin3: '課後俱樂部＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每月幾次）', full: '密集家教（11+、GCSE、A-level）' },
      uni: { public: '大學（學費由學生貸款支付，父母補貼生活費）', private: '大學（學費由學生貸款支付，父母補貼生活費）', mixed: '大學（學費由學生貸款支付，父母補貼生活費）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（國民保健，免費）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.maternityNurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 1500 : 0), grant: 0, local: 0 }; // 寬裕：私人產檢與單人房
    },
    allowance: function () { return 0; }, // 兒童福利金在 taxes() 依家庭所得計算
    // 0–2 歲：托兒所全天（每週 50 小時、每年 51 週），雙薪家庭 9 個月大起扣掉每年 1,140 小時免費時段，免費時段另收餐費等約 950
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var m = careMonths / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') {
        var w = a < 2 ? c.nurseryU2 : c.nursery2, full = 2 * w * 51;
        var frac = a === 0 ? 0.25 : 1, funded = funded30(x) ? 1140 * w / 25 * frac : 0;
        fee = (full - funded + (funded ? 950 * frac : 0)) * m; sub = funded * m;
      } else if (cs === 'private') fee = c.nannyShare * m;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    // 3 歲：免費時段（雙薪每週 30 小時，其他家庭 15 小時）
    preschool: function (x, ps, k, a) {
      var c = x.c, hours = funded30(x) ? 1140 : 570, w = c.nursery2 * 0.95, fee = 0, kg = hours * w / 25;
      if (ps === 'home') return {};
      if (ps === 'public') fee = c.wrap + (hours < 1140 ? 570 * w / 25 : 0);
      else if (ps === 'bilingual') fee = Math.max(0, c.preschoolBilingual - kg) + 950;
      else fee = 2 * w * 51 - kg + 950;
      addDC(x, fee);
      return { fee: fee, kg: kg };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees[level] : c.schoolPublic[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = /^anqin/.test(s.after) && !(s.school === 'private' || intl) ? c.afterSchool * 12 : 0;
        addDC(x, after);
        extra = after + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 12;
      return fee + extra;
    },
    // 大學：學費由學生貸款支付；父母依家庭收入補貼生活費（收入 2.5 萬以上，生活費貸款減少的部分）［ESTIMATE］§7
    uni: function (x, k, a) {
      var inc = fullGross(x);
      return { fee: U.clamp((inc - 25000) * 0.15, 0, 6000), sub: 0 };
    },

    // ---------- 住房 ----------
    // 月租＋市政稅（租屋的人也要繳）
    rentFor: function (c, rooms, rentMult, x) {
      var r = Math.min(Math.max(rooms, 1), 4);
      var ct = councilTax(c, r) / 12;
      if (x) { x.y.ct = ct; x.y.rooms = r; }
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor + ct;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = [C.houseSize, C.homeInsurance];
      C.houseSize = c.size; C.homeInsurance = c.homeIns;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.houseSize = keep[0]; C.homeInsurance = keep[1]; }
      h.closing = stampDuty(h.total) + 3600; // 印花稅（首購）＋律師、鑑價、貸款手續費［ESTIMATE］
      h.tax = councilTax(c, h.rooms);
      return h;
    },
    // 頭期款 10%（90% 成數），貸款最多夫妻年收入 4.5 倍，30 年 §4.4
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.9, 4.5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '5 年固定利率（之後再轉貸）' }], note: amt < total * 0.9 - 1 ? '貸款最多年收入 4.5 倍' : '' };
    },

    // ---------- 法定產假給付：前 6 週平均週薪 90%，之後 33 週每週 194.32（或 90%，取低）§6.3［OFFICIAL］ ----------
    leavePay: function (g, ind, months, nb) {
      var aw = g / 52, weeks = Math.min(39, months * 52 / 12);
      return (6 * 0.9 * aw + Math.max(0, weeks - 6) * Math.min(194.32, 0.9 * aw)) * nb;
    },

    // ---------- 稅、國民保險、退休金；兒童福利金、Universal Credit、托育補貼 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c;
      var people = [x.gA, s.partner ? x.gB : 0];
      var si = 0, tax = 0, net = 0, maxANI = 0, working = 0, under100 = true;
      people.forEach(function (g) {
        if (!(g > 0)) return;
        working++;
        var pen = 0.05 * U.clamp(g - 6240, 0, 50270 - 6240); // 職場退休金（員工 5%，合格薪資）
        var ni = 0.08 * U.clamp(g - 12570, 0, 37700) + 0.02 * Math.max(0, g - 50270);
        var ani = g - pen, pa = Math.max(0, 12570 - Math.max(0, (ani - 100000) / 2));
        var ti = Math.max(0, ani - pa);
        var t = 0.2 * Math.min(ti, 37700) + 0.4 * U.clamp(ti - 37700, 0, 125140 - 37700) + 0.45 * Math.max(0, ti - 125140);
        si += pen + ni; tax += t; net += g - pen - ni - t;
        if (ani > maxANI) maxANI = ani;
        if (ani >= 100000) under100 = false;
      });
      var kids = x.atHome || [], nCB = 0, n12 = 0;
      kids.forEach(function (a) { if (a < 18) nCB++; if (a < 12) n12++; });
      var tr = x.tr || {}, add = 0;
      // 兒童福利金：第一個每週 27.05、其他每週 17.90；收入較高的一方 6 萬到 8 萬之間逐步收回 §3.2［NEWS］
      var cb = nCB ? 52 * (27.05 + 17.90 * (nCB - 1)) : 0;
      if (cb) { add += cb; tax += cb * U.clamp((maxANI - 60000) / 20000, 0, 1); }
      // Universal Credit（簡化）：存款 1.6 萬以上不能領；6,000–16,000 每 250 視為每月 4.35 收入 §3.3［SECONDARY］
      var uc = 0, S = x.S != null ? x.S : 0, dc = x.y.dc || 0;
      if (S < 16000) {
        var std = s.partner ? 666.97 : 424.90, child = 303.94 * kids.filter(function (a) { return a < 18; }).length;
        var housing = x.renting && x.rentM ? Math.min(x.rentM - (x.y.ct || 0), c.lha[(x.y.rooms || 2) - 1] || 0) : 0;
        var cc = Math.min(0.85 * dc / 12, n12 >= 2 ? 1836.16 : n12 === 1 ? 1071.09 : 0);
        var wa = housing > 0 ? 427 : 710, tariff = Math.max(0, Math.ceil((S - 6000) / 250)) * 4.35;
        uc = Math.max(0, std + child + housing + cc - 0.55 * Math.max(0, net / 12 - wa) - tariff) * 12;
      }
      add += uc;
      // 托育費 20% 政府補貼（Tax-Free Childcare，每個 12 歲以下孩子每年最多 2,000）；領 Universal Credit 時不能同時用
      if (!uc && dc > 0 && n12 > 0 && under100 && eligWork(x)) add += Math.min(0.2 * dc, 2000 * n12);
      if (x.tr) tr.allowance = (tr.allowance || 0) + add;
      return { si: si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  // 市政稅：1–2 房約 B／C 級、3 房 D 級、4 房 E 級 §4.3［ESTIMATE］
  function councilTax(c, rooms) { return c.councilD * [0.78, 0.89, 1.0, 1.22][Math.min(Math.max(rooms, 1), 4) - 1]; }
  // 印花稅（2025 年 4 月起）：首購 30 萬以下免稅、30–50 萬 5%；超過 50 萬沒有首購減免：12.5 萬以下 0、25 萬以下 2%、92.5 萬以下 5%… §4.5［OFFICIAL］
  function stampDuty(p) {
    if (p <= 500000) return 0.05 * Math.max(0, p - 300000);
    var b = [[125000, 0], [250000, 0.02], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]], t = 0, lo = 0;
    for (var i = 0; i < b.length && p > lo; i++) { t += (Math.min(p, b[i][0]) - lo) * b[i][1]; lo = b[i][0]; }
    return t;
  }
  // 每週 30 小時免費托育：父母都有工作（每人年收入至少約 1 萬、低於 10 萬）
  function funded30(x) {
    var a = x.gA / Math.max(x.workFracA, 0.05), b = x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : null;
    var ok = function (g) { return g >= 10000 && g < 100000; };
    return ok(a) && (b == null || ok(b)) && !(x.quit && x.t >= x.quitStart && x.t < x.quitEnd);
  }
  function eligWork(x) { var a = x.gA, b = x.s.partner ? x.gB : null; return a >= 5000 && (b == null || b >= 5000); }
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
  function fullGross(x) { return x.gA / Math.max(x.workFracA, 0.05) + (x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : 0); }
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
  K.stampDuty = stampDuty;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
