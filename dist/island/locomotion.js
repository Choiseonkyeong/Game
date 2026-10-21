// Two steps with a planted neutral pose between strides; never loop only spread legs.
const CYCLE=[0,1,2,0,4,5];
export const walkFrame=time=>CYCLE[Math.floor(Math.max(0,Number(time)||0)*8)%CYCLE.length];
// Preserve the previous view near diagonals so small rounded-corner changes do not flicker.
export function walkingView(dx,dy,previous=0){if(Math.hypot(dx,dy)<.001)return previous;const ratio=Math.abs(dy)/Math.max(.001,Math.abs(dx)),vertical=previous<2?ratio>.7:ratio>1;if(vertical)return dy<0?1:0;return dx<0?2:3;}
