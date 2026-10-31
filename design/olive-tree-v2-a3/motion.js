/* Finite CSS motion with one shared parent for each crown and its fruit layer. */
(() => {
 'use strict';
 function create(root,onStatus=()=>{}){const media=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,running=false,timer=null;
  function stop(message='Bewegung beendet.'){clearTimeout(timer);root.classList.remove('is-playing');running=false;onStatus(media.matches?'Reduzierte Bewegung: statische Darstellung.':message);}
  function play(){if(media.matches){stop();return false;}if(!visible||document.hidden){stop('Außerhalb der sichtbaren Ansicht pausiert.');return false;}stop('');void root.offsetWidth;root.classList.add('is-playing');running=true;onStatus('Zwei begrenzte Kronenzyklen. Stamm und Boden bleiben statisch.');timer=setTimeout(()=>stop(),16000);return true;}
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(!visible)stop('Außerhalb der sichtbaren Ansicht pausiert.');},{threshold:.1});observer.observe(root);
  const changed=()=>{if(media.matches)stop();},visibility=()=>{if(document.hidden)stop('Im Hintergrund pausiert.');},ended=e=>{if(e.animationName==='a3-right-sway')stop();};
  media.addEventListener('change',changed);document.addEventListener('visibilitychange',visibility);root.addEventListener('animationend',ended);
  if(media.matches)stop();
  return{play,stop,get reduced(){return media.matches;},get running(){return running;},dispose(){stop();observer.disconnect();media.removeEventListener('change',changed);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('animationend',ended);}};
 }
 window.OLIVE_MOTION={create};
})();
