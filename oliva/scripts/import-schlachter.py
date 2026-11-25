"""Import the eBible.org Schlachter 1951 USFM edition without rewriting any verse."""
import hashlib
import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content/schlachter-1951/deu1951-usfm.zip"
OUTPUT = ROOT / "src/data/schlachter-1951.json"
SOURCE_SHA256 = "c61ecc937a33fb8d9946ba49169bcb6648d4774a4b8a639ba1daac86c7614076"


def read_corpus():
    books = {}
    with ZipFile(SOURCE) as archive:
        for filename in sorted(archive.namelist()):
            if not filename.endswith(".usfm"):
                continue
            usfm = archive.read(filename).decode("utf-8-sig")
            book = re.search(r"\\id ([A-Z0-9]+)", usfm)[1]
            parts = re.split(r"\\c\s+(\d+)\s*", usfm)
            chapters = {}
            for number, section in zip(parts[1::2], parts[2::2]):
                tokens = re.split(r"\\v\s+(\d+)\s+", section)
                verses = []
                for verse, value in zip(tokens[1::2], tokens[2::2]):
                    value = " ".join(re.sub(r"\\p\b", " ", value).split())
                    # The source marks Mt 21:44 with an empty verse entry.
                    if (book, number, verse) == ("MAT", "21", "44") and not value:
                        continue
                    if not value or "\\" in value:
                        raise ValueError(f"Unexpected USFM at {book} {number}:{verse}")
                    verses.append({"n": int(verse), "text": value})
                numbers = [verse["n"] for verse in verses]
                if not numbers or numbers != sorted(set(numbers)) or numbers[0] < 1:
                    raise ValueError(f"Invalid verse numbering at {book} {number}")
                chapters[number] = verses
            if list(map(int, chapters)) != list(range(1, len(chapters) + 1)):
                raise ValueError(f"Missing chapters in {book}")
            if book in books:
                raise ValueError(f"Duplicate book {book}")
            books[book] = chapters
    catalogue = json.loads((ROOT / "src/data/catalog.json").read_text())
    if {book: len(chapters) for book, chapters in books.items()} != {
        book["code"]: book["chapters"] for book in catalogue
    }:
        raise ValueError("The Schlachter 1951 book or chapter corpus is incomplete")
    return books


if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA256:
    raise ValueError("The upstream archive differs from the pinned eBible.org edition")
corpus = read_corpus()
payload = (json.dumps(corpus, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
if "--check" in sys.argv:
    if OUTPUT.read_bytes() != payload:
        raise ValueError("Schlachter 1951 app data differs from the pinned archive")
else:
    OUTPUT.write_bytes(payload)
print(json.dumps({
    "books": len(corpus),
    "chapters": sum(map(len, corpus.values())),
    "verses": sum(len(verses) for chapters in corpus.values() for verses in chapters.values()),
    "source_sha256": SOURCE_SHA256,
    "bundle_sha256": hashlib.sha256(payload).hexdigest(),
}))
