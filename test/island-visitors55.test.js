import test from 'node:test';import assert from 'node:assert/strict';
import{createAnimalVisitors}from'../dist/island/animal-visitors.js';
import{fresh,route}from'../dist/island/core.js';
test('slow sprite loads never start overlapping visits and idle time respects the first-visit delay',async()=>{
 const oldFetch=globalThis.fetch,oldImage=globalThis.Image,oldDoc=globalThis.document;let release,loads=0;
 globalThis.fetch=async()=>({ok:true,json:async()=>({animals:[{id:'dog',name:'강아지',sheet:'dog.webp'}]})});
 globalThis.Image=class{decode(){loads++;return new Promise(r=>release=r);}};globalThis.document={hidden:false};
 try{const s=fresh(),start=performance.now(),v=createAnimalVisitors({project:(c,r)=>[c*42,r*20],findRoute:route,getState:()=>s,redraw(){},announce(){},world:{querySelector:()=>null},random:()=>0});
 await v.ready;v.tick(start+10000);assert.equal(loads,0);v.tick(start+91000);assert.equal(loads,1);v.tick(start+150000);assert.equal(loads,1);release();await new Promise(r=>setImmediate(r));assert.equal(v.active.id,'dog');
 }finally{globalThis.fetch=oldFetch;globalThis.Image=oldImage;globalThis.document=oldDoc;}
});
