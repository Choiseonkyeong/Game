import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
import{fresh,restore,initializeLoop,setTerrain,approach,apply}from'../dist/island/core.js';
import{sellFromBag,useBagSupply,inventoryMarkup}from'../dist/island/inventory62.js';
import{terrainStage}from'../dist/island/progression.js';
import{levelTwoScene}from'../dist/island/level-two-visual.js';
import{homeViewBox}from'../dist/island/home-camera.js';
const terrain=JSON.parse(fs.readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));
test('harvest is retained once in inventory, sold once, and survives reload without duplicating legacy apples',()=>{
 setTerrain(terrain.stages[0].cells);
 try{
  let s=fresh();s.items=[];s.avatar=[13,11];s=initializeLoop(s,1,1000);const p=s.items[0];s.avatar=approach(s,s.avatar,p).at(-1);
  const harvest=apply(s,{type:'harvest-seed',id:p.id},241001);assert(harvest.ok);assert.deepEqual(harvest.harvested,{id:'seed-apple',count:1});
  s=restore(JSON.stringify(harvest.state));assert.equal(s.inventory['seed-apple'],1);assert.equal(s.loop.level,2);assert(!apply(s,{type:'harvest-seed',id:p.id},241001).ok);
  const sold=sellFromBag(s,'seed-apple');assert(sold.ok);assert.equal(sold.earned,150);assert.equal(sold.state.inventory['seed-apple'],undefined);assert(!sellFromBag(sold.state,'seed-apple').ok);
  const old={...fresh(),apples:7,inventory:undefined};const migrated=restore(JSON.stringify(old));assert.equal(migrated.inventory.apple,7);assert.equal(migrated.apples,0);assert.deepEqual(restore(JSON.stringify(migrated)).inventory,migrated.inventory);
  assert.equal(sellFromBag(migrated,'apple',7).earned,35);assert(!sellFromBag(migrated,'apple',8).ok);assert(!sellFromBag(migrated,'apple',-1).ok);
 }finally{setTerrain(null);}
});
test('water and fertilizer consume one item only on a growing crop; reload retains stock and growth',()=>{
 let s=fresh();s.items=[{id:99,kind:'seedplot',seedKind:'apple',seedAt:Date.now(),seedBoost:0,c:6,r:7}];
 const invalid=useBagSupply(s,'fertilizer',100);assert(!invalid.ok);assert.equal(invalid.state,s);
 let used=useBagSupply(s,'fertilizer',99);assert(used.ok);assert.equal(used.state.inventory.fertilizer,1);assert.equal(used.state.items[0].seedBoost,45000);
 used=useBagSupply(used.state,'water',99);assert(used.ok);assert.equal(used.state.inventory.water,4);assert.equal(used.state.items[0].seedBoost,75000);
 const loaded=restore(JSON.stringify(used.state));assert.equal(loaded.inventory.fertilizer,1);assert.equal(loaded.inventory.water,4);
 const mature=structuredClone(s);mature.items[0].seedAt=Date.now()-300000;assert(!useBagSupply(mature,'water',99).ok);
 assert.match(inventoryMarkup(loaded,{tab:'supplies'}),/포근 보관함/);assert(!inventoryMarkup(loaded).includes('사과 0개'));
});
test('missing starter on every old island is repaired once while existing crops and progress are preserved',()=>{
 for(let level=1;level<=10;level++){
  setTerrain(terrainStage(terrain,level).cells);
  try{
   const s=restore(JSON.stringify(fresh()));s.loop={v:1,started:true,firstApple:true,starterId:777,level};const before=JSON.stringify(s.items),next=s.next;
   const repaired=initializeLoop(s,level,123456);assert(repaired.loop.starterId>=next);assert.equal(repaired.items.length,s.items.length+1);assert.equal(JSON.stringify(repaired.items.slice(0,-1)),before);assert.equal(repaired.loop.firstApple,true);
   const p=repaired.items.at(-1);assert.equal(p.seedAt,123456);assert.equal(p.seedBoost,0);assert(approach(repaired,repaired.avatar,p).length);assert.deepEqual(initializeLoop(repaired,level,999999),repaired);
  }finally{setTerrain(null);}
 }
});
test('the projected island really grows on screen after expansion instead of camera cancellation',()=>{
 const widths=[];
 for(let level=1;level<=10;level++){
  const scene=levelTwoScene(terrainStage(terrain,level),terrain,level),vb=homeViewBox(844,314,{stage:scene});widths.push(scene.width/vb[2]*844);
 }
 for(let i=1;i<widths.length;i++)assert(widths[i]>widths[i-1]);assert(widths[3]/widths[0]>1.35);
});
