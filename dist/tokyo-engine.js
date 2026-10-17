// Chapter 2 · Tokyo photo shop. Its own save; the Seoul chapter and the legacy journal are never modified.
export const TOKYO_SAVE='little-travel-tokyo-v1';
export const CHAPTER_KEY='little-travel-chapter';
export const GOOD_FRAME=3;
const bound=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const initialTokyo=()=>({schema:1,started:false,dropped:false,ticket:false,drawer:0,negative:false,lampOn:false,print:false,pinned:false,done:false,tries:0});
export function tokyoAction(state,event){
 const s={...state},fail=reason=>({ok:false,state,reason});
 switch(event?.type){
 case 'start':s.started=true;break;
 // The claim ticket slips out of the tote's outer pocket only when the bag really swings.
 case 'drop':if(s.dropped)return fail('done');if(!(Math.abs(event.swing)>=.17))return fail('gentle');s.dropped=true;break;
 case 'move':if(event.object!=='drawer'||!Number.isFinite(event.value))return fail('invalid');s.drawer=bound(event.value);break;
 case 'lamp':s.lampOn=!s.lampOn;break;
 case 'take':
  if(event.item==='ticket'){if(!s.dropped||s.ticket)return fail('missing');s.ticket=true;}
  else if(event.item==='negative'){if(s.negative)return fail('done');if(s.drawer<.7)return fail('closed');if(event.envelope!==27)return fail('other-envelope');if(!s.ticket)return fail('no-ticket');s.negative=true;}
  else return fail('invalid');break;
 case 'print':if(!s.negative||s.print)return fail('missing');if(!s.lampOn)return fail('dark');if(event.frame!==GOOD_FRAME){s.tries++;return {ok:false,state:s,reason:event.frame===1?'fogged':event.frame===2?'shaken':'blank'};}s.print=true;break;
 case 'pin':if(!s.print||s.pinned)return fail('missing');s.pinned=true;s.done=true;break;
 default:return fail('invalid');
 }
 return {ok:true,state:s};
}
export function restoreTokyo(raw){
 if(raw?.schema!==1)return initialTokyo();const s=initialTokyo();
 s.started=raw.started===true;s.dropped=raw.dropped===true;s.ticket=s.dropped&&raw.ticket===true;s.drawer=Number.isFinite(raw.drawer)?bound(raw.drawer):0;s.lampOn=raw.lampOn===true;
 s.negative=s.ticket&&raw.negative===true;s.print=s.negative&&raw.print===true;s.pinned=s.print&&raw.pinned===true;s.done=s.pinned;s.tries=Number.isInteger(raw.tries)?Math.max(0,raw.tries):0;return s;
}
// Each item leaves the bag once it has been used for the next step.
export const tokyoInventory=s=>[...(s.ticket&&!s.negative?['ticket']:[]),...(s.negative&&!s.print?['negative']:[]),...(s.print&&!s.pinned?['print']:[])];
export const tokyoHintPhase=s=>!s.dropped?'pocket':!s.ticket?'floor':!s.negative?'envelope':!s.print&&!s.lampOn?'light':!s.print?'negative':'board';
const HINTS={
 pocket:['고리에 걸린 가방의 바깥 주머니를 살펴봐요.','주머니 밖으로 종이 끝이 조금 나와 있어요.','가방을 옆으로 당겼다가 놓아 흔들어 보세요. 창가 풍경의 종이 띠에도 메모가 있어요.'],
 floor:['방금 떨어진 것은 어디에 멈췄을까요?','가방 아래 바닥의 작은 종이를 살펴봐요.','바닥에 떨어진 맡김표를 눌러 주워요.'],
 envelope:['맡김표는 어떤 물건을 찾아가는 표일까요?','표의 번호와 봉투의 번호를 비교해요.','카운터 서랍을 열고 맡김표와 같은 27번 봉투를 골라요.'],
 light:['필름 속 그림은 어두운 곳에서 잘 보이지 않아요.','라이트박스 위 스탠드가 꺼져 있어요.','뒤 선반의 스탠드를 눌러 켠 뒤 필름을 살펴봐요.'],
 negative:['네 컷의 선명도가 서로 달라요.','확대경을 각 컷 위로 옮겨 비교해요. 원하는 컷을 누르면 확대경이 이동해요.','3번째 컷이 선명해요. 확대경을 그 위에 놓고 ‘이 컷 인화하기’를 눌러요. 바닥 영수증에서도 확인할 수 있어요.'],
 board:['인화한 사진을 걸어 둘 곳이 있어요.','왼쪽 벽의 사진 보드에 빈자리가 있어요.','소지품의 사진을 선택하고 왼쪽 벽 사진 보드를 눌러요.']
};
export const tokyoHint=(s,level=0)=>HINTS[tokyoHintPhase(s)][Math.max(0,Math.min(2,Math.floor(level)||0))];
export const loupeFrame=p=>{if(!p||p.y<634||p.y>746)return 0;for(let f=1;f<=4;f++)if(Math.abs(p.x-(170+(f-1)*160))<=65)return f;return 0;};
export const failText={'no-ticket':'맡김표가 있어야 찾아갈 수 있어요.','other-envelope':'번호가 다른 봉투예요.',dark:'빛이 없으면 필름 속이 보이지 않아요.',fogged:'빛이 샌 컷이에요. 하얗게 날아갔어요.',shaken:'흔들린 컷이에요.',blank:'아무것도 찍히지 않은 칸이에요.'};
