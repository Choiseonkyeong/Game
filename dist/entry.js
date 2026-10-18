// The newest focused chapters are the default. Previous travel progress remains available separately.
const params=new URL(location.href).searchParams;let last=null;try{last=localStorage.getItem('little-travel-chapter');}catch{}
const chapter=params.get('chapter')||last;
if(params.get('mode')==='afterlight'||chapter==='afterlight')location.replace(new URL('afterlight/',location.href).href);
else if(params.get('mode')==='case'||chapter==='case')location.replace(new URL('photo-case.html',location.href).href);
else if(params.get('mode')==='legacy')await import('./play.js?v=070');
else if(chapter==='tokyo')await import('./tokyo-room.js?v=121');
else await import('./first-room.js?v=121');
