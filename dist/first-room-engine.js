// A self-contained playable first chapter; the older thirty-stage save is never touched.
export const FIRST_SAVE='little-travel-first-room-v1';
export const bound=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const initialChapter=()=>({schema:1,started:false,drawer:0,pillow:0,lid:0,shade:0,chair:0,frame:0,bin:0,lampOff:false,camera:false,film:false,loaded:false,done:false,photo:null,readNote:false});
export function chapterAction(state,event){
 const s={...state};const fail=reason=>({ok:false,state,reason});
 switch(event.type){
 case 'start':s.started=true;break;
 case 'move':if(!['drawer','pillow','lid','shade','chair','frame','bin'].includes(event.object)||!Number.isFinite(event.value))return fail('invalid');s[event.object]=bound(event.value);break;
 case 'lamp':s.lampOff=!s.lampOff;break;
 case 'note':if(s.pillow<.45)return fail('covered');s.readNote=true;break;
 case 'take':if(event.item==='camera'){if(s.camera||s.drawer<.76)return fail('covered');s.camera=true;}else if(event.item==='film'){if(s.film||s.lid<.62)return fail('covered');s.film=true;}else return fail('invalid');break;
 case 'load':if(!s.camera||!s.film||s.loaded)return fail('missing');s.loaded=true;break;
 case 'shoot':if(!s.loaded||s.shade>.75||s.lampOff||!Number.isFinite(event.x)||!Number.isFinite(event.y)||Math.abs(event.x-.485)>.065||Math.abs(event.y-.16)>.065)return fail('not-ready');s.done=true;s.photo=typeof event.photo==='string'?event.photo:null;break;
 default:return fail('invalid');
 }
 return {ok:true,state:s};
}
export function restoreChapter(raw){
 if(raw?.schema!==1)return initialChapter();const s=initialChapter();for(const k of ['started','lampOff','camera','film','readNote'])s[k]=raw[k]===true;
 for(const k of ['drawer','pillow','lid','shade','chair','frame','bin'])if(Number.isFinite(raw[k]))s[k]=bound(raw[k]);
 s.loaded=s.camera&&s.film&&raw.loaded===true;s.done=s.loaded&&raw.done===true;s.photo=s.done&&typeof raw.photo==='string'&&raw.photo.startsWith('data:image/jpeg')&&raw.photo.length<750000?raw.photo:null;return s;
}
export const firstInventory=s=>[...(s.camera?[s.loaded?'loaded':'camera']:[]),...(s.film&&!s.loaded?['film']:[])];
export function frameReady(s,aim){return s.loaded&&!s.lampOff&&s.shade<=.75&&Math.abs(aim.x-.485)<.065&&Math.abs(aim.y-.16)<.065;}
export const chapterHints=s=>!s.camera?'책상 서랍은 손잡이를 아래로 당겨 열 수 있어요.':!s.film?'베개 아래 메모에 필름 보관 장소가 남아 있어요.':!s.loaded?'카메라를 살펴보고 필름을 빈 칸에 넣어 보세요.':s.shade>.75||s.lampOff?'사진을 찍으려면 방에 빛이 필요해요.':'창가에서 카메라를 들고, 남산타워를 구도 안에 담아 보세요.';
