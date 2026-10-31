import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8');
const fixture=()=>({avatar:[13,11],tasks:{decorated:true},items:['bench','pot','pond','path','bowl','tree','seedplot'].map((kind,i)=>({id:i+9,kind,c:i+3,r:10,...(kind==='seedplot'?{seedKind:'apple',seedAt:1000}:{})}))});
test('actual startup preserves every user furniture kind and crop on an already migrated save',()=>{
 const state=fixture(),before=structuredClone(state),code=source.slice(source.indexOf('let referenceStart=false;'),source.indexOf('let reduced='));
 vm.runInNewContext(code,{state,stage:()=>({reference:true}),localStorage:{getItem:()=> '1'},centerAvatar:()=>{}});
 assert.deepEqual(state,before);
});
test('actual island loader preserves saved layouts while initializing its game loop',()=>{
 const state=fixture(),context={state:null,sharedBag:{water:4},sharedSeeds:{corn:2},sharedFeed:{feed:3,milk:0},structuredClone,archipelago:{},applyTerrain(){},initializeLoop:s=>s,restore:JSON.parse,activeIsland:()=>({level:2}),save(){},resetActor(){},render(){}};
 const code=source.split('\n').find(line=>line.startsWith('function loadIsland('));
 vm.runInNewContext(code,context);context.loadIsland(JSON.stringify(state));
 assert.deepEqual(JSON.parse(JSON.stringify(context.state)),{...state,inventory:{water:4},seedStock:{corn:2},feedStock:{feed:3,milk:0}});
});
test('one-time old layout cleanup keeps planted low-ID crops and any deliberately decorated layout',()=>{
 const code=source.slice(source.indexOf('let referenceStart=false;'),source.indexOf('let reduced='));
 const state={tasks:{},items:[{id:1,kind:'bench'},{id:2,kind:'pot',seed:'daisy'},{id:3,kind:'seedplot',seedKind:'apple'},{id:10,kind:'pond'}]};
 vm.runInNewContext(code,{state,stage:()=>({reference:true}),localStorage:{getItem:()=>null},centerAvatar:()=>{}});
 assert.deepEqual(state.items.map(p=>p.id),[2,3,10]);
 const decorated=fixture(),before=structuredClone(decorated);
 vm.runInNewContext(code,{state:decorated,stage:()=>({reference:true}),localStorage:{getItem:()=>null},centerAvatar:()=>{}});
 assert.deepEqual(decorated,before);
});
