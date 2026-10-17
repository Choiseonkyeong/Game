import {stages,roomAreas} from './adventure.js?v=070';
const names={bed:'침대와 접힌 이불',pillow:'베개 아래',window:'커튼과 창가',jacket:'옷 주머니',drawer:'책상 서랍',tote:'가방 안쪽',tin:'작은 틴',desk:'책상 위 종이',shelf:'선반과 책',suitcase:'캐리어 안쪽',door:'출입문과 손잡이'};
const verbs={bed:'이불 걷기',pillow:'베개 들추기',window:'커튼 조절하기',jacket:'주머니 뒤적이기',drawer:'서랍 열기',tote:'가방 벌려 보기',tin:'뚜껑 들기',desk:'종이 뒤집기',shelf:'책 사이 살피기',suitcase:'짐 안쪽 확인하기',door:'손잡이와 문틈 살피기'};
const hints=[
 {bed:'카메라를 보관한 작은 상자. 세 자리 잠금이 달려 있다.',pillow:'베개 아래 쪽지: “보관함 소유표에 쓴 축광 잉크는 빛을 머금었다 어두워지면 빛난다. 창빛과 등불이 모두 쉬면 읽을 수 있다.”',window:'블라인드를 내리니 빛이 부드러워졌어. 창밖은 남기고 실내 반사만 줄일 수 있겠어.',jacket:'주머니 속 쪽지: 필름은 빛을 피해 높은 선반의 작은 틴에 따로 넣었어.',drawer:'서랍의 칸막이 사이에 충전용 어댑터와 연필이 보여. 다음 준비에 쓸 수 있겠어.',desk:'종이에 남은 눌린 자국과 앞뒤 메모도 단서가 될 수 있어.',shelf:'닫힌 용기가 책과 같은 색에 섞여 있어. 물건의 겉모습보다 보관한 이유를 생각해 보자.'},
 {jacket:'주머니 안쪽에 작은 열쇠가 닿아. 카운터의 보관 서랍과 짝일 수 있겠어.',desk:'접힌 지도는 바깥쪽만 보면 번호 하나가 빠져. 안쪽까지 펼쳐 봐.',tin:'빛에 약한 필름은 틴 안에 보관해. 물건을 찾을 때 보관 방법도 단서가 돼.'},
 {bed:'의자 뒤쪽의 작은 고리라면 사진을 직접 집지 않고도 끌어낼 수 있겠어.',desk:'영수증 앞면에는 번호, 뒷면에는 순서가 남아 있어.',window:'유리의 빗방울과 실내 반사는 달라. 렌즈 주변의 실내 빛을 가려 보자.'},
 {pillow:'쿠션 틈에서 접힌 지도 모서리가 보여. 바람 부는 방에서는 고정할 방법도 필요해.',window:'빛을 비스듬히 돌리면 정면에서 보이지 않던 자국의 그림자가 생겨.',drawer:'모양이 다른 플러그와 연결선은 역할이 달라. 연결 순서가 중요할 수 있어.'},
 {drawer:'넓고 얕은 칸은 사진을 접지 않기 위한 거야. 필름은 별도 포켓에 넣어야 긁히지 않아.',desk:'사진 뒷면의 모양과 메모의 순서는 따로 적혀 있어. 둘을 겹쳐 읽어 봐.',window:'비스듬한 창빛은 눌린 종이의 자국을 드러낼 수 있어.'},
 {jacket:'윤이 걸어 둔 재킷 주머니 안에서 열쇠가 만져져. 마지막 메모를 보관한 서랍을 떠올려 봐.',desk:'새로운 암호보다, 우리가 지나온 도시의 순서가 마지막 단서야.',window:'처음과 마지막 사진을 같은 방식으로 찍었지만, 책에 남은 이야기는 달라졌어.'}
];
export function describePlace(room,anchor,stage=1){if(room===0&&stage>1&&anchor==='jacket')return '주머니 안쪽에는 겉에서 보이지 않는 작은 포켓이 있어. 현재 찾는 물건이 여기에 들어갈 크기인지 살펴보자.';if(room===0&&stage===4&&anchor==='bed')return '침대 아래 카드 케이스의 고리가 보여. 카드를 직접 집기보다 고리를 걸 수 있는 방법을 찾아보자.';return hints[room]?.[anchor]||`${names[anchor]||'이곳'}의 접힌 부분과 연결 부위를 살펴봤어. 지금 목표에 필요한 물건이나 흔적이 있는지 생각해 보자.`;}
export function worldPlaces(s){const l=stages[s.stage],existing=l.objects.filter(o=>!o.inside),used=new Set(existing.filter(o=>o.id!=='gap').map(o=>o.anchor));const result=[...existing];for(const anchor of ['bed','window','jacket','drawer','tote','tin','desk','shelf','suitcase']){if(used.has(anchor)||anchor==='bed'&&![0,3].includes(l.room)||anchor==='suitcase'&&![0,3,5].includes(l.room))continue;const a=roomAreas[l.room][anchor];if(!a)continue;const[x,y,w,h]=a;result.push({id:'world_'+anchor,name:anchor==='jacket'&&l.room===2?'우산과 손잡이':anchor==='jacket'&&l.room===3?'문 옆 작은 가방':anchor==='window'&&l.room!==0?'창가의 빛과 유리':anchor==='bed'&&l.room===3?'소파 쿠션':names[anchor],anchor,x,y,w,h,ambient:true});}if(l.room===0||l.room===3){const a=l.room===0?[14,45,25,17]:[22,44,25,17];result.push({id:'world_pillow',name:names.pillow,anchor:'pillow',x:a[0],y:a[1],w:a[2],h:a[3],ambient:true});}if(l.room===0)result.push({id:'world_frame',name:'벽의 식물 액자',anchor:'frame',x:3,y:17,w:8,h:25,ambient:true});result.push({id:"world_reading",name:"선반의 여행책",anchor:"reading",x:[68,48,76,73,55,75][l.room],y:[20,27,19,15,11,11][l.room],w:8,h:12,ambient:true});result.push({id:"world_light",name:"실내 조명",anchor:"light",x:[16,16,30,12,43,85][l.room],y:[32,8,13,9,28,32][l.room],w:8,h:10,ambient:true});return result;}
export function dropPlace(s,p){const places=worldPlaces(s).filter(o=>Math.abs(p.x-o.x)<=(o.w||12)/2+4&&Math.abs(p.y-o.y)<=(o.h||12)/2+5);return places.sort((a,b)=>Math.hypot((p.x-a.x)/(a.w||12),(p.y-a.y)/(a.h||12))-Math.hypot((p.x-b.x)/(b.w||12),(p.y-b.y)/(b.h||12)))[0]||null;}
export const placeVerb=anchor=>verbs[anchor]||'자세히 살피기';
export const motionKind=anchor=>({bed:'cloth',pillow:'pillow',window:'curtain',jacket:'pocket',drawer:'drawer',tote:'bag',tin:'lid',desk:'paper',shelf:'paper',suitcase:'bag'}[anchor]||'paper');
// Clip an alternate painted state to just the furniture that was touched.
export function patchRect(room,anchor){if(room===0){const r={bed:[0,44,56,50],pillow:[0,36,30,20],window:[24,0,33,44],jacket:[54,20,13,37],drawer:[78,44,20,18],tote:[25,43,24,22],tin:[70,1,10,13],desk:[70,35,21,10]};if(r[anchor])return r[anchor];}const a=roomAreas[room][anchor==='pillow'?'bed':anchor];if(!a)return null;const[x,y,w,h]=a;const extra=anchor==='drawer'?6:3;return[Math.max(0,x-w/2-2),Math.max(0,y-h/2-2),Math.min(100,w+4),Math.min(100,h+extra)];}
export function clipRect([x,y,w,h]){return `polygon(${x}% ${y}%,${Math.min(100,x+w)}% ${y}%,${Math.min(100,x+w)}% ${Math.min(100,y+h)}%,${x}% ${Math.min(100,y+h)}%)`;}

// Continuous reveal geometry is shared by pointer input and saved scene rendering.
export function revealRect(rect,progress,direction='right'){
 const [x,y,w,h]=rect,p=Math.max(0,Math.min(1,progress));
 return direction==='left'?[x+w*(1-p),y,w*p,h]:direction==='up'?[x,y+h*(1-p),w,h*p]:direction==='down'?[x,y,w,h*p]:[x,y,w*p,h];
}
export function gestureFrame(dx,dy,width,height,start={progress:0,direction:'right'}){
 const horizontal=Math.abs(dx)>=Math.abs(dy),distance=horizontal?dx/Math.max(30,width*.65):dy/Math.max(30,height*.65);
 const direction=horizontal?(dx<0?'left':'right'):(dy<0?'up':'down');
 const sign=start.progress&&start.direction!==direction?-1:1;
 return {progress:Math.max(0,Math.min(1,(start.progress||0)+Math.abs(distance)*sign)),direction:start.progress?start.direction:direction};
}
export const isDark=s=>!!s.world?.light&&(s.positions?.window?.progress??(s.world?.window?1:0))>=.88;
