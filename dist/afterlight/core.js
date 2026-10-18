// A design verification core, not the released game's UI. No existing save keys are read.
export const SAVE_KEY='afterlight-lab-episode01-v2';
export const TAGS=['triangle','circle','square','cross'];
export const PEOPLE=['haru','maki','yui','ken'];
export const DESTINATIONS=['workshop','gallery','post','locker'];
export const TAG_LABELS={triangle:'△',circle:'○',square:'□',cross:'+'};
export const ORDER_CLUES=[
 {id:'queue-next',text:'△의 인화 바로 다음은 ○였다.',test:o=>o.indexOf('circle')===o.indexOf('triangle')+1},
 {id:'queue-gap',text:'○와 + 사이에는 정확히 한 작업이 있었다.',test:o=>Math.abs(o.indexOf('circle')-o.indexOf('cross'))===2},
 {id:'queue-direction',text:'○의 인화가 +보다 먼저 끝났다.',test:o=>o.indexOf('circle')<o.indexOf('cross')}
];
// Each bit is a transparent physical window: row major, 4 rows × 4 columns.
// The asymmetric carrier fixes triangle's face; the other three can be flipped horizontally.
export const MASKS={triangle:13991,circle:38584,square:15792,cross:5066};
export const DELIVERY_CLUES=[
 {id:'work-adjacent',text:'유이의 인화 바로 다음 작업은 켄의 인화였다.',test:(p,d)=>p.indexOf('ken')===p.indexOf('yui')+1},
 {id:'post-third',text:'세 번째 작업은 우편 발송이었다.',test:(p,d)=>d.indexOf('post')===2},
 {id:'haru-workshop',text:'하루의 사진은 새 작업실로 옮긴다.',test:(p,d)=>p.indexOf('haru')===d.indexOf('workshop')},
 {id:'ken-locker',text:'켄의 사진은 보관함으로 보낸다.',test:(p,d)=>p.indexOf('ken')===d.indexOf('locker')},
 {id:'gallery-not-first',text:'전시용 인화는 첫 작업이 아니었다.',test:(p,d)=>d.indexOf('gallery')!==0}
];
export function permutations(xs){if(!xs.length)return[[]];return xs.flatMap((x,i)=>permutations([...xs.slice(0,i),...xs.slice(i+1)]).map(p=>[x,...p]));}
export function isPermutation(a,domain){return Array.isArray(a)&&a.length===domain.length&&new Set(a).size===domain.length&&a.every(x=>domain.includes(x));}
export const orderSolutions=(clues=ORDER_CLUES)=>permutations(TAGS).filter(o=>clues.every(c=>c.test(o)));
export function flipMask(mask){let out=0;for(let r=0;r<4;r++)for(let col=0;col<4;col++)if(mask&(1<<(r*4+col)))out|=1<<(r*4+3-col);return out;}
export const cells=mask=>Array.from({length:16},(_,i)=>i).filter(i=>mask&(1<<i)).map(i=>({row:Math.floor(i/4),column:i%4,address:'ABCD'[Math.floor(i/4)]+(i%4+1)}));
export function project(faces){if(!Array.isArray(faces)||faces.length!==4||faces.some(b=>b!==0&&b!==1))throw new Error('four binary faces required');return TAGS.reduce((mask,tag,i)=>mask&(faces[i]?flipMask(MASKS[tag]):MASKS[tag]),65535);}
export function projectionSolutions({anchored=true}={}){const out=[];for(let b=0;b<16;b++){const faces=[(b>>3)&1,(b>>2)&1,(b>>1)&1,b&1];if(anchored&&faces[0])continue;const lit=cells(project(faces));if(lit.length===1)out.push({faces,address:lit[0].address});}return out;}
export function deliverySolutions(clues=DELIVERY_CLUES){const out=[];for(const people of permutations(PEOPLE))for(const destinations of permutations(DESTINATIONS))if(clues.every(c=>c.test(people,destinations)))out.push({people,destinations});return out;}
export const initial=()=>({schema:2,phase:'table',order:[...TAGS].reverse(),faces:[0,0,0,0],archive:null,people:[...PEOPLE],destinations:[...DESTINATIONS].reverse(),experiments:[],complete:false});
export function act(state,event){
 const fail=reason=>({ok:false,state,reason});if(!state||state.schema!==2||!event||typeof event!=='object')return fail('invalid');
 if(state.complete)return fail('episode-complete');
 let s={...state};
 switch(event.type){
 case 'arrange':if(s.phase!=='table')return fail('carrier-locked');if(!isPermutation(event.order,TAGS))return fail('invalid');s.order=[...event.order];break;
 case 'feed':if(s.phase!=='table')return fail('carrier-locked');if(!ORDER_CLUES.every(c=>c.test(s.order)))return fail('sequence-mismatch');s.phase='projector';break;
 case 'flip':if(s.phase==='table')return fail('carrier-closed');if(!Number.isInteger(event.index)||event.index<0||event.index>3)return fail('invalid');if(event.index===0)return fail('keyed-carrier');s.faces=s.faces.map((b,i)=>i===event.index?1-b:b);break;
 case 'project':{
  if(s.phase==='table')return fail('carrier-closed');const lit=cells(project(s.faces));s.experiments=[...s.experiments,{faces:[...s.faces],lit:lit.map(p=>p.address)}].slice(-12);
  if(lit.length===1){s.archive=lit[0].address;s.phase='archive';}
  return {ok:true,state:s,observation:{lit:lit.map(p=>p.address)}};
 }
 case 'assign':if(!isPermutation(event.people,PEOPLE)||!isPermutation(event.destinations,DESTINATIONS))return fail('invalid');s.people=[...event.people];s.destinations=[...event.destinations];break;
 case 'deliver':if(!s.archive)return fail('dispatch-ledger-missing');if(!DELIVERY_CLUES.every(c=>c.test(s.people,s.destinations)))return fail('ledger-mismatch');s.complete=true;s.phase='complete';break;
 default:return fail('invalid');
 }
 return {ok:true,state:s};
}
export function replay(events){let state=initial();if(!Array.isArray(events)||events.length>5000)return state;for(const e of events){const r=act(state,e);if(r.ok)state=r.state;}return state;}
export function restore(raw){return raw?.schema===2?replay(raw.events):initial();}
export function verification(){
 const orders=orderSolutions(),light=projectionSolutions(),delivery=deliverySolutions();
 return {kind:'design proof; not player usability or art QA',order:{candidates:24,remainingByClue:ORDER_CLUES.map((_,i)=>orderSolutions(ORDER_CLUES.slice(0,i+1)).length),solutions:orders,remainingWhenEachClueOmitted:ORDER_CLUES.map((_,i)=>orderSolutions(ORDER_CLUES.filter((_,j)=>j!==i)).length)},projection:{candidates:8,solutions:light,unkeyedCounterexample:projectionSolutions({anchored:false})},delivery:{candidates:576,remainingByClue:DELIVERY_CLUES.map((_,i)=>deliverySolutions(DELIVERY_CLUES.slice(0,i+1)).length),solutions:delivery,remainingWhenEachClueOmitted:DELIVERY_CLUES.map((_,i)=>deliverySolutions(DELIVERY_CLUES.filter((_,j)=>j!==i)).length)}};
}
