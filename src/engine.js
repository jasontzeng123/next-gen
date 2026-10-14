/* =========================================================================
   ENGINE — 年度現金流模擬（2026 年幣值）
   共用核心（出生、房間、離職照顧、存款、門檻搜尋）＋各國模組。
   台灣模組在本檔下方；其他國家在 src/country-*.js 以 ENGINE.addCountry() 加入。
   每個國家模組要提供的欄位見下方「國家模組介面」。
   ========================================================================= */
var ENGINE = (function (D) {
  'use strict';

  // ---------- 工具 ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function interp(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) {
        var a = pts[i - 1], b = pts[i];
        return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
    }
    return pts[pts.length - 1][1];
  }
  function interpLog(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) {
        var a = pts[i - 1], b = pts[i];
        var f = (x - a[0]) / (b[0] - a[0]);
        return Math.exp(Math.log(a[1]) + (Math.log(b[1]) - Math.log(a[1])) * f);
      }
    }
    return pts[pts.length - 1][1];
  }
  function stepVal(pts, x) { var v = pts[0][1]; for (var i = 0; i < pts.length; i++) if (x >= pts[i][0]) v = pts[i][1]; return v; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function annuity(bal, r, n) { if (n <= 0) return bal; if (r === 0) return bal / n; return bal * r / (1 - Math.pow(1 + r, -n)); }
  function bracketTax(n, B) {
    if (n <= 0) return 0;
    for (var i = 0; i < B.length; i++) if (n <= B[i][0]) return n * B[i][1] - B[i][2];
    return 0;
  }

  /* ---------- 國家模組介面 ----------
     id, name, cur（幣別）, careEnd（托育到幾歲，台灣 2、其他 3）
     W（薪資分布：median, q, paretoAlpha, ageSpread, age）, IND（產業；其他國家只有 all）
     HOUSEHOLD（可支配所得五分位，可省略）, COST（生活與養育成本）
     city(s) → 城市資料；districtMult(s)；normalize(s)
     housePlan(x) → 房屋計畫；loans(house, x) → [{ bal, rate 或 rates, years, grace }]
     leavePay(g, ind, months, nb, x, who) → 育嬰給付（who：'A' 或 'B'）；leaveMonths（數字，或 function(who, s) → 月數）
     x.y：每年重設的暫存物件（例如累計當年的教育費給稅額抵減用）
     kid(x, k, a) → 每個孩子每年的花費與補助（寫進 x.e、x.tr、x.events）
     family(x)（可省略）→ 依整個家庭計算的補助
     rentFor(c, rooms, rentMult, x) → 月租；rentSubsidy(x)（可省略）
     rentDeposit(c, rooms, rentMult, x)（可省略）→ 租屋押金裡要自己拿出的現金（韓國全稅）；
       押金的增減記在 e.deposit（不是花掉的錢，不算進住房），買房時退回，押金算在淨資產裡；
       x.S、x.depHeld 是年初的存款與已付押金
     afterHousing(x)（可省略）→ 住房算完、報稅之前：要看住房補助或是否自有住宅的補助（法國就業津貼）
     taxes(x) → { si, tax }
  */
  var COUNTRIES = {}, ORDER = [];
  function country(id) { return COUNTRIES[id] || COUNTRIES.TW; }
  function addCountry(K) { if (!COUNTRIES[K.id]) ORDER.push(K.id); COUNTRIES[K.id] = K; return K; }

  // ---------- 薪資分布 ----------
  function wageRatio(p, K) {
    var W = (K || TWK).W;
    p = clamp(p, 0.5, 99.9);
    var last = W.q[W.q.length - 1];
    if (p <= last[0]) return interpLog(W.q, p);
    return last[1] * Math.pow(((100 - last[0]) / 100) / (1 - p / 100), 1 / W.paretoAlpha);
  }
  function wageRatioInv(r, K) {
    var lo = 0.5, hi = 99.9;
    if (r <= wageRatio(lo, K)) return lo;
    if (r >= wageRatio(hi, K)) return hi;
    for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (wageRatio(m, K) < r) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function ageFactor(age, K) { return interp((K || TWK).W.age, age); }
  function industry(K, id) { return K.IND[id] || K.IND.all; }

  // 某人在某年齡、PR、產業下的全年總薪資（不含成長趨勢）
  // 同一年齡層內的薪資差距，比全體（跨年齡）小
  function grossAt(job, age, K) {
    K = K || TWK;
    var ind = industry(K, job.industry);
    if (!ind.median) return 0;
    // 輸入年薪：以輸入值為準，只隨年齡曲線變動
    if (job.mode === 'salary' && job.salary != null && job.age0 != null) return job.salary > 0 ? job.salary * ageFactor(age, K) / ageFactor(job.age0, K) : 0;
    return ind.median * ageFactor(age, K) * Math.pow(wageRatio(job.pr, K), ind.k * (K.W.ageSpread || 0.85));
  }
  // 由年薪推回同產業同年齡 PR
  function prFromSalary(ind_, age, salary, K) {
    K = K || TWK;
    var ind = industry(K, ind_);
    if (!ind.median) return 50;
    if (!(salary > 0)) return 0.5;
    var r = salary / (ind.median * ageFactor(age, K));
    if (ind.k <= 0) return 50;
    return wageRatioInv(Math.pow(r, 1 / (ind.k * (K.W.ageSpread || 0.85))), K);
  }
  // 全體受僱者（不分年齡）中的 PR
  function overallPR(salary, K) { K = K || TWK; return salary > 0 ? wageRatioInv(salary / K.W.median, K) : 0; }

  // 把「同齡同業」的門檻 PR 換算成「同齡、不分產業」的 PR，不同產業的人才能放在一起比較。
  // 有工作的人在門檻 PR 下的平均薪資，換成不分產業時是第幾 PR（假設夫妻同齡，年齡因素互相抵銷）。
  // 只看門檻的人（threshold／full）兩人都算；只填伴侶門檻（thresholdB）只算伴侶。資料庫的 tw_th_all() 與這裡一致。
  function thAllPR(th, indA, indB, partner, incomeMode, county) {
    if (th == null || !isFinite(th)) return null;
    if (th >= 100) return 100;
    if (county && !D.COUNTY[county]) return th;
    var AGE_SPREAD = TWK.W.ageSpread || 0.85;   // 分享統計只收台灣的資料，固定用台灣的薪資分布
    var r = wageRatio(th, TWK), all = D.INDUSTRY.all, sum = 0, n = 0, other = false;
    var add = function (id) { var ind = D.INDUSTRY[id]; if (!ind || !ind.median) return; sum += ind.median * Math.pow(r, ind.k * AGE_SPREAD); n++; if (id !== 'all') other = true; };
    if (incomeMode !== 'thresholdB') add(indA);
    if (partner) add(indB);
    if (!n || !other) return th;   // 全部都是「不分產業」就不用換算
    return wageRatioInv(Math.pow(sum / n / all.median, 1 / (all.k * AGE_SPREAD)), TWK);
  }

  function pctFromPoints(pts, v) {
    // pts: [[percentile, value]] 由小到大；以對數內插，兩端外推
    if (v <= 0) return 0;
    var lv = Math.log(v);
    var first = pts[0], last = pts[pts.length - 1];
    if (v <= first[1]) {
      var p = first[0] * Math.exp((lv - Math.log(first[1])) * 1.4);
      return clamp(p, 0.5, first[0]);
    }
    for (var i = 1; i < pts.length; i++) {
      if (v <= pts[i][1]) {
        var a = pts[i - 1], b = pts[i];
        var f = (lv - Math.log(a[1])) / (Math.log(b[1]) - Math.log(a[1]));
        return a[0] + (b[0] - a[0]) * f;
      }
    }
    var tail = 0.10 * Math.pow(last[1] / v, 2.4);
    return clamp(100 - tail * 100, last[0], 99.9);
  }
  function householdIncomePR(disposable, K) { var H = (K || TWK).HOUSEHOLD; return H && H.disposable ? pctFromPoints(H.disposable, disposable) : null; }
  function householdExpensePR(consumption, K) { var H = (K || TWK).HOUSEHOLD; return H && H.consumption ? pctFromPoints(H.consumption, consumption) : null; }

  // ---------- 預設設定 ----------
  var DEFAULTS = {
    country: 'TW', county: 'TPE', district: 'mid',
    partner: true, ageA: 28, ageB: 28,
    firstBirthAge: 31, kids: 2, spacing: 2,
    room: 'share',
    housing: 'rent', buyWhen: 'beforeKid', build: 'used', loan: 'qingan', reno: 'light', parking: 'buy',
    postpartum: 'center',
    leave: 'B', care: 'quasi', quitWho: 'B', quitUntil: 'preschool',
    preschool: 'quasi', school: 'public', after: 'anqin', cram: 'some',
    uni: 'mixed', uniAway: false, support: '22',
    transport: 'new', lifestyle: 'normal', travel: 'domestic',
    elder: 10000, elderCare: false,
    incomeMode: 'full',
    jobA: { industry: 'all', pr: 50 },
    jobB: { industry: 'all', pr: 50 },
    savings: 500000, giftOnce: 0, giftMonthly: 0, giftYears: 10,
    adv: { wageGrowth: 0.01, returnRate: 0.01, borrowRate: 0.03, inflation: 0.02, bankRate: 0.025, pending: false, rentSubsidy: true, qinganExtend: true, homeGrowth: 0, saveRate: 1 }
  };
  function normalize(raw) {
    var s = clone(DEFAULTS);
    raw = raw || {};
    for (var k in raw) {
      if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
      if (k === 'adv' || k === 'jobA' || k === 'jobB') {
        for (var j in raw[k]) if (Object.prototype.hasOwnProperty.call(raw[k], j)) s[k][j] = raw[k][j];
      } else s[k] = raw[k];
    }
    if (!COUNTRIES[s.country]) s.country = 'TW';
    var K = country(s.country);
    K.normalize(s);
    s.kids = clamp(Math.round(s.kids), 0, 4);
    s.ageA = clamp(Math.round(s.ageA), 18, 50);
    s.ageB = clamp(Math.round(s.ageB), 18, 55);
    s.firstBirthAge = clamp(Math.round(s.firstBirthAge), s.ageA, 50);
    s.spacing = clamp(Math.round(s.spacing), 1, 8);
    if (!s.partner) {
      if (s.leave === 'B' || s.leave === 'both') s.leave = 'A';
      if (s.care === 'quit') s.care = 'quasi';
      s.quitWho = 'A';
    }
    // 互相矛盾的選擇自動修正
    if (s.care === 'quit') {
      if (s.leave === s.quitWho) s.leave = 'none';
      else if (s.leave === 'both') s.leave = s.quitWho === 'A' ? 'B' : 'A';
    }
    if (s.preschool === 'home' && !(s.care === 'quit' && s.quitUntil !== 'preschool')) s.preschool = 'quasi';
    if (s.parking !== 'rent') s.parking = 'buy';
    ['jobA', 'jobB'].forEach(function (k) {
      var jb = s[k];
      if (!K.IND[jb.industry]) jb.industry = 'all';
      if (jb.mode === 'salary' && jb.salary != null) {
        jb.salary = Math.max(0, +jb.salary || 0);
        jb.age0 = k === 'jobA' ? s.ageA : s.ageB;
        jb.pr = prFromSalary(jb.industry, jb.age0, jb.salary, K);
      } else { jb.mode = 'pr'; delete jb.age0; }
      jb.pr = clamp(+jb.pr || 50, 0.5, 99.9);
    });
    return s;
  }

  function supportEndAge(sp) { return { '18': 18, '22': 22, '24': 24, US: 24, UK: 23, JP: 24 }[sp] || 22; }
  function districtMult(s) { return country(s.country).districtMult(s); }

  // ---------- 台灣：租金、坪數、稅、保費 ----------
  function rentFor(c, rooms, rentMult) {
    var r1 = (c.rent[0] + c.rent[1]) / 2, r2 = Math.max(c.rent[2], c.rent[1] * 1.1), r3 = Math.max(c.rent[3], r2 * 1.08);
    var v = rooms <= 1 ? r1 : rooms === 2 ? r2 : rooms === 3 ? r3 : r3 * 1.22;
    return v * rentMult * D.COST.rentListingFactor;
  }
  function houseSize(c, rooms) { return rooms <= 1 ? D.COST.houseSize[1] : rooms === 2 ? c.small : rooms === 3 ? D.COST.houseSize[3] : D.COST.houseSize[4]; }

  // 綜所稅
  function marginalRate(n) { var B = D.TAX.brackets; for (var i = 0; i < B.length; i++) if (n <= B[i][0]) return B[i][1]; return 0.4; }
  function incomeTax(o) {
    // o: {salA, salB, married, minors, adultDeps, preschoolKids, renting, mortgageInterest, persons}
    var T = D.TAX;
    var adults = o.married ? 2 : 1;
    var exemptions = adults * T.exempt + o.minors * T.exemptMinor + o.adultDeps * T.exempt;
    var std = o.married ? T.std.married : T.std.single;
    var itemized = Math.min(o.mortgageInterest || 0, T.mortgageCap) + T.insurancePerPerson * o.persons * 0.6;
    var ded = Math.max(std, itemized);
    var pre = 0; for (var i = 0; i < o.preschoolKids; i++) pre += i === 0 ? T.preschool[0] : T.preschool[1];
    var ssA = Math.min(o.salA, T.salarySpecial), ssB = Math.min(o.salB, T.salarySpecial);
    function compute(withRent) {
      var rent = withRent ? T.rent : 0;
      var basicDiff = Math.max(0, o.persons * T.basicLiving - (exemptions + ded + pre + rent));
      var others = exemptions + ded + pre + rent + basicDiff;
      var combined = bracketTax(o.salA + o.salB - ssA - ssB - others, T.brackets);
      var best = combined, net = o.salA + o.salB - ssA - ssB - others;
      if (o.married && o.salA > 0 && o.salB > 0) {
        var sepA = bracketTax(o.salA - ssA - T.exempt, T.brackets) + bracketTax(o.salB - ssB - (others - T.exempt), T.brackets);
        var sepB = bracketTax(o.salB - ssB - T.exempt, T.brackets) + bracketTax(o.salA - ssA - (others - T.exempt), T.brackets);
        best = Math.min(best, sepA, sepB);
      }
      return { tax: Math.max(0, best), net: net };
    }
    // 幼兒學前與租金特別扣除額：扣除後適用稅率達 20% 者不適用（排富）
    var full = compute(o.renting);
    if (marginalRate(full.net) >= 0.2 && (pre > 0 || o.renting)) { pre = 0; return compute(false).tax; }
    return full.tax;
  }
  function siEmployee(gross, bonusMonths, deps, workFrac) {
    if (gross <= 0 || workFrac <= 0) return 0;
    var monthly = gross / (12 + bonusMonths) / Math.max(workFrac, 0.05);
    var lab = clamp(monthly, D.SI.laborMin, D.SI.laborMax) * D.SI.laborRate;
    var nhi = clamp(monthly, D.SI.nhiMin, D.SI.nhiMax) * D.SI.nhiRate * (1 + Math.min(deps, D.SI.nhiMaxDeps));
    return (lab + nhi) * 12 * workFrac;
  }

  // ---------- 台灣模組 ----------
  var TWK = {
    id: 'TW', name: '台灣', cur: 'TWD', careEnd: 2,
    W: D.WAGE, IND: D.INDUSTRY, HOUSEHOLD: D.HOUSEHOLD, COST: D.COST,
    city: function (s) { return D.COUNTY[s.county]; },
    districtMult: function (s) {
      var dl = D.DISTRICTS[s.county]; if (!dl) return 1;
      for (var i = 0; i < dl.length; i++) if (dl[i].id === s.district) return dl[i].m;
      return 1;
    },
    normalize: function (s) {
      if (!D.COUNTY[s.county]) s.county = 'TPE';
      var dl = D.DISTRICTS[s.county];
      if (!dl) s.district = 'mid';
      else if (!dl.some(function (d) { return d.id === s.district; })) s.district = dl.length === 2 ? dl[0].id : 'mid';
    },
    housePlan: function (x) {
      var s = x.s, A = x.A, C = x.C, c = x.c, tb = x.tb, roomsFinal = x.roomsFinal, dm = x.dm, nK = x.nK, births = x.births;
      var size = houseSize(c, roomsFinal);
      var ppp = (s.build === 'new' ? c.priceNew : c.price * C.usedFactor) * dm * 10000;
      var price = ppp * size;
      var parking = x.hasCar && s.parking === 'buy' ? c.parkBuy * 10000 : 0;
      var total = price + parking;
      var nomAtTb = Math.pow(1 + x.infl, tb);
      var reno = size * (C.reno[s.reno] || C.reno.light);
      // 新青安資格
      var qOK = false, qReason = '';
      var wantQ = s.loan === 'qingan' || s.loan === 'qinganNoGrace';
      var hasKidSoon = nK > 0 && tb >= births[0] - 1;
      if (wantQ) {
        var gA = grossAt(s.jobA, s.ageA + tb, TWK), gB = s.partner ? grossAt(s.jobB, s.ageB + tb, TWK) : Infinity;
        var lowG = Math.min(gA, gB);
        if (!A.qinganExtend && D.BASE_YEAR + tb > 2029) qReason = '新青安3.0 於 2029 年 7 月到期';
        else if (total > D.COUNTY[s.county].cap * 10000) qReason = '房價超過新青安上限（' + c.cap + ' 萬）';
        else if (Math.min(s.ageA, s.partner ? s.ageB : 99) + tb >= D.QINGAN.ageMax) qReason = '借款人年齡須未滿 50 歲';
        else if (lowG > D.QINGAN.incomeMax) qReason = '借款人年所得超過 200 萬';
        else qOK = true;
      }
      var loanTotal = total * 0.8;
      var qLoan = 0, bLoan = loanTotal;
      if (qOK) { qLoan = Math.min(loanTotal, hasKidSoon ? D.QINGAN.capKid : D.QINGAN.capNoKid); bLoan = loanTotal - qLoan; }
      return {
        tb: tb, rooms: roomsFinal, size: size, pricePerPing: ppp, price: price, parking: parking, total: total,
        down: total * 0.2, closing: total * C.closing, reno: reno,
        qOK: qOK, qReason: qReason, wantQ: wantQ, qLoan: qLoan, bLoan: bLoan,
        qBalNom: qLoan * nomAtTb, bBalNom: bLoan * nomAtTb, grace: s.loan === 'qingan' ? D.QINGAN.grace : 0,
        mgmt: c.mgmt * size * 12, tax: D.byCounty(C.houseTax, s.county), ins: C.homeInsurance
      };
    },
    loans: function (h, x) {
      return [{ bal: h.qBalNom, rates: D.QINGAN.rates, years: D.QINGAN.years, grace: h.grace },
              { bal: h.bBalNom, rate: x.A.bankRate, years: D.BANK.years, grace: 0 }];
    },
    leaveMonths: D.BENEFIT.leaveMonths,
    leavePay: function (g, ind, months, nb) {
      var ins = clamp(g / (12 + (ind.bonus || 1.5)), D.SI.laborMin, D.BENEFIT.leaveInsMax);
      return ins * D.BENEFIT.leaveRate * months * nb;
    },
    kid: function (x, k, a) {
      var s = x.s, C = x.C, c = x.c, e = x.e, tr = x.tr, events = x.events, t = x.t;
      var ord = Math.min(k, 2); // 0,1,2 -> 第1、2、3+胎
      if (a === 0) {
        events.push({ k: 'birth', n: k + 1 });
        e.kidsBirth += C.prenatalBirth[s.lifestyle] + (k === 0 ? C.gearFirst[s.lifestyle] : C.gearLater);
        var pp = s.postpartum === 'center' ? D.byCounty(D.POSTPARTUM_CENTER, s.county) * ({ frugal: 0.75, normal: 1, comfy: 1.4 }[s.lifestyle]) : s.postpartum === 'nanny' ? C.postpartumNanny : C.postpartumFamily;
        e.kidsBirth += pp;
        tr.birth += D.BENEFIT.birthPerBaby;
        if (c.birth) tr.cityBirth += c.birth[Math.min(k, c.birth.length - 1)];
      }
      // 生活費
      if (!(a >= 22 && (s.support === 'US' || s.support === 'UK' || s.support === 'JP'))) e.kidsLife += stepVal(C.child, a) * x.chK * 12;
      // 0–2 歲照顧
      if (a < 2) {
        var homeMonths = 0;
        if (x.quit && t >= x.quitStart && t < x.quitEnd) homeMonths = 12;
        else if (a === 0) homeMonths = Math.min(12, x.lmA + x.lmB);
        var careMonths = 12 - homeMonths;
        var allow = D.BENEFIT.allowance02[ord] + D.byCounty(D.CARE.allow02Top, s.county);
        var fee = 0, sub = 0, allowM = homeMonths;
        if (careMonths > 0) {
          var cs = x.quit ? 'quasi' : s.care;
          if (cs === 'public') {
            var pf = D.byCounty(D.CARE.publicFee, s.county);
            sub = Math.min(pf, D.BENEFIT.carePublic[ord] + D.byCounty(D.CARE.topPublic, s.county));
            fee = pf - sub + 1000;
          } else if (cs === 'quasi') {
            var qf = D.byCounty(D.CARE.quasiFee, s.county);
            sub = D.BENEFIT.careQuasi[ord] + D.byCounty(D.CARE.topQuasi, s.county);
            if (s.county === 'TPE' && k > 0 && D.CARE.tpeQuasiSiblingFree) sub = qf;
            sub = Math.min(qf, sub);
            fee = qf - sub + 1000;
          } else if (cs === 'private') { fee = D.byCounty(D.CARE.privateFee, s.county) + 1000; allowM += careMonths; }
          else if (cs === 'grandPaid') { fee = C.grandPaid; allowM += careMonths; }
          else if (cs === 'grandFree') { fee = 0; allowM += careMonths; }
          else if (cs === 'helper') {
            // 一位幫傭照顧所有孩子：整個家庭只計一次（取需要照顧最久的月數）
            fee = 0; x.helperMonths = Math.max(x.helperMonths, careMonths); allowM += careMonths;
          }
        }
        e.kidsCare += fee * careMonths;
        tr.care += sub * careMonths;
        tr.allowance += allow * allowM;
      } else if (a < 6) {
        // 幼兒園
        var ps = s.preschool;
        if (ps === 'home' && !(x.quit && t < x.quitEnd)) ps = 'quasi';
        var feeK = 0;
        if (ps === 'home') { tr.allowance += D.BENEFIT.allowance26[ord] * 12; }
        else if (ps === 'public') { feeK = [1500, 500, 0][ord] + D.KG.extras; tr.kg += (D.byCounty(D.KG.privateFee, s.county) - feeK) * 12; }
        else if (ps === 'quasi') { feeK = D.BENEFIT.kgCap.quasi[ord] + D.KG.extras; tr.kg += (D.byCounty(D.KG.privateFee, s.county) - feeK) * 12; }
        else if (ps === 'private') { feeK = D.byCounty(D.KG.privateFee, s.county) + D.KG.extras; tr.allowance += D.BENEFIT.allowance26[ord] * 12; }
        else if (ps === 'bilingual') { feeK = D.byCounty(D.KG.bilingualFee, s.county) + D.KG.extras; tr.allowance += D.BENEFIT.allowance26[ord] * 12; }
        e.kidsEdu += feeK * 12;
        if (a === 2) events.push({ k: 'kg', n: k + 1 });
      } else if (a < 12) {
        if (a === 6) events.push({ k: 'es', n: k + 1 });
        var hobbies = { none: 0, anqin: 0, anqin1: 1, anqin3: 3 }[s.after] || 0;
        var anq = (s.after !== 'none') ? D.byCounty(D.ANQIN, s.county) * 12 : 0;
        var sch = s.school === 'private' ? C.elementaryPrivate : s.school === 'intl' ? C.intlSchool : C.elementaryPublic;
        if (s.school === 'private' || s.school === 'intl') anq = 0;
        e.kidsEdu += sch + anq + hobbies * C.hobbyClass * 12;
      } else if (a < 15) {
        if (a === 12) events.push({ k: 'jh', n: k + 1 });
        var schJ = (s.school === 'private' || s.school === 'privateJH') ? C.juniorPrivate : s.school === 'intl' ? C.intlSchool : C.juniorPublic;
        e.kidsEdu += schJ + (C.cram.junior[s.cram] || 0) * 12;
      } else if (a < 18) {
        if (a === 15) events.push({ k: 'sh', n: k + 1 });
        var schS = (s.school === 'private' || s.school === 'privateJH') ? C.seniorPrivate : s.school === 'intl' ? C.intlSchool : C.seniorPublic;
        e.kidsEdu += schS + (C.cram.senior[s.cram] || 0) * 12;
      } else if (a < 22) {
        if (a === 18) events.push({ k: 'uni', n: k + 1 });
        e.kidsEdu += C.uni[s.uni] || C.uni.mixed;
        if (s.uni === 'private') tr.uni += D.BENEFIT.privUniReduction; else if (s.uni === 'mixed') tr.uni += D.BENEFIT.privUniReduction / 2;
        if (s.uniAway) e.kidsEdu += C.uniAwayRent * 12;
      } else {
        if (s.support === '24') { if (a === 22) events.push({ k: 'master', n: k + 1 }); e.kidsEdu += C.master; }
        else if (C.abroad[s.support]) { if (a === 22) events.push({ k: 'abroad', n: k + 1 }); e.kidsEdu += C.abroad[s.support].perYear; }
      }
      if (x.A.pending && a < 18 && D.BASE_YEAR + t >= 2027) tr.growth += D.BENEFIT.growthAllowance;
    },
    rentFor: function (c, rooms, rentMult) { return rentFor(c, rooms, rentMult); },
    rentSubsidy: function (x) {
      var c = x.c, atHome = x.atHome, persons = x.persons;
      var hhGross = x.gA + x.gB;
      var mnA = atHome.filter(function (v) { return v < 18; }).length;
      if (hhGross / 12 / persons < (mnA > 0 ? D.RENT_SUB.incomeMultiple : D.RENT_SUB.incomeMultipleBase) * c.minLiving) {
        var mult = 1, mn = atHome.filter(function (v) { return v < 18; }).length;
        if (x.under6 > 0) mult = D.RENT_SUB.newMultBase + D.RENT_SUB.newMultStep * (mn - 1);
        else if (mn > 0) mult = D.RENT_SUB.oldMult[Math.min(mn, 3)] + 0.2 * Math.max(0, mn - 3);
        x.tr.rent = Math.min(c.rsb * mult, x.rentM) * 12;
      }
    },
    taxes: function (x) {
      var s = x.s, gA = x.gA, gB = x.gB;
      var depsA = 0, depsB = 0;
      var primaryA = gA >= gB;
      var depCount = x.atHome.length + ((s.partner && (primaryA ? gB : gA) <= 0) ? 1 : 0);
      if (primaryA) depsA = depCount; else depsB = depCount;
      var si = siEmployee(gA, x.indA.bonus || 1.5, depsA, x.workFracA) + siEmployee(gB, x.indB.bonus || 1.5, depsB, x.workFracB);
      var tax = incomeTax({ salA: gA, salB: gB, married: s.partner, minors: x.minors, adultDeps: x.adultDeps, preschoolKids: x.presch, renting: x.renting, mortgageInterest: x.mortInt, persons: x.persons });
      return { si: si, tax: tax };
    }
  };
  addCountry(TWK);

  // ---------- 主模擬 ----------
  function simulate(raw, opt) {
    opt = opt || {};
    var s = raw && raw.__norm ? raw : normalize(raw);
    var K = country(s.country);
    var A = s.adv, C = K.COST, c = K.city(s);
    var noKids = !!opt.noKids;
    var nK = noKids ? 0 : s.kids;
    var dm = K.districtMult(s), rentMult = Math.pow(dm, 0.6);
    var t0 = Math.max(0, s.firstBirthAge - s.ageA);
    var births = []; for (var i = 0; i < nK; i++) births.push(t0 + i * s.spacing);
    var endAge = supportEndAge(s.support);
    var Tv = opt.ref ? opt.ref.Tv : (nK ? births[nK - 1] + endAge : Math.max(t0 + endAge, 20));
    var T = Math.max(Tv, 65 - s.ageA, Tv + 1);
    var adults = s.partner ? 2 : 1;
    var infl = A.inflation;
    var indA = industry(K, s.jobA.industry), indB = industry(K, s.jobB.industry);
    var refT0 = opt.ref ? opt.ref.t0 : t0;

    // 生活水準
    var lsK = C.lifestyle[s.lifestyle] || 1, chK = C.childLife[s.lifestyle] || 1;
    var adultMonthly = C.adultBase * Math.pow(c.cons / C.consNational, C.consExp) * lsK;

    // 住房計畫（不生小孩的平行世界：兩人租屋；住長輩家的仍住長輩家）
    // sameTenure：計算「孩子的成本」用的對照組——同樣買房，只是房子只要給兩個大人住（2 房）
    var buy = s.housing === 'buy' && (!noKids || !!opt.sameTenure), family = s.housing === 'family';
    var tb = -1;
    if (buy) {
      tb = s.buyWhen === 'now' ? 0 : s.buyWhen === 'beforeKid' ? Math.max(0, refT0 - 1) : refT0 + 5;
      tb = clamp(tb, 0, T - 1);
    }
    var hasCar = s.transport === 'used' || s.transport === 'new' || s.transport === 'import';
    var tc = hasCar ? refT0 : -1; // 有孩子時買車
    var kidAgesAt = function (t) { var a = []; for (var k = 0; k < births.length; k++) if (t >= births[k]) a.push(t - births[k]); return a; };
    function roomsAt(t) {
      var ages = kidAgesAt(t).filter(function (x) { return x < endAge; });
      var n3 = ages.filter(function (x) { return x >= 3; }).length, n6 = ages.filter(function (x) { return x >= 6; }).length;
      var r = 1;
      if (s.room === 'own') r = 1 + n3; else if (s.room === 'share') r = 1 + Math.ceil(n3 / 2); else r = 1 + Math.ceil(n6 / 2);
      return clamp(r, 1, 4);
    }
    var house = null, loans = [];
    if (buy) {
      var roomsFinal = 1;
      for (var tt = tb; tt <= Tv; tt++) roomsFinal = Math.max(roomsFinal, roomsAt(tt));
      roomsFinal = Math.max(roomsFinal, 2);
      var hx = { s: s, A: A, C: C, c: c, K: K, tb: tb, roomsFinal: roomsFinal, dm: dm, nK: nK, births: births, hasCar: hasCar, infl: infl };
      house = K.housePlan(hx);
      loans = K.loans(house, hx);
    }
    var bals = loans.map(function (l) { return l.bal; });

    // 離職照顧
    var quit = !noKids && nK > 0 && s.care === 'quit';
    var quitWho = s.partner ? s.quitWho : 'A';
    var quitStart = quit ? t0 : -1;
    var quitEnd = !quit ? -1 : s.quitUntil === 'preschool' ? births[nK - 1] + 2 : s.quitUntil === 'school' ? births[nK - 1] + 6 : Infinity;
    var quitYears = quit ? (quitEnd === Infinity ? 0 : quitEnd - quitStart) : 0;
    // 育嬰留停（每胎、每人）
    function leaveMonths(who) {
      if (noKids) return 0;
      if (quit && who === quitWho) return 0;
      if (who === 'B' && !s.partner) return 0;
      if (!(s.leave === who || s.leave === 'both')) return 0;
      return typeof K.leaveMonths === 'function' ? K.leaveMonths(who, s) : K.leaveMonths; // 德國：一人請 12 個月，夫妻各 7 個月
    }
    var lmA = leaveMonths('A'), lmB = leaveMonths('B');

    function personGross(who, t) {
      var job = who === 'A' ? s.jobA : s.jobB;
      var age0 = who === 'A' ? s.ageA : s.ageB;
      if (who === 'B' && !s.partner) return 0;
      var age = age0 + t, tg = t;
      if (age >= 65) return 0;
      if (quit && who === quitWho) {
        if (t >= quitStart && t < quitEnd) return 0;
        if (t >= quitEnd) { age -= quitYears; tg -= quitYears; }
      }
      return grossAt(job, age, K) * Math.pow(1 + A.wageGrowth, tg);
    }

    var hadJob = function (job) { return industry(K, job.industry).median > 0 && !(job.mode === 'salary' && !(job.salary > 0)); };
    var hadJobA = hadJob(s.jobA), hadJobB = s.partner && hadJob(s.jobB);
    var years = [];
    var S = s.savings;
    var carOwnedSince = -1, carPays = [], depHeld = 0;
    var totals = {}, subs = { birth: 0, cityBirth: 0, allowance: 0, care: 0, leave: 0, rent: 0, uni: 0, growth: 0, kg: 0, pension: 0 };
    var minS = Infinity, minT = 0, firstNeg = -1;
    // 每年交給國家模組的資料
    var x = { s: s, A: A, C: C, c: c, K: K, chK: chK, quit: quit, quitStart: quitStart, quitEnd: quitEnd, lmA: lmA, lmB: lmB, births: births, endAge: endAge, house: house, indA: indA, indB: indB };

    for (var t = 0; t < T; t++) {
      var ageA = s.ageA + t, ageB = s.ageB + t;
      var kAges = kidAgesAt(t);
      var events = [];
      var e = { housing: 0, housingOnce: 0, living: 0, kidsBirth: 0, kidsCare: 0, kidsEdu: 0, kidsLife: 0, transport: 0, elder: 0, travel: 0, debtInterest: 0, extra: 0 };
      var tr = { birth: 0, cityBirth: 0, allowance: 0, care: 0, leave: 0, rent: 0, uni: 0, growth: 0, kg: 0, pension: 0 };
      x.t = t; x.e = e; x.tr = tr; x.events = events; x.kAges = kAges; x.helperMonths = 0; x.y = {}; // x.y：國家模組每年用的暫存
      x.S = S; x.depHeld = depHeld; // 年初的存款與已付的押金（韓國全稅：決定自己拿得出多少押金）
      // ---- 收入 ----
      var gA = personGross('A', t), gB = personGross('B', t);
      // 65 歲後：年金（有工作者）
      if (ageA >= 65 && hadJobA) tr.pension += C.pension;
      if (s.partner && ageB >= 65 && hadJobB) tr.pension += C.pension;
      // 育嬰留停（出生當年）
      var leaveAllow = 0, workFracA = 1, workFracB = 1;
      var nb = kAges.filter(function (a) { return a === 0; }).length;
      if (nb > 0) {
        if (lmA && gA > 0) {
          leaveAllow += K.leavePay(gA, indA, lmA, nb, x, 'A'); workFracA = Math.max(0, 1 - lmA * nb / 12); gA *= workFracA;
        }
        if (lmB && gB > 0) {
          leaveAllow += K.leavePay(gB, indB, lmB, nb, x, 'B'); workFracB = Math.max(0, 1 - lmB * nb / 12); gB *= workFracB;
        }
      }
      tr.leave = leaveAllow;
      if (quit && t === quitEnd) events.push({ k: 'back', who: quitWho });
      if (quit && t === quitStart) events.push({ k: 'quit', who: quitWho });

      // 依賴人口
      var atHome = kAges.filter(function (a) { return a < endAge; });
      var minors = atHome.filter(function (a) { return a < 18; }).length;
      var adultDeps = atHome.length - minors;
      var under6 = atHome.filter(function (a) { return a < 6; }).length;
      var presch = atHome.filter(function (a) { return a <= 6; }).length; // 幼兒學前特別扣除額：當年 6 歲以下
      var persons = adults + atHome.length;
      x.gA = gA; x.gB = gB; x.workFracA = workFracA; x.workFracB = workFracB;
      x.atHome = atHome; x.minors = minors; x.adultDeps = adultDeps; x.under6 = under6; x.presch = presch; x.persons = persons;

      // ---- 孩子 ----
      for (var k = 0; k < births.length; k++) {
        var a = t - births[k]; if (a < 0 || a >= endAge) continue;
        K.kid(x, k, a);
      }
      if (K.family) K.family(x);
      e.kidsCare += (C.helper || 0) * x.helperMonths;
      births.forEach(function (b, k2) { if (t - b === endAge) events.push({ k: 'indep', n: k2 + 1 }); });

      // ---- 大人生活 ----
      e.living = adultMonthly * adults * 12 + (C.utilBase + C.utilPerPerson * persons) * 12;
      e.travel = s.travel === 'abroad' ? C.travel.abroadPerPerson * persons : s.travel === 'domestic' ? C.travel.domestic : 0;
      if (ageA < 60) e.elder = (+s.elder || 0) * 12;
      if (s.elderCare && ageA >= 50 && ageA < 60) e.elder += C.elderCareMonthly * 12;

      // ---- 交通 ----
      if (s.transport === 'transit') e.transport = c.tpass * 12 * adults;
      else if (s.transport === 'scooter') { var sc = C.scooter; e.transport = (sc.buy * (1 - sc.resale) / sc.life + sc.run) * adults; }
      else if (hasCar && t >= tc) {
        var cr = C.car[s.transport];
        // 購車以 5 年分期（0 利率）攤付
        if (carOwnedSince < 0) { carPays.push({ amt: cr.buy / C.carInstallYears, left: C.carInstallYears }); carOwnedSince = t; events.push({ k: 'car' }); }
        else if ((t - carOwnedSince) % cr.life === 0) { carPays.push({ amt: cr.buy * (1 - cr.resale) / C.carInstallYears, left: C.carInstallYears }); events.push({ k: 'car2' }); }
        carPays.forEach(function (cp) { if (cp.left > 0) { e.transport += cp.amt; cp.left--; } });
        e.transport += cr.run;
        if (!(buy && t >= tb && s.parking === 'buy')) e.transport += c.park * 12;
      } else if (hasCar) {
        e.transport = c.tpass * 12 * adults; // 買車前搭大眾運輸
      }

      // ---- 住房 ----
      var renting = false, mortInt = 0, homeValue = 0, loanBalReal = 0, rooms = roomsAt(t), principal = 0;
      if (family) { e.housing = 0; }
      else if (buy && t >= tb) {
        var h = house;
        if (t === tb) { e.housingOnce = h.down + h.closing + h.reno; events.push({ k: 'buy' }); if (depHeld) { e.deposit = (e.deposit || 0) - depHeld; depHeld = 0; } } // 押金退回，拿去付頭期款
        var ly = t - tb; // 貸款年度
        var payNom = 0, intNom = 0;
        for (var li = 0; li < loans.length; li++) {
          if (!(bals[li] > 1)) continue;
          var L = loans[li];
          var lr = L.rates ? L.rates[Math.min(ly, L.rates.length - 1)] : L.rate;
          var li_ = bals[li] * lr; intNom += li_;
          if (ly < L.grace) payNom += li_;
          else { var pl = annuity(bals[li], lr, L.years - ly); payNom += pl; bals[li] -= (pl - li_); }
          if (ly === L.grace && L.grace > 0) events.push({ k: 'grace' });
        }
        var defl = Math.pow(1 + infl, t);
        e.housing = payNom / defl + h.mgmt + h.tax + h.ins;
        mortInt = intNom / defl;
        principal = (payNom - intNom) / defl;
        homeValue = h.total * Math.pow(1 + A.homeGrowth, t - tb);
        var balSum = 0; for (var bi = 0; bi < bals.length; bi++) balSum += Math.max(0, bals[bi]);
        loanBalReal = balSum / defl;
        rooms = h.rooms;
      } else {
        renting = true;
        var rentM = K.rentFor(c, rooms, rentMult, x);
        e.housing = rentM * 12;
        x.rentM = rentM;
        if (A.rentSubsidy && K.rentSubsidy) K.rentSubsidy(x);
        if (K.rentDeposit) { var dep = K.rentDeposit(c, rooms, rentMult, x); if (dep !== depHeld) e.deposit = (e.deposit || 0) + dep - depHeld; depHeld = dep; }
      }

      var carDebt = 0; carPays.forEach(function (cp) { carDebt += cp.amt * cp.left; });
      // ---- 稅與保費 ----
      x.renting = renting; x.mortInt = mortInt; x.loanBalReal = loanBalReal; x.ly = buy && t >= tb ? t - tb : -1;
      if (K.afterHousing) K.afterHousing(x); // 要知道住房補助才能算的補助（法國就業津貼）
      var tx = K.taxes(x);
      var si = tx.si, tax = tx.tax;

      // ---- 資助 ----
      var gift = 0;
      if (s.giftOnce && t === (buy ? tb : 0)) gift += +s.giftOnce;
      if (s.giftMonthly && t < (+s.giftYears || 0)) gift += s.giftMonthly * 12;

      var transfers = tr.birth + tr.cityBirth + tr.allowance + tr.leave + tr.rent + tr.growth + tr.pension;
      if (tr.fund) transfers += tr.fund; // 中國大陸：雇主提撥的住房公積金（可用於房貸與房租）
      // 托育補助已直接折抵費用（tr.care 只做統計）；大學減免已反映在學費（tr.uni 只做統計）；幼兒園 tr.kg 為與私幼差價（只做統計）
      var gross = gA + gB;
      var netIncome = gross - si - tax + transfers + gift;
      var expTotal = 0; for (var key in e) expTotal += e[key];

      // ---- 存款 ----
      var interest = S >= 0 ? S * A.returnRate : S * A.borrowRate;
      if (S < 0) e.debtInterest = -interest;
      if (S < 0) expTotal += -interest; else netIncome += interest;
      // 結餘只存下一部分（進階設定）：沒存下來的算作「其他花費」（婚禮、3C、意外等）；入不敷出的年份不受影響
      var saveRate = A.saveRate == null ? 1 : Math.max(0, Math.min(1, +A.saveRate));
      if (saveRate < 1 && netIncome > expTotal) { e.extra = (netIncome - expTotal) * (1 - saveRate); expTotal += e.extra; }
      var Sstart = S;
      S = S + netIncome - expTotal;
      if (t <= Tv) {
        if (S < minS) { minS = S; minT = t; }
        if (S < 0 && firstNeg < 0) firstNeg = t;
        for (var key2 in e) totals[key2] = (totals[key2] || 0) + e[key2];
        for (var key3 in tr) subs[key3] = (subs[key3] || 0) + tr[key3];
      }
      // 事件記下總共幾個孩子，文字才能寫「老大」或只有一個時寫「孩子」
      events.forEach(function (ev) { if (ev && ev.n) ev.of = nK; });
      years.push({
        t: t, year: D.BASE_YEAR + t, ageA: ageA, ageB: ageB, kids: kAges, events: events,
        gA: gA, gB: gB, gross: gross, si: si, tax: tax, transfers: transfers, tr: tr, gift: gift, interest: interest,
        net: netIncome, exp: e, expTotal: expTotal, Sstart: Sstart, S: S, rooms: rooms, renting: renting, principal: principal,
        homeValue: homeValue, loanBal: loanBalReal, carDebt: carDebt, netWorth: S + homeValue - loanBalReal - carDebt + depHeld
      });
      if (depHeld) years[years.length - 1].deposit = depHeld;
    }

    // ---- 摘要 ----
    var win = years.slice(0, Tv + 1);
    var avgExp = sum(win.map(function (y) { return y.expTotal - y.exp.housingOnce; })) / Math.max(1, win.length);
    var buffer = avgExp * 0.5;
    var endS = (years[Tv] || years[years.length - 1]).S;
    var minRaise = Infinity, minRaiseT = Math.min(t0, Tv); for (var vi = Math.min(t0, Tv); vi <= Tv && vi < years.length; vi++) if (years[vi].S < minRaise) { minRaise = years[vi].S; minRaiseT = vi; }
    var repayT = -1; if (minS < 0) for (var ri = minT + 1; ri < years.length; ri++) if (years[ri].S >= 0) { repayT = ri; break; }
    var verdict = minS < 0 ? (endS >= 0 ? 'fail' : 'broke') : minRaise >= buffer ? 'pass' : 'tight';
    var raiseYears = nK ? win.filter(function (y) { return y.t >= t0; }) : win;
    var avgCons = sum(raiseYears.map(function (y) { return y.expTotal - y.exp.housingOnce - y.exp.debtInterest - y.exp.elder - y.principal; })) / Math.max(1, raiseYears.length);
    var yNow = years[0];
    var yBirth = years[Math.min(t0, years.length - 1)];
    var at65 = years.filter(function (y) { return y.ageA === 64; })[0] || years[years.length - 1];
    var subTotal = subs.birth + subs.cityBirth + subs.allowance + subs.care + subs.leave + subs.rent + subs.uni + subs.growth;

    return {
      s: s, years: years, Tv: Tv, T: T, t0: t0, births: births, endAge: endAge, house: house, tc: tc,
      minS: minS, minT: minT, minRaise: minRaise, minRaiseT: minRaiseT, repayT: repayT, firstNeg: firstNeg,
      low: minS < 0 ? { v: minS, t: minT } : { v: minRaise, t: minRaiseT },
      netWorthTv: (years[Tv] || years[years.length - 1]).netWorth, endS: endS, verdict: verdict, buffer: buffer, avgExp: avgExp,
      totals: totals, subs: subs, subTotal: subTotal,
      quit: quit ? { who: quitWho, start: quitStart, end: quitEnd } : null,
      grossNow: yNow.gross, grossBirth: personGross('A', t0) + personGross('B', t0),
      disp0: yNow.gross - yNow.si - yNow.tax + yNow.transfers,
      dispBirth: yBirth.gross - yBirth.si - yBirth.tax + yBirth.transfers,
      avgCons: avgCons,
      at65: at65
    };
  }

  // ---------- 衍生分析 ----------
  function full(raw) {
    var s = normalize(raw); s.__norm = true;
    var K = country(s.country);
    var r = simulate(s);
    var ref = { Tv: r.Tv, t0: r.t0 };
    // 存摺圖的平行世界：不生小孩、兩人租屋（住長輩家的仍住長輩家）
    var p = simulate(s, { noKids: true, ref: ref });
    r.parallel = p;
    // 「養一個孩子要多少」的對照組：同樣的住法，只是不生小孩。買房的人改買給兩個大人住的 2 房，
    // 兩者相減就是「為了孩子多買的房間」（多出的房價、利息與稅費）；租屋者則是多租的房間
    var q = s.housing === 'buy' ? simulate(s, { noKids: true, sameTenure: true, ref: ref }) : p;
    r.parallelSame = q;
    var sumW = function (sim, f) { var v = 0; for (var i = 0; i <= r.Tv && i < sim.years.length; i++) v += f(sim.years[i]); return v; };
    var yT = r.years[r.Tv] || r.years[r.years.length - 1], pT = p.years[r.Tv] || p.years[p.years.length - 1];
    r.houseEquity = r.house && r.Tv >= r.house.tb ? Math.max(0, yT.homeValue - yT.loanBal) : 0;
    // 「沒存下來的結餘」不算養孩子的成本（它取決於當年剩多少錢，不是孩子本身的花費）
    var ownExp = function (y) { return y.expTotal - y.exp.debtInterest - (y.exp.extra || 0); };
    r.childCost = sumW(r, ownExp) - sumW(q, ownExp);
    r.incomeLoss = sumW(q, function (y) { return y.gross; }) - sumW(r, function (y) { return y.gross; });
    r.savingsGap = pT.S - r.endS;                       // 現金存款的差距（對照不生小孩、租屋）
    r.netWorthGap = pT.netWorth - yT.netWorth;          // 把房屋淨值也算進去的差距
    // 補助：托育補助與私大減免已直接折抵費用，不能再扣一次；租金補貼只算「因為有孩子多領的部分」
    var S_ = r.subs, P_ = q.subs;
    r.rentSubKids = Math.max(0, S_.rent - P_.rent);
    r.cashSubs = S_.birth + S_.cityBirth + S_.allowance + S_.leave + S_.growth + r.rentSubKids;
    r.feeSubs = S_.care + S_.uni;
    r.childSubs = r.cashSubs + r.feeSubs;
    r.childGross = r.childCost + r.incomeLoss;            // 已扣折抵後的多花＋少賺
    r.perChild = s.kids ? (r.childGross - r.cashSubs) / s.kids : 0;
    // 百分位
    r.prOverallA = overallPR(r.years[0].gA, K);
    r.prOverallB = s.partner ? overallPR(r.years[0].gB, K) : null;
    r.hhIncomePR = householdIncomePR(Math.max(1, r.disp0), K);
    r.hhExpensePR = householdExpensePR(Math.max(1, r.avgCons), K);
    r.prA = s.jobA.pr; r.prB = s.jobB.pr;
    return r;
  }

  // 指定收入 PR 的完整結果（門檻模式的報告用）
  function atPR(raw, p) {
    var s = clone(raw.__norm ? raw : normalize(raw)), who = whoUnknown(s);
    if (who !== 'B') { s.jobA.pr = p; s.jobA.mode = 'pr'; }
    if (s.partner && who !== 'A') { s.jobB.pr = p; s.jobB.mode = 'pr'; }
    s.__norm = true;
    return full(s);
  }
  // 門檻 PR：雙方（或未知的一方）收入 PR 需要多少，存款才不跌破 0
  function thresholdSettings(s, p, who) {
    var x = clone(s); x.__norm = true;
    if (who === 'A' || who === 'both') { x.jobA.pr = p; x.jobA.mode = 'pr'; }
    if ((who === 'B' || who === 'both') && x.partner) { x.jobB.pr = p; x.jobB.mode = 'pr'; }
    return x;
  }
  function whoUnknown(s) {
    if (s.incomeMode === 'threshold') return s.partner ? 'both' : 'A';
    if (s.incomeMode === 'thresholdB') return 'B';
    return 'both';
  }
  function threshold(raw, opts) {
    opts = opts || {};
    var s = raw.__norm ? raw : normalize(raw);
    var K = country(s.country);
    var who = opts.who || whoUnknown(s);
    var ok = function (p, need) { var r = simulate(thresholdSettings(s, p, who)); return need === 'pass' ? r.verdict === 'pass' : r.minS >= 0; };
    function search(need) {
      if (!ok(99.9, need)) return null; // 再高也不夠
      if (ok(1, need)) return 1;
      // 粗掃再細找（避免補助門檻造成的非單調）
      var prev = 1;
      for (var p = 5; p <= 100; p += 5) {
        var pp = Math.min(p, 99.9);
        if (ok(pp, need)) {
          var lo = prev, hi = pp;
          for (var i = 0; i < 12; i++) { var m = (lo + hi) / 2; if (ok(m, need)) hi = m; else lo = m; }
          // 確認門檻以上都過關（補助或新青安的所得門檻可能造成「收入高一點反而不過」）
          var bad = -1;
          for (var q = hi + 0.1; q <= Math.min(99.9, hi + 2); q += 0.1) if (!ok(q, need)) bad = q;
          for (var q2 = hi + 2.5; q2 <= Math.min(99.9, hi + 6); q2 += 0.5) if (!ok(q2, need)) bad = q2;
          if (bad < 0) return hi;
          prev = bad; p = Math.ceil(bad / 5) * 5 - 5;
          continue;
        }
        prev = pp;
      }
      return null;
    }
    var pr = search('ok');
    var res = { who: who, pr: pr, prPass: opts.quick ? undefined : search('pass') };
    if (pr != null) {
      var rs = simulate(thresholdSettings(s, pr, who));
      res.grossBirth = rs.grossBirth; res.grossNow = rs.grossNow;
      res.dispBirth = rs.dispBirth; res.hhPR = householdIncomePR(Math.max(1, rs.disp0), K);
      res.salaryA = grossAt(rs.s.jobA, rs.s.ageA, K); res.salaryB = rs.s.partner ? grossAt(rs.s.jobB, rs.s.ageB, K) : 0;
      res.overall = overallPR(res.salaryA, K);
    }
    return res;
  }
  function curve(raw, opts) {
    opts = opts || {};
    var s = raw.__norm ? raw : normalize(raw);
    var who = opts.who || whoUnknown(s);
    var out = [];
    var ps = opts.ps || [1, 3, 5, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 88, 90, 92, 94, 96, 97, 98, 99, 99.5, 99.9];
    ps.forEach(function (p) { var r = simulate(thresholdSettings(s, p, who)); out.push({ p: p, minS: r.minS, endS: r.endS, verdict: r.verdict, gross: r.grossBirth }); });
    return out;
  }

  // 最小妥協：哪些改變能讓結果過關（台灣）
  var COMPROMISES = [
    { id: 'kidsLess', label: '少生一個孩子', w: 6, ok: function (s) { return s.kids > 1; }, f: function (s) { s.kids--; } },
    { id: 'later', label: '晚 3 年再生第一胎', w: 4, ok: function (s) { return s.firstBirthAge + 3 <= 42; }, f: function (s) { s.firstBirthAge += 3; } },
    { id: 'rent', label: '不買房，長期租屋', w: 3, ok: function (s) { return s.housing === 'buy'; }, f: function (s) { s.housing = 'rent'; } },
    { id: 'used', label: '改買中古屋', w: 2, ok: function (s) { return s.housing === 'buy' && s.build === 'new'; }, f: function (s) { s.build = 'used'; } },
    { id: 'share', label: '孩子共用房間（少一房）', w: 2, ok: function (s) { return s.room === 'own' && s.kids > 1; }, f: function (s) { s.room = 'share'; } },
    { id: 'outer', label: '搬到同縣市較外圍的區域', w: 3, ok: function (s) { var dl = D.DISTRICTS[s.county]; return dl && s.district !== dl[dl.length - 1].id; }, f: function (s) { var dl = D.DISTRICTS[s.county]; s.district = dl[dl.length - 1].id; } },
    { id: 'move', label: '搬到房價較低的鄰近縣市', w: 5, ok: function (s) { return !!MOVE_TO[s.county]; }, f: function (s) { s.county = MOVE_TO[s.county]; s.district = 'mid'; }, detail: function (s) { return D.COUNTY[MOVE_TO[s.county]].name; } },
    { id: 'noCar', label: '不買車，靠大眾運輸', w: 3, ok: function (s) { return ['used', 'new', 'import'].indexOf(s.transport) >= 0; }, f: function (s) { s.transport = 'transit'; } },
    { id: 'usedCar', label: '改買二手車', w: 1, ok: function (s) { return s.transport === 'new' || s.transport === 'import'; }, f: function (s) { s.transport = 'used'; } },
    { id: 'grand', label: '請長輩幫忙帶 0–2 歲', w: 3, ok: function (s) { return ['private', 'helper', 'quasi', 'public'].indexOf(s.care) >= 0; }, f: function (s) { s.care = 'grandPaid'; } },
    { id: 'quasiCare', label: '托育改用準公共', w: 1, ok: function (s) { return s.care === 'private' || s.care === 'helper'; }, f: function (s) { s.care = 'quasi'; } },
    { id: 'noQuit', label: '不辭職，改送準公共托育', w: 2, ok: function (s) { return s.care === 'quit'; }, f: function (s) { s.care = 'quasi'; if (s.preschool === 'home') s.preschool = 'quasi'; } },
    { id: 'backEarly', label: '孩子上幼兒園就回職場', w: 1, ok: function (s) { return s.care === 'quit' && s.quitUntil !== 'preschool'; }, f: function (s) { s.quitUntil = 'preschool'; if (s.preschool === 'home') s.preschool = 'quasi'; } },
    { id: 'kgQuasi', label: '幼兒園改讀準公共', w: 1, ok: function (s) { return s.preschool === 'private' || s.preschool === 'bilingual'; }, f: function (s) { s.preschool = 'quasi'; } },
    { id: 'publicSchool', label: '國中小到高中都讀公立', w: 2, ok: function (s) { return s.school !== 'public'; }, f: function (s) { s.school = 'public'; } },
    { id: 'noAfter', label: '不上安親班與才藝班', w: 2, ok: function (s) { return s.after !== 'none'; }, f: function (s) { s.after = 'none'; } },
    { id: 'noCram', label: '國高中不補習', w: 2, ok: function (s) { return s.cram !== 'none'; }, f: function (s) { s.cram = 'none'; } },
    { id: 'noAbroad', label: '不出國留學', w: 2, ok: function (s) { return ['US', 'UK', 'JP'].indexOf(s.support) >= 0; }, f: function (s) { s.support = '22'; } },
    { id: 'noMaster', label: '只供養到大學畢業', w: 1, ok: function (s) { return s.support === '24'; }, f: function (s) { s.support = '22'; } },
    { id: 'frugal', label: '日常開銷再省一級', w: 3, ok: function (s) { return s.lifestyle !== 'frugal'; }, f: function (s) { s.lifestyle = s.lifestyle === 'comfy' ? 'normal' : 'frugal'; } },
    { id: 'noTravel', label: '不出國旅遊', w: 1, ok: function (s) { return s.travel === 'abroad'; }, f: function (s) { s.travel = 'domestic'; } },
    { id: 'elderHalf', label: '孝親費減半', w: 4, ok: function (s) { return s.elder >= 5000; }, f: function (s) { s.elder = Math.round(s.elder / 2); } },
    { id: 'noCenter', label: '不住月子中心，請家人幫忙', w: 1, ok: function (s) { return s.postpartum === 'center'; }, f: function (s) { s.postpartum = 'family'; } }
  ];
  var MOVE_TO = { TPE: 'NTPC', NTPC: 'TYN', HSZ: 'MIA', HSQ: 'MIA', TXG: 'CHA', KHH: 'PIF', TNN: 'CYQ' };

  function compromises(raw) {
    var s = raw.__norm ? raw : normalize(raw); s.__norm = true;
    var thresholdMode = s.incomeMode !== 'full';
    var metric = function (r) { return r.minS < 0 ? r.minS : r.minRaise; };
    var base = thresholdMode ? threshold(s, { quick: true }).pr : metric(simulate(s));
    var list = [];
    COMPROMISES.forEach(function (cp) {
      if (!cp.ok(s)) return;
      var x = clone(s); x.__norm = true;
      var detail = cp.detail ? cp.detail(x) : '';
      cp.f(x);
      var item = { id: cp.id, label: cp.label + (detail ? '（' + detail + '）' : ''), w: cp.w };
      if (thresholdMode) {
        var tp = threshold(x, { quick: true }).pr;
        item.value = tp; item.gain = (base == null ? 100 : base) - (tp == null ? 100 : tp); item.passes = tp != null && (base == null || tp < base);
      } else {
        var r = simulate(x);
        item.value = metric(r); item.gain = metric(r) - base; item.passes = r.minS >= 0;
      }
      if (item.gain > 0) list.push(item);
    });
    list.sort(function (a, b) { return (b.passes - a.passes) || (b.gain / b.w - a.gain / a.w); });
    // 若單一改變都不夠：貪婪組合
    var combo = null;
    if (!thresholdMode && base < 0 && !list.some(function (x) { return x.passes; })) {
      var cur = clone(s); cur.__norm = true; var steps = [];
      for (var round = 0; round < 7; round++) {
        var curMin = simulate(cur).minS; if (curMin >= 0) break;
        var best = null;
        COMPROMISES.forEach(function (cp) {
          if (!cp.ok(cur) || steps.some(function (st) { return st.id === cp.id; })) return;
          var x = clone(cur); x.__norm = true; var detail = cp.detail ? cp.detail(x) : ''; cp.f(x);
          var m = simulate(x).minS; var g = (m - curMin) / cp.w;
          if (!best || g > best.g) best = { id: cp.id, label: cp.label + (detail ? '（' + detail + '）' : ''), g: g, x: x, m: m };
        });
        if (!best || best.m <= curMin) break;
        steps.push(best); cur = best.x;
      }
      combo = { steps: steps.map(function (st) { return { id: st.id, label: st.label }; }), passes: simulate(cur).minS >= 0, minS: simulate(cur).minS };
    }
    return { base: base, list: list, combo: combo, mode: thresholdMode ? 'threshold' : 'full' };
  }

  // 同樣的標準：最早要等到幾歲才生得起（逐年試算到 maxAge）
  function waitAge(raw, opts) {
    opts = opts || {};
    var s = clone(raw.__norm ? raw : normalize(raw)); s.__norm = true;
    if (opts.pr != null) { s.jobA.pr = opts.pr; s.jobA.mode = 'pr'; if (s.partner) { s.jobB.pr = opts.pr; s.jobB.mode = 'pr'; } }
    var maxAge = opts.maxAge || 45, list = [], earliest = null;
    for (var a = s.ageA; a <= maxAge; a++) {
      var x = clone(s); x.firstBirthAge = a; x.__norm = true;
      var r = simulate(x), ok = r.minS >= 0;
      list.push({ age: a, ok: ok, minS: r.minS });
      if (ok && earliest == null) earliest = a;
    }
    var planned = s.firstBirthAge, pl = list.filter(function (l) { return l.age === planned; })[0];
    return { list: list, earliest: earliest, planned: planned, plannedOk: !!(pl && pl.ok), maxAge: maxAge, pr: opts.pr, gap: s.partner ? s.ageB - s.ageA : null };
  }

  // 最多能養幾個
  function maxKids(raw) {
    var s = raw.__norm ? raw : normalize(raw);
    var best = 0;
    for (var n = 1; n <= 4; n++) { var x = clone(s); x.__norm = true; x.kids = n; if (simulate(x).minS >= 0) best = n; }
    return best;
  }

  // 時光機：把房價與薪資換回某一年（實質；台灣）
  function timeMachine(raw, year) {
    var s = raw.__norm ? raw : normalize(raw);
    var H = D.HISTORY, Y = H.years[H.years.length - 1];
    var key = H.sinyiMap[s.county] || 'ALL';
    var idx = H.sinyi[key][year] != null ? H.sinyi[key] : H.sinyi.ALL;
    var priceF = (idx[year] / idx[Y]) * (H.cpi[Y] / H.cpi[year]);
    var wageF = H.realWage[year] / H.realWage[Y];
    return { priceF: priceF, wageF: wageF, key: key };
  }
  // 只把「房價相對於當年薪資」換回那一年；其他花費與收入都以今天的水準衡量
  function withEra(fn, s, year) {
    var f = timeMachine(s, year), c = D.COUNTY[s.county];
    var rel = f.priceF / f.wageF;
    var keep = { p: c.price, pn: c.priceNew, pb: c.parkBuy };
    c.price *= rel; c.priceNew *= rel; c.parkBuy *= rel;
    try { return fn(); } finally { c.price = keep.p; c.priceNew = keep.pn; c.parkBuy = keep.pb; }
  }
  function eraRel(s, year) { var f = timeMachine(s, year); return f.priceF / f.wageF; }

  return {
    DEFAULTS: DEFAULTS, normalize: normalize, simulate: simulate, full: full, atPR: atPR, threshold: threshold, curve: curve,
    compromises: compromises, maxKids: maxKids, waitAge: waitAge, timeMachine: timeMachine, eraRel: eraRel, withEra: withEra,
    grossAt: grossAt, prFromSalary: prFromSalary, overallPR: overallPR, wageRatio: wageRatio, ageFactor: ageFactor, thAllPR: thAllPR,
    householdIncomePR: householdIncomePR, householdExpensePR: householdExpensePR, supportEndAge: supportEndAge,
    districtMult: districtMult, rentFor: rentFor, houseSize: houseSize, incomeTax: incomeTax, clone: clone, MOVE_TO: MOVE_TO,
    // 國家模組
    addCountry: addCountry, country: country, countries: function () { return ORDER.slice(); },
    util: { clamp: clamp, interp: interp, interpLog: interpLog, stepVal: stepVal, annuity: annuity, bracketTax: bracketTax, sum: sum, pctFromPoints: pctFromPoints }
  };
})(typeof DATA !== 'undefined' ? DATA : require('./data.js'));
if (typeof module !== 'undefined') module.exports = ENGINE;
