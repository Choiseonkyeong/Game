import test from 'node:test';
import assert from 'node:assert/strict';
import{keyboardDirection,keyboardStep}from'../dist/island/keyboard-walk.js';
import{fresh,setTerrain,passable}from'../dist/island/core.js?v=62';
import{project,unproject,setGrid}from'../dist/island/movement.js?v=55';
test('diagonal keys keep the same speed, opposite keys stop, and WASD matches arrows',()=>{
 assert.deepEqual(keyboardDirection(new Set(['a'])),[-1,0]);
 assert.deepEqual(keyboardDirection(new Set(['ArrowUp'])),[0,-1]);
 assert.deepEqual(keyboardDirection(new Set(['a','d'])),[0,0]);
 assert.equal(Math.hypot(...keyboardDirection(new Set(['w','d']))),1);
});
test('held keyboard movement is independent of frame rate and preserves saved belongings',()=>{
 setGrid({hx:42,hy:20,ox:480,oy:210});setTerrain(Array.from({length:25},(_,i)=>[i%5,Math.floor(i/5)]));
 try{const s=fresh();s.items=[];s.animals=[];const before=JSON.stringify(s);
 for(const fps of [30,60,120]){let p=project(2,2);const start=[...p];for(let i=0;i<fps/2;i++)p=keyboardStep(s,p,[1,0],72/fps);assert.ok(Math.abs(p[0]-start[0]-36)<1e-7);assert.equal(p[1],start[1]);}
 assert.equal(JSON.stringify(s),before);
 }finally{setTerrain(null);}
});
test('keyboard movement cannot cross occupied tiles or leave the island even with a long frame',()=>{
 setGrid({hx:42,hy:20,ox:480,oy:210});setTerrain([[0,0],[1,0],[2,0],[3,0]]);
 try{const s=fresh();s.items=[{id:99,kind:'bench',c:1,r:0}];s.animals=[];
 let p=project(0,0),dir=[42/Math.hypot(42,20),20/Math.hypot(42,20)];
 for(let i=0;i<200;i++)p=keyboardStep(s,p,dir,2);
 const cell=unproject(...p).map(Math.round);assert.ok(cell.every(n=>n===0));assert.ok(passable(s,...cell));
 const beyond=keyboardStep(s,project(3,0),dir,500);assert.deepEqual(beyond,project(3,0));
 }finally{setTerrain(null);}
});
