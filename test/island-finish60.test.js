import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import{keyboardDirection}from'../dist/island/keyboard-walk.js';
const source=fs.readFileSync(new URL('../dist/island/island.js',import.meta.url),'utf8');
function controller(reduced=false){const saves=[],bounces=[];const c={Math,walkKeys:new Set(['d']),keyboardMoving:false,keyboardVelocity:[0,0],actorPosition:[0,0],actorCell:[0,0],actorSpeed:0,WALK_SPEED:72,walkClock:0,walkHeading:0,face:1,back:false,pose:'idle',reduced,keyboardDirection,keyboardStep:(_s,p,d,n)=>p.map((v,i)=>v+d[i]*n),state:{},currentCell:()=>[0,0],walkingView:()=>3,dispatch:e=>saves.push(e),paintHumans(){},$:()=>({setAttribute(){},classList:{add:v=>bounces.push(v),remove(){}}}),setTimeout(){}};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function arrivalBounce()'),source.indexOf("document.addEventListener('keydown'",source.indexOf('function arrivalBounce()'))),c);return{c,saves,bounces};}
test('keyboard release decelerates briefly, saves final position once and bounces once at every frame rate',()=>{
 const stops=[];for(const fps of [30,60,120]){const{c,saves,bounces}=controller();for(let i=0;i<fps;i++)c.keyboardTick(1/fps);assert.equal(c.actorSpeed,72);const release=c.actorPosition[0];c.walkKeys.clear();c.keyboardTick(1/fps);assert(c.actorPosition[0]>release);assert(c.actorSpeed>0&&c.actorSpeed<72);for(let i=0;i<fps;i++)c.keyboardTick(1/fps);assert.equal(c.actorSpeed,0);assert.equal(c.pose,'idle');assert.equal(saves.length,1);assert.equal(bounces.length,1);stops.push(c.actorPosition[0]-release);}assert(Math.max(...stops)-Math.min(...stops)<.15);
});
test('direction reversal eases through zero; blur/modal stop cancels inertia and reduced motion omits bounce',()=>{
 const{c,saves}=controller();for(let i=0;i<30;i++)c.keyboardTick(1/60);c.walkKeys=new Set(['a']);c.keyboardTick(1/60);assert(c.keyboardVelocity[0]>0&&c.keyboardVelocity[0]<72);c.stopKeyboard();const stopped=c.actorPosition[0];c.keyboardTick(.04);assert.equal(c.actorPosition[0],stopped);assert.equal(saves.length,1);
 const r=controller(true);r.c.keyboardTick(.04);r.c.stopKeyboard();assert.equal(r.bounces.length,0);assert.equal(r.c.actorSpeed,0);
});

test('existing visitor responds immediately to motion preference changes, including its current segment',async()=>{
 const{createAnimalVisitors}=await import('../dist/island/animal-visitors.js');const old={fetch:globalThis.fetch,Image:globalThis.Image,document:globalThis.document};
 globalThis.fetch=async()=>({ok:true,json:async()=>({animals:[{id:'dog',name:'강아지',sheet:'dog.webp'}]})});globalThis.Image=class{async decode(){}};globalThis.document={hidden:false};
 try{const {fresh,route}=await import('../dist/island/core.js?v=62'),state=fresh(),start=performance.now(),v=createAnimalVisitors({project:(c,r)=>[c*42,r*20],findRoute:route,getState:()=>state,random:()=>0,world:{querySelector:()=>null},redraw(){},announce(){}});await v.ready;v.tick(start+90100);await new Promise(r=>setImmediate(r));assert(v.active);v.tick(start+90200);assert(v.active.segment);assert.equal(v.active.walk,true);v.setReduced(true);assert.equal(v.active.walk,false);v.setReduced(false);assert.equal(v.active.walk,true);
 }finally{Object.assign(globalThis,old);}
});
