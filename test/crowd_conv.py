# 門檻統計換算成「同齡、不分產業」的 PR：
# A. 資料庫已升級（crowd_stats 有 thAllHist）→ 報告與實驗室用換算後的統計，自己的門檻也換算
# B. 資料庫還沒升級（只有 thHist）→ 維持原本的同業 PR
# C. 統計函式失敗、改讀原始資料 → 網頁自己換算舊資料
# D. 新送出的分享附上 thAll
import os, json, re
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(ROOT + '/index.html').read()
cfg = {'target': 'web', 'siteUrl': 'https://jasontzeng123.github.io/next-gen/', 'sb': {'url': 'https://test.supabase.co', 'key': 'sb_publishable_TESTKEY'}}
html = re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = ' + json.dumps(cfg) + ';</script>', html)
open(ROOT + '/test/web.html', 'w').write(html)

hist = lambda vals: [sum(1 for v in vals if min(100, int(v)) == i) for i in range(101)]
OLD = {'n': 30, 'realN': 30, 'demoN': 0, 'demoOn': False, 'by': {'housing': {'buy': 20, 'rent': 10}}, 'thHist': hist([28] * 30), 'thMedian': 28, 'perChildMedian': 5000000, 'byCounty': {'HSZ': {'n': 30, 'med': 28}}}
NEW = dict(OLD, thAllHist=hist([70.6] * 30), thAllMedian=70.6, byCountyAll={'HSZ': {'n': 30, 'med': 70.6}})
STD = dict(NEW, stdHist=hist([78] * 30), stdMedian=78, byCountyStd={'HSZ': {'n': 30, 'med': 78}}, stdN=30)
TYP = dict(NEW, stdHist=hist([78] * 30), stdMedian=78, stdN=30, typHist=hist([64] * 30), typMedian=64, byCountyTyp={'HSZ': {'n': 30, 'med': 64}}, typN=30)
STDFEW = dict(NEW, stdHist=hist([78] * 3), stdMedian=78, byCountyStd={'HSZ': {'n': 3, 'med': 78}}, stdN=3)
ROWS = [{'v': 2, '_id': 'r%02d' % i, 'th': 28, 'indA': 'semi', 'indB': 'semi', 'partner': True, 'incomeMode': 'threshold', 'county': 'HSZ', 'housing': 'buy'} for i in range(30)]
me = {'county': 'HSZ', 'housing': 'buy', 'partner': True, 'incomeMode': 'threshold', 'kids': 2, 'ageA': 28, 'ageB': 28, 'firstBirthAge': 31,
      'jobA': {'industry': 'semi', 'pr': 50}, 'jobB': {'industry': 'semi', 'pr': 50}}
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}

def run(mode):
    sent = []
    def rpc(route):
        name = route.request.url.rsplit('/', 1)[-1]; body = json.loads(route.request.post_data or '{}')
        if name == 'crowd_stats':
            if mode == 'rows': return route.fulfill(status=404, body='no such function')
            return route.fulfill(status=200, content_type='application/json', body=json.dumps(dict({'new': NEW, 'std': STD, 'typ': TYP, 'stdfew': STDFEW}.get(mode, OLD), mine=False)))
        if name == 'list_choices': return route.fulfill(status=200, content_type='application/json', body=json.dumps(ROWS))
        if name == 'submit_choice': sent.append(body['p_data']); return route.fulfill(status=200, content_type='application/json', body='true')
        return route.fulfill(status=404, body='no')
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.route('https://test.supabase.co/**', rpc)
        LS = {'draft': me, 'seen': seen, 'qi': 24, 'consent': True}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(1000)
        pg.evaluate("APP.go('reveal')"); pg.wait_for_timeout(1800)
        pg.evaluate("APP.go('report')"); pg.wait_for_timeout(1800)
        tiles = pg.evaluate("(document.querySelector('#sec-crowd .tiles')||{}).innerText||''").replace('\n', ' ')
        note = pg.evaluate("[...document.querySelectorAll('#sec-crowd p')].map(p=>p.textContent).find(t=>t.includes('換算')||t.includes('只看養育標準'))||''")
        myth = pg.evaluate("APP.th && APP.th.pr")
        pg.evaluate("APP.go('lab')"); pg.wait_for_timeout(1200)
        tab = pg.query_selector('button:has-text("大家的資料")')
        if tab: tab.click(); pg.wait_for_timeout(800)
        lede = pg.evaluate("[...document.querySelectorAll('.rsec-lede')].map(p=>p.textContent).find(t=>t.includes('位分享者'))||''")
        print('==', mode, '| my th', myth)
        print('   tiles:', tiles[:150])
        print('   note :', note[:60])
        print('   lab  :', lede[:90])
        if sent: print('   sent th / thAll / thStd / thTyp:', sent[0].get('th'), sent[0].get('thAll'), sent[0].get('thStd'), sent[0].get('thTyp'))
        print('   errors', errs)
        b.close()

for m in ['typ', 'std', 'stdfew', 'new', 'old', 'rows']: run(m)
