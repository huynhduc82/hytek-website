/* HYTEK equipment kit: simulated Three.js parts shared by the About equipment viewer and the hub equipment map.
   Parametric shapes only (no CAD, no photographs). Usage: const K = HY_EQKIT(THREE); HY_EQKIT.layoutCluster(cfg). */
(function(){
'use strict';
function HY_EQKIT(THREE){
  const C={ink:0x09131f,blue:0x0b6ac7};
  const M={
    steel:new THREE.MeshStandardMaterial({color:0xd9dde1,metalness:.75,roughness:.3,side:THREE.DoubleSide}),
    steelD:new THREE.MeshStandardMaterial({color:0x9aa1a8,metalness:.7,roughness:.4}),
    dark:new THREE.MeshStandardMaterial({color:0x2a3138,metalness:.4,roughness:.55}),
    black:new THREE.MeshStandardMaterial({color:0x1a1b1d,metalness:.2,roughness:.6}),
    blue:new THREE.MeshStandardMaterial({color:C.blue,metalness:.2,roughness:.45}),
    frame:new THREE.MeshStandardMaterial({color:0xc4ccd3,metalness:.3,roughness:.7}),
    copper:new THREE.MeshStandardMaterial({color:0xd08a4c,metalness:.8,roughness:.3}),
    glass:new THREE.MeshPhysicalMaterial({color:0xcfe3f5,metalness:0,roughness:.05,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}),
    ghost:new THREE.MeshStandardMaterial({color:0xd9dde1,metalness:.5,roughness:.4,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}),
    wafer:new THREE.MeshPhysicalMaterial({color:0x7f97c9,metalness:.55,roughness:.12,iridescence:1,iridescenceIOR:1.7,clearcoat:1}),
    arm:new THREE.MeshStandardMaterial({color:0xe8ecef,metalness:.5,roughness:.3}),
  };
  const mesh=(g,m,p,rt)=>{const o=new THREE.Mesh(g,m);if(p)o.position.set(...p);if(rt)o.rotation.set(...rt);return o};
  const inkLine=()=>new THREE.LineBasicMaterial({color:C.ink,transparent:true,opacity:.22});
  function ink(group,mat){const m=mat||inkLine();group.traverse(o=>{if(o.isMesh&&!o.userData.noEdge)o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,28),m))});return m}
  const waferGeo=new THREE.CylinderGeometry(.3,.3,.015,48);

  /* ---------- builders ---------- */
  function processChamber(opt,hinged){ // vertical PVD/RIE-style process module, cutaway facing +x (outward)
    const g=new THREE.Group(),body=opt?M.ghost:M.steel;
    g.add(mesh(new THREE.BoxGeometry(1.1,.3,1.1),M.frame,[0,.15,0]));
    g.add(mesh(new THREE.CylinderGeometry(.62,.62,.62,56,1,true,Math.PI*.8,Math.PI*1.4),body,[0,.62,0]));
    [.31,.93].forEach(y=>g.add(mesh(new THREE.TorusGeometry(.62,.03,8,56),M.steelD,[0,y,0],[Math.PI/2,0,0])));
    if(!hinged){g.add(mesh(new THREE.CylinderGeometry(.66,.66,.08,56),opt?M.ghost:M.steel,[0,.97,0]));
    g.add(mesh(new THREE.CylinderGeometry(.28,.28,.22,32),M.steelD,[0,1.12,0]));
    g.add(mesh(new THREE.TorusGeometry(.33,.03,8,40),M.copper,[0,1.06,0],[Math.PI/2,0,0]));}
    g.add(mesh(new THREE.CylinderGeometry(.42,.45,.1,48),M.steelD,[0,.42,0]));
    g.add(mesh(new THREE.CylinderGeometry(.22,.22,.25,32),M.dark,[0,.12,.62]));
    const plasma=mesh(new THREE.CylinderGeometry(.5,.42,.4,40,1,true),new THREE.MeshBasicMaterial({color:0x4fa8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),[0,.68,0]);
    plasma.userData.noEdge=true;g.add(plasma);
    return {g,wafer:new THREE.Vector3(0,.48,0),glow:plasma.material,top:1.3};
  }
  function ionBeamChamber(){ // horizontal IBE/IBD chamber, ion source on the far end, open on top
    const g=new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(1.5,.3,1.0),M.frame,[.15,.15,0]));
    g.add(mesh(new THREE.CylinderGeometry(.55,.55,1.2,56,1,true,Math.PI*.65,Math.PI*1.7),M.steel,[.15,.82,0],[0,0,Math.PI/2]));
    [-.45,.75].forEach(x=>g.add(mesh(new THREE.TorusGeometry(.55,.03,8,56),M.steelD,[x,.82,0],[0,Math.PI/2,0])));
    g.add(mesh(new THREE.CylinderGeometry(.34,.34,.38,40),M.steelD,[.95,.82,0],[0,0,Math.PI/2]));
    g.add(mesh(new THREE.CylinderGeometry(.36,.36,.06,40),M.blue,[.8,.82,0],[0,0,Math.PI/2]));
    g.add(mesh(new THREE.CylinderGeometry(.36,.36,.1,40),M.black,[1.16,.82,0],[0,0,Math.PI/2]));
    g.add(mesh(new THREE.BoxGeometry(.08,.5,.5),M.steelD,[-.12,.72,0]));
    g.add(mesh(new THREE.CylinderGeometry(.2,.2,.3,32),M.dark,[.15,.15,.55]));
    const beam=mesh(new THREE.CylinderGeometry(.12,.28,.85,32,1,true),new THREE.MeshBasicMaterial({color:0x4fa8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),[.35,.82,0],[0,0,Math.PI/2]);
    beam.userData.noEdge=true;g.add(beam);
    return {g,wafer:new THREE.Vector3(-.08,.74,0),glow:beam.material,top:1.5,vertWafer:true};
  }
  function loadlock(){
    const g=new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(.75,.3,.75),M.frame,[0,.15,0]));
    g.add(mesh(new THREE.BoxGeometry(.7,.5,.66),M.steel,[0,.55,0]));
    g.add(mesh(new THREE.BoxGeometry(.06,.36,.5),M.black,[.37,.55,0]));
    const lid=mesh(new THREE.BoxGeometry(.6,.02,.56),M.glass,[0,.81,0]);lid.userData.noEdge=true;g.add(lid);
    for(let i=0;i<4;i++)g.add(mesh(new THREE.BoxGeometry(.5,.01,.04),M.steelD,[0,.36+i*.05,-.24]));
    return {g,wafer:new THREE.Vector3(0,.48,0),glow:null,top:.95};
  }
  function cassette(){
    const g=new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(.7,.06,.7),M.dark,[0,.42,0]));
    [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([x,z])=>g.add(mesh(new THREE.BoxGeometry(.04,.5,.04),M.blue,[x,.7,z])));
    for(let i=0;i<5;i++){const w=mesh(waferGeo,M.wafer,[0,.5+i*.08,0]);w.userData.noEdge=true;g.add(w)}
    g.add(mesh(new THREE.BoxGeometry(.8,.42,.8),M.frame,[0,.21,0]));
    return {g,wafer:new THREE.Vector3(0,.92,0),glow:null,top:1.1};
  }
  function transferChamber(n,apothem,vOff){
    const R=apothem/Math.cos(Math.PI/n),shape=new THREE.Shape();
    for(let k=0;k<=n;k++){const a=Math.PI/2+(k+vOff)*2*Math.PI/n,x=R*Math.cos(a),z=R*Math.sin(a);k?shape.lineTo(x,-z):shape.moveTo(x,-z)}
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:false});geo.rotateX(-Math.PI/2);
    const g=new THREE.Group();g.add(mesh(geo,M.steelD,[0,.3,0]));
    const lidGeo=new THREE.ExtrudeGeometry(shape,{depth:.02,bevelEnabled:false});lidGeo.rotateX(-Math.PI/2);
    const lid=mesh(lidGeo,M.glass,[0,.64,0]);lid.userData.noEdge=true;g.add(lid);
    const base=new THREE.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:false});base.rotateX(-Math.PI/2);g.add(mesh(base,M.frame,[0,0,0]));
    return g;
  }
  function robot(L){
    const g=new THREE.Group(),y=.5;
    g.add(mesh(new THREE.CylinderGeometry(.16,.18,.2,32),M.dark,[0,y-.1,0]));
    const box=()=>{const m=mesh(new THREE.BoxGeometry(1,.05,.1),M.arm);return m};
    const l1=box(),l2=box(),eff=mesh(new THREE.BoxGeometry(.34,.02,.16),M.blue);
    [l1,l2,eff].forEach(m=>{m.position.y=y;g.add(m)});l2.position.y=y+.05;eff.position.y=y+.05;
    function place(m,a,b){const dx=b.x-a.x,dz=b.z-a.z;m.position.x=(a.x+b.x)/2;m.position.z=(a.z+b.z)/2;m.rotation.y=-Math.atan2(dz,dx);m.scale.x=Math.hypot(dx,dz)}
    const tip=new THREE.Object3D();tip.position.y=y+.07;g.add(tip);
    function pose(reach){const rr=Math.min(reach,2*L-.001),b=Math.acos(rr/(2*L));
      const E={x:L*Math.cos(b),z:-L*Math.sin(b)},Wp={x:rr,z:0};
      place(l1,{x:0,z:0},E);place(l2,E,Wp);eff.position.x=rr-.05;eff.position.z=0;tip.position.x=rr;tip.position.z=0}
    pose(.35);
    return {g,pose,tip};
  }
  return {C,M,mesh,inkLine,ink,waferGeo,processChamber,ionBeamChamber,loadlock,cassette,transferChamber,robot};
}
/* station layout for cluster tools: angle a (x=cos a, z=sin a), kind, name */
function layoutCluster(cfg){
  const out=[],face=(n,i)=>Math.PI/2+i*2*Math.PI/n; // face 0 points to the front (+z)
  if(cfg==='hc'){const n=8;out.push({a:face(n,-.5)+0,kind:'ll',name:'LL-A'},{a:face(n,.5),kind:'ll',name:'LL-B'});
    for(let i=1;i<=6;i++)out.push({a:face(n,.5+i),kind:'pm',name:'PM'+i,opt:i>4});}
  else if(cfg==='mc'){const n=6;out.push({a:face(n,-.5),kind:'ll',name:'LL-A'},{a:face(n,.5),kind:'ll',name:'LL-B'});
    [1.5,2.5,3.5].forEach((f,i)=>out.push({a:face(n,f),kind:'pm',name:'PM'+(i+1)}));}
  else if(cfg==='pvd'){const n=4;out.push({a:face(n,0),kind:'ll',name:'LL'});[1,2,3].forEach((f,i)=>out.push({a:face(n,f),kind:'pm',name:'PM'+(i+1)}));}
  else if(cfg==='sll'){out.push({a:Math.PI,kind:'ll',name:'LL'},{a:0,kind:'ib',name:'IBE / IBD'});}
  return out;
}
HY_EQKIT.layoutCluster=layoutCluster;
window.HY_EQKIT=HY_EQKIT;
})();
