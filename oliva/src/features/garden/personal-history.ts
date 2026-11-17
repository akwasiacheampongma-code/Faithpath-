import type { AppData, Note } from "../../state/model";

export type TreeMoment = {
  key: string;
  kind: "thought" | "step" | "review";
  text: string;
  title: string;
  date: string | null;
  updatedAt: string | null;
  imported: boolean;
  dateContext?: "imported-goal";
  goalIds: string[];
  target: { type: "note"; id: string } | { type: "goal"; id: string };
  completed?: boolean;
  applied?: boolean;
};
export type PersonalBranch = {
  goalId: string;
  title: string;
  archived: boolean;
  imported: boolean;
  latest: string | null;
  moments: TreeMoment[];
};
export type TreeSlot = { x: number; y: number };
// Positions refer to the unchanged square A51 artwork. They identify links,
// never achievements. All branches remain in the accompanying accessible list.
const SLOTS: ReadonlyArray<ReadonlyArray<TreeSlot>> = [[], [], [{ x: 50, y: 55 }],
  [{ x: 30, y: 46 }, { x: 67, y: 39 }, { x: 70, y: 58 }],
  [{ x: 29, y: 33 }, { x: 68, y: 32 }, { x: 22, y: 49 }, { x: 75, y: 47 }, { x: 48, y: 23 }],
  [{ x: 29, y: 33 }, { x: 68, y: 32 }, { x: 22, y: 49 }, { x: 75, y: 47 }, { x: 48, y: 23 }],
  [{ x: 29, y: 33 }, { x: 68, y: 32 }, { x: 22, y: 49 }, { x: 75, y: 47 }, { x: 48, y: 23 }]];
const date = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? value : null;
const stamp = (value: string | null) => value === null ? -Infinity : Date.parse(value);
const byKey = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const recent = (a: TreeMoment, b: TreeMoment) => stamp(b.updatedAt ?? b.date) - stamp(a.updatedAt ?? a.date) || byKey(a.key, b.key);

/** Read-only projection. It cannot complete, link, import, restore or grow data. */
export function personalTreeHistory(data: Pick<AppData, "goals" | "notes" | "growthStage">) {
  const goals = new Map(data.goals.map((g) => [g.id, g]));
  const linked = new Map<string, TreeMoment[]>();
  const timeline: TreeMoment[] = [];
  const append = (moment: TreeMoment) => {
    timeline.push(moment);
    for (const id of moment.goalIds) {
      const items = linked.get(id) ?? [];
      items.push(moment); linked.set(id, items);
    }
  };
  for (const note of data.notes) {
    if (!note.text.trim()) continue;
    const ids = [...new Set(note.goalIds ?? [])].filter((id) => goals.has(id));
    append(noteMoment(note, ids));
  }
  for (const goal of data.goals) {
    for (const step of goal.steps) {
      if (!step.text.trim()) continue;
      // Import fallback dates cannot be distinguished from original dates in
      // the live step record. Keep that uncertainty, including for sort order.
      const created = goal.origin ? null : date(step.createdAt);
      const completed = goal.origin ? null : date(step.completedAt);
      append({ key: `step:${goal.id}:${step.id}`, kind: "step", title: goal.title,
        text: step.text, date: created, updatedAt: completed ?? created, imported: false,
        ...(goal.origin ? { dateContext: "imported-goal" as const } : {}),
        goalIds: [goal.id], target: { type: "goal", id: goal.id }, completed: step.done });
    }
    for (const review of goal.reviews) {
      if (!review.text.trim()) continue;
      // FaithPath's old reviews remain in the separate original archive. Live
      // reviews have OLIVA's own schema and retain their historical snapshot.
      append({ key: `review:${goal.id}:${review.id}`, kind: "review", title: review.source.title,
        text: review.text, date: date(review.createdAt), updatedAt: date(review.updatedAt ?? review.createdAt),
        imported: false, goalIds: [goal.id], target: { type: "goal", id: goal.id }, applied: review.applied });
    }
  }
  timeline.sort(recent);
  const branches: PersonalBranch[] = [], unplaced: Array<Pick<PersonalBranch, "goalId" | "title" | "archived" | "imported">> = [];
  for (const goal of data.goals) {
    const moments = (linked.get(goal.id) ?? []).sort(recent);
    const entry = { goalId: goal.id, title: goal.title, archived: !!goal.archivedAt, imported: !!goal.origin };
    if (moments.length) branches.push({ ...entry, latest: moments[0]!.updatedAt ?? moments[0]!.date, moments });
    else unplaced.push(entry);
  }
  branches.sort((a, b) => Number(a.archived) - Number(b.archived) || stamp(b.latest) - stamp(a.latest) || byKey(a.goalId, b.goalId));
  unplaced.sort((a, b) => Number(a.archived) - Number(b.archived) || byKey(a.goalId, b.goalId));
  const slots = Number.isInteger(data.growthStage) ? SLOTS[data.growthStage] ?? [] : [];
  return { branches, unplaced, timeline,
    visible: branches.slice(0, slots.length).map((branch, i) => ({ branch, slot: { ...slots[i]! } })),
    other: branches.slice(slots.length) };
}

function noteMoment(note: Note, goalIds: string[]): TreeMoment {
  const imported = !!note.origin;
  return { key: "note:" + note.id, kind: "thought", text: note.text,
    title: note.captureSource?.type === "guided" ? note.captureSource.snapshot.title
      : note.captureSource?.type === "story" ? note.captureSource.title : "Dein Gedanke",
    date: imported ? null : date(note.createdAt), updatedAt: imported ? null : date(note.updatedAt),
    imported, goalIds, target: { type: "note", id: note.id } };
}

/** Avoid overlapping 44px targets on small artwork; the list retains all links. */
export function personalTreeLinks(model: ReturnType<typeof personalTreeHistory>, size: number, fontScale: number, height = size) {
  if (!Number.isFinite(size) || size < 220 || fontScale > 1.5 || !Number.isFinite(height) || height < 150 && model.visible.length > 1) return [];
  const compact = [{ x: 24, y: 48 }, { x: 76, y: 30 }, { x: 76, y: 66 }];
  const narrow = Math.min(size, height) < 300;
  return model.visible.slice(0, narrow ? 3 : 5).map((entry, i) => ({
    ...entry, slot: narrow && model.visible.length > 1 ? compact[i]! : entry.slot,
    number: i + 1,
  }));
}
