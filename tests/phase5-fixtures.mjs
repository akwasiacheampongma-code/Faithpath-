import {phase3Fixture,TEST_NOW} from './phase3-fixtures.mjs';
export {TEST_NOW};
export function phase5Fixture(name='thirty',theme='light'){
 if(name==='one-due'){const d=phase5Fixture('ten-due',theme);d.journal=d.journal.slice(0,1);return d;}
 if(name==='empty')return phase3Fixture('empty',theme);
 const d=phase3Fixture(name==='multiple'?'multiple-links':'active',theme);
 if(['one','thirty','threehundred','long','legacy','none','ten-due'].includes(name)){
  d.journal=Array.from({length:name==='threehundred'?300:name==='thirty'||name==='none'?30:name==='ten-due'?10:1},(_,i)=>({id:'j-'+i,text:(i%2?'Eine offene Frage über Geduld und Hoffnung. ':'Ein Gedanke über Zuhören und Vertrauen. ')+i+(name==='long'?'\nEin bewusst langer synthetischer Text. '.repeat(80):''),date:new Date(Date.parse('2026-07-01T12:00:00Z')+i*8640000).toISOString(),type:'Journal',subtype:i%3===0?'Gebet':i%3===1?'Gedanken':'Frage',pathIds:name==='ten-due'?[]:[d.paths[0].id],...(i%2===0?{ref:{book:'JHN',chapter:3,from:1,to:1,translation:'otb'}}:{})}));
  d.reflections=[];d.reviews=[];d.paths[0].links=d.paths[0].links.filter(l=>l.kind==='verse');
 }
 if(name==='one')d.journal[0].date='2026-10-15T12:00:00Z';
 if(name==='legacy'){d.journal[0].date='not-a-date';d.journal[0].ref={book:'OLD-INVALID',chapter:999};}
 if(name==='no-due'){d.paths=[];d.journal=[];d.reflections=[];}
 if(name==='ten-due')d.paths=[];
 if(name==='review-snapshot'){
  d.paths[0].reviews=[{id:'snapshot-review',date:'2026-10-01T12:00:00Z',text:'Heute halte ich diesen Gedanken anders fest.',status:'working',confirmedDevelopment:false,sourceKey:'path:personal-path',sourceSnapshot:{key:'path:personal-path',title:d.paths[0].title,text:'Damals wollte ich vor der Antwort innehalten.',at:'2026-09-01T12:00:00Z',stepId:'past-0'}}];d.paths[0].steps.find(x=>x.id==='past-0').text='Heute anders formulierter Schritt.';
 }
 if(name==='review-edited')d.journal[0].updatedAt='2026-10-02T12:00:00Z';
 if(name==='review-missing')d.journal=[];
 return d;
}
