import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh,restore,setTerrain,terrainCells,passable,route,apply,CROPS} from '../dist/island/core.js';
import {addInitialBeds,approvedScene} from '../dist/island/approved-world.js';
import {levelTwoScene} from '../dist/island/level-two-visual.js';
import {terrainStage} from '../dist/island/progression.js';
const terrain=JSON.parse(readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));
setTerrain(terrain.stages[0].cells);
let state=fresh();state.items=[];state.avatar=[13,13];state.next=1;
addInitialBeds(state,passable);
assert.equal(state.items.length,3);
for(const bed of state.items) {
  assert.equal(passable(state,bed.c,bed.r),false,'bed blocks its own tile');
  assert.equal(route(state,state.avatar,[bed.c,bed.r]).length,0);
  assert.ok(terrainCells().some(([c,r])=>Math.abs(c-bed.c)+Math.abs(r-bed.r)===1&&route(state,state.avatar,[c,r]).length),'each bed is reachable');
}
state.avatar=[14,10];
let result=apply(state,{type:'sow',id:1,crop:'carrot'},1000);assert.ok(result.ok);
state=restore(JSON.stringify(result.state));assert.equal(state.items[0].crop,'carrot');
assert.equal(apply(state,{type:'reap',id:1},1001).ok,false);
result=apply(state,{type:'reap',id:1},1000+CROPS.carrot.ms);assert.ok(result.ok);
assert.equal(result.state.inventory['crop-carrot'],1);
assert.equal(result.state.items[0].crop,undefined);
// More than the initial beds can be independently placed, moved and saved.
state=result.state;
for(const [c,r] of [[11,12],[11,13],[11,14]]) {
  result=apply(state,{type:'place',kind:'field',c,r});assert.ok(result.ok);state=result.state;
}
assert.equal(restore(JSON.stringify(state)).items.filter(p=>p.kind==='field').length,6);
const saved=JSON.stringify(state);assert.deepEqual(restore(saved),JSON.parse(saved));
for(let level=1;level<=10;level++) {
  const original=levelTwoScene(terrainStage(terrain,level),terrain,level),updated=approvedScene(original);
  assert.deepEqual(updated.cells,original.cells,'art changes do not change saved terrain cells');
  assert.deepEqual(updated.renderGrid,original.renderGrid);
}
console.log('Approved2: three reachable independent beds; collision, sow/reap/inventory, save, six-bed expansion, ten-level grid preservation passed');
