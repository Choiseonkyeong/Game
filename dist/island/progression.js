import{BALANCE}from'./balance.js?v=42';
// Expand existing art and its collision tiles together; keep the approved level-one scene.
// Growth compares the visible island (stage.island), not the whole picture: the level-one
// artwork is mostly sky, and measuring it inflated later islands 3-5x and shrank everyone on them.
const cache=new WeakMap();
export const footprint=s=>s?.island?{x:s.island[0],y:s.island[1],width:s.island[2],height:s.island[3]}:s?{x:s.x,y:s.y,width:s.width,height:s.height}:null;
export function terrainStage(data,level){
 if(!data)return null;let saved=cache.get(data);if(!saved){saved=new Map();cache.set(data,saved);}if(saved.has(level))return saved.get(level);
 const source=data?.stages?.[Math.min(data.stages.length,level)-1];if(!source)return null;
 if(level===1)return source;
 const previous=footprint(terrainStage(data,level-1)),factor=Math.max(1,previous.width*BALANCE.progression.axisGrowth/source.width,previous.height*BALANCE.progression.axisGrowth/source.height);
 if(factor===1)return source;
 const {hx,hy,ox,oy}=data.grid,cx=480,cy=400;
 const transform=(x,y)=>[cx+(x-cx)*factor,cy+(y-cy)*factor];
 const cells=new Map();for(const[c,r]of source.cells)for(let dc=-.5;dc<.5;dc+=.2)for(let dr=-.5;dr<.5;dr+=.2){const[x,y]=transform(ox+(c+dc-r-dr)*hx,oy+(c+dc+r+dr)*hy),u=(x-ox)/hx,v=(y-oy)/hy,n=[Math.round((u+v)/2),Math.round((v-u)/2)];cells.set(n.join(','),n);}
 const[x,y]=transform(source.x,source.y),[a,b,w,h]=source.house,[houseX,houseY]=transform(a,b);
 const result={...source,x,y,width:source.width*factor,height:source.height*factor,house:[houseX,houseY,w*factor,h*factor],cells:[...cells.values()]};saved.set(level,result);return result;
}
