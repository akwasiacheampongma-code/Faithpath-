export const SOURCE_FILES = ['index.json', 'stories.json', 'reference-index.json', 'faithpath-content-index.json', 'nachlese-stories.json', 'nachlese-questions.json', 'faithpath-nachlese-story-flow.json'];
let loaded;
const require = (ok, message) => { if (!ok) throw new Error(`Inhaltsdaten konnten nicht geprüft werden: ${message}`); };
const text = v => typeof v === 'string' && v.trim().length > 0;
export function createRuntimeModel(data) {
  const [books, units, refs, index, ns, nq, flow] = data;
  require(Array.isArray(books) && books.length === 66 && Array.isArray(units), 'Bücher/Einheiten');
  for (const b of books) require(text(b.code) && text(b.name) && Number.isInteger(b.chapters) && b.chapters > 0, 'Buchschema');
  require(index.schema_version === 1 && ns.schema_version === 1 && nq.schema_version === 1 && flow.schema_version === 1, 'Schemaversion');
  require(index.qa_status === 'FINAL_APPROVED' && index.review_required_FP_ids.length === 0 && flow.unmapped_faithpath_ids.length === 0, 'Prüfstatus');
  const fp = new Map(), legacy = new Map(), n = new Map(), stories = new Map();
  let chapterCount = 0;
  for (const unit of units) {
    require(Number.isInteger(unit.id) && !legacy.has(String(unit.id)) && text(unit.title) && text(unit.reflection) && Array.isArray(unit.questions), 'Legacy-Einheit');
    require(unit.kind == null || unit.kind === 'chapter-quiz', 'Einheitenart');
    legacy.set(String(unit.id), unit);
    for (const q of unit.questions) {
      require(text(q.faithpath_id) && !fp.has(q.faithpath_id) && text(q.q) && text(q.x) && text(q.ref), 'FP-Pflichtfelder');
      require(Array.isArray(q.a) && q.a.length === 4 && q.a.every(text) && new Set(q.a).size === 4 && Number.isInteger(q.c) && q.c >= 0 && q.c < 4, 'MC-Antwortschema');
      fp.set(q.faithpath_id, {question:q, unit});
      if (unit.kind === 'chapter-quiz') chapterCount++;
    }
  }
  require(fp.size === 1560 && chapterCount === 1300, 'FP-/Kapitelbestand');
  for (let i=1;i<=1560;i++) require(fp.has(`FP-${String(i).padStart(4,'0')}`), 'FP-ID fehlt');
  require(nq.count === 2314 && nq.questions.length === 2314 && ns.count === 435 && ns.stories.length === 435, 'Nachlesebestand');
  const canonical = new Map(ns.stories.map(s => [s.id,s]));
  for (const q of nq.questions) {
    require(text(q.id) && !n.has(q.id) && text(q.q) && text(q.answer) && text(q.ref) && q.source_namespace === 'Nachlese' && canonical.has(q.source_story_id), 'N-Pflichtfelder');
    require(Array.isArray(q.references) && q.references.length > 0 && q.provenance?.docx_original?.id === q.id && q.provenance.final_qa_status === 'VERIFIZIERT', 'N-Provenienz');
    n.set(q.id,q);
  }
  for(let i=1;i<=2314;i++) require(n.has(`N-${String(i).padStart(4,'0')}`), 'N-ID fehlt');
  require(flow.story_count === 436 && flow.stories.length === 436 && flow.status === 'VERIFIED_STORY_MERGE_WITH_DOCUMENTED_EXCEPTIONS', 'Storybestand');
  const seen = new Set();
  for (const s of flow.stories) {
    require(text(s.story_id) && !stories.has(s.story_id) && text(s.title) && text(s.reflection) && text(s.ref) && Array.isArray(s.references) && s.references.length > 0 && Array.isArray(s.flow_items), 'Storyschema');
    require(['FaithPath','Nachlese'].includes(s.source_namespace), 'Storyquelle');
    stories.set(s.story_id,s);
    for (const item of s.flow_items) {
      require(['NONE','EXACT_FINAL_WORDING','NONE_FAITHPATH_ONLY','NONE_SOURCE_VARIANT_RETAINED'].includes(item.deduplication) && item.source_question_ids.includes(item.primary_question_id), 'Flow-Schema');
      for (const id of item.source_question_ids) {
        require(!seen.has(id) && (fp.has(id) || n.has(id)), 'Flow-ID');
        if(fp.has(id)) require(fp.get(id).unit.kind !== 'chapter-quiz', 'Kapitelquiz im Storyfluss');
        if(n.has(id)) require(n.get(id).source_story_id === s.story_id, 'N-Storylink');
        seen.add(id);
      }
    }
  }
  require([...n.keys()].every(id => seen.has(id)) && [...fp.keys()].filter(id => fp.get(id).unit.kind !== 'chapter-quiz').every(id => seen.has(id)), 'Story-ID verloren');
  require(flow.mapping_links.length === 260, 'Mappinganzahl');
  for (const l of flow.mapping_links) {
    require(fp.has(l.FP_ID) && stories.has(l.Story_ID) && ['EXAKT','SINNGLEICH','KONFLIKT','FAITHPATH_ONLY'].includes(l.Match_Status) && ['HIGH','MEDIUM','N/A'].includes(l.Confidence_before) && l.verification_status === 'VERIFIED_FOR_WRITE', 'Mapping-Schema');
    require(l.N_ID == null ? l.Match_Status === 'FAITHPATH_ONLY' : n.get(l.N_ID)?.source_story_id === l.Story_ID, 'N-Match');
  }
  for (const id of ['FP-0120','FP-0151','FP-0239']) require(flow.mapping_links.find(l=>l.FP_ID===id)?.N_ID === null, 'Unbelegtes Sonderfall-Match');
  require(flow.mapping_links.find(l=>l.FP_ID==='FP-0147')?.N_ID === 'N-1536', 'Hirten-Match');
  require(index.question_index.length === 1560 && index.content_models.chapter_quiz_question_ids.length === 1300, 'Indexschema');
  for (const row of index.question_index) require(fp.has(row.faithpath_id) && ['story','chapter-quiz'].includes(row.content_type) && row.final_qa_status === 'APPROVED', 'Index-Enum');
  require(refs.otb && refs.l1912, 'Übersetzungsindex');
  return {books, units, refs, index, ns, nq, flow, fp, n, stories, legacy, chapterCount};
}
export async function loadRuntimeModel(base) {
  const data = await Promise.all(SOURCE_FILES.map(async file => {
    const response = await fetch(new URL(file,base));
    if (!response.ok) throw new Error(`Eine benötigte Datei fehlt: ${file}. Bitte lade die Seite online neu.`);
    return response.json();
  }));
  loaded = createRuntimeModel(data);
  return loaded;
}
export const getRuntimeModel = () => loaded;
