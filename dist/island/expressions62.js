export const EXTRA_ACTIONS=[['smile','방긋 웃기'],['wink','윙크'],['surprise','깜짝 표정'],['shy','수줍은 인사'],['stretch','몸 풀기'],['dance','살랑 춤']];
export function drawExpression(ctx,{pose,row=0,gender='female'}={}){
 if(row!==0||!['smile','wink','surprise','shy'].includes(pose))return;
 const eyes=gender==='female'?[[50,68],[79,68]]:[[49,80],[81,80]],mouth=gender==='female'?[64,80]:[65,92];
 const skinAt=(x,y)=>{const m=ctx.getTransform(),p=ctx.getImageData(Math.round(m.a*x+m.c*y+m.e),Math.round(m.b*x+m.d*y+m.f),1,1).data;return `rgb(${p[0]} ${p[1]} ${p[2]})`;};
 ctx.save();ctx.globalAlpha=.38;ctx.fillStyle='#e8a3a2';for(const[x,y]of eyes){ctx.beginPath();ctx.ellipse(x-1,y+11,5,2.4,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 if(pose==='wink'){
  const[x,y]=eyes[1];
  ctx.fillStyle=skinAt(x,y+12);ctx.beginPath();ctx.ellipse(x,y,8,9,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#73524a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-6,y);ctx.quadraticCurveTo(x,y+4,x+6,y-1);ctx.stroke();
 }
 if(pose==='smile'||pose==='surprise'){ctx.fillStyle=skinAt(mouth[0]-7,mouth[1]-3);ctx.beginPath();ctx.ellipse(mouth[0],mouth[1]+1,5.5,3,0,0,Math.PI*2);ctx.fill();}
 if(pose==='surprise'){ctx.fillStyle='#a66a61';ctx.beginPath();ctx.ellipse(mouth[0],mouth[1]+1,2.2,3,0,0,Math.PI*2);ctx.fill();}
 if(pose==='smile'){ctx.fillStyle='#c58e85';ctx.beginPath();ctx.moveTo(mouth[0]-4,mouth[1]);ctx.quadraticCurveTo(mouth[0],mouth[1]+8,mouth[0]+4,mouth[1]);ctx.fill();}
 ctx.restore();
}
