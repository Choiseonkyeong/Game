'use strict';
// 1. Change only these paths when your transparent layer files are ready.
const AVATAR = {
  width:1230, height:1278,
  base:'./images/character.png',
  // The current base is the full original character. For fully replaceable clothes,
  // later change base to './images/body.png' and fill in the layer paths below.
  layers:{hair:null,bottom:null,top:null,outer:null,accessory:null,hat:null},
  offsets:{body:{x:0,y:0,scale:1},hair:{x:0,y:0,scale:1},bottom:{x:0,y:0,scale:1},top:{x:0,y:0,scale:1},outer:{x:0,y:0,scale:1},accessory:{x:0,y:0,scale:1},hat:{x:0,y:0,scale:1}}
};
// 2. Reusable renderer: both the world and closet use this same object.
class PogeunAvatar {
  constructor(config,roots,onStatus=()=>{}){this.config=config;this.roots=roots;this.onStatus=onStatus;this.order=['body','hair','bottom','top','outer','accessory','hat'];this.images=new Map();this.requests=new Map();this.load('body',config.base);for(const [slot,src] of Object.entries(config.layers))if(src)this.load(slot,src)}
  load(slot,src){if(!this.order.includes(slot)||!src)return Promise.resolve(false);const token=Symbol();this.requests.set(slot,token);return new Promise(resolve=>{const img=new Image();img.onload=()=>{if(this.requests.get(slot)!==token){resolve(false);return}this.images.set(slot,img);this.render();this.onStatus(slot==='body'?'포근이가 섬에 도착했어요!':'옷장과 게임에 바로 반영했어요.');resolve(true)};img.onerror=()=>{if(this.requests.get(slot)===token)this.onStatus('이미지를 찾지 못했어요. images 폴더와 파일 이름을 확인해 주세요.');resolve(false)};img.src=src})}
  remove(slot){if(slot==='body')return;this.requests.delete(slot);this.images.delete(slot);this.render()}
  reset(){for(const slot of this.order)if(slot!=='body')this.remove(slot);for(const [slot,src] of Object.entries(this.config.layers))if(src)this.load(slot,src)}
  render(){for(const root of this.roots){root.style.setProperty('--avatar-ratio',`${this.config.width} / ${this.config.height}`);root.replaceChildren();for(const slot of this.order){const image=this.images.get(slot);if(!image)continue;const img=document.createElement('img'),p=this.config.offsets[slot]||{};img.src=image.src;img.alt='';img.className='avatar-layer';img.dataset.slot=slot;img.style.setProperty('--x',((p.x||0)/this.config.width*100)+'%');img.style.setProperty('--y',((p.y||0)/this.config.height*100)+'%');img.style.setProperty('--scale',String(p.scale??1));root.append(img)}}}
  // Use this in a Canvas game loop. x/y are the feet position, width is display size.
  draw(ctx,x,y,width=120){const frame=this.config,height=width*frame.height/frame.width;ctx.save();ctx.translate(x-width/2,y-height);for(const slot of this.order){const img=this.images.get(slot);if(!img)continue;const p=frame.offsets[slot]||{},fit=Math.min(frame.width/img.naturalWidth,frame.height/img.naturalHeight),scale=p.scale??1,w=img.naturalWidth*fit,h=img.naturalHeight*fit;ctx.drawImage(img,((p.x||0)+(frame.width-w)/2*scale)/frame.width*width,((p.y||0)+(frame.height-h)/2*scale)/frame.height*height,w*scale/frame.width*width,h*scale/frame.height*height)}ctx.restore()}
}
const status=document.querySelector('#status');
const avatar=new PogeunAvatar(AVATAR,[document.querySelector('#worldAvatar'),document.querySelector('#closetAvatar')],message=>{status.textContent=message;document.querySelector('#closetStatus').textContent=message});
// Optional external API: after a shop purchase, call await avatar.load('top','./images/top.png').
window.avatar=avatar;
const closet=document.querySelector('#closet');document.querySelector('#openCloset').onclick=document.querySelector('#player').onclick=()=>closet.showModal();document.querySelector('#closeCloset').onclick=()=>closet.close();document.querySelector('#reset').onclick=()=>{avatar.reset();status.textContent='기본 모습으로 돌아왔어요.'};document.querySelector('#removeLayer').onclick=()=>avatar.remove(document.querySelector('#slot').value);
document.querySelector('#upload').onchange=async event=>{const file=event.target.files[0];if(!file)return;if(file.type!=='image/png'){document.querySelector('#closetStatus').textContent='투명 배경 PNG를 골라 주세요.';return}if(file.size>15*1024*1024){document.querySelector('#closetStatus').textContent='15MB 이하 PNG를 골라 주세요.';return}const slot=document.querySelector('#slot').value;try{const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});await avatar.load(slot,src)}catch{document.querySelector('#closetStatus').textContent='파일을 읽을 수 없어요. 다시 선택해 주세요.'}event.target.value=''};
