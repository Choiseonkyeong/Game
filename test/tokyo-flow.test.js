// Real Tokyo controller with the same deterministic DOM/Canvas substitute. Not browser QA.
import test from'node:test';import assert from'node:assert/strict';import{roomGeometry}from'../dist/view-gestures.js';let clock=0,frames=0;const storage=new Map([['danchu-travel-v6','previous shared travel save']]),elements=new Map(),flights=[];
const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(768*512*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(t,k)=>t[k]||(()=>{})});
class E{constructor(id=''){this.id=id;this.handlers={};this.style={};this.dataset={};this.hidden=id==='note';this.clientHeight=844;this.clientWidth=390;this.width=390;this.height=844;this.set=new Set();this.classList={add:k=>this.set.add(k),remove:k=>this.set.delete(k),toggle:(k,v)=>{v??=!this.set.has(k);v?this.set.add(k):this.set.delete(k);}};}getContext(){return context;}toDataURL(){return'data:image/jpeg;base64,test';}attachShadow(){return root;}getBoundingClientRect(){return this.id==='dock'?{left:100,top:760,width:190,height:64}:{left:0,top:0,width:390,height:844};}addEventListener(k,f,capture=false){this.listeners??={};(this.listeners[k]??=[]).push({f,capture:capture===true});this.handlers[k]=async (e={})=>{let stopped=false;e.stopImmediatePropagation=()=>stopped=true;for(const l of [...this.listeners[k]].sort((a,b)=>Number(b.capture)-Number(a.capture))){if(stopped)break;await l.f(e);}};}setPointerCapture(){}append(e){if(e.className==='flight')flights.push(e);}remove(){this.removed=true;}getElementById(id){return get(id);}querySelector(){return new E('canvas');}querySelectorAll(){return[...String(this.innerHTML).matchAll(/data-item="([^"]+)"/g)].map(m=>{const e=new E();e.dataset.item=m[1];return e;});}}
const get=id=>{if(!elements.has(id))elements.set(id,new E(id));return elements.get(id);},root=new E('shadow');
globalThis.document={body:new E('body'),getElementById:get,createElement:()=>new E()};globalThis.window={addEventListener(){}};globalThis.matchMedia=()=>({matches:false});globalThis.devicePixelRatio=1;globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=1536;this.width=1536;this.height=1024;}set src(v){this._src=v;}get src(){return this._src;}async decode(){}};globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});globalThis.requestAnimationFrame=f=>{queueMicrotask(()=>{clock+=16;frames++;f(clock);});return frames+1;};globalThis.setTimeout=f=>{queueMicrotask(f);return 1;};await import('../dist/tokyo-room.js');
const saved=()=>JSON.parse(storage.get('little-travel-tokyo-v1')),settle=async()=>{for(let i=0;i<220;i++)await Promise.resolve();},click=async(dataset={},id='')=>{await root.handlers.click({target:{closest:()=>({dataset,id})}});await settle();};
const event=(x,y)=>({pointerId:1,clientX:x,clientY:y,preventDefault(){}});async function tap(id,x,y){await get(id).handlers.pointerdown(event(x,y));await get(id).handlers.pointerup(event(x,y));await settle();}
async function drag(id,x,y,xx,yy){await get(id).handlers.pointerdown(event(x,y));await get(id).handlers.pointermove(event(xx,yy));await settle();await get(id).handlers.pointerup(event(xx,yy));await settle();}
const roomXY=(x,y,cam)=>{const g=roomGeometry(390,844,{x:cam,y:.45},1);return[g.tx+x/1536*g.rw,g.ty+y/1024*g.rh];};
const boardXY=(x,y)=>[x*.4875,178.25+y*.4875];
test('tokyo chapter completes through shipped pointer handlers and keeps other saves',async()=>{
 await click({action:'start'});assert(saved().started);
 await drag('room',...roomXY(575,600,.42),...roomXY(575,600,.42).map((v,i)=>i?v:v-130));for(let i=0;i<6;i++)await settle();assert(saved().dropped,'swinging the tote drops the ticket');
 await tap('room',...roomXY(642,806,.42));assert(saved().ticket);
 await tap('room',...roomXY(560,950,.42));assert(get('overlay').innerHTML.includes('3コマ目'),'the receipt names the sharp frame');await click({action:'resume'});
 await click({},'right');await tap('room',...roomXY(1445,60,.72));assert(get('overlay').innerHTML.includes('風鈴'),'the wind chime strip can be read');await click({action:'resume'});await click({},'left');
 await tap('room',...roomXY(420,620,.42));assert.equal(get('focus-title').textContent,'카운터 · 맡긴 봉투 서랍');
 await tap('board',...boardXY(350,500));assert.equal(saved().drawer,1);
 const top=(552-320)*800/560+300-235;await tap('board',...boardXY(160,top+120));assert.equal(saved().negative,false);
 await tap('board',...boardXY(400,top+120));assert(saved().negative);await click({},'back');
 await tap('room',...roomXY(466,300,.42));assert(saved().lampOn);
 await tap('room',...roomXY(470,385,.42));assert.equal(get('focus-title').textContent,'스탠드 아래 · 라이트박스');
 await tap('board',...boardXY(95+160+75,690));assert.equal(saved().print,false);assert.equal(saved().tries,1);
 await tap('board',...boardXY(95+320+75,690));assert(saved().print);
 await click({},'left');await click({item:'print'});await tap('room',...roomXY(256,200,.12));assert(saved().done);
 assert(get('overlay').innerHTML.includes('두 번째 장'));assert.equal(storage.get('danchu-travel-v6'),'previous shared travel save');assert.equal(storage.get('little-travel-chapter'),'tokyo');
});
