import os
# 發佈前檢查：模擬三種訪客，從封面填完整份申請書到報告與實驗室
#   owner    — 作者本人：可以寫入共享資料與個人存檔
#   outside  — 從公開連結進來、已登入的外部訪客：只能讀，寫入一律被拒（invalid_argument）
#   signedout — 未登入：db 不可用（claude.use('db') 回傳 null）
import sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
body = open(ROOT + '/dist/index.html').read()
open(ROOT + '/test/page.html', 'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>')
MOCK = """
(() => {
  const ROLE = '%s';
  const UID = ROLE === 'owner' ? 'u_owner000000000000000001' : 'u_visitor00000000000000002';
  const store = {
    'submissions/u_other1': { v: 2, ts: 1, county: 'TPE', kids: 2, th: 55, perChild: 4500000, housing: 'buy' },
    'submissions/u_other2': { v: 2, ts: 2, county: 'KHH', kids: 1, th: 40, perChild: 3500000, housing: 'rent' },
    'submissions/u_other3': { v: 2, ts: 3, county: 'TXG', kids: 2, th: 70, perChild: 5000000, housing: 'buy' },
    'submissions/u_other4': { v: 2, ts: 4, county: 'NTPC', kids: 2, th: 82, perChild: 5200000, housing: 'buy' },
    'submissions/u_other5': { v: 2, ts: 5, county: 'TNN', kids: 1, th: 35, perChild: 3100000, housing: 'rent' }
  };
  const writes = []; window.__writes = writes; window.__store = store;
  const canWrite = ROLE === 'owner';
  const deny = () => Promise.reject({ code: 'invalid_argument', message: 'below minimum level' });
  const freeze = (o) => { if (o && typeof o === 'object') { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const mk = (path) => ({
    get: async () => ({ exists: !!store[path], data: () => freeze(JSON.parse(JSON.stringify(store[path] || null))) }),
    set: (d) => { writes.push(path); if (!canWrite) return deny(); store[path] = JSON.parse(JSON.stringify(d)); return Promise.resolve(); },
    delete: () => { writes.push('del:' + path); if (!canWrite) return deny(); delete store[path]; return Promise.resolve(); }
  });
  const coll = (p) => ({ orderBy: () => coll(p), limit: () => coll(p), get: async () => ({ docs: Object.keys(store).filter(k => k.startsWith(p + '/') && k.split('/').length === p.split('/').length + 1).map(k => ({ id: k.split('/').pop(), data: () => freeze(JSON.parse(JSON.stringify(store[k]))) })) }), doc: (id) => mk(p + '/' + id) });
  const db = { doc: (p) => mk(p), collection: coll };
  const user = { id: async () => UID, can: async () => canWrite, isOwner: () => ROLE === 'owner' };
  const dl = { save: async () => true };
  window.claude = { use: (n) => new Promise(r => setTimeout(() => r(ROLE === 'signedout' ? (n === 'downloads' ? dl : null) : n === 'db' ? db : n === 'user' ? user : n === 'downloads' ? dl : null), 60)) };
})();
"""
roles = sys.argv[1:] or ['owner', 'outside', 'signedout']
with sync_playwright() as p:
    b = p.chromium.launch()
    for role in roles:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'ERR_FAILED' not in m.text else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.add_init_script(MOCK % role)
        pg.goto('file://' + ROOT + '/test/page.html'); pg.wait_for_timeout(900)
        print('==', role, '| canShare', pg.evaluate('COMM.st.canShare'), 'canWrite', pg.evaluate('COMM.st.canWrite'), 'db', pg.evaluate('!!COMM.st.db'))
        pg.tap('text=開始填寫申請書'); pg.wait_for_timeout(400)
        consent = False
        for n in range(45):
            if pg.query_selector('.modal'):
                consent = True; pg.tap('.modal .actions .btn:not(.ghost)'); pg.wait_for_timeout(300); continue
            if pg.query_selector('#county-sel') and not pg.evaluate("APP.seen.county"): pg.select_option('#county-sel', 'TXG'); pg.wait_for_timeout(150)
            elif pg.query_selector('.opts') and not pg.query_selector('.opts .opt[aria-checked=true]'):
                o = pg.query_selector_all('.opts .opt'); o[0].tap(); pg.wait_for_timeout(120)
            nb = pg.query_selector('#next-btn')
            if not nb: break
            nb.tap(); pg.wait_for_timeout(250)
            if pg.evaluate('APP.screen') == 'reveal': break
        pg.wait_for_timeout(400)
        if pg.query_selector('.modal'): consent = True; pg.tap('.modal .actions .btn:not(.ghost)')
        pg.wait_for_timeout(4200)
        print('  consent modal shown:', consent, '| screen', pg.evaluate('APP.screen'), '| stamp', bool(pg.query_selector('.stamp')))
        pg.tap('text=查看完整審查報告'); pg.wait_for_timeout(1500)
        print('  report sections:', pg.evaluate("Array.from(document.querySelectorAll('section.rsec')).map(s=>s.id).join(',')"))
        print('  crowd text:', pg.evaluate("(document.querySelector('#sec-crowd p')||{}).textContent||''")[:70])
        print('  share links:', pg.evaluate("Array.from(document.querySelectorAll('.share-net a')).map(a=>a.textContent+'→'+a.href.slice(0,48)).join(' | ')"))
        print('  local saves:', pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('tw-kids:saves')||'null');return s?(s.expense||[]).length+'/'+(s.income||[]).length:'none'})()"), '| writes attempted:', pg.evaluate('(window.__writes||[]).join(",")'))
        # 存成具名設定，再進實驗室看看載入清單
        pg.tap('text=存成支出設定'); pg.wait_for_timeout(300); pg.tap('.modal .actions .btn:not(.ghost)'); pg.wait_for_timeout(300)
        pg.tap('.tbtn[aria-label="實驗室"]'); pg.wait_for_timeout(3500)
        print('  lab expense options:', pg.evaluate("document.querySelectorAll('#ld-expense option').length"), '| rank rows', pg.evaluate("document.querySelectorAll('.rank-row').length"))
        # 重新整理後，報告書按鈕與存檔都還在
        pg.reload(); pg.wait_for_timeout(1200)
        print('  after reload: topbar', pg.evaluate("Array.from(document.querySelectorAll('.tbtn')).map(b=>b.getAttribute('aria-label')).join(',')"), '| cover buttons', pg.evaluate("Array.from(document.querySelectorAll('.cover-cta button')).map(b=>b.textContent).join(',')"))
        print('  diag errors:', pg.evaluate('JSON.stringify(window.__diag.errors)')[:200])
        for l in logs: print('  LOG', l)
        ctx.close()
    b.close()
