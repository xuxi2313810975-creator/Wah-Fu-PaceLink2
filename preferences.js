/* Small, versioned browser-only preference store. This is not authentication. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WahFuPreferences=api;})(typeof window!=='undefined'?window:globalThis,()=>{
  const key='wahfu-demo-preferences-v3';
  function validate(value,origins){
    if(!value||value.version!==1||!origins.includes(value.home)||!['zh','en'].includes(value.lang)||typeof value.large!=='boolean')return null;
    return{version:1,home:value.home,lang:value.lang,large:value.large};
  }
  function read(storage,origins){try{return validate(JSON.parse(storage.getItem(key)),origins);}catch{return null;}}
  function save(storage,value,origins){const clean=validate(value,origins);if(!clean)return false;try{storage.setItem(key,JSON.stringify(clean));return true;}catch{return false;}}
  function clear(storage){try{storage.removeItem(key);return true;}catch{return false;}}
  return{key,validate,read,save,clear};
});
