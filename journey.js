/* Manual-position research prototype. No GPS tracking or audited seat availability. */
window.createWahFuJourney = function ({ context, onChange }) {
  const root = document.getElementById('journey-flow'), core = window.WahFuJourneyCore;
  const copy = {
    zh: {
      eyebrow:'一步一步，按你的需要', title:'現在想怎樣走？', demo:'互動示範 · 手動選位置，並非即時定位', position:'你現在在哪一段？', select:'先選擇一個示範位置', start:'路線起點', third:'走到約三分之一', twoThirds:'走到約三分之二', end:'路線終點', positionHelp:'途中位置由地圖線段估算，尚未對應現場地標。重新選位置會重設進度。', needPosition:'請先選擇示範位置，讓路線從正確的位置開始。', current:'目前的示範位置', rest:'我想歇一歇', restSub:'看看可考慮的休憩空間', continue:'分段繼續', continueSub:'每次只看一小段', home:'返回住宅', homeSub:'從這裡規劃回家的路', change:'重新選擇位置', choices:'返回選擇', restsTitle:'選一個歇腳空間', restsHelp:'以下是候選休憩空間，並非已核實的座椅，也未按最近路程排序。選擇後才計算步行路線。', unknown:'座椅、遮蔭及無障礙入口：待實地確認', chooseRest:'查看前往路線', source:'查看位置來源', loading:'正在查詢步行路線…', loadingHelp:'先查無障礙模式；若無路線，再查一般步行路線。', cancel:'取消查詢', error:'暫時未能提供這段路線', errorHelp:'請稍後重試或改選位置。未有可用路線時，不會顯示推算分鐘。', withheld:'起終點在路網上幾乎重合，暫不提供時間。需要先核實入口。', retry:'再試一次', travelling:'逐段走，隨時可以改變主意。', toward:'這一程前往', stage:'這一段', of:'／', approx:'約', metre:'米', minute:'分鐘', pace:'按 40 米／分鐘估算；不含休息及等候。', stageHelp:'深藍色是這一段，淺藍色是全程。分段屬地圖示範，停留位置仍需現場確認。', reached:'我已到達這一段', instructions:'查看此段相關的路網指示', general:'請先對照地圖及現場通道；這一段尚未配對可辨認的地標。', switchRest:'改為找地方歇腳', switchHome:'改為返回住宅', done:'已完成', stages:'段', resting:'可以先歇一歇。', restHelp:'你已在示範中到達這個休憩空間。請按現場情況尋找可用座位；不代表這裡一定有空位。', allowance:'你為這次休息預留', noCountdown:'準備好後再繼續，沒有倒數或催促。', rested:'我歇好了，繼續原本行程', arrived:'這一程的示範已完成', homeArrived:'已回到住宅的路網參考點', near:'你選擇的位置已是這一程終點。', entrance:'樓宇／設施入口及樓內路程仍需現場確認。', restart:'重新示範', unverified:'現場通行狀況待核實', fallback:'一般步行補算，可能包含樓梯。', barrier:'官方無障礙模式有解，仍需核實現場通行。', stairs:'路網指示包含樓梯。', lift:'路網指示包含升降機，等候時間未計。', fetched:'路線查詢', snapshot:'已保存路線資料：2026-11-11', offset:'路網定位偏移（未計入路程）', from:'起點', to:'終點', unavailable:'這條原始路線需要先核實入口，暫不能用來選擇途中位置。', mapLabel:'地圖顯示', original:'原本整條路線', active:'目前這一程', confirmed:'上次手動確認的位置', larger:'加大文字', normal:'標準文字', stagePoint:'已完成第 {n} 段', next:'接下來仍可繼續或返回住宅。', viewMap:'查看這一段地圖'
    },
    en: {
      eyebrow:'ONE STEP AT A TIME', title:'What would you like to do?', demo:'Interactive demo · Manual position, not live location', position:'Where are you on this route?', select:'Choose a demonstration position', start:'Start of the route', third:'About one-third along', twoThirds:'About two-thirds along', end:'End of the route', positionHelp:'Positions along the line are map estimates, not verified landmarks. Choosing again resets progress.', needPosition:'Choose a demonstration position first so the journey starts from the right place.', current:'Current demonstration position', rest:'I need a rest', restSub:'Explore possible rest spaces', continue:'Continue in stages', continueSub:'See one short section at a time', home:'Return home', homeSub:'Plan the way home from here', change:'Choose position again', choices:'Back to choices', restsTitle:'Choose a rest space', restsHelp:'These are candidate rest spaces, not verified seats, and are not ranked by walking distance. Choose one to calculate a route.', unknown:'Seats, shade and step-free entrance: not yet checked', chooseRest:'Show the route there', source:'View location source', loading:'Finding a walking route…', loadingHelp:'Trying barrier-free mode first, then general walking if no route is found.', cancel:'Cancel search', error:'This route is not available right now', errorHelp:'Try again later or choose another position. No time estimate is shown without a usable route.', withheld:'The snapped network positions nearly coincide. Check the entrances before estimating time.', retry:'Try again', travelling:'One section at a time. Change your plan whenever you need.', toward:'This journey goes to', stage:'This section', of:'of', approx:'About', metre:'m', minute:'min', pace:'Estimated at 40 metres per minute; excludes rests and waits.', stageHelp:'Dark blue is this section; pale blue is the whole journey. These are demo sections, with stopping places still to be checked on site.', reached:'I have reached this section', instructions:'Related network directions', general:'Check the map against the paths around you. This section has not yet been matched to a recognisable landmark.', switchRest:'Find somewhere to rest instead', switchHome:'Return home instead', done:'Completed', stages:'sections', resting:'Take a moment to rest.', restHelp:'You have reached this rest space in the demonstration. Check for a suitable seat on site; this does not confirm that a seat is available.', allowance:'You have allowed', noCountdown:'Continue when you feel ready. There is no countdown or rush.', rested:'I am ready to continue my original journey', arrived:'This demonstration journey is complete', homeArrived:'Back at the home network reference point', near:'Your selected position is already the end of this journey.', entrance:'Building entrances and indoor travel still need an on-site check.', restart:'Start a new demonstration', unverified:'On-site access needs checking', fallback:'General walking fallback; may include stairs.', barrier:'Official barrier-free mode found a route; on-site access still needs checking.', stairs:'Network directions include stairs.', lift:'Network directions include a lift; waiting time is excluded.', fetched:'Route retrieved', snapshot:'Saved route data: 11 November 2026', offset:'Snapping offsets (excluded from distance)', from:'start', to:'end', unavailable:'The original route needs an entrance check before positions along it can be selected.', mapLabel:'Map showing', original:'Original full route', active:'Current journey', confirmed:'Last manually confirmed position', larger:'Larger text', normal:'Standard text', stagePoint:'Completed section {n}', next:'You can still continue or return home.', viewMap:'View this section on the map'
    }
  };
  let view='choose', position=null, fraction='', travel=null, controller=null, serial=0, errorKind='', lastRequest=null, notice=false;
  const t=k=>copy[context().lang][k];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const name=p=>p.name[context().lang];
  const endpoints=()=>{const c=context();return c.direction==='out'?[c.origin,c.destination]:[c.destination,c.origin];};
  const namePair=(zh,en)=>({zh,en});
  const button=(action,label,cls='secondary',extra='')=>`<button type="button" class="flow-button ${cls}" data-action="${action}" ${extra}>${escape(label)}</button>`;
  function cancel(){serial++;if(controller)controller.abort();controller=null;}
  function reset(){cancel();view='choose';position=null;fraction='';travel=null;notice=false;lastRequest=null;}
  function focus(){requestAnimationFrame(()=>{const title=root.querySelector('[data-flow-title]');title?.focus({preventScroll:true});title?.scrollIntoView({block:'start',behavior:'auto'});});}
  function paint(moveFocus=true){render();onChange();if(moveFocus)focus();}
  function modeNote(route){return `<p class="flow-route-note ${route.barrierFree?'':'warning'}">${escape(t(route.barrierFree?'barrier':'fallback'))}${route.stairs?' '+escape(t('stairs')):''}${route.lift?' '+escape(t('lift')):''}</p>`;}
  function sourceNote(route){return `<p class="flow-small">${route.retrievedAt?escape(t('fetched')+': '+new Date(route.retrievedAt).toLocaleString(context().lang==='zh'?'zh-HK':'en-GB',{timeZone:'Asia/Hong_Kong'})):escape(t('snapshot'))}<br>${escape(t('offset'))}: ${escape(t('from'))} ${route.startSnap.toFixed(1)} m · ${escape(t('to'))} ${route.endSnap.toFixed(1)} m</p>`;}
  function heading(text){return `<h3 data-flow-title tabindex="-1">${escape(text)}</h3>`;}
  function choices(){return `<div class="flow-actions">${[['rest',t('rest'),t('restSub'),'<path d="M4 10h16M5 6h14v8H5zM3 14h18M6 14v6m12-6v6"/>'],['continue',t('continue'),t('continueSub'),'<path d="M4 12h16m-7-7 7 7-7 7"/>'],['home',t('home'),t('homeSub'),'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/>']].map(([a,label,sub,icon])=>`<button class="choice-button ${a==='rest'?'rest-choice':''}" type="button" data-action="${a}" ${context().route.valid?'':'disabled'}><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span><strong>${escape(label)}</strong><small>${escape(sub)}</small></button>`).join('')}</div>`;}
  function render(){
    const c=context(), original=endpoints();
    root.setAttribute('aria-busy',String(view==='loading'));
    root.setAttribute('aria-label',c.lang==='zh'?'行程選擇':'Journey choices');
    let body='';
    if(view==='choose'){
      body=heading(t('title'))+`<label for="demo-position">${escape(t('position'))}</label><select id="demo-position" aria-describedby="position-help position-error" ${c.route.valid?'':'disabled'}><option value="">${escape(t('select'))}</option>${[[0,t('start')+' · '+name(original[0])],[1/3,t('third')],[2/3,t('twoThirds')],[1,t('end')+' · '+name(original[1])]].map(([v,l])=>`<option value="${v}" ${String(v)===fraction?'selected':''}>${escape(l)}</option>`).join('')}</select><p id="position-help" class="flow-small">${escape(c.route.valid?t('positionHelp'):t('unavailable'))}</p><p id="position-error" class="flow-error" role="alert" ${notice?'':'hidden'}>${escape(t('needPosition'))}</p>`+choices();
    } else if(view==='rests'){
      body=heading(t('restsTitle'))+`<p>${escape(t('restsHelp'))}</p><div class="rest-options">`+window.WAHFU_REST_POINTS.map(r=>{const p=window.WAHFU_DATA.destinations.find(p=>p.id===r.id);return `<article class="rest-card"><h4>${escape(name(p))}</h4><p class="verification">${escape(t('unknown'))}</p>${button('pick-rest',t('chooseRest'),'secondary',`data-id="${p.id}"`)}<a href="${escape(p.source)}" target="_blank" rel="noopener">${escape(t('source'))}</a></article>`;}).join('')+'</div>'+button('choices',t('choices'));
    } else if(view==='loading'){
      body=heading(t('loading'))+`<p role="status">${escape(t('loadingHelp'))}</p>`+button('cancel',t('cancel'));
    } else if(view==='error'){
      body=heading(t('error'))+`<p class="flow-error" role="alert">${escape(t(errorKind==='withheld'?'withheld':'errorHelp'))}</p><div class="flow-row">`+button('retry',t('retry'),'primary')+button('choices',t('choices'))+'</div>';
    } else if(view==='travel'){
      const stage=travel.stages[travel.index];
      const instructions=core.stageInstructions(travel.route,stage,c.lang);
      body=heading(`${t('stage')} ${travel.index+1} ${t('of')} ${travel.stages.length}`)+`<p>${escape(t('toward'))} <strong>${escape(name(travel.goal))}</strong></p><progress value="${travel.index}" max="${travel.stages.length}" aria-label="${escape(t('done'))}"></progress><p class="stage-stats"><strong>${escape(t('approx'))} ${Math.round(stage.metres)} ${escape(t('metre'))}</strong><span>${Math.ceil(stage.metres/40)} ${escape(t('minute'))}</span></p><p class="flow-small">${escape(t('pace'))}</p><p>${escape(t('travelling'))}</p><p class="flow-small">${escape(t('stageHelp'))}</p>`+modeNote(travel.route)+button('map',t('viewMap'))+button('reached',t('reached'),'primary')+`<p class="stage-count">${escape(t('done'))}: ${travel.index} / ${travel.stages.length} ${escape(t('stages'))}</p><details class="stage-directions"><summary>${escape(t('instructions'))}</summary>${instructions.length?'<ul>'+instructions.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ul>':'<p>'+escape(t('general'))+'</p>'}</details><div class="flow-row">`+button('rest',t('switchRest'))+button('home',t('switchHome'))+'</div>'+`<details class="stage-directions"><summary>${escape(t('fetched'))}</summary>${sourceNote(travel.route)}</details>`;
    } else if(view==='resting'){
      body=heading(t('resting'))+`<p><strong>${escape(name(position))}</strong></p><p>${escape(t('restHelp'))}</p><p class="rest-allowance">${escape(t('allowance'))} <strong>${c.rest} ${escape(t('minute'))}</strong></p><p>${escape(t('noCountdown'))}</p>`+button('continue',t('rested'),'primary')+button('home',t('home'));
    } else if(view==='arrived'){
      body=heading(t(position.id===c.origin.id?'homeArrived':'arrived'))+`<p><strong>${escape(name(position))}</strong></p><p>${escape(t('entrance'))}</p><div class="flow-row">`+button('rest',t('rest'))+button('home',t('home'))+button('restart',t('restart'))+'</div>';
    }
    root.innerHTML=`<div class="flow-top"><p class="eyebrow">${escape(t('eyebrow'))}</p><span class="step-number">02</span></div><p class="demo-badge">${escape(t('demo'))}</p>${position?`<div class="position-strip"><span>${escape(t('current'))}<strong>${escape(name(position))}</strong></span>${button('change',t('change'),'text-button')}</div>`:''}<div class="flow-body">${body}</div>`;
    document.getElementById('map-journey-label').textContent=t('mapLabel')+': '+t(view==='travel'?'active':'original');
  }
  function requirePosition(){if(position)return true;notice=true;paint(false);root.querySelector('#demo-position')?.focus();return false;}
  async function go(kind,goal){
    if(!requirePosition())return;
    cancel();lastRequest={kind,goal};
    if(position.id===goal.id){travel=null;view=kind==='rest'?'resting':'arrived';paint();return;}
    const requestId=serial,from=position;view='loading';travel=null;paint();
    const c=context();
    // Reuse independently queried routes only when both named reference endpoints match.
    const savedId=from.id===c.origin.id?`${c.origin.id}_${goal.id}_out`:goal.id===c.origin.id?`${c.origin.id}_${from.id}_back`:null;
    let route=savedId?window.WAHFU_DATA.routes.find(r=>r.id===savedId):null;
    try{
      if(!route){
        controller=new AbortController();
        const timer=setTimeout(()=>controller?.abort(),45000);
        try{
          const params=new URLSearchParams({sx:from.coords[0],sy:from.coords[1],tx:goal.lon,ty:goal.lat});
          const response=await fetch('/api/route?'+params,{signal:controller.signal});
          if(!response.ok)throw new Error('service');
          route=await response.json();
        }finally{clearTimeout(timer);}
      }
      if(requestId!==serial)return;
      if(!route.valid||!Array.isArray(route.paths)||!route.paths.length){errorKind=route.status==='withheld'||route.valid===false?'withheld':'service';view='error';paint();return;}
      travel={kind,goal,route,stages:core.stages(route),index:0};view='travel';paint();
    }catch(_){if(requestId!==serial)return;errorKind='service';view='error';paint();}
  }
  root.addEventListener('change',event=>{
    if(event.target.id!=='demo-position')return;
    cancel();fraction=event.target.value;travel=null;notice=false;
    if(fraction==='')position=null;
    else{
      const c=context(),f=Number(fraction),ends=endpoints(),p=f===0?ends[0]:f===1?ends[1]:null;
      position={id:p?.id||null,coords:core.pointAt(c.route.paths,f),name:p?.name||namePair(f<.5?copy.zh.third:copy.zh.twoThirds,f<.5?copy.en.third:copy.en.twoThirds)};
    }
    paint(false);root.querySelector('#demo-position')?.focus();
  });
  root.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
    const action=el.dataset.action;
    if(action==='map'){document.getElementById('map-journey-label').scrollIntoView({block:'start',behavior:'smooth'});return;}
    if(action==='change'||action==='restart'){reset();paint();return;}
    if(action==='choices'||action==='cancel'){cancel();view='choose';travel=null;paint();return;}
    if(action==='rest'){if(!requirePosition())return;cancel();view='rests';travel=null;paint();return;}
    if(action==='home')return go('home',context().origin);
    if(action==='continue')return go('continue',endpoints()[1]);
    if(action==='retry'&&lastRequest)return go(lastRequest.kind,lastRequest.goal);
    if(action==='pick-rest')return go('rest',window.WAHFU_DATA.destinations.find(p=>p.id===el.dataset.id));
    if(action==='reached'&&travel){
      const stage=travel.stages[travel.index];
      position={id:null,coords:stage.end,name:namePair(copy.zh.stagePoint.replace('{n}',travel.index+1),copy.en.stagePoint.replace('{n}',travel.index+1))};fraction='';
      travel.index++;
      if(travel.index===travel.stages.length){
        position={...position,id:travel.goal.id,name:travel.goal.name};view=travel.kind==='rest'?'resting':'arrived';travel=null;
      }
      paint();
    }
  });
  function describe(){
    const c=context();
    const current=position?t('current')+': '+name(position)+'. ':'';
    if(view==='choose')return t('demo')+'. '+current+t('title')+'. '+(!c.route.valid?t('unavailable'):!position?t('needPosition'):t('rest')+'. '+t('continue')+'. '+t('home'));
    if(view==='rests')return t('restsTitle')+'. '+t('restsHelp')+' '+window.WAHFU_REST_POINTS.map(r=>name(window.WAHFU_DATA.destinations.find(p=>p.id===r.id))).join(', ')+'. '+t('unknown');
    if(view==='loading')return t('loading')+' '+t('loadingHelp');
    if(view==='error')return t('error')+'. '+t(errorKind==='withheld'?'withheld':'errorHelp');
    if(view==='travel'){
      const step=travel.stages[travel.index];
      return `${t('stage')} ${travel.index+1} ${t('of')} ${travel.stages.length}. ${t('toward')} ${name(travel.goal)}. ${t('approx')} ${Math.round(step.metres)} ${c.lang==='zh'?'米':'metres'}, ${Math.ceil(step.metres/40)} ${c.lang==='zh'?'分鐘':'minutes'}. ${t('pace')} ${t(travel.route.barrierFree?'barrier':'fallback')} ${t('reached')}.`;
    }
    if(view==='resting')return t('resting')+' '+name(position)+'. '+t('restHelp')+' '+t('allowance')+' '+c.rest+' '+t('minute')+'. '+t('noCountdown')+' '+t('rested')+'. '+t('home');
    return t(position.id===c.origin.id?'homeArrived':'arrived')+'. '+name(position)+'. '+t('entrance');
  }
  return {render,reset,describe,overlay:()=>({route:view==='travel'?travel.route:null,stage:view==='travel'?travel.stages[travel.index]:null,position,goal:view==='travel'?travel.goal:null})};
};
