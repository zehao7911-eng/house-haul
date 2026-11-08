import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROUTES,roomsFor,makeTrip,advance,steer,portals,fits,pullRoom,undoPull,choosePortal,loadBounds,abilities,defaultProfile,cleanProfile,mergeProfile,bank,buyKit,wallet} from './core.mjs';
import {bridge} from './sdk.mjs';
let checks=0;const ok=(v,message)=>{assert(v,message);checks++;};
function trimForSlim(r){let safety=0;while(!fits(r,portals(r)[1])&&safety++<15){const rooms=roomsFor(r.route).filter(q=>r.rooms.includes(q.id));const left=rooms.find(q=>q.col===-1&&q.row===0);if(left){pullRoom(r,left.id);continue;}const row=Math.max(...rooms.map(q=>q.row));for(const q of rooms.filter(q=>q.row===row))pullRoom(r,q.id);}ok(fits(r,portals(r)[1]),'A realizable load fits the slim portal');choosePortal(r,1);}
for(const hz of [30,60,120])for(let route=0;route<6;route++){
 let r=makeTrip(route),starts=0,finishes=0,inspections=0;const p=defaultProfile();
 for(let frame=0;frame<hz*90&&r.phase!=='done';frame++){
  if(r.phase==='trim'){const snapshot=cleanProfile({...p,trip:r}).trip;ok(snapshot&&snapshot.rooms.length===r.rooms.length&&snapshot.gate===r.gate&&snapshot.z===r.z,'Trim checkpoint survives safely parked');r=snapshot;trimForSlim(r);}
  else if(r.z>=r.crossUntil)steer(r,0);
  const events=advance(r,1/hz,true,[true,true,true]);starts+=events.filter(e=>e.type==='start').length;finishes+=events.filter(e=>e.type==='finish').length;inspections+=events.filter(e=>e.type==='inspect').length;
  ok(Number.isFinite(r.x+r.z+r.roll+r.jump)&&r.rooms.includes('0:0'),'Finite vehicle and protected steering room');
 }
 ok(r.phase==='done',`Route ${route} clears at ${hz}Hz`);ok(starts===1&&finishes===1&&inspections===3,'Real trip lifecycle and three actual gates');ok(r.stars===3,'Careful deliveries can earn gold');
 const gain=bank(p,r);ok(gain===r.payout&&wallet(p)===gain,'First best delivery banks');ok(bank(p,r)===0&&wallet(p)===gain,'Duplicate result grants no money');
 const receipt=cleanProfile({...p,trip:r});ok(receipt.trip.phase==='done'&&receipt.payouts[route]===p.payouts[route],'Result reload does not duplicate award');
 ok(!advance(r,.05,true).length,'No post-result lifecycle events');
}
let r=makeTrip(0);r.z=7;r.phase='trim';r.started=true;
for(let route=0;route<6;route++){const low=makeTrip(route);for(let i=0;i<6000&&low.phase!=='done';i++){if(low.phase==='trim'){while(!fits(low,portals(low)[0])){const top=Math.max(...liveRoomsForTest(low).map(q=>q.row));for(const q of liveRoomsForTest(low).filter(q=>q.row===top))pullRoom(low,q.id);}choosePortal(low,0);}else if(low.z>=low.crossUntil)steer(low,0);advance(low,1/60,true);}ok(low.phase==='done'&&low.rooms.length>=3,'The low/wide alternative also delivers the house');}
function liveRoomsForTest(r){return roomsFor(r.route).filter(q=>r.rooms.includes(q.id));}
ok(!fits(r,portals(r)[0])&&!fits(r,portals(r)[1]),'An untrimmed three-floor house cannot bypass the first gate');
const original=[...r.rooms];pullRoom(r,'-1:0');ok(r.rooms.length===6&&fits(r,portals(r)[1]),'Pulling a wing preserves six rooms and narrows the load');ok(!abilities(r).grip&&abilities(r).hop&&abilities(r).fan,'Room choice changes working abilities');ok(undoPull(r)&&r.rooms.join()===original.join(),'Undo restores an actual room stack');
for(const q of roomsFor(0).filter(q=>q.row===2))pullRoom(r,q.id);ok(r.rooms.length===6&&fits(r,portals(r)[0])&&!fits(r,portals(r)[1]),'Removing roof preserves width and creates a different passage');ok(!pullRoom(r,'0:0').length,'Steering room cannot be discarded');
choosePortal(r,0);for(let i=0;i<90;i++)advance(r,1/60,false);ok(r.z===7,'No automatic crossing without a real drive input');
for(let i=0;i<70;i++)advance(r,1/60,true);const lane=r.crossLane;steer(r,3.5);advance(r,.05,true);ok(r.crossLane===lane&&r.targetX===portals(r,r.gate-1)[lane].x,'The committed load remains aligned while threading the gate');
function pitRun(hop,kit=false){const t=makeTrip(0);if(!hop)t.rooms=t.rooms.filter(id=>!id.startsWith('1:'));t.x=1.9;t.targetX=1.9;const ev=[];for(let i=0;i<150;i++)ev.push(...advance(t,.02,true,[false,kit,false]));return{t,ev};}
const spring=pitRun(true),plain=pitRun(false),fittedSpring=pitRun(false,true);ok(fittedSpring.t.bumps===0&&fittedSpring.ev.some(e=>e.type==='hop'),'Spring kit replaces a discarded gym with a real hop');ok(spring.ev.some(e=>e.type==='hop')&&spring.t.bumps===0,'A retained gym really hops over the pit');ok(plain.t.bumps>0&&plain.ev.some(e=>e.type==='bump'),'Discarding the gym changes the hazard outcome');
const noMag=makeTrip(0),mag=makeTrip(0);for(let i=0;i<90;i++){advance(noMag,.02,true);advance(mag,.02,true,[true,false,false]);}ok(mag.coins.length>noMag.coins.length,'Magnet kit changes pickup range');
const f=makeTrip(3),nf=makeTrip(3);for(const t of [f,nf]){t.z=20;t.started=true;t.gate=1;t.v=5;}nf.rooms=nf.rooms.filter(id=>id!=='1:1');for(let i=0;i<60;i++){advance(f,.02,true);advance(nf,.02,true);}ok(Math.abs(f.roll-nf.roll)>.01||Math.abs(f.x-nf.x)>.01,'Fan room resists real crosswind state');
const profile=defaultProfile();profile.best=[3,3,3,0,0,0];profile.payouts=[40,40,40,0,0,0];ok(buyKit(profile,0)&&wallet(profile)===102,'Kit purchase has actual cost');ok(!buyKit(profile,0),'Owned kit cannot charge twice');
const union=mergeProfile(profile,{best:[1,3,2,0,0,0],payouts:[42,38,45,0,0,0],kits:[true,false,false],rewards:{comment:true}});ok(wallet(union)===109&&union.best[0]===3&&union.rewards.comment,'Cloud merge keeps best payouts and deduplicates kit cost');
ok(cleanProfile({trip:{...makeTrip(0),rooms:['foreign']}}).trip===null,'Reject foreign room ids');ok(cleanProfile({trip:{...makeTrip(0),phase:'trim',gate:3}}).trip===null,'Reject impossible trim checkpoint');
const parked=makeTrip(0);parked.z=4;parked.started=true;parked.v=5;parked.targetX=2;parked.jump=.5;const restored=cleanProfile({trip:parked}).trip;ok(restored.z===4&&restored.v===0&&restored.targetX===restored.x&&restored.jump===0,'Reload cancels held momentum without losing route progress');

let host,starts=0,ends=0,off=0,like,comment,writes=[],state=cleanProfile({trip:parked});let serial=0;const timers=new Map(),schedule=(fn,ms)=>{timers.set(++serial,{fn,ms});return serial;},flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
const adapter=()=>bridge({host:()=>host,read:()=>state,write:(raw,remote)=>state=remote?mergeProfile(state,raw):cleanProfile(raw),schedule,cancel:id=>timers.delete(id),timeout:80});
let sdk=adapter();sdk.start();sdk.save();host={gameStart:()=>starts++};sdk.connect();sdk.connect();ok(starts===1,'Late partial host receives actual active session once');
Object.assign(host,{gameOver:()=>ends++,loadUserGameState:async()=>({}),saveUserGameState:async p=>{writes.push(p);return{code:0};},onLike:async fn=>{like=fn;return{code:0,data:{unsubscribe:()=>off++}};},onComment:async fn=>{comment=fn;return{code:0,data:{unsubscribe:()=>off++}};},getGameViewport:()=>({width:390,height:844,density:3})});sdk.connect();await flush();ok(writes[0].game==='house-haul'&&writes[0].profile.trip.z===4,'Save only this game and its checkpoint');ok(sdk.viewport().width===390,'Density is not a CSS width multiplier');
like({project_id:'123',status:false});like({project_id:123,status:true});comment({project_id:'123'});ok(!state.rewards.like&&!state.rewards.comment,'Unlike/malformed callbacks grant no rewards');like({project_id:'1000000000000000001',status:true,count:0});comment({project_id:'1000000000000000001',content:'',count:0});await flush();const beforeWrites=writes.length;like({project_id:'123',status:true,count:5});comment({project_id:'123',content:'again'});await flush();ok(state.rewards.like&&state.rewards.comment&&writes.length===beforeWrites,'Confirmed direct callbacks persist once');sdk.stop();ok(off===2,'Actual unsubscribe functions invoked');
sdk=adapter();await flush();ok(starts===1,'A restored parked checkpoint does not fabricate a start');sdk.start();advance(state.trip,.05,true);sdk.start();ok(starts===2,'Next real resumed drive starts one new session');sdk.end();sdk.end();ok(ends===1,'One real terminal event');sdk.stop();ok(off===4,'Reload listener cleanup');
let resolveLate,lateOff=0;host={onLike:()=>new Promise(resolve=>resolveLate=resolve),onComment:()=>Promise.reject(Error('offline'))};sdk=adapter();for(const[id,t]of[...timers])if(t.ms===80&&timers.delete(id))t.fn();await flush();ok(!sdk.support().like&&!sdk.support().comment,'Timeout/errors leave optional prompts unavailable');sdk.stop();resolveLate({code:0,data:{unsubscribe:()=>lateOff++}});await flush();ok(lateOff===1,'Late registration cleanup');
let badWrites=0;host={loadUserGameState:()=>Promise.reject(Error('offline')),saveUserGameState:()=>badWrites++};sdk=adapter();sdk.save();await flush();sdk.stop();ok(badWrites===0,'Failed load never overwrites unknown cloud');host={loadUserGameState:async()=>({game:'jawbreaker-yard',v:1,profile:{}}),saveUserGameState:()=>badWrites++};sdk=adapter();sdk.save();await flush();sdk.stop();ok(badWrites===0,'Old game cloud namespace remains untouched');
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');ok(html===readFileSync(new URL('./standalone.html',import.meta.url),'utf8'),'Both shipped offline entries match');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(m[1]);
console.log(`${checks} checks passed; 24 complete deliveries, including 30/60/120Hz and low/wide alternatives, gate choices, room powers, real kit economy, checkpoints and SDK mocks.`);


