import { describe, expect, it } from "vitest";
import { initialData } from "../src/state/model";
import { prepareImport } from "../src/features/imports/model";
import { archiveFocusParams, resolveArchiveFocus } from "../src/features/imports/archive-focus";
import { faithpathFixture } from "./fixtures/faithpath-v5";

function receipt() { return prepareImport(JSON.stringify(faithpathFixture()), initialData(), "2027-01-01T12:00:00.000Z").receipt; }
describe("genaue historische Archivstellen", () => {
  it("öffnet den tatsächlichen verschachtelten Originaldatensatz ohne Normalisierungsfelder hinzuzufügen", () => {
    const source = receipt(), before = JSON.stringify(source), location = { category: "paths" as const, index: 0, section: "milestones" as const, recordIndex: 0 };
    const focus = resolveArchiveFocus(source, archiveFocusParams(source.sourceHash, location));
    expect(focus).toEqual({ status: "ok", pointer: "paths[0].milestones[0]", location, value: faithpathFixture().data.paths[0]!.milestones[0] });
    expect(JSON.stringify(source)).toBe(before);
  });
  it("lässt den gewöhnlichen Archivaufruf ohne Fokusparameter bestehen", () => {
    expect(resolveArchiveFocus(receipt(), {})).toEqual({ status: "none" });
  });
  it("weist falsche Hashes, Teilparameter, fremde Felder und ungültige Indizes zurück", () => {
    const source = receipt(), valid = { source: source.sourceHash, category: "paths", entry: "0" };
    for (const params of [
      { ...valid, source: "0".repeat(64) }, { category: "paths", entry: "0" },
      { ...valid, category: "__proto__" }, { ...valid, entry: "-1" }, { ...valid, entry: "0.0" },
      { ...valid, entry: "01" }, { ...valid, entry: "10000" }, { ...valid, section: "reviews" },
      { ...valid, section: "links", record: "0" }, { ...valid, section: "reviews", record: "99" },
      { ...valid, category: "reviews", section: "reviews", record: "0" },
    ]) expect(resolveArchiveFocus(source, params).status).toBe("unavailable");
  });
  it("weist veränderte Originalbytes trotz gleich aussehendem Datensatz zurück", () => {
    const source = receipt(), params = archiveFocusParams(source.sourceHash, { category: "paths", index: 0 });
    source.sourceText += "\n";
    expect(resolveArchiveFocus(source, params).status).toBe("unavailable");
  });
});
