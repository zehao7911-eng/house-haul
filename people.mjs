import * as P from './primitives.mjs';
const T=window.THREE;const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g;}
function link(mesh,a,b,width=.12){const d=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());mesh.scale.set(width,d.length(),width);}
export function operator(parent){
  const root=group(parent), body=group(root,0,.76,0);
  P.block(body,.42,.55,.30,'#ecbd62',0,.18,0,.06);P.block(body,.30,.33,.04,'#38626c',0,.10,.16);for(let s of [-1,1])P.block(body,.05,.47,.025,'#f6e3a6',s*.13,.20,.177);
  P.cylinder(body,.082,.16,'#bf825e',0,.55,0);const head=group(body,0,.75,.015);
  P.sphere(head,.215,'#dca77b',0,0,0,.85,1.13,.88);P.sphere(head,.045,'#c18462',0,-.03,.19,.7,.85,.7);
  for(let s of [-1,1]){P.sphere(head,.033,'#263d43',s*.078,.035,.167,.6,.9,.4);P.block(head,.07,.022,.025,'#684633',s*.079,.10,.155,.005);P.sphere(head,.045,'#ce946c',s*.186,-.01,0,.6,1,.7);}
  P.tube(head,[[-.06,-.11,.155],[0,-.128,.173],[.06,-.11,.155]],.012,'#724d3e');
  P.sphere(head,.24,'#f6cd62',0,.13,-.013,1,.65,.9);P.block(head,.49,.035,.43,'#e8ac47',0,.095,.025,.04);P.block(head,.06,.13,.39,'#ffe3a0',0,.21,-.01,.02);P.merge(head);
  const arms=[];
  for(let s of [-1,1]){
    const a=V(s*.24,1.11,0),e=V(s*.32,.96,.23),h=V(s*.24,1.0,.41);
    for(let [u,v,color,w]of[[a,e,'#ecbd62',.095],[e,h,'#bf825e',.075]]){const m=P.cylinder(root,1,1,color);link(m,u,v,w);}
    P.sphere(root,.075,'#dca77b',h.x,h.y,h.z);P.cylinder(root,.018,.30,'#293c4a',h.x,.85,h.z);P.sphere(root,.045,'#293c4a',h.x,1.0,h.z);
    P.block(root,.15,.24,.3,'#3b5767',s*.13,.59,.15);P.block(root,.14,.39,.16,'#3b5767',s*.13,.36,.34);P.block(root,.18,.13,.31,'#2c3f49',s*.13,.17,.43,.03);
  }
  P.merge(root,new Set([body]));P.merge(body,new Set([head]));return{root,body,head};
}

