// References are preserved verbatim; this expands ranges only for technical validation.
export function parseQuizReferences(text, books, aliases = {}) {
  const names = {...aliases, ...Object.fromEntries(books.map(b => [b.name, b.code]))};
  const name = Object.keys(names).sort((a,b)=>b.length-a.length).find(name=>text?.startsWith(name+' '));
  if (!name) throw new Error('Unbekannte Referenz: '+text);
  const book = names[name], definition = books.find(b=>b.code===book);
  let part = text.slice(name.length+1), chapter;
  if (part.includes(',')) {
    const match = /^(\d+),(.+)$/.exec(part);
    if (!match) throw new Error('Ungültige Referenz: '+text);
    chapter = Number(match[1]); part = match[2];
  } else if (definition?.chapters===1) chapter = 1;
  else throw new Error('Kapitel fehlt in Referenz: '+text);
  return part.split(/[;.]/).map(segment=>{
    const match = /^(\d+)(?:[–-](\d+))?$/.exec(segment.trim());
    if (!match) throw new Error('Ungültige Referenz: '+text);
    const from = Number(match[1]), to = Number(match[2]||match[1]);
    if (chapter<1 || chapter>definition.chapters || from<1 || to<from) throw new Error('Ungültige Referenz: '+text);
    return {book,chapter,from,to};
  });
}
