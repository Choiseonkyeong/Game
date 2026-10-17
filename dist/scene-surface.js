// Isolated material layers: move cloth pixels, never the room underneath.
export const clamp=v=>Math.max(0,Math.min(1,v));
export const sceneProgress=(s,a)=>s.positions?.[a]?.progress??(s.world?.[a]?1:0);
export const foldBlend=p=>{p=clamp(p);return p*p*(3-2*p);};
export const sunlightGain=(sun,ambient)=>Math.max(.25,Math.min(1.02,(ambient+5)/(sun+5)));
const W=1536,H=1024;
// Fixed back seam. The front hem rolls towards it while every fabric sample remains opaque.
export function clothSample(x,y,progress){
 const p=clamp(progress),seam=580-.025*x,t=clamp((y-seam)/370);
 return {x:x+9*p*Math.sin(t*Math.PI),y:seam+(y-seam)*(1-.95*p)-Math.sin(t*Math.PI)*22*p};
}
export function motionEase(t){t=clamp(t);return 1-Math.pow(1-t,3);}
const cloth=[[0,56],[12,55.9],[26,56.2],[40,59.1],[47.9,55.5],[50.1,57.8],[52.1,62.5],[54.5,66.6],[54.2,68.4],[53.2,68],[52,66.5],[50.4,68.1],[47,71],[42,75.5],[36.2,81],[31.5,85.9],[29.1,90.6],[27.2,92.2],[25.4,90.9],[24.2,86.6],[22.8,82.5],[20.6,80.4],[17,79],[8,77.8],[0,76.7]];

const pillow=[[5.6,42.5],[8.8,41.7],[13.8,41.5],[16.3,45.3],[18,49],[13.5,51.5],[8,52.3],[6.5,47.5]];
const drawer=[[83,46.5],[95.5,46.8],[95.5,51.5],[83,51.5]];
function shape(ctx,points,w=W,h=H){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w/100,y*h/100):ctx.moveTo(x*w/100,y*h/100));ctx.closePath();}
export class SceneSurface{
 constructor(canvas){this.canvas=canvas;this.context=canvas?.getContext?.('2d');this.images=new Map();this.layers=new Map();}
 image(src){if(this.images.has(src))return this.images.get(src);if(typeof Image==='undefined')return null;const img=new Image();this.images.set(src,img);img.onload=()=>this.paint();img.src=src;return img;}
 layer(key,image,points,feather=6){
  if(this.layers.has(key))return this.layers.get(key);
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  // Blur only the mask, never the artwork. The fixed bed silhouette prevents detached cloth slabs.
  ctx.filter=`blur(${feather}px)`;shape(ctx,points);ctx.fillStyle='#fff';ctx.fill();ctx.filter='none';ctx.globalCompositeOperation='source-in';ctx.drawImage(image,0,0,W,H);ctx.globalCompositeOperation='source-over';
  this.layers.set(key,c);return c;
 }
 lighting(original,diffuse){
  if(this.layers.has('lighting'))return this.layers.get('lighting');
  const w=768,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
  ctx.filter='blur(2px)';ctx.drawImage(original,0,0,w,h);const a=ctx.getImageData(0,0,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(diffuse,0,0,w,h);const b=ctx.getImageData(0,0,w,h);ctx.filter='none';
  for(let i=0;i<a.data.length;i+=4){for(let j=0;j<3;j++)a.data[i+j]=Math.round(255*sunlightGain(a.data[i+j],b.data[i+j]));a.data[i+3]=255;}
  ctx.putImageData(a,0,0);this.layers.set('lighting',c);return c;
 }
 drawBox(open=0){
  const atlas=this.image('travel-art/travel-props-empty-v5.webp');if(!atlas?.complete||!atlas.naturalWidth)return;
  const ctx=this.context,size=atlas.naturalWidth/2,x=365,y=575,w=84,h=84;
  const amount=this.state.flags?.camera_box_open?1:open;
  // The camera and box share one painted scene object, below the cloth until physically uncovered.
  if(amount>0){ctx.drawImage(atlas,size,0,size,size,x,y,w,h);}
  if(amount<1){
   if(!amount)ctx.drawImage(atlas,0,0,size,size,x,y,w,h);
   else{ctx.save();ctx.translate(x+w/2,y+20);ctx.rotate(-.7*amount);ctx.scale(1,1-.6*amount);ctx.drawImage(atlas,0,0,size,size,-w/2,-20,w,h);ctx.restore();}
  }
 }
 render(state,room,preview){this.state=state;this.room=room;this.preview=preview;this.paint();}
 paint(){
  const ctx=this.context;if(!ctx||!this.state)return;const c=this.canvas;if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;ctx.clearRect(0,0,W,H);
  if(this.room!==0)return;
  const original=this.image('travel-art/seoul.webp'),clean=this.image('travel-art/seoul-clean-v3.webp'),diffuse=this.image('travel-art/seoul-diffuse-v4.webp'),pillowPlate=this.image('travel-art/seoul-pillow-v3.webp');
  if([original,clean,diffuse,pillowPlate].some(i=>!i?.complete||!i.naturalWidth))return;
  const progress=a=>this.preview?.anchor===a?this.preview.frame.progress:sceneProgress(this.state,a);
  ctx.drawImage(original,0,0,W,H);
  const bed=progress('bed');
  if(bed>0){
   // Clear only the original front quilt silhouette; pillows, tote, wall and floor stay fixed.
   ctx.save();ctx.globalAlpha=clamp(bed*24);ctx.drawImage(this.layer('cloth-under',clean,[[0,55.9],[12,55.8],[26,56.1],[40,59],[48,55.4],[55,63],[55,73],[33,95],[23,95],[20,84],[0,82]],2),0,0);ctx.restore();
   if(this.state.stage===0)this.drawBox(progress('camera-box'));
   const fabric=this.layer('cloth-front',original,cloth,.7);
   ctx.save();
   // Fine opaque strips retain the original cloth texture without triangle cracks or scene dissolves.
   for(let x=0;x<840;x+=3){
    const top=clothSample(x,548,bed),bottom=clothSample(x,965,bed);
    ctx.drawImage(fabric,x,548,3,417,top.x,top.y,3.8,bottom.y-top.y);
   }
   ctx.restore();
   ctx.drawImage(this.layer('fixed-tote',original,[[28.6,46.7],[31.6,45.5],[35,46.1],[38.7,46.6],[40.2,50],[40.8,54.8],[39.3,58.5],[37.4,58.2],[34.6,56.9],[30.7,56.4],[28.2,55],[27.5,51.3]],1),0,0);
  }
  const lift=progress('pillow');if(lift>0){
   ctx.save();ctx.drawImage(this.layer('pillow-under',pillowPlate,pillow,2),0,0);ctx.restore();
   if(this.state.stage===0){
    ctx.save();ctx.translate(184,484);ctx.rotate(-.12);ctx.fillStyle='#e4d9ba';ctx.shadowColor='#30271833';ctx.shadowBlur=3;ctx.fillRect(-21,-19,42,38);ctx.shadowBlur=0;ctx.fillStyle='#68705c';ctx.font='16px Georgia';ctx.fillText('☾',-7,-2);ctx.font='10px Georgia';ctx.fillText('···',-6,10);ctx.restore();
   }
   ctx.save();ctx.translate(165,490);ctx.translate(30*lift,-88*lift);ctx.rotate(-.24*lift);ctx.translate(-165,-490);ctx.shadowColor='#33291a44';ctx.shadowBlur=8*lift;ctx.shadowOffsetY=5*lift;ctx.drawImage(this.layer('pillow',original,pillow,2),0,0);ctx.restore();
  }
  const pull=progress('drawer');if(pull>0){
   ctx.save();shape(ctx,drawer);ctx.clip();ctx.fillStyle='#51422e';ctx.fillRect(1250,470,240,80);ctx.restore();
   const dx=-14*pull,dy=54*pull;ctx.save();
   ctx.beginPath();ctx.moveTo(1275,477);ctx.lineTo(1467,479);ctx.lineTo(1467+dx,479+dy);ctx.lineTo(1275+dx,477+dy);ctx.closePath();
   const wood=ctx.createLinearGradient(0,476,0,535);wood.addColorStop(0,'#3b3022');wood.addColorStop(1,'#a38a61');ctx.fillStyle=wood;ctx.fill();ctx.strokeStyle='#c1a473';ctx.lineWidth=2;ctx.stroke();
   ctx.beginPath();ctx.moveTo(1350,478);ctx.lineTo(1350+dx,478+dy);ctx.strokeStyle='#7b6748';ctx.lineWidth=3;ctx.stroke();
   ctx.save();ctx.beginPath();ctx.rect(1260,479,215,dy);ctx.clip();ctx.fillStyle='#d7ccb2';ctx.fillRect(1380,491,35,18);ctx.strokeStyle='#776b4d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1290,491);ctx.lineTo(1333,511);ctx.stroke();ctx.restore();
   ctx.translate(dx,dy);ctx.shadowColor='#28201655';ctx.shadowBlur=4;ctx.drawImage(this.layer('drawer',original,drawer,1),0,0);ctx.restore();
  }
  const shade=progress('window');if(shade>0){
   // Reuse the original woven linen and hem without a second curtain or hard rectangle.
   const height=82+360*shade;ctx.save();ctx.beginPath();ctx.rect(399,0,466,height);ctx.clip();ctx.drawImage(original,400,5,463,48,399,0,466,Math.max(50,height-28));ctx.drawImage(original,400,52,463,28,399,height-28,466,28);ctx.restore();
   // Ratio map removes baked-in sunlight from floor/rug/bed; a dark overlay alone cannot do that.
   ctx.save();ctx.globalAlpha=foldBlend(shade);ctx.globalCompositeOperation='multiply';ctx.drawImage(this.lighting(original,diffuse),0,0,W,H);ctx.restore();
  }
 }
}
