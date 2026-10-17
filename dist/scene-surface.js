// Original room pixels are deformable objects; no alternate-room wipes are used.
export const clamp=v=>Math.max(0,Math.min(1,v));
export function clothPoint(x,y,p,direction='up',rect=[0,.46,.55,.92]){
 p=clamp(p);const [l,t,r,b]=rect,u=clamp((x-l)/(r-l)),v=clamp((y-t)/(b-t));
 if(direction==='left')return [l+(x-l)*(1-.72*p),y-Math.sin(u*Math.PI)*.025*p];
 if(direction==='right')return [r-(r-x)*(1-.72*p),y-Math.sin(u*Math.PI)*.025*p];
 if(direction==='down')return [x+Math.sin(v*Math.PI)*.012*p,b-(b-y)*(1-.64*p)];
 return [x+Math.sin(v*Math.PI)*.012*p,t+(y-t)*(1-.64*p)-Math.sin(v*Math.PI)*.015*p];
}
export const sceneProgress=(s,a)=>s.positions?.[a]?.progress??(s.world?.[a]?1:0);
const outlines={bed:[[0,54],[11,52],[18,48.5],[24,47],[28,48],[30,44.7],[43,49.5],[50.5,52],[53.5,58],[54.5,65],[53,68],[48,69.5],[42,78],[33,91],[30,92.5],[26,88],[23,80],[0,76.2]],pillow:[[5.6,42.5],[13.8,41.5],[18,49],[8,52.3]],window:[[26,0],[56.4,0],[56.4,8],[26,8]],tote:[[27,47],[36,45],[40,53],[39,58],[31,59],[28,55]],jacket:[[57,26],[60,24],[63.5,34],[63,51],[60,53],[56,47],[55,39]],drawer:[[83,46.5],[95.5,46.8],[95.5,51.5],[83,51.5]]};
function path(ctx,points,w,h){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w/100,y*h/100):ctx.moveTo(x*w/100,y*h/100));ctx.closePath();}
function affine(ctx,img,s,d,outline){
 const [a,b,c]=s,[u,v,w]=d,den=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(den)<.01)return;
 const A=((v[0]-u[0])*(c[1]-a[1])-(w[0]-u[0])*(b[1]-a[1]))/den,B=((v[1]-u[1])*(c[1]-a[1])-(w[1]-u[1])*(b[1]-a[1]))/den,C=((w[0]-u[0])*(b[0]-a[0])-(v[0]-u[0])*(c[0]-a[0]))/den,D=((w[1]-u[1])*(b[0]-a[0])-(v[1]-u[1])*(c[0]-a[0]))/den;
 ctx.save();ctx.beginPath();const center=[(u[0]+v[0]+w[0])/3,(u[1]+v[1]+w[1])/3],expanded=[u,v,w].map(pt=>{const dx=pt[0]-center[0],dy=pt[1]-center[1],n=Math.hypot(dx,dy)||1;return[pt[0]+dx/n*.6,pt[1]+dy/n*.6];});ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,u[0]-A*a[0]-C*a[1],u[1]-B*a[0]-D*a[1]);if(outline){path(ctx,outline,1536,1024);ctx.clip();}ctx.drawImage(img,0,0,1536,1024);ctx.restore();
}
export function shadowPolygon(p){p=clamp(p);const a=[.43,.70],b=[.76,.73],c=[.95,.94],d=[.49,.90];return[a,b,[b[0]+(c[0]-b[0])*p,b[1]+(c[1]-b[1])*p],[a[0]+(d[0]-a[0])*p,a[1]+(d[1]-a[1])*p]];}
export class SceneSurface{
 constructor(canvas){this.canvas=canvas;this.context=canvas?.getContext?.('2d');this.images=new Map();this.textures=new Map();}
 image(src){if(this.images.has(src))return this.images.get(src);if(typeof Image==='undefined')return null;const img=new Image();img.onload=()=>this.paint();img.src=src;this.images.set(src,img);return img;}
 texture(name,original){if(this.textures.has(name))return this.textures.get(name);const c=document.createElement('canvas');c.width=1536;c.height=1024;const ctx=c.getContext('2d');path(ctx,outlines[name],1536,1024);ctx.clip();ctx.drawImage(original,0,0,1536,1024);this.textures.set(name,c);return c;}
 render(state,room,preview){this.state=state;this.room=room;this.preview=preview;this.paint();}
 paint(){
  const ctx=this.context;if(!ctx||!this.state)return;const c=this.canvas;if(c.width!==1536)c.width=1536;if(c.height!==1024)c.height=1024;ctx.clearRect(0,0,1536,1024);
  if(this.room!==0)return;
  const original=this.image('travel-art/seoul.webp'),plate=this.image('travel-art/seoul-clean-v3.webp'),pillowPlate=this.image('travel-art/seoul-pillow-v3.webp');if(!original?.complete||!original.naturalWidth||!plate?.complete||!plate.naturalWidth||!pillowPlate?.complete||!pillowPlate.naturalWidth)return;
  const progress=a=>this.preview?.anchor===a?this.preview.frame.progress:sceneProgress(this.state,a),direction=a=>this.preview?.anchor===a?this.preview.frame.direction:this.state.positions?.[a]?.direction||'up';
  // Objects share the exact original silhouettes. Only pixels hidden by them come from the clean plate.
  for(const name of ['bed','pillow','window']){const p=progress(name);if(!p)continue;
   ctx.save();path(ctx,name==='bed'?[[0,49],[21,44],[36,44],[55,53],[56,71],[41,82],[34,95],[25,94],[20,83],[0,80]]:outlines[name],1536,1024);ctx.clip();ctx.drawImage(name==='pillow'?pillowPlate:plate,0,0,1536,1024);ctx.restore();
   if(name==='bed'){
    const texture=original,cols=6,rows=8;
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
     const points=[[i/cols*.55,.46+j/rows*.465],[(i+1)/cols*.55,.46+j/rows*.465],[(i+1)/cols*.55,.46+(j+1)/rows*.465],[i/cols*.55,.46+(j+1)/rows*.465]];
     const s=points.map(([x,y])=>[x*1536,y*1024]),d=points.map(([x,y])=>{const [u,v]=clothPoint(x,y,p,direction(name));return[u*1536,v*1024];});
     affine(ctx,texture,[s[0],s[1],s[2]],[d[0],d[1],d[2]],outlines.bed);affine(ctx,texture,[s[0],s[2],s[3]],[d[0],d[2],d[3]],outlines.bed);
    }

    ctx.save();path(ctx,[[0,36],[13,36],[20,40],[25,47.5],[23,50],[14,51],[0,53]],1536,1024);ctx.clip();ctx.drawImage(original,0,0,1536,1024);ctx.restore();
   }else if(name==='pillow'){
    ctx.save();ctx.translate(165,490);ctx.translate(36*p,-85*p);ctx.rotate(-.34*p);ctx.scale(1,1-.12*p);ctx.translate(-165,-490);ctx.shadowColor='#33291a55';ctx.shadowBlur=12*p;ctx.shadowOffsetY=14*p;ctx.drawImage(this.texture(name,original),0,0);ctx.restore();
   }else{
    // Extend the SAME linen pixels and retain the original folds at the hem.
    const height=82+360*p;ctx.save();ctx.beginPath();ctx.rect(399,0,466,height);ctx.clip();ctx.shadowColor='#342d2144';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
    ctx.drawImage(original,400,5,463,48,399,0,466,Math.max(50,height-28));ctx.drawImage(original,400,52,463,28,399,height-28,466,28);ctx.restore();
   }
  }
  const drawer=progress('drawer');if(drawer>0){ctx.save();path(ctx,outlines.drawer,1536,1024);ctx.clip();ctx.fillStyle='#493b27';ctx.fillRect(1250,470,240,80);ctx.restore();ctx.save();ctx.translate(-5*drawer,25*drawer);ctx.drawImage(this.texture('drawer',original),0,0);ctx.restore();}
  const shade=progress('window');if(shade>0){
   const polygon=shadowPolygon(shade);ctx.save();ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*1536,y*1024):ctx.moveTo(x*1536,y*1024));ctx.closePath();ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgba(63,70,54,${.08+.3*shade})`;ctx.filter='blur(5px)';ctx.fill();ctx.restore();
  }

 }
}
