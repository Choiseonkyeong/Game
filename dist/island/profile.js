import{terrainCells,passable}from'./core.js?v=48';
import{project}from'./movement.js?v=44';
export const PROFILE_KEY='pogeun-profile-v1';
export function readProfile(raw){try{const p=JSON.parse(raw);return typeof p?.name==='string'&&p.name.trim()&&p.name.trim().length<=20&&['female','male'].includes(p.gender)?{name:p.name.trim(),gender:p.gender}:null;}catch{return null;}}
// Choose the nearest free tile to the painted island's walkable center.
export function centerAvatar(state){const cells=terrainCells();if(!cells.length)return false;const points=cells.map(c=>project(...c)),mid=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length],[0,0]);const free=cells.filter(c=>passable(state,...c));free.sort((a,b)=>{const p=project(...a),q=project(...b);return Math.hypot(p[0]-mid[0],p[1]-mid[1])-Math.hypot(q[0]-mid[0],q[1]-mid[1]);});if(!free.length)return false;state.avatar=[...free[0]];return true;}
