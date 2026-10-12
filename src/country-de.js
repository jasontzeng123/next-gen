/* =========================================================================
   德國模組（柏林、萊比錫）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/de.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）；程式內一律用歐元。
   特色：夫妻合併報稅（Ehegattensplitting）、兒童金與兒童免稅額擇優、育兒津貼（淨薪 65%，最多 12＋2 個月）、
   柏林公立托育免費、低收入家庭的兒童加給（Kinderzuschlag）與住房補貼（Wohngeld）、大學免學費。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768; // 1 歐元 = 35.768 台幣（2026-10-09，與法國相同）§1［NEWS］
  var RATE = 0.043; // 10 年固定房貸：2026 年 9 月平均 4.16%、10 月初約 4.5%（Baufi24）§4.4［NEWS］

  // ---------- 制度參數（2026）§3 ----------
  var BBG_RV = 101400, BBG_KV = 69750; // 年金／失業保險、健保／長照保險的投保上限［OFFICIAL］
  var KV_EE = 0.073 + 0.0145;          // 健保 14.6% 的一半＋平均附加保費 2.9% 的一半［OFFICIAL］
  var PV_EE = 0.018;                   // 長照保險員工負擔（有 1 個孩子）；沒孩子 +0.6%；第 2 到第 5 個孩子每個 −0.25%［OFFICIAL］
  var KG = 259;                        // 兒童金（Kindergeld），每個孩子每月［OFFICIAL］
  var KFB = 9756;                      // 兒童免稅額（夫妻合計，含照顧教育免稅額）［OFFICIAL］
  var KIZ = 297;                       // 兒童加給（Kinderzuschlag）每個孩子每月上限［OFFICIAL］
  var RB = { single: 563, partner: 506 }; // 基本生活需求（Regelbedarf）［OFFICIAL］
  // 住房補貼（Wohngeld，2025–2026）§3.5［OFFICIAL：WoGV 2025、WoGG §12］
  var WG_ABC = [[0.04, 4.797e-4, 4.080e-5], [0.03, 3.571e-4, 3.040e-5], [0.02, 2.917e-4, 2.450e-5],
                [0.01, 2.163e-4, 1.760e-5], [0, 1.907e-4, 1.720e-5], [-0.01, 1.722e-4, 1.660e-5]];
  var WG_MAX = { 3: [456, 551, 657, 766, 875], 4: [511, 619, 737, 858, 982] }, WG_MAX_ADD = { 3: 106, 4: 119 };
  var WG_HEAT = [110.40, 142.60, 170.20, 197.80, 225.40], WG_CLIMA = [19.20, 24.80, 29.60, 34.40, 39.20];
  var WG_MMIN = [54, 67, 79, 92, 103, 103], WG_YMIN = [396, 679, 906, 1132, 1358, 1585];

  // 所得稅（2026 年 §32a EStG）§3.1［OFFICIAL］
  function est(z) {
    z = Math.floor(Math.max(0, z));
    if (z <= 12348) return 0;
    if (z <= 17799) { var y = (z - 12348) / 10000; return Math.floor((914.51 * y + 1400) * y); }
    if (z <= 69878) { var q = (z - 17799) / 10000; return Math.floor((173.10 * q + 2397) * q + 1034.87); }
    if (z <= 277825) return Math.floor(0.42 * z - 11135.63);
    return Math.floor(0.45 * z - 19470.38);
  }
  function estH(z, joint) { return joint ? 2 * est(z / 2) : est(z); }
  // 團結稅：所得稅超過 20,350（夫妻 40,700）才課，過渡區 11.9%［OFFICIAL］
  function soli(t, joint) { var f = joint ? 40700 : 20350; return t <= f ? 0 : Math.min(0.055 * t, 0.119 * (t - f)); }

  var K = {
    id: 'DE', name: '德國', cur: 'EUR', curName: '歐元', flag: '🇩🇪',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 18.7, date: '2026-10-09' }, // PPP：德國約 0.73、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['Destatis 2025 全職受僱者年薪中位數 54,066 歐元', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html'],
      ['Destatis 2024 全職受僱者年薪十分位', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_134_621.html'],
      ['柏林–布蘭登堡統計局 2025 薪資（依年齡）', 'https://download.statistik-berlin-brandenburg.de/61d6def55d2f79bb/0c0e99b897e7/SB_N01-06-00_2025j01_BE.pdf'],
      ['所得稅公式 2026（§32a EStG）', 'https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026'],
      ['社會保險費率與上限 2026', 'https://www.arbeitskammer.de/fileadmin/user_upload/---------------AK_Download_Datenbank-------------/Publikationen/Faltblaetter/Grenzwerte_Sozialversicherung/Sozialversicherungswerte_07_2026.pdf'],
      ['2026 家庭給付與基本需求（Studierendenwerk）', 'https://www.studierendenwerke.de/fileadmin/user_upload/Downloads/Studieren_mit_Familie/SFS-UEbersicht_gesetzliche_AEnderungen_2026.pdf'],
      ['住房補貼參數 2025（聯邦參議院 401/24）', 'https://dserver.bundestag.de/brd/2024/0401-24.pdf'],
      ['育兒津貼 2026 規則', 'https://www.kita.de/wissen/elterngeld-2026-was-sich-fuer-eltern-aendert-und-wie-du-das-elterngeld-optimal-beantragst/'],
      ['柏林新簽約租金 2025（Berlin Hyp／CBRE）', 'https://www.berliner-zeitung.de/article/neue-daten-mieten-in-berlin-nach-rasantem-anstieg-stabiler-wohnungen-sind-knapp-10027092'],
      ['萊比錫租金 2025（PISA 市場報告）', 'https://www.l-iz.de/wirtschaft/verbraucher/2026/07/pisa-bericht-leipziger-mietmarkt-steigende-mieten-665289'],
      ['ImmoScout24 房價 2026 第 2 季', 'https://www.immobilienscout24.de/unternehmen/fileadmin/user_upload/IS24_20260701_WBM_Q2_2026_Kauf.pdf'],
      ['Baufi24 房貸利率 2026-10', 'https://www.baufi24.de/presse/pressemitteilungen/zinskommentar-102026/'],
      ['KfW 300 家庭購屋貸款', 'https://nexvyra.de/fakten/kfw-300-wohneigentum-familien.html'],
      ['萊比錫托育收費 2026', 'https://www.l-iz.de/politik/leipzig/2026/08/neuer-vorstoss-leipziger-elternbeitrage-steigende-betreuungskosten-angeglichen-666440'],
      ['Destatis 2024 家庭消費支出', 'https://lebensmittelpraxis.de/handel-aktuell/49585-konsumausgaben-2024-deutsche-haushalte-geben-mehr-geld-fuer-freizeit-aus.html']
    ],
    notes: [
      '有伴侶時算成已婚、夫妻合併報稅（Ehegattensplitting）。',
      '兒童金每個孩子每月 259 歐元，讀書到 25 歲都有；收入高時改用兒童免稅額，兩者取對家庭有利的一個。',
      '柏林公立托育（含 0–2 歲）免費，只付餐費與雜費；萊比錫依年齡收固定月費。',
      '低收入家庭可領兒童加給與住房補貼（簡化計算，存款太多就不能領）。',
      '大學免學費，只付每學期約 300 多歐元的註冊費（含全國大眾運輸月票）。'
    ],

    // ---------- 薪資（全職受僱者，全年，含年終與休假獎金）§2 ----------
    W: {
      // 2025 年中位數 54,066［OFFICIAL］× 2026 年約 1.035 ≈ 56,000［DERIVED］
      median: 56000,
      // 十分位：2024 年各分位 ÷ 中位數 52,159［OFFICIAL］；P95 由 P90 與 P99（4.09）以 Pareto 內插［DERIVED］
      q: [[10, 0.624], [20, 0.727], [30, 0.819], [40, 0.906], [50, 1], [60, 1.116], [70, 1.262], [80, 1.478], [90, 1.873], [95, 2.37]],
      paretoAlpha: 2.95, // 1.873 × 10^(1/α) = 4.089［DERIVED］
      ageSpread: 0.85,
      // 年齡：全國各年齡時薪（男女依全職比例加權）與柏林各年齡層年薪的形狀，換成中位數的比例［DERIVED／ESTIMATE］§2
      age: [[22, 0.66], [25, 0.76], [30, 0.93], [35, 1.02], [40, 1.07], [45, 1.10], [50, 1.11], [55, 1.12], [60, 1.10], [63, 1.05]],
      bonus: 1
    },
    CHECK_SALARIES: [30000, 42000, 56000, 75000, 100000, 140000],

    // ---------- 城市 ----------
    CITY: {
      berlin: {
        id: 'berlin', name: '柏林', short: '柏林', capital: true,
        cons: 1.0, // 柏林每人消費與全國相近［ESTIMATE］§5.2
        // 租金（每 ㎡ 每月）：淨租 14.0（新簽約平均 15.80，舊約與公營住宅新約較低，取中間）＋冷費用 1.9＋暖氣與熱水 1.3 §4.1［DERIVED／ESTIMATE］
        nk: 14.0, bk: 1.9, heat: 1.3, rentAdj: 1.0,
        rentSize: [55, 75, 95, 115], // 1–4 房（德國算法 2–5 Zimmer）［ESTIMATE］
        wgStufe: 4,                  // 住房補貼租金級距 IV［OFFICIAL］
        price: 4800, priceNew: 6900, // 每 ㎡：中古公寓刊登價 4,954、新建 6,913（2026 Q2），成交約低 3%［DERIVED］§4.2
        closing: { used: 0.1157, new: 0.08 }, // 房屋移轉稅 6%＋公證與登記 2%＋仲介 3.57%（新建案通常沒有仲介）［OFFICIAL／ESTIMATE］
        hausgeld: 4.0, grundsteuer: 400, // 公寓管理費（含暖氣與修繕基金，每 ㎡ 每月）、地價稅（每年）［ESTIMATE］
        park: 60, tpass: 63, // 停車（路邊居民證很便宜，車庫約 100）；德國月票 63［OFFICIAL：德國月票］
        kita: { krippe: 0, kg: 0, extra: 30 }, kitaPriv: 120, kitaBiling: 350, // 公立免費，只付餐費 23 與雜費［ESTIMATE］
        schoolLunch: 0, hort: [0, 0, 40, 40], // 小學 1–6 年級午餐免費；課後照顧 1–2 年級免費［OFFICIAL／ESTIMATE］
        privSchool: 250, intl: 20000, // 私立學校（依所得收費）每月；國際學校每年［ESTIMATE］
        hobby: 45, cram: { none: 0, some: 100, full: 280 },
        uniFee: 650, // 註冊費（含學期車票）每年［ESTIMATE］
        doula: 1200, nurse: 2800, pvExtra: 0
      },
      leipzig: {
        id: 'leipzig', name: '萊比錫', short: '萊比錫', capital: false,
        cons: 0.9, // 薩克森每人消費約全國 0.9［ESTIMATE］
        // 刊登租金中位數 10.55（2025），2026 約 +4%［NEWS／DERIVED］＋冷費用 1.8＋暖氣 1.2
        nk: 10.9, bk: 1.8, heat: 1.2, rentAdj: 1.0,
        rentSize: [55, 75, 95, 115],
        wgStufe: 3,
        price: 2950, priceNew: 5300, // 中古 3,054、新建 5,417（2026 Q2 刊登價）［DERIVED］
        closing: { used: 0.1107, new: 0.075 }, // 移轉稅 5.5%（薩克森）
        hausgeld: 3.3, grundsteuer: 350,
        park: 40, tpass: 63,
        kita: { krippe: 230, kg: 130, extra: 70 }, kitaPriv: 330, kitaBiling: 380, // 9 小時：托嬰約 230［ESTIMATE］、幼兒園 130［NEWS］，餐費約 70
        schoolLunch: 70, hort: [85, 85, 85, 85],
        privSchool: 180, intl: 14000,
        hobby: 40, cram: { none: 0, some: 90, full: 250 },
        uniFee: 600,
        doula: 1000, nurse: 2400,
        pvExtra: 0.005 // 薩克森的員工多付 0.5% 長照保險（沒有放「悔罪祈禱日」假）［OFFICIAL］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：Destatis 2024 每戶每月消費 3,257 ×（1 − 住房與能源 36.3%）÷ 每戶約 2.0 人［ESTIMATE］
      // = 1,037 × 0.716 = 743 × 物價 2024→2026 約 1.044 ≈ 775［DERIVED］§5.1
      adultBase: 775, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 388], [2, 333], [6, 419], [12, 550], [18, 612]], // 台灣「孩子／大人」比例 × 德國大人開銷［ESTIMATE］
      utilBase: 60, utilPerPerson: 35, // 電、網路、廣播費（暖氣含在租金或管理費）［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      auPair: 800,        // 互惠生每月：零用錢 280＋食宿＋保險與語言課［ESTIMATE］
      kitaCost: { krippe: 1500, kg: 1000 }, // 一個托育名額每月實際成本（只用來統計補助）［ESTIMATE］
      uniAwayRent: 440,   // 法院扶養費表：外地讀書每月 990，其中房租 440［OFFICIAL］
      master: 650,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 15000, resale: 0.25, life: 8, run: 2800 }, // 保險、油錢、保養、車檢［ESTIMATE］
        new: { buy: 32000, resale: 0.35, life: 10, run: 3000 },
        import: { buy: 50000, resale: 0.4, life: 10, run: 3800 }
      },
      scooter: { buy: 2500, resale: 0.2, life: 8, run: 500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 17000, // 65 歲後每人每年：法定年金約 40 年、中位數薪資，扣健保後［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 120 },
      reno: { basic: 40, light: 150, full: 600 },
      closing: { used: 0.11, new: 0.08 }, homeInsurance: 150, // 後備值；家財險（建築保險含在管理費）
      rentFactor: 1
    },

    // 小學 6–9 歲（多數邦 4 年；柏林 6 年），中學 10–15 歲，高中部 16–17 歲
    BANDS: { care: 3, es: 6, jh: 10, sh: 16, uni: 18 },
    // 育兒津貼：一人最多 12 個月；夫妻都請時共 14 個月，算成各 7 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 7 : 12; },

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
      housing: { rent: '租屋（租金含暖氣與管理費）', buy: '買房（頭期款 2 成＋稅費約 1 成自備，10 年固定利率）', family: '和長輩同住' },
      build: { used: '中古公寓', new: '新建案（有孩子的中低所得家庭可申請 KfW 低利貸款）' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（頭期款 2 成）' },
      postpartum: { center: '德國沒有月子中心：請產後陪伴（助產士到府由健保給付）', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 12 個月（育兒津貼約淨薪 65%，每月 300–1,800）', B: '伴侶請 12 個月（育兒津貼約淨薪 65%）', both: '夫妻各請 7 個月（共 14 個月育兒津貼）' },
      care: { quasi: '公立托育（Kita）', public: '公立托育（Kita）', private: '私立托育（月付附加費）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（Kita）', quasi: '公立幼兒園（Kita）', private: '私立幼兒園', bilingual: '雙語幼兒園', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '10 歲起讀私立學校', private: '私立學校（依所得收費）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校課後照顧（Hort）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '公立大學（免學費）', private: '公立大學（免學費；私立大學很少見）', mixed: '公立大學（免學費）' },
      transport: { transit: '大眾運輸（德國月票）', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '高級車' }
    },

    // ---------- 生產（健保給付）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 1200 : 0), grant: 0, local: 0 }; // 寬裕：單人房與自費檢查
    },
    allowance: function (x, k, a) { return a < 25 ? KG * 12 : 0; }, // 兒童金（與免稅額擇優在 taxes() 處理）
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0, kc = C.kitaCost.krippe;
      if (cs === 'quasi' || cs === 'public') { fee = (c.kita.krippe + c.kita.extra) * careMonths; sub = Math.max(0, kc - c.kita.krippe) * careMonths; }
      else if (cs === 'private') { fee = (c.kitaPriv + c.kita.extra) * careMonths; sub = Math.max(0, kc - c.kitaPriv) * careMonths; }
      else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c, C = x.C, m = 0, kc = C.kitaCost.kg;
      if (ps === 'home') return {};
      if (ps === 'bilingual') m = c.kitaBiling;
      else if (ps === 'private') m = c.kitaPriv;
      else m = c.kita.kg;
      var fee = (m + c.kita.extra) * 12;
      addDC(x, fee);
      return { fee: fee, kg: Math.max(0, kc - m) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : (priv ? c.privSchool * 12 : 0) + (level === 'es' ? 150 + c.schoolLunch * 11 : 400);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        var hort = s.after !== 'none' && !intl ? (c.hort[Math.min(Math.max(a - 6, 0), 3)] || 0) * 12 + 300 : 0; // 另加假期營隊約 300
        addDC(x, hort);
        extra = hort + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    // 月租（含冷費用與暖氣）；住房補貼用不含暖氣的「毛冷租」
    rentFor: function (c, rooms, rentMult, x) {
      var r = Math.min(Math.max(rooms, 1), 4), size = c.rentSize[r - 1];
      var f = rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
      var kalt = size * (c.nk * f + c.bk);
      if (x) x.y.kalt = kalt;
      return kalt + size * c.heat;
    },
    // 住房補貼（Wohngeld，租屋）：W = 1.15 ×（M −（a + b·M + c·Y）·Y）§3.5［OFFICIAL 公式；所得換算為 ESTIMATE］
    rentSubsidy: function (x) {
      var s = x.s, c = x.c, n = Math.max(1, x.persons || 1), i = Math.min(n, 6) - 1;
      if ((x.S || 0) >= 60000 + 30000 * (n - 1)) return; // 資產太多不能領
      var st = c.wgStufe, cap = n <= 5 ? WG_MAX[st][n - 1] : WG_MAX[st][4] + WG_MAX_ADD[st] * (n - 5);
      var extra = n <= 5 ? WG_HEAT[n - 1] + WG_CLIMA[n - 1] : WG_HEAT[4] + WG_CLIMA[4] + 32.4 * (n - 5);
      var kalt = x.y.kalt || x.rentM;
      var M = Math.max(WG_MMIN[i], Math.min(kalt, cap) + extra);
      var Y = 0;
      [x.gA, s.partner ? x.gB : 0].forEach(function (g) { if (g > 0) Y += Math.max(0, g - 1230) * 0.7; }); // 扣稅、健保、年金各 10%
      Y = Math.max(WG_YMIN[i], Y / 12);
      var p = WG_ABC[i], W = 1.15 * (M - (p[0] + p[1] * M + p[2] * Y) * Y);
      W = Math.min(W, x.rentM);
      if (W >= 10) x.tr.rent = W * 12;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = C.homeInsurance;
      C.homeInsurance = 150;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.homeInsurance = keep; }
      h.closing = h.total * c.closing[x.s.build === 'new' ? 'new' : 'used'];
      h.mgmt = c.hausgeld * h.size * 12;
      h.tax = c.grundsteuer;
      return h;
    },
    // 房貸：貸款 8 成、30 年；月付最多約夫妻淨收入 35%（約稅前 23%）。
    // 新建案＋已有孩子＋所得不超過 8 萬＋每個孩子 1 萬：KfW 300 家庭購屋貸款（1–2 個孩子最多 17 萬，前 10 年約 2%）§4.5［OFFICIAL／ESTIMATE］
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var kids = (x.births || []).filter(function (b) { return b <= tb; }).length;
      var left = total * 0.8, parts = [], pay = 0, note = '';
      if (s.build === 'new' && kids > 0 && inc * 0.8 <= 80000 + 10000 * kids) {
        var kfw = Math.min(left, kids <= 2 ? 170000 : kids <= 4 ? 200000 : 220000), rates = [];
        for (var y = 0; y < 10; y++) rates.push(0.02);
        rates.push(RATE);
        parts.push({ amt: kfw, rates: rates, years: 30, grace: 0, label: 'KfW 家庭購屋貸款（前 10 年約 2%）' });
        left -= kfw; pay += kfw * ann(0.02, 30);
      }
      var cap = 0.23 * inc, bank = Math.max(0, Math.min(left, (cap - pay) / ann(RATE, 30)));
      if (bank < left - 1) note = '月付最多約淨收入 35%，要多付頭期款';
      parts.push({ amt: bank, rate: RATE, years: 30, grace: 0, label: '銀行房貸（10 年固定，之後續約）' });
      return { parts: parts, note: note };
    },

    // ---------- 育兒津貼（Elterngeld）：產前淨薪 65%（較低收入 67% 以上），每月 300–1,800；家庭應稅所得超過 17.5 萬不能領 §6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var hh = incomeAt(x, 'A', x.t) + incomeAt(x, 'B', x.t);
      if (hh * 0.8 > 175000) return 0;
      var net = (g - 0.21 * Math.min(g, BBG_RV) - est(0.79 * g - 1230 - 36)) / 12; // 育兒津貼的淨薪：社保以 21% 定額扣［OFFICIAL 規則；稅額 ESTIMATE］
      var rate = net < 1000 ? Math.min(1, 0.67 + (1000 - net) / 2 * 0.001) : net <= 1200 ? 0.67 : Math.max(0.65, 0.67 - (net - 1200) / 2 * 0.001);
      return U.clamp(rate * net, 300, 1800) * months * nb;
    },

    // ---------- 稅與社保；兒童金擇優、兒童加給 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, joint = !!s.partner;
      var kids = (x.atHome || []).filter(function (a) { return a < 25; }), nK = kids.length;
      var n14 = (x.atHome || []).filter(function (a) { return a < 14; }).length;
      var born = (x.kAges || []).length;
      var si = 0, vors = 0, gSum = 0, wk = 0, ef = 0, earners = 0;
      var pvRate = PV_EE + (c.pvExtra || 0) + (born === 0 ? 0.006 : -0.0025 * Math.max(0, Math.min(born, 5) - 1));
      [x.gA, joint ? x.gB : 0].forEach(function (g) {
        if (!(g > 0)) return;
        earners++; gSum += g; wk += Math.min(g, 1230);
        var rv = 0.093 * Math.min(g, BBG_RV), av = 0.013 * Math.min(g, BBG_RV);
        var kv = KV_EE * Math.min(g, BBG_KV), pv = pvRate * Math.min(g, BBG_KV);
        si += rv + av + kv + pv; vors += rv + kv * 0.96 + pv;
        var m = g / 12; // 兒童加給用的工作收入扣除額（每人每月最多 378）
        ef += 100 + 0.2 * U.clamp(m - 100, 0, 420) + 0.3 * U.clamp(m - 520, 0, 480) + 0.1 * U.clamp(m - 1000, 0, 500);
      });
      var dc = x.y.dc || 0;
      var zvE = gSum - wk - vors - (joint ? 72 : 36) - Math.min(0.8 * dc, 4800 * n14)
        - (!joint && nK ? 4260 + 240 * (nK - 1) : 0); // 單親減免
      zvE = Math.max(0, zvE);
      var tNo = estH(zvE, joint), tFB = estH(zvE - KFB * nK, joint), kgYear = KG * 12 * nK;
      // 兒童免稅額省的稅比兒童金多，就改用免稅額（兒童金加回稅額）
      var tax = (tNo - tFB > kgYear) ? tFB + kgYear : tNo;
      tax += soli(tFB, joint);
      // 兒童加給（簡化）：父母收入扣掉自己的基本需求與住房分攤後，超過的部分每 1 歐元減 0.45 §3.4［OFFICIAL 規則；簡化 ESTIMATE］
      var kiz = 0, minInc = joint ? 900 : 600;
      if (nK > 0 && gSum / 12 >= minInc && (x.S || 0) < 15000 * (x.persons || 1)) {
        var netM = (gSum - si - tNo - soli(tFB, joint)) / 12, inc = Math.max(0, netM - ef);
        var hc = x.renting ? (x.rentM || 0) : (x.mortInt || 0) / 12 + (x.house && x.ly >= 0 ? (x.house.mgmt + x.house.tax) / 12 : 0);
        var share = joint ? 1 / (1 + 0.2 * nK) : 1 / (1 + 0.3 * nK);
        var need = (joint ? 2 * RB.partner : RB.single * (1 + Math.min(0.6, 0.12 * nK))) + share * hc;
        kiz = Math.max(0, KIZ * nK - 0.45 * Math.max(0, inc - need)) * 12;
      }
      if (x.tr && kiz) x.tr.allowance = (x.tr.allowance || 0) + kiz;
      return { si: si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
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
  K.est = est;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
