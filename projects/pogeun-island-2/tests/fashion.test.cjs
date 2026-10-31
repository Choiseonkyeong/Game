const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const read=f=>fs.readFileSync(__dirname+'/../dist/'+f,'utf8');
let time=100000;const memory={};const storage={getItem:k=>memory[k],setItem:(k,v)=>memory[k]=v};
function boot(){const context={drawImage(){},clearRect(){}};const s={structuredClone,localStorage:storage,document:{createElement:()=>({getContext:()=>context}),querySelector:()=>null},Image:class{complete=true;naturalWidth=240;set src(v){this.value=v;this.onload()}get src(){return this.value}},now:()=>time};vm.createContext(s);vm.runInContext(read('economy.js')+'\nconst economy=LifeEconomy.create({storage:localStorage,now});globalThis.e=economy;',s);vm.runInContext(read('sprite-config.js')+'\n'+read('wardrobe.js')+'\nglobalThis.w=Wardrobe;',s);return s}
let {e,w}=boot();assert.equal(w.equip('shop-cloud'),false,'unowned item cannot be equipped');
let before=e.data.shells;assert.equal(e.purchase(['shop-cloud','shop-cloud']).ok,false);assert.equal(e.purchase(['craft-moon']).ok,false);assert.equal(e.purchase(['missing']).ok,false);assert.equal(e.data.shells,before);
assert.equal(e.purchase(['shop-cloud','shop-rose']).ok,true);assert.equal(e.data.shells,before-700);assert.equal(e.data.owned.length,2);assert.equal(e.purchase(['shop-cloud']).ok,false);assert.equal(w.equip('shop-cloud'),true);w.save(1);
let restored=boot();assert.equal(restored.w.equipped.top,'shop-cloud');assert.equal(restored.w.saved[1].top,'shop-cloud');assert.equal(restored.e.data.owned.length,2);
assert.equal(e.craft('craft-cotton').ok,false);assert.equal(e.claimQuest().ok,false);
for(let i=0;i<5;i++)assert.equal(e.plant(i,'cotton').ok,true);
for(let i=5;i<8;i++)assert.equal(e.plant(i,'carrot').ok,true);
time+=30000;for(let i=0;i<8;i++)assert.equal(e.harvest(i).ok,true);
assert.equal(e.claimQuest().ok,true);assert.equal(e.data.inventory.moonDust,1);assert.equal(e.claimQuest().ok,false);assert.equal(e.data.inventory.moonDust,1);
before=e.data.shells;assert.equal(e.craft('craft-cotton').ok,true);assert.equal(e.data.shells,before-100);assert.equal(e.data.inventory.cotton,3);
assert.equal(e.craft('craft-moon').ok,true);assert.equal(e.data.inventory.moonDust,0);assert.equal(e.data.inventory.cotton,0);assert.equal(w.equip('craft-moon'),true);w.save(2);
before=e.data.shells;assert.equal(e.craft('craft-moon').ok,false);assert.equal(e.data.shells,before);
restored=boot();assert.equal(restored.w.equipped.top,'craft-moon');assert.equal(restored.w.load(2),true);assert.equal(restored.e.data.claimed.length,1);
const poorKey='pogeun.economy.v1';memory[poorKey]=JSON.stringify({...e.data,shells:1,owned:[]});const poor=boot().e;assert.equal(poor.purchase(['shop-cloud','shop-rose']).ok,false);assert.equal(poor.data.shells,1);assert.equal(poor.data.owned.length,0);
console.log('PASS: atomic checkout, ownership gating, insufficient funds/materials, crafting costs, one-time quest, unique synthesis, acquired outfit save/reload');
