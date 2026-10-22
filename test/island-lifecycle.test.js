import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{fresh,restore,initializeLoop,apply,FEED,LIVESTOCK,ANIMAL_STAGES,productReady,setTerrain,approach,passable}from'../dist/island/core.js';
import{terrainStage}from'../dist/island/progression.js';
import{purchaseClothing}from'../dist/island/shells.js';
test('starter migration is idempotent, preserves possessions and first ripe apple reaches level two once',()=>{
 let s=initializeLoop(fresh(),1,1000);assert.equal(s.items.filter(p=>p.seedKind==='apple').length,1);assert.deepEqual(initializeLoop(s,1,1000),s);assert.deepEqual(restore(JSON.stringify(s)),s);
 const p=s.items.find(p=>p.seedKind==='apple');s.avatar=approach(s,s.avatar,p).at(-1);assert(!apply(s,{type:'harvest-seed',id:p.id},1001).ok);
 let r=apply(s,{type:'harvest-seed',id:p.id},241000);assert(r.ok);assert.equal(r.earned,150);assert.equal(r.state.loop.level,2);assert(r.state.loop.firstApple);assert(!apply(r.state,{type:'harvest-seed',id:p.id},241000).ok);
 r=apply(r.state,{type:'harvest-seed',id:p.id},481000);assert(r.ok);assert.equal(r.state.loop.level,2);
});
test('all animals require level four, purchased food, digestion and 5–7 growth stages before repeatable rewards',()=>{
 for(const kind of Object.keys(LIVESTOCK)){
 let s=fresh();s.items=[];s.avatar=[4,7];assert(!apply(s,{type:'adopt',kind,c:4,r:6},1000).ok);s.loop.level=4;s=apply(s,{type:'adopt',kind,c:4,r:6},1000).state;const id=s.animals[0].id,ms=LIVESTOCK[kind].ms;let now=1000;
 assert(!apply(s,{type:'feed',id,food:'feed'},now).ok);assert(!apply(s,{type:'collect',id},1e12).ok);
 for(let i=0;i<ANIMAL_STAGES[kind];i++){
 s=apply(s,{type:'buy-feed',food:i%2?'milk':'feed'}).state;const r=apply(s,{type:'feed',id,food:i%2?'milk':'feed'},now);assert(r.ok);s=r.state;assert(!apply(s,{type:'feed',id,food:'feed'},now).ok);assert(!productReady(s.animals[0],now));assert.deepEqual(restore(JSON.stringify(s)),s);now+=ms;
 }
 assert(productReady(s.animals[0],now));assert.equal(s.animals[0].stage,ANIMAL_STAGES[kind]);let r=apply(s,{type:'collect',id},now);assert(r.ok);assert.equal(r.earned,LIVESTOCK[kind].shells);assert(!apply(r.state,{type:'collect',id},now+ms*100).ok);
 s=apply(r.state,{type:'buy-feed',food:'feed'}).state;s=apply(s,{type:'feed',id,food:'feed'},now).state;assert(productReady(s.animals[0],now+ms));assert.equal(FEED.feed.price,2);
 }
});
test('clothing purchases spend once, reject insufficient funds and preserve owned items',()=>{assert(!purchaseClothing(179,[],'trench-set').ok);const r=purchaseClothing(200,[],'trench-set');assert.equal(r.balance,20);assert.deepEqual(r.owned,['trench-set']);assert.equal(purchaseClothing(20,r.owned,'trench-set').balance,20);assert(!purchaseClothing(200,[],'missing').ok);});
test('all growth terrains fit larger art, have connected collision tiles and keep starter reachable',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));let width=0,height=0;
 try{for(let level=1;level<=6;level++){const st=terrainStage(data,level);assert(st.width>width&&st.height>height);width=st.width;height=st.height;const cells=new Set(st.cells.map(c=>c.join(','))),seen=new Set(),q=[st.cells[0]];while(q.length){const[c,r]=q.pop(),key=c+','+r;if(seen.has(key))continue;seen.add(key);for(const n of [[c+1,r],[c-1,r],[c,r+1],[c,r-1]])if(cells.has(n.join(','))&&!seen.has(n.join(',')))q.push(n);}assert.equal(seen.size,cells.size);setTerrain(st.cells);const s=initializeLoop(restore(JSON.stringify(fresh())),level,1000),p=s.items.find(p=>p.seedKind==='apple');assert(p);assert(passable(s,...s.avatar));assert(approach(s,s.avatar,p).length);}}finally{setTerrain(null);}
});
