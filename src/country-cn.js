/* =========================================================================
   中國大陸模組（上海、成都）。金額為人民幣、2026 年水準（實質）。
   來源與可信度見 research/countries/cn.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   戶籍：假設一家人有本地戶籍，或持居住證且積分達標（上海 120 分），
   可以讀公辦幼兒園與學校、在當地中考高考、買第一套房 §11。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 4.758; // 1 人民幣 = 4.758 台幣（台銀即期買賣中價，2026-10-08）§1

  var K = {
    id: 'CN', name: '中國大陸', cur: 'CNY', curName: '人民幣', flag: '🇨🇳',
    unit: 10000, unitName: '萬人民幣',
    fx: { toTWD: FX, pppToTWD: 4.02, date: '2026-10-08' }, // PPP：IMF 2025 中國 3.399、台灣約 13.65（推算）§1
    careEnd: 3, // 0–2 歲托育，3–5 歲幼兒園（小班、中班、大班）
    sources: [
      ['國家統計局 2025 年城鎮單位就業人員平均工資', 'https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202605/t20260515_1963707.html'],
      ['國家統計局 2025 年居民收入和消費支出', 'https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202601/t20260119_1962321.html'],
      ['上海市統計局 2025 年居民人均可支配收入及消費支出', 'https://www.shanghai.gov.cn/nw48810/20260203/2bed33e23b324e27ae846d3a88bade53.html'],
      ['2025 年成都市統計公報（新浪轉載）', 'https://finance.sina.com.cn/jjxw/2026-04-15/doc-inhupeis3814625.shtml'],
      ['成都住建局 2026 年第 2 季各街道租賃住房平均租金（騰訊轉載）', 'https://news.qq.com/rain/a/20260716A04I7Y00'],
      ['上海 2026 社保與公積金基數（Kaizen CPA 整理）', 'https://www.kaizencpa.com/download/china/2026%20Shanghai%20New%20Social%20Security%20&%20HPF%20Base%20Rules(CHS).pdf'],
      ['四川 2026 社保基數（澎湃）', 'https://m.thepaper.cn/newsDetail_forward_34052402'],
      ['個人所得稅稅率表與專項附加扣除（本地寶）', 'https://m.bendibao.com/bsy644838.html'],
      ['上海公積金貸款上限 240 萬（華爾街見聞）', 'https://wallstreetcn.com/articles/3766127'],
      ['成都公積金貸款上限與首付（川觀）', 'https://cbgc.scol.com.cn/news/7885335'],
      ['房貸利率與 LPR（每經）', 'https://www.mrjjxw.com/articles/2026-09-20/4586489.html'],
      ['育兒補貼每孩每年 3,600 元（廣州市政府）', 'https://www.gz.gov.cn/zt/shb/content/post_10391734.html'],
      ['上海生育醫療費用「無自付」（新華社）', 'https://www.news.cn/politics/20260908/cbb7adfb18bc41db878e87f1b75a043d/c.html'],
      ['四川生育假 188 天（川觀）', 'https://cbgc.scol.com.cn/news/7052819'],
      ['育媧人口 2026 生育成本報告（界面）', 'https://www.jiemian.com/article/14508365.html']
    ],
    notes: [
      '假設一家人有本地戶籍，或持居住證且積分達標（上海 120 分）：可讀公辦學校、在當地中考高考、買第一套房。',
      '官方不公布薪資中位數，薪資分布為估計：全國城鎮受僱者中位數約 7.7 萬（2026）。上海受僱者薪資約為全國的 1.5 倍、成都約 1.07 倍，但 PR 一律以全國分布計算。',
      '住房公積金：自己繳的 7% 存進自己的帳戶，雇主再提撥 7%；用來付房租、房貸與頭期款時，視為可用的錢。'
    ],

    // ---------- 薪資（全國城鎮受僱者，全年總薪資含年終）§2 ----------
    W: {
      // 官方只公布平均工資，沒有中位數或十分位 §2.1、§12.1。
      // 研究建議 2025 全國城鎮受僱者中位數約 7.5 萬（介於私營平均 71,590 與規上企業平均 106,080 之間）§2.4［ESTIMATE］
      // × 2025→2026 約 1.03 §2.5［ESTIMATE］≈ 77,000
      median: 77000,
      // 形狀：全國人均可支配收入五等分（÷中位數 0.28／0.63／0.98／1.53／2.86，換成百分位約 P10 0.29、P30 0.63、P70 1.53、P90 2.46）§2.3，
      // 但那包含城鄉差距與沒有工作的人，比城鎮受僱者寬。往內收窄：
      // 底部以最低工資為界（上海 2,740／月 = 中位數 0.43；三四線約 1,900／月 = 0.30）§2.2；
      // 中段對照（平均數 ×1.03 落在的 PR）：農民工 60,900（約 P38）、私營 71,590（約 P48）、非私營 129,441（約 P81）；
      // 頂部：規上企業專業人員 155,491（約 P87）、管理人員 210,016（約 P94）§2.1。
      // 整體平均約為中位數的 1.27 倍，與非私營、私營兩者的就業加權平均相近［DERIVED／ESTIMATE］
      q: [[5, 0.34], [10, 0.42], [20, 0.56], [30, 0.69], [40, 0.84], [50, 1], [60, 1.17], [70, 1.38], [80, 1.70], [90, 2.30], [95, 2.95]],
      paretoAlpha: 2.6, // P95 以上的尾端（P99 約 42 萬）［ESTIMATE］
      ageSpread: 0.85,
      // 年齡：官方不公布 §2.5。22–42 歲沿用台灣曲線（內插）；45 歲後比台灣低，
      // 因為年長世代學歷較低（1999 年大學擴招）、女性 50–55 歲退休［ESTIMATE］
      age: [[22, 0.70], [27, 0.95], [32, 1.03], [37, 1.08], [42, 1.10], [47, 1.08], [52, 1.03], [57, 0.97], [62, 0.85], [67, 0.70]],
      bonus: 1 // 常見「13 薪」，年終約 1 個月 §2.5［ESTIMATE］
    },
    // 檢查用的年薪（對照研究 §3.4 的試算）
    CHECK_SALARIES: [60000, 100000, 150000, 200000, 300000, 500000, 1000000],

    // ---------- 城市 ----------
    CITY: {
      shanghai: {
        id: 'shanghai', name: '上海', short: '上海',
        avgWage: 150924, // 2025 全口徑平均工資（12,577／月），約為全國城鎮受僱者中位數的 2 倍 §2.2［SECONDARY 轉述官方］
        wageRel: 1.53,   // 上海受僱者中位數 ÷ 全國（研究估 11.5 萬 ÷ 7.5 萬）§2.4［ESTIMATE］
        // 城鎮常住居民每人消費支出 57,076（2025，上海市統計局）÷ 全國城鎮 35,869（國家統計局）［OFFICIAL］
        cons: 1.59,
        // 租金：中指 2026-08 每 ㎡ 每月 84.39 §4.2［SECONDARY］，房子越大每 ㎡ 越便宜：
        // 1 房 50 ㎡ × 78、2 房 75 ㎡ × 77、3 房 100 ㎡ × 73、4 房 130 ㎡ × 72（研究建議值換算到本模型面積）§4.2［DERIVED／ESTIMATE］
        // 要價→成交的折扣約與仲介費（約一個月租金）相抵，不另調整［ESTIMATE］
        rent: [3900, 5800, 7300, 9400],
        // 二手房：成交均價 35,972（2026-05）偏向郊區、老舊小戶型 §4.1。改用新房均價 × 成都的二手／新房比 0.645
        // ≈ 52,500，作為中間地段的家庭住宅［DERIVED／ESTIMATE］
        price: 52000,
        priceNew: 81000,   // 新房 2025 年均價 81,337（建築面積，含公攤）§4.1［NEWS／SECONDARY］
        mgmt: 3.5,         // 物業費每 ㎡ 每月 2–5 §4.3［ESTIMATE］
        propTax: 0,        // 房產稅試點只對部分第二套房或非戶籍購房，本地首套為 0 §4.3
        parkBuy: 250000,   // 產權車位：未查到［ESTIMATE］
        park: 600,         // 社區月租車位：未查到［ESTIMATE］
        tpass: 300,        // 每位大人每月地鐵公車（每天來回約 10 元 × 22 天＋假日；通勤費多半自付）［ESTIMATE］
        // 社保（員工）：養老 8%＋醫療 2%＋失業 0.5%，基數 7,546–37,731（2026-07 起）§3.2［SECONDARY 轉述官方］
        siRate: 0.105, siMin: 7546, siMax: 37731,
        // 公積金：員工與雇主各 5–7%，取 7%（研究 §3.4 試算也用 7%）；基數 2,740–37,731 §3.3［SECONDARY］
        hpfRate: 0.07, hpfMin: 2740, hpfMax: 37731,
        // 公積金貸款上限（首套）：家庭 240 萬、個人 120 萬；多子女 +20%、綠建築 +15%，最高 324 萬 §4.3［NEWS］
        hpfCapFamily: 2400000, hpfCapOne: 1200000,
        maternityDays: 158, // 產假 98＋生育假 60 天，生育津貼約全薪 §6.2［NEWS］
        paternityDays: 10,  // 配偶陪產假 10 天 §6.2［UNVERIFIED］
        prenatalK: 1,       // 2026-10 起合規產檢與分娩「無自付」，只剩自費項目 §6.1
        postpartumCenter: 75000, // 月子中心 28 天：上海未查到；北京高端 11.3–18.5 萬、一線 5–80 萬 §6.1［ESTIMATE 中檔］
        postpartumNanny: 15000,  // 月嫂 26 天：未查到（北京住家保姆約 1 萬／月，月嫂較高）§6.1［ESTIMATE］
        // 0–2 歲托育（每月，含餐）§6.3［ESTIMATE］：公辦托班 1,500–2,500、普惠 3,500–4,500、民辦 6,000–8,000
        carePublic: 2000, careQuasi: 4000, carePrivate: 7000,
        careSub: 300,       // 普惠與公辦的營運補助（成都每位每月 300，上海未查到，比照）§6.3［ESTIMATE］
        helper: 10000,      // 住家保姆（育兒嫂）9,000–12,000 §6.3［ESTIMATE］
        // 幼兒園（每月，含餐）§7.1：公辦一級園 225、示範園 700（2012 標準）＋餐費；普惠民辦 ≤700＋餐費［OFFICIAL／ESTIMATE］
        kg: { public: 650, quasi: 950, private: 4500, bilingual: 15000 },
        kgTuitionPublic: 400, // 公辦保育教育費（大班全免）［ESTIMATE，一級園與示範園之間］
        kgFreeCredit: 700,    // 民辦園大班減免：公辦示範園標準 700 §7.1［OFFICIAL］
        // 學校：義務教育免學費；每年午餐、校服、教材、活動（不含補習）［ESTIMATE，依 CIEFR 全國 4,651／6,891／13,346 扣補習、城市 ×1.4］§7.2
        pub: { es: 3500, jh: 4000, sh: 6000 },
        priv: { es: 50000, jh: 60000, sh: 50000 }, // 民辦學校：未查到［ESTIMATE］
        intl: 200000,       // 國際或雙語學校：未查到［ESTIMATE］
        afterSchool: 1200,  // 學校課後服務（上海免費）＋晚托班 §7.2［ESTIMATE］
        hobby: 1000,        // 每項興趣班每月［ESTIMATE］
        cram: { none: 0, some: 1500, full: 5000 }, // §7.2 建議值［ESTIMATE］
        uniPublic: 8200     // 上海公辦高校平均學費 7,215（2023 秋起）＋書籍雜費約 1,000 §7.3［NEWS／ESTIMATE］
      },
      chengdu: {
        id: 'chengdu', name: '成都', short: '成都',
        avgWage: 93972, // 四川 2025 全口徑平均工資（7,831／月；成都本市未查到）§2.2［NEWS］
        wageRel: 1.07,  // 成都受僱者中位數 ÷ 全國（研究估 8 萬 ÷ 7.5 萬）§2.4［ESTIMATE］
        // 城鎮居民每人消費支出 37,100（2025 成都統計公報）÷ 全國城鎮 35,869［OFFICIAL］
        cons: 1.03,
        // 租金：成都住建局 2026 Q2 各街道住宅租金，中心城區（錦江、青羊、金牛、武侯、成華、高新）65 個街道
        // 中位數每 ㎡ 33.8（四分位 30.7–38.2）［OFFICIAL］§14.2；1 房 50 ㎡、2 房 75 ㎡、3 房 100 ㎡、4 房 130 ㎡，
        // 大戶型每 ㎡ 略低（34／33／32／31）［DERIVED］
        rent: [1700, 2500, 3200, 4000],
        price: 12200,      // 二手房成交均價約 12,200（2026-01）§4.1［NEWS］
        priceNew: 18900,   // 新房均價約 18,912（2025 前三季）§4.1［SECONDARY］
        mgmt: 2.5,         // 物業費每 ㎡ 每月 1.5–3 §4.3［ESTIMATE］
        propTax: 0,
        parkBuy: 100000, park: 350, // 未查到［ESTIMATE］
        tpass: 180,        // 地鐵每趟 2–4 元［ESTIMATE］
        // 社保：養老 8%＋醫療 2%＋失業 0.4%，基數 4,699–23,493（四川 2026）§3.2［NEWS；失業費率 UNVERIFIED］
        siRate: 0.104, siMin: 4699, siMax: 23493,
        // 公積金 5–12%，取 7% 與上海一致；基數 2,330–32,969 §3.3［NEWS／ESTIMATE］
        hpfRate: 0.07, hpfMin: 2330, hpfMax: 32969,
        // 公積金貸款上限：單人 80 萬、雙人 120 萬；二手房與綠建築新房 +20% §4.3［NEWS］
        hpfCapFamily: 1200000, hpfCapOne: 800000,
        // 四川 2025-12 修法：產假 98＋生育假 90 = 188 天、男方護理假 30 天；生效日未查到 §6.2、§12.12。
        // 模型的生產都在 2026 年以後，假設已生效；延長的部分「視為出勤、工資不受影響」，所以都算全薪［ESTIMATE］
        maternityDays: 188,
        paternityDays: 30,
        prenatalK: 0.8,     // 四川是否已「無自付」未確認；2026 年全國目標，視為已達成，自費項目略低於上海［ESTIMATE］
        postpartumCenter: 40000, // 月子中心：未查到（三四線 1.6 萬起、一線 5 萬起）§6.1［ESTIMATE］
        postpartumNanny: 9000,   // 月嫂：未查到［ESTIMATE］
        // 0–2 歲托育 §6.3：普惠托育限價 ≤3,967（城鎮人均可支配收入 80%、≤4,000）；建議普惠 2,000–3,000、民辦 3,500–5,000［DERIVED／ESTIMATE］
        carePublic: 1500, careQuasi: 2500, carePrivate: 4200,
        careSub: 300,       // 普惠托育營運補助每位每月 300 §6.3［NEWS］
        helper: 7000,       // 住家保姆 6,000–8,000 §6.3［ESTIMATE］
        // 幼兒園：成都收費未查到 §7.1，用研究建議值［ESTIMATE］
        kg: { public: 550, quasi: 1000, private: 2200, bilingual: 7500 },
        kgTuitionPublic: 300,
        kgFreeCredit: 400,  // 民辦園大班按當地公辦標準減免 §7.1［ESTIMATE 金額］
        pub: { es: 2800, jh: 3300, sh: 5000 },
        priv: { es: 30000, jh: 35000, sh: 30000 },
        intl: 120000,
        afterSchool: 700,
        hobby: 600,
        cram: { none: 0, some: 800, full: 2500 }, // §7.2 建議值［ESTIMATE］
        uniPublic: 6200     // 四川公辦高校學費 4,800–5,800（2023 秋起）＋書籍雜費 §7.3［NEWS／ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷。各國用同一個規則：「每人消費支出（不含住房與水電）× 0.716」，
      // 0.716 是台灣 14,000 元 ÷（每人消費 25,726 × 0.76）。中國大陸用城鎮（遊戲裡的家庭是城市受僱者）：
      // 2025 城鎮每人消費 35,869 − 居住（含水電燃料）8,095 = 27,774 ÷ 12 = 2,314.5 × 0.716 = 1,657
      // × 物價 2025→2026 約 1.01 ≈ 1,670［DERIVED］§5
      adultBase: 1670, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 中國大陸的大人開銷［ESTIMATE］
      child: [[0, 835], [2, 720], [6, 900], [12, 1190], [18, 1320]],
      // 水電燃氣與網路：未查到 §12.15；約為大人開銷的 1／3（同台灣比例）［ESTIMATE］
      utilBase: 120, utilPerPerson: 110,
      prenatal: { frugal: 2000, normal: 5000, comfy: 20000 }, // 合規產檢與分娩幾乎免費，只剩自費檢查、單人房、伙食；寬裕含私立醫院［ESTIMATE］
      gearFirst: { frugal: 2500, normal: 6000, comfy: 15000 }, gearLater: 2000, // 嬰兒用品（台灣比例 × 大人開銷）［ESTIMATE］
      postpartumFamily: 1500, // 家人幫忙坐月子的伙食與用品（台灣 1.5 萬台幣 ÷ 大人開銷的比例）［ESTIMATE］
      grandPaid: 0, helper: 0, // grandPaid 依兩地薪資換算（prep）；住家保姆依城市計價（family）
      uniPrivate: 28000,  // 民辦大學學費 2–3.5 萬 §7.3［ESTIMATE］
      uniAwayRent: 400,   // 外地讀書：宿舍約 1,200／年＋返鄉交通（生活費已含在孩子生活費）§7.3［ESTIMATE］
      master: 12000,      // 碩士學費（學術型約 8,000，專業型 1.5–3 萬）［ESTIMATE］
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      // 車：研究未涵蓋 §12.15［ESTIMATE］。上海燃油車要拍牌（平均約 9.4 萬）§5，模型假設買新能源車（綠牌免費）
      car: {
        used: { buy: 60000, resale: 0.2, life: 8, run: 12000 },
        new: { buy: 150000, resale: 0.3, life: 10, run: 10000 },   // 國產新能源車：保險、充電、保養
        import: { buy: 300000, resale: 0.35, life: 10, run: 18000 } // 進口或合資高階車
      },
      scooter: { buy: 3000, resale: 0.1, life: 5, run: 400 }, // 電動自行車（新國標）＋換電池［ESTIMATE］
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 40000,     // 65 歲後每人每年：企業退休人員基本養老金約 3,300–3,600／月［ESTIMATE，未查證］
      houseSize: { 1: 50, 2: 75, 3: 100, 4: 130 }, // 建築面積（含公攤）：研究建議 2 房 60–75、3 房 90–110、4 房 130–150 §4.1［ESTIMATE］
      reno: { basic: 500, light: 1200, full: 2500 }, // 每 ㎡：搬家與家具／一般整理／毛胚全包裝修，研究未涵蓋 §12.15［ESTIMATE］
      closing: { used: 0.03, new: 0.015 }, // 契稅 1%（≤140 ㎡）＋二手仲介約 2%；新房另計維修基金與登記 §4.3［NEWS／ESTIMATE］
      homeInsurance: 300
    },

    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    leaveMonths: 6,

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    // 台灣選項 → 中國大陸最接近的做法
    localize: function (ls) {
      ls.loan = 'bank'; // 沒有新青安；一律用公積金＋商業組合貸款（loanPlan）
      // 電動自行車、住家保姆、產權車位在大陸都很普遍，維持玩家的選擇
    },
    MAP: {
      housing: { rent: '租屋（整租）', buy: '買商品房，公積金＋商業組合貸款', family: '和長輩同住' },
      build: { used: '中古屋（二手房）', new: '新成屋（多為精裝）' },
      loan: { qingan: '沒有新青安，改用公積金貸款（2.6%）＋商業貸款（約 3.1%）', qinganNoGrace: '沒有新青安，改用公積金貸款（2.6%）＋商業貸款（約 3.1%）', bank: '公積金貸款（2.6%）＋商業貸款（約 3.1%），30 年' },
      parking: { buy: '買產權車位', rent: '社區月租車位' },
      postpartum: { center: '月子中心（28 天）', nanny: '請月嫂到家（26 天）', family: '家人幫忙坐月子' },
      leave: {
        none: '只休產假（上海 158 天、四川 188 天，生育津貼約全薪）',
        A: '產假約全薪（上海 158 天、四川 188 天），超過的月份無薪',
        B: '產假約全薪（上海 158 天、四川 188 天），超過的月份無薪',
        both: '一方休產假（約全薪）；另一方陪產假 10–30 天有薪，其餘無薪'
      },
      care: { quasi: '普惠托育（政府限價的民辦托育）', public: '公辦托育或幼兒園托班', private: '民辦托育或早教托班', grandPaid: '請長輩帶（付帶孫費）', grandFree: '請長輩帶（大陸最常見）', helper: '請住家保姆（育兒嫂）', quit: '一方離職在家照顧' },
      preschool: { public: '公辦幼兒園（大班免保育教育費）', quasi: '普惠性民辦幼兒園（上海每月約 950，含餐）', private: '一般民辦幼兒園', bilingual: '雙語或國際幼兒園', home: '在家照顧' },
      school: { public: '公辦學校（義務教育免學費；假設有戶籍或積分達標）', privateJH: '公辦小學，初中起讀民辦', private: '民辦小學到高中', intl: '國際或雙語學校' },
      after: { none: '不上晚托，放學自己帶（常由長輩接送）', anqin: '學校課後服務＋晚托班', anqin1: '課後服務＋晚托＋1 項興趣班', anqin3: '課後服務＋晚托＋3 項興趣班' },
      cram: { none: '不補習', some: '補 1–2 科（雙減後多為家教或小班）', full: '密集補習或一對一家教' },
      uni: { public: '公辦大學', private: '民辦大學', mixed: '公辦或民辦各半' },
      transport: { transit: '地鐵與公車', scooter: '電動自行車', used: '二手車', new: '國產新能源車（上海綠牌免拍牌）', import: '進口或合資高階車（假設新能源，免拍牌）' }
    },

    // ---------- 生產 §6.1 ----------
    // 合規產檢與分娩由生育保險支付（上海 2026-10 起「無自付」）；沒有一次性的出生現金給付（上海、成都都沒有）§8.2
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var lsK = { frugal: 0.75, normal: 1, comfy: 1.4 }[ls] || 1;
      var pp = s.postpartum === 'center' ? c.postpartumCenter * lsK : s.postpartum === 'nanny' ? c.postpartumNanny : C.postpartumFamily;
      var cost = C.prenatal[ls] * c.prenatalK + (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp;
      return { cost: cost, grant: 0, local: 0 };
    },
    // 全國育兒補貼：每孩每年 3,600，到滿 3 歲；不分胎次、不排富、免稅 §8.1［NEWS／OFFICIAL］
    allowance: function (x, k, a) { return a < 3 ? 3600 : 0; },
    // 0–2 歲（careMonths 個月送托）
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      if (cs === 'public') return { fee: c.carePublic * careMonths, sub: c.careSub * careMonths };
      if (cs === 'quasi') return { fee: c.careQuasi * careMonths, sub: c.careSub * careMonths };
      if (cs === 'private') return { fee: c.carePrivate * careMonths };
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      if (cs === 'helper') {
        // 一位保姆照顧所有孩子：整個家庭只計一次（費用在 family 依城市計價）
        x.helperMonths = Math.max(x.helperMonths, careMonths);
        return {};
      }
      return {}; // grandFree
    },
    // 3–5 歲：大班（5 歲）免保育教育費；民辦園按公辦標準減免 §7.1
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var m = c.kg[ps] || c.kg.quasi;
      var credit = a === 5 ? (ps === 'public' ? c.kgTuitionPublic : c.kgFreeCredit) : 0;
      return { fee: Math.max(0, m - credit) * 12, kg: credit * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.priv[level] : c.pub[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = (/^anqin/.test(s.after) && !(s.school === 'private' || intl)) ? c.afterSchool * 12 : 0;
        extra = after + hobbies * c.hobby * 12;
      } else {
        extra = (c.cram[s.cram] || 0) * 12;
      }
      return fee + extra;
    },
    uni: function (x, k, a) {
      var s = x.s, c = x.c, C = x.C;
      var fee = s.uni === 'private' ? C.uniPrivate : s.uni === 'public' ? c.uniPublic : (c.uniPublic + C.uniPrivate) / 2;
      return { fee: fee, sub: 0 };
    },
    // 住家保姆：依城市行情（引擎的 COST.helper 是全國一個價，這裡設 0 改在此計）
    family: function (x) {
      if (x.helperMonths > 0) x.e.kidsCare += x.c.helper * x.helperMonths;
    },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      return c.rent[U.clamp(rooms, 1, 4) - 1] * rentMult;
    },
    // 房貸：首套首付 15%（上海 2026-08 起；全國下限）§4.3。公積金貸款 2.6%（5 年以上）到上限，其餘商業貸款
    // （新發放房貸加權平均約 3.1%），都是 30 年。車位不能用房貸，算在自備款裡［ESTIMATE］
    loanPlan: function (x, total) {
      var s = x.s, c = x.c, year = D.BASE_YEAR + x.tb;
      var parking = x.hasCar && s.parking === 'buy' ? (c.parkBuy || 0) : 0;
      var home = total - parking;
      // 成都：2026-08-25 到 12-31 新房公積金首付 15%、利息補貼 20%（每筆最多 2.5 萬）§4.3。
      // 窗口外公積金首付以 20% 計（研究只說明窗口內降到 15%）［ESTIMATE］
      var cdWindow = c.id === 'chengdu' && s.build === 'new' && year <= 2026;
      var down = c.id === 'chengdu' && !cdWindow ? 0.20 : 0.15;
      var loan = home * (1 - down);
      var two = s.partner && hasJob(s.jobA) && hasJob(s.jobB);
      var cap = two ? c.hpfCapFamily : c.hpfCapOne;
      var kidsAtBuy = (x.births || []).filter(function (b) { return b <= x.tb; }).length;
      var up = 0;
      if (c.id === 'shanghai') { if (kidsAtBuy >= 2) up += 0.20; if (s.build === 'new') up += 0.15; } // 新房假設符合綠建築［ESTIMATE］
      else up = 0.20; // 成都：二手房與綠建築新房 +20%
      var hpf = Math.min(loan, cap * (1 + up)), com = loan - hpf;
      var hpfPart = { amt: hpf, rate: HPF_RATE, years: 30, grace: 0, label: '公積金貸款' };
      if (cdWindow) hpfPart.rates = subsidyRates(hpf);
      return {
        parts: [hpfPart, { amt: com, rate: BANK_RATE, years: 30, grace: 0, label: '商業貸款' }],
        note: '公積金貸款 ' + Math.round(hpf / 10000) + ' 萬（2.6%）' + (com > 1 ? '＋商業貸款 ' + Math.round(com / 10000) + ' 萬（3.1%）' : '') + '，首付 ' + Math.round(down * 100) + '%'
      };
    },

    // ---------- 產假與生育津貼 §6.2 ----------
    // 模型不知道哪位是母親。約定：只有一人請假時，請假的人視為母親；兩人都請（both）時 A 是母親、B 是父親。
    // 母親：產假（上海 158 天、四川 188 天）由生育津貼支付，約等於全薪（按繳費基數，上限為社保基數上限）；
    // 父親：陪產或護理假（上海 10 天、四川 30 天）照常領薪。
    // 每人請 6 個月（和台灣同一個標準），超過法定有薪天數的月份沒有收入。生育津貼免個人所得稅。
    leavePay: function (g, ind, months, nb, x, who) {
      var s = x.s, c = x.c;
      var mother = s.leave === 'B' ? 'B' : 'A';
      var paid = Math.min(months, (who === mother ? c.maternityDays : c.paternityDays) / 30.4);
      var monthly = g / 12;
      if (who === mother) monthly = U.clamp(monthly, c.siMin, c.siMax);
      x.y['lv' + who] = paid * nb; // 有薪的月份，社保與公積金照繳（taxes 用）
      return monthly * paid * nb;
    },

    // ---------- 稅、社保與公積金（個人分開課稅）§3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, t = x.t || 0;
      var people = [
        { g: x.gA, wf: x.workFracA, age: s.ageA + t, lv: lvPaid(x, 'A') },
        { g: s.partner ? x.gB : 0, wf: x.workFracB, age: s.ageB + t, lv: lvPaid(x, 'B') }
      ];
      var si = 0, ee = 0;
      people.forEach(function (p) {
        p.si = 0; p.hpf = 0;
        if (!(p.g > 0)) return;
        var full = p.g / Math.max(p.wf, 0.05) / 12;  // 全年在職時的月薪
        var frac = Math.min(1, p.wf + p.lv / 12);     // 有繳費的比例（含有薪產假）
        p.si = U.clamp(full, c.siMin, c.siMax) * c.siRate * 12 * frac;
        p.hpf = U.clamp(full, c.hpfMin, c.hpfMax) * c.hpfRate * 12 * frac;
        si += p.si; ee += p.hpf;
      });
      var er = ee; // 雇主提撥同樣比例、同樣基數

      // 個人所得稅：基本扣除 6 萬＋社保與公積金＋專項附加扣除 §3.1
      var kidDed = 0;
      (x.atHome || []).forEach(function (a) { kidDed += 24000; }); // 3 歲以下照護、3 歲起子女教育（含大學、研究所）各 2,000／月
      var houseDed = x.renting ? 18000 : (x.ly >= 0 && x.ly < 20 && x.loanBalReal > 0 ? 12000 : 0); // 房租 1,500／月（上海、成都）或首套房貸利息 1,000／月（最多 240 個月）
      // 贍養老人：有給孝親費、父母滿 60 歲（假設本人 30 歲起）時每月 3,000（城市年輕世代多為獨生子女）［ESTIMATE］
      var elder = function (p) { return (+s.elder > 0 && p.age >= 30 && p.age < 60) ? 36000 : 0; };
      // 子女扣除可由一方全扣或各扣 50%；房租或房貸利息由一方扣除：取稅最低的分配
      var tax = Infinity;
      [[1, 0], [0, 1], [0.5, 0.5]].forEach(function (ks) {
        [[1, 0], [0, 1]].forEach(function (hs) {
          var tt = 0;
          people.forEach(function (p, i) {
            if (!(p.g > 0)) return;
            var n = p.g - 60000 - p.si - p.hpf - elder(p) - ks[i] * kidDed - hs[i] * houseDed;
            if (n > 0) tt += U.bracketTax(n, BRACKETS);
          });
          if (tt < tax) tax = tt;
        });
      });

      // 公積金帳戶：員工與雇主的提撥都存進家庭帳戶，當年付房租、房貸或頭期款時提領（研究 §3.3）。
      // 一般情況（住房支出大於提撥）：員工自付的部分不算損失、雇主的部分當作現金（tr.fund）。
      // 住長輩家、沒有住房支出時，錢鎖在帳戶裡，到 60 歲退休才提領。
      // 房租提領的上限沒有計算：成都每位繳存人每月 1,800（多子女 +50%）§14.3［NEWS］，上海每戶上限未查證；
      // 門檻收入附近，夫妻一年的提撥（員工＋雇主）都低於上限，幾乎不會卡到［DERIVED］
      if (!t) x._hpfBal = 0;
      var avail = (x._hpfBal || 0) + ee + er;
      var outlay = x.e ? x.e.housing + x.e.housingOnce : Infinity;
      if (s.ageA + t >= 60) outlay = Infinity;
      var use = Math.min(avail, outlay);
      x._hpfBal = avail - use;
      if (x.tr) x.tr.fund = (x.tr.fund || 0) + Math.max(0, use - ee);
      return { si: si + Math.max(0, ee - use), tax: tax, hpf: ee, hpfEmployer: er };
    }
  };

  var HPF_RATE = 0.026;  // 公積金首套 5 年以上 2.6%（2025-05 起）§4.3［NEWS］
  var BANK_RATE = 0.031; // 新發放房貸加權平均約 3.1%（5 年期 LPR 3.5% 減點）§4.3［NEWS］
  // 綜合所得稅級距（年）§3.1。年終獎 2027 年底前可單獨計稅，模型合併計算（13 薪下差異小）［ESTIMATE］
  var BRACKETS = [[36000, 0.03, 0], [144000, 0.10, 2520], [300000, 0.20, 16920], [420000, 0.25, 31920], [660000, 0.30, 52920], [960000, 0.35, 85920], [Infinity, 0.45, 181920]];

  function hasJob(job) {
    var ind = K.IND[job.industry] || K.IND.all;
    return ind.median > 0 && !(job.mode === 'salary' && !(job.salary > 0));
  }
  function lvPaid(x, who) { return x.y['lv' + who] || 0; }
  // 成都 2026 新房公積金貸款利息補貼 20%（每筆最多 25,000）：換算成前幾年較低的利率
  function subsidyRates(amt) {
    var out = [], left = 25000, bal = amt;
    for (var i = 0; i < 30 && left > 1 && bal > 1; i++) {
      var it = bal * HPF_RATE, sub = Math.min(left, it * 0.2);
      out.push(HPF_RATE * (1 - sub / it));
      left -= sub;
      bal -= U.annuity(bal, HPF_RATE, 30 - i) - it;
    }
    out.push(HPF_RATE);
    return out;
  }
  K.BRACKETS = BRACKETS;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));
