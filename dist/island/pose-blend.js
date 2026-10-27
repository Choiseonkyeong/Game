// Fade between full source poses; walk frames keep their normal continuous gait.
export function blendPose(image, surface, pose) {
 const previous=surface.pose;surface.pose=pose;
 if(!previous||previous===pose||!image.getAttribute('href'))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.getElementById('game')?.dataset.reduced==='true')return;
 surface.blend?.remove();if(surface.frame)cancelAnimationFrame(surface.frame);
 const ghost=document.createElementNS('http://www.w3.org/2000/svg','image');
 for(const key of ['href','x','y','width','height','preserveAspectRatio']){const value=image.getAttribute(key);if(value!==null)ghost.setAttribute(key,value);}
 ghost.setAttribute('pointer-events','none');ghost.setAttribute('aria-hidden','true');ghost.setAttribute('class','pose-blend-ghost');image.before(ghost);surface.blend=ghost;const start=performance.now();image.style.opacity='0';
 const tick=time=>{const progress=Math.min(1,Math.max(0,(time-start)/140));if(!image.isConnected){ghost.remove();return;}image.style.opacity=String(progress);ghost.style.opacity=String(1-progress);if(progress<1)surface.frame=requestAnimationFrame(tick);else{ghost.remove();surface.blend=null;surface.frame=null;image.style.opacity='1';}};
 surface.frame=requestAnimationFrame(tick);
}
