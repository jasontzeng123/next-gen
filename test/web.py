import os
# 自架網站版：用假的 Supabase（攔截 /rest/v1/rpc/*）測試分享、取消分享、讀取統計、連線失敗、下載圖卡
import sys, json, re, hashlib
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SH, exist_ok=True)
html=open(ROOT+'/index.html').read()
cfg={'target':'web','siteUrl':'https://jasontzeng123.github.io/next-gen/','sb':{'url':'https://test.supabase.co','key':'sb_publishable_TESTKEY'}}
html=re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = '+json.dumps(cfg)+';</script>', html)
open(ROOT+'/test/web.html','w').write(html)
DB={}; CALLS=[]; MODE={'down':False}
for i in range(6):
    DB['seed%016d' % i]={'secret':'x','data':{'v':2,'ts':i,'county':['TPE','KHH','TXG','NTPC','TNN','TYN'][i],'kids':2,'th':40+i*8,'perChild':4000000+i*300000,'housing':'buy' if i%2 else 'rent','verdict':None},'t':i}
T=[100]
def rpc(route):
    req=route.request; name=req.url.rsplit('/',1)[-1]; body=json.loads(req.post_data or '{}'); h=req.headers
    CALLS.append((name, h.get('apikey'), 'authorization' in h))
    if MODE['down']: return route.fulfill(status=503, body='paused')
    hs=lambda s: hashlib.sha256((s or '').encode()).hexdigest()
    if name=='list_choices':
        rows=sorted(DB.items(), key=lambda kv:-kv[1]['t'])[:body.get('p_limit',2000)]
        return route.fulfill(status=200, content_type='application/json', body=json.dumps([dict(v['data'], _id=k) for k,v in rows]))
    if name=='submit_choice':
        i,sec,d=body['p_id'],body['p_secret'],body['p_data']
        if not re.match(r'^[a-z0-9]{16,40}$', i) or len(sec)<20 or d.get('v')!=2 or len(json.dumps(d))>3000: return route.fulfill(status=400, content_type='application/json', body='{"message":"bad"}')
        T[0]+=1
        if i in DB:
            if DB[i]['secret']!=hs(sec): return route.fulfill(status=200, content_type='application/json', body='false')
            DB[i].update(data=d, t=T[0])
        else: DB[i]={'secret':hs(sec),'data':d,'t':T[0]}
        return route.fulfill(status=200, content_type='application/json', body='true')
    if name=='withdraw_choice':
        i=body['p_id']; ok= i in DB and DB[i]['secret']==hs(body['p_secret'])
        if ok: del DB[i]
        return route.fulfill(status=200, content_type='application/json', body='true' if ok else 'false')
    route.fulfill(status=404, body='no')
def fill(pg):
    touch=pg.evaluate('navigator.maxTouchPoints>0')
    T_=(lambda sel: pg.tap(sel)) if touch else (lambda sel: pg.click(sel))
    T_('text=開始填寫申請書'); pg.wait_for_timeout(400); consent=False
    for n in range(50):
        if pg.query_selector('.modal'):
            consent=True; T_('.modal .actions .btn:not(.ghost)'); pg.wait_for_timeout(300); continue
        if pg.query_selector('#county-sel') and not pg.evaluate("APP.seen.county"): pg.select_option('#county-sel','KHH'); pg.wait_for_timeout(150)
        elif pg.query_selector('.opts') and not pg.query_selector('.opts .opt[aria-checked=true]'): (pg.query_selector_all('.opts .opt')[0].tap() if touch else pg.query_selector_all('.opts .opt')[0].click()); pg.wait_for_timeout(120)
        nb=pg.query_selector('#next-btn')
        if not nb: break
        (nb.tap() if touch else nb.click()); pg.wait_for_timeout(250)
        if pg.evaluate('APP.screen')=='reveal': break
    pg.wait_for_timeout(400)
    if pg.query_selector('.modal'): consent=True; T_('.modal .actions .btn:not(.ghost)')
    pg.wait_for_timeout(4200)
    return consent
with sync_playwright() as p:
    b=p.chromium.launch()
    def ctx(mobile=True):
        c=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':900}, is_mobile=mobile, has_touch=mobile, accept_downloads=True)
        pg=c.new_page(); logs=[]
        pg.on('console', lambda m: logs.append(m.type+': '+m.text) if m.type in ('error','warning') and 'ERR_FAILED' not in m.text and 'fonts.g' not in m.text else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERROR '+str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.route('https://test.supabase.co/**', rpc)
        pg.goto('file://'+ROOT+'/test/web.html'); pg.wait_for_timeout(900)
        return c,pg,logs
    # 1. 第一位玩家（手機）：同意分享 → 報告看到「已分享」→ 取消 → 再分享
    c,pg,logs=ctx()
    print('backend', pg.evaluate('COMM.st.backend'), 'canShare', pg.evaluate('COMM.st.canShare'), 'rows', pg.evaluate('COMM.st.rows.length'), 'uid', pg.evaluate('COMM.st.uid'))
    print('consent modal:', fill(pg), '| db size', len(DB))
    pg.tap('text=查看完整審查報告'); pg.wait_for_timeout(1500)
    print('crowd:', pg.evaluate("(document.querySelector('#sec-crowd p')||{}).textContent||''")[:60], '| tiles', pg.evaluate("Array.from(document.querySelectorAll('#sec-crowd .tile')).map(t=>t.textContent.slice(0,22)).join(' / ')"))
    uid=pg.evaluate('COMM.st.uid'); print('my row in db:', uid in DB, DB.get(uid,{}).get('data',{}).get('county'))
    pg.tap('#sec-crowd .linkbtn'); pg.wait_for_timeout(800)
    print('after withdraw: in db', uid in DB, '| text', pg.evaluate("(document.querySelector('#sec-crowd p')||{}).textContent||''")[:30])
    pg.tap('#sec-crowd .linkbtn'); pg.wait_for_timeout(400)
    if pg.query_selector('.modal'): pg.tap('.modal .actions .btn:not(.ghost)'); pg.wait_for_timeout(900)
    print('after re-share: in db', uid in DB, '| saves local', pg.evaluate("!!localStorage.getItem('tw-kids:saves')"))
    print('share url in links:', pg.evaluate("decodeURIComponent((document.querySelector('.share-net a')||{}).href||'').split('&url=')[1]"), '| textarea ends:', pg.evaluate("(document.querySelector('#sec-save textarea, .share textarea, textarea')||{}).value||''")[-50:])
    print('method text has claude:', 'claude' in pg.evaluate("(()=>{APP.go('method');return document.querySelector('main').textContent})()"))
    pg.wait_for_timeout(300); pg.screenshot(path=SH+'/web-method.png')
    # 重新整理：同一個匿名代號
    pg.reload(); pg.wait_for_timeout(1200); print('same uid after reload:', pg.evaluate('COMM.st.uid')==uid, '| mine', bool(pg.evaluate('COMM.mine()')))
    print('logs:', logs); c.close()
    # 2. 別人想冒用這個代號（不同密語）→ 寫入被拒
    c,pg,logs=ctx()
    pg.evaluate("localStorage.setItem('tw-kids:anon', JSON.stringify({id:'%s', secret:'%s'}))" % (uid, 'z'*40)); pg.reload(); pg.wait_for_timeout(1000)
    ok=pg.evaluate("COMM.submit({v:2,ts:1,county:'TPE'})"); print('impostor submit ok:', ok, '| row still KHH:', DB[uid]['data'].get('county'))
    c.close()
    # 3. 資料庫連不上：不跳分享視窗、統計區塊隱藏、沒有錯誤
    MODE['down']=True
    c,pg,logs=ctx()
    print('down: canShare', pg.evaluate('COMM.st.canShare'), 'loadErr', pg.evaluate('COMM.st.loadErr'))
    print('down consent modal:', fill(pg)); pg.tap('text=查看完整審查報告'); pg.wait_for_timeout(1200)
    print('down crowd hidden:', pg.evaluate("document.querySelector('#sec-crowd').hidden"), '| error toast:', pg.evaluate("Array.from(document.querySelectorAll('.toast')).map(t=>t.textContent).join('|')"), '| logs', [l for l in logs if 'PAGEERROR' in l or 'error' in l][:3]); c.close()
    MODE['down']=False
    # 4. 電腦版：下載圖卡
    c,pg,logs=ctx(False)
    fill(pg); pg.click('text=查看完整審查報告'); pg.wait_for_timeout(2500)
    btn=pg.query_selector('text=儲存圖卡'); print('save button visible:', btn and btn.is_visible())
    with pg.expect_download() as dl: btn.click()
    d=dl.value; print('download:', d.suggested_filename, d.path() and __import__('os').path.getsize(d.path()), 'bytes')
    print('calls auth header ever sent:', any(x[2] for x in CALLS), '| apikey ok:', all(x[1]=='sb_publishable_TESTKEY' for x in CALLS), '| total calls', len(CALLS))
    print('logs:', logs); c.close()
    b.close()
