// Stable registered artwork and a photometric shade map; never stretch room pixels.
export const clamp=v=>Math.max(0,Math.min(1,v));
export const sceneProgress=(s,a)=>s.positions?.[a]?.progress??(s.world?.[a]?1:0);
export const foldBlend=p=>{p=clamp(p);return p*p*(3-2*p);};
export const sunlightGain=(sun,ambient)=>Math.max(.25,Math.min(1.02,(ambient+5)/(sun+5)));
const W=1536,H=1024;
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
 render(state,room,preview){this.state=state;this.room=room;this.preview=preview;this.paint();}
 paint(){
  const ctx=this.context;if(!ctx||!this.state)return;const c=this.canvas;if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;ctx.clearRect(0,0,W,H);
  if(this.room!==0)return;
  const original=this.image('travel-art/seoul.webp'),folded=this.image('travel-art/seoul-folded-v4.webp'),diffuse=this.image('travel-art/seoul-diffuse-v4.webp'),pillowPlate=this.image('travel-art/seoul-pillow-v3.webp');
  if([original,folded,diffuse,pillowPlate].some(i=>!i?.complete||!i.naturalWidth))return;
  const progress=a=>this.preview?.anchor===a?this.preview.frame.progress:sceneProgress(this.state,a);
  ctx.drawImage(original,0,0,W,H);
  const bed=progress('bed');if(bed>0){ctx.save();ctx.globalAlpha=foldBlend(bed);ctx.drawImage(this.layer('bed-open',folded,[[0,33],[24,33],[28,43],[47,45],[56,51],[58,72],[43,84],[34,96],[0,85]],18),0,0);ctx.restore();}
  const lift=progress('pillow');if(lift>0){
   ctx.save();ctx.globalAlpha=foldBlend(lift);ctx.drawImage(this.layer('pillow-under',pillowPlate,pillow,7),0,0);ctx.restore();
   ctx.save();ctx.translate(165,490);ctx.translate(15*lift,-48*lift);ctx.rotate(-.17*lift);ctx.translate(-165,-490);ctx.shadowColor='#33291a44';ctx.shadowBlur=8*lift;ctx.shadowOffsetY=5*lift;ctx.drawImage(this.layer('pillow',original,pillow,2),0,0);ctx.restore();
  }
  const pull=progress('drawer');if(pull>0){ctx.save();shape(ctx,drawer);ctx.clip();ctx.fillStyle='#493b27';ctx.fillRect(1250,470,240,80);ctx.restore();ctx.save();ctx.translate(-3*pull,20*pull);ctx.drawImage(this.layer('drawer',original,drawer,1),0,0);ctx.restore();}
  const shade=progress('window');if(shade>0){
   // Reuse the original woven linen and hem without a second curtain or hard rectangle.
   const height=82+360*shade;ctx.save();ctx.beginPath();ctx.rect(399,0,466,height);ctx.clip();ctx.drawImage(original,400,5,463,48,399,0,466,Math.max(50,height-28));ctx.drawImage(original,400,52,463,28,399,height-28,466,28);ctx.restore();
   // Ratio map removes baked-in sunlight from floor/rug/bed; a dark overlay alone cannot do that.
   ctx.save();ctx.globalAlpha=foldBlend(shade);ctx.globalCompositeOperation='multiply';ctx.drawImage(this.lighting(original,diffuse),0,0,W,H);ctx.restore();
  }
 }
}
