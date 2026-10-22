#!/usr/bin/env node
// Developer editor. Does not touch player saves or publish the game.
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import{randomUUID}from'node:crypto';
import{validateBalance}from'../dist/island/balance-schema.js';
const args=process.argv.slice(2),defaultFile=fileURLToPath(new URL('../dist/island/balance.json',import.meta.url));
function main(){
 let file=defaultFile;if(args[0]==='--file'){file=path.resolve(args[1]||'');args.splice(0,2);}
 const action=args.shift()||'show';if(!['show','validate','set','export'].includes(action))throw Error('사용법: node tools/pogeun-balance.mjs [show|validate|set 경로 값|export 파일.json]');
 const original=fs.readFileSync(file,'utf8'),data=JSON.parse(original);
 if(action==='set'){
 if(args.length!==2)throw Error('set 뒤에 경로와 JSON 값이 필요해요');
 const keys=args[0].split('.');let parent=data;for(const key of keys.slice(0,-1)){if(!parent||typeof parent!=='object'||!Object.hasOwn(parent,key))throw Error('없는 경로예요');parent=parent[key];}
 const key=keys.at(-1);if(!parent||!Object.hasOwn(parent,key)||typeof parent[key]==='object')throw Error('기존 값 하나만 수정할 수 있어요');
 parent[key]=JSON.parse(args[1]);
 }else if(args.length!==(action==='export'?1:0))throw Error('명령 인수를 확인해 주세요');
 const errors=validateBalance(data);if(errors.length)throw Error(errors.join('\n'));
 if(action==='show'){console.log(JSON.stringify(data,null,2));return;}
 if(action==='validate'){console.log('정상 · schemaVersion '+data.schemaVersion+' · 임시값 '+data.provisional);return;}
 const target=action==='export'?path.resolve(args[0]):file,temp=target+'.'+randomUUID()+'.tmp';
 if(action==='export'&&fs.existsSync(target))throw Error('내보낼 파일이 이미 있어요');
 if(action==='set'&&fs.readFileSync(file,'utf8')!==original)throw Error('설정이 변경됐어요. 다시 읽어 주세요');
 try{fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});if(action==='export'){fs.linkSync(temp,target);fs.unlinkSync(temp);}else fs.renameSync(temp,target);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
 console.log(action==='set'?'저장 완료':'내보내기 완료');
}
try{main();}catch(e){console.error(e.message);process.exitCode=1;}
