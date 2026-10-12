import os
import sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
MOCK = """
(() => {
  const store = {};
  const mk = (path) => ({ get: async () => ({ exists: !!store[path], data: () => store[path] }), set: async (d) => { store[path] = JSON.parse(JSON.stringify(d)); }, delete: async () => { delete store[path]; } });
  const coll = (p) => ({ orderBy: () => coll(p), limit: () => coll(p), get: async () => ({ docs: Object.keys(store).filter(k => k.startsWith(p + '/')).map(k => ({ id: k.split('/').pop(), data: () => store[k] })) }), doc: (id) => mk(p + '/' + id) });
  const db = { doc: (p) => mk(p), collection: coll };
  const user = { id: async () => 'u_ABCdef123456789012345a', can: async () => true };
  window.__store = store;
  window.claude = { use: (n) => new Promise(r => setTimeout(() => r(n === 'db' ? db : n === 'user' ? user : null), 50)) };
})();
"""
choice = sys.argv[1] if len(sys.argv) > 1 else 'share'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, color_scheme='dark')
    logs=[]
    pg.on('console', lambda m: logs.append(m.type+': '+m.text) if 'ERR_FAILED' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR '+str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.add_init_script(MOCK)
    pg.goto('file://'+ROOT+'/test/page.html'); pg.wait_for_timeout(800)
    pg.click('text=開始填寫申請書'); pg.wait_for_timeout(300)
    if pg.query_selector('.notice'): pg.click('text=我了解了，開始填寫'); pg.wait_for_timeout(300)
    for n in range(40):
        if pg.query_selector('#county-sel'): pg.select_option('#county-sel','TPE'); pg.wait_for_timeout(150)
        elif pg.query_selector('.opts'):
            o=pg.query_selector_all('.opts .opt'); o[min(1,len(o)-1)].click(); pg.wait_for_timeout(120)
        nb=pg.query_selector('#next-btn')
        if not nb: break
        last='送出' in nb.inner_text(); nb.click(); pg.wait_for_timeout(250)
        if last: break
    pg.wait_for_timeout(400)
    btns = pg.query_selector_all('.modal .actions button')
    print('modal buttons:', [x.inner_text() for x in btns])
    if btns: (btns[-1] if choice=='share' else btns[0]).click()
    pg.wait_for_timeout(300)
    print('screen after click:', pg.evaluate('APP.screen'))
    pg.wait_for_timeout(5000)
    pg.screenshot(path=SHOTS+'/mock-reveal-'+choice+'.png', full_page=True)
    print('stamp:', bool(pg.query_selector('.stamp')), 'rows:', len(pg.query_selector_all('.ledger-row')))
    print('store keys:', pg.evaluate('Object.keys(window.__store)'))
    for l in logs: print(l)
    b.close()
