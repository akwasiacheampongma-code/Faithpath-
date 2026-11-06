import { create } from "zustand";
import type { Draft } from "./schema";
import { canonicalJson } from "../../lib/hash";
export type VolatileDraft = {
  draft: Draft;
  savedBytes: string;
  owner: string;
  reason: "pending" | "error";
};
export const useVolatileDrafts = create<{
  items: Record<string, VolatileDraft>;
  settled: Record<string, true>;
}>(() => ({ items: {}, settled: {} }));
export function settleDraft(id: string) {
  useVolatileDrafts.setState((s) => ({
    settled: { ...s.settled, [id]: true },
  }));
}
export function holdDraft(entry: VolatileDraft, claim = false) {
  useVolatileDrafts.setState((state) => {
    const current = state.items[entry.draft.key];
    if (current && current.owner !== entry.owner && !claim) return state;
    return { items: { ...state.items, [entry.draft.key]: entry } };
  });
}
export function releaseDraft(key: string, owner: string) {
  useVolatileDrafts.setState((state) => {
    if (state.items[key]?.owner !== owner) return state;
    const items = { ...state.items };
    delete items[key];
    return { items };
  });
}
export function acknowledgeDrafts(drafts: Draft[]) {
  for (const item of Object.values(useVolatileDrafts.getState().items)) {
    const saved = drafts.find(
      (d) => d.key === item.draft.key && d.id === item.draft.id,
    );
    if (
      saved &&
      canonicalJson(saved.values) === canonicalJson(item.draft.values)
    )
      releaseDraft(item.draft.key, item.owner);
  }
}
export function volatileExport() {
  return {
    app: "OLIVA-Uncommitted",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    drafts: Object.values(useVolatileDrafts.getState().items).map(
      ({ draft, reason }) => ({ draft, reason }),
    ),
  };
}
