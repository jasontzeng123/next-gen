# 報告「換到其他國家呢？」的地球：各國資料要捲到附近才下載、城市上色、點城市或按鈕會先問、確認後到實驗室的全球比較
# 用法：python3 test/report_globe.py [cpu 降速倍數，預設 1；手機約 4]
import os, sys, json, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
SLOW = float(sys.argv[1]) if len(sys.argv) > 1 else 1
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}
d = {'county': 'TPE', 'partner': True, 'kids': 2, 'ageA': 29, 'ageB': 30, 'firstBirthAge': 32, 'incomeMode': 'threshold', 'housing': 'rent'}
errs, reqs = [], []
ok = lambda name, cond: print(('OK  ' if cond else 'FAIL') + ' ' + name)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True); pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('request', lambda r: reqs.append(r.url) if 'world.' in r.url else None)
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    if SLOW > 1:
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': SLOW})
    LS = {'draft': d, 'seen': seen, 'qi': 24, 'unlocked': True, 'submitted': d, 'consent': False, 'noticeOk': True}
    pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(800)
    pg.evaluate("APP.go('report')"); pg.wait_for_timeout(2500)
    ok('world data not loaded at the top of the report', not pg.evaluate("APP.worldReady()") and not reqs)
    order = pg.evaluate("[...document.querySelectorAll('#main section.rsec')].map(s=>s.id)")
    ok('globe section right after 其他人怎麼選', order.index('sec-world') == order.index('sec-crowd') + 1)
    t0 = time.time()
    pg.evaluate("document.querySelector('#sec-world').scrollIntoView()")
    pg.wait_for_function("APP.worldReady() && document.querySelector('.rglobe-note').hidden", timeout=120000)
    print('   ready after %.1f s (cpu x%g)' % (time.time() - t0, SLOW))
    ok('world bundle requested once', len(reqs) == 1)
    sec = pg.query_selector('#sec-world')
    ok('only globe + one button below', pg.evaluate("(()=>{const s=document.querySelector('#sec-world');return [...s.children].map(c=>c.className||c.tagName).join('|')})()") == 'rsec-k num|H2|rsec-lede|globe-wrap rglobe|rglobe-act')
    pg.wait_for_timeout(600); sec.screenshot(path=ROOT + '/test/shots/rglobe.png')
    # 點東京
    pg.evaluate("APP.reportGlobe.st.auto=false; APP.reportGlobe.flyTo(139.69, 35.69, 1.6, 10)"); pg.wait_for_timeout(500)
    xy = pg.evaluate("APP.reportGlobe.project(139.69, 35.69)")
    box = pg.query_selector('.rglobe canvas').bounding_box()
    pg.mouse.click(box['x'] + xy[0], box['y'] + xy[1]); pg.wait_for_timeout(400)
    h3 = pg.inner_text('.modal h3') if pg.query_selector('.modal h3') else ''
    body = pg.inner_text('.modal p') if pg.query_selector('.modal p') else ''
    ok('city click asks first: ' + h3 + ' / ' + body[:30], '實驗室' in h3 and '東京' in body)
    pg.click('.modal button:has-text("留在報告")'); pg.wait_for_timeout(300)
    ok('留在報告 stays', pg.evaluate("APP.screen") == 'report')
    # 按鈕
    pg.click('#sec-world button:has-text("到實驗室看全球比較")'); pg.wait_for_timeout(300)
    ok('button asks first', bool(pg.query_selector('.modal h3:has-text("實驗室")')))
    pg.click('.modal button:has-text("留在報告")'); pg.wait_for_timeout(200)
    # 再點東京，這次確認
    pg.evaluate("APP.reportGlobe.st.auto=false; APP.reportGlobe.flyTo(139.69, 35.69, 1.6, 10)"); pg.wait_for_timeout(400)
    xy = pg.evaluate("APP.reportGlobe.project(139.69, 35.69)"); box = pg.query_selector('.rglobe canvas').bounding_box()
    pg.mouse.click(box['x'] + xy[0], box['y'] + xy[1]); pg.wait_for_timeout(400)
    pg.click('.modal button:has-text("前往實驗室")'); pg.wait_for_timeout(2500)
    ok('lab world view with Tokyo selected', pg.evaluate("[APP.screen, APP.lab.tab, APP.lab.level, APP.lab.wsel]") == ['lab', 'map', 'world', 'JP:tokyo'])
    det = pg.inner_text('.wd-detail-box') if pg.query_selector('.wd-detail-box') else ''
    ok('detail shows Tokyo: ' + det[:24].replace('\n', ' '), '東京' in det)
    pg.screenshot(path=ROOT + '/test/shots/rglobe-lab.png')
    # 回到報告：地球還在、不用重新下載
    pg.go_back(); pg.wait_for_timeout(2000)
    ok('back to report', pg.evaluate("APP.screen") == 'report')
    print('errors', errs)
    b.close()
