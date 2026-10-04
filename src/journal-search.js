// Derive search terms from existing records. No storage writes or inferred links.
import {BOOK_ALIASES} from './content.js';
import {normBook} from './domain.js';
const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/[–—−]/g,'-').replace(/\s+/g,' ').replace(/\s*([,:-])\s*/g,'$1').trim();
export function referenceSearchTexts(ref,books=[]){
 if(!ref)return [];
 const code=normBook(ref.book),book=books.find(b=>b.code===code);
 const names=[ref.book,code,book?.name,...Object.entries(BOOK_ALIASES).filter(([,v])=>v===code).map(([k])=>k)].filter(Boolean);
 const chapter=+ref.chapter,from=+ref.from,to=+ref.to;
 const suffix=Number.isInteger(chapter)&&chapter>0?String(chapter)+(Number.isInteger(from)&&from>0?','+from+(Number.isInteger(to)&&to>from&&to!==999?'-'+to:''):''):'';
 return [ref.label,...(suffix?names.map(name=>`${name} ${suffix}`):[])].filter(Boolean).map(normalize);
}
export function journalMatches(entry,query,books=[],paths=[]){
 const q=normalize(query);if(!q)return true;
 const plain=[entry.text,...(entry.pathIds||[]).map(id=>paths.find(p=>p.id===id)?.title)].filter(Boolean).map(normalize);
 if(plain.some(text=>text.includes(q)))return true;
 return referenceSearchTexts(entry.ref,books).some(text=>{
  let start=text.indexOf(q);
  while(start!==-1){const next=text[start+q.length];if(!/\d$/.test(q)||!next||!/\d/.test(next))return true;start=text.indexOf(q,start+1);}
  return false;
 });
}
