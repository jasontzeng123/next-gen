# 實驗室「地圖 → 世界」：地球、地球下方的城市列表、點選城市後的詳細資料（桌機與手機）
import os, json, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
d = {"county": "TPE", "district": "mid", "partner": True, "ageA": 28, "ageB": 28, "firstBirthAge": 31, "kids": 2, "housing": "rent", "incomeMode": "threshold"}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for mode, vw in [('desktop', (1280, 900)), ('mobile', (390, 844))]:
        ctx = b.new_context(viewport={'width': vw[0], 'height': vw[1]})
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append((mode, 'pageerror', str(e))))
        pg.on('console', lambda m: errs.append((mode, m.type, m.text)) if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS = {'draft': d, 'unlocked': True, 'submitted': d, 'seen': {}, 'labTab': 'map'}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://' + ROOT + '/test/web.html#lab'); pg.wait_for_timeout(1500)
        tabs = pg.eval_on_selector_all('[role=tab]', 'els => els.map(e => e.innerText)')
        segs = pg.eval_on_selector_all('.chart-ctrl .seg', 'els => els.map(e => e.innerText.replace(/\\n/g, "/"))')
        print(mode, 'tabs', tabs, '| controls', segs)
        pg.click('.chart-ctrl .seg button:has-text("世界")')
        t0 = time.time(); pg.wait_for_selector('.wd-li', timeout=30000); print(mode, 'list ready %.1fs' % (time.time() - t0))
        print(mode, 'list', pg.eval_on_selector_all('.wd-li', 'els => els.map(e => e.innerText.replace(/\\n/g, " "))'))
        gw = pg.eval_on_selector('.globe-wrap canvas', 'c => [c.clientWidth, c.clientHeight]'); print(mode, 'globe size', gw)
        pg.wait_for_timeout(500)
        pg.query_selector('.lab-grid > .rsec:first-child').screenshot(path=f'{SHOTS}/lab-world-{mode}-left.png')
        pg.click('button.wd-li:has-text("東京")'); pg.wait_for_timeout(1300)
        print(mode, 'detail', pg.inner_text('.wd-detail')[:160].replace('\n', ' | '))
        pg.query_selector('.lab-grid > .rsec:nth-child(2)').screenshot(path=f'{SHOTS}/lab-world-{mode}-detail.png')
        pg.click('button.wd-li:has-text("巴黎")'); pg.wait_for_timeout(1300)
        print(mode, 'after paris', pg.inner_text('.wd-detail h2'))
        pg.query_selector('.lab-grid > .rsec:first-child').screenshot(path=f'{SHOTS}/lab-world-{mode}-left-paris.png')
        print(mode, 'overflow', pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1'))
        # 回到台灣
        pg.click('.chart-ctrl .seg button:has-text("台灣縣市")'); pg.wait_for_timeout(1500)
        print(mode, 'back to tw map ok', pg.query_selector('.twmap') is not None)
        ctx.close()
    b.close()
for e in errs: print(e)
print('done', len(errs), 'errors')
