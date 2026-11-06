import { beforeEach, describe, it, expect } from "vitest";
import {
  useVolatileDrafts,
  holdDraft,
  releaseDraft,
  acknowledgeDrafts,
  volatileExport,
} from "../src/features/personal/volatile-drafts";
import {
  captureDraft,
  dailySource,
} from "../src/features/personal/capture-model";
beforeEach(() => useVolatileDrafts.setState({ items: {} }));
describe("Ungesicherte Worte bleiben während der Sitzung erhalten", () => {
  it("lässt einen alten Editor nicht die neuere Sitzungskopie ersetzen oder entfernen", () => {
    const draft = captureDraft(dailySource());
    draft.values.text = "Meine alten Worte.";
    holdDraft({ draft, owner: "first", savedBytes: "", reason: "error" }, true);
    const newer = structuredClone(draft);
    newer.values.text = "Meine inzwischen weitergedachten Worte.";
    holdDraft(
      { draft: newer, owner: "second", savedBytes: "", reason: "pending" },
      true,
    );
    holdDraft({ draft, owner: "first", savedBytes: "", reason: "error" });
    releaseDraft(draft.key, "first");
    expect(
      useVolatileDrafts.getState().items[draft.key]?.draft.values,
    ).toMatchObject({ text: newer.values.text });
    expect(volatileExport().drafts[0]?.draft.values).toMatchObject({
      text: newer.values.text,
    });
  });
  it("entfernt einen Puffer erst, wenn genau diese Worte dauerhaft gespeichert sind", () => {
    const draft = captureDraft(dailySource());
    draft.values.text = "Meine noch ungesicherten Worte.";
    holdDraft({ draft, owner: "first", savedBytes: "", reason: "pending" });
    const other = structuredClone(draft);
    other.values.text = "Ein früherer Stand.";
    acknowledgeDrafts([other]);
    expect(Object.keys(useVolatileDrafts.getState().items)).toHaveLength(1);
    acknowledgeDrafts([draft]);
    expect(useVolatileDrafts.getState().items).toEqual({});
  });
});
