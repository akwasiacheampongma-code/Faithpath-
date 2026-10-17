/** Transient visual preferences only. Never reads/writes personal storage.
 * The authoritative app still owns route, verse actions, drafts and saving. */
let scale=1;
document.addEventListener('click',event=>{
 const control=event.target.closest('[data-verbunden-action]');if(!control)return;
 const action=control.dataset.verbundenAction;
 if(action==='focus'){
  const on=document.body.classList.toggle('verbunden-reading-focus');
  document.querySelectorAll('[data-verbunden-action=focus]').forEach(b=>b.setAttribute('aria-pressed',String(on)));
  document.querySelector(on?'.reading-focus-exit button':'.reading-tools [data-verbunden-action=focus]')?.focus({preventScroll:true});
  window.dispatchEvent(new Event('faithpath-reader-layout'));
 }else if(action==='larger'||action==='smaller'){
  scale=Math.max(.9,Math.min(1.6,Math.round((scale+(action==='larger'?.1:-.1))*10)/10));
  document.documentElement.style.setProperty('--reader-scale',scale);
  window.dispatchEvent(new Event('faithpath-reader-layout'));
 }
});
document.addEventListener('keydown',event=>{
 if(event.target.matches('.verse[role=button]')&&['Enter',' '].includes(event.key)){event.preventDefault();event.target.click();}
 if(event.key==='Escape'&&!document.querySelector('dialog')?.open&&document.body.classList.contains('verbunden-reading-focus')){
  document.body.classList.remove('verbunden-reading-focus');
  const button=document.querySelector('.reading-tools [data-verbunden-action=focus]');button?.setAttribute('aria-pressed','false');button?.focus({preventScroll:true});
 }
});
window.addEventListener('hashchange',()=>document.body.classList.remove('verbunden-reading-focus'));
