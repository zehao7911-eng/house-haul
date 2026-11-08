export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const ROUTES=[
 {name:'Moving Day',district:'MAPLE BLOCK',theme:0,rows:3,length:70,wind:.30,gates:[14,36,56]},
 {name:'Dockside Detour',district:'COPPER QUAY',theme:1,rows:3,length:76,wind:.65,gates:[16,40,62]},
 {name:'The Penthouse',district:'MAPLE BLOCK',theme:0,rows:4,length:82,wind:.40,gates:[16,42,67]},
 {name:'Windy Business',district:'COPPER QUAY',theme:1,rows:4,length:86,wind:1.0,gates:[17,45,71]},
 {name:'Night Shift',district:'NEON AVENUE',theme:2,rows:4,length:90,wind:.8,gates:[18,48,75]},
 {name:'Last House Standing',district:'NEON AVENUE',theme:2,rows:5,length:98,wind:1.15,gates:[18,51,82]}
];
export const KITS=[{name:'MAGNET',cost:18,stars:3,detail:'Collect coins from either lane.'},{name:'SPRINGS',cost:24,stars:6,detail:'Auto-hop over road damage.'},{name:'ROTOR',cost:30,stars:9,detail:'Stabilize the load in crosswinds.'}];
export function roomsFor(route){const rows=ROUTES[route].rows,out=[];for(let col=-1;col<=1;col++)for(let row=0;row<rows;row++){const kind=row===0?(col===-1?'garage':col===1?'gym':'home'):row===1&&col===1?'fan':row===rows-1&&col===0?'garden':'home';out.push({id:`${col}:${row}`,col,row,kind});}return out;}
export const deliveryGoal=route=>[6,6,8,8,6,6][route];
export function makeTrip(route=0){return{route,z:0,x:0,targetX:0,v:0,roll:0,omega:0,jump:0,jumpV:0,hopCooldown:0,gate:0,crossLane:0,crossUntil:0,phase:'drive',rooms:roomsFor(route).map(r=>r.id),started:false,coins:[],hits:[],bumps:0,stars:0,payout:0,undo:null};}
export function liveRooms(r){const ids=new Set(r.rooms);return roomsFor(r.route).filter(q=>ids.has(q.id));}
export function loadBounds(r){const a=liveRooms(r);if(!a.length)return{width:2.25,height:1.1,center:0};const left=Math.min(...a.map(q=>q.col)),right=Math.max(...a.map(q=>q.col));return{width:Math.max(2.25,(right-left+1)*1.05),height:1.1+(Math.max(...a.map(q=>q.row))+1)*.95,center:(left+right)/2};}
export function abilities(r,kits=[false,false,false]){const rooms=liveRooms(r);return{grip:rooms.some(q=>q.kind==='garage'),hop:rooms.some(q=>q.kind==='gym')||kits[1],fan:rooms.some(q=>q.kind==='fan')||kits[2],magnet:kits[0]};}
export function portals(r,gate=r.gate){
 const last=gate===2,route=r.route;
 return[{name:'LOW',x:-2.4,width:4.45,height:last&&route>1?3.08:gate===1&&route>2?4.05:3.13},
 {name:'SLIM',x:2.4,width:gate===1&&route>1?2.65:2.82,height:last&&route>3?4.12:6.2}];
}
export function fits(r,p){const b=loadBounds(r);return b.width+.08<=p.width&&b.height+.06<=p.height;}
export function selectedPortal(r){return portals(r).find(p=>Math.abs(r.x-p.x)<(p.width-loadBounds(r).width)/2-.015&&fits(r,p))||null;}
export function steer(r,x){if(r.phase==='done')return false;r.targetX=clamp(x,-3.5,3.5);return true;}
export function choosePortal(r,index){if(r.phase!=='trim'||!portals(r)[index])return false;r.targetX=portals(r)[index].x;return true;}
export function pullRoom(r,id){
 if(r.phase!=='trim')return[];const room=liveRooms(r).find(q=>q.id===id);if(!room||room.col===0&&room.row===0)return[];
 const dropped=liveRooms(r).filter(q=>q.col===room.col&&q.row>=room.row);if(r.rooms.length-dropped.length<1)return[];
 r.undo=[...r.rooms];const ids=new Set(dropped.map(q=>q.id));r.rooms=r.rooms.filter(id=>!ids.has(id));return[{type:'pull',rooms:dropped}];
}
export function undoPull(r){if(r.phase!=='trim'||!r.undo)return false;r.rooms=[...r.undo];r.undo=null;return true;}
export function roadFeatures(route){
 const n=ROUTES[route],features=[];
 for(let i=0;i<3;i++){
  const a=i===0?0:n.gates[i-1]+3,b=n.gates[i]-8;
  features.push({id:'coin'+i,z:a+(b-a)*.44,x:i%2?2.4:-2.4,kind:'coin'});
  features.push({id:'pit'+i,z:a+(b-a)*.72,x:i%2?-1.9:1.9,kind:'pit'});
  if(route>0)features.push({id:'cone'+i,z:a+(b-a)*.90,x:i%2?2.7:-2.7,kind:'barrier'});
 }
 features.push({id:'lastcoin',z:n.length-7,x:2.4,kind:'coin'});return features;
}
export function advance(r,dt,held,kits=[false,false,false]){
 if(r.phase==='done')return[];dt=clamp(dt,0,.05);const events=[],route=ROUTES[r.route],a=abilities(r,kits),beforeX=r.x;
 if(r.z<r.crossUntil)r.targetX=portals(r,Math.max(0,r.gate-1))[r.crossLane].x;
 r.x+=(r.targetX-r.x)*(1-Math.exp(-dt*(a.grip?11:7)));
 const dx=(r.x-beforeX)/Math.max(.001,dt),wind=Math.sin(r.z*.27+r.route)*route.wind*(a.fan?.14:1);
 if(r.v>1&&r.z>=r.crossUntil)r.x=clamp(r.x+wind*.65*dt,-3.5,3.5);
 const height=loadBounds(r).height,desired=r.z<r.crossUntil?0:clamp(-dx*(a.grip?.028:.045)+wind*.10,-.28,.28);
 r.omega+=((desired-r.roll)*16-r.omega*(a.grip?7.2:5.2))*dt;r.roll=clamp(r.roll+r.omega*dt,-.35,.35);
 r.hopCooldown=Math.max(0,r.hopCooldown-dt);r.jumpV-=10*dt;r.jump=Math.max(0,r.jump+r.jumpV*dt);if(!r.jump)r.jumpV=0;
 if(r.phase==='trim'){
  r.v=0;
  if(held&&selectedPortal(r)){r.crossLane=portals(r).findIndex(p=>p.name===selectedPortal(r).name);r.crossUntil=route.gates[r.gate]+2;r.phase='drive';r.gate++;r.undo=null;events.push({type:'gate',gate:r.gate});}
  else return events;
 }
 if(held&&!r.started){r.started=true;events.push({type:'start'});}
 const speed=held?5.8*(1-Math.max(0,height-3)*.035):0;r.v+=(speed-r.v)*(1-Math.exp(-dt*(held?4.2:12)));
 const oldZ=r.z;r.z+=r.v*dt;
 const next=route.gates[r.gate];
 if(next!==undefined&&r.z>=next-7){r.z=next-7;r.v=0;r.phase='trim';events.push({type:'inspect',gate:r.gate});}
 for(const f of roadFeatures(r.route)){
  if(r.hits.includes(f.id)||f.z>r.z+1.2||f.z<oldZ-1.3)continue;
  const distance=Math.abs(r.x-f.x);
  if(f.kind==='coin'){
   if(distance<(a.magnet?5:.85)){r.coins.push(f.id);r.hits.push(f.id);events.push({type:'coin'});}
  }else if(distance<(f.kind==='pit'?.95:1.05)){
   if(f.kind==='pit'&&a.hop&&r.hopCooldown===0&&r.jump===0){r.jumpV=3.4;r.hopCooldown=3;events.push({type:'hop'});}
   if(f.z<=r.z+.1){r.hits.push(f.id);if(r.jump<.18){
     r.bumps++;r.v*=.35;r.omega+=(r.x>=0?1:-1)*.75;
     const candidates=liveRooms(r).filter(q=>q.col!==0||q.row!==0).sort((u,v)=>v.row-u.row||Math.abs(v.col)-Math.abs(u.col));
     const lost=candidates[0];if(lost&&r.rooms.length>2){r.rooms=r.rooms.filter(id=>id!==lost.id);events.push({type:'bump',rooms:[lost]});}else events.push({type:'bump',rooms:[]});
   }}
  }
 }
 if(r.z>=route.length){r.z=route.length;r.v=0;r.phase='done';r.stars=1+(r.rooms.length>=deliveryGoal(r.route)?1:0)+(r.bumps===0?1:0);r.payout=r.rooms.length*5+r.coins.length*2+(r.bumps===0?5:0);events.push({type:'finish',stars:r.stars,payout:r.payout});}
 return events;
}
export function defaultProfile(){return{best:Array(6).fill(0),delivered:Array(6).fill(0),payouts:Array(6).fill(0),kits:[false,false,false],selected:0,paint:0,sound:true,light:false,rewards:{like:false,comment:false},trip:null};}
export const stars=p=>p.best.reduce((a,b)=>a+b,0);
export const wallet=p=>p.payouts.reduce((a,b)=>a+b,0)-KITS.reduce((n,k,i)=>n+(p.kits[i]?k.cost:0),0);
export function buyKit(p,i){if(!KITS[i]||p.kits[i]||stars(p)<KITS[i].stars||wallet(p)<KITS[i].cost)return false;p.kits[i]=true;return true;}
export function bank(p,r){if(r.phase!=='done')return 0;const before=p.payouts[r.route];p.best[r.route]=Math.max(p.best[r.route],r.stars);p.delivered[r.route]=Math.max(p.delivered[r.route],r.rooms.length);p.payouts[r.route]=Math.max(before,r.payout);return p.payouts[r.route]-before;}
export function cleanProfile(raw){
 const p=defaultProfile();if(!raw||typeof raw!=='object')return p;
 for(let i=0;i<6;i++){for(const [key,max]of[['best',3],['delivered',roomsFor(i).length],['payouts',roomsFor(i).length*5+13]])if(Number.isInteger(raw[key]?.[i]))p[key][i]=clamp(raw[key][i],0,max);}
 p.kits=p.kits.map((_,i)=>raw.kits?.[i]===true);p.selected=Number.isInteger(raw.selected)?clamp(raw.selected,0,5):0;p.paint=raw.paint===1?1:0;p.sound=raw.sound!==false;p.light=raw.light===true;p.rewards={like:raw.rewards?.like===true,comment:raw.rewards?.comment===true};
 for(let i=2;i>=0;i--)if(wallet(p)<0||p.kits[i]&&stars(p)<KITS[i].stars)p.kits[i]=false;
 const r=raw.trip;
 if(r&&Number.isInteger(r.route)&&r.route>=0&&r.route<6&&['drive','trim','done'].includes(r.phase)&&Array.isArray(r.rooms)&&r.rooms.length){
  const ids=new Set(roomsFor(r.route).map(q=>q.id)),features=new Set(roadFeatures(r.route).map(q=>q.id));
  const valid=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
  if(r.rooms.length<=ids.size&&new Set(r.rooms).size===r.rooms.length&&r.rooms.every(id=>ids.has(id))&&r.rooms.includes('0:0')&&valid(r.z,0,ROUTES[r.route].length)&&valid(r.x,-3.6,3.6)&&valid(r.targetX,-3.6,3.6)&&Number.isInteger(r.gate)&&r.gate>=0&&r.gate<=3&&Array.isArray(r.coins)&&r.coins.length<=4&&new Set(r.coins).size===r.coins.length&&r.coins.every(id=>features.has(id)&&id.includes('coin'))&&Array.isArray(r.hits)&&r.hits.length<=20&&r.hits.every(id=>features.has(id))&&Number.isInteger(r.bumps)&&r.bumps>=0&&r.bumps<1000&&typeof r.started==='boolean'&&(r.z===0||r.started)&&(r.phase!=='trim'||r.gate<3&&Math.abs(r.z-(ROUTES[r.route].gates[r.gate]-7))<.01)&&(r.phase==='done')===(r.z===ROUTES[r.route].length)){
   const trip=makeTrip(r.route);for(const k of ['z','x','targetX','gate','phase','started','bumps'])trip[k]=r[k];trip.rooms=[...r.rooms];trip.coins=[...r.coins];trip.hits=[...new Set(r.hits)];
   if(Number.isInteger(r.crossLane)&&r.crossLane>=0&&r.crossLane<=1)trip.crossLane=r.crossLane;if(valid(r.crossUntil,0,ROUTES[r.route].length))trip.crossUntil=r.crossUntil;
   for(const [k,a,b]of[['v',0,8],['roll',-.35,.35],['omega',-10,10],['jump',0,2],['jumpV',-10,10],['hopCooldown',0,10]])if(valid(r[k],a,b))trip[k]=r[k];
   if(r.phase==='trim'&&Array.isArray(r.undo)&&r.undo.length<=ids.size&&r.undo.every(id=>ids.has(id))&&new Set(r.undo).size===r.undo.length&&r.undo.includes('0:0'))trip.undo=[...r.undo];
   trip.v=0;trip.targetX=trip.x;trip.jump=0;trip.jumpV=0;
   if(trip.phase==='done'){trip.stars=1+(trip.rooms.length>=deliveryGoal(trip.route)?1:0)+(trip.bumps===0?1:0);trip.payout=trip.rooms.length*5+trip.coins.length*2+(trip.bumps===0?5:0);bank(p,trip);}p.trip=trip;
  }
 }
 if(p.paint===1&&stars(p)<6&&!p.rewards.like)p.paint=0;return p;
}
export function mergeProfile(local,remote){const p=cleanProfile(local),q=cleanProfile(remote);return cleanProfile({...p,best:p.best.map((n,i)=>Math.max(n,q.best[i])),delivered:p.delivered.map((n,i)=>Math.max(n,q.delivered[i])),payouts:p.payouts.map((n,i)=>Math.max(n,q.payouts[i])),kits:p.kits.map((v,i)=>v||q.kits[i]),rewards:{like:p.rewards.like||q.rewards.like,comment:p.rewards.comment||q.rewards.comment},trip:p.trip||q.trip});}
