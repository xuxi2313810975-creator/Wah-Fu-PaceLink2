const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../map-data.js'),'utf8'),context);
const map=JSON.parse(JSON.stringify(context.window.WAHFU_MAP));
test('Imported map keeps bounded, uniquely identifiable source locations',()=>{
 assert.equal(map.places.length,215);
 assert.equal(new Set(map.places.map(p=>p.id)).size,map.places.length);
 const [west,south,east,north]=map.displayBounds;
 for(const p of map.places){
  assert.ok(p.point[0]>=west&&p.point[0]<=east&&p.point[1]>=south&&p.point[1]<=north);
  assert.equal(p.source,'https://www.openstreetmap.org/'+p.id);
  assert.ok(typeof p.name.zh==='string'&&typeof p.name.en==='string');
  for(const field of ['user','uid','changeset'])assert.equal(p.tags[field],undefined);
 }
 assert.equal(map.stats.categories.lift,8);assert.equal(map.stats.categories.toilet,3);
 assert.equal(map.stats.categories.water,2);assert.equal(map.stats.categories.shelter,17);
 assert.equal(map.stats.categories.bench,undefined,'Shelters must not become invented benches');
});
test('Imported footprints retain closed rings and courtyards; incomplete relation excluded',()=>{
 assert.equal(map.features.length,597);
 assert.equal(new Set(map.features.map(f=>f.id)).size,map.features.length);
 for(const f of map.features)for(const ring of f.paths){
  assert.ok(ring.length>=2);for(const p of ring)assert.ok(p.every(Number.isFinite));
  if(f.area){assert.ok(ring.length>=4);assert.deepEqual(ring[0],ring.at(-1));}
 }
 assert.equal(map.features.find(f=>f.id==='relation/2576093').paths.length,3);
 assert.ok(map.stats.skippedIncompleteRelations.includes('relation/11795323'));
 assert.equal(map.features.some(f=>f.id==='relation/11795323'),false);
});
test('The map replacement preserves the route snapshot and identifies the supplied extract',()=>{
 const routes=fs.readFileSync(require.resolve('../data.js'));
 assert.equal(crypto.createHash('sha256').update(routes).digest('hex'),'da6beaa1c76c57a2b492a1f42876a741e8dcb71a04f4b902cb0bcf25c079bdd0');
 assert.equal(map.sourceSha256,'a3d85a428d9bf6df7aa4b3541253d6e367dc03a3562d16ae04b640de16c185c7');
});
