import {normBook,time} from './domain.js';
const validChapter=(ref,books)=>{const book=books.find(b=>b.code===normBook(ref?.book)||b.name.toLocaleLowerCase('de')===String(ref?.book||'').toLocaleLowerCase('de'));return book&&Number.isInteger(+ref.chapter)&&+ref.chapter>=1&&+ref.chapter<=book.chapters ? {book:book.code,chapter:+ref.chapter} : null;};
export function exploredChapters(data,books){
 const chapters=new Map();
 for(const event of data.events||[]){if(event.kind!=='chapter-explored'||time(event.at)==null)continue;const ref=validChapter(event.ref,books);if(!ref)continue;const key=ref.book+':'+ref.chapter,old=chapters.get(key);if(!old||time(event.at)<time(old.at))chapters.set(key,{...ref,at:event.at});}
 return chapters;
}
export function journeySummary(data,books){
 const explored=exploredChapters(data,books),reading=validChapter(data.reading,books);
 const bookStates=books.map(book=>({...book,explored:[...explored.values()].filter(x=>x.book===book.code).sort((a,b)=>a.chapter-b.chapter),current:reading?.book===book.code ? reading.chapter : null}));
 return {chapters:explored.size,begunBooks:bookStates.filter(b=>b.explored.length).length,completedBooks:bookStates.filter(b=>b.explored.length===b.chapters).length,books:bookStates,reading};
}
export function recordExploredChapter(data,ref,books,at,eventId){
 const chapter=validChapter(ref,books);if(!chapter)return false;
 if(time(at)==null)throw new Error('Der Kapitelabschluss hat kein gültiges Datum.');
 if(exploredChapters(data,books).has(chapter.book+':'+chapter.chapter))return false;
 if(!eventId||(data.events||[]).some(e=>e.id===eventId))throw new Error('Der Kapitelabschluss ist nicht eindeutig.');
 data.events.unshift({id:eventId,kind:'chapter-explored',at,ref:chapter});return true;
}
// Reaching the unobscured chapter end is a viewport fact, not an inference of comprehension.
export function observeChapterEnd({sentinel,topbar,nav,onReached,isCurrent,isBlocked}){
 const doc=sentinel.ownerDocument,win=doc.defaultView;let stopped=false,frame=0;
 const check=()=>{frame=0;if(stopped||!isCurrent()||!sentinel.isConnected)return stop();if(doc.visibilityState!=='visible'||isBlocked())return;const r=sentinel.getBoundingClientRect(),top=topbar?.getBoundingClientRect().bottom||0,n=nav?.getBoundingClientRect(),bottom=n&&n.top>top&&n.bottom>=win.innerHeight-1&&n.width>win.innerWidth/2 ? Math.min(win.innerHeight,n.top) : win.innerHeight;if(r.top>=top&&r.bottom<=bottom&&r.height>0){onReached();stop();}};
 const schedule=()=>{if(!stopped&&!frame)frame=win.requestAnimationFrame(check);};
 const observer=new win.IntersectionObserver(schedule);observer.observe(sentinel);
 const resize=new win.ResizeObserver(schedule);resize.observe(doc.documentElement);if(nav)resize.observe(nav);
 const stop=()=>{stopped=true;if(frame)win.cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();win.removeEventListener('scroll',schedule);win.removeEventListener('resize',schedule);doc.removeEventListener('visibilitychange',schedule);doc.removeEventListener('click',schedule);};
 win.addEventListener('scroll',schedule,{passive:true});win.addEventListener('resize',schedule);doc.addEventListener('visibilitychange',schedule);doc.addEventListener('click',schedule);schedule();return stop;
}
