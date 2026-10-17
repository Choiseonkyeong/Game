import test from 'node:test';import assert from 'node:assert/strict';
import {stages,tools,roomAreas} from '../dist/adventure.js';import {fresh,act,restore,visible} from '../dist/play-engine.js';
function solve(s){for(const r of stages[s.stage].rules){const result=act(s,{type:r.action,target:r.target,item:r.item,items:r.items,answer:r.answer,...r.solution});assert(result.ok,`Stage ${s.stage+1} ${r.action} ${r.target}: ${result.message}`);s=result.state;}assert(s.flags.done);return s;}
test('all 30 travel scenes solve and every save boundary restores the same state',()=>{let s=fresh();for(let i=0;i<30;i++){assert.equal(s.stage,i);s=solve(s);assert.deepEqual(restore({version:6,history:s.history}),s);if(i<29)s=act(s,{type:'next'}).state;}assert.equal(s.completed.length,30);assert(!act(s,{type:'next'}).ok);const revisit=act(s,{type:'visit',stage:0});assert(revisit.ok);s=solve(revisit.state);assert.equal(s.completed.length,30);assert.deepEqual(restore(s),s);});
test('first camera and film cannot be collected before their real hiding places are searched',()=>{let s=fresh();for(const id of ['camera','film'])assert(!act(s,{type:'tap',target:id}).ok);s=act(s,{type:'tap',target:'blanket'}).state;assert(!visible(s,stages[0].objects.find(o=>o.id==='camera')));assert(visible(s,stages[0].objects.find(o=>o.id==='camera_box')));assert(!act(s,{type:'code',target:'camera_box',answer:'000'}).ok);s=act(s,{type:'code',target:'camera_box',answer:'314'}).state;assert(visible(s,stages[0].objects.find(o=>o.id==='camera')));assert(!visible(s,stages[0].objects.find(o=>o.id==='film')));s=act(s,{type:'tap',target:'camera'}).state;assert.deepEqual(s.inventory,['camera']);assert(!visible(s,stages[0].objects.find(o=>o.id==='camera')));assert(!act(s,{type:'use',item:'camera',target:'window'}).ok);});
test('combination accepts either order, consumes materials and preserves them on failure',()=>{let s=fresh();s=act(s,{type:'tap',target:'blanket'}).state;s=act(s,{type:'code',target:'camera_box',answer:'314'}).state;for(const target of ['camera','tin','film'])s=act(s,{type:'tap',target}).state;const before=structuredClone(s);assert(!act(s,{type:'combine',items:['camera','camera']}).ok);assert.deepEqual(s,before);const r=act(s,{type:'combine',items:['film','camera']});assert(r.ok);assert.deepEqual(r.state.inventory,['loaded']);assert(!act(r.state,{type:'use',item:'film',target:'window'}).ok);});
test('every collectible is inside a believable container or retrieved from a physical gap',()=>{assert.equal(stages.length,30);assert.equal(new Set(stages.map(s=>s.room)).size,6);for(const l of stages){assert(l.goal.length>5);assert(l.hints.length>=2);assert.equal(new Set(l.objects.map(o=>o.id)).size,l.objects.length);for(const o of l.objects){assert(o.name.length>1);assert(o.x>=0&&o.x<=100&&o.y>=0&&o.y<=100);if(o.tool){assert(tools[o.tool]);assert(o.inside);assert(l.objects.some(p=>p.id===o.inside));assert(o.need.length>0);}else{assert(o.w&&o.h);assert(roomAreas[l.room][o.anchor]);}}for(const r of l.rules){if(r.target)assert(l.objects.some(o=>o.id===r.target));if(r.grant)assert(tools[r.grant]);}}});
test('invalid saves, old game saves and premature stage jumps cannot invent progress',()=>{for(const raw of [{version:5,history:[{type:'visit',stage:29}]},{version:6,flags:{done:true},completed:[29],history:[]},{version:6,history:[null,{}, {type:'visit',stage:29},{type:'combine',items:null}]}])assert.deepEqual(restore(raw),fresh());assert(!act(fresh(),{type:'next'}).ok);});

test('world observations persist, deduplicate and do not grant items or stage progress',()=>{let s=fresh();const r=act(s,{type:'explore',target:'world_pillow'});assert(r.ok);s=r.state;assert(s.world.pillow);assert.equal(s.observations.length,1);assert.deepEqual(s.inventory,[]);assert.deepEqual(s.completed,[]);assert.deepEqual(restore(s),s);assert(!act(s,{type:'explore',target:'world_pillow'}).ok);assert.equal(s.observations.length,1);assert(!act(s,{type:'explore',target:'imaginary_target'}).ok);});

test('examining a locked drawer never bypasses its key requirement',()=>{let s=fresh();for(let n=0;n<8;n++){s=solve(s);s=act(s,{type:'next'}).state;}assert.equal(s.stage,8);const result=act(s,{type:'explore',target:'drawer'});assert(!result.ok);assert(!result.state.flags.unlocked);assert(!result.state.world.drawer);assert(!act(s,{type:'tap',target:'photo'}).ok);});

import {gestureFrame,revealRect,isDark} from '../dist/world.js';
test('partial manipulation saves, reverses and never reveals a nested item too early',()=>{
 let s=fresh();s=act(s,{type:'shift',target:'blanket',progress:.25,direction:'left'}).state;
 assert(!s.flags.blanket_open);assert(!act(s,{type:'code',target:'camera_box',answer:'314'}).ok);assert.deepEqual(restore(s),s);
 s=act(s,{type:'shift',target:'blanket',progress:.8,direction:'left'}).state;assert(s.flags.blanket_open);assert(!s.flags.camera_box_open);assert(!act(s,{type:'tap',target:'camera'}).ok);
 assert(gestureFrame(30,0,100,100,{progress:.8,direction:'left'}).progress<.8);
 assert.equal(gestureFrame(-80,0,100,100).direction,'left');assert.equal(gestureFrame(0,-80,100,100).direction,'up');
 assert.deepEqual(revealRect([10,20,40,30],.5,'left'),[30,20,20,30]);
 assert(!act(s,{type:'shift',target:'blanket',progress:Infinity,direction:'left'}).ok);
});
test('the phosphor clue requires both darkness controls and persists after switching the lamp back on',()=>{
 let s=act(fresh(),{type:'light'}).state;assert(!isDark(s));
 s=act(s,{type:'shift',target:'window',progress:.5,direction:'down'}).state;assert(!isDark(s));
 s=act(s,{type:'shift',target:'window',progress:1,direction:'down'}).state;assert(isDark(s));assert(s.flags.dark_seen);
 s=act(s,{type:'light'}).state;assert(!isDark(s));assert(s.flags.dark_seen);assert.deepEqual(restore(s),s);
});
test('old first-scene saves retain collected items and valid progress after adding the nested box',()=>{
 const old={version:6,history:[{type:'tap',target:'blanket'},{type:'tap',target:'camera'},{type:'tap',target:'tin'},{type:'tap',target:'film'}]};
 const s=restore(old);assert.deepEqual(s.inventory,['camera','film']);assert(s.flags.camera_box_open);assert.deepEqual(restore(s),s);
});

import {foldBlend,sunlightGain} from '../dist/scene-surface.js';
test('registered bed transition stays bounded and sunlight compensation removes the brighter patch rather than darkening every pixel equally',()=>{
 assert.equal(foldBlend(0),0);assert.equal(foldBlend(1),1);assert.equal(foldBlend(-1),0);assert.equal(foldBlend(2),1);assert(foldBlend(.51)>foldBlend(.5));assert(foldBlend(.51)-foldBlend(.5)<.02);
 assert(sunlightGain(230,130)<sunlightGain(140,130));assert(sunlightGain(230,130)<.65);assert.equal(sunlightGain(100,100),1);
});
test('a telescope observation needs installation, a matching view and sharp focus',()=>{
 let s=fresh();s.stage=2;assert(!act(s,{type:'observe',target:'tower',x:48.5,y:16,focus:75}).ok);
 for(const a of [{type:'tap',target:'drawer'},{type:'tap',target:'scope'},{type:'use',item:'scope',target:'tower'}]){const r=act(s,a);assert(r.ok);s=r.state;}
 assert(!act(s,{type:'observe',target:'tower',x:48.5,y:16,focus:10}).ok);assert(!act(s,{type:'observe',target:'tower',x:43,y:16,focus:75}).ok);assert(act(s,{type:'observe',target:'tower',x:48.5,y:16,focus:75}).ok);
});
