import {ITEMS} from './wardrobe.js?v=57';
const name=(slot,id)=>ITEMS[slot]?.find(item=>item[0]===id)?.[1]||'';
export function wardrobeDisplay(outfit){
 const dress=outfit.dress||'none';
 if(dress==='trench-set')return{title:name('dress',dress),topName:'베이지 트렌치 코디',bottomName:'화이트 프릴 스커트',topIcon:dress,bottomIcon:dress};
 if(dress==='knit-set')return{title:name('dress',dress),topName:name('top','oversized-knit'),bottomName:name('bottom','pleats'),topIcon:'oversized-knit',bottomIcon:'pleats'};
 if(['ribbon-dress','cottage-dress','overalls'].includes(dress))return{title:name('dress',dress),topName:name('dress',dress),bottomName:dress==='overalls'?'데님 멜빵 팬츠':'원피스 세트 하의',topIcon:dress,bottomIcon:dress};
 const basic=outfit.top==='white-tee'&&['shorts','black-shorts'].includes(outfit.bottom);
 return{title:[basic?'기본 코디':name('top',outfit.top)+' · '+name('bottom',outfit.bottom),outfit.hat&&outfit.hat!=='none'?name('hat',outfit.hat):''].filter(Boolean).join(' · '),topName:name('top',outfit.top),bottomName:name('bottom',outfit.bottom),topIcon:outfit.top,bottomIcon:outfit.bottom};
}
export const usePaintedReference=(outfit,{female,preview,heading})=>female&&!preview&&(outfit.dress||'none')==='none'&&(!outfit.hat||outfit.hat==='none')&&outfit.top==='white-tee'&&outfit.bottom==='black-shorts'&&heading===0;
