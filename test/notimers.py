import os
import sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
body=open(ROOT+'/dist/index.html').read()
open(ROOT+'/test/page.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>')
mode = sys.argv[1] if len(sys.argv) > 1 else 'paused'
INIT = """
(() => {
  if (%s) { window.setTimeout = function () { return 0; }; window.setInterval = function () { return 0; }; }
  if (%s) { window.requestAnimationFrame = function () { return 0; }; }
  const store = {};
  const mk = (path) => ({ get: async () => ({ exists: !!store[path], data: () => store[path] }), set: async (d) => { store[path] = JSON.parse(JSON.stringify(d)); }, delete: async () => { delete store[path]; } });
  const coll = (p) => ({ orderBy: () => coll(p), limit: () => coll(p), get: async () => ({ docs: [] }), doc: (id) => mk(p + '/' + id) });
  const db = { doc: (p) => mk(p), collection: coll };
  const user = { id: async () => 'u_testowner00000000000001', can: async () => true };
  window.__store = store;
  window.claude = { use: (n) => Promise.resolve(n === 'db' ? db : n === 'user' ? user : null) };
})();
""" % ('true' if mode in ('paused','norafs') else 'false', 'true' if mode == 'norafs' else 'false')
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}, color_scheme='dark', is_mobile=True, has_touch=True); pg=ctx.new_page()
    logs=[]
    pg.on('console', lambda m: logs.append(m.type+': '+m.text) if 'ERR_FAILED' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR '+str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.add_init_script(INIT)
    pg.goto('file://'+ROOT+'/test/page.html'); pg.wait_for_timeout(700)
    pg.tap('text=開始填寫申請書'); pg.wait_for_timeout(300)
    for n in range(40):
        if pg.query_selector('#county-sel') and not pg.evaluate("!!APP.seen.county"): pg.select_option('#county-sel','NTPC'); pg.wait_for_timeout(120)
        elif pg.query_selector('.opts') and not pg.query_selector('.opts .opt[aria-checked=true]'):
            o=pg.query_selector_all('.opts .opt'); o[min(1,len(o)-1)].tap(); pg.wait_for_timeout(100)
        nb=pg.query_selector('#next-btn')
        if not nb: break
        last='送出' in nb.inner_text(); nb.tap(); pg.wait_for_timeout(200)
        if last: break
    pg.wait_for_timeout(300)
    btns=pg.query_selector_all('.modal .actions button')
    if btns: btns[-1].tap()
    pg.wait_for_timeout(3500)
    pg.screenshot(path=SHOTS+'/notimer-'+mode+'-reveal.png')
    vis = pg.evaluate("(() => { const b = [...document.querySelectorAll('.cover-cta .btn.seal')].find(x => x.textContent.includes('完整')); return b ? getComputedStyle(b.parentElement).opacity : 'none'; })()")
    print(mode, '| reveal stamp:', bool(pg.query_selector('.stamp')), 'rows:', len(pg.query_selector_all('.ledger-row')), 'actions opacity:', vis, 'title:', pg.inner_text('.phase-b') if pg.query_selector('.phase-b') else None)
    pg.tap('text=查看完整審查報告'); pg.wait_for_timeout(1500)
    print(mode, '| report: comp rows', len(pg.query_selector_all('.comp-row')), 'empty', bool(pg.query_selector('#sec-comp .empty')), 'chart svg', bool(pg.query_selector('#sec-flow svg')))
    # change a setting via the drawer
    pg.tap('.drawer-btn'); pg.wait_for_timeout(300)
    pg.select_option('#p-county', index=2); pg.wait_for_timeout(800)
    print(mode, '| after panel change county:', pg.evaluate("APP.s.county"), 'summary has 桃園:', '桃園' in pg.inner_text('#sec-head'))
    pg.evaluate("document.querySelector('.scrim') && document.querySelector('.scrim').click()")
    pg.evaluate("APP.go('lab')"); pg.wait_for_timeout(2000)
    print(mode, '| lab rank rows:', len(pg.query_selector_all('.rank-row')))
    pg.evaluate("APP.lab.tab='curve'; APP.go('lab')"); pg.wait_for_timeout(2500)
    print(mode, '| lab heat tables:', len(pg.query_selector_all('table.heat')), 'curve svg:', bool(pg.query_selector('.rsec .chart-box svg')))
    print(mode, '| diag doc:', pg.evaluate("JSON.stringify(window.__store['data/users/u_testowner00000000000001/diag'] || null).slice(0,300)"))
    for l in logs[:8]: print('  ', l)
    b.close()
