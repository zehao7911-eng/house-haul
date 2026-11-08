import * as P from './primitives.mjs';
import {operator} from './people.mjs';
import {ROUTES,roomsFor,liveRooms,loadBounds,roadFeatures,portals,fits,abilities} from './core.mjs';
const T=window.THREE;
const G=(parent,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g;};
const roomMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.04});
function bake(root,skip=new Set()){
 root.updateWorldMatrix(true,true);const inv=root.matrixWorld.clone().invert(),list=[],old=[];
 root.traverse(o=>{if(!o.isMesh||o.userData.ownMaterial)return;for(let p=o;p&&p!==root;p=p.parent)if(skip.has(p))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));const c=o.material.color||new T.Color('#fff'),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));list.push(g);old.push(o);});
 if(!list.length)return;const n=list.reduce((a,g)=>a+g.attributes.position.count,0),geo=new T.BufferGeometry();for(const key of ['position','normal','color']){const a=new Float32Array(n*3);let offset=0;for(const g of list){a.set(g.attributes[key].array,offset);offset+=g.attributes[key].array.length;}geo.setAttribute(key,new T.BufferAttribute(a,3));}geo.computeBoundingSphere();for(const o of old){o.parent.remove(o);if(o.userData.ownGeometry)o.geometry.dispose();}for(const g of list)g.dispose();const mesh=new T.Mesh(geo,roomMaterial);mesh.userData.ownGeometry=true;root.add(mesh);
}
function blob(root,x,z,sx,sz,opacity=.15){const a=new T.Mesh(new T.CircleGeometry(1,24),new T.MeshBasicMaterial({color:'#243f49',transparent:true,opacity,depthWrite:false}));a.rotation.x=-Math.PI/2;a.position.set(x,.025,z);a.scale.set(sx,sz,1);a.userData.ownGeometry=a.userData.ownMaterial=true;root.add(a);return a;}
function resident(parent,variant){const root=G(parent,.14,.13,.23),skin=['#d5a37c','#a77052','#ebbf92'][variant%3],shirt=['#d97b5b','#5c9f9a','#d6ab59'][variant%3];P.block(root,.21,.28,.16,shirt,0,.31,0,.03);P.sphere(root,.135,skin,0,.58,0,.85,1,1);P.sphere(root,.14,'#4c3b39',0,.65,-.02,1,.5,1);for(let s of [-1,1]){P.sphere(root,.015,'#243f49',s*.045,.59,.12);P.block(root,.065,.17,.08,'#466876',s*.06,.10,0,.015);P.block(root,.08,.05,.14,'#30434f',s*.06,.025,.03,.01);}const arm=G(root,-.13,.42,0);P.block(arm,.06,.24,.07,shirt,0,-.1,0,.02);P.sphere(arm,.04,skin,0,-.23,0);P.merge(root,new Set([arm]));P.merge(arm);return{root,arm};}
function roomModel(q){
 const root=G(),wall={garage:'#d5ad62',gym:'#de957b',fan:'#7eada6',garden:'#8daa83',home:'#e0c9a0'}[q.kind];
 P.block(root,1.01,.10,1.28,'#506a71',0,.01,0,.02);P.block(root,1.01,.83,.07,wall,0,.47,-.59,.015);P.block(root,.065,.84,1.22,wall,-.48,.47,0,.012);P.block(root,.065,.84,1.22,wall,.48,.47,0,.012);P.block(root,1.04,.08,1.30,'#f1ddb0',0,.91,0,.025);
 for(let x of [-.48,.48])P.block(root,.055,.85,.055,'#345960',x,.47,.60,.01);
 P.block(root,.90,.03,.03,'#edc46d',0,.21,.62,.008);let fan=null,person=null,sofa=null;
 if(q.kind==='garage'){
  for(let x of [-.22,.15]){const tire=P.cylinder(root,.19,.14,'#334952',x,.28,-.15);tire.rotation.x=Math.PI/2;P.sphere(root,.10,'#d5b76f',x,.28,-.055,1,1,.2);}P.block(root,.65,.08,.23,'#426d76',0,.52,-.33);P.sign(root,'GRIP',0,.75,-.53,.48,'#d5ad62','#345960',0);
 }else if(q.kind==='gym'){
  P.block(root,.68,.04,.60,'#b7c8a7',0,.09,0);P.cylinder(root,.024,.58,'#b7c6c4',0,.35,-.14).rotation.z=Math.PI/2;for(let x of [-.23,.23]){const w=P.cylinder(root,.12,.08,'#425b66',x,.35,-.14);w.rotation.z=Math.PI/2;}P.sign(root,'HOP',0,.73,-.53,.45,'#de957b','#345960',0);
 }else if(q.kind==='fan'){
  P.cylinder(root,.035,.43,'#526874',0,.28,-.25);fan=G(root,0,.56,-.25);P.sphere(fan,.10,'#e8bd6a');for(let i=0;i<3;i++){const a=G(fan);a.rotation.z=i*Math.PI*2/3;P.block(a,.13,.31,.04,'#ecdbab',0,.18,0,.04);}P.sign(root,'WIND',0,.78,-.53,.45,'#7eada6','#345960',0);
 }else if(q.kind==='garden'){
  for(let x of [-.23,.20]){P.cylinder(root,.13,.19,'#b98164',x,.19,-.22,.11);P.sphere(root,.19,'#6f9972',x,.44,-.22,1,1.2,1);}person=resident(root,q.row);
 }else{
  sofa=G(root,-.11,.1,-.16);P.block(sofa,.66,.17,.35,'#cb7f67',0,.10,0,.035);P.block(sofa,.66,.30,.10,'#d99777',0,.23,-.16,.035);for(let s of [-1,1])P.block(sofa,.09,.24,.34,'#d99777',s*.30,.18,0,.02);P.merge(sofa);person=resident(root,q.row+q.col+4);
  P.block(root,.18,.18,.05,'#537f85',-.24,.64,-.53,.02);P.block(root,.12,.11,.02,'#f6de9c',-.24,.64,-.49,.005);
 }
 bake(root,new Set([fan,person?.root,sofa].filter(Boolean)));
 const hit=new T.Mesh(new T.BoxGeometry(1.02,.94,1.3),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.y=.46;hit.userData.room=q.id;hit.userData.ownGeometry=hit.userData.ownMaterial=true;root.add(hit);
 return{root,hit,fan,person,sofa,q};
}
function transporter(root){
 const car=G(root);P.block(car,2.15,.28,2.2,'#e2a747',0,.61,0,.09);P.block(car,1.7,.10,1.7,'#4b6570',0,.82,0,.04);const wheels=[];
 for(let x of [-.99,.99])for(let z of [-.68,.68]){const wheel=G(car,x,.35,z);let tire=P.cylinder(wheel,.32,.24,'#2c434d');tire.rotation.z=Math.PI/2;let hub=P.cylinder(wheel,.15,.255,'#b9c5ac');hub.rotation.z=Math.PI/2;P.merge(wheel);wheels.push(wheel);}
 for(let x of [-.82,.82]){P.block(car,.12,.52,.14,'#d6e1d6',x,.92,0);P.block(car,.34,.10,.7,'#e2a747',x,1.15,0,.025);P.cylinder(car,.08,.15,'#4c6c73',x,1.08,0);}
 const cab=G(car,-1.18,.43,.05);P.block(cab,.66,.30,.8,'#e2a747',0,.35,0,.04);P.block(cab,.61,.08,.74,'#3d6871',0,1.18,0,.03);for(let x of [-.29,.29])for(let z of [-.33,.33])P.block(cab,.04,.78,.04,'#3c5c65',x,.80,z,.008);
 const driver=operator(cab);driver.root.scale.setScalar(.43);driver.root.position.set(0,.32,.01);P.merge(cab,new Set([driver.root]));
 P.merge(car,new Set([...wheels,cab]));return{car,wheels,driver,cab};
}
export function createView(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(46,1,.1,100);scene.add(new T.HemisphereLight('#e2f1ec','#8c846b',1.0));const sun=new T.DirectionalLight('#fff0cc',1.8);sun.position.set(-7,15,8);scene.add(sun);
 let route=0,stage=null,carrier=null,car=null,house=null,rooms=[],gates=[],kitMeshes=[],flag=null,crewFlag=false,featureMeshes=new Map(),time=0,light=false,paint=0,camZ=0,camX=0,shake=0,grabbed=null,grabX=0,grabY=0;
 const fallen=[],rays=new T.Raycaster(),mouse=new T.Vector2();
 function setTrip(r){
  if(stage){scene.remove(stage);P.dispose(stage);}if(carrier){scene.remove(carrier);P.dispose(carrier);}for(const f of fallen)scene.remove(f.root);fallen.length=0;
  route=r.route;canvas.parentElement.dataset.night=String(ROUTES[route].theme===2);stage=G(scene);carrier=G(scene);house=G(carrier);car=transporter(carrier);rooms=roomsFor(route).map(q=>{const a=roomModel(q);house.add(a.root);return a;});gates=[];featureMeshes.clear();
  kitMeshes=[G(carrier),G(carrier),G(carrier)];
  for(let s of [-1,1]){P.block(kitMeshes[0],.18,.20,.46,'#c76d59',s*.24,.43,1.17,.04);P.block(kitMeshes[0],.19,.20,.10,'#d7e4da',s*.24,.43,1.40,.02);}P.block(kitMeshes[0],.60,.20,.13,'#c76d59',0,.43,.97,.03);P.merge(kitMeshes[0]);
  for(let x of [-.72,.72])for(let z of [-.6,.6])for(let i=0;i<4;i++){const coil=new T.Mesh(new T.TorusGeometry(.12,.025,5,12),P.material('#dfc36f'));coil.rotation.x=Math.PI/2;coil.position.set(x,.73+i*.07,z);kitMeshes[1].add(coil);}P.merge(kitMeshes[1]);
  P.cylinder(kitMeshes[2],.035,.45,'#526874',0,.12,0);for(let i=0;i<3;i++){const blade=G(kitMeshes[2]);blade.rotation.y=i*Math.PI*2/3;P.block(blade,.16,.05,.67,'#eed49b',0,.34,.27,.04);}P.merge(kitMeshes[2]);
  flag=G(carrier);P.cylinder(flag,.018,.55,'#526874',0,.26,0);P.block(flag,.42,.24,.025,'#518ea0',.21,.43,0,.015);P.sign(flag,'HH',.20,.43,.018,.30,'#518ea0','#f9e6b8',0);P.merge(flag);
  const theme=ROUTES[route].theme,sky=['#c0d9cd','#b9d4d5','#53627e'][theme];scene.background=new T.Color(sky);scene.fog=new T.Fog(sky,24,58);
  P.block(stage,30,.2,ROUTES[route].length+40,theme===2?'#85969f':'#d9d3b5',0,-.15,-ROUTES[route].length/2,0);P.block(stage,10.8,.08,ROUTES[route].length+25,'#637e80',0,-.015,-ROUTES[route].length/2,0);
  for(let z=0;z<ROUTES[route].length+12;z+=3){P.block(stage,.11,.012,1.1,'#e9d9a1',0,.04,-z,0);for(let s of [-1,1])P.block(stage,.16,.02,2.6,'#d5c8a6',s*5.23,.04,-z,0);}
  for(let z=-5;z<ROUTES[route].length+18;z+=6){
   for(let s of [-1,1]){
    const x=s*(7.7+(z%3)*.4),h=2.3+((z+11)*3%7)*.45,c=theme===2?'#556884':theme===1?'#8caeaa':z%12?'#d6aa85':'#a6b6a0';
    P.block(stage,3.1,h,3.8,c,x,h/2,-z);P.block(stage,3.3,.14,4.0,'#47737b',x,h,-z,.025);
    for(let y=.65;y<h;y+=.95)for(let dx of [-.82,0,.82])P.block(stage,.47,.47,.03,theme===2?'#edd5a0':'#eee0ad',x+dx,y,-z+1.92,.015);
    if(theme===1){P.block(stage,3.4,.42,1.5,'#9b7660',s*6.7,.24,-z+2.8);for(let i=0;i<3;i++)P.cylinder(stage,.20,.60,'#b38d61',s*6.7+(i-1)*.55,.7,-z+2.8);}
    if(theme===0){P.cylinder(stage,.08,1.35,'#816653',s*6.4,.68,-z+2);P.sphere(stage,.72,'#6f9c81',s*6.4,1.8,-z+2,1,1.2,1);}
    P.cylinder(stage,.05,3.8,'#405f69',s*5.65,1.9,-z);P.block(stage,.74,.12,.27,'#e9d6a3',s*5.4,3.8,-z);
   }
  }
  // Gate clear dimensions match the controller; each portal has its own choice.
  ROUTES[route].gates.forEach((z,index)=>{
   const pair=portals(r,index).map((p,i)=>{const root=G(stage,p.x,0,-z);for(let s of [-1,1]){P.block(root,.20,p.height,.22,'#ead49b',s*(p.width/2+.1),p.height/2,0);for(let y=.25;y<p.height;y+=.50){const b=P.block(root,.21,.13,.24,'#3c626b',s*(p.width/2+.1),y,0);b.rotation.z=.25;}}
    const beam=P.block(root,p.width+.4,.22,.40,'#d9a84a',0,p.height+.11,0);P.sign(root,p.name,0,Math.min(p.height+.52,4.9),.25,1.18,'#f7e7bd','#365761',0);P.block(root,p.width,.025,2.2,'#bdc9a4',0,.05,0,0);P.merge(root,new Set([beam]));return{...p,root,beam,index,lane:i};});gates.push(pair);
  });
  for(const f of roadFeatures(route)){const root=G(stage,f.x,0,-f.z);if(f.kind==='coin'){P.cylinder(root,.27,.09,'#edbd57',0,.75,0).rotation.x=Math.PI/2;P.sign(root,'$',0,.75,.08,.30,'#edbd57','#8e6b36',0);}else if(f.kind==='pit'){P.block(root,1.5,.018,1.6,'#334e58',0,.045,0,.12);for(let s of [-1,1])P.block(root,1.7,.025,.10,'#e6b75c',0,.06,s*.80,.01);}else{P.block(root,1.0,.15,.35,'#d7b05b',0,.15,0);for(let x of [-.3,.3])P.cylinder(root,.025,.50,'#db8d50',x,.42,0,.13,false,8);}featureMeshes.set(f.id,root);}
  const finish=G(stage,0,0,-ROUTES[route].length-1);for(let s of [-1,1])P.block(finish,.25,5.5,.25,'#47727a',s*4.6,2.75,0);P.block(finish,9.4,.65,.20,'#e4b75e',0,5.3,0);P.sign(finish,'HOME AT LAST',0,5.3,.13,4.6,'#e4b75e','#345761',0);
  for(let x=-4.6;x<4.6;x+=.4)for(let z=0;z<1.2;z+=.4)P.block(finish,.40,.018,.40,(Math.round((x+4.6)/.4)+Math.round(z/.4))%2?'#e8dab5':'#3b5a66',x,.055,z,0);
  P.merge(stage,new Set([...gates.flat().map(g=>g.root),...featureMeshes.values()]));blob(carrier,0,0,2.1,1.45,.14);camZ=r.z;camX=r.x;sync(r);resize();
 }
 function sync(r){for(const a of rooms)a.root.visible=r.rooms.includes(a.q.id);for(const [id,m]of featureMeshes)m.visible=!r.hits.includes(id)||!id.includes('coin');for(const pair of gates)for(const p of pair){p.beam.material=P.material(p.index<r.gate?'#7cae8d':fits(r,p)?'#74aa88':'#d9a84a');}}
 function settings(p){light=p.light;paint=p.paint;crewFlag=p.rewards.comment||p.best.reduce((a,b)=>a+b,0)>=12;P.material('#e2a747').color.set(paint?'#4194a7':'#e2a747');resize();}
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,light?1:1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function pick(clientX,clientY){const rect=canvas.getBoundingClientRect();mouse.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);rays.setFromCamera(mouse,camera);return rays.intersectObjects(rooms.filter(a=>a.root.visible).map(a=>a.hit),false)[0]?.object.userData.room||null;}
 function burst(events,r){for(const e of events){if(e.type==='pull'||e.type==='bump'){
  shake=.08;for(const q of e.rooms){const a=rooms.find(m=>m.q.id===q.id);if(!a)continue;a.root.updateWorldMatrix(true,true);const clone=a.root.clone(true);clone.position.copy(a.root.getWorldPosition(new T.Vector3()));clone.quaternion.copy(a.root.getWorldQuaternion(new T.Quaternion()));scene.add(clone);fallen.push({root:clone,v:new T.Vector3(q.col*1.7+.6,1.8,1.8),t:0,spin:q.col*.7+.8});}
 }}}
 function render(r,dt,paused=false,preview=false,kits=[false,false,false]){
  if(!paused){time+=dt;shake=Math.max(0,shake-dt*.3);camZ+=(r.z-camZ)*(1-Math.exp(-dt*8));camX+=(r.x-camX)*(1-Math.exp(-dt*5));}
  carrier.position.set(r.x,r.jump,-r.z);car.car.rotation.z=-r.roll*.10;car.cab.position.x+=((r.z<r.crossUntil?-.70:-1.18)-car.cab.position.x)*(paused?1:1-Math.exp(-dt*8));for(const w of car.wheels)w.rotation.x=r.z*2.1;
  const b=loadBounds(r);for(const a of rooms){const q=a.q,lean=r.roll*(.35+q.row*.23),xx=(q.col-b.center)*1.05+Math.sin(lean)*q.row*.35,yy=1.1+q.row*.95;
   a.root.position.x+=(xx+(grabbed===q.id?grabX:0)-a.root.position.x)*(paused?1:1-Math.exp(-dt*10));a.root.position.y=yy+(grabbed===q.id?grabY:0);a.root.rotation.z=lean+(grabbed===q.id?grabX*.1:0);a.hit.material.color.set('#f3bd62');a.hit.material.opacity=grabbed===q.id?.13:0;
   if(a.fan)a.fan.rotation.z=time*9;if(a.person)a.person.arm.rotation.z=r.phase==='done'?Math.sin(time*8)*.7:Math.max(-.4,Math.min(.4,-r.roll*2));if(a.sofa)a.sofa.position.x=-.11+Math.sin(lean)*.17;
  }
  kitMeshes.forEach((m,i)=>m.visible=kits[i]);kitMeshes[2].position.y=b.height+(r.z<r.crossUntil?-.30:.02);kitMeshes[2].rotation.y=time*10;flag.visible=crewFlag;flag.position.set(-.45,b.height+(r.z<r.crossUntil?-.55:.05),0);flag.rotation.y=Math.sin(time*3)*.2;
  for(let i=fallen.length-1;i>=0;i--){const f=fallen[i];if(!paused){f.t+=dt;f.v.y-=9*dt;f.root.position.addScaledVector(f.v,dt);f.root.rotation.z+=f.spin*dt;if(f.root.position.y<.1){f.root.position.y=.1;f.v.y=Math.abs(f.v.y)*.20;f.v.x*=.8;f.v.z*=.8;}}
   if(f.t>3){scene.remove(f.root);fallen.splice(i,1);}else if(f.t>2)f.root.scale.setScalar(3-f.t);
  }
  const a=abilities(r,kits);car.driver.head.rotation.z=-r.roll*.8;car.driver.head.rotation.y=Math.sin(time*.7)*.10;
  const portrait=camera.aspect<.85,d=portrait?23:15;
  const trim=r.phase==='trim';camera.position.set(camX+(trim?d*.16:d*.10),d*.43, -camZ+d);camera.lookAt(camX*.65+(portrait?0:1.0),preview?-.8:portrait&&canvas.clientHeight<650?1.35:2.0,-camZ-(trim?3.5:4.4));
  if(shake&&!paused){camera.position.x+=Math.sin(time*85)*shake;camera.position.y+=Math.cos(time*73)*shake*.5;}renderer.render(scene,camera);
 }
 return{setTrip,sync,settings,resize,pick,burst,render,previewRoom(id,dx=0,dy=0){grabbed=id;grabX=Math.max(-1.3,Math.min(1.3,dx*.012));grabY=Math.max(-.4,Math.min(1.3,-dy*.012));},clearDebris(){for(const f of fallen)scene.remove(f.root);fallen.length=0;}};
}

