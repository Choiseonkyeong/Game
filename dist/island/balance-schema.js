// Shared validation for runtime data and the development editor.
const ids={animals:['hen','duck','sheep','cow','llama'],seeds:['apple','lemon','persimmon','banana','corn','sweetpotato','potato'],crops:['carrot','potato','strawberry'],furniture:['seedplot','bench','pot','tree','bowl','pond','table','cushion','lamp','path','fence','field']};
export function validateBalance(d){
 const errors=[],object=(v,path,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)){errors.push(path+': 객체가 필요해요');return false;}for(const k of keys)if(!Object.hasOwn(v,k))errors.push(path+'.'+k+': 누락');for(const k of Object.keys(v))if(!keys.includes(k))errors.push(path+'.'+k+': 알 수 없는 항목');return true;};
 const num=(v,path,min=1,max=1000000,integer=true)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||integer&&!Number.isSafeInteger(v))errors.push(path+': '+min+'~'+max+(integer?' 정수':' 숫자')+'가 필요해요');};
 const text=(v,path)=>{if(typeof v!=='string'||!v.trim()||v.length>30)errors.push(path+': 1~30자 문자열이 필요해요');};
 if(!object(d,'balance',['schemaVersion','provisional','progression','feed','animals','seeds','crops','furniture','clothing']))return errors;
 if(d.schemaVersion!==1)errors.push('schemaVersion: 지원 버전은 1이에요');if(typeof d.provisional!=='boolean')errors.push('provisional: 참/거짓이 필요해요');
 const p=d.progression;if(object(p,'progression',['firstHarvestLevel','livestockUnlockLevel','axisGrowth','expandCosts','islandCosts'])){
 num(p.firstHarvestLevel,'progression.firstHarvestLevel',2,6);num(p.livestockUnlockLevel,'progression.livestockUnlockLevel',1,6);num(p.axisGrowth,'progression.axisGrowth',1.01,2,false);
 for(const[key,length]of[['expandCosts',6],['islandCosts',4]]){const a=p[key];if(!Array.isArray(a)||a.length!==length)errors.push(key+': '+length+'개 비용이 필요해요');else{a.forEach((v,i)=>num(v,key+'.'+i,i===0?0:1));if(a[0]!==0)errors.push(key+': 첫 비용은 0이어야 해요');}}
 }
 if(object(d.feed,'feed',['feed','milk']))for(const key of ['feed','milk']){const v=d.feed[key];if(object(v,'feed.'+key,['name','price'])){text(v.name,'feed.'+key+'.name');num(v.price,'feed.'+key+'.price');}}
 for(const group of ['animals','seeds','crops'])if(object(d[group],group,ids[group]))for(const key of ids[group]){
 const v=d[group][key],path=group+'.'+key,fields=group==='animals'?['product','ms','shells','price','stages']:group==='seeds'?['price','ms','reward']:['ms','shells'];if(!object(v,path,fields))continue;
 for(const f of fields)if(f==='product')text(v[f],path+'.'+f);else num(v[f],path+'.'+f,f==='stages'?5:f==='ms'?1000:1,f==='stages'?7:f==='ms'?86400000:1000000);
 }
 if(object(d.furniture,'furniture',ids.furniture))for(const k of ids.furniture)num(d.furniture[k],'furniture.'+k);
 if(object(d.clothing,'clothing',['trench-set']))num(d.clothing['trench-set'],'clothing.trench-set');
 return errors;
}
