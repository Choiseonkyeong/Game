// Articulated action poses use the selected clothed source pixels, never a base-outfit drawing.
const supported=new Set(['harvest','fishing','pickup','hoeing','jump','greeting','highfive']);
export const outfitAction=pose=>supported.has(pose);
export function outfitActionPlan(pose,time=0,face=1,row=0){
 if(!outfitAction(pose))return null;
 const left=row===2||row!==3&&face<0,sign=left?1:-1,phase=Math.sin(time*Math.PI),plan={left,leftAngle:0,rightAngle:0,tilt:0,y:0,tool:null};
 const degrees={harvest:115+5*phase,fishing:68+3*phase,pickup:30+4*phase,hoeing:35+15*phase,jump:12,greeting:135+9*phase,highfive:155+4*phase}[pose];
 plan[left?'leftAngle':'rightAngle']=sign*degrees*Math.PI/180;
 if(pose==='greeting'||pose==='highfive')plan.tilt=sign*.035;
 if(pose==='harvest')plan.tilt=sign*.045;
 if(pose==='pickup'||pose==='hoeing'){plan.tilt=sign*-.10;plan.y=2;}
 if(pose==='jump'){plan.y=-3-2*Math.abs(phase);plan.leftAngle=.25;plan.rightAngle=-.25;}
 if(pose==='fishing'||pose==='hoeing')plan.tool=pose;
 return plan;
}
const cache=new Map();
function parts(source,original,row,key){
 if(cache.has(key))return cache.get(key);
 const src=source.getContext('2d').getImageData(0,0,128,192),masks=[new Uint8Array(128*192),new Uint8Array(128*192)];
 for(let y=105;y<148;y++)for(let x=26;x<103;x++){
  const i=(y*128+x)*4,r=original[i],g=original[i+1],b=original[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b);
  if(original[i+3]<80)continue;
  const side=x<63?0:x>65?1:-1;if(side<0)continue;
  const skin=r>g*1.045&&g>b*1.025&&max>145&&(y<138||(side===0?x<54:x>74));
  const sleeve=y<123&&max>165&&(max-min)/max<.2&&(side===0?x<50:x>78);
  if(skin||sleeve)masks[side][y*128+x]=1;
 }
 // Include the warm hand/garment contour without carrying dark hair along with it.
 for(const mask of masks){const first=mask.slice();for(let y=106;y<147;y++)for(let x=27;x<102;x++)if(first[y*128+x])for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const k=(y+dy)*128+x+dx,j=k*4;if(original[j+3]>80&&Math.max(original[j],original[j+1],original[j+2])>100)mask[k]=1;}}
 const canvas=(which)=>{const c=document.createElement('canvas');c.width=128;c.height=192;const data=new Uint8ClampedArray(src.data);for(let i=0;i<data.length;i+=4){const k=i/4;if(which===-1?masks[0][k]||masks[1][k]:!masks[which][k])data[i+3]=0;}c.getContext('2d').putImageData(new ImageData(data,128,192),0,0);return c;};
 const result={body:canvas(-1),arms:[canvas(0),canvas(1)],pivots:row===2?[[54,113],[79,113]]:row===3?[[48,113],[74,113]]:[[48,113],[80,113]]};
 if(cache.size>80)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
}
export function drawOutfitAction(ctx,source,original,{pose,time=0,face=1,row=0,key}){
 const plan=outfitActionPlan(pose,time,face,row);if(!plan)return false;
 const p=parts(source,original,row,key);ctx.save();ctx.translate(64,147+plan.y);ctx.rotate(plan.tilt);ctx.translate(-64,-147);ctx.drawImage(p.body,0,0);
 for(let side=0;side<2;side++){const[x,y]=p.pivots[side];ctx.save();ctx.translate(x,y);ctx.rotate(side===0?plan.leftAngle:plan.rightAngle);ctx.translate(-x,-y);ctx.drawImage(p.arms[side],0,0);ctx.restore();}
 if(plan.tool){const side=plan.left?0:1,[x,y]=p.pivots[side],angle=plan.left?plan.leftAngle:plan.rightAngle,handX=x-Math.sin(angle)*27,handY=y+Math.cos(angle)*27,sign=plan.left?-1:1;
  ctx.save();ctx.translate(handX,handY);ctx.scale(sign,1);ctx.strokeStyle='#896e57';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);
  if(plan.tool==='fishing'){ctx.quadraticCurveTo(12,-22,8,-43);ctx.stroke();ctx.strokeStyle='#aa9a83';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(8,-43);ctx.lineTo(13,36);ctx.stroke();ctx.fillStyle='#d5aaa1';ctx.beginPath();ctx.arc(13,36,2,0,Math.PI*2);ctx.fill();}
  else{ctx.lineTo(9,36);ctx.stroke();ctx.fillStyle='#a1aaa0';ctx.strokeStyle='#7a7566';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(2,34);ctx.lineTo(17,34);ctx.lineTo(16,40);ctx.lineTo(4,39);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.restore();
 }
 ctx.restore();return true;
}
