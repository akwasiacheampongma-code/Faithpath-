import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'content/at-source-recovery');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
const bible = new Map();
const failures = [];
const summary = {checked: 0, translated_verse_lookups: 0, mapped_references: 0, books: 39, check: 'first referenced verse in BOTH offline Bible translations; source refs left unchanged'};

function mappedVerse(book, originalReference) {
  const m = originalReference.match(/(?:^|[^\d])(\d{1,3})\s*,\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/);
  if (!m) throw new Error('Not parseable: ' + originalReference);
  let chapter = Number(m[1]), verse = Number(m[2]), endVerse = m[3] ? Number(m[3]) : null, mapped = false;
  if (book === 'JOL' && chapter === 3 && verse >= 1 && verse <= 5) {
    chapter = 2; verse += 27; if (endVerse !== null) endVerse += 27; mapped = true;
  } else if (book === 'JOL' && chapter === 4) {
    chapter = 3; mapped = true;
  } else if (book === 'MAL' && chapter === 3 && verse >= 19 && verse <= 24) {
    chapter = 4; verse -= 18; if (endVerse !== null) endVerse -= 18; mapped = true;
  }
  return {chapter, verse, endVerse, mapped};
}

for (const book of manifest.books) {
  for (const tr of ['l1912', 'otb']) {
    const filename = path.join(root, 'data/bibles', tr, book.code + '.json');
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    bible.set(book.code + ':' + tr, data.chapters);
  }
  const data = JSON.parse(fs.readFileSync(path.join(root, book.path), 'utf8'));
  for (const unit of data.units) {
    for (const question of unit.questions) {
      summary.checked++;
      try {
        const pos = mappedVerse(book.code, question.verse_reference);
        if (pos.mapped) summary.mapped_references++;
        for (const tr of ['l1912', 'otb']) {
          const chapters = bible.get(book.code + ':' + tr);
          const verses = chapters[pos.chapter - 1];
          if (!Array.isArray(verses)) throw Error('missing chapter ' + pos.chapter);
          if (!verses.some(row => row[0] === pos.verse && typeof row[1] === 'string' && row[1].length > 0))
            throw Error('missing first verse ' + pos.chapter + ',' + pos.verse);
          summary.translated_verse_lookups++;
          if (pos.endVerse !== null && pos.endVerse >= pos.verse) {
            if (!verses.some(row => row[0] === pos.endVerse && typeof row[1] === 'string' && row[1].length > 0))
              throw Error('missing last verse ' + pos.chapter + ',' + pos.endVerse);
          }
        }
      } catch (error) {
        failures.push({id: question.id, source_reference: question.verse_reference, book: book.code, error: error.message});
      }
    }
  }
}
summary.failures = failures;
summary.status = failures.length ? 'FAIL_REVIEW_REQUIRED' : 'PASS_VERSE_EXISTENCE__NOT_THEOLOGICAL_APPROVAL';
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
