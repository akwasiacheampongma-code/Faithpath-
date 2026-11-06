import type { AppData } from "../../state/model";
import { finishStep } from "../../state/model";
import { pathById } from "../paths/catalog";
import { canonicalJson } from "../../lib/hash";
import { captureKey, type CaptureSource } from "./capture-schema";
import { newId, type DraftOf } from "./schema";
export const DAILY_QUESTION =
  "Wofür möchtest du heute einen Moment dankbar sein?";
export const EXPERIENCE_QUESTION =
  "Was hast du bewusst im Alltag ausprobiert und erlebt?";
export function dailySource(
  date = new Date(),
): Extract<CaptureSource, { type: "daily" }> {
  return {
    type: "daily",
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    question: DAILY_QUESTION,
  };
}
export function guidedSource(
  pathId: string,
  index: number,
): Extract<CaptureSource, { type: "guided" }> {
  const step = pathById(pathId)?.steps[index];
  if (!step) throw new Error("Dieser Lernschritt ist nicht vorhanden.");
  return {
    type: "guided",
    pathId,
    step: index,
    snapshot: {
      title: step.title,
      question: step.question,
      explanation: step.explanation,
      ref: { ...step.ref },
    },
  };
}
export function captureSourceCurrent(source: CaptureSource) {
  if (source.type !== "guided") return true;
  const step = pathById(source.pathId)?.steps[source.step];
  return (
    !!step &&
    canonicalJson(source) ===
      canonicalJson(guidedSource(source.pathId, source.step))
  );
}
export function captureDraft(source: CaptureSource): DraftOf<"capture"> {
  return {
    id: newId("draft"),
    key: captureKey(source),
    revision: 0,
    type: "capture",
    updatedAt: new Date().toISOString(),
    values: { entityId: newId("note"), text: "", source },
  };
}
// Called inside the same transaction that removes the draft. Draft text alone
// never changes progress or confirms a lived action.
export function commitCapture(
  data: AppData,
  draft: DraftOf<"capture">,
  at: string,
  completeGuided = true,
) {
  const { source, entityId } = draft.values,
    text = draft.values.text.trim();
  if (draft.key !== captureKey(source))
    throw new Error("Entwurf und Quelle passen nicht zusammen.");
  if (text && data.notes.some((n) => n.id === entityId))
    throw new Error("Dieser Gedanke wurde bereits festgehalten.");
  if (source.type === "guided" && completeGuided) {
    if (!captureSourceCurrent(source))
      throw new Error(
        "Die Einordnung hat sich seit deinem Entwurfsbeginn verändert. Bewahre zuerst deine Worte als Reflexion und lies den aktuellen Abschnitt erneut.",
      );
    finishStep(data, `${source.pathId}:${source.step}`);
    data.activePath = source.pathId;
  } else if (!text) throw new Error("Schreibe zuerst deine Worte.");
  if (!text) return "";
  data.notes.unshift({
    id: entityId,
    text,
    kind:
      source.type === "experience"
        ? "action"
        : source.type === "verse"
          ? "note"
          : "reflection",
    createdAt: at,
    updatedAt: at,
    captureSource: JSON.parse(JSON.stringify(source)),
    ...(source.type === "verse"
      ? { ref: { ...source.ref } }
      : source.type === "guided"
        ? { ref: { ...source.snapshot.ref } }
        : {}),
  });
  return entityId;
}
