/* =========================================================================
   瑞士模組（蘇黎世、伯恩）。金額為瑞士法郎、2026 年水準。
   來源與可信度見 research/countries/ch.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千瑞士法郎（unit 1000）。
   特色：聯邦稅很低、州與市鎮稅依城市不同（伯恩比蘇黎世高）、夫妻合併報稅、
   健保要自己買（每位大人每月約 450–480，低收入有保費補助）、兒童津貼每月 215–310、
   托育全天每天 120–150（依所得補助）、4 歲上幼稚園、產假只有 14 週（8 成薪）、
   房貸利率很低但要 2 成自備款，且以 5% 利率試算負擔（可動用部分職業退休金）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 38.344;  // 1 瑞士法郎 = 38.344 台幣（2026-10-12 收盤）§1［SECONDARY］
  var RATE = 0.018; // 房貸：浮動（SARON）約 1.2%、5 年固定 1.8%、10 年固定 2.0%（2026-07；央行利率 0%）§4.4［SECONDARY］

  // ---------- 制度參數 §3 ----------
  var AHV = 0.053, ALV = 0.011, NBU = 0.012, SI_MAX = 148200;   // 老年遺屬殘障＋所得補償、失業保險、非職業意外保險（員工）［OFFICIAL／ESTIMATE］
  var BVG_COORD = 26460, BVG_MAXC = 64260;                        // 職業退休金：協調扣除額、最高協調薪資［OFFICIAL：2025］
  // 聯邦直接稅（夫妻、單身）［ESTIMATE：2024 年稅表］
  var FED_M = [[30800, 0], [50900, 0.01], [58400, 0.02], [75300, 0.03], [90300, 0.04], [103400, 0.05], [114700, 0.06], [124200, 0.07], [131700, 0.08], [137300, 0.09], [141200, 0.10], [143100, 0.11], [145000, 0.12], [895900, 0.13], [Infinity, 0.115]];
  var FED_S = [[15000, 0], [32800, 0.0077], [42900, 0.0088], [57200, 0.0264], [75200, 0.0297], [81000, 0.0594], [107400, 0.066], [139600, 0.088], [182600, 0.11], [783300, 0.132], [Infinity, 0.115]];
  var FED_KID = 263, FED_KIDDED = 6800, FED_DC = 25800;           // 每個孩子減稅、扣除額、托育費扣除上限［ESTIMATE：2025–26 值］
  var HEALTH = { adult: 0, young: 330, child: 120, share: 600 };  // 健保：大人保費依城市；19–25 歲、孩子（每月）；大人每年自負額與部分負擔［OFFICIAL 全國平均 465／326／122，取一般選擇的方案］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function fed(y, married, kids) {
    y = Math.max(0, y);
    var br = married ? FED_M : FED_S, top = married ? 895900 : 783300;
    var t = y > top ? 0.115 * y : tax(y, br);
    return Math.max(0, t - FED_KID * kids);
  }
  // 州＋市鎮＋教會稅占「稅前工作收入」的比例：BAK Economics／聯邦稅務署 2025 年州首府稅負表［SECONDARY］
  var CANT = {
    zurich: { pts: [50000, 80000, 100000, 150000, 200000], single: [0.065, 0.0941, 0.1085, 0.1345, 0.1561], m0: [0.0347, 0.0633, 0.078, 0.1026, 0.1233], m2: [0.0032, 0.0288, 0.045, 0.077, 0.1016], cap: 0.26 },
    bern: { pts: [50000, 80000, 100000, 150000, 200000], single: [0.114, 0.1403, 0.153, 0.177, 0.1954], m0: [0.0703, 0.1058, 0.1182, 0.1429, 0.1655], m2: [0.0098, 0.0619, 0.0831, 0.1153, 0.1414], cap: 0.32 }
  };
  function curve(pts, v, g, cap) {
    if (g <= 0) return 0;
    if (g < pts[0]) return v[0] * Math.max(0, (g - 20000) / (pts[0] - 20000));
    for (var i = 1; i < pts.length; i++) if (g <= pts[i]) return v[i - 1] + (v[i] - v[i - 1]) * (g - pts[i - 1]) / (pts[i] - pts[i - 1]);
    var n = pts.length - 1, sl = (v[n] - v[n - 1]) / (pts[n] - pts[n - 1]);
    return Math.min(cap, v[n] + sl * 0.6 * (g - pts[n])); // 20 萬以上：增加變慢，最高到上限
  }
  function cantRate(cid, g, married, kids) {
    var T = CANT[cid] || CANT.zurich;
    if (!married && !kids) return curve(T.pts, T.single, g, T.cap);
    var r0 = curve(T.pts, T.m0, g, T.cap), r2 = curve(T.pts, T.m2, g, T.cap);
    return Math.max(0, r0 + (r2 - r0) * kids / 2); // 1 個孩子取中間，3 個以上外插
  }
  // 職業退休金員工負擔：協調薪資 × 年齡別比例的一半（超過法定上限的部分另計約 4%）［OFFICIAL 比例；超額部分 ESTIMATE］
  function bvg(g, age) {
    if (!(g > 22680) || age >= 65) return 0;
    var r = age < 25 ? 0.005 : age < 35 ? 0.035 : age < 45 ? 0.05 : age < 55 ? 0.075 : 0.09;
    return (r + 0.005) * U.clamp(g - BVG_COORD, 3780, BVG_MAXC) + 0.04 * Math.max(0, g - 90720);
  }
  function person(g, age) {
    if (!(g > 0)) return { si: 0, pen: 0 };
    var pen = bvg(g, age || 35);
    return { si: AHV * g + (ALV + NBU) * Math.min(g, SI_MAX) + pen, pen: pen };
  }

  var K = {
    id: 'CH', name: '瑞士', cur: 'CHF', curName: '瑞士法郎', flag: '🇨🇭',
    unit: 1000, unitName: '千瑞士法郎',
    fx: { toTWD: FX, pppToTWD: 12.6, date: '2026-10-12' }, // PPP：瑞士約 1.08、台灣約 13.65［ESTIMATE］
    careEnd: 4,
    sources: [
      ['聯邦統計局：2024 年薪資中位數 7,024（SRF）', 'https://www.srf.ch/news/schweiz/bundesamt-fuer-statistik-schweizer-medianlohn-liegt-bei-7024-franken-brutto'],
      ['州首府稅負 2025（BAK Economics 蘇黎世稅負監測 2026）', 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/kantonsfinanzen/steuerbelastungsmonitor/BAK%20Economics_Zürcher_Steuerbelastungsmonitor_2026.pdf'],
      ['伯恩市稅負 2025（伯恩統計）', 'https://www.bern.ch/themen/stadt-recht-und-politik/bern-in-zahlen/katost/18offver/jahresdaten/t-18-07-010-steuerbelastung-des-arbeitseinkommens.pdf/at_download/file'],
      ['2026 健保平均保費（聯邦衛生署）', 'https://www.priminfo.admin.ch/downloads/MM_Praemiengenehmigung%202026_DE.pdf'],
      ['2026 各州兒童津貼（bexio）', 'https://www.bexio.com/de-CH/blog/view/familienzulagen'],
      ['蘇黎世州兒童津貼 2026（蘇黎世大學醫院）', 'https://www.usz.ch/app/uploads/2026/07/USZ-Willkommen-Merkblatt-fuer-Familienzulagen-2026.pdf'],
      ['伯恩州托育券 2026', 'https://www.fambe.sites.be.ch/fileadmin/user_upload/Familienthemen/informationsbroschuere_KiBON/informationsbroschuere-fuer-eltern-de-gueltig-ab-01.08.2026.pdf'],
      ['托育費用（蘇黎世、伯恩）', 'https://grenzgaengerzentrum.de/ratgeber/allgemein/kita-kosten-schweiz/'],
      ['蘇黎世市刊登租金（neho）', 'https://neho.ch/de/blog/mietzins-zurich'],
      ['伯恩市租金調查 2025', 'https://www.bern.ch/mediencenter/medienmitteilungen/aktuell_sta/mietpreise-sind-gegenueber-dem-vorjahr-um-1-4-prozent-gestiegen/dokumente/2026-02-17-mietpreiserhebung-2025-mm.pdf/download'],
      ['每 ㎡ 房價（neho：蘇黎世 8002、伯恩 3018）', 'https://neho.ch/de/quadratmeterpreis-zuerich-8002-0'],
      ['房貸利率 2026-07（GKB）', 'https://www.gkb.ch/content/dam/gkb/dokumente/private/zinskommentar/de/20260803_Zinskommentar_d.pdf'],
      ['家庭預算調查 2023（聯邦統計局）', 'https://dam-api.bfs.admin.ch/hub/api/dam/assets/36192815/master']
    ],
    notes: [
      '瑞士夫妻合併報稅；聯邦稅很低，州與市鎮稅依城市不同（同樣收入，伯恩約比蘇黎世多繳 3–4%）。有孩子的家庭稅很輕。',
      '員工社會保險約 6.5%，另有職業退休金（依年齡 3.5%–9%）；買第一間房可以提領一部分當頭期款。',
      '健保要自己買：大人每月約 450–480、孩子約 120；中低收入可申請保費補助。',
      '兒童津貼每個孩子每月 215–268（蘇黎世）或 250–310（伯恩），讀書可領到 25 歲。',
      '托育全天每天約 120–150 法郎，依家庭所得補助；4 歲上公立幼稚園（免費，但要付午餐與課後照顧）。',
      '產假只有 14 週、8 成薪（每天最多 220），陪產假 2 週。',
      '房貸利率約 1–2%，但要 2 成自備款，銀行用 5% 利率加 1% 維修費試算，月付不能超過收入 1/3。'
    ],

    // ---------- 薪資（全職換算，全年，含第 13 個月）§2 ----------
    W: {
      // 2024 年中位數每月 7,024（全職換算，含第 13 個月與獎金分攤）× 12 = 84,288［OFFICIAL］× 2026 年約 1.03 ≈ 87,000［DERIVED］
      median: 87000,
      // 最低 10% 低於 4,635（0.66）、最高 10% 高於 12,526（1.78）［OFFICIAL］；其餘形狀［ESTIMATE］
      q: [[10, 0.66], [20, 0.75], [25, 0.79], [30, 0.83], [40, 0.91], [50, 1], [60, 1.09], [70, 1.20], [75, 1.27], [80, 1.36], [90, 1.78], [95, 2.25]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      age: [[22, 0.68], [25, 0.78], [30, 0.92], [35, 1.02], [40, 1.08], [45, 1.12], [50, 1.14], [55, 1.15], [60, 1.13], [63, 1.10]], // ［ESTIMATE］
      bonus: 1
    },
    CHECK_SALARIES: [57000, 70000, 87000, 110000, 150000, 200000],

    // ---------- 城市 ----------
    CITY: {
      zurich: {
        id: 'zurich', name: '蘇黎世', short: '蘇黎世', capital: false,
        cons: 1.08, health: 450,
        // 刊登租金：2.5 房約 2,820、3.5 房約 3,436，每 ㎡ 每年中位數 497（2025）［SECONDARY］；舊約低很多，取 33／㎡／月＋雜費［ESTIMATE］
        rentM2: 33, nk: 3, rentSize: [60, 80, 100, 120], rentAdj: 1.0,
        price: 19500, priceNew: 22500, // 每 ㎡：全市公寓約 20,100–20,260（neho／Lookmove 2026-09），8002 區 19,865［SECONDARY］；新成屋 ×1.15［ESTIMATE］
        closing: 0.005, stweg: 4.5, propTax: 0, // 蘇黎世州沒有房屋移轉稅與房屋稅［OFFICIAL］
        park: 65, tpass: 90,
        kita: { full: 120, min: 12, lo: 25000, hi: 110000 }, // 市府補助的托育：每天最高 120、最低 12（familienleben.ch 引市府，2026）［SECONDARY］；補助區間［ESTIMATE］
        // 保費補助（IPV，蘇黎世州 2026）：區域 1 平均保費的 70%（大人每年 7,680、孩子 1,848），
        // 扣掉「計算所得」的 10.5%（已婚）或 8.4%（單身）；一家四口的所得上限約 12.7 萬（zh.ch 2025-09、SVA Zürich）［OFFICIAL］
        // 19–25 歲的年輕人以大人的 0.7 倍估計［ESTIMATE］
        ipv: { share: 0.70, adult: 7680, child: 1848, young: 5380, pctM: 0.105, pctS: 0.084 },
        hort: { full: 50, min: 8 },                         // 午餐＋課後照顧（Tagesschule／Hort）每天［ESTIMATE］
        privKg: 25000, biliKg: 30000, privSchool: 25000, intl: 35000,
        hobby: 80, cram: { none: 0, some: 250, full: 600 },
        doula: 3000, nurse: 3500
      },
      bern: {
        id: 'bern', name: '伯恩', short: '伯恩', capital: true,
        cons: 1.0, health: 470,
        rentM2: 21, nk: 2.5, rentSize: [60, 80, 100, 120], rentAdj: 1.0, // 現有租約：3 房 1,338、4 房 1,666（2025-11）［OFFICIAL］；新約較高［ESTIMATE］
        price: 8800, priceNew: 10500, // 3018 區公寓平均 7,763（較便宜的區）［SECONDARY／ESTIMATE］
        closing: 0.023, stweg: 4.0, propTax: 0.001, // 房屋移轉稅 1.8%＋公證；房屋稅約 0.1%［ESTIMATE］
        park: 40, tpass: 85,
        kita: { full: 120, min: 15, lo: 49000, hi: 170000 }, // 托育券：2026-08 起所得 4.9 萬以下全額（原 4.3 萬）、17 萬以下可領［OFFICIAL 門檻；其餘 ESTIMATE］
        hort: { full: 45, min: 8 },
        privKg: 22000, biliKg: 26000, privSchool: 22000, intl: 30000,
        hobby: 70, cram: { none: 0, some: 220, full: 550 },
        doula: 2800, nurse: 3200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2023 年家庭預算調查每戶每月消費 5,049 − 住房與能源 1,449 = 3,600 ÷ 每戶 2.07 人 ≈ 1,739
      // × 物價 2023→2026 約 1.016 × 0.716 ≈ 1,265［DERIVED］§5（健保保費不在消費支出裡，另計）
      adultBase: 1260, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 630], [2, 542], [6, 680], [12, 895], [18, 995]], // 台灣「孩子／大人」比例 × 瑞士大人開銷［ESTIMATE］
      utilBase: 100, utilPerPerson: 25, // 電、網路、廣播電視費（暖氣在租金雜費）［ESTIMATE］
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 600,
      postpartumFamily: 300, // 生產與助產士到府由健保給付［OFFICIAL 制度］
      grandPaid: 0, helper: 0,
      auPair: 1900,          // 互惠生每月（零用錢＋食宿＋保險）［ESTIMATE］
      uniAwayRent: 900,      // 學生合租房每月［ESTIMATE］
      master: 1500,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 15000, resale: 0.3, life: 8, run: 4500 }, // 保險、牌照稅、油錢、保養、高速公路貼紙［ESTIMATE］
        new: { buy: 40000, resale: 0.4, life: 10, run: 5000 },
        import: { buy: 65000, resale: 0.45, life: 10, run: 6000 }
      },
      scooter: { buy: 4000, resale: 0.3, life: 8, run: 700 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 46000, // 65 歲起國民年金（含第 13 個月）＋職業年金［ESTIMATE］
      houseSize: { 1: 60, 2: 80, 3: 100, 4: 120 },
      reno: { basic: 100, light: 400, full: 1500 },
      closing: { used: 0.01, new: 0.01 }, homeInsurance: 600,
      rentFactor: 1
    },

    // 0–3 歲托育，4–5 歲公立幼稚園，6 歲小學，12 歲國中，15 歲高中或學徒，19 歲大學
    BANDS: { care: 4, es: 6, jh: 12, sh: 15, uni: 19 },
    // 產假 14 週＋約 3 週休假 ≈ 4 個月；夫妻都請：母親 3.5 個月、父親 2 週陪產假
    leaveMonths: function (who, s) { return s.leave === 'both' ? (who === (s.partner ? 'B' : 'A') ? 3.5 : 0.5) : 4; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（市場租金）', buy: '買房（自備 2 成，可動用部分職業退休金）', family: '和長輩同住' },
      build: { used: '中古公寓', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（第一順位不必還本，第二順位 15 年還清）' },
      postpartum: { center: '產後單人房與休養（自費加購）', nanny: '夜間保母 2 週', family: '健保給付的助產士到府＋家人幫忙' },
      leave: { none: '不請育嬰假', A: '我請 14 週產假（8 成薪）＋休假', B: '伴侶請 14 週產假（8 成薪）＋休假', both: '產假 14 週＋陪產假 2 週' },
      care: { quasi: '有補助的托育中心（Kita，依所得收費）', public: '有補助的托育中心（Kita，依所得收費）', private: '私立托育中心（全額）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼稚園（免費）＋午餐與課後照顧', quasi: '公立幼稚園（免費）＋午餐與課後照顧', private: '私立幼稚園', bilingual: '雙語幼稚園', home: '公立幼稚園（半天，其餘在家）' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀私立學校', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校午餐與課後照顧（依所得收費）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（高中入學考）' },
      uni: { public: '公立大學（學費每年約 1,500）', private: '公立大學（學費每年約 1,500）', mixed: '公立大學（學費每年約 1,500）' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（健保給付）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: 0, local: 0 };
    },
    // 兒童津貼：蘇黎世 12 歲以下 215、以上 268；伯恩 250；16–24 歲讀書 268／310［SECONDARY］
    allowance: function (x, k, a) {
      if (a >= 25) return 0;
      var zh = x.c.id === 'zurich';
      return (a >= 16 ? (zh ? 268 : 310) : zh ? (a < 12 ? 215 : 268) : 250) * 12;
    },
    // 0–3 歲托育：每週 5 天、每月約 21.7 天；依家庭「計算所得」補助
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var days = 21.7 * careMonths, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') { var p = parentDay(x, c.kita); fee = p * days; sub = (c.kita.full - p) * days; }
      else if (cs === 'private') fee = c.kita.full * 1.1 * days;
      else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    // 4–5 歲：公立幼稚園免費；雙薪家庭另付午餐與課後照顧（依所得）
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'private') { addDC(x, c.privKg); return { fee: c.privKg }; }
      if (ps === 'bilingual') { addDC(x, c.biliKg); return { fee: c.biliKg }; }
      if (ps === 'home') return { fee: 300 };
      var p = parentDay(x, c.hort), fee = 300 + p * 21.7 * 11;
      addDC(x, fee - 300);
      return { fee: fee, kg: (c.hort.full - p) * 21.7 * 11 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : level === 'es' ? 600 : level === 'jh' ? 800 : 1000; // 公立：校外教學、營隊、教材
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        if (/^anqin/.test(s.after) && !intl) { var h = parentDay(x, c.hort) * 21.7 * 11; addDC(x, h); extra += h; }
        extra += hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: 1500, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4), size = c.rentSize[r - 1];
      return size * (c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor + c.nk);
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = h.total * c.closing;
      h.mgmt = c.stweg * h.size * 12; // 公寓管理費＋修繕基金
      h.tax = c.propTax * h.total;
      return h;
    },
    // 房貸：最多 8 成；以 5% 利率＋房價 1% 維修＋第二順位 15 年攤還試算，每年不超過稅前收入 1/3 §4.4［OFFICIAL 業界規則］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb), P = total, room = inc / 3 - 0.01 * P;
      var L = room / 0.05;
      if (L > P * 2 / 3) L = (room + P * 2 / 3 / 15) / (0.05 + 1 / 15);
      L = Math.max(0, Math.min(P * 0.8, L));
      var first = Math.min(L, P * 2 / 3), second = L - first;
      var parts = [{ amt: first, rate: RATE, years: 40, grace: 0, label: '第一順位房貸（約 2/3，慢慢還）' }];
      if (second > 0) parts.push({ amt: second, rate: RATE, years: 15, grace: 0, label: '第二順位房貸（15 年還清）' });
      return { parts: parts, note: L < P * 0.8 - 1 ? '銀行以 5% 利率試算，負擔不能超過收入 1/3，要多付自備款' : '' };
    },

    // ---------- 產假 14 週、陪產假 2 週：8 成薪，每天最多 220（每週 7 天）；要繳稅（以 85% 計）----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var s = x.s, mom = s.leave !== 'both' || who === (s.partner ? 'B' : 'A');
      var days = Math.min(mom ? 98 : 14, months * 30.4);
      return days * Math.min(0.8 * g / 360, 220) * nb * 0.85;
    },

    // ---------- 稅、社保、健保 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0, F = gA + gB, t = x.t || 0;
      var kids = (x.kAges || []).filter(function (a) { return a >= 0 && a < 25; });
      var kidsTax = kids.length; // 讀書到 25 歲都算扶養
      var under14 = kids.filter(function (a) { return a < 14; }).length;
      var pa = person(gA, s.ageA + t), pb = person(gB, s.ageB + t);
      var si = pa.si + pb.si, married = !!s.partner, earners = (gA > 0) + (gB > 0);
      // 聯邦稅：扣掉社保、職業費用（每位有工作者約 6,000）、保險費、孩子、第二份收入、托育費
      var dc = Math.min(x.y.dc || 0, FED_DC * under14);
      var y = F - si - 6000 * earners - (married ? 3600 : 1800) - 700 * kidsTax - FED_KIDDED * kidsTax - dc
        - (married && gA > 0 && gB > 0 ? U.clamp(0.5 * Math.min(gA, gB), 8600, 14100) : 0);
      var fedTax = fed(y, married || kidsTax > 0, kidsTax);
      // 州與市鎮稅：依稅負表（稅前工作收入），托育費從收入扣除
      var G = Math.max(0, F - dc), cant = G * cantRate(c.id, G, married, kidsTax);
      // 健保：保費＋自負額，扣掉保費補助（約為「計算所得」14% 以上的部分，簡化）［ESTIMATE］
      var adults = married ? 2 : 1, prem = adults * c.health * 12, share = adults * HEALTH.share;
      kids.forEach(function (a) { prem += (a < 19 ? HEALTH.child : HEALTH.young) * 12; share += a < 19 ? 150 : 400; });
      var ipv;
      if (c.ipv) {
        // 有州的公式（蘇黎世）：參考保費 × 比例 − 計算所得 × 自付比例
        var I = c.ipv, ref = adults * I.adult;
        kids.forEach(function (a) { ref += a < 19 ? I.child : I.young; });
        ipv = (x.S || 0) > 150000 ? 0 : Math.min(prem, Math.max(0, I.share * ref - (married ? I.pctM : I.pctS) * Math.max(0, y)));
      } else ipv = (x.S || 0) > 150000 ? 0 : Math.max(0, 0.85 * prem - 0.14 * Math.max(0, y));
      si += prem + share - ipv;
      // 職業退休金：買房前累積（員工＋雇主），買第一間房那年可提領，最多房價 1 成（扣約 7% 提領稅）
      if (x.tr && s.housing === 'buy') {
        if (!t) x.bvgBal = 0;
        if (x.ly == null || x.ly < 0) x.bvgBal = (x.bvgBal || 0) * 1.01 + 2 * (pa.pen + pb.pen);
        else if (x.ly === 0 && x.bvgBal && x.house) { x.tr.fund = (x.tr.fund || 0) + Math.min(0.93 * x.bvgBal, 0.1 * x.house.total); x.bvgBal = 0; }
      }
      return { si: si, tax: fedTax + cant };
    }
  };

  // 托育與課後照顧：家長每天自付 = 最低自付 → 全額，依「計算所得」（約等於聯邦應稅所得）線性增加
  function parentDay(x, p) {
    var s = x.s, k = x.c.kita; // 補助區間（所得下限、上限）用該城市托育的設定
    var M = Math.max(0, ((x.gA || 0) + (s.partner ? x.gB || 0 : 0)) * 0.72 - 6800 * (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; }).length);
    return p.min + (p.full - p.min) * U.clamp((M - k.lo) / (k.hi - k.lo), 0, 1);
  }
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
  K.person = person;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
