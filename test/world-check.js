// 各國模組的檢查：實拿比例、養一個孩子到 18 歲的花費、標準情境的門檻 PR
// 用法：node test/world-check.js JP [KR FR CN]
'use strict';
const D = require('../src/data.js');
const E = require('../src/engine.js');
const W = require('../src/world.js');
// 只載入要檢查的國家（其他國家的檔案可能正在編修）
const want = process.argv.slice(2).length ? process.argv.slice(2).map(s => s.toUpperCase()) : ['JP', 'KR', 'FR', 'CN', 'US', 'UK', 'DE', 'SE', 'CA', 'AU'];
want.forEach(c => { try { require('../src/country-' + c.toLowerCase() + '.js'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } });
const ids = want.filter(c => E.countries().indexOf(c) >= 0);
const fmt = (v, K) => (v / (K.id === 'TW' ? 10000 : (K.unit || 10000))).toFixed(1);

function takeHome(K, g, opt) {
  opt = opt || {};
  const cityId = opt.city || K.cities[0];
  const x = {
    s: Object.assign({ partner: !!opt.partner, ageA: opt.age || 35, ageB: opt.age || 35, build: 'used', leave: 'none', jobA: {}, jobB: {} }, opt.s || {}),
    c: K.CITY[cityId], C: K.COST, K, t: 0, gA: g, gB: opt.gB || 0, workFracA: 1, workFracB: 1,
    atHome: opt.kids || [], minors: (opt.kids || []).filter(a => a < 18).length, adultDeps: 0, presch: 0, persons: 1 + (opt.partner ? 1 : 0) + (opt.kids || []).length,
    ly: -1, loanBalReal: 0, A: { inflation: 0.02 }, renting: true, mortInt: 0, indA: K.IND.all, indB: K.IND.all, tr: {}, y: {}, kAges: []
  };
  const r = K.taxes(x);
  return { si: r.si, tax: r.tax, net: g - r.si - r.tax, rate: (g - r.si - r.tax) / g };
}

// 一個孩子從出生到 18 歲（不含 18）的養育花費：一般水準、公立、送托
function childTo18(K, cityId, over) {
  const s = Object.assign({ country: K.id, kids: 1, ageA: 30, ageB: 30, firstBirthAge: 30, support: '22', housing: 'rent', room: 'share', care: 'quasi', preschool: 'quasi', school: 'public', after: 'anqin', cram: 'some', postpartum: 'center', leave: 'B', lifestyle: 'normal', transport: 'transit', incomeMode: 'full' }, over || {});
  if (K.id === 'TW') s.county = cityId; else s.city = cityId;
  const r = E.simulate(s);
  let spend = 0, cash = 0, fee = 0;
  for (let t = 0; t < 18; t++) {
    const y = r.years[t], e = y.exp;
    spend += e.kidsBirth + e.kidsCare + e.kidsEdu + e.kidsLife;
    cash += y.tr.birth + y.tr.cityBirth + y.tr.allowance + y.tr.growth;
    fee += y.tr.care + y.tr.kg;
  }
  return { spend, cash, net: spend - cash, fee };
}

ids.forEach(cid => {
  const K = E.country(cid);
  console.log('\n==================== ' + K.name + ' (' + K.cur + ', 單位 ' + (K.unitName || '萬') + ') wageFactor ' + K.wageFactor.toFixed(4) + ' ====================');
  console.log('薪資中位數', fmt(K.W.median, K), ' P10/P90', [10, 25, 75, 90, 99].map(p => p + ':' + fmt(E.wageRatio(p, K) * K.W.median, K)).join(' '));
  console.log('年齡曲線', [25, 30, 35, 40, 50, 60].map(a => a + ':' + E.ageFactor(a, K).toFixed(2)).join(' '));
  console.log('\n實拿（單身、無扶養，' + K.cities[0] + '）：');
  (K.CHECK_SALARIES || [0.5, 0.75, 1, 1.5, 2, 3].map(f => Math.round(K.W.median * f / 100000) * 100000)).forEach(g => {
    const r = takeHome(K, g);
    console.log('  年薪', fmt(g, K), ' 社保', fmt(r.si, K), ' 稅', fmt(r.tax, K), ' 實拿', fmt(r.net, K), ' 比例', (r.rate * 100).toFixed(1) + '%');
  });
  K.cities.forEach(cy => {
    const c = childTo18(K, cy);
    const c2 = childTo18(K, cy, { care: 'grandFree', after: 'none', cram: 'none' });
    console.log('\n[' + K.CITY[cy].name + '] 一個孩子 0–17 歲：花費', fmt(c.spend, K), ' 現金補助', fmt(c.cash, K), ' 淨', fmt(c.net, K), ' （另有費用減免', fmt(c.fee, K) + '）  最省版花費', fmt(c2.spend, K));
    const base = { kids: 2, firstBirthAge: 31, ageA: 28, ageB: 28, incomeMode: 'threshold' };
    [['租屋 2 胎（預設）', {}], ['買中古 2 胎', { housing: 'buy' }], ['租屋 1 胎', { kids: 1 }], ['買新屋 2 胎 雙語幼兒園 私立', { housing: 'buy', build: 'new', preschool: 'bilingual', school: 'private' }]].forEach(([label, o]) => {
      const tw = Object.assign({}, base, o);
      const rw = W.row(tw, cid, cy);
      const rt = W.row(tw, 'TW', 'TPE');
      const at = rw.at, yrs = at.years;
      console.log('  ' + label.padEnd(18), '門檻 PR', rw.pr == null ? '—' : rw.pr.toFixed(1), '（台北', rt.pr == null ? '—' : rt.pr.toFixed(1) + '）', ' 年薪', rw.salaryA ? fmt(rw.salaryA, K) : '—',
        ' 每年平均：住', fmt(at.housing / yrs, K), ' 孩子', fmt(at.kids / yrs, K), ' 生活', fmt(at.living / yrs, K), ' 交通', fmt(at.transport / yrs, K), ' 稅', fmt(at.tax / yrs, K), ' 社保', fmt(at.si / yrs, K), ' 補助', fmt(at.cash / yrs, K));
    });
  });
});
