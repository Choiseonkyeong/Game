export const KEY='suming-littlepark-v1';
export const TYPES={bench:{name:'나무 벤치',limit:2},bowl:{name:'물그릇',limit:2},pond:{name:'작은 연못',limit:1},path:{name:'디딤돌',limit:12},fence:{name:'낮은 울타리',limit:6},lamp:{name:'정원등',limit:3},table:{name:'티 테이블',limit:2},cushion:{name:'포근한 방석',limit:2},tree:{name:'사과나무',limit:2},pot:{name:'빈 화분',limit:6}};
export const SEEDS={daisy:'데이지',tulip:'튤립',lavender:'라벤더'};
export function fresh(){return{v:1,items:[{id:1,type:'bench',c:1,r:3,rot:0},{id:2,type:'pot',c:4,r:2,rot:0},{id:3,type:'path',c:3,r:3,rot:0},{id:4,type:'path',c:3,r:4,rot:0}],next:5,hearts:0,lastPet:0,water:0,welcomed:false};}
export function validCell(c,r){return Number.isInteger(c)&&Number.isInteger(r)&&c>=0&&r>=0&&c<7&&r<7&&!(c<3&&r<3);}
export function growth(p,now=Date.now()){return p.seed?Math.max(0,Math.min(1,(Math.max(0,now-p.planted)+(p.boost||0))/120000)):0;}
export function habitat(s,now=Date.now()){const flowers=s.items.filter(p=>p.type==='pot'&&growth(p,now)>=1).length;return{flowers,water:s.water>0,cozy:s.items.some(p=>p.type==='bench'||p.type==='cushion'),ready:flowers>0&&s.water>0};}
export function apply(s,e,now=Date.now()){
 const n=structuredClone(s),p=n.items.find(p=>p.id===e.id);const fail=why=>({ok:false,why,state:s});
 if(e.type==='place'){if(!TYPES[e.kind]||!validCell(e.c,e.r))return fail('여기는 놓을 수 없어요. 잔디 칸을 골라 주세요.');if(n.items.some(p=>p.c===e.c&&p.r===e.r))return fail('이미 다른 물건이 있어요. 빈 칸을 골라 주세요.');if(n.items.filter(p=>p.type===e.kind).length>=TYPES[e.kind].limit)return fail('준비한 물건을 모두 놓았어요. 다른 물건을 골라 볼까요?');n.items.push({id:n.next++,type:e.kind,c:e.c,r:e.r,rot:0});}
 else if(e.type==='move'){if(!p||!validCell(e.c,e.r)||n.items.some(x=>x.id!==p.id&&x.c===e.c&&x.r===e.r))return fail('빈 잔디 칸으로 옮겨 주세요.');p.c=e.c;p.r=e.r;}
 else if(e.type==='rotate'){if(!p)return fail('물건을 먼저 골라 주세요.');p.rot=1-p.rot;}
 else if(e.type==='store'){if(!p)return fail('물건을 먼저 골라 주세요.');if(p.seed)return fail('심은 화분은 그대로 두고 옮겨 주세요. 식물을 지우지 않아요.');n.items=n.items.filter(x=>x.id!==p.id);}
 else if(e.type==='plant'){if(!p||p.type!=='pot'||p.seed||!SEEDS[e.seed])return fail('비어 있는 화분을 골라 주세요.');p.seed=e.seed;p.planted=now;p.boost=0;p.watered=0;}
 else if(e.type==='water'){if(!p||p.type!=='pot'||!p.seed)return fail('씨앗을 심은 화분을 골라 주세요.');if(growth(p,now)>=1)return fail('꽃이 활짝 피었어요. 시들지 않고 정원에 남아요.');if(p.watered&&now-p.watered<8000)return fail('물이 스며들고 있어요. 잠시 기다려 주세요.');p.boost=(p.boost||0)+40000;p.watered=now;}
 else if(e.type==='fill'){if(!p||p.type!=='bowl')return fail('물그릇을 골라 주세요.');n.water=now;}
 else if(e.type==='pet'){if(!habitat(n,now).ready)return fail('꽃을 피우고 물그릇을 채우면 고양이가 찾아와요.');if(n.lastPet&&now-n.lastPet<15000)return fail('모모가 기분 좋게 쉬고 있어요.');n.lastPet=now;n.hearts=Math.min(10,n.hearts+1);}
 else if(e.type==='welcome')n.welcomed=true;else return fail('알 수 없는 행동이에요.');return{ok:true,state:n};
}
export function restore(raw){try{const d=JSON.parse(raw);if(d.v!==1||!Array.isArray(d.items)||d.items.length>49)return fresh();const s=fresh();s.items=[];const ids=new Set();for(const p of d.items){if(!TYPES[p.type]||!validCell(p.c,p.r)||!Number.isSafeInteger(p.id)||p.id<1||ids.has(p.id)||s.items.some(q=>q.c===p.c&&q.r===p.r)||s.items.filter(q=>q.type===p.type).length>=TYPES[p.type].limit)continue;ids.add(p.id);s.items.push({id:p.id,type:p.type,c:p.c,r:p.r,rot:p.rot===1?1:0,...(p.type==='pot'&&SEEDS[p.seed]&&Number.isFinite(p.planted)?{seed:p.seed,planted:p.planted,boost:Math.min(120000,Math.max(0,Number(p.boost)||0)),watered:Number(p.watered)||0}:{})});}s.next=Math.max(0,...ids)+1;s.hearts=Math.min(10,Math.max(0,Math.floor(Number(d.hearts)||0)));s.lastPet=Number(d.lastPet)||0;s.water=Number(d.water)||0;s.welcomed=d.welcomed===true;return s;}catch{return fresh();}}
