import {chapters,levels} from './story.js';
import {fresh,active,complete,visible,dispatch,restore,finished,uses,parts} from './engine.js';
import {defs,prop} from './art.js';
const $=id=>document.getElementById(id),KEY='button-bedtime-v4';let saved={},storageOK=true;
try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{storageOK=false;}
let states=levels.map((_,i)=>restore(i,saved.states?.[i]));let cleared=levels.map((_,i)=>saved.cleared?.[i]===true||complete(states[i]));
function maxOpen(){const first=cleared.findIndex(c=>!c);return first<0?29:first;}
let current=Number.isInteger(saved.current)?Math.max(0,Math.min(maxOpen(),saved.current)):0,selected=null,drag=null,sound=false,audio=null,busy=false;
const scene=$('scene');
function save(){try{localStorage.setItem(KEY,JSON.stringify({current,states,cleared}));}catch{storageOK=false;}}
function say(t){$('feedback').textContent=t;}
function ping(win=false){if(!sound)return;try{audio ||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=win?784:523;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.27);}catch{}}

// --- motion helpers (skipped when animation frames are unavailable or reduced motion is requested)
const motion=()=>typeof requestAnimationFrame==='function'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const node=id=>scene.querySelector?.(`[data-id="${id}"]`);
function tween(el,from,to,ms,done=()=>{},arc=0){const t0=performance.now();const frame=now=>{const k=Math.min(1,(now-t0)/ms),e=1-(1-k)**3,x=from.x+(to.x-from.x)*e,y=from.y+(to.y-from.y)*e-arc*Math.sin(Math.PI*k),sc=(from.s??1)+((to.s??1)-(from.s??1))*e;el.setAttribute('transform',`translate(${x} ${y}) scale(${sc})`);if(k<1)requestAnimationFrame(frame);else done();};requestAnimationFrame(frame);}
function pulse(id,cls){if(!motion()||!id)return;const fx=node(id)?.querySelector('.fx');if(!fx)return;fx.classList.remove(cls);void fx.getBBox?.();fx.classList.add(cls);setTimeout(()=>fx.classList.remove(cls),550);}
function lift(id){const el=node(id),box=boxes().find(b=>b.id===id);if(!el||!box)return null;const ghost=el.cloneNode(true);ghost.removeAttribute('data-id');ghost.setAttribute('aria-hidden','true');ghost.style.pointerEvents='none';scene.appendChild(ghost);el.style.opacity='.25';return {ghost,el,from:{x:box.x,y:box.y,s:1}};}
function drop(g){g.ghost.remove();g.el.style.opacity='';}

// --- scene geometry
function heroRect(){const l=levels[current],h={...l.hero},route=finished(states[current]).filter(r=>r.heroTo||r.kind==='move'&&r.item==='hero').at(-1);if(route){const t=l.objects.find(o=>o.id===(route.heroTo||route.target));if(t){h.x=Math.max(5,Math.min(395-h.w,t.x+t.w/2-h.w/2));h.y=Math.max(40,Math.min(510-h.h,t.y+t.h-h.h));}}return h;}
function boxes(){return [{id:'hero',...heroRect()},...visible(states[current])];}
function hit(p,exclude){return boxes().reverse().find(o=>o.id!==exclude&&p.x>=o.x-5&&p.x<=o.x+o.w+5&&p.y>=o.y-5&&p.y<=o.y+o.h+5)?.id;}
function point(e){const p=scene.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(scene.getScreenCTM().inverse());}
const svgProp=(type,n,w,h,extra='')=>`<svg class="prop" width="${w}" height="${h}" viewBox="0 0 120 120" overflow="visible" ${extra}>${prop(type,n)}</svg>`;

// --- drawing
function element(id,label,content,rect,dim=false){return `<g class="item ${selected===id?'chosen':''}" data-id="${id}" tabindex="0" role="button" aria-label="${label}" transform="translate(${rect.x} ${rect.y})" ${dim?'style="filter:brightness(.3)"':''}><title>${label}</title><g class="fx">${content}</g></g>`;}
function worn(h){const l=levels[current];return finished(states[current]).filter(r=>r.wear).map(r=>{const t=l.objects.find(o=>o.id===r.item)?.type;if(!t)return '';
 const at=(x,y,w,ht,n=1,fit='')=>`<g pointer-events="none" transform="translate(${x} ${y})">${svgProp(t,n,w,ht,fit)}</g>`;
 if(r.wear==='body')return at(h.x-8,h.y+h.h*.55,h.w+16,h.h*.47,1,'preserveAspectRatio="none"');
 if(r.wear==='feet')return at(h.x+h.w*.18,h.y+h.h-48,46,46)+at(h.x+h.w*.55,h.y+h.h-48,46,46);
 if(r.wear==='neck')return at(h.x+h.w*.2,h.y+h.h*.42,h.w*.6,55,1,'preserveAspectRatio="none"');
 if(r.wear==='hands')return at(h.x+h.w*.25,h.y+h.h*.5,h.w*.5,60);
 if(r.wear==='up')return `<path d="M${h.x+h.w*.78} ${h.y+h.h*.42}L${h.x+h.w+12} ${h.y+60}" stroke="#c48c82" stroke-width="2" pointer-events="none"/>`+at(h.x+h.w-30,h.y-40,85,110,0);
 return '';}).join('');}
function guide(l,s){if(!l.tutorial||s.step!==0)return '';const r=parts(active(s))[0],b=boxes(),from=b.find(o=>o.id===r.item),to=b.find(o=>o.id===r.target);if(!from)return '';const c=o=>[o.x+o.w/2,o.y+o.h/2];
 if(r.kind==='move'&&to){const [x1,y1]=c(from),[x2,y2]=c(to);return `<path class="guide-arrow" d="M${x1} ${y1}Q${(x1+x2)/2} ${Math.min(y1,y2)-70} ${x2} ${y2}" fill="none" stroke="#fff6d5" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 7"/>`;}
 const [x,y]=c(from);return `<circle class="guide-arrow" cx="${x}" cy="${y}" r="${Math.max(from.w,from.h)/2+8}" fill="none" stroke="#fff2ba" stroke-width="2.5" stroke-dasharray="4 4"/>`;}
function draw(){const l=levels[current],s=states[current],h=heroRect(),step=s.step,done=complete(s);
 const dark=l.dim&&!done||l.darkAt!=null&&step>=l.darkAt;
 const heroClass=done?'win-bounce':l.mood==='cold'&&step===0?'shiver':'breathe';
 const hero=element('hero','단추',`<image class="${heroClass}" href="art/button.webp" width="${h.w}" height="${h.h}" preserveAspectRatio="xMidYMid meet"/>`,h,dark);
 const objects=visible(s).map(o=>{let inner='';if(l.effect==='portrait'&&o.id==='portrait')inner=`transform="rotate(${done?180:s.count*90} 60 60)"`;
 const cls=o.type==='star'?'sparkle':'';return element(o.id,o.label,`<svg class="prop ${cls}" width="${o.w}" height="${o.h}" viewBox="0 0 120 120" overflow="visible" ${o.stretch?'preserveAspectRatio="none"':''}><g ${inner}>${prop(o.type,o.lit?1:uses(s,o.id))}</g></svg>`,o,dark&&!o.glow);}).join('');
 let effect=worn(h);
 if(l.effect==='untie'&&step>=1)effect+='<path d="M266 425q40 35 100-9" stroke="#a5b699" stroke-width="10" fill="none" pointer-events="none"/>';
 const overlay=(l.overlay||[]).filter(v=>(v.from??0)<=step&&step<(v.to??99)).map(v=>`<g pointer-events="none">${v.svg}</g>`).join('');
 const moodText=done?'좋아!':l.mood==='cold'&&step===0?'추워…':l.mood==='quiet'?'쉿…':l.mood==='sleepy'?'졸려…':'?';
 const conf=done?`<g class="confetti" fill="#fff1c0" stroke="none">${Array.from({length:9},(_,i)=>`<circle cx="${100+Math.sin(i*5)*75+100}" cy="${210+i*19}" r="${i%3+2}"/>`).join('')}</g>`:'';
 const thought=`<g class="thought" transform="translate(${Math.min(330,h.x+h.w*.85)} ${Math.max(30,h.y-4)})"><path d="M-5 0q18-16 37-4t11 28q-18 13-32 2L0 33l1-13q-19-6-6-20Z" fill="#fff4db" stroke="#d4bf9a" stroke-width="1"/><text x="19" y="15" text-anchor="middle">${moodText}</text></g>`;
 // once 단추 has travelled onto an object, draw it in front of that object
 const front=finished(s).some(r=>r.heroTo||r.kind==='move'&&r.item==='hero');
 scene.innerHTML=defs+`<image id="background" href="art/bedroom.webp" width="400" height="560" preserveAspectRatio="xMidYMid slice" ${dark?'style="filter:brightness(.3)"':''}/>${overlay}${front?'':hero}${objects}${front?hero:''}${effect}${thought}${guide(l,s)}${conf}`;
 if(l.night&&done)scene.insertAdjacentHTML('beforeend','<rect class="night-mask" width="400" height="560" fill="#183751" opacity=".18"/>');
}
function accessible(){const l=levels[current],s=states[current],objs=[{id:'hero',label:'단추'},...visible(s)];$('accessible-objects').innerHTML=objs.map(o=>`<button data-choose="${o.id}" class="${selected===o.id?'selected':''}">${o.label}</button>`).join('');const shift=parts(active(s)||{kind:'none'}).find(r=>r.kind==='shift');$('shift-button').hidden=!selected||shift?.item!==selected;$('selection').hidden=!selected;if(selected)$('selection').textContent=`${selected==='hero'?'단추':l.objects.find(o=>o.id===selected)?.label} 선택 · 사용할 곳을 눌러요`;}
function render(text){selected=null;const l=levels[current],s=states[current];$('chapter').textContent=chapters[l.chapter].title;$('total').textContent=`${cleared.filter(Boolean).length} / 30`;$('number').textContent=`STAGE ${String(l.id).padStart(2,'0')}`;$('goal').textContent=l.goal;$('continue').hidden=!complete(s);$('continue').textContent=current===29?'모험 다시 둘러보기 →':'다음 단계 →';$('tutorial').hidden=!(l.tutorial&&s.step===0);$('tutorial').textContent=l.tutorialText||'';say(text||(complete(s)?'잘 해결했어요!':'주변 물건을 끌어 서로 합쳐 보세요.'));draw();accessible();save();}
function showClear(){const l=levels[current];$('clear-tag').textContent=current===29?'오늘 밤의 모험, 끝':'잘했어요!';$('clear-title').textContent=current===29?'좋은 꿈 꿔, 단추.':'해결했어요!';$('clear-copy').textContent=l.steps.at(-1).done;$('next').textContent=current===29?'30개 장면 다시 둘러보기 →':'다음 단계 →';$('clear-dialog').showModal();}

// --- actions
function commit(a,r,heroFrom){states[current]=r.state;
 if(!r.changed){say(r.message);selected=null;draw();accessible();pulse(a.target||a.item,'nope');return;}
 if(complete(r.state))cleared[current]=true;render(r.message);ping(r.advanced);
 const to=heroRect();if(motion()&&heroFrom&&(heroFrom.x!==to.x||heroFrom.y!==to.y)){const el=node('hero');if(el)tween(el,{x:heroFrom.x,y:heroFrom.y},{x:to.x,y:to.y},600,()=>{},60);}
 pulse(a.kind==='move'?a.target:a.item,r.advanced?'pop':'tick');
 if(r.advanced&&complete(r.state)){if(motion()){busy=true;setTimeout(()=>{busy=false;showClear();},750);}else showClear();}}
function attempt(a,g=null){const r=dispatch(states[current],a),heroFrom=heroRect();
 if(!motion()||a.kind==='tap'){if(g)drop(g);commit(a,r,heroFrom);return;}
 g ||=lift(a.item);if(!g){commit(a,r,heroFrom);return;}
 const box=boxes().find(b=>b.id===a.item),t=boxes().find(b=>b.id===a.target);busy=true;
 const finish=()=>{drop(g);busy=false;commit(a,r,a.item==='hero'?g.last:heroFrom);};
 if(r.changed&&a.item==='hero'){g.last={x:g.from.x,y:g.from.y};finish();return;}
 if(r.changed&&a.kind==='move'&&t)tween(g.ghost,g.from,{x:t.x+t.w/2-box.w*.3,y:t.y+t.h/2-box.h*.3,s:.6},320,finish,30);
 else if(r.changed)tween(g.ghost,g.from,{x:g.from.x+90,y:g.from.y,s:1},260,finish);
 else tween(g.ghost,g.from,{x:box.x,y:box.y,s:1},240,finish);}
function movable(id){const l=levels[current],s=states[current];return l.steps.slice(s.step).flatMap(parts).some(r=>['move','shift'].includes(r.kind)&&r.item===id)||Object.keys(l.fail||{}).some(k=>k.startsWith(id+'>'));}
function choose(id){if(busy)return;const s=states[current],rule=active(s);if(!rule){say('다음 단계로 가 볼까요?');return;}
 if(selected){if(id===selected){selected=null;draw();accessible();return;}const item=selected;selected=null;draw();attempt({kind:'move',item,target:id});return;}
 const tapNow=parts(rule).some((r,i)=>r.kind==='tap'&&r.item===id&&!(rule.kind==='all'&&s.count>>i&1));
 if(!tapNow&&movable(id)){selected=id;draw();accessible();const shift=parts(rule).some(r=>r.kind==='shift'&&r.item===id);say(shift?'잡고 옆으로 치워 보세요.':'어디에 쓸까요? 사용할 곳을 눌러요.');return;}
 attempt({kind:'tap',item:id});}
scene.addEventListener('pointerdown',e=>{if(busy||e.button!==0)return;const el=e.target.closest('[data-id]');if(!el)return;const p=point(e);drag={id:el.dataset.id,el,start:p,pointer:e.pointerId,moved:false,ghost:null,base:boxes().find(o=>o.id===el.dataset.id)};scene.setPointerCapture(e.pointerId);});
scene.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(!drag.moved&&Math.hypot(dx,dy)<9)return;if(!drag.moved){drag.moved=true;drag.ghost=drag.el.cloneNode(true);drag.ghost.removeAttribute('data-id');drag.ghost.removeAttribute('tabindex');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.style.pointerEvents='none';scene.appendChild(drag.ghost);drag.el.style.opacity='.25';}drag.pos={x:drag.base.x+dx,y:drag.base.y+dy,s:1.06};drag.ghost.setAttribute('transform',`translate(${drag.pos.x} ${drag.pos.y}) scale(1.06)`);});
scene.addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag,p=point(e);drag=null;if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId);if(!d.moved){choose(d.id);return;}
 const distance=Math.hypot(p.x-d.start.x,p.y-d.start.y),shift=parts(active(states[current])||{kind:'none'}).some(r=>r.kind==='shift'&&r.item===d.id);selected=null;
 attempt(shift?{kind:'shift',item:d.id,distance}:{kind:'move',item:d.id,target:hit(p,d.id)||''},{ghost:d.ghost,el:d.el,from:d.pos});});
function cancelDrag(){if(!drag)return;drag.ghost?.remove();drag.el.style.opacity='';drag=null;}
scene.addEventListener('pointercancel',cancelDrag);scene.addEventListener('lostpointercapture',cancelDrag);scene.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const el=e.target.closest('[data-id]');if(el)choose(el.dataset.id);}if(e.key==='Escape'){selected=null;draw();accessible();}});
$('accessible-objects').onclick=e=>{const b=e.target.closest('[data-choose]');if(b)choose(b.dataset.choose);};$('shift-button').onclick=()=>{if(selected&&!busy){const item=selected;selected=null;attempt({kind:'shift',item,distance:60});}};$('hint').onclick=()=>{const s=states[current],r=active(s);if(!r){say('이미 해결한 장면이에요!');return;}s.hints++;say(r.hint);save();};$('reset').onclick=()=>{if(busy)return;cancelDrag();states[current]=fresh(current);render('처음부터 다시 살펴볼까요?');};
function next(){if(current===29){openMap();return;}if(!complete(states[current]))return;current++;render();window.scrollTo({top:0,behavior:'instant'});}
$('next').onclick=()=>{$('clear-dialog').close();next();};$('continue').onclick=next;
function openMap(){const max=maxOpen();$('map-content').innerHTML=chapters.map((c,ci)=>`<section class="map-chapter"><h3>${c.title}</h3><div class="map-nodes">${levels.filter(l=>l.chapter===ci).map(l=>`<button data-level="${l.id-1}" ${l.id-1>max?'disabled':''} class="${cleared[l.id-1]?'solved ':''}${l.id-1===current?'current':''}" aria-label="${l.id}단계 ${l.goal}${l.id-1>max?' 잠김':''}">${l.id-1>max?'·':cleared[l.id-1]?'✓':String(l.id).padStart(2,'0')}</button>`).join('')}</div></section>`).join('');$('save-note').textContent=storageOK?'이 브라우저에 진행을 자동 저장해요.':'현재 브라우저에서는 진행을 저장할 수 없어요.';$('map-dialog').showModal();}
$('map').onclick=openMap;$('home').onclick=e=>{e.preventDefault();openMap();};$('map-content').onclick=e=>{const b=e.target.closest('[data-level]');if(!b||b.disabled||Number(b.dataset.level)>maxOpen())return;current=Number(b.dataset.level);$('map-dialog').close();render();window.scrollTo({top:0,behavior:'instant'});};for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>$(b.dataset.close).close();$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ ON':'♪ OFF';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'효과음 끄기':'효과음 켜기');ping();};render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
