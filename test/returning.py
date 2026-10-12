import os
import sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
exp={"after":"anqin","ageA":26,"ageB":24,"build":"used","buyWhen":"beforeKid","care":"grandFree","county":"NTPC","cram":"some","district":"mid","elder":0,"elderCare":False,"firstBirthAge":32,"housing":"buy","kids":2,"leave":"B","lifestyle":"normal","loan":"bank","partner":True,"postpartum":"family","preschool":"private","quitUntil":"preschool","quitWho":"B","reno":"light","room":"own","school":"public","spacing":2,"support":"22","transport":"new","travel":"domestic","uni":"mixed","uniAway":True}
inc={"giftMonthly":0,"giftOnce":0,"giftYears":10,"incomeMode":"threshold","jobA":{"industry":"arts","mode":"pr","pr":67,"salary":410000},"jobB":{"industry":"all","pr":50},"savings":500000}
draft=dict(exp); draft.update(inc)
# v1/v2 era draft had adv etc.
draft['adv']={"wageGrowth":0.01,"returnRate":0.01,"borrowRate":0.03,"inflation":0.02,"bankRate":0.025,"pending":False,"rentSubsidy":True,"qinganExtend":True,"homeGrowth":0}
draft['country']='TW'
seen={k:True for k in ['country','county','family','ages','plan','room','housing','buy','postpartum','care','leave','preschool','school','after','cram','uni','support','transport','lifestyle','travel','elder','mode','jobA','jobB','money']}
saves={"expense":[{"auto":True,"data":exp,"id":"auto","name":"上次填寫的設定","ts":1}],"income":[{"auto":True,"data":inc,"id":"auto","name":"上次填寫的設定","ts":1}],"ts":1,"unlocked":True}
LS={'draft':draft,'seen':seen,'qi':24,'unlocked':True,'consent':sys.argv[2]=='share' if len(sys.argv)>2 else None,'submitted':draft,'lastResult':{'v':'broke','th':84,'ts':1},'saves':saves}
MOCK = """
(() => {
  const LS = %s;
  try { for (const k in LS) if (LS[k] !== null) localStorage.setItem('tw-kids:' + k, JSON.stringify(LS[k])); } catch (e) {}
  const store = { 'data/users/u_testowner00000000000001/saves': %s, 'submissions/u_other1234567890123456': { v: 2, ts: 1, county: 'TPE', kids: 2, th: 55, perChild: 4500000 } };
  const deepFreeze = (o) => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const mk = (path) => ({ get: async () => ({ exists: !!store[path], data: () => deepFreeze(JSON.parse(JSON.stringify(store[path]))) }), set: async (d) => { store[path] = JSON.parse(JSON.stringify(d)); }, delete: async () => { delete store[path]; } });
  const coll = (p) => ({ orderBy: () => coll(p), limit: () => coll(p), get: async () => ({ docs: Object.keys(store).filter(k => k.startsWith(p + '/') && k.split('/').length === p.split('/').length + 1).map(k => ({ id: k.split('/').pop(), data: () => deepFreeze(JSON.parse(JSON.stringify(store[k]))) })) }), doc: (id) => mk(p + '/' + id) });
  const db = { doc: (p) => mk(p), collection: coll };
  const user = { id: async () => 'u_testowner00000000000001', can: async () => true };
  window.__store = store;
  window.claude = { use: (n) => new Promise(r => setTimeout(() => r(n === 'db' ? db : n === 'user' ? user : null), 80)) };
})();
""" % (json.dumps(LS), json.dumps(saves))
entry = sys.argv[1] if len(sys.argv) > 1 else 'edit'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}, color_scheme='dark', is_mobile=True, has_touch=True); pg=ctx.new_page()
    logs=[]
    pg.on('console', lambda m: logs.append(m.type+': '+m.text) if 'ERR_FAILED' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR '+str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.add_init_script(MOCK)
    pg.goto('file://'+ROOT+'/test/page.html'); pg.wait_for_timeout(900)
    print('cover buttons:', [x.inner_text() for x in pg.query_selector_all('.cover-cta button')])
    if entry=='edit': pg.tap('text=修改答案')
    elif entry=='restart':
        pg.tap('text=全部重新填寫'); pg.wait_for_timeout(300); pg.tap('.modal .actions .btn:not(.ghost)')
    pg.wait_for_timeout(400)
    for n in range(40):
        if pg.query_selector('#county-sel') and not pg.evaluate("APP.seen.county"): pg.select_option('#county-sel','NTPC'); pg.wait_for_timeout(150)
        elif pg.query_selector('.opts') and not pg.query_selector('.opts .opt[aria-checked=true]'):
            o=pg.query_selector_all('.opts .opt'); o[min(1,len(o)-1)].tap(); pg.wait_for_timeout(120)
        nb=pg.query_selector('#next-btn')
        if not nb: break
        last='送出' in nb.inner_text(); nb.tap(); pg.wait_for_timeout(250)
        if last: break
    pg.wait_for_timeout(400)
    btns=pg.query_selector_all('.modal .actions button')
    if btns: print('consent modal'); btns[-1].tap()
    pg.wait_for_timeout(4500)
    pg.screenshot(path=SHOTS+'/returning-'+entry+'.png', full_page=True)
    print('screen', pg.evaluate('APP.screen'), 'stamp:', bool(pg.query_selector('.stamp')), 'rows:', len(pg.query_selector_all('.ledger-row')))
    print('diag errors:', pg.evaluate('JSON.stringify(window.__diag.errors).slice(0,400)'))
    print('crowd rows loaded:', pg.evaluate('COMM.st.rows.length'), 'loadErr:', pg.evaluate('COMM.st.loadErr || null'))
    print('auto save written:', pg.evaluate("(()=>{const d=window.__store['data/users/u_testowner00000000000001/saves'];return d&&d.expense&&d.expense[0]&&d.expense[0].ts})()"))
    for l in logs: print(l)
    b.close()
