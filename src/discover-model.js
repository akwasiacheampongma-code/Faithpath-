import {normBook} from './domain.js';
export const DISCOVERY_PAGE_SIZE = 20;
/** Search only existing public content fields, never personal notes or inferred interests. */
const normalize = value => String(value??'').normalize('NFC').toLocaleLowerCase('de-DE').trim().replace(/\s+/g,' ');
export function createDiscoveryIndex(items) {
 return items.map(item=>{
  const chapter=item.kind==='chapter-quiz',id=encodeURIComponent(item.story_id??item.id);
  return Object.freeze({key:(chapter?'chapter:':'story:')+id,kind:chapter?'kapitel':'geschichte',book:normBook(item.references?.[0]?.book||item.book),
   title:item.title,reference:item.ref,questions:item.flow_items?.length??item.questions.length,
   route:(chapter?'story/':'merged-story/')+id,quizRoute:(chapter?'quiz/':'merged-story/')+id,
   searchText:normalize([item.title,item.desc,item.ref,item.reflection].join(' '))});
 });
}
export function selectDiscovery(index,{query='',book='',kind='alle',limit=DISCOVERY_PAGE_SIZE}={}) {
 const needle=normalize(query),matches=index.filter(item=>(!book||item.book===book)&&(kind==='alle'||item.kind===kind)&&item.searchText.includes(needle));
 const safeLimit=Number.isInteger(limit)&&limit>=DISCOVERY_PAGE_SIZE?limit:DISCOVERY_PAGE_SIZE;
 return {total:matches.length,visible:matches.slice(0,safeLimit),hasMore:matches.length>safeLimit,limit:safeLimit,kind,filtered:!!(needle||book||kind!=='alle')};
}
