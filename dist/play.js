import {FollowValue,previewState,paperPosition} from './interaction-motion.js?v=070';
import {SceneSurface,sceneProgress,motionEase} from './scene-surface.js?v=070';
import {stages,roomList,tools} from './adventure.js?v=070';
import {fresh,restore,act,visible} from './play-engine.js?v=070';
import {worldPlaces,describePlace,patchRect,gestureFrame,isDark} from './world.js?v=070';
const $=id=>document.getElementById(id),KEY='danchu-travel-v6',reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let raw=null;try{raw=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
let propGesture=null,suppressSceneClick=false,propFramePending=false,lastObjectsMarkup='';
let drawerPaper=null,dialDrag=null;
let state=restore(raw),selected=[],busy=false,camera=50,cameraY=50,overview=false,geometry={w:0,h:0,scale:1,tx:0,ty:0},hint=0,sound=false,audio=null,codeTarget=null,code='',gesture=null,token=0;
const surface=new SceneSurface($('scene-surface'));let scopeView=null,artifactBack=false,bookPage=0;
const level=()=>stages[state.stage];
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(id,extra=''){if(id==='scope')return propArt(2,extra);const t=tools[id];return tile(t[1],t[2]==='old',extra,id==='oiled');}
function propArt(index,extra=''){return `<div class="prop-art ${extra}" style="background-position:${index%2*100}% ${Math.floor(index/2)*100}%" aria-hidden="true"></div>`;}
function tile(index,old=false,extra='',oil=false){return `<div class="item-art ${old?'old':''} ${extra}" style="background-position:${index%4/3*100}% ${Math.floor(index/4)/3*100}%" aria-hidden="true">${oil?'<span class="oil-badge">●</span>':''}</div>`;}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:6,revision:3,history:state.history}));}catch{say('기기 저장 공간이 부족해. 이 창에서는 계속 플레이할 수 있어.');}}
function say(t){$('message').textContent=t;}
function displayY(y){return y;}
function logicalY(y){return y;}
function layout(){const r=$('viewport').getBoundingClientRect();geometry.h=Math.max(180,r.height*1.2);geometry.w=geometry.h*1.5;geometry.scale=overview?Math.min(1,r.width/geometry.w):1;const scaled=geometry.w*geometry.scale;geometry.tx=scaled<=r.width?(r.width-scaled)/2:Math.max(r.width-scaled,Math.min(0,r.width/2-camera/100*scaled));geometry.ty=overview?(r.height-geometry.h*geometry.scale)/2:Math.min(0,r.height-geometry.h*geometry.scale)*cameraY/100;const w=$('world');w.style.width=geometry.w+'px';w.style.height=geometry.h+'px';w.style.transform=`translate3d(${geometry.tx}px,${geometry.ty}px,0) scale(${geometry.scale})`;$('game').classList.toggle('overview',overview);$('pan-left').disabled=scaled<=r.width||geometry.tx>=0;$('pan-right').disabled=scaled<=r.width||geometry.tx<=r.width-scaled;$('zoom').textContent=overview?'가까이 보기':'방 전체';$('camera-label').textContent='배경을 밀어 둘러보고, 생활 소품을 눌러 보세요';}

function focusAt(x){camera=Math.max(0,Math.min(100,x));layout();}
function worldPoint(e){const r=$('viewport').getBoundingClientRect();return{x:(e.clientX-r.left-geometry.tx)/(geometry.w*geometry.scale)*100,y:logicalY((e.clientY-r.top-geometry.ty)/(geometry.h*geometry.scale)*100)};}
function renderObjects(preview=null){
 const place=preview&&worldPlaces(state).find(o=>o.id===preview.target);
 const view=place?previewState(state,place,preview.frame,level().rules.find(r=>r.action==='tap'&&r.target===place.id)):state;
 let markup=worldPlaces(state).filter(o=>visible(state,o)).map(o=>`<button class="scene-hotspot" data-object="${o.id}" style="left:${o.x}%;top:${o.y}%;width:${o.w||12}%;height:${o.h||12}%" aria-label="${esc(o.name)}"></button>`).join('');
 const finds=level().objects.filter(o=>o.inside&&visible(view,o)&&!(level().room===0&&o.inside==='camera_box'&&sceneProgress(view,'bed')<.6)&&(!view.positions?.bed||o.inside!=='blanket'||view.positions.bed.progress>=.6)&&(!view.positions?.[level().objects.find(p=>p.id===o.inside)?.anchor]||view.positions[level().objects.find(p=>p.id===o.inside).anchor].progress>=.6));
 markup+=finds.map(o=>{const parent=level().objects.find(p=>p.id===o.inside),anchor=parent?.anchor;let x=o.x,y=o.y;if(level().room===0&&anchor==='bed'){x=26.5;y=60.3;}else if(anchor==='drawer'){x=parent.x;y=parent.y-1;}else if(anchor==='jacket'){x=parent.x+1;y=parent.y+4;}else if(anchor==='tote'){x=level().room===0?40:parent.x;y=parent.y-2;}const size=Math.max(20,Math.min(o.special==='camera-box'?46:34,geometry.h*(o.special==='camera-box'?.08:o.id==='camera'?.06:.045)));return `<button class="world-discovery ${o.special==='camera-box'?'painted-box-hit':''}" data-object="${o.id}" aria-label="발견한 ${esc(o.name)} 챙기기" style="left:${x}%;top:${y}%;--found-size:${size}px">${o.special==='camera-box'?'':art(o.tool)}</button>`;}).join('');
 if(state.flags.scope_ready)markup+=`<button class="world-discovery placed-scope" data-object="tower" aria-label="창가의 망원경" style="left:51%;top:40%;width:64px;height:64px">${propArt(2)}</button>`;
 if(markup!==lastObjectsMarkup){$('objects').innerHTML=markup;lastObjectsMarkup=markup;}
}
function renderMotions(){
 $('room-motion-layers').innerHTML=Object.keys(state.world||{}).filter(a=>patchRect(level().room,a)).map(a=>`<span data-layer="${a}"></span>`).join('');
 $('world').classList.toggle('room-shaded',!!state.world?.window&&level().room===0);
 surface.render(state,level().room);renderEnvironment();$('observations').textContent=`수첩 ${state.observations?.length||0}`;
}
function roomCrop(o,opened=false){const rect=patchRect(level().room,o.anchor)||[Math.max(0,o.x-10),Math.max(0,o.y-10),20,20], [x,y,w,h]=rect,room=roomList[level().room][0];return `<div class="room-closeup" style="aspect-ratio:${1.5*w/h}"><div class="crop-content"><img src="travel-art/${room}.webp" alt="${esc(o.name)} 확대" style="width:${100/w*100}%;height:${100/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></div></div>`;}
function paintManipulation(o,frame){
 surface.render(state,level().room,{anchor:o.anchor,frame});
 renderEnvironment({anchor:o.anchor,frame});
 renderObjects({target:o.id,frame});
}
async function animatePlace(o,to=1,from=sceneProgress(state,o?.anchor)){
 if(!o?.anchor||o.tool)return;
 const direction=state.positions?.[o.anchor]?.direction||(o.anchor==='window'?'down':'up');
 if(reduced){paintManipulation(o,{progress:to,direction});return;}
 await new Promise(resolve=>{const begin=performance.now(),duration=o.anchor==='bed'?800:o.anchor==='pillow'?580:480;
  const frame=now=>{const t=Math.min(1,(now-begin)/duration),p=from+(to-from)*motionEase(t);
   paintManipulation(o,{progress:p,direction});if(t<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);
 });
}
async function settlePlace(o,frame,velocity=0){
 // Small damped release, returning to the exact saved position. A partial opening stays partial.
 if(reduced||Math.abs(velocity)<.002){paintManipulation(o,frame);return;}
 const amplitude=Math.max(-.025,Math.min(.025,velocity*2));
 await new Promise(resolve=>{const begin=performance.now();const tick=now=>{const t=Math.min(1,(now-begin)/240),p=Math.max(0,Math.min(1,frame.progress+amplitude*Math.sin(t*Math.PI*2)*Math.exp(-4*t)));paintManipulation(o,{...frame,progress:p});if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
}
function renderEnvironment(preview=null){
 const position=preview?.anchor==='window'?preview.frame:state.positions?.window;
 const amount=position?.progress??(state.world?.window?1:0),dark=!!state.world?.light&&amount>=.88;
 $('room-tone').style.opacity=dark?'.79':state.world?.light?String(.24+.2*amount):String(.11*amount);$('world').classList.toggle('lights-off',!!state.world?.light);$('world').classList.toggle('dark-room',dark);
 $('blind').style.height='0%';
 $('hidden-mark').hidden=!(state.stage===0&&dark&&state.flags.blanket_open&&sceneProgress(state,'bed')>=.6);$('hidden-mark').classList.toggle('tag-glowing',dark);
 $('pillow-note').hidden=!(state.stage===0&&(preview?.anchor==='pillow'?preview.frame.progress:(state.positions?.pillow?.progress??(state.world?.pillow?1:0)))>=.6);
}
async function explore(o){
 if(busy)return;const r=act(state,{type:'explore',target:o.id});
 if(!r.ok&&!state.world?.[o.anchor]){return;}
 busy=true;if($('detail').open)await closeDetail();await animatePlace(o);if(r.ok)state=r.state;render();if(o.anchor==='drawer')openInspection(o);busy=false;
}
async function activatePlace(id){
 if(busy)return;const o=worldPlaces(state).find(v=>v.id===id)||level().objects.find(v=>v.id===id);if(!o)return;
 if(o.anchor==='reading'){openBook();return;}if(o.anchor==='frame'){openArtifact('frame');return;}
 if(o.id==='tower'&&state.flags.scope_ready){openScope();return;}
 if(o.anchor==='light'){const r=act(state,{type:'light'});state=r.state;render();return;}
 selected=[];renderBag();if(o.pad){openCode(o);return;}
 const rule=level().rules.find(r=>r.action==='tap'&&r.target===id);
 if(o.container&&rule&&!state.flags[rule.set]){await perform({type:'tap',target:id});return;}
 if(o.container&&state.flags[o.flag]){if(o.anchor==='drawer'){openInspection(o);return;}await manipulateTap(o);return;}
 if(rule&&!state.flags[rule.set]){await perform({type:'tap',target:id});return;}
 if(state.world?.[o.anchor]&&['pillow','window','bed'].includes(o.anchor)){await manipulateTap(o);return;}
 await explore(o);
}
async function manipulateTap(o){busy=true;const to=sceneProgress(state,o.anchor)>.5?0:1;await animatePlace(o,to);const r=act(state,{type:'shift',target:o.id,progress:to,direction:state.positions?.[o.anchor]?.direction||'up'});if(r.ok)state=r.state;render();busy=false;
}
function showObservations(){
 $('detail-tag').textContent=roomList[level().room][1]+' · 관찰 수첩';$('detail-content').innerHTML='<h2>만져 보고 알게 된 것들</h2>'+((state.observations||[]).map(v=>`<article class="observation-entry"><b>${esc(worldPlaces(state).find(o=>o.anchor===v.anchor)?.name||'메모')}</b><p>${esc(v.text)}</p></article>`).join('')||'<p>장면에서 발견한 흔적이 여기에 남아요.</p>');showDetail();
}
function discoveryArt(index){return `<div class="discovery-art" style="background-position:${index%4/3*100}% ${Math.floor(index/4)/3*100}%" aria-hidden="true"></div>`;}
function showDetail(){const d=$('detail');d.classList.remove('leaving');if(!d.open)d.showModal();}
async function closeDetail(id='detail'){const d=$(id);if(!d.open)return;d.classList.add('leaving');await sleep(180);d.close();d.classList.remove('leaving');d.classList.remove('inspection');}

function openInspection(o,message=''){
 $('detail').classList.remove('zoomed-inside');
 const l=level(),opened=!!state.flags[o.flag]||!!state.world?.[o.anchor],found=l.objects.filter(v=>v.inside===o.id&&visible(state,v));
 $('detail-tag').textContent=roomList[l.room][1]+' · '+o.name;
 if(o.anchor==='drawer'&&l.room===0){
  $('detail').classList.add('inspection');drawerPaper={x:0,y:0,back:false};
  $('detail-content').innerHTML=`<div class="drawer-workbench" id="drawer-workbench"><img src="travel-art/drawer-interior-v7.webp" alt="같은 참나무 서랍의 내부, 칸막이와 나뭇결" draggable="false"><div class="inside-items">${found.map(v=>`<button class="inside-find" data-object="${v.id}" style="left:${v.id==='scope'?23:69}%;top:${v.id==='scope'?48:55}%" aria-label="${esc(v.name)} 챙기기">${art(v.tool)}</button>`).join('')}</div><button id="drawer-paper" class="drawer-paper" aria-label="서랍 속 엽서 뒤집거나 옮기기"><span class="postcard-turn"><span class="postcard-face"><span class="postcard-image"></span><span class="postcard-stamp">SEOUL</span></span><span class="postcard-reverse">빛을 피해야 하는 필름은<br>높은 선반의 작은 틴에.</span></span></button></div><div class="inspection-tools"><button id="zoom-inside" class="zoom-inside" aria-label="서랍 내부 확대">＋</button></div>`;
 }else{
  $('detail').classList.remove('inspection');
  $('detail-content').innerHTML=`<h2>${esc(o.name)}</h2>${o.container?discoveryArt(opened?o.openView:o.view):roomCrop(o,opened)}${o.anchor==='drawer'?'<button class="zoom-inside" id="zoom-inside" aria-label="서랍 내부 확대">＋</button>':''}${found.length?`<div class="found-list">${found.map(v=>`<button class="found-item" data-object="${v.id}">${v.tool?art(v.tool):discoveryArt(4)}<span>${esc(v.name)}</span></button>`).join('')}</div>`:''}`;
 }
 $('detail').dataset.place=o.id;showDetail();
}

const journalPages=[
 [['SEOUL · 01','카메라는 이불 아래 보관함에 넣었다. 번호를 잊지 않으려고 내 소유표에도 같은 세 숫자를 남겼다. 밤에도 짐을 구분할 수 있게 축광 잉크로.'],['서울의 창가','남산타워가 보이는 방. 액자 뒷면에 그날의 사진을 끼워 두었다. 서랍 속 망원경은 먼 풍경을 가까이 데려온다.'],['작은 부재','사진에서는 창밖을 보고 있었지만, 함께 있던 사람의 얼굴은 찍지 못했다. 다음 도시에서는 서두르지 않기로.']],
 [['TOKYO · 02','가게 주인은 길 이름보다 걸었던 순서를 기억했다. 접힌 지도 안쪽에는 장소의 번호가, 가방 속 메모에는 방문한 순서가.'],['겹쳐 남은 글씨','원본이 사라져도 아래 종이에 눌린 자국은 남는다. 젖은 종이는 먼저 말려야 한다.'],['타이베이행','비가 오면 창에 바깥보다 실내가 먼저 비친다. 같은 카메라도 빛을 어떻게 가리느냐에 따라 다른 사진이 된다.']],
 [['TAIPEI · 03','주문 영수증에는 번호가, 간식 상자 안에는 주문한 순서가 남았다. 한 장만 읽으면 서로 다른 말 같다.'],['비가 그친 자리','의자 뒤로 빠진 사진에는 손가락보다 작은 고리가 달려 있다. 억지로 꺼내면 접힐 테니 다른 손을 만들어야 한다.'],['방콕의 오후','다음 숙소의 메모는 선반 뒤에 숨겼다. 앞에서 안 보인다면, 보는 방향을 바꿔 볼 것.']],
 [['BANGKOK · 04','거울로 볼 때 비로소 제대로 읽히는 글씨가 있다. 먼지부터 털고, 작은 거울을 비스듬히.'],['바람의 페이지','지도는 자꾸 접혔다. 바람을 멈추려 하지 않고 종이가 머물 자리를 만들었다.'],['파리로','사진을 찍는 일과 보관하는 일은 다르다. 필름에 남은 흠집은 나중에 되돌릴 수 없다.']],
 [['PARIS · 05','빛 위에 필름을 올리니 같은 표식이 여러 사진에 이어졌다. 삼각형, 선, 사각형. 숫자보다 먼저 모양의 순서를 읽어야 했다.'],['남겨진 주소','원본 메모는 없어졌지만 아래 종이에 필압은 남았다. 비스듬한 빛과 연필이 기억을 읽어 준다.'],['마지막 봉투','리스본에 편지를 맡겼다. 이 여행이 내 길을 그대로 따라오는 일로 끝나지 않았으면.']],
 [['LISBON · 06','여섯 도시의 순서는 여행책 자체에 적혀 있다. 마지막, 세 번째, 출발. 사진 케이스는 우리가 지나온 길을 묻는다.'],['빈 마지막 장','사진 옆 문장은 네가 적어 줘. 내가 본 풍경이 아니라 네가 오래 바라본 순간을.'],['여백','책을 묶고도 비어 있는 곳이 남았다. 다음 여행은 이 여백에서 시작될 것이다.']]
];
async function turnBook(delta){const el=document.querySelector('.book-spread');el?.classList.add('page-leaving');await sleep(120);bookPage=Math.max(0,Math.min(2,bookPage+delta));renderBook();}
async function flipArtifact(){document.querySelector('.artifact-paper')?.classList.add('paper-leaving');await sleep(140);artifactBack=!artifactBack;renderArtifact($('detail').dataset.artifact);}
function openBook(){$('detail').classList.remove('inspection');bookPage=0;renderBook();showDetail();}
function renderBook(){const [title,text]=journalPages[level().room][bookPage];$('detail-tag').textContent='선반의 여행책';$('detail-content').innerHTML=`<article class="book-spread"><h3>${title}</h3>${bookPage===1?`<div class="journal-photo" style="background-image:url('travel-art/${roomList[level().room][0]}.webp')"></div>`:''}<p>${esc(text)}</p><div class="page-index">${bookPage+1} / 3</div></article><div class="book-navigation"><button id="book-prev" aria-label="이전 페이지" ${bookPage===0?'disabled':''}>‹</button><button id="book-next" aria-label="다음 페이지" ${bookPage===2?'disabled':''}>›</button></div>`;}

function openArtifact(id){$('detail').classList.remove('inspection');scopeView=null;artifactBack=false;$('detail').dataset.artifact=id;renderArtifact(id);showDetail();}
function renderArtifact(id){
 $('detail-tag').textContent=id==='frame'?'액자':id==='tag'?'보관함의 소유표':'가까이 보기';
 let content='';
 if(id==='pillow-note')content='<small>윤의 짐 정리 메모</small><p>카메라는 이불 아래 보관함에.<br>번호는 보관함에 묶은 내 소유표에 남겼어.</p><p>낮에는 종이처럼 보이지만<br>빛을 머금었다가 어두워지면 빛나는 잉크.<br>창빛도, 침대 옆 등불도 잠든 뒤 읽을 것.</p><span class="note-sign">— 윤</span>';
 else if(id==='tag')content=`${propArt(3)}<small>YUN · CAMERA / SEOUL</small><p>카메라 보관함 · 소유표</p><div class="tag-ink ${isDark(state)?'visible-ink':''}">${isDark(state)?'3 · 1 · 4':'□ · □ · □'}</div><small>PHOSPHOR INK · 축광 잉크</small>`;
 else if(id==='frame')content=artifactBack?'<small>액자 뒷면에 끼운 사진</small><div class="tower-photo"></div><p>서울, 첫 창가.<br>같은 탑을 찾으면 사진 속 방향을 알 수 있을 거야.</p>':'<div class="frame-print"></div>';
 else if(id==='scope')content=propArt(2);
 else if(id==='photo'||id==='loaded'||id==='camera')content=artifactBack?'<p>△ ③　| ①　□ ④</p><small>사진 뒷면 · 윤의 작은 표식</small>':'<div class="tower-photo"></div>';
 else if(id==='note')content=artifactBack?'<p>접힌 곳에도 이야기는 남는다.</p>':`<p>${esc(level().story)}</p>`;
 else content=art(id);
 $('detail-content').innerHTML=`<div class="artifact-paper ${id==='tag'?'ownership-tag':''}">${content}</div>${['frame','photo','note'].includes(id)?'<button id="flip-artifact" class="zoom-inside" aria-label="앞뒤 뒤집기">↶</button>':''}`;
}
function openScope(){scopeView={x:46.5,y:17.5,focus:20};$('detail-tag').textContent='창가 · 망원경';$('detail-content').innerHTML='<div id="scope-lens"><div id="scope-landscape"></div><span class="scope-reticle"></span></div><div class="scope-controls"><span>−</span><input id="scope-focus" type="range" min="0" max="100" value="20" aria-label="망원경 초점"><span>＋</span><button id="scope-shutter" aria-label="풍경 확인">◎</button></div><div id="scope-result"></div>';showDetail();paintScope();}
function paintScope(){if(!scopeView)return;const {x,y,focus}=scopeView;$('scope-landscape').style.backgroundPosition=`${(11*x-50)/10}% ${(11*y-50)/10}%`;$('scope-landscape').style.filter=`blur(${Math.abs(focus-75)/9}px)`;}
function checkScope(){if(!scopeView)return;const r=act(state,{type:'observe',target:'tower',...scopeView});if(r.ok){state=r.state;save();$('scope-result').innerHTML='<div class="photo-caption">서울 · 남산타워<br><small>윤의 사진과 같은 방향</small></div>';}}

function renderBag(){$('game').classList.toggle('bag-empty',!state.inventory.length);$('world').classList.toggle('using-item',selected.length===1);$('bag').innerHTML=state.inventory.map(id=>`<button class="bag-item ${selected.includes(id)?'selected':''}" data-item="${id}" aria-pressed="${selected.includes(id)}" aria-label="${tools[id][0]} 선택">${art(id)}<span>${tools[id][0]}</span></button>`).join('')||'';$('combine').hidden=selected.length!==2;$('dismiss-selection').hidden=!selected.length;$('clear-item').hidden=!selected.length;$('inspect-item').hidden=selected.length!==1;}
function render(){const l=level(),room=roomList[l.room];$('chapter').textContent=room[1]+' · 작은 여행책';$('stage-number').textContent=String(l.id).padStart(2,'0');$('goal').textContent=l.goal;$('subgoal').textContent=`${l.id} / 30 · ${l.title}`;$('progress').style.width=state.completed.length/30*100+'%';$('room-image').src=`travel-art/${room[0]}.webp`;$('room-image').alt=`${room[1]}. 현대적인 가구와 생활 소품이 자연스럽게 놓인 여행 공간.`;$('light-beam').hidden=true;$('viewport').style.setProperty?.('--room-backdrop',`url("travel-art/${room[0]}.webp")`);layout();renderObjects();renderMotions();renderBag();save();}
function ping(notes=[660],force=false){if(!sound&&!force)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.33;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.3);});}catch{}}
function sleep(ms){return new Promise(r=>setTimeout(r,reduced?0:ms));}

async function fly(item,origin){
 if(reduced)return;
 const target=document.querySelector(`[data-item="${item}"]`),end=target?.getBoundingClientRect?.()||$('bag').getBoundingClientRect();
 const start=origin?.getBoundingClientRect?.()||origin||{left:window.innerWidth/2,top:window.innerHeight*.45,width:0,height:0};
 const el=document.createElement('div');el.className='pickup-flight';el.innerHTML=art(item);document.body.append(el);
 const x0=start.left+start.width/2,y0=start.top+start.height/2,x1=end.left+end.width/2,y1=end.top+end.height/2;
 target?.classList.add('pickup-pending');
 await new Promise(resolve=>{const begin=performance.now();const tick=now=>{const t=Math.min(1,(now-begin)/660),e=motionEase(t),arc=Math.sin(t*Math.PI)*Math.min(110,Math.abs(y1-y0)*.24+35);
  el.style.transform=`translate(${x0+(x1-x0)*e-30}px,${y0+(y1-y0)*e-arc-30}px) scale(${.85+.3*Math.sin(t*Math.PI)})`;
  if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
 el.remove();target?.classList.remove('pickup-pending');target?.classList.add('pickup-landed');ping([784,1047]);setTimeout(()=>target?.classList.remove('pickup-landed'),450);
}
async function combineMotion(items){
 if(reduced||!items?.length)return;
 const rect=$('bag').getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top-55;
 const pieces=items.map((item,i)=>{const el=document.createElement('div');el.className='pickup-flight';el.innerHTML=art(item);document.body.append(el);return {el,i};});
 await new Promise(resolve=>{const begin=performance.now();const tick=now=>{const t=Math.min(1,(now-begin)/400),e=motionEase(t);for(const {el,i} of pieces){el.style.transform=`translate(${cx+(i?1:-1)*62*(1-e)-30}px,${cy-30-Math.sin(t*Math.PI)*10}px) rotate(${(i?1:-1)*12*(1-e)}deg) scale(${1-.25*e})`;el.style.opacity=String(1-Math.max(0,(t-.75)*4));}if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});pieces.forEach(({el})=>el.remove());
}
async function receiveAt(o){
 if(!o||reduced)return;
 const el=document.querySelector(`[data-object="${o.id}"]`);el?.classList.add('item-received');
 if(state.stage===0&&o.anchor==='window'){$('world').classList.add('camera-shutter');await sleep(320);$('world').classList.remove('camera-shutter');}
 else await sleep(180);
 el?.classList.remove('item-received');
}
async function perform(action){
 if(busy)return;const l=level(),o=l.objects.find(v=>v.id===action.target),r=act(state,action);say(r.message);
 if(!r.ok){if(o){focusAt(o.x);const el=document.querySelector(`[data-object="${o.id}"]`);el?.classList.add('attempt-miss');setTimeout(()=>el?.classList.remove('attempt-miss'),260);}return false;}
 busy=true;const serial=++token,origin=o?(document.querySelector(`#detail [data-object="${o.id}"]`)||document.querySelector(`[data-object="${o.id}"]`))?.getBoundingClientRect():action.type==='combine'?(()=>{const b=$('bag').getBoundingClientRect();return {left:b.left+b.width/2,top:b.top-55,width:0,height:0};})():null;
 if($('detail').open)await closeDetail();
 if(o){if(action.type==='code'&&o.special==='camera-box')await animatePlace({...o,anchor:'camera-box'});else if(o.container)await animatePlace(o);}
 if(serial!==token){busy=false;return false;}state=r.state;selected=selected.filter(i=>state.inventory.includes(i));if(action.type==='use'||action.type==='combine')selected=[];
 render();$('world-reveal').hidden=true;
 if(r.rule?.grant&&!reduced)document.querySelector(`[data-item="${r.rule.grant}"]`)?.classList.add('pickup-pending');
 if(action.type==='combine')await combineMotion(action.items);
 if(r.rule?.grant)await fly(r.rule.grant,origin||document.querySelector(`[data-item="${action.items?.[0]}"]`));
 if(action.type==='use'&&r.ok)await receiveAt(o);
 if(r.rule?.melody)ping([261.63,329.63,293.66,392]);else ping([659,784]);say(r.message);
 if(action.type==='use'&&action.item==='scope'){openScope();}
 if(state.flags.done){await sleep(550);showSuccess(r.message);}else if(o?.anchor==='drawer'){openInspection(o);}else if(r.rule?.reveal||(!o?.container&&o&&!o.tool&&action.type==='tap')){showClue(r.rule?.reveal||r.message);}
 busy=false;return true;
}

function showClue(text){$('detail-tag').textContent='메모';$('detail-content').innerHTML=`<div class="physical-note">${esc(text)}</div>`;showDetail();}
function showSuccess(message){const last=state.stage===29;$('success-title').textContent=last?'나의 첫 여행책, 완성':level().title+' · 해결!';$('success-copy').textContent=message;$('next').textContent=last?'여행책 다시 펼치기':'다음 이야기 →';$('success').hidden=false;}
function select(id){selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected.slice(-1),id];renderBag();say(selected.length===2?`${selected.map(i=>tools[i][0]).join(' + ')}. 두 물건을 조합해 볼까?`:selected.length===1?`${tools[id][0]} 선택. 사용할 곳을 장면에서 눌러줘.`:'선택을 해제했어.');}
function openCode(o){codeTarget=o;code='';const ready=(o.requires||[]).every(f=>state.flags[f]);$('detail-tag').textContent='가까이 조작하기';$('detail-content').innerHTML=`<h2>${esc(o.name)}</h2>${o.special==='camera-box'?`<div class="box-closeup">${propArt(0)}<button id="read-tag" class="tag-link">YUN · CAMERA ◇</button></div>`:`<div class="detail-clue">${esc(ready?o.clue:'…')}</div>`}${ready?'<div class="code-readout" id="code-readout">— — —</div><div id="keypad">'+[1,2,3,4,5,6,7,8,9,'지우기',0,'확인'].map(k=>`<button data-key="${k}">${k}</button>`).join('')+'</div>':''}<p class="pad-feedback" id="pad-feedback"></p>`;
 if(o.special==='camera-box'&&ready){code='';$('keypad').hidden=true;$('code-readout').hidden=true;const controls=document.createElement('div');controls.className='physical-lock';controls.innerHTML=[0,1,2].map(i=>`<div class="lock-column"><button data-dial="${i}" data-step="1" aria-label="${i+1}번째 숫자 올리기">⌃</button><span data-wheel="${i}" class="dial-window"><b id="dial-${i}">0</b></span><button data-dial="${i}" data-step="-1" aria-label="${i+1}번째 숫자 내리기">⌄</button></div>`).join('')+'<button class="latch-release" data-key="확인" aria-label="보관함 열기">↪</button>';$('detail-content').append(controls);}
 showDetail();}
async function interact(id){
 if(busy)return;const o=worldPlaces(state).find(v=>v.id===id)||level().objects.find(v=>v.id===id);if(!o||!visible(state,o))return;
 if(overview){overview=false;focusAt(o.x);}
 if(selected.length===1){await perform({type:'use',item:selected[0],target:id});return;}
 if(selected.length===2){say('소지품의 조합 버튼을 누르거나 선택을 해제해 줘.');return;}
 if(o.tool){await perform({type:'tap',target:id});return;}
 if(o.anchor==='reading'){openBook();return;}if(o.anchor==='frame'){openArtifact('frame');return;}if(o.id==='tower'&&state.flags.scope_ready&&selected.length===0){openScope();return;}
 if(o.pad){focusAt(o.x);if(o.special==='camera-box'&&state.flags.camera_box_open)return;openCode(o);return;}
 if(o.container||o.ambient||(!level().rules.some(r=>r.action==='tap'&&r.target===id)&&patchRect(level().room,o.anchor))){await activatePlace(id);return;}
 await perform({type:'tap',target:id});
}

function enterStage(){token++;busy=false;selected=[];hint=0;overview=false;cameraY=50;camera=level().objects[0]?.x??50;$('success').hidden=true;$('world-reveal').hidden=true;$('world').classList.remove('scene-flash');render();say(level().story);}
function replay(){const r=act(state,{type:'visit',stage:state.stage});if(r.ok){state=r.state;enterStage();}}
function map(){ $('stage-map').innerHTML=roomList.map((r,ri)=>`<section><h3>${r[1]} · ${r[2]}</h3><div class="stage-row">${stages.filter(l=>l.room===ri).map(l=>`<button data-stage="${l.id-1}" class="${state.stage===l.id-1?'current':state.completed.includes(l.id-1)?'completed':''}" ${l.id-1>Math.max(-1,...state.completed)+1?'disabled':''} aria-label="${l.id}단계 ${l.title}">${state.completed.includes(l.id-1)?'✓ ':''}${l.id}</button>`).join('')}</div></section>`).join('');$('map').showModal();}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close){scopeView=null;await closeDetail(b.dataset.close);return;}if(b.dataset.search){await perform({type:'tap',target:b.dataset.search});return;}if(b.dataset.tag){openArtifact('tag');return;}if(b.dataset.object){if(suppressSceneClick)return;await interact(b.dataset.object);return;}if(b.dataset.item){if(suppressItemClick){suppressItemClick=false;return;}select(b.dataset.item);return;}if(b.dataset.dial!==undefined){adjustDial(Number(b.dataset.dial),Number(b.dataset.step));return;}if(b.dataset.key){if(busy)return;const k=b.dataset.key;if(k==='지우기')code=code.slice(0,-1);else if(k==='확인'){const o=codeTarget,r=act(state,{type:'code',target:o.id,answer:code});if(r.ok){$('detail').close();await perform({type:'code',target:o.id,answer:code});}else{ $('pad-feedback').textContent=o.special==='camera-box'?'잠금이 풀리지 않았다.':r.message;if(o.special==='camera-box'){const lock=document.querySelector('.physical-lock');lock?.classList.add('lock-error');setTimeout(()=>lock?.classList.remove('lock-error'),260);}else code='';}}else{code=(code+k).slice(0,codeTarget.answer.length);if(codeTarget.music)ping([{1:261.63,2:293.66,3:329.63,5:392}[k]||440]);}if($('code-readout'))$('code-readout').textContent=code.padEnd(codeTarget.answer.length,'—').split('').join(' ');return;}
 if(b.dataset.stage!==undefined){if(busy)return;const target=Number(b.dataset.stage);if(target>Math.max(-1,...state.completed)+1)return;$('map').close();if(target===state.stage)return;const r=act(state,{type:'visit',stage:target});if(r.ok)state=r.state;enterStage();return;}
 switch(b.id){case 'drawer-paper':if(!suppressSceneClick){drawerPaper.back=!drawerPaper.back;$('drawer-paper').classList.toggle('back',drawerPaper.back);}break;case 'dial-up':case 'dial-down':break;case 'pillow-note':openArtifact('pillow-note');break;case 'observations':showObservations();break;case 'zoom-inside':{const zoomed=$('detail').classList.toggle('zoomed-inside');$('zoom-inside').textContent=zoomed?'−':'＋';$('zoom-inside').setAttribute('aria-label',zoomed?'원래 크기로':'서랍 내부 확대');break;}case 'read-tag':openArtifact('tag');break;case 'inspect-item':openArtifact(selected[0]);break;case 'flip-artifact':await flipArtifact();break;case 'scope-shutter':checkScope();break;case 'clear-item':selected=[];renderBag();break;case 'combine':await perform({type:'combine',items:[...selected]});break;case 'dismiss-selection':selected=[];renderBag();say('선택을 해제했어. 다른 방법도 시도해 보자.');break;case 'next':if(state.stage===29){$('success').hidden=true;map();}else{const r=act(state,{type:'next'});if(r.ok){state=r.state;enterStage();}}break;case 'replay':replay();break;case 'menu':if(!busy)map();break;case 'zoom':overview=!overview;layout();break;case 'pan-up':overview=false;cameraY=Math.max(0,cameraY-30);layout();break;case 'pan-down':overview=false;cameraY=Math.min(100,cameraY+30);layout();break;case 'book-prev':await turnBook(-1);break;case 'book-next':await turnBook(1);break;case 'pan-left':overview=false;focusAt(camera-23);break;case 'pan-right':overview=false;focusAt(camera+23);break;case 'hint':{hint=Math.min(hint+1,level().hints.length);showClue(level().hints[hint-1]);$('detail-tag').textContent=`힌트 ${hint}/${level().hints.length}`;if(hint>=2){const first=level().rules.find(r=>r.set&&!state.flags[r.set]);const o=level().objects.find(o=>o.id===first?.target)||level().objects.find(o=>o.inside===first?.target);const target=o?.inside?level().objects.find(v=>v.id===o.inside):o;if(target){focusAt(target.x);const el=document.querySelector(`[data-object=${target.id}]`);el?.classList.add('hinted');setTimeout(()=>el?.classList.remove('hinted'),4500);}}break;}case 'sound':sound=!sound;$('sound').textContent=sound?'♪ ON':'♪ OFF';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'소리 끄기':'소리 켜기');if(sound)ping();break;case 'help':$('map').close();$('detail-tag').textContent='조작 방법';$('detail-content').innerHTML='<h2>겉모습보다,<br>안쪽을 살펴보세요.</h2><p>① 이불, 가방, 서랍처럼 그림 속 생활 소품을 눌러요.<br>② 확대 화면에서 이불을 걷거나 가방을 열어요.<br>③ 발견한 물건을 챙겨 아래 소지품에서 골라 사용해요.<br>④ 두 물건을 조합하면 새로운 쓰임이 생겨요.</p><p>열린 서랍은 안쪽 확대 버튼으로 더 가까이 볼 수 있어요. 관찰 수첩에는 발견한 흔적이 남아요. 막혔을 때만 ? 힌트를 확인해 보세요.</p>';showDetail();break;case 'fullscreen':if(document.fullscreenElement)document.exitFullscreen?.();else if($('game').requestFullscreen){try{await $('game').requestFullscreen();$('map').close();}catch{say('이 브라우저에서는 홈 화면에 추가하면 독립 화면으로 열 수 있어.');}}else{$('map').close();say('아이폰은 Safari 공유 → 홈 화면에 추가로 독립 화면에서 열 수 있어.');}break;case 'restart':$('map').close();$('detail-tag').textContent='처음부터 다시';$('detail-content').innerHTML='<h2>모험을 처음부터 시작할까요?</h2><p>이 기기에 저장된 현재 진행이 초기화돼요.</p><div class="detail-actions"><button data-close="detail">계속 플레이</button><button id="confirm-restart">처음부터 시작</button></div>';$('detail').showModal();break;case 'confirm-restart':state=fresh();$('detail').close();enterStage();break;}
});
const viewport=$('viewport');
viewport.addEventListener('pointerdown',e=>{
 if(busy||e.button!==0||e.target.closest('#pillow-note,#hidden-mark'))return;
 const button=e.target.closest('.scene-hotspot');
 if(button&&!selected.length){const o=worldPlaces(state).find(v=>v.id===button.dataset.object);
  if(o&&!o.pad&&!['light','frame','reading'].includes(o.anchor)&&patchRect(level().room,o.anchor)){
   propGesture={id:e.pointerId,o,x:e.clientX,y:e.clientY,moved:false,start:state.positions?.[o.anchor]||{progress:state.world?.[o.anchor]?1:0,direction:'right'}};
   viewport.setPointerCapture(e.pointerId);return;
  }
 }
 if(e.target.closest('.scene-hotspot,.world-discovery'))return;
 gesture={id:e.pointerId,x:e.clientX,y:e.clientY,camera,cameraY,moved:false};viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener('pointermove',e=>{
 if(propGesture&&e.pointerId===propGesture.id){const g=propGesture,dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(Math.hypot(dx,dy)<5&&!g.moved)return;g.moved=true;e.preventDefault?.();
  const previous=g.frame?.progress??g.start.progress;g.frame=gestureFrame(dx,dy,geometry.w*geometry.scale*g.o.w/100,geometry.h*geometry.scale*g.o.h/100,g.start);g.velocity=g.frame.progress-previous;
  if(g.allowed===undefined)g.allowed=act(state,{type:'shift',target:g.o.id,...g.frame},false).ok;if(!g.allowed)return;
  // Stable objects move continuously; rendering has no engine side effects before release.
  $('motion-action').dataset.progress=String(g.frame.progress);
  if(reduced){paintManipulation(g.o,g.frame);return;}
  g.follow??=new FollowValue(g.start.progress);g.follow.set(g.frame.progress);
  if(!propFramePending){propFramePending=true;let previousTime=performance.now();const tick=now=>{if(propGesture!==g){propFramePending=false;return;}g.visual=g.follow.step((now-previousTime)/1000);previousTime=now;paintManipulation(g.o,{...g.frame,progress:g.visual});if(!g.follow.resting)requestAnimationFrame(tick);else propFramePending=false;};requestAnimationFrame(tick);}return;
 }
 if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.hypot(dx,dy)>6)gesture.moved=true;
 if(gesture.moved&&!overview){$('world').classList.add('dragging');camera=Math.max(0,Math.min(100,gesture.camera-dx/geometry.w*100));cameraY=Math.max(0,Math.min(100,gesture.cameraY-dy/Math.max(1,geometry.h-$('viewport').getBoundingClientRect().height)*100));layout();}
});
viewport.addEventListener('pointerup',async e=>{
 if(propGesture&&e.pointerId===propGesture.id){const g=propGesture;propGesture=null;
  if(g.moved&&g.allowed===false){renderMotions();renderObjects();return;}
  if(g.moved){suppressSceneClick=true;setTimeout(()=>suppressSceneClick=false,350);if(g.frame){const r=act(state,{type:'shift',target:g.o.id,...g.frame});if(r.ok)state=r.state;}
   busy=true;if(g.frame){if(!reduced&&g.visual!==undefined&&Math.abs(g.visual-g.frame.progress)>.001)await animatePlace(g.o,g.frame.progress,g.visual);else await settlePlace(g.o,g.frame,g.velocity);}$('motion-action').innerHTML='';render();busy=false;
  }else{suppressSceneClick=true;await interact(g.o.id);setTimeout(()=>suppressSceneClick=false,350);}return;
 }
 if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;gesture=null;$('world').classList.remove('dragging');
 
});
viewport.addEventListener('pointercancel',()=>{gesture=null;propGesture=null;$('motion-action').innerHTML='';$('world').classList.remove('dragging');renderMotions();renderObjects();});
// Item drag/drop uses the same validated engine actions as tapping.
let itemDrag=null,suppressItemClick=false;
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-item]');if(!b||busy||e.button!==0)return;itemDrag={id:e.pointerId,item:b.dataset.item,x:e.clientX,y:e.clientY,moved:false,ghost:null};});
document.addEventListener('pointermove',e=>{if(!itemDrag||e.pointerId!==itemDrag.id)return;if(Math.hypot(e.clientX-itemDrag.x,e.clientY-itemDrag.y)>10)itemDrag.moved=true;if(itemDrag.moved){e.preventDefault();if(!itemDrag.ghost){const el=document.createElement('div');el.className='flying-item';el.innerHTML=art(itemDrag.item);document.body.append(el);itemDrag.ghost=el;}itemDrag.ghost.style.left=e.clientX-40+'px';itemDrag.ghost.style.top=e.clientY-40+'px';}}, {passive:false});
document.addEventListener('pointerup',async e=>{if(!itemDrag||e.pointerId!==itemDrag.id)return;const d=itemDrag;itemDrag=null;if(!d.moved){d.ghost?.remove();return;}suppressItemClick=true;setTimeout(()=>suppressItemClick=false,300);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-object],[data-item]');if(d.ghost){d.ghost.style.transition='transform .2s ease-out,opacity .2s ease-out,left .26s ease-out,top .26s ease-out';if(target){d.ghost.style.transform='scale(.65)';d.ghost.style.opacity='0';}else{d.ghost.style.left=d.x-40+'px';d.ghost.style.top=d.y-40+'px';d.ghost.style.transform='scale(.8)';d.ghost.style.opacity='0';}await sleep(220);d.ghost.remove();}if(target?.dataset.object)perform({type:'use',item:d.item,target:target.dataset.object});else if(target?.dataset.item&&target.dataset.item!==d.item)perform({type:'combine',items:[d.item,target.dataset.item]});else say('물건 위에 놓아 사용하거나 소지품 두 개를 골라 조합해 봐.');});document.addEventListener('pointercancel',()=>{itemDrag?.ghost?.remove();itemDrag=null;});
function adjustDial(index,step){const digits=(code||'000').padEnd(3,'0').split('');digits[index]=String((Number(digits[index])+step+10)%10);code=digits.join('');const el=$('dial-'+index);if(el){el.textContent=digits[index];el.classList.add('dial-tick');setTimeout(()=>el.classList.remove('dial-tick'),120);}ping([300+Number(digits[index])*25]);}
let paperDrag=null;
$('detail').addEventListener('pointerdown',e=>{
 if(e.target.closest('#drawer-paper')){const r=$('drawer-workbench').getBoundingClientRect();paperDrag={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,start:{...drawerPaper},moved:false};$('detail').setPointerCapture(e.pointerId);}
 const dial=e.target.closest('[data-wheel]');if(dial){dialDrag={id:e.pointerId,index:Number(dial.dataset.wheel),y:e.clientY,steps:0};$('detail').setPointerCapture(e.pointerId);}
});
$('detail').addEventListener('pointermove',e=>{
 if(paperDrag&&e.pointerId===paperDrag.id){const d=paperDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>5)d.moved=true;if(!d.moved)return;e.preventDefault?.();const v=paperPosition(dx,dy,d.w,d.h);drawerPaper.x=d.start.x+v.x;drawerPaper.y=d.start.y+v.y;$('drawer-paper').style.transform=`translate(${drawerPaper.x*d.w}px,${drawerPaper.y*d.h}px) rotate(${v.x*15-7}deg)`;$('drawer-paper').classList.add('held');}
 if(dialDrag&&e.pointerId===dialDrag.id){const steps=Math.round((dialDrag.y-e.clientY)/24),diff=steps-dialDrag.steps;if(diff){adjustDial(dialDrag.index,diff);dialDrag.steps=steps;}}
});
$('detail').addEventListener('pointerup',e=>{if(paperDrag){if(paperDrag.moved){suppressSceneClick=true;setTimeout(()=>suppressSceneClick=false,300);}$('drawer-paper').classList.remove('held');paperDrag=null;}dialDrag=null;});
$('detail').addEventListener('pointercancel',()=>{if(paperDrag){drawerPaper=paperDrag.start;$('drawer-paper').style.transform=`translate(${drawerPaper.x*paperDrag.w}px,${drawerPaper.y*paperDrag.h}px) rotate(-7deg)`;$('drawer-paper').classList.remove('held');}paperDrag=null;dialDrag=null;});
let scopeDrag=null;
$('detail').addEventListener('pointerdown',e=>{if(e.target.closest('#scope-lens')&&scopeView){scopeDrag={x:e.clientX,y:e.clientY,start:{...scopeView}};$('detail').setPointerCapture(e.pointerId);}});
$('detail').addEventListener('pointermove',e=>{if(!scopeDrag||!scopeView)return;scopeView.x=Math.max(40,Math.min(54,scopeDrag.start.x-(e.clientX-scopeDrag.x)/60));scopeView.y=Math.max(9,Math.min(26,scopeDrag.start.y-(e.clientY-scopeDrag.y)/60));paintScope();});
$('detail').addEventListener('pointerup',()=>{scopeDrag=null;if(scopeView)checkScope();});
$('detail').addEventListener('pointercancel',()=>scopeDrag=null);
$('detail').addEventListener('input',e=>{if(e.target.id==='scope-focus'&&scopeView){scopeView.focus=Number(e.target.value);paintScope();checkScope();}});
$('detail').addEventListener('close',()=>{scopeDrag=null;scopeView=null;});
$('release-label').textContent='0.7.0 · 모션 개편';
window.addEventListener('resize',()=>{layout();renderObjects();});enterStage();if(state.flags.done)showSuccess('이 장면의 목표를 완료했어. 다음 이야기를 이어가자.');if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=070',{updateViaCache:'none'}).catch(()=>{});
