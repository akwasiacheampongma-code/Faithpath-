import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { originalLifeTopics, type OriginalLifeTopic } from "../scripts/import-life-topics.mjs";
import topics from "../src/data/life-topics.json";
import { getPassage } from "../src/features/bible/repository";

describe("FaithPath life-topic originals", () => {
  it("preserves every original title, subtitle, category, icon, context and reflection across all 18/45 entries", () => {
    const source = gunzipSync(readFileSync("content/faithpath-topics/source/content.js.gz"));
    expect(createHash("sha256").update(source).digest("hex")).toBe(topics.sourceFileSha256);
    const parsed = originalLifeTopics(source.toString("utf8"));
    expect(Array.isArray(parsed)).toBe(true);
    const originals = parsed as OriginalLifeTopic[];
    expect(originals).toHaveLength(18);
    expect(topics.topics).toHaveLength(18);
    expect(new Set(topics.topics.map((t) => t.id)).size).toBe(18);
    expect(topics.topics.reduce((n, t) => n + t.steps.length, 0)).toBe(45);
    expect(new Set(topics.topics.map((t) => t.category)).size).toBe(11);
    for (const original of originals) {
      const normalized = topics.topics.find((t) => t.sourceId === original.id)!;
      expect(normalized).toMatchObject({ id: "faithpath-topic-" + original.id, title: original.title,
        subtitle: original.sub, category: original.category, sourceIcon: original.icon });
      expect(normalized.steps).toHaveLength(original.refs.length);
      original.refs.forEach((ref, i) => {
        const step = normalized.steps[i]!;
        expect(step).toMatchObject({ title: ref.label, referenceLabel: ref.label, sourceBook: ref.book,
          explanation: ref.context, question: ref.question });
        expect(getPassage(step.ref)).toHaveLength(ref.to - ref.from + 1);
        expect(getPassage(step.ref)[0]?.n).toBe(ref.from);
        expect(getPassage(step.ref).at(-1)?.n).toBe(ref.to);
        expect(step).not.toHaveProperty("prayer");
      });
      expect(normalized).not.toHaveProperty("minutes");
      expect(normalized).not.toHaveProperty("goals");
    }
  });
  it("rejects executable or duplicate source forms without running original code", () => {
    const bad = [
      'export const LIFE_TOPICS = fetch("https://example.invalid");',
      'export const LIFE_TOPICS = [{...other}];',
      'export const LIFE_TOPICS = [{title: "one", title: "two"}];',
      'export const LIFE_TOPICS = [{["title"]: "one"}];',
      'export const LIFE_TOPICS = [{title(){throw Error("must not run")}}];',
      'export const OTHER_TOPICS = [];',
    ];
    for (const source of bad) expect(() => originalLifeTopics(source)).toThrow();
    expect(originalLifeTopics('export const LIFE_TOPICS = [{ title: "FaithPath", refs: [] }];')).toEqual([{ title: "FaithPath", refs: [] }]);
  });
});
