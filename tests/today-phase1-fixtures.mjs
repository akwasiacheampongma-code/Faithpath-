import {empty} from '../src/store.js';
export const TEST_NOW='2026-10-16T12:00:00.000Z';
export function todayFixture(name='new',theme='light'){
 const data=empty();data.settings.theme=theme;
 const recent='2026-10-15T12:00:00.000Z',old='2026-08-01T12:00:00.000Z';
 const path=(id='today-path')=>({id,title:'In Ruhe zuhören',why:'Menschen aufmerksam begegnen.',category:'sonstiges',started:recent,archived:false,steps:[{id:id+'-step',text:'Im nächsten Gespräch ausreden lassen.',done:false,createdAt:recent}],links:[],reviews:[],milestones:[]});
 if(name!=='new'){
  if(!['reading-only','journal-only','draft-only','guided-only'].includes(name))data.paths=[path()];
  if(!['archived','reading-only','journal-only','draft-only','guided-only','no-step'].includes(name)){
   data.reading={book:'JHN',chapter:3,translation:'otb'};
   data.journal=[{id:'today-note',text:'Ich darf zuhören, bevor ich eine Antwort suche.',type:'Journal',subtype:'Gedanken',date:recent,pathIds:['today-path']}];
  }
 }
 if(name==='archived')data.paths[0].archived=true;
 if(name==='no-step')data.paths[0].steps[0].done=true;
 if(name==='reading-only')data.reading={book:'JHN',chapter:3,translation:'otb'};
 if(name==='journal-only')data.journal=[{id:'only-note',text:'Ein Gedanke, der mich begleitet.',date:recent,type:'Journal',subtype:'Gedanken',pathIds:[]}];
 if(name==='guided-only')data.guidedPlans={vertrauen:{0:true}};
 if(name==='review'){data.paths[0].started=old;data.paths[0].steps[0].createdAt=old;data.journal=[];}
 if(name==='many-reviews'){data.paths=Array.from({length:8},(_,i)=>({...path('p-'+i),started:old,steps:[],why:'Ein zurückliegender Gedanke.'}));data.journal=[];}
 if(name==='many-paths')data.paths=Array.from({length:8},(_,i)=>path('p-'+i));
 if(name==='long'){data.paths[0].title='Ein persönlicher Weg mit einem sehr langen Titel: aufmerksam zuhören und auch schwierigen Gesprächen mit Geduld und Vertrauen begegnen';data.paths[0].steps[0].text='Ein ausführlicher Schritt, den ich mit Geduld und Aufmerksamkeit ausprobieren möchte. '.repeat(8);data.paths[0].why='Eine persönliche Begründung. '.repeat(20);}
 if(name.startsWith('stage-'))data.paths[0].milestones=Array.from({length:[0,1,2,3,5,7,10][+name.at(-1)]},(_,i)=>({id:'m-'+i,text:'Selbst dokumentierte Entwicklung.',date:recent}));
 const draft=['draft','draft-only'].includes(name)?{type:'entry',args:{},values:{text:'Ein noch ungespeicherter persönlicher Gedanke.',kind:'Gedanken',pathId:name==='draft'?'today-path':''},saved:recent}:null;
 return {data,draft};
}
