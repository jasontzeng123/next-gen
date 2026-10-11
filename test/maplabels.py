import os
# 縣市名稱引導線：問卷地圖與實驗室地圖（淺色／深色、桌機／手機），並檢查名字有沒有壓到陸地、人口點或彼此
import json, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.environ.get('SHOTS', ROOT + '/test/shots'); os.makedirs(SH, exist_ok=True)
body=open(ROOT+'/dist/index.html').read()
open(ROOT+'/test/page.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>')
d={'county':'NTPC','housing':'buy','partner':True,'incomeMode':'threshold','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31}
CHECK='''() => {
  const svg=document.querySelector('.twmap'); const out=[]; const lbl=[...svg.querySelectorAll('.tw-lbl')];
  const bb=lbl.map(g=>{const t=g.querySelector('text').getBBox(); return {id:g.dataset.id,x0:t.x,y0:t.y,x1:t.x+t.width,y1:t.y+t.height};});
  const fs=+lbl[0].querySelector('text').getAttribute('font-size');
  const hit=(a,b)=>a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
  for(let i=0;i<bb.length;i++) for(let j=i+1;j<bb.length;j++) if(hit(bb[i],bb[j])) out.push('label '+bb[i].id+'×'+bb[j].id);
  svg.querySelectorAll('rect.inset').forEach((r,k)=>{const R={x0:+r.getAttribute('x'),y0:+r.getAttribute('y')}; R.x1=R.x0+ +r.getAttribute('width'); R.y1=R.y0+ +r.getAttribute('height');
    bb.forEach(b=>{ if(['KIN','LIE'].includes(b.id)) { if(!(b.x0>=R.x0&&b.x1<=R.x1&&b.y0>=R.y0&&b.y1<=R.y1) && hit(b,R) ) out.push('inset label edge '+b.id); } else if(hit(b,R)) out.push('inset×'+b.id); }); });
  const pt=svg.createSVGPoint();
  svg.querySelectorAll('path[data-id]').forEach(p=>{ bb.forEach(b=>{ let n=0; for(let x=b.x0;x<=b.x1;x+=2) for(let y=b.y0;y<=b.y1;y+=2){ pt.x=x; pt.y=y; const m=p.getCTM(); const q=pt.matrixTransform(svg.getCTM().inverse().multiply(m).inverse()); if(p.isPointInFill(q)) n++; } if(n) out.push('land '+p.dataset.id+'×'+b.id+'('+n+')'); }); });
  svg.querySelectorAll('.dots circle').forEach(c=>{ const cx=+c.getAttribute('cx'), cy=+c.getAttribute('cy'), r=+c.getAttribute('r'); bb.forEach(b=>{ const dx=Math.max(b.x0-cx,0,cx-b.x1), dy=Math.max(b.y0-cy,0,cy-b.y1); if(dx*dx+dy*dy<r*r) out.push('dot×'+b.id); }); });
  const vb=svg.viewBox.baseVal; bb.forEach(b=>{ if(b.x0<vb.x||b.x1>vb.x+vb.width||b.y0<vb.y||b.y1>vb.y+vb.height) out.push('outside '+b.id); });
  return {fs, px:(fs*svg.getBoundingClientRect().width/vb.width).toFixed(1), issues:[...new Set(out)]};
}'''
sizes=[(1280,'light'),(390,'dark'),(360,'light')] if len(sys.argv)<2 else [(int(sys.argv[1]),sys.argv[2])]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,scheme in sizes:
        ctx=b.new_context(viewport={'width':w,'height':900}, color_scheme=scheme, device_scale_factor=2 if w<500 else 1); pg=ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS={'draft':d,'unlocked':True,'labTab':'map','seen':{'country':True,'county':True},'qi':1}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://'+ROOT+'/test/page.html#form'); pg.wait_for_timeout(1000)
        if pg.evaluate('APP.screen')!='quiz': pg.evaluate("APP.qi=1;APP.go('quiz')"); pg.wait_for_timeout(600)
        pg.wait_for_timeout(300)
        m=pg.query_selector('.twmap-wrap'); m.screenshot(path=f'{SH}/ml-quiz-{w}-{scheme}.png')
        print(w, scheme, 'quiz', pg.evaluate(CHECK))
        pg.click('.tw-lbl[data-id="CYI"]'); pg.wait_for_timeout(400)
        print('  after label click county =', pg.evaluate('APP.s.county'), '| sel label:', pg.evaluate("(document.querySelector('.tw-lbl.sel')||{dataset:{}}).dataset.id"), '| sel lead:', pg.evaluate("document.querySelectorAll('.tw-lead.sel').length"))
        pg.mouse.move(2,2)
        pg.query_selector('.twmap-wrap').screenshot(path=f'{SH}/ml-quiz2-{w}-{scheme}.png')
        pg.evaluate("APP.set('county','NTPC')")
        pg.goto('file://'+ROOT+'/test/page.html#lab'); pg.wait_for_timeout(3500)
        pg.mouse.move(2,2); pg.wait_for_timeout(200)
        pg.query_selector('.twmap-wrap').screenshot(path=f'{SH}/ml-lab-{w}-{scheme}.png')
        print('  lab', pg.evaluate(CHECK))
        pg.hover('.tw-lbl[data-id="KHH"]'); pg.wait_for_timeout(200)
        print('  lab hover tip:', pg.inner_text('.globe-tip'), errs)
        ctx.close()
    b.close()
