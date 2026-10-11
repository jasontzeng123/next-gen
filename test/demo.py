import os
# 示範資料：統計會註明「含示範資料」；真實分享滿 20 筆後示範資料不再計入
import json, re, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SH = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SH, exist_ok=True)
html=open(ROOT+'/index.html').read()
cfg={'target':'web','siteUrl':'https://jasontzeng123.github.io/next-gen/','sb':{'url':'https://test.supabase.co','key':'sb_publishable_TESTKEY'}}
html=re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = '+json.dumps(cfg)+';</script>', html)
open(ROOT+'/test/web.html','w').write(html)
DEMO=json.load(open(ROOT + '/seed/demo.json'))
REAL=[]
def rpc(route):
    name=route.request.url.rsplit('/',1)[-1]
    if name=='list_choices':
        rows=[dict({k:v for k,v in d.items() if k!='_seedId'}, _id=d['_seedId']) for d in DEMO]+REAL
        return route.fulfill(status=200, content_type='application/json', body=json.dumps(rows))
    return route.fulfill(status=200, content_type='application/json', body='true')
d={'county':'NTPC','housing':'buy','partner':True,'incomeMode':'threshold','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31}
seen={k:True for k in ['country','county','family','ages','plan','room','housing','buy','postpartum','care','leave','preschool','school','after','cram','uni','support','transport','lifestyle','travel','elder','mode','jobA','jobB','money']}
with sync_playwright() as p:
    b=p.chromium.launch()
    for real_n, w in [(0,390),(25,390)]:
        REAL[:]=[{'v':2,'ts':i,'county':'TPE','kids':1,'th':50,'perChild':5000000,'housing':'rent','_id':'real%016d'%i} for i in range(real_n)]
        ctx=b.new_context(viewport={'width':w,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True); pg=ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.route('https://test.supabase.co/**', rpc)
        LS={'draft':d,'seen':seen,'qi':6,'unlocked':True,'submitted':d,'consent':False}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://'+ROOT+'/test/web.html'); pg.wait_for_timeout(1200)
        print('real', real_n, '| demoOn', pg.evaluate('COMM.st.demoOn'), 'rows', pg.evaluate('COMM.st.rows.length'), 'demoN', pg.evaluate('COMM.st.demoN'))
        pg.evaluate("APP.qi=6;APP.go('quiz')"); pg.wait_for_timeout(700)
        print('  quiz q:', pg.inner_text('#qt') if pg.query_selector('#qt') else '?', '| crowd bars', len(pg.query_selector_all('.opt .crowd')), '| note', bool(pg.query_selector('.demo-note')))
        if real_n==0: pg.screenshot(path=SH+'/demo-quiz.png', full_page=False)
        pg.click('.tbtn[aria-label="審查報告書"]'); pg.wait_for_timeout(2500)
        sec=pg.query_selector('#sec-crowd'); sec.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
        print('  report note:', (pg.evaluate("(document.querySelector('#sec-crowd .demo-note')||{}).textContent||''"))[:50], '| tile:', pg.evaluate("(document.querySelector('#sec-crowd .tile')||{}).textContent||''"))
        if real_n==0: sec.screenshot(path=SH+'/demo-report.png')
        pg.click('.tbtn[aria-label="實驗室"]'); pg.wait_for_timeout(3000)
        tabs=pg.evaluate("Array.from(document.querySelectorAll('[role=tab]')).map(t=>t.textContent)"); print('  lab tabs:', tabs)
        t=[x for x in pg.query_selector_all('[role=tab]') if '申請人' in x.inner_text() or '大家' in x.inner_text()]
        if t:
            t[0].tap(); pg.wait_for_timeout(1500)
            print('  lab note:', bool(pg.query_selector('.demo-note')))
            if real_n==0: pg.screenshot(path=SH+'/demo-lab.png', full_page=True)
        print('  errors', errs); ctx.close()
    b.close()
