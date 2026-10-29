import test from 'node:test';import assert from 'node:assert/strict';
import {createAnimalVisitors} from '../dist/island/animal-visitors.js';
import {fresh,route} from '../dist/island/core.js';
test('visitors arrive along a valid route, idle, greet and leave without changing the saved island',async()=>{
 const oldFetch=globalThis.fetch,oldImage=globalThis.Image,oldDoc=globalThis.document;
 globalThis.fetch=async()=>({ok:true,json:async()=>({animals:[{id:'dog',name:'강아지',sheet:'dog.webp'}]})});globalThis.Image=class{async decode(){}};globalThis.document={hidden:false};
 try{const state=fresh(),before=JSON.stringify(state),messages=[];let renders=0;
 const v=createAnimalVisitors({project:(c,r)=>[480+(c-r)*42,220+(c+r)*22],findRoute:route,getState:()=>state,redraw:()=>renders++,announce:s=>messages.push(s),world:{querySelector:()=>({setAttribute(){},querySelector:()=>({setAttribute(){},querySelector:()=>({setAttribute(){}})})})},random:()=>0});
 await v.ready;let t=performance.now()+91000;v.tick(t);await new Promise(r=>setImmediate(r));assert.equal(v.active.id,'dog');assert.ok(v.render().html.includes('data-animal-canvas'));v.greet();assert.match(messages.at(-1),/인사/);
 let sawIdle=false,departed=false;for(let i=0;i<500;i++){t+=100;v.tick(t);if(v.active?.waitUntil)sawIdle=true;if(!v.active){departed=true;break;}}
 assert.ok(sawIdle);assert.ok(departed);assert.equal(JSON.stringify(state),before);assert.ok(renders>2);
 }finally{globalThis.fetch=oldFetch;globalThis.Image=oldImage;globalThis.document=oldDoc;}
});

