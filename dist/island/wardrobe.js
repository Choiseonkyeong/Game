// Gender owns its outfit. Choosing an item never changes identity.
export const WARDROBE_KEY='pogeun-wardrobe-v2';
export const ITEMS={top:[['pink-tee','분홍 반팔','#edb6c8'],['white-tee','기본 흰 반팔','#fff9e9']],bottom:[['black-shorts','블랙 숏팬츠','#343439']]};
export const SLOT_LABELS={top:'상의',bottom:'하의'};
export const baseOutfit=gender=>({top:gender==='male'?'white-tee':'pink-tee',bottom:'black-shorts',shoes:'sneakers',bag:'none',hat:'none',accessory:'none'});
export function cleanOutfit(value,gender){const out=baseOutfit(gender);for(const slot in ITEMS)if(ITEMS[slot].some(x=>x[0]===value?.[slot]))out[slot]=value[slot];return out;}
export function restoreWardrobe(raw){let v;try{v=JSON.parse(raw);}catch{}return {gender:v?.gender==='male'?'male':'female',female:cleanOutfit(v?.female,'female'),male:cleanOutfit(v?.male,'male'),looks:Array.isArray(v?.looks)?v.looks.filter(x=>['female','male'].includes(x?.gender)).slice(0,6).map(x=>({gender:x.gender,outfit:cleanOutfit(x.outfit,x.gender)})):[]};}
