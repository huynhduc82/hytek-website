/* HYTEK — English / Vietnamese switch.
   English lives in each page's HTML (the source of truth). Vietnamese lives in lang/*.js, merged into window.HY_VI.
   Classic script (dictionaries are scripts too, no fetch) so it also works from file://.
   Scripts read window.HY_T(key, englishFallback) and listen for the 'hy:lang' event to redraw their own labels. */
(function(){
'use strict';
const VI=window.HY_VI||{};

const KEY='hytek-lang',en={},enA={};
let lang='en';
const qp=new URLSearchParams(location.search).get('lang');
try{const s=(qp==='vi'||qp==='en')?qp:localStorage.getItem(KEY);if(s==='vi'||s==='en')lang=s;else if((navigator.language||'').toLowerCase().startsWith('vi'))lang='vi'}catch(e){}
window.HY_LANG=lang;
window.HY_T=(k,fallback)=>(window.HY_LANG==='vi'&&VI[k]!=null)?VI[k].replace(/&amp;/g,'&'):fallback;
const desc=document.querySelector('meta[name="description"][data-i18n-content]');
if(desc)en[desc.dataset.i18nContent]=desc.content;
function apply(l,announce){
  window.HY_LANG=l;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;if(!(k in en))en[k]=el.innerHTML;
    const v=(l==='vi'&&VI[k]!=null)?VI[k]:en[k];if(el.innerHTML!==v)el.innerHTML=v;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    const k=el.dataset.i18nAria;if(!(k in enA))enA[k]=el.getAttribute('aria-label');
    el.setAttribute('aria-label',(l==='vi'&&VI[k]!=null)?VI[k]:enA[k]);
  });
  document.documentElement.lang=l;
  if(desc){const k=desc.dataset.i18nContent;desc.content=(l==='vi'&&VI[k]!=null)?VI[k]:en[k]}
  // the switch offers the other language, named in that language
  document.querySelectorAll('button.lang').forEach(b=>{const o=l==='vi'?'en':'vi',name=o==='vi'?'Tiếng Việt':'English';
    b.dataset.lang=o;b.title=name;const s=b.querySelector('span');if(s){s.textContent=name;s.lang=o}});
  try{localStorage.setItem(KEY,l)}catch(e){}
  if(announce)dispatchEvent(new CustomEvent('hy:lang',{detail:l}));
}
apply(lang,false);
document.querySelectorAll('button.lang').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.lang!==window.HY_LANG)apply(b.dataset.lang,true)}));
})();
