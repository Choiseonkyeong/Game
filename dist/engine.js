import {levels} from './story.js';
export function fresh(level=0){return {level,step:0,count:0,hints:0,history:[]};}
export function active(s){return levels[s.level].steps[s.step]||null;}
export function complete(s){return !active(s);}
export function visible(s){return levels[s.level].objects.filter(o=>(o.after||0)<=s.step&&!levels[s.level].steps.slice(0,s.step).some(r=>['move','shift'].includes(r.kind)&&r.item===o.id));}
export function dispatch(s,a){
 const rule=active(s);if(!rule)return {state:s,changed:false,message:'잘 해결했어요! 다음 장면으로 가 볼까요?'};
 if(!a||typeof a.item!=='string')return {state:s,changed:false,message:'장면 속 물건을 살펴봐요.'};
 let ok=false,count=s.count;
 if(rule.item===a.item&&rule.kind===a.kind){
 if(rule.kind==='tap'){count++;ok=count>=(rule.count||1);}
 if(rule.kind==='move')ok=a.target===rule.target;
 if(rule.kind==='shift')ok=Number.isFinite(a.distance)&&a.distance>=30;
 }
 if(!ok&&count===s.count){const l=levels[s.level];const message=rule.item===a.item?'다른 곳에 써 볼까요?':a.item==='hero'?'단추를 도울 물건이 있을까요?':l.objects.find(o=>o.id===a.item)?.type==='scissors'?'자르지 않는 방법도 있을 거예요.':'한 번 더 살펴볼까요?';return {state:s,changed:false,message};}
 const n={...s,history:[...s.history,{...a}],step:s.step+Number(ok),count:ok?0:count};
 return {state:n,changed:true,advanced:ok,message:ok?rule.done:`톡! ${count}/${rule.count}번 눌렀어요.`};
}
export function restore(level,data){let s=fresh(level);if(!data||typeof data!=='object')return s;for(const a of (Array.isArray(data.history)?data.history:[]).slice(0,200)){if(a&&['tap','move','shift'].includes(a.kind))s=dispatch(s,a).state;}s.hints=Number.isInteger(data.hints)?Math.max(0,data.hints):0;return s;}
export function solve(level){return levels[level].steps.flatMap(r=>r.kind==='tap'?Array.from({length:r.count||1},()=>({kind:'tap',item:r.item})):r.kind==='shift'?[{kind:'shift',item:r.item,distance:60}]:[{kind:'move',item:r.item,target:r.target}]);}
