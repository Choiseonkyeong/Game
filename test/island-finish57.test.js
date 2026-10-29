import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';
import{restoreWardrobe,baseOutfit}from'../dist/island/wardrobe.js';
import{wardrobeDisplay,usePaintedReference}from'../dist/island/wardrobe-display.js';
import{createWardrobeScreen}from'../dist/island/wardrobe-screen.js';
import{seedMarketMarkup}from'../dist/island/seed-market.js';
import{SEED_CATALOG}from'../dist/island/seed-shop.js';
import{ROOM_LAYOUT,createRoom}from'../dist/island/room.js';
import{createAnimalVisitors,VISIT_TIMING}from'../dist/island/animal-visitors.js';
import{fresh,route}from'../dist/island/core.js';

test('new clothes and beret survive real wardrobe selection, saved looks and restore; remove/reset clear the hat',()=>{
 let html,buttons=[],o=baseOutfit('female'),saved=[];
 const api={paper:{querySelectorAll:()=>buttons},dialog:{classList:{add(){}}},currentOutfit:()=>o,humanChoice:()=> 'female',shells:()=>0,say(){},changed(){},done(){},humanSnapshot:()=> 'data:image/png;base64,preview',savedLooks:()=>saved,saveLook(){saved.unshift({gender:'female',outfit:{...o}});},loadLook(i){o={...saved[i].outfit};},wearItem(slot,id){o[slot]=id;if(slot==='top'||slot==='bottom')o.dress='none';},modal(s){html=s;buttons=[...s.matchAll(/data-wui="([^"]+)"/g)].map(m=>({dataset:{wui:m[1]}}));}};
 const screen=createWardrobeScreen(api),click=key=>{const b=buttons.find(b=>b.dataset.wui===key);assert(b,key);b.onclick({stopPropagation(){}});};screen.open();
 for(const[category,id,slot,name]of[['top','ribbon-blouse','top','리본 블라우스'],['dress','overalls','dress','데님 멜빵바지'],['dress','cottage-dress','dress','코티지코어 원피스']]){
  click('category:'+category);click('item:'+id);click('category:accessory');click('item:beret');click('save');
  assert.match(html,/로즈 베레모/);assert.equal(o.hat,'beret');assert.equal(o[slot],id);
  const restored=restoreWardrobe(JSON.stringify({revision:22,female:o,looks:saved}));assert.deepEqual(restored.female,o);assert.equal(restored.looks[0].outfit.hat,'beret');assert.match(wardrobeDisplay(o).title,new RegExp(name));
  assert.equal(usePaintedReference(o,{female:true,preview:false,heading:0}),false);click('remove:accessory');assert.equal(o.hat,'none');click('load:0');assert.equal(o.hat,'beret');click('reset');assert.deepEqual(o,baseOutfit('female'));
 }
 assert.equal(restoreWardrobe(JSON.stringify({revision:22,female:{...o,hat:'bad'}})).female.hat,'none');
});

test('card shop shows every real catalogue price and quantity, including future price changes, without baked price text',()=>{
 const catalog=structuredClone(SEED_CATALOG);catalog.sweetpotato.price=135;
 const html=seedMarketMarkup({shells:987,stock:{sweetpotato:2},catalog});
 assert.equal((html.match(/data-seed-select=/g)||[]).length,7);
 for(const[id,v]of Object.entries(catalog))assert(html.includes(`data-seed-price="${id}">조개 ${v.price}`));
 assert.match(html,/밭작물 4단계 · 보유 2개/);assert.match(html,/조개 987개/);assert(!html.includes('seed-image-hit'));assert.match(html,/seed-glass-title/);
});

test('bed target uses the approved plate geometry and the resting avatar arrives beside the bed',()=>{
 let html='',transform='';const oldDocument=globalThis.document;globalThis.document={createElementNS:()=>({childNodes:[],set innerHTML(v){html=v;}})};const world={get innerHTML(){return html;},set innerHTML(v){html=v;},querySelector:()=>({setAttribute(k,v){if(k==='transform')transform=v;}}),querySelectorAll:()=>[]};
 world.childNodes=[];const room=createRoom({world,announce(){},onChange(){}});room.enter();room.render();globalThis.document=oldDocument;
 const[x,y,w,h]=ROOM_LAYOUT.bed;assert.match(html,new RegExp(`data-bed="1" x="${x}" y="${y}" width="${w}" height="${h}"`));assert.match(html,/scale\(1.8\)/);
 room.pick({closest:selector=>selector==='[data-bed]'},100,200);for(let t=1;t<14000;t+=16)room.tick(t);assert.equal(transform,'translate(235 448)');assert(235>x+w);
});

test('visits wait 90 seconds, depart, then wait at least three minutes',async()=>{
 const old={fetch:globalThis.fetch,Image:globalThis.Image,document:globalThis.document};
 globalThis.fetch=async()=>({ok:true,json:async()=>({animals:[{id:'dog',name:'강아지',sheet:'dog.webp'}]})});globalThis.Image=class{async decode(){}};globalThis.document={hidden:false};
 try{const state=fresh(),world={querySelector:()=>null},start=performance.now(),v=createAnimalVisitors({project:(c,r)=>[c*42,r*20],findRoute:route,getState:()=>state,redraw(){},announce(){},world,random:()=>0});await v.ready;
  v.tick(start+VISIT_TIMING.first-100);assert.equal(v.active,null);let now=start+VISIT_TIMING.first+100;v.tick(now);await new Promise(r=>setImmediate(r));assert(v.active);
  for(let i=0;i<1000&&v.active;i++){now+=100;v.tick(now);}assert.equal(v.active,null);
  v.tick(now+VISIT_TIMING.minGap-1);await new Promise(r=>setImmediate(r));assert.equal(v.active,null);v.tick(now+VISIT_TIMING.minGap+1);await new Promise(r=>setImmediate(r));assert(v.active);
 }finally{Object.assign(globalThis,old);}
});

test('keyboard animation paints the avatar once per animation frame, using the movement clock and heading',()=>{
 const source=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8'),paint=[];
 const ctx={tickTime:0,weather:{tick(){}},reduced:false,room:{inside:false},visitors:{tick(){}},busy:false,pointer:null,$:id=>id==='dialog'?{open:false}:{setAttribute(){}},lastFrame:0,document:{hidden:false},steps:[],to:null,walkKeys:new Set(['w']),mode:'walk',pose:'walk',face:1,back:true,walkHeading:1,walkClock:2,paintHumans:(_,opts)=>paint.push(opts),keyboardTick:()=>{paint.push({keyboard:true});return true;},petWait:Infinity,paintLivestock(){},state:{animals:[]},paintMomo(){},petTo:null,petSleeping:false,sortDepth(){},requestAnimationFrame(){}};
 vm.runInNewContext(source.slice(source.indexOf('function tick(t)'),source.indexOf('let stages=')),ctx);ctx.tick(16);assert.deepEqual(paint,[{keyboard:true}]);
});
