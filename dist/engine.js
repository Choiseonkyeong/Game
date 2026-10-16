import {rooms,roomIds,evidence,items,puzzles,milestones,useRules} from './case.js';
export function fresh(){return {room:'bedroom',flags:{},evidence:[],inventory:[],observed:[],history:[],hints:0,actor:{x:48,y:84,pose:0}};}
export function has(s,key){return !!s.flags[key]||s.evidence.includes(key);}
export function unlocked(s,room){return !!rooms[room]&&(!rooms[room].unlock||s.flags[rooms[room].unlock]);}
export function progress(s){return milestones.flat().filter(k=>s.flags[k]).length;}
export function roomProgress(s,room){return milestones[roomIds.indexOf(room)].filter(k=>s.flags[k]).length;}
export function available(s,id){const p=puzzles[id];return !!p&&p.requires.every(k=>has(s,k));}
export function missing(s,id){return puzzles[id]?.requires.filter(k=>!has(s,k))||[];}
export function apply(s,a,record=true){
 const n={...s,flags:{...s.flags},evidence:[...s.evidence],inventory:[...s.inventory],observed:[...s.observed],actor:{...s.actor},history:[...s.history]};
 let changed=false,message='',view=null;
 const fail=text=>({state:s,changed:false,message:text});
 const addEvidence=id=>{if(!n.evidence.includes(id)){n.evidence.push(id);changed=true;}const ev=evidence[id];if(ev?.flag&&!n.flags[ev.flag]){n.flags[ev.flag]=true;changed=true;}};
 const addItem=id=>{if(!n.inventory.includes(id)){n.inventory.push(id);changed=true;}};
 if(!a||typeof a!=='object')return fail('조사할 곳을 선택하세요.');
 if(a.type==='inspect'){
  const spot=rooms[s.room].hotspots.find(h=>h.id===a.id);if(!spot)return fail('이 공간에서 조사할 수 없는 대상입니다.');
  if(spot.requires&&!has(s,spot.requires))return fail('아직 잠겨 있습니다. 관련 장치를 먼저 조사하세요.');
  if(!n.observed.includes(s.room+':'+spot.id)){n.observed.push(s.room+':'+spot.id);changed=true;}
  if(spot.evidence){addEvidence(spot.evidence);view={kind:'evidence',id:spot.evidence};message=evidence[spot.evidence].title+' · 조사 노트에 기록했습니다.';}
  else if(spot.item){view={kind:'item',id:spot.item};message=items[spot.item].desc;}
  else if(spot.puzzle){view={kind:'puzzle',id:spot.puzzle};message='기록한 단서를 대조해 장치를 조사하세요.';}
  else if(spot.use)message='이 장치에 사용할 도구를 소지품에서 선택하세요.';
  else if(spot.action)message=spot.action==='sleep'?'단추가 잠시 쉴 수 있는 침대입니다.':'창가에 서면 두 손으로 빛을 가리고 하늘을 살펴볼 수 있습니다.';
  else message='이동할 수 있는 통로입니다.';
 }
 else if(a.type==='take'){
  const spot=rooms[s.room].hotspots.find(h=>h.item===a.item);if(!spot||spot.requires&&!has(s,spot.requires))return fail('아직 이 물건을 가져갈 수 없습니다.');
  if(s.inventory.includes(a.item))return fail('이미 가지고 있습니다.');addItem(a.item);message=items[a.item].name+'을 소지품에 넣었습니다.';
 }
 else if(a.type==='solve'){
  const p=puzzles[a.id];if(!p)return fail('알 수 없는 추리입니다.');if(!available(s,a.id))return fail('근거가 아직 부족합니다. 필요한 관찰을 조사 노트에서 확인하세요.');
  if(s.flags[p.flag])return fail('이미 근거와 함께 확정한 추리입니다.');
  const answer=String(a.answer??'').trim().replace(/\s/g,'').toUpperCase();if(answer!==p.answer.toUpperCase())return fail('기록한 사실과 맞지 않는 부분이 있습니다. 연결한 증거를 다시 대조해 보세요.');
  n.flags[p.flag]=true;changed=true;if(p.reward)addItem(p.reward);message=p.explain;view={kind:'deduction',id:a.id};
 }
 else if(a.type==='combine'){
  const chosen=Array.isArray(a.items)?[...new Set(a.items)].sort():[];
  if(chosen.length!==2||!chosen.every(id=>s.inventory.includes(id)))return fail('가지고 있는 서로 다른 두 도구를 선택하세요.');
  if(chosen.join('|')!=='magnet|wire')return fail('이 두 물건은 필요한 도구로 결합되지 않습니다. 각 물건의 성질을 다시 살펴보세요.');
  n.inventory=n.inventory.filter(id=>!chosen.includes(id));addItem('magnet_line');n.flags.tool_made=true;changed=true;message='구리선 끝에 자석을 묶었습니다. 좁은 틈 너머의 철제 걸쇠를 당길 수 있는 자석 낚싯줄이 완성됐습니다.';view={kind:'item',id:'magnet_line'};
 }
 else if(a.type==='use'){
  const spot=rooms[s.room].hotspots.find(h=>h.id===a.target);if(!spot)return fail('사용할 대상을 선택하세요.');if(!s.inventory.includes(a.item))return fail('먼저 필요한 물건을 소지품에 넣으세요.');
  if(a.item==='lens'&&(spot.evidence==='seal'||spot.evidence==='footprints')){addEvidence(spot.evidence);message='렌즈로 세부를 확대해 기존 관찰을 확인했습니다. 봉인과 먼지 흔적을 자세히 비교해 보세요.';view={kind:'evidence',id:spot.evidence};}
  else{const rule=useRules[spot.use];if(!rule||rule.item!==a.item)return fail('물건의 모양과 기능이 이 대상에 맞지 않습니다.');if(!rule.requires.every(k=>has(s,k)))return fail('장치를 이해할 근거가 아직 부족합니다. 관련 도면이나 기록을 먼저 확인하세요.');if(s.flags[spot.use])return fail('이미 열려 있습니다. 공간 이동에서 다음 방으로 갈 수 있습니다.');n.flags[spot.use]=true;changed=true;message=rule.message;}
 }
 else if(a.type==='room'){
  if(!unlocked(s,a.room))return fail('아직 이 공간으로 가는 통로가 열리지 않았습니다.');if(a.room===s.room)return fail('현재 조사 중인 공간입니다.');n.room=a.room;n.actor={x:48,y:84,pose:0};changed=true;message=rooms[a.room].intro;
 }
 else if(a.type==='listen'){
  if(s.room!=='music')return fail('이곳에는 납통 녹음기가 없습니다.');addEvidence('recording');message='녹음에서 도 → 미 → 레 → 솔이 들립니다. 배경의 클릭 소리도 일정하게 되풀이됩니다.';view={kind:'evidence',id:'recording'};
 }
 else if(a.type==='actor'){
  const pose=Number(a.pose);if(!Number.isInteger(pose)||pose<0||pose>7)return fail('지원하지 않는 동작입니다.');n.actor={x:Math.max(8,Math.min(92,Number(a.x)||48)),y:Math.max(53,Math.min(90,Number(a.y)||84)),pose};changed=true;
  if(pose===5&&s.room==='observatory'){addEvidence('sky');view={kind:'evidence',id:'sky'};message='단추가 두 손으로 빛을 가리고 하늘을 관찰했습니다. 동쪽 표식을 노트에 기록했습니다.';}else message=pose===4?'단추가 침대에 몸을 누이고 이불을 덮습니다. 잠깐 쉬어도 증거는 사라지지 않습니다.':pose===5?'단추가 두 손을 얼굴에 모으고 유리 너머의 하늘을 바라봅니다.':pose===6?'단추가 몸을 낮추고 돋보기로 가까이 살펴봅니다.':'단추가 조사할 곳으로 움직입니다.';
 }
 else return fail('알 수 없는 행동입니다.');
 if(changed&&record)n.history.push(JSON.parse(JSON.stringify(a)));
 return {state:changed?n:s,changed,message,view};
}
export function restore(data){let s=fresh();if(!data||typeof data!=='object')return s;for(const a of (Array.isArray(data.history)?data.history:[]).slice(0,5000)){s=apply(s,a,true).state;}s.hints=Number.isInteger(data.hints)?Math.max(0,data.hints):0;return s;}
export function candidateLinks(s,pair){if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1]||!pair.every(id=>s.evidence.includes(id)))return [];return Object.entries(puzzles).filter(([,p])=>p.pair.every(id=>pair.includes(id))).map(([id])=>id);}
