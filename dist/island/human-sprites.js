import{WARDROBE_KEY,ITEMS,restoreWardrobe,cleanOutfit}from'./wardrobe.js?v=5';
let closet=restoreWardrobe(null),sources={},direction=0;
try{const raw=localStorage.getItem(WARDROBE_KEY);closet=restoreWardrobe(raw);if(!raw&&localStorage.getItem('pogeun-human-choice-v1')==='male')closet.gender='male';}catch{}
const save=()=>{try{localStorage.setItem(WARDROBE_KEY,JSON.stringify(closet));}catch{}};
export const humanChoice=()=>closet.gender;
export const currentOutfit=()=>closet[closet.gender];
export const savedLooks=()=>closet.looks;
export function chooseHuman(gender){if(!['female','male'].includes(gender))return;closet.gender=gender;direction=0;save();}
export function wearItem(slot,value){if(!ITEMS[slot]?.some(i=>i[0]===value))return false;closet[closet.gender][slot]=value;save();return true;}
export function saveLook(){closet.looks.unshift({gender:closet.gender,outfit:{...currentOutfit()}});closet.looks=closet.looks.slice(0,6);save();}
export function loadLook(i){const look=closet.looks[i];if(!look)return;closet[closet.gender]=cleanOutfit(look.outfit,closet.gender);save();}
export async function loadHumanSprites(){await Promise.all(['female','male'].map(async g=>{const img=new Image();img.src=`art/humans/${g}.webp`;await img.decode();const c=document.createElement('canvas');c.width=768;c.height=768;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,768,768);for(let i=0;i<d.data.length;i+=4){if(d.data[i]>140&&d.data[i+2]>105&&d.data[i+1]<Math.min(d.data[i],d.data[i+2])*.65)d.data[i+3]=0;}x.putImageData(d,0,0);sources[g]=c;}));}
export function humanMarkup(){return '<foreignObject x="-43" y="-119" width="86" height="124" pointer-events="none"><canvas xmlns="http://www.w3.org/1999/xhtml" class="human-canvas" width="128" height="192" style="display:block;width:86px;height:124px;image-rendering:pixelated"></canvas></foreignObject>';}
const palette={...Object.fromEntries(Object.values(ITEMS).flat().map(i=>[i[0],i[2]]))};
function drawHuman(c,{pose='idle',face=1,back=false,time=0,preview=false,outfitOverride=null}={}){
 const g=closet.gender,o=outfitOverride||currentOutfit(),ctx=c.getContext('2d');ctx.clearRect(0,0,128,192);ctx.imageSmoothingEnabled=false;
 if(pose==='walk')direction=back?1:face<0?2:3;
 const row=preview?0:direction,side=row>1,rear=row===1,sgn=row===2?-1:1,w=pose==='walk'?Math.sin(time*Math.PI*3.2):0,bob=pose==='walk'?-Math.abs(w)*1.8:Math.sin(time*2)*.35;
 ctx.save();ctx.translate(64,180+bob);ctx.scale(side?sgn:1,1);
 const ink='#73584a',skin='#f7d7bb',shade='#e7b99b',top=palette[o.top],bottom=palette[o.bottom],shoe=palette[o.shoes];ctx.lineWidth=1.5;ctx.lineJoin='round';
 function shape(points,color){ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
 function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
 function rounded(x,y,width,height,r,color){ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.beginPath();ctx.roundRect(x,y,width,height,r);ctx.fill();ctx.save();ctx.clip();ctx.fillStyle="#72584422";ctx.fillRect(x+width-3,y+2,3,height);ctx.fillRect(x+2,y+height-3,width-2,3);ctx.restore();ctx.stroke();}
 // Neck and cloth are independent layers; all clothes follow the same bones.
 const leg=(left)=>{const k=left?-1:1,swing=w*k,offset=side?swing*9:k*9,lift=Math.max(0,swing)*4;ctx.save();ctx.translate(offset,-lift);rounded(-5,-44,10,37,4,skin);if(['trousers','denim'].includes(o.bottom))rounded(-6,-45,12,34,3,bottom);else rounded(-6,-47,12,16,3,bottom);if(o.shoes!=='sandals'){rounded(-6,-12,12,8,2,'#fff7e8');rounded(-8,-6,side?19:16,8,3,shoe);ctx.fillStyle='#fff7e7';ctx.fillRect(-6,-1,side?15:12,2);if(o.shoes==='boots')rounded(-7,-16,14,17,3,shoe);}else{rounded(-7,-5,16,7,3,skin);ctx.strokeStyle=shoe;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(5,-3);ctx.stroke();ctx.lineWidth=1.5;}ctx.restore();};
 leg(true);leg(false);
 if(g==='female'&&sources[g]){ctx.save();ctx.scale(side?sgn:1,1);const src=sources[g];if(rear){ctx.drawImage(src,12,192+70,104,61,-39,-115,78,46);}else{ctx.drawImage(src,10,row*192+75,28,53,side?-35:-40,-109,23,40);ctx.drawImage(src,90,row*192+75,28,53,side?12:17,-109,23,40);}ctx.restore();}
 if(o.bag==='backpack'&&(rear||side))rounded(-20,-84,40,36,8,'#b4c9aa');
 rounded(-6,-91,12,13,4,skin);
 const arm=(left)=>{const k=left?-1:1;ctx.save();ctx.translate(side?k*8:k*20,-77);ctx.rotate((side?w*k*22:w*k*7)*Math.PI/180);rounded(-6,-1,12,32,5,skin);const long=o.top.includes('hoodie')||o.top==='cardigan';rounded(-7,-3,14,long?27:13,4,o.top==='raglan'?'#8ba78b':top);oval(0,32,5,6,skin);ctx.restore();};
 if(side)arm(true);
 shape([[-19,-83],[-23,-47],[-16,-44],[16,-44],[23,-47],[19,-83],[8,-88],[-8,-88]],top);
 // two-tone cel shadow, no gradients.
 ctx.fillStyle='#806b6b20';ctx.fillRect(12,-77,7,28);
 if(o.top==='crop'){ctx.clearRect(-18,-52,36,7);rounded(-16,-52,32,9,2,skin);}
 if(o.top==='stripes'){ctx.fillStyle='#769bb6';for(let y=-75;y<-46;y+=8)ctx.fillRect(-18,y,36,3);}
 if(o.top==='raglan'){shape([[-20,-82],[-9,-87],[-15,-68]],'#8ba78b');shape([[20,-82],[9,-87],[15,-68]],'#8ba78b');}
 if(o.top.includes('hoodie')){ctx.strokeStyle='#9e90ad';ctx.beginPath();ctx.moveTo(-9,-84);ctx.quadraticCurveTo(0,-69,9,-84);ctx.stroke();if(!rear){rounded(-11,-60,22,10,3,top);ctx.strokeStyle='#fff4e1';ctx.beginPath();ctx.moveTo(-5,-78);ctx.lineTo(-5,-66);ctx.moveTo(5,-78);ctx.lineTo(5,-67);ctx.stroke();}}
 if(o.top==='cardigan'&&!rear){ctx.strokeStyle='#b3818a';ctx.beginPath();ctx.moveTo(0,-82);ctx.lineTo(0,-45);ctx.stroke();for(let y=-72;y<-46;y+=9)oval(3,y,1,1,'#fff7e3');}
 if(o.top==='sailor'&&!rear)shape([[-14,-83],[0,-68],[14,-83],[7,-84],[0,-76],[-7,-84]],'#6689a9');
 if(['skirt','pleats'].includes(o.bottom)){shape([[-19,-47],[19,-47],[27,-27],[-27,-27]],bottom);if(o.bottom==='pleats'){ctx.strokeStyle='#8fa17f';for(let x=-14;x<20;x+=8){ctx.beginPath();ctx.moveTo(x,-44);ctx.lineTo(x*1.3,-29);ctx.stroke();}}}
 if(!side)arm(true);arm(false);
 if(o.bag==='crossbody'){ctx.strokeStyle='#a57c60';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-17,-82);ctx.lineTo(19,-48);ctx.stroke();ctx.lineWidth=1.5;rounded(8,-58,22,19,5,'#bf9876');}
 if(o.bag==='tote'){rounded(19,-63,21,26,4,'#eadfc5');ctx.strokeStyle=ink;ctx.beginPath();ctx.arc(29,-65,6,Math.PI,0);ctx.stroke();}
 if(o.bag==='backpack'&&rear){rounded(-17,-76,34,26,7,'#b4c9aa');rounded(-11,-63,22,10,3,'#99b18d');}
 if(o.accessory==='scarf'){rounded(-13,-86,26,7,3,'#d1a791');shape([[4,-80],[13,-80],[16,-65],[7,-66]],'#d1a791');}
 if(o.accessory==='heart'&&!rear){ctx.fillStyle='#d497a4';ctx.font='12px sans-serif';ctx.fillText('♥',-5,-72);}
 // Original face/hair identity. Equal 86px head boxes for both genders.
 if(sources[g]){ctx.save();ctx.scale(side?sgn:1,1);const sy=row*192;const crop=g==='female'?[12,16,104,79]:[16,20,96,81];ctx.drawImage(sources[g],crop[0],sy+crop[1],crop[2],crop[3],-43,-166,86,72);ctx.restore();}
 if(o.accessory==='glasses'&&!rear){ctx.strokeStyle='#876f5d';ctx.lineWidth=1.2;for(const x of side?[15]:[-15,15]){ctx.beginPath();ctx.arc(x,-120,11,0,Math.PI*2);ctx.stroke();}if(!side){ctx.beginPath();ctx.moveTo(-4,-120);ctx.lineTo(4,-120);ctx.stroke();}}
 if(o.hat==='beret'){oval(0,-158,43,11,'#d89fae');oval(4,-170,3,3,'#c18c9a');}if(o.hat==='cap'){rounded(-35,-172,70,21,9,'#adcddd');oval(side?21:8,-151,32,5,'#91b3c7');}if(o.hat==='straw'){oval(0,-155,51,8,'#e7cc94');rounded(-28,-178,56,25,11,'#e7cc94');ctx.fillStyle='#bf967c';ctx.fillRect(-26,-160,52,4);}if(o.hat==='bow'){shape([[-7,-157],[-28,-171],[-28,-148]],'#e6b0bd');shape([[0,-157],[21,-171],[21,-148]],'#e6b0bd');oval(-4,-157,6,5,'#d095a7');}
 if(o.accessory==='flower'){for(let a=0;a<5;a++)oval(31+Math.cos(a*1.26)*5,-143+Math.sin(a*1.26)*5,4,4,'#fff0cb');oval(31,-143,3,3,'#d9ad69');}
 ctx.restore();
}
export function paintHumans(root,opts={}){root.querySelectorAll('.human-canvas').forEach(c=>drawHuman(c,opts));}
export function humanSnapshot(opts={}){const c=document.createElement('canvas');c.width=128;c.height=192;drawHuman(c,opts);return c.toDataURL();}
