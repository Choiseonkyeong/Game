import{SEED_CATALOG,SEED_DESCRIPTION,seedStages}from'./seed-shop.js?v=42';

// Exact user-provided reference, 1280×879. Only its surrounding UI bands are clipped.
export const SEED_SHOP_ART='art/seed-shop-approved-59.jpg';
export const SEED_SHOP_FRAME={width:1280,height:722,top:79};
export const SEED_SHOP_REGIONS={
 apple:{card:[192,274,219,214],label:[210,434,182,42]},
 lemon:{card:[420,274,218,214],label:[438,434,182,42]},
 persimmon:{card:[647,274,219,214],label:[665,434,182,42]},
 banana:{card:[876,274,219,214],label:[894,434,182,42]},
 corn:{card:[277,501,239,216],label:[299,659,195,43]},
 sweetpotato:{card:[528,501,239,216],label:[550,659,195,43]},
 potato:{card:[777,501,230,216],label:[796,659,192,43]}
};
const position=([x,y,w,h])=>`left:${x/1280*100}%;top:${(y-79)/722*100}%;width:${w/1280*100}%;height:${h/722*100}%`;
export function seedMarketMarkup({shells=0,stock={},catalog=SEED_CATALOG}={}){
 const cards=Object.entries(catalog).map(([id,seed])=>{
  const region=SEED_SHOP_REGIONS[id],count=stock[id]||0;
  return `<button class="seed-approved-hit" data-seed-select="${id}" aria-label="${seed.name} 씨앗 선택 · 조개 ${seed.price} · 보유 ${count}개 · ${seed.type==='tree'?'과일나무':'밭작물'} ${seedStages(id)}단계" style="${position(region.card)}"></button><span class="seed-approved-label" style="${position(region.label)}"><strong>${seed.name}</strong><span class="seed-approved-amounts"><span data-seed-price="${id}">조개 ${seed.price}</span><small data-seed-stock="${id}">보유 ${count}개</small></span></span>`;
 }).join('');
 return `<section class="seed-approved-board" aria-label="씨앗 상점 · 과일나무 5단계 · 밭작물 4단계"><img class="seed-approved-art" src="${SEED_SHOP_ART}" width="1280" height="879" alt="승인한 씨앗상점 원화. 목재 간판, 꽃 장식, 떠 있는 하늘섬, 위4개·아래3개의 씨앗 카드" draggable="false">${cards}<span class="seed-approved-wallet" aria-label="내 조개 잔액" style="${position([1069,142,143,32])}">조개 ${shells}개</span><button class="seed-approved-guide" data-act="seed-guide" style="${position([294,755,691,34])}" aria-label="씨앗 성장 안내 열기"><span class="sr">${SEED_DESCRIPTION}</span></button></section>`;
}

// Keep help accessible without reintroducing the old illustration's embedded80 price.
export function seedGrowthMarkup(catalog=SEED_CATALOG){
 return `<section class="seed-growth-help"><small>씨앗에서 수확까지</small><h2>정성껏 돌보면 자라나요</h2><p>씨앗 구매 → 빈 잔디에 심기 → 물 주기 → 성장 → 수확</p><h3>과일나무 5단계</h3><p>새싹 → 어린나무 → 성장나무 → 풋열매 → 수확</p><h3>밭작물 4단계</h3><p>새싹 → 어린잎 → 무성한 잎 → 수확</p><p>심은 씨앗과 성장 단계는 자동 저장돼요. 섬을 다녀오거나 다시 접속해도 유지돼요.</p><div class="seed-guide-prices">${Object.entries(catalog).map(([id,seed])=>`<p>${seed.name} · <span data-guide-price="${id}">조개 ${seed.price}</span> · ${seedStages(id)}단계</p>`).join('')}</div><button class="primary" data-act="seed-market">씨앗 상점으로 돌아가기</button></section>`;
}
