// Room furniture and props cut from the painted room and moved in place with spring physics.
// Coordinates are source pixels of a 1536×1024 room. Pivots are where the object touches or hangs.
import {BodyMotion} from './interaction-motion.js?v=110';

export const SEOUL_BODIES=[
 {id:'bed',kind:'squash',strength:.35,pivot:[420,940],points:[[0,515],[300,478],[560,500],[835,640],[800,700],[430,945],[0,830]]},
 {id:'pillow',kind:'squash',pivot:[170,515],points:[[86,437],[210,425],[221,430],[258,499],[247,504],[127,524],[120,518],[91,447]]},
 {id:'tote',kind:'squash',pivot:[520,585],points:[[425,450],[610,448],[634,598],[600,608],[452,578],[420,540]]},
 {id:'lamp',kind:'wobble',pivot:[234,395],points:[[195,300],[268,300],[262,350],[248,396],[220,396],[210,350]]},
 {id:'bedPlant',kind:'leaf',pivot:[310,392],points:[[210,212],[472,212],[462,330],[350,396],[270,396],[228,300]]},
 {id:'sillPlant',kind:'leaf',pivot:[458,430],points:[[414,344],[502,344],[496,433],[424,433]]},
 {id:'cardA',kind:'sway',strength:.6,pivot:[128,222],points:[[108,220],[148,220],[148,296],[108,296]]},
 {id:'cardB',kind:'sway',strength:.6,pivot:[170,286],points:[[152,284],[188,284],[188,336],[152,336]]},
 {id:'frame',kind:'sway',strength:.35,pivot:[38,44],points:[[0,38],[80,48],[80,288],[0,282]]},
 {id:'jacket',kind:'sway',pivot:[912,222],points:[[876,210],[940,210],[972,330],[986,470],[960,548],[850,548],[840,470],[856,330]]},
 {id:'ivy',kind:'leaf',pivot:[1012,95],points:[[914,18],[1092,18],[1092,112],[1012,122],[1002,302],[952,302],[914,140]]},
 {id:'shelfPlant',kind:'leaf',pivot:[1440,190],points:[[1364,108],[1482,108],[1472,302],[1394,302]]},
 {id:'tin',kind:'hop',strength:.5,pivot:[1144,95],points:[[1104,56],[1184,56],[1184,96],[1104,96]]},
 {id:'bowl',kind:'hop',strength:.5,pivot:[1252,92],points:[[1210,60],[1294,60],[1294,93],[1210,93]]},
 {id:'vase',kind:'rock',strength:.6,pivot:[1324,86],points:[[1298,8],[1352,8],[1352,87],[1298,87]]},
 {id:'desk',kind:'shake',links:[['mug',.7],['laptop',.45],['pencils',.8],['cube',.8],['deskPlant',.6]],pivot:[1250,770],points:[[970,440],[1100,436],[1500,446],[1536,452],[1536,532],[1500,530],[1498,772],[1478,772],[1468,526],[1082,516],[1084,706],[1060,706],[1000,700],[996,470],[970,466]]},
 {id:'mug',kind:'hop',pivot:[1088,440],points:[[1060,396],[1118,396],[1118,441],[1060,441]]},
 {id:'laptop',kind:'hop',strength:.5,pivot:[1185,448],points:[[1104,358],[1270,358],[1264,449],[1104,449]]},
 {id:'pencils',kind:'rock',pivot:[1346,442],points:[[1324,352],[1370,352],[1370,442],[1324,442]]},
 {id:'cube',kind:'hop',pivot:[1372,456],points:[[1348,412],[1396,412],[1396,457],[1348,457]]},
 {id:'deskPlant',kind:'leaf',pivot:[1420,446],points:[[1370,300],[1472,300],[1472,447],[1370,447]]},
 {id:'chair',kind:'rock',pivot:[1165,778],points:[[1030,446],[1226,452],[1230,560],[1300,575],[1292,640],[1302,782],[1280,782],[1270,662],[1214,652],[1200,782],[1184,782],[1170,652],[1060,642],[1046,752],[1028,752],[1040,600],[1034,500]]},
 {id:'suitcase',kind:'rock',pivot:[1390,752],points:[[1320,546],[1462,546],[1470,742],[1432,760],[1330,740],[1316,700]]},
 {id:'bin',kind:'rock',pivot:[1518,760],points:[[1498,618],[1536,618],[1536,762],[1500,762]]},
 // Hanji pendant lamp painted into the added ceiling rows (tools/bake_rooms.py).
 {id:'hanji',kind:'sway',strength:.8,pivot:[715,-126],points:[[705,-126],[725,-126],[730,-92],[775,-70],[782,0],[760,24],[670,24],[648,0],[655,-70],[700,-92]]}
];
export const TOKYO_BODIES=[
 {id:'lampLeft',kind:'sway',pivot:[200,0],points:[[186,0],[214,0],[214,40],[278,92],[276,108],[124,108],[124,92],[186,40]]},
 {id:'lampRight',kind:'sway',pivot:[1495,0],points:[[1482,0],[1508,0],[1508,24],[1536,40],[1536,74],[1432,74],[1440,40],[1482,24]]},
 {id:'vine',kind:'leaf',pivot:[540,20],points:[[458,0],[622,0],[612,120],[560,300],[520,300],[470,150]]},
 {id:'deskLamp',kind:'wobble',strength:.7,pivot:[490,372],points:[[426,226],[502,226],[506,358],[474,360],[426,286]]},
 {id:'board',kind:'sway',strength:.25,pivot:[255,128],points:[[172,126],[338,126],[338,282],[172,282]]},
 {id:'tote',kind:'sway',pivot:[553,494],points:[[528,472],[574,472],[612,556],[628,600],[626,754],[524,754],[522,600],[530,520]]},
 {id:'jacket',kind:'sway',pivot:[982,124],points:[[956,110],[1008,110],[1040,240],[1048,380],[1020,440],[944,440],[926,380],[936,240]]},
 {id:'floorPlant',kind:'leaf',pivot:[962,650],points:[[922,456],[1006,456],[1000,560],[992,652],[934,652],[928,560]]},
 {id:'shelfPlant',kind:'leaf',pivot:[874,644],points:[[826,536],[934,536],[920,646],[830,646]]},
 {id:'stool',kind:'rock',pivot:[1050,662],points:[[1000,460],[1106,460],[1108,520],[1100,662],[1080,662],[1060,560],[1036,560],[1014,662],[994,662],[1002,520]]},
 {id:'cameraA',kind:'hop',pivot:[742,402],points:[[700,348],[780,348],[780,403],[700,403]]},
 {id:'cameraB',kind:'hop',pivot:[664,288],points:[[628,244],[702,244],[702,289],[628,289]]},
 {id:'cameraC',kind:'hop',pivot:[778,176],points:[[742,130],[812,130],[812,177],[742,177]]},
 {id:'tealBox',kind:'shake',pivot:[680,646],points:[[620,574],[742,574],[742,648],[620,648]]},
 {id:'postcards',kind:'shake',strength:.5,pivot:[1440,900],points:[[1344,464],[1536,464],[1536,1024],[1344,1024]]},
 {id:'door',kind:'shake',strength:.6,pivot:[1200,840],points:[[1126,0],[1348,0],[1348,846],[1126,846]]},
 // Painted Japanese details (tools/bake_rooms.py); negative y reaches into the added ceiling rows.
 {id:'cat',kind:'wobble',pivot:[590,378],points:[[560,300],[620,300],[620,379],[560,379]]},
 {id:'lantern',kind:'sway',strength:.8,pivot:[1063,-8],points:[[1050,-8],[1076,-8],[1082,22],[1104,40],[1106,152],[1082,166],[1044,166],[1020,152],[1022,40],[1044,22]]},
 {id:'noren',kind:'sway',strength:.7,pivot:[1186,-6],points:[[1130,-6],[1242,-6],[1242,164],[1130,164]]},
 {id:'furin',kind:'sway',strength:1.2,pivot:[1445,-26],points:[[1430,-26],[1460,-26],[1478,-4],[1478,74],[1462,232],[1428,232],[1412,74],[1412,-4]]}
];

function pathOf(ctx,points,dx=0,dy=0){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x-dx,y-dy):ctx.moveTo(x-dx,y-dy));ctx.closePath();}
export function insidePolygon(points,x,y){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const boxOf=(points,pad)=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.floor(Math.min(...xs)-pad),y=Math.floor(Math.min(...ys)-pad);return {x,y,w:Math.ceil(Math.max(...xs)+pad)-x,h:Math.ceil(Math.max(...ys)+pad)-y};};

export class BodyLayer{
 constructor(defs,makeCanvas=()=>document.createElement('canvas'),offsetY=0){this.offsetY=offsetY;this.defs=defs;this.byId=new Map(defs.map(d=>[d.id,d]));this.motions=new Map();this.cache=new Map();this.makeCanvas=makeCanvas;this.queue=[];}
 // Topmost body under a source pixel (later entries are drawn in front).
 hit(x,y){for(let i=this.defs.length-1;i>=0;i--)if(insidePolygon(this.defs[i].points,x,y))return this.defs[i].id;return null;}
 impulse(id,x,strength=1){const d=this.byId.get(id);if(!d)return false;const motion=this.motions.get(id)||new BodyMotion(d.kind);const direction=x==null?1:(x<d.pivot[0]?1:-1);motion.impulse(direction,strength*(d.strength??1));this.motions.set(id,motion);
  // Things resting on a surface react a moment later and a little less.
  for(const [link,amount] of d.links||[])this.queue.push({id:link,at:.05+Math.random()*.06,strength:strength*amount,x});return true;}
 step(seconds){for(const q of this.queue)q.at-=seconds;for(const q of this.queue.filter(q=>q.at<=0))this.impulse(q.id,q.x,q.strength);this.queue=this.queue.filter(q=>q.at>0);for(const [id,m] of this.motions)if(!m.step(seconds))this.motions.delete(id);return this.active;}
 get active(){return this.motions.size>0||this.queue.length>0;}
 reset(){for(const p of this.cache.values()){p.sprite.width=p.fill.width=0;}this.cache.clear();}
 // Sprite: the object's own pixels. Fill: the surroundings pushed into the hole, so movement never shows a duplicate edge.
 parts(def,source){
  if(this.cache.has(def.id))return this.cache.get(def.id);
  const pad=16,b=boxOf(def.points,pad),sprite=this.makeCanvas(),fill=this.makeCanvas();sprite.width=fill.width=b.w;sprite.height=fill.height=b.h;
  const s=sprite.getContext('2d'),f=fill.getContext('2d');if(!s||!f)return null;
  const oy=this.offsetY;s.drawImage(source,b.x,b.y+oy,b.w,b.h,0,0,b.w,b.h);s.globalCompositeOperation='destination-in';pathOf(s,def.points,b.x,b.y);s.fillStyle='#000';s.fill();s.globalCompositeOperation='source-over';
  f.drawImage(source,b.x,b.y+oy,b.w,b.h,0,0,b.w,b.h);f.globalCompositeOperation='destination-out';pathOf(f,def.points,b.x,b.y);f.lineWidth=6;f.fill();f.stroke();
  // Push the surroundings into the hole by shrinking and re-enlarging (works without canvas filter support).
  const tmp=this.makeCanvas();f.globalCompositeOperation='destination-over';
  for(const k of [2,4,8,16,32]){const w=Math.max(1,Math.round(b.w/k)),h=Math.max(1,Math.round(b.h/k));tmp.width=w;tmp.height=h;const t=tmp.getContext('2d');if(!t)break;t.imageSmoothingEnabled=true;t.drawImage(fill,0,0,w,h);f.imageSmoothingEnabled=true;f.drawImage(tmp,0,0,w,h,0,0,b.w,b.h);f.drawImage(tmp,0,0,w,h,0,0,b.w,b.h);}
  // Whatever is still see-through gets the surroundings' average colour, so the original object can never show through.
  let px=null;try{px=f.getImageData(0,0,b.w,b.h).data;}catch{}// one read per object, cached afterwards
  if(px){let r=0,g=0,bl=0,n=0;for(let i=0;i<px.length;i+=16){const a=px[i+3];if(a>40){r+=px[i]*255/a;g+=px[i+1]*255/a;bl+=px[i+2]*255/a;n++;}}
   if(n){f.fillStyle=`rgb(${Math.round(Math.min(255,r/n))},${Math.round(Math.min(255,g/n))},${Math.round(Math.min(255,bl/n))})`;f.fillRect(0,0,b.w,b.h);}}
  tmp.width=tmp.height=0;
  // Keep the polygon plus a margin. The mask is built separately: two destination-in draws in a row would keep only their overlap.
  const mask=this.makeCanvas();mask.width=b.w;mask.height=b.h;const m=mask.getContext('2d');if(m){pathOf(m,def.points,b.x,b.y);m.fillStyle=m.strokeStyle='#000';m.lineWidth=14;m.lineJoin='round';m.fill();m.stroke();f.globalCompositeOperation='destination-in';f.drawImage(mask,0,0);}
  mask.width=mask.height=0;f.globalCompositeOperation='source-over';
  const part={sprite,fill,box:b};this.cache.set(def.id,part);return part;
 }
 // Draws moving bodies on top of an already painted room. Geometry maps source pixels to canvas pixels.
 draw(ctx,source,g){
  if(!this.motions.size)return;const scale=g.rw/1536;
  for(const def of this.defs){const motion=this.motions.get(def.id);if(!motion)continue;const part=this.parts(def,source);if(!part)continue;const {sprite,fill,box}=part,p=motion.pose,[px,py]=def.pivot;
   ctx.save();ctx.setTransform(scale,0,0,scale,g.tx,g.ty);ctx.drawImage(fill,box.x,box.y);
   // Hanging cloth bends from its hook and plants bend from the pot: thin slices shift more the further they are from the anchor.
   if(def.kind==='sway'||def.kind==='leaf'){const hang=def.kind==='sway',L=Math.max(1,hang?box.y+box.h-py:py-box.y);
    for(let y=0;y<box.h;y+=2){const sy=box.y+y,dd=hang?sy-py:py-sy;if(dd<=0){ctx.drawImage(sprite,0,y,box.w,2,box.x,sy,box.w,2);continue;}const u=dd/L;
     const off=hang?-(dd*Math.sin(p.angle)*.7+L*u*u*p.bend*.55):L*Math.pow(u,1.7)*(p.angle*.7+p.bend*.45),lift=hang?dd*(1-Math.cos(p.angle)):0;
     ctx.drawImage(sprite,0,y,box.w,2.6,box.x+off,sy-lift,box.w,2.6);}
    ctx.restore();continue;}
   ctx.translate(px+p.x,py+p.y);ctx.rotate(p.angle);ctx.scale(1+p.squash*.5,1-p.squash);ctx.translate(-px,-py);ctx.drawImage(sprite,box.x,box.y);ctx.restore();}
 }
}
