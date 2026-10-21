import test from 'node:test';import assert from 'node:assert/strict';
import{walkFrame,walkingView}from'../dist/island/locomotion.js';
test('each stride returns to planted feet and the cycle closes without jumping',()=>{const frames=Array.from({length:6},(_,i)=>walkFrame((i+.01)/8));assert.deepEqual(frames,[0,1,2,0,4,5]);assert.equal(walkFrame(.75),0);assert.equal(walkFrame(-1),0);});
test('up/down movement uses back/front while diagonal turns retain a stable view',()=>{assert.equal(walkingView(0,50,3),0);assert.equal(walkingView(0,-50,0),1);assert.equal(walkingView(-50,0,1),2);assert.equal(walkingView(50,0,0),3);assert.equal(walkingView(20,18,3),3);assert.equal(walkingView(20,18,0),0);assert.equal(walkingView(0,0,2),2);});
