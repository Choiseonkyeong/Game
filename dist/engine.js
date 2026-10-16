import {levels} from './story.js';
export const VERSION=2;
export function fresh(level=0){return {level,step:0,seq:0,dials:{},circuit:{},secret:false,hints:0,moves:0,history:[]};}
export function complete(s){return s.step>=levels[s.level].steps.length;}
export function active(s){return levels[s.level].steps[s.step]||null;}
export function dispatch(s,a){
 const n={...s,dials:{...s.dials},circuit:{...s.circuit},history:[...s.history]};
 if(!a||typeof a.item!=='string')return {state:s,changed:false,message:'물건을 먼저 골라 주세요.'};
 if(a.kind==='secret'){n.secret=true;return {state:n,changed:!s.secret,message:levels[s.level].secret,secret:true};}
 if(complete(s))return {state:s,changed:false,message:'이 이야기는 완성됐어요. 다음 모험으로 가 볼까요?'};
 const step=active(s);let ok=false,changed=false,message='아직 그 물건을 쓸 때가 아닌 것 같아요. 장면과 이야기를 살펴봐요.';
 if(step.kind==='move'&&a.kind==='move'&&a.item===step.item){
   if(a.target===step.target)ok=true;
   else message='다른 곳에 놓아 볼까요? 선택한 물건은 다시 사용할 수 있어요.';
 }
 if(step.kind==='tap'&&a.kind==='tap'&&a.item===step.item)ok=true;
 if(step.kind==='dial'&&a.kind==='tap'&&a.item===step.item){n.dials[a.item]=((s.dials[a.item]||0)+1)%4;changed=true;ok=n.dials[a.item]===step.value;message=`방향 ${n.dials[a.item]} · 네 방향으로 돌아가는 장치예요.`;}
 if(step.kind==='hold'&&a.kind==='hold'&&a.item===step.item){ok=Number.isFinite(a.elapsed)&&a.elapsed>=step.duration;message=ok?'':'조금 더 기다려 주세요. 손을 떼면 다시 시작할 수 있어요.';}
 if(step.kind==='sequence'&&a.kind==='tap'&&step.items.includes(a.item)){
   changed=true;
   if(a.item===step.items[s.seq]){n.seq=s.seq+1;ok=n.seq===step.items.length;message=`좋아요. ${n.seq}/${step.items.length}개의 소리가 이어졌어요.`;}
   else{n.seq=a.item===step.items[0]?1:0;message='다른 순서였어요. 첫 음부터 다시 들어 봐요.';}
 }
 if(step.kind==='circuit'&&a.kind==='tap'&&step.items.includes(a.item)){
   n.circuit[a.item]=!s.circuit[a.item];changed=true;
   ok=step.items.every((id,i)=>!!n.circuit[id]===step.value[i]);
   message='회로가 바뀌었어요. 장치 위의 점 표시와 비교해 보세요.';
 }
 n.moves++;
 if(ok){n.step++;n.seq=0;changed=true;message=step.done;}
 if(changed)n.history.push({kind:a.kind,item:a.item,...(a.target?{target:a.target}:{}),...(a.elapsed?{elapsed:a.elapsed}:{})});
 return {state:n,changed,message,advanced:ok};
}
export function restore(level,data){let s=fresh(level);if(!data||typeof data!=='object')return s;
 if(Array.isArray(data.history)){for(const a of data.history.slice(0,400)){if(!a||!['tap','move','hold'].includes(a.kind))continue;s=dispatch(s,a).state;}}
 s.secret=data.secret===true;s.hints=Number.isInteger(data.hints)?Math.max(0,Math.min(data.hints,999)):0;return s;}
export function award(s){return complete(s)?1+Number(s.secret)+Number(s.hints===0):0;}
export function unlocked(states,best=[]){const first=states.findIndex((s,i)=>!complete(s)&&!(best[i]>0));return first<0?levels.length-1:first;}
export function solution(level){return levels[level].steps.flatMap(s=>s.kind==='move'?[{kind:'move',item:s.item,target:s.target}]:s.kind==='tap'?[{kind:'tap',item:s.item}]:s.kind==='dial'?Array.from({length:s.value},()=>({kind:'tap',item:s.item})):s.kind==='hold'?[{kind:'hold',item:s.item,elapsed:s.duration}]:s.kind==='sequence'?s.items.map(item=>({kind:'tap',item})):s.items.filter((_,i)=>s.value[i]).map(item=>({kind:'tap',item})));}
