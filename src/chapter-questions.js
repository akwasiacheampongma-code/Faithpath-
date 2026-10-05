import {normBook} from './domain.js';
import {TRANSLATIONS} from './content.js';

// Index the existing units by reference. Questions and stored progress stay canonical.
export function createChapterCatalog(units, books) {
  const byChapter = new Map(), byBook = new Map();
  for (const unit of units) {
    if (unit.kind !== 'chapter-quiz' || !unit.questions?.length) continue;
    const code = normBook(unit.book), book = books.find(book => book.code === code);
    const chapter = unit.chapter + 1, key = `${code}:${chapter}`;
    if (!book || !Number.isInteger(unit.chapter) || chapter < 1 || chapter > book.chapters || byChapter.has(key))
      throw new Error('Kapitel-Fragen sind keinem eindeutigen Kapitel zugeordnet.');
    byChapter.set(key, unit);
    if (!byBook.has(code)) byBook.set(code, []);
    byBook.get(code).push(unit);
  }
  for (const units of byBook.values()) units.sort((a, b) => a.chapter - b.chapter);
  return {byChapter, byBook};
}

export function chapterUnit(catalog, book, chapter) {
  return Number.isInteger(+chapter) ? catalog.byChapter.get(`${normBook(book)}:${+chapter}`) || null : null;
}

export function chapterQuizRoute(unit, returnRoute = '') {
  const params = new URLSearchParams();
  if (returnRoute) params.set('return', returnRoute);
  return `quiz/${unit.id}${params.size ? '?' + params : ''}`;
}

export function chapterQuizNavigation(unit, books, translation, returnRoute = '') {
  const code = normBook(unit.book), chapter = unit.chapter + 1;
  const collectionRoute = `chapter-quizzes/${code}`;
  let tr = TRANSLATIONS[translation] ? translation : 'otb';
  let backRoute = collectionRoute, readerOrigin = '';
  try {
    const [path, query = ''] = returnRoute.split('?');
    const parts = path.split('/').map(decodeURIComponent);
    if (parts.length === 4 && parts[0] === 'read' && normBook(parts[1]) === code && +parts[2] === chapter && TRANSLATIONS[parts[3]]) {
      const params = new URLSearchParams(query);
      const from = params.get('from'), to = params.get('to');
      if ((from === null || (Number.isInteger(+from) && +from > 0)) && (to === null || (Number.isInteger(+to) && +to > 0 && (from === null || +to >= +from)))) {
        tr = parts[3]; backRoute = returnRoute; readerOrigin = returnRoute;
      }
    } else if (path === collectionRoute || path === `story/${unit.id}`) backRoute = path;
  } catch { /* Invalid origins fall back to the matching collection. */ }
  const readerRoute = readerOrigin || `read/${code}/${chapter}/${tr}`;
  const book = books.find(book => book.code === code);
  return {backRoute, readerRoute, collectionRoute,
    nextReaderRoute: book && chapter < book.chapters ? `read/${code}/${chapter + 1}/${tr}` : null};
}
