import os
# 點陣台灣：規則網格的點，記錄每個點所在縣市與鄉鎮人口密度
import json, csv, re, math, random, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
topo=json.load(open(ROOT+'/vendor-src/twgeojson/json/twTown1982.topo.json'))
tf=topo['transform']; sx,sy=tf['scale']; tx,ty=tf['translate']
arcs=[]
for arc in topo['arcs']:
    x=y=0; pts=[]
    for dx,dy in arc:
        x+=dx; y+=dy; pts.append((x*sx+tx, y*sy+ty))
    arcs.append(pts)
def arcpts(i): return arcs[i] if i>=0 else list(reversed(arcs[~i]))
def ring(idxs):
    out=[]
    for i in idxs:
        pts=arcpts(i); out.extend(pts if not out else pts[1:])
    return out
# 與縣市地圖相同的投影（見 geo.py）
K=math.cos(math.radians(23.7)); S=200
def proj(lon,lat): return ((lon-119.25)*K*S, (25.35-lat)*S)
insets={'KIN':(118.32,24.45,60,250),'LIE':(120.0,26.17,60,95)}
def projc(cid, lon, lat):
    if cid in insets:
        cx,cy,ox,oy=insets[cid]; return ((lon-cx)*K*S*1.6+ox,(cy-lat)*S*1.6+oy)
    return proj(lon,lat)
NAME2ID={'台北市':'TPE','新北市':'NTPC','桃園市':'TYN','台中市':'TXG','台南市':'TNN','高雄市':'KHH','新竹市':'HSZ','新竹縣':'HSQ','基隆市':'KEE','宜蘭縣':'ILA','苗栗縣':'MIA','彰化縣':'CHA','南投縣':'NAN','雲林縣':'YUN','嘉義市':'CYI','嘉義縣':'CYQ','屏東縣':'PIF','花蓮縣':'HUA','台東縣':'TTT','澎湖縣':'PEN','金門縣':'KIN','連江縣':'LIE'}
old2new={'台北縣':'新北市','台中縣':'台中市','台南縣':'台南市','高雄縣':'高雄市','桃園縣':'桃園市'}
def norm_c(c): c=c.replace('臺','台'); return old2new.get(c,c)
def base(t): t=t.replace('臺','台'); return re.sub(r'(市|鎮|鄉|區)$','',t) if len(t)>2 else t
pop={}; cpop=collections.Counter()
for r in csv.DictReader(open(ROOT+'/research/population_townships.csv')):
    c=norm_c(r['county']); pop[(c, base(r['township']))]=int(r['population']); cpop[NAME2ID[c]]+=int(r['population'])
# 收集每個鄉鎮的多邊形（投影後）
town_polys=collections.defaultdict(list)
for g in topo['objects']['layer1']['geometries']:
    p=g['properties']; oldc=p['COUNTYNAME'].replace('臺','台'); name=p['TOWNNAME']
    if '(海)' in name: continue
    c=norm_c(oldc); b=base(name)
    if oldc=='高雄縣' and b=='三民': b='那瑪夏'
    cid=NAME2ID[c]
    if 'arcs' not in g: continue
    polys=g['arcs'] if g['type']=='MultiPolygon' else [g['arcs']]
    for poly in polys:
        outer=[projc(cid,lon,lat) for lon,lat in ring(poly[0])]
        holes=[[projc(cid,lon,lat) for lon,lat in ring(h)] for h in poly[1:]]
        town_polys[(cid,c,b)].append((outer,holes))

def area(r): return abs(sum(r[i][0]*r[i-1][1]-r[i-1][0]*r[i][1] for i in range(len(r))))/2
def inside(pt, r):
    x,y=pt; c=False; n=len(r)
    for i in range(n):
        x1,y1=r[i]; x2,y2=r[i-1]
        if (y1>y)!=(y2>y) and x < (x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
import sys
SP=float(sys.argv[1]) if len(sys.argv)>1 else 9.0
SUB=4                               # 每格 4×4 取樣，算出這一格陸地的平均人口密度
KM2=(111.32/S)*(110.57/S)
towns=[]
for (cid,c,b),polys in town_polys.items():
    a=sum(area(o)-sum(area(h) for h in hs) for o,hs in polys)*KM2
    if cid in insets: a/=2.56
    p=pop.get((c,b),0)
    xs=[q[0] for o,_ in polys for q in o]; ys=[q[1] for o,_ in polys for q in o]
    towns.append({'cid':cid,'name':b,'polys':polys,'dens':p/max(a,0.01),'pop':p,'bb':(min(xs),min(ys),max(xs),max(ys))})
def town_at(x,y):
    for t in towns:
        bx0,by0,bx1,by1=t['bb']
        if not (bx0<=x<=bx1 and by0<=y<=by1): continue
        for o,hs in t['polys']:
            if inside((x,y),o) and not any(inside((x,y),h) for h in hs): return t
    return None
allx=[t['bb'][0] for t in towns]+[t['bb'][2] for t in towns]; ally=[t['bb'][1] for t in towns]+[t['bb'][3] for t in towns]
x0,y0,x1,y1=min(allx),min(ally),max(allx),max(ally)
dots=collections.defaultdict(list); hit=collections.Counter()
gy=y0+SP/2
while gy<y1+SP/2:
    gx=x0+SP/2
    while gx<x1+SP/2:
        samples=[]
        for i in range(SUB):
            for j in range(SUB):
                sx_=gx-SP/2+(i+.5)*SP/SUB; sy_=gy-SP/2+(j+.5)*SP/SUB
                t=town_at(sx_,sy_)
                if t: samples.append(t)
        if len(samples)>=SUB*SUB*0.3:
            cnt=collections.Counter(t['cid'] for t in samples)
            cid=cnt.most_common(1)[0][0]
            dens=sum(t['dens'] for t in samples)/len(samples)
            dots[cid]+=[round(gx,1),round(gy,1),int(round(dens))]
            for t in samples: hit[(t['cid'],t['name'])]+=1
        gx+=SP
    gy+=SP
# 太小、網格落不進去的鄉鎮（小島）：放 1 點
extra=0
for t in towns:
    if hit[(t['cid'],t['name'])] or t['pop']<=0: continue
    o,hs=max(t['polys'], key=lambda q: area(q[0]))
    cx=sum(q[0] for q in o)/len(o); cy=sum(q[1] for q in o)/len(o)
    dots[t['cid']]+=[round(cx,1),round(cy,1),int(round(t['dens']))]; extra+=1
out={'sp':SP,'month':'2026-09','pop':dict(cpop),'total':sum(cpop.values()),'dots':dots}
s='var POPGRID = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\nif (typeof module !== "undefined") module.exports = POPGRID;\n'
open(ROOT+'/src/popgrid.js','w').write(s)
ds=sorted(v[i] for v in dots.values() for i in range(2,len(v),3))
n=len(ds)
print('SP',SP,'dots',n,'extra',extra,'bytes',len(s.encode()),'density pct', [ds[int(n*q)] for q in (0.1,0.25,0.5,0.75,0.9,0.97,0.99)], 'max', ds[-1])
