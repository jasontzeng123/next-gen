// 隨機設定跑遍 9 個城市：不能出錯、不能有 NaN
'use strict';
const D = require('../src/data.js'), E = require('../src/engine.js'), W = require('../src/world.js');
['jp', 'kr', 'fr', 'cn', 'us', 'uk'].forEach(c => require('../src/country-' + c + '.js'));
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)], int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const n = +(process.argv[2] || 120); let bad = 0, sims = 0; const t0 = Date.now();
function chk(label, v, s) { if (typeof v === 'number' && !isFinite(v)) { bad++; if (bad < 6) console.log('NaN', label, JSON.stringify(s).slice(0, 200)); } }
for (let i = 0; i < n; i++) {
  const ageA = int(20, 44);
  const s = { county: pick(D.COUNTIES).id, partner: rnd() < .8, ageA, ageB: ageA + int(-4, 5), firstBirthAge: ageA + int(0, 8), kids: int(0, 4), spacing: int(1, 5),
    room: pick(['own', 'share', 'parents']), housing: pick(['rent', 'buy', 'family']), buyWhen: pick(['now', 'beforeKid', 'beforeSchool']), build: pick(['used', 'new']), loan: pick(['qingan', 'bank']), reno: pick(['basic', 'light', 'full']), parking: pick(['buy', 'rent']),
    postpartum: pick(['center', 'nanny', 'family']), leave: pick(['none', 'A', 'B', 'both']), care: pick(['quasi', 'public', 'private', 'grandPaid', 'grandFree', 'helper', 'quit']), quitWho: pick(['A', 'B']), quitUntil: pick(['preschool', 'school', 'never']),
    preschool: pick(['public', 'quasi', 'private', 'bilingual', 'home']), school: pick(['public', 'privateJH', 'private', 'intl']), after: pick(['none', 'anqin', 'anqin1', 'anqin3']), cram: pick(['none', 'some', 'full']), uni: pick(['public', 'private', 'mixed']), uniAway: rnd() < .3,
    support: pick(['18', '22', '24', 'JP', 'UK', 'US']), transport: pick(['transit', 'scooter', 'used', 'new', 'import']), lifestyle: pick(['frugal', 'normal', 'comfy']), travel: pick(['none', 'domestic', 'abroad']), elder: pick([0, 10000]), elderCare: rnd() < .2,
    incomeMode: pick(['threshold', 'full', 'thresholdB']), savings: pick([0, 500000, 3000000]), giftOnce: pick([0, 1000000]),
    jobA: rnd() < .3 ? { industry: pick(D.INDUSTRIES).id, mode: 'salary', salary: pick([0, 500000, 1500000]) } : { industry: pick(D.INDUSTRIES).id, pr: pick([5, 50, 95]) },
    jobB: { industry: pick(D.INDUSTRIES).id, pr: pick([5, 50, 95]) } };
  E.countries().forEach(cid => {
    if (cid === 'TW') return;
    E.country(cid).cities.forEach(cy => {
      try {
        const ls = W.localize(s, cid, cy), r = E.full(ls); sims++;
        ['minS', 'endS', 'perChild', 'childCost', 'grossNow', 'avgCons'].forEach(k => chk(cid + cy + ':' + k, r[k], s));
        r.years.forEach(y => { chk(cid + cy + ':S', y.S, s); chk(cid + cy + ':tax', y.tax, s); chk(cid + cy + ':si', y.si, s); if (y.tax < -1e-6 && y.tax < -0.5 * y.gross) { bad++; console.log('neg tax', cid, cy, y.tax, y.gross); } });
        if (i % 6 === 0) { const th = E.threshold(ls, { quick: true }); chk(cid + cy + ':th', th.pr == null ? 0 : th.pr, s); }
      } catch (e) { bad++; if (bad < 6) console.log('ERR', cid, cy, e.stack.split('\n').slice(0, 3).join(' | '), JSON.stringify(s).slice(0, 200)); }
    });
  });
}
console.log((bad ? 'FAIL ' + bad : 'OK') + ', ' + sims + ' full runs, ' + (Date.now() - t0) + ' ms');
process.exit(bad ? 1 : 0);
