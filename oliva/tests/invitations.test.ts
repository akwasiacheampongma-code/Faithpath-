import { afterEach, describe, expect, it, vi } from "vitest";
import * as fingerprints from "../src/lib/hash";
import { initialData } from "../src/state/model";
import type { Goal } from "../src/features/personal/schema";
import {
  changeInvitationControl,
  emptyInvitationControls,
  selectInvitations,
  type InvitationControls,
} from "../src/features/invitations/model";
const DAY = 86400000,
  now = Date.parse("2026-11-08T12:00:00.000Z");
const ago = (days: number) => new Date(now - days * DAY).toISOString();
const goal = (days: number): Goal => ({
  id: "owned",
  title: "Raum zum Zuhören",
  why: "In meinem Tempo",
  createdAt: ago(days),
  updatedAt: ago(days),
  archivedAt: null,
  revision: 1,
  steps: [],
  reviews: [],
});
const enabled = (): InvitationControls => ({
  ...emptyInvitationControls(),
  enabled: true,
});
afterEach(() => vi.restoreAllMocks());

describe("Freiwillige In-App-Einladungen aus vorhandenen Quellen", () => {
  it("beginnt ohne Opt-in still und verändert beim Auswählen keinerlei Daten", () => {
    const data = initialData();
    data.goals = [goal(22)];
    const controls = emptyInvitationControls(),
      before = JSON.stringify({ data, controls });
    expect(selectInvitations(data, controls, now).due).toEqual([]);
    expect(selectInvitations(data, enabled(), now).due).toHaveLength(1);
    expect(JSON.stringify({ data, controls })).toBe(before);
  });
  it("lässt Vorhaben erst nach 21 Tagen und unverbundene Gedanken erst nach 35 Tagen zu", () => {
    const data = initialData();
    data.goals = [goal(21)];
    data.notes = [
      {
        id: "thought",
        text: "Ein eigener Gedanke",
        kind: "reflection",
        createdAt: ago(35),
        updatedAt: ago(35),
      },
    ];
    expect(selectInvitations(data, enabled(), now - 1).due).toEqual([]);
    expect(
      selectInvitations(data, enabled(), now).due.map((x) => x.key),
    ).toEqual(["goal:owned", "note:thought"]);
  });
  it("zählt Änderungen des Rückblicktexts und Entwürfe nicht als neue Erfahrung", () => {
    const data = initialData();
    const item = goal(50);
    item.reviews = [
      {
        id: "review",
        text: "Erfahrung",
        createdAt: ago(22),
        updatedAt: ago(1),
        applied: true,
        source: { title: item.title, why: item.why, steps: [] },
      },
    ];
    item.updatedAt = ago(1);
    data.goals = [item];
    const actual = selectInvitations(data, enabled(), now).due[0]!;
    expect(actual.at).toBe(ago(22));
    expect(actual.delayDays).toBe(21);
    expect(data.growthStage).toBe(0);
  });
  it("nutzt echte Schrittabschlüsse und verbundene Notizen, ohne sie doppelt einzuladen", () => {
    const data = initialData(),
      item = goal(70);
    item.steps = [
      {
        id: "step",
        text: "Zuhören",
        done: true,
        createdAt: ago(60),
        completedAt: ago(25),
      },
    ];
    data.goals = [item];
    data.notes = [
      {
        id: "linked",
        text: "Ein neuer Bezug",
        kind: "note",
        createdAt: ago(50),
        updatedAt: ago(2),
        goalIds: [item.id],
      },
    ];
    expect(selectInvitations(data, enabled(), now).due).toEqual([]);
    data.notes = [];
    expect(selectInvitations(data, enabled(), now).due[0]!.at).toBe(ago(25));
  });
  it("verwirft keine Quelle durch Pausieren, Beiseitelegen oder Wiederzulassen", () => {
    const data = initialData();
    data.goals = [goal(40)];
    const controls = enabled(),
      source = JSON.stringify(data),
      first = selectInvitations(data, controls, now).due[0]!;
    const snoozed = changeInvitationControl(
      data,
      controls,
      first,
      "snooze",
      now,
    );
    expect(selectInvitations(data, snoozed, now).due).toEqual([]);
    expect(selectInvitations(data, snoozed, now).deferred[0]).toMatchObject({
      mode: "snoozed",
      until: new Date(now + 14 * DAY).toISOString(),
    });
    expect(selectInvitations(data, snoozed, now + 14 * DAY - 1).due).toEqual(
      [],
    );
    expect(selectInvitations(data, snoozed, now + 14 * DAY).due).toHaveLength(
      1,
    );
    const paused = selectInvitations(data, snoozed, now).deferred[0]!;
    const resumed = changeInvitationControl(
      data,
      snoozed,
      paused,
      "resume",
      now,
    );
    const visible = selectInvitations(data, resumed, now).due[0]!;
    const dismissed = changeInvitationControl(
      data,
      resumed,
      visible,
      "dismiss",
      now,
    );
    expect(selectInvitations(data, dismissed, now + 100 * DAY).due).toEqual([]);
    expect(selectInvitations(data, dismissed, now).deferred[0]!.mode).toBe(
      "dismissed",
    );
    expect(JSON.stringify(data)).toBe(source);
    expect(controls).toEqual(enabled());
  });
  it("lässt eine neue Einladung erst nach neuer belegter Aktivität und ihrem Zeitraum zu", () => {
    const data = initialData();
    data.goals = [goal(40)];
    const dismissed = changeInvitationControl(
      data,
      enabled(),
      selectInvitations(data, enabled(), now).due[0]!,
      "dismiss",
      now,
    );
    const future = now + 2 * DAY;
    data.goals[0]!.steps = [
      {
        id: "new",
        text: "Ein weiterer Versuch",
        done: false,
        createdAt: new Date(future).toISOString(),
        completedAt: null,
      },
    ];
    data.goals[0]!.revision++;
    expect(selectInvitations(data, dismissed, future).due).toEqual([]);
    expect(
      selectInvitations(data, dismissed, future + 21 * DAY).due,
    ).toHaveLength(1);
  });
  it("sperrt veraltete Anzeigen nach einer Text- oder Kontrolländerung", () => {
    const data = initialData();
    data.goals = [goal(40)];
    const controls = enabled(),
      first = selectInvitations(data, controls, now).due[0]!;
    data.goals[0]!.title = "Ein eigener neuer Titel";
    data.goals[0]!.revision++;
    expect(() =>
      changeInvitationControl(data, controls, first, "dismiss", now),
    ).toThrow(/inzwischen verändert/);
    const fresh = selectInvitations(data, controls, now).due[0]!,
      snoozed = changeInvitationControl(data, controls, fresh, "snooze", now);
    expect(() =>
      changeInvitationControl(data, snoozed, fresh, "dismiss", now),
    ).toThrow(/inzwischen verändert/);
  });
  it("erinnert nicht an archivierte oder entfernte Quellen und erfindet keine Markierungsdaten", () => {
    const data = initialData();
    data.goals = [goal(80)];
    const first = selectInvitations(data, enabled(), now).due[0]!;
    data.goals[0]!.archivedAt = ago(2);
    expect(selectInvitations(data, enabled(), now).due).toEqual([]);
    expect(() =>
      changeInvitationControl(data, enabled(), first, "dismiss", now),
    ).toThrow();
    data.goals = [];
    data.highlights = { "JHN:1:4": "olive" };
    expect(selectInvitations(data, enabled(), now).due).toEqual([]);
  });
  it("behält unter globaler Abschaltung frühere Entscheidungen und bietet keine Einladungen an", () => {
    const data = initialData();
    data.goals = [goal(40)];
    const controls = changeInvitationControl(
      data,
      enabled(),
      selectInvitations(data, enabled(), now).due[0]!,
      "snooze",
      now,
    );
    controls.enabled = false;
    expect(selectInvitations(data, controls, now).due).toEqual([]);
    expect(selectInvitations(data, controls, now).deferred).toHaveLength(1);
    expect(() => selectInvitations(data, controls, NaN)).toThrow(/Zeitpunkt/);
  });
  it("verarbeitet beim Opt-out keine privaten Textfingerabdrücke, auch bei einer großen Sammlung", () => {
    const data = initialData(),
      text = "Ein eigener Gedanke. ".repeat(400);
    data.notes = Array.from({ length: 5000 }, (_, i) => ({
      id: `note-${i}`,
      text,
      kind: "note" as const,
      createdAt: ago(50),
      updatedAt: ago(50),
    }));
    const hash = vi.spyOn(fingerprints, "sha256");
    expect(selectInvitations(data, emptyInvitationControls(), now)).toEqual({
      enabled: false,
      due: [],
      deferred: [],
    });
    expect(hash).not.toHaveBeenCalled();
  });
  it("berechnet Fingerabdrücke nur für fällige oder tatsächlich zurückgestellte Quellen", () => {
    const data = initialData();
    data.notes = Array.from({ length: 5000 }, (_, i) => ({
      id: `note-${i}`,
      text: "Ein frischer Gedanke",
      kind: "note" as const,
      createdAt: ago(1),
      updatedAt: ago(1),
    }));
    data.goals = [goal(40)];
    const hash = vi.spyOn(fingerprints, "sha256");
    const first = selectInvitations(data, enabled(), now);
    expect(first.due.map((x) => x.key)).toEqual(["goal:owned"]);
    expect(hash).toHaveBeenCalledTimes(1);
    const controls: InvitationControls = {
      enabled: false,
      snoozed: {},
      dismissed: { "note:note-0": new Date(now).toISOString() },
    };
    hash.mockClear();
    const off = selectInvitations(data, controls, now);
    expect(off.due).toEqual([]);
    expect(off.deferred.map((x) => x.key)).toEqual(["note:note-0"]);
    expect(hash).toHaveBeenCalledTimes(1);
    const resumed = changeInvitationControl(
      data,
      controls,
      off.deferred[0]!,
      "resume",
      now,
    );
    expect(resumed).toEqual(emptyInvitationControls());
  });
  it("berücksichtigt eine gemeinsam verknüpfte Notiz bei jedem betroffenen Vorhaben", () => {
    const data = initialData(),
      other = { ...goal(80), id: "other" };
    data.goals = [goal(80), other];
    data.notes = [
      {
        id: "shared",
        text: "Ein gemeinsamer Bezug",
        kind: "note",
        createdAt: ago(60),
        updatedAt: ago(2),
        goalIds: ["owned", "other"],
      },
    ];
    expect(selectInvitations(data, enabled(), now).due).toEqual([]);
    expect(
      selectInvitations(data, enabled(), now + 19 * DAY).due.map((x) => x.key),
    ).toEqual(["goal:other", "goal:owned"]);
  });
  it("schützt auch Notizen vor einer veralteten Entscheidung nach einer Textkorrektur", () => {
    const data = initialData();
    data.notes = [
      {
        id: "thought",
        text: "Alter Gedanke",
        kind: "reflection",
        createdAt: ago(40),
        updatedAt: ago(40),
      },
    ];
    const first = selectInvitations(data, enabled(), now).due[0]!;
    data.notes[0]!.text = "Korrigierter Gedanke";
    expect(() =>
      changeInvitationControl(data, enabled(), first, "dismiss", now),
    ).toThrow(/inzwischen verändert/);
    expect(selectInvitations(data, enabled(), now).due[0]!.detail).toBe(
      "Korrigierter Gedanke",
    );
  });
  it("zeigt zukünftige Quellen auch mit gespeicherten Pausen nicht verfrüht an", () => {
    const data = initialData();
    data.goals = [goal(-1)];
    const controls: InvitationControls = {
      enabled: true,
      snoozed: { "goal:owned": new Date(now + 14 * DAY).toISOString() },
      dismissed: {},
    };
    expect(selectInvitations(data, controls, now)).toEqual({
      enabled: true,
      due: [],
      deferred: [],
    });
    data.goals = [];
    expect(selectInvitations(data, controls, now + 40 * DAY)).toEqual({
      enabled: true,
      due: [],
      deferred: [],
    });
  });
});
