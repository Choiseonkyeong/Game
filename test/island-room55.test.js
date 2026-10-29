import test from 'node:test';import assert from 'node:assert/strict';
import{createRoom,roomTarget}from'../dist/island/room.js';
test('room keyboard stops when released and clamps the character to the existing floor',()=>{
 let transform='';const world={querySelector:()=>({setAttribute:(k,v)=>{if(k==='transform')transform=v;}}),querySelectorAll:()=>[]};
 const room=createRoom({world,announce(){},onChange(){}});room.enter();room.tick(1000,[1,0]);for(let i=1;i<400;i++)room.tick(1000+i*16,[1,0]);
 assert.match(transform,/translate\(810 610\)/);room.tick(7500);const stopped=transform;room.tick(8000);assert.equal(transform,stopped);assert.deepEqual(roomTarget(-50,999),[220,690]);
 room.leave();assert.equal(room.inside,false);
});
