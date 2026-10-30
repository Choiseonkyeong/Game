import test from 'node:test';import assert from 'node:assert/strict';
import{wardrobeDisplay,usePaintedReference}from'../dist/island/wardrobe-display.js';
import{createWardrobeScreen}from'../dist/island/wardrobe-screen.js';
import{outfitAction,outfitActionPlan,drawOutfitAction}from'../dist/island/outfit-actions.js';
test('a dress over the old black-shorts combination never uses the painted base preview',()=>{
 const o={top:'white-tee',bottom:'black-shorts',dress:'ribbon-dress'};
 for(const heading of [0,1,2,3])assert.equal(usePaintedReference(o,{female:true,preview:false,heading}),false);
 const d=wardrobeDisplay(o);assert.equal(d.topName,'리본 데일리 원피스');assert.equal(d.bottomName,'원피스 세트 하의');assert.equal(d.topIcon,'ribbon-dress');
 assert(usePaintedReference({...o,dress:'none'},{female:true,preview:false,heading:0}));
 assert.equal(wardrobeDisplay({...o,dress:'knit-set'}).bottomName,'플리츠 스커트');
});
test('real wardrobe click handlers keep dress preview, selected state and equipped rows in sync',()=>{
 let html='',buttons=[],outfit={top:'white-tee',bottom:'black-shorts',dress:'none'},snapshots=[];
 const api={paper:{querySelector:()=>({}),querySelectorAll:()=>buttons},dialog:{classList:{add(){}}},currentOutfit:()=>outfit,humanChoice:()=> 'female',shells:()=>300,say(){},changed(){},saveLook(){},done(){},humanSnapshot:options=>{snapshots.push(options);return'data:image/png;base64,preview';},wearItem:(slot,id)=>{outfit[slot]=id;if(slot==='top'||slot==='bottom')outfit.dress='none';},modal:s=>{html=s;buttons=[...s.matchAll(/data-wui="([^"]+)"/g)].map(m=>({dataset:{wui:m[1]}}));}};
 const screen=createWardrobeScreen(api),click=act=>{const b=buttons.find(x=>x.dataset.wui===act);assert(b,act);b.onclick({stopPropagation(){}});};
 screen.open();assert(!html.includes('class="wui-person"'));
 click('category:dress');click('item:ribbon-dress');assert(html.includes('class="wui-person"'));assert.equal(snapshots.at(-1).outfitOverride.dress,'ribbon-dress');assert.match(html,/wui-top-name">리본 데일리 원피스/);assert.match(html,/wui-bottom-name">원피스 세트 하의/);
 click('rotate');assert.equal(snapshots.at(-1).heading,3);
 click('category:bottom');click('item:skirt');assert.equal(outfit.dress,'none');assert.match(html,/wui-bottom-name">리본 스커트/);assert.match(html,/wui-top-name">기본 흰 반팔/);
 click('category:top');click('item:cardigan');assert.match(html,/wui-top-name">민트 가디건/);assert.match(html,/wui-bottom-name">리본 스커트/);
 click('category:dress');click('item:knit-set');assert.match(html,/wui-top-name">파스텔 루즈 니트/);assert.match(html,/wui-bottom-name">플리츠 스커트/);
});
test('every daily-outfit action has an explicit pose, mirrors direction and animates without idle fallback',()=>{
 for(const pose of ['harvest','fishing','pickup','hoeing','jump','greeting','highfive']){
  assert(outfitAction(pose));const a=outfitActionPlan(pose,0,1,3),b=outfitActionPlan(pose,0,-1,2);
  assert(a.leftAngle||a.rightAngle||a.y||a.tilt);assert(b.leftAngle||b.rightAngle||b.y||b.tilt);
  assert(Object.values(a).every(v=>typeof v!=='number'||Number.isFinite(v)));
  assert.notDeepEqual(a,outfitActionPlan(pose,.5,1,3));
 }
 assert.equal(outfitActionPlan('idle'),null);assert.equal(outfitActionPlan('fishing').tool,'fishing');assert.equal(outfitActionPlan('hoeing').tool,'hoeing');
});
test('articulated actions preserve the selected shirt and face pixels rather than drawing a base outfit',()=>{
 const oldDocument=globalThis.document,oldImageData=globalThis.ImageData;
 class Data {constructor(data,width,height){this.data=data;this.width=width;this.height=height;}}
 function canvas(){let data=new Uint8ClampedArray(128*192*4);return{width:128,height:192,getContext(){return{getImageData(){return{data:new Uint8ClampedArray(data)};},putImageData(image){data=new Uint8ClampedArray(image.data);}};}};}
 globalThis.ImageData=Data;globalThis.document={createElement:()=>canvas()};
 try{const original=new Uint8ClampedArray(128*192*4),pixels=new Uint8ClampedArray(original.length);const fill=(data,x1,y1,x2,y2,color)=>{for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++)data.set(color,(y*128+x)*4);};
  fill(original,40,15,89,100,[65,45,40,255]);fill(original,48,35,80,85,[238,202,174,255]);fill(original,48,105,81,125,[245,240,230,255]);fill(original,40,120,51,144,[238,202,174,255]);fill(original,80,120,90,144,[238,202,174,255]);pixels.set(original);fill(pixels,48,105,81,125,[207,180,196,255]);const source=canvas();source.getContext().putImageData(new Data(pixels,128,192));
  const draws=[],ctx={save(){},restore(){},translate(){},rotate(){},drawImage(c){draws.push(c);}};
  assert(drawOutfitAction(ctx,source,original,{pose:'greeting',time:0,row:0,face:1,key:'test-pastel-knit'}));assert.equal(draws.length,3);
  const body=draws[0].getContext().getImageData().data,face=(50*128+60)*4,shirt=(110*128+64)*4;
  assert.deepEqual([...body.slice(face,face+4)],[238,202,174,255]);assert.deepEqual([...body.slice(shirt,shirt+4)],[207,180,196,255]);
  for(const arm of draws.slice(1))assert.equal(arm.getContext().getImageData().data[face+3],0);
 }finally{globalThis.document=oldDocument;globalThis.ImageData=oldImageData;}
});
