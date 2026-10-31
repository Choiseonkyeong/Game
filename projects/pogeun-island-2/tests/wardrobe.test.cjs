const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../dist/sprite-config.js','utf8')+'\n'+fs.readFileSync(__dirname+'/../dist/wardrobe.js','utf8')+'\nglobalThis.api=Wardrobe;';
function boot(memory={},blocked=false){const draws=[];const context={drawImage(img){draws.push(img.src)},clearRect(){draws.length=0}};const sandbox={document:{createElement:()=>({getContext:()=>context}),querySelector:()=>null},localStorage:{getItem:k=>memory[k]??null,setItem(k,v){if(blocked)throw Error('quota');memory[k]=v}},Image:class{complete=true;naturalWidth=240;set src(v){this.value=v;this.onload()}get src(){return this.value}}};vm.runInNewContext(source,sandbox);return {api:sandbox.api,draws}}
const memory={};const {api,draws}=boot(memory);
assert.equal(api.equip('hat-beret'),true);api.equip('outer-pink');api.equip('top-pink');api.equip('bottom-skirt');
assert.deepEqual(draws,Array.from(api.order,s=>api.items.find(i=>i.id===api.equipped[s])?.src).filter(Boolean),'sprite drawing follows slot order');
assert.equal(api.equip('missing'),false);
assert.equal(api.save(0),true);assert.equal(api.save(-1),false);
api.equip('top-oat');assert.equal(api.saved[0].top,'top-pink','saved outfit must be a copy');
assert.equal(api.load(0),true);assert.equal(api.equipped.top,'top-pink');
const restored=boot(memory).api;assert.equal(restored.equipped.hat,'hat-beret');assert.equal(restored.saved[0].outer,'outer-pink');
restored.reset();assert.equal(restored.equipped.outer,null);assert.equal(restored.saved[0].outer,'outer-pink');
assert.equal(boot({},true).api.save(0),false,'blocked storage is reported');
assert.equal(boot({'pogeun.wardrobe.v1':'invalid json'}).api.equipped.body,'body-basic');
const invalid=boot({'pogeun.wardrobe.v1':JSON.stringify({version:1,equipped:{top:'hat-beret',outer:'unknown'},saved:[{hat:'top-pink'}]})}).api;
assert.equal(invalid.equipped.top,'top-oat');assert.equal(invalid.equipped.outer,null);assert.equal(invalid.saved[0].hat,null);
console.log('PASS: layer order, fitting, save snapshots, reload, reset, invalid data, unavailable storage');
