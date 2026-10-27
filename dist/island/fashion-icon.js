// Small native 2D garment icons, using the same warm outlines and muted palette.
export function fashionIcon(id){
 const colors={'white-tee':'#fff7e9','oversized-knit':'#d7bdca','cream-vneck':'#e8d7ba',cardigan:'#bdcdbb',crop:'#f0dfcf',shorts:'#a9bbcf','black-shorts':'#69646b',skirt:'#d8bbc4',pleats:'#cfc2af','knit-set':'#d7bdca','ribbon-dress':'#e8d7ba'};
 const skirt=['skirt','pleats','ribbon-dress'].includes(id),shorts=id.includes('shorts'),body=shorts?'<path d="M22 18h36l4 37-21 2-2-20-3 20-19-2Z"/>':skirt?'<path d="M29 16h22l14 41q-25 8-50 0Z"/>':'<path d="M26 17l-12 8-7 18 15 5 5-12-3 28h34l-3-28 6 12 14-5-8-18-13-8q-14 10-28 0Z"/>';
 const details=shorts?'<path d="M23 24h34M39 25v13m-12-9v9m26-9v9"/>':skirt?'<path d="M30 22h20m-18 5-5 29m12-29-1 30m9-30 6 29"/>':id==='cardigan'?'<path d="M29 20l11 15 12-15M40 35v28m-13-15h9m9 0h9"/>':'<path d="M29 22q11 12 23 0M28 57h26m-29-25-5 9m38-9 5 9"/>';
 return `<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="69" rx="25" ry="4" fill="#8d705619"/><g fill="${colors[id]||'#e8d7ba'}" stroke="#8b7060" stroke-width="1.5" stroke-linejoin="round">${body}</g><g fill="none" stroke="#9c81745e" stroke-width="1.1" stroke-linecap="round">${details}</g>${skirt?'<path d="M39 24q-12-8-10 1q3 6 10 0q11-9 12-1q-1 6-12 1m1 1-3 10m4-10 3 10" fill="#f6e3d4" stroke="#9c8174" stroke-width="1"/>':''}</svg>`;
}
