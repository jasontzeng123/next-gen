import os
# 實驗室地圖截圖：淺色、深色、色盲友善、手機
import sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SH, exist_ok=True)
body=open(ROOT+'/dist/index.html').read()
open(ROOT+'/test/page.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>')
county=sys.argv[1] if len(sys.argv)>1 else 'TPE'
housing=sys.argv[2] if len(sys.argv)>2 else 'buy'
d={'county':county,'housing':housing,'partner':True,'incomeMode':'threshold','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31}
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,scheme,cvd in [(1280,'light',False),(1280,'dark',False),(1280,'light',True),(390,'light',False),(390,'dark',True)]:
        ctx=b.new_context(viewport={'width':w,'height':900}, color_scheme=scheme, device_scale_factor=2 if w<500 else 1); pg=ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS={'draft':d,'unlocked':True,'labTab':'map','cvd':cvd}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://'+ROOT+'/test/page.html#lab'); pg.wait_for_timeout(3500)
        el=pg.query_selector('.lab-grid > .rsec')
        name=f'{SH}/map-{w}-{scheme}-{"cvd" if cvd else "n"}.png'
        el.screenshot(path=name)
        ov=pg.evaluate('document.documentElement.scrollWidth - window.innerWidth')
        print(name.split('/')[-1], 'errors', errs, 'overflow', ov)
        ctx.close()
    b.close()
