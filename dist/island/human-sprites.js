import{loadTrenchOutfit,trenchFrame}from'./trench-outfit.js?v=37';
import{loadActionSprites,drawAction,actionName}from'./actions.js?v=25';
import{drawAccessories}from'./accessories.js?v=18';
import{walkFrame,spriteOffset,gaitSample,GAIT_FPS,GAIT_FRAMES}from'./locomotion.js?v=30';
import{WARDROBE_KEY,ITEMS,restoreWardrobe,cleanOutfit}from'./wardrobe.js?v=37';
let closet=restoreWardrobe(null),sources={},direction=0;
try{const raw=localStorage.getItem(WARDROBE_KEY);closet=restoreWardrobe(raw);if(!raw&&localStorage.getItem('pogeun-human-choice-v1')==='male')closet.gender='male';}catch{}
const save=()=>{try{localStorage.setItem(WARDROBE_KEY,JSON.stringify(closet));}catch{}};
save();
export const humanChoice=()=>closet.gender;
export const currentOutfit=()=>closet[closet.gender];
export const savedLooks=()=>closet.looks;
export function chooseHuman(gender){if(!['female','male'].includes(gender))return;closet.gender=gender;direction=0;save();}
export function wearItem(slot,value){if(!ITEMS[slot]?.some(i=>i[0]===value))return false;closet[closet.gender][slot]=value;if(slot==='top'||slot==='bottom')closet[closet.gender].dress='none';save();return true;}
export function saveLook(){closet.looks.unshift({gender:closet.gender,outfit:{...currentOutfit()}});closet.looks=closet.looks.slice(0,6);save();}
export function loadLook(i){const look=closet.looks[i];if(!look)return;closet[closet.gender]=cleanOutfit(look.outfit,closet.gender);save();}
// A complete illustrated body is retained under every outfit; never attach a head to a replacement stick rig.
const frames=new Map(),wardrobeFrames=new Map();
function loadFemaleImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Female sprite failed to load'));image.src=src;});}
export async function loadHumanSprites(){await Promise.all([loadActionSprites(),loadTrenchOutfit().catch(()=>{})]);const unified=new Image();try{unified.src='art/humans/female-unified-34.png?v=34';await unified.decode();sources.femaleUnified=unified;}catch{}const rear=new Image();try{rear.src='art/humans/female-back-24.webp?v=24';await rear.decode();sources.femaleBack=rear;}catch{}await Promise.all([
 (async()=>{for(const src of ['art/humans/female-cozy.webp?v=26','art/humans/female-cozy-26.png?v=26']){try{sources.female=await loadFemaleImage(src);break;}catch{}}})(),
 (async()=>{const img=new Image();try{img.src='art/humans/male-soft-25.webp?v=25';await img.decode();sources.male=img;}catch{try{img.src='art/humans/male.webp';await img.decode();sources.male=img;}catch{}}})()
]);}
// SVG image works in iOS WebKit; foreignObject canvas can disappear after repaint.
export function humanMarkup(){if(!sources[closet.gender])return'';return `<ellipse class="human-shadow" pointer-events="none" cy="2" rx="14" ry="4" fill="#5d785c26"/><image class="human-image" x="-43" y="-119" width="86" height="124" href="${humanSnapshot({preview:true})}" preserveAspectRatio="none" pointer-events="none" style="image-rendering:auto"/>`;}

// Uniform scaling preserves the unified four-view artwork; no anatomy slicing or added grain.
const FEMALE_VIEWS=[[197,85,360,534],[703,85,340,534],[234,668,327,521],[694,668,322,521]];
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const palette=Object.fromEntries(Object.values(ITEMS).flat().map(i=>[i[0],rgb(i[2])]));
function baseFrame(g,row,col){const key=g+row+col;if(frames.has(key))return frames.get(key);const c=document.createElement('canvas');c.width=128;c.height=192;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;if(g==='female'&&sources.femaleUnified){x.imageSmoothingEnabled=true;const [sx,sy,sw,sh]=FEMALE_VIEWS[row],scale=175/sh;x.drawImage(sources.femaleUnified,sx,sy,sw,sh,64-sw*scale/2,182-sh*scale,sw*scale,sh*scale);}else x.drawImage(g==='female'&&row===1&&sources.femaleBack?sources.femaleBack:sources[g],col*128,g==='female'&&row===1&&sources.femaleBack?0:row*192,128,192,0,0,128,192);const d=x.getImageData(0,0,128,192);d.offset=spriteOffset(d.data);d.footBottom=new Int16Array(128).fill(183);for(let x=0;x<128;x++)for(let y=191;y>142;y--)if(d.data[(y*128+x)*4+3]>120){d.footBottom[x]=y;break;}frames.set(key,d);return d;}
const mix=(data,i,color,light)=>{for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,Math.round(color[k]*light)));};
function clothedFrame(g,row,col,o){if(o.dress==='trench-set'){const frame=trenchFrame(row);if(frame)return frame;}const key=[g,row,col,...Object.values(o)].join('|');if(wardrobeFrames.has(key))return wardrobeFrames.get(key);const original=baseFrame(g,row,col),d=new Uint8ClampedArray(original.data),top=palette[o.top],bottom=palette[o.bottom],shoe=palette[o.shoes],waist=g==='female'&&!sources.femaleUnified?122:138,bodyX=g==='female'?[43,85]:[42,86],topYs=g==='female'?(sources.femaleUnified?[100,139]:[95,123]):[84,139],clothMask=new Uint8ClampedArray(original.data.length),bottomMask=new Uint8ClampedArray(original.data.length);
 for(let i=0;i<d.length;i+=4){if(d[i+3]<20)continue;const y=Math.floor(i/4/128),x=i/4%128,r=d[i],gg=d[i+1],b=d[i+2],max=Math.max(r,gg,b),min=Math.min(r,gg,b),sat=max?(max-min)/max:0,h=max===min?0:max===r?((gg-b)/(max-min)+6)%6/6:max===gg?((b-r)/(max-min)+2)/6:((r-gg)/(max-min)+4)/6;
 const blue=b>r*1.065&&b>gg*.985&&sat>.12;
 const unifiedFemale=g==='female'&&sources.femaleUnified;
 const fabric=unifiedFemale?false:g==='female'?y>=topYs[0]&&y<=waist&&h<.045&&sat>.12&&max>165:y>=100&&y<138&&sat<.16&&max>140;
 const shorts=unifiedFemale?row!==1&&y>=121&&y<=140&&(row===2?x>35&&x<64:row===3?x>64&&x<93:x>40&&x<88)&&max<155&&sat<.30:y>=(g==='male'?129:waist)&&y<166&&blue&&!fabric;
 const skin=r>gg*1.05&&gg>b*1.04&&h>=.035&&h<.13&&max>145;
 if(fabric){clothMask[i+3]=255;let color=top,light=g==='female'?Math.max(.52,Math.min(1.03,max/246)):Math.max(.5,Math.min(1.05,max/235));if(o.top==='stripes')color=Math.floor((y-topYs[0])/5)%2?palette['white-tee']:top;if(o.top==='raglan')color=x<bodyX[0]+5||x>bodyX[1]-5?rgb('#7f9c85'):palette['white-tee'];if(o.top==='crop'&&y>waist-10)color=rgb('#f7dbc2');mix(d,i,color,light);}
 else if(shorts&&(!unifiedFemale||o.bottom==='shorts')){bottomMask[i+3]=255;mix(d,i,bottom,Math.max(.48,Math.min(1.04,max/(unifiedFemale?85:165))));}
 else if(['denim','trousers'].includes(o.bottom)&&y>=waist+5&&y<original.footBottom[x]-12&&x>bodyX[0]-3&&x<bodyX[1]+3){bottomMask[i+3]=255;mix(d,i,bottom,Math.max(.3,Math.min(1,max/250)));}
 else if((o.top.includes('hoodie')||o.top==='cardigan')&&skin&&y>topYs[0]+10&&y<waist+7&&(x<bodyX[0]||x>bodyX[1]))mix(d,i,top,Math.max(.7,max/260));
 else if(o.shoes!=='sneakers'&&y>149&&y>original.footBottom[x]-(['boots','black-boots'].includes(o.shoes)?(o.shoes==='black-boots'?46:30):14)&&(sat<.23||['boots','black-boots'].includes(o.shoes)&&skin)&&max>145){let color=shoe;if(o.shoes==='sandals')color=(original.footBottom[x]-y)%9<3?rgb('#bd9b76'):rgb('#f5d7b9');mix(d,i,color,Math.max(.6,Math.min(1,max/248)));}
 // The new straight hair is charcoal black, retaining its illustrated highlights.
 else if(g==='female'&&!unifiedFemale&&y<151&&max<165&&max-min<45&&!blue){d[i]=r*.68;d[i+1]=gg*.74;d[i+2]=b*.84;}
 }
 // Match the male sprite's soft cel texture without moving a single female pixel or changing its alpha.
 // Preserve the original highlights, silhouette, outfit geometry and facial details.
 if(g==='female'&&!(sources.femaleUnified))for(let i=0;i<d.length;i+=4){
  if(d[i+3]<20)continue;
  const y=Math.floor(i/4/128),x=i/4%128;
  if(y<24||y>183)continue;
  const r=d[i],green=d[i+1],b=d[i+2];
  const l=.299*r+.587*green+.114*b;
  const tone=l<78?-.018:l<143?-.012:l>220?.012:.006;
  const grain=((x*17+y*29)%7-3)*.003;
  const factor=1+tone+grain;
  d[i]=Math.min(255,Math.round(r*factor));
  d[i+1]=Math.min(255,Math.round(green*factor));
  d[i+2]=Math.min(255,Math.round(b*factor));
 }
 const c=document.createElement('canvas');c.width=128;c.height=192;const ctx=c.getContext('2d');ctx.putImageData(new ImageData(d,128,192),0,0);ctx.imageSmoothingEnabled=false;const back=row===1,side=row>1,center=64,topY=topYs[0],hem=waist,ink='#73584e';ctx.lineWidth=1.2;ctx.lineJoin='round';
 function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();ctx.save();ctx.clip();ctx.fillStyle='#634a4026';ctx.fillRect(x+w-3,y+2,3,h);ctx.restore();}
 function path(points,color){ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
 const color=arr=>'#'+arr.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');
 // Details are clipped to fabric pixels, keeping hair, skin and the illustrated silhouette intact.
 function fabricLayer(mask,draw){const layer=document.createElement('canvas');layer.width=128;layer.height=192;const lc=layer.getContext('2d');draw(lc);lc.globalCompositeOperation='destination-in';const m=document.createElement('canvas');m.width=128;m.height=192;m.getContext('2d').putImageData(new ImageData(mask,128,192),0,0);lc.drawImage(m,0,0);ctx.drawImage(layer,0,0);}
 if(o.top!=='white-tee')fabricLayer(clothMask,x=>{x.lineCap='round';x.lineWidth=.8;x.strokeStyle='#725b563d';x.beginPath();x.moveTo(45,hem-2);x.quadraticCurveTo(64,hem+1,84,hem-2);x.moveTo(47,topY+10);x.quadraticCurveTo(50,topY+17,47,hem-4);x.moveTo(81,topY+10);x.quadraticCurveTo(78,topY+17,82,hem-4);x.stroke();if(!side){x.strokeStyle='#755d574d';x.beginPath();x.moveTo(55,topY+1);x.quadraticCurveTo(64,topY+10,74,topY+1);x.stroke();x.strokeStyle='#fff9ed99';x.beginPath();x.moveTo(56,topY+2);x.quadraticCurveTo(64,topY+8,72,topY+2);x.stroke();}x.strokeStyle='#fff9ec66';x.beginPath();x.moveTo(51,hem-9);x.quadraticCurveTo(56,hem-5,60,hem-6);x.moveTo(71,hem-12);x.quadraticCurveTo(76,hem-7,79,hem-7);x.stroke();});
 if(!(g==='female'&&sources.femaleUnified))fabricLayer(bottomMask,x=>{x.lineWidth=.7;x.strokeStyle='#f9edcf99';x.setLineDash([1.3,1]);x.beginPath();x.moveTo(46,hem+3);x.lineTo(82,hem+3);if(!side){x.moveTo(48,hem+5);x.quadraticCurveTo(48,hem+11,55,hem+12);x.moveTo(80,hem+5);x.quadraticCurveTo(80,hem+11,73,hem+12);x.moveTo(64,hem+4);x.lineTo(64,hem+17);}x.stroke();x.setLineDash([]);x.strokeStyle='#5e6f8433';x.beginPath();x.moveTo(57,hem+17);x.lineTo(54,hem+24);x.moveTo(72,hem+17);x.lineTo(75,hem+24);x.stroke();});
 if(o.top.includes('hoodie')&&!back){rounded(55,hem-12,18,8,3,color(top));ctx.strokeStyle='#fff4e0';ctx.beginPath();ctx.moveTo(60,topY+6);ctx.lineTo(60,topY+15);ctx.moveTo(68,topY+6);ctx.lineTo(68,topY+15);ctx.stroke();}
 if(o.top==='cardigan'&&!back){ctx.strokeStyle='#a57d85';ctx.beginPath();ctx.moveTo(center,topY+4);ctx.lineTo(center,hem-1);ctx.stroke();for(let y=topY+10;y<hem-3;y+=7){ctx.fillStyle='#fff4df';ctx.fillRect(66,y,2,2);}}
 if(['oversized-knit','vneck-knit','cream-vneck','fine-knit'].includes(o.top)){
 fabricLayer(clothMask,x=>{x.strokeStyle='#ffffff35';x.lineWidth=.65;for(let ix=46;ix<=83;ix+=3){x.beginPath();x.moveTo(ix,topY+7);x.lineTo(ix,hem-3);x.stroke();}x.strokeStyle='#55484045';for(let ix=48;ix<=81;ix+=5){x.beginPath();x.moveTo(ix,hem-5);x.lineTo(ix,hem);x.stroke();}});
 if(!back){ctx.lineWidth=2.4;ctx.strokeStyle=o.top==='vneck-knit'?'#45444a':'#b6a195';ctx.beginPath();if(['vneck-knit','cream-vneck'].includes(o.top)){ctx.moveTo(54,topY+3);ctx.lineTo(64,topY+16);ctx.lineTo(74,topY+3);}else{ctx.moveTo(54,topY+5);ctx.quadraticCurveTo(64,topY+12,74,topY+5);}ctx.stroke();}
}
 if(['skirt','pleats','long-skirt','satin-long'].includes(o.bottom)){const cx=side?(row===2?59:69):64,topW=side?12:18,wide=side?16:24,length=['long-skirt','satin-long'].includes(o.bottom)?51:25,shade=ctx.createLinearGradient(cx-wide,0,cx+wide,0);shade.addColorStop(0,color(bottom.map(v=>v*.78)));shade.addColorStop(.27,color(bottom.map(v=>Math.min(255,v*1.06))));shade.addColorStop(.6,color(bottom));shade.addColorStop(1,color(bottom.map(v=>v*.8)));ctx.save();ctx.beginPath();ctx.moveTo(cx-topW,hem);ctx.quadraticCurveTo(cx,hem+2,cx+topW,hem);ctx.quadraticCurveTo(cx+topW+2,hem+13,cx+wide,hem+length-2);ctx.quadraticCurveTo(cx,hem+length+3,cx-wide,hem+length-2);ctx.quadraticCurveTo(cx-topW-2,hem+13,cx-topW,hem);ctx.closePath();ctx.fillStyle=shade;ctx.fill();ctx.lineWidth=.9;ctx.strokeStyle='#856370';ctx.stroke();ctx.clip();ctx.fillStyle='#fff2df33';ctx.fillRect(cx-topW,hem+1,topW*2,2);ctx.strokeStyle='#8c68754d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-topW,hem+4);ctx.quadraticCurveTo(cx,hem+6,cx+topW,hem+4);ctx.stroke();const folds=o.bottom==='pleats'?[-15,-9,-3,3,9,15]:o.bottom==='satin-long'?[-9,11]:[-12,11];for(const f of folds){const x=cx+f*(side?.65:1);ctx.strokeStyle='#74556038';ctx.beginPath();ctx.moveTo(x,hem+5);ctx.quadraticCurveTo(x+f*.06,hem+15,x+f*.25,hem+length);ctx.stroke();ctx.strokeStyle='#fff5e85c';ctx.beginPath();ctx.moveTo(x+1.5,hem+5);ctx.lineTo(x+f*.25+1.5,hem+length);ctx.stroke();}ctx.strokeStyle='#fff1e6b3';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(cx-wide,hem+length-4);ctx.quadraticCurveTo(cx,hem+length,cx+wide,hem+length-4);ctx.stroke();ctx.restore();}

 // Keep long hair in front of the back/side of the new skirt, rather than cutting it at the waist.
 if(g==='female'&&['skirt','pleats','long-skirt','satin-long'].includes(o.bottom)){const over=new Uint8ClampedArray(d.length);for(let y=waist-1;y<151;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,r=original.data[i],gg=original.data[i+1],b=original.data[i+2],max=Math.max(r,gg,b),min=Math.min(r,gg,b),blue=b>r*1.065&&b>gg*.985;if((row===0?(x<43||x>85):row===1?((y<130||x<49||x>82)&&y<137&&x>33&&x<95):row===2?x>73:x<54)&&original.data[i+3]>20&&max<165&&max-min<45&&!blue){over.set(d.subarray(i,i+4),i);}}const hair=document.createElement('canvas');hair.width=128;hair.height=192;hair.getContext('2d').putImageData(new ImageData(over,128,192),0,0);ctx.drawImage(hair,0,0);}

 drawAccessories(ctx,{gender:g,row,col,outfit:o,headCenter:64-baseFrame(g,row,0).offset[0],drift:baseFrame(g,row,0).offset[0]-original.offset[0]});
 if(wardrobeFrames.size>180)wardrobeFrames.delete(wardrobeFrames.keys().next().value);wardrobeFrames.set(key,c);return c;}
function drawHuman(c,{pose='idle',face=1,back=false,time=0,preview=false,outfitOverride=null,settled=false,heading=null,gaitAmount=1}={}){if((outfitOverride||currentOutfit()).dress!=='trench-set'&&drawAction(c,closet.gender,pose))return;c.width=128;c.height=192;if(!sources[closet.gender])return;if(pose==='walk')direction=Number.isInteger(heading)&&heading>=0&&heading<4?heading:back?1:face<0?2:3;if(pose==='sit')direction=face<0?2:3;const row=preview?(Number.isInteger(heading)?heading:0):direction,frame=pose==='walk'?walkFrame(time):0,ctx=c.getContext('2d'),o=outfitOverride||currentOutfit();ctx.clearRect(0,0,128,192);ctx.imageSmoothingEnabled=false;ctx.save();const offset=baseFrame(closet.gender,row,pose==='walk'?0:frame).offset;ctx.translate(offset[0],offset[1]);
 const now=performance.now();let motion=canvasPose.get(c);if(!motion){motion={pose,from:0,to:pose==='sit'?1:0,start:now};canvasPose.set(c,motion);}if(motion.pose!==pose){const p=Math.min(1,(now-motion.start)/280),value=motion.from+(motion.to-motion.from)*p;motion={pose,from:value,to:pose==='sit'?1:0,start:now};canvasPose.set(c,motion);}const progress=settled?1:Math.min(1,(now-motion.start)/280),amount=motion.from+(motion.to-motion.from)*(.5-.5*Math.cos(progress*Math.PI));
 if(pose==='walk'){drawWalking(ctx,closet.gender,row,o,time,gaitAmount);}else if(!preview&&amount>.001)drawSitting(ctx,closet.gender,row<2?(face<0?2:3):row,o,amount);else ctx.drawImage(clothedFrame(closet.gender,row,frame,o),0,0);
 if(pose==='water'){const sway=Math.sin(time*5)*2;ctx.save();const hand=closet.gender==='female'?(row===2?[41,132]:[91,134]):(row===2?[45,142]:[90,143]);ctx.translate(hand[0]+(row===2?9:-9),hand[1]+1);if(row===2)ctx.scale(-1,1);ctx.rotate((12+sway)*Math.PI/180);ctx.fillStyle='#a6c8c0';ctx.strokeStyle='#6b8379';ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(-1,0,20,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(9,-1,6,Math.PI,0);ctx.stroke();ctx.fillStyle='#bfd8c8';ctx.beginPath();ctx.moveTo(18,3);ctx.lineTo(31,-4);ctx.lineTo(33,1);ctx.lineTo(19,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
 ctx.restore();
}
const imageSurfaces=new WeakMap(),imageFrames=new Map();
export function paintHumans(root,opts={}){root.querySelectorAll('.human-image').forEach(image=>{let surface=imageSurfaces.get(image);if(!surface){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=192;surface={canvas,key:null};imageSurfaces.set(image,surface);}const pose=opts.pose||'idle',row=pose==='walk'?(Number.isInteger(opts.heading)?opts.heading:opts.back?1:opts.face<0?2:3):pose==='sit'?(opts.face<0?2:3):direction,frame=pose==='walk'?gaitSample(opts.time,opts.gaitAmount??1).frame:pose==='water'?Math.floor((opts.time||0)*8)%48:pose==='sit'?Math.floor(performance.now()/50):0,key=[closet.gender,JSON.stringify(currentOutfit()),pose,row,frame,pose==='walk'?gaitSample(opts.time,opts.gaitAmount??1).amount:0].join('|');const action=currentOutfit().dress==='trench-set'?null:actionName(pose);image.setAttribute('x',action?'-86':'-43');image.setAttribute('y',action?'-192':'-119');image.setAttribute('width',action?'172':'86');image.setAttribute('height',action?'206.6667':'124');image.dataset.pose=action||pose;if(surface.key===key){if(image.getAttribute('href')!==surface.url)image.setAttribute('href',surface.url);return;}surface.key=key;let url=imageFrames.get(key);if(!url){drawHuman(surface.canvas,opts);url=surface.canvas.toDataURL('image/png');imageFrames.set(key,url);if(imageFrames.size>384)imageFrames.delete(imageFrames.keys().next().value);}else direction=row;surface.url=url;if(image.getAttribute('href')!==url)image.setAttribute('href',url);});}

export function humanSnapshot(opts={}){const c=document.createElement('canvas');c.width=128;c.height=192;drawHuman(c,opts);return c.toDataURL();}

// Bend the illustrated leg pixels about real hips/knees for sitting; retain hair, hands, head and outfit layers.
const seatedParts=new Map(),canvasPose=new WeakMap();
function sittingParts(g,row,o){const key=[g,row,...Object.values(o)].join('|');if(seatedParts.has(key))return seatedParts.get(key);const full=clothedFrame(g,row,0,o),raw=baseFrame(g,row,0),pixels=full.getContext('2d').getImageData(0,0,128,192),mask=new Uint8Array(128*192),hip=g==='female'?(sources.femaleUnified?147:132):147,knee=163;
 for(let y=hip;y<192;y++)for(let x=35;x<95;x++){const i=(y*128+x)*4,r=raw.data[i],gg=raw.data[i+1],b=raw.data[i+2],max=Math.max(r,gg,b),min=Math.min(r,gg,b);if(raw.data[i+3]>120&&(b>r*1.07&&b>gg*.985||r>150&&r>gg*1.04&&gg>b*1.025||max>175&&max-min<55))mask[y*128+x]=1;}
 for(let y=hip+10;y<192;y++)for(let x=0;x<128;x++)if(raw.data[(y*128+x)*4+3]>10)mask[y*128+x]=1;
 const expanded=new Uint8Array(mask);for(let y=hip;y<191;y++)for(let x=1;x<127;x++)if(mask[y*128+x])for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(y+dy>=hip)expanded[(y+dy)*128+x+dx]=1;
 const make=which=>{const out=document.createElement('canvas');out.width=128;out.height=192;const d=new Uint8ClampedArray(pixels.data);for(let i=0;i<d.length;i+=4){const y=Math.floor(i/4/128),leg=expanded[i/4];if(which==='upper'?leg:!leg||which==='thigh'&&y>knee+1||which==='shin'&&y<knee-1)d[i+3]=0;}out.getContext('2d').putImageData(new ImageData(d,128,192),0,0);return out;};const value={upper:make('upper'),thigh:make('thigh'),shin:make('shin'),hip,knee};if(seatedParts.size>50)seatedParts.delete(seatedParts.keys().next().value);seatedParts.set(key,value);return value;}
function drawSitting(ctx,g,row,o,amount){const parts=sittingParts(g,row,o),angle=(row===2?1:-1)*amount*80*Math.PI/180,pivot=64;ctx.save();ctx.translate(pivot,parts.hip);ctx.rotate(angle);ctx.translate(-pivot,-parts.hip);ctx.drawImage(parts.thigh,0,0);ctx.restore();const length=parts.knee-parts.hip,x=-Math.sin(angle)*length,y=(Math.cos(angle)-1)*length;ctx.drawImage(parts.shin,x,y);ctx.drawImage(parts.upper,0,0);}

// Extract the original illustrated legs once. Hair and hands stay in the upper layer.
const walkingParts=new Map();
function walkParts(g,row,o){const key=[g,row,...Object.values(o)].join('|');if(walkingParts.has(key))return walkingParts.get(key);const full=clothedFrame(g,row,0,o),pixels=full.getContext('2d').getImageData(0,0,128,192),side=row>1,stride=side?clothedFrame(g,row,2,o):full,stridePixels=stride.getContext('2d').getImageData(0,0,128,192),hip=g==='female'?(sources.femaleUnified?141:134):145,upper=new Uint8ClampedArray(pixels.data),legs=[new Uint8ClampedArray(pixels.data.length),new Uint8ClampedArray(pixels.data.length)];
 const legPixel=(data,x,y)=>{const i=(y*128+x)*4,r=data[i],green=data[i+1],b=data[i+2];if(!data[i+3]||y<hip||x<8||x>119)return false;return !(g==='female'&&y<149&&Math.max(r,green,b)<110&&Math.max(r,green,b)-Math.min(r,green,b)<38);};
 for(let y=hip;y<192;y++)for(let x=8;x<120;x++){const i=(y*128+x)*4;if(legPixel(pixels.data,x,y))upper[i+3]=0;if(legPixel(stridePixels.data,x,y))legs[x<64?0:1].set(stridePixels.data.subarray(i,i+4),i);}
 const canvas=data=>{const c=document.createElement('canvas');c.width=128;c.height=192;c.getContext('2d').putImageData(new ImageData(data,128,192),0,0);return c;};const parts={upper:canvas(upper),legs:legs.map(canvas),hip};if(walkingParts.size>40)walkingParts.delete(walkingParts.keys().next().value);walkingParts.set(key,parts);return parts;}
function drawWalking(ctx,g,row,o,time,amount=1){const sample=gaitSample(time,amount),phase=sample.frame/GAIT_FRAMES*Math.PI*2,side=row>1,parts=walkParts(g,row,o),hip=parts.hip,knee=163,bottom=183;
 if(sample.amount===0){ctx.drawImage(clothedFrame(g,row,0,o),0,0);return;}ctx.save();ctx.imageSmoothingEnabled=true;
 for(let leg=0;leg<2;leg++){const swing=Math.sin(phase+leg*Math.PI),lift=Math.max(0,swing),stride=(side?18:2.5)*sample.amount,footX=swing*stride,footY=(-lift*5+(side?0:swing*2))*sample.amount;
  for(let y=hip;y<192;y+=2){const p=Math.min(1,(y-hip)/(knee-hip)),dx=(side?(leg===0?14:-14)*p:0)+footX*p,dy=footY*p;ctx.drawImage(parts.legs[leg],0,y,128,Math.min(2,192-y),dx,y+dy,128,Math.min(2,192-y));}
 }
 // The complete face, hair, hands and torso retain their original pixels and proportions.
 ctx.drawImage(parts.upper,0,0);ctx.restore();
}
