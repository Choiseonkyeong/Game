import test from 'node:test';import assert from 'node:assert/strict';
import {FollowValue,previewState,paperPosition} from '../dist/interaction-motion.js';
import {fresh,act} from '../dist/play-engine.js';import {stages} from '../dist/adventure.js';
test('following stays continuous through irregular frames and reversal, then rests at the target',()=>{
 const value=new FollowValue(.1);value.set(.95);for(let i=0;i<8;i++)value.step(.016);const before=value.value,velocity=value.velocity;value.set(.2);assert.equal(value.value,before);assert.equal(value.velocity,velocity);
 for(let i=0;i<150;i++){const x=value.step(i%3===0?.033:.008);assert(Number.isFinite(x));assert(x>=0&&x<=1);}assert(value.resting);assert.equal(value.value,.2);
});
test('render preview reveals a container without copying or mutating the saved command history',()=>{
 let state=fresh();state=act(state,{type:'explore',target:'world_pillow'}).state;const snapshot=structuredClone(state),place=stages[0].objects.find(x=>x.id==='blanket'),rule=stages[0].rules[0];
 const preview=previewState(state,place,{progress:.8,direction:'up'},rule);assert(preview.flags.blanket_open);assert.strictEqual(preview.history,state.history);assert.deepEqual(state,snapshot);assert.deepEqual(preview.inventory,[]);assert(!state.flags.blanket_open);
 assert.deepEqual(paperPosition(10000,-10000,390,260),{x:.32,y:-.3});
});
