const supported=['ar','en'];
let language='ar';
try {const query=new URLSearchParams(location.search).get('lang');language=supported.includes(query)?query:(localStorage.getItem('leopard-language')||'ar');}catch{}
if(!supported.includes(language))language='ar';
export const lang=()=>language;
export const t=(ar,en)=>language==='ar'?ar:en;
export const number=n=>new Intl.NumberFormat(language==='ar'?'ar-SA':'en-US',{useGrouping:false}).format(n);
export function applyLanguage(root=document){
 if(root===document){document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';}
 root.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[language]);
 for(const attr of ['aria-label','alt','title'])root.querySelectorAll(`[data-ar-${attr}][data-en-${attr}]`).forEach(el=>el.setAttribute(attr,el.getAttribute(`data-${language}-${attr}`)));
 root.querySelectorAll('[data-lang-toggle]').forEach(el=>{el.textContent=language==='ar'?'English':'العربية';el.lang=language==='ar'?'en':'ar';el.setAttribute('aria-label',t('Switch to English','التبديل إلى العربية'));});
 root.querySelectorAll('[data-colouring-pdf]').forEach(el=>el.href=new URL(`./downloads/Arabian-Leopard-Colouring-Book${language==='en'?'-EN':''}.pdf`,import.meta.url).href);
 if(document.body.dataset.titleAr)document.title=document.body.dataset[language==='ar'?'titleAr':'titleEn'];
}
export function setLanguage(value){if(!supported.includes(value))return;language=value;try{localStorage.setItem('leopard-language',language);}catch{}applyLanguage();window.dispatchEvent(new CustomEvent('languagechange',{detail:{language}}));}
document.addEventListener('click',event=>{if(event.target.closest('[data-lang-toggle]'))setLanguage(language==='ar'?'en':'ar');});
applyLanguage();
