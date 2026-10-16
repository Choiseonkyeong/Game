import * as T from './vendor/three.module.js';
import {chapters} from './story.js';
const palette={orange:'#d89a55',cream:'#f4dfb8',blue:'#759bb2',green:'#6e967f',metal:'#d7b779',dark:'#28333c',white:'#f5ecd6'};
const mat=(c,metal=0)=>new T.MeshStandardMaterial({color:c,roughness:metal?.32:.78,metalness:metal});
const materials=new Map();function M(c,metal=0){const k=c+metal;if(!materials.has(k))materials.set(k,mat(c,metal));return materials.get(k);}
function mesh(g,geometry,color,x=0,y=0,z=0,metal=0){const m=new T.Mesh(geometry,typeof color==='string'?M(color,metal):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function ball(g,c,x,y,z,sx,sy=sx,sz=sx){const m=mesh(g,new T.SphereGeometry(1,24,16),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
function box(g,c,x,y,z,w,h,d,r=.08){const m=mesh(g,new T.BoxGeometry(w,h,d,2,2,2),c,x,y,z);if(r){ // gently bevel edges without an external geometry helper
const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){let v=new T.Vector3().fromBufferAttribute(a,i);const inner=new T.Vector3(Math.max(0,w/2-r),Math.max(0,h/2-r),Math.max(0,d/2-r));const q=new T.Vector3(Math.max(-inner.x,Math.min(inner.x,v.x)),Math.max(-inner.y,Math.min(inner.y,v.y)),Math.max(-inner.z,Math.min(inner.z,v.z)));v.sub(q).normalize().multiplyScalar(r).add(q);a.setXYZ(i,v.x,v.y,v.z);}m.geometry.computeVertexNormals();}return m;}
function cyl(g,c,x,y,z,r,h,r2=r){return mesh(g,new T.CylinderGeometry(r,r2,h,28),c,x,y,z);}
function torus(g,c,x,y,z,r,tube=.06){return mesh(g,new T.TorusGeometry(r,tube,10,36),c,x,y,z);}
function line(g,c,points,r=.025){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),30,r,8,false),c);}
function star(g,c,x,y,z,r=.38){const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,R=i%2?r*.46:r;const xx=Math.cos(a)*R,yy=Math.sin(a)*R;i?shape.lineTo(xx,yy):shape.moveTo(xx,yy);}shape.closePath();const m=mesh(g,new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035}),c,x,y,z);return m;}
function fabric(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#d69a5b';ctx.fillRect(0,0,128,128);let seed=1223;for(let i=0;i<1700;i++){seed=(seed*16807)%2147483647;let x=seed%128;seed=(seed*16807)%2147483647;let y=seed%128;ctx.fillStyle=i%2?'#ecb77a':'#b7824b';ctx.globalAlpha=.32;ctx.fillRect(x,y,1,3);}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,3);tex.colorSpace=T.SRGBColorSpace;return new T.MeshPhysicalMaterial({map:tex,color:'#efc58c',roughness:.98,sheen:1,sheenColor:new T.Color('#e9c995'),sheenRoughness:.8});}
let plush;
export function cat(){const g=new T.Group();if(!plush)plush=fabric();
 ball(g,plush,0,.91,0,.51,.68,.4);ball(g,plush,0,1.77,.04,.65,.56,.47);
 ball(g,'#f0d4a6',0,1.59,.42,.39,.25,.11);
 for(const x of [-.39,.39]){const ear=mesh(g,new T.ConeGeometry(.28,.58,3,1),x<0?plush:M('#769eb6'),x,2.24,0);ear.rotation.z=x<0?.25:-.25;ear.rotation.y=Math.PI/3;ball(g,'#e2b395',x,2.2,.12,.09,.17,.05);}
 for(const x of [-.24,.24]){ball(g,'#2b3133',x,1.86,.452,.092,.12,.045);ball(g,'#fff5e0',x-.025,1.9,.49,.025,.031,.011);ball(g,'#c49066',x*1.55,1.65,.405,.09,.035,.015);}
 ball(g,'#71534a',0,1.64,.55,.08,.055,.04);line(g,'#785c4c',[[0,1.58,.54],[-.06,1.53,.535],[-.12,1.56,.52]],.012);line(g,'#785c4c',[[0,1.58,.54],[.06,1.53,.535],[.12,1.56,.52]],.012);
 for(const x of [-.42,.42]){ball(g,plush,x,.33,.2,.24,.24,.34);const a=ball(g,plush,x*1.36,1,.05,.19,.42,.22);a.rotation.z=x<0?-.27:.27;}
 line(g,plush,[[-.4,.6,-.22],[-.8,.55,-.4],[-.95,.9,-.25],[-.8,1.08,-.12]],.13);
 const scarf=torus(g,palette.green,0,1.35,.025,.39,.12);scarf.rotation.x=Math.PI/2;box(g,palette.green,.2,1.1,.4,.22,.5,.1);cyl(g,palette.metal,0,1.3,.48,.1,.13).rotation.x=Math.PI/2;
 for(let i=0;i<3;i++)line(g,'#d8e8dc',[[.18+i*.06,2.21+i*.015,.18],[.21+i*.06,2.12+i*.015,.2]],.01);
 box(g,'#85634a',-.32,.9,-.28,.38,.43,.25);line(g,'#a3815d',[[-.42,1.12,-.22],[.32,1.37,.26]],.035);
 return g;}
function npc(type){const g=new T.Group();if(type==='robot'){
 ball(g,'#788e96',0,.68,0,.57,.63,.43);box(g,'#adc4c3',0,1.29,0,1.03,.65,.75,.13);box(g,'#263d49',0,1.34,.391,.78,.24,.08);for(const x of [-.22,.22])ball(g,'#cce4b9',x,1.35,.45,.065,.06,.03);for(const x of [-.54,.54]){line(g,'#9eafb0',[[x,.95,0],[x*1.4,.75,.08],[x*1.4,.55,.18]],.09);torus(g,'#d8be84',x*1.4,.48,.19,.12,.04);cyl(g,'#374754',x*.65,.19,0,.2,.2).rotation.z=Math.PI/2;}ball(g,'#b8d3ab',0,1.73,0,.1);
 }else if(type==='bird'){
 ball(g,'#d4af67',0,.62,0,.38,.48,.3);ball(g,'#e5c781',0,1.07,.1,.32,.29,.28);ball(g,'#293c43',.14,1.13,.35,.05);const beak=mesh(g,new T.ConeGeometry(.12,.3,4),'#b68b5c',0,1.05,.45);beak.rotation.x=Math.PI/2;for(const x of [-.36,.36]){const w=ball(g,'#8bada9',x,.79,0,.23,.13,.38);w.rotation.z=x;line(g,'#a98c54',[[x/2,.3,0],[x/2,.1,.1],[x,.08,.2]],.035);}torus(g,'#a98c54',0,.65,-.37,.12,.035);
 }else if(type==='mouse'){
 ball(g,'#d8d0bb',0,.65,0,.4,.51,.32);ball(g,'#e5dfcf',0,1.16,.1,.44,.36,.3);for(const x of [-.34,.34]){ball(g,'#b9b3a7',x,1.49,0,.24,.26,.1);ball(g,'#e7c4b4',x,1.49,.07,.16,.18,.04);ball(g,'#28383c',x*.5,1.23,.36,.05,.07,.03);}ball(g,'#ad897e',0,1.09,.41,.075,.055,.06);box(g,'#8aa396',0,.68,.29,.37,.43,.12);line(g,'#bcad9a',[[.2,.4,-.2],[.65,.17,-.36],[.87,.23,0]],.035);for(const x of [-.2,.2])ball(g,'#bcb19e',x,.17,.14,.17,.12,.2);
 }else{
 ball(g,'#ede2c6',0,.71,0,.4,.53,.24);ball(g,'#f5e9cc',0,1.24,.07,.35,.32,.26);for(const x of [-.35,.35])box(g,'#e5ce9e',x,.79,.06,.14,.46,.14);for(const x of [-.12,.12])ball(g,'#34434b',x,1.27,.32,.04,.06,.02);const hat=mesh(g,new T.ConeGeometry(.44,.35,4),'#94b2bb',0,1.65,0);hat.rotation.y=Math.PI/4;box(g,'#9cb7bc',0,.73,.2,.43,.25,.06);
 }return g;}
function objectModel(type,label){const g=new T.Group();const c=palette;
 switch(type){
 case 'hero':return cat();case 'robot':case 'bird':return npc(type);case 'sailor':return npc('sailor');
 case 'bell':cyl(g,c.metal,0,.3,0,.32,.42,.2);torus(g,c.metal,0,.59,0,.12,.035);ball(g,'#9b7c4b',0,.08,0,.1);break;
 case 'scarf':case 'ribbon':case 'cloth':case 'paper':box(g,type==='scarf'?c.green:type==='cloth'?'#b8c6d3':type==='paper'?'#e5d1ac':'#c39b86',0,.16,0,.8,.14,.55,.04);if(type==='cloth'||type==='scarf'){for(let i=0;i<5;i++)box(g,'#e4dcc5',-.31+i*.15,.24,0,.03,.02,.55,0);}break;
 case 'letter':box(g,'#ead9b2',0,.25,0,.65,.05,.53);star(g,c.metal,0,.32,.28,.13).rotation.x=-Math.PI/2;break;
 case 'lamp':cyl(g,c.metal,0,.05,0,.31,.1);cyl(g,c.metal,0,.6,0,.04,1.05);cyl(g,'#8caa91',0,1.13,0,.2,.35,.43);ball(g,'#fff0ba',0,.96,0,.15);break;
 case 'battery':cyl(g,'#9eb4ad',0,.35,0,.23,.65);cyl(g,c.metal,0,.7,0,.11,.08);box(g,'#354b52',0,.42,.23,.15,.035,.02);box(g,'#354b52',0,.42,.23,.035,.15,.02);break;
 case 'socket':case 'drain':box(g,'#475a62',0,.13,0,.72,.22,.66);cyl(g,'#263641',0,.25,0,.21,.03);for(const x of [-.11,.11])box(g,c.metal,x,.3,0,.05,.04,.19);break;
 case 'switch':box(g,'#8fa5a2',0,.17,0,.65,.27,.52);ball(g,'#e0b87b',0,.36,0,.16,.11,.16);break;
 case 'wheel':case 'wind':case 'magnet':case 'fan':case 'pump':case 'mirror':{
 cyl(g,'#687e7f',0,.11,0,.3,.16);box(g,'#9bada5',0,.46,-.04,.12,.65,.14);const disc=cyl(g,type==='mirror'?'#bfd1d2':'#d1b57b',0,.69,.03,.35,.09);disc.rotation.x=Math.PI/2;torus(g,c.metal,0,.69,.1,.35,.035);box(g,'#485963',0,.88,.11,.045,.2,.04);ball(g,'#ecd5a5',0,.69,.14,.065);g.userData.rotator=disc;break;}
 case 'key':torus(g,c.metal,-.22,.15,0,.17,.065).rotation.x=Math.PI/2;box(g,c.metal,.18,.15,0,.5,.08,.08);box(g,c.metal,.37,.17,.1,.08,.1,.25);break;
 case 'door':box(g,'#6d8e8a',0,.75,0,.88,1.5,.22);box(g,'#99b2a3',0,.78,.13,.68,1.25,.08);ball(g,c.metal,.24,.65,.2,.055);star(g,c.metal,0,1.13,.2,.12);break;
 case 'note':case 'mushroom':{
 const number=label.match(/[123]/)?.[0]||'1';const colors=['#bd9178','#86ada5','#b3a0be'];cyl(g,'#b5b29a',0,.2,0,.09,.35);ball(g,colors[+number-1],0,.45,0,.36,.19,.32);for(let i=0;i<+number;i++)ball(g,'#eee1c7',(i-(+number-1)/2)*.15,.59,.06,.035);break;}
 case 'bridge':case 'plank':case 'shield':case 'lift':{
 for(let i=0;i<4;i++)box(g,'#c8a476',-.39+i*.26,.14,0,.23,.18,.72);box(g,'#8d7153',-.41,.04,0,.08,.12,.85);box(g,'#8d7153',.41,.04,0,.08,.12,.85);break;}
 case 'star':star(g,'#f4cb76',0,.58,.05,.42);cyl(g,'#687e7b',0,.08,0,.28,.12);break;
 case 'beacon':case 'shared':{
 cyl(g,'#66837e',0,.17,0,.35,.3);cyl(g,c.metal,0,.38,0,.29,.12);torus(g,'#ecd49b',0,.47,0,.25,.04).rotation.x=Math.PI/2;box(g,'#c5d5cc',0,.65,-.06,.35,.38,.15);if(type==='shared')for(const x of [-.48,.48])cyl(g,c.metal,x,.13,0,.16,.17);break;}
 case 'cart':case 'train':case 'boat':{
 box(g,type==='boat'?'#e2cc9b':'#a6b5a1',0,.3,0,.85,.4,.6);if(type==='boat'){cyl(g,c.metal,0,.9,0,.025,1.1);const sail=mesh(g,new T.ConeGeometry(.45,.65,3),'#ddc7a1',.2,.99,0);sail.rotation.z=-.2;}else{for(const x of [-.4,.4])for(const z of [-.31,.31]){const w=cyl(g,'#475962',x,.14,z,.15,.1);w.rotation.x=Math.PI/2;}if(type==='train'){cyl(g,'#c9a274',0,.7,0,.25,.25);cyl(g,'#556d70',-.25,.9,0,.08,.38);}}break;}
 case 'spool':cyl(g,'#c9ad83',0,.33,0,.28,.48);for(const y of [.06,.6])cyl(g,'#dec69d',0,y,0,.36,.08);for(let i=0;i<7;i++)torus(g,'#a7beb0',0,.12+i*.07,0,.28,.024).rotation.x=Math.PI/2;break;
 case 'hook':case 'clip':torus(g,c.metal,0,.36,0,.23,.055);box(g,c.metal,0,.14,0,.075,.26,.075);break;
 case 'weight':cyl(g,'#77858a',0,.25,0,.3,.45,.4);torus(g,'#4a5a64',0,.57,0,.13,.04);break;
 case 'scale':cyl(g,c.metal,0,.4,0,.04,.8);box(g,'#bcb79b',0,.07,0,.7,.1,.45);box(g,c.metal,0,.83,0,1,.05,.05);for(const x of [-.4,.4]){line(g,c.metal,[[x,.82,0],[x,.4,0]],.02);cyl(g,'#8da7a0',x,.36,0,.2,.06);}break;
 case 'leaf':{const m=ball(g,'#8ea77d',0,.2,0,.25,.06,.52);m.rotation.z=.3;line(g,'#d4c995',[[0,.28,-.4],[0,.28,.5]],.02);break;}
 case 'umbrella':cyl(g,'#d0b785',0,.5,0,.025,.95);ball(g,'#8ba9b7',0,.9,0,.5,.19,.5);break;
 case 'machine':case 'screen':box(g,'#6f8d88',0,.45,0,.8,.85,.5);box(g,'#c0cbaa',0,.58,.27,.61,.36,.03);for(let i=0;i<3;i++)ball(g,c.metal,-.2+i*.2,.24,.28,.045);break;
 default:box(g,'#c7b594',0,.3,0,.55,.6,.55);star(g,c.metal,0,.41,.31,.14);
 }return g;}
function labelSprite(text){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.fillStyle='rgba(24,35,45,.75)';x.beginPath();x.roundRect(8,14,496,68,30);x.fill();x.font='500 30px -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2e7d2';x.fillText(text,256,49,455);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false,transparent:true}));s.scale.set(1.42,.266,1);s.renderOrder=20;return s;}
export class World{
 constructor(canvas,onEvent,onHold){
 this.canvas=canvas;this.onEvent=onEvent;this.onHold=onHold;this.objects=new Map();this.ray=new T.Raycaster();this.ndc=new T.Vector2();this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;this.angle=0;this.alive=true;
 this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.23;
 this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(39,1,.1,70);this.camera.position.set(0,6.2,10.5);this.camera.lookAt(0,.65,.25);
 this.scene.add(new T.HemisphereLight('#e7ebf0','#615042',2.5));const key=new T.DirectionalLight('#ffe7bb',3.3);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:25});key.shadow.bias=-.0008;key.shadow.normalBias=.035;this.scene.add(key);const rim=new T.DirectionalLight('#a2c6e4',2.5);rim.position.set(4,4,-4);this.scene.add(rim);this.key=key;
 this.stage=new T.Group();this.scene.add(this.stage);this.hero=cat();this.hero.position.set(-.85,.08,-1);this.hero.rotation.y=.12;this.scene.add(this.hero);this.baseHeroY=.08;
 this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(canvas.parentElement);this.resize();this.bind();this.tick=this.tick.bind(this);this.renderer.setAnimationLoop(this.tick);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('scene-error').hidden=false;});
 }
 resize(){let r=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();}
 clear(){for(const child of [...this.stage.children]){this.stage.remove(child);child.traverse(o=>{if(o.isMesh)o.geometry?.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});}this.objects.clear();}
 build(level,state){this.clear();this.level=level;this.state=state;this.scene.background=new T.Color(chapters[level.chapter].sky);this.scene.fog=new T.Fog(chapters[level.chapter].sky,15,28);this.key.color.set(level.chapter===4?'#ffe1ab':'#ffe8c3');
 const ground=box(this.stage,chapters[level.chapter].floor,0,-.22,0,8,.4,8,.2);ground.receiveShadow=true;
 // miniature theatrical sets, different materials and architecture in every chapter
 if(level.chapter===0){box(this.stage,'#a08c70',0,1.7,-3.3,7,3.7,.22);for(const x of [-2.6,2.6]){box(this.stage,'#647a79',x,1.8,-3.12,1.25,1.8,.12);box(this.stage,'#b3b79c',x,1.8,-3,1.1,.06,.1);box(this.stage,'#b3b79c',x,1.8,-3,.06,1.7,.1);}box(this.stage,'#635b48',0,.85,-2.6,3.7,1.6,.6);box(this.stage,'#bd9e76',0,1.7,-2.6,4.1,.16,.85);for(const x of [-.9,.1,1.1])cyl(this.stage,'#a6b7a0',x,1.96,-2.6,.15,.32);}
 if(level.chapter===1){for(let i=0;i<10;i++){const x=Math.sin(i*1.7)*3.3,z=-1.8-Math.abs(Math.cos(i))*.9;const tree=new T.Group();cyl(tree,'#897356',0,.8,0,.12,1.6);for(let j=0;j<3;j++)ball(tree,['#8b9c76','#a5b18b','#657d69'][j],Math.sin(j*2)*.3,1.4+j*.3,0,.6,.5,.55);tree.position.set(x,0,z);this.stage.add(tree);}box(this.stage,'#a89772',0,0,-2,4,.12,1);}
 if(level.chapter===2){for(const x of [-3,3]){box(this.stage,'#667d87',x,1.7,-2.4,1.5,3.4,1);for(let i=0;i<2;i++)box(this.stage,'#d9bb82',x,1.4+i*.9,-1.88,.55,.55,.08);}const water=cyl(this.stage,new T.MeshPhysicalMaterial({color:'#7caaa9',roughness:.12,metalness:.25,clearcoat:1}),0,.012,0,2.9,.03);water.material.transparent=true;water.material.opacity=.55;this.rain=new T.Group();for(let i=0;i<45;i++){const d=mesh(this.rain,new T.CylinderGeometry(.008,.008,.18,3),'#b4d1d9',Math.sin(i*71)*3.5,(i*.37)%4,Math.cos(i*31)*3);d.material.transparent=true;d.material.opacity=.6;}this.stage.add(this.rain);}
 else this.rain=null;
 if(level.chapter===3){for(const x of [-2.6,2.6]){box(this.stage,'#776b7c',x,1.9,-2.7,.3,3.8,.3);box(this.stage,'#a19394',0,3.4,-2.7,5.6,.35,.35);}const clock=cyl(this.stage,'#d4c3a3',0,2.8,-3,.7,.12);clock.rotation.x=Math.PI/2;box(this.stage,'#766f73',0,2.98,-2.91,.045,.38,.04);box(this.stage,'#766f73',.15,2.8,-2.9,.32,.04,.04);for(const z of [-2.2,-1.8])box(this.stage,'#ac9a7f',0,.03,z,6,.08,.06);}
 if(level.chapter===4){cyl(this.stage,'#98917d',.9,1.3,-2.5,.7,2.6,.96);cyl(this.stage,'#d4bf8e',.9,2.8,-2.5,.95,.28);cyl(this.stage,'#d5e0cd',.9,3.25,-2.5,.65,.65);const roof=mesh(this.stage,new T.ConeGeometry(1, .65,6),'#6a8785',.9,3.89,-2.5);star(this.stage,'#f2ce83',.9,3.26,-1.8,.3);for(let i=0;i<7;i++){box(this.stage,'#9e9c88',-3+i,.18,-3.4,.3,.4,.3);}}
 // Soft brass pedestal: every object is a pickable 3D toy, not a flat scene hotspot.
 const heroObject=level.objects.find(o=>o.type==='hero');this.hero.userData.itemId=heroObject?.id||null;
 const chapterNPC=['bird','mouse','sailor','robot','bird'][level.chapter];const friend=npc(chapterNPC);friend.position.set(1.15,.03,-1.1);friend.rotation.y=-.22;this.stage.add(friend);this.friend=friend;
 const spent=new Set(level.steps.slice(0,state.step).filter(s=>s.kind==='move').map(s=>s.item));
 const objects=level.objects.filter(o=>o.type!=='hero');const positions=[[-2.05,.03,.72],[0,.03,.85],[2.05,.03,.72],[-2.05,.03,2.5],[0,.03,2.65],[2.05,.03,2.5]];
 objects.forEach((o,i)=>{if((o.after||0)>state.step||spent.has(o.id))return;let model=objectModel(o.type,o.label);const pos=positions[i%6];model.position.set(...pos);model.scale.setScalar(o.type==='robot'||o.type==='sailor'?.64:.88);model.userData.itemId=o.id;model.userData.base=new T.Vector3(...pos);this.stage.add(model);const pedestal=cyl(this.stage,'#574f4755'.slice(0,7),pos[0],.015,pos[2],.5,.04);pedestal.material=M('#787c70');let lab=labelSprite(o.label);lab.position.set(pos[0],.05,pos[2]+.57);this.stage.add(lab);this.objects.set(o.id,{model,label:lab,obj:o});
 // small numbered markers stay visible on sequence instruments
 if(['note','mushroom'].includes(o.type)){const num=labelSprite(o.label.match(/[123]/)?.[0]||'♪');num.scale.set(.35,.16,1);num.position.set(0,.83,0);model.add(num);}
 if(o.type==='wheel'||o.type==='mirror'||o.type==='magnet'){let n=state.dials[o.id]||0;model.rotation.z=0;const mark=labelSprite(`${n} / 3`);mark.scale.set(.58,.17,1);mark.position.set(0,1.25,0);model.add(mark);}
 if(state.circuit[o.id]){const glow=ball(model,'#fae2a4',0,.48,0,.12);glow.material=new T.MeshStandardMaterial({color:'#ffe6ac',emissive:'#ffb85b',emissiveIntensity:2});}
 });
 const rule=level.steps[state.step];
 if(rule){let clue='';if(rule.kind==='dial')clue=`장치에 새겨진 방향: ${rule.value}`;if(rule.kind==='sequence')clue='새겨진 선율: '+rule.items.map(id=>level.objects.find(o=>o.id===id)?.label.match(/[123]/)?.[0]||'♪').join(' · ');if(rule.kind==='circuit')clue='회로 표식: '+rule.value.map(v=>v?'●':'○').join('   ');if(clue){const sign=labelSprite(clue);sign.position.set(0,3.4,-2);sign.scale.set(3.6,.5,1);this.stage.add(sign);}}
 const secretPositions=[[-2.85,1.06,-1.9],[2.8,2.1,-2.5],[-2,2.8,-3],[2.6,.7,-.8],[-2.75,.45,2.2],[.15,2.3,-2.1]];const secretPos=secretPositions[(level.id-1)%6];
 const secret=star(this.stage,'#e8d7a4',...secretPos,.16);secret.userData.itemId='__secret';secret.rotation.y=.3;secret.visible=!state.secret;this.secret=secret;this.secretBase=secretPos[1];
 this.pickRoots=[...this.objects.values()].map(o=>o.model);if(heroObject)this.pickRoots.push(this.hero);this.pickRoots.push(secret);this.setSelected(null);
 if(state.step===level.steps.length){const glow=new T.PointLight('#ffe0a0',4,9,2);glow.position.set(0,2,1);this.stage.add(glow);for(let i=0;i<12;i++)star(this.stage,'#edcb88',Math.sin(i*4)*3,1.4+(i%4)*.5,Math.cos(i*3)*1.6,.05);}
 }
 setSelected(id){this.selected=id;this.objects.forEach(({model},k)=>{model.scale.setScalar((model.userData.originalScale||(['robot','sailor'].includes(this.objects.get(k).obj.type)?.64:.88))*(k===id?1.13:1));});}
 point(e){const r=this.canvas.getBoundingClientRect();this.ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.ndc,this.camera);}
 hit(e){this.point(e);const hit=this.ray.intersectObjects(this.pickRoots.filter(o=>o.visible),true)[0];if(!hit)return null;let node=hit.object;while(node&&!node.userData.itemId)node=node.parent;return node?.userData.itemId||null;}
 bind(){let pointer=null;
 this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const id=this.hit(e);if(!id)return;pointer={id,pointer:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),drag:false};this.canvas.setPointerCapture(e.pointerId);this.onHold?.('start',id);});
 this.canvas.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.pointer)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>10){pointer.drag=true;this.onHold?.('cancel',pointer.id);const model=this.objects.get(pointer.id)?.model;if(model){this.point(e);const plane=new T.Plane(new T.Vector3(0,1,0),-.5),p=new T.Vector3();this.ray.ray.intersectPlane(plane,p);model.position.set(p.x,.5,p.z);}}});
 this.canvas.addEventListener('pointerup',e=>{if(!pointer||e.pointerId!==pointer.pointer)return;const p=pointer;pointer=null;this.onHold?.('cancel',p.id);const elapsed=performance.now()-p.time;if(p.drag){const moved=this.objects.get(p.id);if(moved)moved.model.visible=false;const target=this.hit(e);if(moved){moved.model.visible=true;moved.model.position.copy(moved.model.userData.base);}this.onEvent({kind:'move',item:p.id,target:target||''});}else this.onEvent({kind:elapsed>=1200?'hold':'tap',item:p.id,elapsed});if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);});
 const cancel=()=>{if(pointer){const model=this.objects.get(pointer.id)?.model;if(model)model.position.copy(model.userData.base);this.onHold?.('cancel',pointer.id);pointer=null;}};this.canvas.addEventListener('pointercancel',cancel);this.canvas.addEventListener('lostpointercapture',cancel);
 }
 rotate(){this.angle=this.angle===0?.14:0;}
 tick(ms){if(!this.alive)return;let t=ms*.001;if(!this.reduced){this.hero.position.y=this.baseHeroY+Math.sin(t*2)*.025;this.hero.rotation.y=.12+Math.sin(t*.65)*.055;if(this.friend)this.friend.rotation.y=-.22+Math.sin(t*.7)*.07;if(this.secret){this.secret.rotation.y=t*.5;this.secret.position.y=this.secretBase+Math.sin(t*2)*.07;}if(this.rain)this.rain.children.forEach((d,i)=>d.position.y=((i*.37-t*2)%4+4)%4);}
 this.camera.position.x=T.MathUtils.lerp(this.camera.position.x,Math.sin(this.angle)*10.5,.08);this.camera.lookAt(0,.65,.25);const head=new T.Vector3(-.85,2.8,-1).project(this.camera);const heroLabel=document.querySelector('.hero-label');if(heroLabel){heroLabel.style.left=`${(head.x*.5+.5)*100}%`;heroLabel.style.top=`${(-head.y*.5+.5)*100}%`;}this.renderer.render(this.scene,this.camera);}
}
