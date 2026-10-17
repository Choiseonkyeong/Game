// Shared motion rules: one clock, retained velocity and no hidden engine actions during preview.
export class FollowValue{
 constructor(value=0){this.value=value;this.target=value;this.velocity=0;}
 set(value){this.target=Math.max(0,Math.min(1,value));}
 step(seconds){
  // Analytic critically damped spring remains stable when pointer events or frames arrive unevenly.
  const dt=Math.max(0,Math.min(.05,seconds)),omega=48,offset=this.value-this.target,c=this.velocity+omega*offset,decay=Math.exp(-omega*dt);
  this.value=this.target+(offset+c*dt)*decay;this.velocity=(this.velocity-omega*c*dt)*decay;
  if(Math.abs(this.value-this.target)<.0003&&Math.abs(this.velocity)<.01){this.value=this.target;this.velocity=0;}
  return this.value;
 }
 get resting(){return this.value===this.target&&this.velocity===0;}
}
export function previewState(state,place,frame,rule){
 const flags={...state.flags};if(frame.progress>=.6&&place.container&&rule?.set===place.flag)flags[rule.set]=true;
 return {...state,flags,positions:{...state.positions,[place.anchor]:frame},world:{...state.world,[place.anchor]:frame.progress>=.6||state.world?.[place.anchor]}};
}
export function paperPosition(dx,dy,width,height){return {x:Math.max(-.32,Math.min(.32,dx/Math.max(1,width))),y:Math.max(-.3,Math.min(.3,dy/Math.max(1,height)))};}
export const drawerRegion=[1206,469,275,95];
// Underdamped spring for physical objects: keeps velocity, may overshoot, bounces off end stops and settles exactly.
export class Spring{
 constructor(value=0,{stiffness=170,damping=18,min=-Infinity,max=Infinity,bounce=0,rest=.0008}={}){Object.assign(this,{value,target:value,velocity:0,stiffness,damping,min,max,bounce,rest,impact:0});}
 set(target){this.target=Math.max(this.min,Math.min(this.max,target));return this;}
 kick(velocity){this.velocity+=velocity;return this;}
 step(seconds){
  const total=Math.max(0,Math.min(.05,seconds)),n=Math.max(1,Math.ceil(total/(1/240))),dt=total/n;this.impact=0;
  for(let i=0;i<n;i++){
   this.velocity+=(-this.stiffness*(this.value-this.target)-this.damping*this.velocity)*dt;this.value+=this.velocity*dt;
   // A hard stop (drawer rail, mattress) reflects part of the speed instead of passing through.
   if(this.value<this.min||this.value>this.max){this.impact=Math.max(this.impact,Math.abs(this.velocity));this.value=this.value<this.min?this.min:this.max;this.velocity*=-this.bounce;}
  }
  if(Math.abs(this.value-this.target)<this.rest&&Math.abs(this.velocity)<this.rest*20){this.value=this.target;this.velocity=0;}
  return this.value;
 }
 get resting(){return this.value===this.target&&this.velocity===0;}
}
// Material presets for opening and closing things in close-up views.
export const MATERIALS={
 drawer:{stiffness:120,damping:17,bounce:.28},
 chair:{stiffness:70,damping:15,bounce:.1},
 pillow:{stiffness:95,damping:13,bounce:.05},
 lid:{stiffness:150,damping:13,bounce:.2},
 light:{stiffness:210,damping:15,bounce:.15}
};
// Per-object body reaction in the room: tilt, sway, hop, squash and shake, all returning to rest.
// [stiffness, damping, kick]; kicks are sized so the first swing is a few degrees or pixels.
const BODY_KINDS={
 sway:{angle:[26,1.6,.34]},leaf:{angle:[62,3.4,.32]},rock:{angle:[320,10,.42]},wobble:{angle:[210,9,.5]},
 squash:{squash:[260,11,.6],angle:[260,13,.12]},hop:{y:[420,13,-150],angle:[380,12,.7]},shake:{x:[1300,22,80]}
};
export class BodyMotion{
 constructor(kind){this.kind=BODY_KINDS[kind]?kind:'wobble';this.springs={};for(const [key,[stiffness,damping]] of Object.entries(BODY_KINDS[this.kind]))this.springs[key]=new Spring(0,{stiffness,damping,rest:.002,...(key==='y'?{max:0,bounce:.35}:{})});
  // Cloth and leaves bend: the free end follows the swing a moment later.
  if(this.kind==='sway'||this.kind==='leaf')this.springs.bend=new Spring(0,{stiffness:this.kind==='sway'?16:34,damping:this.kind==='sway'?3.2:4.4,rest:.002});}
 impulse(direction=1,strength=1){for(const [key,spring] of Object.entries(this.springs)){if(key==='bend')continue;const v=BODY_KINDS[this.kind][key][2];spring.kick(v*strength*(key==='angle'||key==='x'?direction:1));}}
 step(seconds){const {bend,...rest}=this.springs;for(const spring of Object.values(rest))spring.step(seconds);if(bend){bend.set(this.springs.angle.value);bend.step(seconds);}return !this.resting;}
 get resting(){return Object.values(this.springs).every(s=>s.resting);}
 get pose(){const s=this.springs;return {angle:s.angle?.value||0,x:s.x?.value||0,y:s.y?.value||0,squash:s.squash?.value||0,bend:s.bend?.value||0};}
}
