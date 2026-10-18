export const CASE_SAVE='afterlight-case-01-v1';
export const initialCase=()=>({schema:1,started:false,aligned:false,chair:870,lamp:false,back:false,letter:false,mark:false,answer:null,choice:null,shot:false});
export const caseReady=s=>s.aligned&&s.back&&s.letter&&s.mark&&s.answer==='visitors';
export function caseAction(state,e){
 const s={...state},fail=reason=>({ok:false,state,reason});
 switch(e?.type){
 case 'start':s.started=true;break;
 case 'align':if(!Number.isFinite(e.offset)||Math.abs(e.offset)>.035)return fail('alignment');s.aligned=true;break;
 case 'chair':if(!Number.isFinite(e.x))return fail('invalid');s.chair=Math.max(560,Math.min(1000,e.x));break;
 case 'lamp':s.lamp=!s.lamp;break;
 case 'back':s.back=true;break;
 case 'letter':if(s.chair>710)return fail('covered');s.letter=true;break;
 case 'mark':if(!s.aligned)return fail('compare');if(!s.lamp)return fail('dark');if(s.chair>710)return fail('covered');s.mark=true;break;
 case 'answer':if(!s.back||!s.letter||!s.mark)return fail('evidence');if(e.answer!=='visitors')return fail('reason');s.answer=e.answer;break;
 case 'choose':if(!caseReady(s))return fail('unfinished');if(!['space','window'].includes(e.choice))return fail('invalid');s.choice=e.choice;break;
 case 'shoot':if(!caseReady(s)||!s.choice)return fail('unfinished');s.shot=true;break;
 default:return fail('invalid');
 }
 return {ok:true,state:s};
}
export function restoreCase(raw){
 const s=initialCase();if(raw?.schema!==1)return s;
 for(const k of ['started','aligned','lamp','back'])s[k]=raw[k]===true;
 if(Number.isFinite(raw.chair))s.chair=Math.max(560,Math.min(1000,raw.chair));
 s.letter=raw.letter===true;s.mark=s.aligned&&raw.mark===true;
 s.answer=s.back&&s.letter&&s.mark&&raw.answer==='visitors'?'visitors':null;
 s.choice=caseReady(s)&&['space','window'].includes(raw.choice)?raw.choice:null;s.shot=!!s.choice&&raw.shot===true;return s;
}
export function caseHint(s,level=0){
 const a=!s.aligned?['옛 사진을 현재 가게에 겹쳐 보세요.','사진과 방의 선반 기둥을 맞춰 보세요.','사진 비교에서 좌우로 밀어 두 선반 선을 겹쳐요.']:!s.back?['사진에는 앞면 말고도 기록이 있어요.','오래된 사진의 뒷면을 보세요.','사진 뒤집기를 눌러 메모를 읽어요.']:!s.letter?['지금 의자 아래에 종이 끝이 보여요.','의자를 왼쪽으로 옮기면 종이가 나와요.','의자를 왼쪽으로 끌거나 의자 옮기기를 누른 뒤 바닥 편지를 주워요.']:!s.mark?['사진에 있던 다른 의자는 어디에 있었을까요?','빛을 켜고 비어 있는 오른쪽 바닥을 보세요.','스탠드를 켜고 사진 비교를 맞춘 뒤 오른쪽 의자 자국을 살펴봐요.']:!s.answer?['사진 뒷면과 편지, 바닥의 흔적을 함께 읽어 보세요.','사진관에 왔다가 떠나는 사람은 누구일까요?','기록에서 빈자리의 주인으로 손님들을 골라요.']:!s.choice?['이제 과거와 똑같이 만들 필요는 없어요.','마지막 사진에 남기고 싶은 구도를 골라요.','마지막 촬영을 열고 두 구도 중 하나를 선택해요.']:['선택한 구도로 마지막 한 컷을 남겨요.','촬영 화면에서 셔터를 눌러요.','사진 찍기를 누르면 사진책이 완성돼요.'];
 return a[Math.min(2,Math.max(0,level))];
}
