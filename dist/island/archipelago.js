import{BALANCE}from'./balance.js?v=48';
// Several sky islands: each keeps its own layout (core.js state) and size level; shells are shared.
export const ARCHIPELAGO_KEY='pogeun-archipelago-v1';
export const MAX_LEVEL=10,MAX_ISLANDS=4;
export const EXPAND_COST=BALANCE.progression.expandCosts;// cost to reach level index+1
export const ISLAND_COST=BALANCE.progression.islandCosts;// cost of the n-th island
export const fresh=()=>({v:1,active:1,next:2,islands:[{id:1,name:'포근섬',level:1,saved:null}]});
const clean=name=>typeof name==='string'&&name.trim()?name.trim().slice(0,12):null;
export function readArchipelago(raw){try{const d=JSON.parse(raw);if(d?.v!==1||!Array.isArray(d.islands)||!d.islands.length)return fresh();const ids=new Set(),islands=[];for(const i of d.islands.slice(0,MAX_ISLANDS)){if(!Number.isSafeInteger(i?.id)||i.id<1||ids.has(i.id))continue;ids.add(i.id);islands.push({id:i.id,name:clean(i.name)||'하늘섬 '+(islands.length+1),level:Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(i.level))||1)),saved:typeof i.saved==='string'?i.saved:null});}if(!islands.length)return fresh();const active=islands.some(i=>i.id===d.active)?d.active:islands[0].id;return{v:1,active,next:Math.max(Math.max(...ids)+1,Number.isSafeInteger(d.next)?d.next:0),islands};}catch{return fresh();}}
export const activeIsland=a=>a.islands.find(i=>i.id===a.active)||a.islands[0];
export const expandCost=island=>island.level>=MAX_LEVEL?null:EXPAND_COST[island.level];
export const newIslandCost=a=>a.islands.length>=MAX_ISLANDS?null:ISLAND_COST[a.islands.length];
// Pure transactions: return the new archipelago and shell balance, or a reason.
export function expand(a,balance){const island=activeIsland(a),cost=expandCost(island);if(cost===null)return{ok:false,why:'이미 가장 넓은 섬이에요.'};if(!Number.isSafeInteger(balance)||balance<cost)return{ok:false,why:'조개가 '+(cost-balance)+'개 더 필요해요.'};const n=structuredClone(a);activeIsland(n).level++;return{ok:true,state:n,balance:balance-cost,cost};}
export function createIsland(a,balance,currentSaved){const cost=newIslandCost(a);if(cost===null)return{ok:false,why:'섬은 '+MAX_ISLANDS+'개까지 가꿀 수 있어요.'};if(!Number.isSafeInteger(balance)||balance<cost)return{ok:false,why:'조개가 '+(cost-balance)+'개 더 필요해요.'};const n=structuredClone(a);activeIsland(n).saved=currentSaved;const id=n.next++;n.islands.push({id,name:'하늘섬 '+n.islands.length,level:1,saved:null});n.active=id;return{ok:true,state:n,balance:balance-cost,cost};}
export function switchIsland(a,id,currentSaved){if(!a.islands.some(i=>i.id===id))return{ok:false,why:'없는 섬이에요.'};if(id===a.active)return{ok:false,why:'지금 있는 섬이에요.'};const n=structuredClone(a);activeIsland(n).saved=currentSaved;n.active=id;return{ok:true,state:n,saved:activeIsland(n).saved};}
