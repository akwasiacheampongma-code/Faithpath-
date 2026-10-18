const failure='Der Bibeltext konnte nicht geladen werden. Sobald du wieder online bist, versuche es erneut.';
/** A per-app cache of original book responses, not a source of reference authority.
 * Callers supply canonical book/translation IDs already checked by validRef.
 * Concurrent requests share a promise. Every failed/malformed result is evicted.
 * @param {{fetch?:typeof globalThis.fetch}} options
 */
export function createBibleLoader({fetch:fetchBook=globalThis.fetch}={}) {
 const cache=new Map();
 return function getBook(code,translation) {
  const key=translation+':'+code;
  if(!cache.has(key)) {
   const pending=Promise.resolve().then(()=>fetchBook(`data/bibles/${translation}/${code}.json`)).then(async response=>{
    if(!response.ok)throw new Error(failure);
    const book=await response.json();
    const validChapter=chapter=>Array.isArray(chapter)&&chapter.length>0&&chapter.every((verse,index)=>
     Array.isArray(verse)&&verse.length===2&&Number.isInteger(verse[0])&&verse[0]>0&&typeof verse[1]==='string'&&verse[1].trim().length>0&&
     (index===0||verse[0]>chapter[index-1][0]));
    if(!book||typeof book.name!=='string'||!Array.isArray(book.chapters)||!book.chapters.length||!book.chapters.every(validChapter))throw new Error(failure);
    return book;
   }).catch(error=>{cache.delete(key);throw error;});
   cache.set(key,pending);
  }
  return cache.get(key);
 };
}
