// Copies the island game and the shared art it uses into www/ so the Android app runs fully offline.
import {cpSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
rmSync('www',{recursive:true,force:true});mkdirSync('www');
for(const dir of ['island','littlepark'])cpSync(`../dist/${dir}`,`www/${dir}`,{recursive:true});
for(const f of ['rig-preview.html','rig-template.html','layout-check.html'])rmSync(`www/island/${f}`,{force:true});
writeFileSync('www/index.html','<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=island/index.html"><script>location.replace("island/index.html")</script>');
console.log('www ready');
