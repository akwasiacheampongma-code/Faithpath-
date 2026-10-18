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
    if(!book||!Array.isArray(book.chapters)||!book.chapters.length||!book.chapters.every(Array.isArray))throw new Error(failure);
    return book;
   }).catch(error=>{cache.delete(key);throw error;});
   cache.set(key,pending);
  }
  return cache.get(key);
 };
}
