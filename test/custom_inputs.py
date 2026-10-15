# 玩家回饋第二批：自己填的數字與新選項（貸款、長輩每月資助、旅遊預算、每月其他支出、幾歲買房、自己帶、只上才藝）
# 以及報告「調整設定」：金額直接輸入、進階假設用加減調整
import os, json, csv, io, base64
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
open(ROOT + '/test/web.html', 'w').write(open(ROOT + '/index.html').read())
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}
d = {'county': 'NTPC', 'partner': True, 'kids': 2, 'ageA': 30, 'ageB': 30, 'firstBirthAge': 32, 'incomeMode': 'full',
     'jobA': {'industry': 'all', 'pr': 60}, 'jobB': {'industry': 'all', 'pr': 60}, 'housing': 'buy', 'buyWhen': 'beforeKid', 'transport': 'new'}
errs = []
ok = lambda name, cond: print(('OK  ' if cond else 'FAIL') + ' ' + name)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, accept_downloads=True); pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    LS = {'draft': d, 'seen': seen, 'qi': 0, 'unlocked': True, 'noticeOk': True}
    pg.add_init_script('(()=>{if(sessionStorage.getItem("s"))return;sessionStorage.setItem("s","1");const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(800)
    go = lambda qid: (pg.evaluate("(id)=>{const v=QS.visible(APP.s); APP.qi=v.findIndex(q=>q.id===id); APP.go('quiz');}", qid), pg.wait_for_timeout(500))
    val = lambda e: pg.evaluate(e)
    def fill(label, v):
        inp = pg.query_selector('input[aria-label="%s"]' % label); inp.fill(str(v)); inp.dispatch_event('change'); pg.wait_for_timeout(400)

    # 1. 幾歲買房：選「自己選幾歲買」→ 從原本的時間點（31 歲）開始，按 + 變 32
    go('buy'); pg.click('.chip:has-text("自己選幾歲買")'); pg.wait_for_timeout(400)
    ok('buyAge starts at old timing (31)', val('[APP.s.buyWhen, APP.s.buyAge]') == ['age', 31])
    pg.click('button[aria-label="增加你幾歲時買？"]'); pg.wait_for_timeout(300)
    ok('buyAge + => 32, house in 2028', val('[APP.s.buyAge, ENGINE.simulate(APP.s).house.tb]') == [32, 2])
    pg.screenshot(path=ROOT + '/test/shots/ci-buyage.png', full_page=True)
    # 2. 0–2 歲自己帶；課後只上才藝
    go('care'); pg.click('button.opt:has-text("自己帶，不用辭職")'); pg.wait_for_timeout(300)
    go('after'); pg.click('button.opt:has-text("不上安親班，上 1 項才藝")'); pg.wait_for_timeout(300)
    ok('care self / after art1', val('[APP.s.care, APP.s.after]') == ['self', 'art1'])
    # 3. 每月其他固定支出（自己填 4,500）
    go('lifestyle'); fill('每個月還有其他固定支出嗎？（元）', 4500)
    ok('extraMonthly 4500', val('APP.s.extraMonthly') == 4500)
    print('   note:', pg.inner_text('.qnote')[:40] if pg.query_selector('.qnote') else '')
    pg.screenshot(path=ROOT + '/test/shots/ci-lifestyle.png', full_page=True)
    # 4. 旅遊自己填：每人每年 10 萬
    go('travel'); pg.click('button.opt:has-text("自己填旅遊預算")'); pg.wait_for_timeout(400)
    fill('每人每年的旅遊費用？（萬）', 10)
    ok('travel custom 10萬/人', val('[APP.s.travel, APP.s.travelCost]') == ['custom', 100000])
    pg.screenshot(path=ROOT + '/test/shots/ci-travel.png', full_page=True)
    # 5. 存款那題：貸款、每月資助自己填、資助年數自己填
    go('money')
    ok('money hint shows rates', '1%' in pg.inner_text('.qhint') and '3%' in pg.inner_text('.qhint'))
    pg.click('[data-focus="debt:1"]'); pg.wait_for_timeout(400)
    ok('debt default 50萬', val('APP.s.debtBal') == 500000)
    fill('貸款還剩多少？（萬）', 80); fill('貸款利率？（%）', 3.2); pg.click('.subq:has-text("還要繳幾年") .chip:has-text("7 年")'); pg.wait_for_timeout(300)
    ok('debt 80萬 3.2% 7年', val('[APP.s.debtBal, APP.s.debtRate, APP.s.debtYears]') == [800000, 0.032, 7])
    print('   pay card:', pg.inner_text('.qbody .card').replace('\n', ' ')[:60])
    fill('長輩每月資助（元）', 80000); fill('持續幾年？（年）', 15)
    ok('giftMonthly 80000 for 15 years', val('[APP.s.giftMonthly, APP.s.giftYears]') == [80000, 15])
    fill('長輩每月資助（元）', 300000); pg.wait_for_timeout(300)
    ok('300,000/月 asks first', bool(pg.query_selector('.modal h3:has-text("確定是")')))
    pg.click('.modal button:has-text("重新填寫")'); pg.wait_for_timeout(300)
    ok('kept 80000 after 重新填寫', val('APP.s.giftMonthly') == 80000)
    pg.screenshot(path=ROOT + '/test/shots/ci-money.png', full_page=True)
    # 6. 報告：調整設定
    pg.evaluate("APP.submitted = JSON.parse(JSON.stringify(APP.strip(APP.s))); APP.go('report')"); pg.wait_for_timeout(2500)
    pg.click('button:has-text("調整設定")'); pg.wait_for_timeout(500)
    for g in ['住房', '生活', '收入與存款', '進階假設']:
        pg.click('.pgroup > button:has-text("%s")' % g); pg.wait_for_timeout(150)
    labels = pg.evaluate("[...document.querySelectorAll('.prow label')].map(l=>l.textContent)")
    want = ['買房年齡', '其他固定支出', '旅遊費用', '目前存款', '其他貸款', '貸款利率', '還要繳', '每月資助', '資助幾年', '存款實質報酬']
    ok('panel has all new fields', all(any(w in l for l in labels) for w in want))
    print('   missing:', [w for w in want if not any(w in l for l in labels)])
    def pfill(id_, v):
        pg.fill('#' + id_, str(v)); pg.dispatch_event('#' + id_, 'change'); pg.wait_for_timeout(700)
    pfill('p-savings', 123.5)
    ok('savings 123.5萬 from panel', val('APP.s.savings') == 1235000)
    pfill('p-savings', 3000); pg.wait_for_timeout(300)
    ok('3000萬 asks first', bool(pg.query_selector('.modal h3:has-text("3,000 萬")')))
    pg.click('.modal button:has-text("沒錯")'); pg.wait_for_timeout(800)
    ok('savings 3000萬 after confirm', val('APP.s.savings') == 30000000)
    pfill('p-savings', 100)
    pfill('p-extraMonthly', 6000); ok('extraMonthly 6000 from panel', val('APP.s.extraMonthly') == 6000)
    pfill('p-debtRate', 4.5); ok('debtRate 4.5% from panel', val('APP.s.debtRate') == 0.045)
    # 進階假設：加減
    r0 = val('APP.s.adv.returnRate')
    pg.click('#p-adv-returnRate-up'); pg.wait_for_timeout(600); pg.click('#p-adv-returnRate-up'); pg.wait_for_timeout(600)
    ok('returnRate +0.5% x2 => 2%', abs(val('APP.s.adv.returnRate') - (r0 + 0.01)) < 1e-9)
    ok('shows 2%', pg.inner_text('#p-adv-returnRate-l + div b') == '2%' if pg.query_selector('#p-adv-returnRate-l + div b') else False)
    pg.click('#p-adv-saveRate-dn'); pg.wait_for_timeout(600)
    ok('saveRate - => 95%', abs(val('APP.s.adv.saveRate') - 0.95) < 1e-9)
    pg.click('#p-adv-bankRate-up'); pg.wait_for_timeout(600)
    ok('bankRate + => 2.6%', abs(val('APP.s.adv.bankRate') - 0.026) < 1e-9)
    ok('report says recomputed', '已依調整後的設定重算' in pg.inner_text('#sec-head'))
    pg.screenshot(path=ROOT + '/test/shots/ci-panel.png', full_page=False)
    adv = pg.query_selector('.pgroup:has-text("進階假設")')
    if adv: adv.screenshot(path=ROOT + '/test/shots/ci-adv.png')
    pg.keyboard.press('Escape'); pg.evaluate("APP.go('report')"); pg.wait_for_timeout(2000)
    # 7. 圖卡附註與逐年明細
    note = pg.evaluate("(document.querySelector('.share canvas')||{toDataURL:()=>''}).toDataURL('image/png')")
    if note: open(ROOT + '/test/shots/ci-card.png', 'wb').write(base64.b64decode(note.split(',')[1]))
    with pg.expect_download() as dl: pg.click('text=下載逐年明細')
    raw = open(dl.value.path(), encoding='utf-8-sig').read(); lines = raw.splitlines(); hi = next(i for i, l in enumerate(lines) if l.startswith('年份,'))
    rows = list(csv.DictReader(io.StringIO('\n'.join(lines[hi:]))))
    ok('csv has 其他固定支出 / 其他貸款還款 / 其他貸款餘額', all(k in rows[0] for k in ['其他固定支出（寵物、興趣等）', '其他貸款還款（信貸、學貸等）', '其他貸款餘額']))
    print('   year0 other', rows[0]['其他固定支出（寵物、興趣等）'], 'debt', rows[0]['其他貸款還款（信貸、學貸等）'], 'year7 debt', rows[7]['其他貸款還款（信貸、學貸等）'], 'travel y0', rows[0]['旅遊'])
    doc = pg.evaluate("COMM.buildDoc(APP.s, APP.res, APP.th)")
    ok('share doc: buyAge/travelCost/extraMonthly, no debt or savings', doc.get('buyAge') == 32 and doc.get('travelCost') == 100000 and doc.get('extraMonthly') == 6000 and not any(k in doc for k in ['debtBal', 'savings', 'debtRate']))
    ok('standard threshold ignores debt', pg.evaluate("ENGINE.thTyp(APP.s) === ENGINE.thTyp(Object.assign({}, APP.strip(APP.s), {debtBal: 0}))"))
    print('errors', errs)
    b.close()
