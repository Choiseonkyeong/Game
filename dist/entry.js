// The focused chapter is the default. Previous travel progress remains available separately.
if(new URL(location.href).searchParams.get('mode')==='legacy')await import('./play.js?v=070');
else await import('./first-room.js?v=080');
