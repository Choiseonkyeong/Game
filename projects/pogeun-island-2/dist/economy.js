'use strict';
const FashionCatalog = [
  {id:'shop-cloud',slot:'top',name:'구름 니트',tag:'꾸안꾸',price:280,base:'top-oat',color:'#d6dced'},
  {id:'shop-rose',slot:'outer',name:'로즈 오픈 가디건',tag:'러블리',price:420,base:'outer-pink',color:'#dc9eac'},
  {id:'shop-sage',slot:'bottom',name:'세이지 플리츠 스커트',tag:'꾸안꾸',price:320,base:'bottom-skirt',color:'#b8c9ac'},
  {id:'shop-ribbon',slot:'hat',name:'밀크 리본',tag:'러블리',price:180,base:'hat-ribbon',color:'#eadcc4'},
  {id:'craft-cotton',slot:'top',name:'폭신 코튼 블라우스',tag:'공방',base:'top-pink',color:'#eee8d3',recipe:{cotton:2,shells:100}},
  {id:'craft-moon',slot:'top',name:'달빛 별무리 블라우스',tag:'유니크',base:'top-pink',color:'#cbb9e7',unique:true,recipe:{cotton:3,moonDust:1,shells:200}}
];
if(typeof RequestedFashion!=='undefined')FashionCatalog.push(...RequestedFashion);
const LifeEconomy = (() => {
  const crops={carrot:{name:'몽글당근',icon:'🥕',cost:10,seconds:15,shells:55,material:'carrot'},cotton:{name:'폭신목화',icon:'☁',cost:20,seconds:30,shells:0,material:'cotton'}};
  const stalls=[{id:'npc-cotton',seller:'mori',name:'모리의 작은 가판대',item:'cotton',quantity:2,price:70},{id:'npc-carrot',seller:'nari',name:'나리의 햇살 가판대',item:'carrot',quantity:3,price:90},{id:'npc-chest',seller:'mori',name:'모리의 보물 가판대',item:'chest',quantity:1,price:160}];
  const tradable=['carrot','cotton','butterfly','dragonfly','chest'];
  const initial=()=>({version:1,shells:2450,inventory:{carrot:0,cotton:0,butterfly:0,dragonfly:0,chest:0,moonDust:0},plots:Array(15).fill(null),carrotsHarvested:0,owned:[],claimed:[],catalogVersion:2,market:{sold:[],listings:[],trades:[],reviews:[],nextId:1},home:{theme:'wizard',aerial:false}});
  function create({storage=null,now=()=>Date.now(),random=Math.random}={}){
    const key='pogeun.economy.v1';let data=initial(),storageOK=true;
    const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e12;
    try{const raw=JSON.parse(storage?.getItem(key)||'null');if(raw?.version===1){data.owned=FashionCatalog.filter(i=>Array.isArray(raw.owned)&&raw.owned.includes(i.id)).map(i=>i.id);if(!raw.catalogVersion&&typeof RequestedFashion!=='undefined'){data.owned.push(...RequestedFashion.filter(i=>i.id==='top-pink'&&!data.owned.includes(i.id)).map(i=>i.id))}data.claimed=Array.isArray(raw.claimed)?raw.claimed.filter(id=>id==='first-harvest'):[];if(count(raw.shells))data.shells=raw.shells;for(const k of Object.keys(data.inventory))if(count(raw.inventory?.[k]))data.inventory[k]=raw.inventory[k];if(count(raw.carrotsHarvested))data.carrotsHarvested=raw.carrotsHarvested;data.plots=data.plots.map((_,i)=>{const p=raw.plots?.[i];return p&&crops[p.crop]&&Number.isFinite(p.plantedAt)&&p.plantedAt>=0&&p.plantedAt<=now()?{crop:p.crop,plantedAt:p.plantedAt}:null})}}catch{storageOK=false}
    // Accept only known item/seller identifiers; text is rendered as text, never HTML.
    try{const raw=JSON.parse(storage?.getItem(key)||'null');if(raw?.version===1){
      if(['wizard','cafe'].includes(raw.home?.theme))data.home.theme=raw.home.theme;
      data.home.aerial=raw.home?.aerial===true;
      const m=raw.market;if(m){
        data.market.sold=stalls.filter(s=>Array.isArray(m.sold)&&m.sold.includes(s.id)).map(s=>s.id);
        const ids=new Set();
        data.market.listings=(Array.isArray(m.listings)?m.listings:[]).filter(l=>l&&Number.isSafeInteger(l.id)&&l.id>0&&!ids.has(l.id)&&ids.add(l.id)&&tradable.includes(l.item)&&Number.isSafeInteger(l.quantity)&&l.quantity>0&&l.quantity<=99&&Number.isSafeInteger(l.price)&&l.price>0&&l.price<=99999&&['listed','sold','claimed','cancelled'].includes(l.status)&&Number.isFinite(l.createdAt)&&l.createdAt>=0).slice(0,200).map(l=>({id:l.id,item:l.item,quantity:l.quantity,price:l.price,status:l.status,createdAt:l.createdAt}));
        const tradeIds=new Set();
        data.market.trades=(Array.isArray(m.trades)?m.trades:[]).filter(t=>t&&Number.isSafeInteger(t.id)&&t.id>0&&!tradeIds.has(t.id)&&tradeIds.add(t.id)&&['me','mori','nari'].includes(t.seller)&&['me','mori','nari'].includes(t.buyer)&&t.seller!==t.buyer&&tradable.includes(t.item)&&Number.isSafeInteger(t.quantity)&&t.quantity>0&&t.quantity<=99&&Number.isSafeInteger(t.price)&&t.price>0&&t.price<=99999&&Number.isFinite(t.at)).slice(0,400).map(t=>({id:t.id,seller:t.seller,buyer:t.buyer,item:t.item,quantity:t.quantity,price:t.price,at:t.at}));
        const reviewed=new Set();
        data.market.reviews=(Array.isArray(m.reviews)?m.reviews:[]).filter(r=>r&&data.market.trades.some(t=>t.id===r.tradeId)&&!reviewed.has(r.tradeId)&&reviewed.add(r.tradeId)&&['kind','lovely','quick'].includes(r.stamp)&&typeof r.text==='string'&&r.text.trim().length>0&&r.text.length<=200).map(r=>({tradeId:r.tradeId,stamp:r.stamp,text:r.text.trim()}));
        data.market.nextId=Math.max(0,...data.market.listings.map(l=>l.id),...data.market.trades.map(t=>t.id))+1;
      }
    }}catch{storageOK=false}
    let fishing=null;const listeners=new Set();
    function changed(){try{if(!storage)throw Error('unavailable');storage.setItem(key,JSON.stringify(data));storageOK=true}catch{storageOK=false}for(const fn of listeners)fn()}
    function plot(index){const p=data.plots[index];return !p?{stage:'empty'}:{...p,stage:now()-p.plantedAt>=crops[p.crop].seconds*1000?'ready':'growing',remaining:Math.max(0,Math.ceil(crops[p.crop].seconds-(now()-p.plantedAt)/1000))}}
    function plant(index,crop){if(!Number.isInteger(index)||index<0||index>=15||!crops[crop])return {ok:false,message:'잘못된 밭 또는 씨앗이에요.'};if(data.plots[index])return {ok:false,message:'이미 작물이 자라고 있어요.'};if(data.shells<crops[crop].cost)return {ok:false,message:'씨앗을 살 조개가 부족해요.'};data.shells-=crops[crop].cost;data.plots[index]={crop,plantedAt:now()};changed();return {ok:true,message:`${crops[crop].name} 씨앗을 심었어요!`}}
    function harvest(index){if(!Number.isInteger(index)||index<0||index>=15||plot(index).stage!=='ready')return {ok:false,message:'아직 수확할 수 없어요.'};const crop=crops[data.plots[index].crop];data.plots[index]=null;data.shells+=crop.shells;data.inventory[crop.material]++;if(crop.material==='carrot')data.carrotsHarvested++;changed();return {ok:true,message:crop.shells?`${crop.name} +1 · 조개 +${crop.shells}`:'폭신목화 원단 재료 +1'}}
    function catchBug(kind){if(!['butterfly','dragonfly'].includes(kind))return false;data.inventory[kind]++;data.shells+=kind==='butterfly'?15:25;changed();return true}
    function startFishing(){if(fishing)return false;fishing={start:now()};return true}
    function fishingState(){if(!fishing)return null;const elapsed=now()-fishing.start;return {position:(Math.sin(elapsed/340-Math.PI/2)+1)/2,remaining:Math.max(0,Math.ceil((8000-elapsed)/1000)),expired:elapsed>=8000}}
    function reel(){const f=fishingState();if(!f)return {ok:false,message:'먼저 낚싯대를 던져 주세요.'};fishing=null;if(f.expired||f.position<.38||f.position>.62)return {ok:false,message:f.expired?'시간이 다 됐어요. 다시 도전해 보세요!':'물고기가 빠져나갔어요. 다시 도전해 보세요!'};const treasure=random()<.25;if(treasure)data.inventory.chest++;else data.shells+=80;changed();return {ok:true,message:treasure?'반짝이는 보물상자 +1!':'바다의 선물 · 조개 +80!'}}
    function purchase(ids){
      if(!Array.isArray(ids)||!ids.length||ids.length>FashionCatalog.length||new Set(ids).size!==ids.length)return {ok:false,message:'장바구니를 확인해 주세요.'};
      const chosen=ids.map(id=>FashionCatalog.find(i=>i.id===id&&i.price));
      if(chosen.some(i=>!i||data.owned.includes(i.id)))return {ok:false,message:'이미 보유했거나 판매하지 않는 의상이 있어요.'};
      const total=chosen.reduce((sum,i)=>sum+i.price,0);if(data.shells<total)return {ok:false,message:'조개가 부족해요. 장바구니를 조정해 주세요.'};
      data.shells-=total;data.owned.push(...ids);changed();return {ok:true,message:`${ids.length}벌 구매 완료! 옷장에 담았어요.`};
    }
    function craft(id){const item=FashionCatalog.find(i=>i.id===id&&i.recipe);if(!item)return {ok:false,message:'없는 제작법이에요.'};if(data.owned.includes(id))return {ok:false,message:'이미 만든 의상이에요.'};const r=item.recipe;
      if(data.shells<r.shells||Object.entries(r).some(([key,amount])=>key!=='shells'&&(data.inventory[key]||0)<amount))return {ok:false,message:'조개 또는 제작 재료가 부족해요.'};
      data.shells-=r.shells;for(const [key,amount] of Object.entries(r))if(key!=='shells')data.inventory[key]-=amount;data.owned.push(id);changed();return {ok:true,message:item.unique?'유니크 합성 성공! 달빛 의상이 탄생했어요.':'폭신한 기본 의상을 완성했어요!'};
    }
    function claimQuest(){if(data.claimed.includes('first-harvest'))return {ok:false,message:'이미 받은 보상이에요.'};if(data.carrotsHarvested<3)return {ok:false,message:'먼저 몽글당근을 3개 수확해 주세요.'};data.claimed.push('first-harvest');data.inventory.moonDust++;changed();return {ok:true,message:'부탁 완료! 달빛 마법 가루 +1'};}
    const result=(ok,message)=>({ok,message});
    function buyStall(id){const s=stalls.find(s=>s.id===id);if(!s||data.market.sold.includes(id))return result(false,'이미 판매됐거나 없는 물건이에요.');if(data.shells<s.price)return result(false,'구매할 조개가 부족해요.');data.shells-=s.price;data.inventory[s.item]+=s.quantity;data.market.sold.push(id);const trade={id:data.market.nextId++,seller:s.seller,buyer:'me',item:s.item,quantity:s.quantity,price:s.price,at:now()};data.market.trades.push(trade);changed();return {...result(true,'구매 완료! 판매자의 공책에 후기를 남겨 주세요.'),tradeId:trade.id};}
    function listItem(item,quantity,price){if(!tradable.includes(item)||!Number.isInteger(quantity)||quantity<1||quantity>99||!Number.isInteger(price)||price<1||price>99999)return result(false,'수량은 1–99개, 묶음 가격은 1–99,999 조개로 입력해 주세요.');if(data.market.listings.filter(l=>l.status==='listed'||l.status==='sold').length>=6)return result(false,'가판대는 미정산 물건까지 최대 6개예요.');if(data.inventory[item]<quantity)return result(false,'판매할 물건이 부족해요.');data.inventory[item]-=quantity;data.market.listings.push({id:data.market.nextId++,item,quantity,price,status:'listed',createdAt:now()});changed();return result(true,'가판대에 진열했어요. 물건은 판매 보관함으로 옮겼어요.');}
    function cancelListing(id){settleMarket();const l=data.market.listings.find(l=>l.id===id);if(!l||l.status!=='listed')return result(false,'진열 중인 물건만 회수할 수 있어요.');l.status='cancelled';data.inventory[l.item]+=l.quantity;changed();return result(true,'물건을 가방으로 돌려받았어요.');}
    function settleMarket(){let updated=false;for(const l of data.market.listings){if(l.status==='listed'&&now()-l.createdAt>=20000){l.status='sold';const id=data.market.nextId++;data.market.trades.push({id,seller:'me',buyer:'nari',item:l.item,quantity:l.quantity,price:l.price,at:now()});data.market.reviews.push({tradeId:id,stamp:'lovely',text:'잘 쓸게요. 작은 가판대에 포근한 마음을 남겨요! — 나리 (연습 주민)'});updated=true}}if(updated)changed();return updated;}
    function collectSale(id){settleMarket();const l=data.market.listings.find(l=>l.id===id);if(!l||l.status!=='sold')return result(false,'정산할 판매 대금이 없어요.');l.status='claimed';data.shells+=l.price;changed();return result(true,`판매 대금 ${l.price.toLocaleString()} 조개를 받았어요!`);}
    function reviewTrade(tradeId,stamp,text){const t=data.market.trades.find(t=>t.id===tradeId);if(!t||t.buyer!=='me'||t.seller==='me')return result(false,'구매 완료한 거래에만 후기를 남길 수 있어요.');if(data.market.reviews.some(r=>r.tradeId===tradeId))return result(false,'이 거래에는 이미 후기를 남겼어요.');if(!['kind','lovely','quick'].includes(stamp)||typeof text!=='string'||!text.trim()||text.trim().length>200)return result(false,'도장을 고르고 1–200자의 후기를 적어 주세요.');data.market.reviews.push({tradeId,stamp,text:text.trim()});changed();return result(true,'도장 콩콩! 판매자의 공책에 마음을 남겼어요.');}
    function setTheme(theme){if(!['wizard','cafe'].includes(theme))return false;data.home.theme=theme;changed();return true;}
    function setAerial(value){if(typeof value!=='boolean')return false;data.home.aerial=value;changed();return true;}
    return {stalls,tradable,buyStall,listItem,cancelListing,settleMarket,collectSale,reviewTrade,setTheme,setAerial,purchase,craft,claimQuest,crops,get data(){return structuredClone(data)},get storageOK(){return storageOK},plot,plant,harvest,catchBug,startFishing,fishingState,reel,cancelFishing(){fishing=null},subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)}};
  }
  return {create,crops};
})();
