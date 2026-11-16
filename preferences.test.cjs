const test=require('node:test');
const assert=require('node:assert/strict');
const prefs=require('../preferences.js');
const ids=['H01','H02'];
const valid={version:1,home:'H02',lang:'en',large:true};
test('rejects corrupt, unknown-version and invalid home/language preference values',()=>{
 for(const value of [null,{}, {...valid,version:2},{...valid,home:'<script>'},{...valid,lang:'unknown'},{...valid,large:'true'}])assert.equal(prefs.validate(value,ids),null);
 assert.equal(prefs.read({getItem:()=>'{broken'},ids),null);
});
test('saves only supported preferences and clears the demo record',()=>{
 const data=new Map();const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 assert.equal(prefs.save(storage,{...valid,token:'not-an-auth-token',password:'not-collected'},ids),true);
 assert.deepEqual(prefs.read(storage,ids),valid);assert.equal(data.get(prefs.key).includes('password'),false);
 assert.equal(prefs.clear(storage),true);assert.equal(prefs.read(storage,ids),null);
});
test('storage denial returns failure without preventing route use',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
 assert.equal(prefs.read(blocked,ids),null);assert.equal(prefs.save(blocked,valid,ids),false);assert.equal(prefs.clear(blocked),false);
});
