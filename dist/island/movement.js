import{passable}from'./core.js?v=48';
// Tile size is configurable: sky islands use half-size tiles (art/world/sky-terrain.json).
export const GRID={hx:42,hy:20,ox:480,oy:210};
export function setGrid(g){for(const k of ['hx','hy','ox','oy'])if(Number.isFinite(g?.[k])&&g[k]>0)GRID[k]=g[k];}
export const project=(c,r)=>[GRID.ox+(c-r)*GRID.hx,GRID.oy+(c+r)*GRID.hy];
export const unproject=(x,y)=>[((x-GRID.ox)/GRID.hx+(y-GRID.oy)/GRID.hy)/2,((y-GRID.oy)/GRID.hy-(x-GRID.ox)/GRID.hx)/2];
export function lineClear(state,a,b,radius=.12){const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*20));for(let i=0;i<=n;i++){const p=i/n,c=a[0]+(b[0]-a[0])*p,r=a[1]+(b[1]-a[1])*p;for(const[dc,dr]of [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]])if(!passable(state,Math.round(c+dc),Math.round(r+dr)))return false;}return true;}
export function smoothRoute(state,path,position){if(!path.length)return[];const start=position?unproject(...position):path[0],points=[start,...path.filter((p,i)=>i||Math.hypot(p[0]-start[0],p[1]-start[1])>.01)],out=[start];let i=0;while(i<points.length-1){let j=points.length-1;while(j>i+1&&!lineClear(state,points[i],points[j]))j--;out.push(points[j]);i=j;}return out;}
export function nearestCell(state,position,fallback){const[c,r]=unproject(...position),cell=[Math.round(c),Math.round(r)];return passable(state,...cell)?cell:fallback;}
export const WALK_SPEED=72;
// Round safe corners in screen space; retain the original corner wherever a curve would touch furniture.
export function roundRoute(state,points){if(points.length<3)return points;const out=[points[0]];for(let i=1;i<points.length-1;i++){const a=project(...points[i-1]),b=project(...points[i]),c=project(...points[i+1]),la=Math.hypot(a[0]-b[0],a[1]-b[1]),lc=Math.hypot(c[0]-b[0],c[1]-b[1]);let radius=Math.min(14,la*.24,lc*.24),curve=null;for(let attempt=0;attempt<3&&radius>1;attempt++,radius*=.5){const p=[b[0]+(a[0]-b[0])*radius/la,b[1]+(a[1]-b[1])*radius/la],q=[b[0]+(c[0]-b[0])*radius/lc,b[1]+(c[1]-b[1])*radius/lc],candidate=Array.from({length:5},(_,k)=>{const t=k/4,v=1-t;return unproject(v*v*p[0]+2*v*t*b[0]+t*t*q[0],v*v*p[1]+2*v*t*b[1]+t*t*q[1]);});if(candidate.every((p,k)=>!k||lineClear(state,candidate[k-1],p))){curve=candidate;break;}}if(curve)out.push(...curve);else out.push(points[i]);}out.push(points.at(-1));return out;}
export function preciseRoute(state,path,start,worldTarget){const points=smoothRoute(state,path,start);if(!points.length||!worldTarget)return roundRoute(state,points);const end=unproject(...worldTarget),cell=path.at(-1);if(Math.round(end[0])===cell[0]&&Math.round(end[1])===cell[1]&&lineClear(state,cell,end)){const previous=points.at(-2)||points[0];if(points.length===1){if(Math.hypot(end[0]-previous[0],end[1]-previous[1])>.001)points.push(end);}else if(lineClear(state,previous,end))points[points.length-1]=end;else points.push(end);}return roundRoute(state,points);}

// Consume the whole frame's distance across every short corner segment.
// Dropping the remainder at each waypoint causes the visible pause on rounded turns.
export function advancePolyline(points,index,position,budget){
 let pos=[...position],travelled=0,tangent=[0,0];
 budget=Math.max(0,budget);
 while(index<points.length-1){const next=points[index+1],dx=next[0]-pos[0],dy=next[1]-pos[1],length=Math.hypot(dx,dy);
  if(length<1e-8){pos=[...next];index++;continue;}
  if(budget<=0)break;
  tangent=[dx/length,dy/length];const amount=Math.min(length,budget);pos=[pos[0]+tangent[0]*amount,pos[1]+tangent[1]*amount];travelled+=amount;budget-=amount;
  if(amount>=length-1e-8){pos=[...next];index++;}else break;
 }
 return{position:pos,index,travelled,tangent,done:index>=points.length-1};
}
export function remainingPath(points,index,position){let total=0,previous=position;for(let i=index+1;i<points.length;i++){total+=Math.hypot(points[i][0]-previous[0],points[i][1]-previous[1]);previous=points[i];}return total;}
export function walkingSpeed(speed,remaining,dt){const target=Math.min(WALK_SPEED,Math.sqrt(Math.max(0,remaining)*2*300)),change=360*Math.max(0,dt);return Math.max(0,speed+Math.max(-change,Math.min(change,target-speed)));}
