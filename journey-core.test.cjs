const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const core=require('../journey-core.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'),'utf8'),sandbox);
const routes=sandbox.window.WAHFU_DATA.routes;
const length=paths=>paths.reduce((sum,p)=>sum+p.slice(1).reduce((s,v,i)=>s+core.distance(p[i],v),0),0);
test('all 286 valid saved routes retain their geometry, direction and total distance across stages',()=>{
 let checked=0;
 for(const r of routes){
  const stages=core.stages(r);
  if(!r.valid){assert.equal(stages.length,0);continue;}
  checked++;
  assert.ok(Math.abs(stages.reduce((n,s)=>n+s.metres,0)-r.metres)<1e-7);
  assert.ok(core.distance(stages[0].paths[0][0],r.paths[0][0])<.001);
  assert.ok(core.distance(stages.at(-1).end,r.paths.at(-1).at(-1))<.001);
  assert.ok(Math.abs(stages.reduce((n,s)=>n+length(s.paths),0)-length(r.paths))<.01);
  for(let i=1;i<stages.length;i++)assert.ok(core.distance(stages[i-1].end,stages[i].paths[0][0])<.01);
 }
 assert.equal(checked,286);
});
test('disconnected source paths are never joined by an invented segment',()=>{
 const paths=[[[114.135,22.25],[114.136,22.25]],[[114.138,22.25],[114.139,22.25]]];
 const sliced=core.slicePaths(paths,0,1);
 assert.equal(sliced.length,2);
 assert.ok(Math.abs(length(sliced)-length(paths))<.001);
 assert.ok(core.distance(sliced[0].at(-1),sliced[1][0])>150);
});
