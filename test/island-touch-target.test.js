import test from 'node:test';
import assert from 'node:assert/strict';
import {itemBeforeAvatar} from '../dist/island/touch-target.js';
const node=(...selectors)=>({closest:s=>selectors.includes(s)?{}:null});
test('plant under avatar receives the tap, while bare avatar still opens wardrobe',()=>{
 const avatar=node('[data-avatar]'),plant=node('[data-id]'),background=node();
 assert.equal(itemBeforeAvatar(avatar,[avatar,plant,background]),plant);
 assert.equal(itemBeforeAvatar(avatar,[avatar,background]),avatar);
 assert.equal(itemBeforeAvatar(plant,[avatar,plant]),plant);
 const animal=node('[data-animal]');assert.equal(itemBeforeAvatar(animal,[animal,plant]),animal);
});
