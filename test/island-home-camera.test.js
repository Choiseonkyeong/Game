import test from 'node:test';
import assert from 'node:assert/strict';
import {homeViewBox} from '../dist/island/home-camera.js';
test('enlarged home keeps the complete island within wide and short landscape viewports',()=>{
 for(const [width,height]of [[844,328],[667,313],[1366,692],[1024,692]]){
  const[x,y,w,h]=homeViewBox(width,height);
  assert(x<=225&&x+w>=715);assert(y<=185&&y+h>=650);
  assert(Math.abs(w/h-width/height)<1e-10);
  const oldH=Math.max(960,800*width/height)/(width/height);
  assert(oldH/h>1.4);
 }
});
test('room framing, zoom and non-reference stages retain their coordinate geometry',()=>{
 const base=homeViewBox(844,328),close=homeViewBox(844,328,{zoom:1.45});
 assert(Math.abs(base[2]/close[2]-1.45)<1e-10);
 assert(Math.abs(base[0]+base[2]/2-close[0]-close[2]/2)<1e-10);
 const room=homeViewBox(844,328,{inside:true});assert.equal(room[3],800);
 const stage={x:-40,y:-50,width:1400,height:900};const[x,y,w,h]=homeViewBox(844,328,{stage});
 assert(x<=stage.x&&x+w>=stage.x+stage.width);assert(y<=stage.y&&y+h>=stage.y+stage.height);
});
