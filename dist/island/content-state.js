export const CONTENT_KEY='pogeun-content-v1';
export const MAX_CONTENT_LEVEL=10;
export const FISHES=[{id:'silver',name:'은빛 물고기',shells:15},{id:'pink',name:'분홍 볼락',shells:20},{id:'mint',name:'민트 송사리',shells:12}];
const integer=(n,max=1e9)=>Number.isSafeInteger(n)&&n>=0?Math.min(max,n):0;
export function readContent(raw){let d;try{d=JSON.parse(raw);}catch{}return{v:1,xp:integer(d?.xp),caught:integer(d?.caught),fish:Object.fromEntries(FISHES.map(f=>[f.id,integer(d?.fish?.[f.id],999)])),castAt:integer(d?.castAt,1e15),lastCatch:integer(d?.lastCatch,1e15),boat:d?.boat===true};}
export const contentStage=level=>level>=8?'바닷가':level>=4?'목장':'작은 정원';
// One timing model for controls and transactions, including restored casts.
export function fishingStatus(s,now=Date.now()){
 if(s.castAt){const ready=now-s.castAt>=2500;return{phase:ready?'ready':'waiting',canCast:false,canCatch:ready,message:ready?'찌가 움직여요! 물고기 올리기를 눌러 주세요.':'찌를 살펴보는 중이에요. 잠깐 기다려 주세요.'};}
 const cooling=!!s.lastCatch&&now-s.lastCatch<12000;
 return{phase:cooling?'cooldown':'idle',canCast:!cooling,canCatch:false,message:cooling?'물고기가 다시 모이는 중이에요. 준비되면 낚싯대를 다시 던질 수 있어요.':'낚싯대를 던지고 찌를 기다려 보세요. 잡은 물고기는 도감에 기록되고 조개를 받아요.'};
}
export function contentAction(s,event,level,now=Date.now()){
 const n=structuredClone(s),fail=why=>({ok:false,state:s,why});
 if(event.type==='xp'){const amount=event.amount;if(!Number.isSafeInteger(amount)||amount<1||amount>100)return fail('경험 수치가 올바르지 않아요.');n.xp=Math.min(1e9,n.xp+amount);return{ok:true,state:n};}
 if(level<8)return fail('바닷가와 낚시는 섬 레벨8부터 열려요.');
 if(event.type==='boat'){if(n.castAt)return fail('낚시를 마친 뒤 배를 타 주세요.');n.boat=!n.boat;return{ok:true,state:n};}
 if(event.type==='cancel'){n.castAt=0;return{ok:true,state:n};}
 if(event.type==='cast'){if(n.castAt)return fail('찌를 살펴보고 있어요.');if(n.lastCatch&&now-n.lastCatch<12000)return fail('물고기가 다시 모이는 중이에요. 잠시 기다려 주세요.');n.castAt=now;return{ok:true,state:n};}
 if(event.type==='catch'){if(!n.castAt)return fail('먼저 낚싯대를 던져 주세요.');if(now-n.castAt<2500)return fail('찌가 움직일 때까지 조금 기다려 주세요.');const f=FISHES[n.caught%FISHES.length];if(n.fish[f.id]>=999)return fail('도감의 물고기 기록이 가득 찼어요.');n.castAt=0;n.lastCatch=now;n.caught++;n.fish[f.id]++;n.xp=Math.min(1e9,n.xp+8);return{ok:true,state:n,earned:f.shells,fish:f};}
 return fail('알 수 없는 행동이에요.');
}
export function activityXp(type){return({'tend-seed':3,'harvest-seed':10,feed:3,collect:8,plant:3,'plant-seed':4,sow:3,reap:8,pet:2,'pet-animal':2,place:2})[type]||0;}
export function zoneMarkup(level,scene){if(level<4||!scene?.reference)return'';const f=scene.expansion||1;return `<g id="content-zones" transform="translate(480 430) scale(${f}) translate(-480 -430)" stroke-linecap="round" stroke-linejoin="round"><g pointer-events="none" stroke="#98785f" stroke-width="1.5" fill="#ead7b7"><path d="M330 476l49 14m-49-20 49 14"/><path d="M333 467v14m16-9v14m16-9v14m15-10v14" stroke-width="3"/><ellipse cx="360" cy="493" rx="22" ry="7" fill="#dce9b4" stroke="none"/></g>${level>=8?'<g data-seaside="1" role="button" tabindex="0" aria-label="바닷가 낚시터"><ellipse cx="637" cy="558" rx="78" ry="29" fill="#c2dfdd" stroke="#8dafaa" stroke-width="2"/><path d="M573 551q60-24 122 0" fill="none" stroke="#f3e5bb" stroke-width="7"/><path d="M595 553l45 12 12-11-45-12Z" fill="#d6b38e" stroke="#96735b"/><path d="M609 549l-9 9m19-6-9 9m19-6-9 9" stroke="#ae8868"/><path d="M663 546q18 10 34 0l-6 14q-14 7-23-1Z" fill="#e8c8a4" stroke="#96735b"/><path d="M671 541l16 6" stroke="#96735b" stroke-width="3"/></g>':''}</g>`;}
