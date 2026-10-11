# 分享規則：只有第一次送出會自動分享；重新送出、在報告裡調整設定都不會覆蓋；按「更新」才會改成最新送出的版本
import os, json, re, hashlib
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html=open(ROOT+'/index.html').read()
cfg={'target':'web','siteUrl':'https://jasontzeng123.github.io/next-gen/','sb':{'url':'https://test.supabase.co','key':'sb_publishable_TESTKEY'}}
html=re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = '+json.dumps(cfg)+';</script>', html)
open(ROOT+'/test/web.html','w').write(html)
DB={}; WRITES=[]
def rpc(route):
    name=route.request.url.rsplit('/',1)[-1]; body=json.loads(route.request.post_data or '{}'); hs=lambda s: hashlib.sha256(s.encode()).hexdigest()
    if name=='list_choices': return route.fulfill(status=200, content_type='application/json', body=json.dumps([dict(v['data'], _id=k) for k,v in DB.items()]))
    if name=='submit_choice':
        WRITES.append(body['p_data'].get('county')); i=body['p_id']
        if i in DB and DB[i]['secret']!=hs(body['p_secret']): return route.fulfill(status=200, content_type='application/json', body='false')
        DB[i]={'secret':hs(body['p_secret']),'data':body['p_data']}; return route.fulfill(status=200, content_type='application/json', body='true')
    if name=='withdraw_choice':
        i=body['p_id']; ok=i in DB and DB[i]['secret']==hs(body['p_secret'])
        if ok: del DB[i]
        return route.fulfill(status=200, content_type='application/json', body='true' if ok else 'false')
d={'county':'KHH','housing':'rent','partner':True,'incomeMode':'threshold','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31}
seen={k:True for k in ['country','county','family','ages','plan','room','housing','buy','postpartum','care','leave','preschool','school','after','cram','uni','support','transport','lifestyle','travel','elder','mode','jobA','jobB','money']}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.route('https://test.supabase.co/**', rpc)
    LS={'draft':d,'seen':seen,'qi':24,'consent':True}
    pg.add_init_script('(()=>{if(sessionStorage.getItem("seeded"))return;sessionStorage.setItem("seeded","1");const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://'+ROOT+'/test/web.html'); pg.wait_for_timeout(1000)
    crowd=lambda: pg.evaluate("(document.querySelector('#sec-crowd p')||{}).textContent||''")
    row=lambda: [v['data'].get('county') for v in DB.values()]
    # 1. 第一次送出 → 自動分享
    pg.evaluate("APP.go('reveal')"); pg.wait_for_timeout(1500)
    print('1 first submit      → db', row(), 'writes', WRITES)
    # 2. 修改申請書（改成台北）再送出 → 不覆蓋
    pg.evaluate("APP.set('county','TPE'); APP.go('reveal')"); pg.wait_for_timeout(1500)
    print('2 resubmit TPE      → db', row(), 'writes', WRITES)
    # 3. 報告裡調整設定 → 不覆蓋
    pg.evaluate("APP.go('report')"); pg.wait_for_timeout(1500)
    pg.evaluate("APP.set('county','TXG'); APP.compute(true); APP.redrawReport && APP.redrawReport()"); pg.wait_for_timeout(1200)
    print('3 adjust in report  → db', row(), 'writes', WRITES, '| text:', crowd()[:60])
    # 4. 按「更新」→ 改成最新送出的申請書（台北，不是報告裡調整的台中）
    pg.click('text=更新成最新送出的申請書'); pg.wait_for_timeout(1200)
    print('4 press update      → db', row(), 'writes', WRITES, '| text:', crowd()[:40])
    # 5. 取消分享 → 刪除；再按匿名分享 → 用送出的版本
    pg.click('#sec-crowd >> text=取消分享'); pg.wait_for_timeout(1000); print('5 withdraw          → db', row())
    pg.click('#sec-crowd >> text=匿名分享'); pg.wait_for_timeout(500)
    if pg.query_selector('.modal'): pg.click('.modal .actions .btn:not(.ghost)'); pg.wait_for_timeout(1200)
    print('6 share again       → db', row(), '| errors', errs)
    # 7. 重新整理後再送出一次 → 仍不覆蓋
    pg.reload(); pg.wait_for_timeout(1200); pg.evaluate("APP.set('county','HUA'); APP.go('reveal')"); pg.wait_for_timeout(1500)
    print('7 reload + resubmit → db', row(), 'writes', WRITES)
    b.close()
