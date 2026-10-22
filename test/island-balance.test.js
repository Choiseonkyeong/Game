import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
import{BALANCE}from'../dist/island/balance.js';import{validateBalance}from'../dist/island/balance-schema.js';
import{FEED,LIVESTOCK,ANIMAL_STAGES,ITEM_PRICES,CROPS}from'../dist/island/core.js';import{SEED_CATALOG}from'../dist/island/seed-shop.js';import{CLOTHING_PRICES}from'../dist/island/shells.js';import{EXPAND_COST,ISLAND_COST}from'../dist/island/archipelago.js';
test('runtime catalogues consume the provisional balance data without changing current values',()=>{
 assert.deepEqual(validateBalance(BALANCE),[]);assert(BALANCE.provisional);assert(Object.isFrozen(BALANCE.animals.cow));assert.equal(FEED.feed.price,2);assert.equal(FEED.milk.price,3);
 for(const[k,v]of Object.entries(BALANCE.animals)){for(const f of ['price','ms','shells','product'])assert.equal(LIVESTOCK[k][f],v[f]);assert.equal(ANIMAL_STAGES[k],v.stages);}
 for(const[k,v]of Object.entries(BALANCE.seeds))for(const f of ['price','ms','reward'])assert.equal(SEED_CATALOG[k][f],v[f]);
 assert.deepEqual(ITEM_PRICES,BALANCE.furniture);assert.equal(CLOTHING_PRICES['trench-set'],180);assert.equal(CROPS.carrot.ms,BALANCE.crops.carrot.ms);assert.deepEqual(EXPAND_COST,BALANCE.progression.expandCosts);assert.deepEqual(ISLAND_COST,BALANCE.progression.islandCosts);
});
test('schema rejects malformed, missing, unexpected and out-of-range balance values',()=>{
 for(const edit of [d=>d.feed.feed.price=-1,d=>d.animals.cow.stages=8,d=>d.animals.hen.ms=0,d=>d.progression.axisGrowth=NaN,d=>delete d.seeds.apple,d=>d.clothing.unimplemented=10,d=>d.progression.expandCosts.pop(),d=>d.schemaVersion=2,d=>d.feed.milk.price=true]){const d=structuredClone(BALANCE);edit(d);assert(validateBalance(d).length);}
});
test('editor changes valid values atomically, rejects invalid values without writing and exports complete JSON',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pogeun-balance-')),file=path.join(dir,'balance.json'),tool=fileURLToPath(new URL('../tools/pogeun-balance.mjs',import.meta.url));
 const run=(...args)=>spawnSync(process.execPath,[tool,'--file',file,...args],{encoding:'utf8'});
 try{fs.writeFileSync(file,JSON.stringify(BALANCE));assert.equal(run('set','feed.feed.price','4').status,0);assert.equal(JSON.parse(fs.readFileSync(file)).feed.feed.price,4);const before=fs.readFileSync(file,'utf8');for(const args of [['set','animals.hen.stages','9'],['set','feed.feed.price','-2'],['set','feed.unknown.price','2'],['set','feed','{}']]){assert.notEqual(run(...args).status,0);assert.equal(fs.readFileSync(file,'utf8'),before);}assert.equal(run('validate').status,0);const output=path.join(dir,'export.json');assert.equal(run('export',output).status,0);assert.deepEqual(JSON.parse(fs.readFileSync(output)),JSON.parse(before));assert.notEqual(run('export',output).status,0);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
