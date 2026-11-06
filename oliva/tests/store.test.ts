import { beforeEach, describe, expect, it, vi } from "vitest";
const adapter = vi.hoisted(() => ({ readData: vi.fn(), writeData: vi.fn() }));
vi.mock("../src/services/storage", () => adapter);
import { useApp } from "../src/state/store";
import { initialData } from "../src/state/model";
import { journalDraft, commitDraft } from "../src/features/personal/model";
beforeEach(() => {
  vi.resetAllMocks();
  useApp.setState({
    data: initialData(),
    ready: true,
    healthy: true,
    busy: false,
    error: null,
  });
  adapter.writeData.mockResolvedValue(undefined);
});
describe("Persistieren vor Bestätigung", () => {
  it("ordnet Hintergrundentwurf und explizite Aktion ohne Überschreiben", async () => {
    let release: () => void = () => {};
    adapter.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const draft = journalDraft();
    draft.values.text = "Noch kein veröffentlichter Gedanke.";
    const background = useApp.getState().saveEditorDraft(draft, null);
    const action = useApp.getState().mutate((d) => {
      d.name = "Ada";
    });
    const exportReady = useApp.getState().waitForWrites();
    expect(useApp.getState().data.drafts).toEqual([]);
    release();
    expect(await background).not.toBeNull();
    expect(await action).toBe(true);
    expect(useApp.getState().data.name).toBe("Ada");
    expect(useApp.getState().data.drafts[0]?.values).toEqual(draft.values);
    expect(useApp.getState().data.revision).toBe(2);
    expect((await exportReady).drafts[0]?.values).toEqual(draft.values);
  });
  it("erhält beim fehlgeschlagenen endgültigen Speichern den dauerhaften Entwurf", async () => {
    const draft = journalDraft();
    draft.values.text = "Dieser Text bleibt im Entwurf.";
    const saved = await useApp.getState().saveEditorDraft(draft, null);
    expect(saved).not.toBeNull();
    adapter.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(
      await useApp.getState().mutate((d) => {
        commitDraft(d, "journal", saved!, new Date().toISOString());
      }),
    ).toBe(false);
    expect(useApp.getState().data.notes).toEqual([]);
    expect(useApp.getState().data.drafts[0]?.values).toEqual(draft.values);
  });
  it("bestätigt einen fehlgeschlagenen Schreibvorgang nicht", async () => {
    adapter.writeData.mockRejectedValue(new Error("Speicher voll"));
    const before = useApp.getState().data;
    const result = await useApp.getState().mutate((d) => {
      d.name = "Ada";
    });
    expect(result).toBe(false);
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().error).toBe("Speicher voll");
  });
  it("publiziert erst nach dauerhafter Speicherung und verhindert Doppeltippen", async () => {
    let release: () => void = () => {};
    adapter.writeData.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const first = useApp.getState().mutate((d) => {
      d.name = "Ada";
    });
    expect(useApp.getState().data.name).toBe("");
    expect(
      await useApp.getState().mutate((d) => {
        d.name = "Falsch";
      }),
    ).toBe(false);
    release();
    expect(await first).toBe(true);
    expect(useApp.getState().data.name).toBe("Ada");
    expect(useApp.getState().data.revision).toBe(1);
    expect(adapter.writeData).toHaveBeenCalledTimes(1);
  });
  it("bewahrt den alten Bestand bei einem Konflikt", async () => {
    adapter.writeData.mockRejectedValue(new Error("Anderes Fenster"));
    expect(
      await useApp.getState().restore({ ...initialData(), name: "Import" }),
    ).toBe(false);
    expect(useApp.getState().data.name).toBe("");
  });
  it("blockiert neue Schreibzugriffe nach beschädigter Hydrierung", async () => {
    adapter.readData.mockRejectedValue(new Error("Beschädigte Daten"));
    useApp.setState({ ready: false, healthy: false });
    await useApp.getState().hydrate();
    expect(
      await useApp.getState().mutate((d) => {
        d.name = "Überschreiben";
      }),
    ).toBe(false);
    expect(adapter.writeData).not.toHaveBeenCalled();
  });
  it("verwendet beim Restore die lokale Revision statt der Revision eines anderen Geräts", async () => {
    useApp.setState({ data: { ...initialData(), revision: 42 } });
    expect(
      await useApp
        .getState()
        .restore({ ...initialData(), name: "Import", revision: 9999 }),
    ).toBe(true);
    expect(adapter.writeData.mock.calls[0]?.[1]).toBe(42);
    expect(useApp.getState().data.revision).toBe(43);
  });
});
