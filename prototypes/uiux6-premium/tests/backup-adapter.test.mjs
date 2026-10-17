import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
await import("../model.js");
const M = globalThis.PremiumModel;
const c = { window: {} };
vm.runInNewContext(
  fs.readFileSync(new URL("../content.js", import.meta.url), "utf8"),
  c,
);
const C = c.window.PremiumContent;
try {
  await import("../backup-adapter.js");
} catch {}
const A = globalThis.PremiumBackup || {};
test("valid synthetic snapshot is accepted against actual renderer capabilities", () => {
  assert.equal(typeof A.check, "function");
  assert.equal(A.check(JSON.stringify(M.makeBackup(M.initial())), C).ok, true);
});
test("canonical but unavailable reading chapter is rejected before preview", () => {
  const b = M.makeBackup(M.initial());
  b.data.reader.book = "GEN";
  b.data.reader.chapter = 50;
  assert.equal(A.check(JSON.stringify(b), C).ok, false);
});
test("unknown quiz and out-of-range question indices cannot enter renderer state", () => {
  for (const quiz of [
    { unitId: "unknown", index: 0, answers: {}, complete: false },
    { unitId: "chapter:JHN:15", index: 99, answers: {}, complete: false },
  ]) {
    const b = M.makeBackup(M.initial());
    b.data.quiz = quiz;
    assert.equal(A.check(JSON.stringify(b), C).ok, false);
  }
});
