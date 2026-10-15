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
       城市：price / priceNew（每 ㎡）、mgmt（每 ㎡ 每月）、propTax（占房價比例，每年）、parkBuy（可省略）
       loanPlan(x, total) → { parts: [{ amt, rate 或 rates, years, grace, label }], note }  */
  function stdHousePlan(x) {
    var s = x.s, K = x.K, C = x.C, c = x.c, tb = x.tb, rooms = x.roomsFinal;
    var size = C.houseSize[rooms];
    var ppsm = (s.build === 'new' ? c.priceNew : c.price) * x.dm;
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
if (typeof module !== 'undefined') module.exports = WORLD;
