# 報告書「換到別的國家」區塊的截圖與耗時（桌機與手機）
import sys, os, json, time
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
body = open(ROOT + '/dist/index.html').read()
open(ROOT + '/test/page.html', 'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>')
answers = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for mode, vw in [('desktop', (1280, 900)), ('mobile', (390, 844))]:
        ctx = b.new_context(viewport={'width': vw[0], 'height': vw[1]}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('console', lambda m: errs.append((mode, m.type, m.text)) if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append((mode, 'pageerror', str(e))))
        pg.route('**/*', lambda route: route.abort() if route.request.url.startswith('http') else route.continue_())
        pg.goto('file://' + ROOT + '/test/page.html'); pg.wait_for_timeout(500)
        pg.click('text=開始試算'); pg.wait_for_timeout(300)
        if pg.query_selector('.notice'): pg.click('text=我了解了，開始填寫')
        pg.wait_for_timeout(300)
        n = 0
        while n < 40:
            n += 1
            title = pg.inner_text('#qt') if pg.query_selector('#qt') else ''
            if pg.query_selector('#county-sel'): pg.select_option('#county-sel', answers.get('county', 'TPE')); pg.wait_for_timeout(150)
            elif pg.query_selector('.opts'):
                opts = pg.query_selector_all('.opts .opt'); want = answers.get(title)
                idx = want if isinstance(want, int) else (1 if len(opts) > 1 else 0)
                opts[min(idx, len(opts) - 1)].click(); pg.wait_for_timeout(100)
            nb = pg.query_selector('#next-btn')
            if not nb: break
            last = '送出' in nb.inner_text(); nb.click(); pg.wait_for_timeout(200)
            if last: break
        pg.wait_for_timeout(3500)
        pg.click('text=查看完整審查報告')
        t0 = time.time()
        pg.wait_for_selector('#sec-world .wd-row', timeout=30000)
        print(mode, 'world section ready in %.2fs' % (time.time() - t0))
        pg.evaluate("document.querySelectorAll('#sec-world details').forEach(d => d.open = true)")
        pg.wait_for_timeout(300)
        # 報告重畫（調整設定、復原等）後要能直接畫出來，不能卡在「正在試算」
        pg.evaluate('APP.redrawReport()'); pg.wait_for_timeout(300)
        ok1 = pg.query_selector('#sec-world .wd-row') is not None
        pg.click('.tbtn[aria-label="實驗室"]'); pg.wait_for_timeout(800)
        pg.click('.tbtn[aria-label="審查報告書"]'); pg.wait_for_timeout(800)
        ok2 = pg.query_selector('#sec-world .wd-row') is not None
        # 改一個設定再重畫：要重新算出新的結果
        pg.evaluate("APP.set('kids', 1); APP.redrawReport()"); pg.wait_for_selector('#sec-world .wd-row', timeout=30000)
        print(mode, 'after redraw:', ok1, '| after lab and back:', ok2, '| after change:', pg.inner_text('#sec-world .wd-row .wd-pr'))
        pg.evaluate("document.querySelectorAll('#sec-world details').forEach(d => d.open = true)")
        el = pg.query_selector('#sec-world')
        el.screenshot(path=f'{SHOTS}/world-{mode}.png')
        ov = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
        print(mode, 'horizontal overflow:', ov)
        print(mode, 'rows:', pg.eval_on_selector_all('#sec-world .wd-row', 'els => els.map(e => e.innerText.replace(/\\n/g, " | "))'))
        ctx.close()
    b.close()
for e in errs: print(e)
print('done', len(errs), 'errors')
