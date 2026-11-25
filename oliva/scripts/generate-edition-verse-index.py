"""Store only numbering for synchronous backup validation of lazy-loaded editions."""
import json
import sys
from pathlib import Path

data = Path(__file__).resolve().parents[1] / "src/data"
index = {}
for edition, file in (("otb", "open-bible-de.json"), ("schlachter1951", "schlachter-1951.json")):
    books = json.loads((data / file).read_text())
    edition_index = {}
    for book, chapters in books.items():
        chapter_index = []
        for chapter in range(1, len(chapters) + 1):
            content = chapters[str(chapter)]
            verses = content["verses"] if edition == "otb" else content
            numbers = [verse["n"] for verse in verses]
            chapter_index.append(len(numbers) if numbers == list(range(1, len(numbers) + 1)) else numbers)
        edition_index[book] = chapter_index
    index[edition] = edition_index
output = data / "edition-verse-index.json"
payload = json.dumps(index, separators=(",", ":")) + "\n"
if "--check" in sys.argv:
    if output.read_text() != payload:
        raise ValueError("Edition numbering does not match the packaged text")
else:
    output.write_text(payload)
