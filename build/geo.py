import os
# 產生：世界國家點陣（0.5°）與台灣縣市 SVG 路徑
import json, math, base64
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ne=json.load(open(ROOT+'/vendor-src/ne/geojson/ne_50m_admin_0_countries.geojson'))
W,H=720,360  # 0.5 度
img=Image.new('I',(W,H),0)
dr=ImageDraw.Draw(img)
countries=[]
common={'TWN':'台灣','JPN':'日本','KOR':'韓國','PRK':'北韓','CHN':'中國','USA':'美國','CAN':'加拿大','GBR':'英國','FRA':'法國','DEU':'德國','ITA':'義大利','ESP':'西班牙','SWE':'瑞典','NOR':'挪威','FIN':'芬蘭','DNK':'丹麥','NLD':'荷蘭','AUS':'澳洲','NZL':'紐西蘭','SGP':'新加坡','HKG':'香港','THA':'泰國','VNM':'越南','PHL':'菲律賓','IDN':'印尼','MYS':'馬來西亞','IND':'印度','RUS':'俄羅斯','BRA':'巴西','MEX':'墨西哥','ARG':'阿根廷','CHL':'智利','ZAF':'南非','EGY':'埃及','TUR':'土耳其','ISR':'以色列','SAU':'沙烏地阿拉伯','ARE':'阿聯','POL':'波蘭','UKR':'烏克蘭','CHE':'瑞士','AUT':'奧地利','BEL':'比利時','PRT':'葡萄牙','IRL':'愛爾蘭','GRC':'希臘','CZE':'捷克','HUN':'匈牙利','MNG':'蒙古','KAZ':'哈薩克','PAK':'巴基斯坦','BGD':'孟加拉','IRN':'伊朗','IRQ':'伊拉克','NGA':'奈及利亞','KEN':'肯亞','ETH':'衣索比亞','COL':'哥倫比亞','PER':'秘魯','VEN':'委內瑞拉','CUB':'古巴','ISL':'冰島','MAC':'澳門'}
for f in ne['features']:
    p=f['properties']; a3=p['ADM0_A3']
    if a3=='ATA': continue
    idx=len(countries)+1
    name=common.get(a3) or p.get('NAME_ZHT') or p['NAME']
    countries.append({'a3':a3,'n':name,'lx':round(p.get('LABEL_X') or 0,2),'ly':round(p.get('LABEL_Y') or 0,2)})
    g=f['geometry']
    polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for poly in polys:
        for ri,ring in enumerate(poly):
            pts=[((lon+180)/360*W,(90-lat)/180*H) for lon,lat in ring]
            if len(pts)>2: dr.polygon(pts, fill=(idx if ri==0 else 0))
# 台灣強制可見：至少標出本島格子
px=img.load()
rows=[]
for y in range(H):
    row=[]; prev=None; run=0
    for x in range(W):
        v=px[x,y]
        if v==prev: run+=1
        else:
            if prev is not None: row.append((prev,run))
            prev=v; run=1
    row.append((prev,run))
    rows.append(';'.join(('%x'%v if v else '')+('*%x'%r if r>1 else '') for v,r in row))
rle='|'.join(rows)
print('countries',len(countries),'rle bytes',len(rle))
# 台灣縣市
topo=json.load(open(ROOT+'/vendor-src/twgeojson/json/twCounty2010merge.topo.json'))
tf=topo['transform']; sx,sy=tf['scale']; tx,ty=tf['translate']
arcs=[]
for arc in topo['arcs']:
    x=y=0; pts=[]
    for dx,dy in arc:
        x+=dx; y+=dy; pts.append((x*sx+tx, y*sy+ty))
    arcs.append(pts)
def arcpts(i):
    return arcs[i] if i>=0 else list(reversed(arcs[~i]))
def ring(idxs):
    out=[]
    for i in idxs:
        pts=arcpts(i)
        out.extend(pts if not out else pts[1:])
    return out
idmap={'台北市':'TPE','新北市':'NTPC','桃園縣':'TYN','台中市':'TXG','台南市':'TNN','高雄市':'KHH','新竹市':'HSZ','新竹縣':'HSQ','基隆市':'KEE','宜蘭縣':'ILA','苗栗縣':'MIA','彰化縣':'CHA','南投縣':'NAN','雲林縣':'YUN','嘉義市':'CYI','嘉義縣':'CYQ','屏東縣':'PIF','花蓮縣':'HUA','台東縣':'TTT','澎湖縣':'PEN','金門縣':'KIN','連江縣':'LIE'}
K=math.cos(math.radians(23.7))
# 主圖範圍：119.2–122.1E, 21.85–25.35N；金門、連江以插圖放左上
S=200  # px per degree lat
def proj(lon,lat,off=(0,0)):
    return ((lon-119.25)*K*S+off[0], (25.35-lat)*S+off[1])
# 插圖位移：金門中心(118.35,24.45)->放在 (0.38*S, 0.95*S)區域；連江(119.95,26.15)->(0.40*S,0.25*S)
insets={'KIN':(118.32,24.45,60,250),'LIE':(120.0,26.17,60,95)}
counties=[]
for g in topo['objects']['layer1']['geometries']:
    name=g['properties']['COUNTYNAME']; cid=idmap[name]
    polys=g['arcs'] if g['type']=='MultiPolygon' else [g['arcs']]
    d=[]; allp=[]
    for poly in polys:
        for r in poly:
            pts=ring(r)
            if cid in insets:
                cx,cy,ox,oy=insets[cid]
                pp=[((lon-cx)*K*S*1.6+ox,(cy-lat)*S*1.6+oy) for lon,lat in pts]
            else:
                pp=[proj(lon,lat) for lon,lat in pts]
            # 簡化：去除過近點
            simp=[pp[0]]
            for q in pp[1:]:
                if abs(q[0]-simp[-1][0])+abs(q[1]-simp[-1][1])>0.6: simp.append(q)
            if len(simp)<3: continue
            allp+=simp
            d.append('M'+'L'.join('%.1f,%.1f'%q for q in simp)+'Z')
    xs=[p[0] for p in allp]; ys=[p[1] for p in allp]
    counties.append({'id':cid,'d':''.join(d),'cx':round(sum(xs)/len(xs),1),'cy':round(sum(ys)/len(ys),1)})
xmax=max(float(v) for c in counties for v in [c['cx']])
print('tw size bytes',sum(len(c['d']) for c in counties))
# 地圖邊界
import re
allx=[];ally=[]
for c in counties:
    for m in re.finditer(r'(-?[\d.]+),(-?[\d.]+)',c['d']):
        allx.append(float(m.group(1))); ally.append(float(m.group(2)))
print('bbox',min(allx),max(allx),min(ally),max(ally))
out='var GEO = '+json.dumps({'w':W,'h':H,'rle':rle,'countries':countries,'tw':counties,'twBox':[min(allx),min(ally),max(allx),max(ally)],'insets':{'KIN':[10,200,110,100],'LIE':[10,40,110,110]}},ensure_ascii=False,separators=(',',':'))+';\nif (typeof module !== "undefined") module.exports = GEO;\n'
open(ROOT+'/src/geo.js','w').write(out)
print('geo.js bytes',len(out.encode()))
