// Framing for a room smaller than the screen: the wall continues above and the floor below
// as softened edge colours (never a second copy of the room), with a soft hand-off at the picture edge.
const scratch={};
const edgeCanvas=()=>scratch.edge??=document.createElement('canvas');

export function paintMargins(c,room,{tx,ty,rw,rh,w,h},tint='#cfc5ad'){
 if(ty<=0&&tx<=0)return;c.save();c.filter='blur(22px)';
 if(ty>0){c.drawImage(room,0,0,1536,8,tx-60,-60,rw+120,ty+70);c.drawImage(room,0,1016,1536,8,tx-60,ty+rh-10,rw+120,h-ty-rh+70);}
 if(tx>0){c.drawImage(room,0,0,8,1024,-60,ty-60,tx+70,rh+120);c.drawImage(room,1528,0,8,1024,tx+rw-10,ty-60,w-tx-rw+70,rh+120);}
 c.restore();
 const fade=(x0,y0,x1,y1)=>{const gr=c.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,tint+'66');gr.addColorStop(1,tint+'00');return gr;};
 if(ty>0){c.fillStyle=fade(0,0,0,ty);c.fillRect(0,0,w,ty);c.fillStyle=fade(0,h,0,ty+rh);c.fillRect(0,ty+rh,w,h-ty-rh);}
 if(tx>0){c.fillStyle=fade(0,0,tx,0);c.fillRect(0,0,tx,h);c.fillStyle=fade(w,0,tx+rw,0);c.fillRect(tx+rw,0,w-tx-rw,h);}
}

export function featherEdges(c,room,{tx,ty,rw,rh}){
 if(ty<=0&&tx<=0)return;const band=Math.round(Math.min(46,Math.max(ty,tx)*.5));if(band<4)return;const e=edgeCanvas(),edges=[];
 if(ty>0)edges.push([0,0,1536,band*1024/rh,tx,ty,rw,band,0,0,0,band],[0,1024-band*1024/rh,1536,band*1024/rh,tx,ty+rh-band,rw,band,0,band,0,0]);
 if(tx>0)edges.push([0,0,band*1536/rw,1024,tx,ty,band,rh,0,0,band,0],[1536-band*1536/rw,0,band*1536/rw,1024,tx+rw-band,ty,band,rh,band,0,0,0]);
 for(const [sx,sy,sw,sh,dx,dy,dw,dh,gx0,gy0,gx1,gy1] of edges){
  e.width=Math.max(1,Math.round(dw));e.height=Math.max(1,Math.round(dh));const x=e.getContext('2d');
  x.filter='blur(9px)';x.drawImage(room,sx,sy,sw,sh,-12,-12,e.width+24,e.height+24);x.filter='none';
  x.globalCompositeOperation='destination-in';const gr=x.createLinearGradient(gx0,gy0,gx1,gy1);gr.addColorStop(0,'#000');gr.addColorStop(1,'#0000');x.fillStyle=gr;x.fillRect(0,0,e.width,e.height);
  c.drawImage(e,dx,dy,dw,dh);
 }
}
