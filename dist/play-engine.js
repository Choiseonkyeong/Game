import {stages,tools} from './adventure.js';
import {worldPlaces,describePlace,isDark} from './world.js';
export const fresh=()=>({version:6,revision:2,positions:{},stage:0,completed:[],flags:{},world:{},observations:[],inventory:[],sequence:{},history:[]});
export const visible=(s,o)=>!(o.tool&&s.flags[o.tool+'_taken'])&&(o.need||[]).every(f=>s.flags[f])&&!(o.hide||[]).some(f=>s.flags[f]);
export function act(state,a,record=true){
 const s=structuredClone(state),level=stages[s.stage];let result={state,ok:false,message:'지금은 사용할 수 없어.'};
 const fail=message=>({...result,message});
 if(!level)return fail('모험을 모두 완료했어.');
 if(a.type==='visit'){if(!Number.isInteger(a.stage)||a.stage<0||a.stage>=stages.length||a.stage>Math.max(-1,...s.completed)+1)return fail('아직 열리지 않은 단계야.');s.stage=a.stage;s.flags={};s.world={};s.positions={};s.observations=[];s.inventory=[];s.sequence={};if(record)s.history.push(a);return {state:s,ok:true,message:stages[s.stage].story};}
 if(a.type==='next'){if(!s.flags.done)return fail('아직 이 장면의 목표가 남아 있어.');if(s.stage>=stages.length-1)return fail('모든 단계를 완료했어.');s.stage++;s.flags={};s.world={};s.positions={};s.observations=[];s.inventory=[];s.sequence={};if(record)s.history.push(a);return {state:s,ok:true,message:stages[s.stage].story};}
 if(a.type==='light'){
  s.world??={};s.world.light=!s.world.light;if(isDark(s))s.flags.dark_seen=true;
  if(record)s.history.push(a);return {state:s,ok:true,message:''};
 }
 if(a.type==='shift'){
  const place=worldPlaces(s).find(o=>o.id===a.target);
  if(!place||!Number.isFinite(a.progress)||a.progress<0||a.progress>1||!['left','right','up','down'].includes(a.direction)||!visible(s,place)||!['bed','pillow','window','jacket','drawer','tote','tin','desk','shelf','suitcase'].includes(place.anchor))return fail('');
  if(place.container&&level.rules.some(r=>r.action==='use'&&r.target===place.id&&r.set===place.flag)&&!s.flags[place.flag])return fail('잠겨 있어.');
  s.positions??={};s.positions[place.anchor]={progress:a.progress,direction:a.direction};
  if(a.progress>=.6){
   const rule=level.rules.find(r=>r.action==='tap'&&r.target===place.id&&r.set===place.flag);
   if(rule&&!s.flags[rule.set]){const opened=act(s,{type:'tap',target:place.id},false);if(!opened.ok)return opened;Object.assign(s,opened.state);}
   const observed=act(s,{type:'explore',target:place.id},false);if(observed.ok)Object.assign(s,observed.state);
  }
  if(isDark(s))s.flags.dark_seen=true;if(record)s.history.push(a);return {state:s,ok:true,message:'',place};
 }
 if(a.type==='explore'){
  const place=worldPlaces(s).find(o=>o.id===a.target);if(!place)return fail('이곳은 아직 조사할 수 없어.');
  if(place.container&&level.rules.some(r=>r.action==='use'&&r.target===place.id&&r.set===place.flag)&&!s.flags[place.flag])return fail('잠겨 있어. 맞는 도구로 먼저 열어야 해.');
  const key=place.anchor||place.id;s.world??={};s.observations??=[];
  if(s.world[key])return {...result,message:describePlace(level.room,key,level.id),place};
  s.world[key]=true;s.observations.push({anchor:key,text:describePlace(level.room,key,level.id)});
  if(record)s.history.push(a);return {state:s,ok:true,message:describePlace(level.room,key,level.id),place};
 }
 if(s.flags.done)return fail('목표를 달성했어! 다음 이야기로 넘어가자.');
 const target=level.objects.find(o=>o.id===a.target);
 if(a.type!=='combine'&&(!target||!visible(s,target)))return fail('아직 닿을 수 없는 곳이야.');
 if(a.type==='use'&&!s.inventory.includes(a.item))return fail('먼저 그 물건을 소지품에 넣어줘.');
 if(a.type==='combine'&&(!Array.isArray(a.items)||a.items.length!==2||a.items[0]===a.items[1]||!a.items.every(i=>s.inventory.includes(i))))return fail('서로 다른 소지품 두 개를 골라줘.');
 const rule=level.rules.find(r=>r.action===a.type&&(a.type==='combine'?r.items?.every(i=>a.items.includes(i)):r.target===a.target&&(a.type!=='use'||r.item===a.item)));
 if(!rule)return fail(level.wrong?.[a.target]||(a.type==='combine'?'모양은 재미있지만 이 둘은 함께 쓸 이유가 없겠어. 다른 조합도 시도해 보자.':a.type==='use'?`${tools[a.item]?.[0]||'이 도구'}로는 해결되지 않아. ${target.detail||'대상의 모양과 지금 목표를 다시 보자.'}`:target.detail||'단추가 살펴봤어. 소지품을 쓰거나 다른 물건과 함께 생각해 보자.'));
 if(rule.set&&s.flags[rule.set])return fail(target?.detail||'여기는 이미 준비됐어. 다음 물건을 살펴보자.');
 if(!(rule.need||[]).every(f=>s.flags[f]))return fail(target?.detail||'아직 준비가 덜 됐어. 다른 물건을 먼저 살펴보자.');
 if(a.type==='code'&&a.answer!==rule.answer)return fail('아직 맞지 않아. 표시된 단서의 순서와 방향을 다시 살펴보자.');
 if(rule.set)s.flags[rule.set]=true;
 if(rule.reveal||/메모:|영수증:|카페②|도시 순서:/.test(rule.msg||'')){s.observations??=[];const text=rule.msg;if(!s.observations.some(o=>o.text===text))s.observations.push({anchor:target?.anchor||'desk',text});}
 if(target?.container){s.world??={};s.observations??=[];const key=target.anchor||target.id;if(!s.world[key]){s.world[key]=true;s.observations.push({anchor:key,text:describePlace(level.room,key,level.id)});}}
 if(rule.grant&&!s.inventory.includes(rule.grant))s.inventory.push(rule.grant);
 s.inventory=s.inventory.filter(i=>!rule.consume?.includes(i));
 if(s.flags.done&&!s.completed.includes(s.stage))s.completed.push(s.stage);
 if(record)s.history.push(a);
 return {state:s,ok:true,message:rule.msg,rule};
}
export function restore(raw){let s=fresh();if(raw?.version!==6||!Array.isArray(raw.history))return s;for(const a of raw.history.slice(0,3000)){if(a&&['tap','use','combine','code','next','visit','explore','shift','light'].includes(a.type)){try{if(raw.revision!==2&&s.stage===0&&a.type==='tap'&&a.target==='camera'&&s.flags.blanket_open&&!s.flags.camera_box_open)s=act(s,{type:'code',target:'camera_box',answer:'314'}).state;const r=act(s,a);if(r.ok)s=r.state;}catch{}}}return s;}
