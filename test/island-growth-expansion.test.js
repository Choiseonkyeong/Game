import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {starterTreeArt} from '../dist/island/starter-tree-art.js';
import {fresh,initializeLoop,setTerrain,approach,apply,restore} from '../dist/island/core.js';
import {seedStage,SEED_CATALOG} from '../dist/island/seed-shop.js';
import {readArchipelago,expand} from '../dist/island/archipelago.js';
const terrain=JSON.parse(readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));

test('right starter grows through five unique visuals with watering; harvest and paid expansion preserve progress',()=>{
 setTerrain(terrain.stages[0].cells);
 try {
  let s=fresh();s.items=[];s.avatar=[13,11];s=initializeLoop(s,1,100000);
  const id=s.loop.starterId;s.avatar=approach(s,s.avatar,s.items[0]).at(-1);
  assert.equal(starterTreeArt(s.items[0],100000),'');
  // Fifteen seconds of water boost advances each one-minute phase sooner.
  let now=100001;const stages=new Set([1]),art=new Set();
  while(seedStage(s.items[0],now)<5){
   const r=apply(s,{type:'tend-seed',id},now);assert(r.ok);s=r.state;
   const p=s.items[0],stage=seedStage(p,now);stages.add(stage);
   if(stage>1)art.add(starterTreeArt(p,now));
   s=restore(JSON.stringify(s));now+=10000;
  }
  assert.deepEqual([...stages],[1,2,3,4,5]);assert.equal(art.size,4);
  assert.match(starterTreeArt(s.items[0],now),/data-growth-stage="5"/);
  const harvested=apply(s,{type:'harvest-seed',id},now);assert(harvested.ok);
  assert.equal(harvested.earned,SEED_CATALOG.apple.reward);
  assert(!apply(harvested.state,{type:'harvest-seed',id},now).ok);
  let a=readArchipelago(null);a.islands[0].level=harvested.state.loop.level;
  const original=JSON.stringify(a),failed=expand(a,149);assert(!failed.ok);assert.equal(JSON.stringify(a),original);
  const paid=expand(a,150);assert(paid.ok);assert.equal(paid.balance,0);assert.equal(paid.state.islands[0].level,3);
  assert.deepEqual(restore(JSON.stringify(harvested.state)),harvested.state);
 } finally {setTerrain(null);}
});
