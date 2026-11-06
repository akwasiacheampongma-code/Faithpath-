import {
  dataSchema,
  assertStorageBudget,
  type AppData,
  type Note,
} from "../../state/model";
import { goalSchema, type Goal } from "../personal/schema";
import {
  getChapter,
  validReference,
  referenceLabel,
  type Reference,
} from "../bible/repository";
import { highlightColor, type HighlightColor } from "../bible/highlights";
import { canonicalJson, sha256 } from "../../lib/hash";
import {
  parseFaithpath,
  iso,
  type FaithpathData,
  type FaithpathThought,
} from "./source";
import type { ImportedOrigin, ImportReceipt } from "./schema";

type Kind = ImportedOrigin["kind"];
export const sourceKey = (kind: Kind, id: string | number) =>
  `fp5-${kind}-${sha256(String(id))}`;
type SourceRef = {
  book: string;
  chapter: string | number;
  from?: string | number | null;
  to?: string | number | null;
  translation?: "otb" | "l1912";
};
export function legacyReference(value: SourceRef | null | undefined) {
  if (!value) return { ref: undefined, label: undefined };
  const aliases: Record<string, string> = {
    MAR: "MRK",
    JOH: "JHN",
    JAK: "JAS",
  };
  const book = aliases[value.book.toUpperCase()] ?? value.book.toUpperCase(),
    chapter = Number(value.chapter),
    verses = getChapter(book, chapter);
  const ref: Reference = {
    book,
    chapter,
    ...(value.from != null ? { from: Number(value.from) } : {}),
    ...(value.to != null
      ? { to: Number(value.to) === 999 ? verses.at(-1)?.n : Number(value.to) }
      : {}),
  };
  const valid = validReference(ref),
    translation = value.translation ?? "otb";
  const label =
    `${translation === "l1912" ? "Luther 1912" : "OTB"} · ${valid ? referenceLabel(ref) : `${value.book} ${value.chapter}`} ${valid ? "" : "(nicht zuordenbar)"}`.trim();
  return { ref: valid && translation === "l1912" ? ref : undefined, label };
}
export type PreviewRow = {
  kind: string;
  title: string;
  status: "add" | "kept" | "archive" | "conflict" | "mirror";
  detail: string;
};
export type ImportPlan = {
  baseRevision: number;
  receipt: ImportReceipt;
  goals: Goal[];
  notes: Note[];
  highlights: Record<string, HighlightColor>;
  chapters: string[];
  rows: PreviewRow[];
  alreadyImported: boolean;
};

function mirrorEqual(a: FaithpathThought, b: FaithpathThought) {
  const ref = (n: FaithpathThought) =>
    n.ref ? { ...n.ref, translation: n.ref.translation ?? "otb" } : null;
  return (
    a.text === b.text &&
    iso(a.date) !== null &&
    iso(a.date) === iso(b.date) &&
    iso(a.updatedAt) === iso(b.updatedAt) &&
    canonicalJson(ref(a)) === canonicalJson(ref(b)) &&
    (a.bibleNoteDeletedAt ?? null) === (b.bibleNoteDeletedAt ?? null)
  );
}
export function prepareImport(
  text: string,
  current: AppData,
  at = new Date().toISOString(),
): ImportPlan {
  const source = parseFaithpath(text),
    data = source.data,
    importId = "fp5-" + source.fingerprint;
  const receipt: ImportReceipt = {
    id: importId,
    fingerprint: source.fingerprint,
    sourceHash: source.sourceHash,
    sourceText: text,
    sourceExported: source.exported,
    importedAt: at,
    counts: {
      paths: 0,
      notes: 0,
      highlights: 0,
      chapters: 0,
      mirrors: 0,
      conflicts: 0,
    },
    entities: {},
    addedChapters: [],
  };
  const plan: ImportPlan = {
    baseRevision: current.revision,
    receipt,
    goals: [],
    notes: [],
    highlights: {},
    chapters: [],
    rows: [],
    alreadyImported: current.imports.some((i) => i.id === importId),
  };
  if (plan.alreadyImported) return plan;
  const row = (
    kind: string,
    title: string,
    status: PreviewRow["status"],
    detail: string,
  ) => {
    plan.rows.push({ kind, title, status, detail });
    if (status === "conflict") receipt.counts.conflicts++;
  };
  const entityHash = (value: unknown) => sha256(canonicalJson(value));
  const origin = (
    kind: Kind,
    id: string | number,
    value: unknown,
    keys = [sourceKey(kind, id)],
  ): ImportedOrigin => ({
    importId,
    kind,
    sourceId: String(id),
    sourceKeys: keys,
    entityHash: entityHash(value),
  });
  const remember = (o: ImportedOrigin) => {
    for (const key of o.sourceKeys) receipt.entities[key] = o.entityHash;
  };
  const known = new Map<string, string>();
  for (const i of current.imports)
    for (const [key, hash] of Object.entries(i.entities))
      if (!known.has(key)) known.set(key, hash);
  for (const item of [...current.goals, ...current.notes])
    if (item.origin)
      for (const key of item.origin.sourceKeys)
        known.set(key, item.origin.entityHash);
  function seen(o: ImportedOrigin, kind: string, title: string) {
    const previous = o.sourceKeys.map((k) => known.get(k)).find(Boolean);
    if (!previous) return false;
    remember(o);
    row(
      kind,
      title,
      previous === o.entityHash ? "kept" : "conflict",
      previous === o.entityHash
        ? "Schon übernommen. Lokale Änderungen oder Löschungen bleiben erhalten."
        : "Die Quelle wurde seit einem früheren Import verändert. Der lokale Stand bleibt bestehen; die neue Fassung bleibt im Originalarchiv.",
    );
    return true;
  }
  const availableGoals = new Set(current.goals.map((g) => g.id));
  for (const p of data.paths) {
    const o = origin("path", p.id, p),
      id = sourceKey("path", p.id),
      title = p.title;
    if (seen(o, "Vorhaben", title)) continue;
    if (current.goals.some((g) => g.id === id)) {
      row(
        "Vorhaben",
        title,
        "conflict",
        "Die Ziel-ID ist bereits belegt. Das Original bleibt im Archiv.",
      );
      continue;
    }
    const started = iso(p.started),
      createdAt = started ?? at;
    const verse = p.links.find((l) => l.kind === "verse" && l.ref),
      mapped = legacyReference(verse?.ref);
    if (p.category && p.category.length <= 100) o.category = p.category;
    if (mapped.label && mapped.label.length <= 200)
      o.referenceLabel = mapped.label;
    const candidate = {
      id,
      title: p.title.trim(),
      why: p.why ?? "",
      createdAt,
      updatedAt: createdAt,
      archivedAt: p.archived ? at : null,
      revision: 1,
      ref: mapped.ref,
      steps: p.steps.map((s) => ({
        id: "fp5-step-" + sha256(`${p.id}:${s.id}`),
        text: s.text.trim(),
        done: s.done ?? false,
        createdAt: iso(s.createdAt) ?? createdAt,
        completedAt: iso(s.completedAt),
      })),
      reviews: [],
      origin: o,
    };
    const parsed = goalSchema.safeParse(candidate);
    if (!parsed.success || current.goals.length + plan.goals.length >= 500) {
      row(
        "Vorhaben",
        title,
        "archive",
        "Titel, Schritte, Status oder Umfang passen nicht verlustfrei in ein Vorhaben. Der vollständige Weg bleibt im Originalarchiv.",
      );
      continue;
    }
    plan.goals.push(parsed.data);
    availableGoals.add(id);
    remember(o);
    receipt.counts.paths++;
    const details = [
      "Schritte und Archivstatus werden übernommen. Rückblicke, Meilensteine und frühere Quellen bleiben im Archiv.",
    ];
    if (!started)
      details.push(
        "Ohne gültiges Anfangsdatum wird der Importzeitpunkt als Anlagedatum verwendet.",
      );
    if (p.steps.some((s) => !iso(s.createdAt)))
      details.push(
        "Fehlende Schritt-Anlagedaten verwenden das Anlagedatum des Vorhabens.",
      );
    if (p.archived)
      details.push(
        "Das Archivdatum ist der Importzeitpunkt; der frühere Archivzeitpunkt ist unbekannt.",
      );
    if (mapped.label && !mapped.ref)
      details.push(`${mapped.label}: bleibt als Originalbezug erhalten.`);
    row("Vorhaben", title, "add", details.join(" "));
  }
  // Associations from both old pathIds and path.links are retained.
  const edges = new Map<string, Set<string>>();
  for (const p of data.paths)
    for (const link of p.links) {
      for (const [kind, id] of [
        ["journal", link.journalId],
        ["journal", link.entryId],
        ["reflection", link.reflectionId],
      ] as const) {
        if (id == null) continue;
        const key = kind + ":" + String(id),
          targets = edges.get(key) ?? new Set<string>();
        targets.add(String(p.id));
        edges.set(key, targets);
      }
    }
  const linkedGoals = (
    thought: FaithpathThought,
    kind: "journal" | "reflection",
    mirror?: FaithpathThought,
  ) => {
    const keys = new Set([
      ...(thought.pathIds ?? []),
      ...(mirror?.pathIds ?? []),
      ...(edges.get(kind + ":" + String(thought.id)) ?? []),
      ...(mirror ? (edges.get("reflection:" + String(mirror.id)) ?? []) : []),
    ]);
    return [...keys]
      .map((id) => sourceKey("path", id))
      .filter((id) => availableGoals.has(id));
  };
  const consumed = new Set<string>();
  function addThought(
    n: FaithpathThought,
    kind: "journal" | "reflection",
    mirror?: FaithpathThought,
  ) {
    const keys = [
        sourceKey(kind, n.id),
        ...(mirror ? [sourceKey("reflection", mirror.id)] : []),
      ],
      o = origin(
        kind,
        n.id,
        mirror ? { journal: n, reflection: mirror } : n,
        keys,
      ),
      title = n.text.slice(0, 100) || "(ohne Text)";
    if (seen(o, "Gedanke", title)) return;
    const mapped = legacyReference(n.ref),
      ref = n.bibleNoteDeletedAt ? undefined : mapped.ref;
    if (mapped.label && mapped.label.length <= 200)
      o.referenceLabel =
        mapped.label +
        (n.bibleNoteDeletedAt ? " · Bibelnotiz-Verknüpfung entfernt" : "");
    const createdAt = iso(n.date) ?? at,
      updatedAt = iso(n.updatedAt) ?? createdAt;
    const note: Note = {
      id: keys[0]!,
      text: n.text.trim(),
      kind:
        kind === "reflection" ||
        n.reflectionId != null ||
        n.subtype === "Reflexion"
          ? "reflection"
          : "note",
      createdAt,
      updatedAt,
      origin: o,
      goalIds: linkedGoals(n, kind, mirror),
      ...(ref ? { ref } : {}),
    };
    if (
      !note.text ||
      note.text.length > 10000 ||
      current.notes.length + plan.notes.length >= 5000
    ) {
      row(
        "Gedanke",
        title,
        "archive",
        "Leer, länger als 10.000 Zeichen oder Sammlung voll. Der vollständige Text bleibt im Archiv.",
      );
      return;
    }
    if (current.notes.some((x) => x.id === note.id)) {
      row(
        "Gedanke",
        title,
        "conflict",
        "Ziel-ID belegt. Der lokale Eintrag bleibt erhalten.",
      );
      return;
    }
    plan.notes.push(note);
    remember(o);
    receipt.counts.notes++;
    row(
      "Gedanke",
      title,
      "add",
      (!iso(n.date) ? "Ohne gültiges Datum gilt das Importdatum. " : "") +
        (mapped.label && !ref ? `${o.referenceLabel}. ` : "") +
        "Eigene Worte und zuordenbare Vorhaben-Verbindungen werden übernommen.",
    );
  }
  const reflectionsById = new Map(
    data.reflections.map((r) => [String(r.id), r]),
  );
  for (const j of data.journal) {
    const r =
      j.reflectionId != null
        ? reflectionsById.get(String(j.reflectionId))
        : undefined;
    const mirror =
      r && !consumed.has(String(r.id)) && mirrorEqual(j, r) ? r : undefined;
    addThought(j, "journal", mirror);
    if (mirror) {
      consumed.add(String(mirror.id));
      receipt.counts.mirrors++;
      row(
        "Reflexionsspiegel",
        String(mirror.id),
        "mirror",
        "Explizite Verknüpfung, gleicher Text, Datum, Übersetzung und Bibelbezug: einmaliger Gedanke; beide Originaldatensätze bleiben erhalten.",
      );
    } else if (r && !consumed.has(String(r.id)))
      row(
        "Reflexionsspiegel",
        String(r.id),
        "archive",
        "Die verknüpften Fassungen unterscheiden sich. Beide Texte werden einzeln geprüft.",
      );
  }
  for (const r of data.reflections)
    if (!consumed.has(String(r.id))) addThought(r, "reflection");
  for (const h of data.highlights) {
    const mapped = legacyReference(h),
      color = highlightColor.safeParse(h.color ?? "olive");
    if (!mapped.ref || !color.success) {
      row(
        "Markierung",
        String(h.id),
        "archive",
        `${mapped.label ?? "Bibelbezug nicht zuordenbar"}. Übersetzung oder Farbe wird im Originalarchiv bewahrt.`,
      );
      continue;
    }
    const ref = mapped.ref,
      verses = getChapter(ref.book, ref.chapter).filter(
        (v) => (!ref.from || v.n >= ref.from) && (!ref.to || v.n <= ref.to),
      );
    let added = 0,
      conflicts = 0;
    for (const v of verses) {
      const key = `${ref.book}:${ref.chapter}:${v.n}`,
        existing = current.highlights[key] ?? plan.highlights[key];
      if (existing) {
        if (existing !== color.data) conflicts++;
      } else {
        plan.highlights[key] = color.data;
        added++;
      }
    }
    receipt.counts.highlights += added;
    row(
      "Markierung",
      mapped.label!,
      conflicts ? "conflict" : added ? "add" : "kept",
      `${added} neue Versmarkierungen. ${conflicts} abweichende Farben bleiben unverändert. Originalspanne und Verbindungen bleiben im Archiv.`,
    );
  }
  for (const e of data.events) {
    if (e.kind !== "chapter-explored") continue;
    const mapped = legacyReference(e.ref);
    if (
      !iso(e.at) ||
      !mapped.ref ||
      mapped.ref.from != null ||
      mapped.ref.to != null
    ) {
      row(
        "Kapitelstatus",
        String(e.id),
        "archive",
        "Kein datierter, eindeutiger vollständiger Luther-1912-Kapitelstatus. Der Status bleibt im Originalarchiv.",
      );
      continue;
    }
    const key = `${mapped.ref.book}:${mapped.ref.chapter}`;
    if (!current.readChapters.includes(key) && !plan.chapters.includes(key)) {
      plan.chapters.push(key);
      row(
        "Kapitelstatus",
        mapped.label!,
        "add",
        "Aus dem ausdrücklich bestätigten FaithPath-Kapitelstatus. Kein zusätzlicher Baumfortschritt.",
      );
    }
  }
  receipt.counts.chapters = plan.chapters.length;
  receipt.addedChapters = [...plan.chapters];
  row(
    "Originalarchiv",
    "Vollständige Sicherung",
    "archive",
    "Alle Originalfelder bleiben erhalten, einschließlich Einstellungen, OTB-Bezügen, Quiz, geführten Plänen, Ereignissen, Rückblicken und Meilensteinen. Bestehende Leseposition, Lernwege, Entwürfe und Baumstufe bleiben bestehen.",
  );
  const trial = JSON.parse(JSON.stringify(current)) as AppData;
  applyImport(trial, plan);
  dataSchema.parse(trial);
  assertStorageBudget(trial);
  return plan;
}
export function applyImport(current: AppData, plan: ImportPlan) {
  if (current.revision !== plan.baseRevision)
    throw new Error(
      "Der lokale Stand hat sich seit der Vorschau verändert. Bitte prüfe die Datei erneut.",
    );
  if (
    plan.alreadyImported ||
    current.imports.some((i) => i.id === plan.receipt.id)
  )
    throw new Error("Diese Sicherung wurde bereits übernommen.");
  current.goals.push(...plan.goals);
  current.notes.push(...plan.notes);
  Object.assign(current.highlights, plan.highlights);
  current.readChapters.push(...plan.chapters);
  current.imports.push(plan.receipt);
}
export function archiveData(receipt: ImportReceipt): FaithpathData {
  return parseFaithpath(receipt.sourceText).data;
}
