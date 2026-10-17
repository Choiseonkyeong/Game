import test from 'node:test';import assert from 'node:assert/strict';
import {initialTokyo,tokyoAction,restoreTokyo,tokyoInventory,tokyoHint,GOOD_FRAME} from '../dist/tokyo-engine.js';
const run=(s,...events)=>events.reduce((st,e)=>tokyoAction(st,e).state,s);
test('tokyo chapter links ticket, envelope, light, print and board in order',()=>{
 let s=run(initialTokyo(),{type:'start'});
 assert.equal(tokyoAction(s,{type:'drop',swing:.05}).ok,false,'a gentle push keeps the ticket in the pocket');
 s=run(s,{type:'drop',swing:-.2});assert(s.dropped);assert.deepEqual(tokyoInventory(s),[]);
 s=run(s,{type:'take',item:'ticket'});assert.deepEqual(tokyoInventory(s),['ticket']);
 assert.equal(tokyoAction(s,{type:'take',item:'negative',envelope:27}).reason,'closed');
 s=run(s,{type:'move',object:'drawer',value:1});
 assert.equal(tokyoAction(s,{type:'take',item:'negative',envelope:12}).reason,'other-envelope');
 s=run(s,{type:'take',item:'negative',envelope:27});assert.deepEqual(tokyoInventory(s),['negative']);
 assert.equal(tokyoAction(s,{type:'print',frame:GOOD_FRAME}).reason,'dark','the negative needs light');
 s=run(s,{type:'lamp'});const wrong=tokyoAction(s,{type:'print',frame:2});assert.equal(wrong.ok,false);assert.equal(wrong.reason,'shaken');assert.equal(wrong.state.tries,1);
 s=run(s,{type:'print',frame:GOOD_FRAME});assert.deepEqual(tokyoInventory(s),['print']);
 s=run(s,{type:'pin'});assert(s.done);assert.deepEqual(tokyoInventory(s),[]);assert.match(tokyoHint(s),/보드/);
});
test('envelope needs the claim ticket and damaged saves fall back safely',()=>{
 let s=run(initialTokyo(),{type:'drop',swing:.3},{type:'move',object:'drawer',value:.9});
 assert.equal(tokyoAction(s,{type:'take',item:'negative',envelope:27}).reason,'no-ticket');
 assert.deepEqual(restoreTokyo(null),initialTokyo());
 const forged=restoreTokyo({schema:1,pinned:true,print:true,negative:true,ticket:false,dropped:true,drawer:9});assert.equal(forged.done,false);assert.equal(forged.drawer,1);
});
