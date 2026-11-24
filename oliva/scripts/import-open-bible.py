"""Reproducible import of the official German Open Translation Bible."""
import argparse
import hashlib
import json
from pathlib import Path

SOURCE = "31d411ac1c2d277242a3bd85697f354eaa11526b"
SOURCE_BOOK_ALIASES = {"Levitikus": "3 Mose", "Numeri": "4 Mose", "Esther": "Ester",
                       "Das Hohelied": "Hohelied", "Psalm": "Psalmen", "Zephanja": "Zefanja"}
ROOT = Path(__file__).resolve().parents[1]


def load(file):
    return json.loads(file.read_text(encoding="utf-8-sig"))


def write(file, data, check):
    payload = (json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
    if check:
        if file.read_bytes() != payload:
            raise ValueError(f"Unexpected data in {file}")
    else:
        file.write_bytes(payload)
    return hashlib.sha256(payload).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Extracted upstream checkout containing lang/de-DE")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    language = args.source / "lang/de-DE"
    official = load(language / "books.json")
    canon = load(ROOT / "src/data/catalog.json")
    books = sorted(p for p in language.iterdir() if p.is_dir())
    if len(books) != len(canon) or len(books) != 66:
        raise ValueError("Expected all 66 books")
    corpus, catalog, count = {}, [], 0
    for position, (folder, (title, chapter_count), book) in enumerate(zip(books, official.items(), canon, strict=True), 1):
        if folder.name != f"{position:02d}.{title}":
            raise ValueError(f"Unexpected book folder: {folder.name}")
        chapters = {}
        for file in sorted((folder / "json").glob("*.json")):
            chapter = load(file)
            chapter_number = chapter["chapter"]
            source_title = SOURCE_BOOK_ALIASES.get(chapter["book"], chapter["book"]).replace(". ", " ").strip()
            if source_title != title or type(chapter_number) is not int or chapter_number in chapters:
                raise ValueError(f"Unexpected chapter in {file}")
            verses, notes = [], []
            for item in chapter["verses"]:
                pieces = item["text"]
                if "verse" not in item:
                    lines = [line for line in pieces if line != "---"]
                    if lines:
                        notes.append({"after": verses[-1]["n"] if verses else 0, "text": "\n".join(lines)})
                    continue
                number = item["verse"]
                if type(number) is not int or number <= (verses[-1]["n"] if verses else 0):
                    raise ValueError(f"Unordered verse in {file}")
                if not isinstance(pieces, list) or not pieces or not all(isinstance(v, str) and v.strip() for v in pieces):
                    raise ValueError(f"Invalid verse text at {file}:{number}")
                verses.append({"n": number, "text": "\n".join(line.removeprefix("> ") for line in pieces)})
            if not verses:
                raise ValueError(f"Empty chapter in {file}")
            chapters[chapter_number] = {"verses": verses, "notes": notes}
            count += len(verses)
        if sorted(chapters) != list(range(1, chapter_count + 1)):
            raise ValueError(f"Incomplete chapters in {title}")
        code = book["code"]
        corpus[code] = dict(sorted(chapters.items()))
        catalog.append({"code": code, "name": book["name"], "chapters": chapter_count, "testament": book["testament"]})
    content_sha = write(ROOT / "src/data/open-bible-de.json", corpus, args.check)
    catalog_sha = write(ROOT / "src/data/open-bible-books.json", catalog, args.check)
    receipt = {"sourceCommit": SOURCE, "language": "de-DE", "books": len(catalog),
               "chapters": sum(book["chapters"] for book in catalog), "verses": count,
               "corpusSha256": content_sha, "catalogSha256": catalog_sha}
    write(ROOT / "content/open-bible-de/import.json", receipt, args.check)
    upstream_license = (args.source / "LICENCE.md").read_bytes()
    license_file = ROOT / "content/open-bible-de/UPSTREAM-LICENCE.md"
    if args.check:
        if license_file.read_bytes() != upstream_license:
            raise ValueError("Upstream licence does not match")
    else:
        license_file.write_bytes(upstream_license)
    print(json.dumps(receipt))


if __name__ == "__main__":
    main()
