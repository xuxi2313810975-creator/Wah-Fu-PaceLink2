// A bounded, cached adapter for the Lands Department's public pedestrian router.
// No API key, user identity, GPS request or database is required.
const cache = new Map();
let queue = Promise.resolve();
let lastRequest = 0;
const SERVICE = 'https://mapapi.hkmapservice.gov.hk/PedRoute/NAServer/route/solve';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function validPoint(x, y) {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 114.130 && x <= 114.143 && y >= 22.246 && y <= 22.258;
}
async function query(start, end, mode, lang) {
  const run = async () => {
    await sleep(Math.max(0, 850 - (Date.now() - lastRequest)));
    lastRequest = Date.now();
    const names = lang === 'en' ? ['Start', 'Destination'] : ['起點', '目的地'];
    const stops = {features: [start, end].map((p, i) => ({attributes:{Name:names[i]},geometry:{spatialReference:{wkid:4326},x:p[0],y:p[1]}}))};
    const url = new URL(SERVICE);
    Object.entries({stops:JSON.stringify(stops),travelMode:mode,directionsLanguage:lang,outSR:4326,f:'json',returnZ:true,returnStops:true,directionsLengthUnits:'esriNAUMeters',directionsStyleName:'NA Campus'}).forEach(([k,v])=>url.searchParams.set(k,v));
    const response = await fetch(url, {signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('upstream_unavailable');
    return response.json();
  };
  const pending = queue.then(run, run);
  queue = pending.catch(()=>{});
  return pending;
}
function instructions(response) {
  return (response.directions?.[0]?.features || []).map(f=>({text:f.attributes.text,metres:Number(f.attributes.length)||0,maneuver:f.attributes.maneuverType}));
}
async function solve(start, end) {
  let mode = 2;
  let zh = await query(start,end,mode,'zh-HK');
  if (!zh.routes?.features?.length) {
    if (zh.error?.code && zh.error.code !== 400) throw new Error('upstream_unavailable');
    mode = 1; zh = await query(start,end,mode,'zh-HK');
  }
  if (!zh.routes?.features?.length) return {status:'unavailable',reason:'no_route',retrievedAt:new Date().toISOString()};
  const feature=zh.routes.features[0],stops=zh.stops?.features||[];
  const metres=Number(feature.attributes.Total_Length);
  const startSnap=Number(stops[0]?.attributes.DistanceToNetworkInMeters)||0;
  const endSnap=Number(stops.at(-1)?.attributes.DistanceToNetworkInMeters)||0;
  const paths=feature.geometry.paths.map(path=>path.map(p=>[p[0],p[1]]));
  const valid=Number.isFinite(metres)&&metres>0&&!(metres<10&&Math.max(startSnap,endSnap)>20);
  let en=null;
  try {en=await query(start,end,mode,'en');} catch (_) { /* Geometry remains usable; English uses map-stage text. */ }
  return {
    status:valid?'ok':'withheld',valid,metres,barrierFree:mode===2,startSnap,endSnap,paths,
    instructions:{zh:instructions(zh),en:en?instructions(en):[]},
    stairs:instructions(zh).some(s=>s.text.includes('樓梯')),
    lift:instructions(zh).some(s=>s.text.includes('升降機')),
    retrievedAt:new Date().toISOString(),source:'landsd',
    start:paths[0][0],end:paths.at(-1).at(-1)
  };
}
module.exports = async function handler(req,res) {
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({status:'unavailable',reason:'method'});}
  const q=req.query||{};
  if(['sx','sy','tx','ty'].some(k=>typeof q[k]!=='string'||q[k].trim()===''))return res.status(400).json({status:'unavailable',reason:'invalid_location'});
  const start=[Number(q.sx),Number(q.sy)],end=[Number(q.tx),Number(q.ty)];
  if(!validPoint(...start)||!validPoint(...end))return res.status(400).json({status:'unavailable',reason:'invalid_location'});
  const key=[...start,...end].map(x=>x.toFixed(7)).join(',');
  let entry=cache.get(key);
  if(!entry||Date.now()-entry.created>300000){
    entry={created:Date.now(),promise:solve(start,end)};cache.set(key,entry);
    if(cache.size>120)cache.delete(cache.keys().next().value);
  }
  try {
    const result=await entry.promise;
    res.setHeader('Cache-Control','public, max-age=60, s-maxage=300');
    return res.status(200).json(result);
  } catch (_) {
    cache.delete(key);res.setHeader('Cache-Control','no-store');
    return res.status(503).json({status:'unavailable',reason:'service_unavailable'});
  }
};
