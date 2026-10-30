export const normalizeAngle=angle=>((angle%360)+360)%360;
export const headingForAngle=angle=>[0,3,1,2][Math.round(normalizeAngle(angle)/90)%4];
