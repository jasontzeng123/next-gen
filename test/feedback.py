# 意見與回報：報告與方法頁的表單，接上本機 PostgreSQL（真正的 supabase/upgrade-2.sql）
import os, json, re, subprocess
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SH, exist_ok=True)
PG = ['psql', '-h', os.environ.get('PGHOST', '/tmp/pgtest'), '-p', os.environ.get('PGPORT', '5499'), '-U', 'postgres', '-At', '-q']
q = lambda s: "'" + s.replace("'", "''") + "'"
def sql(stmt, role='anon', ip='5.5.5.5'):
    pre = "set role %s; select set_config('request.headers', '%s', false);" % (role, json.dumps({'x-forwarded-for': ip}))
    r = subprocess.run(PG + ['-c', pre + stmt], capture_output=True, text=True)
    if r.returncode or 'ERROR' in r.stderr: raise RuntimeError(r.stderr.strip()[:200])
    out = r.stdout.strip().splitlines(); return out[-1] if out else ''
sql('truncate public.feedback; truncate public.rate_log;', role='postgres')
html = open(ROOT + '/index.html').read()
cfg = {'target': 'web', 'siteUrl': 'https://jasontzeng123.github.io/next-gen/', 'sb': {'url': 'https://test.supabase.co', 'key': 'sb_publishable_TESTKEY'}}
open(ROOT + '/test/web.html', 'w').write(re.sub(r'<script>window\.TWKIDS = .*?;</script>', '<script>window.TWKIDS = ' + json.dumps(cfg) + ';</script>', html))
def rpc(route):
    name = route.request.url.rsplit('/', 1)[-1]; body = json.loads(route.request.post_data or '{}')
    def lit(v): return 'null' if v is None else (q(json.dumps(v, ensure_ascii=False)) + '::jsonb' if isinstance(v, dict) else (str(v) if isinstance(v, (int, float)) else q(v)))
    try:
        out = sql('select public.%s(%s);' % (name, ', '.join('%s => %s' % (k, lit(v)) for k, v in body.items())))
        return route.fulfill(status=200, content_type='application/json', body={'t': 'true', 'f': 'false'}.get(out, out) or 'null')
    except RuntimeError as e:
        return route.fulfill(status=400, content_type='application/json', body=json.dumps({'message': str(e)}))
seen = {k: True for k in ['country', 'county', 'family', 'ages', 'plan', 'room', 'housing', 'buy', 'postpartum', 'care', 'leave', 'preschool', 'school', 'after', 'cram', 'uni', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'mode', 'jobA', 'jobB', 'money']}
d = {'county': 'TXG', 'housing': 'rent', 'partner': True, 'incomeMode': 'threshold', 'kids': 2}
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.route('https://test.supabase.co/**', rpc)
    pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps({'draft': d, 'seen': seen, 'unlocked': True, 'submitted': d, 'consent': False}))
    pg.goto('file://' + ROOT + '/test/web.html'); pg.wait_for_timeout(1000)
    pg.tap('.tbtn[aria-label="審查報告書"]'); pg.wait_for_timeout(2200)
    fb = pg.query_selector('#sec-save .fb'); fb.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    pg.tap('#sec-save .fb .chip >> text=資料有誤或過時')
    pg.fill('#sec-save .fb textarea', '台中市的托育加碼好像是每月 3,000 元，不是 2,000 元。')
    fb.screenshot(path=SH + '/fb-report-before.png')
    pg.tap('#sec-save .fb >> text=送出意見'); pg.wait_for_timeout(1200)
    print('report form after send:', pg.inner_text('#sec-save .fb')[:30].replace('\n', ' '))
    print('db row:', sql("select kind || ' | ' || page || ' | ' || left(message, 12) || ' | county=' || coalesce(context->>'county','-') from public.feedback order by id desc limit 1", role='postgres'))
    pg.tap('.tbtn[aria-label="方法與資料"]'); pg.wait_for_timeout(900)
    print('method callout:', pg.inner_text('.verify-callout').replace('\n', ' / '))
    pg.tap('.verify-callout >> text=驗算方式與意見回報'); pg.wait_for_timeout(900)
    print('scrolled to verify heading (top px):', pg.evaluate("Math.round(document.getElementById('verify').getBoundingClientRect().top)"))
    pg.fill('.method .fb textarea', '希望可以加入「雙胞胎」的選項')
    pg.tap('.method .fb .chip >> text=建議'); pg.tap('.method .fb >> text=送出意見'); pg.wait_for_timeout(1200)
    print('method form after send:', pg.inner_text('.method .fb')[:12], '| db count', sql('select count(*) from public.feedback', role='postgres'))
    pg.query_selector('.method .fb').screenshot(path=SH + '/fb-method-after.png')
    # 太多次：同一個位址第 6 則會被擋
    for i in range(3): sql("select public.submit_feedback('idea', 'x%d', null, null);" % i)
    pg.reload(); pg.wait_for_timeout(900); pg.evaluate("APP.go('method')"); pg.wait_for_timeout(600)
    pg.fill('.method .fb textarea', '第六則'); pg.tap('.method .fb >> text=送出意見'); pg.wait_for_timeout(1000)
    print('6th message:', pg.inner_text('.method .fb .fb-msg'), '| errors', errs)
    b.close()
