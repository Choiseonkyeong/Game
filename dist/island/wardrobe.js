// Gender owns its outfit. Choosing an item never changes identity.
export const WARDROBE_KEY='pogeun-wardrobe-v2';
export const ITEMS={top:[['white-tee','기본 흰 반팔','#fff9e9']],bottom:[['shorts','연청 반바지','#9bb3ce'],['black-shorts','블랙 숏팬츠','#343439']]};
export const SLOT_LABELS={top:'상의',bottom:'하의'};
export const baseOutfit=gender=>({top:'white-tee',bottom:'shorts',shoes:'sneakers',bag:'none',hat:'none',accessory:'none'});
export function cleanOutfit(value,gender){const out=baseOutfit(gender);for(const slot in ITEMS)if(ITEMS[slot].some(x=>x[0]===value?.[slot]))out[slot]=value[slot];return out;}
export function restoreWardrobe(raw){let v;try{v=JSON.parse(raw);}catch{}return {revision:22,gender:v?.gender==='male'?'male':'female',female:cleanOutfit({...v?.female,...(v?.revision===22?{}:{bottom:'shorts'})},'female'),male:cleanOutfit({...v?.male,...(v?.revision===22?{}:{bottom:'shorts'})},'male'),looks:Array.isArray(v?.looks)?v.looks.filter(x=>['female','male'].includes(x?.gender)).slice(0,6).map(x=>({gender:x.gender,outfit:cleanOutfit(x.outfit,x.gender)})):[]};}
