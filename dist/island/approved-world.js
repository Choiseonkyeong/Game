// Independent terrain, cottage, vegetation and path layers. Logical grids/saves stay intact.
export function approvedScene(scene) {
  if (!scene) return scene;
  const f = scene.expansion || 1;
  return {...scene, approvedArt: true, house: [480+(340-480)*f,430+(185-430)*f,250*f,210*f]};
}
const image=(name,x,y,width,height)=>`<image href="art/approved2/${name}.png" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" pointer-events="none"/>`;
const flower=(x,y,s=1,pink=false)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="${pink?'#ffd6e7':'#fffdf0'}" stroke="#d1b474" stroke-width=".5"><ellipse cy="3" rx="8" ry="2.6" fill="#5d9b3b55" stroke="none"/>${[0,72,144,216,288].map(a=>`<ellipse cy="-4" rx="2.8" ry="4.2" transform="rotate(${a})"/>`).join('')}<circle r="2.7" fill="#ffd34f"/></g>`;
const bush=(x,y,s=1)=>image('flowers',x-30*s,y-30*s,60*s,40*s);
export function approvedWorld(scene) {
  const f=scene?.expansion||1;
  const stones=[[440,414,19,9],[420,436,21,10],[433,461,22,11],[460,487,24,11],[498,510,25,12],[539,524,13,6]];
  return `<defs><linearGradient id="a2-sky" gradientUnits="userSpaceOnUse" x1="0" y1="-200" x2="0" y2="850"><stop stop-color="#94c5fc"/><stop offset=".5" stop-color="#ded4fc"/><stop offset="1" stop-color="#ffdbec"/></linearGradient><radialGradient id="a2-cloud" cx=".4" cy=".2" r=".9"><stop stop-color="#fffefd"/><stop offset=".6" stop-color="#fff2fc"/><stop offset="1" stop-color="#f7d4f3"/></radialGradient><radialGradient id="a2-leaf" cx=".3" cy=".15" r=".85"><stop stop-color="#e8f876"/><stop offset=".45" stop-color="#b2df42"/><stop offset="1" stop-color="#53932e"/></radialGradient><linearGradient id="a2-stone" x2="0" y2="1"><stop stop-color="#fff2ce"/><stop offset="1" stop-color="#eac596"/></linearGradient></defs>
  <rect x="-3000" y="-3000" width="6960" height="7000" fill="url(#a2-sky)"/>
  <g id="approved-clouds" pointer-events="none">${[[100,230,1.3],[850,230,1.6],[450,100,.7],[70,610,1.5],[900,610,1.4]].map(([x,y,s])=>image('cloud',x-90*s,y-55*s,180*s,90*s)).join('')}</g>
  <g id="approved-world" transform="translate(480 430) scale(${f}) translate(-480 -430)" stroke-linejoin="round" stroke-linecap="round">
    <g id="approved-terrain">${image('terrain',165,315,630,340)}</g>
    <g id="approved-path" pointer-events="none">${stones.map(([x,y,rx,ry])=>`<g><ellipse cx="${x}" cy="${y+3}" rx="${rx+1}" ry="${ry}" fill="#7a9a3b44"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#a2-stone)" stroke="#d4ad7f" stroke-width="1.2"/><path d="M${x-rx*.6} ${y-ry*.4}q${rx*.5} ${-ry*.6} ${rx} 0" fill="none" stroke="#fff6d9" stroke-width="2"/></g>`).join('')}</g>
    <g id="approved-cottage" data-upgrade-part="cottage">${image('house',300,180,310,215)}</g>
    <g id="approved-apple-tree">${image('apple-tree',215,265,150,155)}</g>
    <g id="approved-blossom-tree">${image('blossom-tree',610,242,150,155)}</g>
    <g id="approved-natural-details" pointer-events="none">
      ${[[250,436,1],[338,400,.8],[701,420,1],[294,526,1],[350,545,.9]].map(a=>bush(...a)).join('')}
      ${[[228,469,.9],[260,495,.8],[373,410,.7],[399,517,.6],[470,552,.9],[604,538,.8],[665,518,.9],[708,485,.8],[724,455,1],[599,407,.65]].map(a=>flower(...a)).join('')}
      <g id="approved-stump">${image('stump',260,480,75,50)}</g>
    </g>
  </g>`;
}

// A bed's visual footprint and hit target use this same diamond in local tile units.
export const BED_FOOTPRINT='M0-14.285714L30 0L0 14.285714L-30 0Z';
export function approvedBed(p,crops,now=Date.now()) {
  const progress=p.crop?Math.max(0,Math.min(1,(now-p.sown)/crops[p.crop].ms)):0;
  const fruit=p.crop==='carrot'?'<path d="M-4-2L0 10L4-2" fill="#f49738" stroke="#c16e29"/>':p.crop==='strawberry'?'<path d="M-6-2Q0 14 6-2Q0-7-6-2" fill="#ef5366" stroke="#b54145"/>':'<ellipse cy="3" rx="7" ry="5" fill="#e5bc75" stroke="#b88a4b"/>';
  return `<path d="${BED_FOOTPRINT}" fill="#b8753c" stroke="#ffd489" stroke-width="4"/><svg x="-32" y="-17" width="64" height="34" viewBox="0 0 64 34" preserveAspectRatio="none" pointer-events="none"><image href="art/approved2/bed.png" width="64" height="34" preserveAspectRatio="none"/></svg>${p.crop?`<g transform="translate(0 -1) scale(${.45+progress*.55})"><path d="M0 0V-15" stroke="#619a32" stroke-width="2.5"/><path d="M0-7Q-17-24-11-10Q-7-4 0-7M0-10Q14-28 12-14Q8-7 0-10" fill="#a4df44" stroke="#679b2d" stroke-width="1.2"/>${progress===1?fruit:''}</g>`:''}`;
}

// Called only for a genuinely new save: never add, relocate or replace old players' crops.
export function addInitialBeds(state,available) {
  for(const [c,r] of [[15,10],[16,10],[15,11]]) {
    if(available(state,c,r)&&!(state.avatar[0]===c&&state.avatar[1]===r))state.items.push({id:state.next++,kind:'field',c,r,rot:0});
  }
  return state;
}
