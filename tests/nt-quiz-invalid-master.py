"""Fault injection: validator rejects invalid data and writes nothing on failure."""
import copy,hashlib,importlib.util,json,subprocess,tempfile,sys,shutil
sys.dont_write_bytecode=True
from pathlib import Path
from openpyxl import Workbook
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('ntimport',ROOT/'scripts/import-nt-quiz.py');api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)
source=ROOT/'reports/nt-quiz-final'/api.NAME
books=json.loads((ROOT/'data/index.json').read_bytes());rows=api.parse_sheet(source,books)
mutations=[('flags',lambda r:r[0].update(import_ready='NEIN')),('QA',lambda r:r[0].update(qa_status='OFFEN')),('approval',lambda r:r[0].update(approval='OFFEN')),('duplicate IDs',lambda r:r[0].update(FP_ID=r[1]['FP_ID'])),('wrong answer',lambda r:r[0].update(correct_answer='falsch')),('wrong index',lambda r:r[0].update(correct_index=4)),('missing option',lambda r:r[0].update(option_1='')),('duplicate options',lambda r:r[0].update(option_1=r[0]['option_0'])),('empty question',lambda r:r[0].update(question='')),('empty reference',lambda r:r[0].update(reference='')),('empty explanation',lambda r:r[0].update(explanation='')),('duplicate order',lambda r:r[0].update(question_order=2)),('missing chapter',lambda r:r[0].update(chapter=28)),('foreign book',lambda r:r[0].update(book_key='GEN')),('missing row',lambda r:r.pop()),('duplicate question',lambda r:r[0].update(question=r[1]['question']))]
for name,mutate in mutations:
    broken=copy.deepcopy(rows);mutate(broken)
    try:api.validate_rows(broken,books)
    except ValueError:pass
    else:raise AssertionError('accepted malformed master: '+name)
reference_mutations=[('wrong book',lambda r:r[0].update(reference='Markus 1,1')),('wrong chapter',lambda r:r[0].update(reference='Matthäus 2,1')),('missing verse',lambda r:r[0].update(reference='Matthäus 1,999')),('malformed reference',lambda r:r[0].update(reference='not a reference'))]
for name,mutate in reference_mutations:
    broken=copy.deepcopy(rows);mutate(broken)
    try:api.validate_references(broken,ROOT,books)
    except ValueError:pass
    else:raise AssertionError('accepted malformed reference: '+name)
with tempfile.TemporaryDirectory() as name:
    root=Path(name);(root/'data').mkdir();(root/'data/index.json').write_bytes((ROOT/'data/index.json').read_bytes());target=root/'data/stories.json';target.write_bytes((ROOT/'reports/nt-quiz-final/pre-import-stories.json').read_bytes());before=target.read_bytes()
    shutil.copytree(ROOT/'data/bibles',root/'data/bibles')
    for label,mutate in [mutations[0],mutations[4],mutations[-2], ('uncached formula',lambda r:r[0].update(question='=FRAGEN_MASTER!F2')), *reference_mutations]:
        broken=copy.deepcopy(rows);mutate(broken);w=Workbook();s=w.active;s.title='FAITHPATH_IMPORT';s.append(api.HEADERS)
        for row in broken:s.append([row[k] for k in api.HEADERS])
        workbook=root/'bad.xlsx';w.save(workbook)
        result=subprocess.run(['python3',str(ROOT/'scripts/import-nt-quiz.py'),'--root',str(root),'--workbook',str(workbook)],capture_output=True,text=True)
        assert result.returncode!=0 and 'IMPORT STOPP' in result.stderr,label
        assert target.read_bytes()==before and not (root/'reports').exists(),'invalid master wrote files'
with tempfile.TemporaryDirectory() as name:
    root=Path(name);(root/'data').mkdir();directory=root/'reports/nt-quiz-final';directory.mkdir(parents=True)
    shutil.copytree(ROOT/'data/bibles',root/'data/bibles')
    for filename in ['index.json','nt-quiz-status.json']:(root/'data'/filename).write_bytes((ROOT/'data'/filename).read_bytes())
    for filename in ['pre-import-stories.json','pre-import-nt-quiz-status.json']:(directory/filename).write_bytes((ROOT/'reports/nt-quiz-final'/filename).read_bytes())
    changed=json.loads((ROOT/'data/stories.json').read_bytes());changed[0]['questions'][0]['q']='Protected unrelated story edit'
    target=root/'data/stories.json';target.write_text(json.dumps(changed));before=target.read_bytes()
    attempt=subprocess.run(['python3',str(ROOT/'scripts/import-nt-quiz.py'),'--root',str(root),'--workbook',str(source)],capture_output=True,text=True)
    assert attempt.returncode!=0 and 'fremder Änderungen' in attempt.stderr,attempt.stdout+attempt.stderr
    assert target.read_bytes()==before,'reimport silently overwrote other content'
result=subprocess.run(['python3',str(ROOT/'scripts/import-nt-quiz.py'),'--check'],capture_output=True,text=True)
assert result.returncode==0,result.stdout+result.stderr
print('PASS 16 malformed data cases; 4 invalid reference cases; 8 failing file imports (including missing formula cache) write nothing; unrelated subsequent edits protected; approved import reproducible')
