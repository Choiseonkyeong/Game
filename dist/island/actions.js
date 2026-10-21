// Eight illustrated key poses. Each pose is a single drawing, not an invented frame cycle.
export const ACTIONS=[['sitting','앉기'],['pickup','줍기'],['harvest','열매 따기'],['fishing','낚시'],['hoeing','괭이질'],['jump','점프'],['greeting','인사'],['highfive','하이파이브']];
const images={},aliases={sit:'sitting',plant:'pickup'};
export const actionName=pose=>{const name=aliases[pose]||pose;return ACTIONS.some(([id])=>id===name)?name:null;};
export async function loadActionSprites(){await Promise.all(['female','male'].map(async gender=>{const img=new Image();try{img.src=`art/humans/actions/${gender}.webp?v=24`;await img.decode();images[gender]=img;}catch{}}));}
export function drawAction(canvas,gender,pose){const name=actionName(pose),image=images[gender];if(!name||!image)return false;const index=ACTIONS.findIndex(([id])=>id===name);canvas.width=256;canvas.height=320;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,256,320);ctx.drawImage(image,index%4*256,Math.floor(index/4)*320,256,320,0,0,256,320);return true;}
