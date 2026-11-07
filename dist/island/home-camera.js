// Fit the actual painted island, rather than the tall sky-background image.
export function homeViewBox(width,height,{zoom=1,stage=null,inside=false}={}){
 const aspect=Math.max(1,width)/Math.max(1,height);
 if(inside){const w=Math.max(960,800*aspect)/zoom;return[480-w/2,400-w/aspect/2,w,w/aspect];}
 const physical=stage?.compactReference?(stage.expansion||1):1;
 // Hold the framing through early expansions; only widen gently for very large islands.
 const expansion=Math.sqrt(Math.max(1,physical/1.6));
 // Fit the separated artwork below the existing HUD/toast, without changing that UI.
 if(stage?.approvedArt){
  const top=height<500?100:130,bottom=height<500?35:100;
  const h=Math.max(475*expansion*height/Math.max(100,height-top-bottom),630*expansion/(aspect*.88))/zoom,w=h*aspect;
  const centerY=430+(417.5-430)*expansion;
  return[480-w/2,centerY-(top+height-bottom)/2*h/height,w,h];
 }
 const bounds=stage&&!stage.reference&&!stage.compactReference
  ?{x:stage.x,y:stage.y,width:stage.width,height:stage.height}
  :{x:480+(225-480)*expansion,y:430+(185-430)*expansion,width:490*expansion,height:465*expansion};
 const h=Math.max(bounds.height/.72,bounds.width/(aspect*.88))/zoom,w=h*aspect;
 return[bounds.x+bounds.width/2-w/2,bounds.y+bounds.height/2-h/2,w,h];
}
