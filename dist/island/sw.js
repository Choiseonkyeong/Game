// Offline cache for the installed app. Network first so updates arrive; the cache answers when offline.
const CACHE='pogeun-island-3';
const CORE=['./','./index.html','./island.css?v=1','./island.js?v=3','./core.js?v=1','./avatar.js?v=1','./rig.js?v=3','./art/manifest.json','./manifest.webmanifest','./art/icon-192.png','./art/icon-512.png','../littlepark/garden-atlas.webp','../littlepark/momo-atlas.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('pogeun-island-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
