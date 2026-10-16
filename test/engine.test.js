import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,act,complete,progress,restore} from '../engine.js';
test('비가 올 때는 수건을 써도 해결되지 않는다',()=>{const s=initial(0);const r=act(s,'towel','cat');assert.equal(r.changed,false);assert.equal(r.state.dry,false);assert.deepEqual(s,initial(0));});
test('구름을 옮긴 후 수건으로 고양이를 닦아 완료한다',()=>{let s=act(initial(0),'cloud','sun').state;assert.equal(progress(s),1);s=act(s,'towel','cat').state;assert.equal(complete(s),true);assert.equal(act(s,'cloud','sun').changed,false);});
test('전원과 컵이 모두 준비돼야 커피가 나온다',()=>{let s=initial(1);assert.equal(act(s,'brew').state.coffee,false);assert.equal(act(s,'mug','machine').state.cup,false);s=act(s,'switch').state;assert.equal(act(s,'brew').state.coffee,false);s=act(s,'mug','machine').state;s=act(s,'brew').state;assert.equal(complete(s),true);});
test('고양이에게 생선을 주기 전에는 문을 열 수 없다',()=>{let s=act(initial(2),'cushion','rug').state;assert.equal(act(s,'key','door').state.door,false);s=act(s,'fish','bowl').state;s=act(s,'key','door').state;assert.equal(complete(s),true);});
test('생선을 먼저 줘도 열쇠를 찾아야 완료된다',()=>{let s=act(initial(2),'fish','bowl').state;assert.equal(act(s,'key','door').state.door,false);s=act(s,'cushion','rug').state;assert.equal(complete(act(s,'key','door').state),true);});
test('다른 스테이지의 아이템과 잘못된 대상은 상태를 바꾸지 않는다',()=>{for(let i=0;i<3;i++){const s=initial(i);for(const [item,target] of [['cloud','door'],['key','sun'],['mug','rug'],['unknown','unknown']])assert.deepEqual(act(s,item,target).state,s);}});

test('생선을 먼저 준 진행 상태도 새로고침 후 그대로 복원한다',()=>{const state=act(initial(2),'fish','bowl').state;assert.deepEqual(restore(2,JSON.parse(JSON.stringify(state))),state);});
test('잘못되거나 도달 불가능한 저장 데이터는 안전하게 무시한다',()=>{assert.deepEqual(restore(0,null),initial(0));assert.equal(restore(0,{dry:true}).dry,false);assert.equal(restore(1,{coffee:true}).coffee,false);assert.equal(restore(2,{door:true}).door,false);assert.equal(restore(0,{sun:'true'}).sun,false);});
