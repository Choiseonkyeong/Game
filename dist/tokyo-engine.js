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
export const tokyoHint=s=>!s.dropped?'창가 풍경(風鈴)의 종이 띠를 읽어 보세요. 카운터 고리의 가방을 크게 흔들면 주머니에서 무언가 떨어질지도 몰라요.':!s.ticket?'바닥에 떨어진 종이를 주워요.':!s.negative?'카운터 큰 서랍에 맡긴 봉투들이 있어요. 맡김표 번호와 같은 봉투를 찾아요.':!s.print&&!s.lampOn?'필름은 빛에 비춰야 보여요. 뒤 선반의 스탠드를 켜 보세요.':!s.print?'라이트박스에서 확대경으로 컷을 살펴봐요. 카운터 모서리 바닥의 영수증에 잘 나온 컷 번호가 적혀 있어요.':'인화한 사진을 왼쪽 벽 사진 보드에 붙여요.';
export const failText={'no-ticket':'맡김표가 있어야 찾아갈 수 있어요.','other-envelope':'번호가 다른 봉투예요.',dark:'빛이 없으면 필름 속이 보이지 않아요.',fogged:'빛이 샌 컷이에요. 하얗게 날아갔어요.',shaken:'흔들린 컷이에요.',blank:'아무것도 찍히지 않은 칸이에요.'};
