"""Read-only comparison of the preview sample against the actual original Git blobs."""
from pathlib import Path
import argparse, hashlib, json, os, subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--faithpath-git', default='/workspace/faithpath-reference')
args = parser.parse_args()
source = Path(__file__).resolve().parent
app = source.parent.parent
sample = json.loads((source / 'sample-data.json').read_text())
provenance = json.loads((source / 'provenance.json').read_text())
env = {k: v for k, v in os.environ.items()
       if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE', 'GH_DEBUG']}

def read(name):
    raw = subprocess.check_output(['git', 'show', sample['sourceCommit'] + ':' + name],
                                  cwd=args.faithpath_git, env=env)
    expected = provenance['sources'][name]
    assert len(raw) == expected['bytes']
    assert hashlib.sha256(raw).hexdigest() == expected['sha256']
    return json.loads(raw)

flow = {s['story_id']: s for s in read('data/faithpath-nachlese-story-flow.json')['stories']}
questions = {q['id']: q for q in read('data/nachlese-questions.json')['questions']}
bible_raw = (app / 'src/data/bible.json').read_bytes()
assert hashlib.sha256(bible_raw).hexdigest() == provenance['sourceBibleSha256']
bible = json.loads(bible_raw)

def verses(ref):
    return [v for v in bible[ref['book']][str(ref['chapter'])]
            if ref.get('from', 1) <= v['n'] <= ref.get('to', 999)]

count = 0
for story in sample['stories']:
    original = flow[story['id']]
    for target, key in [('title', 'title'), ('referenceLabel', 'ref'),
                        ('references', 'references'), ('reflection', 'reflection')]:
        assert story[target] == original[key], (story['id'], target)
    assert story['verses'] == verses(original['references'][0])
    assert [q['id'] for q in story['questions']] == [i['primary_question_id'] for i in original['flow_items']]
    for q, item in zip(story['questions'], original['flow_items']):
        expected = questions[q['id']]
        for target, key in [('prompt', 'q'), ('options', 'a'), ('correctIndex', 'c'),
                            ('originalAnswer', 'answer'), ('referenceLabel', 'ref'), ('references', 'references')]:
            assert q[target] == expected[key], (q['id'], target)
        assert q['sourceQuestionIds'] == item['source_question_ids']
        assert q['evidence'] == [{'ref': ref, 'verses': verses(ref)} for ref in expected['references']]
        assert q['explanation'] == (expected.get('explanation') or None)
        count += 1
assert len(sample['stories']) == 7 and count == 36
print(json.dumps({'passed': True, 'originalGitCommit': sample['sourceCommit'],
                  'unitsCompared': 7, 'questionsCompared': count, 'reflectionsCompared': 7,
                  'allQuestionOptionOrdersAndCorrectIndicesExact': True,
                  'canonicalBibleEvidenceExact': True, 'originalGitFilesChanged': False}))
