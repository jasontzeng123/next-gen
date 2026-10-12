# 實驗室地圖在深色與淺色模式下的門檻顏色（PR 95 以上要看得清楚）
import os, json, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = ROOT + '/test/shots'; os.makedirs(SHOTS, exist_ok=True)
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
d = {"county": "TPE", "partner": True, "ageA": 28, "ageB": 28, "firstBirthAge": 31, "kids": 2, "housing": "buy", "build": "new", "incomeMode": "threshold"}
world = len(sys.argv) > 1 and sys.argv[1] == 'world'
with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme in ['dark', 'light']:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme=scheme, device_scale_factor=2)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS = {'draft': d, 'unlocked': True, 'submitted': d, 'seen': {}, 'labTab': 'map'}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://' + ROOT + '/test/web.html#lab'); pg.wait_for_timeout(3500)
        if world:
            pg.click('.chart-ctrl .seg button:has-text("世界")'); pg.wait_for_selector('.wd-li', timeout=30000); pg.wait_for_timeout(800)
        pg.query_selector('.lab-grid > .rsec:first-child').screenshot(path=f'{SHOTS}/heat-{"world" if world else "tw"}-{scheme}-left.png')
        pg.query_selector('.lab-grid > .rsec:nth-child(2)').screenshot(path=f'{SHOTS}/heat-{"world" if world else "tw"}-{scheme}-right.png')
        print(scheme, 'errors', errs)
        ctx.close()
    b.close()
