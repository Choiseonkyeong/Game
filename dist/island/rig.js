// Cut-out character rig. Every part image is drawn on the same 256×384 canvas in its rest pose (docs/pogeun-art-spec.md),
// so artwork lines up automatically; the engine only rotates each part about its joint. Missing artwork falls back to
// built-in vector parts so the game always runs.
export const CANVAS={w:256,h:384,foot:[128,372]};
export const VIEWS=['front','back','side'];
// Joint positions on the rest-pose canvas, per view.
export const JOINTS={
 front:{hip:[128,262],neck:[128,166],shoulderL:[98,176],shoulderR:[158,176],elbowL:[92,222],elbowR:[164,222],thighL:[114,268],thighR:[142,268],kneeL:[112,314],kneeR:[144,314]},
 back:{hip:[128,262],neck:[128,166],shoulderL:[98,176],shoulderR:[158,176],elbowL:[92,222],elbowR:[164,222],thighL:[114,268],thighR:[142,268],kneeL:[112,314],kneeR:[144,314]},
 side:{hip:[128,262],neck:[130,166],shoulderL:[126,178],shoulderR:[130,178],elbowL:[124,224],elbowR:[132,224],thighL:[124,268],thighR:[132,268],kneeL:[124,314],kneeR:[132,314]}
};
// Which outfit layer may draw on which body part, bottom to top.
export const LAYER_PARTS={
 body:['head','torso','pelvis','upperArmL','upperArmR','foreArmL','foreArmR','thighL','thighR','shinL','shinR'],
 face:['face'],hairBack:['hairBack'],hairFront:['hairFront'],
 bottom:['pelvis','thighL','thighR','shinL','shinR'],shoes:['shinL','shinR'],
 top:['torso','upperArmL','upperArmR','foreArmL','foreArmR'],hat:['hat'],accessory:['torso','head']
};
const LAYER_ORDER=['body','bottom','shoes','top','accessory','face','hairFront','hat'];

// ---------- animation: angles in degrees per bone, plus root offset; t is seconds
const ease=x=>.5-.5*Math.cos(Math.PI*x);
export function pose(name,t){
 const s=Math.sin,TAU=Math.PI*2,p={root:[0,0],torso:0,head:0,upperArmL:0,upperArmR:0,foreArmL:0,foreArmR:0,thighL:0,thighR:0,shinL:0,shinR:0,breath:0,sit:0};
 if(name==='walk'){const w=t*TAU*1.6;p.thighL=s(w)*24;p.thighR=-s(w)*24;p.shinL=Math.max(0,-s(w-.6))*26;p.shinR=Math.max(0,s(w-.6))*26;
  p.upperArmL=-s(w)*20;p.upperArmR=s(w)*20;p.foreArmL=-8-Math.max(0,s(w))*10;p.foreArmR=8+Math.max(0,-s(w))*10;p.root=[0,-Math.abs(s(w))*7+2];p.torso=-3;p.head=s(w*2)*1.5;}
 else if(name==='sit'){p.sit=1;p.thighL=p.thighR=-84;p.shinL=p.shinR=86;p.root=[0,30];p.upperArmL=-8;p.upperArmR=8;p.foreArmL=-22;p.foreArmR=22;p.breath=s(t*TAU*.25);p.head=s(t*TAU*.2)*2;}
 else if(name==='water'||name==='plant'){const k=ease((s(t*TAU*.8)+1)/2);p.torso=name==='plant'?10+6*k:6;p.head=name==='plant'?8:4;p.upperArmR=-(name==='plant'?38:62)-10*k;p.foreArmR=-(name==='plant'?30:18)+12*k;p.upperArmL=-14;p.foreArmL=-26;p.thighL=-4;p.thighR=4;p.root=[0,name==='plant'?6+4*k:0];}
 else if(name==='wave'){const k=s(t*TAU*2.2);p.upperArmR=-150;p.foreArmR=-20+k*24;p.head=k*2;p.breath=s(t*TAU*.5);}
 else{p.breath=s(t*TAU*.33);p.head=s(t*TAU*.21)*1.6;p.upperArmL=s(t*TAU*.33)*2;p.upperArmR=-s(t*TAU*.33)*2;}
 return p;
}

// ---------- built-in vector parts (placeholder until artwork exists)
const SKIN={cream:['#ffe6cf','#f2c29e','#d99a78'],honey:['#f0c095','#d39a6c','#ad7451'],cocoa:['#b47e5d','#8e5a3d','#6a4029']};
const HAIR={chestnut:['#8a5a3f','#5d3a28'],black:['#4a4243','#2b2526'],caramel:['#c98f55','#94622f'],rose:['#b77468','#874c45']};
const TOP={sailor:['#fffaf0','#dfe3ec','#34558b'],cardigan:['#e8b7b9','#c48e95','#fff6ea'],tee:['#bcd4b5','#8fb187','#fffaf0'],hoodie:['#c4bddf','#9890b8','#efeaff'],blouse:['#fbe7bd','#e0c291','#d2706b'],overall:['#a9bccb','#7f97a8','#fff7ea']};
const BOTTOM={shorts:['#6f8fb8','#4f6d95'],skirt:['#e3a9a6','#bf8180'],trousers:['#b7aa91','#8f8269'],pleats:['#b9c6a8','#8e9e7b']};
const SHOE={cream:['#efe6cf','#c8b995'],brown:['#9f7556','#6f4c34'],pink:['#e7aaa6','#bf7f7c'],sage:['#9fb595','#728a69']};
const grad=(id,a,b)=>`<linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
function vectorPart(o,view,part,uid){
 const sk=SKIN[o.skin]||SKIN.cream,h=HAIR[o.hairColor]||HAIR.chestnut,tp=TOP[o.top]||TOP.tee,bt=BOTTOM[o.bottom]||BOTTOM.shorts,sh=SHOE[o.shoes]||SHOE.brown,side=view==='side',back=view==='back';
 const ink=`stroke="#5b3f33" stroke-width="2.2" stroke-linejoin="round"`;
 const limb=(x1,y1,x2,y2,w,fill)=>`<path d="M${x1-w/2} ${y1}Q${x1} ${y1-w*.5} ${x1+w/2} ${y1}L${x2+w*.42} ${y2}Q${x2} ${y2+w*.55} ${x2-w*.42} ${y2}Z" fill="${fill}" ${ink}/>`;
 const J=JOINTS[view];
 switch(part){
 case 'thighL':case 'thighR':{const[x,y]=J[part],[kx,ky]=J[part==='thighL'?'kneeL':'kneeR'];const long=o.bottom==='trousers';return limb(x,y-6,kx,ky+2,22,long?`url(#${uid}b)`:o.bottom==='shorts'&&false?'':`url(#${uid}s)`)+(o.bottom==='shorts'?limb(x,y-6,x+(kx-x)*.45,y+(ky-y)*.45,25,`url(#${uid}b)`):'');}
 case 'shinL':case 'shinR':{const[x,y]=J[part==='shinL'?'kneeL':'kneeR'];const fx=side?x+10:x,long=o.bottom==='trousers';return limb(x,y-2,x,y+44,19,long?`url(#${uid}b)`:`url(#${uid}s)`)+`<path d="M${x-12} ${y+38}h${side?30:24}q6 0 6 8v4q0 6-6 6h-${side?34:28}q-6 0-6-6v-4q0-8 6-8z" fill="url(#${uid}f)" ${ink}/><path d="M${x-9} ${y+42}h${side?22:16}" stroke="#ffffff88" stroke-width="2"/>`.replace(`M${x-12}`,`M${fx-12}`);}
 case 'pelvis':{const skirt=o.bottom==='skirt'||o.bottom==='pleats';return skirt?`<path d="M100 248h56l16 44q-44 14-88 0z" fill="url(#${uid}b)" ${ink}/>${o.bottom==='pleats'?'<path d="M114 252l-6 40M128 252v42M142 252l6 40" stroke="#00000022" stroke-width="2"/>':''}`:`<path d="M102 246h52l4 30h-60z" fill="url(#${uid}b)" ${ink}/>`;}
 case 'torso':{const w=side?44:60,x=128-w/2;return `<path d="M${x+4} 168Q128 160 ${x+w-4} 168L${x+w+2} 252Q128 262 ${x-2} 252Z" fill="url(#${uid}t)" ${ink}/>`+(o.top==='sailor'&&!back?`<path d="M${x+6} 170L128 200L${x+w-6} 170" fill="#34558b" stroke="#5b3f33" stroke-width="2"/><path d="M122 200l6 10 6-10z" fill="#d2706b"/>`:'')+(o.top==='overall'?`<path d="M${x+10} 206h${w-20}v46h-${w-20}z" fill="#7f97a8" opacity=".9"/><path d="M${x+12} 172v34M${x+w-12} 172v34" stroke="#7f97a8" stroke-width="6"/>`:'')+(o.top==='hoodie'&&!side?`<path d="M${x+18} 210h${w-36}v16h-${w-36}z" fill="#9890b8" opacity=".6"/>`:'')+(o.top==='cardigan'&&!back?`<path d="M128 170v80" stroke="#c48e95" stroke-width="3"/><circle cx="133" cy="196" r="2.5" fill="#fff6ea"/><circle cx="133" cy="216" r="2.5" fill="#fff6ea"/>`:'');}
 case 'upperArmL':case 'upperArmR':{const[x,y]=J[part==='upperArmL'?'shoulderL':'shoulderR'],[ex,ey]=J[part==='upperArmL'?'elbowL':'elbowR'];return limb(x,y-4,ex,ey+2,20,`url(#${uid}t)`);}
 case 'foreArmL':case 'foreArmR':{const[x,y]=J[part==='foreArmL'?'elbowL':'elbowR'];const sleeve=o.top!=='tee';return limb(x,y-2,x,y+38,17,sleeve?`url(#${uid}t)`:`url(#${uid}s)`)+`<circle cx="${x}" cy="${y+42}" r="10" fill="url(#${uid}s)" ${ink}/>`;}
 case 'hairBack':return o.hair==='twin'?`<path d="M72 92q-26 30-10 86 10 18 22-6l6-60zM184 92q26 30 10 86-10 18-22-6l-6-60z" fill="url(#${uid}h)" ${ink}/>`:o.hair==='wave'||back?`<path d="M70 96q-8 80 18 100 40 12 80 0 26-20 18-100z" fill="url(#${uid}h)" ${ink}/>`:`<path d="M74 98q-6 56 14 72h80q20-16 14-72z" fill="url(#${uid}h)" ${ink}/>`;
 case 'head':return side?`<path d="M80 108q0-66 54-66t50 66q0 48-46 56-58 0-58-56z" fill="url(#${uid}s)" ${ink}/><path d="M168 118q8 4 8 12t-8 10" fill="url(#${uid}s)" ${ink}/>`:`<ellipse cx="128" cy="110" rx="56" ry="54" fill="url(#${uid}s)" ${ink}/><ellipse cx="128" cy="160" rx="10" ry="8" fill="${sk[1]}"/>`;
 case 'face':if(back)return'';{const ex=side?[146]:[106,150];return ex.map(x=>`<ellipse cx="${x}" cy="118" rx="9" ry="12" fill="#3d2a24"/><ellipse cx="${x+3}" cy="113" rx="3.4" ry="4.2" fill="#fff"/><ellipse cx="${x-2}" cy="123" rx="2" ry="2" fill="#ffffffaa"/>`).join('')+(side?`<path d="M152 140q6 4 10 0" stroke="#7a4a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="140" cy="134" rx="9" ry="5" fill="#f2a4a0" opacity=".55"/>`:`<path d="M121 142q7 6 14 0" stroke="#7a4a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="96" cy="136" rx="10" ry="6" fill="#f2a4a0" opacity=".55"/><ellipse cx="160" cy="136" rx="10" ry="6" fill="#f2a4a0" opacity=".55"/>`);}
 case 'hairFront':{if(back)return `<path d="M70 106q0-68 58-68t58 68q-58 22-116 0z" fill="url(#${uid}h)" ${ink}/>`;const fringe=o.hair==='short'?`M72 104q4-64 56-64t56 64q-20-26-56-22-36-4-56 22z`:`M70 112q2-72 58-72t58 72q-14-34-40-38-6 14-18 18-14-14-20-18-24 4-38 38z`;return `<path d="${fringe}" fill="url(#${uid}h)" ${ink}/><path d="M96 58q24-14 52-4" stroke="#ffffff55" stroke-width="5" fill="none" stroke-linecap="round"/>`+(o.hair==='bob'&&!side?`<path d="M72 106q-4 40 10 58l10-4q-8-24-6-50zM184 106q4 40-10 58l-10-4q8-24 6-50z" fill="url(#${uid}h)" ${ink}/>`:'');}
 case 'hat':return o.hat==='straw'?`<ellipse cx="128" cy="66" rx="78" ry="16" fill="#e8cf8c" ${ink}/><path d="M88 66q4-36 40-36t40 36z" fill="#efd896" ${ink}/><path d="M89 58h78" stroke="#d2706b" stroke-width="6"/>`:o.hat==='beret'?`<path d="M74 72q10-38 60-38t52 30q-60 16-112 8z" fill="#d9605c" ${ink}/><circle cx="132" cy="32" r="5" fill="#d9605c"/>`:o.hat==='bow'?`<path d="M128 52l-26-16v30zM128 52l26-16v30z" fill="#e88e94" ${ink}/><circle cx="128" cy="52" r="7" fill="#d2706b"/>`:'';
 default:return'';}
}
function vectorDefs(o,uid){const sk=SKIN[o.skin]||SKIN.cream,h=HAIR[o.hairColor]||HAIR.chestnut,tp=TOP[o.top]||TOP.tee,bt=BOTTOM[o.bottom]||BOTTOM.shorts,sh=SHOE[o.shoes]||SHOE.brown;return `<defs>${grad(uid+'s',sk[0],sk[1])}${grad(uid+'h',h[0],h[1])}${grad(uid+'t',tp[0],tp[1])}${grad(uid+'b',bt[0],bt[1])}${grad(uid+'f',sh[0],sh[1])}</defs>`;}

// ---------- artwork lookup (art/manifest.json): {layer:{variant:{view:{part:"file.webp"}}}}
let manifest=null,base='';
export async function loadArt(url='art/manifest.json'){try{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)return false;manifest=await r.json();base=url.replace(/[^/]*$/,'');return true;}catch{return false;}}
export const hasArt=()=>!!manifest;
// Painted world and props from the same manifest: {"world":{"day":"world/island-day.webp"},"props":{"bench":"props/bench.webp"}}
export const artUrl=(group,name)=>manifest?.[group]?.[name]?base+manifest[group][name]:null;
const variantOf=(o,layer)=>layer==='body'||layer==='face'?o.skin:layer==='hairBack'||layer==='hairFront'?`${o.hair}-${o.hairColor}`:o[layer];
function artFile(o,layer,view,part){const v=manifest?.[layer]?.[variantOf(o,layer)]?.[view]?.[part];return v?base+v:null;}
function partStack(o,view,part,uid){
 // Artwork wins layer by layer; the vector body already carries the outfit colours, so clothing layers need no vector fallback.
 let out='';
 for(const layer of LAYER_ORDER.concat(['hairBack'])){if(!LAYER_PARTS[layer].includes(part))continue;const file=artFile(o,layer,view,part);
  if(file)out+=`<image href="${file}" width="256" height="384"/>`;
  else if(['body','face','hairBack','hairFront','hat'].includes(layer))out+=vectorPart(o,view,part,uid);}
 return out;
}
const rot=(a,[x,y])=>a?` transform="rotate(${a.toFixed(2)} ${x} ${y})"`:'';
// Returns SVG markup with the feet at (0,0), `height` world units tall.
export function rigAvatar(o,{anim='idle',time=0,view='front',flip=false,height=112,uid='rig'}={}){
 const p=pose(anim,time),J=JOINTS[view],s=height/340,P=(n)=>partStack(o,view,n,uid);
 // Seen from the front or back a stride is a lift and a knee bend, not a sideways split; arms swing mostly toward the viewer.
 const flat=view!=='side',k=flat?.3:1;
 const arm=(side)=>`<g${rot(p['upperArm'+side]*(flat&&Math.abs(p['upperArm'+side])<40?k:1),J['shoulder'+side])}>${P('upperArm'+side)}<g${rot(p['foreArm'+side]*(flat?.5:1),J['elbow'+side])}>${P('foreArm'+side)}</g></g>`;
 const leg=(side)=>{const a=p['thigh'+side],knee=p['shin'+side];if(!flat||p.sit)return `<g${rot(a,J['thigh'+side])}>${P('thigh'+side)}<g${rot(knee,J['knee'+side])}>${P('shin'+side)}</g></g>`;
  const lift=Math.max(0,a)*.55+knee*.25,[hx,hy]=J['thigh'+side],sc=1-Math.max(0,a)/160;return `<g transform="translate(0 ${(-lift).toFixed(2)}) translate(${hx} ${hy}) scale(1 ${sc.toFixed(3)}) translate(${-hx} ${-hy})">${P('thigh'+side)}${P('shin'+side)}</g>`;};
 const headG=`<g${rot(p.head,J.neck)}>${view==='back'?P('face'):''}${P('head')}${view!=='back'?P('face'):''}${P('hairFront')}${P('hat')}</g>`;
 const breathe=p.breath?` transform="translate(0 ${(-p.breath*1.2).toFixed(2)})"`:'';
 let body;
 if(view==='side')body=`${arm('L')}${leg('L')}<g${rot(p.torso,J.hip)}>${P('pelvis')}<g${breathe}>${P('torso')}${P('hairBack')}${headG}</g></g>${leg('R')}${arm('R')}`;
 else if(view==='back')body=`${leg('L')}${leg('R')}<g${rot(p.torso,J.hip)}>${P('pelvis')}<g${breathe}>${arm('L')}${arm('R')}${P('torso')}${headG}${P('hairBack')}</g></g>`;
 else body=`<g${rot(p.torso,J.hip)}><g${breathe}>${P('hairBack')}</g></g>${leg('L')}${leg('R')}<g${rot(p.torso,J.hip)}>${P('pelvis')}<g${breathe}>${P('torso')}${arm('L')}${arm('R')}${headG}</g></g>`;
 const [rx,ry]=p.root;
 return `${vectorDefs(o,uid)}<ellipse cy="4" rx="${22*(1-Math.min(.25,Math.abs(ry)/40))}" ry="7" fill="#4a5a3a2e"/><g transform="scale(${(flip?-s:s).toFixed(4)} ${s.toFixed(4)}) translate(${-CANVAS.foot[0]+rx} ${-CANVAS.foot[1]+ry})">${body}</g>`;
}
