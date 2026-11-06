"""Deterministic, offline importer for eBible Luther 1912 USFM. No generated text."""
import hashlib, json, re, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'assets/deu1912-source.zip'
OUT = ROOT / 'src/data/bible.json'

def parse():
    books = {}
    with zipfile.ZipFile(ARCHIVE) as archive:
        for filename in sorted(archive.namelist()):
            if not filename.endswith('.usfm'):
                continue
            text = archive.read(filename).decode('utf-8-sig')
            code = re.search(r'\\id (\w+)', text)[1]
            chapters = {}
            segments = re.split(r'\\c\s+(\d+)\s*', text)
            for i in range(1, len(segments), 2):
                number, body = segments[i:i+2]
                verses = []
                parts = re.split(r'\\v\s+(\d+)\s+', body)
                for j in range(1, len(parts), 2):
                    n, value = parts[j:j+2]
                    # Retain original words; remove only Strong's markup and layout markers.
                    value = re.sub(r'\\w\s+([^|]*?)\|[^\\]*\\w\*', r'\1', value)
                    value = re.sub(r'\\(?:p|q1)\b', ' ', value)
                    value = re.sub(r'\s+', ' ', value).strip()
                    assert '\\' not in value and 'strong=' not in value, (code,number,n,value)
                    assert value, (code,number,n)
                    verses.append({'n': int(n), 'text': value})
                assert verses and len({v['n'] for v in verses}) == len(verses)
                chapters[number] = verses
            assert list(map(int, chapters)) == list(range(1, len(chapters)+1)), code
            books[code] = chapters
    assert len(books) == 66
    assert sum(len(c) for c in books.values()) == 1189
    assert sum(len(v) for c in books.values() for v in c.values()) == 31102
    return json.dumps(books, ensure_ascii=False, separators=(',', ':')) + '\n'

result = parse()
if '--check' in sys.argv:
    assert OUT.read_text() == result, 'Bible bundle differs from original USFM import'
else:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(result)
print(json.dumps({'books':66,'chapters':1189,'verses':31102,'source_sha256':hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),'bundle_sha256':hashlib.sha256(result.encode()).hexdigest()}))
