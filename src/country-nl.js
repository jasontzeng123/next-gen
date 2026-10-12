/* =========================================================================
   荷蘭模組（阿姆斯特丹、鹿特丹）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/nl.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）。
   特色：個人課稅（稅率已含國民保險費）、一般與工作減稅額、育兒的「所得連動合併減稅額」、
   兒童津貼＋依所得的兒童預算、托育費依所得補助最多 96%（但大城市收費高於補助上限）、
   4 歲就上小學、房貸可借到房價 100% 且利息可抵稅、租屋補助（2026 起租金超過上限也能領，只算到上限）、
   健保要自己繳保費（低收入有健保補助）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768;  // 1 歐元 = 35.768 台幣（2026-10-09，與其他歐元國家相同）§1
  var RATE = 0.038; // 10 年固定房貸約 3.6–3.8%（2026 年 9 月）§4.4［NEWS］；有 NHG 擔保約低 0.3%［ESTIMATE］

  // ---------- 制度參數（2026）§3 ----------
  var BR = [[38883, 0.3575], [78426, 0.3756], [Infinity, 0.495]]; // 所得稅＋國民保險（未達退休年齡）［OFFICIAL］
  var MORT_MAX = 0.3756, HILLEN = 0.7182, FORFAIT = 0.0035;      // 房貸利息最多以 37.56% 抵稅；自住房屋設算收入 0.35%［NEWS］
  var PEN = 0.075, PEN_FR = 18000, PEN_MAX = 137800;              // 職業退休金員工自付約 7.5%（扣除免提撥額後）［ESTIMATE］
  var HEALTH = 159 * 12 + 250;                                    // 每位大人：基本健保保費（平均每月約 159）＋自負額平均約 250［SECONDARY／ESTIMATE］
  var KB = [298.40, 362.35, 426.29];                              // 兒童津貼（每季）：0–5、6–11、12–17 歲（2026-07 起）［SECONDARY］
  var KGB = { child: 2580, age12: 724, age16: 964, single: 3416, thr: [29736, 39141], rate: 0.076, cap: [146011, 184633] }; // 兒童預算［SECONDARY］
  var KOT = { kdv: 11.23, bso: 9.98, hours: 200 };                // 托育補助的每小時上限［OFFICIAL］；每月約 200 小時（每週約 4.5 天）［ESTIMATE］
  // 托育補助比例（依家庭「計算所得」）：第一個孩子、其他孩子［OFFICIAL 表格，取代表點線性內插］
  var KOT_FIRST = [[56000, 0.96], [60000, 0.939], [90000, 0.789], [120000, 0.606], [148000, 0.465], [150093, 0.445], [165658, 0.365]];
  var KOT_NEXT = [[56000, 0.96], [60000, 0.956], [90000, 0.922], [120000, 0.879], [148000, 0.844], [150093, 0.84], [235698, 0.682]];
  var LEAVE_CAP = 304.25 * 261;                                   // 產假與育嬰給付的日薪上限（每年）［SECONDARY］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function lerp(tab, v) {
    if (v <= tab[0][0]) return tab[0][1];
    for (var i = 1; i < tab.length; i++) if (v <= tab[i][0]) { var a = tab[i - 1], b = tab[i]; return a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0]); }
    return tab[tab.length - 1][1];
  }
  function pension(g) { return g > 0 ? PEN * U.clamp(g - PEN_FR, 0, PEN_MAX - PEN_FR) : 0; }
  // 一般減稅額（依應稅所得遞減）與工作減稅額（依工作收入）［OFFICIAL 2026］
  function ahk(y) { return y <= 29736 ? 3115 : Math.max(0, 3115 - 0.06398 * (y - 29736)); }
  function ak(w) {
    if (w <= 0) return 0;
    if (w <= 11965) return 0.08324 * w;
    if (w <= 25845) return 996 + 0.31009 * (w - 11965);
    if (w <= 45592) return 5300 + 0.0195 * (w - 25845);
    if (w <= 132920) return Math.max(0, 5685 - 0.0651 * (w - 45592));
    return 0;
  }
  function iack(w) { return w <= 6239 ? 0 : Math.min(3032, 0.1145 * (w - 6239)); }
  // 一個人的稅：級距稅 − 房貸利息抵稅（最多 37.56%）− 減稅額（不退稅）
  function person(g, mortNet, kidBonus) {
    var p = pension(g), y = Math.max(0, g - p);
    var t0 = tax(y, BR), d = mortNet || 0;
    if (d < 0) d *= 1 - HILLEN;                      // 設算收入大於利息：大部分可扣（Hillen 法）
    var t1 = tax(Math.max(0, y - d), BR), save = t0 - t1;
    if (d > 0) save = Math.min(save, MORT_MAX * d);
    var credit = ahk(y - Math.max(0, d)) + (g > 0 ? ak(y) : 0) + (kidBonus && g > 0 ? iack(y) : 0);
    return { pen: p, y: y, tax: Math.max(0, t0 - save - credit) };
  }

  var K = {
    id: 'NL', name: '荷蘭', cur: 'EUR', curName: '歐元', flag: '🇳🇱',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 17.7, date: '2026-10-09' }, // PPP：荷蘭約 0.77、台灣約 13.65［ESTIMATE］
    careEnd: 4,
    sources: [
      ['國稅局：2026 年稅率與減稅額', 'https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen'],
      ['政府：2026 年托育補助金額', 'https://www.rijksoverheid.nl/themas/belastingen-uitkeringen-en-toeslagen/kinderopvangtoeslag/bedragen-kinderopvangtoeslag-2026'],
      ['2026 兒童預算（Knab）', 'https://bieb.knab.nl/inkomsten-uitgaven/alles-over-het-kindgebonden-budget-dit-jaar'],
      ['2026 兒童津貼（每季）', 'https://rekenmachinepro.nl/blog/kinderbijslag-2026-complete-gids/'],
      ['2026 租屋補助（上限與減額）', 'https://www.bruto-netto.nl/huurtoeslag-2026/'],
      ['2026 健保補助', 'https://www.overstappen.nl/zorgverzekering/zorgtoeslag/'],
      ['NVM 2026 第 2 季租金', 'https://www.nvm.nl/media/2hsi0enf/20260730-analyse-nvm-vgmnl-huurontwikkelingen-q2-2026-def.pdf'],
      ['NVM 阿姆斯特丹 2026 第 2 季房價', 'https://a.storyblok.com/f/311458/x/e0354d5d23/marktoverzicht-gemeente-amsterdam-2e-kwartaal-2026.pdf'],
      ['鹿特丹每 ㎡ 開價（Huispedia）', 'https://huispedia.nl/rotterdam'],
      ['2026 房貸規則變更（Van Bruggen）', 'https://www.vanbruggen.nl/actueel/nieuws/2026/wijzigingen-hypotheek-en-woningbezit-per-1-januari-2026'],
      ['CPB 2026 模態收入 48,000', 'https://www.raisin.com/nl-nl/economie/modaal-inkomen/'],
      ['2026 育嬰給付上限', 'https://www.bruto-netto.nl/ouderschapsverlof-berekenen/'],
      ['2026–27 大學學費', 'https://www.eur.nl/onderwijs/praktische-zaken/inschrijving/collegegeld/collegegeldtarieven-2026-2027'],
      ['CBS 家庭支出', 'https://www.cbs.nl/nl-nl/cijfers/detail/83676NED']
    ],
    notes: [
      '荷蘭是個人分開課稅，稅率 35.75%–49.5% 已經含國民保險費；有一般與工作減稅額，有 12 歲以下孩子時收入較低的一方還能多減最多 3,032。',
      '兒童津貼每季約 300–425 歐元；另有依家庭所得遞減的「兒童預算」（每個孩子每年最多 2,580）。',
      '托育很貴（阿姆斯特丹每小時約 12–13 歐元），但雙薪家庭可依所得領 36%–96% 的托育補助（每小時以 11.23 為上限）。',
      '孩子 4 歲就上小學；0–3 歲上托育，課後照顧也有補助。',
      '健保要自己繳保費（每位大人每月約 159），孩子免費；低收入可領健保補助。',
      '買房可借到房價 100%（稅費要自己出），房貸利息可抵稅；35 歲以下買 55.5 萬以下的房子免移轉稅。',
      '阿姆斯特丹租屋很貴，社會住宅要排隊十幾年，這裡用市場租金；2026 起租金超過上限也能領租屋補助（只算到上限）。'
    ],

    // ---------- 薪資（全職受僱者，全年，含 8% 休假津貼）§2 ----------
    W: {
      // CPB 2026 模態收入 48,000（含休假津貼）［NEWS］；全職中位數再加年終與第 13 個月約 50,000［ESTIMATE］
      median: 50000,
      // 分布較集中：2026 最低工資每小時 14.71 × 2,080 小時 × 1.08 ≈ 33,000（約 0.66）［DERIVED］；其餘形狀［ESTIMATE］
      q: [[10, 0.68], [20, 0.76], [25, 0.80], [30, 0.85], [40, 0.92], [50, 1], [60, 1.09], [70, 1.20], [75, 1.28], [80, 1.38], [90, 1.70], [95, 2.05]],
      paretoAlpha: 3.0,
      ageSpread: 0.85,
      age: [[22, 0.62], [25, 0.72], [30, 0.88], [35, 1.0], [40, 1.08], [45, 1.12], [50, 1.13], [55, 1.13], [60, 1.10], [63, 1.05]], // ［ESTIMATE］
      bonus: 1
    },
    CHECK_SALARIES: [33000, 42000, 50000, 65000, 85000, 120000],

    // ---------- 城市 ----------
    CITY: {
      amsterdam: {
        id: 'amsterdam', name: '阿姆斯特丹', short: '阿姆斯特丹', capital: true,
        cons: 1.10,
        // 自由市場租金每 ㎡ 25.70（2026 Q2）［NEWS：NVM］；部分新約受「中段租金」管制，取 24.5［ESTIMATE］＋服務費
        rentM2: 24.5, service: 60, rentSize: [50, 70, 90, 110], rentAdj: 1.0,
        price: 8400, priceNew: 9200, // 成交中位數每 ㎡ 8,570（公寓 8,799，2026 Q2）［SECONDARY：NVM］
        vve: 2.6, ozb: 0.0005, fees: 550, // 大樓管理費（每 ㎡ 每月）、房屋稅率、垃圾與水利稅［ESTIMATE］
        park: 45, tpass: 100,
        kdv: 12.6, kdvPremium: 14.5, bso: 11.0, // 托育與課後照顧每小時實際收費［ESTIMATE：大城市 12–14］
        privSchool: 15000, intl: 22000,
        hobby: 50, cram: { none: 0, some: 150, full: 380 },
        doula: 1800, nurse: 1200
      },
      rotterdam: {
        id: 'rotterdam', name: '鹿特丹', short: '鹿特丹', capital: false,
        cons: 0.98,
        rentM2: 18.8, service: 50, rentSize: [50, 70, 90, 110], rentAdj: 1.0, // 自由市場每 ㎡ 19.67［NEWS：NVM］
        price: 5100, priceNew: 5900, // 開價每 ㎡ 4,984（2026-10），成交通常高於開價［SECONDARY／ESTIMATE］
        vve: 2.3, ozb: 0.0011, fees: 520,
        park: 10, tpass: 95,
        kdv: 11.9, kdvPremium: 13.5, bso: 10.3,
        privSchool: 14000, intl: 18000,
        hobby: 45, cram: { none: 0, some: 130, full: 340 },
        doula: 1600, nurse: 1100
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：CBS 2020 每戶每年 35,211 ×（1 − 住房與能源 32.9%）÷ 每戶約 2.12 人 ÷ 12 ≈ 929
      // × 物價 2020→2026 約 1.28 × 0.716 ≈ 850［DERIVED／ESTIMATE］§5
      adultBase: 850, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 425], [2, 366], [6, 459], [12, 604], [18, 672]], // 台灣「孩子／大人」比例 × 荷蘭大人開銷［ESTIMATE］
      utilBase: 110, utilPerPerson: 35, // 電、瓦斯、網路、水（租金不含）［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300, // 產後到府照護（健保給付，自付每小時約 5 歐元）［ESTIMATE］
      grandPaid: 0, helper: 0,
      auPair: 900,           // 互惠生每月：零用錢約 340＋食宿＋保險［ESTIMATE］
      uniAwayRent: 650,      // 學生套房每月［ESTIMATE］
      master: 2694,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.25, life: 8, run: 3200 }, // 保險、牌照稅、油錢、保養［ESTIMATE］
        new: { buy: 30000, resale: 0.35, life: 10, run: 3400 },
        import: { buy: 45000, resale: 0.4, life: 10, run: 4200 }
      },
      scooter: { buy: 2500, resale: 0.2, life: 7, run: 200 }, // 荷蘭改成電動自行車［ESTIMATE］
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 24000, // 67 歲起國民年金（已婚每人約 13,000）＋職業年金［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 115 },
      reno: { basic: 50, light: 200, full: 700 },
      closing: { used: 0.03, new: 0.012 }, homeInsurance: 400,
      rentFactor: 1
    },

    // 0–3 歲托育，4 歲上小學（沒有另外的幼兒園階段），12 歲中學，15 歲高年級，18 歲大學
    BANDS: { care: 4, es: 4, jh: 12, sh: 15, uni: 18 },
    // 一人請：16 週全薪產假＋9 週 70% 育嬰給付＋約 1 週無薪 ≈ 6 個月；夫妻都請：各約 4 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 4 : 6; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（市場租金，可領租屋補助）', buy: '買房（可貸到房價 100%，稅費自付，利息可抵稅）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案（含增值稅，免移轉稅）' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（30 年本息平均攤還）' },
      postpartum: { center: '產後恢復旅館（kraamhotel）', nanny: '加購到府產後照護', family: '健保給付的到府產後照護＋家人幫忙' },
      leave: { none: '不請育嬰假', A: '我請約 6 個月（16 週全薪產假＋9 週 7 成給付）', B: '伴侶請約 6 個月（16 週全薪產假＋9 週 7 成給付）', both: '夫妻各請約 4 個月（產假／陪產假＋育嬰給付）' },
      care: { quasi: '托育中心（kinderdagverblijf，依所得補助）', public: '托育中心（kinderdagverblijf，依所得補助）', private: '高價位托育中心', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '荷蘭 4 歲就上小學，沒有幼兒園階段', quasi: '荷蘭 4 歲就上小學，沒有幼兒園階段', private: '荷蘭 4 歲就上小學，沒有幼兒園階段', bilingual: '荷蘭 4 歲就上小學，沒有幼兒園階段', home: '荷蘭 4 歲就上小學，沒有幼兒園階段' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀私立學校（很少見）', private: '私立學校（很少見）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後照顧（BSO，依所得補助）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（畢業考）' },
      uni: { public: '大學（學費每年 2,694，另有生活補助）', private: '大學（學費每年 2,694，另有生活補助）', mixed: '大學（學費每年 2,694，另有生活補助）' },
      transport: { transit: '大眾運輸＋自行車', scooter: '電動自行車（荷蘭最常見）', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（健保給付）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: 0, local: 0 };
    },
    allowance: function (x, k, a) { return a < 18 ? KB[a <= 5 ? 0 : a <= 11 ? 1 : 2] * 4 : 0; },
    // 0–3 歲：托育中心每月約 200 小時；托育補助 = 補助比例 × min(收費, 11.23) × 時數（雙方都有工作才能領）
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var rate = cs === 'private' ? c.kdvPremium : c.kdv, H = KOT.hours;
        x.y.kdv = (x.y.kdv || 0) + 1;
        var gross = rate * H * careMonths, sub = kot(x, Math.min(rate, KOT.kdv) * H * careMonths, x.y.kdv === 1);
        return { fee: gross - sub, sub: sub };
      }
      if (cs === 'helper') return { fee: C.auPair * careMonths };
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      return {};
    },
    preschool: function () { return {}; }, // 4 歲上小學，不會用到
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : level === 'es' ? 150 : 450; // 公立：家長自願費、校外教學、文具與筆電分攤
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        if (s.after !== 'none' && !intl) {
          // 課後照顧（BSO）每月約 70 小時（含學校假期），也有托育補助
          var H = 70 * 12, first = !(x.kAges || []).some(function (b) { return b >= 0 && b < 4; }) && !x.y.bso;
          x.y.bso = (x.y.bso || 0) + 1;
          var gross = c.bso * H, sub = kot(x, Math.min(c.bso, KOT.bso) * H, first);
          extra += gross - sub;
          if (x.tr) x.tr.care += sub;
        }
        extra += hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    // 大學：學費 2,694；學生生活補助（基本助學金）住外面每月約 325、住家裡約 130［SECONDARY］
    uni: function (x, k, a) {
      if (x.tr) x.tr.allowance += (x.s.uniAway ? 324.52 : 130.21) * 12;
      return { fee: 2694, sub: 0 };
    },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult, x) {
      var r = Math.min(Math.max(rooms, 1), 4), size = c.rentSize[r - 1];
      var kale = size * c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
      if (x) x.y.kale = kale;
      return kale + c.service;
    },
    // 租屋補助（2026）：租金只算到 932.93；100%／65%／40% 分段，所得超過門檻每 1 歐元減 0.22（單身 0.27）［SECONDARY 規則；分段參數 ESTIMATE］
    rentSubsidy: function (x) {
      var s = x.s, n = Math.max(1, x.persons || 1);
      if ((x.S || 0) > (s.partner ? 76958 : 38479)) return;
      var kale = x.y.kale || x.rentM || 0, rek = Math.min(kale, 932.93), base = 225, q = 477.20, top = n >= 3 ? 731.93 : 682.96;
      var m = U.clamp(rek - base, 0, q - base) + 0.65 * U.clamp(rek - q, 0, top - q) + 0.40 * Math.max(0, rek - top);
      var Y = toets(x), multi = n >= 2;
      var yr = m * 12 - (multi ? 0.22 : 0.27) * Math.max(0, Y - (multi ? 31500 : 23425));
      if (yr >= 120) x.tr.rent = Math.min(yr, (x.rentM || 0) * 12);
    },
    housePlan: function (x) {
      var s = x.s, c = x.c, tb = x.tb, h = WD.stdHousePlan(x);
      // 移轉稅 2%：新建案免（已含增值稅）；35 歲以下買 55.5 萬以下的房子免（夫妻各算一半）［NEWS］
      var ages = [s.ageA + tb].concat(s.partner ? [s.ageB + tb] : []);
      var share = h.total > 555000 ? 1 : ages.filter(function (g) { return g >= 35; }).length / ages.length;
      var ovb = s.build === 'new' ? 0 : 0.02 * h.total * share;
      var nhg = h.total <= 470000 ? 0.004 * h.loanAmt : 0;
      h.closing = ovb + 6000 + nhg; // 公證、估價、房貸顧問約 6,000［ESTIMATE］
      h.mgmt = c.vve * h.size * 12;
      h.tax = c.ozb * h.total + c.fees;
      return h;
    },
    // 房貸：最多房價 100%、30 年本息攤還；每年月付最多約稅前收入 20–30%（Nibud 借款上限，收入越高比例越高）§4.4［OFFICIAL 規則；比例 ESTIMATE］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var rate = total <= 470000 ? RATE - 0.003 : RATE;
      var wq = U.clamp(0.20 + 0.075 * (inc - 40000) / 50000, 0.18, 0.30);
      var amt = Math.max(0, Math.min(total, wq * inc / ann(rate, 30)));
      return { parts: [{ amt: amt, rate: rate, years: 30, grace: 0, label: total <= 470000 ? '有國家擔保（NHG）的房貸' : '一般房貸（10 年固定）' }], note: amt < total - 1 ? '借款上限依收入計算，不足的部分要自己出' : '' };
    },

    // ---------- 產假與育嬰給付：日薪上限 304.25；要繳稅（以 8 成計）----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var s = x.s, wk = Math.min(g, LEAVE_CAP) / 52, weeks = months * 52 / 12, paid;
      var mom = s.leave !== 'both' || who === (s.partner ? 'B' : 'A');
      if (mom) paid = Math.min(16, weeks) + 0.7 * U.clamp(weeks - 16, 0, 9);          // 16 週全薪＋9 週 7 成
      else paid = Math.min(1, weeks) + 0.7 * U.clamp(weeks - 1, 0, 5) + 0.7 * U.clamp(weeks - 6, 0, 9); // 陪產假 1 週全薪＋5 週 7 成＋育嬰 9 週 7 成
      return paid * wk * nb * 0.8;
    },

    // ---------- 稅、健保與兒童預算 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; });
      var under12 = kids.some(function (a) { return a < 12; });
      // 房貸利息淨額（利息 − 房屋設算收入）算在收入較高的一方
      var own = x.house && x.ly >= 0;
      var mortNet = own ? (x.mortInt || 0) - FORFAIT * (x.house.price || 0) : 0;
      var aHigh = gA >= gB;
      // 有 12 歲以下孩子：收入較低的一方（或單親）多一筆所得連動減稅額
      var bonusA = under12 && (!s.partner || gA <= gB), bonusB = under12 && s.partner && !bonusA;
      var pa = person(gA, aHigh ? mortNet : 0, bonusA), pb = s.partner ? person(gB, aHigh ? 0 : mortNet, bonusB) : { pen: 0, y: 0, tax: 0 };
      var Y = pa.y + pb.y;
      // 健保：每位大人自繳保費＋自負額，扣掉健保補助（家庭所得 29,600 以下全額，之後每 1 歐元減 0.137）［SECONDARY／DERIVED］
      var adults = s.partner ? 2 : 1, ztMax = s.partner ? 2952 : 1548;
      var zt = (x.S || 0) > (s.partner ? 179429 : 141896) ? 0 : U.clamp(ztMax - 0.137 * (Y - 29595), 0, ztMax);
      var si = pa.pen + pb.pen + Math.max(0, HEALTH * adults - zt);
      // 兒童預算：每個孩子 2,580，12–15 歲 +724、16–17 歲 +964，單親 +3,416；所得超過門檻後每 1 歐元減 0.076
      if (kids.length && x.tr && (x.S || 0) <= KGB.cap[s.partner ? 1 : 0]) {
        var kgb = 0;
        kids.forEach(function (a) { kgb += KGB.child + (a >= 16 ? KGB.age16 : a >= 12 ? KGB.age12 : 0); });
        if (!s.partner) kgb += KGB.single;
        kgb = Math.max(0, kgb - KGB.rate * Math.max(0, Y - KGB.thr[s.partner ? 1 : 0]));
        x.tr.allowance += kgb;
      }
      return { si: si, tax: pa.tax + pb.tax };
    }
  };

  // 托育補助：家庭「計算所得」決定比例；夫妻都要有工作
  function kot(x, base, first) {
    var s = x.s;
    if (!((x.gA || 0) > 0) || (s.partner && !((x.gB || 0) > 0))) return 0;
    return base * lerp(first ? KOT_FIRST : KOT_NEXT, toets(x));
  }
  function toets(x) { return Math.max(0, (x.gA || 0) - pension(x.gA || 0)) + (x.s.partner ? Math.max(0, (x.gB || 0) - pension(x.gB || 0)) : 0); }
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
