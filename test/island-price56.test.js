import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';
import{seedMarketMarkup}from'../dist/island/seed-market.js';
import{seedPriceLabels}from'../dist/island/seed-price-labels.js';
import{SEED_CATALOG}from'../dist/island/seed-shop.js?v=42';
import{fresh,apply}from'../dist/island/core.js';
test('sweet potato shown price is90, uses the purchasing catalogue and only covers its stale80',()=>{
 const markup=seedPriceLabels();assert.equal(SEED_CATALOG.sweetpotato.price,90);assert.match(markup,/data-seed-price="sweetpotato"/);assert.match(markup,/>90<\/text>/);assert.equal((markup.match(/data-seed-price=/g)||[]).length,1);
 assert.equal(apply(fresh(),{type:'buy-seed',seedKind:'sweetpotato'}).ok,true);
});
test('a future price change automatically changes the visible artwork label without touching the image',()=>{
 const catalog=structuredClone(SEED_CATALOG);catalog.sweetpotato.price=135;catalog.corn.price=100;const markup=seedPriceLabels(catalog);assert.match(markup,/>135<\/text>/);assert.match(markup,/data-seed-price="corn"/);assert.match(markup,/>100<\/text>/);
 catalog.sweetpotato.price=80;catalog.corn.price=90;assert.equal(seedPriceLabels(catalog),'');
});
test('actual shop and purchase window both render the catalogue price',()=>{
 const source=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8'),html={};const nodes={dialog:{classList:{add(){}},open:false,showModal(){this.open=true;}},'seed-purchase':{open:false,showModal(){this.open=true;}}};
 const ctx={cancelWalk(){},modal(s){html.shop=s;},$:(id)=>nodes[id],seedPriceLabels,seedMarketMarkup,SEED_CATALOG,SEED_DESCRIPTION:'',seedImageRegions:{sweetpotato:[12.6,60.2,9.2,20.5]},shellIcon:'',shells:90,state:{seedStock:{}},selectedShopSeed:null};
 vm.runInNewContext(source.split('\n').filter(x=>x.startsWith('function seedMarket(')||x.startsWith('function seedPurchase(')).join('\n'),ctx);ctx.seedMarket();ctx.seedPurchase('sweetpotato');
 assert.match(html.shop,/data-seed-price="sweetpotato"/);assert.match(html.shop,/고구마 씨앗 선택 · 조개 90/);assert.match(nodes['seed-purchase'].innerHTML,/조개 90개/);
});
