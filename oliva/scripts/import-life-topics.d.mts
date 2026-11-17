export type OriginalLifeTopic = {
  id: string; title: string; sub: string; icon: string; category: string;
  refs: Array<{ book: string; chapter: number; from: number; to: number;
    label: string; context: string; question: string }>;
};
export type NormalizedLifeTopics = {
  sourceCommit: string; sourceFileSha256: string;
  topics: Array<{ id: string; sourceId: string; title: string; subtitle: string;
    sourceIcon: string; category: string;
    steps: Array<{ title: string; referenceLabel: string; sourceBook: string;
      ref: { book: string; chapter: number; from: number; to: number };
      explanation: string; question: string }> }>;
};
export function originalLifeTopics(source: string): unknown;
export function normalizeLifeTopics(original: unknown, corpus: Record<string, Record<string, Array<{ n: number; text: string }>>>, snapshot: string, sourceHash: string): NormalizedLifeTopics;
export function main(check?: boolean): Promise<void>;
