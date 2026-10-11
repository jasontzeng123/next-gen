import sys, os, json, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
os.makedirs(SHOTS, exist_ok=True)
body=open(ROOT+'/dist/index.html').read()
page_html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>'
open(ROOT+'/test/page.html','w').write(page_html)
mode=sys.argv[1] if len(sys.argv)>1 else 'desktop'
scheme=sys.argv[2] if len(sys.argv)>2 else 'light'
answers=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
vw={'desktop':(1280,900),'mobile':(390,844)}[mode]
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':vw[0],'height':vw[1]}, color_scheme=scheme, device_scale_factor=1)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append(('console',m.type,m.text)) if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.route('**/*', lambda route: route.abort() if route.request.url.startswith('http') else route.continue_())
    pg.goto('file://'+ROOT+'/test/page.html')
    pg.wait_for_timeout(600)
    tag=mode+'-'+scheme
    pg.screenshot(path=f'{SHOTS}/{tag}-00-cover.png', full_page=True)
    pg.click('text=開始填寫申請書')
    pg.wait_for_timeout(400)
    n=0
    while n<40:
        n+=1
        title=pg.inner_text('#qt') if pg.query_selector('#qt') else ''
        if pg.query_selector('#county-sel'):
            pg.select_option('#county-sel', answers.get('county','TPE'))
            pg.wait_for_timeout(200)
        elif pg.query_selector('.opts'):
            opts=pg.query_selector_all('.opts .opt')
            want=answers.get(title)
            idx=want if isinstance(want,int) else (1 if len(opts)>1 else 0)
            opts[min(idx,len(opts)-1)].click()
            pg.wait_for_timeout(150)
        if n in (1,2,6,7,8,10,22,23):
            pg.screenshot(path=f'{SHOTS}/{tag}-q{n:02d}.png', full_page=(mode=='desktop'))
        nb=pg.query_selector('#next-btn')
        if not nb: break
        last='送出' in nb.inner_text()
        nb.click()
        pg.wait_for_timeout(300)
        if last: break
    pg.wait_for_timeout(4500)
    pg.screenshot(path=f'{SHOTS}/{tag}-r1-reveal.png', full_page=True)
    pg.click('text=查看完整審查報告')
    pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{SHOTS}/{tag}-r2-report.png', full_page=True)
    pg.click('.tbtn[aria-label="實驗室"]')
    pg.wait_for_timeout(2500)
    pg.screenshot(path=f'{SHOTS}/{tag}-l1-map.png', full_page=True)
    for i,name in [(1,'curve'),(2,'time'),(3,'crowd')]:
        if len(pg.query_selector_all('.tabs button'))<=i: continue
        pg.click(f'.tabs button >> nth={i}')
        pg.wait_for_timeout(2500)
        pg.screenshot(path=f'{SHOTS}/{tag}-l{i+1}-{name}.png', full_page=True)
    pg.click('.tbtn[aria-label="方法與資料"]')
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{SHOTS}/{tag}-m-method.png', full_page=False)
    # 水平溢出檢查
    ov=pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
    print('horizontal overflow on method page:', ov)
    b.close()
for e in errs: print(e)
print('done', len(errs), 'errors')
