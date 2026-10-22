import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import{readProfile,centerAvatar}from'../dist/island/profile.js';
import{fresh,setTerrain,passable}from'../dist/island/core.js?v=44';
import{setGrid,project}from'../dist/island/movement.js?v=44';
test('profile validates a required name and selected base character',()=>{for(const gender of ['female','male'])assert.deepEqual(readProfile(JSON.stringify({name:' 수밍 ',gender})),{name:'수밍',gender});for(const p of [null,{}, {name:' ',gender:'female'},{name:'수밍',gender:'other'},{name:'a'.repeat(21),gender:'male'}])assert.equal(readProfile(JSON.stringify(p)),null);assert.equal(readProfile('bad JSON'),null);});
test('all six islands start on the closest unoccupied central tile without deleting belongings',()=>{const data=JSON.parse(fs.readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));setGrid(data.grid);for(const stage of data.stages){setTerrain(stage.cells);const s=fresh();s.items=[{id:1,kind:'pot',c:stage.cells[0][0],r:stage.cells[0][1]}];s.animals=[];const items=JSON.stringify(s.items);assert.equal(centerAvatar(s),true);assert.equal(passable(s,...s.avatar),true);const ps=stage.cells.map(c=>project(...c)),mid=ps.reduce((a,p)=>[a[0]+p[0]/ps.length,a[1]+p[1]/ps.length],[0,0]),dist=c=>{const p=project(...c);return Math.hypot(p[0]-mid[0],p[1]-mid[1]);};for(const c of stage.cells.filter(c=>passable(s,...c)))assert.ok(dist(s.avatar)<=dist(c)+1e-8);assert.equal(JSON.stringify(s.items),items);}setTerrain(null);});
