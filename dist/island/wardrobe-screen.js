import{trenchFrame,trenchPreview}from'./trench-outfit.js?v=38';
const ART='art/wardrobe-approved-38.jpeg';
const CATEGORIES=[['top','상의'],['bottom','하의'],['dress','드레스'],['shoes','신발'],['hair','헤어'],['accessory','액세서리']];
const viewNames=['정면','뒷모습','왼쪽','오른쪽'];
const cropStyle=(x,y,w,h)=>`background-image:url('${ART}');background-size:${1536/w*100}% ${864/h*100}%;background-position:${x/(1536-w)*100}% ${y/(864-h)*100}%;`;
const thumbs={top:[206,264,105,95],bottom:[1070,374,105,86],shoes:[1070,487,105,83],accessory:[1070,600,105,82],hair:[646,250,280,330]};
function coatThumb(part='coat'){const frame=trenchPreview();if(!frame)return'';const c=document.createElement('canvas');c.width=156;c.height=128;if(part==='skirt')c.getContext('2d').drawImage(frame,100,552,312,104,0,38,156,52);else c.getContext('2d').drawImage(frame,100,336,312,268,0,0,156,134);return c.toDataURL();}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createWardrobeScreen(api){
 let category='top',view='closet',heading=0,notice='';
 function open(options={}){view=options.view||'closet';category=options.category||'top';heading=0;notice='';draw();}
 function changed(){api.changed();}
 function inform(message){notice=message;draw();api.say(message);}
 function draw(){
  const outfit=api.currentOutfit(),female=api.humanChoice()==='female',trench=outfit.dress==='trench-set',preview=view==='shop'&&female;
  const showing=preview?{...outfit,dress:'trench-set'}:outfit;
  const reference=female&&!preview&&!trench&&outfit.bottom==='black-shorts'&&heading===0;
  const title=preview?'베이지 트렌치 코디 · 미리보기':trench?'베이지 트렌치 코디':'기본 코디';
  const hit=(name,action,x,y,w,h,extra='')=>`<button class="wardrobe-image-hit" aria-label="${escape(name)}" title="${escape(name)}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" data-wui="${action}" ${extra}></button>`;
  const item=(id,label,kind,selected=false)=>`<button class="wui-bubble ${selected?'is-worn':''}" data-wui="item:${id}" aria-label="${escape(label)}" aria-pressed="${selected}">${kind==='trench'?`<img class="wui-coat-icon" src="${coatThumb()}" alt="">`:`<span class="wui-crop-icon" style="${cropStyle(...thumbs[kind])}"></span>`}<span class="wui-item-name">${escape(label)}</span>${selected?'<span class="wui-check" aria-hidden="true">✓</span>':''}</button>`;
  let inventory='';
  if(view==='shop')inventory=item('trench-set',female?'베이지 트렌치 코디 · 입기':'여자 캐릭터 전용','trench',trench);
  else if(category==='bottom')inventory=item('shorts','연청 반바지','bottom',outfit.bottom==='shorts'&&!trench)+item('black-shorts','블랙 숏팬츠','bottom',outfit.bottom==='black-shorts'&&!trench);
  else if(category==='dress')inventory=female?item('trench-set','베이지 트렌치 코디','trench',trench):'<p class="wui-empty">준비 중인 의상이에요</p>';
  else if(category==='shoes')inventory=item('sneakers','화이트 운동화','shoes',true);
  else if(category==='hair')inventory=item('base-hair','기본 헤어','hair',true);
  else if(category==='accessory')inventory='<p class="wui-empty">보유한 액세서리가 없어요</p>';
  // Keep all nine approved illustrations exactly as drawn in the top view.
  const grid=view==='closet'&&category==='top'?Array.from({length:9},(_,i)=>hit(i?'준비 중인 의상':'흰색 반팔 티셔츠',i?'unavailable':'item:white-tee',13+i%3*8.05,29.7+Math.floor(i/3)*14.45,7.5,13.3)).join(''):`<section class="wui-inventory" aria-label="${view==='shop'?'상점':CATEGORIES.find(c=>c[0]===category)?.[1]} 아이템">${inventory}</section>`;
  const rowText=trench?['베이지 트렌치 코디','화이트 프릴 스커트']:['흰색 반팔 티셔츠',outfit.bottom==='shorts'?'연청 반바지':'블랙 숏팬츠'];
  api.modal(`<div class="wardrobe-image-stage wui-stage"><img class="wui-original" src="${ART}" alt="승인된 포근섬 나무 프레임 옷장 · 버블 아이템칸과 토끼" width="1536" height="864">${reference?'':`<img class="wui-mirror-clean" src="art/wardrobe-mirror-38.webp" alt=""><img class="wui-person" src="${api.humanSnapshot({preview:true,heading,outfitOverride:showing})}" alt="${escape(title+' · '+viewNames[heading])}">`}${hit('캐릭터 회전 · '+viewNames[heading],'rotate',41,28,19,54)}${hit('내 옷장','closet',33,2,17.8,9,'aria-pressed="'+(view==='closet')+'"')}${hit('의상 상점','shop',51,2,17,9,'aria-pressed="'+(view==='shop')+'"')}${view==='shop'?'<span class="wui-shop-selected" aria-hidden="true"></span><span class="wui-board-title">상점 아이템</span>':''}${CATEGORIES.map(([key,name],i)=>hit(name,'category:'+key,1.4,24.7+i*8.4,10.1,7.8,'aria-pressed="'+(view==='closet'&&category===key)+'"')).join('')}${grid}${(view==='shop'||category!=='top')?'<span class="wui-category-title">'+(view==='shop'?'상점 아이템':CATEGORIES.find(c=>c[0]===category)?.[1]+' 아이템')+'</span>':''}${reference?'':`<span class="wui-caption">${escape((trench||preview?'트렌치 코디':'기본 코디')+(heading?' · '+viewNames[heading]:preview?' · 미리보기':''))}</span>`}${trench?`<div class="wui-equipped-icon"><img src="${coatThumb()}" alt="베이지 트렌치코트"></div><span class="wui-equipped-label">세트 코디</span><div class="wui-equipped-icon wui-skirt-icon"><img src="${coatThumb('skirt')}" alt="화이트 프릴 스커트"></div>`:''}${trench||outfit.bottom==='shorts'?`<span class="wui-equipped-name wui-top-name">${escape(rowText[0])}</span><span class="wui-equipped-name wui-bottom-name">${escape(rowText[1])}</span>`:''}${hit(trench?'세트 코디 해제':'상의 해제','remove:top',89.5,32.3,6.5,6.6)}${hit(trench?'세트 코디 해제':'하의 해제','remove:bottom',89.5,45.3,6.5,6.6)}${hit('신발 해제','remove:shoes',89.5,58.3,6.5,6.6)}${hit('액세서리 해제','remove:accessory',89.5,71.3,6.5,6.6)}${hit('코디 저장','save',5.2,81.2,14.3,8.3)}${hit('초기화','reset',19.8,81.2,12.5,8.3)}${hit('이 모습으로 산책하기','done',76,83,22,10.6)}<span class="wui-wallet">조개 ${api.shells()}</span><p class="wui-notice" role="status">${escape(notice)}</p></div>`);
  api.dialog.classList.add('wardrobe-open','wardrobe-image-open');
  api.paper.querySelectorAll('[data-wui]').forEach(b=>b.onclick=e=>{
   e.stopPropagation();const [action,key]=b.dataset.wui.split(':');
   if(action==='closet'){view='closet';draw();}
   else if(action==='shop'){view='shop';category='dress';heading=0;draw();}
   else if(action==='category'){view='closet';category=key;draw();}
   else if(action==='rotate'){heading=(heading+1)%4;draw();}
   else if(action==='unavailable')inform('이 의상은 준비 중이에요.');
   else if(action==='item'){
    if(key==='trench-set'){if(!female){inform('여자 캐릭터 전용 코디예요.');return;}api.wearItem('dress',key);}
    else if(key==='white-tee')api.wearItem('top',key);
    else if(['shorts','black-shorts'].includes(key))api.wearItem('bottom',key);
    else {inform(key==='base-hair'?'기본 헤어를 사용 중이에요.':'기본 운동화를 사용 중이에요.');return;}
    changed();inform('코디를 적용했어요.');
   }else if(action==='remove'){
    if(trench&&(key==='top'||key==='bottom'))api.wearItem('dress','none');
    else if(key==='top')api.wearItem('top','white-tee');
    else if(key==='bottom')api.wearItem('bottom','shorts');
    else {inform(key==='shoes'?'기본 운동화는 유지돼요.':'착용 중인 액세서리가 없어요.');return;}
    changed();inform('기본 코디로 돌아왔어요.');
   }else if(action==='save'){api.saveLook();inform('코디를 저장했어요.');}
   else if(action==='reset'){api.wearItem('dress','none');api.wearItem('top','white-tee');api.wearItem('bottom','shorts');view='closet';category='top';heading=0;changed();inform('기본 코디로 돌아왔어요.');}
   else if(action==='done')api.done();
  });
 }
 return{open};
}
