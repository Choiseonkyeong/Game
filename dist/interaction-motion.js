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
