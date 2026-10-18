import {stageFit,innerGeometry,PLATE} from './view-gestures.js?v=121';
import {BodyLayer,SEOUL_BODIES} from './room-bodies.js?v=121';
import {paintMargins,featherEdges,releaseCanvases} from './room-frame.js?v=121';
export {releaseCanvases};
import {SceneSurface} from './scene-surface.js?v=121';
import {bound,frameReady} from './first-room-engine.js?v=121';
export const BOARD={width:800,height:1000};
export const ROOM_TARGETS={pillow:{x:.13,y:.46},drawer:{x:.88,y:.49},tin:{x:.745,y:.075},window:{x:.46,y:.23},lamp:{x:.16,y:.32},chair:{x:.76,y:.61},frame:{x:.025,y:.17},bin:{x:.985,y:.68}};
const round=(c,x,y,w,h,r=8)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
export function atlas(c,img,index,columns,rows,x,y,w,h){if(!img)return;const sw=img.width/columns,sh=img.height/rows;c.drawImage(img,index%columns*sw+5,Math.floor(index/columns)*sh+5,sw-10,sh-10,x,y,w,h);}
export function itemArt(c,assets,item,x,y,w,h){if(item==='film')atlas(c,assets.props,2,2,2,x,y,w,h);else atlas(c,assets.tools,0,4,4,x,y,w,h);}
export class ChapterRenderer{
 constructor(canvas,assets,makeCanvas=()=>document.createElement('canvas')){this.canvas=canvas;this.c=canvas.getContext('2d');this.assets=assets;this.room=makeCanvas();this.room.width=1536;this.room.height=1024;this.surface=new SceneSurface(this.room);this.bodies=new BodyLayer(SEOUL_BODIES,makeCanvas);for(const [key,value] of Object.entries({ 'seoul.webp':assets.room,'seoul-clean-v3.webp':assets.clean,'seoul-diffuse-v4.webp':assets.diffuse,'seoul-pillow-v3.webp':assets.bed,'seoul-drawer-v7.webp':assets.drawer}))this.surface.images.set('travel-art/'+key,value);}
 renderRoom(state,camera={x:.28,y:.5},overview=false,zoom=1){
  const c=this.c,w=this.canvas.width,h=this.canvas.height;c.clearRect(0,0,w,h);
  const surfaceKey=[state.shade,state.drawer].join('|');if(this.surfaceKey!==surfaceKey){this.surfaceKey=surfaceKey;this.surface.render({stage:0,flags:{},world:{},positions:{window:{progress:state.shade},drawer:{progress:state.drawer}}},0);this.bodies.reset();}
  // The taller plate (ceiling and close floor) frames the original room, which stays in its own coordinates.
  const plate=this.assets.plate,g=stageFit(w,h,camera,zoom,overview,plate?PLATE.height:1024),inner=plate?innerGeometry(g,PLATE.top):g,{tx,ty,rw,rh}=inner;
  // One room image, one coordinate space. Overview margins are a solid matte, never another room.
  c.fillStyle='#c6bea8';c.fillRect(0,0,w,h);const frame=plate||this.room;paintMargins(c,frame,g);if(plate)c.drawImage(plate,g.tx,g.ty,g.rw,g.rh);
  c.drawImage(this.room,tx,ty,rw,rh);this.bodies.draw(c,this.room,inner);featherEdges(c,frame,g);this.plate=g;if(state.lampOff){c.fillStyle=`rgba(20,30,23,${state.shade>.85?.75:.25})`;c.fillRect(0,0,w,h);}this.geometry={tx,ty,rw,rh,w,h};
 }
 roomPoint(x,y){const g=this.geometry;return {x:(x-g.tx)/g.rw,y:(y-g.ty)/g.rh};}
 renderFocus(type,state,ui={}){
  const c=this.c,w=this.canvas.width,h=this.canvas.height;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#b3ab94');shade.addColorStop(1,'#888775');c.fillStyle=shade;c.fillRect(0,0,w,h);
  const v=ui.focusView||{scale:1,x:0,y:0},base=(type==='drawer'||type==='chair'?Math.max(w/800,h/1000):Math.min(w/800,h/1000)),scale=base*v.scale,tx=(w-800*scale)/2+v.x*w/Math.max(1,ui.cssWidth||w),ty=(h-1000*scale)/2+v.y*h/Math.max(1,ui.cssHeight||h);this.focusGeometry={scale,tx,ty};c.setTransform(scale,0,0,scale,tx,ty);
  const pv=ui.preview||{};this.speed=pv.velocity||0;this.moving=pv.object;
  if(type==='pillow')this.pillow(state,ui);if(type==='drawer')this.drawer(state,ui);if(type==='tin')this.tin(state,ui);if(type==='camera')this.camera(state,ui);if(type==='photo')this.photo(state,ui);if(type==='chair')this.chair(state);if(type==='frame')this.frame(state);if(type==='bin')this.bin(state);
  c.setTransform(1,0,0,1,0,0);
 }
 pillow(s){const c=this.c,p=s.pillow;c.drawImage(this.assets.bed,0,280,650,744,0,0,800,1000);
  c.save();c.translate(380,550);c.rotate(-.14);c.shadowColor='#3b302b33';c.shadowBlur=5;c.fillStyle='#ece1c7';c.fillRect(-112,-80,224,160);c.shadowBlur=0;c.fillStyle='#847558';c.font='italic 20px Georgia';c.fillText('Yun · Seoul',-80,-30);c.font='19px system-ui';c.fillText('필름은 햇빛을 싫어해.',-90,13);c.fillText('선반 위 초록 틴에.',-90,45);c.restore();
  // Lift lags behind the hand and the pillow flattens a little as it lands.
  const v=this.moving==='pillow'?this.speed:0,land=p<.18?bound(Math.abs(v)/5)*(1-p/.18):0;
  c.save();c.translate(400+130*p,470-300*p+8*land);c.rotate(-.13-.08*p+bound(v*.025,-.08,.08));c.scale(1+.05*land,1-.08*land);c.shadowColor='#302a2455';c.shadowBlur=8+18*p;c.shadowOffsetY=4+20*p;c.drawImage(this.assets.pillow,-330,-220,660,440);c.restore();
 }
 plate(image,zoom=1){const c=this.c,iw=image.width,ih=image.height,ratio=800/1000;let sw=iw,sh=ih;if(iw/ih>ratio)sw=ih*ratio;else sh=iw/ratio;sw/=zoom;sh/=zoom;c.drawImage(image,(iw-sw)/2,(ih-sh)/2,sw,sh,0,0,800,1000);}
 drawer(s,showChair=true){const c=this.c,p=s.drawer;this.plate(this.assets.station);
  // Drawer rails stay in one fixed desk opening; the tray extends towards the player.
  const x=100,y=358,w=600,depth=230*p,front=y+depth;
  c.save();c.fillStyle='#30271e';c.fillRect(x,y,w,100);c.restore();
  if(p>0){c.save();c.beginPath();c.rect(x,y,w,depth+2);c.clip();c.drawImage(this.assets.interior,0,125,1536,605,x,y+depth-230,w,230);
   // The loose camera slides a little against the tray's motion before friction catches it.
   const slide=this.moving==='drawer'?bound(-this.speed*9,-14,14):0;
   if(!s.camera){c.save();c.translate(455,y+depth-95+slide);c.rotate(-.1+slide*.002);c.shadowColor='#362d2255';c.shadowBlur=6;itemArt(c,this.assets,'camera',-110,-73,220,146);c.restore();}c.restore();
   c.fillStyle='#745435';c.beginPath();c.moveTo(x,y);c.lineTo(x+12,y+depth);c.lineTo(x+12,y+depth+60);c.lineTo(x,y+60);c.fill();c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w-12,y+depth);c.lineTo(x+w-12,y+depth+60);c.lineTo(x+w,y+60);c.fill();
  }
  c.save();c.shadowColor='#33271d55';c.shadowBlur=5;c.shadowOffsetY=4;c.drawImage(this.assets.interior,90,790,1350,165,x,front,w,100);c.restore();if(showChair)this.drawChair({...s,chair:Math.max(s.chair,bound(p*4))},true);
 }
 chair(s){this.drawer(s,false);this.drawChair(s);}
 drawChair(s,aside=false){const c=this.c,p=s.chair;const tilt=this.moving==='chair'?bound(this.speed*.03,-.05,.05):0;c.save();c.translate(385-(aside?280:50)*p,630+(aside?110:80)*p);c.rotate(-.035*p+tilt);c.shadowColor='#372d2255';c.shadowBlur=14;c.shadowOffsetY=9;c.drawImage(this.assets.seat,-180,-260,360,520);c.restore();}
 frame(s){this.plate(this.assets.frame,1+.025*s.frame);}
 bin(s){this.plate(this.assets.bin,1+.12*s.bin);}
 tin(s){const c=this.c,p=s.lid;
  c.save();c.shadowColor='#1f211844';c.shadowBlur=20;c.shadowOffsetY=10;atlas(c,this.assets.props,0,2,2,85,270,630,630);c.restore();
  if(!s.film){c.save();c.translate(395,575);c.rotate(-.18);atlas(c,this.assets.props,2,2,2,-100,-100,200,200);c.restore();}
  const lag=this.moving==='lid'?bound(this.speed*.04,-.12,.12):0;c.save();c.translate(400-125*p,530-220*p);c.rotate(-.12-.35*p+lag);c.shadowColor='#20261944';c.shadowBlur=8+15*p;c.shadowOffsetY=5+20*p;atlas(c,this.assets.props,1,2,2,-315,-315,630,630);c.restore();
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
