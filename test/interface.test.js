import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {levels} from '../dist/story.js';
import {solve} from '../dist/engine.js';
class Element{constructor(){this.hidden=false;this.textContent='';this.innerHTML='';this.style={};this.handlers={};this.dataset={};this.open=false;}addEventListener(k,f){this.handlers[k]=f;}showModal(){assert(!this.open);this.open=true;}close(){this.open=false;}setAttribute(){}insertAdjacentHTML(_,html){this.innerHTML+=html;}}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const stored=new Map();globalThis.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};globalThis.document={getElementById:get,querySelectorAll:()=>[]};globalThis.window={scrollTo(){}};Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../dist/app.js');
fs.writeFileSync('/tmp/button-v3-initial.svg','<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">'+get('scene').innerHTML.replaceAll('href="art/','href="/workspace/sites/strange-cafe-suming/dist/art/')+'</svg>');
const clickItem=id=>get('accessible-objects').onclick({target:{closest:()=>({dataset:{choose:id}})}});
test('all 30 episodes are playable through the actual interface controls',()=>{for(let i=0;i<30;i++){assert.equal(get('number').textContent,`STAGE ${String(i+1).padStart(2,'0')}`);for(const a of solve(i)){if(a.kind==='move'){clickItem(a.item);clickItem(a.target);}else if(a.kind==='shift'){clickItem(a.item);get('shift-button').onclick();}else clickItem(a.item);}assert(get('clear-dialog').open);assert(stored.has('button-bedtime-v3'));const data=JSON.parse(stored.get('button-bedtime-v3'));assert(data.cleared[i]);assert.equal(data.states[i].step,levels[i].steps.length);if(i<29)get('next').onclick();}get('clear-dialog').close();get('map').onclick();assert(get('map-content').innerHTML.includes('class="solved'));assert(!get('map-content').innerHTML.includes(' disabled'));});
test('actual 2D scene output includes the new character and environment',()=>{assert(get('scene').innerHTML.includes('art/button.webp'));assert(get('scene').innerHTML.includes('art/bedroom.webp'));fs.writeFileSync('/tmp/button-v3-scene.svg','<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">'+get('scene').innerHTML.replaceAll('href="art/','href="/workspace/sites/strange-cafe-suming/dist/art/')+'</svg>');});
