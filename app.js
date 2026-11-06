/* HYTEK site script: scroll-driven 3D chamber, GEM/SECS exchange, simulations. */
(function(){
'use strict';
const T=(k,en)=>(window.HY_T?window.HY_T(k,en):en);
/* Classic script (not type=module) so the page also works when opened from file:// —
   Chrome refuses external module scripts on file:// pages. Three.js loads through dynamic import + the importmap. */


/* menu */
(function(){const b=document.querySelector('.menu'),n=document.getElementById('nav');
  b.onclick=()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?T('ui.close','Close'):T('ui.menu','Menu')};
  n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent=T('ui.menu','Menu')}));
  // "Services" jumps to the step where the list is fully visible
  document.querySelector('a[href="#services"]').addEventListener('click',e=>{if(document.documentElement.classList.contains('rm'))return;e.preventDefault();
    const s=document.getElementById('stage');scrollTo({top:s.offsetTop+(s.offsetHeight-innerHeight)*.3,behavior:'smooth'})});
})();


/* GEM/SECS message exchange: replays continuously while on screen; pause/play button; static under reduced motion */
(function(){
  const svg=document.getElementById('seq'),NS='http://www.w3.org/2000/svg',rm=document.documentElement.classList.contains('rm');
  const mk=(t,a,p=svg)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  const MOB=innerWidth<=900,VW=MOB?400:700,HX=MOB?62:110,EX=MOB?338:590,BW=MOB?118:184,FS=MOB?14:12.5,F='IBM Plex Mono';svg.setAttribute('viewBox',`0 0 ${VW} 520`);
  [[HX,'FACTORY HOST / MES'],[EX,'EQUIPMENT']].forEach(([x,t])=>{mk('rect',{x:x-BW/2,y:0,width:BW,height:38,fill:'none',stroke:'#f4f7f9','stroke-width':1.5});
    mk('text',{x,y:24,'text-anchor':'middle',fill:'#f4f7f9','font-family':'Archivo','font-weight':700,'font-size':MOB?13:14}).textContent=MOB?t.replace(' / MES',''):t;
    mk('line',{x1:x,y1:38,x2:x,y2:512,stroke:'#3a4a5a','stroke-dasharray':'10 4 2 4'})});
  const M=[[1,'S1F13','Establish Communications'],[0,'S1F14','COMMACK = 0'],[1,'S2F41','Host Command · PP-SELECT'],[0,'S2F42','HCACK = 0'],
           [0,'S6F11','Event · PROCESS_START'],[0,'S5F1','Alarm · PM3 PRESSURE HIGH'],[1,'S5F2','Alarm Ack'],[0,'S6F11','Event · PROCESS_COMPLETE'],[1,'S6F12','Event Ack']];
  const rows=M.map((m,i)=>{const y=74+i*50,h2e=m[0]===1,x1=h2e?HX:EX,x2=h2e?EX:HX,dir=h2e?1:-1,al=m[1]==='S5F1',col=al?'#f5a524':'#f4f7f9';
    const g=mk('g',{opacity:0});const L=mk('line',{x1,y1:y,x2:x1,y2:y,stroke:col,'stroke-width':1.5},g);
    const A=mk('path',{d:`M${x2} ${y} l${-dir*10} -5 v10 Z`,fill:col,opacity:0},g);
    const T=mk('text',{x:(HX+EX)/2,y:y-9,'text-anchor':'middle','font-family':F,'font-size':FS},g);
    T.innerHTML=MOB?`<tspan fill="${col}" font-weight="600">${m[1]}</tspan>`:`<tspan fill="${col}" font-weight="600">${m[1]}</tspan><tspan fill="${al?col:'#9fb0c0'}">  ${m[2]}</tspan>`;
    if(MOB){const d=mk('text',{x:(HX+EX)/2,y:y+18,'text-anchor':'middle','font-family':'Archivo','font-size':13,fill:al?col:'#9fb0c0'},g);d.textContent=m[2]}
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


/* ---------- scroll-driven 3D process chamber ---------- */
async function chamber3D(){
const THREE=await import('three');
const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
const RM=document.documentElement.classList.contains('rm');
const host=document.getElementById('gl'),leads=document.getElementById('leads'),fig=document.getElementById('fig'),stage=document.getElementById('stage');
const W=()=>host.clientWidth,H=()=>host.clientHeight,mobile=()=>innerWidth<=900;
const r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W(),H());host.appendChild(r.domElement);
r.domElement.setAttribute('role','img');
r.domElement.setAttribute('aria-label','Process chamber drawn in 3D, taken apart into six parts: plasma source, process chamber, wafer chuck, slit valve, gas delivery and turbo pump.');
r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.environment=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.04).texture;
const cam=new THREE.PerspectiveCamera(28,W()/H(),.1,100);
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(5,10,6);scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffffff,0x8fa0b0,1.6));
const fill=new THREE.DirectionalLight(0xdbe8ff,.9);fill.position.set(-6,2,-4);scene.add(fill);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.6,64),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.045}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.55;scene.add(shadow);

const M={
  steel:()=>new THREE.MeshStandardMaterial({color:0xd9dde1,metalness:.75,roughness:.3,side:THREE.DoubleSide}),
  steelD:()=>new THREE.MeshStandardMaterial({color:0x9aa1a8,metalness:.7,roughness:.4}),
  black:()=>new THREE.MeshStandardMaterial({color:0x1a1b1d,metalness:.2,roughness:.55}),
  copper:()=>new THREE.MeshStandardMaterial({color:0xd08a4c,metalness:.8,roughness:.3}),
  sig:()=>new THREE.MeshStandardMaterial({color:0x0b6ac7,metalness:.1,roughness:.5}),
};
const INK=new THREE.Color(0x0d0d0d),SIG=new THREE.Color(0x0b6ac7);
const root=new THREE.Group();scene.add(root);
const parts=[];
function part(name,obj,off){root.add(obj);
  const edges=[];obj.traverse(o=>{if(o.isMesh){const e=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,28),new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.28}));o.add(e);edges.push(e.material)}});
  parts.push({name,obj,base:obj.position.clone(),off,edges});return obj}
const mesh=(geo,mat,pos,rot)=>{const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);return m};
let g;
// 1 plasma source / lid
g=new THREE.Group();
g.add(mesh(new THREE.CylinderGeometry(1.25,1.25,.16,72),M.steel()));
g.add(mesh(new THREE.CylinderGeometry(.55,.55,.5,48),M.steelD(),[0,.33,0]));
const coilMat=M.copper();
g.add(mesh(new THREE.TorusGeometry(.62,.05,14,64),coilMat,[0,.24,0],[Math.PI/2,0,0]));
g.add(mesh(new THREE.TorusGeometry(.62,.05,14,64),coilMat,[0,.42,0],[Math.PI/2,0,0]));
g.add(mesh(new THREE.BoxGeometry(.32,.2,.32),M.black(),[0,.68,0]));
const bolt=new THREE.CylinderGeometry(.035,.035,.07,10),bm=M.steelD();for(let i=0;i<20;i++){const a=i/20*Math.PI*2;g.add(mesh(bolt,bm,[Math.cos(a)*1.13,.11,Math.sin(a)*1.13]))}
g.position.y=1.0;part('Plasma source · RF / DC power',g,new THREE.Vector3(0,1.55,0));
// 2 chamber body (cutaway) + plasma volume
g=new THREE.Group();
g.add(mesh(new THREE.CylinderGeometry(1.2,1.2,1.7,72,1,true,2.0,Math.PI*1.5),M.steel()));
g.add(mesh(new THREE.CylinderGeometry(1.14,1.14,1.7,72,1,true,2.0,Math.PI*1.5),M.steelD()));
const rm=M.steelD();[.85,-.85].forEach(y=>g.add(mesh(new THREE.TorusGeometry(1.2,.055,10,72),rm,[0,y,0],[Math.PI/2,0,0])));
g.add(mesh(new THREE.CylinderGeometry(.22,.22,.3,32),M.steelD(),[-1.3,.25,0],[0,0,Math.PI/2]));
const plasmaMat=new THREE.MeshBasicMaterial({color:0x4fa8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const plasma=new THREE.Mesh(new THREE.CylinderGeometry(.9,.75,.85,48,1,true),plasmaMat);plasma.position.y=.3;
part('Process chamber',g,new THREE.Vector3(0,0,0));g.add(plasma);
// 3 chuck + wafer
g=new THREE.Group();
const chuckTop=new THREE.Group();g.add(chuckTop);
chuckTop.add(mesh(new THREE.CylinderGeometry(.85,.9,.22,72),M.steelD()));
chuckTop.add(mesh(new THREE.CylinderGeometry(.75,.75,.02,72),new THREE.MeshPhysicalMaterial({color:0x7f97c9,metalness:.55,roughness:.12,iridescence:1,iridescenceIOR:1.7,clearcoat:1}),[0,.13,0]));
chuckTop.add(mesh(new THREE.BoxGeometry(.06,.025,.3),M.black(),[0,.14,-.6]));
g.add(mesh(new THREE.CylinderGeometry(.18,.18,.8,24),M.steel(),[0,-.5,0]));
g.position.y=-.35;part('Wafer chuck · lift · rotation',g,new THREE.Vector3(0,-.2,0));
// 4 slit valve
g=new THREE.Group();
g.add(mesh(new THREE.BoxGeometry(.5,.55,1.1),M.black()));
const gate=mesh(new THREE.BoxGeometry(.06,.3,.8),M.sig(),[.28,0,0]);g.add(gate);
g.add(mesh(new THREE.CylinderGeometry(.12,.12,.5,24),M.steelD(),[0,.52,0]));
g.position.set(1.48,.1,0);part('Slit valve · interlock',g,new THREE.Vector3(1.2,0,0));
// 5 MFC gas stick
g=new THREE.Group();const mfcMat=M.sig();
for(let i=0;i<3;i++)g.add(mesh(new THREE.BoxGeometry(.24,.42,.24),i===1?mfcMat:M.steelD(),[i*.32,0,0]));
g.add(mesh(new THREE.CylinderGeometry(.04,.04,1.2,12),M.steel(),[.32,-.28,0],[0,0,Math.PI/2]));
g.position.set(-.3,.45,1.45);part('MFC · gas delivery',g,new THREE.Vector3(0,.25,1.1));
// 6 turbo pump
g=new THREE.Group();
g.add(mesh(new THREE.CylinderGeometry(.6,.6,.9,56),M.steelD()));
g.add(mesh(new THREE.CylinderGeometry(.75,.75,.08,56),M.steel(),[0,.48,0]));
g.add(mesh(new THREE.CylinderGeometry(.62,.62,.12,56),M.sig(),[0,-.3,0]));
const blades=new THREE.Group();const bmat=M.steel();for(let i=0;i<20;i++){const p=new THREE.Group();p.rotation.y=i/20*Math.PI*2;p.add(mesh(new THREE.BoxGeometry(.5,.015,.1),bmat,[.28,0,0],[.5,0,0]));blades.add(p)}
blades.position.y=.54;g.add(blades);
g.position.y=-1.6;part('Turbo / cryo pump',g,new THREE.Vector3(0,-1.35,0));

// service step -> part indices (0-based); matches the balloons in the list
const MAP=[[1,3],[0,4],[2],[3,4],[5,0],[0,1,2,3,4,5]];

// overlays: item balloons, leaders, assembly axis, trace lines
const NS='http://www.w3.org/2000/svg',svgEl=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);leads.appendChild(e);return e};
const axis=svgEl('line',{stroke:'#09131f','stroke-width':.8,'stroke-dasharray':'14 4 2 4',opacity:0});
const traces=parts.map(()=>svgEl('line',{stroke:'#09131f','stroke-width':.8,'stroke-dasharray':'3 3',opacity:0}));
const leaders=parts.map(()=>[svgEl('polyline',{fill:'none',stroke:'#09131f','stroke-width':1}),svgEl('circle',{r:2.5,fill:'#09131f'})]);
const NUM=[1,3,4,5,2,6]; // balloon numbers follow drawing order, top to bottom
const bals=parts.map((p,i)=>{const d=document.createElement('div');d.className='bal';d.innerHTML=`<i class="bl">${NUM[i]}</i><span>${p.name}</span>`;fig.appendChild(d);return d});
const PK=['part.src','part.ch','part.chuck','part.valve','part.mfc','part.pump'];
const nameBals=()=>bals.forEach((d,i)=>{d.querySelector('span').textContent=T(PK[i],parts[i].name)});nameBals();addEventListener('hy:lang',nameBals);

const hero=document.getElementById('hero'),tblock=document.getElementById('tblock'),cue=document.getElementById('cue'),svc=document.getElementById('services'),steps=document.getElementById('steps');
const lis=[...document.querySelectorAll('#svcList li')],stepI=[...steps.children];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const HP=null;
let P=0,Ps=0,t=0,active=-2,visible=true,spin=.04,lift=0,eS=0;const T0=performance.now();
const onScroll=()=>{const b=stage.getBoundingClientRect();P=clamp(-b.top/(b.height-innerHeight))};
addEventListener('scroll',onScroll,{passive:true});onScroll();
new IntersectionObserver(es=>{visible=es[0].isIntersecting},{rootMargin:'100px'}).observe(stage);
const v=new THREE.Vector3(),w2=new THREE.Vector3();
function proj(vec){vec.project(cam);const gr=host.getBoundingClientRect(),fr=fig.getBoundingClientRect();return [gr.left-fr.left+(vec.x*.5+.5)*gr.width,gr.top-fr.top+(-vec.y*.5+.5)*gr.height]}

function setStep(step){if(step===active)return;active=step;
  lis.forEach((li,i)=>li.classList.toggle('on',i===step));stepI.forEach((s,i)=>s.classList.toggle('on',i<=step));
  parts.forEach((p,i)=>{const on=step>=0&&MAP[step].includes(i);p.edges.forEach(m=>{m.color.copy(on?SIG:INK);m.opacity=on?.95:.28});bals[i].classList.toggle('on',on)})}

function frame(){
  if(!RM)requestAnimationFrame(frame);
  if(!visible&&!RM)return;
  t=(performance.now()-T0)/1000;if(HP!==null)P=HP;Ps=(RM||HP!==null)?P:Ps+(P-Ps)*.1;
  const mob=mobile();
  // scroll choreography: hero out → take apart → six service steps → reassemble
  const intro=RM?0:smooth(0,.09,Ps);
  const assembleIn=RM?0:.35*(1-Math.min(1,t/1.6))**3; // on load the chamber closes up
  eS=RM?1:smooth(.05,.24,Ps)*(1-smooth(.9,.985,Ps));let e=Math.max(assembleIn,eS);
  const step=RM?-1:(Ps<.27?-1:Math.min(5,Math.floor((Ps-.27)/(.63/6))));
  hero.style.opacity=RM?1:1-intro;hero.style.transform=RM?'':`translateY(${-intro*70}px)`;
  tblock.style.opacity=cue.style.opacity=RM?1:1-intro;
  const so=RM?1:smooth(.11,.22,Ps)*(1-smooth(.93,.99,Ps));svc.style.opacity=so;svc.style.transform=RM?'':`translateY(${(1-so)*30}px)`;svc.style.pointerEvents=so>.5?'auto':'none';steps.style.opacity=so;
  setStep(step);
  // mechanics that show what each service drives
  const s=step;
  spin+=(((s===4||s===5)?.55:.04)-spin)*.03;blades.rotation.y+=RM?0:spin;
  const liftT=(s===2)?.16*(.5-.5*Math.cos(t*2.2)):0;lift+=(liftT-lift)*.1;
  if(s===2&&!RM)chuckTop.rotation.y+=.012;
  gate.position.y=(s===0||s===3)&&!RM?.13*Math.sin(t*2.4):gate.position.y*.9;
  plasmaMat.opacity=(s===1||s===5)&&!RM?.18+.08*Math.sin(t*9)+.04*Math.sin(t*23):plasmaMat.opacity*.9;
  coilMat.emissive.setHex(0xff8a3d);coilMat.emissiveIntensity=(s===1)?.18+.1*Math.sin(t*6):0; // hot copper, not a blue tint
  mfcMat.emissive.setHex(0x0b6ac7);mfcMat.emissiveIntensity=(s===3)?(Math.sin(t*8)>0?.6:0):0;
  parts.forEach((p,i)=>{p.obj.position.copy(p.base).addScaledVector(p.off,e)});
  parts[2].obj.position.y+=lift;
  // camera: slow idle orbit, pulls back when apart
  const ca=.35+(RM?0:Math.sin(t*.12)*.22)+Ps*.6,dist=(mob?15:12.5)+e*4.5;
  cam.position.set(Math.cos(ca)*dist,4.2+e*1.4,Math.sin(ca)*dist);cam.lookAt(0,-.25-e*.1,0);
  const w=W(),h=H();if(mob)cam.clearViewOffset();else cam.setViewOffset(w,h,e*w*.09,0,w,h);
  r.render(scene,cam);
  // drawing overlay
  const fr=fig.getBoundingClientRect(),colX=fr.width-(mob?0:270);
  const a1=proj(w2.set(0,3.4,0).applyMatrix4(root.matrixWorld)),a2=proj(w2.set(0,-3.7,0).applyMatrix4(root.matrixWorld));
  axis.setAttribute('x1',a1[0]);axis.setAttribute('y1',a1[1]);axis.setAttribute('x2',a2[0]);axis.setAttribute('y2',a2[1]);axis.setAttribute('opacity',eS*.55);
  const pr=parts.map((p,i)=>{p.obj.getWorldPosition(v);const [x,y]=proj(v);const b=proj(w2.copy(p.base).applyMatrix4(root.matrixWorld));return {i,x,y,b}});
  const top=mob?fr.height*.56:96,span=mob?fr.height*.4:fr.height-200;
  pr.forEach(({i,x,y,b})=>{
    const ly=mob?y:top+(NUM[i]-1)*(span/5),lx=mob?Math.min(x+56,fr.width-34):colX;
    const B=bals[i];B.style.left=lx+'px';B.style.top=(ly-13)+'px';B.style.opacity=eS;
    leaders[i][0].setAttribute('points',mob?`${x},${y} ${lx},${ly}`:`${x},${y} ${lx-44},${ly} ${lx-6},${ly}`);leaders[i][0].setAttribute('opacity',eS*.9);
    leaders[i][1].setAttribute('cx',x);leaders[i][1].setAttribute('cy',y);leaders[i][1].setAttribute('opacity',eS);
    const tr=traces[i];tr.setAttribute('x1',b[0]);tr.setAttribute('y1',b[1]);tr.setAttribute('x2',x);tr.setAttribute('y2',y);tr.setAttribute('opacity',parts[i].off.lengthSq()>0?eS*.45:0)});
}
frame();
function resize(){r.setSize(W(),H());cam.aspect=W()/H();cam.updateProjectionMatrix();if(RM)frame()}
addEventListener('resize',resize);
if(RM)document.fonts.ready.then(frame);
}
chamber3D().catch(err=>{console.warn('HYTEK: 3D chamber unavailable, showing the static layout',err);document.documentElement.classList.add('rm','no3d')});

/* ---------- simulations: every visual on this site is simulated, never a client photograph ---------- */
const RMQ=document.documentElement.classList.contains('rm');
const sims=[];
function sim(el,{tick,still}){
  if(!el)return;
  const s={el,tick,still,on:false,paused:false,t:0};sims.push(s);
  if(!RMQ){
    const b=document.createElement('button');b.className='simpause';b.type='button';
    const set=()=>{b.setAttribute('aria-label',s.paused?'Play animation':'Pause animation');b.innerHTML=`<svg class="i" aria-hidden="true"><use href="#${s.paused?'play':'pause'}"/></svg>`};
    set();b.onclick=()=>{s.paused=!s.paused;set()};el.appendChild(b);
  }
  new IntersectionObserver(es=>{s.on=es[0].isIntersecting},{rootMargin:'80px'}).observe(el);
  if(RMQ&&still)still();
  return s;
}
let simLast=performance.now();
(function simLoop(now){const dt=Math.min(.05,(now-simLast)/1000);simLast=now;
  if(!RMQ)sims.forEach(s=>{if(s.on&&!s.paused){s.t+=dt;s.tick(dt,s.t)}});
  requestAnimationFrame(simLoop)})(simLast);
const SVGNS='http://www.w3.org/2000/svg';
const mkS=(t,a,p)=>{const e=document.createElementNS(SVGNS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const fmtP=p=>p>=1?Math.round(p).toString():p.toExponential(1).replace('e-','e−');

/* A — chamber HMI: states, readouts, interlocks */
(function(){
  const el=document.getElementById('simChamber');if(!el)return;
  const st=[...el.querySelectorAll('.states li')],q=k=>el.querySelector(k);
  const P=q('#cP'),R=q('#cR'),A=q('#cA'),T=q('#cT'),cv=q('#cTrend'),ctx=cv.getContext('2d');
  const ilk=k=>el.querySelector(`[data-k="${k}"]`);const hist=[];
  function fit(){cv.width=cv.clientWidth*2;cv.height=cv.clientHeight*2}fit();addEventListener('resize',fit);
  function state(c){ // c in 0..16 s
    let s,p,rf=0,ar=0,tc=22,turbo=false,gate=true;
    if(c<2){s=0;p=760}
    else if(c<7){s=1;const k=(c-2)/5;p=760*Math.pow(10,-k*8.2);turbo=c>4.5}
    else if(c<12){s=2;turbo=true;const k=c-7;ar=Math.min(20,k*14);p=3e-3*(1+.04*Math.sin(c*7));rf=k<1?0:Math.min(500,(k-1)*600)+Math.sin(c*9)*4;tc=22+Math.min(23,k*6)}
    else{s=3;const k=(c-12)/4;p=3e-3*Math.pow(10,k*5.4);tc=45-k*20;turbo=k<.3}
    return {s,p,rf,ar,tc,turbo,gate};
  }
  function draw(v){
    st.forEach((li,i)=>li.classList.toggle('on',i===v.s));
    P.textContent=fmtP(v.p);R.textContent=Math.round(Math.max(0,v.rf));A.textContent=v.ar.toFixed(1);T.textContent=v.tc.toFixed(1);
    ilk('door').className='ok';ilk('water').className='ok';ilk('turbo').className=v.turbo?'ok':'wait';ilk('gate').className=v.gate?'ok':'wait';
    hist.push(Math.log10(v.p));if(hist.length>220)hist.shift();
    const w=cv.width,h=cv.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(159,176,192,.18)';ctx.lineWidth=1;
    for(let i=1;i<4;i++){const y=h*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.strokeStyle='#4fa8ff';ctx.lineWidth=3;ctx.beginPath();
    hist.forEach((lp,i)=>{const x=i/219*w,y=h-((lp+6)/9)*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
  }
  sim(el,{tick:(dt,t)=>draw(state(t%16)),still:()=>{for(let c=0;c<9.5;c+=.08)hist.push(Math.log10(state(c).p));draw(state(9.5))}});
})();


/* C — loadlock cassette slot mapping and wafer extraction */
(function(){
  const svg=document.getElementById('simSlots');if(!svg)return;
  const INK='#09131f',BLUE='#0b6ac7',N=25,X=170,Y=40,H=12,W=190;
  const present=[1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1];
  mkS('rect',{x:X-14,y:Y-12,width:W+28,height:N*H+24,fill:'#fff',stroke:INK,'stroke-width':1.6},svg);
  const slots=[],nums=[];
  for(let i=0;i<N;i++){const y=Y+i*H;
    mkS('line',{x1:X-14,y1:y+H/2,x2:X-4,y2:y+H/2,stroke:INK,opacity:.5},svg);mkS('line',{x1:X+W+4,y1:y+H/2,x2:X+W+14,y2:y+H/2,stroke:INK,opacity:.5},svg);
    slots.push(mkS('rect',{x:X,y:y+3,width:W,height:H-6,rx:2,fill:BLUE,opacity:0},svg));
    if(i%5===0||i===N-1){const t=mkS('text',{x:X-22,y:y+H/2+4,'text-anchor':'end',fill:INK,'font-family':'IBM Plex Mono','font-size':11},svg);t.textContent=String(i+1).padStart(2,'0')}
  }
  const sensor=mkS('g',{},svg);mkS('rect',{x:X-30,y:-3,width:W+60,height:6,fill:INK},sensor);mkS('line',{x1:X-30,y1:0,x2:X+W+30,y2:0,stroke:BLUE,'stroke-width':1.5,'stroke-dasharray':'2 3'},sensor);
  const fx=X+W+60;
  const lab=(y,k)=>{const t=mkS('text',{x:fx,y,fill:'#586676','font-family':'IBM Plex Mono','font-size':12},svg);t.textContent=k;return mkS('text',{x:fx,y:y+24,fill:INK,'font-family':'Archivo','font-size':22,'font-weight':700},svg)};
  const vState=lab(70,'LL-A · STATE'),vMap=lab(140,'SLOTS MAPPED'),vW=lab(210,'WAFERS'),vNext=lab(280,'NEXT TRANSFER');
  const total=present.reduce((a,b)=>a+b,0);const order=present.map((p,i)=>p?i:-1).filter(i=>i>=0);
  function draw(c){ // 0..14 s
    let mapped,taken,slide=-1,slideK=0,stt;
    if(c<4){mapped=Math.floor(c/4*N);taken=0;stt='MAPPING'}
    else if(c<12.5){mapped=N;const k=(c-4)/.85;taken=Math.min(order.length,Math.floor(k));slide=order[taken];slideK=k-Math.floor(k);stt='TRANSFER'}
    else{mapped=N;taken=0;stt='VENT · RELOAD'}
    sensor.setAttribute('transform',`translate(0 ${Y+Math.min(mapped,N)*H})`);sensor.setAttribute('opacity',c<4?1:0);
    slots.forEach((r,i)=>{const done=order.indexOf(i)>-1&&order.indexOf(i)<taken;
      const vis=i<mapped&&present[i]&&!done;let x=X;if(i===slide&&c>=4&&c<12.5){x=X+ease(slideK)*45}
      r.setAttribute('x',x);r.setAttribute('opacity',vis||(i===slide&&c>=4&&c<12.5)?(i===slide?1-slideK*.9:1):0);
      if(c>=12.5)r.setAttribute('opacity',0)});
    vState.textContent=stt;vMap.textContent=`${mapped} / ${N}`;vW.textContent=c<4?`${present.slice(0,mapped).reduce((a,b)=>a+b,0)}`:`${total-taken} of ${total}`;
    vNext.textContent=c>=4&&c<12.5&&slide>=0?`Slot ${String(slide+1).padStart(2,'0')} → PM`:'—';
  }
  sim(svg.parentElement,{tick:(dt,t)=>draw(t%14),still:()=>draw(6)});
})();

/* D — recipe editor with live step and alarm handling */
(function(){
  const el=document.getElementById('simRecipe');if(!el)return;
  const rows=[...el.querySelectorAll('tbody tr')],bar=el.querySelector('.alm'),per=2.4;
  function draw(t){const n=rows.length,c=t%(n*per),i=Math.floor(c/per),k=(c%per)/per;
    rows.forEach((r,j)=>{r.classList.toggle('on',j===i);r.classList.toggle('done',j<i);r.style.setProperty('--k',j===i?k:j<i?1:0)});
    const alarm=i===3&&k>.35;bar.classList.toggle('on',alarm);bar.classList.toggle('ack',i===3&&k>.75)}
  sim(el,{tick:(dt,t)=>draw(t),still:()=>{rows.forEach((r,j)=>{r.classList.toggle('on',j===3);r.classList.toggle('done',j<3);r.style.setProperty('--k',j<3?1:j===3?.5:0)})}});
})();

/* E — engagement loop between the client's team, HYTEK and the equipment */
(function(){
  const svg=document.getElementById('simLoop');if(!svg)return;
  const INK='#09131f',BLUE='#0b6ac7';let paths=[],dots=[],L=[];
  function build(){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    const mob=innerWidth<=900;
    const N=[[T('lp.n1','Your engineering team'),T('lp.n1s','Architecture · process')],[T('lp.n2','HYTEK · Ho Chi Minh City'),T('lp.n2s','Equipment software team')],[T('lp.n3','Your equipment'),T('lp.n3s','Lab · fab · field')]];
    const F=[[T('lp.f1','Your architecture & process'),0,1],[T('lp.f2','Software builds'),1,0],[T('lp.f3','Development to production'),1,2],[T('lp.f4','Support & troubleshooting'),2,1]];
    let box;
    if(!mob){svg.setAttribute('viewBox','0 0 1200 400');box=i=>({x:30+i*420,y:140,w:300,h:120})}
    else{svg.setAttribute('viewBox','0 0 400 620');box=i=>({x:60,y:20+i*230,w:280,h:120})}
    N.forEach(([a,b],i)=>{const r=box(i);mkS('rect',{x:r.x,y:r.y,width:r.w,height:r.h,fill:i===1?INK:'#fff',stroke:INK,'stroke-width':1.6},svg);
      const t1=mkS('text',{x:r.x+20,y:r.y+52,fill:i===1?'#fff':INK,'font-family':'Archivo','font-size':mob?19:21,'font-weight':700},svg);t1.textContent=a;
      const t2=mkS('text',{x:r.x+20,y:r.y+84,fill:i===1?'#9fb0c0':'#586676','font-family':'IBM Plex Mono','font-size':14},svg);t2.textContent=b});
    F.forEach(([lab,a,b])=>{const A=box(a),B=box(b);let d,lx,ly,anchor='middle';
      if(!mob){const fwd=b>a,y=fwd?A.y+30:A.y+A.h-30,x1=fwd?A.x+A.w:A.x,x2=fwd?B.x:B.x+B.w,cy=fwd?y-90:y+90;
        d=`M${x1} ${y} C ${x1+(x2-x1)*.35} ${cy}, ${x1+(x2-x1)*.65} ${cy}, ${x2} ${y}`;lx=(x1+x2)/2;ly=fwd?y-78:y+92}
      else{const fwd=b>a,x=fwd?152:248,y1=fwd?A.y+A.h:A.y,y2=fwd?B.y:B.y+B.h;d=`M${x} ${y1} L ${x} ${y2}`;lx=fwd?x-12:x+12;ly=(y1+y2)/2-6;anchor=fwd?'end':'start'}
      mkS('path',{d,class:'flow',fill:'none',stroke:INK,'stroke-width':1.3,'stroke-dasharray':'5 5'},svg);
      const t=mkS('text',{x:lx,y:ly,'text-anchor':anchor,fill:INK,'font-family':'Archivo','font-size':mob?14:17,'font-weight':600},svg);
      if(!mob)t.textContent=lab;else{const w=lab.split(' '),h=Math.ceil(w.length/2);[w.slice(0,h).join(' '),w.slice(h).join(' ')].forEach((s,k)=>{const sp=mkS('tspan',{x:lx,dy:k?17:0},t);sp.textContent=s})}});
    paths=[...svg.querySelectorAll('path.flow')];dots=paths.map(()=>mkS('circle',{r:6,fill:BLUE},svg));L=paths.map(p=>p.getTotalLength());
  }
  function draw(t){paths.forEach((p,i)=>{const k=((t*.22+i*.33)%1);const pt=p.getPointAtLength(k*L[i]);dots[i].setAttribute('cx',pt.x);dots[i].setAttribute('cy',pt.y)})}
  build();addEventListener('hy:lang',()=>{build();draw(.4)});
  sim(svg.parentElement,{tick:(dt,t)=>draw(t),still:()=>draw(.4)});
})();

/* F — simulator section: the same equipment software runs against a HYTEK simulator or the real tool */
(function(){
  const svg=document.getElementById('simSwitch');if(!svg)return;
  const INK='#09131f',BLUE='#0b6ac7',MUTE='#586676';let lever,dotA,dotB,pathSim,pathReal,simBox,realBox,lenS,lenR;
  function txt(x,y,s,o={}){const t=mkS('text',Object.assign({x,y,fill:INK,'font-family':'Archivo','font-size':18,'font-weight':700},o),svg);t.textContent=s;return t}
  let G;
  function build(){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    const mob=innerWidth<=900;
    G=mob?{vb:'0 0 400 600',sw:[40,10,320,150],swT:[60,48],ifc:[100,196,200,124],sim:[8,382,188,150],real:[204,382,188,150],piv:[200,345],aSim:125,aReal:55,
           ps:'M200 320 L200 345 C 200 360, 102 360, 102 382',pr:'M200 320 L200 345 C 200 360, 298 360, 298 382',link:[200,160,200,196],fs:15,ls:13,lh:22}
          :{vb:'0 0 720 495',sw:[24,150,220,190],swT:[44,196],ifc:[290,170,140,150],sim:[496,56,204,150],real:[496,290,204,150],piv:[452,245],aSim:-45,aReal:45,
           ps:'M430 245 C 466 245, 460 131, 496 131',pr:'M430 245 C 466 245, 460 365, 496 365',link:[244,245,290,245],fs:14,ls:12,lh:24};
    svg.setAttribute('viewBox',G.vb);svg.parentElement.style.setProperty('--ar',mob?'400/600':'16/11');
    const [sx,sy,sw,sh]=G.sw;mkS('rect',{x:sx,y:sy,width:sw,height:sh,fill:INK},svg);
    txt(G.swT[0],G.swT[1],T('sw.sw','Equipment software'),{fill:'#fff','font-size':19});
    ['Control · Recipe','HMI · Alarms','GEM/SECS'].forEach((t,i)=>txt(G.swT[0],G.swT[1]+38+i*28,t,{fill:'#9fb0c0','font-family':'IBM Plex Mono','font-size':14,'font-weight':500}));
    const [ix,iy,iw,ih]=G.ifc,icx=ix+iw/2;mkS('rect',{x:ix,y:iy,width:iw,height:ih,fill:'#fff',stroke:INK,'stroke-width':1.6},svg);
    txt(icx,iy+32,T('sw.if','Same interfaces'),{'text-anchor':'middle','font-size':15});
    ['Modbus · Serial','TCP/IP','DeviceNet','SECS/GEM'].forEach((t,i)=>txt(icx,iy+58+i*19,t,{'text-anchor':'middle',fill:MUTE,'font-family':'IBM Plex Mono','font-size':12,'font-weight':500}));
    mkS('line',{x1:G.link[0],y1:G.link[1],x2:G.link[2],y2:G.link[3],stroke:INK,'stroke-width':2},svg);
    const box=(b,title,lines)=>{const r=mkS('rect',{x:b[0],y:b[1],width:b[2],height:b[3],fill:'#fff',stroke:INK,'stroke-width':1.6},svg);
      txt(b[0]+14,b[1]+38,title,{'font-size':mob?15.5:18});lines.forEach((t,i)=>txt(b[0]+16,b[1]+68+i*G.lh,t,{fill:MUTE,'font-size':G.fs-1,'font-weight':500}));return r};
    simBox=box(G.sim,T('sw.sim','HYTEK simulator'),[T('sw.s1','Virtual chambers · robot'),T('sw.s2','Device & I/O models'),T('sw.s3','Fault injection')]);
    realBox=box(G.real,T('sw.real','Real equipment'),[T('sw.r1','Chambers · robot'),T('sw.r2','Devices · PLC · I/O'),T('sw.r3','Factory host')]);
    pathSim=mkS('path',{d:G.ps,fill:'none',stroke:INK,'stroke-width':1.4,'stroke-dasharray':'5 5'},svg);
    pathReal=mkS('path',{d:G.pr,fill:'none',stroke:INK,'stroke-width':1.4,'stroke-dasharray':'5 5'},svg);
    lenS=pathSim.getTotalLength();lenR=pathReal.getTotalLength();
    mkS('circle',{cx:G.piv[0],cy:G.piv[1],r:7,fill:'#fff',stroke:INK,'stroke-width':2},svg);
    lever=mkS('line',{x1:G.piv[0],y1:G.piv[1],x2:G.piv[0],y2:G.piv[1],stroke:BLUE,'stroke-width':5,'stroke-linecap':'round'},svg);
    dotA=mkS('circle',{r:6,fill:BLUE},svg);dotB=mkS('circle',{r:6,fill:BLUE},svg);
  }
  function draw(t){
    const c=t%8,toSim=c<4,k=Math.min(1,(c%4)/.5),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    const from=toSim?G.aReal:G.aSim,to=toSim?G.aSim:G.aReal,ang=(from+(to-from)*e)*Math.PI/180;
    lever.setAttribute('x2',G.piv[0]+38*Math.cos(ang));lever.setAttribute('y2',G.piv[1]+38*Math.sin(ang));
    simBox.setAttribute('stroke',toSim?BLUE:INK);simBox.setAttribute('stroke-width',toSim?3:1.6);
    realBox.setAttribute('stroke',toSim?INK:BLUE);realBox.setAttribute('stroke-width',toSim?1.6:3);
    const p=toSim?pathSim:pathReal,len=toSim?lenS:lenR,f=((t*.5)%1),g=((t*.5+.5)%1);
    const a=p.getPointAtLength(f*len),b=p.getPointAtLength(g*len);dotA.setAttribute('cx',a.x);dotA.setAttribute('cy',a.y);dotB.setAttribute('cx',b.x);dotB.setAttribute('cy',b.y);
  }
  build();addEventListener('hy:lang',()=>{build();draw(1)});
  sim(svg.parentElement,{tick:(dt,t)=>draw(t),still:()=>draw(1)});
})();


})();
