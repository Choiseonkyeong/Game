import test from 'node:test';import assert from 'node:assert/strict';
import {rooms,puzzles} from '../dist/case.js';
import {restore,progress} from '../dist/engine.js';
class Classes{constructor(){this.s=new Set();}add(v){this.s.add(v);}remove(v){this.s.delete(v);}toggle(v,force){const has=force??!this.s.has(v);has?this.s.add(v):this.s.delete(v);return has;}}
class Element{constructor(id){this.id=id;this.hidden=false;this.textContent='';this.innerHTML='';this.style={};this.dataset={};this.classList=new Classes();this.open=false;this.src='';this.value='';this.handlers={};}addEventListener(k,f){this.handlers[k]=f;}setAttribute(){}focus(){}showModal(){assert(!this.open);this.open=true;}close(){this.open=false;}getBoundingClientRect(){return {left:0,top:0,width:750,height:500};}setPointerCapture(){}hasPointerCapture(){return false;}releasePointerCapture(){}}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);},events={};
const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
globalThis.document={getElementById:get,querySelectorAll:()=>[],addEventListener:(k,f)=>events[k]=f};globalThis.window={matchMedia:()=>({matches:true}),scrollTo(){}};Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
let serial=0;const timers=new Map();globalThis.setTimeout=fn=>{timers.set(++serial,fn);return serial;};globalThis.clearTimeout=id=>timers.delete(id);
function flush(){while(timers.size){const entries=[...timers];timers.clear();for(const [,f]of entries)f();}}
await import('../dist/app.js');
function click(dataset={},id=''){events.click({target:{closest:()=>({dataset,id})}});flush();}
function room(){const raw=JSON.parse(data.get('danchu-case-001-v4'));return restore(raw).room;}
function inspect(id){click({hotspot:id});}
function take(item){const spot=rooms[room()].hotspots.find(h=>h.item===item);inspect(spot.id);click({take:item});}
function use(item,target){click({tab:'bag'});click({bagItem:item});inspect(target);}
function solve(id){if(id==='elapsed'){click({tab:'notes'});click({note:'curve'});click({note:'temperature'});click({},'connect-notes');}else click({puzzle:id});const p=puzzles[id];if(p.type==='code'){get('code-input').value=p.answer;events.submit({target:{id:'code-form'},preventDefault(){}});flush();}else if(p.type==='notes')for(const key of p.answer)click({noteKey:key});else click({answer:p.answer});if(get('puzzle-dialog').open)click({close:'puzzle-dialog'});}
test('evidence notebook, all room transitions, combinations and ending work through UI handlers',()=>{
 click({close:'about-dialog'});
 inspect('clock');inspect('radiator');inspect('thermometer');inspect('watch');solve('elapsed');solve('blackout');use('bedroom_key','door');click({room:'observatory'});
 inspect('window');inspect('floor');solve('window_route');inspect('chart');take('lens');solve('direction');click({room:'workshop'});
 inspect('drawing');inspect('relay');solve('clock_method');take('magnet');take('wire');click({tab:'bag'});click({bagItem:'magnet'});click({bagItem:'wire'});click({},'combine-items');use('magnet_line','vent');click({room:'archive'});
 inspect('ledger');inspect('clock');solve('cart_time');solve('archive_order');take('music_card');use('music_card','door');click({room:'music'});
 inspect('cylinder');inspect('score');inspect('player');click({},'read-recording');solve('recording_loop');solve('tune');take('greenhouse_key');use('greenhouse_key','door');click({room:'greenhouse'});
 inspect('lift');inspect('route');inspect('letter');solve('timeline');solve('exit_method');solve('conclusion');
 const state=restore(JSON.parse(data.get('danchu-case-001-v4')));assert.equal(progress(state),30);assert.equal(get('progress').textContent,'30 / 30');assert.equal(get('ending-dialog').open,true);assert.equal(state.flags.case_closed,true);assert(state.evidence.includes('sky'));
});
test('bed and window actions select different illustrated poses and preserve investigation',()=>{
 click({room:'bedroom'});inspect('bed');let s=restore(JSON.parse(data.get('danchu-case-001-v4')));assert.equal(s.actor.pose,4);assert.equal(get('actor-sprite').style.backgroundPosition,'0% 100%');inspect('window');s=restore(JSON.parse(data.get('danchu-case-001-v4')));assert.equal(s.actor.pose,5);assert(Math.abs(parseFloat(get('actor-sprite').style.backgroundPosition)-100/3)<1e-8);assert(get('actor-sprite').style.backgroundPosition.endsWith('100%'));assert.equal(progress(s),30);
});
