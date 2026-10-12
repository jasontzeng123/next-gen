/* =========================================================================
   瑞典模組（斯德哥爾摩、哥特堡）。金額為瑞典克朗、2026 年水準。
   來源與可信度見 research/countries/se.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人分開課稅（地方稅約 3 成、工作所得稅額抵減）、兒童津貼、480 天育兒假（約薪資 8 成）、
   托育費依家庭所得 3% 封頂、學校與大學免費（大學生自己領國家助學金）、買房只要 1 成頭期款但每年要還 1–2% 本金。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 3.1868;  // 1 克朗 = 3.1868 台幣（2026-10-12 收盤）§1［SECONDARY］
  var RATE = 0.030; // 房貸：浮動 3 個月 2.75%、3 年 3.67%（Nordea 2026 年 9 月平均），取 3.0% §4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var PBB = 59200;                       // 價格基數［OFFICIAL］
  var SKIKT = 643000;                    // 國家所得稅門檻（應稅所得）［OFFICIAL］
  var PEN_CAP = 673038;                  // 一般年金費 7% 的上限所得［OFFICIAL］
  var BB = 1250;                         // 兒童津貼，每個孩子每月（16 歲起改領就學津貼，每年 10 個月）［OFFICIAL］
  var FLER = [0, 0, 150, 730, 1740, 2990]; // 多子女加給（家庭每月合計）［OFFICIAL］
  var FP_MAX = 1259, FP_LOW = 180;       // 育兒假給付：每天最高、最低級［OFFICIAL］
  var MAXTAXA = { cap: 51560, free: 10000, pre: [0.03, 0.02, 0.01], fri: [0.02, 0.01, 0.01] }; // 托育費（2026-07 起）［OFFICIAL：地方公告］

  // 基本扣除額（65 歲以下）§3.1［OFFICIAL：SKV 433］
  function grund(ffi) {
    var p = PBB, g;
    if (ffi <= 0.99 * p) g = 0.423 * p;
    else if (ffi <= 2.72 * p) g = 0.423 * p + 0.2 * (ffi - 0.99 * p);
    else if (ffi <= 3.11 * p) g = 0.77 * p;
    else if (ffi <= 7.88 * p) g = 0.77 * p - 0.1 * (ffi - 3.11 * p);
    else g = 0.293 * p;
    return Math.min(ffi, Math.ceil(g / 100) * 100);
  }
  // 工作所得稅額抵減（jobbskatteavdrag，65 歲以下）§3.1［OFFICIAL］
  function jsa(ai, ga, ki) {
    var p = PBB, b;
    if (ai <= 0.91 * p) b = ai;
    else if (ai <= 3.24 * p) b = 0.91 * p + 0.3874 * (ai - 0.91 * p);
    else if (ai <= 8.08 * p) b = 1.813 * p + 0.251 * (ai - 3.24 * p);
    else b = 3.027 * p;
    return Math.max(0, (b - ga) * ki);
  }
  // 一個人的稅：地方稅＋國家稅 − 工作所得抵減 − 所得抵減 − 年金費抵減；另加公共廣播費
  function personTax(g, ki) {
    if (!(g > 0)) return { tax: 0, fee: 0, bfi: 0 };
    var ga = grund(g), bfi = Math.max(0, g - ga);
    var kom = bfi * ki, stat = 0.2 * Math.max(0, bfi - SKIKT);
    var fee = 0.07 * Math.min(g, PEN_CAP);
    var t = kom + stat;
    t -= Math.min(jsa(g, ga, ki), kom);
    t -= Math.min(U.clamp((bfi - 40000) * 0.0075, 0, 1500), t);
    t -= Math.min(fee, t);
    t += Math.min(0.01 * bfi, 1184);
    return { tax: t, fee: fee, bfi: bfi };
  }

  var K = {
    id: 'SE', name: '瑞典', cur: 'SEK', curName: '克朗', flag: '🇸🇪',
    fx: { toTWD: FX, pppToTWD: 1.59, date: '2026-10-12' }, // PPP：瑞典約 8.6、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['SCB 2025 薪資分布（依性別）', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/arbetsmarknad/loner-och-arbetskostnader/lonestrukturstatistik-hela-ekonomin/pong/tabell-och-diagram/lonespridning-efter-sektor-och-kon-2024/'],
      ['Ekonomifakta 薪資中位數 2025', 'https://www.ekonomifakta.se/sakomraden/arbetsmarknad/loner/median-och-genomsnittslon_1210924.html'],
      ['Skatteverket 2026 稅額計算技術說明', 'https://skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf'],
      ['Skatteverket 2026 金額與比例', 'https://www.skatteverket.se/privat/skatter/beloppochprocent/2026'],
      ['SCB 2026 各市地方稅率', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/'],
      ['社會保險局 2026 給付金額', 'https://www.forsakringskassan.se/privatperson/e-tjanster-blanketter-och-informationsmaterial/aktuella-belopp'],
      ['托育費上限 2026（Falköping 公告）', 'https://www.falkoping.se/download/18.7bdef21a19ac5f61f0122ef/1766138745363/Avgift%20f%C3%B6r%20f%C3%B6rskola%20och%20fritidshem%20%20-%20maxtaxa%20f%C3%B6r%20%C3%A5r%202026.pdf'],
      ['斯德哥爾摩市 2025 租金', 'https://start.stockholm/globalassets/start/om-stockholms-stad/utredningar-statistik-och-fakta/statistik/bostader/hyror/hyror_2025.pdf'],
      ['二房東與一手租金差距（Fastighetstidningen 2026）', 'https://fastighetstidningen.se/nyhet/gapet-mellan-andrahands-och-forstahandshyror-minskar/'],
      ['SCB 2026 租金', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/boende-bebyggelse-och-mark/bostader-och-boende/hyror-i-bostadslagenheter/pong/statistiknyhet/hyror-i-bostadslagenheter-2026/'],
      ['斯德哥爾摩合作公寓房價 2026 Q3（Svensk Mäklarstatistik）', 'https://boio.se/priser/stockholm-2026'],
      ['Nordea 房貸平均利率', 'https://www.nordea.se/privat/produkter/bolan/snittrantor.html'],
      ['2026 房貸規則（9 成上限、還本規定）', 'https://boio.se/guide/bolan-regler-2026-90-procent'],
      ['Västtrafik 月票 2026', 'https://via.tt.se/pressmeddelande/4344231/nu-ar-vasttrafiks-periodbiljetter-billigare-for-goteborgare?lang=sv']
    ],
    notes: [
      '瑞典是個人分開課稅；地方稅斯德哥爾摩 30.55%、哥特堡 32.60%，年薪約 66 萬克朗以上的部分加課 20% 國家稅。',
      '育兒假每個孩子 480 天，其中 390 天領約薪資 8 成（每天最多 1,259 克朗）；多數公司另補 10%。育兒假給付要繳稅。',
      '托育費是家庭月收入的 3%（第二個孩子 2%），每月最多約 1,550 克朗。',
      '私立學校（friskola）也免學費；大學免學費，大學生自己領國家助學金。',
      '斯德哥爾摩一手租約要排隊多年，這裡用新建案一手租金和二房東租金的中間值。',
      '買合作公寓（bostadsrätt）頭期款 1 成，但每年要還 1–2% 本金；房貸利息 30% 可抵稅。'
    ],

    // ---------- 薪資（全體受僱者，換算成全職的月薪 × 12.15）§2 ----------
    W: {
      // 2025 年全職換算月薪中位數 38,300［OFFICIAL：SCB］× 12.15（含休假加給）× 2026 年約 1.033 ≈ 480,000［DERIVED］
      median: 480000,
      // 十分位：SCB 2025 男女各自的 P10／P25／P50／P75／P90 合併（女 27,400／31,000／36,800／45,500／57,000；
      // 男 28,800／33,200／39,900／50,600／66,100），其他分位以對數內插［DERIVED／ESTIMATE］
      q: [[5, 0.66], [10, 0.731], [20, 0.80], [25, 0.836], [30, 0.865], [40, 0.935], [50, 1], [60, 1.075], [70, 1.18], [75, 1.253], [80, 1.34], [90, 1.606], [95, 1.95]],
      paretoAlpha: 2.8,
      ageSpread: 0.85,
      // 年齡：各年齡層平均月薪（18–24 29,800、25–34 37,500、35–44 43,000、45–54 46,300、55–64 44,700；Medlingsinstitutet）
      // 依「平均／中位數」差距換成中位數比例［DERIVED／ESTIMATE］§2
      age: [[21, 0.74], [29.5, 0.906], [39.5, 1.0], [49.5, 1.06], [59.5, 1.02], [63, 1.0]],
      bonus: 0.15
    },
    CHECK_SALARIES: [300000, 400000, 480000, 600000, 800000, 1100000],

    // ---------- 城市 ----------
    CITY: {
      stockholm: {
        id: 'stockholm', name: '斯德哥爾摩', short: '斯德哥爾摩', capital: true,
        cons: 1.08, // 斯德哥爾摩每人消費高於全國［ESTIMATE］
        kTax: 0.3055, // 地方稅（市＋區域）［OFFICIAL］
        // 租金（含暖氣與水，每 ㎡ 每年）：2021 年後新建一手 2,568、全市一手平均 1,734、3 房二房東中位數 18,000／月（約 2,900）；
        // 取 2,400［DERIVED／ESTIMATE］§4.1
        rentM2: 2400, rentSize: [55, 75, 95, 115], rentAdj: 1.0,
        price: 75000, priceNew: 85000, // 合作公寓每 ㎡：全市 92,000、適合家庭的近郊 50,000–80,000（2026 Q3）［SECONDARY／ESTIMATE］§4.2
        avgift: 55, // 合作公寓月費（每 ㎡ 每月，含暖氣與水）［ESTIMATE］
        park: 900, tpass: 1080, // 居民停車；SL 30 天票［ESTIMATE］
        intl: 150000,
        hobby: 350, cram: { none: 0, some: 600, full: 2000 },
        doula: 15000, nurse: 30000
      },
      gothenburg: {
        id: 'gothenburg', name: '哥特堡', short: '哥特堡', capital: false,
        cons: 1.0,
        kTax: 0.3260,
        rentM2: 1950, rentSize: [55, 75, 95, 115], rentAdj: 1.0, // 新建一手約 2,000–2,200，二房東約斯德哥爾摩一半［ESTIMATE］
        price: 50000, priceNew: 60000, // 大哥特堡 2024 年 47,122，2026 約 +5%［DERIVED／ESTIMATE］
        avgift: 58,
        park: 600, tpass: 750, // Västtrafik 30 天票（市民價，2026-06 起）［OFFICIAL］
        intl: 120000,
        hobby: 300, cram: { none: 0, some: 550, full: 1800 },
        doula: 12000, nurse: 26000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：家計調查沒有公布金額，用國民所得帳每人消費約 27.1 萬 × 調查／國民所得比例 0.742（德國）
      // ×（1 − 住房 22.3%）÷ 12 × 0.716 × 物價 1.04 ≈ 9,500［ESTIMATE］§5.1
      adultBase: 9500, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 4750], [2, 4085], [6, 5130], [12, 6745], [18, 7505]], // 台灣「孩子／大人」比例 × 瑞典大人開銷［ESTIMATE］
      utilBase: 900, utilPerPerson: 250, // 電、網路、手機、家財險（暖氣與水含在租金或月費）［ESTIMATE］
      gearFirst: { frugal: 8000, normal: 15000, comfy: 30000 }, gearLater: 5000,
      postpartumFamily: 3000,
      grandPaid: 0, helper: 0,
      auPair: 9000,      // 互惠生每月：零用錢至少 3,500＋食宿與保險［ESTIMATE］
      careCost: 14000,   // 一個托育名額每月實際成本（只用來統計補助）［ESTIMATE］
      csn: 37000,        // 大學生的國家助學金（不用還的部分）每年約 3,900 × 9.5 個月［ESTIMATE］
      uniAwayRent: 0,    // 外地讀書的房租由學生自己的助學貸款支付
      master: 0,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 150000, resale: 0.25, life: 8, run: 30000 }, // 保險、油錢、車稅、保養［ESTIMATE］
        new: { buy: 350000, resale: 0.35, life: 10, run: 32000 },
        import: { buy: 550000, resale: 0.4, life: 10, run: 40000 }
      },
      scooter: { buy: 30000, resale: 0.2, life: 8, run: 5000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 180000, // 65 歲後每人每年（所得年金＋職業年金，稅後）［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 115 },
      reno: { basic: 500, light: 1500, full: 6000 },
      closing: { used: 0.003, new: 0.003 }, homeInsurance: 2000, // 合作公寓沒有印花稅，只有抵押登記與銀行手續費
      rentFactor: 1
    },

    // 6 歲學前班、7 歲上小學，13 歲國中（högstadiet），16–18 歲高中，19 歲上大學
    BANDS: { care: 3, es: 6, jh: 13, sh: 16, uni: 19 },
    // 育兒假：一人請時最多約 11 個月（另一方保留 90 天不能轉讓），夫妻都請時各 7 個月（共 480 天裡約 420 天）
    leaveMonths: function (who, s) { return s.leave === 'both' ? 7 : 11; },

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
      housing: { rent: '租屋（新建案一手租約或二房東，租金含暖氣與水）', buy: '買合作公寓（頭期款 1 成，每年還 1–2% 本金）', family: '和長輩同住' },
      build: { used: '中古公寓', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（頭期款 1 成）' },
      postpartum: { center: '瑞典沒有月子中心：請產後陪伴（產後回診與到府訪視免費）', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 11 個月（約薪資 8 成，每天最多 1,259 克朗）', B: '伴侶請 11 個月（約薪資 8 成）', both: '夫妻各請 7 個月' },
      care: { quasi: '公立托育（förskola，家庭收入 3%）', public: '公立托育（förskola，家庭收入 3%）', private: '私立托育（收費相同）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（每週 15 小時免費）', quasi: '公立幼兒園（每週 15 小時免費）', private: '私立幼兒園（收費相同）', bilingual: '雙語幼兒園（收費相同）', home: '在家照顧' },
      school: { public: '公立學校（免學費、午餐免費）', privateJH: '13 歲起讀私立學校（也免學費）', private: '私立學校（friskola，也免學費）', intl: '收費的國際學校' },
      after: { none: '不上課後班', anqin: '學校課後照顧（fritids）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '大學（免學費，學生自己領助學金）', private: '大學（免學費，學生自己領助學金）', mixed: '大學（免學費，學生自己領助學金）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '高級車' }
    },

    // ---------- 生產（公費醫療）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 10000 : 0), grant: 0, local: 0 };
    },
    // 兒童津貼到 15 歲；16 歲起讀高中領就學津貼（每年 10 個月）；多子女加給在 taxes() 算
    allowance: function (x, k, a) { return a < 16 ? BB * 12 : a < 19 ? BB * 10 : 0; },
    care: function (x, cs, k, a, careMonths) {
      var C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') { fee = maxtaxa(x, k, 'pre') * careMonths; sub = Math.max(0, C.careCost * careMonths - fee); }
      else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    // 3–5 歲：每年 525 小時免費，費用約打 7 折［ESTIMATE］
    preschool: function (x, ps, k, a) {
      var C = x.C;
      if (ps === 'home') return {};
      var fee = maxtaxa(x, k, 'pre') * 0.7 * 12;
      return { fee: fee, kg: Math.max(0, C.careCost * 12 - fee) };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : (level === 'es' ? 500 : 1500); // 公立與 friskola 免學費、午餐免費；只算雜費
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        var fri = s.after !== 'none' && a < 10 ? maxtaxa(x, k, 'fri') * 12 : 0; // 課後照顧到 9 歲（3 年級）
        extra = fri + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 大學免學費；學生自己領國家助學金（不用還的部分）算成家庭收到的補助
    uni: function (x, k, a) { x.tr.allowance += x.C.csn; return { fee: 400, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 / 12 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, h = WD.stdHousePlan(x);
      h.mgmt = c.avgift * h.size * 12;
      h.tax = 0; // 合作公寓的房屋費由社區繳（含在月費）
      return h;
    },
    // 房貸：最多房價 9 成、夫妻年收入 5.5 倍［ESTIMATE：銀行實務］；每年還本 1–2%，用 35 年本息攤還近似
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.9, 5.5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 35, grace: 0, label: '浮動利率房貸（每年還本 1–2%）' }], note: amt < total * 0.9 - 1 ? '房貸最多年收入約 5.5 倍' : '' };
    },

    // ---------- 育兒假給付：薪資（上限 59.2 萬）× 0.97 × 0.8 ÷ 365，每天最多 1,259；多數公司前 6 個月補 10%；要繳稅（約 25%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var both = x.s.leave === 'both' && x.s.partner;
      var days = months * 30, sick = Math.min(days, both ? 195 : 300), low = Math.max(0, days - sick);
      var daily = Math.min(FP_MAX, Math.min(g, 10 * PBB) * 0.97 * 0.8 / 365);
      var top = 0.1 * g / 12 * Math.min(6, months); // 團體協約補 10%［ESTIMATE］
      return (sick * daily + low * FP_LOW + top) * 0.75 * nb;
    },

    // ---------- 稅與年金費；多子女加給；房貸利息抵稅 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, si = 0, tax = 0;
      [x.gA, s.partner ? x.gB : 0].forEach(function (g) {
        var r = personTax(g, c.kTax);
        si += r.fee; tax += r.tax; // 年金費列在社保；稅額已扣掉年金費抵減
      });
      tax = Math.max(0, tax);
      // 房貸利息 30% 抵稅（10 萬以上的部分 21%）
      var mi = x.mortInt || 0;
      if (mi > 0) tax = Math.max(0, tax - (0.3 * Math.min(mi, 100000) + 0.21 * Math.max(0, mi - 100000)));
      var n = (x.atHome || []).filter(function (a) { return a < 19; }).length;
      if (x.tr && n >= 2) x.tr.allowance = (x.tr.allowance || 0) + (n <= 5 ? FLER[n] : FLER[5] + BB * (n - 5)) * 12;
      return { si: si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  // 托育費上限（每月）：家庭月收入扣 1 萬後的 3%／2%／1%（最小的孩子算第一個），第 4 個孩子起免費
  function maxtaxa(x, k, kind) {
    var inc = ((x.gA || 0) + (x.s.partner ? x.gB || 0 : 0)) / 12;
    var base = U.clamp(inc - MAXTAXA.free, 0, MAXTAXA.cap);
    var rank = 0;
    for (var j = 0; j < (x.births || []).length; j++) if (j > k && (x.t - x.births[j]) >= 0 && (x.t - x.births[j]) < 12) rank++; // 比這個孩子小、也在托育或課後照顧的
    var pct = MAXTAXA[kind][rank];
    return pct ? pct * base : 0;
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
  K.personTax = personTax;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
