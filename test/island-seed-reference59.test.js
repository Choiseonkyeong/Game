import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import crypto from'node:crypto';
import{seedMarketMarkup,seedGrowthMarkup,SEED_SHOP_ART,SEED_SHOP_REGIONS,SEED_SHOP_FRAME}from'../dist/island/seed-market.js';
import{SEED_CATALOG}from'../dist/island/seed-shop.js';

test('approved shop asset is the exact attached reference, without regeneration or pixel edits',()=>{
 const bytes=fs.readFileSync(new URL('../dist/island/'+SEED_SHOP_ART,import.meta.url));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'07a979674dd46b7652ee0c1c1cc6d682df98f57be0baabe3e5de9ed7e5d68a3f');
 assert.match(seedMarketMarkup(),/seed-shop-approved-59\.jpg/);
});

test('seven hit regions fit their reference cards in a four-over-three arrangement and never overlap',()=>{
 const regions=Object.values(SEED_SHOP_REGIONS);assert.equal(regions.length,7);
 assert.equal(new Set(regions.slice(0,4).map(r=>r.card[1])).size,1);assert.equal(new Set(regions.slice(4).map(r=>r.card[1])).size,1);
 for(const {card:[x,y,w,h],label:[lx,ly,lw,lh]}of regions){assert(x>=0&&x+w<=SEED_SHOP_FRAME.width);assert(y>=SEED_SHOP_FRAME.top&&y+h<=SEED_SHOP_FRAME.top+SEED_SHOP_FRAME.height);assert(lx>=x&&lx+lw<=x+w&&ly>=y&&ly+lh<=y+h);}
 for(let i=0;i<regions.length;i++)for(let j=i+1;j<regions.length;j++){const[a,b]=[regions[i].card,regions[j].card];assert(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1]);}
});

test('reference scene wallet, quantity, accessible names and prices use live data; help has no stale image price',()=>{
 const catalog=structuredClone(SEED_CATALOG);catalog.sweetpotato.price=135;catalog.corn.price=101;
 const html=seedMarketMarkup({shells:8765,stock:{sweetpotato:12,corn:3},catalog}),help=seedGrowthMarkup(catalog);
 assert.match(html,/조개 8765개/);assert.match(html,/data-seed-stock="sweetpotato">보유 12개/);assert.match(html,/고구마 씨앗 선택 · 조개 135 · 보유 12개/);
 for(const[id,seed]of Object.entries(catalog)){assert(html.includes(`data-seed-price="${id}">조개 ${seed.price}`));assert(help.includes(`data-guide-price="${id}">조개 ${seed.price}`));}
 assert(!html.includes('seed-guide.webp'));assert(!help.includes('<img'));assert.match(html,/data-act="seed-guide"/);assert.match(help,/data-act="seed-market"/);
});
