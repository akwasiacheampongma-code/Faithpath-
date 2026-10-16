// Read-only projection over the existing journal; mirrored reflections remain one entry.
import {time} from './domain.js';
import {journalMatches} from './journal-search.js';
export function selectJournal(data,{query='',filter='Alle',limit=40,books=[]}={}){
 const entries=data.journal,paths=data.paths;
 const categories=[...new Set(entries.map(x=>x.subtype||x.type).filter(x=>x&&x!=='Journal'))];
 const filters=['Alle',...categories,...(entries.some(x=>x.type==='Journal')&&!categories.includes('Gedanken')?['Gedanken']:[]),...(entries.some(x=>x.pathIds?.some(id=>paths.some(p=>p.id===id)))?['Mit Weg']:[]),...(entries.some(x=>x.ref)?['Mit Bibelstelle']:[])];
 const matches=entries.filter(x=>(filter==='Alle'||[x.type,x.subtype].includes(filter)||(filter==='Gedanken'&&x.type==='Journal')||(filter==='Mit Weg'&&x.pathIds?.some(id=>paths.some(p=>p.id===id)))||(filter==='Mit Bibelstelle'&&x.ref))&&journalMatches(x,query,books,paths)).slice().sort((a,b)=>(time(b.date)??-Infinity)-(time(a.date)??-Infinity));
 const count=Number.isSafeInteger(limit)&&limit>=40?limit:40;
 return {total:matches.length,totalEntries:entries.length,filters,query,filter,limit:count,hasMore:matches.length>count,items:matches.slice(0,count).map(entry=>({entry,date:time(entry.date),paths:(entry.pathIds||[]).map(id=>paths.find(p=>p.id===id)).filter(Boolean)}))};
}
