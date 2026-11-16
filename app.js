(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!window.d3 || !window.WAHFU_DATA) { $('load-error').hidden = false; return; }
  const data = window.WAHFU_DATA;
  const messages = {
    zh: {
      skip:'跳至路線選擇', brand:'華富歇腳線', eyebrow:'華富一邨 · 華富二邨', hero:'按自己的節奏，走每一段路。', intro:'想歇一歇、繼續走，還是回家？每一段都可以按自己的需要選擇。', plannerAria:'步行路線規劃', choose:'選擇你的路線', origin:'住宅樓', destination:'目的地', direction:'方向', out:'去程：住宅 → 目的地', back:'回程：目的地 → 住宅', restLabel:'預留一次休息', restHelp:'加入慢行總時間', minutes:'分鐘', totalLabel:'原行程：慢行 + 一次休息', share:'複製這條路線連結', researchNote:'作業研究原型 · 地圖估算\n入口與座椅位置待實勘。', routePreview:'原本整條路線 · 時間參考', baseline:'基準步速', slow:'慢行', slower:'較慢步速', speed60:'60 米／分鐘', speed40:'40 米／分鐘', speed30:'30 米／分鐘', mapControls:'地圖視角', zoomIn:'放大地圖', zoomOut:'縮小地圖', fitRoute:'看路線', fitEstate:'全邨', north:'北 ↑', startPoint:'路網起點', endPoint:'路網終點', beforeWalk:'出發之前', contextTitle:'時間是參考，現場感受更重要。', limitation:'這些時間按假設步速計算，未包含樓內出門、街市樓層、升降機及過路等候、個人上落斜影響或臨時封路。公園與休憩處是候選歇腳空間，尚未確認每張座椅及遮蔭。', methodTitle:'查看計算方法與資料來源', methodBody:'資料日期：2026-11-11。18 幢住宅樓、8 個目的地，去回程分開查詢，共 288 項。180 項在官方無障礙模式下有解，108 項以一般步行補算。兩項定位幾乎重合，暫不顯示時間；286 項可供初步比較。', formula:'時間＝路網距離 ÷ 假設步速，向上取整分鐘；休息另加。60、40、30 米／分鐘是設計比較假設，不是居民實測值或所有長者的統一標準。', snapping:'樓宇及設施外框中心是定位參考，系統會連接至鄰近行人路網；未核實實際入口。定位偏移未加進路程。少於 10 米且偏移超過 20 米的組合暫停報時。兩個門檻只是此次分析的檢查規則。', modeExplanation:'先查無障礙模式，無解時再查一般最短步行路線。「有解」不代表現場通道目前可用；「無解」也不代表現場一定不能通行。', sourceRoute:'地政總署 3D 行人路線', sourceOsm:'OpenStreetMap 地圖與位置資料（ODbL）', sourceBus:'城巴華富北站點 002338', sourceOrigin:'所選住宅樓位置來源', sourceDestination:'所選目的地位置來源', footer:'華富歇腳線 · Assignment 02 研究原型 · v4', snapshot:'資料快照：2026-11-11', min:'分', metre:'米', start:'起點', end:'終點', overlap:'起／終點重合', solid:'實線：無障礙模式', dashed:'虛線：一般步行補算', barrierFree:'官方無障礙模式有解；現場通行狀態仍需確認。', fallback:'無障礙模式無解，改用一般步行補算；可能包含樓梯。', withheld:'起終點吸附後幾乎重合，暫不報分鐘；須核實入口後重算。', noEstimate:'須重新定位', invalidRest:'請輸入 0 至 60 的整數分鐘。', restInvalidShort:'請先修正休息時間。', copied:'已複製，可傳給老師或朋友。', copyFailed:'請複製瀏覽器網址分享這條路線。', title:'華富歇腳線 | Wah Fu Rest Route', mapTitle:'華富步行路線地圖', loading:'正在載入地圖…'
    },
    en: {
      skip:'Skip to route planner', brand:'Wah Fu Rest Route', eyebrow:'WAH FU I · WAH FU II', hero:'Find a walking pace that feels right.', intro:'Take a rest, keep going, or head home. Choose what feels right at each stage.', plannerAria:'Walking route planner', choose:'Choose your route', origin:'Residential block', destination:'Destination', direction:'Direction', out:'Outbound: home → destination', back:'Return: destination → home', restLabel:'Allow one rest', restHelp:'Added to the slow-walk total', minutes:'min', totalLabel:'Original route: slow walk + one rest', share:'Copy this route link', researchNote:'Assignment research prototype · Map estimate\nEntrances and seats need a site check.', routePreview:'ORIGINAL FULL ROUTE · TIME REFERENCE', baseline:'Baseline pace', slow:'Slow walk', slower:'Slower pace', speed60:'60 metres / min', speed40:'40 metres / min', speed30:'30 metres / min', mapControls:'Map view controls', zoomIn:'Zoom in', zoomOut:'Zoom out', fitRoute:'Route', fitEstate:'Estate', north:'N ↑', startPoint:'Network start', endPoint:'Network end', beforeWalk:'BEFORE YOU GO', contextTitle:'A time estimate is only a starting point.', limitation:'Times use assumed walking speeds. They exclude travel inside residential buildings, market floors, lift and crossing waits, individual responses to slopes, and temporary closures. Parks and sitting-out areas are candidate rest spaces; individual seats and shade have not been verified.', methodTitle:'Calculation method and data sources', methodBody:'Data snapshot: 11 November 2026. 18 blocks × 8 destinations × both directions = 288 journeys. The official barrier-free mode returned 180 routes; 108 used a general walking fallback. Two journeys have nearly coincident network locations and no time is shown. 286 estimates are available for initial comparison.', formula:'Time = network distance ÷ assumed speed, rounded up to a whole minute; rest is added separately. Speeds of 60, 40 and 30 metres per minute are design scenarios, not resident measurements or a standard for all older adults.', snapping:'Building and facility bounding-box centres are reference locations, snapped to the nearby pedestrian network. Actual entrances are unverified. Snapping offsets are excluded from route distance. Times are withheld when the route is under 10 metres and an offset exceeds 20 metres. These thresholds are checks for this analysis only.', modeExplanation:'Barrier-free mode is queried first, with the shortest general walking route used when no solution is found. A successful query does not confirm current on-site access. A failed query does not prove a route is physically impassable.', sourceRoute:'Lands Department 3D pedestrian routes', sourceOsm:'OpenStreetMap geometry and locations (ODbL)', sourceBus:'Citybus Wah Fu (North), stop 002338', sourceOrigin:'Selected block location source', sourceDestination:'Selected destination location source', footer:'Wah Fu Rest Route · Assignment 02 research prototype · v4', snapshot:'Data snapshot: 11 Nov 2026', min:'min', metre:'m', start:'Start', end:'End', overlap:'Start / end overlap', solid:'Solid: barrier-free mode', dashed:'Dashed: general walking fallback', barrierFree:'Route found in official barrier-free mode; current on-site access still needs checking.', fallback:'No barrier-free solution found. General walking fallback shown; it may include stairs.', withheld:'Network locations nearly coincide. No time estimate is shown; check the entrance and recalculate.', noEstimate:'Location check needed', invalidRest:'Enter a whole number from 0 to 60 minutes.', restInvalidShort:'Check the rest duration first.', copied:'Link copied. Share it with your tutor or a friend.', copyFailed:'Copy the browser address to share this route.', title:'Wah Fu Rest Route | Walking at your own pace', mapTitle:'Wah Fu walking route map', loading:'Loading the map…'
    }
  };
  messages.zh.brandSub='Wah Fu Rest Route';
  messages.zh.goJourney='下一步：選擇位置';
  messages.en.goJourney='Next: choose your position';
  messages.en.brandSub='A neighbourhood walking study';
  let preferenceStorage=null;
  try {preferenceStorage=localStorage;} catch (_) {}
  const savedProfile=window.WahFuPreferences.read(preferenceStorage,data.origins.map(p=>p.id));
  let storedLanguage;
  try { storedLanguage = localStorage.getItem('wahfu-language'); } catch (_) { /* Storage is optional. */ }
  const params = new URLSearchParams(location.search);
  const state = {
    lang: ['zh','en'].includes(params.get('lang')) ? params.get('lang') : savedProfile?.lang || (storedLanguage === 'en' ? 'en' : 'zh'),
    origin: data.origins.some(p=>p.id===params.get('origin')) ? params.get('origin') : savedProfile?.home || 'H13',
    destination: data.destinations.some(p=>p.id===params.get('destination')) ? params.get('destination') : 'R3',
    direction: params.get('direction') === 'back' ? 'back' : 'out',
    rest: params.has('rest') && /^\d+$/.test(params.get('rest')) && +params.get('rest')<=60 ? +params.get('rest') : 2,
    view: 'estate',
    large: savedProfile?.large || false
  };
  const routes = new Map(data.routes.map(r=>[r.id,r]));
  const t = key => messages[state.lang][key];
  const selectedRoute = () => routes.get(`${state.origin}_${state.destination}_${state.direction}`);
  const number = value => new Intl.NumberFormat(state.lang==='zh'?'zh-HK':'en-GB').format(value);
  const minuteText = value => `${value} ${t('min')}`;
  const svg = d3.select('#route-map');
  let zoom, currentProjection, mapViewKey='';
  let shareReset;
  let journey, accessibility, detailedMap;

  function syncUrl() {
    try {
      const url=new URL(location.href);
      for(const key of ['lang','origin','destination','direction','rest']) url.searchParams.set(key,state[key]);
      history.replaceState(null,'',url);
    } catch (_) { /* File previews may not permit history updates. */ }
  }
  function options(select,points,includeEstate=false) {
    select.replaceChildren(...points.map(p=>new Option(p.name[state.lang]+(includeEstate?' · '+p.estate[state.lang]:''),p.id)));
  }
  function translate() {
    document.documentElement.lang=state.lang==='zh'?'zh-Hant':'en';
    document.title=t('title');
    document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t);});
    document.querySelectorAll('[data-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.aria));});
    document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===state.lang)));
    options($('origin'),data.origins,true); options($('destination'),data.destinations);
    $('origin').value=state.origin; $('destination').value=state.destination; $('direction').value=state.direction;
    $('rest').value=state.rest;
    $('share-message').textContent='';
    update();
  }
  function validRest() {
    const raw=$('rest').value;
    return raw.trim()!=='' && Number.isInteger(Number(raw)) && Number(raw)>=0 && Number(raw)<=60;
  }
  function updateTotals(route) {
    const valid=validRest();
    $('rest-error').hidden=valid; $('rest-error').textContent=valid?'':t('invalidRest');
    $('rest').setAttribute('aria-invalid',String(!valid));
    if(route.valid && valid) {
      const walk=Math.ceil(route.metres/40);
      $('total-time').textContent=Math.ceil(route.metres/40+Number($('rest').value));
      $('total-breakdown').textContent=state.lang==='zh'?`慢行約 ${walk} 分 + 休息 ${$('rest').value} 分`:`Approx. ${walk} min walking + ${$('rest').value} min rest`;
    } else {
      $('total-time').textContent='—';
      $('total-breakdown').textContent=route.valid?t('restInvalidShort'):t('noEstimate');
    }
  }
  function update() {
    const route=selectedRoute(),origin=data.origins.find(p=>p.id===state.origin),destination=data.destinations.find(p=>p.id===state.destination);
    const names=state.direction==='out'?[origin,destination]:[destination,origin];
    $('route-name').textContent=names.map(p=>p.name[state.lang]).join(' → ');
    $('distance').textContent=route.valid?`${number(Math.round(route.metres))} ${t('metre')}`:'—';
    for(const [id,speed]of [['time-base',60],['time-slow',40],['time-slower',30]]) $(id).textContent=route.valid?minuteText(Math.ceil(route.metres/speed)):'—';
    $('route-status').textContent=t(!route.valid?'withheld':route.barrierFree?'barrierFree':'fallback');
    $('route-status').className='route-status'+(!route.valid?' withheld':!route.barrierFree?' fallback':'');
    $('route-legend').textContent=t(route.barrierFree?'solid':'dashed');
    $('snap-detail').textContent=state.lang==='zh'?`所選路線定位偏移：起點 ${route.startSnap.toFixed(1)} 米，終點 ${route.endSnap.toFixed(1)} 米。`:`Selected route snapping offsets: start ${route.startSnap.toFixed(1)} m; end ${route.endSnap.toFixed(1)} m.`;
    $('origin-source').href=origin.source; $('destination-source').href=destination.source;
    updateTotals(route); journey?.render(); detailedMap?.renderControls(); drawMap(); syncUrl(); accessibility?.changed();
  }
  function drawScale(k=1) {
    svg.select('.map-scale').remove();
    const w=$('route-map').clientWidth,h=$('route-map').clientHeight;
    const a=currentProjection([114.135,22.252]),b=currentProjection([114.135+100/(111320*Math.cos(22.252*Math.PI/180)),22.252]);
    let metres=100,px=Math.abs(b[0]-a[0])*k;
    while(px>w*.25) {px/=2;metres/=2;}
    const g=svg.append('g').attr('class','map-scale').attr('aria-hidden','true');
    g.append('line').attr('x1',14).attr('x2',14+px).attr('y1',h-16).attr('y2',h-16).attr('stroke','#536176').attr('stroke-width',2);
    g.append('text').attr('x',14).attr('y',h-23).attr('class','scale-label').text(`${number(metres)} ${t('metre')}`);
  }
  function drawMap() {
    const overlay=journey?.overlay(), route=overlay?.route||selectedRoute(),w=$('route-map').clientWidth,h=$('route-map').clientHeight;
    if(!w||!h)return;
    const coords=route.paths.flat();
    const extent=state.view==='route'&&route.valid?[...coords,...(overlay?.position?[overlay.position.coords]:[])]:[[114.1336,22.2487],[114.141567,22.2547],...coords];
    const nextViewKey=JSON.stringify([route.id,route.metres,extent,state.view,w,h]);
    const retainedTransform=mapViewKey===nextViewKey?d3.zoomTransform(svg.node()):d3.zoomIdentity;
    mapViewKey=nextViewKey;
    currentProjection=d3.geoMercator().fitExtent([[35,70],[w-35,h-60]],{type:'MultiPoint',coordinates:extent});
    const path=d3.geoPath(currentProjection);
    svg.attr('viewBox',`0 0 ${w} ${h}`);
    svg.selectAll('g').remove();
    const layer=svg.append('g').attr('class','map-layer');
    if(detailedMap)detailedMap.drawBase(layer,currentProjection);
    else layer.append('g').attr('aria-hidden','true').selectAll('path').data(data.base).join('path').attr('d',b=>path({type:'LineString',coordinates:b.points})).attr('class',b=>b.type==='building'?'map-building':'map-foot');
    const start=currentProjection(coords[0]),end=currentProjection(coords.at(-1));
    layer.append('path').attr('class','route-line').attr('data-route',route.id).attr('d',path({type:'MultiLineString',coordinates:route.paths})).attr('stroke-dasharray',route.barrierFree?null:'8 6').attr('opacity',overlay?.stage ? 0.3 : 1);
    if(overlay?.stage)layer.append('path').attr('class','stage-line').attr('d',path({type:'MultiLineString',coordinates:overlay.stage.paths})).attr('stroke-dasharray',route.barrierFree?null:'8 6');
    layer.append('circle').attr('class','route-start-marker').attr('cx',start[0]).attr('cy',start[1]).attr('r',6).attr('fill','#285ac2').attr('stroke','#fff').attr('stroke-width',2);
    layer.append('rect').attr('class','route-end-marker').attr('x',end[0]-6).attr('y',end[1]-6).attr('width',12).attr('height',12).attr('fill','#285ac2').attr('stroke','#fff').attr('stroke-width',2);
    const near=Math.hypot(start[0]-end[0],start[1]-end[1])<28;
    for(const [point,label]of near?[[start,t('overlap')]]:[[start,t('start')],[end,t('end')]]) {
      const left=point[0]>w-100;
      layer.append('text').datum({point,dx:left?-10:10,dy:-11}).attr('x',point[0]+(left?-10:10)).attr('y',point[1]-11).attr('text-anchor',left?'end':'start').attr('class','map-label').text(label);
    }
    if(overlay?.position){
      const p=currentProjection(overlay.position.coords);
      layer.append('circle').attr('class','position-marker').attr('cx',p[0]).attr('cy',p[1]).attr('r',9).attr('fill','#087c70').attr('stroke','#fff').attr('stroke-width',3);
      layer.append('text').datum({point:p,dx:12,dy:22}).attr('x',p[0]+12).attr('y',p[1]+22).attr('class','map-label').text(state.lang==='zh'?'示範位置':'Demo position');
    }
    $('route-legend').textContent=t(route.barrierFree?'solid':'dashed');
    $('map-title').textContent=t('mapTitle');
    $('map-description').textContent=overlay?.route?(state.lang==='zh'?'目前行程前往 ':'Current journey to ')+overlay.goal.name[state.lang]+'. '+Math.round(route.metres)+' '+t('metre')+'. '+t(route.barrierFree?'barrierFree':'fallback'):$('route-name').textContent+'. '+$('distance').textContent+'. '+$('route-status').textContent;
    zoom=d3.zoom().scaleExtent([.8,8]).extent([[0,0],[w,h]]).on('zoom',event=>{layer.attr('transform',event.transform);const k=event.transform.k;
      layer.select('.route-start-marker').attr('r',6/k);layer.select('.route-end-marker').attr('x',end[0]-6/k).attr('y',end[1]-6/k).attr('width',12/k).attr('height',12/k);layer.select('.position-marker').attr('r',9/k);
      layer.selectAll('text.map-label').style('font-size',14/k+'px').attr('x',d=>d.point[0]+d.dx/k).attr('y',d=>d.point[1]+d.dy/k);
      drawScale(k);detailedMap?.drawLabels({projection:currentProjection,transform:event.transform,w,h,svg,routeEnds:[coords[0],coords.at(-1),...(overlay?.position?[overlay.position.coords]:[])]});});
    svg.call(zoom).call(zoom.transform,retainedTransform);
  }
  for(const key of ['origin','destination','direction']) $(key).addEventListener('change',event=>{
    state[key]=event.target.value; journey?.reset(); $('share-message').textContent=''; update();
  });
  $('rest').addEventListener('input',()=>{
    if(validRest()){state.rest=Number($('rest').value);syncUrl();}
    updateTotals(selectedRoute()); journey?.render(); accessibility?.changed();
  });
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
    state.lang=button.dataset.lang;
    try {localStorage.setItem('wahfu-language',state.lang);} catch (_) { /* Language still works without storage. */ }
    translate();
  }));
  $('fit-route').addEventListener('click',()=>{state.view='route';mapViewKey='';drawMap();});
  $('fit-estate').addEventListener('click',()=>{state.view='estate';mapViewKey='';drawMap();});
  $('zoom-in').addEventListener('click',()=>svg.call(zoom.scaleBy,1.4));
  $('zoom-out').addEventListener('click',()=>svg.call(zoom.scaleBy,1/1.4));
  $('share').addEventListener('click',async()=>{
    syncUrl();let copied=false;
    try {await navigator.clipboard.writeText(location.href);copied=true;} catch (_) {
      const input=document.createElement('textarea');input.value=location.href;input.setAttribute('readonly','');input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();
      try {copied=document.execCommand('copy');} catch (_) { /* Show the manual browser-address fallback. */ }
      input.remove();
    }
    $('share-message').textContent=t(copied?'copied':'copyFailed');
    clearTimeout(shareReset);shareReset=setTimeout(()=>{$('share-message').textContent='';},7000);
  });
  detailedMap=window.createWahFuMapDetails({context:()=>state,onChange:()=>detailedMap?.redraw(),focusPoint:(point,cluster)=>{
    const w=$('route-map').clientWidth,h=$('route-map').clientHeight,p=currentProjection(point),current=d3.zoomTransform(svg.node());
    const k=cluster?Math.min(8,current.k*1.8):Math.max(2.4,current.k);
    svg.call(zoom.transform,d3.zoomIdentity.translate(w/2-p[0]*k,h/2-p[1]*k).scale(k));
  }});
  if(!detailedMap){$('map-detail-controls').hidden=true;$('load-error').hidden=false;$('load-error').textContent='詳細地圖未能載入，暫用原有底圖。Detailed map unavailable; showing the earlier basemap.';}
  journey=window.createWahFuJourney({context:()=>({...state,route:selectedRoute(),origin:data.origins.find(p=>p.id===state.origin),destination:data.destinations.find(p=>p.id===state.destination)}),onChange:()=>{drawMap();accessibility?.changed();}});
  accessibility=window.createWahFuAccessibility({
    context:()=>state,initialProfile:savedProfile,storage:preferenceStorage,origins:data.origins,
    apply:values=>{
      if(values.origin&&values.origin!==state.origin)journey.reset();
      Object.assign(state,values);
      try {localStorage.setItem('wahfu-language',state.lang);} catch (_) {}
      translate();
    },
    describe:()=>{
      const origin=data.origins.find(p=>p.id===state.origin),destination=data.destinations.find(p=>p.id===state.destination);
      const points=state.direction==='out'?[origin,destination]:[destination,origin];
      return (state.lang==='zh'?'原本行程：'+points[0].name.zh+'，前往'+points[1].name.zh+'。':'Original journey: '+points[0].name.en+' to '+points[1].name.en+'. ')+journey.describe();
    }
  });
  $('go-journey').addEventListener('click',()=>{
    if(matchMedia('(max-width: 740px)').matches)$('route-settings').open=false;
    const target=$('demo-position')?$('journey-flow'):$('journey-flow').querySelector('[data-flow-title]');
    target.scrollIntoView({block:'start',behavior:'auto'});
    ($('demo-position')||$('journey-flow').querySelector('[data-flow-title]'))?.focus({preventScroll:true});
  });
  new ResizeObserver(()=>{document.body.style.setProperty('--header-offset',Math.ceil(document.querySelector('.site-header').getBoundingClientRect().height)+20+'px');}).observe(document.querySelector('.site-header'));
  new ResizeObserver(()=>drawMap()).observe($('route-map'));
  translate();
})();
