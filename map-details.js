/* OSM display landmarks are independent of walking-route inputs and times. */
window.createWahFuMapDetails = function({context,focusPoint,onChange}) {
  const map=window.WAHFU_MAP,$=id=>document.getElementById(id);
  if(!map)return null;
  const texts={
    zh:{category:'顯示哪類標記？',all:'全部地標',useful:'常用設施',landmarks:'住宅及公共地標',transport:'巴士及交通',shops:'商店及飲食',stairs:'樓梯',find:'尋找地標，放大查看',choose:'選擇一個地標…',labels:'顯示名稱',note:'OpenStreetMap 詳細底圖 · 標記位置及設施狀況待實地確認。',hint:'先顯示主要地標，放大可見更多設施。數字代表鄰近標記；也可用選單尋找。',source:'查看 OpenStreetMap 原始標記',close:'關閉地標資料',unverified:'這是地圖位置參考，並非已核實入口；開放及通行狀態仍需現場確認。',shelterNote:'原始資料標示有蓋設施，未證實有座椅或空位。',liftNote:'原始資料標示升降機，未核實是否運作及能否使用。',stepsNote:'這裡有樓梯標記，不代表目前所選路線一定會經過。',wheelchair:'OSM 輪椅通行標記',access:'OSM 出入限制標記',level:'OSM 樓層標記',yes:'是',no:'否',limited:'有限制',private:'私人',permissive:'獲准進入',customers:'顧客專用',building:'住宅／建築',park:'公園／休憩處',bus:'巴士站',shop:'商店／飲食',community:'公共設施',lift:'升降機',toilet:'廁所',water:'飲水點',shelter:'有蓋設施',bench:'座椅標記',steps:'樓梯',count:'個地標',layerTitle:'詳細地圖標記',originalName:'原始名稱'},
    en:{category:'Which markers would you like?',all:'All landmarks',useful:'Useful facilities',landmarks:'Homes and public landmarks',transport:'Bus and transport',shops:'Shops and food',stairs:'Steps',find:'Find a landmark and zoom in',choose:'Choose a landmark…',labels:'Show names',note:'Detailed OpenStreetMap basemap · Locations and facility conditions need an on-site check.',hint:'Main landmarks appear first; zoom in for more facilities. Numbers group nearby markers. You can also use the list above.',source:'View the original OpenStreetMap feature',close:'Close landmark details',unverified:'This is a map reference, not a verified entrance. Opening and access conditions still need an on-site check.',shelterNote:'The source marks a shelter; seats and available space have not been confirmed.',liftNote:'The source marks a lift; its operation and access have not been checked.',stepsNote:'Steps are marked here. This does not mean the selected route necessarily uses them.',wheelchair:'OSM wheelchair tag',access:'OSM access tag',level:'OSM level tag',yes:'Yes',no:'No',limited:'Limited',private:'Private',permissive:'Permissive',customers:'Customers only',building:'Home / building',park:'Park / rest space',bus:'Bus stop',shop:'Shop / food',community:'Public facility',lift:'Lift',toilet:'Toilets',water:'Drinking water',shelter:'Shelter',bench:'Bench marker',steps:'Steps',count:'landmarks',layerTitle:'Detailed map landmarks',originalName:'Name in source'}
  };
  const group={all:()=>true,useful:p=>['lift','toilet','water','shelter','bench'].includes(p.category),landmarks:p=>['building','park','community'].includes(p.category),transport:p=>p.category==='bus',shops:p=>p.category==='shop',stairs:p=>p.category==='steps'};
  const priority={building:90,lift:85,toilet:84,water:83,park:80,community:65,shelter:55,bus:45,shop:40,steps:30};
  const colors={building:'#425f83',lift:'#087c70',toilet:'#71428e',water:'#166e9c',park:'#427c42',community:'#526297',shelter:'#318261',bus:'#285fac',shop:'#965b2f',steps:'#a45c14',bench:'#318261'};
  let category='all',selected=null,showNames=true,lastRender=null;
  const t=k=>texts[context().lang][k]||k;
  const label=p=>p.name[context().lang]||`${t(p.category)} ${String(p.ordinal).padStart(2,'0')}`;
  const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible=()=>map.places.filter(group[category]);
  function renderControls(){
    $('map-detail-controls').setAttribute('aria-label',t('layerTitle'));
    $('map-category-label').textContent=t('category');$('map-place-label').textContent=t('find');$('map-labels-text').textContent=t('labels');
    $('map-data-note').textContent=t('note');$('map-detail-hint').textContent=t('hint');
    $('map-category').replaceChildren(...Object.keys(group).map(k=>new Option(t(k),k)));$('map-category').value=category;
    const points=visible().sort((a,b)=>(priority[b.category]-priority[a.category])||label(a).localeCompare(label(b),context().lang==='zh'?'zh-HK':'en'));
    $('map-place').replaceChildren(new Option(t('choose'),''),...points.map(p=>new Option(`${label(p)} · ${t(p.category)}`,p.id)));
    $('map-place').value=selected||'';$('map-labels').checked=showNames;
    $('map-marker-count').textContent=`${points.length} ${t('count')}`;
    renderCard();
  }
  function renderCard(){
    const p=map.places.find(p=>p.id===selected),card=$('map-place-card');
    card.hidden=!p;if(!p)return;
    const details=['wheelchair','access','level'].filter(k=>p.tags[k]).map(k=>`<div><dt>${escaped(t(k))}</dt><dd>${escaped(texts[context().lang][p.tags[k]]||p.tags[k])}</dd></div>`).join('');
    card.innerHTML=`<div class="map-card-title"><div><p>${escaped(t(p.category))}</p><h3>${escaped(label(p))}</h3></div><button type="button" id="map-card-close" aria-label="${escaped(t('close'))}">×</button></div><p>${escaped(t(p.category==='shelter'?'shelterNote':p.category==='lift'?'liftNote':p.category==='steps'?'stepsNote':'unverified'))}</p>${context().lang==='en'&&!p.name.en&&p.name.zh?`<p>${escaped(t('originalName'))}: ${escaped(p.name.zh)}</p>`:''}${details?'<dl>'+details+'</dl>':''}<a href="${escaped(p.source)}" target="_blank" rel="noopener">${escaped(t('source'))}</a>`;
    $('map-card-close').addEventListener('click',()=>{selected=null;renderControls();onChange();$('map-place').focus();});
  }
  function select(p){selected=p.id;renderControls();focusPoint(p.point,false);}
  $('map-category').addEventListener('change',event=>{category=event.target.value;selected=null;renderControls();onChange();$('map-category').focus();});
  $('map-place').addEventListener('change',event=>{const p=map.places.find(p=>p.id===event.target.value);if(p)select(p);else{selected=null;renderCard();onChange();}});
  $('map-labels').addEventListener('change',event=>{showNames=event.target.checked;onChange();});
  function drawBase(layer,projection){
    const line=d3.line().x(p=>projection(p)[0]).y(p=>projection(p)[1]);
    const rank={green:0,water:1,construction:2,parking:3,building:4,road:5,footway:6,edge:7,steps:8};
    layer.append('g').attr('class','imported-basemap').attr('aria-hidden','true').selectAll('path').data([...map.features].sort((a,b)=>rank[a.kind]-rank[b.kind])).join('path')
      .attr('data-osm',p=>p.id).attr('class',p=>`osm-${p.kind}${p.area?' osm-area':''}`).attr('fill-rule','evenodd')
      .attr('d',p=>p.paths.map(points=>line(points)+(p.area?'Z':'')).join(''));
  }
  function drawLabels({projection,transform,w,h,svg,routeEnds=[]}){
    lastRender={projection,transform,w,h,svg,routeEnds};
    svg.selectAll('.map-detail-overlay').remove();
    const overlay=svg.append('g').attr('class','map-detail-overlay').attr('aria-hidden','true');
    const screen=p=>transform.apply(projection(p));
    const candidates=visible().filter(p=>category!=='all'||p.id===selected||['building','park','community'].includes(p.category)||(transform.k>=1.35&&['lift','toilet','water'].includes(p.category))||transform.k>=1.8).map(p=>({p,xy:screen(p.point)})).filter(v=>v.xy[0]>12&&v.xy[0]<w-12&&v.xy[1]>68&&v.xy[1]<h-50).sort((a,b)=>(b.p.id===selected?1000:priority[b.p.category])-(a.p.id===selected?1000:priority[a.p.category]));
    const clusters=[];
    for(const item of candidates){
      const cluster=clusters.find(c=>c.items[0].p.id!==selected&&item.p.id!==selected&&Math.hypot(c.xy[0]-item.xy[0],c.xy[1]-item.xy[1])<27);
      if(cluster)cluster.items.push(item);else clusters.push({xy:item.xy,items:[item]});
    }
    const occupied=routeEnds.map(p=>{const [x,y]=screen(p);return[x-12,y-30,x+90,y+20];});
    const intersects=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
    for(const c of clusters){
      const [x,y]=c.xy,p=c.items[0].p,many=c.items.length>1;
      const g=overlay.append('g').attr('class','poi-marker'+(p.id===selected?' selected-poi':'')).attr('data-place',many?null:p.id).attr('data-cluster',many?c.items.length:null).attr('transform',`translate(${x},${y})`).style('cursor','pointer');
      g.append('circle').attr('r',p.id===selected?14:12).attr('fill',many?'#f6f8fb':colors[p.category]).attr('stroke',many?'#536b86':'#fff').attr('stroke-width',p.id===selected?3:2);
      const glyph=many?String(c.items.length):({building:'⌂',lift:'↕',toilet:'WC',water:'◊',park:'♧',community:'◇',shelter:'⌃',bus:'B',shop:'S',steps:'≋',bench:'='}[p.category]);
      g.append('text').attr('text-anchor','middle').attr('dy','.36em').attr('fill',many?'#304760':'#fff').attr('font-size',p.category==='toilet'&&!many?9:13).attr('font-weight',700).text(glyph);
      g.append('title').text(many?c.items.map(x=>label(x.p)).join(' / '):label(p));
      g.on('click',event=>{event.stopPropagation();if(many)focusPoint(p.point,true);else select(p);});
      occupied.push([x-14,y-14,x+14,y+14]);
    }
    if(!showNames)return;
    const labels=overlay.append('g').attr('class','map-poi-labels').style('pointer-events','none');
    let count=0;
    for(const c of clusters){
      const {p}=c.items[0],[x,y]=c.xy;
      if(c.items.length>1&&!(p.name[context().lang]&&(['building','park'].includes(p.category)||category!=='all')))continue;
      if(!p.name[context().lang]&&transform.k<1.4&&!['lift','toilet','water'].includes(p.category)&&p.id!==selected)continue;
      if(count>(w<450?12:25)&&transform.k<1.6&&p.id!==selected)continue;
      const raw=label(p),limit=context().lang==='zh'?12:27,text=raw.length>limit?raw.slice(0,limit-1)+'…':raw;
      const labelScale=context().large?15/13:1;
      const width=[...text].reduce((n,c)=>n+(/[\u3400-\u9fff]/.test(c)?13:7),0)*labelScale,left=x+18+width>w-10;
      const box=left?[x-18-width,y-11,x-16,y+7]:[x+16,y-11,x+18+width,y+7];
      if(box[0]<8||box[2]>w-8||occupied.some(b=>intersects(box,b)))continue;
      occupied.push(box);count++;
      labels.append('text').attr('x',left?x-18:x+18).attr('y',y+4).attr('text-anchor',left?'end':'start').attr('class','detail-place-label').text(text);
    }
    const used=new Set();
    for(const f of map.features.filter(f=>f.kind==='road'&&f.name[context().lang])){
      const name=f.name[context().lang];if(used.has(name))continue;
      const points=f.paths.flat(),[x,y]=screen(points[Math.floor(points.length/2)]),width=Math.min(200,name.length*(context().lang==='zh'?13:7)),box=[x-width/2,y-10,x+width/2,y+10];
      if(x<width/2+10||x>w-width/2-10||y<80||y>h-50||occupied.some(b=>intersects(box,b)))continue;
      used.add(name);occupied.push(box);labels.append('text').attr('class','detail-road-label').attr('text-anchor','middle').attr('x',x).attr('y',y).text(name);
    }
  }
  renderControls();return{renderControls,drawBase,drawLabels,redraw:()=>{if(lastRender)drawLabels(lastRender);}};
};
