import {stages,roomList,tools,foregroundMasks} from './adventure.js';
import {fresh,restore,act,visible} from './play-engine.js';
import {worldPlaces,dropPlace,describePlace,placeVerb,motionKind,patchRect,clipRect} from './world.js';
const $=id=>document.getElementById(id),KEY='danchu-travel-v6',reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let raw=null;try{raw=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
let interacting=false,activeDrop=null;
let state=restore(raw),selected=[],busy=false,actor={x:44,y:90,pose:0},camera=50,overview=false,geometry={w:0,h:0,scale:1,tx:0,ty:0},hint=0,sound=false,audio=null,codeTarget=null,code='',gesture=null,actorGesture=null,token=0;
const level=()=>stages[state.stage];
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(id,extra=''){const t=tools[id];return tile(t[1],t[2]==='old',extra,id==='oiled');}
function tile(index,old=false,extra='',oil=false){return `<div class="item-art ${old?'old':''} ${extra}" style="background-position:${index%4/3*100}% ${Math.floor(index/4)/3*100}%" aria-hidden="true">${oil?'<span class="oil-badge">●</span>':''}</div>`;}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:6,history:state.history}));}catch{say('기기 저장 공간이 부족해. 이 창에서는 계속 플레이할 수 있어.');}}
function say(t){$('message').textContent=t;}
function pose(p){actor.pose=p;$('actor-sprite').style.backgroundPosition=`${p%4/3*100}% ${Math.floor(p/4)*100}%`;if($('foreground'))$('foreground').hidden=interacting||p===4||actor.y>=[84,94,83,71,70,69][level().room];}
function displayY(y){return y;}
function logicalY(y){return y;}
function actorPosition(){const el=$('actor');el.style.left=actor.x+'%';el.style.top=actor.y+'%';el.style.zIndex=8;el.style.width=Math.round(geometry.h*.16)+'px';el.style.height=Math.round(geometry.h*.16)+'px';pose(actor.pose);}
function layout(){const r=$('viewport').getBoundingClientRect();geometry.h=Math.max(180,r.height-(r.height<650?240:300));geometry.w=geometry.h*1.5;geometry.scale=overview?Math.min(1,r.width/geometry.w):1;const scaled=geometry.w*geometry.scale;geometry.tx=scaled<=r.width?(r.width-scaled)/2:Math.max(r.width-scaled,Math.min(0,r.width/2-camera/100*scaled));geometry.ty=overview?(r.height-geometry.h*geometry.scale)/2:r.height<480?80:r.height<650?110:140;const w=$('world');w.style.width=geometry.w+'px';w.style.height=geometry.h+'px';w.style.transform=`translate(${geometry.tx}px,${geometry.ty}px) scale(${geometry.scale})`;$('pan-left').disabled=scaled<=r.width||geometry.tx>=0;$('pan-right').disabled=scaled<=r.width||geometry.tx<=r.width-scaled;$('zoom').textContent=overview?'가까이 보기':'방 전체';$('camera-label').textContent='배경을 밀어 둘러보고, 생활 소품을 눌러 보세요';}

function focusAt(x){camera=Math.max(0,Math.min(100,x));layout();}
function worldPoint(e){const r=$('viewport').getBoundingClientRect();return{x:(e.clientX-r.left-geometry.tx)/(geometry.w*geometry.scale)*100,y:logicalY((e.clientY-r.top-geometry.ty)/(geometry.h*geometry.scale)*100)};}
function renderObjects(){
 $('objects').innerHTML=worldPlaces(state).filter(o=>visible(state,o)).map(o=>`<button class="scene-hotspot" data-object="${o.id}" style="left:${o.x}%;top:${o.y}%;width:${o.w||12}%;height:${o.h||12}%" aria-label="${esc(o.name)}"><span>${esc(o.name)}</span></button>`).join('');
 const finds=level().objects.filter(o=>o.inside&&visible(state,o));
 $('objects').innerHTML+=finds.map(o=>{const parent=level().objects.find(p=>p.id===o.inside),anchor=parent?.anchor;let x=o.x,y=o.y;if(level().room===0&&anchor==='bed'&&o.id==='camera'){x=24;y=55;}else if(anchor==='drawer'){x=parent.x;y=parent.y-1;}else if(anchor==='jacket'){x=parent.x+1;y=parent.y+4;}else if(anchor==='tote'){x=level().room===0?40:parent.x;y=parent.y-2;}const size=Math.max(20,Math.min(34,geometry.h*(o.id==='camera'?.06:.045)));return `<button class="world-discovery" data-object="${o.id}" aria-label="발견한 ${esc(o.name)} 챙기기" style="left:${x}%;top:${y}%;--found-size:${size}px">${art(o.tool)}</button>`;}).join('');
}
function renderMotions(){
 const room=roomList[level().room][0];
 $('room-motion-layers').innerHTML=Object.keys(state.world||{}).filter(a=>patchRect(level().room,a)).map(anchor=>`<img class="room-state-layer" data-layer="${anchor}" src="travel-art/${room}-searched.webp" alt="" style="clip-path:${clipRect(patchRect(level().room,anchor))}">`).join('');
 $('world').classList.toggle('room-shaded',!!state.world?.window&&level().room===0);
 $('observations').textContent=`수첩 ${state.observations?.length||0}`;
}
function roomCrop(o,opened=false){const rect=patchRect(level().room,o.anchor)||[Math.max(0,o.x-10),Math.max(0,o.y-10),20,20], [x,y,w,h]=rect,room=roomList[level().room][0];return `<div class="room-closeup" style="aspect-ratio:${1.5*w/h}"><div class="crop-content"><img src="travel-art/${room}${opened?'-searched':''}.webp" alt="${esc(o.name)} 확대" style="width:${100/w*100}%;height:${100/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></div></div>`;}
async function animatePlace(o){
 if(!o?.anchor||o.tool)return;
 interacting=true;const kind=o.anchor==='window'&&level().room!==0?'light':motionKind(o.anchor),rect=patchRect(level().room,o.anchor);
 pose(o.anchor==='window'?5:6);$('actor').classList.add('action-'+kind);
 if(rect){$('motion-action').innerHTML=`<img class="moving-state motion-${kind}" src="travel-art/${roomList[level().room][0]}-searched.webp" alt="" style="clip-path:${clipRect(rect)};--clip-top:${rect[1]}%;--clip-bottom:${Math.max(0,100-rect[1]-rect[3])}%">`;}
 const floor={x:actor.x,y:actor.y};
 if(['bed','pillow'].includes(o.anchor)){actor.x=Math.min(45,o.x+8);actor.y=Math.min(80,o.y+13);actorPosition();pose(6);}
 if(['jacket','drawer','tin','shelf'].includes(o.anchor)&&o.y<58){$('actor').classList.add('action-step');actor.x=Math.max(10,Math.min(91,o.x-4));actor.y=Math.min(85,o.y+20);actorPosition();pose(6);}
 say(`단추가 ${o.name}에서 ${placeVerb(o.anchor).replace(/기$/,'고 있어.')} `);
 await sleep(kind==='curtain'?1050:850);
 actor.x=floor.x;actor.y=floor.y;actorPosition();$('actor').classList.remove('action-'+kind);$('actor').classList.remove('action-step');$('motion-action').innerHTML='';interacting=false;pose(0);
}
async function explore(o){
 if(busy)return;const r=act(state,{type:'explore',target:o.id});
 if(!r.ok&&!state.world?.[o.anchor]){say(r.message);openInspection(o,r.message);return;}
 busy=true;if($('detail').open)$('detail').close();await moveTo(o,0);await animatePlace(o);if(r.ok)state=r.state;render();say(r.message);openInspection(o,r.message);busy=false;
}
async function activatePlace(id){
 if(busy)return;const o=worldPlaces(state).find(v=>v.id===id);if(!o)return;
 selected=[];renderBag();if(o.pad){await moveTo(o,0);openCode(o);return;}
 const rule=level().rules.find(r=>r.action==='tap'&&r.target===id);
 if(o.container&&rule&&!state.flags[rule.set]){await perform({type:'tap',target:id});return;}
 if(o.container&&state.flags[o.flag]){busy=true;await moveTo(o,0);await animatePlace(o);render();openInspection(o,describePlace(level().room,o.anchor,level().id));busy=false;return;}
 if(rule&&!state.flags[rule.set]){await perform({type:'tap',target:id});if(!$('detail').open&&!state.flags.done)openInspection(o,$('message').textContent);return;}
 await explore(o);
}
function showObservations(){
 $('detail-tag').textContent=roomList[level().room][1]+' · 관찰 수첩';$('detail-content').innerHTML='<h2>만져 보고 알게 된 것들</h2>'+((state.observations||[]).map(v=>`<article class="observation-entry"><b>${esc(placeVerb(v.anchor))}</b><p>${esc(v.text)}</p></article>`).join('')||'<p>단추를 물건 가까이 데려가거나, 생활 소품을 눌러 살펴보면 관찰이 여기에 남아요.</p>');showDetail();
}
function discoveryArt(index){return `<div class="discovery-art" style="background-position:${index%4/3*100}% ${Math.floor(index/4)/3*100}%" aria-hidden="true"></div>`;}
function showDetail(){if(!$('detail').open)$('detail').showModal();}
function openInspection(o,message=''){
 $('detail').classList.remove('zoomed-inside');
 const l=level(),opened=!!state.flags[o.flag]||!!state.world?.[o.anchor],found=l.objects.filter(v=>v.inside===o.id&&visible(state,v)),hasRule=l.rules.some(r=>r.action==='tap'&&r.target===o.id&&!state.flags[r.set]);
 $('detail-tag').textContent=`${roomList[l.room][1]} · 가까이 살펴보기`;
 let picture=roomCrop(o,opened);
 $('detail-content').innerHTML=`<h2>${esc(o.name)}</h2>${picture}${o.anchor==='drawer'?'<button class="zoom-inside" id="zoom-inside">서랍 안쪽 더 확대하기 ＋</button>':''}<p>${esc(message||o.detail||'바깥에 보이는 것뿐 아니라 접힌 부분과 안쪽도 살펴보자.')}</p>${o.container&&!opened&&hasRule?`<button class="primary" data-search="${o.id}">${esc(o.verb)} →</button><p class="fine">그림을 옆으로 밀어도 같은 동작을 할 수 있어요.</p>`:''}${found.length?`<div class="found-list">${found.map(v=>`<button class="found-item" data-object="${v.id}">${art(v.tool)}<span>${esc(v.name)}<small>발견한 물건 챙기기</small></span></button>`).join('')}</div>`:opened?`<div class="observed-clue"><small>관찰한 흔적</small><p>${esc(describePlace(l.room,o.anchor,l.id))}</p></div>`:''}`;
 $('detail').dataset.place=o.id;showDetail();
}

function renderBag(){$('world').classList.toggle('using-item',selected.length===1);$('bag').innerHTML=state.inventory.map(id=>`<button class="bag-item ${selected.includes(id)?'selected':''}" data-item="${id}" aria-pressed="${selected.includes(id)}" aria-label="${tools[id][0]} 선택">${art(id)}<span>${tools[id][0]}</span></button>`).join('')||'<span class="empty-bag">장면에서 얻은 물건이 여기에 모여요</span>';$('combine').hidden=selected.length!==2;$('dismiss-selection').hidden=!selected.length;$('instruction').textContent=selected.length===1?'선택한 물건을 장면에 누르거나 끌어 놓아 사용':selected.length===2?'조합 버튼을 누르거나 다른 소지품을 선택':'단추를 물건 가까이에 끌어 놓으면 직접 살펴봐요';}
function render(){const l=level(),room=roomList[l.room];$('chapter').textContent=room[1]+' · 단추의 여행책';$('stage-number').textContent=String(l.id).padStart(2,'0');$('goal').textContent=l.goal;$('subgoal').textContent=`${l.id} / 30 · ${l.title}`;$('progress').style.width=state.completed.length/30*100+'%';$('room-image').src=`travel-art/${room[0]}.webp`;$('room-image').alt=`${room[1]}. 현대적인 가구와 생활 소품이 자연스럽게 놓인 여행 공간.`;$('light-beam').hidden=true;$('viewport').style.backgroundImage=`linear-gradient(#d6c8ac66,#b5ad9766),url('travel-art/${room[0]}.webp')`;$('foreground').src=$('room-image').src;$('foreground').style.clipPath=foregroundMasks[l.room];layout();renderObjects();renderMotions();renderBag();actorPosition();save();}
function ping(notes=[660],force=false){if(!sound&&!force)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.33;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.3);});}catch{}}
function sleep(ms){return new Promise(r=>setTimeout(r,reduced?0:ms));}
async function moveTo(o,finalPose=0){const dx=o.x-actor.x;pose(dx<0?2:3);$('actor').classList.add('walking');actor.x=level().room===0&&o.x<44?44:level().room===1&&o.x<42?44:Math.max(10,Math.min(90,o.x-5));actor.y=90;actorPosition();focusAt(o.x);await sleep(420);$('actor').classList.remove('walking');pose(finalPose);}

function fly(item,origin){if(reduced||!origin)return;const start=origin.getBoundingClientRect?.()||origin,end=$('bag').getBoundingClientRect(),el=document.createElement('div');el.className='flying-item';el.innerHTML=art(item);el.style.left=start.left+start.width/2-40+'px';el.style.top=start.top+start.height/2-40+'px';document.body.append(el);requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transform=`translate(${end.left+35-(start.left+start.width/2)}px,${end.top+25-(start.top+start.height/2)}px) scale(.45)`;el.style.opacity='.15';}));setTimeout(()=>el.remove(),850);}
async function perform(action){
 if(busy)return;const l=level(),o=l.objects.find(v=>v.id===action.target),r=act(state,action);say(r.message);
 if(!r.ok){pose(1);if(o)focusAt(o.x);return false;}
 busy=true;const serial=++token,origin=o?document.querySelector(`[data-object="${o.id}"]`)?.getBoundingClientRect():null;
 if($('detail').open)$('detail').close();
 if(o){await moveTo(o,r.rule?.pose??0);if(o.container||!o.tool&&action.type==='use')await animatePlace(o);if(o.tool){pose(6);await sleep(220);}}
 if(serial!==token){busy=false;return false;}state=r.state;selected=selected.filter(i=>state.inventory.includes(i));if(action.type==='use'||action.type==='combine')selected=[];
 if(r.rule?.grant)fly(r.rule.grant,origin);render();$('world-reveal').hidden=true;
 if(r.rule?.melody)ping([261.63,329.63,293.66,392]);else ping([659,784]);say(r.message);
 if(state.flags.done){await sleep(550);showSuccess(r.message);}else if(o&&!o.tool&&(o.container||l.objects.some(v=>v.inside===o.id&&visible(state,v)))){openInspection(o,r.message);}
 busy=false;return true;
}

function showSuccess(message){const last=state.stage===29;$('success-title').textContent=last?'단추의 첫 여행책, 완성':level().title+' · 해결!';$('success-copy').textContent=message;$('next').textContent=last?'여행책 다시 펼치기':'다음 이야기 →';$('success').hidden=false;}
function select(id){selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected.slice(-1),id];renderBag();say(selected.length===2?`${selected.map(i=>tools[i][0]).join(' + ')}. 두 물건을 조합해 볼까?`:selected.length===1?`${tools[id][0]} 선택. 사용할 곳을 장면에서 눌러줘.`:'선택을 해제했어.');}
function openCode(o){codeTarget=o;code='';const ready=(o.requires||[]).every(f=>state.flags[f]);$('detail-tag').textContent='단추가 직접 조작하기';$('detail-content').innerHTML=`<h2>${esc(o.name)}</h2><div class="detail-clue">${esc(ready?o.clue:'아직 읽을 수 있는 단서를 확인하지 못했어. 장면에서 방법을 찾아보자.')}</div>${ready?'<div class="code-readout" id="code-readout">— — —</div><div id="keypad">'+[1,2,3,4,5,6,7,8,9,'지우기',0,'확인'].map(k=>`<button data-key="${k}">${k}</button>`).join('')+'</div>':''}<p class="pad-feedback" id="pad-feedback"></p>`;showDetail();}
async function interact(id){
 if(busy)return;const o=worldPlaces(state).find(v=>v.id===id)||level().objects.find(v=>v.id===id);if(!o||!visible(state,o))return;
 if(overview){overview=false;focusAt(o.x);}
 if(selected.length===1){await perform({type:'use',item:selected[0],target:id});return;}
 if(selected.length===2){say('소지품의 조합 버튼을 누르거나 선택을 해제해 줘.');return;}
 if(o.tool){await perform({type:'tap',target:id});return;}
 if(o.pad){focusAt(o.x);openCode(o);return;}
 if(o.container||o.ambient){await activatePlace(id);return;}
 const r=await perform({type:'tap',target:id});if(!state.flags.done&&!$('detail').open)openInspection(o,$('message').textContent);
}

function enterStage(){token++;busy=false;selected=[];hint=0;overview=false;actor={x:44,y:90,pose:0};camera=level().objects[0]?.x??50;$('success').hidden=true;$('world-reveal').hidden=true;$('world').classList.remove('scene-flash');render();say(level().story);}
function replay(){const r=act(state,{type:'visit',stage:state.stage});if(r.ok){state=r.state;enterStage();}}
function map(){ $('stage-map').innerHTML=roomList.map((r,ri)=>`<section><h3>${r[1]} · ${r[2]}</h3><div class="stage-row">${stages.filter(l=>l.room===ri).map(l=>`<button data-stage="${l.id-1}" class="${state.stage===l.id-1?'current':state.completed.includes(l.id-1)?'completed':''}" ${l.id-1>Math.max(-1,...state.completed)+1?'disabled':''} aria-label="${l.id}단계 ${l.title}">${state.completed.includes(l.id-1)?'✓ ':''}${l.id}</button>`).join('')}</div></section>`).join('');$('map').showModal();}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close){$(b.dataset.close).close();return;}if(b.dataset.search){await perform({type:'tap',target:b.dataset.search});return;}if(b.dataset.object){interact(b.dataset.object);return;}if(b.dataset.item){if(suppressItemClick){suppressItemClick=false;return;}select(b.dataset.item);return;}if(b.dataset.key){if(busy)return;const k=b.dataset.key;if(k==='지우기')code=code.slice(0,-1);else if(k==='확인'){const o=codeTarget,r=act(state,{type:'code',target:o.id,answer:code});if(r.ok){$('detail').close();await perform({type:'code',target:o.id,answer:code});}else{ $('pad-feedback').textContent=r.message;code='';}}else{code=(code+k).slice(0,codeTarget.answer.length);if(codeTarget.music)ping([{1:261.63,2:293.66,3:329.63,5:392}[k]||440]);}if($('code-readout'))$('code-readout').textContent=code.padEnd(codeTarget.answer.length,'—').split('').join(' ');return;}
 if(b.dataset.stage!==undefined){if(busy)return;const target=Number(b.dataset.stage);if(target>Math.max(-1,...state.completed)+1)return;$('map').close();if(target===state.stage)return;const r=act(state,{type:'visit',stage:target});if(r.ok)state=r.state;enterStage();return;}
 switch(b.id){case 'observations':showObservations();break;case 'zoom-inside':{const zoomed=$('detail').classList.toggle('zoomed-inside');$('zoom-inside').textContent=zoomed?'원래 크기로 −':'서랍 안쪽 더 확대하기 ＋';break;}case 'combine':perform({type:'combine',items:[...selected]});break;case 'dismiss-selection':selected=[];renderBag();say('선택을 해제했어. 다른 방법도 시도해 보자.');break;case 'next':if(state.stage===29){$('success').hidden=true;map();}else{const r=act(state,{type:'next'});if(r.ok){state=r.state;enterStage();}}break;case 'replay':replay();break;case 'menu':if(!busy)map();break;case 'zoom':overview=!overview;layout();break;case 'pan-left':overview=false;focusAt(camera-23);break;case 'pan-right':overview=false;focusAt(camera+23);break;case 'hint':{hint=Math.min(hint+1,level().hints.length);say(`힌트 ${hint}/${level().hints.length} · ${level().hints[hint-1]}`);if(hint>=2){const first=level().rules.find(r=>r.set&&!state.flags[r.set]);const o=level().objects.find(o=>o.id===first?.target)||level().objects.find(o=>o.inside===first?.target);const target=o?.inside?level().objects.find(v=>v.id===o.inside):o;if(target){focusAt(target.x);const el=document.querySelector(`[data-object=${target.id}]`);el?.classList.add('hinted');setTimeout(()=>el?.classList.remove('hinted'),4500);}}break;}case 'sound':sound=!sound;$('sound').textContent=sound?'♪ ON':'♪ OFF';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'소리 끄기':'소리 켜기');if(sound)ping();break;case 'help':$('map').close();$('detail-tag').textContent='조작 방법';$('detail-content').innerHTML='<h2>겉모습보다,<br>안쪽을 살펴보세요.</h2><p>① 이불, 가방, 서랍처럼 그림 속 생활 소품을 눌러요.<br>② 확대 화면에서 이불을 걷거나 가방을 열어요.<br>③ 발견한 물건을 챙겨 아래 소지품에서 골라 사용해요.<br>④ 두 물건을 조합하면 새로운 쓰임이 생겨요.</p><p>단추를 이불·베개·주머니·서랍 가까이에 끌어 놓으면 직접 살펴봐요. 열린 서랍은 안쪽 확대 버튼으로 더 가까이 볼 수 있어요. 관찰 수첩에는 발견한 흔적이 남아요. 막혔을 때만 ? 힌트를 확인해 보세요.</p>';$('detail').showModal();break;case 'fullscreen':if(document.fullscreenElement)document.exitFullscreen?.();else if($('game').requestFullscreen){try{await $('game').requestFullscreen();$('map').close();}catch{say('이 브라우저에서는 홈 화면에 추가하면 독립 화면으로 열 수 있어.');}}else{$('map').close();say('아이폰은 Safari 공유 → 홈 화면에 추가로 독립 화면에서 열 수 있어.');}break;case 'restart':$('map').close();$('detail-tag').textContent='처음부터 다시';$('detail-content').innerHTML='<h2>모험을 처음부터 시작할까요?</h2><p>이 기기에 저장된 현재 진행이 초기화돼요.</p><div class="detail-actions"><button data-close="detail">계속 플레이</button><button id="confirm-restart">처음부터 시작</button></div>';$('detail').showModal();break;case 'confirm-restart':state=fresh();$('detail').close();enterStage();break;}
});
const viewport=$('viewport');viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.scene-hotspot,.world-discovery,#actor')||busy||e.button!==0)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,camera,moved:false};viewport.setPointerCapture(e.pointerId);});
viewport.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x;if(Math.abs(dx)>6)gesture.moved=true;if(gesture.moved&&!overview){$('world').classList.add('dragging');camera=Math.max(0,Math.min(100,gesture.camera-dx/geometry.w*100));layout();}});
viewport.addEventListener('pointerup',async e=>{if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;gesture=null;$('world').classList.remove('dragging');if(!g.moved){const p=worldPoint(e);if(p.y<77){say('가방과 서랍, 접힌 천처럼 안쪽이 있는 곳을 살펴봐.');return;}busy=true;await moveTo(p,0);busy=false;}});viewport.addEventListener('pointercancel',()=>{gesture=null;$('world').classList.remove('dragging');});
const actorEl=$('actor');actorEl.addEventListener('pointerdown',e=>{if(busy||e.button!==0)return;e.stopPropagation();actorGesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};actorEl.setPointerCapture(e.pointerId);actorEl.style.transition='none';});
actorEl.addEventListener('pointermove',e=>{
 if(!actorGesture||e.pointerId!==actorGesture.id)return;if(Math.hypot(e.clientX-actorGesture.x,e.clientY-actorGesture.y)>7)actorGesture.moved=true;if(!actorGesture.moved)return;
 const edge=$('viewport').getBoundingClientRect();if(e.clientX>edge.left+edge.width-24)focusAt(camera+2);else if(e.clientX<edge.left+24)focusAt(camera-2);const p=worldPoint(e);actorGesture.last=p;activeDrop=dropPlace(state,p);actor.x=Math.max(5,Math.min(95,p.x));actor.y=Math.max(5,Math.min(95,p.y));pose(e.clientX<actorGesture.x?2:3);actorPosition();
 const cue=$('drop-cue');cue.hidden=!activeDrop;if(activeDrop){cue.textContent=placeVerb(activeDrop.anchor);cue.style.left=activeDrop.x+'%';cue.style.top=Math.max(8,activeDrop.y-8)+'%';}
});
actorEl.addEventListener('pointerup',e=>{
 if(!actorGesture||e.pointerId!==actorGesture.id)return;e.stopPropagation();const g=actorGesture;actorGesture=null;actorEl.style.transition='';$('drop-cue').hidden=true;
 if(actorEl.hasPointerCapture(e.pointerId))actorEl.releasePointerCapture(e.pointerId);
 if(!g.moved){pose(actor.pose===1?7:1);say('단추를 이불, 베개, 커튼, 주머니나 서랍 가까이에 끌어 놓아 봐.');return;}
 const target=dropPlace(state,g.last||worldPoint(e));activeDrop=null;actor.y=90;actorPosition();if(target){activatePlace(target.id);}else{pose(0);say('단추가 바닥에 내려왔어. 무엇을 살펴볼까?');}
});
actorEl.addEventListener('pointercancel',()=>{actorGesture=null;activeDrop=null;$('drop-cue').hidden=true;actor.y=90;actorEl.style.transition='';pose(0);actorPosition();});actorEl.addEventListener('keydown',e=>{if(busy)return;const dirs={ArrowLeft:[-7,0],ArrowRight:[7,0],ArrowUp:[0,-5],ArrowDown:[0,5]};if(dirs[e.key]){e.preventDefault();actor.x=Math.max(8,Math.min(92,actor.x+dirs[e.key][0]));actor.y=Math.max(68,Math.min(95,actor.y+dirs[e.key][1]));pose(dirs[e.key][0]<0?2:3);actorPosition();focusAt(actor.x);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();pose(1);say('단추가 다음에 사용할 물건을 생각하고 있어.');}});
// Item drag/drop uses the same validated engine actions as tapping.
let itemDrag=null,suppressItemClick=false;
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-item]');if(!b||busy||e.button!==0)return;itemDrag={id:e.pointerId,item:b.dataset.item,x:e.clientX,y:e.clientY,moved:false,ghost:null};});
document.addEventListener('pointermove',e=>{if(!itemDrag||e.pointerId!==itemDrag.id)return;if(Math.hypot(e.clientX-itemDrag.x,e.clientY-itemDrag.y)>10)itemDrag.moved=true;if(itemDrag.moved){e.preventDefault();if(!itemDrag.ghost){const el=document.createElement('div');el.className='flying-item';el.innerHTML=art(itemDrag.item);document.body.append(el);itemDrag.ghost=el;}itemDrag.ghost.style.left=e.clientX-40+'px';itemDrag.ghost.style.top=e.clientY-40+'px';}}, {passive:false});
document.addEventListener('pointerup',e=>{if(!itemDrag||e.pointerId!==itemDrag.id)return;const d=itemDrag;itemDrag=null;d.ghost?.remove();if(!d.moved)return;suppressItemClick=true;setTimeout(()=>suppressItemClick=false,300);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-object],[data-item]');if(target?.dataset.object)perform({type:'use',item:d.item,target:target.dataset.object});else if(target?.dataset.item&&target.dataset.item!==d.item)perform({type:'combine',items:[d.item,target.dataset.item]});else say('물건 위에 놓아 사용하거나 소지품 두 개를 골라 조합해 봐.');});document.addEventListener('pointercancel',()=>{itemDrag?.ghost?.remove();itemDrag=null;});
let inspectSwipe=null;
$('detail').addEventListener('pointerdown',e=>{if(e.target.closest('.discovery-art,.room-closeup'))inspectSwipe={x:e.clientX,id:e.pointerId};});
$('detail').addEventListener('pointerup',e=>{if(!inspectSwipe||inspectSwipe.id!==e.pointerId)return;const dx=e.clientX-inspectSwipe.x;inspectSwipe=null;if(Math.abs(dx)>36){const o=level().objects.find(v=>v.id===$('detail').dataset.place);if(o?.container&&!state.flags[o.flag])perform({type:'tap',target:o.id});}});
$('detail').addEventListener('pointercancel',()=>inspectSwipe=null);
window.addEventListener('resize',()=>{layout();renderObjects();actorPosition();});enterStage();if(state.flags.done)showSuccess('이 장면의 목표를 완료했어. 다음 이야기를 이어가자.');if(!raw)$('welcome').showModal();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
