// 4-direction / 6-frame animal sheets. Existing avatar rig and saves stay authoritative.
export function createAnimalVisitors({project,findRoute,getState,redraw,announce,world,reduced=false,random=Math.random}){
 let animals=[],active=null,next=performance.now()+14000,index=0,last=0,paused=false,loadToken=0;
 const base=new URL('./art/animals/',import.meta.url);
 const ready=fetch(new URL('catalog.json',base)).then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(m=>{animals=m.animals;index=Math.floor(random()*animals.length);}).catch(()=>{animals=[];});
 function render(){if(!active)return null;const a=active,[x,y]=project(...a.cell),special=!!a.special&&(!a.walk||performance.now()<(a.greetingUntil||0)),frame=special?(performance.now()<(a.greetingUntil||0)?4:(a.phase%12>6?3:0)):a.walk?1+Math.floor(a.phase*8)%5:0,row=special?0:a.row,src=special?a.specialSrc:a.src,height=special?128:512;
 return{depth:a.cell[0]+a.cell[1]+.12,html:`<g id="animal-visitor" transform="translate(${x} ${y})"><title>${a.name} 친구</title><ellipse cy="1" rx="17" ry="5" fill="#63794b20"/><svg x="-40" y="-72" width="80" height="80" viewBox="${frame*128} ${row*128} 128 128" overflow="hidden" pointer-events="none"><image href="${src}" width="768" height="${height}" style="image-rendering:pixelated"/></svg><ellipse data-visitor="1" cx="0" cy="-27" rx="27" ry="31" fill="transparent" role="button" tabindex="0" aria-label="${a.name} 친구에게 인사하기"/></g>`};}
 async function spawn(t){if(!animals.length||active)return;const token=++loadToken,entry=animals[index++%animals.length],src=new URL(entry.sheet,base).href;
 try{const image=new Image();image.src=src;await image.decode();if(token!==loadToken)return;
 const state=getState(),starts=[[1,5],[6,1],[7,5],[5,7]];let path=[];
 for(const start of starts){for(const goal of [[5,6],[6,5],[2,6],[6,2]]){path=findRoute(state,start,goal);if(path.length>1)break;}if(path.length>1)break;}
 if(path.length<2){next=t+20000;return;}
 active={...entry,src,specialSrc:entry.special?new URL(entry.special,base).href:null,cell:[...path[0]],path,step:0,row:0,walk:false,phase:0,segment:null,waitUntil:0,leaving:false,origin:[...path[0]]};redraw();announce(entry.name+' 친구가 잠깐 놀러 왔어요.');
 }catch{next=t+20000;}}
 function tick(t,blocked=false){const dt=Math.min(.1,Math.max(0,(t-last)/1000));last=t;const nowPaused=blocked||document.hidden;
 if(nowPaused){if(active?.waitUntil)active.waitUntil+=dt*1000;next+=dt*1000;paused=true;return;}
 if(paused){paused=false;if(active?.segment)active.segment.start=t-active.segment.elapsed;}
 if(!active){if(t>=next){next=t+30000;spawn(t);}return;}
 const a=active;a.phase+=dt;
 if(a.waitUntil){if(t<a.waitUntil){const restingFrame=Math.floor(a.phase%12/6);if(restingFrame!==a.restingFrame){a.restingFrame=restingFrame;redraw();}return;}a.waitUntil=0;a.path=findRoute(getState(),a.cell,a.origin);a.step=0;a.leaving=true;if(a.path.length<2){active=null;next=t+25000;redraw();return;}}
 if(!a.segment){const dest=a.path[a.step+1];if(!dest){if(a.leaving){active=null;next=t+25000;}else{a.walk=false;a.waitUntil=t+12000;}redraw();return;}
 // Revalidate against furniture moved since a route was calculated.
 const route=findRoute(getState(),a.cell,dest);if(route.length!==2){active=null;next=t+18000;redraw();return;}
 const from=project(...a.cell),to=project(...dest),dx=to[0]-from[0],dy=to[1]-from[1];a.row=Math.abs(dx)>=Math.abs(dy)?dx<0?2:3:dy<0?1:0;a.walk=!reduced;a.segment={from,to,start:t,elapsed:0};redraw();}
 const s=a.segment;s.elapsed=t-s.start;const progress=Math.min(1,s.elapsed/(reduced?1100:900)),x=s.from[0]+(s.to[0]-s.from[0])*progress,y=s.from[1]+(s.to[1]-s.from[1])*progress,el=world.querySelector('#animal-visitor');
 if(el){el.setAttribute('transform',`translate(${Math.round(x)} ${Math.round(y)})`);const view=el.querySelector('svg'),special=!!a.special&&performance.now()<(a.greetingUntil||0),frame=special?4:a.walk?1+Math.floor(a.phase*8)%5:0;view?.setAttribute('viewBox',`${frame*128} ${special?0:a.row*128} 128 128`);const image=view?.querySelector('image');if(image){image.setAttribute('href',special?a.specialSrc:a.src);image.setAttribute('height',special?'128':'512');}}
 if(progress===1){a.cell=[...a.path[++a.step]];a.segment=null;redraw();}}
 function greet(){if(!active)return;active.greetingUntil=performance.now()+2000;redraw();announce(active.name+' 친구에게 반갑게 인사했어요.');}
 return{ready,render,tick,greet,get active(){return active;}};
}
