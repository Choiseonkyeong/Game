'use strict';
// CSS fitting preview and Canvas world share the same sprite registration and placement.
const Wardrobe = (() => {
  const order = ['body', 'hair', 'bottom', 'top', 'outer', 'accessory', 'hat'];
  const labels = {body:'몸체',hair:'헤어',bottom:'하의',top:'상의',outer:'아우터',accessory:'소품',hat:'모자'};
  const config=SpriteConfig, frame=config.frame;
  let items = [
    {id:'body-basic',slot:'body',name:'기본 몸체'},
    {id:'hair-long',slot:'hair',name:'차분한 롱 헤어'},
    {id:'hair-bob',slot:'hair',name:'산뜻한 단발'},
    {id:'bottom-denim',slot:'bottom',name:'연청 데님 팬츠'},
    {id:'bottom-skirt',slot:'bottom',name:'테니스 스커트'},
    {id:'top-oat',slot:'top',name:'오트밀 스웨트셔츠'},
    {id:'top-pink',slot:'top',name:'딸기 스트라이프 티'},
    {id:'outer-cream',slot:'outer',name:'크림 오픈 가디건'},
    {id:'outer-pink',slot:'outer',name:'말랑 핑크 가디건'},
    {id:'accessory-tote',slot:'accessory',name:'작은 에코백'},
    {id:'accessory-ribbon',slot:'accessory',name:'러블리 리본'},
    {id:'hat-beret',slot:'hat',name:'봄빛 베레모'},
    {id:'hat-ribbon',slot:'hat',name:'복숭아 헤어 리본'}
  ];
  if(typeof FashionCatalog!=='undefined')items.push(...FashionCatalog);
  items=[...new Map(items.map(item=>[item.id,item])).values()];
  for(const item of items){item.src=config.items[item.id]?.src||item.layerImg||'';item.category=item.category||labels[item.slot];item.price=item.price||0;item.iconImg=item.iconImg||`./images/icons/${item.id}.png`}
  const owned=id=>{const item=items.find(i=>i.id===id);return !!item&&(!item.price&&!item.recipe||typeof economy!=='undefined'&&economy.data.owned.includes(id))};
  const defaults={body:'body-basic',hair:'hair-long',bottom:'bottom-denim',top:'top-oat',outer:null,accessory:'accessory-tote',hat:null};
  const byId = new Map(items.map(i=>[i.id,i]));
  function normalize(value){return Object.fromEntries(order.map(slot=>[slot, byId.get(value?.[slot])?.slot===slot&&owned(value[slot])?value[slot]:['body','hair','bottom','top'].includes(slot)?defaults[slot]:null]))}
  const storageKey='pogeun.wardrobe.v1';let equipped={...defaults},saved=[null,null,null],storageAvailable=true;
  try{const raw=JSON.parse(localStorage.getItem(storageKey));if(raw?.version===1){equipped=normalize(raw.equipped);saved=saved.map((_,i)=>raw.saved?.[i]?normalize(raw.saved[i]):null)}}catch{storageAvailable=false}
  const composite=document.createElement('canvas');composite.width=frame.width;composite.height=frame.height;const c=composite.getContext('2d');
  const images=new Map(), failures=new Set();let activeSlot='top',status='아이템을 눌러 자유롭게 입어 보세요.';
  const reference=new Image();let referenceLoaded=false;
  const ready=img=>!!(img?.complete&&img.naturalWidth);
  const settings=item=>({...config.layers[item.slot],...config.items[item.id]});
  const sorted=()=>[...order].sort((a,b)=>config.layers[a].z-config.layers[b].z);
  function mode(){return ready(images.get(equipped.body))?'layers':referenceLoaded?'reference':'loading'}
  function assetNote(){const m=mode();if(m==='reference')return '기본 캐릭터 · 가디건·소품·모자를 덧입힐 수 있어요. 선택한 의상이 실시간으로 반영돼요.';if(m==='loading')return '몸체 이미지를 불러오는 중이거나 경로를 확인해야 합니다.';const missing=order.filter(slot=>equipped[slot]&&!ready(images.get(equipped[slot])));return missing.length?'이미지 미연결: '+missing.map(slot=>labels[slot]).join(', '):'실제 PNG 레이어 · 실시간 피팅';}
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify({version:1,equipped,saved}));storageAvailable=true;return true}catch{storageAvailable=false;return false}}
  function drawLayer(context,image,placement={x:0,y:0,scale:1}){
    const w=image.naturalWidth,h=image.naturalHeight||frame.height;
    const fit=Math.min(frame.width/w,frame.height/h),scale=placement.scale??1;
    const dw=w*fit,dh=h*fit;
    context.drawImage(image,(placement.x||0)+(frame.width-dw)/2*scale,(placement.y||0)+(frame.height-dh)/2*scale,dw*scale,dh*scale);
  }
  function visibleSlots(){return mode()==='layers'?sorted():sorted().filter(slot=>(config.referenceOverlays||[]).includes(slot))}
  function syncPreview(){const root=document.querySelector('#avatarLayers');if(!root)return;root.style.setProperty('--sprite-ratio',`${frame.width} / ${frame.height}`);root.replaceChildren();
    function append(image,placement,z,slot){const img=document.createElement('img');img.src=image.src;img.alt='';img.className='avatar-layer';img.dataset.layer=slot;img.style.zIndex=String(z);img.style.setProperty('--layer-x',((placement.x||0)/frame.width*100)+'%');img.style.setProperty('--layer-y',((placement.y||0)/frame.height*100)+'%');img.style.setProperty('--layer-scale',String(placement.scale??1));root.append(img)}
    if(mode()!=='layers'&&referenceLoaded)append(reference,{x:0,y:0,scale:1},0,'reference');
    for(const slot of visibleSlots()){const item=byId.get(equipped[slot]),img=images.get(item?.id);if(item&&ready(img))append(img,settings(item),config.layers[slot].z,slot)}
    const note=document.querySelector('#spriteAssetNote');if(note)note.textContent=assetNote();
  }
  function compose(){c.clearRect(0,0,frame.width,frame.height);if(mode()!=='layers'&&referenceLoaded)drawLayer(c,reference);for(const slot of visibleSlots()){const item=byId.get(equipped[slot]),image=images.get(item?.id);if(item&&ready(image))drawLayer(c,image,settings(item))}syncPreview();}
  // Register all Image objects before setting src; handles cached/synchronous load events too.
  for(const item of items)images.set(item.id,new Image());
  for(const item of items){const img=images.get(item.id);img.onload=()=>{failures.delete(item.id);compose()};img.onerror=()=>{failures.add(item.id);compose()};if(item.src)img.src=item.src;}
  reference.onload=()=>{referenceLoaded=true;compose()};reference.onerror=()=>{referenceLoaded=false;compose()};reference.src=config.reference;
  function equip(id){const item=byId.get(id);if(!item||!owned(id))return false;equipped[item.slot]=id;persist();compose();return true}
  function save(index){if(!Number.isInteger(index)||index<0||index>2)return false;saved[index]={...equipped};return persist()}
  function load(index){if(!saved[index])return false;equipped=normalize(saved[index]);persist();compose();return true}
  function reset(){equipped={...defaults};persist();compose()}
  function open(showModal){equipped=normalize(equipped);
    showModal('오늘의 옷장',`<div class="wardrobe-layout"><section class="fitting"><span class="fitting-tag">LIVE FITTING</span><div class="avatar-stage"><div id="avatarLayers" class="avatar-stack" role="img" aria-label="현재 착용한 캐릭터 이미지"></div><canvas id="fittingPreview" class="avatar-effects" width="${frame.width}" height="${frame.height}" aria-hidden="true"></canvas></div><b>포근이의 오늘</b><small id="spriteAssetNote"></small><button class="item" id="resetLook">기본 코디로 리셋</button></section><section class="closet"><div class="wardrobe-tabs" aria-label="의상 분류">${order.map(slot=>`<button data-slot="${slot}" aria-pressed="${slot===activeSlot}">${labels[slot]}</button>`).join('')}</div><div class="wardrobe-items"></div><p id="fittingStatus" role="status"></p><section class="saved-looks"><h3>나의 코디 보관함</h3><p>선택한 슬롯에 저장하면 다음 방문에도 꺼내 입을 수 있어요.</p>${[0,1,2].map(i=>`<div class="save-row"><span id="saveLabel${i}"></span><button data-save="${i}">저장</button><button data-load="${i}">불러오기</button></div>`).join('')}</section></section></div>`);
    document.querySelector('#modal').classList.add('wardrobe-modal');
    function render(){const list=document.querySelector('.wardrobe-items');list.innerHTML=items.filter(i=>i.slot===activeSlot).map(i=>`<button class="item wardrobe-item" data-equip="${i.id}" data-owned="${owned(i.id)}" aria-pressed="${equipped[i.slot]===i.id}"><span class="item-art" data-art="${i.id}"></span><b>${i.name}</b><small>${equipped[i.slot]===i.id?'착용 중':owned(i.id)?'착용하기':`${i.price.toLocaleString()} 조개 · 구매하기`}</small></button>`).join('')+(['outer','accessory','hat'].includes(activeSlot)?`<button class="item wardrobe-item" data-remove="${activeSlot}" aria-pressed="${!equipped[activeSlot]}"><span>∅</span><b>미착용</b></button>`:'');
      document.querySelectorAll('[data-art]').forEach(el=>{const item=byId.get(el.dataset.art),img=document.createElement('img');img.alt='';img.onerror=()=>{el.textContent='✧ 이미지 준비 중'};img.src=item.iconImg;el.append(img)});
      document.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{const item=byId.get(b.dataset.equip);if(!owned(item.id)){FashionUI.shop(item.category);return}equip(item.id);status=ready(images.get(item.id))?`${item.name} 착용${storageAvailable?'':' · 저장 불가'}`:`${item.name} 코디 선택됨 · 의상 PNG 준비 중, 기본 캐릭터를 유지합니다.`;render()});
      document.querySelector('[data-remove]')?.addEventListener('click',()=>{equipped[activeSlot]=null;persist();compose();status=`${labels[activeSlot]}을 벗었어요.`;render()});
      document.querySelectorAll('[data-slot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.slot===activeSlot)));
      saved.forEach((look,i)=>{document.querySelector('#saveLabel'+i).textContent=`코디 ${i+1} · ${look?'저장됨':'비어 있음'}`;document.querySelector(`[data-load="${i}"]`).disabled=!look});
      document.querySelector('#fittingStatus').textContent=status;compose();
    }
    document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{activeSlot=b.dataset.slot;render()});
    document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.save);status=save(i)?`코디 ${i+1}을 이 브라우저에 저장했어요.`:'저장 공간을 사용할 수 없어요. 이 코디는 이번 방문에만 보관돼요.';render()});
    document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.load);if(load(i))status=`코디 ${i+1}을 불러왔어요.`;render()});
    document.querySelector('#resetLook').onclick=()=>{reset();status='기본 코디로 돌아왔어요. 저장한 코디는 유지돼요.';render()};render();
  }
  function particles(context,x,y,width,t){if(!order.some(slot=>byId.get(equipped[slot])?.unique&&ready(images.get(equipped[slot]))&&mode()==='layers'))return;context.save();context.fillStyle='#fff0ae';for(let i=0;i<12;i++){const a=t/900+i*Math.PI/6,px=x+Math.cos(a)*width*.55,py=y-width*.65+Math.sin(a*1.3)*width*.6;context.globalAlpha=.45+.5*Math.sin(a)**2;context.beginPath();context.arc(px,py,1.2+width*.015,0,Math.PI*2);context.fill()}context.restore()}
  function animatePreview(t){const preview=document.querySelector('#fittingPreview');if(preview){const p=preview.getContext('2d');p.clearRect(0,0,frame.width,frame.height);particles(p,frame.width/2,frame.height*.95,frame.width*.83,t)}requestAnimationFrame(animatePreview)}
  if(typeof requestAnimationFrame!=='undefined')requestAnimationFrame(animatePreview);
  return {assetNote,get mode(){return mode()},get missing(){return [...failures]},open,equip,save,load,reset,draw(context,x,y,width=72){context.drawImage(composite,x-width/2,y-width*frame.height/frame.width,width,width*frame.height/frame.width);particles(context,x,y,width,typeof performance!=='undefined'?performance.now():0)},get equipped(){return {...equipped}},get saved(){return saved.map(x=>x?{...x}:null)},order,items};
})();
