/* 你有資格生下一代嗎？各國資料（由 build/build.js 產生） */
/* ---- world.js ---- */
/* =========================================================================
   WORLD — 跨國比較（第二波）
   把玩家在台灣填的答案「搬到」其他國家：選項換成當地最接近的做法，
   收入換成「當地同年齡受僱者中的 PR」，再用同一個引擎算門檻。
   國家模組：src/country-jp.js、country-kr.js、country-fr.js、country-cn.js
   ========================================================================= */
var WORLD = (function (E, D) {
  'use strict';
  var U = E.util, TW = E.country('TW');

  // 存款、長輩資助、孝親費等「玩家自己填的金額」：以兩地薪資中位數的比例換算（同樣的相對負擔）
  function wageFactor(K) { return K.id === 'TW' ? 1 : K.W.median / D.WAGE.median; }

  // ---------- 國家模組的共用設定 ----------
  // 其他國家沒有產業別資料：只有「全體」與「沒有工作」
  function setupCountry(K) {
    // 十分位從 P5 或 P10 開始的國家：以前兩點的斜率往下延伸到 P1、P5，
    // 否則最低的那一段薪資都一樣，門檻會被誤判成「PR 1」
    var q = K.W.q;
    if (q[0][0] > 1 && q.length > 1) {
      var sl = (Math.log(q[1][1]) - Math.log(q[0][1])) / (q[1][0] - q[0][0]);
      [5, 1].forEach(function (p) {
        if (q[0][0] > p) q.unshift([p, Math.max(0.05, q[0][1] * Math.exp(-sl * (q[0][0] - p)))]);
      });
    }
    K.IND = K.IND || {};
    if (!K.IND.all) K.IND.all = { id: 'all', name: '全體受僱者', median: K.W.median, k: 1, bonus: K.W.bonus || 1 };
    if (!K.IND.none) K.IND.none = { id: 'none', name: '沒有工作', median: 0, k: 0, bonus: 0 };
    K.cities = Object.keys(K.CITY);
    K.city = K.city || function (s) { return K.CITY[s.city] || K.CITY[K.cities[0]]; };
    K.districtMult = K.districtMult || function (s) { return s.dm || 1; };
    var norm = K.normalize;
    K.normalize = function (s) {
      if (!K.CITY[s.city]) s.city = K.cities[0];
      s.dm = U.clamp(+s.dm || 1, 0.5, 2);
      if (norm) norm(s);
    };
    K.kid = K.kid || function (x, k, a) { stdKid(x, k, a); };
    K.housePlan = K.housePlan || stdHousePlan;
    K.loans = K.loans || stdLoans;
    K.wageFactor = wageFactor(K);
    if (K.prep) K.prep(K);
    return E.addCountry(K);
  }

  /* ---------- 每個孩子每年的標準流程（台灣以外的國家共用） ----------
     國家模組提供：
       BANDS（可省略）：{ care: 3, es: 6, jh: 12, sh: 15, uni: 18 }
       birth(x, k) → { cost, grant, local }        出生當年：自付花費、全國現金給付、地方現金給付
       allowance(x, k, a) → 每年現金津貼（和送托與否無關的部分）
       care(x, cs, k, a, careMonths) → { fee, sub, cash }   0 到 care 歲：每年自付、補助（只統計）、在家照顧的現金
       preschool(x, ps, k, a) → { fee, kg, cash }          幼兒園：每年自付、補助（只統計）、現金
       school(x, level, k, a) → 每年學費＋課後照顧＋才藝＋補習（level: es / jh / sh）
       uni(x, k, a) → { fee, sub }                          大學：每年學費（已扣減免）、減免（只統計）
     其餘（生活費、碩士與出國）由這裡處理。 */
  function stdKid(x, k, a) {
    var K = x.K, s = x.s, C = x.C, e = x.e, tr = x.tr, t = x.t, ev = x.events;
    var B = K.BANDS || { care: K.careEnd || 3, es: 6, jh: 12, sh: 15, uni: 18 };
    if (a === 0) {
      ev.push({ k: 'birth', n: k + 1 });
      var b = K.birth(x, k);
      e.kidsBirth += b.cost || 0; tr.birth += b.grant || 0; tr.cityBirth += b.local || 0;
    }
    var abroad = a >= 22 && (s.support === 'US' || s.support === 'UK' || s.support === 'JP');
    if (!abroad) e.kidsLife += U.stepVal(C.child, a) * x.chK * 12;
    if (K.allowance) tr.allowance += K.allowance(x, k, a);
    if (a < B.care) {
      var homeMonths = 0;
      if (x.quit && t >= x.quitStart && t < x.quitEnd) homeMonths = 12;
      else if (a === 0) homeMonths = Math.min(12, x.lmA + x.lmB);
      var careMonths = 12 - homeMonths;
      var cs = x.quit ? 'quasi' : s.care;
      var r = K.care(x, cs, k, a, careMonths, homeMonths);
      e.kidsCare += r.fee || 0; tr.care += r.sub || 0; tr.allowance += r.cash || 0;
    } else if (a < B.es) {
      var ps = s.preschool;
      if (ps === 'home' && !(x.quit && t < x.quitEnd)) ps = 'quasi';
      var p = K.preschool(x, ps, k, a);
      e.kidsEdu += p.fee || 0; tr.kg += p.kg || 0; tr.allowance += p.cash || 0;
      if (a === B.care) ev.push({ k: 'kg', n: k + 1 });
    } else if (a < B.jh) {
      if (a === B.es) ev.push({ k: 'es', n: k + 1 });
      e.kidsEdu += K.school(x, 'es', k, a);
    } else if (a < B.sh) {
      if (a === B.jh) ev.push({ k: 'jh', n: k + 1 });
      e.kidsEdu += K.school(x, 'jh', k, a);
    } else if (a < B.uni) {
      if (a === B.sh) ev.push({ k: 'sh', n: k + 1 });
      e.kidsEdu += K.school(x, 'sh', k, a);
    } else if (a < 22) {
      if (a === B.uni) ev.push({ k: 'uni', n: k + 1 });
      var u = K.uni(x, k, a);
      e.kidsEdu += u.fee || 0; tr.uni += u.sub || 0;
      if (s.uniAway) e.kidsEdu += C.uniAwayRent * 12;
    } else {
      if (s.support === '24') { if (a === 22) ev.push({ k: 'master', n: k + 1 }); e.kidsEdu += C.master; }
      else if (C.abroad[s.support]) { if (a === 22) ev.push({ k: 'abroad', n: k + 1 }); e.kidsEdu += C.abroad[s.support].perYear; }
    }
  }

  /* ---------- 買房（台灣以外共用） ----------
     國家模組提供：
       COST.houseSize[房間數]（㎡）、COST.reno[等級]（每 ㎡）、COST.closing{ used, new }（占房價比例）、COST.homeInsurance（每年）
       城市：price / priceNew（每 ㎡）、priceRooms{房數: 每 ㎡}（可省略）、mgmt（每 ㎡ 每月）、propTax（占房價比例，每年）、parkBuy（可省略）
       loanPlan(x, total) → { parts: [{ amt, rate 或 rates, years, grace, label }], note }  */
  function stdHousePlan(x) {
    var s = x.s, K = x.K, C = x.C, c = x.c, tb = x.tb, rooms = x.roomsFinal;
    var size = C.houseSize[rooms];
    // priceRooms：某些房數另有每 ㎡ 價格（例如 4 房是獨立屋，比公寓貴）；新成屋照同樣比例加價
    var pr = c.priceRooms && c.priceRooms[rooms];
    var ppsm = (s.build === 'new' ? (pr ? Math.max(c.priceNew, pr * c.priceNew / c.price) : c.priceNew) : (pr || c.price)) * x.dm;
    var price = ppsm * size;
    var parking = x.hasCar && s.parking === 'buy' ? (c.parkBuy || 0) : 0;
    var total = price + parking;
    var lp = K.loanPlan(x, total);
    var loanAmt = 0; lp.parts.forEach(function (l) { loanAmt += l.amt; });
    return {
      tb: tb, rooms: rooms, size: size, pricePerSqm: ppsm, price: price, parking: parking, total: total,
      down: total - loanAmt, closing: total * (C.closing[s.build] || C.closing.used), reno: size * (C.reno[s.reno] || C.reno.light),
      loanAmt: loanAmt, parts: lp.parts, note: lp.note || '', nomAtTb: Math.pow(1 + x.infl, tb),
      mgmt: (c.mgmt || 0) * size * 12, tax: total * (c.propTax || 0), ins: C.homeInsurance || 0
    };
  }
  function stdLoans(h) {
    return h.parts.filter(function (l) { return l.amt > 0; }).map(function (l) {
      return { bal: l.amt * h.nomAtTb, rates: l.rates, rate: l.rate, years: l.years, grace: l.grace || 0 };
    });
  }
  // 依級距累進（[上限, 稅率, 累進差額]）
  function progressive(n, B) { return U.bracketTax(n, B); }

  // ---------- 把台灣的答案搬到某個國家 ----------
  function localize(raw, cid, cityId) {
    var tw = E.normalize(raw);
    var K = E.country(cid);
    var ls = E.clone(tw); delete ls.__norm;
    ls.country = K.id;
    if (K.id !== 'TW') {
      ls.city = cityId || K.cities[0]; ls.dm = TW.districtMult(tw);
      // 台灣進階設定裡的「租金補貼」「待審津貼」只代表台灣的政策，其他國家照當地現行制度算
      ls.adv.rentSubsidy = true; ls.adv.pending = false;
    }
    else if (cityId) ls.county = cityId;
    // 收入：換成「同年齡、不分產業」的 PR，再放到當地的分布
    ['jobA', 'jobB'].forEach(function (k) {
      var jb = tw[k], age = k === 'jobA' ? tw.ageA : tw.ageB;
      var ind = D.INDUSTRY[jb.industry];
      if (!ind.median || (jb.mode === 'salary' && !(jb.salary > 0))) { ls[k] = { industry: 'none', pr: 50 }; return; }
      var pr = (jb.industry === 'all' && jb.mode !== 'salary') ? jb.pr : E.prFromSalary('all', age, E.grossAt(jb, age));
      ls[k] = { industry: 'all', pr: pr };
    });
    var f = wageFactor(K);
    ['savings', 'giftOnce', 'giftMonthly', 'elder', 'travelCost', 'extraMonthly', 'debtBal'].forEach(function (k) { ls[k] = Math.round((+tw[k] || 0) * f); });
    if (K.localize) K.localize(ls, tw);
    return E.normalize(ls);
  }

  // ---------- 比較 ----------
  // 門檻 PR 以「當地同年齡受僱者」計；同時算出在門檻收入下的花費結構（用來解釋差在哪裡）
  var CAT = {
    housing: function (t) { return t.housing + t.housingOnce; },
    kids: function (t) { return t.kidsBirth + t.kidsCare + t.kidsEdu + t.kidsLife; },
    living: function (t) { return t.living + t.travel + t.elder + (t.other || 0); },
    transport: function (t) { return t.transport; }
  };
  function breakdown(r) {
    var o = {}, tt = r.totals;
    Object.keys(CAT).forEach(function (k) { o[k] = CAT[k](tt); });
    var tax = 0, si = 0, gross = 0, cash = 0, fund = 0;
    for (var i = 0; i <= r.Tv && i < r.years.length; i++) { var y = r.years[i]; tax += y.tax; si += y.si; gross += y.gross; cash += y.transfers - y.tr.pension - (y.tr.fund || 0); fund += y.tr.fund || 0; }
    o.tax = tax; o.si = si; o.gross = gross; o.cash = cash; o.fund = fund; o.years = Math.min(r.Tv + 1, r.years.length);
    return o;
  }
  function row(raw, cid, cityId, opts) {
    var K = E.country(cid);
    var ls = localize(raw, cid, cityId);
    var th = E.threshold(ls, { quick: true });
    var o = { cid: K.id, city: K.id === 'TW' ? ls.county : ls.city, cur: K.cur, fx: K.fx, s: ls, pr: th.pr, who: th.who,
      salaryA: th.salaryA, salaryB: th.salaryB, overall: th.overall, grossBirth: th.grossBirth };
    o.name = K.id === 'TW' ? D.COUNTY[ls.county].name : K.CITY[ls.city].name;
    // 門檻年薪是同年齡全體受僱者中位數的幾倍（各國統計口徑不同時，比 PR 更好比較）
    var ageW = th.who === 'B' ? ls.ageB : ls.ageA, salW = th.who === 'B' ? th.salaryB : th.salaryA;
    o.ratio = salW ? salW / (K.W.median * E.ageFactor(ageW, K)) : null;
    o.country = K.name;
    // 在門檻收入下（找不到門檻就用 PR 99.9）的花費結構
    var p = th.pr != null ? th.pr : 99.9;
    var sim = E.atPR(ls, p);
    o.at = breakdown(sim);
    // 收入剛好夠時，從現在到最小的孩子獨立，現金存款增加多少（不畫進長條，另外用文字說明）
    var yT = sim.years[sim.Tv] || sim.years[sim.years.length - 1];
    // 韓國全稅：押金是自己的錢（會退回），算在存下來的錢裡
    o.at.saved = yT.S + (yT.deposit || 0) - sim.years[0].Sstart; o.at.endAge = ls.ageA + sim.Tv; o.at.deposit = yT.deposit || 0;
    // 門檻卡在買房那年（存款最低點在買房當年或之前）：記下要一次拿出多少現金
    var hs = sim.house;
    if (ls.housing === 'buy' && hs && th.pr != null && sim.minT <= hs.tb) {
      var loan = hs.loanAmt != null ? hs.loanAmt : (hs.qLoan || 0) + (hs.bLoan || 0);
      o.bind = { age: ls.ageA + hs.tb, cash: hs.down + hs.closing + hs.reno, down: hs.down, fees: hs.closing + hs.reno, price: hs.total, loan: loan, beforeKid: hs.tb < sim.t0 };
      var yPrev = hs.tb > 0 ? sim.years[hs.tb - 1] : null;
      if (yPrev && yPrev.deposit) o.bind.refund = yPrev.deposit; // 租屋押金退回，可以拿來付一部分
    }
    // 已知收入：直接看能不能過
    if (ls.incomeMode === 'full') { var r = E.simulate(ls); o.verdict = r.verdict; o.minS = r.minS; o.prA = ls.jobA.pr; o.prB = ls.jobB.pr; }
    return o;
  }
  function compare(raw, opts) {
    opts = opts || {};
    var tw = E.normalize(raw);
    var rows = [row(tw, 'TW', tw.county, opts)];
    E.countries().forEach(function (cid) {
      if (cid === 'TW') return;
      if (opts.only && opts.only.indexOf(cid) < 0) return;
      E.country(cid).cities.forEach(function (cy) { rows.push(row(tw, cid, cy, opts)); });
    });
    return rows;
  }

  return { wageFactor: wageFactor, setupCountry: setupCountry, stdKid: stdKid, stdLoans: stdLoans, stdHousePlan: stdHousePlan, progressive: progressive, localize: localize, compare: compare, breakdown: breakdown, row: row };
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-jp.js ---- */
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
      // 2026-10 統一各國定義為「全職受僱者、年薪含獎金」：改用賃金構造基本統計調査的一般労働者（全職）。
      // 2025 全職平均所定內 340.6 千円 ÷ 平均／中位數 1.139 ≈ 中位數 299 千円；年薪 ＝ 299 ×（12 × きまって／所定內 1.088 ＋ 獎金 2.89 個月）
      // ≈ 477 萬（2025）× 2026 約 1.035 ≈ 494 萬［DERIVED／ESTIMATE］（原本用國稅廳含兼職的全體受僱者 435 萬）
      median: 4940000,
      // 十分位：2019 全職所定內的男女十分位以 0.652 加權合成（重現男女平均誤差約 1%）［DERIVED］；最低工資上調後 P10 可能更高［ESTIMATE］
      q: [[10, 0.644], [20, 0.740], [25, 0.783], [50, 1], [75, 1.338], [90, 1.786], [95, 2.133]],
      paretoAlpha: 3.0,
      ageSpread: 0.85,
      // 年齡：2019 全職各年齡中位數（男女合成）÷ 全體中位數［DERIVED］；60 歲以後（再雇用）沿用原本形狀換算［ESTIMATE］
      age: [[22, 0.771], [27, 0.878], [32, 0.968], [37, 1.049], [42, 1.119], [47, 1.190], [52, 1.244], [57, 1.229], [62, 0.86], [67, 0.67]],
      bonus: 2.6 // 全職獎金約為所定內的 2.89 個月、きまって支給的約 2.65 個月（2024）［DERIVED］
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
        // 中古大樓每 ㎡：近畿レインズ 2026-07 成交，中心 6 區平均 5,826 萬／56.25㎡ ≈ 104 萬（192 件）、其他 18 區 2,935 萬（233 件，
        // 面積未公布，以約 62㎡ 推約 47 萬）§14.4［OFFICIAL＋DERIVED］；依成交件數加權的全市平均約 71 萬
        //（東京用 23 區全體平均，大阪也用全市平均；2026-10 核對：原本 60 萬偏低約 15%）［DERIVED］
        price: 710000,
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
      juniorPublic: 186000, juniorPrivate: 1137000, // 公立國中：學校費用 150,747＋營養午餐 35,667（文科省 2023；2026 年的午餐補助只到國小）［OFFICIAL，2026-10 核對］
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

/* ---- country-kr.js ---- */
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

/* ---- country-fr.js ---- */
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
      // 2026-10 統一各國定義為「全職（或全職等值）受僱者、含獎金」：EQTP 就是全職等值，不再 × 0.97
      median: 35000,
      // 十分位：淨額比例直接當毛額比例（PASS 以下提撥幾乎是比例制）§2.2［DERIVED］；
      // P5 約為最低工資（2024 淨 1,398 ÷ 2,190）、P1 是學徒（最低工資的 27–100%）［ESTIMATE］
      // 2026-10 統一為全職等值：P10、P20 直接用 INSEE EQTP 的 D1、D2 ÷ 中位數（0.681、0.762），不再往下修；
      // P5 約為全職最低工資（淨 1,398 ÷ 2,190 ≈ 0.64 再略低）、P1 是學徒［ESTIMATE］
      q: [[1, 0.40], [5, 0.62], [10, 0.681], [20, 0.762], [30, 0.832], [40, 0.910], [50, 1], [60, 1.115], [70, 1.272], [80, 1.509], [90, 1.979], [95, 2.554]],
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
      // 2026-10 核對：27,592 是調查原始數字（不含稅、房貸還款、設算租金），和台灣及美加紐以的算法一致；
      // INSEE IP 1749 的 33,970 是對齊國民所得帳後放大的數字，不能混用。住房比例 16.3%、每戶 2.2 人都已確認［OFFICIAL］
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

/* ---- country-cn.js ---- */
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
      '官方不公布薪資中位數，薪資分布為估計：全國城鎮受僱者中位數約 7.4 萬（2026）。上海受僱者薪資約為全國的 1.5 倍，成都約與全國相當，但 PR 一律以全國分布計算。',
      '住房公積金：自己繳的 7% 存進自己的帳戶，雇主再提撥 7%；用來付房租、房貸與頭期款時，視為可用的錢。'
    ],

    // ---------- 薪資（全國城鎮受僱者，全年總薪資含年終）§2 ----------
    W: {
      // 官方只公布平均工資，沒有中位數或十分位 §2.1、§12.1。
      // 研究建議 2025 全國城鎮受僱者中位數約 7.5 萬（介於私營平均 71,590 與規上企業平均 106,080 之間）§2.4［ESTIMATE］
      // × 2025→2026 約 1.03 §2.5［ESTIMATE］≈ 77,000。
      // 2026-10 核對：四川官方 2025 企業從業人員中位數 6.5 萬（成都平原 6.98 萬）、川渝 63,693，
      // 依西部÷全國薪資比 0.85–0.89 推全國約 7.3–7.6 萬；企業調查不含小微與非正式受僱，實際應再低一點 → 2025 約 7.2 萬 × 1.03 ≈ 74,000［DERIVED／ESTIMATE］
      median: 74000,
      // 形狀：全國人均可支配收入五等分（÷中位數 0.28／0.63／0.98／1.53／2.86，換成百分位約 P10 0.29、P30 0.63、P70 1.53、P90 2.46）§2.3，
      // 但那包含城鄉差距與沒有工作的人，比城鎮受僱者寬。往內收窄：
      // 底部以最低工資為界（上海 2,740／月 = 中位數 0.43；三四線約 1,900／月 = 0.30）§2.2；
      // 中段對照（平均數 ×1.03 落在的 PR）：農民工 60,900（約 P38）、私營 71,590（約 P48）、非私營 129,441（約 P81）；
      // 頂部：規上企業專業人員 155,491（約 P87）、管理人員 210,016（約 P94）§2.1。
      // 整體平均約為中位數的 1.27 倍，與非私營、私營兩者的就業加權平均相近［DERIVED／ESTIMATE］
      // 2026-10 核對：深圳官方 2024 全行業工資指導價位 P10／P50／P75／P90 ＝ 55,200／96,100／154,213／249,800，P90 是中位數的 2.6 倍；
      // 全國的分散程度至少和單一城市一樣，P90 改 2.6、P95 改 3.4（原 2.30、2.95）［OFFICIAL＋DERIVED］
      q: [[5, 0.34], [10, 0.42], [20, 0.56], [30, 0.69], [40, 0.84], [50, 1], [60, 1.17], [70, 1.38], [80, 1.85], [90, 2.60], [95, 3.40]],
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
        wageRel: 0.95,  // 成都受僱者中位數 ÷ 全國：成都平原官方中位數 69,800（2025）約與全國估計相當或略低［OFFICIAL＋ESTIMATE，2026-10 核對］（只做說明，不參與計算）
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

/* ---- country-us.js ---- */
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
  var RATE = 0.074;     // 30 年固定房貸利率（Freddie Mac PMMS 2026-10-08、10-15 都是 7.40%；9 月初 6.71%）§4.4［OFFICIAL］

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
        // 和台灣縣市同一種算法（含住房的每人消費 ÷ 全國，再取 0.75 次方）；扣掉個人保險與退休提撥後是 1.17，差不多
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
      // 美國：2024 CE 每戶支出 78,535 −住房與水電 21,053 −健保保費 4,055（另外計算）
      // −個人保險與退休提撥 9,797（社安稅與退休金，不是消費；台灣的消費支出也不含）＝ 43,630 ÷ 2.4 人 × 0.716 ÷ 12
      // ≈ 1,085（2024）× 物價 1.056 ≈ 1,145［DERIVED］§5.1（2026-10 核對：原本沒扣退休提撥，高估約 19%）
      adultBase: 1145, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      // 孩子每月生活費：沿用台灣「孩子／大人」的比例（0.50／0.43／0.54／0.71／0.79）× 美國的大人開銷［ESTIMATE］
      child: [[0, 573], [2, 492], [6, 618], [12, 813], [18, 905]],
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
      var saltCap = Math.max(10000, 40400 - 0.3 * Math.max(0, agi - 505000)); // 2026：上限 40,400、門檻 505,000（每年 +1%）
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

/* ---- country-uk.js ---- */
/* =========================================================================
   英國模組（倫敦、曼徹斯特；英格蘭的制度）。金額為英鎊、2026 年水準。
   來源與可信度見 research/countries/uk.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：國民保健（生產免費）、雙薪家庭 9 個月大起每週 30 小時免費托育、兒童福利金（高所得逐步收回）、
   低收入的 Universal Credit、大學學費由學生貸款支付。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 42.27; // 1 英鎊 = 42.27 台幣（2026-10-12 收盤）§1［SECONDARY］
  var RATE = 0.060; // 5 年固定房貸平均利率 6.00%（Moneyfacts，2026-10-05）§4.4［NEWS］

  var K = {
    id: 'UK', name: '英國', cur: 'GBP', curName: '英鎊', flag: '🇬🇧',
    fx: { toTWD: FX, pppToTWD: 20.0, date: '2026-10-12' }, // PPP：英國約 0.68、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ONS 2025 年薪資調查（ASHE）', 'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025'],
      ['ONS 私人租金與房價（2026-09 發布）', 'https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/september2026'],
      ['ONS 家庭支出（2024/25）', 'https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/april2024tomarch2025'],
      ['Coram 2026 托育費用調查', 'https://www.coram.org.uk/wp-content/uploads/2026/03/Childcare-Survey-2026.pdf'],
      ['兒童福利金 2026/27', 'https://salarytax.uk/news/child-benefit-rates-2026-27-uprating'],
      ['Universal Credit 2026/27 費率', 'https://uktax.tools/universal-credit-rates/'],
      ['法定產假給付 2026/27', 'https://cintra.co.uk/blog/parental-pay-rates-26-27/'],
      ['Moneyfacts 房貸利率（2026-10）', 'https://www.itv.com/news/2026-10-05/mortgage-misery-as-average-five-year-deal-hits-6-for-first-time-in-three-years'],
      ['曼徹斯特各房數租金（ONS，2026-04）', 'https://housecheckup.co.uk/average-rent/manchester']
    ],
    notes: [
      '用英格蘭的制度（倫敦、曼徹斯特都在英格蘭）。',
      '雙薪家庭（每人年收入約 1 萬到 10 萬英鎊）的孩子 9 個月大起每週 30 小時免費托育（每年 38 週）；另有托育費 20% 的政府補貼。',
      '大學學費（每年 9,790 英鎊）由孩子自己的學生貸款支付、畢業後依收入償還；這裡只算父母補貼的生活費。',
      '兒童福利金算在「政府給的錢」；收入較高的一方超過 6 萬英鎊開始收回，8 萬全部收回。',
      '職場退休金（員工自付 5%）算在社保。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 全職受僱者年薪中位數 39,039（2025 年 4 月，在職滿一年）［OFFICIAL］× 2026 年約 1.045 ≈ 40,800［DERIVED］
      median: 40800,
      // 十分位：P10 以全職最低工資（2026/27 為 12.71 × 37.5 小時 × 52 ≈ 24,785）約為中位數 0.61［DERIVED］；
      // P75、P90、P95：全職年薪 54,009、76,903、99,387（ASHE 2025 Table 1.7a）÷ 中位數 ＝ 1.38、1.97、2.55［OFFICIAL，2026-10 核對：原本 P90 1.84 偏低］
      q: [[10, 0.61], [20, 0.72], [25, 0.765], [30, 0.81], [40, 0.90], [50, 1], [60, 1.11], [70, 1.27], [75, 1.38], [80, 1.55], [90, 1.97], [95, 2.55]],
      paretoAlpha: 2.4,
      ageSpread: 0.85,
      // 年齡：全職各年齡層中位數（22–29 歲 32,347、30–39 歲 40,668、40–49 歲 44,244、50–59 歲 41,866、60 歲以上 36,467；
      // ASHE 2025 Table 6.7a）÷ 全體中位數［OFFICIAL，2026-10 核對：原本用平均數推，高 1–4%］§2
      age: [[22, 0.70], [25.5, 0.83], [34.5, 1.04], [44.5, 1.13], [54.5, 1.07], [63, 0.93]],
      bonus: 0.5
    },
    CHECK_SALARIES: [24000, 32000, 40800, 60000, 90000, 130000],

    // ---------- 城市 ----------
    CITY: {
      london: {
        id: 'london', name: '倫敦', short: '倫敦', capital: true,
        cons: 1.15, // 每人消費：倫敦約為全英 1.15 倍（家庭支出調查，倫敦戶均支出較高、戶人數相近）［ESTIMATE］§5.2
        // ONS 私人租金：倫敦平均 2,332（2026-08）［OFFICIAL］；各房數依倫敦比例推估，再加新簽約約 5%［DERIVED／ESTIMATE］§4.1
        rent: [1950, 2400, 2900, 3800], rentAdj: 1.0,
        councilD: 2150, // 市政稅 D 級（含大倫敦市政府）2026/27 平均［ESTIMATE］§4.3
        lha: [1250, 1550, 1850, 2350], // Universal Credit 房租上限（外倫敦）［ESTIMATE］
        price: 6800,    // 每 ㎡：倫敦平均房價 56.9 萬（2026-07）［OFFICIAL］，外圍地區約每 ㎡ 6,000–7,500［ESTIMATE］§4.2
        priceNew: 8500,
        size: { 1: 50, 2: 70, 3: 90, 4: 120 }, // 1–2 房公寓、3–4 房連棟住宅［ESTIMATE］
        mgmt: 2.5,      // 公寓服務費與修繕（每 ㎡ 每月，平均）［ESTIMATE］
        homeIns: 400,
        park: 50, tpass: 200, // 居民停車證；倫敦交通（1–4 區按次扣款上限）［ESTIMATE］
        nurseryU2: 216.94, nursery2: 213.99, // 外倫敦托兒所，每週 25 小時，非免費時段的價格（2026）［OFFICIAL：Coram］§6.2
        nannyShare: 25000, wrap: 3500,
        preschoolBilingual: 18000,
        schoolPublic: { es: 500, jh: 900, sh: 900 }, privateFees: { es: 24000, jh: 28000, sh: 29000 }, intl: 32000, // 私校含 20% 加值稅［ESTIMATE］
        afterSchool: 415, hobby: 60, cram: { none: 0, some: 150, full: 400 },
        doula: 2000, maternityNurse: 2600
      },
      manchester: {
        id: 'manchester', name: '曼徹斯特', short: '曼徹斯特', capital: false,
        cons: 0.92, // 西北區每人消費略低於全英［ESTIMATE］§5.2
        // ONS 私人租金（2026-04）：1 房 987、2 房 1,213、3 房 1,406、4 房以上 1,986［OFFICIAL］，加到 8 月與新簽約約 7%［DERIVED］
        rent: [1060, 1300, 1500, 2100], rentAdj: 1.0,
        councilD: 2420, lha: [725, 850, 995, 1350],
        price: 3300, priceNew: 4000, // 每 ㎡［ESTIMATE］
        size: { 1: 50, 2: 70, 3: 90, 4: 120 },
        mgmt: 1.2, homeIns: 350,
        park: 20, tpass: 80, // Bee Network 公車與輕軌［ESTIMATE］
        nurseryU2: 178.01, nursery2: 158.01, // 西北區［OFFICIAL：Coram］
        nannyShare: 18000, wrap: 2800,
        preschoolBilingual: 12000,
        schoolPublic: { es: 450, jh: 800, sh: 800 }, privateFees: { es: 15000, jh: 17500, sh: 18000 }, intl: 22000,
        afterSchool: 360, hobby: 45, cram: { none: 0, some: 130, full: 350 },
        doula: 1500, maternityNurse: 2200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：「每人消費支出（不含住房與水電）× 0.716」。英國：2024/25 每戶每週支出 676.60
      // −住房與水電 118.40 −房貸利息與市政稅約 70［ESTIMATE］＝ 488 ÷ 2.36 人 × 52 × 0.716 ÷ 12 ≈ 642 × 物價 1.04 ≈ 670［DERIVED］§5.1
      adultBase: 670, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 335], [2, 288], [6, 362], [12, 476], [18, 529]], // 台灣「孩子／大人」比例 × 英國大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 50, // 能源價格上限、水費、網路［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      uniAwayRent: 300,   // 外地讀書：生活費大多由學生的生活費貸款支付，父母補貼［ESTIMATE］
      master: 12000,      // 碩士學費（國內）［ESTIMATE］
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 22000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.25, life: 8, run: 2600 },
        new: { buy: 28000, resale: 0.35, life: 10, run: 2900 },
        import: { buy: 45000, resale: 0.4, life: 10, run: 3600 }
      },
      scooter: { buy: 2500, resale: 0.2, life: 8, run: 500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 12500, // 新制國家年金 2026/27 每週 241.30［NEWS］
      houseSize: { 1: 50, 2: 70, 3: 90, 4: 120 },
      reno: { basic: 30, light: 120, full: 500 },
      closing: { used: 0.02, new: 0.02 }, homeInsurance: 400, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 英格蘭：4 歲入學（Reception），11 歲上中學，16–17 歲讀第六學級（sixth form）
    BANDS: { care: 3, es: 4, jh: 11, sh: 16, uni: 18 },
    leaveMonths: 9, // 法定產假給付 39 週

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) {
      ls.loan = 'bank';
      if (ls.transport === 'scooter') ls.transport = 'transit';
      if (ls.care === 'helper') ls.care = 'private'; // 脫歐後沒有互惠生簽證，改用共用保母
      if (ls.leave === 'both') ls.leave = 'B';       // 夫妻共用 39 週法定給付：算成一人請 9 個月
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租屋（另付市政稅）', buy: '買房（首購印花稅減免、5 年固定利率、貸款最多年收入 4.5 倍）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸（頭期款 10%）', qinganNoGrace: '沒有新青安，改用一般房貸（頭期款 10%）', bank: '一般房貸（頭期款 10%）' },
      postpartum: { center: '英國沒有月子中心：請產後陪伴（doula）', nanny: '產後保母（maternity nurse）2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（前 6 週薪資 90%，之後每週 194.32）', B: '伴侶請 9 個月（前 6 週薪資 90%，之後每週 194.32）', both: '夫妻共用 39 週法定給付（算成一人請 9 個月）' },
      care: { quasi: '托兒所（9 個月大起每週 30 小時免費，其餘自付）', public: '托兒所（9 個月大起每週 30 小時免費，其餘自付）', private: '共用保母（nanny share）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '英國沒有互惠生簽證，改用共用保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立學校附設幼兒班（免費時段＋課後延長照顧）', quasi: '私立托兒所全天（扣免費時段）', private: '私立托兒所全天（扣免費時段）', bilingual: '雙語托兒所', home: '在家照顧' },
      school: { public: '公立學校（4 歲入學，免學費）', privateJH: '11 歲起讀私立中學', private: '私立學校（含加值稅）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後俱樂部＋假期營隊', anqin1: '課後俱樂部＋營隊＋1 項才藝', anqin3: '課後俱樂部＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每月幾次）', full: '密集家教（11+、GCSE、A-level）' },
      uni: { public: '大學（學費由學生貸款支付，父母補貼生活費）', private: '大學（學費由學生貸款支付，父母補貼生活費）', mixed: '大學（學費由學生貸款支付，父母補貼生活費）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（國民保健，免費）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.maternityNurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 1500 : 0), grant: 0, local: 0 }; // 寬裕：私人產檢與單人房
    },
    allowance: function () { return 0; }, // 兒童福利金在 taxes() 依家庭所得計算
    // 0–2 歲：托兒所全天（每週 50 小時、每年 51 週），雙薪家庭 9 個月大起扣掉每年 1,140 小時免費時段，免費時段另收餐費等約 950
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var m = careMonths / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') {
        var w = a < 2 ? c.nurseryU2 : c.nursery2, full = 2 * w * 51;
        var frac = a === 0 ? 0.25 : 1, funded = funded30(x) ? 1140 * w / 25 * frac : 0;
        fee = (full - funded + (funded ? 950 * frac : 0)) * m; sub = funded * m;
      } else if (cs === 'private') fee = c.nannyShare * m;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    // 3 歲：免費時段（雙薪每週 30 小時，其他家庭 15 小時）
    preschool: function (x, ps, k, a) {
      var c = x.c, hours = funded30(x) ? 1140 : 570, w = c.nursery2 * 0.95, fee = 0, kg = hours * w / 25;
      if (ps === 'home') return {};
      if (ps === 'public') fee = c.wrap + (hours < 1140 ? 570 * w / 25 : 0);
      else if (ps === 'bilingual') fee = Math.max(0, c.preschoolBilingual - kg) + 950;
      else fee = 2 * w * 51 - kg + 950;
      addDC(x, fee);
      return { fee: fee, kg: kg };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees[level] : c.schoolPublic[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var after = /^anqin/.test(s.after) && !(s.school === 'private' || intl) ? c.afterSchool * 12 : 0;
        addDC(x, after);
        extra = after + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 12;
      return fee + extra;
    },
    // 大學：學費由學生貸款支付；父母依家庭收入補貼生活費（收入 2.5 萬以上，生活費貸款減少的部分）［ESTIMATE］§7
    uni: function (x, k, a) {
      var inc = fullGross(x);
      return { fee: U.clamp((inc - 25000) * 0.15, 0, 6000), sub: 0 };
    },

    // ---------- 住房 ----------
    // 月租＋市政稅（租屋的人也要繳）
    rentFor: function (c, rooms, rentMult, x) {
      var r = Math.min(Math.max(rooms, 1), 4);
      var ct = councilTax(c, r) / 12;
      if (x) { x.y.ct = ct; x.y.rooms = r; }
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor + ct;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = [C.houseSize, C.homeInsurance];
      C.houseSize = c.size; C.homeInsurance = c.homeIns;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.houseSize = keep[0]; C.homeInsurance = keep[1]; }
      h.closing = stampDuty(h.total) + 3600; // 印花稅（首購）＋律師、鑑價、貸款手續費［ESTIMATE］
      h.tax = councilTax(c, h.rooms);
      return h;
    },
    // 頭期款 10%（90% 成數），貸款最多夫妻年收入 4.5 倍，30 年 §4.4
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.9, 4.5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '5 年固定利率（之後再轉貸）' }], note: amt < total * 0.9 - 1 ? '貸款最多年收入 4.5 倍' : '' };
    },

    // ---------- 法定產假給付：前 6 週平均週薪 90%，之後 33 週每週 194.32（或 90%，取低）§6.3［OFFICIAL］ ----------
    leavePay: function (g, ind, months, nb) {
      var aw = g / 52, weeks = Math.min(39, months * 52 / 12);
      return (6 * 0.9 * aw + Math.max(0, weeks - 6) * Math.min(194.32, 0.9 * aw)) * nb;
    },

    // ---------- 稅、國民保險、退休金；兒童福利金、Universal Credit、托育補貼 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c;
      var people = [x.gA, s.partner ? x.gB : 0];
      var si = 0, tax = 0, net = 0, maxANI = 0, working = 0, under100 = true;
      people.forEach(function (g) {
        if (!(g > 0)) return;
        working++;
        var pen = 0.05 * U.clamp(g - 6240, 0, 50270 - 6240); // 職場退休金（員工 5%，合格薪資）
        var ni = 0.08 * U.clamp(g - 12570, 0, 37700) + 0.02 * Math.max(0, g - 50270);
        var ani = g - pen, pa = Math.max(0, 12570 - Math.max(0, (ani - 100000) / 2));
        var ti = Math.max(0, ani - pa);
        var t = 0.2 * Math.min(ti, 37700) + 0.4 * U.clamp(ti - 37700, 0, 125140 - 37700) + 0.45 * Math.max(0, ti - 125140);
        si += pen + ni; tax += t; net += g - pen - ni - t;
        if (ani > maxANI) maxANI = ani;
        if (ani >= 100000) under100 = false;
      });
      var kids = x.atHome || [], nCB = 0, n12 = 0;
      kids.forEach(function (a) { if (a < 18) nCB++; if (a < 12) n12++; });
      var tr = x.tr || {}, add = 0;
      // 兒童福利金：第一個每週 27.05、其他每週 17.90；收入較高的一方 6 萬到 8 萬之間逐步收回 §3.2［NEWS］
      var cb = nCB ? 52 * (27.05 + 17.90 * (nCB - 1)) : 0;
      if (cb) { add += cb; tax += cb * U.clamp((maxANI - 60000) / 20000, 0, 1); }
      // Universal Credit（簡化）：存款 1.6 萬以上不能領；6,000–16,000 每 250 視為每月 4.35 收入 §3.3［SECONDARY］
      var uc = 0, S = x.S != null ? x.S : 0, dc = x.y.dc || 0;
      if (S < 16000) {
        var std = s.partner ? 666.97 : 424.90, child = 303.94 * kids.filter(function (a) { return a < 18; }).length;
        var housing = x.renting && x.rentM ? Math.min(x.rentM - (x.y.ct || 0), c.lha[(x.y.rooms || 2) - 1] || 0) : 0;
        var cc = Math.min(0.85 * dc / 12, n12 >= 2 ? 1836.16 : n12 === 1 ? 1071.09 : 0);
        var wa = housing > 0 ? 427 : 710, tariff = Math.max(0, Math.ceil((S - 6000) / 250)) * 4.35;
        uc = Math.max(0, std + child + housing + cc - 0.55 * Math.max(0, net / 12 - wa) - tariff) * 12;
      }
      add += uc;
      // 托育費 20% 政府補貼（Tax-Free Childcare，每個 12 歲以下孩子每年最多 2,000）；領 Universal Credit 時不能同時用
      if (!uc && dc > 0 && n12 > 0 && under100 && eligWork(x)) add += Math.min(0.2 * dc, 2000 * n12);
      if (x.tr) tr.allowance = (tr.allowance || 0) + add;
      return { si: si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  // 市政稅：1–2 房約 B／C 級、3 房 D 級、4 房 E 級 §4.3［ESTIMATE］
  function councilTax(c, rooms) { return c.councilD * [0.78, 0.89, 1.0, 1.22][Math.min(Math.max(rooms, 1), 4) - 1]; }
  // 印花稅（2025 年 4 月起）：首購 30 萬以下免稅、30–50 萬 5%；超過 50 萬沒有首購減免：12.5 萬以下 0、25 萬以下 2%、92.5 萬以下 5%… §4.5［OFFICIAL］
  function stampDuty(p) {
    if (p <= 500000) return 0.05 * Math.max(0, p - 300000);
    var b = [[125000, 0], [250000, 0.02], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]], t = 0, lo = 0;
    for (var i = 0; i < b.length && p > lo; i++) { t += (Math.min(p, b[i][0]) - lo) * b[i][1]; lo = b[i][0]; }
    return t;
  }
  // 每週 30 小時免費托育：父母都有工作（每人年收入至少約 1 萬、低於 10 萬）
  function funded30(x) {
    var a = x.gA / Math.max(x.workFracA, 0.05), b = x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : null;
    var ok = function (g) { return g >= 10000 && g < 100000; };
    return ok(a) && (b == null || ok(b)) && !(x.quit && x.t >= x.quitStart && x.t < x.quitEnd);
  }
  function eligWork(x) { var a = x.gA, b = x.s.partner ? x.gB : null; return a >= 5000 && (b == null || b >= 5000); }
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
  function fullGross(x) { return x.gA / Math.max(x.workFracA, 0.05) + (x.s.partner ? x.gB / Math.max(x.workFracB, 0.05) : 0); }
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
  K.stampDuty = stampDuty;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-de.js ---- */
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
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var hort = /^anqin/.test(s.after) && !intl ? (c.hort[Math.min(Math.max(a - 6, 0), 3)] || 0) * 12 + 300 : 0; // 另加假期營隊約 300
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

/* ---- country-se.js ---- */
/* =========================================================================
   瑞典模組（斯德哥爾摩、哥特堡）。金額為瑞典克朗、2026 年水準。
   來源與可信度見 research/countries/se.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人分開課稅（地方稅約 3 成、工作所得稅額抵減）、兒童津貼、480 天育兒假（約薪資 8 成）、
   托育費依家庭所得 3% 封頂、學校與大學免費（大學生自己領國家助學金）、買房只要 1 成頭期款但每年要還 1–2% 本金。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 3.1868;  // 1 克朗 = 3.1868 台幣（2026-10-12 收盤）§1［SECONDARY］
  var RATE = 0.030; // 房貸：浮動 3 個月 2.75%、3 年 3.67%（Nordea 2026 年 9 月平均），取 3.0% §4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var PBB = 59200;                       // 價格基數［OFFICIAL］
  var SKIKT = 643000;                    // 國家所得稅門檻（應稅所得）［OFFICIAL］
  var PEN_CAP = 673038;                  // 一般年金費 7% 的上限所得［OFFICIAL］
  var BB = 1250;                         // 兒童津貼，每個孩子每月（16 歲起改領就學津貼，每年 10 個月）［OFFICIAL］
  var FLER = [0, 0, 150, 730, 1740, 2990]; // 多子女加給（家庭每月合計）［OFFICIAL］
  var FP_MAX = 1259, FP_LOW = 180;       // 育兒假給付：每天最高、最低級［OFFICIAL］
  // 托育費（2026-07 起）：先扣每月 10,000 的免計所得，所得上限 51,560，第 1／2／3 個孩子 3%／2%／1%（第 1 個最多 1,547）
  //［OFFICIAL：政府 2026-01-21 決定＋地方公告，2026-10 核對；哥德堡標示上限為暫定］
  var MAXTAXA = { cap: 51560, free: 10000, pre: [0.03, 0.02, 0.01], fri: [0.02, 0.01, 0.01] };

  // 基本扣除額（65 歲以下）§3.1［OFFICIAL：SKV 433］
  function grund(ffi) {
    var p = PBB, g;
    if (ffi <= 0.99 * p) g = 0.423 * p;
    else if (ffi <= 2.72 * p) g = 0.423 * p + 0.2 * (ffi - 0.99 * p);
    else if (ffi <= 3.11 * p) g = 0.77 * p;
    else if (ffi <= 7.88 * p) g = 0.77 * p - 0.1 * (ffi - 3.11 * p);
    else g = 0.293 * p;
    return Math.min(ffi, Math.ceil(g / 100) * 100);
  }
  // 工作所得稅額抵減（jobbskatteavdrag，65 歲以下）§3.1［OFFICIAL］
  function jsa(ai, ga, ki) {
    var p = PBB, b;
    if (ai <= 0.91 * p) b = ai;
    else if (ai <= 3.24 * p) b = 0.91 * p + 0.3874 * (ai - 0.91 * p);
    else if (ai <= 8.08 * p) b = 1.813 * p + 0.251 * (ai - 3.24 * p);
    else b = 3.027 * p;
    return Math.max(0, (b - ga) * ki);
  }
  // 一個人的稅：地方稅＋國家稅 − 工作所得抵減 − 所得抵減 − 年金費抵減；另加公共廣播費
  function personTax(g, ki) {
    if (!(g > 0)) return { tax: 0, fee: 0, bfi: 0 };
    var ga = grund(g), bfi = Math.max(0, g - ga);
    var kom = bfi * ki, stat = 0.2 * Math.max(0, bfi - SKIKT);
    var fee = 0.07 * Math.min(g, PEN_CAP);
    var t = kom + stat;
    t -= Math.min(jsa(g, ga, ki), kom);
    t -= Math.min(U.clamp((bfi - 40000) * 0.0075, 0, 1500), t);
    t -= Math.min(fee, t);
    t += Math.min(0.01 * bfi, 1184);
    return { tax: t, fee: fee, bfi: bfi };
  }

  var K = {
    id: 'SE', name: '瑞典', cur: 'SEK', curName: '克朗', flag: '🇸🇪',
    fx: { toTWD: FX, pppToTWD: 1.59, date: '2026-10-12' }, // PPP：瑞典約 8.6、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['SCB 2025 薪資分布（依性別）', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/arbetsmarknad/loner-och-arbetskostnader/lonestrukturstatistik-hela-ekonomin/pong/tabell-och-diagram/lonespridning-efter-sektor-och-kon-2024/'],
      ['Ekonomifakta 薪資中位數 2025', 'https://www.ekonomifakta.se/sakomraden/arbetsmarknad/loner/median-och-genomsnittslon_1210924.html'],
      ['Skatteverket 2026 稅額計算技術說明', 'https://skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf'],
      ['Skatteverket 2026 金額與比例', 'https://www.skatteverket.se/privat/skatter/beloppochprocent/2026'],
      ['SCB 2026 各市地方稅率', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/'],
      ['社會保險局 2026 給付金額', 'https://www.forsakringskassan.se/privatperson/e-tjanster-blanketter-och-informationsmaterial/aktuella-belopp'],
      ['托育費上限 2026（Falköping 公告）', 'https://www.falkoping.se/download/18.7bdef21a19ac5f61f0122ef/1766138745363/Avgift%20f%C3%B6r%20f%C3%B6rskola%20och%20fritidshem%20%20-%20maxtaxa%20f%C3%B6r%20%C3%A5r%202026.pdf'],
      ['斯德哥爾摩市 2025 租金', 'https://start.stockholm/globalassets/start/om-stockholms-stad/utredningar-statistik-och-fakta/statistik/bostader/hyror/hyror_2025.pdf'],
      ['二房東與一手租金差距（Fastighetstidningen 2026）', 'https://fastighetstidningen.se/nyhet/gapet-mellan-andrahands-och-forstahandshyror-minskar/'],
      ['SCB 2026 租金', 'https://www.scb.se/hitta-statistik/statistik-efter-amne/boende-bebyggelse-och-mark/bostader-och-boende/hyror-i-bostadslagenheter/pong/statistiknyhet/hyror-i-bostadslagenheter-2026/'],
      ['斯德哥爾摩合作公寓房價 2026 Q3（Svensk Mäklarstatistik）', 'https://boio.se/priser/stockholm-2026'],
      ['Nordea 房貸平均利率', 'https://www.nordea.se/privat/produkter/bolan/snittrantor.html'],
      ['2026 房貸規則（9 成上限、還本規定）', 'https://boio.se/guide/bolan-regler-2026-90-procent'],
      ['Västtrafik 月票 2026', 'https://via.tt.se/pressmeddelande/4344231/nu-ar-vasttrafiks-periodbiljetter-billigare-for-goteborgare?lang=sv']
    ],
    notes: [
      '瑞典是個人分開課稅；地方稅斯德哥爾摩 30.55%、哥特堡 32.60%，年薪約 66 萬克朗以上的部分加課 20% 國家稅。',
      '育兒假每個孩子 480 天，其中 390 天領約薪資 8 成（每天最多 1,259 克朗）；多數公司另補 10%。育兒假給付要繳稅。',
      '托育費是家庭月收入的 3%（第二個孩子 2%），每月最多約 1,550 克朗。',
      '私立學校（friskola）也免學費；大學免學費，大學生自己領國家助學金。',
      '斯德哥爾摩一手租約要排隊多年，這裡用新建案一手租金和二房東租金的中間值。',
      '買合作公寓（bostadsrätt）頭期款 1 成，但每年要還 1–2% 本金；房貸利息 30% 可抵稅。'
    ],

    // ---------- 薪資（全體受僱者，換算成全職的月薪 × 12.15）§2 ----------
    W: {
      // 2025 年全職換算月薪中位數 38,300［OFFICIAL：SCB］× 12.15（含休假加給）× 2026 年約 1.033 ≈ 480,000［DERIVED］
      median: 480000,
      // 十分位：SCB 2025 男女各自的 P10／P25／P50／P75／P90 合併（女 27,400／31,000／36,800／45,500／57,000；
      // 男 28,800／33,200／39,900／50,600／66,100），其他分位以對數內插［DERIVED／ESTIMATE］
      q: [[5, 0.66], [10, 0.731], [20, 0.80], [25, 0.836], [30, 0.865], [40, 0.935], [50, 1], [60, 1.075], [70, 1.18], [75, 1.253], [80, 1.34], [90, 1.606], [95, 1.95]],
      paretoAlpha: 2.8,
      ageSpread: 0.85,
      // 年齡：各年齡層平均月薪（18–24 29,800、25–34 37,500、35–44 43,000、45–54 46,300、55–64 44,700；Medlingsinstitutet）
      // 依「平均／中位數」差距換成中位數比例［DERIVED／ESTIMATE］§2
      age: [[21, 0.74], [29.5, 0.906], [39.5, 1.0], [49.5, 1.06], [59.5, 1.02], [63, 1.0]],
      bonus: 0.15
    },
    CHECK_SALARIES: [300000, 400000, 480000, 600000, 800000, 1100000],

    // ---------- 城市 ----------
    CITY: {
      stockholm: {
        id: 'stockholm', name: '斯德哥爾摩', short: '斯德哥爾摩', capital: true,
        cons: 1.08, // 斯德哥爾摩每人消費高於全國［ESTIMATE］
        kTax: 0.3055, // 地方稅（市＋區域）［OFFICIAL］
        // 租金（含暖氣與水，每 ㎡ 每年）：2021 年後新建一手 2,568、全市一手平均 1,734、3 房二房東中位數 18,000／月（約 2,900）；
        // 取 2,400［DERIVED／ESTIMATE］§4.1
        rentM2: 2400, rentSize: [55, 75, 95, 115], rentAdj: 1.0,
        price: 75000, priceNew: 85000, // 合作公寓每 ㎡：全市 92,000、適合家庭的近郊 50,000–80,000（2026 Q3）［SECONDARY／ESTIMATE］§4.2
        avgift: 55, // 合作公寓月費（每 ㎡ 每月，含暖氣與水）［ESTIMATE］
        park: 900, tpass: 1080, // 居民停車；SL 30 天票［ESTIMATE］
        intl: 150000,
        hobby: 350, cram: { none: 0, some: 600, full: 2000 },
        doula: 15000, nurse: 30000
      },
      gothenburg: {
        id: 'gothenburg', name: '哥特堡', short: '哥特堡', capital: false,
        cons: 1.0,
        kTax: 0.3260,
        rentM2: 1950, rentSize: [55, 75, 95, 115], rentAdj: 1.0, // 新建一手約 2,000–2,200，二房東約斯德哥爾摩一半［ESTIMATE］
        price: 50000, priceNew: 60000, // 大哥特堡 2024 年 47,122，2026 約 +5%［DERIVED／ESTIMATE］
        avgift: 58,
        park: 600, tpass: 750, // Västtrafik 30 天票（市民價，2026-06 起）［OFFICIAL］
        intl: 120000,
        hobby: 300, cram: { none: 0, some: 550, full: 1800 },
        doula: 12000, nurse: 26000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：家計調查沒有公布金額，用國民所得帳每人消費約 27.1 萬 × 調查／國民所得比例 0.742（德國）
      // ×（1 − 住房 22.3%）÷ 12 × 0.716 × 物價 1.04 ≈ 9,500［ESTIMATE］§5.1
      adultBase: 9500, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 4750], [2, 4085], [6, 5130], [12, 6745], [18, 7505]], // 台灣「孩子／大人」比例 × 瑞典大人開銷［ESTIMATE］
      utilBase: 900, utilPerPerson: 250, // 電、網路、手機、家財險（暖氣與水含在租金或月費）［ESTIMATE］
      gearFirst: { frugal: 8000, normal: 15000, comfy: 30000 }, gearLater: 5000,
      postpartumFamily: 3000,
      grandPaid: 0, helper: 0,
      auPair: 9000,      // 互惠生每月：零用錢至少 3,500＋食宿與保險［ESTIMATE］
      careCost: 14000,   // 一個托育名額每月實際成本（只用來統計補助）［ESTIMATE］
      csn: 37000,        // 大學生的國家助學金（不用還的部分）每年約 3,900 × 9.5 個月［ESTIMATE］
      uniAwayRent: 0,    // 外地讀書的房租由學生自己的助學貸款支付
      master: 0,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 150000, resale: 0.25, life: 8, run: 30000 }, // 保險、油錢、車稅、保養［ESTIMATE］
        new: { buy: 350000, resale: 0.35, life: 10, run: 32000 },
        import: { buy: 550000, resale: 0.4, life: 10, run: 40000 }
      },
      scooter: { buy: 30000, resale: 0.2, life: 8, run: 5000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 180000, // 65 歲後每人每年（所得年金＋職業年金，稅後）［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 115 },
      reno: { basic: 500, light: 1500, full: 6000 },
      closing: { used: 0.003, new: 0.003 }, homeInsurance: 2000, // 合作公寓沒有印花稅，只有抵押登記與銀行手續費
      rentFactor: 1
    },

    // 6 歲學前班、7 歲上小學，13 歲國中（högstadiet），16–18 歲高中，19 歲上大學
    BANDS: { care: 3, es: 6, jh: 13, sh: 16, uni: 19 },
    // 育兒假：一人請時最多約 11 個月（另一方保留 90 天不能轉讓），夫妻都請時各 7 個月（共 480 天裡約 420 天）
    leaveMonths: function (who, s) { return s.leave === 'both' ? 7 : 11; },

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
      housing: { rent: '租屋（新建案一手租約或二房東，租金含暖氣與水）', buy: '買合作公寓（頭期款 1 成，每年還 1–2% 本金）', family: '和長輩同住' },
      build: { used: '中古公寓', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（頭期款 1 成）' },
      postpartum: { center: '瑞典沒有月子中心：請產後陪伴（產後回診與到府訪視免費）', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 11 個月（約薪資 8 成，每天最多 1,259 克朗）', B: '伴侶請 11 個月（約薪資 8 成）', both: '夫妻各請 7 個月' },
      care: { quasi: '公立托育（förskola，家庭收入 3%）', public: '公立托育（förskola，家庭收入 3%）', private: '私立托育（收費相同）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（每週 15 小時免費）', quasi: '公立幼兒園（每週 15 小時免費）', private: '私立幼兒園（收費相同）', bilingual: '雙語幼兒園（收費相同）', home: '在家照顧' },
      school: { public: '公立學校（免學費、午餐免費）', privateJH: '13 歲起讀私立學校（也免學費）', private: '私立學校（friskola，也免學費）', intl: '收費的國際學校' },
      after: { none: '不上課後班', anqin: '學校課後照顧（fritids）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '大學（免學費，學生自己領助學金）', private: '大學（免學費，學生自己領助學金）', mixed: '大學（免學費，學生自己領助學金）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '高級車' }
    },

    // ---------- 生產（公費醫療）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 10000 : 0), grant: 0, local: 0 };
    },
    // 兒童津貼到 15 歲；16 歲起讀高中領就學津貼（每年 10 個月）；多子女加給在 taxes() 算
    allowance: function (x, k, a) { return a < 16 ? BB * 12 : a < 19 ? BB * 10 : 0; },
    care: function (x, cs, k, a, careMonths) {
      var C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') { fee = maxtaxa(x, k, 'pre') * careMonths; sub = Math.max(0, C.careCost * careMonths - fee); }
      else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    // 3–5 歲：每年 525 小時免費，費用約打 7 折［ESTIMATE］
    preschool: function (x, ps, k, a) {
      var C = x.C;
      if (ps === 'home') return {};
      var fee = maxtaxa(x, k, 'pre') * 0.7 * 12;
      return { fee: fee, kg: Math.max(0, C.careCost * 12 - fee) };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : (level === 'es' ? 500 : 1500); // 公立與 friskola 免學費、午餐免費；只算雜費
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var fri = /^anqin/.test(s.after) && a < 10 ? maxtaxa(x, k, 'fri') * 12 : 0; // 課後照顧到 9 歲（3 年級）
        extra = fri + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 大學免學費；學生自己領國家助學金（不用還的部分）算成家庭收到的補助
    uni: function (x, k, a) { x.tr.allowance += x.C.csn; return { fee: 400, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 / 12 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, h = WD.stdHousePlan(x);
      h.mgmt = c.avgift * h.size * 12;
      h.tax = 0; // 合作公寓的房屋費由社區繳（含在月費）
      return h;
    },
    // 房貸：最多房價 9 成、夫妻年收入 5.5 倍［ESTIMATE：銀行實務］；每年還本 1–2%，用 35 年本息攤還近似
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.9, 5.5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 35, grace: 0, label: '浮動利率房貸（每年還本 1–2%）' }], note: amt < total * 0.9 - 1 ? '房貸最多年收入約 5.5 倍' : '' };
    },

    // ---------- 育兒假給付：薪資（上限 59.2 萬）× 0.97 × 0.8 ÷ 365，每天最多 1,259；多數公司前 6 個月補 10%；要繳稅（約 25%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var both = x.s.leave === 'both' && x.s.partner;
      var days = months * 30, sick = Math.min(days, both ? 195 : 300), low = Math.max(0, days - sick);
      var daily = Math.min(FP_MAX, Math.min(g, 10 * PBB) * 0.97 * 0.8 / 365);
      var top = 0.1 * g / 12 * Math.min(6, months); // 團體協約補 10%［ESTIMATE］
      return (sick * daily + low * FP_LOW + top) * 0.75 * nb;
    },

    // ---------- 稅與年金費；多子女加給；房貸利息抵稅 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, si = 0, tax = 0;
      [x.gA, s.partner ? x.gB : 0].forEach(function (g) {
        var r = personTax(g, c.kTax);
        si += r.fee; tax += r.tax; // 年金費列在社保；稅額已扣掉年金費抵減
      });
      tax = Math.max(0, tax);
      // 房貸利息 30% 抵稅（10 萬以上的部分 21%）
      var mi = x.mortInt || 0;
      if (mi > 0) tax = Math.max(0, tax - (0.3 * Math.min(mi, 100000) + 0.21 * Math.max(0, mi - 100000)));
      var n = (x.atHome || []).filter(function (a) { return a < 19; }).length;
      if (x.tr && n >= 2) x.tr.allowance = (x.tr.allowance || 0) + (n <= 5 ? FLER[n] : FLER[5] + BB * (n - 5)) * 12;
      return { si: si, tax: tax };
    }
  };

  // ---------- 工具 ----------
  // 托育費上限（每月）：家庭月收入扣 1 萬後的 3%／2%／1%（最小的孩子算第一個），第 4 個孩子起免費
  function maxtaxa(x, k, kind) {
    var inc = ((x.gA || 0) + (x.s.partner ? x.gB || 0 : 0)) / 12;
    var base = U.clamp(inc - MAXTAXA.free, 0, MAXTAXA.cap);
    var rank = 0;
    for (var j = 0; j < (x.births || []).length; j++) if (j > k && (x.t - x.births[j]) >= 0 && (x.t - x.births[j]) < 12) rank++; // 比這個孩子小、也在托育或課後照顧的
    var pct = MAXTAXA[kind][rank];
    return pct ? pct * base : 0;
  }
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
  K.personTax = personTax;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-ca.js ---- */
/* =========================================================================
   加拿大模組（多倫多、卡加利）。金額為加幣、2026 年水準。
   來源與可信度見 research/countries/ca.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：聯邦＋省所得稅（個人分開課稅）、加拿大兒童福利金（依家庭所得遞減）與省的兒童津貼、
   就業保險育兒給付（薪資 55%）、全國「每天 10 元托育」計畫（多倫多 22 元、卡加利 15 元）、
   公立學校 4 歲（安大略）起免費、首購 5% 頭期款＋房貸保險、房貸壓力測試。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 22.40;   // 1 加幣 = 22.40 台幣（2026-10-09 收盤）§1［SECONDARY］
  var RATE = 0.047; // 5 年固定：有房貸保險 4.59%、無保險約 5.1%（2026-10-09）§4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var FED = [[58523, 0.14], [117045, 0.205], [181440, 0.26], [258482, 0.29], [Infinity, 0.33]]; // ［OFFICIAL］
  var FED_BPA = 16452, FED_BPA_MIN = 14829, CEA = 1501;
  var CPP = { rate: 0.0595, ympe: 74600, exempt: 3500, rate2: 0.04, yampe: 85000 }, EI = { rate: 0.0163, mie: 68900 };
  var PROV = {
    ON: { br: [[53891, 0.0505], [107785, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]], bpa: 12989, credit: 0.0505, surtax: [5818, 7446] },
    AB: { br: [[61200, 0.08], [154259, 0.10], [185111, 0.12], [246813, 0.13], [370220, 0.14], [Infinity, 0.15]], bpa: 22769, credit: 0.10 }
  };
  // 加拿大兒童福利金（2026-07 起）：6 歲以下每年 8,157、6–17 歲 6,883；家庭淨所得 38,237 以上逐步減少 §3.3［NEWS］
  var CCB = { u6: 8157, o6: 6883, t1: 38237, t2: 82847, r1: [0.07, 0.135, 0.19, 0.23], r2: [0.032, 0.057, 0.08, 0.095] };
  var EI_MAX_WEEK = 729; // 育兒給付每週上限（薪資 55%）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function ohp(n) { // 安大略健康保費
    if (n <= 20000) return 0;
    if (n <= 36000) return Math.min(300, 0.06 * (n - 20000));
    if (n <= 48000) return Math.min(450, 300 + 0.06 * (n - 36000));
    if (n <= 72000) return Math.min(600, 450 + 0.25 * (n - 48000));
    if (n <= 200000) return Math.min(750, 600 + 0.25 * (n - 72000));
    return Math.min(900, 750 + 0.25 * (n - 200000));
  }
  // 一個人的稅與社保（g：薪資，ded：可扣除的托育費）
  function person(g, prov, ded) {
    if (!(g > 0)) return { si: 0, tax: 0, net: 0 };
    var cpp = CPP.rate * U.clamp(g - CPP.exempt, 0, CPP.ympe - CPP.exempt), cpp2 = CPP.rate2 * U.clamp(g - CPP.ympe, 0, CPP.yampe - CPP.ympe);
    var ei = EI.rate * Math.min(g, EI.mie);
    var enh = cpp * (1 / 5.95) + cpp2; // 加強版 CPP 可扣除所得
    var ti = Math.max(0, g - enh - (ded || 0));
    var bpa = FED_BPA - (FED_BPA - FED_BPA_MIN) * U.clamp((ti - 181440) / (258482 - 181440), 0, 1);
    var fed = Math.max(0, tax(ti, FED) - 0.14 * (bpa + Math.min(CEA, g) + cpp * 4.95 / 5.95 + ei));
    var P = PROV[prov], pt = Math.max(0, tax(ti, P.br) - P.credit * (P.bpa + cpp * 4.95 / 5.95 + ei));
    if (P.surtax) pt += 0.2 * Math.max(0, pt - P.surtax[0]) + 0.36 * Math.max(0, pt - P.surtax[1]);
    if (prov === 'ON') pt += ohp(ti);
    return { si: cpp + cpp2 + ei, tax: fed + pt, net: ti };
  }

  var K = {
    id: 'CA', name: '加拿大', cur: 'CAD', curName: '加幣', flag: '🇨🇦',
    fx: { toTWD: FX, pppToTWD: 11.7, date: '2026-10-09' }, // PPP：加拿大約 1.17、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['2026 聯邦稅級距、CPP 與 EI（Memorial University 薪資部門）', 'https://www.mun.ca/hr/media/production/memorial/administrative/human-resources/media-library/services/2026-tax-changes.pdf'],
      ['2026 安大略與亞伯達稅級距（Fidelity）', 'https://www.fidelity.ca/en/insights/articles/canadian-income-tax-brackets/'],
      ['安大略 2026 個人稅表（Raymond Chabot Grant Thornton）', 'https://www.rcgt.com/contentassets/5142f7cf936d42d7aa7666314c21ccd1/individual_taxation_ontario_2026.pdf'],
      ['加拿大兒童福利金 2026-07 起', 'https://www.mtlblog.com/canada-child-benefit-july-2026'],
      ['亞伯達兒童與家庭福利金 2026', 'https://www.moneysense.ca/save/budgeting/alberta-child-and-family-august-2026-payment/'],
      ['就業保險育兒給付金額', 'https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental/benefit-amount.html'],
      ['2026 各城市托育費（加拿大政策替代中心）', 'https://www.policyalternatives.ca/news-research/the-10-a-day-divide-child-care-fees-in-canada-in-2026/'],
      ['勞動力調查 2025 薪資（WealthNorth 整理）', 'https://wealthnorth.ca/income/average-income/average-salary-canada/'],
      ['家庭支出調查 2023', 'https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2025026-eng.htm'],
      ['多倫多租金 2026-07（Moving2Canada）', 'https://moving2canada.com/2026/07/how-much-is-rent-in-toronto-in-july-2026/'],
      ['卡加利租金 2026-09（liv.rent）', 'https://liv.rent/blog/?p=69419'],
      ['多倫多房價 2026-09（TRREB）', 'https://trreb.ca/hlfiles/pdf/mw_september_2026_564895214753249.pdf'],
      ['卡加利房價 2026-09（CREB）', 'https://dailyhive.com/calgary/calgary-housing-market-september'],
      ['房貸利率 2026-10（nesto）', 'https://www.nesto.ca/mortgage-rates/fixed/5-year/?region=on']
    ],
    notes: [
      '加拿大是個人分開課稅：聯邦稅＋省稅（多倫多在安大略省、卡加利在亞伯達省）。',
      '加拿大兒童福利金：6 歲以下每年最多 8,157 加幣，家庭淨所得超過約 3.8 萬開始遞減；省另有兒童津貼。',
      '育兒給付：生產的一方 15 週產假＋35 週育兒假，薪資 55%（每週最多 729 加幣），要繳稅。',
      '全國托育計畫：參與計畫的托育中心多倫多每天 22 元、卡加利每天 15 元，但名額不足、常要排隊。',
      '首購可以只付 5% 頭期款，但要買房貸保險（保費 2.8–4% 加進貸款）並通過利率 +2% 的壓力測試。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2025 年全體受僱者週薪中位數 × 52 = 60,320［OFFICIAL：勞動力調查］；全職約高 12% → 67,500 × 2026 年約 1.035 ≈ 70,000［DERIVED／ESTIMATE］
      median: 70000,
      // 十分位：沒有公布全職年薪分位；全職最低工資（安大略 17.60 × 2,000 小時）約中位數 0.50，形狀介於美國與英國之間［ESTIMATE］
      q: [[10, 0.55], [20, 0.66], [25, 0.72], [30, 0.77], [40, 0.88], [50, 1], [60, 1.12], [70, 1.26], [75, 1.36], [80, 1.48], [90, 1.92], [95, 2.35]],
      paretoAlpha: 2.4,
      ageSpread: 0.85,
      // 年齡：有工作收入者的中位數（2024 年 25–34 歲 50,300、35–44 歲 65,200、45–54 歲 70,100、55–64 歲 55,400）
      // 含部分工時，換成全職的形狀［DERIVED／ESTIMATE］
      age: [[22, 0.62], [29.5, 0.86], [39.5, 1.06], [49.5, 1.12], [59.5, 1.06], [63, 1.0]],
      bonus: 0.3
    },
    CHECK_SALARIES: [40000, 55000, 70000, 100000, 150000, 220000],

    // ---------- 城市 ----------
    CITY: {
      toronto: {
        id: 'toronto', name: '多倫多', short: '多倫多', capital: false, prov: 'ON',
        cons: 1.08, // ［ESTIMATE］
        // 刊登租金中位數（2026-07）：1 房 2,150、2 房 2,600、3 房 3,380［SECONDARY］；4 房（連棟屋）［ESTIMATE］§4.1
        // 2026-10 核對：刊登價 × 0.9（和台灣同規則），對照 CMHC 2025 新租客租金 2,073／2,547／2,893［OFFICIAL＋DERIVED］
        rent: [2000, 2450, 3050, 3790], rentAdj: 1.0,
        // 公寓平均成交 640,248、連棟 922,445、半獨立 1,207,884（2026-09，多倫多市）［OFFICIAL：TRREB］→ 每 ㎡ 約 8,500；預售新建約 12,000［DERIVED／ESTIMATE］§4.2
        price: 8500, priceNew: 12000,
        propTax: 0.0075, condo: 7, homeIns: 600, // 地價稅率、管理費（每 ㎡ 每月）［ESTIMATE］
        ltt: 'toronto',
        park: 150, tpass: 160, // 公寓車位月租；TTC 月票［ESTIMATE］
        cw: 22 * 21.7, careFull: 2000, nanny: 3300, // 計畫內托育每天 22 元［NEWS］；計畫外私立、住家保母［ESTIMATE］
        kStart: 4, jkCare: 240, // 4 歲上公立幼兒班（JK）；上下學前後照顧每月［ESTIMATE］
        afterSchool: 450, camp: 2000, privateFees: 30000, intl: 35000,
        hobby: 100, cram: { none: 0, some: 250, full: 600 },
        uniFee: 8500, // 學費約 7,000（凍漲）＋雜費［ESTIMATE］
        doula: 1800, nurse: 3500
      },
      calgary: {
        id: 'calgary', name: '卡加利', short: '卡加利', capital: false, prov: 'AB',
        cons: 1.02,
        // 1 房 1,442（2026-09，年減 5.3%）［SECONDARY］；其他［ESTIMATE］
        rent: [1400, 1750, 2050, 2550], rentAdj: 1.0, // 2026-10 核對：統計局 2026 Q2 刊登 1,550／1,890／2,180 × 0.9 附近；CMHC 2 房新租客 1,836［OFFICIAL＋DERIVED］
        // 基準價：公寓 291,400、連棟 412,400、獨立屋 739,400（2026-09）［NEWS：CREB］→ 每 ㎡ 約 3,900［DERIVED］
        price: 3900, priceNew: 4800,
        priceRooms: { 4: 5280 }, // 4 房是獨立屋：基準價 739,400 ÷ 140 ㎡［DERIVED，2026-10 核對：原本用公寓的每 ㎡ 價，低估約 26%］
        propTax: 0.0068, condo: 5, homeIns: 1500, // 冰雹多，保費較高［ESTIMATE］
        ltt: 'none',
        park: 75, tpass: 118,
        cw: 15 * 21.75, careFull: 1300, nanny: 2900, // 每天 15 元（月付 326.25）［NEWS］
        kStart: 6, jkCare: 0, // 5 歲幼兒園半天，算在托育
        afterSchool: 550, camp: 1800, privateFees: 18000, intl: 22000,
        hobby: 100, cram: { none: 0, some: 230, full: 550 },
        uniFee: 9500,
        doula: 1500, nurse: 3000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2023 家庭支出調查每戶 76,750 − 住房（含水電）24,671 = 52,079 ÷ 每戶約 2.4 人［ESTIMATE］
      // ÷ 12 × 0.716 = 1,295 × 物價 2023→2026 約 1.07 ≈ 1,385［DERIVED］§5.1
      adultBase: 1385, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 693], [2, 596], [6, 748], [12, 983], [18, 1094]], // 台灣「孩子／大人」比例 × 加拿大大人開銷［ESTIMATE］
      utilBase: 160, utilPerPerson: 45, // 電、暖氣（租屋常另付）、網路、手機、租屋保險［ESTIMATE］
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      careValue: 1800,   // 計畫內托育名額每月實際成本（只用來統計補助）［ESTIMATE］
      uniAwayRent: 800,
      master: 12000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 18000, resale: 0.25, life: 8, run: 5200 }, // 保險、油錢、保養［ESTIMATE］
        new: { buy: 42000, resale: 0.35, life: 10, run: 5500 },
        import: { buy: 65000, resale: 0.4, life: 10, run: 6500 }
      },
      scooter: { buy: 4000, resale: 0.2, life: 8, run: 800 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 22000, // 65 歲後每人每年：加拿大退休金＋老年保障金［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 100, 4: 140 }, // 1–2 房公寓、3 房連棟、4 房獨立屋［ESTIMATE］
      reno: { basic: 60, light: 200, full: 800 },
      closing: { used: 0.01, new: 0.01 }, homeInsurance: 800, // 後備值；過戶稅另外計算
      rentFactor: 1
    },

    // 安大略：4 歲上 JK、5 歲 SK、6 歲 1 年級；12 歲 7 年級；14 歲上高中
    BANDS: { care: 3, es: 4, jh: 12, sh: 14, uni: 18 },
    // 育兒給付：一人請約 12 個月（產假 15 週＋育兒 35 週）；夫妻共用 55 週，算成各 6.5 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6.5 : 12; },

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
      housing: { rent: '租屋', buy: '買房（首購頭期款最低 5%＋房貸保險，30 年）', family: '和長輩同住' },
      build: { used: '中古屋', new: '預售新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（5 年固定利率）' },
      postpartum: { center: '加拿大沒有月子中心：請產後陪伴（doula）', nanny: '產後夜間保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 12 個月（產假＋育兒假，薪資 55%，每週最多 729）', B: '伴侶請 12 個月（薪資 55%）', both: '夫妻共用 55 週（各約 6.5 個月）' },
      care: { quasi: '計畫內托育中心（每天 10–22 元）', public: '計畫內托育中心（每天 10–22 元）', private: '計畫外私立托育', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '住家保母（照護者移民計畫）', quit: '一方離職在家照顧' },
      preschool: { public: '計畫內托育中心', quasi: '計畫內托育中心', private: '計畫外私立托育', bilingual: '計畫外私立托育（雙語）', home: '在家照顧' },
      school: { public: '公立學校（安大略 4 歲起免費）', privateJH: '12 歲起讀私立學校', private: '私立學校', intl: '國際學校（IB）' },
      after: { none: '不上課後班', anqin: '課前課後照顧＋暑期營', anqin1: '課後照顧＋營隊＋1 項才藝', anqin3: '課後照顧＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '公立大學（學費約 7,000–8,000）', private: '公立大學（加拿大幾乎沒有私立大學）', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（省健保給付）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 1500 : 0), grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 兒童福利金在 taxes() 依家庭所得計算
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') { fee = c.cw * careMonths; sub = Math.max(0, C.careValue - c.cw) * careMonths; }
      else if (cs === 'private') fee = c.careFull * careMonths;
      else if (cs === 'helper') fee = c.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      addDC(x, fee);
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c, C = x.C;
      if (ps === 'home') return {};
      var m = (ps === 'private' || ps === 'bilingual') ? c.careFull * 0.85 : c.cw;
      var fee = m * 12;
      addDC(x, fee);
      return { fee: fee, kg: ps === 'private' || ps === 'bilingual' ? 0 : Math.max(0, C.careValue - c.cw) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      // 卡加利 6 歲前：幼兒園半天＋托育（每天 15 元）
      if (level === 'es' && a < c.kStart) { var f0 = c.cw * 12; addDC(x, f0); x.tr.kg += Math.max(0, x.C.careValue - c.cw) * 12; return f0; }
      var fee = intl ? c.intl : priv ? c.privateFees : (level === 'es' ? 300 : 600);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var care = 0;
        if (/^anqin/.test(s.after)) care = a < 6 ? c.jkCare * 10 : c.afterSchool * 10 + c.camp;
        addDC(x, care);
        extra = care + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = C.homeInsurance;
      C.homeInsurance = c.homeIns;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.homeInsurance = keep; }
      h.closing = ltt(h.total, c.ltt) + 2500; // 過戶稅（首購減免後）＋律師與產權保險［ESTIMATE］
      h.down += K.loanPlan(x, h.total).downAdj || 0; // 房貸保險費加進貸款，不是自付的頭期款
      h.mgmt = c.condo * h.size * 12;
      return h;
    },
    // 房貸：頭期款最低（50 萬以下 5%、以上 10%），貸款 8 成以上要買房貸保險（保費加進貸款）；
    // 壓力測試：以 max(利率 + 2%, 5.25%)、30 年計，房貸＋地價稅＋暖氣＋一半管理費 ≤ 收入 39% §4.4［OFFICIAL 規則］
    loanPlan: function (x, total) {
      var c = x.c, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var size = (x.C.houseSize || {})[x.roomsFinal] || 75;
      var minDown = total >= 1500000 ? 0.2 * total : 0.05 * Math.min(total, 500000) + 0.1 * Math.max(0, total - 500000);
      var q = Math.max(RATE + 0.02, 0.0525), carry = c.propTax * total + 1200 + 0.5 * c.condo * size * 12;
      var maxLoan = Math.max(0, 0.39 * inc - carry) / ann(q, 30);
      var loan = Math.min(total - minDown, maxLoan), ltv = loan / total;
      var prem = ltv > 0.9 ? 0.04 : ltv > 0.85 ? 0.031 : ltv > 0.8 ? 0.028 : 0;
      if (prem) prem += 0.002; // 30 年攤還加收 0.2%
      return {
        parts: [{ amt: loan * (1 + prem), rate: RATE, years: 30, grace: 0, label: prem ? '5 年固定（含房貸保險費 ' + Math.round(prem * 1000) / 10 + '%）' : '5 年固定' }],
        note: loan < total - minDown - 1 ? '壓力測試：月付不能超過收入 39%，要多付頭期款' : '',
        // 保險費加進貸款，所以實際自付的頭期款要扣回來
        downAdj: loan * prem
      };
    },

    // ---------- 就業保險育兒給付：薪資 55%（每週最多 729），等待期 1 週；要繳稅（約 15%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.max(0, Math.min(months * 52 / 12 - 1, both ? 27.5 : 50));
      return weeks * Math.min(EI_MAX_WEEK, 0.55 * g / 52) * 0.85 * nb;
    },

    // ---------- 稅與社保；兒童福利金 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, prov = c.prov;
      var gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 18; });
      var u6 = kids.filter(function (a) { return a < 6; }).length, o6 = kids.length - u6, u7 = kids.filter(function (a) { return a < 7; }).length;
      var n16 = kids.filter(function (a) { return a < 17; }).length - u7;
      // 托育費扣除：收入較低的一方扣（7 歲以下每人 8,000、7–16 歲 5,000，最多其收入 2/3）
      var dc = x.y.dc || 0, lowA = s.partner ? gA <= gB : true;
      var dcd = Math.min(dc, 8000 * u7 + 5000 * n16, (2 / 3) * (lowA ? gA : gB));
      var pa = person(gA, prov, lowA ? dcd : 0), pb = person(gB, prov, lowA ? 0 : dcd);
      var si = pa.si + pb.si, tx = pa.tax + pb.tax;
      var afni = pa.net + pb.net, n = kids.length, add = 0;
      if (n) {
        var i = Math.min(n, 4) - 1, red = afni <= CCB.t1 ? 0 : afni <= CCB.t2 ? CCB.r1[i] * (afni - CCB.t1) : CCB.r1[i] * (CCB.t2 - CCB.t1) + CCB.r2[i] * (afni - CCB.t2);
        add += Math.max(0, CCB.u6 * u6 + CCB.o6 * o6 - red);
        if (prov === 'ON') add += Math.max(0, 1762 * n - 0.08 * Math.max(0, afni - 26890)); // 安大略兒童津貼：2025–26 年 1,727／26,364，金額與門檻都 × 1.02［ESTIMATE］
        else if (prov === 'AB') { // 亞伯達兒童與家庭福利金：基本部分＋工作部分［NEWS 金額；遞減率 ESTIMATE］
          var base = 1529 + 764 * (n - 1), work = [782, 1494, 1920, 2061][i];
          add += Math.max(0, base - 0.06 * Math.max(0, afni - 28116));
          add += Math.max(0, Math.min(work, 0.15 * Math.max(0, gA + gB - 2760)) - 0.15 * Math.max(0, afni - 47115));
        }
      }
      if (x.tr && add) x.tr.allowance = (x.tr.allowance || 0) + add;
      return { si: si, tax: tx };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  function addDC(x, v) { if (v > 0) x.y.dc = (x.y.dc || 0) + v; }
  // 過戶稅：安大略與多倫多市各一份（首購各減免 4,000／4,475）；亞伯達只有登記費 §4.3［OFFICIAL 級距］
  function ltt(p, kind) {
    if (kind !== 'toronto') return 50 + 2 * Math.ceil(p / 5000) * 5;
    var b = [[55000, 0.005], [250000, 0.01], [400000, 0.015], [2000000, 0.02], [Infinity, 0.025]];
    var one = tax(p, b);
    return Math.max(0, one - 4000) + Math.max(0, one - 4475);
  }
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
  K.person = person; K.ltt = ltt;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-au.js ---- */
/* =========================================================================
   澳洲模組（雪梨、墨爾本）。金額為澳幣、2026 年水準。
   來源與可信度見 research/countries/au.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人分開課稅＋2% 健保稅、家庭稅務補助（FTB，依家庭所得遞減）、托育補助（家庭所得 8.9 萬以下補 9 成）、
   26 週育兒假給付（最低工資水準）、首購 5% 頭期款擔保、印花稅首購減免、2026 年升息後房貸利率約 6.25%。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 22.30;    // 1 澳幣 = 22.30 台幣（2026-10-09 收盤）§1［SECONDARY］
  var RATE = 0.0625; // 澳洲央行 2026-09-29 升息到 4.6%，自住浮動房貸平均約 6.25%［NEWS／ESTIMATE］§4.4

  // ---------- 制度參數（2026–27）§3 ----------
  var BR = [[18200, 0], [45000, 0.15], [135000, 0.30], [190000, 0.37], [Infinity, 0.45]]; // ［NEWS：15% 級距 2026-07 起］
  var CCS = { full: 88520, zero: 538520, capDay: 15.19, capSchool: 13.30, second: 372000 }; // 托育補助［NEWS］
  var FTB = { a12: 6139.30, a13: 7989.85, base: 1971, supp: 970.90, free: 69131, hi: 123078, b5: 5223.15, b18: 3646.35, bSupp: 478.15, bPrimary: 124327, bFree: 7154 }; // B 部分主要收入上限 124,327、次要收入免計 7,154（2025–26）［SECONDARY，2026-10 核對］
  var PPL_WEEK = 1004.70; // 育兒假給付每週（26 週，伴侶保留 4 週）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的所得稅＋健保稅（2%，低收入逐步加課）＋低收入抵減
  function person(g) {
    if (!(g > 0)) return 0;
    var t = tax(g, BR);
    var lito = g <= 37500 ? 700 : g <= 45000 ? 700 - 0.05 * (g - 37500) : Math.max(0, 325 - 0.015 * (g - 45000));
    var ml = g <= 27222 ? 0 : Math.min(0.02 * g, 0.1 * (g - 27222));
    return Math.max(0, t - lito) + ml;
  }
  function ccsRate(inc, younger) {
    var r = inc <= CCS.full ? 0.9 : Math.max(0, 0.9 - Math.ceil((inc - CCS.full) / 5000) * 0.01);
    if (younger && inc < CCS.second) r = Math.min(0.95, r + 0.3); // 第二個以上 5 歲以下的孩子
    return r;
  }
  // 印花稅（新南威爾斯、維多利亞）與首購減免 §4.3［OFFICIAL 級距；門檻為 2025–26 值］
  function duty(p, st) {
    var full, ex, top;
    if (st === 'NSW') {
      full = tax(p, [[17000, 0.0125], [36000, 0.015], [97000, 0.0175], [364000, 0.035], [1212000, 0.045], [Infinity, 0.055]]);
      ex = 800000; top = 1000000;
    } else {
      full = p > 960000 ? (p > 2000000 ? 110000 + 0.065 * (p - 2000000) : 0.055 * p) : tax(p, [[25000, 0.014], [130000, 0.024], [960000, 0.06]]);
      ex = 600000; top = 750000;
    }
    if (p <= ex) return 0;
    if (p < top) return full * (p - ex) / (top - ex);
    return full;
  }

  var K = {
    id: 'AU', name: '澳洲', cur: 'AUD', curName: '澳幣', flag: '🇦🇺',
    fx: { toTWD: FX, pppToTWD: 9.4, date: '2026-10-09' }, // PPP：澳洲約 1.45、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ABS 2025 年 8 月受僱者週薪', 'https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings/aug-2025'],
      ['2026–27 稅率（15% 級距）', 'https://www.countrytaxcalc.com/tax-guides/australia/tax-rates-2026-27/'],
      ['托育補助 2026-07 起的上限與所得門檻', 'https://www.thesector.com.au/article/ccs-hourly-rate-caps-income-thresholds-rise-6-july-2026'],
      ['家庭稅務補助 2026–27', 'https://austax.tools/tax-insights/family-tax-benefit-rates-2026-27/'],
      ['育兒假給付（Services Australia）', 'https://www.servicesaustralia.gov.au/sites/default/files/2026-06/factsheet-parental-leave-pay.pdf'],
      ['房價 2026-09（Cotality）', 'https://everstonefinance.com.au/median-house-prices-australia/'],
      ['Domain 租屋報告 2026（不吃緊的租屋所需年收入）', 'https://propertyupdate.com.au/renting-in-2026-when-lifestyle-dreams-come-with-a-six-figure-price-tag/'],
      ['澳洲央行 2026-09 升息', 'https://www.newcastleherald.com.au/story/9359064/interest-rates-hit-15-year-high-as-rba-hikes-again/']
    ],
    notes: [
      '澳洲是個人分開課稅，另加 2% 健保稅；雇主另外提撥 12% 退休金（不算在薪資裡）。',
      '托育補助：家庭年收入 8.9 萬澳幣以下補 9 成，之後每多 5,000 少 1%；第二個 5 歲以下的孩子多補 3 成。',
      '家庭稅務補助（FTB）依家庭所得遞減；單薪家庭另有 B 部分。',
      '育兒假給付 26 週、每週 1,004.70 澳幣（最低工資水準，要繳稅），伴侶保留 4 週。',
      '首購可用政府擔保只付 5% 頭期款（雪梨房價上限 150 萬、墨爾本 95 萬），印花稅首購有減免。',
      '2026 年 9 月澳洲央行升息到 4.6%，房貸利率約 6.25%。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2025 年 8 月全職受僱者週薪中位數 1,741 × 52 = 90,532［OFFICIAL：ABS］× 2026 年約 1.033 ≈ 93,500［DERIVED］
      median: 93500,
      // 十分位：全職最低工資（1,004.70 × 52）約中位數 0.56；澳洲薪資由產業標準工資撐住底部，分布較集中［ESTIMATE］
      // 2026-10 核對：全職 P25 0.755、P75 1.357（ABS 2025-05 雇主調查）；OECD 全職 D9／D5 1.98、D5／D1 1.72（P10 約 0.58）［OFFICIAL］
      q: [[10, 0.58], [20, 0.70], [25, 0.755], [30, 0.80], [40, 0.90], [50, 1], [60, 1.11], [70, 1.26], [75, 1.36], [80, 1.48], [90, 1.95], [95, 2.45]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      age: [[22, 0.66], [29.5, 0.93], [39.5, 1.08], [49.5, 1.10], [59.5, 1.03], [63, 0.98]], // ［ESTIMATE］
      bonus: 0.2
    },
    CHECK_SALARIES: [55000, 75000, 93500, 130000, 180000, 250000],

    // ---------- 城市 ----------
    CITY: {
      sydney: {
        id: 'sydney', name: '雪梨', short: '雪梨', capital: false, state: 'NSW',
        cons: 1.08, // ［ESTIMATE］
        // 不吃緊租屋所需年收入（Domain 2025）：獨棟 135,200、公寓 130,000 → 週租約 780／750，2026 +5.5%；各房數［DERIVED／ESTIMATE］§4.1
        rent: [2820, 3420, 3600, 4400], rentAdj: 1.0, // 2026-10 核對：獨棟週租中位數 835（Domain 2026 Q3）→ 3 房約 830／週；4 房同比例［SECONDARY／DERIVED］
        // 中位數（2026-09）：獨棟 1,466,060、公寓 867,597［SECONDARY：Cotality］→ 每 ㎡ 約 9,500（含土地）［DERIVED／ESTIMATE］§4.2
        price: 9500, priceNew: 11000, hgsCap: 1500000,
        propTax: 0.0012, mgmt: 3.5, homeIns: 1500, // 市政費、公寓管理費（每 ㎡ 每月，平均）［ESTIMATE］
        park: 200, tpass: 200,
        dayFee: 170, prekRelief: 2000, // 托育中心每天（10 小時）；州政府學前補助（每年）［ESTIMATE］
        oshc: 12200, privateFees: { es: 25000, jh: 38000, sh: 40000 }, intl: 35000,
        hobby: 120, cram: { none: 0, some: 300, full: 800 },
        doula: 2000, nurse: 4000, nanny: 6800
      },
      melbourne: {
        id: 'melbourne', name: '墨爾本', short: '墨爾本', capital: false, state: 'VIC',
        cons: 1.0,
        // 不吃緊租屋所需年收入：獨棟 100,533、公寓 99,667 → 週租約 580／575，2026 +5.5%［DERIVED／ESTIMATE］
        rent: [2170, 2600, 2600, 3090], rentAdj: 1.0, // 2026-10 核對：獨棟、公寓週租都約 600（2026 Q3），3 房約 600／週［SECONDARY／DERIVED］
        // 中位數（2026-09）：獨棟 915,119、公寓 624,740［SECONDARY］→ 每 ㎡ 約 6,000［DERIVED／ESTIMATE］
        price: 6000, priceNew: 7000, hgsCap: 950000,
        propTax: 0.0022, mgmt: 3.0, homeIns: 1400,
        park: 150, tpass: 200,
        dayFee: 150, prekRelief: 2200, // 維多利亞「免費幼兒園」在托育中心的抵減［ESTIMATE］
        oshc: 11500, privateFees: { es: 22000, jh: 34000, sh: 36000 }, intl: 32000,
        hobby: 110, cram: { none: 0, some: 280, full: 700 },
        doula: 1800, nurse: 3600, nanny: 6200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：家計調查 2015–16 每戶每週 1,425 − 住房 279 − 能源約 40 = 1,106 × 物價 1.36 ÷ 2.6 人
      // × 52 ÷ 12 × 0.716 ≈ 1,800；以國民所得帳與物價水準交叉檢查約 1,600，取 1,700［ESTIMATE］§5.1
      adultBase: 1700, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 850], [2, 731], [6, 918], [12, 1207], [18, 1343]], // 台灣「孩子／大人」比例 × 澳洲大人開銷［ESTIMATE］
      utilBase: 220, utilPerPerson: 60,
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      auPair: 2000,
      careValue: 3600, // 托育中心每月實際費用（只用來統計補助）
      uniAwayRent: 1000,
      master: 0,       // 研究所也可用學貸（HECS）
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 20000, resale: 0.25, life: 8, run: 6000 }, // 牌照、強制險、保險、油錢、過路費［ESTIMATE］
        new: { buy: 42000, resale: 0.35, life: 10, run: 6200 },
        import: { buy: 65000, resale: 0.4, life: 10, run: 7200 }
      },
      scooter: { buy: 5000, resale: 0.2, life: 8, run: 900 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 35000, // 65 歲後每人每年：老人年金＋退休金帳戶［ESTIMATE］
      houseSize: { 1: 55, 2: 80, 3: 130, 4: 170 }, // 1–2 房公寓、3 房連棟、4 房獨棟［ESTIMATE］
      reno: { basic: 60, light: 200, full: 800 },
      closing: { used: 0.005, new: 0.005 }, homeInsurance: 1500,
      rentFactor: 1
    },

    // 5 歲上小學預備班（Kindergarten／Prep），12 歲上中學，16–17 歲讀 11–12 年級
    BANDS: { care: 3, es: 5, jh: 12, sh: 16, uni: 18 },
    // 一人請 9 個月（26 週有給付，伴侶保留的 4 週不能用），夫妻各 6 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6 : 9; },

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
      housing: { rent: '租屋', buy: '買房（首購政府擔保 5% 頭期款，印花稅首購減免）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般浮動利率房貸' },
      postpartum: { center: '澳洲沒有月子中心：請產後陪伴（doula）', nanny: '產後夜間保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（其中 22 週領育兒假給付，每週 1,004.70）', B: '伴侶請 9 個月（22 週有給付）', both: '夫妻各請 6 個月（共 26 週有給付）' },
      care: { quasi: '托育中心（政府托育補助）', public: '托育中心（政府托育補助）', private: '較高價的托育中心（政府托育補助）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '托育中心的學前班（州政府補助）', quasi: '托育中心的學前班（州政府補助）', private: '較高價的托育中心', bilingual: '較高價的托育中心（雙語）', home: '在家照顧' },
      school: { public: '公立學校（自願捐款與雜費）', privateJH: '12 歲起讀私立中學', private: '私立學校', intl: '國際學校（IB）' },
      after: { none: '不上課後班', anqin: '課前課後照顧＋假期營（有托育補助）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（精英中學考試）' },
      uni: { public: '大學（學費由學生的政府學貸支付）', private: '大學（學費由學生的政府學貸支付）', mixed: '大學（學費由學生的政府學貸支付）' },
      transport: { transit: '大眾運輸', scooter: '機車不常見，改用大眾運輸', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（公立醫院免費）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 4000 : 0), grant: 0, local: 0 }; // 寬裕：私人產科醫師與私立醫院自付
    },
    allowance: function () { return 0; }, // 家庭稅務補助在 taxes() 依家庭所得計算
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var m = careMonths / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var day = c.dayFee * (cs === 'private' ? 1.2 : 1), r = ccsRate(famInc(x), younger(x, k));
        var gross = 240 * day, s2 = 240 * r * Math.min(day, CCS.capDay * 10);
        fee = (gross - s2) * m; sub = s2 * m;
      } else if (cs === 'helper') fee = C.auPair * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var day = c.dayFee * (ps === 'private' || ps === 'bilingual' ? 1.2 : 1), r = ccsRate(famInc(x), younger(x, k));
      var gross = 240 * day, s2 = 240 * r * Math.min(day, CCS.capDay * 10), relief = Math.min(c.prekRelief, gross - s2);
      return { fee: gross - s2 - relief, kg: s2 + relief };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees[level] : (level === 'es' ? 800 : 1500);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        var oshc = /^anqin/.test(s.after) ? c.oshc * (1 - ccsRate(famInc(x), false)) : 0; // 學齡托育也有補助（每小時上限 13.30，課後每天約 45 元未超過）
        extra = oshc + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: 400, sub: 0 }; }, // 學費由學生自己的 HECS 學貸支付；只算學生服務費

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var C = x.C, c = x.c, keep = C.homeInsurance;
      C.homeInsurance = c.homeIns;
      var h;
      try { h = WD.stdHousePlan(x); } finally { C.homeInsurance = keep; }
      h.closing = duty(h.total, c.state) + 3000; // 印花稅（首購減免後）＋律師、驗屋、貸款手續費［ESTIMATE］
      return h;
    },
    // 房貸：房價在首購擔保上限內 → 貸 95%（免房貸保險）；超過 → 貸 80%。銀行審核約年收入 5 倍上限［ESTIMATE］，30 年
    loanPlan: function (x, total) {
      var c = x.c, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var ltv = total <= c.hgsCap ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 5 * inc));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: ltv > 0.9 ? '浮動利率（首購擔保，免房貸保險）' : '浮動利率' }], note: amt < total * ltv - 1 ? '銀行審核最多約年收入 5 倍' : '' };
    },

    // ---------- 育兒假給付：每週 1,004.70，一人最多 22 週（伴侶保留 4 週）；要繳稅（約 15%）§6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var hh = incomeAt(x, 'A', x.t) + incomeAt(x, 'B', x.t);
      if (g > 186487 && hh > 386525) return 0; // 所得門檻 2025–26：個人 186,487、家庭 386,525（兩者都超過才不能領）［OFFICIAL，2026-10 核對］
      var weeks = Math.min(months * 52 / 12, both ? 13 : 22);
      return weeks * PPL_WEEK * 0.85 * nb;
    },

    // ---------- 稅；家庭稅務補助（FTB A／B）；高所得沒買私人醫療險的附加稅 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var t = person(gA) + person(gB), inc = gA + gB;
      var kids = (x.atHome || []).filter(function (a) { return a < 20; }), n = kids.length;
      // 高所得：買基本私人住院險（或繳附加稅），取較低者［ESTIMATE］
      var mlsTh = s.partner || n ? 202000 + 1500 * Math.max(0, n - 1) : 101000;
      if (inc > mlsTh) t += Math.min(0.01 * inc, s.partner || n ? 4000 : 2500);
      var add = 0;
      if (n) {
        var mx = 0, base = FTB.base * n;
        kids.forEach(function (a) { mx += a < 13 ? FTB.a12 : FTB.a13; });
        // A 部分：兩種算法取高者——最高額每 1 元減 0.2（69,131 起）；基本額每 1 元減 0.3（123,078 起）
        var a1 = Math.max(0, mx - 0.2 * Math.max(0, inc - FTB.free)), a2 = Math.max(0, base - 0.3 * Math.max(0, inc - FTB.hi));
        add += Math.max(a1, a2) + (inc <= 80000 ? FTB.supp * n : 0);
        // B 部分：主要收入者 12 萬以下；夫妻要最小的孩子未滿 13 歲；次要收入者 7,100 以上每 1 元減 0.2
        var yng = Math.min.apply(null, kids), hi = Math.max(gA, gB), lo = s.partner ? Math.min(gA, gB) : 0;
        if (hi <= FTB.bPrimary && (!s.partner || yng < 13)) {
          var b = yng < 5 ? FTB.b5 : FTB.b18;
          add += Math.max(0, b - (s.partner ? 0.2 * Math.max(0, lo - FTB.bFree) : 0)) + (inc <= 80000 ? FTB.bSupp : 0);
        }
      }
      if (x.tr && add) x.tr.allowance = (x.tr.allowance || 0) + add;
      return { si: 0, tax: t };
    }
  };

  // ---------- 工具 ----------
  function famInc(x) { return (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0); }
  function younger(x, k) { // 有比這個孩子大、也還沒上學的兄姊時，算「第二個以上」
    var B = x.births || [];
    for (var j = 0; j < k; j++) { var a = x.t - B[j]; if (a >= 0 && a < 6) return true; }
    return false;
  }
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
  K.person = person; K.duty = duty;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-sg.js ---- */
/* =========================================================================
   新加坡模組（城市國家，一個城市）。金額為新加坡幣、2026 年水準。
   來源與可信度見 research/countries/sg.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：中央公積金（員工 20%＋雇主 17%，其中約 23% 進「普通帳戶」可付頭期款與房貸）、所得稅很低、
   嬰兒花紅與兒童發展帳戶、托育中心有政府補助與收費上限、組屋（HDB）有購屋津貼與 2.6% 組屋貸款、
   請外籍幫傭很普遍、買車要先標擁車證（COE）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 24.94;  // 1 新加坡幣 = 24.94 台幣（2026-10-12）§1［SECONDARY］
  var HDB_RATE = 0.026; // 組屋貸款利率（公積金普通帳戶利率 + 0.1%）§4.4［OFFICIAL］

  // ---------- 制度參數（2026）§3 ----------
  var BR = [[20000, 0], [30000, 0.02], [40000, 0.035], [80000, 0.07], [120000, 0.115], [160000, 0.15], [200000, 0.18], [240000, 0.19], [280000, 0.195], [320000, 0.20], [500000, 0.22], [1000000, 0.23], [Infinity, 0.24]]; // ［OFFICIAL：IRAS］
  var CPF_CAP = 102000; // 每年計算公積金的薪資上限（月薪上限 8,000 起）［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 公積金：員工、雇主費率與普通帳戶（可買房）的比例，依年齡 §3.2［OFFICIAL：2026 年費率］
  function cpfRates(age) {
    if (age <= 35) return { ee: 0.20, er: 0.17, oa: 0.23 };
    if (age <= 45) return { ee: 0.20, er: 0.17, oa: 0.21 };
    if (age <= 50) return { ee: 0.20, er: 0.17, oa: 0.19 };
    if (age <= 55) return { ee: 0.20, er: 0.17, oa: 0.15 };
    if (age <= 60) return { ee: 0.18, er: 0.16, oa: 0.12 };
    return { ee: 0.125, er: 0.125, oa: 0.035 };
  }
  var Y0 = 2026;
  // 托育補助：基本補助（雙薪）＋額外補助（家庭月收入 12,000 以下，越低越多）§6.2［OFFICIAL 金額；額外補助的形狀 ESTIMATE］
  // 2027-01 起額外補助的家庭收入上限提高到 15,000，新增的 12,001–15,000 這一級每月只多補約 80（全日托育）［OFFICIAL：2026 預算案］
  function asOf(asMax, inc, x, infant) {
    if (inc < 12000) return asMax * Math.min(1, (12000 - inc) / 9000);
    if (Y0 + (x.t || 0) >= 2027 && inc < 15000) return infant ? 120 : 80;
    return 0;
  }
  // afterBasic：扣掉基本補助後、還沒扣額外補助的月費
  function careNet(afterBasic, asMax, inc, x, infant) {
    var minCo = U.clamp(3 + (inc - 3000) / 9000 * 97, 3, 100);
    return Math.max(minCo, afterBasic - asOf(asMax, inc, x, infant));
  }
  // 政府支持的托育中心：2028 起分階段降價，2030 年起全日托育每月 150、嬰兒托育 300（額外補助之前）［OFFICIAL：2026 國慶群眾大會］
  function capAfterBasic(x, infant, c) {
    var y = Y0 + (x.t || 0), now = infant ? c.infant - 600 : c.cc - 300, tgt = Math.min(now, infant ? 300 : 150);
    if (y <= 2027) return now;
    if (y >= 2030) return tgt;
    return now + (tgt - now) * (y - 2027) / 3;
  }

  var K = {
    id: 'SG', name: '新加坡', cur: 'SGD', curName: '新加坡幣', flag: '🇸🇬',
    fx: { toTWD: FX, pppToTWD: 16.4, date: '2026-10-12' }, // PPP：新加坡約 0.83、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['人力部 2025 勞動力調查（收入分布，SmartCalculator 整理）', 'https://www.smartcalculator.sg/articles/singapore-income-percentiles-2026'],
      ['人力部 2025 勞動力調查重點', 'https://stats.mom.gov.sg/iMAS_Tables1/LabourForce/LabourForce_2025/mrsd_2025LabourForce_survey_highlights.pdf'],
      ['各年齡收入中位數 2025（Dollars and Sense 整理）', 'https://dollarsandsense.sg/earning-much-peers-much-average-salary-singapore-every-age-group/'],
      ['統計局 2023 家庭支出調查', 'https://www.singstat.gov.sg/-/media/files/visualising_data/infographics/households/HES-householdexpenditure.pdf'],
      ['建屋局 2026 Q2 組屋租金', 'https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260724-2nd-quarter-2026-public-housing-data-and-upcoming-flat-supply/Annex-D.pdf'],
      ['組屋轉售價 2026 Q3', 'https://propkaki.sg/market/questions/how-much-does-a-4-room-hdb-cost'],
      ['組屋轉售價指數 2026 Q3（EdgeProp）', 'https://www.edgeprop.sg/property-news/hdb-resale-prices-dip-02-q-o-q-3q2026-while-transaction-volumes-surge-hdb-flash-estimates'],
      ['托育補助 2026（SmartCalculator）', 'https://www.smartcalculator.sg/articles/childcare-infant-care-subsidy-guide-sg-2026']
    ],
    notes: [
      '只算新加坡公民家庭（可申請組屋與各項補助）。',
      '公積金：員工自付 20%（雇主另付 17%），其中約 23% 進普通帳戶，可付組屋頭期款與房貸；租屋時不能用，錢鎖在帳戶裡。',
      '所得稅很低：年薪 6 萬多約只繳 1,000 多元。',
      '2027 年起出生的孩子適用新的「SG 育兒配套」：嬰兒禮金 10,000＋兒童發展帳戶 5,000 與配對最多 5,000；每個孩子 1–16 歲每年 2,000、17 歲另有 10,000 教育帳戶（2026 年出生的孩子仍領舊的嬰兒花紅，2027 年起也領每年 2,000）。',
      '托育中心（政府指定業者）目前每月收費上限約 610，雙薪家庭每月至少補 300，收入較低補更多；2028 年起分階段降價，2030 年起全日托育每月 150、嬰兒托育 300（額外補助前）。',
      '買組屋：首購有購屋津貼（收入越低越多），組屋貸款利率 2.6%；新組屋（BTO）家庭月收入上限 16,000，實際要等 3–4 年才能入住（模型沒有算等待期）。',
      '買車要先標擁車證，新車約 18 萬新加坡幣。'
    ],

    // ---------- 薪資（全職受僱居民，全年）§2 ----------
    W: {
      // 2025 年全職受僱居民月收入中位數 5,000（不含雇主公積金，含 1/12 年終）［OFFICIAL via SECONDARY］× 12 × 2026 年約 1.04 ≈ 62,000［DERIVED］
      median: 62000,
      // 分位：P20 2,817（0.563）、P90 約 13,500（2.7）［OFFICIAL via SECONDARY］；其他以對數內插；高所得端很長［ESTIMATE］
      // 2026-10 核對：人力部 C10 表，月收入 2 萬以上占 4.7%，P95 約為中位數 3.9–4.0 倍（原 3.6）［OFFICIAL＋DERIVED］
      q: [[10, 0.45], [20, 0.563], [25, 0.62], [30, 0.68], [40, 0.84], [50, 1], [60, 1.18], [70, 1.42], [75, 1.58], [80, 1.78], [90, 2.7], [95, 3.9]],
      paretoAlpha: 2.0,
      ageSpread: 0.85,
      // 年齡：各年齡收入中位數（25–29 歲 4,333、30–34 歲 5,417、35–39 歲 6,250、40–44 歲 6,750、45–49 歲 6,608、50–54 歲 5,958、55–59 歲 4,410）÷ 5,775［DERIVED］
      age: [[22, 0.49], [27, 0.75], [32, 0.94], [37, 1.08], [42, 1.17], [47, 1.14], [52, 1.03], [57, 0.80], [63, 0.55]],
      bonus: 1
    },
    CHECK_SALARIES: [36000, 50000, 62000, 90000, 150000, 250000],

    // ---------- 城市 ----------
    CITY: {
      singapore: {
        id: 'singapore', name: '新加坡', short: '新加坡', capital: true,
        cons: 1.0,
        // 整間組屋租金（2026 Q2 各區中位數的平均）：3 房式約 2,850、4 房式 3,500、5 房式 3,780［OFFICIAL：HDB，DERIVED 平均］；1 房（2 房式或小公寓）［ESTIMATE］§4.1
        rent: [2500, 2850, 3500, 3800], rentAdj: 1.0,
        // 4 房式轉售中位數 628,000（2026 Q3）÷ 93 ㎡ ≈ 6,750；BTO 非成熟區 4 房式約 48 萬 → 約 5,200［OFFICIAL via SECONDARY／ESTIMATE］§4.2
        price: 6750, priceNew: 5200,
        mgmt: 0.9, propTax: 300, // 市鎮會雜費（每 ㎡ 每月）、自住組屋房地稅（每年）［ESTIMATE］
        park: 110, tpass: 120, // 組屋停車月票；大眾運輸每人每月（沒有成人月票）［ESTIMATE］
        infant: 1110, cc: 610, ccPremium: 1800, // 指定業者嬰兒托育、全日托育收費上限；高價私立托育［ESTIMATE］
        studentCare: 350, privateFees: 30000, intl: 45000,
        hobby: 150, cram: { none: 0, some: 400, full: 1200 }, // 補習在新加坡非常普遍［ESTIMATE］
        uniFee: 8500,
        doula: 2000, nurse: 3500 // 坐月子保母（confinement nanny）約 3,500–4,500／28 天［ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2023 家庭支出調查每戶每月 5,931（不含自有住宅設算租金）− 住房與水電 550 = 5,381 ÷ 3.0 人
      // × 0.716 = 1,284 × 物價 2023→2026 約 1.06 ≈ 1,360［DERIVED］§5.1
      adultBase: 1360, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 680], [2, 585], [6, 734], [12, 966], [18, 1074]], // 台灣「孩子／大人」比例 × 新加坡大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 45,
      gearFirst: { frugal: 1000, normal: 2000, comfy: 4000 }, gearLater: 700,
      postpartumFamily: 500,
      grandPaid: 0,
      helper: 1100, // 外籍家庭幫傭：薪資約 700＋人頭稅（有 16 歲以下孩子 60）＋食宿保險［ESTIMATE］
      uniAwayRent: 0,
      master: 15000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 80000, resale: 0.1, life: 5, run: 7000 },   // 擁車證剩 5 年左右的中古車；保險、路稅、電子道路收費、油錢［ESTIMATE］
        new: { buy: 180000, resale: 0.1, life: 10, run: 7500 }, // 含擁車證（10 年）
        import: { buy: 280000, resale: 0.1, life: 10, run: 9000 }
      },
      scooter: { buy: 15000, resale: 0.1, life: 10, run: 1500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 20000, // 65 歲後每人每年：公積金終身入息（CPF LIFE）［ESTIMATE］
      houseSize: { 1: 45, 2: 68, 3: 93, 4: 113 }, // 2 房式／3 房式／4 房式／5 房式組屋［OFFICIAL 標準面積的近似］
      reno: { basic: 100, light: 400, full: 1000 },
      closing: { used: 0.02, new: 0.02 }, homeInsurance: 300, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 3–6 歲讀幼兒園（K1–K2 在 5–6 歲），7 歲上小學，13 歲上中學，17–18 歲讀初級學院，19 歲上大學（男生多先服兵役 2 年，模型沒有算）
    BANDS: { care: 3, es: 7, jh: 13, sh: 17, uni: 19 },
    // 產假 16 週（全薪）＋陪產假 4 週＋共享育兒假 10 週（2026-04 起）：一人請 6 個月，夫妻各 3.5 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3.5 : 6; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) {
      ls.loan = 'bank';
      ls.parking = 'rent';
    },
    MAP: {
      housing: { rent: '租整間組屋', buy: '買組屋（首購津貼、公積金付頭期款與房貸）', family: '和長輩同住（等新組屋時很常見）' },
      build: { used: '轉售組屋', new: '新組屋 BTO（家庭月收入 16,000 以下，要等 3–4 年）' },
      loan: { qingan: '沒有新青安，改用組屋貸款（2.6%）', qinganNoGrace: '沒有新青安，改用組屋貸款（2.6%）', bank: '組屋貸款（2.6%，最多 25 年）' },
      postpartum: { center: '月子中心很少：請坐月子保母（28 天）', nanny: '坐月子保母（28 天）', family: '家人幫忙坐月子' },
      leave: { none: '不請育嬰假', A: '我請 6 個月（產假＋共享育兒假約 26 週全薪，每週上限 2,500）', B: '伴侶請 6 個月（約 26 週全薪）', both: '夫妻各請 3.5 個月（全薪）' },
      care: { quasi: '指定業者托育中心（收費上限＋政府補助）', public: '指定業者托育中心（收費上限＋政府補助）', private: '私立托育中心（政府補助）', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '請外籍家庭幫傭', quit: '一方離職在家照顧' },
      preschool: { public: '指定業者幼兒園（全日）', quasi: '指定業者幼兒園（全日）', private: '私立幼兒園', bilingual: '私立雙語幼兒園', home: '在家照顧' },
      school: { public: '政府學校（公民免學費）', privateJH: '13 歲起讀私立或國際學校', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學生託管中心', anqin1: '學生託管＋1 項才藝', anqin3: '學生託管＋3 項才藝' },
      cram: { none: '不補習', some: '補習（每週 1–2 堂）', full: '密集補習（小六會考、O 水準）' },
      uni: { public: '公立大學（政府資助學費）', private: '公立大學（政府資助學費）', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車（擁車證較便宜）', used: '中古車（含剩餘擁車證）', new: '新車（含擁車證）', import: '進口車（含擁車證）' }
    },

    // ---------- 生產 §6.1 ----------
    // 2026 年出生：嬰兒花紅（第 1–2 胎 11,000、第 3 胎起 13,000）＋兒童發展帳戶（政府撥款 5,000／10,000＋配對）
    // 2027 年起出生（新制「SG 育兒配套」，2027-04-01 起出生適用；這裡以出生年份 2027 起算）：
    // 嬰兒禮金 10,000＋兒童發展帳戶 5,000＋配對最多 5,000，不分胎次［OFFICIAL：population.gov.sg 2026-08，2026-10 核對］
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle, third = k >= 2;
      var pp = s.postpartum === 'center' || s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      x._ptr = (x._ptr || 0) + [5000, 10000, 20000][Math.min(k, 2)]; // 生育稅務回扣（可分年抵稅）
      var grant = Y0 + (x.t || 0) >= 2027 ? 10000 + 5000 + 5000 : (third ? 13000 : 11000) + (third ? 10000 + 12000 : 5000 + 6000);
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 6000 : 1500), grant: grant, local: 0 }; // 公立醫院生產自付約 1,500，私立約 7,500
    },
    // 2026：大家庭方案（第三胎起前 6 年共 16,000）。2027 起改成新制：每個孩子 1–16 歲每年 2,000 兒童津貼、17 歲那年 10,000 教育帳戶
    //（已經出生的孩子也依年齡領；大家庭方案的津貼 2027 年起不再發）［OFFICIAL：population.gov.sg 2026-08］
    allowance: function (x, k, a) {
      if (Y0 + (x.t || 0) >= 2027) return a >= 1 && a <= 16 ? 2000 : a === 17 ? 10000 : 0;
      return k >= 2 && a < 6 ? 16000 / 6 : 0;
    },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var inc = famInc(x) / 12, fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var inf = a === 0 ? 1 : a === 1 ? 0.5 : 0; // 18 個月以下算嬰兒托育
        var g = cs === 'private' ? c.ccPremium * (1 + 0.5 * inf) : c.infant * inf + c.cc * (1 - inf);
        var net = inf * careNet(cs === 'private' ? c.ccPremium * 1.5 - 600 : capAfterBasic(x, true, c), 710, inc, x, true) + (1 - inf) * careNet(cs === 'private' ? c.ccPremium - 300 : capAfterBasic(x, false, c), 467, inc, x, false);
        fee = net * careMonths; sub = (g - net) * careMonths;
      } else if (cs === 'helper') x.helperMonths = Math.max(x.helperMonths || 0, careMonths); // 外籍幫傭（一個家庭一位）
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var inc = famInc(x) / 12, g = ps === 'private' ? c.ccPremium : ps === 'bilingual' ? c.ccPremium * 1.15 : c.cc;
      var net = careNet(ps === 'private' || ps === 'bilingual' ? g - 300 : capAfterBasic(x, false, c), 467, inc, x, false);
      return { fee: net * 12, kg: (g - net) * 12 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privateFees : ({ es: 650, jh: 800, sh: 900 })[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.studentCare * 12 : 0) + hobbies * c.hobby * 12 + (c.cram[s.cram] || 0) * 0.5 * 11; // 小學也很多人補習
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 組屋：BTO 家庭月收入上限 16,000，超過改買轉售組屋；首購津貼（加強版 EHG＋轉售家庭津貼）直接抵房價 §4.3
    housePlan: function (x) {
      var C = x.C, c = x.c, s = x.s, inc = (incomeAt(x, 'A', x.tb) + incomeAt(x, 'B', x.tb)) / 12;
      var keep = s.build;
      if (s.build === 'new' && inc > 16000) s.build = 'used';
      var h;
      try { h = WD.stdHousePlan(x); } finally { s.build = keep; }
      var ehg = inc <= 1500 ? 120000 : inc <= 9000 ? Math.max(5000, 120000 - 5000 * Math.ceil((inc - 1500) / 500)) : 0;
      var fam = (s.build !== 'new' || inc > 16000) && inc <= 16000 ? (h.rooms >= 4 ? 50000 : 80000) : 0;
      var grant = ehg + fam;
      h.grant = grant;
      h.closing = bsd(h.total) + 3000; // 印花稅＋律師與手續費
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax;
      var useDown = Math.min(h.down, grant), left = grant - useDown;
      h.down -= useDown;
      if (left > 0 && h.parts && h.parts[0]) { var cut = Math.min(left, h.parts[0].amt); h.parts[0].amt -= cut; h.loanAmt -= cut; }
      return h;
    },
    // 組屋貸款：最多房價 75%、25 年；月付不能超過家庭月收入 30% §4.4［OFFICIAL］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.75, 0.30 * inc / ann(HDB_RATE, 25)));
      return { parts: [{ amt: amt, rate: HDB_RATE, years: 25, grace: 0, label: '組屋貸款 2.6%' }], note: amt < total * 0.75 - 1 ? '月付不能超過收入 30%' : '' };
    },

    // ---------- 育兒假：政府給付全薪，每週上限 2,500；一人最多約 26 週，夫妻共用時各約 15 週 §6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 15 : 26);
      return weeks * Math.min(2500, g / 52) * 0.8 * nb; // 照薪資扣公積金（約 2 成，進帳戶）
    },

    // ---------- 稅與公積金 §3 ----------
    taxes: function (x) {
      var s = x.s, t = x.t;
      if (!t) { x._oaBal = 0; }
      var kids = (x.atHome || []).filter(function (a) { return a < 19; });
      var ppl = [{ g: x.gA || 0, age: s.ageA + t }, { g: s.partner ? x.gB || 0 : 0, age: s.ageB + t }];
      // 子女扣除：合格子女扣除每人 4,000 給收入較高者；在職母親子女扣除（第 1、2、3 胎起 8,000／10,000／12,000）給另一方［OFFICIAL 金額］
      var hiIdx = ppl[0].g >= ppl[1].g ? 0 : 1, wm = 0;
      kids.forEach(function (a, i) { if (a < 16) wm += [8000, 10000, 12000][Math.min(i, 2)]; });
      var si = 0, tx = 0, eeOA = 0, erOA = 0;
      ppl.forEach(function (p, i) {
        if (!(p.g > 0)) return;
        var r = cpfRates(p.age), base = Math.min(p.g, CPF_CAP);
        var ee = r.ee * base, oa = r.oa * base;
        si += ee; eeOA += oa * r.ee / (r.ee + r.er); erOA += oa * r.er / (r.ee + r.er);
        var relief = 1000 + ee + (i === hiIdx ? 4000 * kids.length : 0) + (s.partner && i !== hiIdx ? wm : !s.partner ? wm : 0);
        tx += tax(Math.max(0, p.g - Math.min(relief, 80000 + ee)), BR);
      });
      // 生育稅務回扣：從應繳稅額扣，用不完留到之後
      var ptr = Math.min(x._ptr || 0, tx); tx -= ptr; x._ptr = (x._ptr || 0) - ptr;
      // 普通帳戶：買房後付房貸與頭期款；租屋或住長輩家時不能用（鎖到 55 歲後）
      var avail = (x._oaBal || 0) + eeOA + erOA;
      var owner = !x.renting && x.ly >= 0;
      var outlay = owner && x.e ? x.e.housing + x.e.housingOnce : 0;
      var use = Math.min(avail, outlay);
      x._oaBal = avail - use;
      // 員工自付的普通帳戶部分：拿來付房子就不算損失；雇主提撥或之前存的部分算成「公積金補助」
      var own = Math.min(use, eeOA);
      if (x.tr) x.tr.fund = (x.tr.fund || 0) + Math.max(0, use - eeOA);
      return { si: si - own, tax: tx };
    }
  };

  // ---------- 工具 ----------
  function ann(r, n) { return r / (1 - Math.pow(1 + r, -n)); }
  function famInc(x) { return (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0); }
  // 買方印花稅（BSD）：前 18 萬 1%、次 18 萬 2%、次 64 萬 3%、次 50 萬 4%、次 150 萬 5%、其餘 6%［OFFICIAL］
  function bsd(p) { return tax(p, [[180000, 0.01], [360000, 0.02], [1000000, 0.03], [1500000, 0.04], [3000000, 0.05], [Infinity, 0.06]]); }
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
  K.bsd = bsd;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-hk.js ---- */
/* =========================================================================
   香港模組（城市，一個城市）。金額為港幣、2026 年水準。
   來源與可信度見 research/countries/hk.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：薪俸稅很低（累進或標準稅率 15% 取低者）、子女免稅額 14 萬、租金或房貸利息可扣除、
   強積金（員工 5%，每月最多 1,500）、0–2 歲托育名額很少（多數家庭請外籍家庭傭工）、
   幼稚園有免費半日、私樓很貴但有居屋（資助出售房屋）、產假 14 週（8 成薪）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 4.092;   // 1 港幣 = 4.092 台幣（聯繫匯率 7.80；美元 31.92，2026-10-12）§1［DERIVED］
  var RATE = 0.034; // 新造按揭：H 按封頂 P − 1.75%（最優惠利率 5%）約 3.25%，取 3.4%§4.4［NEWS／ESTIMATE］

  // ---------- 制度參數（2026/27 課稅年度）§3 ----------
  var PROG = [[50000, 0.02], [100000, 0.06], [150000, 0.10], [200000, 0.14], [Infinity, 0.17]]; // ［OFFICIAL］
  // 2026/27 起：基本免稅額 14.5 萬、已婚 29 萬；子女 14 萬，出生後兩個課稅年度都可再加一份［OFFICIAL：財政預算案，2026-10 核對］
  var BASIC = 145000, MARRIED = 290000, CHILD = 140000;
  var MPF_MAX = 18000;

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 薪俸稅：累進稅率（扣免稅額）與標準稅率 15%（不扣免稅額）取低者
  function salTax(income, ded, allow) {
    var net = Math.max(0, income - ded);
    return Math.min(tax(Math.max(0, net - allow), PROG), 0.15 * Math.min(net, 5000000) + 0.16 * Math.max(0, net - 5000000));
  }
  function mpf(g) { var m = g / 12; return m < 7100 ? 0 : Math.min(0.05 * g, MPF_MAX); }
  // 從價印花稅第 2 標準（2025/26 起 400 萬以下 100 元）；邊際寬減以近似計算 §4.3［OFFICIAL 稅率］
  function avd(p) {
    if (p <= 4000000) return 100;
    var steps = [[4500000, 0.015], [6000000, 0.0225], [9000000, 0.03], [20000000, 0.0375], [Infinity, 0.0425]], r = 0.0425;
    for (var i = 0; i < steps.length; i++) if (p <= steps[i][0]) { r = steps[i][1]; break; }
    return Math.min(r * p, 100 + 0.2 * (p - 4000000));
  }

  var K = {
    id: 'HK', name: '香港', cur: 'HKD', curName: '港幣', flag: '🇭🇰',
    fx: { toTWD: FX, pppToTWD: 2.4, date: '2026-10-12' }, // PPP：香港約 5.7、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['統計處 2025 年收入及工時按年統計調查', 'https://www.info.gov.hk/gia/general/202603/23/P2026032300370.htm'],
      ['統計處 2024/25 住戶開支統計調查', 'https://www.info.gov.hk/gia/general/202606/09/P2026060900321.htm'],
      ['立法會答問：鼓勵生育措施（2026-06）', 'https://www.info.gov.hk/gia/general/202606/17/P2026061700336p.htm'],
      ['差餉物業估價署 2026-08 樓價與租金指數（The Standard）', 'https://www.thestandard.com.hk/property/article/344033/HK-home-prices-edge-up-in-August-rent-hits-new-high'],
      ['外籍家庭傭工最低工資 2026-10', 'https://www.thestandard.com.hk/news/article/344449/HK-raises-minimum-wage-for-foreign-domestic-helpers-to-5220'],
      ['最優惠利率與 HIBOR（The Standard）', 'https://www.thestandard.com.hk/finance/article/319048/Hong-Kong-lenders-keep-prime-rate-unchanged-at-5-percent']
    ],
    notes: [
      '薪俸稅：累進稅率（2%–17%）與標準稅率 15% 取低者；2026/27 起基本免稅額 14.5 萬、子女免稅額每名 14 萬（2026-09-16 以後出生的第 2 胎起 16 萬），出生後兩個年度都可再加一份；有子女時住宅租金或房貸利息每年最多扣 12 萬。',
      '強積金員工自付 5%（每月最多 1,500），算在社保。',
      '0–2 歲資助托兒名額很少，多數雙薪家庭請外籍家庭傭工（最低工資 5,220＋膳食津貼 1,236）。',
      '幼稚園教育計劃：半日免費，全日每月約 1,500 起。',
      '新生嬰兒獎勵金：2026 年施政報告延長 3 年（到 2029 年），每名 2 萬、第 2 胎起 3 萬；2029 年以後出生的沒有算。',
      '「新建案」選項算成居屋（白表家庭月入 6 萬以下、市價 7 折、面積 52 ㎡ 以內、要抽籤）；超過收入上限或需要更大的房子，改買一手私樓。'
    ],

    // ---------- 薪資（全體僱員，月薪 × 12.5）§2 ----------
    W: {
      // 2025 年 5–6 月僱員每月工資中位數 21,200［OFFICIAL］× 2026 年 1.035 × 12.5（年終雙糧）≈ 275,000［DERIVED］
      median: 275000,
      // 分位：P10 11,000、P25 15,300、P75 33,000、P90 51,300［OFFICIAL］；其他以對數內插［DERIVED］
      q: [[10, 0.519], [20, 0.66], [25, 0.722], [30, 0.78], [40, 0.89], [50, 1], [60, 1.17], [70, 1.40], [75, 1.557], [80, 1.80], [90, 2.42], [95, 3.2]],
      paretoAlpha: 2.2,
      ageSpread: 0.85,
      // 年齡：每小時工資中位數 25–34 歲 90、35–44 歲 100、45–54 歲 86.4［OFFICIAL］的形狀［DERIVED／ESTIMATE］
      age: [[22, 0.62], [29.5, 0.98], [39.5, 1.13], [49.5, 1.0], [59.5, 0.8], [63, 0.7]],
      bonus: 0.5
    },
    CHECK_SALARIES: [150000, 220000, 275000, 400000, 600000, 1000000],

    // ---------- 城市 ----------
    CITY: {
      hongkong: {
        id: 'hongkong', name: '香港', short: '香港', capital: true,
        cons: 1.0,
        // 私樓租金（實用面積每呎約 36 元，2026 年創新高）：1 房 28 ㎡、2 房 40 ㎡、3 房 58 ㎡、4 房 80 ㎡［ESTIMATE］§4.1
        rent: [11000, 15500, 21500, 30000], rentAdj: 1.0,
        // 二手實用面積每呎約 13,000（2026 年樓價年升約 11%）→ 每 ㎡ 約 140,000；一手私樓約 183,000；居屋約 90,000［ESTIMATE］§4.2
        price: 140000, priceNew: 183000,
        // 居屋 2025（2026-04／05 申請）：市值 7 折，26.1–52.0 ㎡、約 150–480 萬，平均約 278 萬 → 每 ㎡ 約 7 萬［OFFICIAL＋DERIVED，2026-10 核對：原本 9 萬］
        hos: 70000, hosMaxSize: 52,
        mgmt: 38, propTax: 0.0018, // 管理費（每 ㎡ 每月）、差餉與地租（占樓價）［ESTIMATE］
        park: 3500, tpass: 700, // 車位月租；八達通交通費每人每月［ESTIMATE］
        ccc: 6000, ccPrivate: 10000, kgWhole: 1500, kgPrivate: 6000, kgIntl: 9000, // 托兒所與幼稚園每月［ESTIMATE］
        afterSchool: 2500, dss: 60000, intl: 200000, // 補習社託管（每月）；直資、國際學校（每年）［ESTIMATE］
        hobby: 800, cram: { none: 0, some: 2000, full: 5000 },
        uniFee: 49500, // 教資會資助學士學費：2025/26 44,500、2026/27 47,000、2027/28 49,500（政府新聞處 2024-06）［OFFICIAL］
        doula: 15000, nurse: 30000 // 陪月員（26 天）［ESTIMATE］
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2024/25 住戶開支每月 32,472 ×（1 − 住屋 39.3% − 水電約 2.5%）÷ 每戶約 2.66 人 × 0.716 × 物價 1.02 ≈ 5,200［DERIVED］§5.1
      adultBase: 5200, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 2600], [2, 2236], [6, 2808], [12, 3692], [18, 4108]], // 台灣「孩子／大人」比例 × 香港大人開銷［ESTIMATE］
      utilBase: 700, utilPerPerson: 150,
      gearFirst: { frugal: 5000, normal: 10000, comfy: 20000 }, gearLater: 3000,
      postpartumFamily: 2000,
      grandPaid: 0,
      helper: 6900, // 外籍家庭傭工：最低工資 5,220＋膳食 1,236＋保險與中介費攤提［OFFICIAL／ESTIMATE］
      uniAwayRent: 2000,
      master: 150000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 150000, resale: 0.25, life: 8, run: 30000 }, // 保險、牌費、油錢、隧道費［ESTIMATE］
        new: { buy: 350000, resale: 0.3, life: 10, run: 32000 },
        import: { buy: 600000, resale: 0.35, life: 10, run: 40000 }
      },
      scooter: { buy: 30000, resale: 0.2, life: 8, run: 6000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 60000, // 65 歲後每人每年：強積金提取＋長者生活津貼［ESTIMATE］
      houseSize: { 1: 28, 2: 40, 3: 58, 4: 80 }, // 實用面積［ESTIMATE］
      reno: { basic: 1000, light: 4000, full: 12000 },
      closing: { used: 0.013, new: 0.003 }, homeInsurance: 2000, // 後備值；印花稅另外計算
      rentFactor: 1
    },

    // 6 歲上小一，12 歲上中一，15–17 歲讀高中（中四到中六），18 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    // 產假 14 週（8 成薪）；男士侍產假只有 5 天。夫妻都請時算各 2 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 2 : 3.5; },

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
      housing: { rent: '租私樓', buy: '買樓（首置按揭保險最高 9 成）', family: '和長輩同住' },
      build: { used: '二手私樓', new: '居屋（家庭月入 7 萬以下，要抽籤；超過改買一手私樓）' },
      loan: { qingan: '沒有新青安，改用一般按揭', qinganNoGrace: '沒有新青安，改用一般按揭', bank: '一般按揭（H 按）' },
      postpartum: { center: '香港月子中心少：請陪月員（26 天）', nanny: '陪月員（26 天）', family: '家人幫忙坐月' },
      leave: { none: '不請育嬰假', A: '我請 3.5 個月（產假 14 週，8 成薪）', B: '伴侶請 3.5 個月（14 週，8 成薪）', both: '夫妻各請 2 個月' },
      care: { quasi: '資助托兒所（名額很少）', public: '資助托兒所（名額很少）', private: '私立托兒所', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '請外籍家庭傭工（最常見）', quit: '一方辭職在家照顧' },
      preschool: { public: '幼稚園教育計劃（全日）', quasi: '幼稚園教育計劃（全日）', private: '非計劃私立幼稚園', bilingual: '國際幼稚園', home: '在家照顧' },
      school: { public: '官立／資助學校（免學費）', privateJH: '12 歲起讀直資學校', private: '直資學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '補習社功課輔導', anqin1: '功課輔導＋1 項興趣班', anqin3: '功課輔導＋3 項興趣班' },
      cram: { none: '不補習', some: '補習（每週 1–2 堂）', full: '密集補習（中學文憑試）' },
      uni: { public: '資助大學（學費約 4.45 萬）', private: '資助大學（學費約 4.45 萬）', mixed: '資助大學' },
      transport: { transit: '大眾運輸（港鐵、巴士）', scooter: '機車不常見，改用大眾運輸', used: '二手車', new: '新車', import: '進口名車' }
    },

    // ---------- 生產：公立醫院費用很低，多數中產在私家醫院生產 ----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' || s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      // 新生嬰兒獎勵：每名 2 萬，2026 年施政報告延長 3 年（到 2029 年 10 月），第 2 胎起 3 萬［OFFICIAL＋NEWS，2026-10 核對；第 2 胎起的起算日以 2027 年出生計］
      var y = 2026 + (x.t || 0), grant = y <= 2029 ? (k >= 1 && y >= 2027 ? 30000 : 20000) : 0;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 90000 : ls === 'normal' ? 8000 : 2000), grant: grant, local: 0 }; // 寬裕：私家醫院套餐
    },
    allowance: function () { return 0; },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0;
      if (cs === 'quasi' || cs === 'public') fee = c.ccc * careMonths;
      else if (cs === 'private') fee = c.ccPrivate * careMonths;
      else if (cs === 'helper') x.helperMonths = Math.max(x.helperMonths || 0, careMonths);
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: 0 };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var m = ps === 'private' ? c.kgPrivate : ps === 'bilingual' ? c.kgIntl : c.kgWhole;
      return { fee: m * 12, kg: ps === 'public' || ps === 'quasi' ? 3000 * 12 : 0 }; // 計劃每名學童資助約每月 3,000（只統計）［ESTIMATE］
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.dss : 5000;
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.afterSchool * 11 : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 11;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 居屋：白表家庭月入 6 萬以下（資產 123 萬以下）、而且需要的面積居屋有（52 ㎡ 以內），用居屋價；否則一手私樓。
    // 印花稅、代理佣金 1%、律師費 §4.3［OFFICIAL 收入上限，2026-10 核對：原本 7 萬］
    housePlan: function (x) {
      var C = x.C, c = x.c, s = x.s, inc = (incomeAt(x, 'A', x.tb) + incomeAt(x, 'B', x.tb)) / 12;
      var hos = s.build === 'new' && inc <= 60000 && (x.C.houseSize[x.roomsFinal] || 99) <= (c.hosMaxSize || 99), keep = c.priceNew;
      if (hos) c.priceNew = c.hos;
      var h;
      try { h = WD.stdHousePlan(x); } finally { c.priceNew = keep; }
      h.hos = hos;
      h.closing = avd(h.total) + (s.build === 'new' ? 0 : 0.01 * h.total) + 15000 + (h.loanAmt > 0.7 * h.total ? 0.025 * h.loanAmt : 0); // 按揭保險保費約 2.5%
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax * h.total;
      return h;
    },
    // 按揭：一般 7 成；樓價 1,000 萬以下首置可用按揭保險到 9 成；居屋擔保到 95%；供款不超過收入 50%，30 年 §4.4
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var hos = s.build === 'new' && inc / 12 <= 60000 && (x.C.houseSize[x.roomsFinal] || 99) <= (x.c.hosMaxSize || 99);
      var ltv = hos ? 0.95 : total <= 10000000 ? 0.9 : 0.7;
      var amt = Math.max(0, Math.min(total * ltv, 0.5 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: hos ? '居屋按揭（房委會擔保）' : '按揭（H 按）' }], note: amt < total * ltv - 1 ? '供款不能超過收入 50%' : '' };
    },

    // ---------- 產假：14 週、平均工資 8 成 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 8.7 : 14);
      return weeks * 0.8 * g / 52 * nb;
    },

    // ---------- 薪俸稅與強積金 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 25; }).length;
      // 子女免稅額：每名 14 萬；出生年度與下一年度各另加一份；2026-09-16 以後出生的第 2 胎起每份 16 萬（這裡以 2027 年起出生計）［OFFICIAL：稅務局］
      var y = 2026 + (x.t || 0), childAllow = 0;
      (x.atHome || []).filter(function (a) { return a < 25; }).slice().sort(function (p, q) { return q - p; }).forEach(function (a, i) {
        var amt = i >= 1 && y - a >= 2027 ? 160000 : CHILD;
        childAllow += amt * (a <= 1 ? 2 : 1);
      });
      // 住宅租金或居所貸款利息扣除（有子女每年最多 12 萬，否則 10 萬），算給收入較高的一方
      var housing = x.renting ? (x.rentM || 0) * 12 : (x.mortInt || 0);
      var hd = Math.min(housing, kids ? 120000 : 100000);
      var mA = mpf(gA), mB = mpf(gB), hiA = gA >= gB, tx;
      if (s.partner && (gA <= 0 || gB <= 0)) { // 一方沒收入：合併評稅，用已婚人士免稅額
        tx = salTax(gA + gB, mA + mB + hd, MARRIED + childAllow);
      } else {
        tx = salTax(gA, mA + (hiA ? hd : 0), BASIC + (hiA ? childAllow : 0)) + (s.partner ? salTax(gB, mB + (hiA ? 0 : hd), BASIC + (hiA ? 0 : childAllow)) : 0);
      }
      return { si: mA + mB, tax: tx };
    }
  };

  // ---------- 工具 ----------
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
  K.avd = avd; K.salTax = salTax;

  WD.setupCountry(K);
})(typeof ENGINE !== 'undefined' ? ENGINE : require('./engine.js'), typeof WORLD !== 'undefined' ? WORLD : require('./world.js'), typeof DATA !== 'undefined' ? DATA : require('./data.js'));

/* ---- country-it.js ---- */
/* =========================================================================
   義大利模組（羅馬、杜林）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/it.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）。
   特色：個人課稅（IRPEF 2026 年中間級距降到 33%）、低薪的「勞動稅楔」減免、單一兒童津貼（依家庭經濟指標 ISEE）、
   托嬰補助（bonus nido）、3 歲起幼兒學校免費、5 個月產假（8 成薪，多數由公司補到全薪）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768;  // 1 歐元 = 35.768 台幣（2026-10-09，與法國、德國相同）
  var RATE = 0.035; // 固定利率房貸平均 3.46%（Facile.it，2026-09）§4.4［SECONDARY］

  // ---------- 制度參數（2026）§3 ----------
  var IRPEF = [[28000, 0.23], [50000, 0.33], [Infinity, 0.43]];          // ［NEWS：2026 年預算法］
  var INPS_EE = 0.0949;                                                  // 員工社會保險（9.19% 年金＋0.3%）［OFFICIAL］
  var AUU = { max: 203.8, min: 58.3, lo: 17468.51, hi: 46582.71, dual: 34.9, third: [99.10, 17.5] }; // 單一兒童津貼（每月；INPS 2026-01-30 第 7 號通函）［OFFICIAL；第三胎加給下限 ESTIMATE］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的 IRPEF＋地方附加稅（依收入級距）＋勞動稅楔減免
  function person(g, c) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var si = INPS_EE * g + 0.01 * Math.max(0, g - 56224), ti = g - si;
    var gross = tax(ti, IRPEF);
    var det = ti <= 15000 ? Math.max(690, 1955) : ti <= 28000 ? 1910 + 1190 * (28000 - ti) / 13000 : ti <= 50000 ? 1910 * (50000 - ti) / 22000 : 0;
    var extra = ti <= 20000 ? 0 : ti <= 32000 ? 1000 : ti <= 40000 ? 1000 * (40000 - ti) / 8000 : 0; // 2–4 萬的額外扣抵
    var t = Math.max(0, gross - det - extra);
    var bonus = ti <= 20000 ? g * (g <= 8500 ? 0.071 : g <= 15000 ? 0.053 : 0.048) : 0;          // 2 萬以下的免稅補貼
    var reg = tax(ti, c.addReg) + c.addCom * ti;                                                   // 大區與市的附加稅
    return { si: si, tax: Math.max(-bonus, t - bonus) + reg };
  }
  // 家庭經濟指標（ISEE，簡化）：所得扣 20%（每人最多 3,000）、房租（最多 7,000）＋ 20% 存款，除以家庭人數權重 §3.3［簡化 ESTIMATE］
  function isee(x) {
    var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
    var isr = gA - Math.min(0.2 * gA, 3000) + gB - Math.min(0.2 * gB, 3000) - (x.renting ? Math.min((x.rentM || 0) * 12, 7000) : 0);
    var isp = 0.2 * Math.max(0, (x.S || 0) - 10000);
    var n = x.persons || 1, kids = (x.atHome || []).filter(function (a) { return a < 18; }).length;
    var scale = [1, 1, 1.57, 2.04, 2.46, 2.85][Math.min(n, 5)] + 0.35 * Math.max(0, n - 5) + (kids >= 3 ? 0.2 : 0) + (gA > 0 && gB > 0 && kids ? 0.2 : 0);
    return Math.max(0, isr + isp) / scale;
  }

  var K = {
    id: 'IT', name: '義大利', cur: 'EUR', curName: '歐元', flag: '🇮🇹',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 21.5, date: '2026-10-09' }, // PPP：義大利約 0.63、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['ISTAT 民間薪資結構 2022（RACLI）', 'https://www.istat.it/wp-content/uploads/2025/02/REPORT_RACLI_2024.pdf'],
      ['IRPEF 2026 稅率與扣抵（Money.it）', 'https://www.money.it/riforma-irpef-regole-per-il-2026-come-calcolare-tasse'],
      ['單一兒童津貼 2026（InformazioneFiscale）', 'https://www.informazionefiscale.it/assegno-unico-inps-tabella-isee-2026-importo-calcolo-aumento'],
      ['ISTAT 2025 家庭消費（Teleborsa）', 'https://www.teleborsa.it/DettaglioNews/73_2026-10-08_TLB/Istat-spesa-media-delle-famiglie-stabile-a-2782-euro-nel-2025-cresce-lalimentare.html'],
      ['Immobiliare.it 2026 上半年房價與租金', 'https://m.dellevittorie.it/mercato-immobiliare-h1-2026-insights/'],
      ['房貸利率 2026-09（Facile.it）', 'https://www.facile.it/mutui/news/mutui-media-tassi-settembre-2026.html']
    ],
    notes: [
      '義大利是個人分開課稅：所得稅 23%／33%／43%，另有大區與市的附加稅；員工社會保險約 9.5%。',
      '單一兒童津貼每個孩子每月 58–204 歐元，依家庭經濟指標（ISEE）計算；1 歲以下多 5 成，雙薪家庭另有加給。',
      '0–2 歲公立托嬰依 ISEE 收費、名額不足；托嬰補助每年最多 3,600 歐元。3–5 歲幼兒學校免費，只付餐費。',
      '產假 5 個月（8 成薪，多數公司依團體協約補到全薪），之後的育兒假前 3 個月 8 成、之後 3 成。',
      '35 歲以下、ISEE 4 萬以下首購可用政府擔保貸到 9 成以上。'
    ],

    // ---------- 薪資（全職受僱者，全年，含第 13 個月）§2 ----------
    W: {
      // 2026-10 核對：原本用只含民間的 RACLI 時薪推估 28,500，偏低。ISTAT 2022 薪資結構調查（含公部門，10 人以上單位）
      // 全職等值平均年薪 37,302 × 時薪中位數／平均（13.35 ÷ 16.4）≈ 30,400 × 2022→2026 約 1.11 ≈ 33,700；
      // 10 人以下的小企業薪資較低，往下取 32,000［DERIVED／ESTIMATE］
      median: 32000,
      // 十分位：時薪 P10、P90 介於 RACLI（0.717／1.87）與 SES（0.66／1.99）之間［OFFICIAL＋DERIVED］；其他內插［ESTIMATE］
      q: [[10, 0.68], [20, 0.77], [25, 0.81], [30, 0.85], [40, 0.92], [50, 1], [60, 1.09], [70, 1.21], [75, 1.30], [80, 1.42], [90, 1.93], [95, 2.45]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      // 年齡：30 歲以下時薪中位數 10.50（0.89）、50 歲以上 12.85（1.09）；義大利年資加薪明顯［DERIVED／ESTIMATE］
      age: [[22, 0.78], [27, 0.86], [35, 0.97], [45, 1.05], [55, 1.12], [63, 1.12]],
      bonus: 1
    },
    CHECK_SALARIES: [20000, 24000, 28500, 40000, 60000, 90000],

    // ---------- 城市 ----------
    CITY: {
      rome: {
        id: 'rome', name: '羅馬', short: '羅馬', capital: true,
        cons: 1.06, // 中部家庭支出略高於全國［ESTIMATE］
        // 刊登租金每 ㎡ 19.2（idealista 2026 Q3）× 0.9 ≈ 17.3（和台灣 591 × 0.9 同規則）［SECONDARY／DERIVED］；1–4 房 50／75／95／120 ㎡
        rentM2: 17.3, rentSize: [50, 75, 95, 120], rentAdj: 1.0,
        price: 3500, priceNew: 4400, // 刊登價 3,826，成交約低 8%［DERIVED］；新建約高 25%［ESTIMATE］§4.2
        mgmt: 2.2, // 公寓管理費（每 ㎡ 每月）［ESTIMATE］
        addReg: [[15000, 0.0173], [28000, 0.0273], [Infinity, 0.0333]], addCom: 0.009, // 拉齊奧大區、羅馬市附加稅［ESTIMATE］
        park: 80, tpass: 35, // 羅馬大眾運輸月票 35［OFFICIAL］
        nidoMax: 440, nidoPriv: 650, mensa: 60, // 市立托嬰最高每月 440（ISEE 5 萬以上），餐費每年最多約 720［SECONDARY，2026-10 核對］
        after: 1800, privFees: { es: 3500, jh: 4500, sh: 5500 }, intl: 15000,
        hobby: 60, cram: { none: 0, some: 120, full: 350 },
        doula: 1000, nurse: 2400
      },
      turin: {
        id: 'turin', name: '杜林', short: '杜林', capital: false,
        cons: 1.08, // 西北區家庭支出高於全國［ESTIMATE］
        rentM2: 12.2, rentSize: [50, 75, 95, 120], rentAdj: 1.0, // 刊登每 ㎡ 13.5（idealista 2026 Q3）× 0.9［SECONDARY／DERIVED］
        price: 1950, priceNew: 2800, // 2026 上半年漲 8.3%［SECONDARY］；每 ㎡［ESTIMATE］
        mgmt: 2.0,
        addReg: [[15000, 0.0162], [28000, 0.0213], [50000, 0.0275], [Infinity, 0.0332]], addCom: 0.008, // 皮埃蒙特大區、杜林市［ESTIMATE］
        park: 60, tpass: 38,
        nidoMax: 520, nidoPriv: 600, mensa: 80,
        after: 1500, privFees: { es: 3000, jh: 4000, sh: 5000 }, intl: 13000,
        hobby: 55, cram: { none: 0, some: 110, full: 320 },
        doula: 900, nurse: 2200
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2025 家庭消費每月 2,782 ×（1 − 住房與能源 36%）÷ 每戶約 2.25 人 × 0.716 × 物價 1.03 ≈ 585［DERIVED］§5.1
      adultBase: 585, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 293], [2, 252], [6, 316], [12, 415], [18, 462]], // 台灣「孩子／大人」比例 × 義大利大人開銷［ESTIMATE］
      utilBase: 120, utilPerPerson: 35, // 電、瓦斯、水、網路、垃圾稅［ESTIMATE］
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      tata: 1300,        // 保母（tata）全職每月［ESTIMATE］
      nidoCost: 900,     // 公立托嬰名額每月實際成本（只統計補助）［ESTIMATE］
      uniAwayRent: 550,
      master: 2000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 10000, resale: 0.25, life: 8, run: 2800 }, // 保險、油錢、保養、汽車稅［ESTIMATE］
        new: { buy: 22000, resale: 0.35, life: 10, run: 2900 },
        import: { buy: 38000, resale: 0.4, life: 10, run: 3600 }
      },
      scooter: { buy: 3000, resale: 0.2, life: 8, run: 600 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 19000, // 65 歲後每人每年（公共年金，稅後）［ESTIMATE］
      houseSize: { 1: 50, 2: 75, 3: 95, 4: 120 },
      reno: { basic: 50, light: 200, full: 800 },
      closing: { used: 0.045, new: 0.045 }, homeInsurance: 250,
      rentFactor: 1
    },

    // 3–5 歲幼兒學校，6 歲小學，11 歲初中，14–18 歲高中（5 年），19 歲上大學
    BANDS: { care: 3, es: 6, jh: 11, sh: 14, uni: 19 },
    // 一人請 9 個月（產假 5 個月＋育兒假 4 個月），夫妻都請時各 6 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 6 : 9; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋', buy: '買房（首購稅費較低，35 歲以下可用政府擔保）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸（35 歲以下有政府擔保）', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（固定利率 30 年）' },
      postpartum: { center: '義大利沒有月子中心：請產後陪伴', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 9 個月（產假 5 個月＋育兒假）', B: '伴侶請 9 個月', both: '夫妻各請 6 個月' },
      care: { quasi: '公立托嬰（依 ISEE 收費，名額不足）', public: '公立托嬰（依 ISEE 收費）', private: '私立托嬰', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶（很常見）', helper: '請保母（tata）', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒學校（免學費，只付餐費）', quasi: '公立幼兒學校（免學費）', private: '私立幼兒學校', bilingual: '雙語幼兒學校', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '11 歲起讀私立學校', private: '私立學校（paritaria）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '課後班＋暑期營隊', anqin1: '課後班＋營隊＋1 項才藝', anqin3: '課後班＋營隊＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教' },
      uni: { public: '公立大學（學費依 ISEE）', private: '私立大學', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      var grant = isee(x) <= 40000 ? 1000 : 0; // 新生兒卡 1,000［NEWS］
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 3000 : 0), grant: grant, local: 0 };
    },
    // 單一兒童津貼（每個孩子，未滿 21 歲）
    allowance: function (x, k, a) {
      if (a >= 21) return 0;
      var I = isee(x), f = U.clamp((AUU.hi - I) / (AUU.hi - AUU.lo), 0, 1);
      var base = AUU.min + (AUU.max - AUU.min) * f;
      if (a >= 18) base *= 0.49; // 18–20 歲（在學）約一半
      // 未滿 1 歲加 5 成；有 3 個以上孩子時，1–2 歲也加 5 成；4 個以上孩子的家庭每月另加 150（算在老大）［OFFICIAL］
      var m = base * (a === 0 || (a < 3 && x.s.kids >= 3) ? 1.5 : 1) + ((x.gA > 0 && x.s.partner && x.gB > 0) ? AUU.dual * f : 0) + (k >= 2 ? AUU.third[1] + (AUU.third[0] - AUU.third[1]) * f : 0);
      if (k === 0 && x.s.kids >= 4) m += 150;
      return m * 12;
    },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0, I = isee(x);
      if (cs === 'quasi' || cs === 'public') { var m = U.clamp(I * 0.011, 50, c.nidoMax); fee = m * careMonths; sub = Math.max(0, C.nidoCost - m) * careMonths; }
      else if (cs === 'private') fee = c.nidoPriv * careMonths;
      else if (cs === 'helper') fee = C.tata * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      // 托嬰補助（bonus nido）：ISEE 4 萬以下每年 3,600、以上 1,500，不超過實付
      if (fee > 0 && (cs === 'quasi' || cs === 'public' || cs === 'private')) { var bn = Math.min(fee, (I <= 40000 ? 3600 : 1500) * careMonths / 12); fee -= bn; sub += bn; }
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var fee = ps === 'private' ? 3000 : ps === 'bilingual' ? 6000 : c.mensa * 10;
      return { fee: fee, kg: ps === 'public' || ps === 'quasi' ? 6000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privFees[level] : ({ es: 300, jh: 600, sh: 650 })[level];
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.after : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 公立大學學費依 ISEE：2.2 萬以下只付地方稅約 156［OFFICIAL 免繳門檻；以上 ESTIMATE］
    uni: function (x, k, a) { var I = isee(x); return { fee: I <= 22000 ? 156 : Math.min(3000, 156 + 0.075 * (I - 22000)), sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var h = WD.stdHousePlan(x);
      h.closing = h.total * 0.045 + 3000; // 中古：登記稅（地籍價值 2%）＋仲介 3.66%；新建：增值稅 4%；另加公證［ESTIMATE］
      h.tax = 0;                           // 自住首購免房屋稅（IMU）
      return h;
    },
    // 房貸：貸 8 成、30 年；35 歲以下且 ISEE 4 萬以下可用首購擔保基金貸到 95%；月付不超過淨收入約 1/3（稅前 25%）§4.4
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var young = Math.min(s.ageA, s.partner ? s.ageB : 99) + tb < 36;
      var ltv = young && inc * 0.8 / 2.5 <= 40000 ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 0.25 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: ltv > 0.9 ? '首購擔保房貸（固定利率）' : '固定利率房貸' }], note: amt < total * ltv - 1 ? '月付不能超過收入約 1/3' : '' };
    },

    // ---------- 產假與育兒假：前 5 個月約全薪（法定 8 成＋公司補足），之後 3 個月 8 成、其餘 3 成；要繳稅 §6.3 ----------
    leavePay: function (g, ind, months, nb, x, who) {
      var both = x.s.leave === 'both' && x.s.partner, m = g / 12, pay;
      if (both) pay = Math.min(months, 2.5) * m + Math.min(Math.max(months - 2.5, 0), 1.5) * 0.8 * m + Math.max(months - 4, 0) * 0.3 * m;
      else pay = Math.min(months, 5) * m + Math.min(Math.max(months - 5, 0), 3) * 0.8 * m + Math.max(months - 8, 0) * 0.3 * m;
      return pay * 0.8 * nb;
    },

    taxes: function (x) {
      var s = x.s, c = x.c;
      var a = person(x.gA || 0, c), b = person(s.partner ? x.gB || 0 : 0, c);
      return { si: a.si + b.si, tax: a.tax + b.tax };
    }
  };

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

/* ---- country-es.js ---- */
/* =========================================================================
   西班牙模組（馬德里、瓦倫西亞）。金額為歐元、2026 年水準。
   來源與可信度見 research/countries/es.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   顯示單位：千歐元（unit 1000）。
   特色：所得稅分中央與自治區兩半（馬德里最低、瓦倫西亞較高）、子女最低生活扣除、在職母親 3 歲以下每年 1,200 抵稅、
   父母各 19 週全薪產假／陪產假、0–3 歲公立托育免費（馬德里公立、瓦倫西亞全區）、買房稅費很高（中古 6–10%）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 35.768;
  var RATE = 0.032; // 固定利率房貸約 3.0–3.3%（2026 年歐洲央行升息中）［ESTIMATE］§4.4

  // ---------- 制度參數（2026）§3 ----------
  var STATE = [[12450, 0.095], [20200, 0.12], [35200, 0.15], [60000, 0.185], [300000, 0.225], [Infinity, 0.245]]; // 中央［OFFICIAL］
  var SS_EE = 0.065, SS_MAX = 61200;   // 員工社會保險 6.5%（含世代公平機制），投保上限約每月 5,101［ESTIMATE：2026 年值］
  var DESC = [2400, 2700, 4000, 4500]; // 子女最低生活額（每位，父母各一半）；3 歲以下另加 2,800［OFFICIAL］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的稅：工作收入淨額 −「工作收入減除」→ 稅基；稅額 = 級距稅(稅基) − 級距稅(個人與家庭最低生活額)
  function person(g, c, minFam) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var si = SS_EE * Math.min(g, SS_MAX), net = g - si - 2000;
    var red = net <= 14852 ? 7302 : net <= 17673 ? 7302 - 1.75 * (net - 14852) : net <= 19747 ? 2364 - 1.14 * (net - 17673) : 0;
    var base = Math.max(0, net - red), m = Math.min(base, 5550 + minFam);
    var t = Math.max(0, tax(base, STATE) - tax(m, STATE)) + Math.max(0, tax(base, c.reg) - tax(m, c.reg));
    return { si: si, tax: t };
  }

  var K = {
    id: 'ES', name: '西班牙', cur: 'EUR', curName: '歐元', flag: '🇪🇸',
    unit: 1000, unitName: '千歐元',
    fx: { toTWD: FX, pppToTWD: 22.0, date: '2026-10-09' }, // PPP：西班牙約 0.62、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['INE 2024 年薪資結構（中位數 24,497）', 'https://ine.es/dyngs/Prensa/EAES2024.htm'],
      ['INE 2025 家庭支出調查', 'https://ine.es/dyngs/Prensa/EPF2025.pdf'],
      ['所得稅 2026 中央級距（GuiaFiscal）', 'https://guiafiscal.es/irpf/tramos-irpf-2026/'],
      ['idealista 2026-09 馬德里房價', 'https://www.idealista.com/news/node/904703'],
      ['idealista 2026 第 2 季租金', 'https://www.esdiario.com/economia/260701/192073/alquiler-espana-sigue-marcando-maximos-cierra-trimestre-subida-interanual-4-2.html'],
      ['瓦倫西亞 0–3 歲免費教育', 'https://valencianews.es/politica/beatriz-gasco-mas-de-42-000-plazas-garantizan-la-gratuidad-de-la-educacion-de-0-a-3-anos-en-la-comunitat/'],
      ['馬德里公立 0–3 歲免費（自治區新聞稿）', 'https://www.comunidad.madrid/press-releases/download/110248']
    ],
    notes: [
      '西班牙是個人分開課稅：所得稅一半是中央、一半是自治區（馬德里稅率最低、瓦倫西亞較高）；員工社會保險約 6.5%。',
      '孩子透過「最低生活額」減稅；在職母親的孩子 3 歲以前每年另抵 1,200。',
      '父母各有 19 週全薪的出生假（免稅），不能互相轉讓。',
      '0–3 歲：馬德里公立托育免費、瓦倫西亞參加計畫的托育中心都免費（名額有限），只付餐費。',
      '買中古屋要付移轉稅（馬德里 6%、瓦倫西亞 10%），新成屋付 10% 增值稅；35 歲以下有政府擔保可貸到 9 成以上。'
    ],

    // ---------- 薪資（全職受僱者，全年，含 14 個月薪）§2 ----------
    W: {
      // 2024 年全體受僱者年薪中位數 24,497［OFFICIAL：INE］× 全職約 1.15 × 2024→2026 約 1.045 ≈ 29,500［DERIVED／ESTIMATE］
      median: 29500,
      // 十分位：法定最低工資 2026 年 1,221 × 14 ≈ 17,100（約 0.58）；形狀參考 INE 歷年分位［ESTIMATE］
      q: [[10, 0.62], [20, 0.70], [25, 0.74], [30, 0.79], [40, 0.89], [50, 1], [60, 1.12], [70, 1.27], [75, 1.36], [80, 1.48], [90, 1.85], [95, 2.35]],
      paretoAlpha: 2.6,
      ageSpread: 0.85,
      age: [[22, 0.65], [27, 0.80], [35, 0.97], [45, 1.08], [55, 1.14], [63, 1.12]], // ［ESTIMATE］
      bonus: 2
    },
    CHECK_SALARIES: [18000, 24000, 29500, 40000, 60000, 90000],

    // ---------- 城市 ----------
    CITY: {
      madrid: {
        id: 'madrid', name: '馬德里', short: '馬德里', capital: true,
        cons: 1.12, // 馬德里家庭支出為全國最高之一［ESTIMATE］
        // 刊登租金每 ㎡ 23.7（2026 Q2，年增 7.6%）［NEWS］；新簽約混合約 21［ESTIMATE］
        rentM2: 21, rentSize: [55, 75, 95, 120], rentAdj: 1.0,
        price: 5800, priceNew: 7000, // 刊登價 6,458（2026-09）［SECONDARY］，成交約低 10%［DERIVED］
        mgmt: 1.2, propTax: 0.0015,
        closing: { used: 0.06, new: 0.1075 }, // 移轉稅 6%；新成屋增值稅 10%＋印花 0.75%［OFFICIAL 稅率］
        reg: [[13362, 0.085], [19004, 0.107], [35425, 0.128], [57320, 0.174], [Infinity, 0.205]], // 馬德里自治區級距［ESTIMATE：2025 值］
        // 馬德里出生扣抵：每位 721.70，出生當年起 3 年；稅基 30,930（單獨）／37,322.20（合併）以下［OFFICIAL，2026-10 核對］
        birthDed: [721.70, 721.70, 721.70], birthLim: { single: [30930, 30930], joint: [37322, 37322], family: 61860 },
        park: 100, tpass: 35,
        careFree: true, carePriv: 500, nanny: 1350, meals: 110,
        privFees: { es: 1800, jh: 1800, sh: 2000 }, priv2: 8000, intl: 12000,
        after: 2000, hobby: 60, cram: { none: 0, some: 100, full: 280 },
        uniFee: 1300, doula: 900, nurse: 2200
      },
      valencia: {
        id: 'valencia', name: '瓦倫西亞', short: '瓦倫西亞', capital: false,
        cons: 0.97,
        rentM2: 14.7, rentSize: [55, 75, 95, 120], rentAdj: 1.0, // 刊登每 ㎡ 16.3（idealista 2026-07）× 0.9，和台灣 591 × 0.9 同規則［SECONDARY／DERIVED］
        price: 3100, priceNew: 3850, // 刊登 3,378（2026-05）–3,485（2026-07），成交約低 10%［SECONDARY／DERIVED］
        mgmt: 1.0, propTax: 0.002,
        closing: { used: 0.09, new: 0.114 }, // 2026-06 起移轉稅 9%、印花 1.4%（Ley 5/2025）［OFFICIAL］
        reg: [[12000, 0.088], [22000, 0.12], [32000, 0.15], [42000, 0.175], [52000, 0.20], [62000, 0.225], [72000, 0.25], [100000, 0.265], [150000, 0.275], [200000, 0.285], [Infinity, 0.2935]], // 2026 最低 8.80%、最高 29.35%（Ley 5/2026），中間各級［ESTIMATE：2025 值］
        // 瓦倫西亞出生扣抵（Ley 5/2025）：第 1／2／3 胎起 600／750／900，出生當年起 3 年；
        // 稅基 27,000（單獨）／44,000（合併）以下全額，到 30,000／47,000 遞減到 0［OFFICIAL，2026-10 核對：原本 300 少算］
        birthDed: [600, 750, 900], birthLim: { single: [27000, 30000], joint: [44000, 47000] },
        park: 70, tpass: 30,
        careFree: true, carePriv: 400, nanny: 1250, meals: 100,
        privFees: { es: 1500, jh: 1500, sh: 1700 }, priv2: 6500, intl: 10000,
        after: 1700, hobby: 50, cram: { none: 0, some: 90, full: 250 },
        uniFee: 400, doula: 800, nurse: 2000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：2025 家庭支出每人每年 14,066 ×（1 − 住房與水電 33.2%）÷ 12 × 0.716 × 物價 1.03 ≈ 578［DERIVED］§5.1
      adultBase: 578, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 289], [2, 249], [6, 312], [12, 410], [18, 457]], // ［ESTIMATE］
      utilBase: 90, utilPerPerson: 35,
      gearFirst: { frugal: 800, normal: 1500, comfy: 3000 }, gearLater: 500,
      postpartumFamily: 300,
      grandPaid: 0, helper: 0,
      careValue: 600, // 公立托育名額每月實際成本（只統計補助）［ESTIMATE］
      uniAwayRent: 450,
      master: 2500,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: 26000 }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.25, life: 8, run: 2600 },
        new: { buy: 25000, resale: 0.35, life: 10, run: 2700 },
        import: { buy: 40000, resale: 0.4, life: 10, run: 3300 }
      },
      scooter: { buy: 3000, resale: 0.2, life: 8, run: 500 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 18500, // 65 歲後每人每年（公共年金，稅後）［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 95, 4: 120 },
      reno: { basic: 50, light: 200, full: 800 },
      closing: { used: 0.08, new: 0.11 }, homeInsurance: 250,
      rentFactor: 1
    },

    // 3–5 歲幼兒教育（免費），6 歲小學，12 歲國中（ESO），16–17 歲高中（Bachillerato），18 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 16, uni: 18 },
    leaveMonths: function () { return 4.4; }, // 出生假 19 週（父母各自，不能轉讓）

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },

    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋', buy: '買房（中古屋移轉稅 6–10%、新成屋增值稅 10%）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新成屋' },
      loan: { qingan: '沒有新青安，改用一般房貸（35 歲以下有政府擔保）', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（固定利率 30 年）' },
      postpartum: { center: '西班牙沒有月子中心：請產後陪伴', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請出生假', A: '我請 19 週出生假（全薪、免稅）', B: '伴侶請 19 週出生假', both: '夫妻各請 19 週（全薪、不能轉讓）' },
      care: { quasi: '公立托育（免費，只付餐費；名額有限）', public: '公立托育（免費，只付餐費）', private: '私立托育', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶（很常見）', helper: '請保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒教育（免費）', quasi: '公辦民營學校（concertada）', private: '私立學校', bilingual: '雙語私立學校', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀公辦民營學校', private: '公辦民營學校（每月自願費）', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校午餐＋課後與暑期營隊', anqin1: '午餐＋課後＋1 項才藝', anqin3: '午餐＋課後＋3 項才藝' },
      cram: { none: '不補習', some: '補習班（每週 1–2 堂）', full: '密集補習' },
      uni: { public: '公立大學', private: '私立大學', mixed: '公立大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp + (ls === 'comfy' ? 3500 : 0), grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 子女優惠都在稅（taxes）裡
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') { fee = c.meals * careMonths; sub = C.careValue * careMonths; }
      else if (cs === 'private') fee = c.carePriv * careMonths;
      else if (cs === 'helper') fee = c.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      if (fee > 0) x.y.dc = (x.y.dc || 0) + fee;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var fee = ps === 'public' ? c.meals * 9 : ps === 'quasi' ? c.privFees.es + c.meals * 9 : ps === 'bilingual' ? c.intl * 0.7 : c.priv2 * 0.8;
      return { fee: fee, kg: ps === 'public' ? 4000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privFees[level] : (level === 'es' ? 300 : 450);
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.after : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    uni: function (x, k, a) { return { fee: x.c.uniFee, sub: 0 }; },

    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentSize[r - 1] * c.rentM2 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = h.total * c.closing[x.s.build === 'new' ? 'new' : 'used'] + 2000; // 公證、登記、代書
      h.mgmt = c.mgmt * h.size * 12; h.tax = c.propTax * h.total;
      return h;
    },
    // 房貸：貸 8 成、30 年；35 歲以下且每人年收入約 3.8 萬以下可用國家擔保（ICO）貸到 95%；月付不超過淨收入約 35%（稅前 28%）
    loanPlan: function (x, total) {
      var s = x.s, tb = x.tb, gA = incomeAt(x, 'A', tb), gB = incomeAt(x, 'B', tb), inc = gA + gB;
      var young = Math.min(s.ageA, s.partner ? s.ageB : 99) + tb < 35 && Math.max(gA, gB) <= 37800;
      var ltv = young ? 0.95 : 0.8;
      var amt = Math.max(0, Math.min(total * ltv, 0.28 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: young ? '國家擔保房貸（35 歲以下）' : '固定利率房貸' }], note: amt < total * ltv - 1 ? '月付不能超過淨收入約 35%' : '' };
    },

    // ---------- 出生假：19 週全薪（投保上限內）、免稅 ----------
    leavePay: function (g, ind, months, nb) {
      var weeks = Math.min(19, months * 52 / 12);
      return weeks * Math.min(g, SS_MAX) / 52 * nb;
    },

    // ---------- 稅與社保；子女最低生活額、在職母親抵稅、多子女 §3 ----------
    taxes: function (x) {
      var s = x.s, c = x.c, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = (x.atHome || []).filter(function (a) { return a < 25; });
      var minFam = 0;
      kids.slice().sort(function (p, q) { return q - p; }).forEach(function (a, i) { minFam += DESC[Math.min(i, 3)] + (a < 3 ? 2800 : 0); });
      var share = s.partner && gA > 0 && gB > 0 ? 0.5 : 1;
      var pa = person(gA, c, gA > 0 ? minFam * share : 0), pb = person(gB, c, gB > 0 ? minFam * (s.partner && gA > 0 ? 0.5 : 1) : 0);
      var tx = pa.tax + pb.tax;
      // 在職母親：每個 3 歲以下的孩子每年 1,200，另加托育費最多 1,000（可退）；多子女家庭 1,200
      var u3 = kids.filter(function (a) { return a < 3; }).length, mom = s.partner ? (gB > 0 ? gB : gA) : gA;
      if (mom > 0 && u3) tx -= 1200 * u3 + Math.min(1000 * u3, x.y.dc || 0);
      if (kids.length >= 3 && gA + gB > 0) tx -= 1200;
      // 自治區出生扣抵：3 歲內的孩子依胎次；稅基（工作收入扣社保與 2,000）超過上限就沒有，上下限之間遞減
      if (u3 && gA + gB > 0) {
        var bA = gA > 0 ? Math.max(0, gA - SS_EE * Math.min(gA, SS_MAX) - 2000) : 0, bB = gB > 0 ? Math.max(0, gB - SS_EE * Math.min(gB, SS_MAX) - 2000) : 0;
        // 夫妻可以分開申報（各拿一半、各自看單獨上限）或合併申報（看合併上限），取比較有利的
        var L = c.birthLim, fac = function (b, lim) { return b <= lim[0] ? 1 : b >= lim[1] ? 0 : (lim[1] - b) / (lim[1] - lim[0]); }, f;
        if (!s.partner) f = fac(bA, L.single);
        else {
          var indiv = 0.5 * fac(bA, L.single) + 0.5 * fac(bB, L.single);
          if (L.family && bA + bB > L.family) indiv = 0;
          f = Math.max(indiv, fac(bA + bB, L.joint));
        }
        kids.slice().sort(function (p, q) { return q - p; }).forEach(function (a, i) { if (a < 3) tx -= f * c.birthDed[Math.min(i, 2)]; });
      }
      return { si: pa.si + pb.si, tax: tx };
    }
  };

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

/* ---- country-il.js ---- */
/* =========================================================================
   以色列模組（特拉維夫、海法）。金額為新謝克爾、2026 年水準。
   來源與可信度見 research/countries/il.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：已開發國家裡生育率最高（約 2.9）。個人課稅、「稅額點數」制度（母親與幼兒的點數多）、
   國民保險＋健保稅、兒童津貼與生育補助、3 歲起幼兒園免費、15 週全薪產假、18–20 歲服兵役（父母負擔較輕）、
   特拉維夫房價極高。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 10.38;  // 1 新謝克爾 = 10.38 台幣（2026-10-12）§1［SECONDARY］
  var RATE = 0.048; // 房貸組合（基本利率連動約 4.5%＋固定）平均約 4.8%；央行利率 3.5%、基本利率 5%（2026-07）§4.4［NEWS／ESTIMATE］

  // ---------- 制度參數 §3 ----------
  // 2026 級距：其餘凍結在 2025 值，但 20% 級距放寬到 228,000、31% 到 301,200（2026 預算）［SECONDARY：PwC］
  var BR = [[84120, 0.10], [120720, 0.14], [228000, 0.20], [301200, 0.31], [560280, 0.35], [721560, 0.47], [Infinity, 0.50]];
  var POINT = 242 * 12;            // 每個稅額點數每年抵稅：每月 242（2024–2026 凍結）［SECONDARY：PwC，2026-10 核對］
  var NI_LO = 90264, NI_HI = 608340; // 國民保險＋健保：平均工資 60% 以下 4.27%、以上 12.17%，上限［ESTIMATE］
  var ALLOW = [173, 219, 219, 219, 173]; // 兒童津貼（每月，依胎次；2026-01 起）［OFFICIAL：國民保險局，2026-10 核對］
  var GRANT = [2103, 946, 631];          // 生育補助 2026［OFFICIAL：國民保險局，2026-10 核對］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  function person(g, points) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var ni = 0.0427 * Math.min(g, NI_LO) + 0.1217 * U.clamp(g - NI_LO, 0, NI_HI - NI_LO);
    var pen = 0.06 * g;                                   // 強制退休金員工 6%
    var credit = points * POINT + 0.35 * Math.min(pen, 0.07 * Math.min(g, 112000)); // 點數＋退休金 35% 抵稅
    return { si: ni + pen, tax: Math.max(0, tax(g, BR) - credit) };
  }

  var K = {
    id: 'IL', name: '以色列', cur: 'ILS', curName: '新謝克爾', flag: '🇮🇱',
    fx: { toTWD: FX, pppToTWD: 3.6, date: '2026-10-12' }, // PPP：以色列約 3.8、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['平均工資創新高 14,334（Globes）', 'https://en.globes.co.il/en/article-average-monthly-wage-in-israel-reaches-record-high-1001501282'],
      ['以色列央行降息到 3.5%（Ynet，2026-07）', 'https://www.ynetnews.com/business/article/s111bt7txzx'],
      ['以色列租金 2026（EasyAliyah 整理統計局資料）', 'https://www.easyaliyah.com/blog/the-israeli-rental-market-2026'],
      ['匯率 ILS／TWD', 'https://fxfeed.io/currencies/pairs/ils-twd?range=7d']
    ],
    notes: [
      '以色列是已開發國家中生育率最高的（約 2.9），宗教與家庭文化是重要原因。',
      '個人課稅；每人有基本「稅額點數」，母親多半個點，6 歲以下的孩子讓父母各多 2.5–4.5 點，所得稅很快被抵掉。',
      '國民保險＋健保稅：平均工資 6 成以下 4.27%、以上 12.17%；強制退休金員工自付 6%。',
      '3 歲起幼兒園免學費（下午班另付）；0–2 歲托育很貴，低收入有補助。',
      '產假 15 週全薪（國民保險給付）。孩子 18–20 歲服兵役，父母負擔較輕。',
      '特拉維夫房價每 ㎡ 約 6 萬謝克爾，是全世界最貴的城市之一；首購 198 萬以下免購屋稅。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2026-10 核對：國民保險局 2025 上半年每位受僱者月薪中位數 10,586（含部分工時與獎金），只看最低工資以上（約前 70%）中位數 14,609（全職的上限）；
      // 官方沒有全職中位數，取兩者之間約 13,000 × 2026 約 1.045 × 12 ≈ 163,000［DERIVED／ESTIMATE］（原本 150,000 由平均月薪推估）
      median: 163000,
      // 十分位：國民保險局十分位上限只取最低工資以上的部分重新計算；P95 以柏拉圖分布［DERIVED／ESTIMATE］
      q: [[10, 0.54], [20, 0.64], [25, 0.69], [50, 1], [75, 1.56], [90, 2.49], [95, 3.39]],
      paretoAlpha: 2.2,
      ageSpread: 0.85,
      // 年齡：國民保險局各年齡中位數（20–29 歲 0.672、30–39 1.180、40–49 1.368、50–59 1.345、60+ 0.887）換成全職的形狀［ESTIMATE］；兵役後才進職場
      age: [[22, 0.57], [27, 0.76], [32, 0.94], [37, 1.09], [42, 1.17], [47, 1.22], [52, 1.21], [57, 1.12], [63, 0.95]],
      bonus: 0.3
    },
    CHECK_SALARIES: [80000, 110000, 150000, 220000, 330000, 500000],

    CITY: {
      telaviv: {
        id: 'telaviv', name: '特拉維夫', short: '特拉維夫', capital: false,
        cons: 1.12,
        // 統計局平均：3 房 7,004、4 房 8,739（2025 Q3）［SECONDARY］＋ 2026 約 3%；以色列房數含客廳（2 臥＝3 房）
        // 2026-10 核對：統計局 2025 Q2（1–2／2.5–3／3.5–4／4.5–6 房）5,364／6,976／8,671／10,953，含續約；× 約 1.05（成長＋新租約比續約貴）［OFFICIAL＋ESTIMATE］
        rent: [5630, 7330, 9100, 11500], rentAdj: 1.0,
        arnona: 90, vaad: 250, // 市政稅（每 ㎡ 每年，租屋也要付）、大樓管理費（每月）［ESTIMATE］
        price: 60000, priceNew: 68000, // 每 ㎡［ESTIMATE］
        size: [55, 75, 100, 120],
        park: 500, tpass: 255,
        maon: 3000, ganon: 4800, tzaharon: 1050, gan: 3500, ganBiling: 5000,
        nitzanim: 800, privSchool: 25000, intl: 130000,
        hobby: 300, cram: { none: 0, some: 500, full: 1500 },
        doula: 6000, nurse: 12000
      },
      haifa: {
        id: 'haifa', name: '海法', short: '海法', capital: false,
        cons: 0.95,
        rent: [2550, 3200, 4100, 5570], rentAdj: 1.0, // 統計局 2025 Q2：2,428／3,049／3,902／5,301 × 約 1.05［OFFICIAL＋ESTIMATE，2026-10 核對：原本 5 房 4,900 偏低］
        arnona: 70, vaad: 180,
        price: 20000, priceNew: 25000,
        size: [55, 75, 100, 120],
        park: 200, tpass: 225,
        maon: 2500, ganon: 3300, tzaharon: 900, gan: 2800, ganBiling: 4000,
        nitzanim: 700, privSchool: 20000, intl: 90000,
        hobby: 250, cram: { none: 0, some: 450, full: 1300 },
        doula: 5000, nurse: 10000
      }
    },

    COST: {
      // 每位大人每月日常開銷：家計調查每戶每月約 17,600 ×（1 − 住房約 25%）÷ 3.2 人 × 0.716 × 物價 1.12 ≈ 3,300，取 3,200［ESTIMATE］§5
      adultBase: 3200, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 1600], [2, 1376], [6, 1728], [12, 2272], [18, 2528]], // ［ESTIMATE］
      utilBase: 600, utilPerPerson: 150,
      gearFirst: { frugal: 3000, normal: 6000, comfy: 12000 }, gearLater: 2000,
      postpartumFamily: 1000,
      grandPaid: 0, helper: 0,
      nanny: 7500,       // 全職保母每月［ESTIMATE］
      maonCost: 4500,    // 認證托嬰中心每月實際成本（只統計補助）［ESTIMATE］
      soldier: 18000,    // 服兵役期間的生活津貼（每年，抵掉部分生活費）［ESTIMATE］
      uniAwayRent: 2500,
      master: 15000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 60000, resale: 0.3, life: 8, run: 15000 },
        new: { buy: 140000, resale: 0.4, life: 10, run: 16000 },
        import: { buy: 220000, resale: 0.45, life: 10, run: 19000 }
      },
      scooter: { buy: 12000, resale: 0.25, life: 8, run: 3000 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 70000, // 65 歲後每人每年：國民保險老年給付＋職業年金［ESTIMATE］
      houseSize: { 1: 55, 2: 75, 3: 100, 4: 120 },
      reno: { basic: 200, light: 800, full: 3000 },
      closing: { used: 0.03, new: 0.006 }, homeInsurance: 1500,
      rentFactor: 1
    },

    // 3–5 歲幼兒園（免費），6 歲小學，12 歲國中，15 歲高中，18–20 歲服兵役，21 歲上大學
    BANDS: { care: 3, es: 6, jh: 12, sh: 15, uni: 18 },
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3.5 : 6; }, // 產假 15 週全薪，一人通常再請到 6 個月

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（租客也要付市政稅）', buy: '買房（首購 198 萬以下免購屋稅，貸款最多 75%）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（組合式利率）' },
      postpartum: { center: '產後恢復旅館（以色列常見）', nanny: '產後保母 2 週', family: '家人幫忙照顧' },
      leave: { none: '不請育嬰假', A: '我請 6 個月（其中 15 週全薪）', B: '伴侶請 6 個月（15 週全薪）', both: '夫妻共用 15 週全薪產假（各約 3.5 個月）' },
      care: { quasi: '認證托嬰中心（依收入補助）', public: '認證托嬰中心（依收入補助）', private: '私立托嬰', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '全職保母', quit: '一方離職在家照顧' },
      preschool: { public: '公立幼兒園（免學費）＋下午班', quasi: '公立幼兒園＋下午班', private: '私立幼兒園', bilingual: '雙語幼兒園', home: '在家照顧' },
      school: { public: '公立學校（免學費）', privateJH: '12 歲起讀私立學校', private: '私立學校', intl: '國際學校' },
      after: { none: '不上課後班', anqin: '學校課後照顧（低年級）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（高中會考）' },
      uni: { public: '18–20 歲服兵役，之後讀大學', private: '18–20 歲服兵役，之後讀大學', mixed: '18–20 歲服兵役，之後讀大學' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: GRANT[Math.min(k, 2)], local: 0 };
    },
    allowance: function (x, k, a) { return a < 18 ? ALLOW[Math.min(k, 4)] * 12 : 0; },
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      var fee = 0, sub = 0;
      if (cs === 'quasi' || cs === 'public') {
        // 認證托嬰中心：每人月收入越低補助越多（簡化）［ESTIMATE］
        var pc = ((x.gA || 0) + (x.s.partner ? x.gB || 0 : 0)) / 12 / Math.max(1, x.persons || 1);
        var m = Math.max(800, c.maon - 2000 * Math.max(0, 1 - pc / 8000));
        fee = m * careMonths; sub = Math.max(0, C.maonCost - m) * careMonths;
      } else if (cs === 'private') fee = c.ganon * careMonths;
      else if (cs === 'helper') fee = C.nanny * careMonths;
      else if (cs === 'grandPaid') fee = C.grandPaid * careMonths;
      return { fee: fee, sub: sub };
    },
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var m = ps === 'private' ? c.gan : ps === 'bilingual' ? c.ganBiling : c.tzaharon;
      return { fee: m * (ps === 'private' || ps === 'bilingual' ? 12 : 10), kg: ps === 'public' || ps === 'quasi' ? 20000 : 0 };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : 2500;
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) && a < 8 ? c.nitzanim * 10 : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 18–20 歲服兵役（有生活津貼，算成家庭收到的補助）；21 歲起大學學費約 11,000
    uni: function (x, k, a) { if (a < 21) { x.tr.allowance += x.C.soldier; return { fee: 0, sub: 0 }; } return { fee: 11000, sub: 0 }; },

    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rent[r - 1] * rentMult * (c.rentAdj || 1) * K.COST.rentFactor + c.arnona * c.size[r - 1] / 12 + c.vaad;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = purchaseTax(h.total) + h.total * (x.s.build === 'new' ? 0.006 : 0.0295); // 律師 0.5%＋仲介 2%（含加值稅）
      h.mgmt = c.vaad * 12; h.tax = c.arnona * h.size;
      return h;
    },
    // 房貸：首購最多 75%、30 年；月付不超過收入約 1/3 §4.4［OFFICIAL：央行規定 LTV 75%］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.75, 0.33 * inc / ann(RATE, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '組合式房貸' }], note: amt < total * 0.75 - 1 ? '月付不能超過收入約 1/3' : '' };
    },

    // 產假：15 週全薪（國民保險，每日上限約 1,730）；夫妻共用時各約 7.5 週；要繳稅
    leavePay: function (g, ind, months, nb, x) {
      var both = x.s.leave === 'both' && x.s.partner;
      var weeks = Math.min(months * 52 / 12, both ? 7.5 : 15);
      return weeks * Math.min(g / 52, 1730 * 7) * 0.85 * nb;
    },

    // 稅：每人 2.25 點，母親多 0.5 點；孩子的點數（父母各自，2026）：出生那年 2.5、1–2 歲 4.5、3 歲 3.5、4–5 歲 2.5、
    // 6–17 歲母親 2、父親 1，18 歲母親 0.5［SECONDARY：Kol Zchut 引稅務局 2026 手冊，2026-10 核對；原本 1.5／2.5／2.5／1 偏少］
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0;
      var kids = x.kAges || [], both = 0, mom = 0.5;
      kids.forEach(function (a) {
        if (a === 0) both += 2.5; else if (a <= 2) both += 4.5; else if (a === 3) both += 3.5; else if (a <= 5) both += 2.5;
        else if (a <= 17) { both += 1; mom += 1; } else if (a === 18) mom += 0.5;
      });
      var momIsB = s.partner && gB > 0;
      var pa = person(gA, 2.25 + both + (momIsB ? 0 : mom)), pb = person(gB, 2.25 + both + (momIsB ? mom : 0));
      return { si: pa.si + pb.si, tax: pa.tax + pb.tax };
    }
  };

  // 首購購屋稅：198 萬以下免稅、234.7 萬以下 3.5%、605.5 萬以下 5%、以上 8%［ESTIMATE：2025 值凍結］
  function purchaseTax(p) { return tax(p, [[1978745, 0], [2347040, 0.035], [6055070, 0.05], [Infinity, 0.08]]); }
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

/* ---- country-nl.js ---- */
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
      // 2026-10 核對：原本用 CPB 模態收入（最常見的薪資，低於中位數）推估 50,000，偏低。
      // 統計局 2025 全職平均月薪 4,859（不含休假津貼）× 12 × 中位數／平均約 0.87 × 休假津貼與年終約 1.13 ≈ 57,300；
      // 時薪中位數 26.90 × 全職時數也得到 58–61k；歐盟 SES 2022 的口徑會低一些（約 53k）→ 取 57,000［DERIVED／ESTIMATE］
      median: 57000,
      // 分布較集中：2026 全職最低工資 14.71 × 約 1,980 小時 × 1.08 ≈ 31,500（約 0.55）；其餘形狀［ESTIMATE］
      q: [[10, 0.62], [20, 0.72], [25, 0.78], [30, 0.83], [40, 0.91], [50, 1], [60, 1.08], [70, 1.19], [75, 1.30], [80, 1.40], [90, 1.75], [95, 2.15]],
      paretoAlpha: 3.0,
      ageSpread: 0.85,
      // 年齡：統計局 2025 全職各年齡平均月薪 ÷ 全職平均（20–25 歲 2,821 … 50–55 歲 5,765）當作中位數的形狀［DERIVED］
      age: [[22, 0.58], [27, 0.76], [32, 0.92], [37, 1.04], [42, 1.12], [47, 1.16], [52, 1.19], [57, 1.18], [62, 1.14]],
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
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        if (/^anqin/.test(s.after) && !intl) {
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

/* ---- country-nz.js ---- */
/* =========================================================================
   紐西蘭模組（奧克蘭、基督城）。金額為紐幣、2026 年水準。
   來源與可信度見 research/countries/nz.md（§ 編號標在各數字旁）。
   標示：OFFICIAL 官方｜NEWS 新聞轉述官方｜SECONDARY 民間整理｜DERIVED 由官方數字推算｜ESTIMATE 估計
   特色：個人課稅、意外保險稅、自動加入的退休儲蓄（KiwiSaver，可提領買第一間房）、
   家庭工作補助（Working for Families：家庭稅務補助、在職補助、Best Start）、
   3–5 歲每週 20 小時免費幼教、托育補助與 FamilyBoost 退稅、26 週育嬰給付、
   沒有印花稅、房貸頭期款 2 成、租屋補助（Accommodation Supplement，存款多就不能領）。
   ========================================================================= */
(function (E, WD, D) {
  'use strict';
  var U = E.util;
  var FX = 17.88;   // 1 紐幣 = 17.88 台幣（2026-10-12）§1［SECONDARY］
  var RATE = 0.052; // 1–2 年固定房貸約 5.0–5.4%（2026-09；央行 9 月升息到 2.75%）§4.4［SECONDARY］

  // ---------- 制度參數（2026–27）§3 ----------
  var BR = [[15600, 0.105], [53500, 0.175], [78100, 0.30], [180000, 0.33], [Infinity, 0.39]]; // 所得稅（2024-07 起）［OFFICIAL］
  var ACC = 0.0175, ACC_MAX = 156641;   // 意外保險稅［SECONDARY］
  var KS = 0.035, KS_ER = 0.029;        // KiwiSaver：員工 3.5%；雇主 3.5% 扣掉雇主提撥稅後約 2.9%（不算在薪資裡）［SECONDARY／ESTIMATE］
  var WFF = { ftc1: 7921, ftc2: 6454, iwtc: 5070, iwtcExtra: 780, thr: 44900, rate: 0.275, best: 4041, bestThr: 79000, bestRate: 0.21 }; // ［SECONDARY］
  var PPL = 811.05;                     // 育嬰給付每週上限（2026-07 起），26 週［OFFICIAL］
  // 托育補助（Work and Income）：每小時最多 6.72、每週最多 50 小時；依家庭週收入遞減（孩子數不同門檻不同）［SECONDARY］
  var CCS = { rate: 6.72, hours: 45, full: [1131, 1301, 1457], stop: [2404, 2748, 3091] };
  var FB = { pct: 0.4, cap: 6240, thr: 140000, rate: 0.07 }; // FamilyBoost：托育自付額 4 成退稅，每季最多 1,560［SECONDARY］

  function tax(n, br) { var t = 0, lo = 0; for (var i = 0; i < br.length && n > lo; i++) { t += (Math.min(n, br[i][0]) - lo) * br[i][1]; lo = br[i][0]; } return t; }
  // 一個人的稅與社保：所得稅、意外保險稅、KiwiSaver；沒領家庭補助時另有獨立工作者抵稅（最多 520）
  function person(g, wff) {
    if (!(g > 0)) return { si: 0, tax: 0 };
    var ietc = !wff && g >= 24000 && g <= 70000 ? (g <= 66000 ? 520 : Math.max(0, 520 - 0.13 * (g - 66000))) : 0;
    return { si: ACC * Math.min(g, ACC_MAX) + KS * g, tax: Math.max(0, tax(g, BR) - ietc) };
  }

  var K = {
    id: 'NZ', name: '紐西蘭', cur: 'NZD', curName: '紐幣', flag: '🇳🇿',
    fx: { toTWD: FX, pppToTWD: 9.6, date: '2026-10-12' }, // PPP：紐西蘭約 1.42、台灣約 13.65［ESTIMATE］
    careEnd: 3,
    sources: [
      ['Stats NZ 2026 年 6 月週薪中位數（Figure.NZ）', 'https://figure.nz/chart/tsPtbVNvycc0iL4w-tZPxwbEKXYxHJu9S'],
      ['Working for Families 2026–27 金額', 'https://nztax.tools/tax-insights/working-for-families-rates-2026-27/'],
      ['2026-04 薪資相關變更（ACC、KiwiSaver、最低工資）', 'https://www.payhero.co.nz/blog/EOFY2026-april-payroll-changes'],
      ['育嬰給付 2026-07 起（IRD）', 'https://www.ird.govt.nz/updates/news-folder/2026/paid-parental-leave'],
      ['托育補助、20 小時免費幼教、FamilyBoost', 'https://moneybalance.co.nz/personal-finance/cost-of-living/childcare-costs-nz/'],
      ['租屋補助計算方式 2026', 'https://nztax.tools/accommodation-supplement-calculator/'],
      ['房價 2026-08（Opes Partners）', 'https://www.opespartners.co.nz/property-markets/nz-property-market-update'],
      ['租金（Tenancy Services 整理）', 'https://www.calculate.co.nz/reference/nz-average-rent.php'],
      ['房貸利率與央行利率 2026-09', 'https://www.calculate.co.nz/reference/nz-interest-rates.php'],
      ['Stats NZ 家庭支出 2023（Figure.NZ）', 'https://figure.nz/chart/t1esyohiJmbcElex'],
      ['匯率 NZD／TWD', 'https://www.poundsterlinglive.com/data/currencies/nzd-pairs/NZDTWD-exchange-rate']
    ],
    notes: [
      '紐西蘭是個人分開課稅（10.5%–39%），另繳 1.75% 意外保險稅；大多數人自動加入退休儲蓄 KiwiSaver（自付 3.5%，雇主另提撥），買第一間房時可以領出來。',
      '有孩子的家庭可領「家庭稅務補助」與「在職補助」，家庭年收入超過 44,900 後每多 1 元少 0.275；0–2 歲另有 Best Start（每個孩子每年約 4,041）。',
      '3–5 歲每週 20 小時免費幼教；0–2 歲托育全自費，中低收入有托育補助，另可用 FamilyBoost 退回自付額的 4 成。',
      '育嬰給付 26 週，每週最多 811 紐幣（要繳稅）。',
      '沒有印花稅；房貸頭期款 2 成，借款也受收入限制。',
      '租屋補助（Accommodation Supplement）要家庭存款 16,200 以下才能領，所以多數有存款的家庭領不到。'
    ],

    // ---------- 薪資（全職受僱者，全年）§2 ----------
    W: {
      // 2026 年 6 月受僱者週薪中位數：男 1,538、女 1,280（含部分工時）［OFFICIAL：Stats NZ］；全職約 1,500 × 52 ≈ 78,000［ESTIMATE］
      median: 78000,
      // 最低工資 23.95 × 2,080 ≈ 49,800（約 0.64）［DERIVED］；其餘形狀［ESTIMATE］
      q: [[10, 0.64], [20, 0.72], [25, 0.76], [30, 0.81], [40, 0.90], [50, 1], [60, 1.10], [70, 1.22], [75, 1.30], [80, 1.40], [90, 1.72], [95, 2.10]],
      paretoAlpha: 2.8,
      ageSpread: 0.85,
      age: [[22, 0.66], [25, 0.78], [30, 0.93], [35, 1.03], [40, 1.08], [45, 1.10], [50, 1.10], [55, 1.08], [60, 1.04], [63, 1.0]], // ［ESTIMATE］
      bonus: 0.2
    },
    CHECK_SALARIES: [50000, 62000, 78000, 100000, 140000, 200000],

    // ---------- 城市 ----------
    CITY: {
      auckland: {
        id: 'auckland', name: '奧克蘭', short: '奧克蘭', capital: false,
        cons: 1.08,
        rentW: [480, 600, 700, 850], rentAdj: 1.0, // 每週租金（1–4 房）：全部約 680、3 房約 730［SECONDARY］→ 依房數［ESTIMATE］
        asMax: 305,                                // 租屋補助上限（第 1 區，有孩子的家庭）［SECONDARY］
        price: 8000, priceNew: 8800,               // 每 ㎡：房價中位數 95 萬（2026-08）÷ 3 房約 115 ㎡［DERIVED］
        rates: 3900, ins: 3000, maint: 1500,       // 地方稅、房屋保險、維修（每年）［ESTIMATE］
        park: 0, tpass: 200,
        ece: 475, ece35: 250, ecePremium: 560,     // 托育每週全日收費：0–2 歲、3–5 歲（扣掉 20 小時免費後）、高價位［ESTIMATE］
        oscar: 5500,                               // 課後與假期照顧每年［ESTIMATE］
        privSchool: 25000, intl: 32000,
        hobby: 60, cram: { none: 0, some: 240, full: 600 },
        doula: 3000, nurse: 3500
      },
      christchurch: {
        id: 'christchurch', name: '基督城', short: '基督城', capital: false,
        cons: 0.97,
        rentW: [400, 490, 560, 650], rentAdj: 1.0, // 全部約 540、2 房 500、3 房 540［SECONDARY］
        asMax: 220,                                // 第 2 區
        price: 6000, priceNew: 6400,               // 坎特伯雷房價中位數 70 萬（2026-08）［SECONDARY／DERIVED］
        rates: 3800, ins: 3500, maint: 1300,       // 地震保險較貴［ESTIMATE］
        park: 0, tpass: 110,
        ece: 400, ece35: 200, ecePremium: 470,
        oscar: 4800,
        privSchool: 22000, intl: 27000,
        hobby: 55, cram: { none: 0, some: 220, full: 520 },
        doula: 2600, nurse: 3000
      }
    },

    // ---------- 生活與養育成本 ----------
    COST: {
      // 每位大人每月日常開銷：Stats NZ 2023 每戶每週約 1,597.5 −住房與水電 398 = 1,199.5；
      // 其中「其他支出」含房貸利息（有房貸的家庭每週 330.8，攤到所有家庭約 110），利息不是消費，扣掉 → 約 1,089.5
      // ÷ 每戶約 2.65 人 × 52 ÷ 12 × 物價 2023→2026 約 1.09 × 0.716 ≈ 1,390［DERIVED／ESTIMATE］§5（2026-10 核對：原本 1,500 含房貸利息）
      adultBase: 1390, consNational: 1, consExp: 0.75,
      lifestyle: { frugal: 0.7, normal: 1.0, comfy: 1.4 },
      childLife: { frugal: 0.65, normal: 1.0, comfy: 1.6 },
      child: [[0, 695], [2, 598], [6, 751], [12, 987], [18, 1098]], // 台灣「孩子／大人」比例 × 紐西蘭大人開銷［ESTIMATE］
      utilBase: 150, utilPerPerson: 45, // 電、網路、水（租金不含）［ESTIMATE］
      gearFirst: { frugal: 1500, normal: 3000, comfy: 6000 }, gearLater: 1000,
      postpartumFamily: 300,  // 公費助產士照護免費［OFFICIAL 制度］
      grandPaid: 0, helper: 0,
      auPair: 1800,           // 互惠生每月（零用錢＋食宿）［ESTIMATE］
      uniAwayRent: 1300,      // 學生宿舍每月［ESTIMATE］
      master: 9000,
      abroad: { US: { years: 2, perYear: Math.round(1700000 / FX) }, UK: { years: 1, perYear: Math.round(1300000 / FX) }, JP: { years: 2, perYear: Math.round(400000 / FX) } },
      car: {
        used: { buy: 12000, resale: 0.3, life: 8, run: 4000 }, // 油錢、保險、驗車、牌照［ESTIMATE］
        new: { buy: 38000, resale: 0.4, life: 10, run: 4200 },
        import: { buy: 60000, resale: 0.45, life: 10, run: 5000 }
      },
      scooter: { buy: 4000, resale: 0.3, life: 8, run: 800 },
      carInstallYears: 5,
      travel: { none: 0, domestic: 0, abroadPerPerson: Math.round(30000 / FX) },
      elderCareMonthly: 0,
      pension: 30000, // 65 歲起國民年金（已婚每人約 2.7 萬）＋ KiwiSaver［ESTIMATE］
      houseSize: { 1: 60, 2: 85, 3: 115, 4: 145 },
      reno: { basic: 80, light: 300, full: 1000 },
      closing: { used: 0.005, new: 0.004 }, homeInsurance: 0,
      rentFactor: 1
    },

    // 0–2 歲托育，3–4 歲幼教（每週 20 小時免費），5 歲上小學，11 歲中間學校，13 歲中學，18 歲大學
    BANDS: { care: 3, es: 5, jh: 11, sh: 13, uni: 18 },
    // 育嬰給付 26 週：一人請約 6 個月；夫妻分著請各約 3 個月
    leaveMonths: function (who, s) { return s.leave === 'both' ? 3 : 6; },

    prep: function (K) {
      var f = K.wageFactor, C = K.COST;
      C.grandPaid = Math.round(D.COST.grandPaid * f);
      C.elderCareMonthly = Math.round(D.COST.elderCareMonthly * f);
      C.travel.domestic = Math.round(D.COST.travel.domestic * f);
    },
    localize: function (ls) { ls.loan = 'bank'; ls.parking = 'rent'; },
    MAP: {
      housing: { rent: '租屋（存款少時可領租屋補助）', buy: '買房（頭期款 2 成，可提領 KiwiSaver，沒有印花稅）', family: '和長輩同住' },
      build: { used: '中古屋', new: '新建案（連棟屋）' },
      loan: { qingan: '沒有新青安，改用一般房貸', qinganNoGrace: '沒有新青安，改用一般房貸', bank: '一般房貸（1–2 年固定，30 年攤還）' },
      postpartum: { center: '產後休養旅館', nanny: '夜間保母 2 週', family: '公費助產士到府＋家人幫忙' },
      leave: { none: '不請育嬰假', A: '我請 26 週育嬰給付（每週最多 811）', B: '伴侶請 26 週育嬰給付', both: '夫妻分著請（各約 13 週給付）' },
      care: { quasi: '托育中心（全自費，中低收入有補助）', public: '托育中心（全自費，中低收入有補助）', private: '高價位托育中心', grandPaid: '請長輩帶（付費）', grandFree: '請長輩帶', helper: '互惠生（au pair）', quit: '一方離職在家照顧' },
      preschool: { public: '幼教中心（每週 20 小時免費）', quasi: '幼教中心（每週 20 小時免費）', private: '私立幼教中心（20 小時免費＋加收）', bilingual: '雙語幼教中心', home: '在家照顧' },
      school: { public: '公立學校（免學費，學校募款）', privateJH: '11 歲起讀私立學校', private: '私立學校', intl: '國際文憑（IB）私校' },
      after: { none: '不上課後班', anqin: '課後與假期照顧（OSCAR）', anqin1: '課後照顧＋1 項才藝', anqin3: '課後照顧＋3 項才藝' },
      cram: { none: '不補習', some: '家教（每週 1 次）', full: '密集家教（NCEA）' },
      uni: { public: '大學（學費約 8,500，最後一年免學費）', private: '大學（學費約 8,500，最後一年免學費）', mixed: '大學（學費約 8,500，最後一年免學費）' },
      transport: { transit: '大眾運輸', scooter: '機車', used: '中古車', new: '新車', import: '進口車' }
    },

    // ---------- 生產（公費醫療）----------
    birth: function (x, k) {
      var s = x.s, C = x.C, c = x.c, ls = s.lifestyle;
      var pp = s.postpartum === 'center' ? c.doula : s.postpartum === 'nanny' ? c.nurse : C.postpartumFamily;
      return { cost: (k === 0 ? C.gearFirst[ls] : C.gearLater) + pp, grant: 0, local: 0 };
    },
    allowance: function () { return 0; }, // 家庭補助依所得計算，放在 taxes()
    // 0–2 歲托育：全日收費；托育補助（每小時最多 6.72）＋ FamilyBoost 退 4 成
    care: function (x, cs, k, a, careMonths) {
      var c = x.c, C = x.C;
      if (careMonths <= 0) return {};
      if (cs === 'quasi' || cs === 'public' || cs === 'private') {
        var wk = careMonths * 52 / 12, fee = (cs === 'private' ? c.ecePremium : c.ece) * wk;
        var sub = Math.min(fee, ccs(x) * CCS.hours * wk); fee -= sub;
        var fb = boost(x, fee); fee -= fb;
        return { fee: fee, sub: sub + fb };
      }
      if (cs === 'helper') return { fee: C.auPair * careMonths };
      if (cs === 'grandPaid') return { fee: C.grandPaid * careMonths };
      return {};
    },
    // 3–4 歲：每週 20 小時免費（只統計，約每小時 13）；其餘時數照收，可領托育補助與 FamilyBoost
    preschool: function (x, ps, k, a) {
      var c = x.c;
      if (ps === 'home') return {};
      var w = ps === 'private' || ps === 'bilingual' ? c.ece35 * 1.3 : c.ece35, fee = w * 52;
      var sub = Math.min(fee, ccs(x) * (CCS.hours - 20) * 52); fee -= sub;
      var fb = boost(x, fee); fee -= fb;
      return { fee: fee, kg: 20 * 13 * 48 + sub + fb };
    },
    school: function (x, level, k, a) {
      var s = x.s, c = x.c;
      var priv = s.school === 'private' || (s.school === 'privateJH' && level !== 'es');
      var intl = s.school === 'intl';
      var fee = intl ? c.intl : priv ? c.privSchool : level === 'es' ? 600 : level === 'jh' ? 800 : 1200; // 公立：學校募款、制服、文具與筆電、NCEA 報名
      var extra = 0;
      if (level === 'es') {
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3, art1: 1, art3: 3 }[s.after] || 0;
        extra = (/^anqin/.test(s.after) ? c.oscar : 0) + hobbies * c.hobby * 12;
      } else extra = (c.cram[s.cram] || 0) * 10;
      return fee + extra;
    },
    // 大學 4 年：學費約 8,500；最後一年免學費（簡化成第 3 年）［NEWS／ESTIMATE］
    uni: function (x, k, a) { return a === 20 ? { fee: 0, sub: 8500 } : { fee: 8500, sub: 0 }; },

    // ---------- 住房 ----------
    rentFor: function (c, rooms, rentMult) {
      var r = Math.min(Math.max(rooms, 1), 4);
      return c.rentW[r - 1] * 52 / 12 * rentMult * (c.rentAdj || 1) * K.COST.rentFactor;
    },
    // 租屋補助（有孩子的家庭）：(週租金 − 205) × 70%，上限依地區；家庭週收入超過 1,117 每 1 元少 0.25；存款 16,200 以上不能領［SECONDARY］
    rentSubsidy: function (x) {
      var s = x.s;
      if ((x.persons || 1) < 3 || (x.S || 0) > 16200) return;
      var wr = (x.rentM || 0) * 12 / 52, inc = ((x.gA || 0) + (s.partner ? x.gB || 0 : 0)) / 52;
      var as = Math.min(x.c.asMax, 0.7 * Math.max(0, wr - 205)) - 0.25 * Math.max(0, inc - 1117);
      if (as > 0) x.tr.rent = as * 52;
    },
    housePlan: function (x) {
      var c = x.c, h = WD.stdHousePlan(x);
      h.closing = 3500; // 律師、驗屋、土地資訊報告；沒有印花稅［ESTIMATE］
      h.mgmt = c.maint; h.tax = c.rates; h.ins = c.ins;
      return h;
    },
    // 房貸：最多房價 8 成、30 年；借款不超過年收入 6 倍（央行 DTI），且以 7% 試算的月付不超過稅前收入約 38%［OFFICIAL 規則；比例 ESTIMATE］
    loanPlan: function (x, total) {
      var tb = x.tb, inc = incomeAt(x, 'A', tb) + incomeAt(x, 'B', tb);
      var amt = Math.max(0, Math.min(total * 0.8, 6 * inc, 0.38 * inc / ann(0.07, 30)));
      return { parts: [{ amt: amt, rate: RATE, years: 30, grace: 0, label: '銀行房貸（1–2 年固定，到期重新議價）' }], note: amt < total * 0.8 - 1 ? '借款受收入限制，要多付頭期款' : '' };
    },

    // ---------- 育嬰給付：每週 min(週薪, 811.05)，最多 26 週；要繳稅（以 83% 計）----------
    leavePay: function (g, ind, months, nb, x, who) {
      if (!(g > 0)) return 0;
      var weeks = Math.min(26, months * 52 / 12);
      return weeks * Math.min(g / 52, PPL) * nb * 0.83;
    },

    // ---------- 稅、社保、家庭補助；KiwiSaver 買第一間房時提領 §3 ----------
    taxes: function (x) {
      var s = x.s, gA = x.gA || 0, gB = s.partner ? x.gB || 0 : 0, F = gA + gB;
      var kids = (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; });
      // 家庭稅務補助＋在職補助，家庭收入超過 44,900 後每 1 元少 0.275（先減家庭稅務補助）
      var wff = 0;
      if (kids.length) {
        var ftc = WFF.ftc1 + WFF.ftc2 * (kids.length - 1);
        var iwtc = F > 0 ? WFF.iwtc + WFF.iwtcExtra * Math.max(0, kids.length - 3) : 0;
        wff = Math.max(0, ftc + iwtc - WFF.rate * Math.max(0, F - WFF.thr));
        // Best Start：0–2 歲每個孩子 4,041，家庭收入超過 79,000 每 1 元少 0.21；出生那年領育嬰給付的月份不能領
        var lm = (x.lmA || 0) + (x.lmB || 0), best = 0;
        kids.forEach(function (a) { if (a <= 2) best += WFF.best * (a === 0 ? Math.max(0, 12 - lm) / 12 : 1); });
        best = Math.max(0, best - WFF.bestRate * Math.max(0, F - WFF.bestThr));
        if (x.tr) x.tr.allowance += wff + best;
      }
      var pa = person(gA, wff > 0), pb = person(gB, wff > 0);
      // KiwiSaver：買房前每年累積員工＋雇主提撥（年報酬約 3%），買第一間房那年提領（各留 1,000）
      if (x.tr && s.housing === 'buy') {
        if (!x.t) x.ksBal = 0; // 和新加坡公積金一樣，從模擬開始那年起算
        if (x.ly == null || x.ly < 0) x.ksBal = (x.ksBal || 0) * 1.03 + (KS + KS_ER) * F;
        else if (x.ly === 0 && x.ksBal) { x.tr.fund = (x.tr.fund || 0) + Math.max(0, x.ksBal - (s.partner ? 2000 : 1000)); x.ksBal = 0; }
      }
      return { si: pa.si + pb.si, tax: pa.tax + pb.tax };
    }
  };

  // 托育補助每小時金額：家庭週收入在「全額」與「停止」門檻間線性遞減；夫妻都要有工作
  function ccs(x) {
    var s = x.s;
    if (!((x.gA || 0) > 0) || (s.partner && !((x.gB || 0) > 0))) return 0;
    var n = Math.min(3, Math.max(1, (x.kAges || []).filter(function (a) { return a >= 0 && a < 18; }).length)) - 1;
    var wk = ((x.gA || 0) + (s.partner ? x.gB || 0 : 0)) / 52;
    return CCS.rate * U.clamp((CCS.stop[n] - wk) / (CCS.stop[n] - CCS.full[n]), 0, 1);
  }
  // FamilyBoost：自付托育費的 4 成，每個家庭每年最多 6,240，家庭收入超過 14 萬每 1 元少 0.07
  function boost(x, fee) {
    var F = (x.gA || 0) + (x.s.partner ? x.gB || 0 : 0);
    var cap = Math.max(0, FB.cap - FB.rate * Math.max(0, F - FB.thr)) - (x.y.fb || 0);
    var v = Math.max(0, Math.min(FB.pct * fee, cap));
    x.y.fb = (x.y.fb || 0) + v;
    return v;
  }
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

/* ---- country-ch.js ---- */
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
        // 房屋移轉稅 1.8%，自住（1 年內入住、住滿 2 年）前 80 萬免稅；公證約 0.5%；房屋稅約 0.1%［OFFICIAL 稅率與免稅額，2026-10 核對］
        closing: 0.005, transferRate: 0.018, transferFree: 800000, stweg: 4.0, propTax: 0.001,
        // 保費補助（IPV，伯恩州 2026 計算表）：「計算所得」＝調整後淨所得＋（資產 − 每人 17,000）× 5% − 社會扣除（已婚 13,000、孩子每名約 13,750）；
        // 有孩子的家庭 45,000 以下（其他 35,000）可領；每位大人每月 221（9,000 以下）→ 33.5（45,000），孩子每名 119.30（區域 1）［OFFICIAL，2026-10 核對］
        ipvBE: { adult: [[9000, 221], [17000, 147], [25000, 107], [35000, 67], [45000, 33.5]], child: 119.30, limKids: 45000, lim: 35000, dedCouple: 13000, dedKid: 13750 },
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
      h.closing = h.total * c.closing + (c.transferRate || 0) * Math.max(0, h.total - (c.transferFree || 0));
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
      } else if (c.ipvBE) {
        var BE = c.ipvBE, minors = kids.filter(function (a) { return a < 18; }).length;
        var rel = F - pa.si - pb.si - 6000 * earners - (married ? BE.dedCouple : 0) - BE.dedKid * minors + 0.05 * Math.max(0, (x.S || 0) - 17000 * (adults + kids.length));
        var lim = minors ? BE.limKids : BE.lim;
        ipv = rel > lim ? 0 : Math.min(prem, 12 * (adults * U.interp(BE.adult, Math.max(0, rel)) + minors * BE.child));
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

/* ---- screen-world.js ---- */
/* =========================================================================
   實驗室「地圖 → 世界」：各國主要城市的比較（第二波，試算版）
   這裡只放共用的零件：試算（有快取）、城市列表、城市詳細資料。
   版面與地球在 screen-lab.js。
   ========================================================================= */
var WUI = (function () {
  'use strict';
  var h = U.h, A = APP, E = ENGINE;

  // 城市位置（地球上的標記）
  var COORD = { tokyo: [139.69, 35.69], osaka: [135.50, 34.69], seoul: [126.98, 37.57], busan: [129.08, 35.18], paris: [2.35, 48.86], lyon: [4.84, 45.76], shanghai: [121.47, 31.23], chengdu: [104.07, 30.57], nyc: [-74.01, 40.71], houston: [-95.37, 29.76], london: [-0.13, 51.51], manchester: [-2.24, 53.48], berlin: [13.40, 52.52], leipzig: [12.37, 51.34], stockholm: [18.07, 59.33], gothenburg: [11.97, 57.71], toronto: [-79.38, 43.65], calgary: [-114.07, 51.05], sydney: [151.21, -33.87], melbourne: [144.96, -37.81], singapore: [103.82, 1.35], hongkong: [114.17, 22.32], rome: [12.50, 41.90], turin: [7.69, 45.07], madrid: [-3.70, 40.42], valencia: [-0.38, 39.47], telaviv: [34.78, 32.09], haifa: [34.99, 32.79], amsterdam: [4.90, 52.37], rotterdam: [4.48, 51.92], auckland: [174.76, -36.85], christchurch: [172.64, -43.53], zurich: [8.54, 47.37], bern: [7.45, 46.95] };
  var A3 = { JP: 'JPN', KR: 'KOR', FR: 'FRA', CN: 'CHN', US: 'USA', UK: 'GBR', DE: 'DEU', SE: 'SWE', CA: 'CAN', AU: 'AUS', SG: 'SGP', HK: 'HKG', IT: 'ITA', ES: 'ESP', IL: 'ISR', NL: 'NLD', NZ: 'NZL', CH: 'CHE' };

  // 當地幣值：一律用「萬」，加上約合台幣（市場匯率）
  function money(v, K) {
    if (K.id === 'TW') return U.wan(v);
    var w = v / 1e4, s;
    if (Math.abs(w) >= 10000) s = (w / 10000).toFixed(Math.abs(w) >= 100000 ? 0 : 1).replace(/\.0$/, '') + ' 億';
    else if (Math.abs(w) >= 100) s = U.sep(w) + ' 萬';
    else s = w.toFixed(Math.abs(w) >= 10 ? 0 : 1).replace(/\.0$/, '') + ' 萬';
    return s + K.curName;
  }
  function twd(v, K) { return K.id === 'TW' ? '' : '約台幣 ' + U.wan(Math.round(v * K.fx.toTWD / 1e4) * 1e4); }
  function pct(a, b) { return b > 0 ? Math.round(a / b * 100) + '%' : '—'; }
  function key(r) { return r.cid + ':' + r.city; }
  function cityName(r, short) { return r.cid === 'TW' ? r.name : (short ? (E.country(r.cid).CITY[r.city].short || r.name) : r.name); }
  function prText(pr) { return pr == null ? '>99.9' : 'PR ' + U.pr(pr); }

  // ---------- 試算：9 個城市逐一算，每算完一個就讓出主執行緒；同一組設定只算一次 ----------
  var cache = null, job = null;
  function rows(s, onProgress, done) {
    var k = COMM.sig(A.strip(s));
    if (cache && cache.key === k) return done(cache.rows);
    if (job && job.key === k) { job.waiters.push(done); job.progress.push(onProgress); return; }
    var tw = E.normalize(A.strip(s)), jobs = [['TW', tw.county]];
    E.countries().forEach(function (cid) { if (cid !== 'TW') E.country(cid).cities.forEach(function (cy) { jobs.push([cid, cy]); }); });
    var me = job = { key: k, waiters: [done], progress: [onProgress] }, out = [];
    function finish(r, err) { if (job === me) job = null; me.waiters.forEach(function (w) { U.safe(function () { w(r, err); }, 'world-draw'); }); }
    (function next() {
      if (job !== me) return;
      if (out.length === jobs.length) { cache = { key: k, rows: out }; return finish(out); }
      U.task(function () {
        if (job !== me) return;
        try { var j = jobs[out.length]; out.push(WORLD.row(tw, j[0], j[1])); }
        catch (e) { if (U.report) U.report(e, 'world-row'); return finish(null, e); }
        me.progress.forEach(function (p) { if (p) p(out.length, jobs.length); });
        next();
      }, 'world-row');
    })();
  }

  // ---------- 城市列表（放在地球下面）：只有城市與 PR 條 ----------
  function list(all, sel, heat, onPick) {
    var sorted = all.slice().sort(function (a, b) { return (a.pr == null ? 101 : a.pr) - (b.pr == null ? 101 : b.pr); });
    var box = h('div', { class: 'wd-list', role: 'list', 'aria-label': '各國主要城市的門檻 PR' });
    sorted.forEach(function (r) {
      var mine = r.cid === 'TW', p = r.pr == null ? 100 : Math.max(1.5, r.pr);
      var inner = [
        h('span', { class: 'wd-name' }, cityName(r, true), h('small', {}, mine ? '你選的縣市' : E.country(r.cid).name === cityName(r, true) ? '' : E.country(r.cid).name)),
        h('span', { class: 'wd-bar', 'aria-hidden': 'true' }, h('i', { style: { width: p + '%', background: heat(r.pr) } })),
        h('span', { class: 'wd-pr' }, prText(r.pr))
      ];
      if (mine) box.appendChild(h('div', { class: 'wd-li mine', role: 'listitem' }, inner));
      else box.appendChild(h('button', { type: 'button', class: 'wd-li' + (sel === key(r) ? ' sel' : ''), role: 'listitem', 'aria-pressed': sel === key(r) ? 'true' : 'false', onclick: function () { onPick(key(r)); } }, inner));
    });
    return box;
  }

  // ---------- 你的選擇在當地怎麼對應 ----------
  var MAP_KEYS = [['housing', '住房'], ['build', '房子'], ['loan', '房貸'], ['postpartum', '坐月子'], ['leave', '育嬰假'], ['care', '0–2 歲'], ['preschool', '幼兒園'], ['school', '學校'], ['after', '放學後'], ['cram', '補習'], ['uni', '大學'], ['transport', '交通']];
  function mapList(K, s) {
    var ul = h('ul', { class: 'wd-map' });
    MAP_KEYS.forEach(function (kk) {
      var k = kk[0], v = s[k];
      if ((k === 'build' || k === 'loan') && s.housing !== 'buy') return;
      if (k === 'after' && (s.school === 'private' || s.school === 'intl')) return;
      var m = K.MAP && K.MAP[k] && K.MAP[k][v];
      if (m) ul.appendChild(h('li', {}, h('b', {}, kk[1]), m));
    });
    (K.notes || []).forEach(function (n) { ul.appendChild(h('li', { class: 'note' }, n)); });
    return ul;
  }

  // ---------- 城市詳細資料 ----------
  var CATS = [
    ['住房', function (a) { return a.housing; }, 'var(--s-expense)'],
    ['養孩子', function (a) { return a.kids; }, 'var(--s-alt)'],
    ['大人生活', function (a) { return a.living; }, 'var(--s-income)'],
    ['交通', function (a) { return a.transport; }, 'var(--warn)'],
    ['稅與社保', function (a) { return a.tax + a.si; }, 'var(--ink-3)']
  ];
  function shares(at) {
    var v = CATS.map(function (c) { return Math.max(0, c[1](at)); }), tot = v.reduce(function (x, y) { return x + y; }, 0);
    return v.map(function (x) { return tot > 0 ? x / tot : 0; });
  }
  function stackBar(label, sh) {
    var bar = h('span', { class: 'wd-stack' });
    sh.forEach(function (f, i) { if (f > 0) bar.appendChild(h('i', { style: { width: (f * 100).toFixed(2) + '%', background: CATS[i][2] }, title: CATS[i][0] + ' ' + Math.round(f * 100) + '%' })); });
    return h('div', { class: 'wd-stack-row' }, h('span', { class: 'wd-stack-l' }, label), bar);
  }
  function detail(r, tw, s, heat) {
    var K = E.country(r.cid), C = K.CITY[r.city], box = h('div', { class: 'wd-detail' });
    var full = s.incomeMode === 'full', both = s.partner && r.who === 'both';
    box.appendChild(h('div', { class: 'card-k' }, '點選的城市'));
    box.appendChild(h('h2', { style: { fontSize: '22px' } }, C.name, K.name === C.name ? null : h('small', { class: 'wd-country' }, K.name)));
    // 門檻 PR 與 100 人圖
    box.appendChild(h('div', { class: 'wd-big' },
      h('s', { style: { background: heat(r.pr) } }), h('b', {}, prText(r.pr)),
      h('span', {}, '你選的' + tw.name + '：' + prText(tw.pr))));
    var n = People.count(r.pr);
    box.appendChild(h('figure', { class: 'wd-pp' },
      People.svg(r.pr, { n: n, label: '每 100 個' + (r.cid === 'TW' ? '台灣' : K.name + '全國') + '同齡全職受僱者，有 ' + n + ' 個收入養得起' }),
      h('figcaption', {}, '每 100 個' + (r.cid === 'TW' ? '台灣' : K.name + '全國') + '同齡全職受僱者，有 ', h('b', {}, String(n)), ' 個收入養得起')));
    // 需要的年薪
    if (r.pr != null && r.pr > 1) {
      var sal = r.who === 'B' ? r.salaryB : r.salaryA;
      box.appendChild(h('p', { class: 'wd-line' }, (both ? '每人' : '') + '年薪要約 ', h('b', {}, money(sal, K)), '（' + twd(sal, K) + '），是' + (r.cid === 'TW' ? '台灣' : K.name + '全國') + '同齡中位數的 ' + (r.ratio ? r.ratio.toFixed(1) : '—') + ' 倍。'));
    } else if (r.pr == null) box.appendChild(h('p', { class: 'wd-line' }, '收入再高也不夠。'));
    else box.appendChild(h('p', { class: 'wd-line' }, '幾乎任何收入都夠。'));
    if (full && r.verdict) {
      var ok = r.minS >= 0;
      box.appendChild(h('p', { class: 'wd-line' }, '把' + (s.partner ? '你們' : '你') + '在台灣的收入排名搬過去：', h('b', { class: ok ? 'wd-yes' : 'wd-no' }, ok ? '養得起' : '不夠'), ok ? '' : '（存款最低 ' + money(r.minS, K) + '）'));
    }
    // 錢花到哪裡：收入剛好達到門檻時，養孩子那些年各項支出的比例
    box.appendChild(h('h3', { class: 'wd-h3' }, '收入剛好夠時，錢花到哪裡'));
    var shC = shares(r.at), shT = shares(tw.at);
    box.appendChild(stackBar(C.short || C.name, shC));
    box.appendChild(stackBar(tw.name, shT));
    var leg = h('div', { class: 'wd-leg' }, h('span', {}), h('span', {}), h('b', {}, C.short || C.name), h('b', {}, tw.name));
    CATS.forEach(function (c, i) {
      leg.appendChild(h('s', { style: { background: c[2] } }));
      leg.appendChild(h('span', {}, c[0]));
      leg.appendChild(h('span', { class: 'v' }, Math.round(shC[i] * 100) + '%'));
      leg.appendChild(h('span', { class: 'v muted' }, Math.round(shT[i] * 100) + '%'));
    });
    box.appendChild(leg);
    // 存款：不畫進長條（收入高的人長條會幾乎都是存款），另外用一句話說
    var a = r.at, yrs = Math.max(1, a.years), per = a.saved / yrs, inc = (a.gross + a.cash) / yrs;
    var save = h('p', { class: 'wd-save' });
    if (per > 0.05 * inc) {
      save.appendChild(document.createTextNode('上面只算花掉的錢。收入剛好夠時，到最小的孩子獨立（你 ' + a.endAge + ' 歲）前，平均每年還能存下約 '));
      save.appendChild(h('b', {}, money(per, K)));
      save.appendChild(document.createTextNode('（' + twd(per, K) + (K.id === 'TW' ? '' : '，') + '約占收入 ' + Math.round(per / inc * 100) + '%）。' +
        (a.deposit > 0.05 * a.saved ? '其中約 ' + money(a.deposit, K) + ' 放在租屋押金裡（全稅押金會退回，但不能隨時動用）。' : '')));
    } else save.appendChild(document.createTextNode('收入剛好夠時，存款最低會降到接近 0，幾乎沒有餘裕。'));
    box.appendChild(save);
    if (r.bind) {
      var b = r.bind;
      box.appendChild(h('p', { class: 'wd-bind' },
        h('b', {}, '門檻卡在買房那年'), '（你 ' + b.age + ' 歲' + (b.beforeKid ? '，第一胎出生前' : '') + '）：要一次拿出約 ', h('b', {}, money(b.cash, K)),
        '（頭期款 ' + money(b.down, K) + '，稅費與裝修 ' + money(b.fees, K) + '）' + (b.refund ? '，其中約 ' + money(b.refund, K) + '可以用退回的租屋押金' : '') + '。房價約 ' + money(b.price, K) + '，最多貸 ' + money(b.loan, K) + '。' +
        (per > 0.25 * inc ? '收入要高到存得出這筆錢，所以買完房之後會有很多餘裕，稅在上面的長條裡也顯得特別多。' : '')));
    }
    box.appendChild(h('p', { class: 'sm muted', style: { marginTop: '8px' } }, '政府給的錢（生育、育兒、托育等現金補助）：占收入 ' + pct(r.at.cash, r.at.gross) + '，' + tw.name + ' ' + pct(tw.at.cash, tw.at.gross) + '。'));
    // 你的選擇在當地怎麼對應
    var how = h('details', { class: 'wd-why' }, h('summary', {}, '你的選擇在' + K.name + '怎麼對應'));
    how.appendChild(mapList(K, s));
    box.appendChild(how);
    box.appendChild(h('p', { class: 'xs muted wd-note' }, '試算版：各國數字來自官方統計與新聞，部分是估計，仍在核對。收入排名以該國全國同年齡的受僱者計算；台幣以市場匯率換算；存款、長輩資助與孝親費依兩地薪資中位數換算。'));
    return box;
  }

  return { COORD: COORD, A3: A3, rows: rows, list: list, detail: detail, mapList: mapList, money: money, key: key, cityName: cityName, prText: prText };
})();

