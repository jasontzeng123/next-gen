import os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (360, 390, 768, 1024):
        pg=b.new_page(viewport={'width':w,'height':800})
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.goto('file://'+ROOT+'/test/page.html')
        pg.evaluate("localStorage.setItem('tw-kids:unlocked','true')")
        res={}
        for scr in ['cover','report','lab','method']:
            pg.evaluate(f"APP.compute(true); APP.go('{scr}')")
            pg.wait_for_timeout(1800)
            ov=pg.evaluate("(()=>{const W=document.documentElement.clientWidth;const bad=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>W+1&&r.width>0&&!e.closest('.table-scroll,.ledger-scroll,.tabs,.drawer')){bad.push(e.tagName+'.'+(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)+' '+Math.round(r.right))}});return [document.documentElement.scrollWidth>W, bad.slice(0,6)]})()")
            res[scr]=ov
        for q in range(0,24):
            pg.evaluate(f"APP.qi={q}; APP.go('quiz')")
            pg.wait_for_timeout(250)
            ov=pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth")
            if ov: res['q'+str(q)]=ov
        print(w, res)
        pg.close()
    b.close()
