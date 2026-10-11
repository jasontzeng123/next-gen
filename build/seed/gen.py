import os
# 產生示範資料：在網頁裡用真的試算引擎算出每一份的結果，標記 demo: true
import json, random, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); N=int(sys.argv[1]) if len(sys.argv)>1 else 40
body=open(ROOT+'/dist/index.html').read()
open(ROOT+'/test/page.html','w').write('<!doctype html><html><head><meta charset="utf-8"></head><body>'+body+'</body></html>')
GEN = r"""(N) => {
  let seed = 20261012; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pickW = (pairs) => { const t = pairs.reduce((a, p) => a + p[1], 0); let r = rnd() * t; for (const p of pairs) { if ((r -= p[1]) <= 0) return p[0]; } return pairs[pairs.length - 1][0]; };
  const opt = (key, w) => { const os = QS.optionsOf(key).map(o => o.v); return pickW(os.map((v, i) => [v, w ? (w[i] != null ? w[i] : 1) : 1])); };
  const P = POPGRID.pop, counties = DATA.COUNTIES.map(c => c.id).filter(id => P[id]);
  const inds = DATA.INDUSTRIES.map(x => x.id).filter(id => id !== 'all');
  const out = [];
  for (let i = 0; i < N; i++) {
    const ageA = Math.round(26 + rnd() * 10 + rnd() * 4 - 2);
    const partner = rnd() < 0.85;
    const raw = {
      country: 'TW', county: pickW(counties.map(id => [id, P[id]])), partner,
      ageA, ageB: partner ? Math.max(22, ageA + Math.round(rnd() * 6 - 3)) : ageA,
      firstBirthAge: Math.max(ageA + 1, Math.round(29 + rnd() * 6)),
      kids: pickW([[1, 40], [2, 48], [3, 12]]), spacing: pickW([[2, 50], [3, 35], [4, 15]]),
      room: opt('room'), housing: pickW([['rent', 35], ['buy', 48], ['family', 17]]),
      buyWhen: opt('buyWhen', [2, 5, 3]), build: opt('build', [6, 4]), loan: opt('loan', [6, 2, 3]), reno: opt('reno', [3, 5, 2]),
      postpartum: opt('postpartum'), care: opt('care'), leave: opt('leave'), preschool: opt('preschool'), school: opt('school', [8, 2, 1]),
      after: opt('after'), cram: opt('cram'), uni: opt('uni', [3, 3, 4]), uniAway: rnd() < 0.45, support: opt('support', [2, 5, 2, 1]),
      transport: opt('transport'), lifestyle: opt('lifestyle', [2, 5, 3, 1]), travel: opt('travel', [3, 5, 2, 1]),
      elder: pickW([[0, 15], [5000, 20], [10000, 30], [15000, 12], [20000, 13], [30000, 10]]), elderCare: rnd() < 0.3,
      incomeMode: rnd() < 0.6 ? 'threshold' : 'full',
      jobA: { industry: rnd() < 0.3 ? 'all' : inds[Math.floor(rnd() * inds.length)], pr: Math.round(15 + rnd() * 75) },
      jobB: { industry: rnd() < 0.3 ? 'all' : inds[Math.floor(rnd() * inds.length)], pr: Math.round(15 + rnd() * 75) },
      savings: pickW([[100000, 2], [300000, 3], [600000, 3], [1000000, 2], [2000000, 1]])
    };
    const dl = DATA.DISTRICTS[raw.county]; if (dl) raw.district = dl.length === 2 ? dl[Math.floor(rnd() * 2)].id : pickW(dl.map(d => [d.id, 1]));
    const s = ENGINE.normalize(raw); s.__norm = true;
    const th = ENGINE.threshold(s);
    const res = s.incomeMode === 'full' ? ENGINE.full(s) : ENGINE.atPR(s, 50);
    const d = COMM.buildDoc(s, res, th);
    d.demo = true; d.ts = Date.now() - Math.floor(rnd() * 3 * 86400000);
    out.push(d);
  }
  return out;
}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.goto('file://'+ROOT+'/test/page.html'); pg.wait_for_timeout(800)
    docs=pg.evaluate(GEN, N)
    print('errors', errs)
    b.close()
for i,d in enumerate(docs): d['_seedId']='demo%020d' % (i+1)
json.dump(docs, open(sys.argv[2] if len(sys.argv)>2 else ROOT + '/seed/demo.json','w'), ensure_ascii=False, indent=1)
import statistics as st
print(len(docs), 'docs; max bytes', max(len(json.dumps(d, ensure_ascii=False).encode()) for d in docs))
print('th median', st.median([d['th'] for d in docs]), 'perChild median', st.median([d['perChild'] for d in docs]))
from collections import Counter
for k in ['county','housing','kids','incomeMode','verdict','care','preschool']: print(k, dict(Counter(d.get(k) for d in docs).most_common(6)))
