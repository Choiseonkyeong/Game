import {levels} from './story.js';
export function fresh(level=0){return {level,step:0,count:0,hints:0,history:[]};}
export function active(s){return levels[s.level].steps[s.step]||null;}
export function complete(s){return !active(s);}
// 'all' steps hold several actions that can be done in any order; finished parts are bits in count.
export const parts=r=>r.kind==='all'?r.parts:[r];
export function finished(s){const steps=levels[s.level].steps,done=steps.slice(0,s.step).flatMap(parts),r=active(s);if(r?.kind==='all')done.push(...r.parts.filter((_,i)=>s.count>>i&1));return done;}
export function uses(s,id){return finished(s).filter(r=>r.target===id).length;}
export function visible(s){const gone=new Set(finished(s).filter(r=>['move','shift'].includes(r.kind)&&!r.keep).map(r=>r.item));return levels[s.level].objects.filter(o=>(o.after||0)<=s.step&&!(o.until!=null&&s.step>=o.until)&&!gone.has(o.id));}
function matches(r,a){if(r.item!==a.item||r.kind!==a.kind)return false;if(r.kind==='move')return a.target===r.target;if(r.kind==='shift')return Number.isFinite(a.distance)&&a.distance>=30;return true;}
function miss(l,rule,a){const key=a.kind==='move'?`${a.item}>${a.target}`:a.item;if(l.fail?.[key])return l.fail[key];if(parts(rule).some(r=>r.item===a.item))return '다른 곳에 써 볼까요?';return a.item==='hero'?'단추를 도울 물건이 있을까요?':'한 번 더 살펴볼까요?';}
export function dispatch(s,a){
 const rule=active(s);if(!rule)return {state:s,changed:false,message:'잘 해결했어요! 다음 장면으로 가 볼까요?'};
 if(!a||typeof a.item!=='string')return {state:s,changed:false,message:'장면 속 물건을 살펴봐요.'};
 const l=levels[s.level],history=[...s.history,{...a}];
 if(rule.kind==='all'){
 const i=rule.parts.findIndex((r,k)=>!(s.count>>k&1)&&matches(r,a));if(i<0)return {state:s,changed:false,message:miss(l,rule,a)};
 const count=s.count|1<<i,all=rule.parts.every((_,k)=>count>>k&1);
 return {state:{...s,history,step:s.step+Number(all),count:all?0:count},changed:true,advanced:true,message:all?rule.done:rule.parts[i].done};
 }
 if(!matches(rule,a))return {state:s,changed:false,message:miss(l,rule,a)};
 if(rule.kind==='tap'&&s.count+1<(rule.count||1))return {state:{...s,history,count:s.count+1},changed:true,advanced:false,message:`톡! ${s.count+1}/${rule.count}번 눌렀어요.`};
 return {state:{...s,history,step:s.step+1,count:0},changed:true,advanced:true,message:rule.done};
}
export function restore(level,data){let s=fresh(level);if(!data||typeof data!=='object')return s;for(const a of (Array.isArray(data.history)?data.history:[]).slice(0,200)){if(a&&['tap','move','shift'].includes(a.kind))s=dispatch(s,a).state;}s.hints=Number.isInteger(data.hints)?Math.max(0,data.hints):0;return s;}
export function solve(level){return levels[level].steps.flatMap(parts).flatMap(r=>r.kind==='tap'?Array.from({length:r.count||1},()=>({kind:'tap',item:r.item})):r.kind==='shift'?[{kind:'shift',item:r.item,distance:60}]:[{kind:'move',item:r.item,target:r.target}]);}
