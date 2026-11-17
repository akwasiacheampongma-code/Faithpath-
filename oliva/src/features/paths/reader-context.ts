import type { Reference } from "../bible/repository";
import { pathById } from "./catalog";

/** A route may bind a guided step only to its complete, exact reading range. */
export function guidedReadingContext(ref: Reference, pathId?: string, index?: string) {
  if (!pathId || index === undefined || !/^(0|[1-9]\d*)$/.test(index)) return null;
  const path = pathById(pathId), step = path?.steps[Number(index)];
  if (!path || !step || step.ref.book !== ref.book || step.ref.chapter !== ref.chapter ||
      step.ref.from !== ref.from || step.ref.to !== ref.to) return null;
  return { path, step, key: `${path.id}:${index}` };
}
