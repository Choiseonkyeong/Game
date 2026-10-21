import test from 'node:test';import assert from 'node:assert/strict';
import{walkFrame,walkingView,spriteOffset}from'../dist/island/locomotion.js';
test('each stride returns to planted feet and the cycle closes without jumping',()=>{const frames=Array.from({length:6},(_,i)=>walkFrame((i+.01)/8));assert.deepEqual(frames,[0,1,2,0,4,5]);assert.equal(walkFrame(.75),0);assert.equal(walkFrame(-1),0);});
test('up/down movement uses back/front while diagonal turns retain a stable view',()=>{assert.equal(walkingView(0,50,3),0);assert.equal(walkingView(0,-50,0),1);assert.equal(walkingView(-50,0,1),2);assert.equal(walkingView(50,0,0),3);assert.equal(walkingView(20,18,3),3);assert.equal(walkingView(20,18,0),0);assert.equal(walkingView(0,0,2),2);});

test('sprite registration cancels horizontal sheet drift and matches the ground on every step',()=>{const make=(shift,ground)=>{const d=new Uint8ClampedArray(128*192*4);for(let y=12;y<70;y++)for(let x=40+shift;x<=80+shift;x++)d[(y*128+x)*4+3]=255;d[(ground*128+64)*4+3]=255;return d;};for(const shift of [-8,-4,0,4,10])for(const ground of [180,181,182]){const [x,y]=spriteOffset(make(shift,ground));assert.equal(60+shift+x,64);assert.equal(ground+y,182);}});
test('empty sprite fallback has no invalid offsets',()=>{assert.deepEqual(spriteOffset(new Uint8ClampedArray(128*192*4)),[0,0]);});
