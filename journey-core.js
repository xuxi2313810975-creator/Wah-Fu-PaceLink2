(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WahFuJourneyCore=api;})(typeof window!=='undefined'?window:globalThis,()=>{
  const rad=Math.PI/180;
  function distance(a,b){const p=(b[1]-a[1])*rad,q=(b[0]-a[0])*rad,s=Math.sin(p/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(q/2)**2;return 6371000*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));}
  function lengths(paths){return paths.map(path=>path.slice(1).map((p,i)=>distance(path[i],p)));}
  function pointAt(paths,fraction){
    const ls=lengths(paths),total=ls.flat().reduce((s,v)=>s+v,0);let target=total*Math.max(0,Math.min(1,fraction));
    for(let p=0;p<paths.length;p++)for(let i=0;i<ls[p].length;i++){
      const len=ls[p][i];if(target<=len&&len>0){const t=target/len,a=paths[p][i],b=paths[p][i+1];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}target-=len;
    }
    return paths.at(-1).at(-1).slice(0,2);
  }
  // Clip each real polyline independently; never bridge disconnected paths.
  function slicePaths(paths,from,to){
    const ls=lengths(paths),total=ls.flat().reduce((s,v)=>s+v,0),lo=total*from,hi=total*to,result=[];let passed=0;
    for(let p=0;p<paths.length;p++){
      const part=[];
      for(let i=0;i<ls[p].length;i++){
        const len=ls[p][i],a=paths[p][i],b=paths[p][i+1],end=passed+len;
        if(len>0&&end>=lo&&passed<=hi){
          const l=Math.max(0,(lo-passed)/len),h=Math.min(1,(hi-passed)/len);
          if(l<=h){const x=[a[0]+(b[0]-a[0])*l,a[1]+(b[1]-a[1])*l],y=[a[0]+(b[0]-a[0])*h,a[1]+(b[1]-a[1])*h];if(!part.length)part.push(x);part.push(y);}
        }
        passed=end;
      }
      if(part.length>1)result.push(part);
    }
    return result;
  }
  function stages(route){
    if(!route.valid)return[];
    const count=Math.max(1,Math.min(12,Math.ceil(route.metres/120)));
    return Array.from({length:count},(_,i)=>({index:i,from:i/count,to:(i+1)/count,metres:route.metres/count,paths:slicePaths(route.paths,i/count,(i+1)/count),end:pointAt(route.paths,(i+1)/count)}));
  }
  function stageInstructions(route,stage,lang){
    const source=route.instructions?.[lang]||[],total=source.reduce((s,x)=>s+x.metres,0);let traversed=0;
    return source.filter(s=>{const midpoint=total?(traversed+s.metres/2)/total:0;traversed+=s.metres;return !/Depart|Stop/.test(s.maneuver||'')&&midpoint>=stage.from&&(midpoint<stage.to||stage.to===1);}).map(s=>s.text);
  }
  return{distance,pointAt,slicePaths,stages,stageInstructions};
});
