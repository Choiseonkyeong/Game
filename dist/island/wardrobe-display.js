import {ITEMS} from './wardrobe.js?v=48';
const name=(slot,id)=>ITEMS[slot]?.find(item=>item[0]===id)?.[1]||'';
export function wardrobeDisplay(outfit){
 const dress=outfit.dress||'none';
 if(dress==='trench-set')return{title:name('dress',dress),topName:'베이지 트렌치 코디',bottomName:'화이트 프릴 스커트',topIcon:dress,bottomIcon:dress};
 if(dress==='knit-set')return{title:name('dress',dress),topName:name('top','oversized-knit'),bottomName:name('bottom','pleats'),topIcon:'oversized-knit',bottomIcon:'pleats'};
 if(dress==='ribbon-dress')return{title:name('dress',dress),topName:name('dress',dress),bottomName:'원피스 세트 하의',topIcon:dress,bottomIcon:dress};
 return{title:'기본 코디',topName:name('top',outfit.top),bottomName:name('bottom',outfit.bottom),topIcon:outfit.top,bottomIcon:outfit.bottom};
}
export const usePaintedReference=(outfit,{female,preview,heading})=>female&&!preview&&(outfit.dress||'none')==='none'&&outfit.top==='white-tee'&&outfit.bottom==='black-shorts'&&heading===0;
