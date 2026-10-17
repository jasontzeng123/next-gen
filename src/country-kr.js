/* =========================================================================
   韓國模組（首爾、釜山）。金額為韓元、2026 年水準。
   來源與可信度見 research/countries/kr.md（§ 編號標在各數字旁；§12 的補充優先於前面的數字）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 1 / 42.0; // 1 韓元 = 0.0238 台幣（馬來西亞央行牌價交叉匯率，2026-10-08）§1
  var EOK = 100000000; // 1 億韓元

  // 全稅（전세）押金：最多 80% 用全稅貸款（HF 一般全稅保證，上限 4 億）［SECONDARY：wikidocs 2026-07］，
  // 其餘要用自己的存款。自己的錢放在押金裡沒有利息（引擎少算存款報酬，另外每年要補通膨），
  // 存款不夠時押金降低、差額改付月租（보증부 월세），用市場轉換率換算 §12.3.3
  var JEONSE_LOAN = 0.0435; // 銀行全稅貸款平均利率（2026-08）§4.5［NEWS］
  var JEONSE_LTV = 0.8, JEONSE_CAP = 4 * 100000000;
  var DEP_SHARE = 0.5;      // 最多拿出「存款＋已付押金」的一半放進押金，其餘留著應付生產、教育等支出［ESTIMATE］
  var BANK_RATE = 0.0466;   // 銀行新承作房貸平均利率（2026-08），假設之後不變 §4.5［NEWS］
  var MEDIAN4 = 6494738;    // 2026 年 4 人家庭「基準中位所得」（每月）§12.4［NEWS］
  // 托育憑證（보육료 지원단가，每月）：0 歲班、1 歲班、2 歲班 §6［SECONDARY］
  var VOUCHER = [584000, 515000, 426000];
  // 「6+6 父母育嬰假」：雙親都請時，前 6 個月薪資 100%，每月上限依序 §6、§12.5［SECONDARY］
  var CAP66 = [2500000, 2500000, 3000000, 3500000, 4000000, 4500000];

  var K = {
    id: 'KR', name: '韓國', cur: 'KRW', curName: '韓元', flag: '🇰🇷',
    fx: { toTWD: FX, pppToTWD: 0.0167, date: '2026-10-08' }, // PPP：世界銀行 2025 韓國 816.33；台灣約 13.65（沿用日本模組的推算）§1
    careEnd: 3, // 0–2 歲上托育中心（어린이집 영아반），3–5 歲讀幼兒園或托育中心（누리과정）
    sources: [
      ['國家數據處 2024 薪資工作所得（經 Newsis）', 'https://www.newsis.com/view/NISX20260223_0003523081'],
      ['經總分析 2026 上半年薪資與獎金（經 SBS Biz）', 'https://biz.sbs.co.kr/amp/article/20000335728'],
      ['PwC 韓國個人所得稅與社會保險（2026）', 'https://taxsummaries.pwc.com/republic-of-korea/individual/taxes-on-personal-income'],
      ['韓國不動產院 首爾公寓全稅與月租（2026-08，經 kbmaeil）', 'https://kbmaeil.com/article/20260927500015'],
      ['KB 首爾公寓均價（2026-08，經 Herald）', 'https://www.heraldk.com/article/2026082318212445104'],
      ['KB Think 新生兒特例貸款（2026-07）', 'https://kbthink.com/loan/find/newborn-special-loan.html'],
      ['10.15 房市對策：管制區、LTV 與貸款上限（MTN）', 'https://news.mtn.co.kr/news-detail/2025101507523614845'],
      ['育嬰假給付 2025 改制（Korea Times）', 'https://koreatimes.co.kr/www/nation/2024/12/281_387577.html'],
      ['兒童津貼擴大到未滿 9 歲（Newsis／保健福祉部）', 'https://www.newsis.com/view/NISX20260423_0003602912'],
      ['2025 私教育費調查（韓經／教育部）', 'https://www.hankyung.com/article/202603126272Y'],
      ['首爾產後調理經費與孕婦交通費（2026）', 'https://m.go.seoul.co.kr/news/2026/03/18/20260318500198'],
      ['月子中心費用（保健福祉部，經 twig24）', 'https://twig24.com/news/world/2025/12/08/20251208500064']
    ],

    // ---------- 薪資（全體受僱者工作，含獎金）§2.1、§12.2 ----------
    W: {
      // 2026-10 統一各國定義為「全職受僱者、年薪含獎金」：統計廳 2024 工作所得級距去掉每月 150 萬以下（低於全職最低工資的短工時工作），
      // 中位數約 343.5 萬／月；雇用勞動部 2025-06 事業體受僱者中位數 351.9 萬（含 1/12 前一年特別給與）可互相對照
      // × 12 × 2024→2026 約 1.061 ≈ 4,370 萬［DERIVED］（原本 3,650 萬含短工時工作，低端再手動往台灣形狀修）
      median: 43700000,
      // 十分位：同上去掉短工時後由級距推算；P95 以 800 萬、1,000 萬兩個級距配柏拉圖分布［DERIVED］
      q: [[10, 0.55], [20, 0.66], [25, 0.71], [50, 1], [75, 1.57], [90, 2.34], [95, 3.0]],
      paretoAlpha: 2.78,
      ageSpread: 0.85,
      // 年齡：各年齡層平均 ÷ 全體平均（20 代 271、30 代 397、40 代 469、50 代 445、60 代 293 萬）內插成 5 歲一點［ESTIMATE］；60 歲以後沿用原本形狀換算
      age: [[22, 0.62], [27, 0.79], [32, 0.96], [37, 1.10], [42, 1.19], [47, 1.24], [52, 1.21], [57, 1.11], [62, 0.71], [67, 0.54]],
      bonus: 1.5 // 獎金（特別給與）約占全年 11–12%（2026 上半年 13.9% 含年初獎金，中小企業 6.2%）§12.2［ESTIMATE］
    },
    // 實拿的檢查點：和 kr.md §5.2 的試算表同一組年薪
    CHECK_SALARIES: [25000000, 34560000, 45000000, 60000000, 80000000, 100000000, 150000000],

    // ---------- 城市 ----------
    CITY: {
      seoul: {
        id: 'seoul', name: '首爾', short: '首爾', capital: true,
        cons: 1.22, // 每人民間消費：首爾 ÷ 全國（地區所得統計，研究檔未收錄，依過去幾年的水準）［ESTIMATE］
                    // 對照：2024 每人個人所得 首爾 3,222 萬 ÷ 全國 2,782 萬 = 1.16、釜山 2,616 萬 = 0.94 §13.1［NEWS］
        conv: 0.047, // 押金轉月租的市場轉換率：首爾公寓 4.7%（2026-05）§4.4［NEWS］
        // 租屋：[押金, 月租（小坪數含管理費）, 專有面積 ㎡（另計公共管理費）]；押金怎麼付見 leasePlan()
        // 全稅與月租型在 4.1% 下成本幾乎相同（§4.4），所以公寓直接用全稅押金表示
        lease: [
          [10000000, 709000, 0],   // 套房：月租 62.5 萬＋管理費 8.4 萬，押金 1,000 萬（2026-07）§12.3.2［NEWS］
          [270000000, 70000, 0],   // 1.5–2 房（빌라、오피스텔）全稅約 2.7 億＋管理費［ESTIMATE］
          [490000000, 0, 59],      // 59㎡（2 房）：84㎡ × 0.76［ESTIMATE］
          [645000000, 0, 84],      // 84㎡（3 房）：首爾公寓全稅平均 6.37 億（REB 2026-08）視為約 84㎡［DERIVED］；
                                   //   對照 59–85㎡ 新簽月租 170.5 萬＋押金約 1.5 億 → 每月約 222 萬 §12.3.2
          [840000000, 0, 114]      // 114㎡（4 房）：84㎡ × 1.3［ESTIMATE］
        ],
        price: 18500000,    // 中古公寓每 ㎡（專有面積）：84㎡ 實價 13.27 億（2025 Q2）× KB 首爾均價漲幅 1.17［DERIVED］§4.1
        priceNew: 25600000, // 新建公寓（預售）：HUG 每 ㎡（供給面積）1,922.4 萬 × 1.33（供給÷專有）［DERIVED］§4.1
        mgmt: 1500,         // 公共管理費＋長期修繕準備金，每 ㎡ 每月（水電另計）［ESTIMATE］
        propTax: 0.0014,    // 財產稅＋都市地區分＋地方教育稅，約房價的 0.14%／年（公示價格約房價 69%）［ESTIMATE］
        ltvFirst: 0.70,     // 管制區（首爾全區）首購族 LTV 70%（一般無屋者 40%）§12.3.5［SECONDARY］；§4.5 寫「政策貸款」維持 70%，採較新的 §12.3.5
        stress: 0.015,      // 壓力 DSR 加碼：首都圈下限 3%，5 年固定或週期型只算一部分［ESTIMATE］
        park: 30000,        // 公寓車位多含在管理費；部分社區或第二台車要付費［ESTIMATE］
        tpass: 62000,       // 氣候同行卡（地鐵＋公車）每月 §12.7［SECONDARY］
        postpartum: { frugal: 4100000, normal: 5150000, comfy: 8500000 }, // 月子中心 2 週：一般房 490 萬、特別房 810 萬（2025）× 1.05；精省 ×0.8 §12.5［NEWS＋ESTIMATE］
        birthLocal: [1700000, 2000000, 2500000], // 首爾產後調理經費 100／120／150 萬＋孕婦交通費 70／80／100 萬（2026 起）§12.5［NEWS］
        childAllowance: 100000, // 兒童津貼：首都圈每月 10 萬 §6［NEWS］
        sitter: 2000000,    // 全職保母（不進托育中心）：時薪約 1.2–1.3 萬 × 160 小時［ESTIMATE］
        grandSub: 300000,   // 首爾型育兒照顧費：長輩每月照顧 40 小時以上（研究檔寫「最多 60 萬」；一個孩子以 30 萬估，24–35 個月）§6［NEWS＋ESTIMATE］
        cramMult: 1.40      // 首爾補習費 ÷ 全國：全體學生 66.3／45.8 = 1.45，有補習者 80.3／60.4 = 1.33，取 1.4 §7.1［DERIVED］
      },
      busan: {
        id: 'busan', name: '釜山', short: '釜山', capital: false,
        cons: 0.97, // 每人民間消費：釜山略低於全國［ESTIMATE］
        conv: 0.053, // 押金轉月租的轉換率：全國公寓 5.3%（釜山未查到，用全國）§4.4［NEWS］
        lease: [
          [5000000, 460000, 0],    // 套房［ESTIMATE］
          [150000000, 50000, 0],   // 1.5–2 房（빌라、오피스텔）［ESTIMATE］
          [223000000, 0, 59],      // 59㎡：84㎡ × 0.78［ESTIMATE］
          [286000000, 0, 84],      // 84㎡：售價 4.22 億 × 全稅比 67.7% §12.3.1［DERIVED］
          [386000000, 0, 114]      // 114㎡：84㎡ × 1.35［ESTIMATE］
        ],
        price: 5030000,     // 中古公寓每 ㎡：84㎡ 均價 4.2232 億（2025-05，2026 年大致持平）§12.3.1［NEWS＋ESTIMATE］
        priceNew: 9200000,  // 新建公寓：HUG 每 3.3㎡（供給面積）2,211.6 萬（2025-02）→ 每 ㎡ 669 萬 × 1.33 × 1.03［DERIVED］§12.3.1
        mgmt: 1200, propTax: 0.0008, // ［ESTIMATE］
        ltvFirst: 0.80,     // 非管制區首購族 LTV 80%（一般 70%）§12.3.1、§12.3.5［SECONDARY＋ESTIMATE］
        stress: 0.0075,     // 非首都圈壓力 DSR 加碼較低［ESTIMATE］
        park: 15000,        // ［ESTIMATE］
        tpass: 55000,       // 釜山交通卡（超過一定金額退費）：研究檔未查到月票價格［ESTIMATE］
        postpartum: { frugal: 2800000, normal: 3530000, comfy: 5150000 }, // 一般房 336 萬（2025）× 1.05；特別房依全國比例 543／372［DERIVED＋ESTIMATE］
        birthLocal: [1000000, 1000000, 1000000], // 釜山型產後調理經費每名 100 萬（不設所得門檻；2026 年續辦未確認；各區祝賀金未計）§12.5［NEWS］
        childAllowance: 105000, // 非首都圈每月 10.5 萬 §6［NEWS］
        sitter: 1600000,    // ［ESTIMATE］
        grandSub: 0,
        cramMult: 0.90      // 釜山補習費：未查到；全國平均含首爾，非首都圈大城市略低［ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷。各國用同一個規則：「每人消費支出（不含住房與水電）× 0.716」，
      // 0.716 是台灣 14,000 元 ÷（每人消費 25,726 × 0.76）。韓國：家計動向調查每戶消費
      // （2025 Q4 300.8 萬、2026 Q1 310.5 萬、Q2 293.2 萬，平均 301.5 萬）§3.2、§12.7［NEWS］
      // −「住居・水道・光熱」約 39 萬（研究檔未列；由 Q1 各項合計反推並換成全年平均）［ESTIMATE］
      // ÷ 每戶 2.25 人［ESTIMATE］= 116.7 萬 × 0.716 ≈ 835,000（已是 2026 年水準）［DERIVED］
      adultBase: 835000, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 韓國的大人開銷［ESTIMATE］
      child: [[0, 417500], [2, 359000], [6, 451000], [12, 593000], [18, 660000]],
      utilBase: 80000, utilPerPerson: 45000, // 電、瓦斯暖氣、水：每戶約 19 萬（2.25 人）［ESTIMATE］
      prenatal: { frugal: 500000, normal: 1200000, comfy: 3000000 }, // 產檢券 100 萬以外的自付（自然產與剖腹產健保已全額給付）［ESTIMATE］
      gearFirst: { frugal: 1500000, normal: 3000000, comfy: 6000000 }, gearLater: 1000000, // 嬰兒用品［ESTIMATE］
      postpartumNanny: 1500000, // 產後到府幫手（政府憑證補助後的自付，約 2–3 週）［ESTIMATE］
      postpartumFamily: 500000, // 家人照顧的伙食與用品［ESTIMATE］
      grandPaid: 0, helper: 0,   // grandPaid 依兩地薪資換算（prep）；外籍幫傭只有首爾試辦，改用全職保母
      dcExtra: 70000, dcExtraPublic: 40000, // 托育中心家長自付的必要經費（活動、校外教學等），每月 §12.6［ESTIMATE］
      kgFee3: 110000,      // 3 歲讀私立幼兒園家長自付（2025）§12.6［NEWS］；預定 2027 年起免費
      kgFee3Public: 30000, // 公立幼兒園 3 歲（課後班等）［ESTIMATE］
      kgFree: 50000, kgFreePublic: 20000, // 4–5 歲免費後仍自付的特別活動費［ESTIMATE］
      kgEarlyEdu: 350000,  // 幼兒私教育：有參加者每月 33.2 萬（2024）× 1.05 §6［NEWS］
      kgEnglish: 1600000,  // 英語幼兒園（法律上是補習班）每月 154.5 萬（2024）× 1.035［DERIVED］§6
      kgSupport: 280000, kgFreeSupport: 110000, // 누리과정 每月 28 萬；4–5 歲免費後另補約 11 萬（只統計）§6、§12.6
      homeCare: 100000,    // 家庭養育津貼：24–86 個月、沒上托育中心或幼兒園者 §6［SECONDARY］
      esPublic: 300000, jhPublic: 400000, shPublic: 500000, // 公立：學費、午餐、高中學費都免費；校外教學、課後班、制服差額等［ESTIMATE］
      esPrivate: 11000000, jhPrivate: 6000000, shPrivate: 9000000, // 私立小學、國際中學、自私高或外語高（研究檔未查到）［ESTIMATE］
      intlSchool: 30000000, // 非認證國際學校（韓國籍學生讀外國人學校有限制）［ESTIMATE］
      // 國小課後（安親）：雙薪家庭多用補習班當課後照顧，以國小「全體學生」私教育費每月 43.3 萬 × 1.02 × 城市係數 §7.1［NEWS＋DERIVED］
      esAfter: 442000,
      hobbyClass: 150000,  // 每項才藝每月（跆拳道、鋼琴、游泳等）［ESTIMATE］
      // 補習每月（2025）：補 1–2 科＝全體學生平均（國中 46.1、高中 49.9 萬）；全科＝有補習者平均（63.2、79.3 萬）§7.1［NEWS］
      // × 1.02（2025 年有補習者的支出成長）× 城市係數
      cram: { jh: { none: 0, some: 470000, full: 645000 }, sh: { none: 0, some: 509000, full: 809000 } },
      uniFee: { public: 4250000, private: 8232000 }, // 2026 年四年制大學平均學費 §7.2［NEWS］
      uniAwayRent: 550000, // 宿舍與首爾大學附近套房（70.9 萬）的混合［ESTIMATE］
      master: 6000000,     // 研究所學費（國立約 500 萬、私立約 1,000 萬）［ESTIMATE］
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: { // 研究檔未查到汽車持有成本 §12.9［ESTIMATE］；購車價含 7% 取得稅
        used: { buy: 15000000, resale: 0.2, life: 8, run: 3500000 },  // 中古中型車；每年保險、油錢（1.2 萬公里）、汽車稅、保養
        new: { buy: 33000000, resale: 0.3, life: 10, run: 3800000 },   // 國產中型車或休旅車
        import: { buy: 65000000, resale: 0.35, life: 10, run: 5200000 } // 進口休旅車
      },
      scooter: { buy: 2500000, resale: 0.1, life: 8, run: 500000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 15000000, // 65 歲後每人每年（國民年金約 30 年加上退休金）［ESTIMATE］
      houseSize: { 1: 40, 2: 59, 3: 84, 4: 114 }, // 專有面積：2 房 59㎡、3 房 84㎡（「國民坪型」）、4 房 114㎡ §4.2［ESTIMATE］
      reno: { basic: 100000, light: 300000, full: 750000 }, // 每 ㎡：搬家與小修／壁紙地板等局部／全面翻修［ESTIMATE］
      closing: { used: 0.03, new: 0.04 }, // 後備值；實際由 closingCost() 依房價級距計算
      homeInsurance: 100000,
      rentFactor: 1 // 租金與押金是成交或官方統計，不再打折
    },

    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    leaveMonths: 6,

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    // 台灣選項 → 韓國最接近的做法
    localize: function (ls) {
      if (ls.loan !== 'bank') ls.loan = 'bank';             // 沒有新青安；符合條件時自動改用新生兒特例貸款
      if (ls.transport === 'scooter') ls.transport = 'transit'; // 帶小孩騎機車在韓國不常見
      if (ls.care === 'helper') ls.care = 'private';        // 外籍幫傭只有首爾小規模試辦，改用全職保母估算
      ls.parking = 'rent';                                   // 公寓車位不另外買賣，管理費內含或月付
    },
    MAP: {
      housing: { rent: '租公寓（全稅押金 8 成用全稅貸款、最多 4 億，其餘用自己的存款；存款不夠就降低押金、改付月租）', buy: '買公寓，銀行房貸（有新生兒時可用特例貸款）', family: '和長輩同住' },
      build: { used: '中古公寓', new: '新建公寓（預售，需抽籤）' },
      loan: { qingan: '沒有新青安，改用一般房貸；有新生兒、房價 9 億以下時改用特例貸款', qinganNoGrace: '沒有新青安，改用一般房貸；有新生兒、房價 9 億以下時改用特例貸款', bank: '一般房貸（首爾有貸款上限，DSR 40%）' },
      postpartum: { center: '產後調理院（月子中心）2 週', nanny: '產後到府幫手（政府憑證）', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 6 個月（薪資 100%，每月上限 250 萬、第 4 個月起 200 萬）', B: '伴侶請 6 個月（薪資 100%，每月上限 250 萬、第 4 個月起 200 萬）', both: '兩人各請 6 個月（「6+6」：上限 250 萬逐月升到 450 萬）' },
      care: { quasi: '民間或家庭托育中心（政府憑證，幾乎免費）', public: '國公立托育中心（憑證，名額少）', private: '全職保母（不進托育中心）', grandPaid: '請長輩帶（付費；首爾有照顧費補助）', grandFree: '請長輩帶', helper: '外籍幫傭只有首爾試辦，改用全職保母估算', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（4–5 歲免費）', quasi: '私立幼兒園或托育中心（4–5 歲免費）', private: '私立幼兒園＋才藝或補習', bilingual: '英語幼兒園（補習班，沒有補助）', home: '在家照顧（領家庭養育津貼）' },
      school: { public: '公立小學到高中（學費、午餐全免）', privateJH: '國中起讀國際中學、自私高或外語高', private: '私立小學到高中', intl: '非認證國際學校' },
      after: { none: '不上課後班', anqin: '補習班當課後照顧（國小私教育平均）', anqin1: '補習班＋1 項才藝', anqin3: '補習班＋3 項才藝' },
      cram: { none: '不補習', some: '一般補習（全體學生平均）', full: '密集補習（有補習者平均）' },
      uni: { public: '國公立大學（國家獎學金依家庭所得減免）', private: '私立大學（國家獎學金依家庭所得減免）', mixed: '國公立或私立各半' },
      support: { '24': '國內研究所 2 年' },
      transport: { transit: '地鐵與公車（首爾氣候同行卡）', scooter: '機車在韓國不常見，改用大眾運輸', used: '中古車', new: '國產新車', import: '進口休旅車' }
    },

    // ---------- 生產 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.postpartum[ls] : s.postpartum === 'nanny' ? C.postpartumNanny : C.postpartumFamily;
      var cost = C.prenatal[ls] + (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp;
      // 첫만남이용권（出生憑證）：第 1 胎 200 萬，第 2 胎起 300 萬 §6［NEWS］
      return { cost: cost, grant: k === 0 ? 2000000 : 3000000, local: c.birthLocal[Math.min(k, 2)] };
    },
    // 兒童津貼（아동수당）：2026 年發到未滿 9 歲，之後每年延長 1 歲，2030 年到未滿 13 歲 §6［NEWS］
    allowance: function (x, k, a) {
      var year = D.BASE_YEAR + x.t;
      var lim = Math.min(13, 9 + Math.max(0, year - 2026));
      return a < lim ? x.c.childAllowance * 12 : 0;
    },
    // 0–2 歲：父母給付（부모급여）0 歲每月 100 萬、1 歲 50 萬；上托育中心時先扣托育憑證，只領差額 §6、§12.5
    care: function (x, cs, k, a, careMonths, homeMonths) {
      var C = x.C, c = x.c;
      var pb = a === 0 ? 1000000 : a === 1 ? 500000 : 0;
      var home = a >= 2 ? C.homeCare : pb; // 2 歲起在家照顧改領家庭養育津貼
      var cash = home * (homeMonths || 0);
      if (careMonths <= 0) return { cash: cash };
      if (cs === 'public' || cs === 'quasi') {
        var v = VOUCHER[Math.min(a, 2)];
        return { fee: (cs === 'public' ? C.dcExtraPublic : C.dcExtra) * careMonths, sub: v * careMonths, cash: cash + Math.max(0, pb - v) * careMonths };
      }
      cash += home * careMonths; // 不上托育中心：領全額父母給付或家庭養育津貼
      if (cs === 'private') return { fee: c.sitter * careMonths, cash: cash };
      if (cs === 'grandPaid') {
        // 首爾型育兒照顧費：家庭所得在基準中位所得 150% 以下
        if (c.grandSub && a === 2 && fullGross(x) <= 1.5 * MEDIAN4 * 12) cash += c.grandSub * careMonths;
        return { fee: C.grandPaid * careMonths, cash: cash };
      }
      return { cash: cash }; // grandFree
    },
    // 3–5 歲：4–5 歲 2026 年起免費（含必要經費），3 歲預定 2027 年起 §6、§12.6［NEWS］
    preschool: function (x, ps, k, a) {
      var C = x.C, year = D.BASE_YEAR + x.t;
      if (ps === 'home') return { cash: C.homeCare * 12 };
      if (ps === 'bilingual') { addEdu(x, Math.min(C.kgEnglish * 12, 3000000)); return { fee: C.kgEnglish * 12, cash: C.homeCare * 12 }; } // 補習班不算幼兒園，仍可領家庭養育津貼
      var free = a >= 4 || year >= 2027;
      var fee = ps === 'public' ? (free ? C.kgFreePublic : C.kgFee3Public) : (free ? C.kgFree : C.kgFee3);
      if (ps === 'private') fee += C.kgEarlyEdu;
      addEdu(x, Math.min(fee * 12, 3000000));
      return { fee: fee * 12, kg: (C.kgSupport + (free ? C.kgFreeSupport : 0)) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, C = x.C, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee, extra;
      if (level === 'es') {
        fee = intl ? C.intlSchool : s.school === 'private' ? C.esPrivate : C.esPublic;
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = (/^anqin/.test(s.after) && !(s.school === 'private' || intl)) ? C.esAfter * c.cramMult * 12 : 0;
        // 國小私教育費的平均已含約 1 項藝體才藝，所以「＋1 項」不再另加、「＋3 項」只加 2 項
        extra = after + Math.max(0, hobbies - (after ? 1 : 0)) * C.hobbyClass * 12;
      } else {
        fee = intl ? C.intlSchool : level === 'jh' ? (priv ? C.jhPrivate : C.jhPublic) : (priv ? C.shPrivate : C.shPublic);
        extra = (C.cram[level][s.cram] || 0) * c.cramMult * 12;
      }
      if (!intl) addEdu(x, Math.min(fee, 3000000)); // 補習費不能抵稅
      return fee + extra;
    },
    // 大學：國家獎學金依「學資支援級距」（家庭所得 ÷ 基準中位所得）減免學費
    // 1–3 級 570 萬、4–6 級 420 萬、7–8 級 350 萬、9 級 100 萬（研究檔未收錄，依 2025 年公告；未計資產換算，可能高估）［ESTIMATE］
    uni: function (x, k, a) {
      var s = x.s, C = x.C;
      var fee = s.uni === 'mixed' ? (C.uniFee.public + C.uniFee.private) / 2 : C.uniFee[s.uni] || C.uniFee.public;
      var r = fullGross(x) / (MEDIAN4 * 12);
      var sch = r <= 0.7 ? 5700000 : r <= 1.3 ? 4200000 : r <= 2 ? 3500000 : r <= 3 ? 1000000 : 0;
      var sub = Math.min(fee, sch);
      addEdu(x, Math.min(fee - sub, 9000000));
      return { fee: fee - sub, sub: sub };
    },

    // ---------- 住房 ----------
    // 每月租屋成本＝全稅貸款利息＋自有押金每年要補的通膨＋押金不足改付的月租＋原本的月租與管理費
    rentFor: function (c, rooms, rentMult, x) {
      var L = c.lease, r = Math.min(Math.max(rooms, 1), 4);
      var row = r <= 1 ? [(L[0][0] + L[1][0]) / 2, (L[0][1] + L[1][1]) / 2, 0] : L[r];
      var m = rentMult * K.COST.rentFactor;
      var p = leasePlan(row[0] * m, c, x);
      if (x) { x.krDep = p.dep; x.krLoan = p.loan; x.y.krOwn = p.own; }
      return p.yearly / 12 + (row[1] + row[2] * c.mgmt) * m;
    },
    rentDeposit: function (c, rooms, rentMult, x) { return x.y.krOwn || 0; },
    // 新生兒特例全稅貸款（신생아 특례 버팀목）§12.3.5［SECONDARY］：出生後 4 年（每多生一胎 +4 年，最長 12 年）
    // 押金首都圈 5 億、其他 4 億以下；貸款 ≤ 押金 80% 且 ≤ 2.4 億；夫妻所得 1.3 億（雙薪 2 億）以下。
    // 省下的是全稅貸款利率（4.35%）與特例利率的差。資產上限（3.45 億）沒有計算
    rentSubsidy: function (x) {
      var c = x.c, t = x.t, B = x.births;
      if (!B || !B.length || t < B[0]) return;
      var end = B[0] + 4;
      for (var i = 1; i < B.length; i++) if (B[i] < end) end = Math.min(B[0] + 12, end + 4);
      if (t >= end) return;
      var gA = x.gA / Math.max(x.workFracA, 0.05), gB = x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : 0;
      var inc = gA + gB, dual = gA > 0 && gB > 0;
      if (inc > (dual ? 2 * EOK : 1.3 * EOK)) return;
      var dep = x.krDep || 0;
      if (!(dep > 0) || dep > (c.capital ? 5 : 4) * EOK) return;
      var loan = Math.min(2.4 * EOK, 0.8 * dep, x.krLoan || 0);
      var born = 0; for (var j = 0; j < B.length; j++) if (B[j] <= t) born++;
      var r = nbRate(inc, 0.013, 0.043) - (c.capital ? 0 : 0.002) - Math.min(0.004, 0.002 * (born - 1));
      x.tr.rent = loan * Math.max(0, JEONSE_LOAN - Math.max(0.01, r));
    },
    // 買房：用共用流程，再依房價級距算取得稅與仲介費
    housePlan: function (x) {
      var h = WD.stdHousePlan(x);
      h.closing = closingCost(h.total, h.size, x.s.build);
      return h;
    },
    // 房貸 §4.5、§12.3.5：
    // 一般房貸：首購族 LTV（首爾 70%、釜山 80%）；首都圈另有絕對上限（15 億以下 6 億、15–25 億 4 億、25 億以上 2 億）；
    //   DSR 40%（以夫妻合計所得、30 年、利率加壓力加碼試算）。利率 4.66%。
    // 新生兒特例貸款（디딤돌）：房價 9 億、85㎡ 以下，出生後 2 年內（買房後才生也可轉貸）；夫妻所得 1.3 億（雙薪 2 億）以下；
    //   最多 4 億、LTV 同上；政策貸款不算 DSR，改用 DTI 60%［ESTIMATE］。資產上限（5.11 億）沒有計算。
    //   特例利率 1.8–4.5%（依所得，這裡用線性內插［ESTIMATE］；非首都圈 −0.2%p；每多一胎 −0.2%p，下限 1.2%），
    //   5 年、每多一胎 +5 年（最長 15 年），之後改用一般 디딤돌 利率約 3.6%［ESTIMATE］
    loanPlan: function (x, total) {
      var s = x.s, c = x.c, tb = x.tb, size = x.C.houseSize[x.roomsFinal];
      var gA = incomeAt(x, 'A', tb), gB = incomeAt(x, 'B', tb), inc = gA + gB;
      var years = 30;
      var cap = c.capital ? (total <= 15 * EOK ? 6 * EOK : total <= 25 * EOK ? 4 * EOK : 2 * EOK) : Infinity;
      var dsrMax = 0.40 * inc / annuityF(BANK_RATE + c.stress, years);
      var bankAmt = Math.max(0, Math.min(total * c.ltvFirst, cap, dsrMax));
      var parts = [], note = '';
      // 新生兒特例：觸發的出生年（買房前 2 年內，或買房後出生時轉貸）
      var B = x.births || [], bi = -1;
      for (var i = 0; i < B.length; i++) if (B[i] >= tb - 2) { bi = i; break; }
      var nb = null;
      if (bi >= 0 && total <= 9 * EOK && size <= 85) {
        var bt = B[bi], incB = incomeAt(x, 'A', bt) + incomeAt(x, 'B', bt);
        var dual = incomeAt(x, 'A', bt) > 0 && incomeAt(x, 'B', bt) > 0;
        if (incB <= (dual ? 2 : 1.3) * EOK) {
          var P = 5, extra = 0;
          for (var j = bi + 1; j < B.length; j++) if (B[j] < bt + P && P < 15) { P += 5; extra++; }
          var r = Math.max(0.012, nbRate(incB, 0.018, 0.045) - (c.capital ? 0 : 0.002) - Math.min(0.004, 0.002 * extra));
          var dti = 0.60 * incB / annuityF(r, years);
          nb = { amt: Math.max(0, Math.min(4 * EOK, total * c.ltvFirst, dti)), r: r, ly0: Math.max(0, bt - tb), P: P };
        }
      }
      if (nb && nb.amt > 0) {
        var loanTot = nb.ly0 > 0 ? bankAmt : Math.max(bankAmt, nb.amt);
        var nbAmt = Math.min(loanTot, nb.amt);
        var rates = [];
        for (var ly = 0; ly < years; ly++) rates.push(ly < nb.ly0 ? BANK_RATE : ly < nb.ly0 + nb.P ? nb.r : 0.036);
        parts.push({ amt: nbAmt, rates: rates, years: years, grace: 0, label: '新生兒特例貸款（디딤돌）' });
        if (loanTot - nbAmt > 1) parts.push({ amt: loanTot - nbAmt, rate: BANK_RATE, years: years, grace: 0, label: '一般房貸' });
        note = (nb.ly0 > 0 ? '孩子出生後轉貸' : '') + '新生兒特例貸款 ' + (nb.r * 100).toFixed(1) + '%，' + nb.P + ' 年';
      } else {
        parts.push({ amt: bankAmt, rate: BANK_RATE, years: years, grace: 0, label: '一般房貸' });
        if (bankAmt < total * c.ltvFirst - 1) note = bankAmt >= cap - 1 ? '首都圈貸款上限 ' + (cap / EOK) + ' 億' : '受 DSR 40% 限制';
      }
      return { parts: parts, note: note };
    },

    // ---------- 育嬰給付（雇用保險，免稅）§6、§12.5 ----------
    // 一般：第 1–3 個月薪資 100%（上限 250 萬，單親 300 萬）、第 4–6 個月 100%（上限 200 萬），下限 70 萬。
    // 兩人都請（6+6）：前 6 個月 100%，上限 250／250／300／350／400／450 萬。
    // 另一來源（Daum 2026-03）寫第 1 個月 200 萬，是 2024 年的舊數字（低於 2025 年一般上限 250 萬，不合理），採 250 萬
    leavePay: function (g, ind, months, nb, x) {
      var w = g / (12 + (ind.bonus || 1.5)); // 通常工資（不含獎金）
      var both = x.lmA > 0 && x.lmB > 0, single = !x.s.partner;
      var pay = 0;
      for (var m = 1; m <= months; m++) {
        var cap = both && m <= 6 ? CAP66[m - 1] : m <= 3 ? (single ? 3000000 : 2500000) : m <= 6 ? 2000000 : 1600000;
        var rate = m <= 6 ? 1 : 0.8;
        pay += Math.max(700000, Math.min(w * rate, cap));
      }
      return pay * nb;
    },

    // ---------- 稅與社會保險（個人分開課稅）§5、§12.4 ----------
    taxes: function (x) {
      var s = x.s, t = x.t, year = D.BASE_YEAR + t;
      // 國民年金：2026 年員工 4.75%、2027 年 5%（研究檔確認）；之後依 2025 年改革每年 +0.25%p，到 2033 年 6.5%［ESTIMATE］
      var penRate = Math.min(0.065, 0.0475 + 0.0025 * Math.max(0, year - 2026));
      var people = [{ g: x.gA, wf: x.workFracA }, { g: s.partner ? x.gB : 0, wf: x.workFracB }];
      var main = people[0].g >= people[1].g ? 0 : 1; // 子女的扣除與抵減由收入較高的一方申報
      var ages = x.atHome || [], dep = 0, k8 = 0;
      ages.forEach(function (a) { if (a <= 20) { dep++; if (a >= 8) k8++; } });
      var childCr = k8 === 0 ? 0 : k8 === 1 ? 250000 : 550000 + 400000 * (k8 - 2); // 子女稅額抵減（8 歲以上）
      var birthCr = 0; // 出生、領養稅額抵減：第 1／2／3 胎起 30／50／70 萬
      (x.kAges || []).forEach(function (a, k) { if (a === 0) birthCr += [300000, 500000, 700000][Math.min(k, 2)]; });
      var eduBase = x.y.edu || 0;
      // 房貸利息扣除：房屋公示價格 6 億以下（約房價 8.7 億），每年最多 1,800 萬［ESTIMATE，研究檔未收錄］
      var mortDed = x.ly >= 0 && x.house && x.house.price * 0.69 <= 6 * EOK ? Math.min(x.mortInt || 0, 18000000) : 0;
      var si = 0, tax = 0;
      people.forEach(function (p, i) {
        if (p.g <= 0) return;
        // 社會保險：用全職的月薪計算再乘工作比例；年金投保月薪 41–659 萬（2026-07 起）
        var base = p.g / Math.max(p.wf, 0.05);
        var pen = penRate * U.clamp(base / 12, 410000, 6590000) * 12;
        var other = (0.03595 + 0.004724 + 0.009) * base; // 健保 3.595%、長照 0.4724%、就業保險 0.9%
        var pSI = (pen + other) * p.wf;
        si += pSI;
        var earned = p.g - empDeduction(p.g);
        var nDed = 1 + (s.partner && people[1 - i].g <= 5000000 ? 1 : 0) + (i === main ? dep : 0); // 基本扣除每人 150 萬
        var taxable = earned - 1500000 * nDed - pSI - (i === main ? mortDed : 0);
        var calc = taxable > 0 ? U.bracketTax(taxable, BRACKETS) : 0;
        var credit = earnedCredit(calc, p.g);
        // 標準稅額抵減 13 萬；收入較高的一方若教育費抵減（15%）較多就改用教育費
        credit += i === main ? Math.max(130000, 0.15 * eduBase) + childCr + birthCr : 130000;
        tax += Math.max(0, calc - credit) * 1.1; // 加 10% 地方所得稅
      });
      return { si: si, tax: tax };
    }
  };

  // 所得稅級距（[上限, 稅率, 累進差額]）§5.2［SECONDARY］
  var BRACKETS = [[14000000, 0.06, 0], [50000000, 0.15, 1260000], [88000000, 0.24, 5760000], [150000000, 0.35, 15440000],
    [300000000, 0.38, 19940000], [500000000, 0.40, 25940000], [1000000000, 0.42, 35940000], [Infinity, 0.45, 65940000]];
  // 薪資所得扣除（근로소득공제，上限 2,000 萬）§5.2
  function empDeduction(g) {
    var d = g <= 5000000 ? g * 0.7 : g <= 15000000 ? 3500000 + (g - 5000000) * 0.4 : g <= 45000000 ? 7500000 + (g - 15000000) * 0.15
      : g <= 100000000 ? 12000000 + (g - 45000000) * 0.05 : 14750000 + (g - 100000000) * 0.02;
    return Math.min(d, 20000000);
  }
  // 薪資所得稅額抵減（근로소득세액공제）：稅額 130 萬以下 55%，以上 71.5 萬＋30%；上限依薪資遞減 §5.2
  function earnedCredit(calc, g) {
    var c = calc <= 1300000 ? calc * 0.55 : 715000 + (calc - 1300000) * 0.3;
    var lim = g <= 33000000 ? 740000 : g <= 70000000 ? Math.max(660000, 740000 - (g - 33000000) * 0.008)
      : g <= 120000000 ? Math.max(500000, 660000 - (g - 70000000) * 0.5) : Math.max(200000, 500000 - (g - 120000000) * 0.5);
    return Math.min(c, lim);
  }
  // 買房的一次性費用（首購、一戶）：取得稅 1%（6 億以下）到 3%（9 億以上），中間線性；地方教育稅為其 10%；
  // 85㎡ 以上另加農特稅 0.2%；中古屋仲介費 0.4–0.7%＋加值稅；登記、代書、國民住宅債券等約 0.4%；
  // 新建公寓另加陽台擴建與選配約 1.5%［ESTIMATE］
  function closingCost(price, size, build) {
    var e = price / EOK;
    var acq = price <= 6 * EOK ? 0.01 : price <= 9 * EOK ? (e * 2 / 3 - 3) / 100 : 0.03;
    var r = acq * 1.1 + (size > 85 ? 0.002 : 0) + 0.004;
    if (build === 'new') r += 0.015;
    else r += (price < 2 * EOK ? 0.005 : price < 9 * EOK ? 0.004 : price < 12 * EOK ? 0.005 : price < 15 * EOK ? 0.006 : 0.007) * 1.1;
    return price * r;
  }
  function annuityF(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  // 全稅押金 D 的付法：貸款 ≤ 80% 且 ≤ 4 億，其餘自己出（最多拿出存款與已付押金合計的一半）。
  // 自己拿不出那麼多時，押金降到 D'（D' − 貸款 = 自有資金），D − D' 改付月租（轉換率 conv）。
  // 每年成本：貸款 × 4.35% ＋ 自有 × 通膨（押金不生利息，每年要補）＋（D − D'）× conv
  function leasePlan(D, c, x) {
    var need = D - Math.min(JEONSE_LTV * D, JEONSE_CAP);
    var avail = x ? DEP_SHARE * Math.max(0, x.S + (x.depHeld || 0)) : Infinity;
    var own = Math.min(need, avail), dep = D;
    if (own < need) dep = own <= (1 - JEONSE_LTV) * JEONSE_CAP / JEONSE_LTV ? own / (1 - JEONSE_LTV) : own + JEONSE_CAP;
    var loan = dep - own, infl = x && x.A ? x.A.inflation : 0.02;
    return { dep: dep, own: own, loan: loan, yearly: loan * JEONSE_LOAN + own * infl + (D - dep) * c.conv };
  }
  // 新生兒特例貸款利率：依夫妻所得在 2,000 萬到 2 億之間線性內插［ESTIMATE］
  function nbRate(inc, lo, hi) { return lo + (hi - lo) * U.clamp((inc - 20000000) / 180000000, 0, 1); }
  // 這一年夫妻的全職年薪（育嬰留停那年還原成全年）
  function fullGross(x) {
    return x.gA / Math.max(x.workFracA, 0.05) + (x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : 0);
  }
  // 買房時（第 t 年）某一方的年薪：考慮離職照顧（回職場後薪資從離開時的水準重新累積）
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
  // 教育費稅額抵減的基數：孩子的掛鉤每年累加到 x.y（引擎每年重設），報稅時讀取
  function addEdu(x, v) { x.y.edu = (x.y.edu || 0) + v; }
  K.empDeduction = empDeduction; K.earnedCredit = earnedCredit; K.closingCost = closingCost;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
