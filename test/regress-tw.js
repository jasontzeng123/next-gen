// 台灣結果回歸測試：重構後的引擎與凍結的 v1 引擎（test/ref/）必須逐位元相同
// 用法：node test/regress-tw.js [數量=300]
'use strict';
const OLD = require('./ref/engine-tw-v1.js');
const D = require('../src/data.js');
const NEW = require('../src/engine.js');

let seed = 20261012;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function int(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

function randomSettings() {
  const county = pick(D.COUNTIES).id;
  const dl = D.DISTRICTS[county];
  const ageA = int(20, 44);
  const s = {
    county, district: dl ? pick(dl).id : 'mid',
    partner: rnd() < 0.8, ageA, ageB: ageA + int(-5, 6),
    firstBirthAge: ageA + int(0, 8), kids: int(0, 4), spacing: int(1, 5),
    room: pick(['own', 'share', 'parents']),
    housing: pick(['rent', 'buy', 'buy', 'family']), buyWhen: pick(['now', 'beforeKid', 'beforeSchool']),
    build: pick(['used', 'new']), loan: pick(['qingan', 'qinganNoGrace', 'bank']), reno: pick(['basic', 'light', 'full']), parking: pick(['buy', 'rent']),
    postpartum: pick(['center', 'nanny', 'family']),
    leave: pick(['none', 'A', 'B', 'both']), care: pick(['quasi', 'public', 'private', 'grandPaid', 'grandFree', 'helper', 'quit']),
    quitWho: pick(['A', 'B']), quitUntil: pick(['preschool', 'school', 'never']),
    preschool: pick(['public', 'quasi', 'private', 'bilingual', 'home']), school: pick(['public', 'privateJH', 'private', 'intl']),
    after: pick(['none', 'anqin', 'anqin1', 'anqin3']), cram: pick(['none', 'some', 'full']),
    uni: pick(['public', 'private', 'mixed']), uniAway: rnd() < 0.3, support: pick(['18', '22', '24', 'JP', 'UK', 'US']),
    transport: pick(['transit', 'scooter', 'used', 'new', 'import']), lifestyle: pick(['frugal', 'normal', 'comfy']),
    travel: pick(['none', 'domestic', 'abroad']), elder: pick([0, 5000, 10000, 20000]), elderCare: rnd() < 0.2,
    incomeMode: pick(['threshold', 'full', 'thresholdB']),
    savings: pick([0, 300000, 500000, 2000000]), giftOnce: pick([0, 0, 1000000]), giftMonthly: pick([0, 0, 10000]), giftYears: int(1, 15),
    adv: { wageGrowth: pick([0, 0.01, 0.02]), returnRate: pick([0.01, 0.03]), borrowRate: 0.03, inflation: pick([0.02, 0.03]), bankRate: pick([0.025, 0.03]), pending: rnd() < 0.3, rentSubsidy: rnd() < 0.8, qinganExtend: rnd() < 0.8, homeGrowth: pick([0, 0.01]) }
  };
  const job = () => rnd() < 0.3
    ? { industry: pick(D.INDUSTRIES).id, mode: 'salary', salary: pick([0, 300000, 600000, 1200000, 3000000]) }
    : { industry: pick(D.INDUSTRIES).id, pr: pick([1, 10, 35, 50, 72.5, 90, 99]) };
  s.jobA = job(); s.jobB = job();
  return s;
}

// v1 之後新增、預設值不影響結果的欄位：adv.saveRate＝1（結餘全部存下）、exp.extra＝0（沒存下的結餘）；預設值時略過，其餘逐位元比對
// v1 之後新增、預設值不影響結果的欄位：已有房的房貸（ownBal 等）、自己填車價（carPrice 等）、模擬結果的 own＝null
const NEWDEF = { ownBal: 6000000, ownRate: 0.022, ownYears: 25, ownGrace: 0, carPrice: 850000, carLife: 10, carHave: 0, travelCost: 60000, extraMonthly: 0, debtBal: 0, debtRate: 0.035, debtYears: 5, other: 0, debt: 0 };
const strip = (r) => JSON.stringify(r, (k, v) => ((k === 'saveRate' && v === 1) || (k === 'extra' && v === 0) || (k in NEWDEF && v === NEWDEF[k]) || (k === 'own' && v === null) || k === 'buyAge') ? undefined : (typeof v === 'number' && !isFinite(v)) ? String(v) : v);
let n = +(process.argv[2] || 300), bad = 0, checks = 0;
function same(label, a, b, s) {
  checks++;
  const A = strip(a), B = strip(b);
  if (A !== B) {
    bad++;
    if (bad <= 5) {
      let i = 0; while (i < A.length && A[i] === B[i]) i++;
      console.log('DIFF', label, JSON.stringify(s).slice(0, 300));
      console.log('  old:', A.slice(Math.max(0, i - 120), i + 80));
      console.log('  new:', B.slice(Math.max(0, i - 120), i + 80));
    }
  }
}
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const s = randomSettings();
  same('normalize', OLD.normalize(s), NEW.normalize(s), s);
  same('full', OLD.full(s), NEW.full(s), s);
  if (i % 3 === 0) same('threshold', OLD.threshold(s), NEW.threshold(s), s);
  if (i % 3 === 1) same('thresholdQuick', OLD.threshold(s, { quick: true }), NEW.threshold(s, { quick: true }), s);
  if (i % 10 === 0) same('compromises', OLD.compromises(s), NEW.compromises(s), s);
  if (i % 10 === 5) same('waitAge', OLD.waitAge(s, { pr: 60 }), NEW.waitAge(s, { pr: 60 }), s);
  if (i % 10 === 7) same('maxKids', OLD.maxKids(s), NEW.maxKids(s), s);
  if (i % 10 === 3) same('curve', OLD.curve(s), NEW.curve(s), s);
  if (i % 20 === 9) {
    const ns = OLD.normalize(s);
    same('era', OLD.withEra(() => OLD.threshold(ns, { quick: true }), ns, 1996), NEW.withEra(() => NEW.threshold(ns, { quick: true }), NEW.normalize(s), 1996), s);
  }
}
// 匯出的工具函數
[10, 50, 90, 95, 99.9].forEach(p => same('wageRatio' + p, OLD.wageRatio(p), NEW.wageRatio(p)));
[600000, 1500000].forEach(x => same('overallPR' + x, OLD.overallPR(x), NEW.overallPR(x)));
same('prFromSalary', OLD.prFromSalary('semi', 30, 900000), NEW.prFromSalary('semi', 30, 900000));
same('grossAt', OLD.grossAt({ industry: 'fin', pr: 70 }, 33), NEW.grossAt({ industry: 'fin', pr: 70 }, 33));
same('incomeTax', OLD.incomeTax({ salA: 600000, salB: 600000, married: true, minors: 2, adultDeps: 0, preschoolKids: 2, renting: true, mortgageInterest: 0, persons: 4 }),
  NEW.incomeTax({ salA: 600000, salB: 600000, married: true, minors: 2, adultDeps: 0, preschoolKids: 2, renting: true, mortgageInterest: 0, persons: 4 }));
same('rentFor', OLD.rentFor(D.COUNTY.TPE, 3, 1.1), NEW.rentFor(D.COUNTY.TPE, 3, 1.1));
console.log((bad ? 'FAIL ' : 'OK ') + (checks - bad) + '/' + checks + ' identical, ' + n + ' random settings, ' + (Date.now() - t0) + ' ms');
process.exit(bad ? 1 : 0);
