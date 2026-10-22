// Original four-view artwork. Remove only the edge-connected white backdrop at load.
let sheet;
const views=[[155,60,310,455],[570,60,290,455],[170,540,300,440],[560,540,300,440]];
const frames=new Map();
export async function loadTrenchOutfit(){
 const image=new Image();image.src='art/humans/trench-set-37.png';await image.decode();
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data,w=c.width,h=c.height;
 const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let start=0,end=0;
 const add=i=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4;if(d[p]>232&&d[p+1]>232&&d[p+2]>232)queue[end++]=i;};
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
 while(start<end){const i=queue[start++];d[i*4+3]=0;if(i%w)add(i-1);if(i%w<w-1)add(i+1);add(i-w);add(i+w);}
 ctx.putImageData(pixels,0,0);sheet=c;
}
export function trenchFrame(row=0){
 if(!sheet)return null;if(frames.has(row))return frames.get(row);
 const [sx,sy,sw,sh]=views[row],c=document.createElement('canvas');c.width=128;c.height=192;
 const scale=175/sh,ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(sheet,sx,sy,sw,sh,64-sw*scale/2,182-sh*scale,sw*scale,sh*scale);frames.set(row,c);return c;
}
