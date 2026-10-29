import{WALK_SPEED,walkingSpeed}from'./movement.js?v=55';
import{walkingView}from'./locomotion.js?v=30';
import{humanMarkup,paintHumans}from'./human-sprites.js?v=57';
import{patchSvg}from'./dom-render.js?v=5';
// Geometry measured from the approved 960×800 cottage plate.
export const ROOM_LAYOUT={bed:[45,145,165,255],avatarScale:1.8};
export function roomTarget(x,y){return[Math.max(220,Math.min(810,x)),Math.max(448,Math.min(690,y))];}
export function createRoom({world,announce,onChange}){
 let inside=false,pos=[570,610],goal=null,last=0,face=1,back=false,sleeping=false,heading=0,walkClock=0,speed=0,keyWalking=false;
 function markup(){return `<rect x="-3000" y="-3000" width="6000" height="6000" fill="#e9dcc1"/><image href="art/world/cottage-room.webp" width="960" height="800" preserveAspectRatio="none"/><path data-room-floor="1" d="M200 430H835V716H200Z" fill="transparent" role="button" tabindex="0" aria-label="방 안 걸어가기"/><rect data-bed="1" x="${ROOM_LAYOUT.bed[0]}" y="${ROOM_LAYOUT.bed[1]}" width="${ROOM_LAYOUT.bed[2]}" height="${ROOM_LAYOUT.bed[3]}" fill="transparent" role="button" tabindex="0" aria-label="침대에서 쉬기"/><g id="room-person" transform="translate(${pos[0]} ${pos[1]})"><g transform="scale(${ROOM_LAYOUT.avatarScale})">${humanMarkup()}</g></g><g data-exit="1" role="button" tabindex="0" aria-label="섬으로 나가기"><rect x="403" y="717" width="154" height="48" rx="16" fill="#fff9e8" stroke="#a68b70" stroke-width="2"/><text x="480" y="748" text-anchor="middle" font-size="20" fill="#715d4e">섬으로 나가기</text></g>`;}
 function render(){patchSvg(world,markup());paintHumans(world,{preview:true});}
 function enter(){inside=true;sleeping=false;pos=[570,610];goal=null;last=0;speed=0;onChange();announce('우리 집에 들어왔어요. 바닥을 눌러 걷거나 침대에서 쉬어 보세요.');}
 function leave(){inside=false;goal=null;speed=0;onChange();announce('다시 포근섬으로 나왔어요.');}
 function pick(target,x,y){if(target.closest('[data-exit]'))return leave();if(target.closest('[data-bed]')){goal=[235,448];face=-1;sleeping=true;announce('폭신한 침대 곁에서 잠깐 쉬어요.');return;}if(target.closest('[data-room-floor]')){goal=roomTarget(x,y);sleeping=false;}}
 function tick(t,keys=[0,0]){const dt=last?Math.min(.04,(t-last)/1000):0;last=t;if(!inside)return;let moving=false;const keyboard=keys[0]||keys[1];if(keyWalking&&!keyboard){goal=null;speed=0;}keyWalking=!!keyboard;if(keyboard){goal=roomTarget(pos[0]+keys[0]*80,pos[1]+keys[1]*80);sleeping=false;}if(goal){const dx=goal[0]-pos[0],dy=goal[1]-pos[1],d=Math.hypot(dx,dy),before=speed;speed=walkingSpeed(speed,d,dt);const step=d<.15?d:(before+speed)*.5*dt;heading=walkingView(dx,dy,heading);walkClock+=Math.min(step,d)/WALK_SPEED;face=dx<0?-1:1;back=dy<0&&Math.abs(dy)>Math.abs(dx);if(d<=step){pos=[...goal];goal=null;speed=0;}else{pos[0]+=dx/d*step;pos[1]+=dy/d*step;moving=true;}}world.querySelector('#room-person')?.setAttribute('transform',`translate(${pos[0]} ${pos[1]})`);paintHumans(world,{pose:moving?'walk':sleeping?'sit':'idle',face,back,heading,time:walkClock,gaitAmount:speed/WALK_SPEED});}
 return{render,enter,leave,pick,tick,get inside(){return inside;}};
}

