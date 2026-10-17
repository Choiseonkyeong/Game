// Runs real non-reduced event/animation paths with deterministic animation timestamps.
// This verifies sequencing and continuity, not browser rendering or mobile frame rate.
import test from 'node:test';import assert from 'node:assert/strict';
import {clothSample,motionEase} from '../dist/scene-surface.js';
import {restore} from '../dist/play-engine.js';
let clock=0,frames=0;const flights=[];
class Element{
 constructor(id){this.id=id;this.handlers={};this.dataset={};this.style={};this.innerHTML='';this.open=false;this.hidden=false;this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,f)=>{f??=!this.classes.has(x);f?this.classes.add(x):this.classes.delete(x);}};}
 addEventListener(k,f){this.handlers[k]=f;}setAttribute(){}showModal(){this.open=true;}close(){this.open=false;}setPointerCapture(){}closest(){return null;}
 getBoundingClientRect(){return {left:this.id==='bag'?10:100,top:this.id==='bag'?730:420,width:this.id==='bag'?350:50,height:this.id==='bag'?70:50};}
 append(el){if(el.className==='pickup-flight')flights.push(el);}remove(){this.removed=true;}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);},events={},storage=new Map();
globalThis.document={getElementById:get,querySelector:q=>get(q),createElement:()=>new Element('new'),body:new Element('body'),addEventListener:(k,f)=>events[k]=f};
globalThis.window={matchMedia:()=>({matches:false}),innerHeight:844,innerWidth:390,addEventListener(){}};
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});
globalThis.requestAnimationFrame=f=>queueMicrotask(()=>{clock+=16;frames++;f(clock);});globalThis.setTimeout=f=>{queueMicrotask(f);return 1;};
await import('../dist/play.js');
const state=()=>restore(JSON.parse(storage.get('danchu-travel-v6')));
async function click(dataset={},id=''){await events.click({target:{closest:()=>({dataset,id})}});for(let i=0;i<12;i++)await Promise.resolve();}
test('fabric coordinates move continuously, stay opaque and return exactly on reversal',()=>{
 for(const x of [0,200,400,700])for(const y of [610,730,920]){const zero=clothSample(x,y,0);assert.equal(zero.x,x);assert.equal(zero.y,y);let last=zero;for(let i=1;i<=100;i++){const point=clothSample(x,y,i/100);assert(Math.abs(point.y-last.y)<5);assert(point.x>=0&&point.x<=850);assert(point.y>500&&point.y<1024);last=point;}assert.deepEqual(clothSample(x,y,0),zero);}
 assert.equal(motionEase(0),0);assert.equal(motionEase(1),1);assert(motionEase(.5)>.5);
});
test('first-room non-reduced playback sequences opening, pickup flight, combination and photo without dropping progress',async()=>{
 await click({object:'blanket'});assert(state().flags.blanket_open);assert(frames>=45);
 await click({object:'camera_box'});for(const k of '314')await click({key:k});await click({key:'확인'});assert(state().flags.camera_box_open);
 const before=frames;await click({object:'camera'});assert(state().inventory.includes('camera'));assert(frames-before>=40);assert(flights.at(-1).removed);assert(flights.at(-1).style.transform.includes('translate'));assert(!get('[data-item="camera"]').classes.has('pickup-pending'));
 await click({object:'tin'});await click({object:'film'});await click({item:'camera'});await click({item:'film'});const count=flights.length;await click({},'combine');assert(state().inventory.includes('loaded'));assert.equal(flights.length,count+3);assert(flights.slice(-3).every(x=>x.removed));
 await click({item:'loaded'});await click({object:'window'});assert(state().flags.done);assert(!get('world').classes.has('camera-shutter'));assert.equal(get('success').hidden,false);
});
