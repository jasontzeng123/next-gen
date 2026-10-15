# 已經有房（既有房貸）、自己填車價、已經有車：問卷操作、報告面板、分享圖卡與逐年明細
import os, json, csv, io
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'own', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}
d = {'county': 'NTPC', 'partner': True, 'kids': 2, 'ageA': 30, 'ageB': 30, 'firstBirthAge': 32, 'incomeMode': 'full',
     'jobA': {'industry': 'all', 'pr': 60}, 'jobB': {'industry': 'all', 'pr': 60}, 'housing': 'rent', 'transport': 'new'}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, accept_downloads=True); pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    LS = {'draft': d, 'seen': seen, 'qi': 0, 'unlocked': True, 'noticeOk': True}
    pg.add_init_script('(()=>{if(sessionStorage.getItem("s"))return;sessionStorage.setItem("s","1");const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(800)
    go = lambda qid: (pg.evaluate("(id)=>{const v=QS.visible(APP.s); APP.qi=v.findIndex(q=>q.id===id); APP.go('quiz');}", qid), pg.wait_for_timeout(600))
    # 1. 住房選「已經有自己的房子」
    go('housing'); pg.click('button.opt:has-text("已經有自己的房子")'); pg.wait_for_timeout(500)
    print('housing =', pg.evaluate('APP.s.housing'), '| note:', (pg.inner_text('.qnote') if pg.query_selector('.qnote') else '')[:40])
    vis = pg.evaluate("QS.visible(APP.s).map(q=>q.id)"); print('own question visible:', 'own' in vis, '| buy question visible:', 'buy' in vis)
    # 2. 房貸題：餘額 800 萬、利率 2.2%、還要 30 年、寬限期 2 年
    go('own')
    pg.click('.chip:has-text("800 萬")'); pg.wait_for_timeout(300)
    pg.click('.chip:has-text("2.2%")'); pg.wait_for_timeout(300)
    pg.click('.chip:has-text("30 年")'); pg.wait_for_timeout(300)
    pg.click('.subq:has-text("寬限期") .chip:has-text("2 年")'); pg.wait_for_timeout(300)
    print('own:', pg.evaluate('[APP.s.ownBal, APP.s.ownRate, APP.s.ownYears, APP.s.ownGrace]'))
    print('pay text:', pg.inner_text('.qbody .card').replace('\n', ' ')[:90])
    pg.screenshot(path=ROOT + '/test/shots/own-quiz.png', full_page=True)
    # 自己填利率 2.15%
    inp = pg.query_selector('input[aria-label="房貸利率？（%）"]'); inp.fill('2.15'); inp.dispatch_event('change'); pg.wait_for_timeout(500)
    print('custom rate:', pg.evaluate('APP.s.ownRate'))
    # 3. 交通：自己填車價、已經有車
    go('transport'); pg.click('button.opt:has-text("自己填車價")'); pg.wait_for_timeout(500)
    inp = pg.query_selector('input[aria-label="車價大約多少？（萬）"]'); inp.fill('150'); inp.dispatch_event('change'); pg.wait_for_timeout(500)
    pg.click('.chip:has-text("8 年")'); pg.wait_for_timeout(300)
    pg.click('.chip:has-text("有，還能開 5 年")'); pg.wait_for_timeout(300)
    pg.click('.chip:has-text("有車位")'); pg.wait_for_timeout(300)
    print('car:', pg.evaluate('[APP.s.transport, APP.s.carPrice, APP.s.carLife, APP.s.carHave, APP.s.parking]'))
    pg.screenshot(path=ROOT + '/test/shots/own-car.png', full_page=True)
    # 4. 買房細節：一般房貸時才問利率
    pg.evaluate("APP.set('housing','buy'); APP.set('loan','bank')"); go('buy')
    print('bank rate field shown:', bool(pg.query_selector('.subq-title:has-text("一般房貸利率")')))
    pg.evaluate("APP.set('loan','qingan')"); go('buy')
    print('hidden for 新青安:', not pg.query_selector('.subq-title:has-text("一般房貸利率")'))
    pg.evaluate("APP.set('housing','own')")
    # 5. 報告：面板、圖卡附註、逐年明細
    pg.evaluate("APP.submitted = JSON.parse(JSON.stringify(APP.strip(APP.s))); APP.go('report')"); pg.wait_for_timeout(2500)
    pg.click('button:has-text("調整設定")'); pg.wait_for_timeout(500)
    pg.click('.pgroup button:has-text("住房")'); pg.wait_for_timeout(300)
    labels = pg.evaluate("[...document.querySelectorAll('.prow label')].map(l=>l.textContent)")
    print('panel has:', [x for x in labels if any(k in x for k in ['房貸', '寬限', '還要繳', '車位', '車價', '換車', '現在有車'])])
    pg.keyboard.press('Escape'); pg.evaluate("APP.go('report')"); pg.wait_for_timeout(2000)
    import base64
    url = pg.evaluate("(document.querySelector('.share canvas')||{toDataURL:()=>''}).toDataURL('image/png')")
    if url: open(ROOT + '/test/shots/own-card.png', 'wb').write(base64.b64decode(url.split(',')[1]))
    with pg.expect_download() as dl: pg.click('text=下載逐年明細')
    raw = open(dl.value.path(), encoding='utf-8-sig').read(); lines = raw.splitlines(); hi = next(i for i, l in enumerate(lines) if l.startswith('年份,'))
    rows = list(csv.DictReader(io.StringIO('\n'.join(lines[hi:]))))
    print('csv cols has 房屋價值/房貸餘額:', '房屋價值' in rows[0], '房貸餘額' in rows[0], '| year0 住房', rows[0]['住房（房租，或房貸本息＋管理費＋房屋稅）'], '| year2 住房', rows[2]['住房（房租，或房貸本息＋管理費＋房屋稅）'], '| 買房一次付清 total', sum(float(r['買房一次付清（頭期款、稅費、裝潢）'] or 0) for r in rows))
    print('errors', errs)
    b.close()
