/* =========================================================================
   美國模組（紐約市、休士頓）。金額為美元、2026 年水準。
   來源與可信度見 research/countries/us.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   兩個城市的差別很大：紐約有州稅、市稅與帶薪育嬰假，房租貴；休士頓沒有州所得稅、房價低，但房屋稅高、幾乎一定要開車。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 31.92; // 1 美元 = 31.92 台幣（2026-10-12 收盤）§1［SECONDARY］

  // ---------- 稅制常數（2026）§3 ----------
  // 聯邦所得稅級距（Rev. Proc. 2025-32）［OFFICIAL 經 KPMG］：[上限, 稅率]
  var FED = {
    mfj: [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]],
    single: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]]
  };
  var FED_STD = { mfj: 32200, hoh: 24150, single: 16100 };
  // 紐約州：2026 年底部五級各降 0.1 個百分點（2025 年級距門檻）§3.3［NEWS＋DERIVED］
  var NY = {
    mfj: [[17150, 0.039], [23600, 0.044], [27900, 0.0515], [161550, 0.054], [323200, 0.059], [2155350, 0.0685], [5000000, 0.0965], [Infinity, 0.103]],
    single: [[8500, 0.039], [11700, 0.044], [13900, 0.0515], [80650, 0.054], [215400, 0.059], [1077550, 0.0685], [5000000, 0.0965], [Infinity, 0.103]]
  };
  var NY_STD = { mfj: 16050, hoh: 11200, single: 8000 };
  // 紐約市居民所得稅 §3.4［SECONDARY］
  var NYC = {
    mfj: [[21600, 0.03078], [45000, 0.03762], [90000, 0.03819], [Infinity, 0.03876]],
    single: [[12000, 0.03078], [25000, 0.03762], [50000, 0.03819], [Infinity, 0.03876]]
  };
  var SS_BASE = 184500; // 社會安全稅薪資上限（2026）§3.2［NEWS］
  var RATE = 0.067;     // 30 年固定房貸利率（Freddie Mac，2026-09）§4.4［OFFICIAL］

  var K = {
    id: 'US', name: '美國', cur: 'USD', curName: '美元', flag: '🇺🇸',
    fx: { toTWD: FX, pppToTWD: 13.65, date: '2026-10-12' }, // PPP：美國定義為 1，台灣約 13.65（沿用其他模組）§1
    careEnd: 3, // 0–2 歲托育；3–4 歲學前班（紐約 3-K、Pre-K 免費）；5 歲上公立小學的幼稚園班
    sources: [
      ['BLS 全職受僱者每週薪資十分位與年齡別中位數（2026 Q2）', 'https://www.bls.gov/news.release/wkyeng.t05.htm'],
      ['IRS 2026 稅率級距與標準扣除（KPMG 整理 Rev. Proc. 2025-32）', 'https://kpmg.com/us/en/taxnewsflash/news/2025/10/tnf-rev-proc-2025-32-inflation-adjustments-for-2026-individual-taxpayers.html'],
      ['紐約州 2026 帶薪家庭假', 'https://paidfamilyleave.ny.gov/2026'],
      ['紐約州 Empire State 兒童稅額抵減（2026）', 'https://www.governor.ny.gov/news/governor-hochul-announces-expanded-child-tax-credit-new-york-families'],
      ['KFF 2025 雇主健保調查：員工自付保費', 'https://www.kff.org/health-costs/issue-brief/2025-employer-health-benefits-survey/'],
      ['KFF：生產的自付醫療費用', 'https://www.kff.org/health-costs/press-release/women-who-give-birth-incur-nearly-19000-in-additional-health-costs-including-2854-more-that-they-pay-out-of-pocket/'],
      ['BLS 消費支出調查 2024', 'https://www.bls.gov/news.release/cesan.nr0.htm'],
      ['BLS 紐約都會區消費支出 2023–24', 'https://www.bls.gov/regions/northeast/news-release/consumerexpenditures_newyork.htm'],
      ['BLS 休士頓都會區消費支出 2023–24', 'https://www.bls.gov/regions/southwest/news-release/2026/consumerexpenditures_houston_20260105.htm'],
      ['StreetEasy 紐約租金與房價（2026-08）', 'https://streeteasy.com/blog/nyc-homes-sell-above-asking-highest-rate-four-years'],
      ['Rentometer 休士頓租金（2026-05）', 'https://www.rentometer.com/average-rent-in/tx/houston-tx'],
      ['Freddie Mac 房貸利率（2026-09）', 'https://freddiemac.gcs-web.com/node/32031/pdf'],
      ['Child Care Aware 紐約州托育價格（2024）', 'https://info.childcareaware.org/hubfs/Pricing%20and%20Landscape%20Infograms/Pricing%20Sheets%20PDF/2024-2025-price-fact-sheet-child-care-affordability-NewYork.pdf'],
      ['College Board 2025–26 大學學費', 'https://newsroom.collegeboard.org/trends-college-pricing-and-student-aid-report-published-tuition-prices-public-institutions-and']
    ],
    notes: [
      '美國的兒童稅額抵減（每個 17 歲以下孩子 2,200 美元）和紐約州的兒童抵減，算在「政府給的錢」裡。',
      '健保：員工自付的保費算在「稅與社保」；有孩子後改成家庭方案。',
      '育嬰假：紐約有 12 週、薪資 67% 的帶薪家庭假；德州沒有，請假就是無薪。',
      '低收入家庭的托育補助（名額有限）與大學的需求型獎助只做了簡化估計。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 全職受僱者每週薪資中位數 1,251（2026 Q2）× 52 = 65,052［OFFICIAL］，加約 1.5% 獎金［ESTIMATE］
      median: 66000,
      // 十分位：P10 642、P25 850、P75 1,915、P90 2,924（÷ 1,251）［OFFICIAL］，中間的百分位以對數內插［DERIVED］
      q: [[10, 0.513], [20, 0.619], [25, 0.679], [30, 0.734], [40, 0.857], [50, 1], [60, 1.186], [70, 1.406], [75, 1.531], [80, 1.763], [90, 2.337], [95, 3.10]],
      paretoAlpha: 2.2, // 美國頂端所得較集中［ESTIMATE］
      ageSpread: 0.85,
      // 年齡：20–24 歲 831、25–34 歲 1,160、35–44 歲 1,436、45–54 歲 1,421、55–64 歲 1,367、65 歲以上 1,233（÷ 1,251）［OFFICIAL］
      age: [[22, 0.66], [29.5, 0.93], [39.5, 1.15], [49.5, 1.14], [59.5, 1.09], [67, 0.99]],
      bonus: 0.5
    },
    CHECK_SALARIES: [30000, 45000, 66000, 100000, 150000, 250000],

    // ---------- 城市 ----------
    CITY: {
      nyc: {
        id: 'nyc', name: '紐約市', short: '紐約', capital: true,
        // 每人消費：紐約都會區 91,520 ÷ 2.5 人 vs 全國 77,907 ÷ 2.5 人（2023–24）＝ 1.175 §5.2［OFFICIAL］
        cons: 1.18,
        // 新簽約要價（StreetEasy 全市中位數）：2 房 4,800（2026-08）［SECONDARY］；3 房 4,995（2026-02）× 同期 2 房漲幅 ≈ 5,400；
        // 1 房依全市中位數 4,200 推估 3,900；4 房約 3 房 × 1.25［DERIVED／ESTIMATE］§4.1
        rent: [3900, 4800, 5400, 6700], rentAdj: 1.0, // 紐約搶租，成交常高於要價，不打折
        price: 10500,    // 每 ㎡（中古公寓與合作公寓）：全市要價中位數 98 萬、Queens 69.5 萬；約每平方呎 975［DERIVED／ESTIMATE］§4.2
        priceNew: 14700, // 新建案：Brooklyn 每平方呎 1,370（2026 Q2）［SECONDARY］§4.2
        size: { 1: 60, 2: 85, 3: 110, 4: 140 }, // 公寓面積［ESTIMATE］
        mgmt: 11,        // 公寓管理費（common charges／maintenance）每 ㎡ 每月［ESTIMATE］
        propTax: 0.008,  // 公寓房屋稅約市價 0.8%［ESTIMATE］
        closing: { used: 0.045, new: 0.06 }, // 房貸登記稅 1.925%、律師、產權保險；新建案另付移轉稅［ESTIMATE］
        homeIns: 600,
        downPct: 0.20,   // 紐約公寓（尤其合作公寓）通常要求 20% 頭期款［ESTIMATE］
        park: 300,       // 月租車位（外圍區）［ESTIMATE］
        tpass: 150,      // 每週上限 35 美元 × 4.3 週（2026）§5.4［NEWS］
        careInfant: 26000, careToddler: 24000, // 托育中心：紐約州平均嬰兒 20,439（2024）× 紐約市約 1.2 × 物價［DERIVED／ESTIMATE］§6.2
        nannyShare: 36000, // 兩家共用保母［ESTIMATE］
        preK: true,      // 3-K、Pre-K 免費（每天 6 小時 20 分）
        preKWrap: 3600,  // 免費學前班以外的延長照顧，每年［ESTIMATE］
        preKValue: 22000, // 免費學前班的價值（只做統計）［ESTIMATE］
        preschoolPrivate: 30000, preschoolIntl: 38000, // ［ESTIMATE］
        schoolPublic: 800, privateTuition: { es: 28000, jh: 32000, sh: 35000 }, intlSchool: 55000, // ［ESTIMATE］
        afterSchool: 650, // 課後照顧加暑期營隊，換算成每月［ESTIMATE］
        hobby: 180, cram: { none: 0, some: 250, full: 700 }, // ［ESTIMATE］
        birthOOP: 3300,  // 有雇主健保時生產自付 2,854（2018–20）× 醫療物價［DERIVED］§6.1
        doula: 4000, nightNurse: 9000, // 產後陪伴（doula）、夜間保母［ESTIMATE］
        pubTuition: 6930, pubFees: 500, pubFreeInc: 125000, // CUNY 學費；家庭年收入 12.5 萬以下 Excelsior 免學費［SECONDARY］§7.2
        leave: true      // 紐約帶薪家庭假
      },
      houston: {
        id: 'houston', name: '休士頓', short: '休士頓', capital: false,
        // 每人消費：休士頓都會區 85,377 ÷ 2.8 人 vs 全國 77,907 ÷ 2.5 人（2023–24）＝ 0.978 §5.2［OFFICIAL］
        cons: 0.98,
        // Rentometer（2026-05）：1 房 1,352、2 房 1,717、3 房 2,510（公寓平均 2,620、獨棟中位數 2,250）、4 房 2,953［SECONDARY］§4.1
        rent: [1350, 1700, 2300, 2900], rentAdj: 0.97, // 常有免租優惠［ESTIMATE］
        price: 1850,     // 獨棟住宅每 ㎡：HAR 中位價 33.2 萬（2026-04）÷ 約 2,000 平方呎［DERIVED］§4.2
        priceNew: 1950,
        size: { 1: 75, 2: 110, 3: 165, 4: 215 }, // 獨棟住宅面積［ESTIMATE］
        mgmt: 0.4,       // 社區管理費（HOA）每 ㎡ 每月［ESTIMATE］
        propTax: 0.017,  // 房屋稅：德州平均有效稅率 1.74%，扣自住減免後約 1.7%［SECONDARY＋ESTIMATE］§4.3
        closing: { used: 0.025, new: 0.02 }, // 德州沒有移轉稅［ESTIMATE］
        homeIns: 3800,   // 德州屋主保險偏高［ESTIMATE］
        downPct: 0.10,   // 首購族頭期款中位數約 9–10%，另付房貸保險（PMI）［ESTIMATE］
        park: 0, tpass: 70,
        careInfant: 13200, careToddler: 12500, // 德州平均嬰兒 11,349（2024）× 休士頓約 1.1 × 物價［DERIVED／ESTIMATE］§6.2
        nannyShare: 24000,
        preK: false,     // 德州公立 Pre-K 只收 4 歲且符合條件（低收入等）
        preKWrap: 0, preKValue: 9000,
        preschoolCenter: 10500, preschoolPrivate: 13000, preschoolIntl: 15000, // ［ESTIMATE］
        schoolPublic: 600, privateTuition: { es: 13000, jh: 15000, sh: 19000 }, intlSchool: 28000, // ［ESTIMATE］
        afterSchool: 400, hobby: 120, cram: { none: 0, some: 200, full: 550 }, // ［ESTIMATE］
        birthOOP: 3000, doula: 2800, nightNurse: 6000,
        pubTuition: 10300, pubFees: 1500, pubFreeInc: 65000, // 德州公立大學；休士頓大學年收入 6.5 萬以下免學費［ESTIMATE］§7.2
        leave: false
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷。各國同一個規則：「每人消費支出（不含住房與水電）× 0.716」。
      // 美國：2024 每戶消費 78,535 −住房與水電約 20,300 −健保保費 4,055（另外計算）＝ 54,180 ÷ 2.5 人 × 0.716 ÷ 12
      // ≈ 1,293（2024）× 物價 1.056 ≈ 1,365［DERIVED］§5.1
      adultBase: 1365, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 美國的大人開銷［ESTIMATE］
      child: [[0, 683], [2, 587], [6, 737], [12, 969], [18, 1078]],
      utilBase: 120, utilPerPerson: 80, // 水電瓦斯、網路與手機：每戶約 4,700／年（2.5 人）［ESTIMATE］
      premSingle: 1530, premCouple: 4900, premFamily: 7260, // 員工自付健保保費：單人 1,440、家庭 6,850（2025）× 1.06［OFFICIAL＋DERIVED］§5.3；夫妻方案［ESTIMATE］
      gearFirst: { frugal: 1500, normal: 3000, comfy: 6000 }, gearLater: 1000, // 嬰兒用品［ESTIMATE］
      postpartumFamily: 500,
      auPair: 22000,   // 互惠生（au pair）：每週津貼、仲介費、食宿［ESTIMATE］
      grandPaid: 0, helper: 0, // grandPaid 依兩地薪資換算（prep）
      privSticker: 47000, // 私立大學學費 45,000（2025–26）× 1.04［OFFICIAL＋DERIVED］§7.1
      uniAwayRent: 1100,  // 宿舍與餐費每年約 13,000［ESTIMATE］
      master: 20000,      // 公立研究所學費［ESTIMATE］
      abroad: { US: { years: 2, perYear: 45000 }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: { // AAA 2025：新車每年總持有成本 11,577（含折舊 4,334）［NEWS］；不含折舊的保險、油錢、保養、規費約 6,100［DERIVED］§5.4
        used: { buy: 26000, resale: 0.25, life: 8, run: 5600 },
        new: { buy: 38000, resale: 0.35, life: 10, run: 6100 },
        import: { buy: 62000, resale: 0.4, life: 10, run: 7500 }
      },
      scooter: { buy: 3000, resale: 0.2, life: 8, run: 600 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 24000, // 社會安全退休金平均每月 2,071（2026）［NEWS］
      houseSize: { 1: 60, 2: 85, 3: 110, 4: 140 }, // 後備值；實際用各城市的 size
      reno: { basic: 40, light: 150, full: 600 }, // 每 ㎡：搬家與小修／油漆地板／全面翻修［ESTIMATE］
      closing: { used: 0.04, new: 0.04 }, homeInsurance: 1500, // 後備值；實際用各城市的數字
      rentFactor: 1
    },

    BANDS: { care: 3, es: 5, jh: 11, sh: 14, uni: 18 },
    leaveMonths: 3, // 聯邦 FMLA 12 週（無薪）；紐約這 12 週有給付

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    // 台灣選項 → 美國最接近的做法
    localize: function (ls) {
      ls.loan = 'bank'; // 沒有新青安：一般 30 年固定利率房貸
      if (ls.city === 'houston' && (ls.transport === 'transit' || ls.transport === 'scooter')) ls.transport = 'used'; // 休士頓幾乎一定要開車
      if (ls.transport === 'scooter') ls.transport = 'transit';
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租公寓或房子（新簽約要價）', buy: '買房：紐約買公寓，休士頓買獨棟；30 年固定利率房貸', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用 30 年固定利率房貸（紐約頭期款 20%，休士頓 10%＋房貸保險）', qinganNoGrace: '沒有新青安，改用 30 年固定利率房貸（紐約頭期款 20%，休士頓 10%＋房貸保險）', bank: '30 年固定利率房貸（紐約頭期款 20%，休士頓 10%＋房貸保險）' },
      postpartum: { center: '美國沒有月子中心：請產後陪伴（doula）', nanny: '夜間保母（night nurse）', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 12 週（紐約領薪資 67%、每週最多 1,228.53；休士頓無薪）', B: '伴侶請 12 週（紐約領薪資 67%；休士頓無薪）', both: '兩人各請 12 週（紐約各領 67%；休士頓無薪）' },
      care: { quasi: '托育中心（沒有公費名額，全額自付）', public: '托育中心（低收入補助名額有限，未計）', private: '兩家共用保母（nanny share）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '紐約：免費 3-K、Pre-K；休士頓：私立學前班（公立 Pre-K 只收符合條件的 4 歲）', quasi: '紐約：免費 3-K、Pre-K＋延長照顧；休士頓：私立學前班', private: '私立學前班（全天）', bilingual: '雙語或國際學前班', home: '在家照顧' },
      school: { public: '公立學校（5 歲上幼稚園班，學費全免）', privateJH: '國中起讀私立', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後照顧＋暑期營隊', anqin1: '課後照顧＋營隊＋1 項才藝', anqin3: '課後照顧＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教或補習（每月幾次）', full: '密集家教與考試補習（SAT 等）' },
      uni: { public: '州立大學（紐約 CUNY：年收入 12.5 萬以下免學費；德州州立大學）', private: '私立大學（依家庭收入的需求型獎助）', mixed: '州立或私立各半' },
      support: { '24': '研究所 2 年', US: '在美國讀研究所 2 年' },
      transport: { transit: '紐約：地鐵與公車；休士頓幾乎一定要開車，改用中古車估算', scooter: '機車在美國不常見，改用大眾運輸或中古車', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nightNurse : C.postpartumFamily;
      var oop = c.birthOOP * (ls === 'comfy' ? 1.3 : ls === 'frugal' ? 0.85 : 1);
      return { cost: oop + (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: 0, local: 0 }; // 沒有生育給付
    },
    allowance: function () { return 0; }, // 沒有兒童津貼；兒童稅額抵減在 taxes() 裡算
    // 0–2 歲
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var m = careMonths / 12, fee = 0;
      if (cs === 'quasi' || cs === 'public') fee = (a === 0 ? c.careInfant : c.careToddler) * m;
      else if (cs === 'private') fee = c.nannyShare * m;
      else if (cs === 'helper') fee = C.auPair * m;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee };
    },
    // 3–4 歲
    preschool: function (x, ps, k, a) {
      var c = x.c, fee = 0, kg = 0;
      if (ps === 'home') return {};
      if (ps === 'private') fee = c.preschoolPrivate;
      else if (ps === 'bilingual') fee = c.preschoolIntl;
      else if (c.preK) { fee = c.preKWrap; kg = c.preKValue; } // 紐約：3-K、Pre-K 免費
      else if (ps === 'public' && a === 4 && fullGross(x) <= 1.85 * povertyLine(x)) { fee = 0; kg = c.preKValue; } // 德州：符合條件的 4 歲
      else fee = c.preschoolCenter;
      addDC(x, fee);
      return { fee: fee, kg: kg };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intlSchool : priv ? c.privateTuition[level] : c.schoolPublic;
      var extra = 0;
      if (level === 'es' || a < 13) {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = /^anqin/.test(s.after) ? c.afterSchool * 12 : 0;
        addDC(x, after);
        extra = after + hobbies * c.hobby * 12;
      }
      if (level !== 'es') extra += (c.cram[s.cram] || 0) * 12;
      return fee + extra;
    },
    // 大學：州立大學學費（低收入免學費）；私立大學依家庭收入的需求型獎助（簡化級距）［ESTIMATE］§7
    uni: function (x, k, a) {
      var s = x.s, c = x.c, C = x.C, inc = fullGross(x);
      var pub = inc <= c.pubFreeInc ? c.pubFees : c.pubTuition + c.pubFees;
      var priv = inc < 75000 ? 12000 : inc < 150000 ? 25000 : inc < 250000 ? 38000 : C.privSticker;
      var stickerPub = c.pubTuition + c.pubFees;
      if (s.uni === 'private') return { fee: priv, sub: C.privSticker - priv };
      if (s.uni === 'mixed') return { fee: (pub + priv) / 2, sub: (stickerPub - pub + C.privSticker - priv) / 2 };
      return { fee: pub, sub: stickerPub - pub };
    },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 買房：用共用流程，但面積、稅費、保險用各城市自己的數字（紐約公寓、休士頓獨棟）
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = [C.houseSize, C.closing, C.homeInsurance];
      C.houseSize = c.size; C.closing = c.closing; C.homeInsurance = c.homeIns;
      try { return WD.stdHousePlan(x); } finally { C.houseSize = keep[0]; C.closing = keep[1]; C.homeInsurance = keep[2]; }
    },
    // 30 年固定利率。頭期款低於 20% 時加房貸保險（PMI）約 0.55%／年，前 9 年［ESTIMATE］；
    // 每年本息不超過買房那年夫妻稅前收入的 36%［ESTIMATE］
    loanPlan: function (x, total) {
      var c = x.c, tb = x.tb;
      var inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var maxLoan = 0.36 * inc / annuityM(RATE, 30);
      var amt = Math.max(0, Math.min(total * (1 - c.downPct), maxLoan));
      var pmi = amt > total * 0.8 + 1;
      var rates = []; for (var ly = 0; ly < 30; ly++) rates.push(RATE + (pmi && ly < 9 ? 0.0055 : 0));
      return { parts: [{ amt: amt, rates: rates, years: 30, grace: 0, label: '30 年固定利率房貸' }], note: amt < total * (1 - c.downPct) - 1 ? '受收入限制，貸款較少' : '' };
    },

    // ---------- 育嬰給付：紐約帶薪家庭假 12 週，平均週薪 67%，每週最多 1,228.53（2026）§6.3［OFFICIAL］ ----------
    leavePay: function (g, ind, months, nb, x) {
      if (!x.c.leave) return 0;
      var weeks = Math.min(12, months * 52 / 12);
      return Math.min(0.67 * g / 52, 1228.53) * weeks * nb;
    },

    // ---------- 稅與社會保險（夫妻合併申報）§3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, C = x.C, ny = c.id === 'nyc';
      var gA = x.gA, gB = s.partner ? x.gB : 0, wages = gA + gB;
      var kids = x.atHome || [], n17 = 0, n4 = 0, n416 = 0, nOther = 0, n13 = 0;
      kids.forEach(function (a) {
        if (a < 17) { n17++; if (a < 4) n4++; else n416++; } else if (a < 24) nOther++;
        if (a < 13) n13++;
      });
      var status = s.partner ? 'mfj' : (n17 + nOther) > 0 ? 'hoh' : 'single';
      var earners = (gA > 0 ? 1 : 0) + (gB > 0 ? 1 : 0);
      // 健保保費（員工自付，稅前扣除）：有孩子改成家庭方案
      var prem = 0;
      if (earners > 0) prem = kids.some(function (a) { return a < 26; }) ? C.premFamily : s.partner ? (earners === 2 ? 2 * C.premSingle : C.premCouple) : C.premSingle;
      // 撫養費用彈性帳戶（DCFSA，2026 年起每戶 7,500，稅前）§3.5
      var dc = x.y.dc || 0, fsa = earners > 0 && n13 > 0 ? Math.min(7500, dc) : 0;
      // 薪資稅：社會安全 6.2%（上限 184,500）、Medicare 1.45%（夫妻合計超過 25 萬再加 0.9%）
      var base = Math.max(0, wages - prem - fsa), shA = wages > 0 ? gA / wages : 1;
      var fica = 0.062 * (Math.min(base * shA, SS_BASE) + Math.min(base * (1 - shA), SS_BASE))
        + 0.0145 * base + 0.009 * Math.max(0, base - (s.partner ? 250000 : 200000));
      // 紐約：帶薪家庭假 0.432%（每人上限 411.91）、州短期失能保險每週 0.6
      var nyPay = 0;
      if (ny) [gA, gB].forEach(function (g) { if (g > 0) nyPay += Math.min(0.00432 * g, 411.91) + 31.2; });
      var agi = base;
      // 州稅與市稅（紐約）
      var stTax = 0, escc = 0;
      if (ny) {
        var nyTI = Math.max(0, agi - NY_STD[status] - 1000 * (n17 + nOther));
        var br = status === 'mfj' ? 'mfj' : 'single';
        stTax = prog(nyTI, NY[br]) + prog(nyTI, NYC[br]);
        // Empire State 兒童抵減（2026）：4 歲以下 1,000、4–16 歲 500；夫妻年收入 11 萬（其他 7.5 萬）以上每 1,000 少 16.5（可退）§3.3
        var lim = s.partner ? 110000 : 75000;
        escc = Math.max(0, 1000 * n4 + 500 * n416 - 16.5 * Math.ceil(Math.max(0, agi - lim) / 1000));
      }
      // 聯邦：標準扣除或逐項扣除（房貸利息＋州稅與房屋稅，州地方稅上限 4 萬，所得超過 50 萬遞減）
      var propTax = x.ly >= 0 && x.house ? (x.house.tax || 0) : 0;
      var saltCap = Math.max(10000, 40000 - 0.3 * Math.max(0, agi - 500000));
      var mort = x.ly >= 0 ? (x.mortInt || 0) * Math.min(1, 750000 / Math.max(1, x.loanBalReal || 0)) : 0;
      var itemized = mort + Math.min(saltCap, stTax + propTax);
      var ti = Math.max(0, agi - Math.max(FED_STD[status], itemized));
      var fed = prog(ti, FED[status === 'mfj' ? 'mfj' : 'single']);
      // 撫養費用抵減（扣掉彈性帳戶後剩下的費用，不可退）§3.5
      var cap = n13 >= 2 ? 6000 : n13 === 1 ? 3000 : 0;
      var dcLeft = Math.max(0, Math.min(dc - fsa, cap - fsa));
      fed -= Math.min(fed, dcLeft * dcRate(agi, status));
      // 兒童稅額抵減：每個 17 歲以下 2,200（最多 1,700 可退）、其他受扶養者 500；夫妻 40 萬（其他 20 萬）以上遞減 §3.1
      var ctc = Math.max(0, 2200 * n17 + 500 * nOther - 50 * Math.ceil(Math.max(0, agi - (s.partner ? 400000 : 200000)) / 1000));
      var useNon = Math.min(fed, ctc);
      var refund = Math.min(ctc - useNon, 1700 * n17, 0.15 * Math.max(0, wages - 2500));
      fed -= useNon;
      // 兒童相關的抵減當作「政府給的錢」（和其他國家的兒童津貼比較）
      if (x.tr) x.tr.allowance = (x.tr.allowance || 0) + useNon + refund + escc;
      return { si: fica + prem + nyPay, tax: fed + stTax };
    }
  };

  // ---------- 工具 ----------
  function prog(n, B) {
    var t = 0, lo = 0;
    for (var i = 0; i < B.length && n > lo; i++) { t += (Math.min(n, B[i][0]) - lo) * B[i][1]; lo = B[i][0]; }
    return t;
  }
  // 撫養費用抵減比例：所得 1.5 萬以下 50%，到 4.5 萬降到 35%；夫妻 15 萬（其他 7.5 萬）以上再降，最低 20%（2026）§3.5［SECONDARY］
  function dcRate(agi, status) {
    var r = 0.50 - 0.01 * Math.max(0, Math.ceil((agi - 15000) / 2000));
    r = Math.max(0.35, r);
    var t2 = status === 'mfj' ? 150000 : 75000, step = status === 'mfj' ? 4000 : 2000;
    if (agi > t2) r = 0.35 - 0.01 * Math.ceil((agi - t2) / step);
    return Math.max(0.20, r);
  }
  // 每年本息（30 年、按月攤還）÷ 貸款
  function annuityM(r, n) { var m = r / 12; return 12 * m / (1 - Math.pow(1 + m, -n * 12)); }
  // 托育、學前與課後照顧的支出累計（給撫養費用彈性帳戶與抵減用；引擎每年重設 x.y）
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
  function fullGross(x) { return x.gA / Math.max(x.workFracA, 0.05) + (x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : 0); }
  // 聯邦貧窮線（2026，48 州）：一人 15,960，每多一人 +5,680［ESTIMATE］
  function povertyLine(x) { return 15960 + 5680 * ((x.s.partner ? 2 : 1) + (x.atHome || []).length - 1); }
  // 買房那年某一方的年薪（考慮離職照顧）
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
  K.prog = prog; K.dcRate = dcRate;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
