import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{levelTwoScene,levelTwoDetails}from'../dist/island/level-two-visual.js';
import{terrainStage}from'../dist/island/progression.js';
const data=JSON.parse(fs.readFileSync(new URL('../dist/island/art/world/sky-terrain.json',import.meta.url)));
test('level two expands the approved island and house while retaining original art and logical cells',()=>{
 const logical=terrainStage(data,2),before=JSON.stringify({data,logical}),scene=levelTwoScene(logical,data,2),base=data.stages[0];
 for(const k of ['file','scale','reference'])assert.equal(scene[k],base[k]);assert(Math.abs(scene.width/base.width-1.14)<1e-10);assert(Math.abs(scene.house[2]/base.house[2]-1.14)<1e-10);assert.equal(scene.cells,logical.cells);assert(scene.compactReference);assert.equal(JSON.stringify({data,logical}),before);assert.equal(levelTwoScene(logical,data,2),scene);
 const details=levelTwoDetails(scene);assert(details.includes('id="level-two-details"'));assert(details.includes('pointer-events="none"'));assert(!/image|filter|wind|bridge|panel|font|text/.test(details));
});
test('existing level-two coordinates fit the original lawn without changing saved cells',()=>{
 const logical=terrainStage(data,2),scene=levelTwoScene(logical,data,2),g=scene.renderGrid,base=data.grid;
 const project=([c,r],grid)=>[grid.ox+(c-r)*grid.hx,grid.oy+(c+r)*grid.hy],points=data.stages[0].cells.map(c=>project(c,base));
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);for(const cell of logical.cells){const[x,y]=project(cell,g);assert(x>=480+(Math.min(...xs)-480)*scene.expansion-1e-8&&x<=480+(Math.max(...xs)-480)*scene.expansion+1e-8);assert(y>=430+(Math.min(...ys)-430)*scene.expansion-1e-8&&y<=430+(Math.max(...ys)-430)*scene.expansion+1e-8);}
 for(const v of Object.values(g))assert(Number.isFinite(v)&&v>0);
});
test('other levels and artwork remain unchanged by the presentation adapter',()=>{
 for(const level of [1]){const logical=terrainStage(data,level);assert.equal(levelTwoScene(logical,data,level),logical);assert.equal(levelTwoDetails(logical),'');}
 assert.equal(levelTwoScene(null,data,2),null);
 const entry=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8');assert(entry.includes('setGrid(s.renderGrid||terrainData.grid)'));assert(entry.includes('${levelTwoDetails(st)}'));assert(entry.includes('homeViewBox('));
});

test('levels3–6 preserve one round island and grow modestly with unchanged logical cells',()=>{
 const base=data.stages[0];let previous=base.width;
 for(const level of [3,4,5,6]){const logical=terrainStage(data,level),before=JSON.stringify(logical),scene=levelTwoScene(logical,data,level);
 assert.equal(scene.file,base.file);assert.equal(scene.cells,logical.cells);assert.equal(JSON.stringify(logical),before);
 assert(scene.width>previous&&scene.width/previous<1.29);assert(scene.house[2]/base.house[2]<=1.71);
 assert(Math.abs(scene.width/base.width-scene.house[2]/base.house[2])<1e-10);assert(scene.compactReference);previous=scene.width;
 const xs=base.cells.map(([c,r])=>data.grid.ox+(c-r)*data.grid.hx),ys=base.cells.map(([c,r])=>data.grid.oy+(c+r)*data.grid.hy);
 for(const[c,r]of scene.cells){const g=scene.renderGrid,x=g.ox+(c-r)*g.hx,y=g.oy+(c+r)*g.hy;assert(x>=480+(Math.min(...xs)-480)*scene.expansion-1e-6&&x<=480+(Math.max(...xs)-480)*scene.expansion+1e-6);assert(y>=430+(Math.min(...ys)-430)*scene.expansion-1e-6&&y<=430+(Math.max(...ys)-430)*scene.expansion+1e-6);}
 }
});
