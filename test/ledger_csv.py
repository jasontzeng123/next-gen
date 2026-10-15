# 逐年明細 CSV：下載後逐列對帳（年底存款 ＝ 年初存款 ＋ 可用收入合計 － 支出合計；支出各項加總 ＝ 支出合計）
import os, json, csv, io
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html=open(ROOT+'/index.html').read()
open(ROOT+'/test/web.html','w').write(html)
cases={
 'buy-full': {'county':'NTPC','housing':'buy','partner':True,'incomeMode':'full','kids':2,'ageA':28,'ageB':30,'firstBirthAge':31,'jobA':{'industry':'all','pr':60},'jobB':{'industry':'all','pr':55},'giftOnce':500000,'savings':300000},
 'rent-th-single': {'county':'KHH','housing':'rent','partner':False,'incomeMode':'threshold','kids':1,'ageA':30,'firstBirthAge':33},
 'save80': {'county':'KHH','housing':'buy','partner':True,'incomeMode':'full','kids':2,'ageA':25,'ageB':25,'firstBirthAge':31,'jobA':{'industry':'all','pr':60},'jobB':{'industry':'all','pr':60},'savings':0,'adv':{'saveRate':0.8}},
 'own-car': {'county':'NTPC','housing':'own','ownBal':8000000,'ownRate':0.0215,'ownYears':30,'ownGrace':2,'partner':True,'incomeMode':'full','kids':2,'ageA':30,'ageB':30,'firstBirthAge':32,'jobA':{'industry':'all','pr':60},'jobB':{'industry':'all','pr':60},'transport':'custom','carPrice':1500000,'carLife':8,'carHave':5,'parking':'rent'},
 'debt-extra': {'county':'TXG','housing':'buy','buyWhen':'age','buyAge':36,'partner':True,'incomeMode':'full','kids':2,'ageA':29,'ageB':31,'firstBirthAge':31,'jobA':{'industry':'all','pr':65},'jobB':{'industry':'all','pr':50},'debtBal':800000,'debtRate':0.032,'debtYears':7,'extraMonthly':4500,'travel':'custom','travelCost':90000,'care':'self','after':'art3','giftMonthly':80000,'giftYears':15,'adv':{'returnRate':0.025,'bankRate':0.026}},
 'broke': {'county':'TPE','housing':'buy','partner':True,'incomeMode':'full','kids':3,'ageA':26,'ageB':26,'firstBirthAge':27,'jobA':{'industry':'all','pr':20},'jobB':{'industry':'all','pr':20},'savings':0}
}
seen={k:True for k in ['country','county','family','ages','plan','room','housing','buy','postpartum','care','leave','preschool','school','after','cram','uni','support','transport','lifestyle','travel','elder','mode','jobA','jobB','money']}
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,d in cases.items():
        ctx=b.new_context(viewport={'width':1280,'height':900}, accept_downloads=True); pg=ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        LS={'draft':d,'seen':seen,'qi':24,'unlocked':True,'submitted':d,'consent':False}
        pg.add_init_script('(()=>{const L=%s;for(const k in L)localStorage.setItem("tw-kids:"+k,JSON.stringify(L[k]));})()' % json.dumps(LS))
        pg.goto('file://'+ROOT+'/test/web.html'); pg.wait_for_timeout(1000)
        pg.click('.tbtn[aria-label="審查報告書"]'); pg.wait_for_timeout(2000)
        with pg.expect_download() as dl: pg.click('text=下載逐年明細')
        raw=open(dl.value.path(),encoding='utf-8-sig').read()
        lines=raw.splitlines(); hi=next(i for i,l in enumerate(lines) if l.startswith('年份,'))
        rows=list(csv.DictReader(io.StringIO('\n'.join(lines[hi:]))))
        n=lambda v: float(v) if v not in ('',None) else 0.0
        bad=0; prevEnd=None
        expk=[k for k in rows[0] if k in ('住房（房租，或房貸本息＋管理費＋房屋稅）','買房一次付清（頭期款、稅費、裝潢）','大人的生活費（含水電）','生產與坐月子','0–2 歲托育','教育（幼兒園到大學、補習才藝）','孩子的生活費','交通','孝親費','旅遊','其他固定支出（寵物、興趣等）','其他貸款還款（信貸、學貸等）','沒存下來的結餘（其他花費）','借款利息')]
        for r in rows:
            if abs(n(r['年初存款'])+n(r['可用收入合計'])-n(r['支出合計'])-n(r['年底存款']))>3: bad+=1
            if abs(sum(n(r[k]) for k in expk)-n(r['支出合計']))>len(expk): bad+=1
            inc=n(r['你的稅前薪資'])+n(r.get('伴侶的稅前薪資',0))-n(r['勞健保自付（扣除）'])-n(r['所得稅（扣除）'])+n(r['政府現金補助'])+n(r['長輩資助'])+n(r['存款利息'])
            if abs(inc-n(r['可用收入合計']))>6: bad+=1
            if prevEnd is not None and abs(prevEnd-n(r['年初存款']))>1: bad+=1
            prevEnd=n(r['年底存款'])
        print(name, '| header:', lines[1][:60], '| rows', len(rows), 'cols', len(rows[0]), '| mismatches', bad, '| min end', min(n(r['年底存款']) for r in rows), errs)
        ctx.close()
    b.close()
