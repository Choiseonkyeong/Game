// Framing for a room smaller than the screen: the wall continues above and the floor below
// as softened edge colours (never a second copy of the room), with a soft hand-off at the picture edge.
// Softening uses shrink-then-enlarge instead of canvas `filter`, which older iPhone browsers ignore.
const scratch={};
const pad=(key)=>scratch[key]??=document.createElement('canvas');

// Draws a source region blurred: copy into a tiny canvas, then stretch it back with smoothing.
export function softDraw(ctx,src,sx,sy,sw,sh,dx,dy,dw,dh,factor=8,key='soft'){
 const t=pad(key),w=Math.max(2,Math.round(Math.abs(dw)/factor)),h=Math.max(2,Math.round(Math.abs(dh)/factor));
 if(t.width!==w)t.width=w;if(t.height!==h)t.height=h;const x=t.getContext('2d');if(!x)return;
 x.clearRect(0,0,w,h);x.imageSmoothingEnabled=true;x.drawImage(src,sx,sy,sw,sh,0,0,w,h);
 const smooth=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=true;if('imageSmoothingQuality'in ctx)ctx.imageSmoothingQuality='high';ctx.drawImage(t,0,0,w,h,dx,dy,dw,dh);ctx.imageSmoothingEnabled=smooth;
}

export function paintMargins(c,room,{tx,ty,rw,rh,w,h},tint='#cfc5ad'){
 if(ty<=0&&tx<=0)return;const SW=room.width,SH=room.height;
 if(ty>0){softDraw(c,room,0,0,SW,10,tx-60,-60,rw+120,ty+72,24);softDraw(c,room,0,SH-10,SW,10,tx-60,ty+rh-12,rw+120,h-ty-rh+72,24);}
 if(tx>0){softDraw(c,room,0,0,10,SH,-60,ty-60,tx+72,rh+120,24);softDraw(c,room,SW-10,0,10,SH,tx+rw-12,ty-60,w-tx-rw+72,rh+120,24);}
 const fade=(x0,y0,x1,y1)=>{const gr=c.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,tint+'66');gr.addColorStop(1,tint+'00');return gr;};
 if(ty>0){c.fillStyle=fade(0,0,0,ty);c.fillRect(0,0,w,ty);c.fillStyle=fade(0,h,0,ty+rh);c.fillRect(0,ty+rh,w,h-ty-rh);}
 if(tx>0){c.fillStyle=fade(0,0,tx,0);c.fillRect(0,0,tx,h);c.fillStyle=fade(w,0,tx+rw,0);c.fillRect(tx+rw,0,w-tx-rw,h);}
}

export function featherEdges(c,room,{tx,ty,rw,rh}){
 if(ty<=0&&tx<=0)return;const SW=room.width,SH=room.height;const band=Math.round(Math.min(46,Math.max(ty,tx)*.5));if(band<4)return;const e=pad('edge'),edges=[];
 if(ty>0)edges.push([0,0,SW,band*SH/rh,tx,ty,rw,band,0,0,0,band],[0,SH-band*SH/rh,SW,band*SH/rh,tx,ty+rh-band,rw,band,0,band,0,0]);
 if(tx>0)edges.push([0,0,band*SW/rw,SH,tx,ty,band,rh,0,0,band,0],[SW-band*SW/rw,0,band*SW/rw,SH,tx+rw-band,ty,band,rh,band,0,0,0]);
 for(const [sx,sy,sw,sh,dx,dy,dw,dh,gx0,gy0,gx1,gy1] of edges){
  e.width=Math.max(1,Math.round(dw));e.height=Math.max(1,Math.round(dh));const x=e.getContext('2d');if(!x)return;
  softDraw(x,room,sx,sy,sw,sh,0,0,e.width,e.height,6,'band');
  x.globalCompositeOperation='destination-in';const gr=x.createLinearGradient(gx0,gy0,gx1,gy1);gr.addColorStop(0,'#000');gr.addColorStop(1,'#0000');x.fillStyle=gr;x.fillRect(0,0,e.width,e.height);
  c.drawImage(e,dx,dy,dw,dh);
 }
}

// iPhone browsers keep canvas memory after leaving a page; shrinking canvases to zero frees it immediately.
export function releaseCanvases(list){for(const c of list)if(c&&'width'in c){c.width=0;c.height=0;}for(const c of Object.values(scratch)){c.width=0;c.height=0;}}
