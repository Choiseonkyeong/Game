import test from 'node:test';import assert from 'node:assert/strict';
import {Spring,BodyMotion} from '../dist/interaction-motion.js';import {stageFit} from '../dist/view-gestures.js';import {insidePolygon,SEOUL_BODIES,TOKYO_BODIES} from '../dist/room-bodies.js';
test('a drawer spring overshoots against its stop, bounces back and rests exactly at the end',()=>{
 const s=new Spring(0,{stiffness:120,damping:17,bounce:.28,min:0,max:1}).set(1);s.kick(3);let hit=0,t=0;while(!s.resting&&t<3){s.step(1/60);t+=1/60;if(s.impact)hit++;assert(s.value>=0&&s.value<=1);}
 assert(hit>=1,'the tray knocks its stop');assert.equal(s.value,1);assert(t<1.2);
});
test('touched room objects move a little and always return to rest',()=>{
 for(const kind of ['sway','leaf','rock','wobble','squash','hop','shake']){const m=new BodyMotion(kind);m.impulse(1,1);let moved=0,t=0;while(!m.resting&&t<6){m.step(1/60);t+=1/60;const p=m.pose;moved=Math.max(moved,Math.abs(p.angle)+Math.abs(p.x)+Math.abs(p.y)+Math.abs(p.squash));assert(p.y<=0,'hopping things never sink into the surface');}
  assert(moved>.005,kind);assert(m.resting,kind);assert.deepEqual(m.pose,{angle:0,x:0,y:0,squash:0});}
});
test('phone portrait shows about half the room instead of a cropped wall slice, desktop keeps the room whole',()=>{
 const phone=stageFit(390,844);assert(Math.abs(390/phone.rw-.5)<.01);assert(phone.ty>0&&phone.ty+phone.rh<844);
 const desk=stageFit(1280,800);assert(desk.rw>=1280-1e-6&&desk.rh>=800-1e-6);
 for(const zoom of [1,2,3.2])for(const x of [.05,.5,.95]){const g=stageFit(390,844,{x,y:.43},zoom);assert(g.tx<=0&&g.tx+g.rw>=390-1e-6);}
});
test('every body polygon contains its own centre region and stays inside the room',()=>{
 for(const b of [...SEOUL_BODIES,...TOKYO_BODIES]){for(const [x,y] of b.points){assert(x>=0&&x<=1536&&y>=0&&y<=1024,b.id);}const cx=b.points.reduce((a,p)=>a+p[0],0)/b.points.length,cy=b.points.reduce((a,p)=>a+p[1],0)/b.points.length;assert(insidePolygon(b.points,cx,cy)||b.id==='desk'||b.id==='chair'||b.id==='stool',b.id);}
});
