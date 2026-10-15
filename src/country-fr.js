/* =========================================================================
   法國模組（巴黎市區、里昂＋Villeurbanne）。金額為歐元、2026 年水準（實質）。
   來源與可信度見 research/countries/fr.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）；程式內一律用歐元。
   法國和台灣最不一樣的地方：夫妻合併報稅＋家庭商數（孩子越多稅越少）、
   托育費依家庭所得比例計算、3 歲起義務教育（幼兒學校免學費）、多數現金津貼有所得上限。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768; // 1 歐元 = 35.768 台幣（2026-10-09）§1［NEWS］

  // ---------- 制度參數 ----------
  var PASS = 48060, PMSS = 4005;   // 2026 社會安全年度／月上限 §5.2［OFFICIAL］
  var PREPARE = 459.70;            // 育兒假津貼 PreParE 全職停職，每月（2026-04 起）§13.5［OFFICIAL］
  // 就業津貼（prime d'activité，2026-04 起）§14.3：基本額 638.28 €／月；工作收入計入 59.85%［OFFICIAL：economie.gouv.fr］；
  // 個人加給從月淨收入 709.18 € 起［OFFICIAL］，2026 改革後在 1.15 倍最低工資（約 1,699 €）達到上限約 240 €［NEWS］
  var PA = { mf: 638.28, rate: 0.5985, bonLo: 709.18, bonHi: 1699, bonMax: 240, forfait: [76.59, 153.19, 189.57] };
  var SMIC_NET = 1443;             // 2026 最低工資淨額，每月（毛額 1,823）［ESTIMATE，未查證］
  var MEALS = 144;                 // 學校午餐每年餐數：每週 4 天 × 36 週 §13.6［ESTIMATE］
  var CL_DAYS = 61;                // 休閒中心（centre de loisirs）每年天數：週三 36 天＋假期約 25 天［ESTIMATE］

  // 所得稅級距（2026 年課 2025 年所得，每一份額）§5.1［OFFICIAL］；轉成 [上限, 稅率, 累進差額]
  var BAREME = (function () {
    var lim = [11600, 29579, 84577, 181917, Infinity], rate = [0, 0.11, 0.30, 0.41, 0.45], out = [], taxAt = 0, lo = 0;
    for (var i = 0; i < lim.length; i++) {
      var d = lo * rate[i] - taxAt;
      out.push([lim[i], rate[i], d]);
      if (isFinite(lim[i])) { taxAt = lim[i] * rate[i] - d; lo = lim[i]; }
    }
    return out;
  })();

  // 巴黎學校午餐與課後收費（2026-27，依家庭商數 QF 分 10 級）§13.6［OFFICIAL］
  var QF_UP = [234, 384, 548, 959, 1370, 1900, 2500, 3333, 5000, Infinity];
  var MEAL = [0, 0, 1.62, 2.28, 3.62, 4.61, 4.89, 5.10, 6.00, 7.00];

  var K = {
    id: 'FR', name: '法國', cur: 'EUR', curName: '歐元', flag: '🇫🇷',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 20.87, date: '2026-10-09' }, // PPP：IMF 2025 法國 0.654、台灣約 13.65（推算）§13.1
    careEnd: 3, // 0–2 歲托嬰或保母，3 歲起進幼兒學校（義務教育）
    sources: [
      ['經濟部 就業津貼（prime d’activité）2026 年 4 月起', 'https://www.economie.gouv.fr/node/34212'],
      ['就業津貼 2026 各家庭基本額（Previssima）', 'https://www.previssima.fr/actualite/prime-dactivite-quels-sont-les-nouveaux-montants-au-1er-avril-2026.html'],
      ['INSEE 2017 家庭預算調查：各地區消費支出', 'https://www.insee.fr/fr/statistiques/4127596'],
      ['INSEE 民間薪資 2024（IP 2079）', 'https://www.insee.fr/fr/statistiques/8657156'],
      ['INSEE 家庭消費（Budget de famille 2017）', 'https://www.cor-retraites.fr/sites/default/files/2026-02/Doc_08_Conso%20budget%20de%20famille_SGCOR-INSEE.pdf'],
      ['service-public 所得稅級距與家庭商數', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419'],
      ['CLEISS 員工社會提撥費率 2026', 'https://www.cleiss.fr/docs/cotisations/france.html'],
      ['地方租金觀測站 OLL/OLAP 2024', 'https://www.data.gouv.fr/datasets/resultats-nationaux-des-observatoires-locaux-des-loyers'],
      ['Notaires du Grand Paris 巴黎房價', 'https://paris.notaires.fr/sites/default/files/Historiquedesprixdesappartementspardep_5.pdf'],
      ['service-public 零利率購屋貸款 PTZ', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10871'],
      ['CAF 托嬰中心收費表 PSU 2026', 'https://www.caf.fr/sites/default/files/medias/031/partenaireslocaux/EAJE/INFOCAFPLAFONDPLANCHERPSU2026.pdf'],
      ['service-public 家庭津貼', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13213'],
      ['Décret 2026-425 出生假', 'https://www.associatheque.fr/fr/fichiers/actualite/decret-2026-425-NOR-SFHS2609384D.pdf'],
      ['DREES 住房補助典型家庭（2025）', 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2004%20-%20La%20combinaison%20des%20prestations%20et%20ses%20effets%20sur%20le%20niveau%20de%20vie.pdf'],
      ['巴黎市 學校午餐收費', 'https://www.paris.fr/pages/la-cantine-2074']
    ],

    // ---------- 薪資 §2、§13.2 ----------
    // 範圍：INSEE 民間受僱者「全職等值」（EQTP）年薪，含獎金與第 13 個月，含部分工時者（換算成全職）。
    // 台灣的主計總處全年總薪資也只算民間（不含公部門）、以全年在職者為主（P10 約等於基本工資），
    // 法國的 P10 也約等於最低工資，兩者結構最接近。偏差：EQTP 把部分工時者換成全職，
    // 中位數比「實際領到」略高（約 2–3%），所以法國的門檻 PR 可能略為低估。
    W: {
      // 2024 淨額中位數 2,190 €/月 × 2024→2026 成長 1.038 §13.2 ÷ 0.78（員工提撥 20.84% §5.2
      // ＋公司團體醫療與保障險自付約 1.2%［ESTIMATE］）× 12 ≈ 35,000［DERIVED］
      // 再 × 0.97：EQTP 把部分工時者（約 17%）換成全職，台灣與日本用的是實際領到的年薪［ESTIMATE］
      median: 34000,
      // 十分位：淨額比例直接當毛額比例（PASS 以下提撥幾乎是比例制）§2.2［DERIVED］；
      // P5 約為最低工資（2024 淨 1,398 ÷ 2,190）、P1 是學徒（最低工資的 27–100%）［ESTIMATE］
      // P20 以下：部分工時者實際領的比全職等值少，往下修成「實際年薪」的形狀［ESTIMATE］
      q: [[1, 0.30], [5, 0.45], [10, 0.58], [20, 0.72], [30, 0.832], [40, 0.910], [50, 1], [60, 1.115], [70, 1.272], [80, 1.509], [90, 1.979], [95, 2.554]],
      paretoAlpha: 2.65, // 由 P95 2.554 與 P99 4.685 反推：2.554 × 5^(1/α) = 4.685 §2.2［DERIVED］
      ageSpread: 0.85,
      // 年齡：INSEE 只有各年齡層「平均」÷ 全體平均（<25 0.593／25–39 0.932／40–49 1.100／50–54 1.161／55+ 1.195）§2.3。
      // 換成中位數：× 全體平均/中位數 1.248 ÷ 該年齡層平均/中位數（年輕約 1.10、年長約 1.32）× 0.98（讓加權平均約為 1）；
      // 25–39 歲內的斜率依 INSEE 舊年度 5 歲分組推估；22 歲用不含學徒的 <25 平均［ESTIMATE］
      age: [[22, 0.73], [27, 0.88], [32, 0.96], [37, 1.01], [42, 1.04], [47, 1.08], [52, 1.09], [57, 1.10], [62, 1.07], [67, 1.00]],
      bonus: 1 // 第 13 個月薪水很普遍，INSEE 未公布獎金占比，以 1 個月估［ESTIMATE］
    },
    // 實拿試算用的年薪（預設的「中位數倍數取到 10 萬」對歐元不適用）
    CHECK_SALARIES: [17500, 26000, 35000, 52500, 70000, 105000],

    // ---------- 城市 ----------
    CITY: {
      paris: {
        id: 'paris', name: '巴黎（市區）', short: '巴黎',
        // 和台灣同一種算法（含住房的每人消費 ÷ 全國）。INSEE 家庭預算調查（BdF 2017）：巴黎都會區每消費單位支出
        // 比全國高 18%（不含自有住宅設算租金）§14.1［OFFICIAL］；巴黎市區所得更高、自有住宅設算租金也更高，取 1.2［DERIVED，偏保守］
        cons: 1.2,
        // 新簽約月租（不含管理費，2024 中位數）：T2、T3、T4、T5 §13.4.1［OFFICIAL］
        // T4＝4 房以上每 ㎡ 25.9 × 約 89 ㎡；T5＝25.9 × 約 115 ㎡［ESTIMATE］
        rent: [1090, 1500, 2300, 3000],
        rentSize: [40, 62, 89, 115], // 對應面積 ㎡（T4、T5 估計）
        charge: 1.6,        // 房客負擔的管理費（charges locatives），每 ㎡ 每月：大樓管理費每戶 1,423 €/年 §13.4.2 約 2.4 €/㎡ 的三分之二［ESTIMATE］
        price: 9560,        // 中古公寓每 ㎡（室內淨面積，2026 Q2）§4.1［OFFICIAL］
        priceNew: 13000,    // 新成屋每 ㎡：未查到，中古 × 約 1.35［ESTIMATE］
        mgmt: 2.4,          // 大樓管理費（charges de copropriété），每 ㎡ 每月：1,423 €/戶/年 ÷ 約 50 ㎡ §13.4.2［DERIVED］
        propTax: 0.0015,    // 房屋稅（taxe foncière）約房價 0.15%／年：稅率 27.4%（含垃圾稅）× 一半的地籍租值（約 100 €/㎡/年）§13.4.2［ESTIMATE］
        park: 150, parkBuy: 30000, // 月租車位、買車位：未查到［ESTIMATE］
        tpass: 45.40,       // Navigo 月票 90.80，雇主至少補助一半 §13.3［OFFICIAL］
        aplZone: 1,         // 住房補助 APL 第 1 區
        medFactor: 1.3,     // 產檢與生產自付（醫師超收費 dépassements）巴黎較高［ESTIMATE］
        amWage: 5.7,        // 登記保母每小時淨薪：CMG 官方範例 794.40 € ÷ 139 h §6.4［DERIVED］
        amUpkeep: 80,       // 保母照顧費（indemnité d'entretien）每月約 4 € × 20 天［ESTIMATE］
        microExtra: 150,    // 巴黎私立微型托嬰比全國貴［ESTIMATE］
        nannyExtra: 100,    // 巴黎到府保母時薪較高［ESTIMATE］
        schoolFactor: 1,    // 午餐與課後收費：用巴黎官方收費表
        privFactor: 1.8,    // 巴黎私立天主教學校年費比全國平均高［ESTIMATE］
        privMeal: 6.0,      // 私立學校午餐每餐［ESTIMATE］
        bilingualKG: 9000,  // 私立雙語幼兒學校年費（含午餐）：未查到［ESTIMATE］
        intlFee: 22000,     // 國際學校年費：未查到［ESTIMATE］
        cramFactor: 1.25    // 巴黎家教費比外省貴 20–30% §13.6［SECONDARY］
      },
      lyon: {
        id: 'lyon', name: '里昂（含 Villeurbanne）', short: '里昂',
        cons: 1.0,
        // 新簽約月租：T2 700、T3 850 §13.4.1［OFFICIAL］；T4＝每 ㎡ 12.9 × 88 ㎡；T5＝約 12.2 × 119 ㎡［DERIVED／ESTIMATE］
        rent: [700, 850, 1135, 1450],
        rentSize: [47, 68, 88, 119],
        charge: 1.0,        // 房客負擔的管理費，每 ㎡ 每月：全國每戶 913 €/年 §13.4.2 推估［ESTIMATE］
        price: 4442,        // 中古公寓每 ㎡（2026 初）§4.1［NEWS］
        priceNew: 6000,     // 新成屋每 ㎡：公證人資料中位數約 6,049（5,477–6,644，2026-03）§14.5［SECONDARY 轉述官方］
        mgmt: 1.6,          // 里昂大樓管理費：未查到，全國每戶 913 €/年略加［ESTIMATE］
        propTax: 0.0035,    // 稅率 37.9%（含垃圾稅）× 一半的地籍租值（約 80 €/㎡/年）÷ 房價 §13.4.2［ESTIMATE］
        park: 90, parkBuy: 20000, // ［ESTIMATE］
        tpass: 34,          // TCL 月票約 68，雇主補助一半：未查到［ESTIMATE］
        aplZone: 2,         // 住房補助 APL 第 2 區 §13.4.3
        medFactor: 1.0,
        amWage: 5.0,        // 登記保母每小時淨薪（參考值 4.91 略加）［ESTIMATE］
        amUpkeep: 75,
        microExtra: 50, nannyExtra: 30,
        // 里昂市國小收費未查到；里昂都會區國中午餐依家庭商數 1–6 €，同級距和巴黎相近（QF 1,601–1,900：4.50，巴黎 4.61）
        // §14.4［OFFICIAL：grandlyon.com］，所以直接用巴黎收費表
        schoolFactor: 1.0,
        privFactor: 1.2, privMeal: 5.5,
        bilingualKG: 7000, intlFee: 16000,
        cramFactor: 1.0
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷。各國用同一個規則：「每人消費支出（不含住房與水電）× 0.716」，
      // 0.716 是台灣 14,000 元 ÷（每人消費 25,726 × 0.76）。法國：Budget de famille 2017 每戶 27,592 €/年
      // × (1 − 住房含水電 16.3%) ÷ 每戶約 2.2 人［未查證］÷ 12 = 874.8 × 物價 2017→2025 1.1949 × 2026 約 1.02
      // = 1,066 × 0.716 ≈ 763［DERIVED］§3.2、§13.3（未計 2017 年後的實質消費成長，略保守）
      adultBase: 763, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 法國的大人開銷［ESTIMATE］
      child: [[0, 382], [2, 328], [6, 412], [12, 542], [18, 603]],
      utilBase: 50, utilPerPerson: 30, // 公寓水電瓦斯：兩人約 110、四人約 170 €/月［ESTIMATE］
      // 產檢與生產：懷孕 6 個月起健保全額給付，自付多為醫師超收費、單人房［ESTIMATE］
      prenatal: { frugal: 100, normal: 400, comfy: 2000 },
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500, // 嬰兒用品［ESTIMATE］
      postpartumStay: { frugal: 0, normal: 150, comfy: 600 }, // 沒有月子中心：住院 3–5 天＋助產士到府（給付），自付單人房差額［ESTIMATE］
      postpartumNanny: 1500, // 產後到府幫手：每天 4 小時 × 28 天 × 約 27 €，扣 50% 稅額抵減［ESTIMATE］
      grandPaid: 0, helper: 0, // grandPaid 依兩地薪資換算（prep）；到府保母的費用在 family() 依所得計算
      careHours: 170,        // 全職托育每月時數：每天 9 小時 × 5 天 × 45 週 ÷ 12［ESTIMATE］
      crecheCostHour: 11,    // 托嬰中心每小時實際成本（只用來統計補助）：未查到［ESTIMATE］
      microHour: 11,         // 私立微型托嬰每小時收費（只用來統計補助）［ESTIMATE］
      supplies: { kg: 50, es: 230, jh: 230, sh: 300 }, // 文具與運動用品：國一 181＋46 §7［NEWS］；其他［ESTIMATE］
      privSchool: { kg: 456, es: 456, jh: 849, sh: 1254 }, // 與政府簽約的天主教學校，家長年費（全國平均）§7［NEWS］
      hobbyClass: 30,        // 每項才藝每月（社團、音樂院依所得收費）［ESTIMATE］
      // 家教（每月，扣 50% 稅額抵減前，一年 10 個月）：一些＝每週 1 小時大學生；大量＝每週 3 小時合格教師 §13.6［SECONDARY／ESTIMATE］
      cram: { junior: { none: 0, some: 76, full: 390 }, senior: { none: 0, some: 87, full: 520 } },
      uniFee: { public: 283, private: 11000 }, // 公立學士註冊費 178＋學生生活費 105 §7［OFFICIAL］；私立高等學院：未查到［ESTIMATE］
      uniAwayRent: 500,      // 學生租屋平均 637 €/月 §7［NEWS］，扣學生住房補助約 140［ESTIMATE］
      master: 360,           // 公立碩士註冊費 255＋105 §7［OFFICIAL］
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 14000, resale: 0.25, life: 8, run: 2600 }, // 保險、油錢、保養、檢驗；車價與費用都未查到［ESTIMATE］
        new: { buy: 27000, resale: 0.3, life: 10, run: 2500 },
        import: { buy: 42000, resale: 0.35, life: 10, run: 3200 }
      },
      scooter: { buy: 2500, resale: 0.15, life: 8, run: 600 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 19000,        // 65 歲後每人每年（一般年金＋補充年金，淨額）［ESTIMATE］
      houseSize: { 1: 45, 2: 66, 3: 88, 4: 112 }, // T2／T3／T4／T5 平均面積（巴黎與里昂的平均；里昂 T4 已更正為 88）§13.4.1、§13.10［DERIVED］
      reno: { basic: 80, light: 250, full: 900 }, // 每 ㎡：搬家與家具／一般整理／全面翻修［ESTIMATE］
      // 公證人費用全包：中古約 7.5%（首購移轉稅 5.81% §13.4.2）、新成屋約 2.5%；再加房貸保證與手續費約 0.9%［ESTIMATE］
      closing: { used: 0.084, new: 0.034 },
      homeInsurance: 300,    // 屋主住宅保險［ESTIMATE］
      rentIndex: 1.025       // 2024 年租金 → 2026（租金參考指數 IRL 約 +1–1.5%／年）［ESTIMATE］
    },

    // 法國學制：小學 6–10 歲、國中（collège）11–14 歲、高中（lycée）15–17 歲
    BANDS: { care: 3, es: 6, jh: 11, sh: 15, uni: 18 },
    leaveMonths: 6,

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    // 台灣選項 → 法國最接近的做法
    localize: function (ls) {
      if (ls.loan !== 'bank') ls.loan = 'bank';             // 沒有新青安；新成屋首購自動搭配 PTZ
      if (ls.transport === 'scooter') ls.transport = 'transit'; // 帶小孩騎機車在巴黎、里昂不常見
      // care 'helper' 保留：改用兩家共用的到府保母（garde partagée），費用在 family() 計算
    },
    MAP: {
      housing: { rent: '租屋（私人公寓，新簽約租金＋管理費）', buy: '買公寓，25 年固定利率房貸（月付不得超過收入 35%）', family: '和長輩同住（法國有孩子的夫妻很少這樣做）' },
      build: { used: '中古公寓（巴黎、里昂買中古屋沒有 PTZ）', new: '新成屋（首購可搭配零利率貸款 PTZ）' },
      loan: { qingan: '沒有新青安，改用一般房貸 25 年；新成屋首購自動加 PTZ 零利率貸款', qinganNoGrace: '沒有新青安，改用一般房貸 25 年；新成屋首購自動加 PTZ 零利率貸款', bank: '一般房貸 25 年固定利率（約 3.35%＋保險）' },
      postpartum: { center: '法國沒有月子中心：產後住院 3–5 天＋助產士到府訪視（健保給付）', nanny: '產後到府幫手（可抵 50% 稅）', family: '家人幫忙照顧' },
      care: { quasi: '登記保母（assistante maternelle）＋CMG 補助，自付依所得計算', public: '托嬰中心（crèche），收費依所得計算；名額不足', private: '私立微型托嬰（micro-crèche）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '法國沒有外籍幫傭：改用兩家共用的到府保母（garde partagée）', quit: '一方離職在家帶，可領育兒假津貼 PreParE（有期限）' },
      preschool: { public: '公立幼兒學校（3 歲起義務、免學費），付午餐與課後照顧', quasi: '公立幼兒學校（3 歲起義務、免學費），付午餐與課後照顧', private: '私立天主教學校（與政府簽約，學費低）', bilingual: '私立雙語幼兒學校', home: '法國 3 歲起義務入學：改為只上半天、不在學校吃午餐' },
      school: { public: '公立中小學（免學費，付午餐）', privateJH: '國中起讀私立天主教學校（與政府簽約）', private: '私立天主教學校（與政府簽約，學費低）', intl: '國際學校' },
      after: { none: '不參加課後照顧', anqin: '課後自習＋週三與假期的休閒中心（依所得收費）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不請家教', some: '每週 1 小時大學生家教（可抵 50% 稅）', full: '每週 3 小時合格教師家教（可抵 50% 稅）' },
      uni: { public: '公立大學（註冊費每年約 280 歐元）', private: '私立高等學院（商學院等）', mixed: '公立或私立各半' },
      transport: { transit: '大眾運輸（月票雇主補助一半）', scooter: '帶小孩騎機車不常見，改用大眾運輸', used: '二手車＋月租車位', new: '新車＋月租車位', import: '進口休旅車＋月租車位' },
      leave: { none: '只請產假 16 週、陪產假 28 天（視同全薪）', A: '出生假 2 個月（約 7 成、6 成）＋育兒假 4 個月（每月 459.70 歐元）', B: '出生假 2 個月（約 7 成、6 成）＋育兒假 4 個月（每月 459.70 歐元）', both: '兩人各請：出生假 2 個月＋育兒假 4 個月' }
    },

    // ---------- 生產 §6.1 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? C.postpartumStay[ls] : s.postpartum === 'nanny' ? C.postpartumNanny : 0;
      var cost = C.prenatal[ls] * c.medFactor + (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp;
      // 生育一次給付（prime à la naissance）1,093.11 €，有所得上限（含這一胎的孩子數）［OFFICIAL］
      var R = res(x);
      var grant = R.year <= pajeCeil(kidsUnder(x, 20), R.two) ? 1093.11 : 0;
      return { cost: cost, grant: grant, local: 0 };
    },

    // ---------- 0–2 歲（careMonths 個月送托）§6.4、§13.5 ----------
    // 自付已扣 50% 托育稅額抵減（6 歲以下，每孩每年費用上限 3,500 €）；sub 只做統計
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var R = res(x), n = Math.max(1, kidsUnder(x, 20)), H = C.careHours, fee, credit, feeM;
      if (cs === 'public') {
        // 托嬰中心 PSU：每小時 = 月所得（下限 814.62、上限 8,500）× 費率［OFFICIAL］
        feeM = U.clamp(R.month, 814.62, 8500) * psuRate(n) * H;
        fee = feeM * careMonths; credit = 0.5 * Math.min(fee, 3500);
        return { fee: fee - credit, sub: Math.max(0, C.crecheCostHour * H - feeM) * careMonths + credit };
      }
      if (cs === 'quasi') {
        // 登記保母＋CMG（2025-09 新制）：CMG = 薪資（每小時最多 8 €）× (1 − 月所得 × PSU 費率 ÷ 4.91)［DERIVED，由官方範例反推］
        var cmg = Math.min(c.amWage, 8) * H * Math.max(0, 1 - U.clamp(R.month, 1115.80, 8500) * psuRate(n) / 4.91);
        feeM = c.amWage * H - cmg + c.amUpkeep;
        fee = feeM * careMonths; credit = 0.5 * Math.min(fee, 3500);
        return { fee: fee - credit, sub: cmg * careMonths + credit };
      }
      if (cs === 'private') {
        // 私立微型托嬰（PAJE）：扣 CMG 與稅額抵減後，家庭月收入 2 倍最低工資 615、5 倍 749 €（2024 法規）§6.4［OFFICIAL］× 1.04 到 2026
        feeM = U.interp([[2, 615], [5, 749]], R.netFT / SMIC_NET) * 1.04 + c.microExtra;
        return { fee: feeM * careMonths, sub: Math.max(0, C.microHour * H - feeM) * careMonths };
      }
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      if (cs === 'helper') { x.helperMonths = Math.max(x.helperMonths, careMonths); return {}; } // 一位保母照顧所有孩子：在 family() 計算
      return {}; // grandFree
    },

    // ---------- 3–5 歲：公立幼兒學校免學費，付午餐、點心時段與週三／假期的休閒中心 §13.6 ----------
    preschool: function (x, ps, k, a) {
      var c = x.c, C = x.C, P = prices(x);
      var careFee = 10 * P.gouter + CL_DAYS * P.day; // 6 歲以下的課後照顧可抵 50% 稅（午餐不行）
      var credit;
      if (ps === 'home') return { fee: C.supplies.kg };
      if (ps === 'bilingual') { careFee = 25 * P.day; credit = 0.5 * Math.min(careFee, 3500); return { fee: c.bilingualKG + careFee - credit, kg: credit }; }
      credit = 0.5 * Math.min(careFee, 3500);
      var base = ps === 'private' ? C.privSchool.kg * c.privFactor + MEALS * c.privMeal : MEALS * P.meal;
      return { fee: base + careFee + C.supplies.kg - credit, kg: credit };
    },
    school: function (x, level, k, a) {
      var s = x.s, C = x.C, c = x.c, P = prices(x);
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intlFee : priv ? C.privSchool[level] * c.privFactor + MEALS * c.privMeal + C.supplies[level] : MEALS * P.meal + C.supplies[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = (/^anqin/.test(s.after) && !priv && !intl) ? 10 * P.etude + CL_DAYS * P.day : 0;
        extra = after + hobbies * C.hobbyClass * 12;
      } else {
        // 家教一年 10 個月，扣 50% 到府服務稅額抵減
        extra = (C.cram[level === 'jh' ? 'junior' : 'senior'][s.cram] || 0) * 10 * c.cramFactor * 0.5;
      }
      return fee + extra;
    },
    // 大學：公立註冊費很低；低所得家庭的 CROUS 獎學金（簡化）［ESTIMATE］
    uni: function (x, k, a) {
      var s = x.s, C = x.C, R = res(x);
      var fee = s.uni === 'mixed' ? (C.uniFee.public + C.uniFee.private) / 2 : C.uniFee[s.uni] || C.uniFee.public;
      var pubShare = s.uni === 'public' ? 1 : s.uni === 'mixed' ? 0.5 : 0;
      var sub = 0;
      if (R.year <= 33000) {
        sub = C.uniFee.public * pubShare; // 獎學金生免註冊費與學生生活費
        x.tr.allowance += R.year <= 15000 ? 5000 : R.year <= 25000 ? 2000 : 0;
      }
      return { fee: fee - sub, sub: sub };
    },

    // ---------- 依整個家庭計算的津貼（都依家庭所得，多數看孩子數）§6.1、§6.2 ----------
    family: function (x) {
      var s = x.s, c = x.c, tr = x.tr, ages = x.atHome, R = res(x);
      var n20 = kidsUnder(x, 20), y = R.year, i;
      var cnt = function (lo, hi) { var m = 0; for (var j = 0; j < ages.length; j++) if (ages[j] >= lo && ages[j] < hi) m++; return m; };
      var n3 = cnt(0, 3), prest = 0; // prest：就業津貼要算進「家庭資源」的家庭給付（每年）
      // PAJE 基本津貼：3 歲前，每個家庭同時只領一份；全額 198.16、半額 99.08 €/月［OFFICIAL］
      if (n3 > 0) {
        var amt = y < abFull(n20, R.two) ? 198.16 : y <= pajeCeil(n20, R.two) ? 99.08 : 0;
        tr.allowance += amt * (cnt(1, 3) > 0 ? 12 : 11); prest += amt * (cnt(1, 3) > 0 ? 12 : 11);
      }
      // 家庭津貼（第 2 個孩子起，到 20 歲）：依所得分三級［OFFICIAL］
      if (n20 >= 2) {
        var b = y <= 79980 + 6664 * (n20 - 2) ? 0 : y <= 106604 + 6664 * (n20 - 2) ? 1 : 2;
        var af = [152.25, 76.13, 38.07][b] + [195.07, 97.54, 48.77][b] * (n20 - 2);
        // 18 歲起每人加給（2012 年 3 月以後出生者）；只有 2 個孩子時老大沒有 §6.2
        var maj = cnt(18, 20); if (n20 === 2) maj = Math.max(0, maj - 1);
        af += maj * [76.13, 38.07, 19.03][b];
        // 3 個孩子以上：孩子滿 20 歲那年的一次性加給
        var n20th = cnt(20, 21);
        if (n20th && n20 + n20th >= 3) af += n20th * [96.27, 48.14, 24.07][b];
        tr.allowance += af * 12; prest += af * 12;
      }
      // 家庭補充津貼：3 個以上孩子、都滿 3 歲；198.16 或低所得 297.27 €/月［OFFICIAL］
      var nCF = cnt(3, 21);
      if (n3 === 0 && nCF >= 3) {
        var majT = (R.two ? 27367 : 22372) + 3728 * (nCF - 3); // 4 個孩子以上的級距依比例推估［ESTIMATE］
        var cf = (y <= majT ? 297.27 : y <= abFull(nCF, R.two) ? 198.16 : 0) * 12;
        tr.allowance += cf; prest += cf;
      }
      // 開學津貼（6–18 歲，每年 8 月）［OFFICIAL］
      if (y <= 28956 + 6682 * (Math.max(1, n20) - 1)) {
        for (i = 0; i < ages.length; i++) { var g = ages[i]; if (g >= 6 && g <= 18) tr.allowance += g <= 10 ? 426.87 : g <= 14 ? 450.41 : 466.02; }
      }
      // 離職在家照顧：育兒假津貼 PreParE。第 1 胎每位家長最多 6 個月（1 歲前）；第 2 胎起最多 24 個月（3 歲前）§6.3
      if (x.quit && x.t >= x.quitStart && x.t < x.quitEnd && x.kAges.length) {
        var youngest = Math.min.apply(null, x.kAges);
        var months = x.kAges.length === 1 ? (youngest === 0 ? 6 : 0) : (youngest <= 1 ? 12 : 0);
        tr.leave += PREPARE * months; prest += PREPARE * months;
      }
      x.y.frPrest = prest / 12;
      // 到府保母（兩家共用 garde partagée）：扣 CMG 與稅額抵減後，月收入 1.5 倍最低工資以下 261、2–3 倍 359、3 倍以上 425 €
      //（Cnaf／ONAPE 2025 報告，2024 法規）§6.4［OFFICIAL］× 1.04 到 2026，一位保母照顧家中所有 3 歲以下孩子
      if (x.helperMonths > 0) {
        var nm = U.interp([[1.5, 261], [2, 359], [3, 359], [3.5, 425]], R.netFT / SMIC_NET) * 1.04 + c.nannyExtra;
        x.e.kidsCare += nm * x.helperMonths;
      }
    },

    // 就業津貼（prime d'activité）：基本額（依家庭人數加成）＋ 59.85% 工作收入＋每位工作者的個人加給
    // − max(基本額, 工作收入＋家庭給付＋住宅定額)。住宅定額：自有住宅、和長輩同住或有領住房補助時計入。
    // 每季依前 3 個月收入計算，這裡用全年平均；育嬰期間的給付未計入工作收入（略為高估）［ESTIMATE］
    afterHousing: function (x) {
      var s = x.s;
      var m = [earner(x.gA, x.workFracA).net / 12, s.partner ? earner(x.gB, x.workFracB).net / 12 : 0];
      var pro = m[0] + m[1];
      if (!(pro > 0)) return;
      var nk = 0; for (var i = 0; i < x.atHome.length; i++) if (x.atHome[i] < 25) nk++;
      var mf = PA.mf * (s.partner ? 1.5 : 1);
      for (var k = 0; k < nk; k++) mf += PA.mf * (k >= 2 ? 0.4 : (!s.partner && k === 0) ? 0.5 : 0.3);
      var persons = (s.partner ? 2 : 1) + nk;
      var forfait = !x.renting || x.tr.rent > 0 ? PA.forfait[Math.min(persons, 3) - 1] : 0;
      var bon = 0;
      m.forEach(function (v) { if (v >= PA.bonLo) bon += PA.bonMax * Math.min(1, (v - PA.bonLo) / (PA.bonHi - PA.bonLo)); });
      var p = mf + PA.rate * pro + bon - Math.max(mf, pro + (x.y.frPrest || 0) + forfait);
      if (p >= 15) x.tr.allowance += p * 12; // 每月不到 15 € 不發
    },

    // ---------- 住房 ----------
    // rooms：1＝T2（夫妻）、2＝T3、3＝T4、4＝T5。法國的「房」含客廳，T3＝2 間臥室＝台灣的 2 房
    rentFor: function (c, rooms, rentMult) {
      var i = Math.min(Math.max(rooms, 1), 4) - 1;
      return c.rent[i] * K.COST.rentIndex * rentMult + c.charge * c.rentSize[i];
    },
    // 住房補助 APL（簡化）：上限租金＋固定管理費 − 自付額。自付額依 DREES 典型家庭（夫妻＋2 孩、第 2 區）：
    // 無收入領 487、一份最低工資（淨 1,426）領 304、淨收入 2,425 €/月起為 0 §13.4.3［OFFICIAL／DERIVED］。
    // 其他家庭以消費單位換算所得；未計高租金的遞減規則［ESTIMATE］
    rentSubsidy: function (x) {
      var s = x.s, c = x.c, z1 = c.aplZone === 1;
      var deps = 0, uc = s.partner ? 1.5 : 1;
      for (var i = 0; i < x.atHome.length; i++) { if (x.atHome[i] < 21) deps++; uc += x.atHome[i] < 14 ? 0.3 : 0.5; }
      // 上限租金：夫妻＋1 名受扶養者 第 1 區 449.43、第 2 區 395.77，每多 1 名 +65.21／+57.61 §13.4.3［NEWS］；
      // 單身與無孩子夫妻依舊年度結構推估［ESTIMATE］
      var ceil = deps > 0 ? (z1 ? 449.43 + 65.21 * (deps - 1) : 395.77 + 57.61 * (deps - 1))
        : s.partner ? (z1 ? 397.6 : 351.9) : (z1 ? 329.7 : 287.4);
      var maxAid = Math.min(x.rentM, ceil) + 58.08 + 13.17 * deps - 37.91; // 管理費定額（夫妻＋2 孩 84.42）、最低自付 37.91
      var net = (earner(x.gA, x.workFracA).net + (s.partner ? earner(x.gB, x.workFracB).net : 0)) / 12;
      var eq = net * 2.1 / uc; // 換算成「夫妻＋2 名 14 歲以下孩子」的所得
      var cut = eq <= 2425 ? U.interp([[0, 0], [1426, 183], [2425, 487]], eq) : 487 + (eq - 2425) * 0.3043;
      var aid = maxAid - cut;
      if (aid >= 10) x.tr.rent = aid * 12; // 每月不到 10 € 不發
    },
    // 房貸（HCSF 規範）：自備房價 1 成＋稅費，25 年固定利率；月付（含 PTZ）不得超過稅前淨收入 35%，
    // 超過就要多付頭期款 §4.5、§13.4.2。利率 3.35%（2026-08 25 年期）＋貸款保險約 0.15%［NEWS／ESTIMATE］
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, KK = x.K, rate = 0.035, years = 25;
      // 買房那年的收入（離職照顧期間只算另一方）
      var gf = Math.pow(1 + x.A.wageGrowth, tb);
      var quitWho = s.care === 'quit' && x.nK > 0 ? (s.partner ? s.quitWho : 'A') : '';
      var qEnd = !quitWho ? -1 : s.quitUntil === 'preschool' ? x.births[x.nK - 1] + 2 : s.quitUntil === 'school' ? x.births[x.nK - 1] + 6 : Infinity;
      var off = function (who) { return quitWho === who && tb >= x.births[0] && tb < qEnd; };
      var gA = off('A') ? 0 : E.grossAt(s.jobA, s.ageA + tb, KK) * gf;
      var gB = !s.partner || off('B') ? 0 : E.grossAt(s.jobB, s.ageB + tb, KK) * gf;
      var eA = earner(gA, 1), eB = earner(gB, 1);
      var rfr = eA.taxable - proDed(eA.taxable) + eB.taxable - proDed(eB.taxable);
      // PTZ：首購、巴黎（A bis）與里昂（A）只限新成屋；所得上限、份額依家庭人數 §4.6［OFFICIAL］
      var ptz = 0, ptzYears = 0, ptzGrace = 0, kidsNow = 0;
      for (var i = 0; i < x.births.length; i++) if (x.births[i] <= tb) kidsNow++;
      var persons = Math.min((s.partner ? 2 : 1) + kidsNow, 5);
      if (s.build === 'new') {
        var inc = Math.max(rfr, total / 9);
        var incCap = [49000, 73500, 88200, 102900, 117600][persons - 1];
        if (inc <= incCap) {
          var q = inc / [1, 1.5, 1.8, 2.1, 2.4][persons - 1];
          var tr_ = q <= 25000 ? 0 : q <= 31000 ? 1 : q <= 37000 ? 2 : 3;
          ptz = [0.5, 0.4, 0.4, 0.2][tr_] * Math.min(total, [150000, 225000, 270000, 315000, 360000][persons - 1]);
          // 還款：所得越低期限越長、寬限越久（25/15、22/10、20/5、15/0 年）［ESTIMATE，來源不一致 §4.6］
          ptzYears = [25, 22, 20, 15][tr_]; ptzGrace = [15, 10, 5, 0][tr_];
        }
      }
      var main = Math.max(0, total * 0.9 - ptz);
      // 35% 負債比：一般房貸月付＋PTZ 平均每年還款
      var room = 0.35 * (eA.net + eB.net) - (ptz ? ptz / ptzYears : 0);
      var maxMain = room > 0 ? room * (1 - Math.pow(1 + rate, -years)) / rate : 0;
      var capped = main > maxMain;
      if (capped) main = maxMain;
      var parts = [{ amt: main, rate: rate, years: years, grace: 0, label: '一般房貸（25 年固定利率）' }];
      if (ptz > 0) parts.push({ amt: ptz, rate: 0, years: ptzYears, grace: ptzGrace, label: '零利率購屋貸款（PTZ）' });
      var note = ptz > 0 ? '可搭配零利率貸款 PTZ ' + Math.round(ptz / 1000) + ' 千歐元。' : '';
      if (capped) note += '月付受 35% 負債比限制，需要多付頭期款。';
      return { parts: parts, note: note };
    },

    // ---------- 育嬰（每位請假的家長、每個孩子 6 個月）§6.3、§13.5 ----------
    // 產假、陪產假視同全薪（和台灣模型相同）；6 個月 = 出生假 2 個月（Décret 2026-425：
    // （月薪上限 4,005）× 3 ÷ 91.25 × 0.79 的 70%／60%，每日上限 72.81／62.41，扣 CSG/CRDS 6.7%）
    // ＋ PreParE 4 個月（459.70 €/月）。給付不課所得稅是簡化（出生假日額在法國要課稅，金額不大）
    leavePay: function (g, ind, months, nb, x) {
      var wage = Math.min(g / (12 + (ind.bonus || 1)), PMSS);
      var ij = wage * 3 / 91.25 * 0.79;
      var m1 = Math.min(0.7 * ij, 72.81) * 30.42 * 0.933, m2 = Math.min(0.6 * ij, 62.41) * 30.42 * 0.933;
      var pay = months >= 2 ? m1 + m2 + PREPARE * (months - 2) : m1 * months;
      return pay * nb;
    },

    // ---------- 稅與社會提撥（夫妻合併申報、家庭商數）§5 ----------
    taxes: function (x) {
      var s = x.s;
      var a = earner(x.gA, x.workFracA), b = s.partner ? earner(x.gB, x.workFracB) : earner(0, 1);
      var R = a.taxable - proDed(a.taxable) + b.taxable - proDed(b.taxable);
      var kids = x.atHome.length; // 未成年＋25 歲以下在學的孩子都可併入報稅
      var tax = incomeTax(R, s.partner, kids);
      // 子女就學減稅：國中 61、高中 153、大學 183 €（不可退）［ESTIMATE，未查證］
      var red = 0;
      for (var i = 0; i < x.atHome.length; i++) { var g = x.atHome[i]; red += g >= 18 ? 183 : g >= 15 ? 153 : g >= 11 ? 61 : 0; }
      tax = Math.max(0, tax - red) + cehr(R, s.partner);
      return { si: a.si + b.si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  // 員工社會提撥（全職年薪 G）§5.2［OFFICIAL 費率］：老年年金 6.90%（PASS 內）＋0.40%；補充年金 T1 3.15%／T2 8.64%；
  // CEG 0.86%／1.08%；CET 0.14%（超過 PASS）；CSG 9.2%＋CRDS 0.5%（毛薪 98.25%）。不含公司團體醫療險自付額
  function contrib(G) {
    if (!(G > 0)) return { si: 0, taxable: 0 };
    var t1 = Math.min(G, PASS), t2 = U.clamp(G - PASS, 0, 7 * PASS);
    var csgBase = 0.9825 * Math.min(G, 4 * PASS) + Math.max(0, G - 4 * PASS);
    var si = 0.073 * t1 + 0.004 * Math.max(0, G - t1) + 0.0401 * t1 + 0.0972 * t2 + (G > PASS ? 0.0014 * Math.min(G, 8 * PASS) : 0) + 0.097 * csgBase
      + 0.012 * t1; // 公司團體醫療與保障險的員工自付，約 1.2%（和推算中位數時的假設一致）［ESTIMATE］
    // 應稅薪資：不可扣除的 CSG 2.4% 與 CRDS 0.5% 要加回 §5.2
    return { si: si, taxable: G - si + 0.029 * csgBase };
  }
  // 實際年薪 g、工作比例 wf（育嬰期間）：以全職年薪算費率再乘回比例（和日本模組相同）
  function earner(g, wf) {
    if (!(g > 0)) return { si: 0, taxable: 0, net: 0 };
    wf = Math.max(wf || 1, 0.05);
    var r = contrib(g / wf);
    return { si: r.si * wf, taxable: r.taxable * wf, net: g - r.si * wf };
  }
  // 薪資 10% 費用扣除（每人最少 509、最多 14,555）§5.1［NEWS］
  function proDed(t) { return t > 0 ? Math.min(t, U.clamp(0.1 * t, 509, 14555)) : 0; }
  function kidParts(n) { return n <= 0 ? 0 : n === 1 ? 0.5 : n - 1; } // 第 1、2 個孩子各 0.5 份，第 3 個起各 1 份
  function taxParts(partner, n) { return (partner ? 2 : 1) + kidParts(n) + (!partner && n > 0 ? 0.5 : 0); }
  // 所得稅：家庭商數＋每半份額節稅上限 1,807（單親第 1 個孩子 4,262）＋低稅額減免（décote）§5.1［OFFICIAL］
  function incomeTax(R, partner, n) {
    if (!(R > 0)) return 0;
    var base = partner ? 2 : 1, p = taxParts(partner, n);
    var tq = U.bracketTax(R / p, BAREME) * p;
    if (p > base) {
      var half = (p - base) * 2;
      var cap = partner ? 1807 * half : 4262 + 1807 * (half - 2);
      tq = Math.max(tq, U.bracketTax(R / base, BAREME) * base - cap);
    }
    var dc = partner ? [1483, 3277] : [897, 1982];
    if (tq < dc[1]) tq = Math.max(0, tq - (dc[0] - 0.4525 * tq));
    return tq;
  }
  // 高所得特別稅（CEHR）3%／4%［ESTIMATE，未查證；2025 年起的最低稅負 CDHR 未計］
  function cehr(R, partner) { var a = partner ? 500000 : 250000; return R <= a ? 0 : 0.03 * (Math.min(R, 2 * a) - a) + 0.04 * Math.max(0, R - 2 * a); }

  // 家庭所得（社福用）：津貼看兩年前的「應稅薪資扣 10%」；這裡用當年的全職等值收入近似（育嬰減少的月份不算）
  function res(x) {
    var key = x.t + '|' + x.gA + '|' + x.gB;
    if (x._fr && x._fr.key === key) return x._fr;
    var s = x.s, R = 0, txb = 0, netFT = 0, low = false;
    [[x.gA, x.workFracA], [s.partner ? x.gB : 0, x.workFracB]].forEach(function (p) {
      var ft = p[0] > 0 ? p[0] / (p[1] > 0 ? p[1] : 1) : 0;
      var cc = contrib(ft), r = cc.taxable - proDed(cc.taxable);
      R += r; txb += cc.taxable; netFT += ft - cc.si;
      if (r < 6306) low = true; // 「雙薪」：兩人各自年所得至少 6,306 €
    });
    x._fr = { key: key, year: R, month: R / 12, two: !s.partner || !low, netFT: netFT / 12, taxable: txb, P: null };
    return x._fr;
  }
  function kidsUnder(x, age) { var n = 0; for (var i = 0; i < x.atHome.length; i++) if (x.atHome[i] < age) n++; return n; }
  // PAJE 上限（生育給付、基本津貼半額）：雙薪或單親／單薪，1、2、3 個孩子，之後每多 1 個 +8,908 §6.1［OFFICIAL］
  function pajeCeil(n, two) { var b = two ? [49054, 56478, 65386] : [37118, 44542, 53450]; n = Math.max(1, n); return n <= 3 ? b[n - 1] : b[2] + 8908 * (n - 3); }
  // 基本津貼全額上限（也是家庭補充津貼的上限）；4 個孩子以上每多 1 個 +7,456［ESTIMATE］
  function abFull(n, two) { var b = two ? [41055, 47268, 54724] : [31066, 37279, 44735]; n = Math.max(1, n); return n <= 3 ? b[n - 1] : b[2] + 7456 * (n - 3); }
  function psuRate(n) { return n <= 1 ? 0.000619 : n === 2 ? 0.000516 : n === 3 ? 0.000413 : n <= 7 ? 0.000310 : 0.000206; }
  // 學校午餐、課後自習（每月）、點心時段（每月）、休閒中心（每天）：依巴黎 QF 級距。
  // 只有第 6 與第 10 級的課後收費有官方數字，其他級依午餐價格比例推估；休閒中心每天約午餐價 × 2.2［ESTIMATE］
  function prices(x) {
    var R = res(x);
    if (R.P) return R.P;
    var qf = R.taxable / 12 / taxParts(x.s.partner, x.atHome.length);
    var i = 0; while (qf > QF_UP[i]) i++;
    var f = x.c.schoolFactor;
    var sc = function (v6, v10) { return i >= 5 ? v6 + (v10 - v6) * (i - 5) / 4 : v6 * Math.max(MEAL[i], 0.5) / 4.61; };
    R.P = { meal: MEAL[i] * f, etude: sc(25.72, 33.28) * f, gouter: sc(19.52, 25.00) * f, day: Math.max(MEAL[i], 0.5) * 2.2 * f, tranche: i + 1 };
    return R.P;
  }
  K.contrib = contrib; K.incomeTax = incomeTax; K.res = res;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
