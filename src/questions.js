/* =========================================================================
   QUESTIONS — 試算題目（依目前設定動態產生參考價）
   ========================================================================= */
var QS = (function () {
  'use strict';
  var D = DATA, E = ENGINE, C = D.COST;
  function county(s) { return D.COUNTY[s.county]; }
  function districtName(s) { var dl = D.DISTRICTS[s.county]; if (!dl) return ''; var d = dl.filter(function (x) { return x.id === s.district; })[0]; return d ? d.name : ''; }
  function placeName(s) { return county(s).name + (districtName(s) ? '・' + districtName(s) : ''); }
  function maxRooms(s) {
    var n = s.kids;
    var r = s.room === 'own' ? 1 + n : 1 + Math.ceil(n / 2);
    return Math.max(2, Math.min(4, r));
  }
  function roomName(r) { return ['', '1房', '2房', '3房', '4房'][r]; }
  function rentRef(s, rooms) { var c = county(s); return E.rentFor(c, rooms, Math.pow(E.districtMult(s), 0.6)); }
  function priceRef(s, rooms, build) {
    var c = county(s), size = E.houseSize(c, rooms);
    var ppp = (build === 'new' ? c.priceNew : c.price * C.usedFactor) * E.districtMult(s);
    return { size: size, ppp: ppp, price: ppp * size * 10000 };
  }
  function m(n) { return U.monthly(Math.round(n / 100) * 100); }
  function careNet(s, kind) {
    var id = s.county;
    if (kind === 'quasi') return Math.max(0, D.byCounty(D.CARE.quasiFee, id) - D.BENEFIT.careQuasi[0] - D.byCounty(D.CARE.topQuasi, id)) + 1000;
    if (kind === 'public') return Math.max(0, D.byCounty(D.CARE.publicFee, id) - D.BENEFIT.carePublic[0] - D.byCounty(D.CARE.topPublic, id)) + 1000;
    if (kind === 'private') return D.byCounty(D.CARE.privateFee, id) + 1000;
    return 0;
  }
  function adultMonthly(s, ls) { var c = county(s); return C.adultBase * Math.pow(c.cons / C.consNational, C.consExp) * C.lifestyle[ls]; }

  var PARTS = { 1: { name: '起點', full: '第一部分　起點' }, 2: { name: '養育標準', full: '第二部分　你心中的養育標準' }, 3: { name: '家庭收入', full: '第三部分　家庭收入' } };

  var LIST = [
    { id: 'country', part: 1, type: 'globe', title: '你在哪個國家養孩子？', hint: '拖曳轉動地球，點選你所在的國家。第一版開放台灣，其他國家的資料正在建置。' },
    { id: 'county', part: 1, type: 'county', title: function (s) { return (s.partner ? '你們' : '你') + '住在哪個縣市？'; }, hint: '房價、租金、物價和縣市補助都不一樣。點地圖或從清單選擇。' },
    {
      id: 'family', part: 1, key: 'partner', title: '誰會一起養這個孩子？',
      options: [
        { v: true, label: '我和伴侶', sub: '雙薪或單薪都可以，收入最後再填' },
        { v: false, label: '只有我', sub: '單親家庭' }
      ]
    },
    { id: 'ages', part: 1, type: 'ages', title: function (s) { return s.partner ? '你們現在幾歲？' : '你現在幾歲？'; }, hint: '年齡會影響薪資成長、買房貸款資格，以及孩子獨立時你幾歲。' },
    { id: 'plan', part: 1, type: 'plan', title: '你的生育計畫是？', hint: '第一胎出生時你幾歲、打算生幾個，以及每胎間隔幾年。' },

    {
      id: 'room', part: 2, key: 'room', title: '孩子需要自己的房間嗎？', hint: '這決定了家裡需要幾房。',
      options: [
        { v: 'own', label: '每個孩子都要有自己的房間', sub: '3 歲起分房' },
        { v: 'share', label: '兄弟姊妹可以睡同一間', sub: '3 歲起和手足同房' },
        { v: 'parents', label: '小時候跟爸媽睡就好', sub: '6 歲前和父母同房，之後手足同房' }
      ],
      note: function (s) { return '以這個標準，孩子最多的時候家裡需要<b>' + roomName(maxRooms(s)) + '</b>。孩子還小、或長大搬出去時，房間需求會跟著變。'; }
    },
    {
      id: 'housing', part: 2, key: 'housing', title: '你希望孩子在什麼樣的家長大？',
      options: [
        { v: 'rent', label: '租房子', sub: '房間不夠時換租大一點的', ref: function (s) { var r = maxRooms(s); return roomName(r) + ' 月租約 <b>' + U.wan1(rentRef(s, r)) + '</b>'; } },
        { v: 'buy', label: '買自己的房子', sub: '頭期款、房貸、裝潢、管理費', ref: function (s) { var r = maxRooms(s), p = priceRef(s, r, s.build); return roomName(r) + ' ' + p.size + ' 坪 約 <b>' + U.wan(p.price) + '</b>'; } },
        { v: 'family', label: '住長輩的房子', sub: '不用付房租或房貸', ref: function () { return '<b>0 元</b>'; } }
      ],
      note: function (s) {
        var c = county(s);
        if (s.housing === 'buy') return placeName(s) + '近一年大樓與華廈成交均價每坪約 <b>' + (c.price * E.districtMult(s)).toFixed(1) + ' 萬</b>，房價所得比 ' + c.pir + ' 倍（' + (c.pir > 9 ? '負擔能力過低' : c.pir > 7 ? '負擔能力略低' : '負擔能力尚可') + '）。';
        if (s.housing === 'rent') return '租金以 591 刊登中位數的九成估算。租屋家庭多半可申請中央租金補貼，有 6 歲以下孩子時補貼加倍，最多補到房租全額。';
        return '住長輩的房子省下最大一筆開銷。很多家庭會另外貼補家用，可以在最後的孝親費一起算。';
      }
    },
    {
      id: 'buy', part: 2, type: 'multi', when: function (s) { return s.housing === 'buy'; }, title: '買房的細節', hint: '頭期款以房價兩成計算，另加約 2.5% 的仲介、代書、稅費與裝潢費。',
      fields: [
        { key: 'buyWhen', title: '什麼時候買？', options: [{ v: 'now', label: '現在就買' }, { v: 'beforeKid', label: '第一胎出生前一年' }, { v: 'beforeSchool', label: '老大上小學前' }] },
        { key: 'build', title: '買新的還是中古的？', options: [{ v: 'used', label: '中古屋', sub: function (s) { return '每坪約 ' + priceRef(s, 2, 'used').ppp.toFixed(1) + ' 萬'; } }, { v: 'new', label: '新成屋或預售屋', sub: function (s) { return '每坪約 ' + priceRef(s, 2, 'new').ppp.toFixed(1) + ' 萬'; } }] },
        { key: 'loan', title: '房貸怎麼貸？', options: [{ v: 'qingan', label: '新青安', sub: '40 年，前 5 年只繳利息' }, { v: 'qinganNoGrace', label: '新青安，不用寬限期', sub: '40 年，第一年就還本金' }, { v: 'bank', label: '一般房貸', sub: '30 年，利率約 2.5%' }] },
        { key: 'reno', title: '裝潢預算？', options: [{ v: 'basic', label: '簡單整理', sub: '每坪約 2 萬' }, { v: 'light', label: '輕裝修', sub: '每坪約 5 萬' }, { v: 'full', label: '完整裝潢', sub: '每坪約 8 萬' }] }
      ],
      note: function (s) {
        var r = E.simulate(s), h = r.house; if (!h) return '';
        var t = '房子 <b>' + U.wan(h.price) + '</b>' + (h.parking ? '＋車位 ' + U.wan(h.parking) : '') + '，' + (2026 + h.tb) + ' 年買入。頭期款與裝潢等一次要拿出 <b>' + U.wan(h.down + h.closing + h.reno) + '</b>。';
        if (h.wantQ) t += h.qOK ? '可用新青安貸 <b>' + U.wan(h.qLoan) + '</b>' + (h.bLoan > 1 ? '，其餘 ' + U.wan(h.bLoan) + ' 用一般房貸' : '') + '。' : '<br>不符合新青安：' + h.qReason + '，改用一般房貸。';
        if (h.wantQ) t += '<br><span class="xs">新青安的所得與年齡資格，會在填完收入後重新判斷。</span>';
        return t;
      }
    },
    {
      id: 'postpartum', part: 2, key: 'postpartum', title: '生產後怎麼坐月子？',
      options: [
        { v: 'center', label: '住月子中心', sub: '28 天', ref: function (s) { return '約 <b>' + U.wan(D.byCounty(D.POSTPARTUM_CENTER, s.county)) + '</b>'; } },
        { v: 'nanny', label: '請月嫂到家裡', sub: '28 天', ref: function () { return '約 <b>11 萬</b>'; } },
        { v: 'family', label: '家人幫忙照顧', sub: '伙食與用品', ref: function () { return '約 <b>1.5 萬</b>'; } }
      ],
      note: function () { return '產檢自費項目、生產自付額與嬰兒用品另計，第一胎一般約 9–10 萬。每胎可領生育補助 <b>10 萬元</b>（2026 年起）。'; }
    },
    {
      id: 'care', part: 2, key: 'care', title: '孩子 0 到 2 歲，白天誰來照顧？',
      options: [
        { v: 'quasi', label: '準公共保母或托嬰中心', sub: '和政府簽約、收費有上限，補助直接折抵', ref: function (s) { return '自付約 <b>' + m(careNet(s, 'quasi')) + '</b>'; } },
        { v: 'public', label: '公共托育', sub: '公托、社區公共托育家園；名額少，多半要抽籤', ref: function (s) { return '自付約 <b>' + m(careNet(s, 'public')) + '</b>'; } },
        { v: 'private', label: '一般私立托嬰或保母', sub: '沒有收費上限，可另領育兒津貼 5,000 元', ref: function (s) { return '約 <b>' + m(careNet(s, 'private')) + '</b>'; } },
        { v: 'grandPaid', label: '長輩幫忙帶，每月給帶孫費', sub: '可領育兒津貼 5,000 元', ref: function () { return '約 <b>1.1 萬/月</b>'; } },
        { v: 'grandFree', label: '長輩幫忙帶，不用給錢', sub: '可領育兒津貼 5,000 元', ref: function () { return '<b>0 元</b>'; } },
        { v: 'helper', label: '請外籍家庭幫傭', sub: '2026 年 4 月起，家有 12 歲以下孩子即可申請', ref: function () { return '約 <b>3.1 萬/月</b>'; } },
        { v: 'quit', label: '其中一人辭職，在家自己帶', sub: '少一份薪水，也少了年資', ref: function () { return '<b>少一份收入</b>'; }, when: function (s) { return s.partner; } }
      ],
      subs: [
        { key: 'quitWho', when: function (s) { return s.care === 'quit'; }, title: '誰辭職？', options: [{ v: 'A', label: '我' }, { v: 'B', label: '伴侶' }] },
        { key: 'quitUntil', when: function (s) { return s.care === 'quit'; }, title: '什麼時候回到職場？', options: [{ v: 'preschool', label: '最小的孩子 2 歲上幼兒園' }, { v: 'school', label: '最小的孩子上小學' }, { v: 'never', label: '不回職場' }] }
      ],
      note: function (s) {
        if (s.care === 'quit') return '回到職場時，薪資會從離開時的水準重新累積。主計總處調查：因生育離職的女性，平均離開職場超過 5 年，約一半沒有再回去。';
        return '照顧期間扣掉育嬰留停的月份。托育補助：公共托育每月 7,000 元起、準公共 13,000 元起，第二胎起再加碼' + (D.byCounty(D.CARE.topQuasi, s.county) ? '；' + county(s).name + '另有加碼' : '') + '。';
      }
    },
    {
      id: 'leave', part: 2, key: 'leave', title: '會請育嬰留職停薪嗎？', hint: '津貼是投保薪資的 8 成，每位家長、每個孩子最多 6 個月，每月最多 36,640 元。',
      options: [
        { v: 'none', label: '不請，產假後就回去上班' },
        { v: 'A', label: '我請 6 個月', when: function (s) { return !(s.care === 'quit' && s.quitWho === 'A'); } },
        { v: 'B', label: '伴侶請 6 個月', when: function (s) { return s.partner && !(s.care === 'quit' && s.quitWho === 'B'); } },
        { v: 'both', label: '兩人各請 6 個月', sub: '孩子在家帶到 1 歲', when: function (s) { return s.partner && s.care !== 'quit'; } }
      ],
      when: function (s) { return !(s.care === 'quit' && !s.partner); }
    },
    {
      id: 'preschool', part: 2, key: 'preschool', title: '2 到 6 歲，讀哪種幼兒園？',
      options: [
        { v: 'public', label: '公立或非營利幼兒園', sub: '每月最多繳 1,000–2,000 元，但名額有限、要抽籤', ref: function () { return '約 <b>2,500–3,500 元/月</b>'; } },
        { v: 'quasi', label: '準公共幼兒園', sub: '和政府簽約的私立園所，第一胎每月最多繳 3,000 元', ref: function () { return '約 <b>4,500 元/月</b>'; } },
        { v: 'private', label: '一般私立幼兒園', sub: '可領每月 5,000 元育兒津貼或就學補助', ref: function (s) { return '約 <b>' + m(D.byCounty(D.KG.privateFee, s.county) + D.KG.extras) + '</b>'; } },
        { v: 'bilingual', label: '雙語或全美語幼兒園', sub: '同樣可領每月 5,000 元', ref: function (s) { return '約 <b>' + m(D.byCounty(D.KG.bilingualFee, s.county) + D.KG.extras) + '</b>'; } },
        { v: 'home', label: '在家帶到上小學', sub: '可領每月 5,000 元', when: function (s) { return s.care === 'quit' && s.quitUntil !== 'preschool'; } }
      ],
      note: function () { return '另含餐點、活動等雜支每月約 1,500 元。'; }
    },
    {
      id: 'school', part: 2, key: 'school', title: '國小到高中，讀公立還是私立？',
      options: [
        { v: 'public', label: '全程讀公立', sub: '多數縣市 2026 學年起國中小午餐免費；高中職免學費', ref: function () { return '<b>每年數千元</b>'; } },
        { v: 'privateJH', label: '國小公立，國中起讀私立', sub: '私立高中免學費，但雜費較高', ref: function () { return '私中約 <b>20 萬/年</b>'; } },
        { v: 'private', label: '全程讀私立', ref: function () { return '私小約 <b>25 萬/年</b>'; } },
        { v: 'intl', label: '雙語或國際學校', ref: function () { return '約 <b>45 萬/年</b>'; } }
      ]
    },
    {
      id: 'after', part: 2, key: 'after', title: '國小放學後，要上安親班或才藝班嗎？',
      options: [
        { v: 'none', label: '不上，下課自己帶' },
        { v: 'anqin', label: '上安親班', ref: function (s) { return '約 <b>' + m(D.byCounty(D.ANQIN, s.county)) + '</b>'; } },
        { v: 'anqin1', label: '安親班＋1 項才藝', sub: '例如游泳、鋼琴、美術、程式', ref: function (s) { return '約 <b>' + m(D.byCounty(D.ANQIN, s.county) + 3000) + '</b>'; } },
        { v: 'anqin3', label: '安親班＋3 項才藝', ref: function (s) { return '約 <b>' + m(D.byCounty(D.ANQIN, s.county) + 9000) + '</b>'; } }
      ],
      note: function (s) { return (s.school === 'private' || s.school === 'intl') ? '讀私立或國際學校時，課後照顧多半由學校安排，這裡只計才藝班。' : '才藝班每項以每月 3,000 元估算。'; }
    },
    {
      id: 'cram', part: 2, key: 'cram', title: '國中、高中要補習嗎？',
      options: [
        { v: 'none', label: '不補習' },
        { v: 'some', label: '補 1 到 2 科', ref: function () { return '約 <b>6,000–7,000 元/月</b>'; } },
        { v: 'full', label: '全科補習', ref: function () { return '約 <b>1.3–1.5 萬/月</b>'; } }
      ]
    },
    {
      id: 'uni', part: 2, type: 'multi', title: '大學呢？', hint: '私立大學學費每年減免 3.5 萬元（2024 年起，不分家庭收入）。',
      fields: [
        { key: 'uni', title: '讀公立還是私立？', options: [{ v: 'public', label: '公立大學', sub: '學雜費約 5.1 萬/年' }, { v: 'private', label: '私立大學', sub: '減免後約 6.4 萬/年' }, { v: 'mixed', label: '看考試結果', sub: '以公私立各半估算' }] },
        { key: 'uniAway', title: '住哪裡？', options: [{ v: false, label: '住家裡通勤' }, { v: true, label: '到外地讀書', sub: '宿舍或租屋約 8,000/月' }] }
      ]
    },
    {
      id: 'support', part: 2, key: 'support', title: '你打算供養孩子到什麼時候？',
      options: [
        { v: '18', label: '高中畢業，18 歲' },
        { v: '22', label: '大學畢業，22 歲' },
        { v: '24', label: '研究所畢業，24 歲', ref: function () { return '學費約 <b>5 萬/年</b>'; } },
        { v: 'JP', label: '大學後到日本讀碩士 2 年', ref: function () { return '約 <b>40 萬/年</b>'; } },
        { v: 'UK', label: '大學後到英國讀碩士 1 年', ref: function () { return '約 <b>130 萬</b>'; } },
        { v: 'US', label: '大學後到美國讀碩士 2 年', ref: function () { return '約 <b>170 萬/年</b>'; } }
      ],
      note: function () { return '留學費用包含學費與當地生活費。'; }
    },
    {
      id: 'transport', part: 2, key: 'transport', title: '家裡的代步工具？',
      options: [
        { v: 'transit', label: '搭大眾運輸', ref: function (s) { return '月票 <b>' + U.sep(county(s).tpass) + ' 元</b>/人'; } },
        { v: 'scooter', label: '騎機車', ref: function () { return '每台約 <b>1.7 萬/年</b>'; } },
        { v: 'used', label: '二手車', sub: '約 35 萬，每 8 年換一次', ref: function (s) { return '另加每年約 <b>' + U.wan(78000 + county(s).park * 12) + '</b>'; } },
        { v: 'new', label: '國產新車', sub: '約 85 萬，每 10 年換一次', ref: function (s) { return '另加每年約 <b>' + U.wan(80000 + county(s).park * 12) + '</b>'; } },
        { v: 'import', label: '進口休旅車', sub: '約 150 萬，每 10 年換一次', ref: function (s) { return '另加每年約 <b>' + U.wan(100000 + county(s).park * 12) + '</b>'; } }
      ],
      subs: [
        { key: 'parking', when: function (s) { return s.housing === 'buy' && ['used', 'new', 'import'].indexOf(s.transport) >= 0; }, title: '買房時要一起買車位嗎？', options: [{ v: 'buy', label: '一起買車位', sub: function (s) { return '平面車位約 ' + U.wan(county(s).parkBuy * 10000); } }, { v: 'rent', label: '不買，每月租車位', sub: function (s) { return '約 ' + U.sep(county(s).park) + ' 元/月'; } }] }
      ],
      note: function (s) { return ['used', 'new', 'import'].indexOf(s.transport) >= 0 ? '第一胎出生那年買車，車款以 5 年分期攤付。每年另計保險、油錢、牌照稅、燃料費、保養，以及租車位每月約 ' + U.sep(county(s).park) + ' 元' + (s.housing === 'buy' ? '（若買房時一起買車位就不用租）' : '') + '。' : ''; }
    },
    {
      id: 'lifestyle', part: 2, key: 'lifestyle', title: '日常生活想過到什麼程度？', hint: '大人的日常開銷含飲食、通訊、衣物、保險醫療、娛樂；不含房子、交通與孝親費。',
      options: [
        { v: 'frugal', label: '精打細算', sub: '多自己煮，少買東西', ref: function (s) { return '大人 <b>' + m(adultMonthly(s, 'frugal')) + '</b>'; } },
        { v: 'normal', label: '一般', sub: '和多數家庭差不多', ref: function (s) { return '大人 <b>' + m(adultMonthly(s, 'normal')) + '</b>'; } },
        { v: 'comfy', label: '寬裕一點', sub: '常外食，偶爾犒賞自己', ref: function (s) { return '大人 <b>' + m(adultMonthly(s, 'comfy')) + '</b>'; } }
      ],
      note: function (s) { var k = C.childLife[s.lifestyle]; return '孩子的生活費（飲食、衣物、用品、醫療、零用錢）依年齡約每月 <b>' + U.sep(6000 * k) + '–' + U.sep(11000 * k) + ' 元</b>，0–2 歲含奶粉尿布約 ' + U.sep(7000 * k) + ' 元。' + county(s).name + '的物價係數依主計總處各縣市每人消費支出換算。'; }
    },
    {
      id: 'travel', part: 2, key: 'travel', title: '家庭旅遊呢？',
      options: [
        { v: 'none', label: '不特別安排' },
        { v: 'domestic', label: '每年國內小旅行', ref: function () { return '約 <b>3 萬/年</b>'; } },
        { v: 'abroad', label: '每年出國一次', ref: function () { return '每人約 <b>3 萬/年</b>'; } }
      ]
    },
    { id: 'elder', part: 2, type: 'elder', title: function (s) { return s.partner ? '每個月給雙方父母多少孝親費？' : '每個月給父母多少孝親費？'; }, hint: function (s) { return '2021 年調查：上班族平均每人每月給 8,742 元。' + (s.partner ? '這裡填夫妻合計，' : '') + '計算到你約 60 歲。'; } },

    {
      id: 'mode', part: 3, key: 'incomeMode', title: function (s) { return s.partner ? '要填你們的收入嗎？' : '要填你的收入嗎？'; }, hint: '兩種都可以，報告裡也能隨時切換。',
      options: [
        { v: 'threshold', label: '先不填，告訴我收入要多少才夠', sub: '算出「收入至少要在 PR 多少」才養得起' },
        { v: 'full', label: '填寫收入，直接告訴我答案', sub: '選產業，再輸入年薪或收入 PR' }
      ]
    },
    { id: 'jobA', part: 3, type: 'job', who: 'A', title: function (s) { return s.incomeMode === 'full' ? '你的工作與收入' : '你在哪個產業工作？'; } },
    { id: 'jobB', part: 3, type: 'job', who: 'B', when: function (s) { return s.partner; }, title: function (s) { return s.incomeMode === 'full' ? '伴侶的工作與收入' : '伴侶在哪個產業工作？'; } },
    { id: 'money', part: 3, type: 'money', title: '目前的存款，以及長輩的資助', hint: '存款以每年 1% 的實質報酬計算；不夠用時，以每年 3% 的成本借款。' }
  ];

  function visible(s) { return LIST.filter(function (q) { return !q.when || q.when(s); }); }
  function optVisible(o, s) { return !o.when || o.when(s); }
  function title(q, s) { return typeof q.title === 'function' ? q.title(s) : q.title; }
  function hint(q, s) { return typeof q.hint === 'function' ? q.hint(s) : q.hint; }

  // 選項的中文標籤（報告設定面板用）
  function labelOf(key, v) {
    for (var i = 0; i < LIST.length; i++) {
      var q = LIST[i];
      if (q.key === key && q.options) { for (var j = 0; j < q.options.length; j++) if (q.options[j].v === v) return q.options[j].label; }
      if (q.fields) for (var f = 0; f < q.fields.length; f++) if (q.fields[f].key === key) { var fo = q.fields[f].options; for (var k = 0; k < fo.length; k++) if (fo[k].v === v) return fo[k].label; }
      if (q.subs) for (var g = 0; g < q.subs.length; g++) if (q.subs[g].key === key) { var so = q.subs[g].options; for (var l = 0; l < so.length; l++) if (so[l].v === v) return so[l].label; }
    }
    return String(v);
  }
  function optionsOf(key) {
    for (var i = 0; i < LIST.length; i++) {
      var q = LIST[i];
      if (q.key === key && q.options) return q.options;
      if (q.fields) for (var f = 0; f < q.fields.length; f++) if (q.fields[f].key === key) return q.fields[f].options;
      if (q.subs) for (var g = 0; g < q.subs.length; g++) if (q.subs[g].key === key) return q.subs[g].options;
    }
    return null;
  }

  // 台灣福利一覽（第一題選擇國家後顯示）
  var WELFARE = [
    { tag: 'cash', t: '現金', name: '生育補助', top: true, amt: '每胎 10 萬元（2026 年起，勞保、國保給付不足 10 萬者補足）', src: 'birth' },
    { tag: 'cash', t: '現金', name: '縣市生育獎勵', amt: '例：台北、新北每胎 4–5 萬；桃園 3–5 萬；高雄 3 萬', src: 'cityBirth' },
    { tag: 'cash', t: '現金', name: '育嬰留職停薪津貼', top: true, amt: '投保薪資 8 成，每人每胎最多 6 個月（每月最多 36,640 元）', src: 'leave' },
    { tag: 'cash', t: '現金', name: '0–2 歲育兒津貼', top: true, amt: '每月 5,000／6,000／7,000 元（第 1／2／3 胎起），未使用公共或準公共托育者', src: 'allowance' },
    { tag: 'fee', t: '折抵', name: '0–2 歲托育補助', top: true, amt: '公共托育每月 7,000–9,000 元；準公共 13,000–15,000 元', src: 'family' },
    { tag: 'fee', t: '折抵', name: '幼兒園繳費上限', top: true, amt: '公立每月 1,000 元、非營利 2,000 元、準公共 3,000 元（第 2 胎起更低）', src: 'kgFee' },
    { tag: 'cash', t: '現金', name: '2–6 歲育兒津貼與就學補助', amt: '讀一般私幼或在家照顧，每月 5,000–7,000 元', src: 'preschool' },
    { tag: 'fee', t: '減免', name: '高中職免學費、私大學費減免', amt: '高中職全面免學費；私立大學每年減免 3.5 萬元', src: 'uniFee' },
    { tag: 'tax', t: '稅', name: '子女免稅額與幼兒學前扣除額', amt: '未成年子女免稅額 15.15 萬（2026 年所得起）；6 歲以下每名扣除 15–22.5 萬', src: 'tax115' },
    { tag: 'cash', t: '現金', name: '租金補貼（婚育加碼）', amt: '有新生兒加碼 2 倍起，每多一名再加 0.5 倍', src: 'rentSub' },
    { tag: 'loan', t: '貸款', name: '新青安 3.0', amt: '有子女最高貸 1,500 萬、40 年、寬限期 5 年；前 3 年利率約 1.775%', src: 'qingan' },
    { tag: 'pending', t: '審議中', name: '0–18 歲成長津貼', amt: '每月 5,000 元，預計 2027 年起，尚待立法院通過預算（預設不計入）', src: 'growthAllow' }
  ];

  return { LIST: LIST, PARTS: PARTS, visible: visible, optVisible: optVisible, title: title, hint: hint, labelOf: labelOf, optionsOf: optionsOf, WELFARE: WELFARE, maxRooms: maxRooms, roomName: roomName, rentRef: rentRef, priceRef: priceRef, careNet: careNet, adultMonthly: adultMonthly, placeName: placeName, districtName: districtName };
})();
