// The user's previous couple designs, with 4-direction movement sheets.
const KEY='pogeun-human-choice-v1';let choice='female',catalog={},row=0;
try{const value=localStorage.getItem(KEY);if(['female','male','rig'].includes(value))choice=value;}catch{}
export async function loadHumanSprites(){try{const r=await fetch('art/humans/catalog.json');if(!r.ok)return;catalog=await r.json();await Promise.all(Object.values(catalog).map(async a=>{const i=new Image();i.src=a.src;await i.decode();}));}catch{catalog={};}}
export const humanChoice=()=>choice;
export function chooseHuman(value){if(!['female','male','rig'].includes(value))return;choice=value;row=0;try{localStorage.setItem(KEY,value);}catch{}}
let sequence=0;
export function humanMarkup({pose='idle',face=1,back=false,time=0,preview=false}={}){
 const a=catalog[choice];if(!a)return'';if(pose==='walk')row=back?1:face<0?2:3;
 const view=preview?0:row,frame=pose==='walk'?1+Math.floor(time*9)%5:0;
 const image=()=>`<svg x="0" y="0" width="128" height="192" viewBox="${frame*128} ${view*192} 128 192" overflow="hidden"><image href="${a.src}" width="768" height="768" style="image-rendering:pixelated"/></svg>`;
 // Increase the female head at the neck pivot; do not shrink the whole avatar or its face.
 const scale=choice==='female'?1.12:1,id='human-head-'+(++sequence);
 const art=scale===1?image():`<defs><clipPath id="${id}-body"><rect y="94" width="128" height="98"/></clipPath><clipPath id="${id}-head"><rect x="-20" y="-20" width="168" height="120"/></clipPath></defs><g clip-path="url(#${id}-body)">${image()}</g><g transform="translate(64 100) scale(${scale}) translate(-64 -100)" clip-path="url(#${id}-head)">${image()}</g>`;
 return`<svg x="-40" y="-112.5" width="80" height="120" viewBox="0 0 128 192" overflow="hidden" pointer-events="none">${art}</svg>`;
}
