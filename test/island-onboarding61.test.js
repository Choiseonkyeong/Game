import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tutorialStep} from '../dist/island/tutorial61.js';
import {headingForAngle,normalizeAngle} from '../dist/island/rotation61.js';
import {fresh,initializeLoop,setTerrain,approach,apply,restore} from '../dist/island/core.js';
import {seedStage} from '../dist/island/seed-shop.js';
import {readArchipelago,expand} from '../dist/island/archipelago.js';

test('tutorial follows saved starter care, harvest and actual paid expansion without spending early',()=>{
 const terrain=JSON.parse(readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));
 setTerrain(terrain.stages[0].cells);
 try{
  let state=fresh();state.items=[];state.avatar=[13,11];state=initializeLoop(state,1,100000);
  const id=state.loop.starterId;state.avatar=approach(state,state.avatar,state.items[0]).at(-1);
  const step=now=>tutorialStep({level:state.loop.level,harvested:state.loop.firstApple,stage:seedStage(state.items[0],now)});
  assert.equal(step(100000).step,1);
  let now=100001;
  while(seedStage(state.items[0],now)<5){const r=apply(state,{type:'tend-seed',id},now);assert(r.ok);state=restore(JSON.stringify(r.state));now+=10000;}
  assert.equal(step(now).step,2);
  const harvest=apply(state,{type:'harvest-seed',id},now);assert(harvest.ok);state=restore(JSON.stringify(harvest.state));
  assert.equal(step(now).action,'expand');
  const islands=readArchipelago(null);islands.islands[0].level=state.loop.level;
  assert(!expand(islands,harvest.earned-1).ok);assert.equal(islands.islands[0].level,2);
  const paid=expand(islands,harvest.earned);assert(paid.ok);assert.equal(paid.balance,0);
  assert.equal(tutorialStep({level:paid.state.islands[0].level}).action,'done');
 }finally{setTerrain(null);}
});

test('rotation wraps both ways and traverses the illustrated views in circular order',()=>{
 assert.deepEqual([0,90,180,270,360].map(headingForAngle),[0,3,1,2,0]);
 assert.equal(headingForAngle(-90),2);assert.equal(normalizeAngle(721),1);
});
