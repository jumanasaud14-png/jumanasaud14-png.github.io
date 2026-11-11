import {lang,t} from './locale.mjs';

const dialog=document.getElementById('welcome-intro');
const video=document.getElementById('intro-video');
const play=document.getElementById('intro-play');
const status=document.getElementById('intro-status');
const seenKey='leopard-welcome-v1';
const mediaVersion='20260928-child-voices';
let playRun=0;

function hasSeen(){try{return sessionStorage.getItem(seenKey)==='seen';}catch{return false;}}
function remember(){try{sessionStorage.setItem(seenKey,'seen');}catch{}}
function setState(state){
 dialog.dataset.state=state;
 play.hidden=state==='playing';
 play.disabled=state==='loading';
 document.getElementById('intro-stage').setAttribute('aria-busy',String(state==='loading'));
 document.getElementById('intro-play-label').textContent=state==='paused'?t('تابع المقطع','Continue watching'):state==='error'?t('حاول مرة أخرى','Try again'):t('اسمع نمّور','Meet Namour');
}
function loadLanguage(){
 playRun++;video.pause();video.controls=false;
 video.poster=`./video/namour-${lang()}-poster.webp?v=${mediaVersion}`;
 video.src=`./video/namour-${lang()}.mp4?v=${mediaVersion}`;
 const captions=document.createElement('track');
 captions.kind='captions';captions.srclang=lang();captions.label=t('العربية','English');captions.default=true;captions.src=`./video/namour-${lang()}.vtt?v=${mediaVersion}`;
 video.replaceChildren(captions);video.load();
 status.textContent='';setState('ready');
}
function openIntro(updateHash=true){
 if(dialog.open||typeof dialog.showModal!=='function')return;
 window.dispatchEvent(new Event('welcomeopen'));
 loadLanguage();dialog.showModal();
 document.documentElement.classList.add('welcome-open');
 if(updateHash){try{history.replaceState(null,'','#welcome');}catch{}}
 play.focus({preventScroll:true});
}
function finish(goToActivities=true){
 if(!dialog.open)return;
 remember();playRun++;video.pause();dialog.close();
 video.removeAttribute('src');video.removeAttribute('poster');video.replaceChildren();video.load();
 document.documentElement.classList.remove('welcome-open');status.textContent='';setState('ready');
 if(goToActivities){
  try{history.replaceState(null,'','#activities');}catch{}
  document.getElementById('activities').scrollIntoView({block:'start',behavior:'instant'});
  document.getElementById('welcome-title').focus({preventScroll:true});
 }
}
async function start(){
 const run=++playRun;
 if(dialog.dataset.state==='error')video.load();
 setState('loading');status.textContent=t('نجهّز المغامرة…','Getting ready…');video.controls=true;
 try{await video.play();}catch{if(run!==playRun||!dialog.open)return;failed();}
}
function failed(){
 if(!dialog.open)return;
 setState('error');status.textContent=t('تعذّر تشغيل المقطع. حاول مرة أخرى، أو ادخل للأنشطة الآن.','The video could not play. Try again, or explore the activities now.');
}
play.addEventListener('click',start);
video.addEventListener('playing',()=>{if(!dialog.open)return;status.textContent='';setState('playing');});
video.addEventListener('pause',()=>{if(dialog.open&&!video.ended&&dialog.dataset.state==='playing')setState('paused');});
video.addEventListener('ended',()=>finish());video.addEventListener('error',failed);
dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
dialog.querySelectorAll('[data-enter-site]').forEach(button=>button.addEventListener('click',()=>finish()));
document.querySelectorAll('[data-open-intro]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openIntro();}));
window.addEventListener('languagechange',()=>{if(dialog.open)loadLanguage();});
window.addEventListener('hashchange',()=>{if(location.hash==='#welcome')openIntro(false);else if(dialog.open)finish(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
window.addEventListener('pagehide',()=>{playRun++;video.pause();});
if(location.hash==='#welcome'||(!location.hash&&!hasSeen()))openIntro(false);
