import {createStore} from './store.js';
import {createAtRoundCatalog,createAtRoundController} from './at-rounds.js';

// Session-only fixture results deliberately never enter a personal backup.
export const AT_TEST_STORAGE_PREFIX='faithpath.at.rounds.app-test.v1:';

/** Uses the existing V5 transaction boundary with an isolated storage adapter. */
export async function loadAtRoundFeature(base, storage, fixtureSha, fetcher=fetch) {
  const response=await fetcher(new URL('at-rounds.test-only.json',base));
  if(!response.ok) throw new Error('Die AT-Testdaten konnten nicht geladen werden.');
  const raw=await response.arrayBuffer();
  const digest=await crypto.subtle.digest('SHA-256',raw);
  const actual=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  if(actual!==fixtureSha) throw new Error('Die Prüfsumme der AT-Testdaten stimmt nicht.');
  const catalog=createAtRoundCatalog(JSON.parse(new TextDecoder().decode(raw)));
  const store=createStore({
    getItem:key=>storage.getItem(AT_TEST_STORAGE_PREFIX+key),
    setItem:(key,value)=>storage.setItem(AT_TEST_STORAGE_PREFIX+key,value),
  });
  if(store.error) throw new Error('Der Testspeicher ist nicht verfügbar oder beschädigt. Persönliche Daten bleiben unverändert.');
  return {catalog,controller:createAtRoundController(catalog,store,fixtureSha)};
}

export function atRoundRoute(book,chapter,round='A',returnRoute='') {
  const query=new URLSearchParams({round});
  if(returnRoute)query.set('return',returnRoute);
  return `chapter-quizzes/${book}/${chapter}?${query}`;
}

/** Transient renderer adapter: source question IDs stay intact, no unit ID. */
export function atRoundView(session) {
  return {atRound:session,index:session.index,answer:session.answer,
    story:{kind:'chapter-quiz',book:session.book,chapter:session.chapter-1,
      ref:`${session.name} ${session.chapter}`,questions:session.questions.map(q=>({
        faithpath_id:q.id,q:q.text,a:q.options,c:q.correctIndex,x:q.explanation,ref:q.reference,
      }))}};
}
