import fs from "node:fs";
import { validateFinalNtQuiz } from "./validate-nt-quiz.mjs";
import { parseQuizReferences } from "./quiz-reference-ranges.mjs";
import path from "node:path";
import { LIFE_TOPICS, GUIDED_PLANS, BEGINNER_GUIDES } from "../src/content.js";
import { normBook, validRef } from "../src/domain.js";
export function auditContent(root = process.cwd()) {
  const approvedMaster = fs.existsSync(path.join(root, "reports/nt-quiz-final/manifest.json")) ? validateFinalNtQuiz(root) : null;
  const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
  const books = read("data/index.json"),
    stories = read("data/stories.json"),
    index = {},
    counts = {};
  const aliases = {
    Apg: "ACT",
    Mt: "MAT",
    Mk: "MRK",
    Lk: "LUK",
    Joh: "JHN",
    Röm: "ROM",
    "1 Kor": "1CO",
    "2 Kor": "2CO",
    Gal: "GAL",
    Eph: "EPH",
    Phil: "PHP",
    Kol: "COL",
    "1 Thess": "1TH",
    "2 Thess": "2TH",
    "1 Tim": "1TI",
    "2 Tim": "2TI",
    Tit: "TIT",
    Phlm: "PHM",
    Hebr: "HEB",
    Jak: "JAS",
    "1 Petr": "1PE",
    "2 Petr": "2PE",
    "1 Joh": "1JN",
    "2 Joh": "2JN",
    "3 Joh": "3JN",
    Jud: "JUD",
    Offb: "REV",
  };
  for (const b of books) aliases[b.name] = b.code;
  const errors = [],
    warnings = [],
    parse = (text) => parseQuizReferences(text, books, aliases);
  for (const tr of ["otb", "l1912"]) {
    index[tr] = {};
    let chapters = 0,
      verses = 0;
    for (const b of books) {
      const data = read(`data/bibles/${tr}/${b.code}.json`);
      if (data.chapters.length !== b.chapters)
        errors.push(`${tr}/${b.code}: Kapitelanzahl`);
      index[tr][b.code] = data.chapters.map((c) => c.map((v) => Number(v[0])));
      chapters += data.chapters.length;
      verses += data.chapters.reduce((n, c) => n + c.length, 0);
    }
    counts[tr] = { books: books.length, chapters, verses };
  }
  const verify = (r, label) => {
    for (const tr of ["otb", "l1912"])
      try {
        validRef({ ...r, translation: tr }, index);
      } catch (err) {
        errors.push(`${label} (${tr}): ${err.message}`);
      }
  };
  const references = [
    ...LIFE_TOPICS.flatMap((t) => t.refs),
    ...GUIDED_PLANS.flatMap((p) =>
      p.days.map((d) => ({ book: d[1], chapter: d[2], from: d[3], to: d[4] })),
    ),
    ...BEGINNER_GUIDES.flatMap((p) =>
      p.days.map((d) => ({ book: d[1], chapter: d[2], from: d[3], to: d[4] })),
    ),
  ];
  references.forEach((r) => verify(r, JSON.stringify(r)));
  const ids = new Set();
  let questions = 0,
    verified = 0,
    pending = 0,
    approved = 0,
    missing = 0;
  for (const x of stories) {
    if (ids.has(x.id)) errors.push("Doppelte Story " + x.id);
    ids.add(x.id);
    verify(
      { book: x.book, chapter: x.chapter + 1, from: x.from, to: x.to },
      "Einheit " + x.id,
    );
    if (x.to === 999) warnings.push("Altes Ganzkapitel-Sentinel: " + x.id);
    if (!x.reflection?.trim()) errors.push("Reflexion fehlt: " + x.id);
    for (const [i, q] of x.questions.entries()) {
      questions++;
      if (
        q.a?.length !== 4 ||
        new Set(q.a).size !== 4 ||
        !Number.isInteger(q.c) ||
        q.c < 0 ||
        q.c > 3 ||
        !q.x?.trim()
      )
        errors.push("Fragenstruktur " + x.id + "/" + i);
      try {
        for (const ref of parse(q.ref || q.p)) verify(ref, "Frage " + x.id + "/" + i);
      } catch (err) {
        errors.push(err.message);
      }
    }
    if (x.verification?.status === "verse-checked")
      verified += x.questions.length;
    else if (x.kind === "chapter-quiz") {
      if (approvedMaster) approved += x.questions.length;
      else pending += x.questions.length;
    }
    else missing += x.questions.length;
  }
  const report = {
    bibles: counts,
    stories: stories.length,
    questions,
    books: new Set(stories.map((x) => x.book)).size,
    reflections: stories.length,
    uniqueReflections: new Set(stories.map((x) => x.reflection)).size,
    existingVerification: verified,
    editorialPending: pending,
    approvedNtMaster: approved,
    missingVerification: missing,
    situationPlanReferences: references.length,
    errors,
    warnings,
  };
  return { index, report };
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { index, report } = auditContent();
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exitCode = 1;
  else {
    fs.writeFileSync("data/reference-index.json", JSON.stringify(index));
    fs.writeFileSync(
      "data/content-report.json",
      JSON.stringify(report, null, 2),
    );
  }
}
