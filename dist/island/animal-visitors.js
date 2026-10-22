import{smoothRoute,lineClear}from'./movement.js?v=44';
import{terrainCells}from'./core.js?v=44';
import{paintCute}from'./cute.js?v=9';
// Cute pets and farm friends occasionally visit a walkable tile, rest, then wander off.
export function createAnimalVisitors({project,findRoute,getState,redraw,announce,world,reduced=false,random=Math.random,cells=terrainCells}){
 let animals=[],active=null,next=performance.now()+8000,index=0,last=0,paused=false,loadToken=0;
 const images=new Map(),base=new URL('./art/animals/',import.meta.url);
 async function imageFor(file){const url=new URL(file,base).href;if(images.has(url))return images.get(url);const i=new Image();i.src=url;await i.decode();images.set(url,i);if(images.size>16)images.delete(images.keys().next().value);return i;}
 const ready=fetch(new URL('catalog.json',base)).then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(m=>{animals=Array.isArray(m?.animals)?m.animals:[];index=Math.floor(random()*animals.length);}).catch(()=>{animals=[];});
 const canvasMark=(size=72)=>`<foreignObject x="${-size/2}" y="${-size+7}" width="${size}" height="${size}" pointer-events="none"><canvas xmlns="http://www.w3.org/1999/xhtml" data-animal-canvas="land" width="128" height="128" style="display:block;width:${size}px;height:${size}px;image-rendering:pixelated"></canvas></foreignObject>`;
 function render(){if(!active)return null;const seg=active.segment,progress=seg?Math.min(1,seg.elapsed/seg.duration):0,[x,y]=seg?[seg.from[0]+(seg.to[0]-seg.from[0])*progress,seg.from[1]+(seg.to[1]-seg.from[1])*progress]:project(...active.cell),depth=active.cell[0]+active.cell[1]+.12;return{depth,html:`<g id="animal-visitor" data-depth="${depth}" transform="translate(${x} ${y})"><title>${active.name} 친구</title>${canvasMark()}<ellipse data-visitor="1" cx="0" cy="-24" rx="24" ry="27" fill="transparent" role="button" tabindex="0" aria-label="${active.name} 친구에게 인사하기"/></g>`};}
 function paint(t){const a=active,canvas=world.querySelector('[data-animal-canvas="land"]');if(!a||!canvas)return;const special=!!a.specialImage&&(!a.walk||t<(a.greetingUntil||0));paintCute(canvas,special?a.specialImage:a.image,special?(t<(a.greetingUntil||0)?4:a.phase%12>6?3:0):a.walk?1+Math.floor(a.phase*8)%5:0,special?0:a.row,{time:a.phase,walking:a.walk,reduced});}
 // Pick a far-apart pair of reachable free tiles: arrive at one edge, rest near the middle.
 function plan(){const state=getState(),free=cells().filter(c=>findRoute(state,c,c).length);if(free.length<2)return[];const edge=[...free].sort((a,b)=>(b[0]+b[1])-(a[0]+a[1])),start=edge[Math.floor(random()*Math.min(4,edge.length))];const mid=free.reduce((m,c)=>[m[0]+c[0]/free.length,m[1]+c[1]/free.length],[0,0]);for(const goal of [...free].sort((a,b)=>Math.hypot(a[0]-mid[0],a[1]-mid[1])-Math.hypot(b[0]-mid[0],b[1]-mid[1]))){const path=findRoute(state,start,goal);if(path.length>1)return path;}return[];}
 async function spawn(t){if(!animals.length||active)return;const token=++loadToken,entry=animals[index++%animals.length];
 try{const image=await imageFor(entry.sheet),specialImage=entry.special?await imageFor(entry.special):null;if(token!==loadToken)return;let path=plan();if(path.length<2){next=t+20000;return;}
 path=smoothRoute(getState(),path);active={...entry,image,specialImage,cell:[...path[0]],path,step:0,row:0,walk:false,phase:0,segment:null,waitUntil:0,leaving:false,origin:[...path[0]]};redraw();announce(entry.name+' 친구가 잠깐 놀러 왔어요.');}catch{next=t+20000;}}
 function tick(t,blocked=false){const dt=Math.min(.1,Math.max(0,(t-last)/1000));last=t;if(blocked||globalThis.document?.hidden){if(active?.waitUntil)active.waitUntil+=dt*1000;next+=dt*1000;paused=true;return;}
 if(paused){paused=false;if(active?.segment)active.segment.start=t-active.segment.elapsed;}
 if(!active){if(t>=next){next=t+30000;spawn(t);}return;}
 const a=active;a.phase+=dt;paint(t);
 if(a.waitUntil){if(t<a.waitUntil)return;a.waitUntil=0;a.path=smoothRoute(getState(),findRoute(getState(),a.cell,a.origin));a.step=0;a.leaving=true;if(a.path.length<2){active=null;next=t+25000;redraw();return;}}
 if(!a.segment){const dest=a.path[a.step+1];if(!dest){if(a.leaving){active=null;next=t+25000;}else{a.walk=false;a.waitUntil=t+12000;}redraw();return;}if(!lineClear(getState(),a.cell,dest)){active=null;next=t+18000;redraw();return;}const from=project(...a.cell),to=project(...dest),dx=to[0]-from[0],dy=to[1]-from[1];a.row=Math.abs(dx)>=Math.abs(dy)?dx<0?2:3:dy<0?1:0;a.walk=!reduced;a.segment={from,to,start:t,elapsed:0,duration:Math.max(300,Math.hypot(dx,dy)/40*1000)};}
 const s=a.segment;s.elapsed=t-s.start;const p=Math.min(1,s.elapsed/s.duration),x=s.from[0]+(s.to[0]-s.from[0])*p,y=s.from[1]+(s.to[1]-s.from[1])*p;world.querySelector('#animal-visitor')?.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);if(p===1){a.cell=[...a.path[++a.step]];a.segment=null;}}
 function greet(){if(!active)return;active.greetingUntil=performance.now()+2000;announce(active.name+' 친구에게 반갑게 인사했어요.');}
 return{ready,render,tick,greet,get active(){return active;}};
}
