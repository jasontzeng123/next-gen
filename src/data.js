/* =========================================================================
   DATA — 台灣養育成本、所得分布、補助與稅制參數
   全部金額為新台幣「2026 年幣值」。est:true 代表估計值（見方法頁）。
   ========================================================================= */
var DATA = (function () {
  'use strict';

  // ---------- 資料來源 ----------
  var SOURCES = {
    birth:      { t: '勞動部｜好孕3方案：每胎生育補助補足至10萬元', u: 'https://www.mol.gov.tw/1607/1632/1633/84736/', d: '2026' },
    allowance:  { t: '行政院｜0–未滿2歲育兒津貼', u: 'https://www.ey.gov.tw/Page/5C0ED08BC3240B/c7f92bd8-d84e-4918-831f-a84e505f1e91', d: '2022–2026' },
    family:     { t: '中央社｜行政院家庭支持篇（托育、幼兒園、成長津貼）', u: 'https://www.cna.com.tw/news/aipl/202605270141.aspx', d: '2026-05' },
    preschool:  { t: '新北市板橋區公所｜2–5歲育兒津貼與就學補助 FAQ', u: 'https://www.banqiao.ntpc.gov.tw/userfiles/3010500/files/20251016-FQA.pdf', d: '2025-10' },
    kgFee:      { t: '親子天下｜幼兒園收費與家長繳費上限', u: 'https://www.parenting.com.tw/article/5089425', d: '2026-03' },
    leave:      { t: '勞動部｜育嬰留職停薪津貼與按日申請', u: 'https://www.mol.gov.tw/1607/1632/1633/90804/', d: '2026' },
    tax115:     { t: '中央社｜未成年子女免稅額調高三讀（115年度）', u: 'https://cna.com.tw/news/afe/202608210277.aspx', d: '2026-08' },
    taxParam:   { t: '會計師整理｜115年度綜所稅免稅額、扣除額與課稅級距', u: 'https://cpacorey.com/income-tax-level-2026/', d: '2026' },
    nhi:        { t: '健保署｜投保金額分級表與費率', u: 'https://www.nhi.gov.tw/ch/dl-80722-3a1c591f3afb48f7bf4ecca33e2d7974-1.pdf', d: '2026' },
    laborIns:   { t: '勞動部｜勞保費率與投保薪資', u: 'https://www.mol.gov.tw/1607/1632/1633/86680/', d: '2026' },
    rentSub:    { t: '115年度300億元中央擴大租金補貼作業規定', u: 'https://thd.taichung.gov.tw/media/1305401/附件2-115-300億租金補貼作業規定.pdf', d: '2026' },
    rentSubNew: { t: '工商時報｜青年婚育租屋支持專案加碼倍數', u: 'https://www.ctee.com.tw/news/20250911700946-430102', d: '2025-09' },
    qingan:     { t: '今周刊｜新青安3.0 方案內容（2026-08起）', u: 'https://www.businesstoday.com.tw/article/category/192008/post/202607160020/', d: '2026-07' },
    mortgage:   { t: '自由時報｜五大銀行新承做房貸利率', u: 'https://ec.ltn.com.tw/article/breakingnews/5582725', d: '2026-08' },
    tpeBirth:   { t: '臺北市生育補助發放辦法', u: 'https://laws.gov.taipei/law/LawSearch/LawArticleContent/FL081869', d: '2026' },
    tpeCare:    { t: '臺北市友善托育補助實施計畫', u: 'https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL079829', d: '2026-07' },
    cityBirth:  { t: '商周｜各縣市生育補助一覽', u: 'https://www.businessweekly.com.tw/career/blog/3021085', d: '2026' },
    wage:       { t: '主計總處｜113年全年總薪資中位數及分布統計', u: 'https://www.stat.gov.tw/News_Content.aspx?n=2716&s=235514', d: '2025-11' },
    wageYear:   { t: '主計總處｜114年全年薪資統計', u: 'https://www.stat.gov.tw/News_Content.aspx?n=2724&s=235863', d: '2026-02' },
    wageDecile: { t: '主計總處十分位資料（轉載）', u: 'https://joelin.cc/p/9747', d: '2025-11' },
    occupation: { t: '勞動部｜職類別薪資調查', u: 'https://www.mol.gov.tw/1607/1632/1633/90814/', d: '2025' },
    household:  { t: '主計總處｜114年家庭收支調查', u: 'https://www.stat.gov.tw/News_Content.aspx?n=3703&s=236591', d: '2026-08' },
    quintile:   { t: '臺中市主計處｜114年家庭收支（含全國五等分位）', u: 'https://www.dbas.taichung.gov.tw/media/1457179/第115-03號-經濟統計通報-臺中市114-年家庭收支狀況.pdf', d: '2026' },
    savingRate: { t: '風傳媒｜113年家庭收支調查：每戶儲蓄與儲蓄率', u: 'https://www.storm.mg/lifestyle/11061012', d: '2025-08' },
    youthSave:  { t: '經濟日報｜yes123 青年勞工調查：39歲以下平均存款', u: 'https://money.udn.com/money/story/5612/9415770', d: '2026-04' },
    savingAge:  { t: '老喬報｜依主計總處家庭收支調查推估各年齡累積存款', u: 'https://joelin.cc/?p=3571', d: '2026-08' },
    countyCons: { t: '主計總處家庭收支各縣市每人消費（彙整表）', u: 'https://csr.mcut.edu.tw/var/file/31/1031/img/2105/528706794.pdf', d: '2023' },
    minLiving:  { t: '臺北市｜115年度最低生活費', u: 'https://service.docms.gov.taipei/attachments/115-income-limit.pdf', d: '2026' },
    women:      { t: '主計總處｜婦女婚育與就業調查', u: 'https://ws.dgbas.gov.tw/public/attachment/7911117100zt9y70g.pdf', d: '2016' },
    leju:       { t: '樂居｜各縣市近一年實價登錄均價', u: 'https://www.leju.com.tw/map/region?mode=price', d: '2026-10' },
    rent591:    { t: '591租屋｜各縣市租金行情（刊登中位數）', u: 'https://rent.591.com.tw/market/region', d: '2026-10' },
    rentMoi:    { t: '中央社｜內政部115上半年租金統計', u: 'https://www.cna.com.tw/news/aipl/202608130273.aspx', d: '2026-08' },
    pir:        { t: '內政部房價負擔能力指標（115Q1，轉載）', u: 'https://fangbian.tw/house-price-income-ratio/', d: '2026' },
    sinyi:      { t: '信義房價指數', u: 'https://www.sinyinews.com.tw/quarterly', d: '2005–2026' },
    parking:    { t: '信義房屋｜2025平面車位均價', u: 'https://www.peoplenews.tw/articles/lifestyle/14573', d: '2026' },
    careFee:    { t: '親子天下｜準公共托育收費上限', u: 'https://www.parenting.com.tw/article/5086811', d: '2026-01' },
    tpeCareCap: { t: '臺北市準公共托育收費上限', u: 'https://www-ws.gov.taipei/001/Upload/358/relfile/17962/3171232/bb3f51f6-1fc7-445f-849e-56879b8342c2.pdf', d: '2026' },
    childSurvey:{ t: '衛福部｜111年兒童及少年生活狀況調查', u: 'https://www.mohw.gov.tw/dl-86168-9a466094-0c39-4ed1-b95e-fdbc74e7c28e.html', d: '2022' },
    helper:     { t: '中央社｜外籍家庭幫傭放寬至有12歲以下子女家庭', u: 'https://www.cna.com.tw/news/aipl/202603180239.aspx', d: '2026-03' },
    postpartum: { t: '聯合報｜台北月子中心價格', u: 'https://udn.com/news/story/7323/9257447', d: '2026-01' },
    postpartum2:{ t: '凱基銀行｜各地月子中心行情', u: 'https://www.kgibank.com.tw/zh-tw/kgibarticleshome/loan/pl-parenting', d: '2025-06' },
    uniFee:     { t: '公視｜大專學雜費與私校學費減免', u: 'https://news.pts.org.tw/article/751419', d: '2025' },
    hsFree:     { t: '公視｜高中職免學費', u: 'https://news.pts.org.tw/article/643833', d: '2023' },
    lunch:      { t: '今周刊｜各縣市國中小營養午餐免費', u: 'https://www.businesstoday.com.tw/article/category/183030/post/202601080017/', d: '2026-01' },
    carTax:     { t: '財政部｜使用牌照稅', u: 'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-knowledge/NmrzjR', d: '2026' },
    scooter:    { t: '遠見｜交通部機車使用狀況調查', u: 'https://city.gvm.com.tw/article/107558', d: '2022' },
    tpass:      { t: 'Money101｜TPASS 各區月票', u: 'https://www.money101.com.tw/blog/%E5%8C%97%E6%8D%B7%E6%8D%B7%E9%81%8B-8-%E6%8A%98%E5%84%AA%E6%83%A0%E5%8F%96%E6%B6%88-%E5%B8%B8%E5%AE%A2%E6%96%B9%E6%A1%88%E6%90%AD%E8%B6%8A%E5%A4%9A%E7%9C%81%E8%B6%8A%E5%A4%9A', d: '2026-09' },
    filial:     { t: 'yes123｜上班族每月孝親費調查', u: 'https://www.epochtimes.com.tw/n351538/', d: '2021' },
    births:     { t: '內政部戶政統計（經維基百科彙整）', u: 'https://en.wikipedia.org/wiki/Demographics_of_Taiwan', d: '2026' },
    bonus:      { t: '經濟日報｜主計總處年終獎金統計', u: 'https://money.udn.com/money/story/5612/9443738', d: '2026' },
    population: { t: '內政部戶政司｜村里戶籍人口統計（115年9月）', u: 'https://www.ris.gov.tw/app/portal/346', d: '2026-09' },
    molYear:    { t: '勞動部｜勞動統計年報 表1-1（歷年薪資與物價）', u: 'https://statdb.mol.gov.tw/html/year/year14/31010.pdf', d: '2025' },
    sinyiPing:  { t: 'Taipei Times｜信義房屋：台北房價20年漲近3倍（1995 vs 2014）', u: 'https://www.taipeitimes.com/News/biz/archives/2015/06/14/2003620627', d: '2015' },
    growthAllow:{ t: '今周刊｜0–18歲成長津貼（預算審議中）', u: 'https://www.businesstoday.com.tw/article/category/183030/post/202605210002/', d: '2026-05' }
  };

  // ---------- 縣市 ----------
  // price: 萬元/坪（大樓華廈，近一年，樂居）; rent: 591 刊登中位數（元/月）
  // cons: 每人每月消費支出（2023，主計總處）; minLiving: 115年最低生活費
  // park: 月租車位; parkBuy: 平面車位均價（萬）; rsb: 租金補貼第二級基本額; cap: 新青安房價上限（萬）
  function C(id, name, area, o) { o.id = id; o.name = name; o.area = area; return o; }
  var COUNTIES = [
    C('TPE', '台北市', 'north', { price: 107.35, priceNew: 128.88, rent: [15900, 30000, 35000, 44999], mgmt: 130, pir: 14.72, cons: 34014, minLiving: 20744, park: 2979, parkBuy: 287.8, rsb: 5000, cap: 3500, tpass: 1200, birth: [40000, 45000, 50000], small: 26 }),
    C('NTPC', '新北市', 'north', { price: 60.36, priceNew: 71.33, rent: [12500, 19999, 25000, 28000], mgmt: 100, pir: 12.63, cons: 26226, minLiving: 17750, park: 2500, parkBuy: 204.3, rsb: 4000, cap: 2500, tpass: 1200, birth: [40000, 45000, 50000], small: 26 }),
    C('TYN', '桃園市', 'north', { price: 38.63, priceNew: 43.62, rent: [9500, 16000, 22000, 25000], mgmt: 85, pir: 8.43, cons: 25235, minLiving: 17186, park: 2000, parkBuy: 162.9, rsb: 4000, cap: 2000, tpass: 1200, birth: [30000, 40000, 50000], small: 26 }),
    C('TXG', '台中市', 'central', { price: 40.89, priceNew: 52.46, rent: [9466, 15000, 22000, 25000], mgmt: 85, pir: 11.35, cons: 26957, minLiving: 16431, park: 1800, parkBuy: 165.6, rsb: 4000, cap: 2000, tpass: 699, birth: [20000, 20000, 30000, 40000, 50000], small: 23 }),
    C('TNN', '台南市', 'south', { price: 32.53, priceNew: 38.56, rent: [7500, 13500, 21000, 23287], mgmt: 65, pir: 8.76, cons: 22661, minLiving: 15515, park: 1600, parkBuy: 155.4, rsb: 3600, cap: 2000, tpass: 999, birth: [20000, 20000, 30000, 30000, 50000], small: 23 }),
    C('KHH', '高雄市', 'south', { price: 31.74, priceNew: 38.53, rent: [7800, 16000, 21000, 24000], mgmt: 65, pir: 9.35, cons: 26399, minLiving: 16970, park: 1800, parkBuy: 204.8, rsb: 3600, cap: 2000, tpass: 999, birth: [30000, 30000, 30000], small: 23 }),
    C('HSZ', '新竹市', 'north', { price: 50.73, priceNew: 62.15, rent: [9500, 16000, 24000, 28950], mgmt: 90, pir: 8.43, cons: 31211, minLiving: 15515, park: 2500, parkBuy: 159.0, rsb: 4000, cap: 2500, tpass: 1200, birth: [30000, 30000, 30000], small: 26 }),
    C('HSQ', '新竹縣', 'north', { price: 51.43, priceNew: 56.90, rent: [10000, 20000, 25000, 30000], mgmt: 90, pir: 9.21, cons: 29578, minLiving: 15515, park: 2000, parkBuy: 159.0, rsb: 4000, cap: 2500, tpass: 1200, birth: [10000, 20000, 50000], small: 26 }),
    C('KEE', '基隆市', 'north', { price: 28.98, priceNew: 46.33, rent: [8500, 10880, 15000, 16500], mgmt: 60, pir: 5.70, cons: 24234, minLiving: 15515, park: 1500, parkBuy: 110, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 1200, small: 26 }),
    C('ILA', '宜蘭縣', 'north', { price: 27.06, priceNew: 29.61, rent: [8000, 13000, 16000, 18000], mgmt: 50, pir: 7.33, cons: 23808, minLiving: 15515, park: 1200, parkBuy: 100, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 800, small: 23 }),
    C('MIA', '苗栗縣', 'central', { price: 30.80, priceNew: 34.16, rent: [7500, 13800, 20000, 23000], mgmt: 50, pir: 7.64, cons: 21017, minLiving: 15515, park: 1200, parkBuy: 100, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 1200, small: 23 }),
    C('CHA', '彰化縣', 'central', { price: 28.70, priceNew: 32.88, rent: [6800, 12250, 18000, 19500], mgmt: 50, pir: 8.23, cons: 19292, minLiving: 15515, park: 1200, parkBuy: 100, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 699, small: 23 }),
    C('NAN', '南投縣', 'central', { price: 23.81, priceNew: 28.13, rent: [6800, 11000, 18000, 19000], rentEst1: true, mgmt: 40, pir: 8.47, cons: 18650, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 699, small: 23 }),
    C('YUN', '雲林縣', 'south', { price: 22.43, priceNew: 26.66, rent: [6500, 11000, 19000, 20500], rentEst1: true, mgmt: 40, pir: 7.17, cons: 20356, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 399, small: 23 }),
    C('CYI', '嘉義市', 'south', { price: 25.85, priceNew: 34.65, rent: [7500, 12000, 16500, 20000], rentEst1: true, mgmt: 45, pir: 7.51, cons: 25599, minLiving: 15515, park: 1200, parkBuy: 100, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 399, small: 23 }),
    C('CYQ', '嘉義縣', 'south', { price: 27.55, priceNew: 31.78, rent: [7500, 12000, 23000, 23800], rentEst1: true, mgmt: 40, pir: 6.67, cons: 19410, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 399, small: 23 }),
    C('PIF', '屏東縣', 'south', { price: 21.86, priceNew: 26.29, rent: [6500, 11750, 17500, 19000], mgmt: 40, pir: 7.08, cons: 21594, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 999, small: 23 }),
    C('HUA', '花蓮縣', 'east', { price: 23.35, priceNew: 27.39, rent: [7000, 12000, 17000, 18000], mgmt: 40, pir: 8.31, cons: 21484, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 399, small: 23 }),
    C('TTT', '台東縣', 'east', { price: 20.95, priceNew: 29.10, rent: [7000, 11000, 15000, 17000], rentEst: true, mgmt: 40, pir: 8.15, cons: 21412, minLiving: 15515, park: 1000, parkBuy: 90, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 299, small: 23 }),
    C('PEN', '澎湖縣', 'islands', { price: 19.44, priceNew: 22.4, priceEst: true, rent: [7500, 11000, 15000, 17000], rentEst: true, mgmt: 30, pir: 8.05, cons: 20971, minLiving: 15515, park: 800, parkBuy: 80, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 300, small: 23 }),
    C('KIN', '金門縣', 'islands', { price: 24.64, priceNew: 26.0, priceEst: true, rent: [5500, 10000, 14000, 16000], rentEst: true, mgmt: 30, pir: 8.38, cons: 21000, consEst: true, minLiving: 15173, park: 800, parkBuy: 80, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 300, small: 23 }),
    C('LIE', '連江縣', 'islands', { price: 24.0, priceNew: 26.0, priceEst: true, rent: [5500, 10000, 14000, 16000], rentEst: true, mgmt: 30, pir: 8.4, cons: 21000, consEst: true, minLiving: 15173, park: 500, parkBuy: 80, parkBuyEst: true, rsb: 3200, cap: 2000, tpass: 300, small: 23 })
  ];
  var COUNTY = {};
  COUNTIES.forEach(function (c) { COUNTY[c.id] = c; });

  // 區域：房價乘數（樂居行政區均價 / 全市均價）
  var DISTRICTS = {
    TPE: [{ id: 'core', name: '精華區', ex: '大安、信義、中山、松山', m: 1.25 }, { id: 'mid', name: '一般地區', ex: '內湖、士林、中正、南港', m: 1.0 }, { id: 'outer', name: '外圍地區', ex: '文山、北投、萬華', m: 0.86 }],
    NTPC: [{ id: 'core', name: '蛋黃區', ex: '永和、板橋、中和、新店', m: 1.25 }, { id: 'mid', name: '蛋白區', ex: '新莊、三重、蘆洲、林口、汐止', m: 1.0 }, { id: 'outer', name: '外圍地區', ex: '淡水、三峽、樹林、八里', m: 0.7 }],
    TYN: [{ id: 'core', name: '市中心', ex: '桃園區、中壢區', m: 1.1 }, { id: 'mid', name: '一般地區', ex: '八德、蘆竹、龜山', m: 0.92 }, { id: 'outer', name: '外圍地區', ex: '楊梅、大溪、觀音', m: 0.78 }],
    TXG: [{ id: 'core', name: '七期與西屯南屯', ex: '西屯、南屯、北屯', m: 1.25 }, { id: 'mid', name: '一般地區', ex: '北區、西區、南區', m: 1.0 }, { id: 'outer', name: '外圍地區', ex: '太平、大里、烏日', m: 0.82 }],
    TNN: [{ id: 'core', name: '市中心', ex: '東區、中西區、北區', m: 1.2 }, { id: 'mid', name: '一般地區', ex: '永康、安南、仁德', m: 0.95 }, { id: 'outer', name: '外圍地區', ex: '新營、佳里、麻豆', m: 0.75 }],
    KHH: [{ id: 'core', name: '市中心', ex: '鼓山、左營、苓雅', m: 1.2 }, { id: 'mid', name: '一般地區', ex: '三民、前鎮、楠梓', m: 1.0 }, { id: 'outer', name: '外圍地區', ex: '鳳山、岡山、大寮', m: 0.87 }],
    HSQ: [{ id: 'core', name: '竹北', ex: '竹北市', m: 1.23 }, { id: 'outer', name: '其他鄉鎮', ex: '竹東、湖口、新豐', m: 0.8 }]
  };

  // 0–2歲托育行情（補助前，元/月）與縣市加碼
  var CARE = {
    publicFee:  { TPE: 11000, NTPC: 9000, TYN: 9000, TXG: 8500, TNN: 10000, KHH: 9000, _: 9000 },
    quasiFee:   { TPE: 22200, NTPC: 21000, TYN: 20000, TXG: 17500, TNN: 17500, KHH: 17500, HSZ: 19500, HSQ: 19500, _: 16500 },
    privateFee: { TPE: 22500, NTPC: 21500, TYN: 22000, TXG: 17500, TNN: 20500, KHH: 15500, _: 17000 },
    topQuasi:   { TPE: 8000, NTPC: 2500, TYN: 1500, TXG: 1400, HSZ: 2000, _: 0 },
    topPublic:  { TPE: 2500, _: 0 },
    allow02Top: { HSZ: 1000, _: 0 },
    tpeQuasiSiblingFree: true
  };
  // 幼兒園（2–6歲）一般私立與雙語行情（元/月）
  var KG = {
    privateFee:   { TPE: 18000, NTPC: 18000, HSZ: 15000, HSQ: 15000, TYN: 15000, _: 12500 },
    bilingualFee: { TPE: 32000, NTPC: 32000, HSZ: 26000, HSQ: 26000, TYN: 26000, TXG: 26000, _: 22000 },
    extras: 1500
  };
  var ANQIN = { TPE: 11000, NTPC: 9000, TYN: 9000, HSZ: 9000, HSQ: 9000, _: 8000 };
  var POSTPARTUM_CENTER = { TPE: 300000, NTPC: 300000, HSZ: 220000, HSQ: 220000, TYN: 220000, TXG: 220000, _: 180000 };
  function byCounty(tbl, id) { return tbl[id] != null ? tbl[id] : tbl._; }

  // ---------- 所得 ----------
  // 全體受僱者全年總薪資十分位（113年，含獎金），以中位數為 1 的比值
  var WAGE = {
    median: 546000,
    q: [[1, 0.42], [5, 0.53], [10, 0.6044], [20, 0.6978], [30, 0.7912], [40, 0.8919], [50, 1], [60, 1.1502], [70, 1.3791], [80, 1.7564], [90, 2.4469]],
    paretoAlpha: 2.8,      // 以官方平均數 73.2 萬校正的尾端
    ageSpread: 0.85,       // 同年齡層內的差距較全體小（估計）
    toBase: 1.08,          // 113年（2024）薪資 → 2026 年水準（114年 +3.9%、115年 1–7月 +4.2%）
    // 年齡（全體受僱者中位數 / 全體中位數）
    age: [[22, 0.698], [27, 0.954], [34.5, 1.064], [44.5, 1.136], [57, 1.06], [66, 0.804]],
    growth: 0.01
  };
  // 產業（中位數為 113 年全年總薪資，跨年齡）；k=產業內離散度相對全體；bonus=年終月數
  var INDUSTRIES = [
    { id: 'all', name: '不分產業（全體受僱者）', median: 546000, k: 1, bonus: 1.7 },
    { id: 'fin', name: '金融及保險業', median: 1106000, k: 0.85, bonus: 3.65 },
    { id: 'semi', name: '電子零組件製造（半導體等）', median: 876000, k: 0.85, bonus: 2.97 },
    { id: 'comp', name: '電腦、電子及光學產品製造', median: 899000, k: 0.85, bonus: 3.54 },
    { id: 'ict', name: '資訊通訊、軟體、出版影音', median: 807000, k: 0.85, bonus: 2.0 },
    { id: 'power', name: '電力及燃氣供應業', median: 1091000, k: 0.6, bonus: 3.0 },
    { id: 'prof', name: '專業、科學及技術服務（法律、會計、設計、顧問）', median: 700000, k: 0.85, bonus: 1.8, est: true },
    { id: 'health', name: '醫療保健及社會工作（醫院、診所、照護）', median: 680000, k: 0.9, bonus: 1.7, est: true },
    { id: 'transport', name: '運輸及倉儲業', median: 666000, k: 0.8, bonus: 1.86, est: true },
    { id: 'mfg', name: '製造業（整體）', median: 570000, k: 0.85, bonus: 2.2 },
    { id: 'realestate', name: '不動產業', median: 582000, k: 0.9, bonus: 1.8, est: true },
    { id: 'retail', name: '批發及零售業', median: 549000, k: 0.85, bonus: 1.5, est: true },
    { id: 'construction', name: '營建工程業', median: 522000, k: 0.8, bonus: 1.79, est: true },
    { id: 'water', name: '用水供應及污染整治業', median: 505000, k: 0.75, bonus: 1.5 },
    { id: 'arts', name: '藝術、娛樂及休閒服務業', median: 436000, k: 0.85, bonus: 1.0, est: true },
    { id: 'support', name: '支援服務業（保全、清潔、派遣、旅行社）', median: 415000, k: 0.8, bonus: 1.0, est: true },
    { id: 'food', name: '住宿及餐飲業', median: 415000, k: 0.8, bonus: 0.8 },
    { id: 'edu', name: '教育服務業（補習班等，不含公立學校）', median: 382000, k: 0.85, bonus: 0.8 },
    { id: 'other', name: '其他服務業（美容、維修、宗教團體等）', median: 381000, k: 0.85, bonus: 0.8 },
    { id: 'civil', name: '公務人員', median: 820000, k: 0.4, bonus: 1.5, est: true, base2026: true },
    { id: 'teacher', name: '公立學校教師', median: 860000, k: 0.35, bonus: 1.5, est: true, base2026: true },
    { id: 'none', name: '目前沒有工作／全職照顧家庭', median: 0, k: 0, bonus: 0 }
  ];
  var INDUSTRY = {};
  INDUSTRIES.forEach(function (x) {
    if (!x.base2026) x.median = Math.round(x.median * WAGE.toBase / 1000) * 1000; // 換算成 2026 年薪資水準
    INDUSTRY[x.id] = x;
  });
  WAGE.median2024 = WAGE.median; WAGE.median = Math.round(WAGE.median * WAGE.toBase / 1000) * 1000;

  // 家庭可支配所得與消費支出（114年，五等分位平均數，視為第10/30/50/70/90百分位）
  // 同齡平均存款（每人，元）：主計總處家庭收支調查各年齡的平均儲蓄，從 22 歲開始累積、不計投資報酬的推估（老喬報整理）。
  // 官方沒有各年齡的存款餘額統計；這是平均數、且官方的「儲蓄」含還貸款與投資，偏樂觀。只用於「標準門檻」。
  var SAVINGS_TYPICAL = [[22, 0], [25, 280000], [30, 750000], [35, 1380000], [40, 1930000], [45, 2600000], [50, 3230000], [55, 3860000], [60, 4640000], [65, 5420000]];

  var HOUSEHOLD = {
    // 114 年（2025）資料；載入時換算成 2026 年水準（可支配所得 ×1.04、消費 ×1.03）
    disposable: [[10, 397191], [30, 726390], [50, 1043274], [70, 1435638], [90, 2449344]],
    dispMedian: 1018000, dispMean: 1210000,
    consumption: [[10, 397000], [30, 668000], [50, 876000], [70, 1120000], [90, 1555000]], consEst: true, // 各分位消費為估計值
    consMean: 920000
  };

  // ---------- 稅與社會保險（115年度所得，實質固定） ----------
  var TAX = {
    exempt: 101000, exemptMinor: 151500,
    std: { single: 136000, married: 272000 },
    salarySpecial: 227000,
    preschool: [150000, 225000], // 6歲以下：第1名 / 第2名起
    rent: 180000,
    mortgageCap: 300000,
    insurancePerPerson: 24000,
    basicLiving: 213000, // 115年度尚未公告，暫用114年度
    brackets: [[610000, 0.05, 0], [1380000, 0.12, 42700], [2770000, 0.20, 153100], [5190000, 0.30, 430100], [Infinity, 0.40, 949100]]
  };
  var SI = {
    laborRate: 0.13 * 0.2, laborMin: 29500, laborMax: 45800,
    nhiRate: 0.0517 * 0.3, nhiMin: 29500, nhiMax: 313000, nhiMaxDeps: 3
  };

  // ---------- 補助（2026 現行） ----------
  var BENEFIT = {
    birthPerBaby: 100000,
    allowance02: [5000, 6000, 7000],   // 0–未滿2歲，未使用公共/準公共托育
    carePublic: [7000, 8000, 9000],    // 公共托育補助
    careQuasi: [13000, 14000, 15000],  // 準公共托育補助
    allowance26: [5000, 6000, 7000],   // 2–6歲未就讀公立/非營利/準公共
    kgCap: { public: [1000, 0, 0], nonprofit: [2000, 1000, 0], quasi: [3000, 2000, 1000] },
    leaveRate: 0.8, leaveInsMax: 45800, leaveMonths: 6,
    privUniReduction: 35000,
    growthAllowance: 60000 // 0–18歲成長津貼（尚未通過，預設不計入）
  };
  var RENT_SUB = { incomeMultiple: 3.5, incomeMultipleBase: 3, oldMult: [1, 1.4, 1.6, 1.8], newMultBase: 2, newMultStep: 0.5 };
  var QINGAN = {
    ltv: 0.8, years: 40, grace: 5,
    capNoKid: 10000000, capKid: 15000000,
    incomeMax: 2000000, ageMax: 50,
    rates: [0.01775, 0.01775, 0.01775, 0.019, 0.02025, 0.0215, 0.02275]
  };
  var BANK = { ltv: 0.8, years: 30, rate: 0.025 };

  // ---------- 生活與養育成本（2026 幣值） ----------
  var COST = {
    adultBase: 14000,                 // 全國一般水準：每位大人每月日常開銷（飲食、通訊、衣物、保險醫療、娛樂；不含住、行、孝親）
    consExp: 0.75,                    // 縣市物價差異：（縣市每人消費／全國）^0.75
    rentListingFactor: 0.9,           // 591 刊登價 → 實際成交租金
    consNational: 25726,
    lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
    childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
    // 孩子每月生活費（飲食、衣物、用品、醫療、零用錢；不含托育與教育）
    child: [[0, 7000], [2, 6000], [6, 7500], [12, 10000], [18, 11000]],
    utilBase: 2000, utilPerPerson: 700,
    prenatalBirth: { frugal: 25000, normal: 45000, comfy: 120000 },
    gearFirst: { frugal: 20000, normal: 50000, comfy: 100000 }, gearLater: 15000,
    postpartumNanny: 110000, postpartumFamily: 15000,
    elementaryPublic: 4000, juniorPublic: 5000, seniorPublic: 10000,
    elementaryPrivate: 250000, juniorPrivate: 200000, seniorPrivate: 50000,
    intlSchool: 450000,
    hobbyClass: 3000,
    cram: { junior: { none: 0, some: 6000, full: 13000 }, senior: { none: 0, some: 7000, full: 15000 } },
    uni: { public: 51000, private: 99200 - 35000, mixed: 57600 },
    master: 50000,
    abroad: { US: { years: 2, perYear: 1700000 }, UK: { years: 1, perYear: 1300000 }, JP: { years: 2, perYear: 400000 } },
    grandPaid: 11000, helper: 31000,
    car: {
      used: { buy: 350000, resale: 0.2, life: 8, run: 78000 },
      new: { buy: 850000, resale: 0.3, life: 10, run: 80000 },
      import: { buy: 1500000, resale: 0.35, life: 10, run: 100000 }
    },
    scooter: { buy: 70000, resale: 0.1, life: 8, run: 8767 },
    travel: { none: 0, domestic: 30000, abroadPerPerson: 30000 },
    elderCareMonthly: 15000,
    pension: 300000,          // 65 歲後每人每年：勞保年金＋勞退約 2.5 萬/月（估計）
    carInstallYears: 5,       // 購車 5 年分期
    uniAwayRent: 8000,
    houseSize: { 1: 18, 3: 34, 4: 44 }, // 2房依縣市 small
    reno: { basic: 20000, light: 50000, full: 80000 },
    closing: 0.025,
    houseTax: { TPE: 18000, _: 10000 },
    homeInsurance: 3000,
    usedFactor: 0.92
  };

  // ---------- 歷史（時光機） ----------
  // 時光機：每 5 年一格，往回 30 年（一代人）
  // 房價：信義房價指數年平均（2016Q1=100）；1996 年為依信義 1995 年每坪均價推估。
  // 薪資：工業及服務業每人每月總薪資（實質，2021 年幣值）。物價：消費者物價指數（2021=100）。
  var HISTORY = {
    years: [1996, 2001, 2006, 2011, 2016, 2021, 2026],
    est: { 1996: true },
    cpi: { 1996: 78.72, 2001: 81.92, 2006: 85.26, 2011: 91.21, 2016: 95.86, 2021: 100, 2026: 111.7 },
    realWage: { 1996: 46564, 2001: 51211, 2006: 51011, 2011: 50393, 2016: 51384, 2021: 56127, 2026: 59180 },
    sinyi: {
      TPE: { 1996: 37, 2001: 35.42, 2006: 53.73, 2011: 90.68, 2016: 100.29, 2021: 115.79, 2026: 143.34 },
      NTPC: { 1996: 42, 2001: 34.25, 2006: 50.38, 2011: 79.95, 2016: 101.78, 2021: 120.03, 2026: 159.90 },
      TYN: { 1996: 52, 2001: 36.73, 2006: 50.77, 2011: 76.84, 2016: 101.23, 2021: 131.34, 2026: 188.00 },
      HSZ: { 1996: 52, 2001: 47.43, 2006: 58.18, 2011: 77.63, 2016: 101.47, 2021: 148.09, 2026: 247.62 },
      TXG: { 1996: 50, 2001: 35.20, 2006: 50.57, 2011: 78.94, 2016: 102.58, 2021: 140.06, 2026: 184.95 },
      KHH: { 1996: 58, 2001: 38.87, 2006: 49.26, 2011: 66.85, 2016: 100.48, 2021: 125.95, 2026: 170.11 },
      ALL: { 1996: 46, 2001: 35.79, 2006: 51.06, 2011: 80.84, 2016: 101.20, 2021: 124.75, 2026: 168.15 }
    },
    sinyiMap: { TPE: 'TPE', NTPC: 'NTPC', KEE: 'NTPC', TYN: 'TYN', HSZ: 'HSZ', HSQ: 'HSZ', TXG: 'TXG', KHH: 'KHH' },
    tfr: { 1996: 1.76, 2001: 1.40, 2006: 1.115, 2011: 1.065, 2016: 1.17, 2021: 0.975, 2026: 0.695 },
    births: { 1996: 325545, 2001: 260354, 2006: 204459, 2011: 196627, 2016: 208440, 2021: 153820, 2026: 107812 },
    pir: { 1996: 4.5, 2001: 4.26, 2006: 4.97, 2011: 7.29, 2016: 9.32, 2021: 9.46, 2026: 9.47 },
    pirEst: { 1996: true, 2001: '2002' },
    // 30 年前還沒有的育兒支持（起始年）
    newPolicies: [
      ['育嬰留職停薪津貼', 2009], ['托育費用補助', 2008], ['0–2 歲育兒津貼', 2012], ['5 歲幼兒免學費', 2011],
      ['準公共托育與幼兒園繳費上限', 2018], ['2–5 歲育兒津貼', 2019], ['高中職全面免學費', 2024], ['生育補助每胎 10 萬', 2026]
    ]
  };

  HOUSEHOLD.disposable = HOUSEHOLD.disposable.map(function (p) { return [p[0], Math.round(p[1] * 1.04)]; });
  HOUSEHOLD.consumption = HOUSEHOLD.consumption.map(function (p) { return [p[0], Math.round(p[1] * 1.03)]; });
  return {
    SOURCES: SOURCES, COUNTIES: COUNTIES, COUNTY: COUNTY, DISTRICTS: DISTRICTS,
    CARE: CARE, KG: KG, ANQIN: ANQIN, POSTPARTUM_CENTER: POSTPARTUM_CENTER,
    byCounty: byCounty, WAGE: WAGE, INDUSTRIES: INDUSTRIES, INDUSTRY: INDUSTRY, HOUSEHOLD: HOUSEHOLD, SAVINGS_TYPICAL: SAVINGS_TYPICAL,
    TAX: TAX, SI: SI, BENEFIT: BENEFIT, RENT_SUB: RENT_SUB, QINGAN: QINGAN, BANK: BANK, COST: COST, HISTORY: HISTORY,
    BASE_YEAR: 2026
  };
})();
if (typeof module !== 'undefined') module.exports = DATA;
