// Import boundary only. Existing local V5 data is never rewritten by these checks.
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = field => {throw new Error(`Beschädigte Backup-Daten: ${field}. Der aktuelle Stand bleibt erhalten.`);};
const identifier = value => (typeof value === 'string' && !!value.trim()) ||
  (typeof value === 'number' && Number.isFinite(value));
function ids(records,field){
  const seen=new Set();
  for(const item of records||[]){
    if(item.id==null)continue; // Legacy IDs are assigned by the existing migration.
    if(!identifier(item.id)||seen.has(String(item.id)))fail(field+' / ID');
    seen.add(String(item.id));
  }
}
function ref(value,field){
  if(value==null)return;
  if(!object(value)||typeof value.book!=='string'||!value.book.trim()||
    !Number.isInteger(+value.chapter)||+value.chapter<1)fail(field+' / Bibelstelle');
  for(const key of ['from','to'])if(value[key]!=null&&(!Number.isInteger(+value[key])||+value[key]<1))fail(field+' / Versbereich');
  if(value.translation!=null&&!['otb','l1912'].includes(value.translation))fail(field+' / Übersetzung');
}
export function validateImportedFields(raw){
  if(raw.translation!==undefined&&!['otb','l1912'].includes(raw.translation))fail('Standardübersetzung');
  ids(raw.paths,'Wege');
  for(const key of ['journal','reflections','highlights','reviews','events']){
    ids(raw[key],key);
    for(const item of raw[key]||[]){
      if(key==='reviews'&&typeof item.text!=='string')fail(key+' / Text');
      if(item.pathIds!=null&&(!Array.isArray(item.pathIds)||item.pathIds.some(id=>typeof id!=='string'||!id)))fail(key+' / Wegzuordnung');
      for(const field of ['reflectionId','journalId','entryId','pathId'])if(item[field]!=null&&!identifier(item[field]))fail(key+' / '+field);
      ref(item.ref,key);
    }
  }
  for(const h of raw.highlights||[])ref(h,'Markierung');
  ref(raw.reading,'Lesestand');
  for(const p of raw.paths||[]){
    for(const key of ['steps','milestones','reviews','links']){
      ids(p[key],`Weg ${p.title} / ${key}`);
      for(const item of p[key]||[])ref(item.ref,`Weg ${p.title} / ${key}`);
    }
  }
  for(const progress of Object.values(raw.quiz||{})){
    if(!object(progress)||(progress.done!=null&&typeof progress.done!=='string'))fail('Quizstatus');
  }
}
export function validateImportedRelations(data){
  const paths=new Set(data.paths.map(p=>p.id)),journal=new Set(data.journal.map(j=>j.id)),reflections=new Set(data.reflections.map(r=>r.id));
  for(const item of [...data.journal,...data.reflections,...data.highlights])
    for(const pid of item.pathIds||[])if(!paths.has(pid))fail('Verbindung zu einem fehlenden Weg');
  for(const j of data.journal)if(j.reflectionId&&!reflections.has(j.reflectionId))fail('Verbindung zu einer fehlenden Reflexion');
  for(const p of data.paths)for(const link of p.links||[]){
    for(const field of ['journalId','entryId'])if(link[field]&&!journal.has(link[field]))fail('Wegverbindung zu einem fehlenden Journaleintrag');
    if(link.reflectionId&&!reflections.has(link.reflectionId))fail('Wegverbindung zu einer fehlenden Reflexion');
  }
  // sourceKey/highlightId are historical provenance, not live foreign keys.
  // Deleting a path or highlight intentionally retains that personal history.
}
