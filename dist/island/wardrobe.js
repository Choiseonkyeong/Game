// Gender owns its outfit. Choosing an item never changes identity.
export const WARDROBE_KEY='pogeun-wardrobe-v2';
export const ITEMS={top:[['white-tee','기본 흰 반팔','#fff9e9'],['oversized-knit','파스텔 루즈 니트','#d7bdca'],['cream-vneck','아이보리 브이넥 니트','#e8d7ba'],['cardigan','민트 가디건','#bdcdbb'],['crop','크림 크롭티','#f0dfcf']],bottom:[['shorts','연청 반바지','#9bb3ce'],['black-shorts','블랙 숏팬츠','#343439'],['skirt','리본 스커트','#d8bbc4'],['pleats','플리츠 스커트','#cfc2af']],dress:[['none','세트 해제','#fff9e9'],['trench-set','베이지 트렌치 코디','#c9ab87'],['knit-set','파스텔 니트 세트','#d7bdca'],['ribbon-dress','리본 데일리 원피스','#e8d7ba']]};
ITEMS.top.push(['ribbon-blouse','리본 블라우스','#efe1d2']);
ITEMS.dress.push(['overalls','데님 멜빵바지','#a2b5c3'],['cottage-dress','코티지코어 원피스','#d6c6af']);
ITEMS.hat=[['none','모자 벗기','#fff9e9'],['beret','로즈 베레모','#d59eaf']];
export const SLOT_LABELS={top:'상의',bottom:'하의',dress:'세트 코디',hat:'모자'};
export const baseOutfit=gender=>({top:'white-tee',bottom:'shorts',shoes:'sneakers',bag:'none',hat:'none',accessory:'none',dress:'none'});
export function cleanOutfit(value,gender){const out=baseOutfit(gender);for(const slot in ITEMS)if(ITEMS[slot].some(x=>x[0]===value?.[slot]))out[slot]=value[slot];if(gender==='male')out.dress='none';return out;}
export function restoreWardrobe(raw){let v;try{v=JSON.parse(raw);}catch{}return {revision:22,gender:v?.gender==='male'?'male':'female',female:cleanOutfit({...v?.female,...(v?.revision===22?{}:{bottom:'shorts'})},'female'),male:cleanOutfit({...v?.male,...(v?.revision===22?{}:{bottom:'shorts'})},'male'),looks:Array.isArray(v?.looks)?v.looks.filter(x=>['female','male'].includes(x?.gender)).slice(0,6).map(x=>({gender:x.gender,outfit:cleanOutfit(x.outfit,x.gender)})):[]};}
