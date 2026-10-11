const D = require('../src/data.js');
const E = require('../src/engine.js');
const W = n => (n / 10000).toFixed(0) + '萬';

function show(label, s) {
  const r = E.full(s);
  const th = E.threshold(s);
  console.log('\n=== ' + label + ' ===');
  console.log('verdict', r.verdict, 'minS', W(r.minS), 'at t', r.minT, 'firstNeg', r.firstNeg, 'endS', W(r.endS), 'Tv', r.Tv);
  console.log('grossNow', W(r.grossNow), 'grossBirth', W(r.grossBirth), 'dispBirth', W(r.dispBirth), 'hhIncomePR', r.hhIncomePR.toFixed(1), 'hhExpPR', r.hhExpensePR.toFixed(1), 'avgCons', W(r.avgCons));
  console.log('prOverallA', r.prOverallA.toFixed(1));
  console.log('childCost', W(r.childCost), 'incomeLoss', W(r.incomeLoss), 'subTotal', W(r.subTotal), 'perChild', W(r.perChild), 'savingsGap', W(r.savingsGap));
  console.log('totals', Object.fromEntries(Object.entries(r.totals).map(([k, v]) => [k, W(v)])));
  console.log('subs', Object.fromEntries(Object.entries(r.subs).map(([k, v]) => [k, W(v)])));
  if (r.house) console.log('house', { size: r.house.size, price: W(r.house.price), total: W(r.house.total), down: W(r.house.down), reno: W(r.house.reno), qOK: r.house.qOK, qReason: r.house.qReason, qLoan: W(r.house.qLoan), bLoan: W(r.house.bLoan) });
  console.log('threshold', th.pr && th.pr.toFixed(1), 'pass', th.prPass && th.prPass.toFixed(1), 'salaryA@pr', th.salaryA && W(th.salaryA), 'grossBirth', th.grossBirth && W(th.grossBirth), 'hhPR', th.hhPR && th.hhPR.toFixed(1));
  const ys = r.years.filter(y => y.t % 3 === 0 && y.t <= r.Tv + 3);
  console.log('t  age  gross   si   tax  trans   exp    S');
  ys.forEach(y => console.log(y.t, y.ageA, W(y.gross), W(y.si), W(y.tax), W(y.transfers), W(y.expTotal), W(y.S), y.events.map(e => e.k || e).join(',')));
  return r;
}

show('台北 一般 雙薪PR50 租屋 2胎', {});
show('台北 買房 中古 新青安', { housing: 'buy' });
show('新北 租屋 2胎', { county: 'NTPC' });
show('高雄 買房', { county: 'KHH', housing: 'buy' });
show('台北 雙PR80 買新屋', { housing: 'buy', build: 'new', jobA: { pr: 80 }, jobB: { pr: 80 } });
show('台南 1胎 一方辭職', { county: 'TNN', kids: 1, care: 'quit', quitUntil: 'school', preschool: 'home' });

console.log('\nwage ratio check', [10, 25, 50, 75, 90, 95, 99].map(p => p + ':' + (E.wageRatio(p) * 546000 / 10000).toFixed(1)).join(' '));
console.log('age factor', [25, 28, 30, 35, 40, 45, 50, 55, 60].map(a => a + ':' + E.ageFactor(a).toFixed(2)).join(' '));
console.log('tax: 2 earners 60萬 each, 2 kids under 6, renting:', E.incomeTax({ salA: 600000, salB: 600000, married: true, minors: 2, adultDeps: 0, preschoolKids: 2, renting: true, mortgageInterest: 0, persons: 4 }));
console.log('tax: 2 earners 150萬 each, 2 kids 10y:', E.incomeTax({ salA: 1500000, salB: 1500000, married: true, minors: 2, adultDeps: 0, preschoolKids: 0, renting: false, mortgageInterest: 0, persons: 4 }));

const t0 = Date.now(); for (let i = 0; i < 200; i++) E.simulate({}); console.log('200 sims ms', Date.now() - t0);
const c = E.compromises({ housing: 'buy', build: 'new' });
console.log('compromises', c.mode, W(c.base), c.list.slice(0, 6).map(x => x.label + ' ' + W(x.value) + (x.passes ? ' ✓' : '')).join(' | '), c.combo && JSON.stringify(c.combo.steps.map(s => s.label)));
console.log('maxKids default', E.maxKids({}));
[1996, 2011, 2026].forEach(y => { const th = E.withEra(() => E.threshold({ housing: 'buy' }, { quick: true }), E.normalize({ housing: 'buy' }), y); console.log('era', y, th.pr && th.pr.toFixed(1)); });
