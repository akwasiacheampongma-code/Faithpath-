#!/usr/bin/env python3
"""Deterministic, offline projection of the frozen original story flow."""
import argparse, gzip, hashlib, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/faithpath-stories'
def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def fingerprint(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()
def run(check=False):
    provenance = json.loads((SOURCE/'provenance.json').read_text())
    originals = {}
    for item in provenance['files']:
        raw = gzip.decompress((SOURCE/item['archive']).read_bytes())
        assert len(raw) == item['bytes'] and hashlib.sha256(raw).hexdigest() == item['sha256']
        originals[Path(item['path']).name] = json.loads(raw)
    flow = originals['faithpath-nachlese-story-flow.json']['stories']
    n = {q['id']: q for q in originals['nachlese-questions.json']['questions']}
    fp = {q['faithpath_id']: q for s in originals['stories.json'] for q in s.get('questions', []) if q.get('faithpath_id')}
    bank = {**n, **fp}
    books = json.loads((ROOT/'src/data/catalog.json').read_text())
    bible = json.loads((ROOT/'src/data/bible.json').read_text())
    rank = {b['code']: i for i, b in enumerate(books)}
    def valid(ref):
        verses = bible[ref['book']][str(ref['chapter'])]
        ns = [v['n'] for v in verses]
        assert 0 < ref['from'] <= ref['to'] and all(v in ns for v in range(ref['from'], ref['to']+1))
    def fp_refs(text):
        # Exact observed FP forms, not fuzzy interpretation of arbitrary prose.
        m = re.fullmatch(r'(Apg|Johannes|Matthäus) (\d+),(\d+)(?:[–-](\d+))?', text)
        assert m, 'Unresolved original FP reference: '+text
        ref = {'book': {'Apg':'ACT','Johannes':'JHN','Matthäus':'MAT'}[m[1]],
               'chapter': int(m[2]), 'from':int(m[3]), 'to':int(m[4] or m[3])}
        valid(ref)
        return [ref]
    images = {'NS-0006':'noah','NS-0010':'abraham','NS-0052':'david-before-goliath',
              'NS-0203':'storm','NS-0235':'easter-dawn','NS-0241':'nativity'}
    units, questions, aliases = [], {}, {}
    letter_books = {'ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD'}
    for order, story in enumerate(flow):
        sid = story['story_id']; refs = story['references']
        for ref in refs: valid(ref)
        identities = []
        for item in story['flow_items']:
            qid = item['primary_question_id']; q = bank[qid]
            assert len(q['a']) == len(set(q['a'])) == 4 and 0 <= q['c'] < 4
            qrefs = q['references'] if qid.startswith('N-') else fp_refs(q['ref'])
            for ref in qrefs: valid(ref)
            value = {'id':qid,'unitId':sid,'prompt':q['q'],'options':q['a'],
                     'correctIndex':q['c'],'referenceLabel':q['ref'],'references':qrefs,
                     'explanation':q.get('x') or None,'sourceQuestionIds':item['source_question_ids']}
            value['hash'] = fingerprint(value)
            assert qid not in questions
            questions[qid] = value
            identities.append({'id':qid,'hash':value['hash']})
            for aid in item['source_question_ids']:
                if aid != qid:
                    # Retain every original alternative, never remap choice indices.
                    a = bank[aid]
                    aliases[aid] = {'id':aid,'primaryId':qid,'prompt':a['q'],'options':a['a'],
                                    'correctIndex':a['c'],'referenceLabel':a['ref'],'explanation':a.get('x') or None,
                                    'originalMapping':item}
        code = refs[0]['book']
        value = {'id':sid,'title':story['title'],'referenceLabel':story['ref'],'references':refs,
                 'reflection':story['reflection'],'sourceOrder':order,'sourceNamespace':story['source_namespace'],
                 'testament':books[rank[code]]['testament'],
                 'kind':'Psalm' if code=='PSA' else 'Briefabschnitt' if code in letter_books else 'Bibelabschnitt',
                 'image':images.get(sid),'questions':identities,'questionSetHash':fingerprint(identities)}
        value['hash'] = fingerprint(value)
        units.append(value)
    assert len(units)==436 and len(questions)==2479 and len(aliases)==95
    assert sum(len(u['references']) for u in units)==437
    assert sum(q['explanation'] is not None for q in questions.values())==174
    assert len({ref['book'] for u in units for ref in u['references']})==66
    units.sort(key=lambda u:(rank[u['references'][0]['book']],u['references'][0]['chapter'],u['references'][0]['from'],u['sourceOrder']))
    index = {'sourceCommit':provenance['snapshot'],'units':units}
    payload = {'questions':questions,'sourceVariants':aliases}
    report = {'sourceCommit':provenance['snapshot'],'units':436,'questions':2479,'reflections':436,
              'preservedSourceIds':len(questions)+len(aliases),'aliasPairs':95,'originalExplanations':174,
              'structuredStoryRanges':437,'fpQuestionReferencesResolvedAndCorpusChecked':165,
              'newQuestionsOrImagesGenerated':False,'classification':'kind and image are OLIVA editorial presentation metadata; original text/order/source IDs retained'}
    outputs = {'src/data/story-index.json':index,'src/data/story-questions.json':payload,
               'content/faithpath-stories/import-report.json':report}
    for name, value in outputs.items():
        raw = (json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n').encode()
        p = ROOT/name
        if check: assert p.read_bytes()==raw, 'Generated catalog differs: '+name
        else: p.write_bytes(raw)
    print(json.dumps({**report,'byteCheck':check}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');run(p.parse_args().check)
