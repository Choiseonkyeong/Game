import test from 'node:test';
import assert from 'node:assert/strict';
import {createWardrobeScreen} from '../dist/island/wardrobe-screen.js';

test('wardrobe, shop, wear, rotate and reset retain the approved artwork scene',()=>{
 let html='',outfit={top:'white-tee',bottom:'black-shorts',dress:'none'},saved=0,changed=0,done=0,buttons=[];
 const paper={querySelector:()=>({}),querySelectorAll:()=>buttons};
 const api={paper,dialog:{classList:{add(){}}},currentOutfit:()=>outfit,humanChoice:()=> 'female',humanSnapshot:()=> 'data:image/png;base64,preview',shells:()=>12,saveLook:()=>saved++,say(){},changed:()=>changed++,done:()=>done++,wearItem:(key,value)=>{outfit[key]=value;},modal:markup=>{html=markup;buttons=[...markup.matchAll(/data-wui="([^"]+)"/g)].map(m=>({dataset:{wui:m[1]}}));}};
 const screen=createWardrobeScreen(api);
 const click=action=>{const b=buttons.find(b=>b.dataset.wui===action);assert.ok(b,action);b.onclick({stopPropagation(){}});assert.match(html,/wardrobe-approved-38\.jpeg/);assert.doesNotMatch(html,/fitting-header|wardrobe-reference-35/);};
 screen.open();assert.doesNotMatch(html,/wui-mirror-clean/);assert.match(html,/조개 12/);
 click('shop');assert.match(html,/상점 아이템/);assert.match(html,/미리보기/);
 click('item:trench-set');assert.equal(outfit.dress,'trench-set');assert.equal(changed,1);
 click('rotate');assert.match(html,/오른쪽/);click('rotate');assert.match(html,/뒷모습/);
 click('save');assert.equal(saved,1);
 click('closet');click('category:dress');assert.match(html,/aria-pressed="true"/);
 click('remove:top');assert.equal(outfit.dress,'none');
 click('reset');assert.equal(outfit.bottom,'shorts');
 click('done');assert.equal(done,1);
});
