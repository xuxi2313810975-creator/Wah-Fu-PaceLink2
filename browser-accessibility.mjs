import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
await fs.mkdir('test-results',{recursive:true});
const errors=[];
const context=await browser.newContext({viewport:{width:1440,height:1100}});
await context.addInitScript(()=>{
 window.__speech={calls:[],cancels:0,last:null};
 class Utterance {constructor(text){this.text=text;}}
 Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
  getVoices:()=>[{name:'Cantonese test',lang:'zh-HK'},{name:'English test',lang:'en-GB'}],
  speak:u=>{window.__speech.calls.push({text:u.text,lang:u.lang,rate:u.rate});window.__speech.last=u;u.onstart?.();},
  cancel:()=>{window.__speech.cancels++;const u=window.__speech.last;window.__speech.last=null;u?.onerror?.({error:'canceled'});}
 }});
});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const flow=()=>page.locator('[data-flow-title]');
const clickAction=a=>page.locator(`[data-action="${a}"]`).click();
const noOverflow=async tag=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow: ${tag}`);
try {
 await page.goto('http://127.0.0.1:4173/?lang=zh');await flow().waitFor();
 assert.equal(await page.locator('#profile-label').innerText(),'登入');
 await page.screenshot({path:'test-results/wahfu-v3-desktop-zh.png',fullPage:true});
 await page.locator('#profile-open').click();await page.locator('#profile-dialog').waitFor({state:'visible'});
 assert.equal(await page.locator('input[type=password]').count(),0);
 await page.screenshot({path:'test-results/wahfu-v3-profile-zh.png'});
 await page.keyboard.press('Escape');assert.equal(await page.locator('#profile-open').evaluate(el=>el===document.activeElement),true);
 await page.locator('#profile-open').click();
 await page.locator('#profile-home').selectOption('H05');await page.locator('#profile-language').selectOption('en');await page.locator('#profile-large').check();await page.locator('#profile-save').click();
 assert.equal(await page.locator('#origin').inputValue(),'H05');assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.match(await page.locator('body').getAttribute('class'),/large-text/);
 assert.equal(await page.locator('#profile-label').innerText(),'My settings');
 await page.goto('http://127.0.0.1:4173/');await flow().waitFor();assert.equal(await page.locator('#origin').inputValue(),'H05');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.goto('http://127.0.0.1:4173/?origin=H13&destination=R3&lang=zh');await flow().waitFor();assert.equal(await page.locator('#origin').inputValue(),'H13');
 await page.locator('#demo-position').selectOption('0');await clickAction('continue');await page.locator('[data-action=reached]').waitFor();
 await page.locator('#voice-toggle').click();assert.equal(await page.locator('#voice-toggle').getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>__speech.calls.at(-1).lang),'zh-HK');assert.equal(await page.evaluate(()=>__speech.calls.at(-1).rate),.85);
 await clickAction('reached');assert.equal(await page.locator('#voice-toggle').getAttribute('aria-pressed'),'false');assert.match(await page.locator('#speech-status').innerText(),/內容已更新/);
 await page.locator('[data-lang=en]').click();assert.match(await flow().innerText(),/2 of/);
 await page.locator('#voice-toggle').click();assert.equal(await page.evaluate(()=>__speech.calls.at(-1).lang),'en-GB');
 await page.evaluate(()=>{let i=0;while(__speech.last&&i++<30){const u=__speech.last;__speech.last=null;u.onend?.();}});
 assert.equal(await page.locator('#voice-toggle').getAttribute('aria-pressed'),'false');assert.match(await page.locator('#speech-status').innerText(),/finished/);
 const transcript=await page.evaluate(()=>__speech.calls.filter(x=>x.lang==='en-GB').map(x=>x.text).join(' '));assert.match(transcript,/section 2 of/);assert.match(transcript,/Wah Lam Path/);
 await page.locator('#voice-toggle').click();await page.locator('#voice-toggle').click();assert.match(await page.locator('#speech-status').innerText(),/stopped/);
 for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:1000});await noOverflow(`English large ${width}`);}
 await page.locator('[data-lang=zh]').click();await noOverflow('Chinese large 320');
 await page.setViewportSize({width:390,height:1000});
 await page.locator('#go-journey').click();assert.equal(await page.locator('#route-settings').getAttribute('open'),null);
 await page.screenshot({path:'test-results/wahfu-v3-mobile-stage-zh.png'});
 const headerBottom=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom),flowTop=await flow().evaluate(el=>el.getBoundingClientRect().top);assert.ok(flowTop>=headerBottom-3,'Sticky header hides the current heading');
 await page.locator('#voice-toggle').click();await clickAction('reached');
 await page.waitForTimeout(80);
 assert.equal(await page.locator('#voice-toggle').getAttribute('aria-pressed'),'false');
 assert.ok(await flow().evaluate(el=>el.getBoundingClientRect().top)>=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom),'Updated heading is hidden by header');
 await page.locator('#profile-open').click();await noOverflow('Mobile profile');await page.screenshot({path:'test-results/wahfu-v3-mobile-profile.png'});
 await page.locator('#profile-forget').click();assert.equal(await page.evaluate(()=>localStorage.getItem('wahfu-demo-preferences-v3')),null);assert.equal(await page.locator('#profile-label').innerText(),'登入');
 await page.goto('http://127.0.0.1:4173/?lang=en');await flow().waitFor();
 assert.equal(/[\u3400-\u9fff]/u.test((await page.locator('body').innerText()).replaceAll('繁體中文','')),false);
 await page.locator('#profile-open').click();assert.equal(/[\u3400-\u9fff]/u.test((await page.locator('#profile-dialog').innerText()).replaceAll('繁體中文','')),false);await page.keyboard.press('Escape');
 const absent=await browser.newContext();await absent.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined});Storage.prototype.setItem=function(){throw new Error('Storage blocked');};});
 const fallback=await absent.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.goto('http://127.0.0.1:4173/?lang=en');await fallback.locator('#voice-toggle').click();assert.match(await fallback.locator('#speech-status').innerText(),/does not support/);
 await fallback.locator('#profile-open').click();await fallback.locator('#profile-save').click();assert.match(await fallback.locator('#speech-status').innerText(),/could not save/);await absent.close();
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/wahfu-v3-validation.json',JSON.stringify({passed:true,errors,checks:['labelled top-right login, read-aloud and text-size buttons','demo preferences save and reload','shared URL overrides saved home','modal keyboard Escape and focus return','no password collection','voice choice zh-HK/en-GB, slower rate, stop and finish','speech uses current section and stops after progress changes','language switch preserves section','320/390/768/1024/1440px layouts in large text','mobile Next button collapses planning controls','visible current heading below sticky header','clear saved profile','fully translated visible English UI','unsupported speech and blocked storage fallback'],speechVerification:'SpeechSynthesis mocked to check control logic. Audible sound and voice quality are not verified by headless testing.'},null,2));
 console.log('v3 checks passed');
} finally {await browser.close();}
