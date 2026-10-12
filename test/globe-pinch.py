# 世界地球：雙指縮放、超過上下限時的阻力與回彈（模擬手機觸控）
import os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
d = {"county": "TPE", "partner": True, "ageA": 28, "ageB": 28, "firstBirthAge": 31, "kids": 2, "housing": "rent", "incomeMode": "threshold"}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    LS = {'draft': d, 'unlocked': True, 'submitted': d, 'seen': {}, 'labTab': 'map'}
    pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://' + ROOT + '/test/web.html#lab'); pg.wait_for_timeout(1200)
    pg.click('.chart-ctrl .seg button:has-text("世界")'); pg.wait_for_timeout(2500)
    pg.evaluate("document.querySelector('.globe-wrap canvas').scrollIntoView({block: 'center'})"); pg.wait_for_timeout(300)
    box = pg.query_selector('.globe-wrap canvas').bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    cdp = ctx.new_cdp_session(pg)
    def touch(kind, pts):
        cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i} for i, (x, y) in enumerate(pts)]})
    def pinch(d0, d1, steps=12, release=True):
        touch('touchStart', [(cx - d0 / 2, cy), (cx + d0 / 2, cy)])
        for i in range(1, steps + 1):
            dd = d0 + (d1 - d0) * i / steps
            touch('touchMove', [(cx - dd / 2, cy), (cx + dd / 2, cy)]); pg.wait_for_timeout(16)
        z = pg.evaluate('APP.lab.globe.st.zoom')
        if release: touch('touchEnd', [])
        return z
    zoom = lambda: round(pg.evaluate('APP.lab.globe.st.zoom'), 2)
    sy0 = pg.evaluate('window.scrollY')
    print('start zoom', zoom())
    z = pinch(60, 120); pg.wait_for_timeout(500); print('pinch x2 → during', round(z, 2), 'after', zoom())
    z = pinch(40, 300); print('pinch way out → during', round(z, 2)); pg.wait_for_timeout(600); print('   after bounce', zoom())
    z = pinch(300, 30); print('pinch way in → during', round(z, 2)); pg.wait_for_timeout(600); print('   after bounce', zoom())
    print('page scrolled by gesture:', pg.evaluate('window.scrollY') - sy0, '| page zoom:', pg.evaluate('window.visualViewport.scale'))
    # 單指點一下城市以外的地方不會出錯；拖曳仍可旋轉
    lon0 = pg.evaluate('APP.lab.globe.st.lon')
    touch('touchStart', [(cx, cy)])
    for i in range(1, 8): touch('touchMove', [(cx + i * 10, cy)]); pg.wait_for_timeout(16)
    touch('touchEnd', []); pg.wait_for_timeout(200)
    print('one-finger drag rotates:', round(pg.evaluate('APP.lab.globe.st.lon') - lon0, 1), 'degrees')
    b.close()
print('errors', errs)
