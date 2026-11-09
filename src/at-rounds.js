/**
 * TEST_ONLY question selection and progress rules. No DOM or browser storage.
 * Quiz result keys identify rounds, never new content IDs. The caller must use
 * an isolated test store; production catalog/data and schema V5 are unchanged.
 */
const CHAPTERS = new Map([['1KI',8], ['2KI',15]]);
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const require = (condition, message) => {if (!condition) throw new Error(message);};

export function createAtRoundCatalog(fixture) {
  require(fixture?.schema === 'faithpath-at-quiz-rounds-preview-1' &&
    fixture.approved === false && fixture.production === false, 'Testdaten besitzen keine gültige TEST_ONLY-Freigabe.');
  require(object(fixture.chapters) && Object.keys(fixture.chapters).length === 2,
    'Genau zwei Testkapitel werden erwartet.');
  const chapters = new Map(), allIds = new Set();
  for (const [book, data] of Object.entries(fixture.chapters)) {
    require(CHAPTERS.get(book) === data.chapter && text(data.name), 'Unzulässiges Testkapitel.');
    require(Array.isArray(data.variants) && data.variants.length === 2 &&
      data.variants[0].id === 'A' && data.variants[1].id === 'B', 'Testrunden A und B fehlen.');
    const rounds = new Map(), units = new Set();
    for (const variant of data.variants) {
      require(text(variant.label) && Array.isArray(variant.questions) && variant.questions.length === 5,
        'Eine Testrunde benötigt genau fünf Fragen.');
      const roundUnits = new Set();
      const questions = variant.questions.map(q => {
        const match = typeof q.id === 'string' && q.id.match(/^(\d+)-Q[1-9]\d*$/);
        require(match && !allIds.has(q.id), 'Doppelte oder ungültige Testfrage.');
        require(q.sourceUnit === match[1], 'Die Quelle der Testfrage passt nicht zur ID.');
        require(text(q.text) && text(q.explanation) && text(q.reference), 'Testfrage enthält unvollständige Texte.');
        require(Array.isArray(q.options) && q.options.length === 4 && q.options.every(text) &&
          new Set(q.options.map(a => a.trim().toLocaleLowerCase('de-DE'))).size === 4 &&
          Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4,
          'Ungültige Antwortmöglichkeiten oder richtige Antwort.');
        allIds.add(q.id); units.add(q.sourceUnit); roundUnits.add(q.sourceUnit);
        return Object.freeze({...q, options:Object.freeze([...q.options])});
      });
      require(roundUnits.size === 5, 'Eine Runde muss fünf verschiedene Quelleinheiten abdecken.');
      rounds.set(variant.id, Object.freeze({id:variant.id, label:variant.label, questions:Object.freeze(questions)}));
    }
    require(Array.isArray(data.requiredUnits) && data.requiredUnits.length === 6 &&
      new Set(data.requiredUnits).size === 6 && units.size === 6 && data.requiredUnits.every(u => units.has(u)),
      'Die sechs Quelleinheiten des Testkapitels sind nicht vollständig abgedeckt.');
    chapters.set(`${book}:${data.chapter}`, Object.freeze({book, chapter:data.chapter, name:data.name, rounds}));
  }
  return Object.freeze({chapters, get:(book,chapter) => chapters.get(`${book}:${chapter}`) || null});
}

/** Existing createStore interface: {state, transact(fn)}; only test storage. */
export function createAtRoundController(catalog, store, fixtureSha) {
  require(/^[a-f0-9]{64}$/.test(fixtureSha), 'Testdaten benötigen einen eindeutigen Prüfstand.');
  function descriptor(book, chapter, round) {
    const item = catalog.get(book,chapter), variant = item?.rounds.get(round);
    require(item && variant, 'Dieses Testkapitel oder diese Runde ist nicht verfügbar.');
    return {item, variant, key:`${book}:${chapter}:${round}`};
  }
  function read(book, chapter, round) {
    const d = descriptor(book,chapter,round), ids = d.variant.questions.map(q => q.id);
    const saved = store.state.quiz[d.key];
    if (saved === undefined) return {fixtureSha, questionIds:ids, answers:{}, index:0, done:null};
    require(object(saved), 'Der Testfortschritt ist beschädigt.');
    require(saved.fixtureSha === fixtureSha, 'Der gespeicherte Prüfstand passt nicht zu dieser Version der Testdaten.');
    require(Array.isArray(saved.questionIds) && saved.questionIds.length === 5 &&
      saved.questionIds.every((id,i) => id === ids[i]) && object(saved.answers) &&
      Object.entries(saved.answers).every(([id,a]) => ids.includes(id) && Number.isInteger(a) && a >= 0 && a < 4) &&
      Number.isInteger(saved.index) && saved.index >= 0 && saved.index < 5,
      'Der Testfortschritt ist beschädigt.');
    const amount = Object.keys(saved.answers).length;
    require(Object.keys(saved.answers).every(id=>ids.indexOf(id)<=saved.index) &&
      ids.slice(0,saved.index).every(id => Object.hasOwn(saved.answers,id)) &&
      amount >= saved.index && amount <= saved.index + 1 &&
      (saved.done === null || (typeof saved.done === 'string' && Number.isFinite(Date.parse(saved.done)) &&
        amount === 5 && saved.index === 4)), 'Der Testfortschritt ist beschädigt.');
    return structuredClone(saved);
  }
  const completed = (book,chapter,round) => Boolean(read(book,chapter,round).done);
  function session(book,chapter,round) {
    const {item,variant,key} = descriptor(book,chapter,round), state = read(book,chapter,round);
    const q = variant.questions[state.index], answer = state.answers[q.id] ?? null;
    return {book, chapter, name:item.name, round, key, label:variant.label, questions:variant.questions,
      index:state.index, answers:{...state.answers}, answer,
      correct:answer === null ? null : answer === q.correctIndex,
      done:state.done, blocked:round === 'B' && !completed(book,chapter,'A')};
  }
  function allowed(book,chapter,round) {
    const s = session(book,chapter,round);
    require(!s.blocked, 'Runde B ist bis zum Abschluss von Runde A gesperrt.');
    return s;
  }
  return Object.freeze({catalog, session, completed,
    answer(book,chapter,round,answer) {
      require(Number.isInteger(answer) && answer >= 0 && answer < 4, 'Diese Antwort ist nicht gültig.');
      const s = allowed(book,chapter,round);
      if (s.done || s.answer !== null) return false;
      const value = read(book,chapter,round);
      value.answers[s.questions[s.index].id] = answer;
      store.transact(state => {state.quiz[s.key] = value;});
      return true;
    },
    advance(book,chapter,round) {
      const s = allowed(book,chapter,round);
      if (s.done || s.answer === null) return false;
      const value = read(book,chapter,round);
      if (value.index === 4) value.done = new Date().toISOString();
      else value.index++;
      store.transact(state => {state.quiz[s.key] = value;});
      return true;
    },
    reset(book,chapter,round) {
      const {key} = descriptor(book,chapter,round);
      store.transact(state => {delete state.quiz[key];});
    },
  });
}
