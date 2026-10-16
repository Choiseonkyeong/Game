import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {levels} from '../dist/story.js';
import {fresh,dispatch,active,solution} from '../dist/engine.js';
// Exercise real Three.js meshes without a GPU/browser. Canvas labels use a no-op drawing surface.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},beginPath(){},roundRect(){},fill(){},fillText(){}})})};
const {World,cat}=await import('../dist/world.js');
test('all 30 real 3D stages contain pickable puzzle objects at every step',()=>{
 const w=Object.create(World.prototype);Object.assign(w,{scene:new T.Scene(),stage:new T.Group(),hero:cat(),objects:new Map(),key:{color:new T.Color()}});w.scene.add(w.stage);
 for(let i=0;i<levels.length;i++){
 let s=fresh(i);const actions=solution(i);
 const check=()=>{w.build(levels[i],s);const rule=active(s);if(rule){const ids=[rule.item,rule.target,...rule.items||[]].filter(Boolean);for(const id of ids)assert(id==='hero'||w.objects.has(id),`stage ${i+1} step ${s.step}: missing ${id}`);}
 w.stage.updateMatrixWorld(true);w.stage.traverse(o=>{if(o.geometry?.attributes.position){const arr=o.geometry.attributes.position.array;assert(arr.every(Number.isFinite),`invalid geometry in stage ${i+1}`);}});};
 check();for(const a of actions){s=dispatch(s,a).state;check();}
 }
 w.clear();assert.equal(w.objects.size,0);
});
test('3D hero remains a consistent mesh with physical fabric material',()=>{const hero=cat();let meshes=0,physical=false;hero.traverse(o=>{if(o.isMesh){meshes++;if(o.material.isMeshPhysicalMaterial)physical=true;}});assert(meshes>25);assert(physical);});
