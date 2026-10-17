import {SceneSurface} from './scene-surface.js?v=080';
import {bound,frameReady} from './first-room-engine.js?v=080';
export const BOARD={width:800,height:1000};
export const ROOM_TARGETS={pillow:{x:.13,y:.46},drawer:{x:.88,y:.49},tin:{x:.745,y:.075},window:{x:.46,y:.23},lamp:{x:.16,y:.32}};
const round=(c,x,y,w,h,r=8)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
export function atlas(c,img,index,columns,rows,x,y,w,h){if(!img)return;const sw=img.width/columns,sh=img.height/rows;c.drawImage(img,index%columns*sw+5,Math.floor(index/columns)*sh+5,sw-10,sh-10,x,y,w,h);}
export function itemArt(c,assets,item,x,y,w,h){if(item==='film')atlas(c,assets.props,2,2,2,x,y,w,h);else atlas(c,assets.tools,0,4,4,x,y,w,h);}
export class ChapterRenderer{
 constructor(canvas,assets,makeCanvas=()=>document.createElement('canvas')){this.canvas=canvas;this.c=canvas.getContext('2d');this.assets=assets;this.room=makeCanvas();this.room.width=1536;this.room.height=1024;this.surface=new SceneSurface(this.room);for(const [key,value] of Object.entries({ 'seoul.webp':assets.room,'seoul-clean-v3.webp':assets.clean,'seoul-diffuse-v4.webp':assets.diffuse,'seoul-pillow-v3.webp':assets.bed,'seoul-drawer-v7.webp':assets.drawer}))this.surface.images.set('travel-art/'+key,value);}
 renderRoom(state,camera={x:.28,y:.5},overview=false){
  const c=this.c,w=this.canvas.width,h=this.canvas.height;c.clearRect(0,0,w,h);
  this.surface.render({stage:0,flags:{},world:{},positions:{window:{progress:state.shade},drawer:{progress:state.drawer}}},0);
  const inset=80*Math.min(w/390,2),available=Math.max(200,h-inset*2),scale=overview?Math.min(w/1536,available/1024):Math.max(w/1536,available/1024)*1.1,rw=1536*scale,rh=1024*scale,tx=rw<=w?(w-rw)/2:bound(w/2-camera.x*rw,w-rw,0),ty=inset+(rh<=available?(available-rh)/2:bound(available/2-camera.y*rh,available-rh,0));
  c.fillStyle='#b4ab96';c.fillRect(0,0,w,h);c.save();c.filter=overview?'blur(22px) brightness(.65)':'blur(18px)';c.drawImage(this.assets.room,-20,-20,w+40,h+40);c.restore();
  c.drawImage(this.room,tx,ty,rw,rh);if(state.lampOff){c.fillStyle=`rgba(20,30,23,${state.shade>.85?.75:.25})`;c.fillRect(0,0,w,h);}this.geometry={tx,ty,rw,rh,w,h};
 }
 roomPoint(x,y){const g=this.geometry;return {x:(x-g.tx)/g.rw,y:(y-g.ty)/g.rh};}
 renderFocus(type,state,ui={}){
  const c=this.c;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.canvas.width,this.canvas.height);const scale=Math.min(this.canvas.width/800,this.canvas.height/1000),tx=(this.canvas.width-800*scale)/2,ty=(this.canvas.height-1000*scale)/2;this.focusGeometry={scale,tx,ty};c.setTransform(scale,0,0,scale,tx,ty);
  if(type==='pillow')this.pillow(state,ui);if(type==='drawer')this.drawer(state,ui);if(type==='tin')this.tin(state,ui);if(type==='camera')this.camera(state,ui);if(type==='photo')this.photo(state,ui);
  c.setTransform(1,0,0,1,0,0);
 }
 pillow(s){const c=this.c,p=s.pillow;c.drawImage(this.assets.bed,0,280,650,744,0,0,800,1000);
  c.save();c.translate(380,550);c.rotate(-.14);c.shadowColor='#3b302b33';c.shadowBlur=5;c.fillStyle='#ece1c7';c.fillRect(-112,-80,224,160);c.shadowBlur=0;c.fillStyle='#847558';c.font='italic 20px Georgia';c.fillText('Yun · Seoul',-80,-30);c.font='19px system-ui';c.fillText('필름은 햇빛을 싫어해.',-90,13);c.fillText('선반 위 초록 틴에.',-90,45);c.restore();
  c.save();c.translate(400+130*p,470-300*p);c.rotate(-.13-.08*p);c.shadowColor='#302a2455';c.shadowBlur=8+18*p;c.shadowOffsetY=4+20*p;c.drawImage(this.assets.pillow,-330,-220,660,440);c.restore();
 }
 drawer(s){const c=this.c,p=s.drawer,y=225,edge=y+540*p;
  c.save();c.filter='blur(8px) brightness(.75)';c.drawImage(this.assets.room,1060,350,476,674,-30,-30,860,1060);c.restore();
  c.save();c.beginPath();c.rect(-30,y,860,540*p+5);c.clip();c.drawImage(this.assets.interior,0,0,1536,740,-45,y,890,540);
  if(!s.camera){c.save();c.translate(455,535);c.rotate(-.1);c.shadowColor='#362d2244';c.shadowBlur=8;itemArt(c,this.assets,'camera',-160,-106,320,212);c.restore();}
  c.restore();
  // The front lip stays attached to the growing tray, rather than floating over the room.
  c.save();c.shadowColor='#33271d44';c.shadowBlur=7;c.shadowOffsetY=4;c.drawImage(this.assets.interior,90,790,1350,165,-35,edge,870,108);c.restore();
 }
 tin(s){const c=this.c,p=s.lid;
  c.save();c.shadowColor='#1f211844';c.shadowBlur=20;c.shadowOffsetY=10;atlas(c,this.assets.props,0,2,2,85,270,630,630);c.restore();
  if(!s.film){c.save();c.translate(395,575);c.rotate(-.18);atlas(c,this.assets.props,2,2,2,-100,-100,200,200);c.restore();}
  c.save();c.translate(400-125*p,530-220*p);c.rotate(-.12-.35*p);c.shadowColor='#20261944';c.shadowBlur=8+15*p;c.shadowOffsetY=5+20*p;atlas(c,this.assets.props,1,2,2,-315,-315,630,630);c.restore();
 }
 camera(s,ui){const c=this.c,p=ui.loadProgress||0;
  c.save();c.shadowColor='#22251c44';c.shadowBlur=20;c.shadowOffsetY=12;atlas(c,this.assets.props,3,2,2,15,175,770,770);c.restore();
  if(s.film&&!s.loaded){const from=ui.filmDrag||{x:575,y:785},x=from.x+(295-from.x)*p,y=from.y+(520-from.y)*p; c.save();c.translate(x,y);c.rotate(-.12*(1-p));atlas(c,this.assets.props,2,2,2,-90,-90,180,180);c.restore();}
  if(p>.3){c.save();c.globalAlpha=bound((p-.3)*2);c.fillStyle='#4c3424';c.fillRect(320,497,210*bound((p-.3)*2),44);c.fillStyle='#b29b66';for(let x=325;x<320+210*bound((p-.3)*2);x+=17){c.fillRect(x,499,7,4);c.fillRect(x,534,7,4);}c.restore();}
 }
 photo(s,ui){const c=this.c,aim=ui.aim||{x:.56,y:.2},crop=this.photoCrop(aim);c.save();round(c,35,200,730,555,5);c.clip();c.drawImage(this.assets.room,...crop,35,200,730,555);c.restore();
  if(s.shade>.75||s.lampOff){c.fillStyle='#1c271baa';c.fillRect(35,200,730,555);}
  const ready=frameReady(s,aim);c.strokeStyle=ready?'#e0d6a3':'#f7f3ddaa';c.lineWidth=2;c.beginPath();for(const [x,y,sx,sy]of[[65,230,1,1],[735,230,-1,1],[65,725,1,-1],[735,725,-1,-1]]){c.moveTo(x+28*sx,y);c.lineTo(x,y);c.lineTo(x,y+28*sy);}c.stroke();c.strokeRect(365,443,70,70);c.fillStyle='#f3edd9';c.font='17px Georgia';c.fillText('ISO 200   ·   1/125',55,788);c.textAlign='right';c.fillText(ready?'●':'○',745,788);c.textAlign='left';
 }
 focusPoint(x,y){const g=this.focusGeometry;return {x:(x-g.tx)/g.scale,y:(y-g.ty)/g.scale};}
 photoCrop(aim){return [bound(aim.x*1536-230,0,1076),bound(aim.y*1024-175,0,674),460,350];}
 capture(aim,makeCanvas=()=>document.createElement('canvas')){const c=makeCanvas();c.width=920;c.height=700;c.getContext('2d').drawImage(this.assets.room,...this.photoCrop(aim),0,0,920,700);return c.toDataURL('image/jpeg',.82);}
}
