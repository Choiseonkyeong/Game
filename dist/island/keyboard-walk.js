import{lineClear,unproject}from'./movement.js?v=55';
export const WALK_KEYS={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]};
export function keyboardDirection(keys){let x=0,y=0;for(const key of keys){const v=WALK_KEYS[key];if(v){x+=v[0];y+=v[1];}}const n=Math.hypot(x,y);return n?[x/n,y/n]:[0,0];}
// Test the entire segment, including diagonals, instead of only the target cell.
export function keyboardStep(state,position,direction,distance){
 const next=[position[0]+direction[0]*distance,position[1]+direction[1]*distance];
 if(lineClear(state,unproject(...position),unproject(...next)))return next;
 for(const p of [[next[0],position[1]],[position[0],next[1]]])if(Math.hypot(p[0]-position[0],p[1]-position[1])>1e-8&&lineClear(state,unproject(...position),unproject(...p)))return p;
 return [...position];
}
