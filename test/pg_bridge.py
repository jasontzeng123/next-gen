# 用本機的 PostgreSQL（跑真正的 supabase/*.sql）接上網頁，端到端測試統計、分享、取消分享與頻率限制
# 需要先啟動本機 PostgreSQL：PGHOST、PGPORT 指向它（預設 /tmp/pgtest:5499），並已建立 anon 角色
import os, json, re, subprocess
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PG = ['psql', '-h', os.environ.get('PGHOST', '/tmp/pgtest'), '-p', os.environ.get('PGPORT', '5499'), '-U', 'postgres', '-At', '-q']
def sql(q, role='anon', ip='9.9.9.9'):
    pre = "set role %s; select set_config('request.headers', '%s', false);" % (role, json.dumps({'x-forwarded-for': ip}))
    r = subprocess.run(PG + ['-c', pre + q], capture_output=True, text=True)
    if r.returncode or 'ERROR' in r.stderr: raise RuntimeError(r.stderr.strip()[:300])
    return r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ''
q = lambda s: "'" + s.replace("'", "''") + "'"
# 重設資料庫並放入 40 筆示範資料
sql('truncate public.submissions; truncate public.stats_cache; truncate public.rate_log;', role='postgres')
for d in json.load(open(ROOT + '/seed/demo.json')):
    i = d.pop('_seedId'); sql('select public.submit_choice(%s, %s, %s::jsonb);' % (q(i), q('x' * 40), q(json.dumps(d))), ip='8.8.8.%d' % (hash(i) % 200))
html = open(ROOT + '/index.html').read()
cfg = {'target': 'web', 'siteUrl': 'https://jasontzeng123.github.io/next-gen/', 'sb': {'url': 'https://test.supabase.co', 'key': 'sb_publishable_TESTKEY'}}
html = re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = ' + json.dumps(cfg) + ';</script>', html)
open(ROOT + '/test/web.html', 'w').write(html)
CALLS = []
def rpc(route):
    name = route.request.url.rsplit('/', 1)[-1]; body = json.loads(route.request.post_data or '{}'); CALLS.append(name)
    args = ', '.join('%s => %s' % (k, 'null' if v is None else (q(json.dumps(v)) + '::jsonb' if isinstance(v, dict) else (str(v) if isinstance(v, (int, float)) else q(v)))) for k, v in body.items())
    try:
        if name == 'list_choices': out = '[' + ','.join(subprocess.run(PG + ['-c', "set role anon; select public.list_choices(%s);" % args], capture_output=True, text=True).stdout.split('\n')[1:-1] or []) + ']'
        else:
            out = sql('select public.%s(%s);' % (name, args))
            out = {'t': 'true', 'f': 'false'}.get(out, out)  # psql 的布林值是 t/f，PostgREST 回傳 JSON 的 true/false
        return route.fulfill(status=200, content_type='application/json', body=out or 'null')
    except RuntimeError as e:
        return route.fulfill(status=400, content_type='application/json', body=json.dumps({'message': str(e)}))
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}
d = {'county': 'NTPC', 'housing': 'buy', 'partner': True, 'incomeMode': 'threshold', 'kids': 2, 'ageA': 28, 'ageB': 30, 'firstBirthAge': 32}
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.route('https://test.supabase.co/**', rpc)
    LS = {'draft': d, 'seen': seen, 'qi': 24, 'consent': True}
    pg.add_init_script('(()=>{if(sessionStorage.getItem("s"))return;sessionStorage.setItem("s","1");const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
    pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(1200)
    st = lambda: pg.evaluate("({server: COMM.st.server, n: COMM.st.stats && COMM.st.stats.n, demoOn: COMM.st.demoOn, mine: !!COMM.mine(), canShare: COMM.st.canShare})")
    print('1 load          ', st(), '| calls', CALLS)
    pg.evaluate("APP.go('reveal')"); pg.wait_for_timeout(1600)
    print('2 first submit  ', st(), '| rows', sql('select count(*) from public.submissions', role='postgres'))
    pg.evaluate("APP.go('report')"); pg.wait_for_timeout(1500)
    print('3 report crowd  ', pg.evaluate("(document.querySelector('#sec-crowd p')||{}).textContent||''")[:40], '| tiles', pg.evaluate("Array.from(document.querySelectorAll('#sec-crowd .tile')).map(t=>t.textContent.slice(0,26)).join(' / ')"))
    pg.click('#sec-crowd >> text=取消分享'); pg.wait_for_timeout(1200)
    print('4 withdraw      ', st(), '| rows', sql('select count(*) from public.submissions', role='postgres'))
    pg.click('.tbtn[aria-label="實驗室"]'); pg.wait_for_timeout(2500)
    t = [x for x in pg.query_selector_all('[role=tab]') if '大家' in x.inner_text()]
    if t: t[0].click(); pg.wait_for_timeout(1200)
    print('5 lab crowd     ', pg.evaluate("(document.querySelector('.rsec-lede')||{}).textContent||''")[:40], '| county bars', len(pg.query_selector_all('.bars .bar-row')))
    print('6 calls', {k: CALLS.count(k) for k in set(CALLS)}, '| errors', errs)
    # 頻率限制：同一個位址 10 分鐘內第 21 筆新代號會被擋
    blocked = None
    for i in range(25):
        try: sql("select public.submit_choice('flood%015d', '%s', '{\"v\":2,\"th\":50}'::jsonb);" % (i, 'y' * 30), ip='6.6.6.6')
        except RuntimeError as e: blocked = (i + 1, str(e)[:40]); break
    print('7 flood blocked at', blocked)
    b.close()
