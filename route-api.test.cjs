const test=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/route.js');
function invoke(query={},method='GET'){
 const res={code:0,headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(body){this.body=body;return this;}};
 return handler({query,method},res).then(()=>res);
}
const query={sx:'114.135',sy:'22.25',tx:'114.136',ty:'22.251'};
const feature=(metres=100,offset=2)=>({routes:{features:[{attributes:{Total_Length:metres},geometry:{paths:[[[114.135,22.25],[114.136,22.251]]]}}]},stops:{features:[{attributes:{DistanceToNetworkInMeters:offset}},{attributes:{DistanceToNetworkInMeters:offset}}]},directions:[{features:[{attributes:{text:'Example path',length:metres,maneuverType:'esriDMTStraight'}}]}]});
test('rejects unsupported methods and out-of-area, missing or non-numeric coordinates before calling upstream',async()=>{
 assert.equal((await invoke(query,'POST')).code,405);
 for(const q of [{},{...query,sx:'0'},{...query,sy:'NaN'},{...query,tx:['114.136']},{...query,ty:''}])assert.equal((await invoke(q)).code,400);
});
test('falls back only after no barrier-free solution, retains access mode and reuses cached requests',async()=>{
 let calls=[];
 global.fetch=async url=>{const p=new URL(url).searchParams;calls.push([p.get('travelMode'),p.get('directionsLanguage')]);return {ok:true,json:async()=>p.get('travelMode')==='2'?{error:{code:400}}:feature()};};
 const r=await invoke(query);
 assert.equal(r.code,200);assert.equal(r.body.barrierFree,false);assert.equal(r.body.valid,true);
 assert.deepEqual(calls,[['2','zh-HK'],['1','zh-HK'],['1','en']]);
 await invoke(query);assert.equal(calls.length,3);
});
test('withholds implausible near-zero routes with large snapping offsets',async()=>{
 global.fetch=async()=>({ok:true,json:async()=>feature(1,30)});
 const r=await invoke({...query,sx:'114.1351'});
 assert.equal(r.body.status,'withheld');assert.equal(r.body.valid,false);
});
test('returns a recoverable service error instead of a fabricated route',async()=>{
 global.fetch=async()=>{throw new Error('network down');};
 const r=await invoke({...query,sx:'114.1352'});
 assert.equal(r.code,503);assert.equal(r.body.status,'unavailable');assert.equal(r.body.metres,undefined);
});
