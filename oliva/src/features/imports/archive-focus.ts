import { parseFaithpath } from "./source";
import type { ImportReceipt } from "./schema";
import type { LegacyLocation } from "./legacy-history";

export type ArchiveFocusParams = {
  category?: string; entry?: string; section?: string; record?: string; source?: string;
};
export function archiveFocusParams(sourceHash: string, location: LegacyLocation): ArchiveFocusParams {
  return { source: sourceHash, category: location.category, entry: String(location.index),
    ...(location.section ? { section: location.section, record: String(location.recordIndex) } : {}) };
}
const index = (value: string | undefined) => value && /^(0|[1-9]\d{0,4})$/.test(value) ? Number(value) : null;
type Focus = { status: "none" } | { status: "unavailable"; reason: string } |
  { status: "ok"; pointer: string; value: unknown; location: LegacyLocation };
/** Resolve only exact, hash-bound original coordinates; never search by similar text. */
export function resolveArchiveFocus(receipt: ImportReceipt, params: ArchiveFocusParams): Focus {
  if (Object.values(params).every((value) => value === undefined)) return { status: "none" };
  const unavailable: Focus = { status: "unavailable", reason: "Diese Originalstelle ist in der angegebenen Quelle nicht eindeutig verfügbar." };
  const entry = index(params.entry), nested = params.section !== undefined || params.record !== undefined;
  if (!params.source || params.source !== receipt.sourceHash || entry === null ||
    !["paths", "reviews"].includes(params.category ?? "") ||
    nested && (params.category !== "paths" || !["reviews", "milestones"].includes(params.section ?? "") || index(params.record) === null)) return unavailable;
  try {
    const parsed = parseFaithpath(receipt.sourceText);
    if (parsed.sourceHash !== receipt.sourceHash || parsed.fingerprint !== receipt.fingerprint || receipt.id !== "fp5-" + parsed.fingerprint) return unavailable;
    const original = JSON.parse(receipt.sourceText), raw = original.app === "FaithPath" ? original.data : original,
      collection = raw[params.category!];
    if (!Array.isArray(collection) || entry >= collection.length) return unavailable;
    let value: unknown = collection[entry], pointer = `${params.category}[${entry}]`;
    const location: LegacyLocation = { category: params.category as "paths" | "reviews", index: entry };
    if (nested) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return unavailable;
      const items = (value as Record<string, unknown>)[params.section!], record = index(params.record)!;
      if (!Array.isArray(items) || record >= items.length) return unavailable;
      value = items[record]; pointer += `.${params.section}[${record}]`;
      location.section = params.section as "reviews" | "milestones"; location.recordIndex = record;
    }
    return { status: "ok", value, pointer, location };
  } catch { return unavailable; }
}
