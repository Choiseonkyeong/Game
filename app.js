import {levels, initial, progress, complete, act, restore} from './engine.js';
import {scene} from './scenes.js';
const $ = id => document.getElementById(id);
const SAVE = 'strange-cafe-v1';
let saved = {}, storageWorks = true;
try { saved = JSON.parse(localStorage.getItem(SAVE) || '{}') || {}; } catch { saved = {}; storageWorks = false; }
let states = levels.map((_, i) => initial(i));
// Restore only validated, reachable puzzle states.
if(Array.isArray(saved.states)) states = states.map((_, i) => restore(i,saved.states[i]));
let current = Number.isInteger(saved.current) && saved.current >= 0 && saved.current < levels.length ? saved.current : 0;
let hints = [0,0,0], selected = null, drag = null;
const stage = $('scene');
function persist(){try{ localStorage.setItem(SAVE,JSON.stringify({current, states})); }catch{storageWorks=false;}}
function message(text){$('message').textContent=text;}
function render(text){ const s=states[current], l=levels[current]; selected=null; stage.innerHTML=scene(s); $('chapter').textContent=`CHAPTER ${String(current+1).padStart(2,'0')}`; $('place').textContent=l.label; $('title').textContent=l.title; $('subtitle').textContent=l.subtitle; $('progress').innerHTML=Array.from({length:l.steps},(_,i)=>`<i class="${i<progress(s)?'filled':''}"></i>`).join('');$('progress').setAttribute('aria-label',`${l.steps}단계 중 ${progress(s)}단계 완료`); $('counter').textContent=`${progress(s)} / ${l.steps}`;$('hint-count').textContent=`${hints[current]}/3`; message(text || (complete(s) ? '해결한 장면이에요. 오른쪽 위 메뉴에서 다른 이야기를 골라 보세요.' : '물건을 옮기거나, 물건 → 사용할 곳 순서로 눌러 보세요.')); persist(); }
function perform(item,target){let result=act(states[current],item,target);states[current]=result.state;render(result.message);if(result.changed&&complete(result.state)){ $('success-title').textContent=['햇살처럼 뽀송한 오후','오늘의 첫 커피, 완성!','오늘도 수고했어요.'][current]; $('success-copy').textContent=['비도 그치고, 작은 친구도 웃었어요.\n카페 안에는 또 어떤 일이 기다릴까요?','고양이와 함께라면 평범한 커피도 특별해요.\n어느새 카페를 마칠 시간이 다가왔어요.','세 개의 작은 수수께끼를 모두 해결했어요.\n내일도 조금 이상하고 다정한 하루가 되기를.'][current];$('next').textContent=current===2?'이야기 목록으로 →':'다음 이야기 →';$('success').showModal();}}
function choose(el){if(!el)return;const item=el.dataset.item, target=el.dataset.target;if(selected){const source=selected;selected=null;stage.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));if(source===item){message('선택을 취소했어요. 다른 물건을 골라 보세요.');return;}if(target||['switch','brew'].includes(item)){perform(source,target||item);return;}}
 if(!item){message('여기에 사용할 물건을 먼저 골라 보세요.');return;} if(['switch','brew'].includes(item)){perform(item);return;} selected=item;el.classList.add('selected');message(`${el.getAttribute('aria-label').split(' · ')[0]} 선택! 사용할 곳을 눌러 주세요.`);}
function point(e){const p=stage.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(stage.getScreenCTM().inverse());}
function hit(p,source){const targets=[...stage.querySelectorAll('[data-target]')].reverse();return targets.find(el=>{if(el===source)return false; const b=el.getBBox();return p.x>=b.x-8&&p.x<=b.x+b.width+8&&p.y>=b.y-8&&p.y<=b.y+b.height+8;});}
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;const el=e.target.closest('[data-item],[data-target]');if(!el)return;const p=point(e);drag={id:e.pointerId,el,item:el.dataset.item,start:p,moved:false,ghost:null};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||!drag.item||['switch','brew'].includes(drag.item))return;const p=point(e), dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(!drag.moved&&Math.hypot(dx,dy)<7)return;if(!drag.moved){drag.moved=true;drag.ghost=drag.el.cloneNode(true);drag.ghost.removeAttribute('data-item');drag.ghost.removeAttribute('tabindex');drag.ghost.removeAttribute('role');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.style.pointerEvents='none';drag.ghost.style.opacity='.8';stage.appendChild(drag.ghost);drag.el.style.opacity='.25';}drag.ghost.setAttribute('transform',`translate(${dx} ${dy})`);});
stage.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag,p=point(e);drag=null;d.ghost?.remove();d.el.style.opacity='';if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(d.moved){const target=hit(p,d.el);perform(d.item,target?.dataset.target||'none');}else choose(d.el);});
function cancelDrag(){if(!drag)return;drag.ghost?.remove();drag.el.style.opacity='';drag=null;}
stage.addEventListener('pointercancel',cancelDrag);stage.addEventListener('lostpointercapture',cancelDrag);
stage.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;stage.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));message('선택을 취소했어요.');}if(e.key==='Enter'||e.key===' '){e.preventDefault();const el=e.target.closest('[data-item],[data-target]');choose(el);}});
$('hint').onclick=()=>{if(complete(states[current])){message('이미 멋지게 해결했어요! 다른 장면도 만나 보세요.');return;}const index=Math.min(hints[current],2);hints[current]=Math.min(hints[current]+1,3);$('hint-count').textContent=`${hints[current]}/3`;message(`힌트 ${index+1} · ${levels[current].hints[index]}`);};
$('reset').onclick=()=>{cancelDrag();states[current]=initial(current);hints[current]=0;render('새로 시작했어요. 이번에는 다른 시각으로 살펴볼까요?');};
function openMenu(){ $('level-list').innerHTML=levels.map((l,i)=>`<button class="level-card" data-level="${i}"><b>0${i+1}</b><span>${l.title}<small>${l.label} · ${progress(states[i])}/${l.steps} 해결</small></span><em>${complete(states[i])?'✓':'→'}</em></button>`).join('');document.querySelector('.save-note').textContent=storageWorks?'진행 기록은 이 기기에 자동으로 저장돼요.':'이 브라우저에서는 기록을 저장할 수 없어요. 창을 닫으면 초기화될 수 있어요.';$('chapters').showModal();}
$('menu').onclick=openMenu;$('home').onclick=e=>{e.preventDefault();openMenu();};$('close-menu').onclick=()=>$('chapters').close();$('level-list').onclick=e=>{const btn=e.target.closest('[data-level]');if(!btn)return;current=Number(btn.dataset.level);$('chapters').close();render();};$('stay').onclick=()=>$('success').close();$('next').onclick=()=>{$('success').close();if(current===2)openMenu();else{current++;render();}};
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
