import{BALANCE}from'./balance.js?v=48';
// Seed catalogue, stage progression and artwork are shared by the shop and planted items.
export const SEED_DESCRIPTION='정성껏 돌보면, 마지막 단계에서 열매를 수확할 수 있어요!';
export const SEED_CATALOG={
 apple:{name:'사과나무',icon:'🍎',type:'tree',...BALANCE.seeds.apple},
 lemon:{name:'레몬나무',icon:'🍋',type:'tree',...BALANCE.seeds.lemon},
 persimmon:{name:'감나무',icon:'🟠',type:'tree',...BALANCE.seeds.persimmon},
 banana:{name:'바나나나무',icon:'🍌',type:'tree',...BALANCE.seeds.banana},
 corn:{name:'옥수수',icon:'🌽',type:'field',...BALANCE.seeds.corn},
 sweetpotato:{name:'고구마',icon:'🍠',type:'field',...BALANCE.seeds.sweetpotato},
 potato:{name:'감자',icon:'🥔',type:'field',...BALANCE.seeds.potato}
};
export const seedStages=k=>SEED_CATALOG[k]?.type==='tree'?5:4;
export function seedStage(p,now=Date.now()){const v=SEED_CATALOG[p.seedKind];if(!v)return 1;return Math.min(seedStages(p.seedKind),1+Math.floor(Math.max(0,now-p.seedAt+(p.seedBoost||0))/v.ms*(seedStages(p.seedKind)-1)));}
export function seedCounts(raw){return Object.fromEntries(Object.keys(SEED_CATALOG).filter(k=>Number.isSafeInteger(raw?.[k])&&raw[k]>0).map(k=>[k,Math.min(999,raw[k])]));}
export function seedArt(p,now=Date.now()){
 const v=SEED_CATALOG[p.seedKind];if(!v)return '';const stage=seedStage(p,now),ripe=stage===seedStages(p.seedKind),soil='<ellipse cy="1" rx="39" ry="15" fill="#bd8d5a" stroke="#87603f" stroke-width="2"/><ellipse cy="-2" rx="31" ry="9" fill="#d2a874"/>';
 const leaf=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0Q-28-27-33-9Q-24 8 0 0Q12-30 31-22Q36-4 0 0" fill="#91bd54" stroke="#517c38" stroke-width="2.5"/><path d="M0 0l-23-10M0 0l22-16" stroke="#c9df7a" stroke-width="2"/></g>`;
 if(stage===1)return soil+'<path d="M0 0v-18" stroke="#657f3c" stroke-width="4"/>'+leaf(0,-18,.6);
 const fruit=(x,y)=>`<g transform="translate(${x} ${y})">${p.seedKind==='banana'?'<path d="M-10-6Q-2 9 12-7Q12 12-2 12Q-13 10-10-6Z" fill="#f9d958" stroke="#ae7e35" stroke-width="2"/>':p.seedKind==='corn'?'<ellipse rx="7" ry="15" fill="#f6d454" stroke="#b88938" stroke-width="2"/><path d="M-9 1L-6 16 1 17 10 0Q2 11 0 15Q-4 9-9 1" fill="#6b9f48"/>':`<ellipse rx="${p.seedKind==='sweetpotato'?12:9}" ry="${p.seedKind==='lemon'?12:8}" fill="${{apple:'#ef6d55',lemon:'#f7d954',persimmon:'#f0a34e',sweetpotato:'#b5688c',potato:'#dfb578'}[p.seedKind]||'#dfb578'}" stroke="#986744" stroke-width="2"/><path d="M0-7l2-5" stroke="#758544" stroke-width="3"/>`}</g>`;
 if(v.type==='field')return soil+leaf(0,-10,stage===2?.7:1.1)+(stage>=3?leaf(-13,-25,.65)+leaf(18,-27,.65):'')+(ripe?[[-21,0],[0,-5],[22,0]].map(([x,y])=>fruit(x,y)).join(''):'');
 const height=stage===2?46:stage===3?72:84,width=stage===2?24:37;
 return soil+`<path d="M-10 0Q-2-${height/2} -9-${height}h18Q4-${height/2} 12 0Z" fill="#b47f4f" stroke="#805a37" stroke-width="3"/><path d="M0-22l-19-23M2-33l20-23" stroke="#90653f" stroke-width="6"/>`+(p.seedKind==='banana'?[[-22,-height],[15,-height-8],[-3,-height-20]].map(([x,y])=>leaf(x,y,1)).join(''):`<path d="M-${width}-${height-5}Q-${width+12}-${height+34} -12-${height+36}Q4-${height+60} 24-${height+34}Q${width+24}-${height+28} ${width}-${height-3}Q13-${height-12} 0-${height-2}Q-18-${height-13}-${width}-${height-5}Z" fill="#83b852" stroke="#517f38" stroke-width="3"/>${leaf(-2,-height-20,.65)}`)+(stage>=4?[[-20,-height-9],[17,-height-18],[0,-height+4]].map(([x,y])=>ripe?fruit(x,y):`<circle cx="${x}" cy="${y}" r="7" fill="#b7cf67" stroke="#719c42" stroke-width="2"/>`).join(''):'');
}
