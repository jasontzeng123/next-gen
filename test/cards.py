# 各種情境的報告開頭、等待章節與分享圖卡（直接進入報告頁）
import sys, json, base64, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SHOTS, exist_ok=True)
os.makedirs(SHOTS, exist_ok=True)
# 用自架網站版（含 <head> 裡的樣式與設定）
open(ROOT+'/test/web.html','w').write(open(ROOT+'/index.html').read())
SC={
 'A-th-couple-tpe-buy': {'county':'TPE','housing':'buy','partner':True,'incomeMode':'threshold','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31},
 'B-full-couple-khh-rent': {'county':'KHH','housing':'rent','partner':True,'incomeMode':'full','jobA':{'industry':'all','pr':60,'mode':'pr'},'jobB':{'industry':'all','pr':50,'mode':'pr'},'kids':2,'ageA':29,'ageB':29,'firstBirthAge':31},
 'C-th-single-tpe-new': {'county':'TPE','housing':'buy','build':'new','partner':False,'incomeMode':'threshold','kids':2,'ageA':28,'firstBirthAge':31,'school':'private'},
 'D-th-couple-hua-rent': {'county':'HUA','housing':'rent','partner':True,'incomeMode':'threshold','kids':1,'ageA':27,'ageB':27,'firstBirthAge':30,'transport':'transit','care':'quasi','preschool':'quasi','school':'public','after':'none','cram':'none'},
 'E-full-wait': {'county':'NTPC','housing':'buy','partner':True,'incomeMode':'full','jobA':{'industry':'all','pr':70,'mode':'pr'},'jobB':{'industry':'all','pr':65,'mode':'pr'},'kids':2,'ageA':27,'ageB':28,'firstBirthAge':29},
}
only=sys.argv[1] if len(sys.argv)>1 else None
scheme=sys.argv[2] if len(sys.argv)>2 else 'light'
width=int(sys.argv[3]) if len(sys.argv)>3 else 1280
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name, d in SC.items():
        if only and only!='all' and not name.startswith(only): continue
        ctx=b.new_context(viewport={'width':width,'height':900}, color_scheme=scheme)
        pg=ctx.new_page()
        pg.on('pageerror', lambda e: errs.append((name,'pageerror',str(e))))
        pg.on('console', lambda m: errs.append((name,m.type,m.text)) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS={'draft':d,'unlocked':True,'submitted':d,'seen':{}}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://'+ROOT+'/test/web.html#report'); pg.wait_for_timeout(1500)
        for sid in ['sec-head','sec-wait','sec-flow']:
            el=pg.query_selector('#'+sid)
            if el: el.screenshot(path=f'{SHOTS}/{name}-{scheme}-{width}-{sid}.png')
        url=pg.evaluate("document.querySelector('.share canvas').toDataURL('image/png')")
        open(f'{SHOTS}/{name}-{scheme}-card.png','wb').write(base64.b64decode(url.split(',')[1]))
        print(name, '|', pg.input_value('.share-text') if pg.query_selector('.share-text') else '', '|', pg.evaluate("Array.from(document.querySelectorAll('.rsec-k')).map(e=>getComputedStyle(e,'::before').content+':'+e.textContent).join(' ')"))
        # 門檻模式：切換到門檻收入
        if d.get('incomeMode')!='full':
            btn=pg.query_selector('.view-seg button:nth-child(2)')
            if btn:
                btn.click(); pg.wait_for_timeout(600)
                pg.query_selector('#sec-flow').screenshot(path=f'{SHOTS}/{name}-{scheme}-{width}-flow-th.png')
                print('  toggled:', pg.inner_text('#sec-flow .rsec-lede')[:80])
        ov=pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
        if ov: print('  OVERFLOW at', width)
        ctx.close()
    b.close()
for e in errs: print(e)
print('errors', len(errs))
