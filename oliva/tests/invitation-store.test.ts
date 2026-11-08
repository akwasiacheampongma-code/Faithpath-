import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  readData: vi.fn(),
  writeData: vi.fn(),
  readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);

import { useApp } from "../src/state/store";
import { initialData, type AppData } from "../src/state/model";
import { selectInvitations } from "../src/features/invitations/model";
import { journalDraft } from "../src/features/personal/model";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";

const now = Date.parse("2026-11-08T12:00:00.000Z");
const at = "2026-09-01T12:00:00.000Z";
function seeded(): AppData {
  const data = initialData();
  data.revision = 7;
  data.name = "Ada";
  // These counts would trigger growth if a metadata action accidentally called grow.
  data.readChapters = ["MRK:4"];
  data.retainedReviewGrowth = { reflections: 2, actions: 1 };
  data.goals = [
    {
      id: "g1",
      title: "Zuhören",
      why: "Einen Menschen ausreden lassen.",
      createdAt: at,
      updatedAt: at,
      archivedAt: null,
      revision: 2,
      ref: { book: "JHN", chapter: 6 },
      steps: [
        {
          id: "s1",
          text: "Zeit nehmen",
          done: false,
          createdAt: at,
          completedAt: null,
        },
      ],
      reviews: [
        {
          id: "r1",
          text: "Meine damaligen Worte.",
          createdAt: at,
          applied: true,
          source: { title: "Damals", why: "Meine damalige Frage", steps: [] },
        },
      ],
    },
  ];
  data.notes = [
    {
      id: "n1",
      text: "Ein eigener älterer Gedanke.",
      kind: "reflection",
      createdAt: at,
      updatedAt: at,
    },
  ];
  return data;
}
function personalFields(data: AppData) {
  const { invitations, revision, ...personal } = data;
  return personal;
}
function dueGoal() {
  const data = useApp.getState().data;
  return selectInvitations(data, data.invitations, now).due.find(
    (x) => x.key === "goal:g1",
  )!;
}
function deferredGoal() {
  const data = useApp.getState().data;
  return selectInvitations(data, data.invitations, now).deferred.find(
    (x) => x.key === "goal:g1",
  )!;
}
beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(now);
  useVolatileDrafts.setState({ items: {}, settled: {} });
  storage.writeData.mockResolvedValue(undefined);
  storage.readData.mockResolvedValue(seeded());
  useApp.setState({ busy: false });
  await useApp.getState().hydrate();
});

describe("Atomare, wachstumsneutrale Einladungssteuerung", () => {
  it("startet ausgeschaltet und schreibt beim Anzeigen nichts; Opt-in/Opt-out ändern nur Steuerung und Revision", async () => {
    const before = structuredClone(useApp.getState().data);
    expect(before.invitations.enabled).toBe(false);
    expect(selectInvitations(before, before.invitations, now).due).toEqual([]);
    expect(storage.writeData).not.toHaveBeenCalled();
    expect(await useApp.getState().setInvitationsEnabled(true, false)).toBe(
      true,
    );
    const enabled = useApp.getState().data;
    expect(enabled.invitations.enabled).toBe(true);
    expect(personalFields(enabled)).toEqual(personalFields(before));
    expect(enabled.revision).toBe(8);
    expect(storage.writeData).toHaveBeenLastCalledWith(enabled, 7, {});
    expect(await useApp.getState().setInvitationsEnabled(true, true)).toBe(
      true,
    );
    expect(storage.writeData).toHaveBeenCalledTimes(1);
    expect(await useApp.getState().setInvitationsEnabled(false, true)).toBe(
      true,
    );
    expect(useApp.getState().data.invitations.enabled).toBe(false);
    expect(personalFields(useApp.getState().data)).toEqual(
      personalFields(before),
    );
    expect(storage.writeData).toHaveBeenLastCalledWith(
      useApp.getState().data,
      8,
      {},
    );
  });

  it("verschiebt, blendet aus und nimmt wieder auf, ohne Quelle, Erfahrungsdatum oder Wachstum zu verändern", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const before = structuredClone(useApp.getState().data);
    expect(await useApp.getState().chooseInvitation(dueGoal(), "snooze")).toBe(
      true,
    );
    expect(useApp.getState().data.invitations.snoozed["goal:g1"]).toBe(
      "2026-11-22T12:00:00.000Z",
    );
    expect(deferredGoal().mode).toBe("snoozed");
    expect(
      await useApp.getState().chooseInvitation(deferredGoal(), "resume"),
    ).toBe(true);
    expect(await useApp.getState().chooseInvitation(dueGoal(), "dismiss")).toBe(
      true,
    );
    expect(useApp.getState().data.invitations.dismissed["goal:g1"]).toBe(
      "2026-11-08T12:00:00.000Z",
    );
    expect(deferredGoal().mode).toBe("dismissed");
    expect(
      await useApp.getState().chooseInvitation(deferredGoal(), "resume"),
    ).toBe(true);
    expect(dueGoal()).toBeDefined();
    expect(useApp.getState().data.invitations).toEqual({
      enabled: true,
      snoozed: {},
      dismissed: {},
    });
    expect(personalFields(useApp.getState().data)).toEqual(
      personalFields(before),
    );
    expect(useApp.getState().data.growthStage).toBe(0);
    const calls = storage.writeData.mock.calls;
    expect(calls.map((call) => call[1])).toEqual([7, 8, 9, 10, 11]);
  });

  it("meldet einen ausstehenden Schreibvorgang nicht optimistisch als gespeichert und blockiert Doppeltaps", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal(),
      before = useApp.getState().data;
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    let settled = false;
    const pending = useApp
      .getState()
      .chooseInvitation(invitation, "snooze")
      .then((ok) => {
        settled = true;
        return ok;
      });
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    expect(useApp.getState().busy).toBe(true);
    expect(useApp.getState().data).toBe(before);
    expect(settled).toBe(false);
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(await useApp.getState().setInvitationsEnabled(false, true)).toBe(
      false,
    );
    release();
    expect(await pending).toBe(true);
    expect(useApp.getState().busy).toBe(false);
    expect(deferredGoal().mode).toBe("snoozed");
  });

  it("behält bei Speicherfehlern den exakten alten Datenstand und bestätigt weder Opt-in noch Ausblenden", async () => {
    const before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(await useApp.getState().setInvitationsEnabled(true, false)).toBe(
      false,
    );
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().error).toBe("Speicher voll");
    expect(await useApp.getState().setInvitationsEnabled(true, false)).toBe(
      true,
    );
    const enabled = useApp.getState().data,
      invitation = dueGoal();
    storage.writeData.mockRejectedValueOnce(
      new Error("Datenträger nicht verfügbar"),
    );
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(useApp.getState().data).toBe(enabled);
    expect(dueGoal().stamp).toBe(invitation.stamp);
    expect(useApp.getState().error).toBe("Datenträger nicht verfügbar");
    expect(useApp.getState().busy).toBe(false);
  });

  it("lehnt einen veralteten Quellenstempel ab, bevor ein inzwischen geändertes Vorhaben gespeichert werden könnte", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal(),
      changed = structuredClone(useApp.getState().data);
    changed.goals[0]!.title = "Ein inzwischen anderes Anliegen";
    changed.goals[0]!.revision++;
    changed.revision++;
    useApp.setState({ data: changed });
    const writes = storage.writeData.mock.calls.length;
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(storage.writeData).toHaveBeenCalledTimes(writes);
    expect(useApp.getState().data).toBe(changed);
    expect(useApp.getState().error).toMatch(/verändert/);
  });

  it("verhindert, dass eine alte Ansicht eine neuere Wahl ersetzt; Opt-out bewahrt zurückgestellte Einladungen", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal();
    expect(await useApp.getState().chooseInvitation(invitation, "snooze")).toBe(
      true,
    );
    const snoozed = useApp.getState().data,
      writes = storage.writeData.mock.calls.length;
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(useApp.getState().data).toBe(snoozed);
    expect(storage.writeData).toHaveBeenCalledTimes(writes);
    expect(await useApp.getState().setInvitationsEnabled(false, true)).toBe(
      true,
    );
    expect(useApp.getState().data.invitations.snoozed).toEqual(
      snoozed.invitations.snoozed,
    );
    expect(
      selectInvitations(
        useApp.getState().data,
        useApp.getState().data.invitations,
        now,
      ).due,
    ).toEqual([]);
    expect(
      await useApp.getState().chooseInvitation(deferredGoal(), "resume"),
    ).toBe(true);
    expect(useApp.getState().data.invitations).toEqual({
      enabled: false,
      snoozed: {},
      dismissed: {},
    });
  });

  it("blockiert beide Steuerungsaktionen während der Hydrierung und verwirft keine gelesenen Daten", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal(),
      snapshot = useApp.getState().data;
    const loaded = structuredClone(snapshot);
    loaded.name = "Frisch gelesen";
    let release!: (value: AppData) => void;
    storage.readData.mockImplementationOnce(
      () =>
        new Promise<AppData>((resolve) => {
          release = resolve;
        }),
    );
    const hydrating = useApp.getState().hydrate();
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    const writes = storage.writeData.mock.calls.length;
    expect(await useApp.getState().setInvitationsEnabled(false, true)).toBe(
      false,
    );
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(storage.writeData).toHaveBeenCalledTimes(writes);
    expect(useApp.getState().data).toBe(snapshot);
    release(loaded);
    await hydrating;
    expect(useApp.getState().data).toBe(loaded);
    expect(useApp.getState().busy).toBe(false);
  });

  it("wartet hinter einem echten Entwurfs-Autosave und schreibt danach dessen neuen Stand mit korrekter Revision weiter", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal();
    const draft = journalDraft();
    draft.values.text = "Meine noch nicht abgeschlossenen Worte.";
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const saving = useApp.getState().saveEditorDraft(draft, null);
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    const choosing = useApp.getState().chooseInvitation(invitation, "dismiss");
    expect(storage.writeData).toHaveBeenCalledTimes(2); // Opt-in + pending autosave.
    release();
    const saved = await saving;
    expect(saved).not.toBeNull();
    expect(await choosing).toBe(true);
    const final = useApp.getState().data;
    expect(final.drafts).toEqual([saved]);
    expect(final.invitations.dismissed["goal:g1"]).toBe(
      "2026-11-08T12:00:00.000Z",
    );
    expect(final.growthStage).toBe(0);
    expect(storage.writeData.mock.calls.map((call) => call[1])).toEqual([
      7, 8, 9,
    ]);
    expect(storage.writeData).toHaveBeenLastCalledWith(final, 9, {});
  });

  it("behandelt einen Konflikt mit einem anderen Tab als Schreibfehler und überschreibt dessen Revision nicht", async () => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal(),
      before = useApp.getState().data;
    storage.writeData.mockImplementationOnce(
      async (_data: AppData, expectedRevision: number) => {
        expect(expectedRevision).toBe(before.revision);
        throw new Error(
          "Der Datenstand wurde in einem anderen Fenster verändert.",
        );
      },
    );
    expect(await useApp.getState().chooseInvitation(invitation, "snooze")).toBe(
      false,
    );
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().error).toMatch(/anderen Fenster/);
  });

  it.each([
    { ready: false, healthy: true },
    { ready: true, healthy: false },
  ])("schreibt bei nicht sicher lesbarem Bestand nicht: %j", async (state) => {
    await useApp.getState().setInvitationsEnabled(true, false);
    const invitation = dueGoal(),
      before = useApp.getState().data;
    const writes = storage.writeData.mock.calls.length;
    useApp.setState(state);
    expect(await useApp.getState().setInvitationsEnabled(false, true)).toBe(
      false,
    );
    expect(
      await useApp.getState().chooseInvitation(invitation, "dismiss"),
    ).toBe(false);
    expect(useApp.getState().data).toBe(before);
    expect(storage.writeData).toHaveBeenCalledTimes(writes);
  });
});
