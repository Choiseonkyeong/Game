// Fit the actual painted island, rather than the tall sky-background image.
export function homeViewBox(width,height,{zoom=1,stage=null,inside=false}={}){
 const aspect=Math.max(1,width)/Math.max(1,height);
 if(inside){const w=Math.max(960,800*aspect)/zoom;return[480-w/2,400-w/aspect/2,w,w/aspect];}
 const physical=stage?.compactReference?(stage.expansion||1):1;
 // Hold the framing through early expansions; only widen gently for very large islands.
 const expansion=Math.sqrt(Math.max(1,physical/1.6));
 const bounds=stage&&!stage.reference&&!stage.compactReference
  ?{x:stage.x,y:stage.y,width:stage.width,height:stage.height}
  :{x:480+(225-480)*expansion,y:430+(185-430)*expansion,width:490*expansion,height:465*expansion};
 const h=Math.max(bounds.height/.72,bounds.width/(aspect*.88))/zoom,w=h*aspect;
 return[bounds.x+bounds.width/2-w/2,bounds.y+bounds.height/2-h/2,w,h];
}
