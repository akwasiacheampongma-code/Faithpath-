import type { AppData } from "../../state/model";
import type { Reference } from "../bible/repository";
import type { z } from "zod";
import type { invitationControlsSchema } from "./schema";
import { canonicalJson, sha256 } from "../../lib/hash";

const DAY = 86400000;
export type InvitationKey = `goal:${string}` | `note:${string}`;
export type InvitationControls = z.infer<typeof invitationControlsSchema>;
export type Invitation = {
  key: InvitationKey;
  kind: "goal" | "note";
  id: string;
  title: string;
  detail: string;
  ref?: Reference;
  at: string;
  due: number;
  stamp: string;
  delayDays: 21 | 35;
};
export type DeferredInvitation = Invitation & {
  mode: "snoozed" | "dismissed";
  until: string | null;
};
type SourceData = Pick<AppData, "goals" | "notes">;

export const emptyInvitationControls = (): InvitationControls => ({
  enabled: false,
  snoozed: {},
  dismissed: {},
});
const time = (value?: string | null) => {
  if (!value) return null;
  const result = Date.parse(value);
  return Number.isFinite(result) ? result : null;
};
function latest(values: (string | null | undefined)[]) {
  let newest: string | undefined,
    newestTime = -Infinity;
  for (const value of values) {
    const at = time(value);
    if (at !== null && at > newestTime) {
      newest = value!;
      newestTime = at;
    }
  }
  return newest;
}

/** Existing committed evidence only. Draft autosaves and corrected review text
 * never become new experiences. Highlights have no timestamps in OLIVA V6;
 * their age is deliberately not invented to manufacture another invitation. */
function* sources(
  data: SourceData,
  now: number,
  eligible?: Set<InvitationKey>,
): Generator<Omit<Invitation, "stamp">> {
  // Each note is inspected once. A note may belong to several goals, but a
  // fresh goal render must not repeatedly scan the entire journal.
  const noteActivity = new Map<string, string>();
  for (const note of data.notes) {
    if (!note.goalIds?.length) continue;
    const at = latest([note.createdAt, note.updatedAt]);
    if (!at) continue;
    for (const goalId of note.goalIds) {
      if (eligible && !eligible.has(`goal:${goalId}`)) continue;
      const previous = noteActivity.get(goalId);
      if (!previous || time(at)! > time(previous)!)
        noteActivity.set(goalId, at);
    }
  }
  for (const goal of data.goals) {
    if (goal.archivedAt || (eligible && !eligible.has(`goal:${goal.id}`)))
      continue;
    const at = latest([
      goal.createdAt,
      ...goal.steps.flatMap((step) => [step.createdAt, step.completedAt]),
      ...goal.reviews.map((review) => review.createdAt),
      noteActivity.get(goal.id),
    ]);
    if (!at || time(at)! > now) continue;
    const step = goal.steps.find((step) => !step.done);
    yield {
      key: `goal:${goal.id}`,
      kind: "goal",
      id: goal.id,
      title: goal.title,
      detail: step
        ? `Du wolltest ausprobieren: „${step.text}“`
        : goal.why || "Ein Vorhaben, dem du Raum gegeben hast.",
      ...(goal.ref ? { ref: { ...goal.ref } } : {}),
      at,
      delayDays: 21,
      due: time(at)! + 21 * DAY,
    };
  }
  for (const note of data.notes) {
    if (note.goalIds?.length || (eligible && !eligible.has(`note:${note.id}`)))
      continue;
    const at = latest([note.createdAt, note.updatedAt]);
    if (!at || time(at)! > now) continue;
    yield {
      key: `note:${note.id}`,
      kind: "note",
      id: note.id,
      title:
        note.kind === "action"
          ? "Eine festgehaltene Erfahrung"
          : note.kind === "reflection"
            ? "Ein Gedanke zum Weiterdenken"
            : "Ein Gedanke aus deiner Sammlung",
      detail: note.text,
      ...(note.ref ? { ref: { ...note.ref } } : {}),
      at,
      delayDays: 35,
      due: time(at)! + 35 * DAY,
    };
  }
}

/** Read-only projection. Time alone does not write data, complete a lesson or
 * describe spiritual development. The global opt-in can silence invitations
 * without discarding the person's existing snooze/dismiss choices. */
export function selectInvitations(
  data: SourceData,
  controls: InvitationControls,
  now = Date.now(),
) {
  if (!Number.isFinite(now)) throw new Error("Ungültiger Zeitpunkt.");
  const due: Invitation[] = [],
    deferred: DeferredInvitation[] = [];
  const controlled = new Set<InvitationKey>([
    ...Object.keys(controls.snoozed),
    ...Object.keys(controls.dismissed),
  ] as InvitationKey[]);
  // Opting out needs no journal projection when there are no previous choices
  // to manage. Paused choices remain manageable while globally disabled.
  if (!controls.enabled && !controlled.size)
    return { enabled: false, due, deferred };
  const revisions = new Map(data.goals.map((goal) => [goal.id, goal.revision]));
  for (const source of sources(
    data,
    now,
    controls.enabled ? undefined : controlled,
  )) {
    const dismissed = controls.dismissed[source.key],
      snoozed = controls.snoozed[source.key];
    const sourceAt = time(source.at)!;
    const isDismissed = (time(dismissed) ?? -Infinity) >= sourceAt;
    const until = time(snoozed);
    const effectiveDue =
      until !== null && until > sourceAt ? until : source.due;
    const isSnoozed = until !== null && until > now;
    if (!isDismissed && !isSnoozed && (!controls.enabled || effectiveDue > now))
      continue;
    // Include the actual source content and controls, so a stale view cannot
    // dismiss a newer source or overwrite a newer choice in the same session.
    // Only visible due/deferred sources need this potentially large text hash.
    const stamp = sha256(
      canonicalJson({
        source,
        goalRevision: source.kind === "goal" ? revisions.get(source.id)! : null,
        snoozed: snoozed ?? null,
        dismissed: dismissed ?? null,
      }),
    );
    const invitation: Invitation = {
      ...source,
      due: isDismissed ? source.due : effectiveDue,
      stamp,
    };
    if (isDismissed) {
      deferred.push({ ...invitation, mode: "dismissed", until: null });
      continue;
    }
    if (isSnoozed) {
      deferred.push({ ...invitation, mode: "snoozed", until: snoozed! });
      continue;
    }
    due.push(invitation);
  }
  const order = (a: Invitation, b: Invitation) =>
    a.due - b.due || a.key.localeCompare(b.key);
  return {
    enabled: controls.enabled,
    due: due.sort(order),
    deferred: deferred.sort(order),
  };
}

/** Return only changed control metadata; callers must persist atomically with
 * their normal revision guard and growth disabled. No source is modified. */
export function changeInvitationControl(
  data: SourceData,
  controls: InvitationControls,
  expected: Pick<Invitation, "key" | "stamp">,
  action: "snooze" | "dismiss" | "resume",
  now = Date.now(),
): InvitationControls {
  const projection = selectInvitations(data, controls, now);
  const current = (
    action === "resume" ? projection.deferred : projection.due
  ).find((invitation) => invitation.key === expected.key);
  if (!current || current.stamp !== expected.stamp)
    throw new Error(
      "Diese Einladung hat sich inzwischen verändert. Öffne sie bitte erneut.",
    );
  const next = {
    enabled: controls.enabled,
    snoozed: { ...controls.snoozed },
    dismissed: { ...controls.dismissed },
  };
  if (action === "snooze") {
    next.snoozed[current.key] = new Date(now + 14 * DAY).toISOString();
    delete next.dismissed[current.key];
  } else if (action === "dismiss") {
    next.dismissed[current.key] = new Date(now).toISOString();
    delete next.snoozed[current.key];
  } else {
    delete next.snoozed[current.key];
    delete next.dismissed[current.key];
  }
  return next;
}
