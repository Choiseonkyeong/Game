export function showExpansion(root,level,{reduced=false}={}){
 root.querySelector('.expansion-celebration')?.remove();
 const el=document.createElement('div');el.className='expansion-celebration';el.setAttribute('role','status');
 el.innerHTML=`<div class="expansion-bubbles" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--i:${i};--x:${12+(i*37)%77}%;--y:${18+(i*23)%63}%;--size:${18+(i*11)%39}px"></i>`).join('')}</div><div class="expansion-message"><small>보글, 톡! 한 뼘 더 넓어진 정원</small><strong>포근섬 Lv${level}</strong><span>새로운 잔디에서 더 넓게 걸어 보세요</span></div>`;
 if(reduced)el.classList.add('is-reduced');root.append(el);setTimeout(()=>el.remove(),reduced?1600:2600);
}
