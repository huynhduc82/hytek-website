/* HYTEK GEM/SECS message exchange (svg#seq + button#gemCtl). Classic script, any page. */
(function(){
'use strict';
if(!document.getElementById('seq'))return;
const T=(k,en)=>(window.HY_T?window.HY_T(k,en):en);
/* GEM/SECS message exchange: replays continuously while on screen; pause/play button; static under reduced motion */
(function(){
  const svg=document.getElementById('seq'),NS='http://www.w3.org/2000/svg',rm=document.documentElement.classList.contains('rm');
  const mk=(t,a,p=svg)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  const MOB=innerWidth<=900,VW=MOB?400:700,HX=MOB?62:110,EX=MOB?338:590,BW=MOB?118:184,FS=MOB?14:12.5,F='IBM Plex Mono';svg.setAttribute('viewBox',`0 0 ${VW} 520`);
  // the original site's labels: FACTORY HOST — GEM / SECS · HSMS — EQUIPMENT CONTROLLER (phones: EQUIPMENT, the box is narrow)
  mk('text',{x:(HX+EX)/2,y:24,'text-anchor':'middle',fill:'#9fb2c4','font-family':F,'font-size':MOB?11:12}).textContent='GEM / SECS · HSMS';
  [[HX,'FACTORY HOST'],[EX,MOB?'EQUIPMENT':'EQUIPMENT CONTROLLER']].forEach(([x,t])=>{mk('rect',{x:x-BW/2,y:0,width:BW,height:38,fill:'none',stroke:'#f4f7f9','stroke-width':1.5});
    mk('text',{x,y:24,'text-anchor':'middle',fill:'#f4f7f9','font-family':'Barlow Condensed','font-weight':700,'font-size':MOB?13:14}).textContent=t;
    mk('line',{x1:x,y1:38,x2:x,y2:512,stroke:'#3a4a5a','stroke-dasharray':'10 4 2 4'})});
  const M=[[1,'S1F13','Establish Communications'],[0,'S1F14','COMMACK = 0'],[1,'S2F41','Host Command · PP-SELECT'],[0,'S2F42','HCACK = 0'],
           [0,'S6F11','Event · PROCESS_START'],[0,'S5F1','Alarm · PM3 PRESSURE HIGH'],[1,'S5F2','Alarm Ack'],[0,'S6F11','Event · PROCESS_COMPLETE'],[1,'S6F12','Event Ack']];
  const rows=M.map((m,i)=>{const y=74+i*50,h2e=m[0]===1,x1=h2e?HX:EX,x2=h2e?EX:HX,dir=h2e?1:-1,al=m[1]==='S5F1',col=al?'#f5a524':'#f4f7f9';
    const g=mk('g',{opacity:0});const L=mk('line',{x1,y1:y,x2:x1,y2:y,stroke:col,'stroke-width':1.5},g);
    const A=mk('path',{d:`M${x2} ${y} l${-dir*10} -5 v10 Z`,fill:col,opacity:0},g);
    const T=mk('text',{x:(HX+EX)/2,y:y-9,'text-anchor':'middle','font-family':F,'font-size':FS},g);
    T.innerHTML=MOB?`<tspan fill="${col}" font-weight="600">${m[1]}</tspan>`:`<tspan fill="${col}" font-weight="600">${m[1]}</tspan><tspan fill="${al?col:'#9fb0c0'}">  ${m[2]}</tspan>`;
    if(MOB){const d=mk('text',{x:(HX+EX)/2,y:y+18,'text-anchor':'middle','font-family':'Barlow Condensed','font-size':13,fill:al?col:'#9fb0c0'},g);d.textContent=m[2]}
    return {g,L,A,x1,x2}});
  const per=.55,HOLD=3,FADE=.6,TOTAL=M.length*per+HOLD+FADE;
  const btn=document.getElementById('gemCtl'),lab=btn.querySelector('span'),use=btn.querySelector('use');
  let t=0,last=0,on=false,paused=false;
  function frame(tt){
    const fade=tt>TOTAL-FADE?1-(tt-(TOTAL-FADE))/FADE:1;
    rows.forEach((r,i)=>{const p=Math.max(0,Math.min(1,(tt-i*per)/(per*.75))),e=1-Math.pow(1-p,3);
      r.g.setAttribute('opacity',p>0?fade:0);r.L.setAttribute('x2',r.x1+(r.x2-r.x1)*e);r.A.setAttribute('opacity',p>=1?1:0)});
  }
  function setBtn(){lab.textContent=paused?T('gem.play','Play exchange'):T('gem.pause','Pause exchange');use.setAttribute('href',paused?'#play':'#pause')}
  function tick(now){requestAnimationFrame(tick);const dt=Math.min(.05,(now-(last||now))/1000);last=now;
    if(!on||paused)return;t=(t+dt)%TOTAL;frame(t)}
  if(rm){frame(M.length*per+.5);btn.hidden=true}
  else{setBtn();btn.onclick=()=>{paused=!paused;setBtn()};addEventListener('hy:lang',setBtn);
    new IntersectionObserver(es=>{on=es[0].isIntersecting},{threshold:.2}).observe(svg);requestAnimationFrame(tick)}
})();
})();
