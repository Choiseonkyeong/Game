// Chapter 2 · Tokyo photo shop. Swing the tote until the claim ticket slips out, find envelope 27 in the counter
// drawer, read the negative on the lightbox under the desk lamp, print the good frame and pin it on the photo board.
import {stageFit,innerGeometry,PLATE,pinchStart,pinchTransform,constrainFocus} from './view-gestures.js?v=110';
import {Spring,MATERIALS,FollowValue} from './interaction-motion.js?v=110';
import {BodyLayer,TOKYO_BODIES,insidePolygon} from './room-bodies.js?v=110';
import {paintMargins,featherEdges,softDraw,releaseCanvases} from './room-frame.js?v=110';
import {initialTokyo,restoreTokyo,tokyoAction,tokyoInventory,tokyoHint,failText,TOKYO_SAVE,CHAPTER_KEY,GOOD_FRAME} from './tokyo-engine.js?v=110';
import {FIRST_SAVE} from './first-room-engine.js?v=110';
const bound=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const legacy=document.getElementById('game');if(legacy)legacy.hidden=true;
const host=document.createElement('little-travel-chapter');document.body.append(host);const root=host.attachShadow({mode:'open'});
root.innerHTML=`<link rel="stylesheet" href="first-room.css?v=110"><main class="screen"><div class="room"><canvas id="room" aria-label="도쿄의 작은 사진관, 밀어서 둘러보고 물건을 만져 보세요" tabindex="0"></canvas></div><header class="header"><button id="menu" aria-label="메뉴">≡</button><div class="heading"><small>TOKYO · ミナミ写真館</small><h1>사진관의 맡김표</h1></div><button id="hint" aria-label="힌트">?</button></header><div class="nav"><button id="left" aria-label="왼쪽 보기">‹</button><button id="right" aria-label="오른쪽 보기">›</button></div><section class="focus" id="focus"><canvas id="board" tabindex="0" aria-label="물건 가까이 살펴보기"></canvas><div class="focus-title" id="focus-title"></div><button class="focus-hint" id="focus-hint" aria-label="힌트">?</button><button class="back" id="back" aria-label="가게로 돌아가기">×</button></section><section class="dock empty" id="dock" aria-label="소지품"><span class="empty-icon" id="empty">▱</span><div class="inventory" id="inventory"></div></section><div class="toast" id="toast" role="status"></div><div class="flash" id="flash"></div><div class="overlay" id="overlay" hidden></div><div class="loading" id="loading">Tokyo is getting ready…</div></main>`;
const $=id=>root.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{localStorage.setItem(CHAPTER_KEY,'tokyo');}catch{}
let state;try{state=restoreTokyo(JSON.parse(localStorage.getItem(TOKYO_SAVE)||'null'));}catch{state=initialTokyo();}
let seoulPhoto=null;try{seoulPhoto=JSON.parse(localStorage.getItem(FIRST_SAVE)||'null')?.photo||null;}catch{}

// Source-pixel regions of tokyo.webp.
const AREAS={
 drawer:[[0,552],[488,552],[488,690],[0,700]],
 lightbox:[[340,360],[610,360],[610,402],[340,402]],
 board:[[172,126],[338,126],[338,282],[172,282]]
};
const RECEIPT=[[506,900],[628,900],[628,1004],[506,1004]],FURIN='furin',TICKET_REST={x:642,y:806},POCKET={x:590,y:640},PIN={x:256,y:150},ENVELOPES=[{n:12,x:160},{n:27,x:400},{n:31,x:640}];

const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;if(image.decode)image.decode().then(()=>resolve(image),()=>{});});
// The taller shop plate carries the painted Japanese details; T converts original room rows to plate rows.
const T=PLATE.top;
const assets=await Promise.all([load('travel-art/tokyo-tall-v10.webp?v=110'),load('travel-art/drawer-interior-v7.webp'),load('travel-art/seoul.webp'),load('travel-art/tokyo-papers-v10.webp?v=110')]).then(([room,interior,seoul,papers])=>({room,interior,seoul,papers})).catch(()=>null);
if(!assets){$('loading').textContent='그림을 불러오지 못했어요. 화면을 새로고침해 주세요.';throw Error('Tokyo assets could not load');}
if(seoulPhoto)assets.photo=await load(seoulPhoto).catch(()=>null);

// --- drawing helpers
const round=(c,x,y,w,h,r=8)=>{c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h);};
function photoSource(c,x,y,w,h){if(assets.photo)c.drawImage(assets.photo,x,y,w,h);else c.drawImage(assets.seoul,650,40,460,350,x,y,w,h);}
function framePositive(c,frame,x,y,w,h){
 c.save();round(c,x,y,w,h,2);c.clip();
 if(frame===1){const gr=c.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#fffdf4');gr.addColorStop(1,'#f2dcc0');c.fillStyle=gr;c.fillRect(x,y,w,h);}
 else if(frame===2){const t=document.createElement('canvas');t.width=w;t.height=h;photoSource(t.getContext('2d'),0,0,w,h);softDraw(c,t,0,0,w,h,x,y,w,h,5,'shake');c.globalAlpha=.45;softDraw(c,t,0,0,w,h,x+w*.06,y-h*.03,w,h,5,'shake');t.width=0;}
 else if(frame===3)photoSource(c,x,y,w,h);
 else{c.fillStyle='#14100c';c.fillRect(x,y,w,h);}
 c.restore();
}
// Paper clues come from the painted sprite sheet (tools/bake_rooms.py) so they share the room's grain and light.
const SPRITE={ticket:[4,4,232,142],env:n=>[8+[12,27,31].indexOf(n)*300,160,292,376],strip:[8,560,1000,272],paper:[8,860,300,236]};
function sprite(c,[sx,sy,sw,sh],x,y,w,h){c.drawImage(assets.papers,sx,sy,sw,sh,x,y,w,h);}
function ticketArt(c,x,y,w,h,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.shadowColor='#2c241855';c.shadowBlur=Math.max(2,w*.08);c.shadowOffsetY=Math.max(1,h*.06);sprite(c,SPRITE.ticket,-w/2,-h/2,w,h);c.restore();}
function negativeArt(c,x,y,w,h){c.save();c.shadowColor='#2c241844';c.shadowBlur=3;sprite(c,SPRITE.strip,x,y,w,h);c.restore();}
function printArt(c,x,y,w,h,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.shadowColor='#2b231944';c.shadowBlur=6;c.shadowOffsetY=3;sprite(c,SPRITE.paper,-w/2,-h/2,w,h);c.shadowColor='transparent';photoSource(c,-w/2+w*.06,-h/2+h*.06,w*.88,h*.7);c.restore();}
function itemArt(c,item,x,y,w,h){if(item==='ticket')ticketArt(c,x+w/2,y+h/2,w*.78,h*.74,-.08);else if(item==='negative')negativeArt(c,x+w*.04,y+h*.28,w*.92,h*.44);else printArt(c,x+w/2,y+h/2,w*.62,h*.86,.05);}
function negativeLook(c,x,y,w,h){c.save();c.globalCompositeOperation='difference';c.fillStyle='#fff';c.fillRect(x,y,w,h);c.globalCompositeOperation='multiply';c.fillStyle='#e0904c';c.fillRect(x,y,w,h);c.restore();}

class TokyoRenderer{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.bodies=new BodyLayer(TOKYO_BODIES,undefined,T);}
 // The shop image is drawn straight to the screen. A hidden full-size canvas can silently stay blank on iPhones.
 overlays(c,s){const d=s.drawer;
  if(d>0){c.save();c.beginPath();AREAS.drawer.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();const gr=c.createLinearGradient(0,552,0,700);gr.addColorStop(0,'#2b2117');gr.addColorStop(1,'#5b4630');c.fillStyle=gr;c.fillRect(0,552,488,150);c.restore();
   // The drawer front comes forward and down along the counter's perspective.
   c.save();c.shadowColor='#2b211855';c.shadowBlur=10*d;c.shadowOffsetY=6*d;c.drawImage(assets.room,0,552+T,488,140,-10*d,552+30*d,488*(1+.05*d),140*(1+.05*d));c.restore();}
  if(s.lampOn){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(468,330,10,468,360,240);g.addColorStop(0,'#ffe3a055');g.addColorStop(1,'#ffe3a000');c.fillStyle=g;c.fillRect(220,200,500,260);c.beginPath();c.moveTo(452,282);c.lineTo(486,282);c.lineTo(590,388);c.lineTo(350,388);c.closePath();const cone=c.createLinearGradient(0,282,0,388);cone.addColorStop(0,'#fff0c044');cone.addColorStop(1,'#fff0c010');c.fillStyle=cone;c.fill();c.restore();}}
 renderRoom(s,ui){const c=this.c,w=this.canvas.width,h=this.canvas.height,view=ui.preview?{...s,drawer:ui.preview.value}:s,room=assets.room;
  const plate=stageFit(w,h,ui.camera,ui.overview?1:ui.zoom,ui.overview,PLATE.height),g=innerGeometry(plate,T);this.plate=plate;this.geometry=g;c.setTransform(1,0,0,1,0,0);c.fillStyle='#d3c8ae';c.fillRect(0,0,w,h);paintMargins(c,room,plate,'#d3c8ae');c.drawImage(room,plate.tx,plate.ty,plate.rw,plate.rh);
  const k=g.rw/1536;c.save();c.setTransform(k,0,0,k,g.tx,g.ty);this.overlays(c,view);c.restore();this.bodies.draw(c,room,g);
  c.save();c.setTransform(k,0,0,k,g.tx,g.ty);
  if(s.pinned){const a=ui.pinSwing?.value||0;c.save();c.translate(PIN.x,PIN.y);c.rotate(-.05+a);printArt(c,0,44,84,98,0);c.fillStyle='#c4573f';c.beginPath();c.arc(0,0,5,0,7);c.fill();c.restore();}
  if(ui.ticketFall)ticketArt(c,ui.ticketFall.x,ui.ticketFall.y,46,30,ui.ticketFall.a);else if(s.dropped&&!s.ticket)ticketArt(c,TICKET_REST.x,TICKET_REST.y,46,30,.42);
  if(!s.dropped&&!ui.ticketFall){const t=this.bodies.motions.get('tote')?.pose.angle||0;c.save();c.translate(553,494);c.rotate(t);c.translate(-553,-494);c.fillStyle='#f3ead2';c.fillRect(POCKET.x-14,POCKET.y-26,26,12);c.restore();}
  c.restore();featherEdges(c,room,plate);}
 roomPoint(x,y){const g=this.geometry;return {x:(x-g.tx)/g.rw*1536,y:(y-g.ty)/g.rh*1024};}
 renderFocus(type,s,ui){const c=this.c,w=this.canvas.width,h=this.canvas.height;c.setTransform(1,0,0,1,0,0);c.fillStyle='#8f8a76';c.fillRect(0,0,w,h);
  const v=ui.focusView,scale=Math.min(w/800,h/1000)*v.scale,tx=(w-800*scale)/2+v.x*w/Math.max(1,ui.cssWidth||w),ty=(h-1000*scale)/2+v.y*h/Math.max(1,ui.cssHeight||h);this.focusGeometry={scale,tx,ty};c.setTransform(scale,0,0,scale,tx,ty);
  if(type==='drawer')this.drawer(ui.preview?.object==='drawer'?{...s,drawer:ui.preview.value}:s,ui);else this.lightbox(s,ui);c.setTransform(1,0,0,1,0,0);}
 focusPoint(x,y){const g=this.focusGeometry;return {x:(x-g.tx)/g.scale,y:(y-g.ty)/g.scale};}
 // Counter drawer: the tray slides out of a fixed opening; envelopes ride inside it.
 drawer(s,ui){const c=this.c,d=s.drawer,k=800/560,top=(552-320)*k,depth=300*d,speed=ui.preview?.object==='drawer'?ui.preview.velocity||0:0;
  c.drawImage(assets.room,0,320+T,560,700,0,0,800,1000);
  c.fillStyle='#241b13';c.fillRect(0,top,488*k,140*k);
  if(d>0){c.save();c.beginPath();c.rect(0,top,488*k,depth+6);c.clip();c.drawImage(assets.interior,0,125,1536,605,0,top+depth-300,488*k,300);
   const slide=bound(-speed*10,-16,16);
   for(const e of ENVELOPES){if(e.n===27&&s.negative)continue;const lift=ui.lift?.n===e.n?ui.lift.spring.value:0,x=e.x,y=top+depth-235+slide+lift;c.save();c.translate(x,y+95);c.rotate((e.n-27)*.004);c.shadowColor='#2a201555';c.shadowBlur=8;c.shadowOffsetY=4;sprite(c,SPRITE.env(e.n),-74,-95,148,190);c.restore();}
   c.restore();
   c.fillStyle='#5d4630';c.beginPath();c.moveTo(0,top);c.lineTo(14,top+depth);c.lineTo(14,top+depth+40);c.lineTo(0,top+40);c.fill();}
  c.save();c.shadowColor='#2b211866';c.shadowBlur=8+10*d;c.shadowOffsetY=4+8*d;c.drawImage(assets.room,0,552+T,488,140,-8*d,top+depth,488*k*(1+.04*d),140*k*(1+.04*d));c.restore();}
 // Lightbox under the desk lamp: the negative shows its true picture only through the loupe and only in light.
 lightbox(s,ui){const c=this.c,on=s.lampOn;c.drawImage(assets.room,290,180+T,420,525,0,0,800,1000);c.fillStyle='#00000033';c.fillRect(0,0,800,1000);
  c.save();c.shadowColor=on?'#ffe7b0aa':'#0006';c.shadowBlur=on?40:10;c.fillStyle=on?'#fbf3dc':'#5e5a4f';round(c,60,540,680,300,14);c.fill();c.restore();
  if(!s.negative)return;sprite(c,SPRITE.strip,70,600,660,180);if(!on){c.fillStyle='#0009';c.fillRect(70,600,660,180);}
  for(let f=1;f<=4;f++){const x=FRAME_X(f),y=634;framePositive(c,f,x,y,150,112);negativeLook(c,x,y,150,112);if(!on){c.fillStyle='#000a';c.fillRect(x,y,150,112);}c.fillStyle=on?'#f2dfb9':'#8c7a5a';c.font='13px Georgia';c.fillText(String(f),x+4,y+128);}
  const L=ui.loupe;c.save();c.beginPath();c.arc(L.x,L.y,92,0,7);c.clip();c.fillStyle=on?'#fbf3dc':'#35322b';c.fillRect(L.x-92,L.y-92,184,184);
  if(on){c.translate(L.x,L.y);c.scale(1.6,1.6);c.translate(-L.x,-L.y);sprite(c,SPRITE.strip,70,600,660,180);for(let f=1;f<=4;f++)framePositive(c,f,FRAME_X(f),634,150,112);}
  c.restore();c.save();c.strokeStyle='#2d2a24';c.lineWidth=12;c.beginPath();c.arc(L.x,L.y,96,0,7);c.stroke();c.strokeStyle='#e8e2cf88';c.lineWidth=2;c.beginPath();c.arc(L.x-20,L.y-24,70,3.6,4.6);c.stroke();c.lineWidth=20;c.lineCap='round';c.strokeStyle='#2d2a24';c.beginPath();c.moveTo(L.x+70,L.y+70);c.lineTo(L.x+130,L.y+130);c.stroke();c.restore();}
}
const FRAME_X=f=>95+(f-1)*160;
const frameAt=p=>{for(let f=1;f<=4;f++)if(p.x>=FRAME_X(f)&&p.x<=FRAME_X(f)+150&&p.y>=620&&p.y<=760)return f;return 0;};

const roomRenderer=new TokyoRenderer($('room')),focusRenderer=new TokyoRenderer($('board'));focusRenderer.bodies=roomRenderer.bodies;
const ui={focus:null,camera:{x:.42,y:.45},zoom:1,overview:false,focusView:{scale:1,x:0,y:0},preview:null,drag:null,busy:false,sound:false,frame:0,loupe:{x:400,y:420},lift:null,ticketFall:null,pinSwing:null,selected:null};
function save(){try{localStorage.setItem(TOKYO_SAVE,JSON.stringify(state));}catch{toast('이 기기에 저장하지 못했어요. 지금은 계속 플레이할 수 있어요.');}}
function apply(event){const r=tokyoAction(state,event);if(r.ok||r.state!==state){state=r.state;save();}return r;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('on');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('on'),2600);}
let audio;function sound(kind='tap'){if(!ui.sound)return;try{audio??=new AudioContext();audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=kind==='shutter'?'triangle':'sine';o.frequency.setValueAtTime({pickup:720,knock:110,soft:220,paper:900,shutter:140,chime:1760}[kind]||340,t);o.frequency.exponentialRampToValueAtTime(kind==='pickup'?1100:kind==='chime'?1700:80,t+.13);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+(kind==='chime'?1.2:.18));o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+(kind==='chime'?1.25:.2));}catch{}}
const wait=ms=>new Promise(r=>setTimeout(r,reduced?0:ms));
let last=0;
function draw(){const now=performance.now(),dt=last?Math.max(.001,Math.min(.05,(now-last)/1000)):.016;last=now;ui.frame=0;let live=false;
 if(roomRenderer.bodies.active){roomRenderer.bodies.step(dt);live=true;checkSwing();}
 if(ui.pinSwing){ui.pinSwing.step(dt);if(ui.pinSwing.resting)ui.pinSwing=null;else live=true;}
 if(ui.lift){ui.lift.spring.step(dt);if(ui.lift.spring.resting&&!ui.lift.hold)ui.lift=null;else live=true;}
 if(ui.drag?.follow){ui.preview={object:'drawer',value:ui.drag.follow.step(dt),velocity:ui.drag.follow.velocity};if(!ui.drag.follow.resting)live=true;}
 if(ui.ticketFall)live=stepTicket(dt)||live;
 roomRenderer.renderRoom(state,ui);if(ui.focus){ui.cssWidth=host.clientWidth;ui.cssHeight=host.clientHeight;focusRenderer.renderFocus(ui.focus,state,ui);}
 if(live)invalidate();}
function invalidate(){if(!ui.frame)ui.frame=requestAnimationFrame(draw);}
function resize(){const dpr=Math.min(devicePixelRatio||1,1.5),r=host.getBoundingClientRect();for(const id of ['room','board']){$(id).width=Math.round(r.width*dpr);$(id).height=Math.round(r.height*dpr);}invalidate();}
function inventory(){const items=tokyoInventory(state);$('empty').hidden=!!items.length;$('dock').classList.toggle('empty',!items.length);$('inventory').innerHTML=items.map(item=>`<button data-item="${item}" class="${ui.selected===item?'selected':''}" aria-label="${{ticket:'맡김표',negative:'네거티브 필름',print:'인화한 사진'}[item]}"><canvas width="128" height="86"></canvas><span>${{ticket:'맡김표 27',negative:'네거티브',print:'서울의 사진'}[item]}</span></button>`).join('');for(const b of $('inventory').querySelectorAll('button'))itemArt(b.querySelector('canvas').getContext('2d'),b.dataset.item,0,0,128,86);}

// --- tote swing and falling ticket (simple rigid-body fall with floor bounce)
function checkSwing(){if(state.dropped||ui.ticketFall)return;const m=roomRenderer.bodies.motions.get('tote');if(!m)return;const a=m.pose.angle;if(Math.abs(a)<.17)return;const r=apply({type:'drop',swing:a});if(!r.ok)return;
 const av=m.springs.angle.velocity,arm=146;ui.ticketFall={x:553+Math.sin(a)*arm+30,y:494+Math.cos(a)*arm,vx:av*arm*.9+(a>0?-40:40),vy:-120,a:a,va:av*3,bounces:0};sound('paper');invalidate();}
function stepTicket(dt){const t=ui.ticketFall;t.vy+=2400*dt;t.x+=t.vx*dt;t.y+=t.vy*dt;t.a+=t.va*dt;t.vx*=.995;
 if(t.y>=TICKET_REST.y){t.y=TICKET_REST.y;if(Math.abs(t.vy)>160&&t.bounces<2){t.vy*=-.28;t.va*=.4;t.bounces++;sound('paper');}else{t.vy=0;t.vx*=.8;t.va=(.42-t.a)*4;if(Math.abs(t.vx)<6){ui.ticketFall=null;return false;}}}
 t.x+=(TICKET_REST.x-t.x)*Math.min(1,dt*3*(t.y>=TICKET_REST.y-1?1:0));return true;}

async function animate(duration,render){if(reduced){render(1);draw();return;}await new Promise(resolve=>{const start=performance.now();function frame(now){const t=bound((now-start)/duration);render(1-Math.pow(1-t,3));draw();if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});}
async function moveDrawer(target,velocity=0){const spring=new Spring(ui.preview?.object==='drawer'?ui.preview.value:state.drawer,{...MATERIALS.drawer,min:0,max:1});spring.velocity=velocity;spring.set(target);ui.busy=true;
 if(!reduced)await new Promise(resolve=>{const start=performance.now();let lastT=start;function frame(now){spring.step((now-lastT)/1000);lastT=now;ui.preview={object:'drawer',value:spring.value,velocity:spring.velocity};if(spring.impact>.6)sound('knock');draw();if(spring.resting||now-start>1100)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);});
 apply({type:'move',object:'drawer',value:target});ui.preview=null;ui.busy=false;invalidate();}
async function flyToDock(item,from){const r=$('dock').getBoundingClientRect(),to={x:r.left+r.width/2,y:r.top+r.height/2},el=document.createElement('div');el.className='flight';el.innerHTML='<canvas width="128" height="104"></canvas>';itemArt(el.querySelector('canvas').getContext('2d'),item,0,0,128,104);root.append(el);
 await animate(600,t=>{const arc=Math.sin(t*Math.PI)*75;el.style.transform=`translate(${from.x+(to.x-from.x)*t-32}px,${from.y+(to.y-from.y)*t-arc-26}px) scale(${1+.15*Math.sin(t*Math.PI)})`;});el.remove();inventory();$('dock').classList.add('landing');setTimeout(()=>$('dock').classList.remove('landing'),360);sound('pickup');}
async function focus(type){if(ui.busy)return;ui.drag=null;ui.preview=null;ui.focus=type;ui.focusView={scale:1,x:0,y:0};ui.loupe={x:400,y:420};root.querySelector('.header').classList.add('in-detail');$('focus-title').textContent=type==='drawer'?'카운터 · 맡긴 봉투 서랍':'스탠드 아래 · 라이트박스';invalidate();$('focus').classList.add('open');}
async function back(){if(ui.busy)return;ui.drag=null;ui.preview=null;$('focus').classList.remove('open');await wait(260);ui.focus=null;root.querySelector('.header').classList.remove('in-detail');invalidate();}
// The printed picture: the player's own Seoul shot when it exists, otherwise Yun's Namsan frame.
function printImage(){try{const c=document.createElement('canvas');c.width=920;c.height=700;photoSource(c.getContext('2d'),0,0,920,700);return c.toDataURL('image/jpeg',.82);}catch{return '';}}
function overlay(html){$('overlay').innerHTML=html;$('overlay').hidden=false;}
function result(){overlay(`<article class="card"><small>THE SECOND PAGE · TOKYO</small><h2>두 번째 장이 생겼어요.</h2><div class="result-photo"><img src="${printImage()}" alt="도쿄 사진관에서 인화한 서울의 사진"><span>Printed in Tokyo.</span></div><button class="primary" data-action="return">사진관 더 둘러보기</button><p class="chapter-end">두 번째 장 완료 · 세 번째 장은 준비 중이에요.</p><a class="primary quiet" href="?chapter=seoul">첫 장 · 서울 다시 보기</a></article>`);}
function menu(){overlay(`<article class="card"><small>A LITTLE TRAVEL JOURNAL</small><h2>두 번째 장 · 도쿄</h2><div class="menu-list"><button data-action="resume">계속 둘러보기</button><button data-action="sound">소리 ${ui.sound?'끄기':'켜기'}</button><button data-action="overview">가게 전체 보기</button>${state.done?'<button data-action="result">두 번째 장 보기</button>':''}<a href="?chapter=seoul">첫 장 · 서울</a><a href="?mode=legacy">이전 여행책 열기</a></div><p class="version">0.11.0 · 東京タワーの見える写真館<br>각 장의 진행은 이 기기에 따로 저장됩니다.</p></article>`);}

async function pin(){if(ui.busy||!state.print)return;ui.busy=true;ui.selected=null;const g=roomRenderer.geometry,dpr=$('room').width/host.clientWidth,r=$('dock').getBoundingClientRect(),from={x:r.left+r.width/2,y:r.top},to={x:(g.tx+PIN.x/1536*g.rw)/dpr,y:(g.ty+(PIN.y+44)/1024*g.rh)/dpr},el=document.createElement('div');el.className='flight';el.innerHTML='<canvas width="128" height="104"></canvas>';itemArt(el.querySelector('canvas').getContext('2d'),'print',0,0,128,104);root.append(el);
 await animate(650,t=>{const arc=Math.sin(t*Math.PI)*60;el.style.transform=`translate(${from.x+(to.x-from.x)*t-32}px,${from.y+(to.y-from.y)*t-arc-26}px) rotate(${(1-t)*12}deg)`;});el.remove();
 apply({type:'pin'});inventory();ui.pinSwing=new Spring(0,{stiffness:30,damping:1.8,rest:.002}).kick(.9);roomRenderer.bodies.impulse('board',PIN.x+30,.6);sound('knock');ui.busy=false;invalidate();await wait(1700);result();}

root.addEventListener('click',async e=>{if(ui.busy)return;const b=e.target.closest('button');if(!b)return;
 if(b.dataset.item){const item=b.dataset.item;if(item==='negative'){await focus('lightbox');}else if(item==='print'){ui.selected=ui.selected==='print'?null:'print';inventory();if(ui.selected)toast('사진을 붙일 곳을 눌러요.');}else overlay('<article class="card"><small>CLAIM TICKET</small><h2>맡김표 No. 27</h2><p>필름 1롤 · 현상과 인화<br>“봉투 번호를 확인해 주세요.”</p><button class="primary" data-action="resume">닫기</button></article>');return;}
 const action=b.dataset.action;if(action){if(action==='resume'||action==='return')$('overlay').hidden=true;if(action==='start'){apply({type:'start'});$('overlay').hidden=true;}if(action==='sound'){ui.sound=!ui.sound;sound();menu();}if(action==='overview'){$('overlay').hidden=true;await back();ui.overview=!ui.overview;invalidate();}if(action==='result')result();return;}
 if(b.id==='menu')menu();if(b.id==='hint'||b.id==='focus-hint')toast(tokyoHint(state));if(b.id==='back')await back();
 if(b.id==='left'||b.id==='right'){const from=ui.camera.x,to=bound(from+(b.id==='left'?-.3:.3),.05,.95);await animate(420,t=>ui.camera.x=from+(to-from)*t);}
});
function canvasPoint(canvas,event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height};}
const roomHit=(p)=>insidePolygon(RECEIPT,p.x,p.y)?'receipt':state.dropped&&!state.ticket&&!ui.ticketFall&&Math.hypot(p.x-TICKET_REST.x,p.y-TICKET_REST.y)<55?'ticket':insidePolygon(TOKYO_BODIES.find(b=>b.id==='tote').points,p.x,p.y)?'tote':insidePolygon(TOKYO_BODIES.find(b=>b.id==='deskLamp').points,p.x,p.y)?'lamp':insidePolygon(AREAS.lightbox,p.x,p.y)?'lightbox':insidePolygon(AREAS.board,p.x,p.y)?'board':insidePolygon(AREAS.drawer,p.x,p.y)?'drawer':null;
$('room').addEventListener('pointerdown',e=>{if(ui.busy||ui.focus)return;const c=canvasPoint($('room'),e),p=roomRenderer.roomPoint(c.x,c.y);ui.drag={id:e.pointerId,type:'room',x:e.clientX,y:e.clientY,start:{...ui.camera},target:roomHit(p),p,moved:false};$('room').setPointerCapture?.(e.pointerId);});
$('room').addEventListener('pointermove',e=>{const d=ui.drag;if(!d||d.type!=='room'||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>7)d.moved=true;if(!d.moved)return;e.preventDefault?.();
 // Grabbing the tote pulls it sideways on its hook; letting go lets it swing.
 if(d.target==='tote'){const m=roomRenderer.bodies.motions.get('tote')||(roomRenderer.bodies.impulse('tote',null,0),roomRenderer.bodies.motions.get('tote'));m.springs.angle.set(bound(-dx/260,-.42,.42));d.holding=true;}
 else{ui.overview=false;const g=roomRenderer.plate,dpr=$('room').width/host.clientWidth;ui.camera.x=bound(d.start.x-dx*dpr/g.rw,.05,.95);ui.camera.y=bound(d.start.y-dy*dpr/g.rh,.05,.95);}invalidate();});
$('room').addEventListener('pointerup',async e=>{const d=ui.drag;ui.drag=null;if(!d||d.id!==e.pointerId)return;
 if(d.holding){const m=roomRenderer.bodies.motions.get('tote');if(m)m.springs.angle.set(0);sound('soft');invalidate();return;}if(d.moved){invalidate();return;}
 if(ui.overview){ui.overview=false;ui.camera.x=bound(d.p.x/1536,.05,.95);invalidate();return;}
 const t=d.target,body=t==='lamp'?'deskLamp':t==='board'?'board':t==='drawer'?null:t==='tote'?'tote':t?null:roomRenderer.bodies.hit(d.p.x,d.p.y);
 if(body&&roomRenderer.bodies.impulse(body,d.p.x,body==='tote'?2.4:1)){sound(body===FURIN?'chime':['tote','jacket','vine','noren','lantern'].includes(body)?'soft':'knock');invalidate();}
 if(t==='ticket'){const g=roomRenderer.geometry,dpr=$('room').width/host.clientWidth;if(apply({type:'take',item:'ticket'}).ok){ui.busy=true;await flyToDock('ticket',{x:(g.tx+TICKET_REST.x/1536*g.rw)/dpr,y:(g.ty+TICKET_REST.y/1024*g.rh)/dpr});ui.busy=false;invalidate();}}
 else if(t==='lamp'){apply({type:'lamp'});sound();invalidate();}
 else if(t==='lightbox'){ui.busy=true;await wait(150);ui.busy=false;await focus('lightbox');}
 else if(t==='drawer'){roomRenderer.bodies.impulse('tealBox',d.p.x,.4);ui.busy=true;await wait(150);ui.busy=false;await focus('drawer');}
 else if(t==='board'&&ui.selected==='print')await pin();
 else if(t==='receipt'){sound('paper');overlay(`<article class="card clue"><small>RECEIPT · レシート</small><div class="receipt"><b>ミナミ写真館</b><span>現像 1本 ¥800</span><span>プリント 1枚 ¥400</span><em>◎ 3コマ目 ピント良好</em><span>合計 ¥1,200</span></div><p>카운터 모서리에 떨어진 영수증.<br>“3번째 컷, 초점 좋음”이라고 적혀 있어요.</p><button class="primary" data-action="resume">닫기</button></article>`);}
 else if(body===FURIN){await wait(260);overlay(`<article class="card clue"><small>FŪRIN · 風鈴の短冊</small><div class="tanzaku">お預り証は<br>鞄の外へ</div><p>창가 풍경에 매달린 종이 띠.<br>“맡김표는 가방 바깥(주머니)에.”</p><button class="primary" data-action="resume">닫기</button></article>`);}
});
$('room').addEventListener('pointercancel',()=>{ui.drag=null;invalidate();});
const boardPoint=e=>{const p=canvasPoint($('board'),e);return focusRenderer.focusPoint(p.x,p.y);};
$('board').addEventListener('pointerdown',e=>{if(ui.busy||!ui.focus)return;const p=boardPoint(e);const onLoupe=ui.focus==='lightbox'&&Math.hypot(p.x-ui.loupe.x,p.y-ui.loupe.y)<110,onDrawer=ui.focus==='drawer'&&p.y>(552-320)*800/560+300*state.drawer-40;
 ui.drag={id:e.pointerId,type:ui.focus,x:e.clientX,y:e.clientY,p,loupe:{...ui.loupe},onLoupe,onDrawer,start:state.drawer,follow:ui.focus==='drawer'?new FollowValue(state.drawer):null,viewStart:{...ui.focusView},moved:false,speed:0};$('board').setPointerCapture?.(e.pointerId);});
$('board').addEventListener('pointermove',e=>{const d=ui.drag;if(!d||d.type==='room'||d.id!==e.pointerId)return;const p=boardPoint(e),dx=p.x-d.p.x,dy=p.y-d.p.y;if(Math.hypot(dx,dy)>9)d.moved=true;if(!d.moved)return;e.preventDefault?.();
 if(d.onLoupe){ui.loupe={x:bound(d.loupe.x+dx,60,740),y:bound(d.loupe.y+dy,120,900)};}
 else if(d.type==='drawer'&&d.onDrawer){const target=bound(d.start+dy/300),now=performance.now();if(d.sample){const dt=Math.max(.008,(now-d.sample.t)/1000);d.speed=d.speed*.4+.6*(target-d.sample.v)/dt;}d.sample={t:now,v:target};d.follow.set(target);}
 else if(ui.focusView.scale>1.02){ui.focusView=constrainFocus({...d.viewStart,x:d.viewStart.x+e.clientX-d.x,y:d.viewStart.y+e.clientY-d.y},host.clientWidth,host.clientHeight);}invalidate();});
$('board').addEventListener('pointerup',async e=>{const d=ui.drag;ui.drag=null;if(!d||d.id!==e.pointerId)return;const p=boardPoint(e);
 if(d.moved){if(d.type==='drawer'&&d.onDrawer&&ui.preview){const s=d.speed||0;await moveDrawer(Math.abs(s)>1.6?(s>0?1:0):d.follow.target,Math.abs(s)>1.6?s*.6:d.follow.velocity);sound();}else if(d.onLoupe)sound('soft');invalidate();return;}
 if(d.type==='drawer'){const k=800/560,top=(552-320)*k+300*state.drawer-235,env=state.drawer>=.7?ENVELOPES.find(en=>Math.abs(p.x-en.x)<72&&p.y>top&&p.y<top+190):null;
  if(env&&!(env.n===27&&state.negative)){const r=tokyoAction(state,{type:'take',item:'negative',envelope:env.n});
   ui.lift={n:env.n,spring:new Spring(0,{stiffness:160,damping:11,rest:.3}).kick(-420)};sound('paper');invalidate();
   if(r.ok){ui.busy=true;await wait(220);apply({type:'take',item:'negative',envelope:env.n});ui.lift=null;await flyToDock('negative',{x:e.clientX,y:e.clientY});ui.busy=false;toast('봉투 안에 네거티브 필름이 들어 있어요.');}else toast(failText[r.reason]||'');invalidate();}
  else await moveDrawer(state.drawer>.5?0:1);}
 if(d.type==='lightbox'){if(!state.negative){toast(state.lampOn?'라이트박스예요. 비춰 볼 필름이 필요해요.':'불이 꺼진 라이트박스예요.');return;}const f=frameAt(d.onLoupe?ui.loupe:p);if(!f)return;const r=apply({type:'print',frame:f});
  if(r.ok){ui.busy=true;sound('shutter');$('flash').classList.add('go');await wait(420);$('flash').classList.remove('go');await flyToDock('print',{x:e.clientX,y:e.clientY});ui.busy=false;await back();toast('인화한 사진을 벽 사진 보드에 붙여 볼까요?');}else toast(failText[r.reason]||'');invalidate();}
});
$('board').addEventListener('pointercancel',()=>{ui.drag=null;invalidate();});
// Two-finger zoom for the shop and close-ups; the anchor stays under the fingers and no object is touched meanwhile.
const fingers={room:new Map(),board:new Map()},pinches={room:null,board:null},blocked={room:false,board:false};
for(const id of ['room','board']){const canvas=$(id),points=fingers[id];
 canvas.addEventListener('pointerdown',e=>{if(ui.busy)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){e.preventDefault?.();e.stopImmediatePropagation?.();ui.drag=null;blocked[id]=true;const [a,b]=[...points.values()];if(id==='room'){const g=roomRenderer.plate,dpr=canvas.width/host.clientWidth;pinches[id]=pinchStart(a,b,{scale:ui.overview?1:ui.zoom,x:g.tx/dpr,y:g.ty/dpr});ui.overview=false;}else pinches[id]=pinchStart(a,b,{scale:ui.focusView.scale,x:ui.focusView.x+(1-ui.focusView.scale)*host.clientWidth/2,y:ui.focusView.y+(1-ui.focusView.scale)*host.clientHeight/2});}},true);
 canvas.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!blocked[id])return;e.preventDefault?.();e.stopImmediatePropagation?.();if(points.size<2)return;const [a,b]=[...points.values()],v=pinchTransform(pinches[id],a,b,1,id==='room'?3.2:2.8);if(id==='room'){ui.zoom=v.scale;const g=stageFit(host.clientWidth,host.clientHeight,ui.camera,ui.zoom,false,PLATE.height);ui.camera={x:bound((host.clientWidth/2-v.x)/g.rw,.05,.95),y:bound((host.clientHeight/2-v.y)/g.rh,.05,.95)};}else ui.focusView=constrainFocus({scale:v.scale,x:v.x-(1-v.scale)*host.clientWidth/2,y:v.y-(1-v.scale)*host.clientHeight/2},host.clientWidth,host.clientHeight);invalidate();},true);
 const end=e=>{points.delete(e.pointerId);if(!blocked[id])return;e.preventDefault?.();e.stopImmediatePropagation?.();ui.drag=null;if(points.size===0){blocked[id]=false;pinches[id]=null;}invalidate();};canvas.addEventListener('pointerup',end,true);canvas.addEventListener('pointercancel',end,true);
 canvas.addEventListener('wheel',e=>{e.preventDefault?.();if(ui.busy)return;const factor=Math.exp(-e.deltaY*.0015);if(id==='room')ui.zoom=bound(ui.zoom*factor,1,3.2);else ui.focusView=constrainFocus({...ui.focusView,scale:bound(ui.focusView.scale*factor,1,2.8)},host.clientWidth,host.clientHeight);invalidate();},{passive:false});
}
$('room').addEventListener('keydown',e=>{const shift={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];if(shift){e.preventDefault();ui.camera.x=bound(ui.camera.x+shift[0],.05,.95);ui.camera.y=bound(ui.camera.y+shift[1],.05,.95);invalidate();}});
$('board').addEventListener('keydown',async e=>{if(ui.busy||!ui.focus)return;if(e.key==='Escape'){e.preventDefault();await back();}else if(ui.focus==='drawer'&&['ArrowUp','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();await moveDrawer(e.key==='ArrowDown'||((e.key==='Enter'||e.key===' ')&&state.drawer<.5)?1:0);}});
window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>{roomRenderer.bodies.reset();releaseCanvases([$('room'),$('board')]);});window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});inventory();resize();$('loading').classList.add('loaded');setTimeout(()=>$('loading').remove(),500);
if(!state.started)overlay(`<article class="card"><small>02 · 東京 · 下町の写真館</small><h2>사진관의 맡김표</h2><p>${seoulPhoto?'서울에서 찍은 필름을':'윤이 맡긴 필름을'} 찾아<br>사진으로 인화해요.</p><button class="primary" data-action="start">사진관 둘러보기</button></article>`);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=110',{updateViaCache:'none'}).catch(()=>{});
export {GOOD_FRAME};
