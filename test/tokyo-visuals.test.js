import test from 'node:test';import assert from 'node:assert/strict';
import{drawerGeometry,envelopeQuad,quadPoint,fromDrawerBoard,toDrawerBoard,envelopeCentre}from'../dist/tokyo-visuals.js';
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
test('drawer tray, side rails and front remain attached at every intermediate position',()=>{
 for(const p of [0,.001,.1,.25,.5,.7,.99,1]){const g=drawerGeometry(p);assert.deepEqual(g.tray.slice(0,2),[[0,548],[488,500]],'fixed opening');assert.deepEqual(g.tray[3],g.front[0]);assert.deepEqual(g.tray[2],g.front[1]);assert(g.front.every(point=>point.every(Number.isFinite)));assert.equal(g.front[3][1]-g.front[0][1],155);}
});
test('envelopes slide rigidly with the tray instead of shrinking as it closes',()=>{
 for(const n of [12,27,31]){const full=envelopeQuad(1,n);for(const p of [.1,.4,.7,1]){const q=envelopeQuad(p,n);for(let i=0;i<4;i++)assert(Math.abs(length(q[i],q[(i+1)%4])-length(full[i],full[(i+1)%4]))<1e-8);const a=quadPoint(q,.5,.5);assert(Math.abs(a[1]-quadPoint(full,.5,.5)[1]-190*(p-1))<1e-8);}}
});
test('close-up touch mapping uses the same coordinates as the visible envelope and front',()=>{
 for(const n of [12,27,31]){const b=envelopeCentre(1,n),q=envelopeQuad(1,n),p=fromDrawerBoard(b),centre=quadPoint(q,.5,.5);assert(Math.abs(p.x-centre[0])<1e-8&&Math.abs(p.y-centre[1])<1e-8);assert(b.x>0&&b.x<800&&b.y>0&&b.y<1000);assert.deepEqual(toDrawerBoard(p),b);}
});
