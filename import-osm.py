"""Convert a local OSM XML extract to a bounded, attribution-preserving display layer.
Routing and duration data are deliberately independent. No contributor account fields are emitted.
"""
import argparse,xml.etree.ElementTree as ET,json,hashlib,re,math
from pathlib import Path
from collections import Counter
BBOX=(114.130,22.246,114.143,22.258)
KEEP=('amenity','shop','highway','leisure','building','access','wheelchair','level','indoor','shelter_type','drinking_water','opening_hours','name','name:zh','name:en')
def inside(p):return BBOX[0]<=p[0]<=BBOX[2] and BBOX[1]<=p[1]<=BBOX[3]
def intersects(points):
 return points and min(p[0] for p in points)<=BBOX[2] and max(p[0] for p in points)>=BBOX[0] and min(p[1] for p in points)<=BBOX[3] and max(p[1] for p in points)>=BBOX[1]
def clip_segment(a,b):
 dx,dy=b[0]-a[0],b[1]-a[1];lo,hi=0.,1.
 for p,q in ((-dx,a[0]-BBOX[0]),(dx,BBOX[2]-a[0]),(-dy,a[1]-BBOX[1]),(dy,BBOX[3]-a[1])):
  if p==0:
   if q<0:return None
  else:
   u=q/p
   if p<0:lo=max(lo,u)
   else:hi=min(hi,u)
   if lo>hi:return None
 return [[round(a[0]+dx*u,7),round(a[1]+dy*u,7)] for u in (lo,hi)]
def clip_line(points):
 parts=[]
 for a,b in zip(points,points[1:]):
  c=clip_segment(a,b)
  if c:
   if parts and parts[-1][-1]==c[0]:parts[-1].append(c[1])
   else:parts.append(c)
 return parts

def names(t):
 raw=t.get('name','');zh=t.get('name:zh',t.get('name:zh-Hant',''));en=t.get('name:en','')
 if not zh:zh=raw.split(en)[0].strip() if en and en in raw else raw
 if not en and raw and not re.search('[\u3400-\u9fff]',raw):en=raw
 return {'zh':zh,'en':en}
def shape_type(t):
 if t.get('building')=='construction':return 'construction'
 if t.get('building') or t.get('building:part'):return 'building'
 if t.get('natural')=='water':return 'water'
 if t.get('landuse')=='construction' or t.get('building')=='construction':return 'construction'
 if t.get('leisure') in ('park','garden','playground','pitch') or t.get('natural') in ('wood','grassland') or t.get('landuse') in ('grass','forest'):return 'green'
 if t.get('amenity')=='parking':return 'parking'
 if t.get('highway')=='steps':return 'steps'
 if t.get('highway') in ('footway','path','corridor','pedestrian','crossing'):return 'footway'
 if t.get('highway'):return 'road'
 if t.get('natural') in ('coastline','cliff'):return 'edge'
 return None

def category(t):
 a,h=t.get('amenity'),t.get('highway')
 if h=='elevator':return 'lift'
 if a in ('toilets','drinking_water','shelter','bench'):return {'toilets':'toilet','drinking_water':'water','shelter':'shelter','bench':'bench'}[a]
 if h=='steps':return 'steps'
 if h=='bus_stop' or a=='bus_station' or t.get('public_transport')=='platform':return 'bus'
 if t.get('shop') or a in ('restaurant','fast_food','cafe'):return 'shop'
 if a in ('library','post_office','school','college','community_centre','fire_station','clinic','doctors','pharmacy'):return 'community'
 if t.get('leisure') in ('park','garden','playground') and t.get('name'):return 'park'
 if t.get('building') and t.get('name'):return 'building'
 return None

def assemble(segments):
 segments=[list(s) for s in segments if len(s)>1];rings=[];incomplete=0
 while segments:
  chain=segments.pop(0)
  while chain[0]!=chain[-1]:
   found=False
   for i,s in enumerate(segments):
    if chain[-1]==s[0]:chain+=s[1:]
    elif chain[-1]==s[-1]:chain+=list(reversed(s[:-1]))
    elif chain[0]==s[-1]:chain=s[:-1]+chain
    elif chain[0]==s[0]:chain=list(reversed(s[1:]))+chain
    else:continue
    segments.pop(i);found=True;break
   if not found:break
  if chain[0]==chain[-1] and len(chain)>=4:rings.append(chain)
  else:incomplete+=1
 return rings,incomplete

def convert(source):
 raw=source.read_bytes();root=ET.fromstring(raw)
 ns={e.attrib['id']:[float(e.attrib['lon']),float(e.attrib['lat'])] for e in root.findall('node')}
 ways={e.attrib['id']:e for e in root.findall('way')}
 tags=lambda e:{x.attrib['k']:x.attrib['v'] for x in e.findall('tag')}
 refs=lambda e:[x.attrib['ref'] for x in e.findall('nd')]
 features=[];places=[];used=set();incomplete=[]
 def add_place(oid,t,points,area=False):
  kind=category(t)
  if not kind or not points:return
  # A label reference, not a surveyed entrance. For steps, use a path vertex.
  point=[(min(x[0] for x in points)+max(x[0] for x in points))/2,(min(x[1] for x in points)+max(x[1] for x in points))/2] if area else points[len(points)//2]
  if not inside(point):return
  places.append({'id':oid,'category':kind,'name':names(t),'point':[round(x,7) for x in point], 'source':'https://www.openstreetmap.org/'+oid,'tags':{k:v for k,v in t.items() if k in KEEP},'reference':'area-centre' if area else 'mapped-point'})
 def add_feature(oid,t,paths,area):
  kind=shape_type(t)
  if not kind or not paths:return
  pts=[p for path in paths for p in path]
  if not intersects(pts):return
  features.append({'id':oid,'kind':kind,'area':area,'paths':paths,'name':names(t)})
 for e in root.findall('relation'):
  t=tags(e)
  if t.get('type')!='multipolygon' or not shape_type(t):continue
  members=[m for m in e.findall('member') if m.attrib['type']=='way' and m.attrib.get('role','') in ('outer','inner','')]
  if not members or any(m.attrib['ref'] not in ways for m in members):incomplete.append('relation/'+e.attrib['id']);continue
  grouped=[];bad=False
  for role in ('outer','inner'):
   segments=[refs(ways[m.attrib['ref']]) for m in members if (m.attrib.get('role') or 'outer')==role]
   rings,miss=assemble(segments)
   if miss or any(n not in ns for ring in rings for n in ring):bad=True;break
   grouped+=rings
  if bad or not grouped:incomplete.append('relation/'+e.attrib['id']);continue
  paths=[[ns[n] for n in ring] for ring in grouped];oid='relation/'+e.attrib['id']
  if not intersects([p for ring in paths for p in ring]):continue
  add_feature(oid,t,paths,True);add_place(oid,t,paths[0],True)
  used.update(m.attrib['ref'] for m in members)
 for wid,e in ways.items():
  t=tags(e);rr=refs(e)
  if not t or not rr or any(n not in ns for n in rr):continue
  pts=[ns[n] for n in rr]
  if not intersects(pts):continue
  area=len(rr)>3 and rr[0]==rr[-1] and (bool(t.get('building') or t.get('building:part') or t.get('leisure') or t.get('landuse') or t.get('natural') in ('water','wood','grassland') or t.get('amenity') in ('parking','school','college','bus_station') or t.get('area')=='yes'))
  paths=[pts] if area else clip_line(pts)
  if wid not in used:add_feature('way/'+wid,t,paths,area)
  # Member highways may still carry independent step/road meanings.
  if wid in used and t.get('highway'):add_feature('way/'+wid,t,clip_line(pts),False)
  if wid not in used or t.get('highway'):add_place('way/'+wid,t,pts,area)
 for e in root.findall('node'):
  p=ns[e.attrib['id']]
  if inside(p):add_place('node/'+e.attrib['id'],tags(e),[p])
 # Stable ordinal labels distinguish unnamed toilets, lifts and shelters in the chooser.
 counter=Counter()
 for p in places:
  counter[p['category']]+=1;p['ordinal']=counter[p['category']]
 return {'sourceFile':source.name,'imported':'2026-11-16','sourceSha256':hashlib.sha256(raw).hexdigest(),'exportBounds':root.find('bounds').attrib,'displayBounds':list(BBOX),'features':features,'places':places,'stats':{'features':len(features),'places':len(places),'categories':dict(counter),'skippedIncompleteRelations':incomplete},'attribution':'© OpenStreetMap contributors · ODbL','note':'Map labels are location references, not verified entrances or operational status.'}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args()
 data=convert(args.source);args.output.parent.mkdir(parents=True,exist_ok=True)
 args.output.write_text('window.WAHFU_MAP = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
 print(json.dumps(data['stats'],ensure_ascii=False));print('Output bytes:',args.output.stat().st_size)
