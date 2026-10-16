import {empty} from '../src/store.js';
export const TEST_NOW='2026-10-16T12:00:00.000Z',OLD='2026-08-01T12:00:00.000Z';
export function phase3Fixture(name='active',theme='light'){
 const data=empty();data.settings.theme=theme;
 const makePath=i=>({id:i?'p-'+i:'personal-path',title:i?'Ein persönlicher Weg '+i:'In Ruhe zuhören',why:'Ich möchte Menschen aufmerksam begegnen.',category:'sonstiges',started:OLD,archived:false,steps:[{id:'step-'+i,text:i?'Ein kleiner, selbst gewählter Schritt.':'Im nächsten Gespräch ausreden lassen.',done:false,createdAt:OLD},{id:'later-'+i,text:'Eine offene Frage stellen.',done:false,createdAt:OLD},{id:'past-'+i,text:'Vor der Antwort innehalten.',done:true,createdAt:OLD,completedAt:'2026-08-02T12:00:00.000Z'}],links:[],reviews:[],milestones:[]});
 if(name==='empty')return data;
 data.paths=Array.from({length:name==='many'?30:name==='five'||name==='mixed'?5:1},(_,i)=>makePath(i));
 const p=data.paths[0];data.journal=[{id:'thought-old',text:'Ich war unsicher, wie ich reagieren soll.',date:OLD,type:'Journal',subtype:'Gedanken',pathIds:[p.id],reflectionId:'mirror-old'},{id:'thought-new',text:'Ich darf erst zuhören und dann antworten.',date:'2026-10-15T12:00:00.000Z',type:'Journal',subtype:'Gedanken',pathIds:[p.id]}];
 data.reflections=[{id:'mirror-old',text:data.journal[0].text,date:OLD,pathIds:[p.id]}];
 p.links=[{id:'verse-link',kind:'verse',label:'Johannes 3,1',ref:{book:'JHN',chapter:3,from:1,to:1,translation:'otb'},date:OLD},{id:'thought-link',kind:'reflection',journalId:'thought-old',reflectionId:'mirror-old',label:'Mein Gedanke',date:OLD}];
 data.reviews=[{id:'review-old',date:'2026-09-01T12:00:00.000Z',text:'Ich sehe diesen Gedanken heute mit mehr Ruhe.',sourceKey:'journal:thought-old',confirmedDevelopment:false}];
 if(name==='archived')data.paths.forEach(p=>p.archived=true);
 if(name==='mixed')data.paths.at(-1).archived=true;
 if(name==='long'){p.title='Ein persönlicher Weg mit einem langen Namen: aufmerksam zuhören, geduldig bleiben und Unsicherheit zulassen';p.why='Eine persönliche Begründung mit Zeilenumbrüchen.\n'.repeat(15);p.steps[0].text='Ein selbst gewählter nächster Schritt im Alltag. '.repeat(8);}
 if(name==='completed')p.steps.forEach(s=>s.done=true);
 if(name==='many-thoughts')for(let i=0;i<95;i++)data.journal.push({id:'thought-'+i,text:'Ein echter synthetischer Gedanke '+i,date:new Date(Date.parse(OLD)+i*86400000).toISOString(),type:'Journal',pathIds:[p.id]});
 if(name==='missing-source')data.reviews.push({id:'missing-review',date:'2026-10-01T12:00:00.000Z',text:'Mein Rückblick bleibt auch ohne Original erhalten.',sourceKey:'journal:deleted',pathId:p.id,confirmedDevelopment:false});
 if(name==='multiple-links'){data.paths.push(makePath(1));data.journal[0].pathIds.push('p-1');data.reflections[0].pathIds.push('p-1');data.paths[1].links.push({...p.links[1],id:'link-other'});}
 if(name==='no-evidence'){data.journal=[];data.reflections=[];data.reviews=[];p.steps=[];p.links=[];}
 const count=name.startsWith('tree-')?[0,1,2,3,5,7,10][Number(name.slice(5))]:name==='development'?3:0;
 p.milestones=Array.from({length:count},(_,i)=>({id:'development-'+i,text:'Eine Entwicklung, die ich selbst bestätigt habe. '+(i+1),date:'2026-09-15T12:00:00.000Z'}));
 data.quiz={'10070':{done:OLD,legacy:'preserve'},1:{done:OLD,legacy:'story'}};data.events=[{id:'explored',kind:'chapter-explored',at:OLD,ref:{book:'JHN',chapter:3}}];
 return data;
}
