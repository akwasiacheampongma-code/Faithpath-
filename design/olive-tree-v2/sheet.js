(() => {
 const theme=new URLSearchParams(location.search).get('theme');
 if(['light','paper','atmospheric','night'].includes(theme))document.documentElement.dataset.theme=theme;
 document.querySelector('#sheet').innerHTML=window.OLIVE_STUDY.stages.map(s=>`<figure><img src="${s.exports['1024'].path}" width="1024" height="1024" alt="${s.name}"><figcaption><small>0${s.index+1}${s.opticalCloseUp?' · Nahansicht':''}</small><h2>${s.name}</h2><p>${s.index===0?'Ein Anfang darf klein sein.':s.index===1?'Ein bewusst festgehaltener Moment.':s.index===2?'Erfahrungen verbinden sich.':s.index===3?'Langsam und ungerade wachsen.':s.index===4?'Halt, ohne immer stark sein zu müssen.':s.index===5?'Was du selbst als Entwicklung erkennst.':'Deine Geschichte geht weiter.'}</p></figcaption></figure>`).join('');
})();
