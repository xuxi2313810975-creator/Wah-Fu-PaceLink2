/* Explicit, user-initiated speech and a clearly labelled device-only sign-in demo. */
window.createWahFuAccessibility = function({context,apply,describe,initialProfile,storage,origins}) {
  const $=id=>document.getElementById(id),store=window.WahFuPreferences,ids=origins.map(p=>p.id);
  const words={
    zh:{read:'朗讀',stop:'停止',size:'大字',signIn:'登入',demo:'示範',profile:'我的設定',device:'此裝置',title:'登入示範',description:'不用帳戶或密碼。常用住宅、語言和文字大小只會保存在這個瀏覽器，不會跨裝置同步。',home:'常用住宅',language:'使用語言',large:'使用較大的文字',save:'儲存並使用',guest:'先繼續使用',close:'關閉設定',forget:'清除此裝置的示範設定',saved:'已儲存這部裝置的偏好設定。',notSaved:'這個瀏覽器無法儲存設定。你仍可繼續使用，但下次開啟不會記住。',forgotten:'已清除示範設定。仍可繼續使用所有路線功能。',forgetError:'未能清除，請在瀏覽器設定內清除這個網站的儲存資料。',unsupported:'這個瀏覽器未支援朗讀。畫面文字仍可正常使用。',speechError:'未能播放語音。請檢查裝置音量或語音設定，再試一次。',changed:'內容已更新。按「朗讀」聽目前這一步。',stopped:'朗讀已停止。',finished:'朗讀完畢。',playing:'正在朗讀目前這一步。再按一次即可停止。',cantonese:'使用裝置的廣東話語音。',chinese:'使用裝置的中文語音；未找到廣東話聲線。',defaultVoice:'聲線由這部裝置提供。',english:'使用裝置的英文語音。'},
    en:{read:'Read aloud',stop:'Stop',size:'Larger text',signIn:'Sign in',demo:'Demo',profile:'My settings',device:'This device',title:'Sign-in demo',description:'No account or password is needed. Your usual home, language and text size are saved only in this browser, with no sync between devices.',home:'Usual home',language:'Language',large:'Use larger text',save:'Save and use these settings',guest:'Continue without changes',close:'Close settings',forget:'Clear demo settings on this device',saved:'Preferences saved on this device.',notSaved:'This browser could not save your settings. You can keep using the site, but they will not be remembered next time.',forgotten:'Demo settings cleared. All route features are still available.',forgetError:'Could not clear settings. Please clear this site’s stored data in your browser settings.',unsupported:'This browser does not support read-aloud. All on-screen text is still available.',speechError:'Audio could not play. Check your device volume or voice settings, then try again.',changed:'The content has changed. Press Read aloud for the current step.',stopped:'Read-aloud stopped.',finished:'Read-aloud finished.',playing:'Reading the current step. Press again to stop.',cantonese:'Using a Cantonese voice on this device.',chinese:'Using a Chinese voice; no Cantonese voice was found.',defaultVoice:'The voice is provided by this device.',english:'Using an English voice on this device.'}
  };
  let profile=initialProfile,playing=false,generation=0,utterance=null,spokenText='',messageKey='',voiceKey='';
  const supported=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance),synth=window.speechSynthesis;
  const t=k=>words[context().lang][k];
  function status(key){messageKey=key;renderStatus();}
  function renderStatus(){$('speech-status').hidden=!messageKey;$('speech-status').textContent=messageKey?t(messageKey)+(playing&&voiceKey?' '+t(voiceKey):''):'';}
  function render(){
    $('voice-label').textContent=t(playing?'stop':'read');$('voice-toggle').setAttribute('aria-pressed',String(playing));
    $('voice-toggle').setAttribute('aria-label',t(playing?'stop':'read'));
    document.querySelector('.voice-play-icon').hidden=playing;document.querySelector('.voice-stop-icon').hidden=!playing;
    $('text-size-label').textContent=t('size');$('text-size-toggle').setAttribute('aria-pressed',String(context().large));
    $('profile-label').textContent=t(profile?'profile':'signIn');$('profile-kind').textContent=t(profile?'device':'demo');
    $('profile-open').setAttribute('aria-label',t(profile?'profile':'signIn')+' · '+t('demo'));
    $('profile-open').classList.toggle('has-profile',!!profile);
    document.body.classList.toggle('large-text',!!context().large);renderStatus();
  }
  function stop(key=''){
    generation++;playing=false;utterance=null;
    if(supported)synth.cancel();
    status(key);render();
  }
  function chooseVoice(){
    const voices=synth.getVoices(),lang=context().lang;
    if(lang==='en')return{voice:voices.find(v=>/^en-GB$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang)),lang:'en-GB',key:voices.some(v=>/^en/i.test(v.lang))?'english':'defaultVoice'};
    const cantonese=voices.find(v=>/^yue|^zh[-_]HK$/i.test(v.lang));
    const chinese=cantonese||voices.find(v=>/^zh/i.test(v.lang));
    return{voice:chinese,lang:cantonese?.lang||chinese?.lang||'zh-HK',key:cantonese?'cantonese':chinese?'chinese':'defaultVoice'};
  }
  function speak(){
    if(playing){stop('stopped');return;}
    if(!supported){status('unsupported');return;}
    stop();const selected=chooseVoice(),token=generation;
    spokenText=describe();
    // Short utterances reduce long-speech interruptions on some browser engines.
    const sentences=spokenText.match(/[^。！？.!?]+[。！？.!?]?/g)||[spokenText];
    const chunks=[];for(const sentence of sentences){for(let i=0;i<sentence.length;i+=160)chunks.push(sentence.slice(i,i+160));}
    playing=true;voiceKey=selected.key;status('playing');render();
    function next(){
      if(token!==generation)return;
      const text=chunks.shift();
      if(!text){playing=false;utterance=null;status('finished');render();return;}
      utterance=new SpeechSynthesisUtterance(text);utterance.lang=selected.lang;utterance.rate=.85;utterance.pitch=1;utterance.volume=1;
      if(selected.voice)utterance.voice=selected.voice;
      utterance.onend=()=>{if(token===generation)next();};
      utterance.onerror=event=>{if(token!==generation)return;if(['canceled','interrupted'].includes(event.error)){stop('stopped');return;}stop('speechError');};
      try{synth.speak(utterance);}catch{stop('speechError');}
    }
    next();
  }
  function changed(){
    if(playing&&spokenText!==describe())stop('changed');
    if(profile&&(profile.lang!==context().lang||profile.large!==context().large)){
      profile={...profile,lang:context().lang,large:context().large};
      if(!store.save(storage,profile,ids))status('notSaved');
    }
    render();
  }
  function open(){
    if(playing)stop('stopped');
    $('profile-title').textContent=t('title');$('profile-description').textContent=t('description');
    for(const [id,key] of [['profile-home-label','home'],['profile-language-label','language'],['profile-large-label','large'],['profile-save','save'],['profile-guest','guest'],['profile-forget','forget']])$(id).textContent=t(key);
    $('profile-close').setAttribute('aria-label',t('close'));
    $('profile-home').replaceChildren(...origins.map(p=>new Option(p.name[context().lang]+' · '+p.estate[context().lang],p.id)));
    $('profile-home').value=profile?.home||context().origin;
    $('profile-language').value=context().lang;$('profile-large').checked=!!context().large;
    $('profile-error').hidden=true;$('profile-forget').hidden=!profile;
    $('profile-dialog').showModal();$('profile-home').focus();
  }
  function close(){$('profile-dialog').close();$('profile-open').focus();}
  $('profile-form').addEventListener('submit',event=>{
    event.preventDefault();
    const value=store.validate({version:1,home:$('profile-home').value,lang:$('profile-language').value,large:$('profile-large').checked},ids);
    if(!value)return;
    const saved=store.save(storage,value,ids);profile=value;
    apply({origin:value.home,lang:value.lang,large:value.large});close();status(saved?'saved':'notSaved');render();
  });
  $('profile-forget').addEventListener('click',()=>{
    if(!store.clear(storage)){$('profile-error').hidden=false;$('profile-error').textContent=t('forgetError');return;}
    profile=null;close();status('forgotten');render();
  });
  $('profile-close').addEventListener('click',close);$('profile-guest').addEventListener('click',close);
  $('profile-dialog').addEventListener('close',()=>$('profile-open').focus());
  $('profile-open').addEventListener('click',open);$('voice-toggle').addEventListener('click',speak);
  $('text-size-toggle').addEventListener('click',()=>{apply({large:!context().large});});
  window.addEventListener('pagehide',()=>stop());
  // Force lazy voice discovery; the next user click picks from the latest available voices.
  if(supported)synth.getVoices();
  render();return{changed,stop};
};
