import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{levelTwoScene,levelTwoDetails}from'../dist/island/level-two-visual.js';
import{terrainStage}from'../dist/island/progression.js';
const data=JSON.parse(fs.readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));
test('level two reuses the exact approved round island, house scale and house hitbox',()=>{
 const logical=terrainStage(data,2),before=JSON.stringify({data,logical}),scene=levelTwoScene(logical,data,2),base=data.stages[0];
 for(const k of ['file','x','y','width','height','scale','reference'])assert.equal(scene[k],base[k]);assert.deepEqual(scene.house,base.house);assert.equal(scene.cells,logical.cells);assert(scene.compactReference);assert.equal(JSON.stringify({data,logical}),before);assert.equal(levelTwoScene(logical,data,2),scene);
 const details=levelTwoDetails(scene);assert(details.includes('id="level-two-details"'));assert(details.includes('pointer-events="none"'));assert(!/image|filter|wind|bridge|panel|font|text/.test(details));
});
test('existing level-two coordinates fit the original lawn without changing saved cells',()=>{
 const logical=terrainStage(data,2),scene=levelTwoScene(logical,data,2),g=scene.renderGrid,base=data.grid;
 const project=([c,r],grid)=>[grid.ox+(c-r)*grid.hx,grid.oy+(c+r)*grid.hy],points=data.stages[0].cells.map(c=>project(c,base));
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);for(const cell of logical.cells){const[x,y]=project(cell,g);assert(x>=Math.min(...xs)-1e-8&&x<=Math.max(...xs)+1e-8);assert(y>=Math.min(...ys)-1e-8&&y<=Math.max(...ys)+1e-8);}
 for(const v of Object.values(g))assert(Number.isFinite(v)&&v>0);
});
test('other levels and artwork remain unchanged by the presentation adapter',()=>{
 for(const level of [1,3,4,5,6]){const logical=terrainStage(data,level);assert.equal(levelTwoScene(logical,data,level),logical);assert.equal(levelTwoDetails(logical),'');}
 assert.equal(levelTwoScene(null,data,2),null);
 const entry=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8');assert(entry.includes('setGrid(s.renderGrid||terrainData.grid)'));assert(entry.includes('${levelTwoDetails(st)}'));assert(entry.includes('footprint(st)'));
});
