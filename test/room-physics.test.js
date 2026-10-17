import test from 'node:test';import assert from 'node:assert/strict';
import {Spring,BodyMotion} from '../dist/interaction-motion.js';import {stageFit,roomGeometry,PLATE} from '../dist/view-gestures.js';import {BodyLayer,bodyPoint,bendsBody,insidePolygon,SEOUL_BODIES,TOKYO_BODIES} from '../dist/room-bodies.js';
test('a drawer spring overshoots against its stop, bounces back and rests exactly at the end',()=>{
 const s=new Spring(0,{stiffness:120,damping:17,bounce:.28,min:0,max:1}).set(1);s.kick(3);let hit=0,t=0;while(!s.resting&&t<3){s.step(1/60);t+=1/60;if(s.impact)hit++;assert(s.value>=0&&s.value<=1);}
 assert(hit>=1,'the tray knocks its stop');assert.equal(s.value,1);assert(t<1.2);
});
test('touched room objects move a little and always return to rest',()=>{
 for(const kind of ['sway','leaf','rock','wobble','squash','hop','shake']){const m=new BodyMotion(kind);m.impulse(1,1);let moved=0,t=0;while(!m.resting&&t<6){m.step(1/60);t+=1/60;const p=m.pose;moved=Math.max(moved,Math.abs(p.angle)+Math.abs(p.x)+Math.abs(p.y)+Math.abs(p.squash)+Math.abs(p.bend));assert(p.y<=0,'hopping things never sink into the surface');}
  assert(moved>.005,kind);assert(m.resting,kind);assert(Object.values(m.pose).every(v=>v===0),kind);}
});
test('portrait phones see the taller room nearly top to bottom and a wide slice of it; desktop keeps the room whole',()=>{
 for(const [w,h] of [[390,844],[390,700],[430,932]]){const g=stageFit(w,h,{x:.4,y:.5},1,false,PLATE.height);assert(g.rh>=h*.85,`${w}x${h} height`);assert(w/g.rw>=.4,`${w}x${h} width`);assert(g.rh<=h+1e-6);}
 const inner=roomGeometry(390,844,{x:.4,y:.5});const plate=stageFit(390,844,{x:.4,y:.5},1,false,PLATE.height);assert.equal(inner.ty,plate.ty+PLATE.top*plate.scale);
 const desk=stageFit(1280,800,{x:.4,y:.5},1,false,PLATE.height);assert(desk.rw>=1280-1e-6&&desk.rh>=800-1e-6);
 for(const zoom of [1,2,3.2])for(const x of [.05,.5,.95]){const g=stageFit(390,844,{x,y:.43},zoom,false,PLATE.height);assert(g.tx<=0&&g.tx+g.rw>=390-1e-6);}
});
test('every body polygon contains its own centre region and stays inside the room',()=>{
 for(const b of [...SEOUL_BODIES,...TOKYO_BODIES]){for(const [x,y] of b.points){assert(x>=0&&x<=1536&&y>=-176&&y<=1024,b.id);}const cx=b.points.reduce((a,p)=>a+p[0],0)/b.points.length,cy=b.points.reduce((a,p)=>a+p[1],0)/b.points.length;assert(insidePolygon(b.points,cx,cy)||b.id==='desk'||b.id==='chair'||b.id==='stool',b.id);}
});
test('holding the bag retains its pose, releasing or cancelling restores the hook and settles',()=>{
 for(const angle of [-.42,.08,.42]){const layer=new BodyLayer(TOKYO_BODIES);layer.hold('tote',angle);for(let i=0;i<240;i++)layer.step(1/60);
  assert(layer.motions.has('tote'),'a resting held bag must not disappear');assert(Math.abs(layer.motions.get('tote').pose.angle-angle)<.003);
  layer.release('tote');for(let i=0;i<720&&layer.active;i++)layer.step(1/60);assert(!layer.active,'released bag returns exactly to rest');
 }
});
test('ticket and cloth use the same pocket coordinates while rigid frames keep their shape',()=>{
 const bag=TOKYO_BODIES.find(d=>d.id==='tote'),pose={angle:.3,bend:.2};assert(bendsBody(bag));assert.deepEqual(bodyPoint(bag,pose,...bag.pivot),{x:bag.pivot[0],y:bag.pivot[1]});assert(bodyPoint(bag,pose,590,620).x<590,'rightward hand angle shifts cloth and pocket left together');
 for(const d of [...SEOUL_BODIES,...TOKYO_BODIES].filter(d=>['frame','board','lantern','furin','hanji'].includes(d.id))){assert(!bendsBody(d),d.id);const [a,b]=d.points,p=bodyPoint(d,pose,...a),q=bodyPoint(d,pose,...b);assert(Math.abs(Math.hypot(p.x-q.x,p.y-q.y)-Math.hypot(a[0]-b[0],a[1]-b[1]))<1e-7,d.id);}
});
