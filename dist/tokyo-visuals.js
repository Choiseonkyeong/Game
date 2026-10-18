// One registered counter, one set of rails. Room and close-up use these same source coordinates.
export const DRAWER_VIEW={x:0,y:330,width:520,height:650};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export const quadPoint=(q,u,v)=>mix(mix(q[0],q[1],u),mix(q[3],q[2],u),v);
export function drawerGeometry(amount){
 const p=Math.max(0,Math.min(1,amount)),back=[[0,548],[488,500]],front=[[-12*p,548+190*p],[488+12*p,500+190*p]],height=155;
 return {amount:p,tray:[back[0],back[1],front[1],front[0]],floor:[[0,548-190*(1-p)],[488,500-190*(1-p)],[500,690-190*(1-p)],[-12,738-190*(1-p)]],front:[front[0],front[1],[front[1][0],front[1][1]+height],[front[0][0],front[0][1]+height]],slot:[back[0],back[1],[488,655],[0,703]]};
}
export function envelopeQuad(amount,n){const q=drawerGeometry(1).tray,i=[12,27,31].indexOf(n),u=.07+i*.3,offset=190*(Math.max(0,Math.min(1,amount))-1);return [quadPoint(q,u,.1),quadPoint(q,u+.22,.1),quadPoint(q,u+.22,.88),quadPoint(q,u,.88)].map(([x,y])=>[x,y+offset]);}
export const toDrawerBoard=p=>({x:(p.x-DRAWER_VIEW.x)*800/DRAWER_VIEW.width,y:(p.y-DRAWER_VIEW.y)*1000/DRAWER_VIEW.height});
export const fromDrawerBoard=p=>({x:p.x*DRAWER_VIEW.width/800+DRAWER_VIEW.x,y:p.y*DRAWER_VIEW.height/1000+DRAWER_VIEW.y});
export function envelopeCentre(amount,n){const p=quadPoint(envelopeQuad(amount,n),.5,.5);return toDrawerBoard({x:p[0],y:p[1]});}
export function polygon(c,q){c.beginPath();q.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
// Affine triangles sample only the original sloping wooden face, never a rectangular crop of books above it.
export function drawQuad(c,image,source,target){
 for(const ids of [[0,1,2],[0,2,3]]){
  const s=ids.map(i=>source[i]),d=ids.map(i=>target[i]),ux=s[1][0]-s[0][0],uy=s[1][1]-s[0][1],vx=s[2][0]-s[0][0],vy=s[2][1]-s[0][1],det=ux*vy-uy*vx;if(Math.abs(det)<.0001)continue;
  const a=((d[1][0]-d[0][0])*vy-(d[2][0]-d[0][0])*uy)/det,b=((d[1][1]-d[0][1])*vy-(d[2][1]-d[0][1])*uy)/det;
  const cc=((d[2][0]-d[0][0])*ux-(d[1][0]-d[0][0])*vx)/det,dd=((d[2][1]-d[0][1])*ux-(d[1][1]-d[0][1])*vx)/det;
  c.save();polygon(c,d);c.clip();c.transform(a,b,cc,dd,d[0][0]-a*s[0][0]-cc*s[0][1],d[0][1]-b*s[0][0]-dd*s[0][1]);c.drawImage(image,0,0);c.restore();
 }
}
export function paintCounterDrawer(c,assets,state,{top=176,lift=null}={}){
 const g=drawerGeometry(state.drawer),p=g.amount;
 c.save();polygon(c,g.slot);c.clip();const dark=c.createLinearGradient(0,500,0,710);dark.addColorStop(0,'#261d13');dark.addColorStop(1,'#6a4d30');c.fillStyle=dark;c.fillRect(-5,495,510,230);c.restore();
 if(p>.001){
  c.save();polygon(c,g.tray);c.clip();drawQuad(c,assets.interior,[[0,125],[1536,125],[1536,760],[0,760]],g.floor);c.restore();
  c.save();polygon(c,g.tray);c.clip();for(const n of [12,27,31]){if(n===27&&state.negative)continue;const q=envelopeQuad(p,n).map(([x,y])=>[x,y+(lift?.n===n?lift.spring.value*.22:0)]),sx=8+[12,27,31].indexOf(n)*300;drawQuad(c,assets.papers,[[sx,160],[sx+292,160],[sx+292,536],[sx,536]],q);}c.restore();
  for(const edge of [[g.tray[0],g.tray[3]],[g.tray[1],g.tray[2]]]){c.save();c.strokeStyle='#9f754b';c.lineWidth=5;c.beginPath();c.moveTo(...edge[0]);c.lineTo(...edge[1]);c.stroke();c.restore();}
 }
 c.save();c.shadowColor='#2b21183d';c.shadowBlur=3+4*p;c.shadowOffsetY=2+3*p;polygon(c,g.front);c.fillStyle='#a8794d';c.fill();c.restore();
 drawQuad(c,assets.room,[[0,619+top],[488,552+top],[488,645+top],[0,714+top]],g.front);
 // Contact shadow is attached to the fixed back edge and never floats on the tabletop.
 c.save();c.strokeStyle='#281b1438';c.lineWidth=2;c.beginPath();c.moveTo(...g.tray[0]);c.lineTo(...g.tray[1]);c.stroke();c.restore();
 return g;
}
export function paintDeskLight(c,on){if(!on)return;c.save();c.globalCompositeOperation='screen';c.translate(470,378);c.scale(1,.28);let g=c.createRadialGradient(0,0,4,0,0,135);g.addColorStop(0,'#ffe7b023');g.addColorStop(.45,'#ffe6b013');g.addColorStop(1,'#ffe6b000');c.fillStyle=g;c.fillRect(-140,-140,280,280);c.restore();c.save();g=c.createRadialGradient(459,286,2,459,286,32);g.addColorStop(0,'#fff2d42c');g.addColorStop(1,'#fff2d400');c.fillStyle=g;c.fillRect(425,252,68,68);c.restore();}
