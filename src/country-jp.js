/* =========================================================================
   日本模組（東京 23 區、大阪市）。金額為日圓、2026 年水準。
   來源與可信度見 research/countries/jp.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 0.2017; // 1 日圓 = 0.2017 台幣（台銀，2026-10-08）§1

  var K = {
    id: 'JP', name: '日本', cur: 'JPY', curName: '日圓', flag: '🇯🇵',
    fx: { toTWD: FX, pppToTWD: 0.144, date: '2026-10-08' }, // PPP：IMF 2025 日本 94.69、台灣約 13.65（推算）§1
    careEnd: 3, // 0–2 歲是保育所，3–5 歲是幼兒園或保育所（無償化）
    sources: [
      ['國稅廳 民間給与実態統計調査（2025）', 'https://www.nta.go.jp/information/release/kokuzeicho/2026/minkan_2026/pdf/01.pdf'],
      ['總務省 全国家計構造調査（2024）', 'https://www.stat.go.jp/data/zenkokukakei/2024/pdf/gaiyou0828.pdf'],
      ['國稅廳 所得稅率、給与所得控除、基礎控除', 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm'],
      ['東日本 REINS 中古大樓成交（2026 Q1）', 'https://www.reins.or.jp/pdf/trend/sf/sf_202601-03.pdf'],
      ['住宅金融支援機構 Flat35 利用者調查（2025）', 'https://www.jhf.go.jp/files/topics/4941_ext_99_1.pdf'],
      ['こども家庭庁 兒童手當', 'https://www.cfa.go.jp/policies/kokoseido/jidouteate/annai'],
      ['文部科學省 子供の学習費調査（2023）', 'https://www.mext.go.jp/content/20241225-mxt_chousa01_000039333_1.pdf'],
      ['JASSO 学生生活調査（2024）', 'https://www.jasso.go.jp/statistics/gakusei_chosa/__icsFiles/afieldfile/2026/03/25/data24_1_3.pdf'],
      ['大阪市 0–2 歲第一子保育免費', 'https://www.city.osaka.lg.jp/hodoshiryo/seisakukikakushitsu/0000669117.html'],
      ['目黑區 0–2 歲保育免費與認證保育補助', 'https://www.city.meguro.tokyo.jp/hoiku/kosodatekyouiku/hoikuennado/rinnku_daiissi.html']
    ],

    // ---------- 薪資（全年在職受僱者，含兼職與獎金）§13.1 ----------
    W: {
      // 國稅廳 2025 級距內插中位數約 420 萬［DERIVED］× 2025→2026 約 1.035［ESTIMATE］
      median: 4350000,
      q: [[10, 0.298], [20, 0.505], [30, 0.687], [40, 0.845], [50, 1], [60, 1.156], [70, 1.347], [80, 1.609], [90, 2.084], [95, 2.786]],
      paretoAlpha: 3.0, // P95 以上的尾端（國稅廳 1,500–2,000 萬級距推算約 2.4–3.7）［ESTIMATE］
      ageSpread: 0.85,
      // 年齡：國稅廳 2025 男女平均年薪的簡單平均 ÷ 全體中位數，再 ÷1.12 把「平均」換成「中位數」［DERIVED］
      age: [[22, 0.60], [27, 0.89], [32, 0.96], [37, 1.02], [42, 1.08], [47, 1.12], [52, 1.16], [57, 1.16], [62, 0.98], [67, 0.76]],
      bonus: 2.2 // 獎金約占 15.4%，約 2.2 個月［OFFICIAL 推算］
    },

    // ---------- 城市 ----------
    CITY: {
      tokyo: {
        id: 'tokyo', name: '東京 23 區', short: '東京',
        // 和台灣同一種算法（含住房的每人消費 ÷ 全國）。東京都受僱者家庭的消費支出是全國的 1.09 倍（2022，戶人數相近，
        // 不含自有住宅設算租金）§14.2［OFFICIAL：東京都統計］；23 區比多摩地區高、再加上設算租金，取 1.15［DERIVED／ESTIMATE］
        cons: 1.15,
        // 租金（要價）：1K、1LDK、2LDK、3LDK、4LDK §13.3.1［ESTIMATE，4LDK 依 3LDK 每 ㎡ 推算］
        rent: [115000, 180000, 260000, 300000, 360000],
        price: 1379600,     // 中古大樓成交每 ㎡（專有面積，2026 Q1）［OFFICIAL］
        priceNew: 2109000,  // 新成屋每 ㎡（2025）［OFFICIAL］
        mgmt: 500,          // 管理費＋修繕積立金，每 ㎡ 每月［ESTIMATE］
        propTax: 0.0025,    // 固定資產稅＋都市計畫稅，約房價的 0.25%／年［ESTIMATE］
        park: 25000,        // 住宅區月租車位（世田谷 2.6 萬、練馬 1.7 萬）§13.5［SECONDARY］
        tpass: 3000,        // 通勤由公司給付；每位大人每月非通勤的交通費［ESTIMATE］
        health: 0.04925,    // 協會健保東京（員工負擔）§5.3
        delivery: 648309,   // 一般分娩平均費用（東京）［NEWS 轉述官方］
        postpartumPublic: 28000, // 區立產後ケア 7 天自付（杉並區）§13.4.2［OFFICIAL］
        carePrivate: 10000, // 認證保育所（上限 8 萬）扣區補助（最多 8 萬）後約自付［ESTIMATE］
        careSubStat: 30000, // 免費前 0–2 歲保育費（年收 600 萬家庭 2.2–3.5 萬）§6.4
        afterSchool: 6000,  // 公立學童保育 3,000–7,000＋點心 §13.8［SECONDARY］
        allowanceTop: 5000, // 東京 018 支援：每位 0–18 歲每月 5,000 §13.7［OFFICIAL］
        hsPrivateSupport: 501000 // 東京私立高中學費補助上限 §6.5
      },
      osaka: {
        id: 'osaka', name: '大阪市', short: '大阪',
        cons: 1.0,
        rent: [73000, 115000, 170000, 210000, 255000], // §13.3.1［ESTIMATE］
        // 中古大樓每 ㎡：近畿レインズ 2026-07 成交，中心 6 區平均 5,826 萬／56.25㎡ ≈ 104 萬、其他 18 區 2,935 萬（面積未公布，
        // 以約 62㎡ 推約 47 萬）§14.4［OFFICIAL＋DERIVED］；「一般地區」取兩者之間 60 萬［ESTIMATE］
        price: 600000,
        priceNew: 1160000,  // 新成屋每 ㎡（2025）［OFFICIAL］
        mgmt: 420, propTax: 0.0025,
        park: 15000,        // 大阪市月租車位：未查到［ESTIMATE］
        tpass: 3000,
        health: 0.05065,    // 協會健保大阪 2026 年度 10.13%，員工負擔一半 §14.1［OFFICIAL］
        delivery: 560000,   // 大阪的分娩費用：未查到，用全國平均 52 萬略加［ESTIMATE］
        postpartumPublic: 14875, // 大阪市產後ケア住宿 7 天自付 §13.4.2［OFFICIAL］
        carePrivate: 70000, // 大阪無照托育：未查到，且沒有補助［ESTIMATE］
        careSubStat: 30000,
        afterSchool: 2000,  // いきいき放課後事業（全體學童可參加；收費未查到）［ESTIMATE］
        allowanceTop: 0,
        jukuCoupon: 10000,  // 大阪市補習與才藝券：小五到國三每月 1 萬 §13.7［SECONDARY］
        hsPrivateSupport: 457200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷。各國用同一個規則：「每人消費支出（不含住房與水電）× 0.716」，
      // 0.716 是台灣 14,000 元 ÷（每人消費 25,726 × 0.76）。日本用 2024 全國家計構造調查「戶長為受僱者的家庭」
      // （含單身，比「2 人以上」的高齡家庭更接近遊戲的家庭）：每月 262,811 ÷ 2.24 人 = 117,326，
      // 扣住房與水電約 15% → 99,727 × 0.716 × 物價 1.05（2024 秋→2026）≈ 75,000［DERIVED／ESTIMATE］§13.2
      adultBase: 75000, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 日本的大人開銷［ESTIMATE］
      child: [[0, 37500], [2, 32100], [6, 40200], [12, 53600], [18, 58900]],
      utilBase: 12000, utilPerPerson: 4400, // 水電瓦斯 24,544／2.87 人 §13.5［DERIVED］
      prenatal: { frugal: 30000, normal: 60000, comfy: 150000 }, // 產檢券以外的自付［ESTIMATE］
      gearFirst: { frugal: 100000, normal: 200000, comfy: 400000 }, gearLater: 70000, // 嬰兒用品［ESTIMATE］
      birthLump: 500000,       // 出產育兒一時金（2028 年中起改由健保全額給付分娩）§13.4.1
      pregnancySupport: 100000, // 妊婦支援給付 5 萬＋5 萬 §6.1［OFFICIAL］
      postpartumHotel: 490000, // 民間產後飯店 7 晚 × 7 萬（寬裕以上）§13.4.2［SECONDARY］
      postpartumNanny: 200000, // 產後到府幫手：未查到［ESTIMATE］
      grandPaid: 0, helper: 0,  // grandPaid 依兩地薪資換算（prep）；外籍幫傭在日本改用認證保育所
      kgPublic: 70000, kgQuasi: 78000, kgPrivate: 190000, kgIntl: 1306000, kgFreeCap: 25700, // §7.1、§13.4.3
      elementaryPublic: 82000, elementaryPrivate: 1107700,
      juniorPublic: 150000, juniorPrivate: 1137000,
      seniorPublic: 233000, seniorPrivateFee: 766490, // 私立高中學校費用，扣學費補助前 §7.2
      intlSchool: 2700000, // 國際學校（ASIJ 2017 年 240 萬，加上漲幅）［ESTIMATE］
      hobbyClass: 8000,    // 每項才藝每月［ESTIMATE］
      cram: { junior: { none: 0, some: 15000, full: 32000 }, senior: { none: 0, some: 15000, full: 35000 } }, // §7.2［ESTIMATE］
      uniFee: { public: 606300, private: 1200710 }, // 國立學費＋入學金/4；私立學費＋設施費＋入學金/4 §7.3
      uniMultiFree: { public: 610000, private: 765000 }, // 多子家庭（同時扶養 3 名以上）學費減免上限 §6.5
      uniAwayRent: 55000,  // 離家就讀每年多約 60–78 萬 §7.3［DERIVED］
      master: 606300,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: 1266300 } },
      car: {
        used: { buy: 1750000, resale: 0.2, life: 8, run: 200000 }, // 中古車平均 175 萬；不含停車費約 19–23 萬／年 §13.5
        new: { buy: 3500000, resale: 0.3, life: 10, run: 200000 },
        import: { buy: 5250000, resale: 0.35, life: 10, run: 260000 } // 新車 ×1.5［ESTIMATE］
      },
      scooter: { buy: 250000, resale: 0.1, life: 8, run: 40000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 1800000, // 65 歲後每人每年（厚生年金）［ESTIMATE］
      houseSize: { 1: 45, 2: 60, 3: 70, 4: 85 }, // 專有面積：1LDK／2LDK／3LDK／4LDK §13.9［ESTIMATE］
      reno: { basic: 10000, light: 25000, full: 80000 }, // 每 ㎡：搬家與家具／一般整理／全面翻修［ESTIMATE］
      closing: { used: 0.07, new: 0.045 }, // 仲介費、登記、稅、貸款手續費［ESTIMATE］
      homeInsurance: 20000,
      rentFactor: 0.97 // 要價→成交，加上禮金與更新料［ESTIMATE］
    },

    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    leaveMonths: 6,

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    // 台灣選項 → 日本最接近的做法
    localize: function (ls) {
      if (ls.loan !== 'bank') ls.loan = 'bank';            // 沒有新青安；住宅ローン減稅自動適用
      if (ls.transport === 'scooter') ls.transport = 'transit'; // 帶小孩騎機車在東京、大阪不常見
      if (ls.care === 'helper') ls.care = 'private';       // 外籍幫傭只限特區，改用認證保育所估算
      ls.parking = 'rent';                                  // 日本大樓車位多為月租
    },
    MAP: {
      housing: { rent: '租屋（賃貸マンション）', buy: '買大樓（マンション），浮動利率房貸', family: '和長輩同住' },
      build: { used: '中古大樓', new: '新成屋大樓' },
      loan: { qingan: '沒有新青安，改用一般房貸（浮動利率），可抵房貸減稅（新成屋 13 年、中古 10 年）', qinganNoGrace: '沒有新青安，改用一般房貸（浮動利率），可抵房貸減稅（新成屋 13 年、中古 10 年）', bank: '一般房貸（浮動利率），可抵房貸減稅（新成屋 13 年、中古 10 年）' },
      leave: { none: '不請育嬰假', A: '一人請 6 個月：前 6 個月領薪水的 67%（免稅、免繳社保）', B: '一人請 6 個月：前 6 個月領薪水的 67%（免稅、免繳社保）', both: '兩人各請 6 個月：各領 67%，前 28 天再加 13%' },
      postpartum: { center: '市區町村的產後照護（最多 7 天，自付約 1.5–3 萬日圓）', nanny: '產後到府幫手', family: '回娘家坐月子（里帰り）' },
      care: { quasi: '認可保育所（東京、大阪 0–2 歲免費）', public: '認可保育所（東京、大阪 0–2 歲免費）', private: '東京：認證保育所（有區補助）；大阪：無照托育', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '日本幾乎沒有外籍幫傭，改用認證保育所估算', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼稚園（3–5 歲免費）', quasi: '保育所或認定こども園（3–5 歲免費，付餐費）', private: '私立幼稚園（免費到上限，超過自付）', bilingual: '國際幼兒園（只補助一小部分）', home: '在家照顧' },
      school: { public: '公立小學到高中（高中學費全額補助）', privateJH: '考私立國高中', private: '私立小學到高中', intl: '國際學校' },
      after: { none: '不上學童保育', anqin: '學童保育', anqin1: '學童保育＋1 項才藝', anqin3: '學童保育＋3 項才藝' },
      cram: { none: '不上補習班', some: '上補習班（塾）', full: '密集補習' },
      uni: { public: '國立大學', private: '私立大學', mixed: '國立或私立各半' },
      transport: { transit: '電車與公車（通勤費由公司給付）', scooter: '機車在日本不常見，改用大眾運輸', used: '中古車＋月租車位', new: '新車＋月租車位', import: '進口車＋月租車位' }
    },

    // ---------- 生產 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, year = D.BASE_YEAR + x.t;
      var ls = s.lifestyle;
      // 2028 年中起正常分娩由健保全額給付，出產育兒一時金同時取消 §13.4.1
      var covered = year >= 2029;
      var delivery = covered ? 30000 : c.delivery * (ls === 'comfy' ? 1.25 : 1);
      var pp = s.postpartum === 'center' ? (ls === 'comfy' ? C.postpartumHotel : c.postpartumPublic)
        : s.postpartum === 'nanny' ? C.postpartumNanny : 0;
      var cost = C.prenatal[ls] + delivery + (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp;
      return { cost: cost, grant: (covered ? 0 : C.birthLump) + C.pregnancySupport, local: 0 };
    },
    // 兒童手當（不排富、到高中畢業；第 3 個孩子起 3 萬）＋東京 018 §13.7
    allowance: function (x, k, a) {
      if (a >= 18) return 0;
      var m = k >= 2 ? 30000 : a < 3 ? 15000 : 10000;
      return (m + (x.c.allowanceTop || 0)) * 12;
    },
    // 0–2 歲（careMonths 個月送托）
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      if (cs === 'public' || cs === 'quasi') return { fee: 3000 * careMonths, sub: c.careSubStat * careMonths };
      if (cs === 'private') return { fee: c.carePrivate * careMonths, sub: Math.max(0, 80000 - c.carePrivate) * careMonths * (c.id === 'tokyo' ? 1 : 0) };
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      return {}; // grandFree
    },
    // 3–5 歲：無償化
    preschool: function (x, ps, k, a) {
      var C = x.C, kg = C.kgFreeCap * 12;
      if (ps === 'public') return { fee: C.kgPublic, kg: kg };
      if (ps === 'quasi') return { fee: C.kgQuasi, kg: kg };
      if (ps === 'private') return { fee: C.kgPrivate, kg: kg };
      if (ps === 'bilingual') return { fee: C.kgIntl, kg: 37000 * 12 };
      return {}; // home
    },
    school: function (x, level, k, a) {
      var s = x.s, C = x.C, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = 0, extra = 0;
      if (level === 'es') {
        fee = intl ? C.intlSchool : s.school === 'private' ? C.elementaryPrivate : C.elementaryPublic;
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = (/^anqin/.test(s.after) && !(s.school === 'private' || intl)) ? c.afterSchool * 12 : 0;
        extra = after + hobbies * C.hobbyClass * 12;
      } else {
        fee = intl ? C.intlSchool : level === 'jh' ? (priv ? C.juniorPrivate : C.juniorPublic)
          : (priv ? Math.max(0, C.seniorPrivateFee - c.hsPrivateSupport) : C.seniorPublic);
        extra = (C.cram[level === 'jh' ? 'junior' : 'senior'][s.cram] || 0) * 12;
      }
      // 大阪市：小五到國三，補習與才藝每月最多折抵 1 萬
      if (c.jukuCoupon && a >= 10 && a <= 14) extra = Math.max(0, extra - Math.min(extra, c.jukuCoupon * 12));
      return fee + extra;
    },
    uni: function (x, k, a) {
      var s = x.s, C = x.C;
      var fee = s.uni === 'mixed' ? (C.uniFee.public + C.uniFee.private) / 2 : C.uniFee[s.uni] || C.uniFee.public;
      var cap = s.uni === 'mixed' ? (C.uniMultiFree.public + C.uniMultiFree.private) / 2 : C.uniMultiFree[s.uni] || C.uniMultiFree.public;
      // 多子家庭：同時扶養 3 名以上子女，學費與入學金免費（有上限）
      var sub = x.atHome.length >= 3 ? Math.min(fee, cap) : 0;
      return { fee: fee - sub, sub: sub };
    },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var v = rooms <= 1 ? (c.rent[0] + c.rent[1]) / 2 : c.rent[Math.min(rooms, 4)];
      return v * rentMult * K.COST.rentFactor;
    },
    // 房貸：中古大樓自備約 16%、新成屋約 23.5%（Flat35 利用者調查）；浮動利率 1.2% 起，假設逐年升到 1.8%［ESTIMATE］
    loanPlan: function (x, total) {
      var ltv = x.s.build === 'new' ? 0.8 : 0.85;
      return { parts: [{ amt: total * ltv, rates: [0.012, 0.014, 0.016, 0.018], years: 35, grace: 0, label: '住宅ローン（浮動利率）' }] };
    },

    // ---------- 育嬰給付 §6.3 ----------
    // 前 180 天 67%（上限 332,454／月），免稅、免繳社保；雙親都請時前 28 天再加 13%
    leavePay: function (g, ind, months, nb, x) {
      var wage = g / (12 + 2.2);
      var pay = Math.min(0.67 * wage, 332454) * months;
      if (x.s.leave === 'both') pay += Math.min(0.13 * wage, 332454 / 0.67 * 0.13) * 28 / 30;
      return pay * nb;
    },

    // ---------- 稅與社會保險（個人分開課稅）§5 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, t = x.t;
      var people = [
        { g: x.gA, wf: x.workFracA, age: s.ageA + t },
        { g: s.partner ? x.gB : 0, wf: x.workFracB, age: s.ageB + t }
      ];
      // 子女扶養扣除（16 歲以上才有）給收入較高的一方
      var dep16 = 0, dep19 = 0;
      x.atHome.forEach(function (a) { if (a >= 19 && a <= 22) dep19++; else if (a >= 16) dep16++; });
      var main = people[0].g >= people[1].g ? 0 : 1;
      var si = 0, it = 0, rt = 0, earners = 0;
      people.forEach(function (p, i) {
        if (p.g <= 0) return;
        earners++;
        // 社會保險：年金有月薪上限 65 萬（獎金每次上限 150 萬）
        var base = p.g / Math.max(p.wf, 0.05), mon = base / 14.2;
        var pen = 0.0915 * (Math.min(mon, 650000) * 12 + Math.min(mon * 2.2, 3000000));
        var other = (c.health + 0.00115 + 0.005 + (p.age >= 40 && p.age < 65 ? 0.0081 : 0)) * base;
        var pSI = (pen + other) * p.wf;
        si += pSI;
        var kyuyo = Math.max(0, p.g - salaryDeduction(p.g));
        var other_ = people[1 - i].g;
        var spouse = s.partner && kyuyo <= 9000000 ? spouseDeduction(other_) : 0;
        var deps = i === main ? dep16 * 380000 + dep19 * 630000 : 0;
        var depsR = i === main ? dep16 * 330000 + dep19 * 450000 : 0;
        var taxable = kyuyo - basicDeduction(kyuyo) - pSI - spouse - deps;
        it += taxable > 0 ? U.bracketTax(taxable, BRACKETS) * 1.021 : 0;
        var taxableR = kyuyo - 430000 - pSI - (spouse > 0 ? Math.min(330000, spouse) : 0) - depsR;
        if (kyuyo > 450000) rt += Math.max(0, taxableR) * 0.10 + 2500;
      });
      // 住宅ローン減稅：年底餘額 0.7%，新成屋 13 年、中古 10 年（有孩子家庭上限較高）§4.6
      var credit = 0;
      if (x.ly >= 0 && x.ly < (s.build === 'new' ? 13 : 10)) {
        var hasKid = x.atHome.some(function (a) { return a < 19; });
        var cap = s.build === 'new' ? (hasKid ? 45000000 : 35000000) : 20000000;
        credit = 0.007 * Math.min(x.loanBalReal, cap / Math.pow(1 + x.A.inflation, x.t));
        credit = Math.min(credit, it + Math.min(rt, 97500 * Math.max(1, earners)));
      }
      return { si: si, tax: it + rt - credit };
    }
  };

  // 所得稅級距 §5.1
  var BRACKETS = [[1949000, 0.05, 0], [3299000, 0.10, 97500], [6949000, 0.20, 427500], [8999000, 0.23, 636000], [17999000, 0.33, 1536000], [39999000, 0.40, 2796000], [Infinity, 0.45, 4796000]];
  // 給与所得控除（2026）§5.1
  function salaryDeduction(g) {
    if (g <= 2200000) return Math.min(g, 740000);
    if (g <= 3600000) return g * 0.3 + 80000;
    if (g <= 6600000) return g * 0.2 + 440000;
    if (g <= 8500000) return g * 0.1 + 1100000;
    return 1950000;
  }
  // 基礎控除（2026）§13.6
  function basicDeduction(inc) {
    if (inc <= 4890000) return 1040000;
    if (inc <= 6550000) return 670000;
    if (inc <= 23500000) return 620000;
    if (inc <= 24000000) return 480000;
    if (inc <= 24500000) return 320000;
    if (inc <= 25000000) return 160000;
    return 0;
  }
  // 配偶者控除／配偶者特別控除（簡化：配偶薪資 136 萬以下 38 萬，到 201 萬遞減到 0）［ESTIMATE］
  function spouseDeduction(sp) {
    if (sp <= 1360000) return 380000;
    if (sp >= 2010000) return 0;
    return 380000 * (2010000 - sp) / (2010000 - 1360000);
  }
  K.salaryDeduction = salaryDeduction; K.basicDeduction = basicDeduction;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
