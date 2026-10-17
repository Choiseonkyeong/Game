// Isolated material layers: move cloth pixels, never the room underneath.
export const clamp=v=>Math.max(0,Math.min(1,v));
export const sceneProgress=(s,a)=>s.positions?.[a]?.progress??(s.world?.[a]?1:0);
export const foldBlend=p=>{p=clamp(p);return p*p*(3-2*p);};
export const sunlightGain=(sun,ambient)=>Math.max(.25,Math.min(1.02,(ambient+5)/(sun+5)));
const W=1536,H=1024;
// Fixed back seam. The front hem rolls towards it while every fabric sample remains opaque.
export function clothSample(x,y,progress){
 const p=clamp(progress),seam=580-.025*x,t=clamp((y-seam)/370);
 return {x:x+7*p*Math.sin(t*Math.PI),y:seam+(y-seam)*(1-.78*p)-60*p*t+Math.sin(t*Math.PI)*26*p};
}
export function motionEase(t){t=clamp(t);return 1-Math.pow(1-t,3);}
const cloth=[[0,56],[12,55.9],[26,56.2],[40,59.1],[47.9,55.5],[50.1,57.8],[52.1,62.5],[54.5,66.6],[54.2,68.4],[53.2,68],[52,66.5],[50.4,68.1],[47,71],[42,75.5],[36.2,81],[31.5,85.9],[29.1,90.6],[27.2,92.2],[25.4,90.9],[24.2,86.6],[22.8,82.5],[20.6,80.4],[17,79],[8,77.8],[0,76.7]];

const pillow=[[5.6,42.7],[13.7,41.5],[14.4,42],[16.8,48.7],[16.1,49.2],[8.3,51.2],[7.8,50.6],[5.9,43.7]];
const drawer=[[79,46.5],[95.5,46.8],[95.5,51.6],[79,51.4]];
const drawerAssembly=[[80,47.6],[82.5,46.7],[95.4,46.7],[95.4,49.6],[93.6,52.7],[80,51.9]];
function shape(ctx,points,w=W,h=H){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w/100,y*h/100):ctx.moveTo(x*w/100,y*h/100));ctx.closePath();}
export class SceneSurface{
 constructor(canvas){this.canvas=canvas;this.context=canvas?.getContext?.('2d');this.images=new Map();this.layers=new Map();}
 image(src){if(this.images.has(src))return this.images.get(src);if(typeof Image==='undefined')return null;const img=new Image();this.images.set(src,img);img.onload=()=>this.paint();img.src=src+'?v=070';return img;}
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
  const drawerArt=this.image('travel-art/seoul-drawer-v7.webp');
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
   for(let y=548;y<965;y+=3){
    const a=clothSample(400,y,bed),b=clothSample(400,y+3,bed),shear=-.0195*bed;
    ctx.setTransform(1,shear,0,1,0,-400*shear);
    ctx.drawImage(fabric,0,y,840,3,a.x-400,Math.min(a.y,b.y),840,Math.max(1.3,Math.abs(b.y-a.y)+.8));
   }
   ctx.restore();
   ctx.drawImage(this.layer('fixed-tote',original,[[28.6,46.7],[31.6,45.5],[35,46.1],[38.7,46.6],[40.2,50],[40.8,54.8],[39.3,58.5],[37.4,58.2],[34.6,56.9],[30.7,56.4],[28.2,55],[27.5,51.3]],1),0,0);
  }
  const lift=progress('pillow');if(lift>0){
   ctx.save();ctx.drawImage(this.layer('pillow-under',pillowPlate,[[4.5,40.5],[18.8,40.5],[19.4,53.4],[4.5,53.4]],13),0,0);ctx.restore();
   if(this.state.stage===0){
    ctx.save();ctx.translate(184,484);ctx.rotate(-.12);ctx.fillStyle='#e4d9ba';ctx.shadowColor='#30271833';ctx.shadowBlur=3;ctx.fillRect(-21,-19,42,38);ctx.shadowBlur=0;ctx.fillStyle='#68705c';ctx.font='16px Georgia';ctx.fillText('☾',-7,-2);ctx.font='10px Georgia';ctx.fillText('···',-6,10);ctx.restore();
   }
   ctx.save();ctx.translate(165,490);ctx.translate(15*lift,-52*lift);ctx.rotate(-.23*lift);ctx.translate(-165,-490);ctx.shadowColor='#33291a44';ctx.shadowBlur=8*lift;ctx.shadowOffsetY=5*lift;ctx.drawImage(this.layer('pillow',original,pillow,2),0,0);ctx.restore();
  }
  const pull=progress('drawer');if(pull>0&&drawerArt?.complete&&drawerArt.naturalWidth){
   ctx.save();ctx.globalAlpha=clamp(pull*14);shape(ctx,drawer);ctx.clip();
   const slot=ctx.createLinearGradient(0,476,0,529);slot.addColorStop(0,'#33291d');slot.addColorStop(1,'#776247');ctx.fillStyle=slot;ctx.fillRect(1200,474,285,60);ctx.restore();
   ctx.save();ctx.globalAlpha=clamp(pull*14);ctx.translate(20*(1-pull),-12*(1-pull));
   ctx.shadowColor='#382c1b33';ctx.shadowBlur=4*pull;ctx.shadowOffsetY=2*pull;
   ctx.drawImage(this.layer('drawer-assembly',drawerArt,drawerAssembly,1),0,0);ctx.restore();
  }
  const shade=progress('window');if(shade>0){
   // Reuse the original woven linen and hem without a second curtain or hard rectangle.
   const height=82+360*shade;ctx.save();ctx.beginPath();ctx.rect(399,0,466,height);ctx.clip();ctx.drawImage(original,400,5,463,48,399,0,466,Math.max(50,height-28));ctx.drawImage(original,400,52,463,28,399,height-28,466,28);ctx.restore();
   // Ratio map removes baked-in sunlight from floor/rug/bed; a dark overlay alone cannot do that.
   ctx.save();ctx.globalAlpha=foldBlend(shade);ctx.globalCompositeOperation='multiply';ctx.drawImage(this.lighting(original,diffuse),0,0,W,H);ctx.restore();
  }
 }
}
