// The newest focused chapters are the default. Previous travel progress remains available separately.
const params=new URL(location.href).searchParams;let last=null;try{last=localStorage.getItem('little-travel-chapter');}catch{}
const chapter=params.get('chapter')||last;
if(params.get('mode')==='legacy')await import('./play.js?v=070');
else if(chapter==='tokyo')await import('./tokyo-room.js?v=121');
else await import('./first-room.js?v=121');
