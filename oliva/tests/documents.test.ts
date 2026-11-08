import { describe, it, expect, vi } from "vitest";
import { initialData, cloneData, backupByteLength } from "../src/state/model";
import { utf8Length } from "../src/lib/hash";
import { prepareImport, applyImport } from "../src/features/imports/model";
import {
  forStorage,
  decodeStored,
  archiveHashes,
  documentRevision,
  checkedHashes,
} from "../src/services/documents";
import { faithpathFixture } from "./fixtures/faithpath-v5";
function imported() {
  const data = initialData(),
    source = faithpathFixture();
  (source as any).largeOriginal = "ORIGINAL-MARKER " + 'ä\n"\\🌿'.repeat(12000);
  const text = JSON.stringify(source, null, 2);
  applyImport(data, prepareImport(text, data));
  return data;
}
describe("Unveränderliche Originalquellen außerhalb des laufenden Payloads", () => {
  it("speichert nur Metadaten und setzt beim Lesen die exakt geprüfte Quelle wieder zusammen", async () => {
    const data = imported(),
      stored = forStorage(data),
      json = JSON.stringify(stored);
    expect(json).not.toContain("ORIGINAL-MARKER");
    expect(json.length).toBeLessThan(20000);
    expect(archiveHashes(stored)).toEqual([data.imports[0]!.sourceHash]);
    const loader = vi.fn(async () => data.imports[0]!.sourceText);
    expect(await decodeStored(stored, loader)).toEqual(data);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(documentRevision(stored)).toBe(data.revision);
  });
  it("liest alte Inline-Bestände ohne Zugriff auf einen Archivblob und weist unbekannte Speicherformate zurück", async () => {
    const { readingPosition, ...current } = initialData(),
      old = { ...current, version: 3, name: "Ada" },
      load = vi.fn(async () => {
        throw new Error("Unerwarteter Zugriff");
      });
    expect(await decodeStored(old, load)).toEqual({
      ...old,
      version: 5,
      readingPosition: null,
    });
    expect(load).not.toHaveBeenCalled();
    await expect(
      decodeStored({ storageVersion: 9, data: current }, load),
    ).rejects.toThrow();
    expect(() =>
      documentRevision({ storageVersion: 1, data: { revision: -1 } }),
    ).toThrow();
    expect(() => checkedHashes(["wrong"])).toThrow();
  });
  it("meldet fehlende oder veränderte Originalblobs, statt sie stillschweigend zu ersetzen", async () => {
    const data = imported(),
      stored = forStorage(data);
    await expect(
      decodeStored(stored, async () => {
        throw new Error("fehlt");
      }),
    ).rejects.toThrow(/fehlt/);
    await expect(
      decodeStored(stored, async () => data.imports[0]!.sourceText + " "),
    ).rejects.toThrow(/beschädigt/);
  });
  it("klont veränderbare Metadaten unabhängig und berechnet die vollständige Exportgröße exakt", () => {
    const data = imported(),
      before = JSON.stringify(data),
      copy = cloneData(data);
    expect(copy).toEqual(data);
    copy.imports[0]!.counts.notes = 999;
    copy.imports[0]!.entities["new"] = "0".repeat(64);
    copy.imports[0]!.addedChapters.push("GEN:1");
    copy.notes[0]!.text = "Andere Worte";
    expect(JSON.stringify(data)).toBe(before);
    expect(backupByteLength(data)).toBe(
      utf8Length(JSON.stringify(data, null, 2)),
    );
    expect(backupByteLength(copy)).toBe(
      utf8Length(JSON.stringify(copy, null, 2)),
    );
    expect(backupByteLength(initialData())).toBe(
      utf8Length(JSON.stringify(initialData(), null, 2)),
    );
  });
});
