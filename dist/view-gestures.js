// CSS-pixel pinch transform. Anchor stays beneath the midpoint; no game state is mutated.
export const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
export function fitRoom(w,h,camera={x:.2,y:.43},zoom=1.08,overview=false){const scale=(overview?Math.min(w/1536,h/1024):Math.max(w/1536,h/1024))*zoom,rw=1536*scale,rh=1024*scale;return{rw,rh,tx:rw<=w?(w-rw)/2:limit(w/2-camera.x*rw,w-rw,0),ty:rh<=h?(h-rh)/2:limit(h/2-camera.y*rh,h-rh,0),w,h};}
export function pinchTransform(start,a,b,min=1,max=3){const dx=b.x-a.x,dy=b.y-a.y,distance=Math.max(1,Math.hypot(dx,dy)),middle={x:(a.x+b.x)/2,y:(a.y+b.y)/2},scale=limit(start.scale*distance/start.distance,min,max),ratio=scale/start.scale;return{scale,x:middle.x-(start.middle.x-start.x)*ratio,y:middle.y-(start.middle.y-start.y)*ratio};}
export function pinchStart(a,b,transform){return{...transform,distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),middle:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};}
export function constrainFocus(v,w,h){const margin=30,extraX=w*(v.scale-1)/2,extraY=h*(v.scale-1)/2;return{scale:v.scale,x:limit(v.x,-extraX-margin,extraX+margin),y:limit(v.y,-extraY-margin,extraY+margin)};}
// Play framing: a portrait phone shows about half of the room width and, with the taller plates, nearly its full height.
export function stageScale(w,h,overview=false,roomH=1024){const contain=Math.min(w/1536,h/roomH),cover=Math.max(w/1536,h/roomH);if(overview)return contain;const want=w<h?Math.max(w/(1536*.5),h*.9/roomH):Math.max(w/(1536*.85),h*.6/roomH);return limit(want,contain,cover);}
export function stageFit(w,h,camera={x:.2,y:.43},zoom=1,overview=false,roomH=1024){const scale=stageScale(w,h,overview,roomH)*zoom,rw=1536*scale,rh=roomH*scale;return{rw,rh,tx:rw<=w?(w-rw)/2:limit(w/2-camera.x*rw,w-rw,0),ty:rh<=h?(h-rh)/2:limit(h/2-camera.y*rh,h-rh,0),w,h,scale};}
// Geometry of the original 1536×1024 room inside a taller plate that adds `top` rows above it.
export const innerGeometry=(g,top)=>({tx:g.tx,ty:g.ty+top*g.scale,rw:1536*g.scale,rh:1024*g.scale,w:g.w,h:g.h,scale:g.scale});
export const PLATE={top:176,height:1360};
export function roomGeometry(w,h,camera,zoom=1,overview=false){return innerGeometry(stageFit(w,h,camera,zoom,overview,PLATE.height),PLATE.top);}
