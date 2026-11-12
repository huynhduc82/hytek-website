/* HYTEK — equipment platform simulations (Equipment section).
   One Three.js viewer; each platform button builds its own configuration and runs a wafer-transfer sequence.
   All geometry is simulated (no client photographs or CAD). A button may later carry
   data-glb="models/x.glb" or data-video="video/x.mp4" with the team's own 3D work; that file then replaces the simulation.
   Classic script: Three.js comes in with dynamic import() through the importmap, so file:// works. */
(function(){
'use strict';
const T=(k,en)=>(window.HY_T?window.HY_T(k,en):en);
const RM=document.documentElement.classList.contains('rm');
const view=document.getElementById('eqView');if(!view)return;
const btns=[...document.querySelectorAll('.pl')];
const nameEl=document.getElementById('eqName'),stateEl=document.getElementById('eqState'),glHost=document.getElementById('eqGl');
const NS='http://www.w3.org/2000/svg';
const mk=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
const layoutCluster=window.HY_EQKIT.layoutCluster;

/* ---- mini top-view diagram on each button ---- */
btns.forEach(b=>{
  const svg=b.querySelector('.mini'),cfg=b.dataset.cfg,cx=56,cy=32;
  if(cfg==='sps'){mk('rect',{x:18,y:14,width:22,height:38},svg);mk('circle',{class:'pm',cx:70,cy,r:20},svg);mk('circle',{cx:70,cy,r:11},svg);return}
  if(cfg==='sll'){mk('rect',{x:14,y:22,width:22,height:20,fill:'#09131f'},svg);mk('rect',{x:40,y:24,width:14,height:16},svg);mk('circle',{class:'pm',cx:80,cy,r:20},svg);mk('circle',{cx:80,cy,r:9},svg);return}
  if(cfg==='mca'){[18,40,62].forEach(x=>mk('rect',{x,y:46,width:16,height:12,fill:'#09131f'},svg));mk('line',{x1:14,y1:38,x2:84,y2:38},svg);mk('rect',{x:34,y:14,width:16,height:16},svg);mk('circle',{class:'pm',cx:80,cy:22,r:14},svg);return}
  const ll=+b.dataset.ll,pm=+b.dataset.pm,n=ll+pm,sides=n<=4?4:n<=6?6:8,R=11;
  const vo=cfg==='pvd'?.5:0,pts=[];for(let k=0;k<sides;k++){const a=Math.PI/2+(k+vo)*2*Math.PI/sides;pts.push((cx+R*Math.cos(a)).toFixed(1)+','+(cy+R*Math.sin(a)).toFixed(1))}
  mk('polygon',{points:pts.join(' ')},svg);
  layoutCluster(b.dataset.cfg).forEach(s=>{const x=cx+23*Math.cos(s.a),y=cy+20*Math.sin(s.a);
    if(s.kind==='ll')mk('rect',{x:x-5,y:y-5,width:10,height:10,fill:'#09131f'},svg);else mk('circle',{class:'pm',cx:x,cy:y,r:6.5,'stroke-dasharray':s.opt?'2 2':null},svg)});
});


/* ---- selection ---- */
let current=btns.find(b=>b.getAttribute('aria-pressed')==='true')||btns[0],api=null;
const setName=()=>{nameEl.textContent=current.querySelector('b').textContent};
setName();addEventListener('hy:lang',setName);
btns.forEach(b=>b.addEventListener('click',()=>{
  current=b;btns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setName();
  if(api)api.load(b);
  if(innerWidth<=900){const r=view.getBoundingClientRect();if(r.top<64||r.bottom>innerHeight)view.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
}));

/* pause control, same as the other simulations */
let paused=false;
if(!RM){const pb=document.createElement('button');pb.type='button';pb.className='simpause';
  const set=()=>{pb.setAttribute('aria-label',paused?T('ui.play','Play animation'):T('ui.pause','Pause animation'));pb.innerHTML=`<svg class="i" aria-hidden="true"><use href="#${paused?'play':'pause'}"/></svg>`};
  set();pb.onclick=()=>{paused=!paused;set()};view.appendChild(pb);addEventListener('hy:lang',set)}

/* loading line while Three.js arrives; replaced by a plain message when WebGL is missing */
const wait=document.createElement('p');wait.className='gl-wait';wait.setAttribute('aria-hidden','true');view.appendChild(wait);
let glFailed=false;
const waitText=()=>{wait.textContent=glFailed?T('ui.gl.fail','The 3D model could not load. Check the connection or try another browser.'):T('ui.gl.wait','Loading 3D model…')};
waitText();addEventListener('hy:lang',waitText);view.setAttribute('aria-busy','true');

let started=false;
function start(){if(started)return;started=true;removeEventListener('scroll',near);init().then(()=>{view.classList.add('ready');view.removeAttribute('aria-busy')}).catch(e=>{console.warn('HYTEK: platform viewer unavailable',e);glFailed=true;waitText();view.classList.add('fail');view.removeAttribute('aria-busy');stateEl.textContent=''})}
function near(){const b=view.getBoundingClientRect();if(b.top<innerHeight+300&&b.bottom>-300)start()}
new IntersectionObserver(es=>{if(es[0].isIntersecting)start()},{rootMargin:'300px'}).observe(view);
addEventListener('scroll',near,{passive:true});near();
// build the viewer while the visitor reads the hero, so its setup and shader compile never land in the middle of a scroll
const later=f=>'requestIdleCallback' in window?requestIdleCallback(f,{timeout:2500}):setTimeout(f,1200);
if(document.readyState==='complete')later(start);else addEventListener('load',()=>later(start));
const idle=()=>new Promise(res=>'requestIdleCallback' in window?requestIdleCallback(()=>res(),{timeout:400}):setTimeout(res,16));

async function init(){
  const THREE=await import('three');
  const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
  const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
  // thick outline for the active station (plain WebGL lines are always 1px)
  const [{LineSegments2},{LineSegmentsGeometry},{LineMaterial}]=await Promise.all([import('three/addons/lines/LineSegments2.js'),import('three/addons/lines/LineSegmentsGeometry.js'),import('three/addons/lines/LineMaterial.js')]);
  const W=()=>view.clientWidth,H=()=>view.clientHeight;
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W(),H());glHost.appendChild(r.domElement);
  r.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene();scene.environment=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.04).texture;
  await idle();
  scene.add(new THREE.HemisphereLight(0xffffff,0x8fa0b0,1.5));
  const sun=new THREE.DirectionalLight(0xffffff,2.0);sun.position.set(5,9,6);scene.add(sun);
  const cam=new THREE.PerspectiveCamera(30,W()/H(),.1,200);
  const controls=new OrbitControls(cam,r.domElement);
  controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.08;
  controls.minPolarAngle=.35;controls.maxPolarAngle=1.3;
  // the camera turns toward the station the robot is working on; a drag hands control to the visitor for 4 s
  let follow=!RM,focus=null,resumeT=0;controls.addEventListener('start',()=>{follow=false;clearTimeout(resumeT)});
  controls.addEventListener('end',()=>{if(!RM)resumeT=setTimeout(()=>follow=true,4000)});

  const K=window.HY_EQKIT(THREE);
  const {C,M,mesh,inkLine,ink,waferGeo,processChamber,ionBeamChamber,loadlock,cassette,transferChamber,robot,dressCluster}=K;

  /* ---------- scene state ---------- */
  let root=null,stations=[],rob=null,wafer=null,carry=false,seq=[],si=0,st=0,theta=0,reach=.35,trackX=0,labels=[],extra=null,inkMats=[],procGlow=null,procT=0,videoEl=null;
  const minJerk=x=>x<=0?0:x>=1?1:x*x*x*(10-15*x+6*x*x);
  const angDiff=(a,b)=>{let d=b-a;return ((d+Math.PI*3)%(Math.PI*2))-Math.PI};
  function clear(){
    if(root){scene.remove(root);root.traverse(o=>{if(o.geometry&&o.geometry!==waferGeo)o.geometry.dispose();if(o.material&&o.material.userData&&o.material.userData.tintClone)o.material.dispose()})}
    labels.forEach(l=>l.d.remove());labels=[];stations=[];focus=null;seq=[];si=0;st=0;rob=null;extra=null;carry=false;procGlow=null;
    if(videoEl){videoEl.remove();videoEl=null}r.domElement.style.display='';
  }
  function label(text,obj,yTop,opt){const d=document.createElement('div');d.className='eqlbl'+(opt?' opt':'');d.textContent=text;view.appendChild(d);labels.push({d,obj,y:yTop});return d}

  function buildCluster(cfg){
    const L=layoutCluster(cfg),n=cfg==='hc'?8:cfg==='mc'?6:cfg==='pvd'?4:0;
    const ap=cfg==='hc'?1.05:cfg==='mc'?.8:cfg==='pvd'?.75:.4;
    if(n)root.add(transferChamber(n,ap,cfg==='pvd'?.5:0));
    else root.add(transferChamber(4,.45,.5)); // square transfer box between loadlock and chamber, same see-through walls
    L.forEach(s=>{
      const unit=s.kind==='ll'?loadlock():s.kind==='ib'?ionBeamChamber():processChamber(s.opt);
      const depth=s.kind==='ll'?.4:s.kind==='ib'?.62:.7,D=ap+depth;
      unit.g.position.set(Math.cos(s.a)*D,0,Math.sin(s.a)*D);unit.g.rotation.y=-s.a;root.add(unit.g);
      const st={...s,unit,D,lbl:null};st.lbl=label(s.name+(s.opt?' · opt.':''),unit.g,unit.top,s.opt);stations.push(st);
    });
    // the equipment around the tool, same parts as the hub's equipment map
    if(n)dressCluster(cfg,stations,ap).forEach(({g})=>root.add(g));
    const maxD=Math.max(...stations.map(s=>s.D));rob=robot(maxD/2+.06);root.add(rob.g);
    // sequence: LL → PM (process) → other LL, cycling through the process modules
    const lls=stations.filter(s=>s.kind==='ll'),pms=stations.filter(s=>s.kind!=='ll');let src=0;
    seq.push({t:'home'});
    pms.forEach((pm,i)=>{const a=lls[src%lls.length],b=lls[(src+1)%lls.length];
      seq.push(...transfer(a,pm),{t:'proc',s:pm,d:2.2},...transfer(pm,b));src++});
    placeWaferAt(lls[0]);
  }
  function transfer(a,b){return [{t:'rot',s:a},{t:'ext',s:a},{t:'pick',s:a},{t:'ret'},{t:'rot',s:b},{t:'ext',s:b},{t:'place',s:b},{t:'ret'}]}

  function buildLoader(){ // multi-cassette automated loader: robot on a linear track
    const track=mesh(new THREE.BoxGeometry(3.6,.08,.3),M.dark,[0,.3,0]);root.add(track);
    root.add(mesh(new THREE.BoxGeometry(3.8,.3,.5),M.frame,[0,.15,0]));
    const xs=[-1.2,0,1.2];
    xs.forEach((x,i)=>{const u=cassette();u.g.position.set(x,0,1.15);root.add(u.g);const s={name:'CST '+(i+1),kind:'cst',a:Math.PI/2,unit:u,D:1.15,x};s.lbl=label(s.name,u.g,u.top);stations.push(s)});
    const ll=loadlock();ll.g.position.set(0,0,-1.0);ll.g.rotation.y=Math.PI/2;root.add(ll.g);
    const sLL={name:'LL',kind:'ll',a:-Math.PI/2,unit:ll,D:1.0,x:0};sLL.lbl=label('LL',ll.g,ll.top);stations.push(sLL);
    const ib=ionBeamChamber();ib.g.position.set(0,0,-2.3);ib.g.rotation.y=Math.PI/2;root.add(ib.g);
    const sIB={name:'IBE / IBD',kind:'ib',unit:ib};sIB.lbl=label('IBE / IBD',ib.g,ib.top);stations.push(sIB);
    rob=robot(.62);root.add(rob.g);
    seq.push({t:'home'});
    stations.filter(s=>s.kind==='cst').forEach(c=>{
      seq.push({t:'move',x:c.x},{t:'rot',s:c},{t:'ext',s:c},{t:'pick',s:c},{t:'ret'},{t:'move',x:0},{t:'rot',s:sLL},{t:'ext',s:sLL},{t:'place',s:sLL},{t:'ret'},
               {t:'proc',s:sIB,d:2.4,via:sLL},{t:'ext',s:sLL},{t:'pick',s:sLL},{t:'ret'},{t:'move',x:c.x},{t:'rot',s:c},{t:'ext',s:c},{t:'place',s:c},{t:'ret'})});
    placeWaferAt(stations[0]);
  }

  function buildStandalone(){ // one-package system: chamber, frame, electronics rack, gas box; lid opens to load
    root.add(mesh(new THREE.BoxGeometry(3.2,.35,1.5),M.frame,[0,.175,0]));
    const pc=processChamber(false,true);pc.g.position.set(.2,.05,0);pc.g.rotation.y=-Math.PI/2;root.add(pc.g);
    const rack=new THREE.Group();rack.add(mesh(new THREE.BoxGeometry(.8,1.5,1.1),M.steelD,[0,1.1,0]));
    for(let i=0;i<6;i++)rack.add(mesh(new THREE.BoxGeometry(.02,.06,.8),M.black,[.41,.6+i*.18,0]));
    rack.add(mesh(new THREE.BoxGeometry(.02,.16,.3),M.blue,[.41,1.65,.2]));rack.position.set(-1.15,0,0);root.add(rack);
    const gas=new THREE.Group();gas.add(mesh(new THREE.BoxGeometry(.5,.7,.9),M.steel,[0,.7,0]));
    for(let i=0;i<3;i++)gas.add(mesh(new THREE.BoxGeometry(.12,.22,.12),i===1?M.blue:M.steelD,[.26,.75,-.25+i*.25]));gas.position.set(1.35,0,0);root.add(gas);
    // lid hinge on the back edge of the chamber
    const lidPivot=new THREE.Group();lidPivot.position.set(.2,1.07,-.66);root.add(lidPivot);
    lidPivot.add(mesh(new THREE.CylinderGeometry(.68,.68,.06,56),M.shell,[0,0,.66]),mesh(new THREE.CylinderGeometry(.28,.28,.22,32),M.shellD,[0,.14,.66]),mesh(new THREE.TorusGeometry(.33,.03,8,40),M.copper,[0,.08,.66],[Math.PI/2,0,0]));
    const s={name:T('eq.chamber','Process chamber'),kind:'pm',unit:pc};s.lbl=label('RIE / PVD',pc.g,1.45);stations.push(s);
    label('Rack',rack,1.95);label('Gas',gas,1.15);
    extra={lidPivot};
    wafer=mesh(waferGeo,M.wafer);wafer.userData.noEdge=true;root.add(wafer);
    seq=[{t:'lid',to:-1.15,lab:'OPEN LID'},{t:'drop',from:1.9,lab:'LOAD WAFER'},{t:'lid',to:0,lab:'CLOSE LID'},{t:'wait',d:.9,lab:'PUMPDOWN'},
         {t:'proc',s,d:2.6,lab:'PROCESS · RIE / PVD'},{t:'wait',d:.8,lab:'VENT'},{t:'lid',to:-1.15,lab:'OPEN LID'},{t:'drop',from:1.9,up:true,lab:'UNLOAD WAFER'},{t:'lid',to:0,lab:'CLOSE LID'},{t:'wait',d:.8,lab:'IDLE'}];
  }

  function placeWaferAt(s){
    if(!wafer){wafer=mesh(waferGeo,M.wafer);wafer.userData.noEdge=true;root.add(wafer)}
    const p=s.unit.wafer.clone();s.unit.g.localToWorld(p);root.worldToLocal(p);wafer.position.copy(p);wafer.rotation.set(0,0,0);
  }
  function stationAngle(s){return s.a}
  function stationReach(s){return s.D}

  function frameCamera(){
    const box=new THREE.Box3().setFromObject(root),sph=box.getBoundingSphere(new THREE.Sphere());
    const d=sph.radius/Math.sin((cam.fov*Math.PI/180)/2)*(W()/H()<1?1.25:.98);
    controls.target.copy(sph.center);cam.position.set(sph.center.x+d*.62,sph.center.y+d*.55,sph.center.z+d*.56);controls.update();
  }

  function load(b){
    clear();root=new THREE.Group();scene.add(root);wafer=null;
    if(b.dataset.video){videoEl=document.createElement('video');Object.assign(videoEl,{src:b.dataset.video,muted:true,loop:true,playsInline:true,autoplay:!RM});view.insertBefore(videoEl,view.firstChild);r.domElement.style.display='none';stateEl.textContent='';return}
    if(b.dataset.glb){import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader().load(b.dataset.glb,g=>{root.add(g.scene);frameCamera()}));stateEl.textContent='';return}
    const cfg=b.dataset.cfg;
    if(cfg==='mca')buildLoader();else if(cfg==='sps')buildStandalone();else buildCluster(cfg);
    inkMats=[ink(root)];
    stations.forEach(s=>{s.inkMat=new THREE.LineBasicMaterial({color:C.blue,transparent:true,opacity:0});ink(s.unit.g,s.inkMat);s.tint=K.tintable(s.unit.g);s.mark=K.marker(s.unit.g);s.markF=0;s.markOn=false;root.add(s.mark);
      s.xray=new THREE.LineBasicMaterial({color:C.blue,transparent:true,opacity:0,depthTest:false,depthWrite:false});ink(s.unit.g,s.xray);
      s.fat=new LineMaterial({color:C.blue,linewidth:2,transparent:true,opacity:0,depthWrite:false});s.fat.visible=false;s.fat.userData.tintClone=true;s.fat.resolution.set(W(),H());
      const ms=[];s.unit.g.traverse(o=>{if(o.isMesh&&!o.userData.noEdge)ms.push(o)}); // LineSegments2 is a Mesh too: collect first
      ms.forEach(o=>{const l=new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(o.geometry,28)),s.fat);l.userData.noEdge=true;o.add(l)})});
    theta=stations[0]&&stations[0].a!=null?stations[0].a:0;reach=.35;trackX=stations[0]&&stations[0].x!=null?stations[0].x:0;
    if(rob){rob.g.rotation.y=-theta;rob.g.position.x=trackX;rob.pose(reach)}
    frameCamera();
    if(RM){ // reduced motion: a still frame with the wafer in the first process module
      const pm=stations.find(s=>s.kind==='pm'||s.kind==='ib');if(pm&&rob)placeWaferAt(pm);
      if(pm&&pm.unit.glow)pm.unit.glow.opacity=.25;if(extra)wafer.position.set(.2,.53,0);
      stateEl.textContent='';render();
    }
  }

  /* ---------- sequencer ---------- */
  let from={};
  function begin(a){
    st=0;from={theta,reach,trackX,lid:extra?extra.lidPivot.rotation.x:0};
    const lab=a.lab||({home:'HOMING',rot:'ROTATE → '+(a.s&&a.s.name),ext:'EXTEND → '+(a.s&&a.s.name),pick:'PICK '+(a.s&&a.s.name),place:'PLACE '+(a.s&&a.s.name),ret:'RETRACT',proc:'PROCESS '+(a.s&&a.s.name),move:'TRACK → X '+(a.x!=null?a.x.toFixed(1):'')}[a.t]||'');
    stateEl.textContent=lab;
    if(a.s&&a.s.unit)focus=a.s;
    stations.forEach(s=>{const on=a.s===s||Boolean(a.via&&a.via===s);if(s.inkMat)s.inkMat.opacity=on?1:0;if(s.tint)s.tint.set(on?2:0);s.markOn=on;if(RM&&s.mark){s.markF=on?1:0;showMark(s)}if(s.lbl)s.lbl.classList.toggle('on',on)});
    if(a.t==='proc'&&a.s&&a.s.lbl)a.s.lbl.classList.add('on');
    if(a.t==='pick')carry=true;
  }
  function dur(a){
    switch(a.t){case 'home':return 1.2;case 'rot':return .45+Math.abs(angDiff(theta,a.s.a))*.42;case 'ext':return .75;case 'ret':return .65;
      case 'pick':case 'place':return .35;case 'proc':return a.d;case 'move':return .5+Math.abs(a.x-trackX)*.45;case 'lid':return 1.0;case 'drop':return 1.1;case 'wait':return a.d}return .5}
  let active=null,activeDur=1;
  function step(dt){
    if(!seq.length)return;
    if(!active){active=seq[si];activeDur=dur(active);begin(active)}
    st+=dt/activeDur;const k=minJerk(Math.min(st,1)),a=active;
    switch(a.t){
      case 'home':{reach=from.reach+(.32-from.reach)*k;const h=Math.sin(Math.min(st,1)*Math.PI);rob&&rob.pose(reach+h*.08);break}
      case 'rot':theta=from.theta+angDiff(from.theta,a.s.a)*k;break;
      case 'ext':reach=from.reach+(a.s.D-from.reach)*k;break;
      case 'ret':reach=from.reach+(.35-from.reach)*k;break;
      case 'move':trackX=from.trackX+(a.x-from.trackX)*k;break;
      case 'pick':case 'place':{const lift=(a.t==='pick'?k:1-k)*.04;if(rob)rob.tip.position.y=.57+lift;break}
      case 'proc':{const g=a.s.unit.glow;if(g)g.opacity=Math.sin(Math.min(st,1)*Math.PI)*(.22+.06*Math.sin(st*60));break}
      case 'lid':{extra.lidPivot.rotation.x=from.lid+(a.to-from.lid)*k;break}
      case 'drop':{const y0=a.up?.53:a.from,y1=a.up?a.from:.53;wafer.position.set(.2,y0+(y1-y0)*k,0);break}
    }
    if(rob){rob.g.rotation.y=-theta;rob.g.position.x=trackX;if(a.t!=='home')rob.pose(reach)}
    if(carry&&rob&&wafer){const p=new THREE.Vector3();rob.tip.getWorldPosition(p);root.worldToLocal(p);wafer.position.copy(p)}
    if(st>=1){
      if(a.t==='place'){carry=false;placeWaferAt(a.s)}
      if(a.t==='proc'&&a.s.unit.glow)a.s.unit.glow.opacity=0;
      active=null;si=(si+1)%seq.length;if(si===0&&seq[0].t==='home')si=1;
    }
  }

  /* ---------- render loop ---------- */
  const v=new THREE.Vector3();let visible=true,last=performance.now(),SW=W(),SH=H();
  new ResizeObserver(()=>{SW=W();SH=H()}).observe(view); // size read on resize, not in every frame
  new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(view); // only while on screen (see app.js onScreen)
  function draw(){
    r.render(scene,cam);
    const vw=SW,vh=SH;
    labels.forEach(l=>{v.set(0,l.y,0);l.obj.localToWorld(v);v.project(cam);l.d.style.left=((v.x*.5+.5)*vw)+'px';l.d.style.top=((-v.y*.5+.5)*vh)+'px';l.d.style.display=v.z<1?'':'none'});
  }
  function render(){controls.update();draw()}
  let pulse=0;const sph=new THREE.Spherical(),off=new THREE.Vector3(),fp=new THREE.Vector3();
  function showMark(s){const p=RM?0:(1-Math.cos(pulse*Math.PI*2/2.6))/2;s.mark.userData.show(s.markF,p);s.fat.opacity=s.markF;s.fat.visible=s.markF>.01;s.xray.opacity=.3*s.markF}
  function follow3d(dt){ // ease the camera's azimuth to a three-quarter view of the focused station
    if(!follow||!focus)return;focus.unit.g.getWorldPosition(fp);const t=controls.target;
    if(Math.hypot(fp.x-t.x,fp.z-t.z)<.3)return;
    off.copy(cam.position).sub(t);sph.setFromVector3(off);
    const want=Math.atan2(fp.x-t.x,fp.z-t.z)+.55;sph.theta+=angDiff(sph.theta,want)*Math.min(1,dt*1.1);
    off.setFromSpherical(sph);cam.position.copy(t).add(off)}
  function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!visible)return;
    if(!RM&&!paused){step(dt);pulse+=dt;follow3d(dt);stations.forEach(s=>{if(!s.mark)return;const k=Math.min(1,dt*7);s.markF+=((s.markOn?1:0)-s.markF)*k;showMark(s)})}render()}
  addEventListener('resize',()=>{r.setSize(W(),H());stations.forEach(s=>{if(s.fat)s.fat.resolution.set(W(),H())});cam.aspect=W()/H();cam.updateProjectionMatrix();frameCamera();if(RM)render()});
  api={load};await idle();load(current);
  // compile every shader off the main thread where the browser can, before the first frame draws
  await idle();if(r.compileAsync)await r.compileAsync(scene,cam);else r.compile(scene,cam);
  await idle();render(); // first use of each program (driver checks) happens now, not on the first scrolled frame
  if(!RM)requestAnimationFrame(loop);else{controls.enableDamping=false;controls.addEventListener('change',draw);render()}
}
})();
