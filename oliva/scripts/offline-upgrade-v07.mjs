/** Real same-origin, same-profile 0.6 -> 0.7 service-worker upgrade.
 * All seed data and edits go through the real UI. Hydration migrates V5 to V6
 * in memory without rewriting storage; the first explicit review edit persists
 * V6 in the existing private document V1. Historical scripts stay unchanged.
 * Local automated Chromium evidence only: no hosted Site or physical device QA.
 */
import { chromium, expect as baseExpect } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtemp, symlink, rename, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";

const expect = baseExpect.configure({ timeout: 30000 });
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = path.resolve(process.argv[2] ?? "/workspace/oliva-v06-book-control-dist");
const current = path.resolve(process.argv[3] ?? path.join(project, "dist"));
const output = path.join(project, "docs/evidence/session-07");
const source = JSON.stringify(faithpathFixture(), null, 2) + "\n";
const draftText = "Mein offener, unveränderter Gedanke aus OLIVA 0.6.\n  Diese Worte bleiben als Entwurf erhalten.  ";
const originalReviewText = "Mein eigener Rückblick aus OLIVA 0.6: Heute war Raum für eine offene Frage.";
const editedReviewText = "Mein überarbeiteter Rückblick aus OLIVA 0.7: Ich möchte dieser Frage weiter Raum geben.";
const hash = value => createHash("sha256").update(value).digest("hex");
const json = value => JSON.stringify(value);
const result = {
  baseline_version: "0.6.0",
  target_version: "0.7.0",
  synthetic_data: true,
  passed: false,
  physical_device_test: false,
  hosted_qa: false,
  evidence_scope: "Local automated Chromium; one persistent profile and origin throughout the worker update",
  byte_comparison: "Exact UTF-8 JSON serialization of raw IndexedDB values, not database-file bytes",
  phase: "preflight",
};
let temp, server, context, page;

// Read every object store independently of the application's decoder. These
// observations never write, restore, import, or migrate an IndexedDB record.
async function snapshot() {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open("oliva-local-v1", 1);
    open.onupgradeneeded = () => open.transaction?.abort();
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, names = Array.from(db.objectStoreNames).sort();
      const tx = db.transaction(names, "readonly"), stores = {};
      for (const name of names) {
        const store = tx.objectStore(name), keys = store.getAllKeys(), values = store.getAll();
        stores[name] = { keys, values };
      }
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
      tx.oncomplete = () => {
        const records = names.flatMap(name => stores[name].keys.result.map((key, index) => ({
          store: name, key, value: stores[name].values.result[index],
        })));
        const version = db.version;
        db.close();
        resolve({ database: "oliva-local-v1", version, stores: names, records });
      };
    };
  }));
}
const record = (state, key) => state.records.find(item => item.store === "state" && item.key === key)?.value;
const main = state => record(state, "main");
const withoutMain = state => ({ ...state, records: state.records.filter(item => !(item.store === "state" && item.key === "main")) });
const summaries = state => state.records.map(({ store, key, value }) => ({
  store, key, json_utf8_bytes: Buffer.byteLength(json(value)), json_sha256: hash(json(value)),
}));
async function raw() { return main(await snapshot()); }
async function unchanged(expected, message) {
  const actual = await snapshot();
  expect(json(actual), message).toBe(json(expected));
  return actual;
}
async function otherRecordsUnchanged(expected, message) {
  const actual = await snapshot();
  expect(json(withoutMain(actual)), message).toBe(json(withoutMain(expected)));
  return actual;
}
function migratedStoredData(before) {
  return { ...structuredClone(before), version: 6, retainedReviewGrowth: { reflections: 0, actions: 0 } };
}
async function worker() {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    async function inspect(target) {
      if (!target) return null;
      return new Promise(resolve => {
        const channel = new MessageChannel(), timer = setTimeout(() => { channel.port1.close(); resolve(null); }, 1500);
        channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
        target.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
      });
    }
    return {
      expected: document.querySelector('meta[name="oliva-build"]')?.getAttribute("content"),
      controller: await inspect(navigator.serviceWorker.controller),
      active: await inspect(registration?.active), waiting: await inspect(registration?.waiting),
      caches: (await caches.keys()).filter(key => key.startsWith("oliva-")),
    };
  });
}
async function exportedMemoryData() {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Sicherung exportieren", exact: true }).click();
  const file = await (await download).path();
  if (!file) throw new Error("The app's in-memory backup export was not available");
  return JSON.parse(await readFile(file, "utf8"));
}
async function readyTree(stage) {
  const tree = page.getByTestId("olive-tree");
  await tree.scrollIntoViewIfNeeded();
  await expect.poll(() => tree.evaluate(node => { const data = node.olivaTree?.(); return data?.ready ? data.stage : null; })).toBe(stage);
  await expect(tree.locator("img.tree-fallback")).toBeVisible();
}
async function readyJohn() {
  await expect(page.getByTestId("book-sword-artwork")).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId("book-sword-vector")).toHaveCount(0);
  await expect.poll(() => page.getByTestId("book-sword-image").evaluate(node => {
    const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return !!image && image.complete && image.naturalWidth > 0;
  })).toBe(true);
}
async function cachedHash(asset, cacheId) {
  return page.evaluate(async ({ asset, cacheId }) => {
    const response = cacheId ? await (await caches.open(cacheId)).match(asset) : await fetch(asset);
    if (!response?.ok) throw new Error("Cached asset unavailable: " + asset);
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await response.arrayBuffer())))
      .map(byte => byte.toString(16).padStart(2, "0")).join("");
  }, { asset, cacheId });
}

try {
  await mkdir(output, { recursive: true });
  const stages = JSON.parse(await readFile(path.join(project, "src/features/garden/a51/stage-data.json"), "utf8")).stages;
  expect(stages).toHaveLength(7);
  const baselineHtml = await readFile(path.join(baseline, "index.html"), "utf8");
  const originalAsset = [...baselineHtml.matchAll(/<script\b[^>]*src="([^"]+)"/g)]
    .map(match => match[1]).find(asset => asset.startsWith("/") && asset.endsWith(".js") && !existsSync(path.join(current, asset.slice(1))));
  if (!originalAsset) throw new Error("Baseline must contain an old JS chunk absent from the target build to prove old-cache fallback");
  const originalAssetHash = hash(await readFile(path.join(baseline, originalAsset.slice(1))));
  temp = await mkdtemp(path.join(tmpdir(), "oliva-upgrade-v07-"));
  const live = path.join(temp, "live");
  await symlink(baseline, live);
  const port = await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => { const address = probe.address(); probe.close(() => resolve(address.port)); });
  });
  server = spawn(process.execPath, [path.join(project, "scripts/serve.mjs"), live], {
    cwd: project, env: { ...process.env, PORT: String(port) }, stdio: "ignore",
  });
  const base = `http://127.0.0.1:${port}`;
  await expect.poll(async () => { try { return (await fetch(base)).ok; } catch { return false; } }).toBe(true);
  context = await chromium.launchPersistentContext(path.join(temp, "browser-profile"), {
    executablePath: process.env.CHROMIUM_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    viewport: { width: 390, height: 844 }, reducedMotion: "reduce", acceptDownloads: true,
  });
  page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);
  result.browser_version = context.browser()?.version() ?? "unreported";
  result.origin = base;
  result.phase = "baseline-ui-seed";

  await page.goto(base + "/einstellungen");
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.6.0", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await raw())?.data?.name).toBe("Ada");
  await page.goto(base + "/importieren");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "FaithPath-Datei auswählen", exact: true }).click();
  await (await chooser).setFiles({ name: "synthetic-v5.json", mimeType: "application/json", buffer: Buffer.from(source) });
  await page.getByRole("button", { name: "Jetzt sichern und Import übernehmen", exact: true }).click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.goto(base + "/lesen/GEN?chapter=1");
  await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  await expect.poll(async () => (await raw())?.data?.readChapters?.includes("GEN:1")).toBe(true);

  // Imported historical reviews stay in their original archive. Create a real
  // new, owned review on the imported goal through the 0.6 UI before upgrading.
  const seededGoal = (await raw()).data.goals.find(goal => !goal.archivedAt);
  expect(seededGoal).toBeTruthy();
  const goalUrl = base + "/vorhaben/" + encodeURIComponent(seededGoal.id);
  await page.goto(goalUrl);
  await page.getByRole("button", { name: "Freiwilligen Rückblick schreiben", exact: true }).click();
  await page.getByRole("textbox", { name: "Dein freiwilliger Rückblick", exact: true }).fill(originalReviewText);
  await page.getByRole("switch", { name: "Erfahrung im Alltag selbst bestätigen", exact: true }).click();
  await page.getByRole("button", { name: "Rückblick festhalten", exact: true }).click();
  await expect.poll(async () => (await raw()).data.goals.find(goal => goal.id === seededGoal.id)?.reviews.some(review => review.text === originalReviewText)).toBe(true);

  await page.goto(base + "/sammlung");
  await page.getByRole("button", { name: "Einen Gedanken festhalten", exact: true }).click();
  await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill(draftText);
  await expect(page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await raw()).data.drafts.find(draft => draft.type === "journal")?.values.text).toBe(draftText);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await worker()).controller?.version).toBe("0.6.0");

  const beforeRecords = await snapshot(), before = main(beforeRecords);
  const beforeGoal = before.data.goals.find(goal => goal.id === seededGoal.id);
  const beforeReview = beforeGoal.reviews.find(review => review.text === originalReviewText);
  const journal = before.data.drafts.find(draft => draft.type === "journal");
  const archiveKey = "archive:" + before.data.imports[0].sourceHash;
  expect(before.storageVersion).toBe(1);
  expect(before.data.version).toBe(5);
  expect(before.data).not.toHaveProperty("retainedReviewGrowth");
  expect(before.data.notes.length).toBeGreaterThan(0);
  expect(beforeReview.applied).toBe(true);
  expect(beforeReview).not.toHaveProperty("updatedAt");
  expect(journal.values.text).toBe(draftText);
  expect(record(beforeRecords, archiveKey)).toBe(source);
  expect(hash(record(beforeRecords, archiveKey))).toBe(before.data.imports[0].sourceHash);
  expect(before.data.imports[0].sourceText).toBeUndefined();
  expect(record(beforeRecords, "before-faithpath-import")).toBeTruthy();
  expect(record(beforeRecords, "recovery-index")).toBeTruthy();
  const oldWorker = await worker();
  expect(oldWorker.controller.id).toBe(oldWorker.expected);
  expect(oldWorker.caches).toContain(oldWorker.expected);
  expect(await cachedHash(originalAsset, oldWorker.expected)).toBe(originalAssetHash);
  Object.assign(result, {
    baseline_private_storage_version: before.storageVersion, baseline_data_version: before.data.version,
    baseline_build_id: oldWorker.expected, baseline_worker: oldWorker,
    baseline_review_id: beforeReview.id, baseline_goal_revision: beforeGoal.revision,
    baseline_main_json_sha256: hash(json(before)), baseline_records: summaries(beforeRecords),
    original_archive_blob_sha256: hash(source), baseline_cached_asset_sha256: originalAssetHash,
  });

  // Swap only the served filesystem root. The running browser, persistent
  // profile, page, origin, service-worker registration and IndexedDB stay put.
  result.phase = "worker-update-and-read-only-migration";
  await symlink(current, path.join(temp, "next"));
  const updateStartedAt = Date.now();
  await rename(path.join(temp, "next"), live);
  await page.goto(base + "/einstellungen");
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.7.0", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toHaveValue("Ada");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await worker()).controller?.version).toBe("0.7.0");
  const newWorker = await worker();
  expect(newWorker.controller.id).toBe(newWorker.expected);
  expect(newWorker.active.id).toBe(newWorker.expected);
  expect(newWorker.expected).not.toBe(oldWorker.expected);
  expect(newWorker.caches).toContain(oldWorker.expected);
  expect(newWorker.caches).toContain(newWorker.expected);
  await unchanged(beforeRecords, "Opening 0.7 must not rewrite any raw V5, recovery, or archive record");

  // The existing backup button observes the app's in-memory data. It proves
  // the actual decoder has hydrated V6 while raw IndexedDB still holds V5.
  // Export is read-only; no restore, state injection, or migration helper runs.
  const memoryData = await exportedMemoryData();
  const expectedMemory = migratedStoredData(before.data);
  expectedMemory.imports = expectedMemory.imports.map(receipt => ({ ...receipt, sourceText: record(beforeRecords, "archive:" + receipt.sourceHash) }));
  expect(memoryData).toEqual(expectedMemory);
  const afterReadOnly = await unchanged(beforeRecords, "Read-only backup export must leave durable V5 bytes unchanged");
  expect(main(afterReadOnly).data.version).toBe(5);
  await page.goto(goalUrl);
  const reviewCard = page.getByTestId(`review-${beforeReview.id}`);
  await expect(reviewCard.getByText(originalReviewText, { exact: true })).toBeVisible();
  await expect(reviewCard.getByRole("button", { name: "Rückblick bearbeiten", exact: true })).toBeEnabled();
  await unchanged(beforeRecords, "Viewing the hydrated review must not commit the in-memory migration");
  Object.assign(result, {
    new_worker: newWorker, worker_activation_verified: true, same_origin_and_persistent_profile: true,
    old_cache_retained: true, in_memory_data_version_after_hydration: memoryData.version,
    in_memory_v5_to_v6_migration_verified: true, migration_adds_only_version_and_zero_retained_review_growth: true,
    durable_data_version_before_first_user_edit: main(afterReadOnly).data.version,
    durable_v5_main_unchanged_after_hydration: true,
    read_only_main_json_sha256: hash(json(main(afterReadOnly))),
    all_records_unchanged_until_explicit_review_edit: true,
  });

  result.phase = "explicit-review-edit-first-v6-write";
  await reviewCard.getByRole("button", { name: "Rückblick bearbeiten", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true })).toHaveValue(originalReviewText);
  await expect.poll(async () => (await raw()).data.version).toBe(6);
  const openedRecords = await otherRecordsUnchanged(beforeRecords, "First V6 write must preserve every non-main record");
  const opened = main(openedRecords), editDraft = opened.data.drafts.find(draft => draft.type === "review-edit");
  expect(opened.storageVersion).toBe(1);
  expect(editDraft).toBeTruthy();
  expect(editDraft.revision).toBe(1);
  expect(editDraft.values).toEqual({
    goalId: beforeGoal.id, reviewId: beforeReview.id, baseRevision: beforeGoal.revision,
    baseReviewHash: expect.stringMatching(/^[a-f0-9]{64}$/), text: originalReviewText, source: beforeReview.source,
  });
  expect(opened.data).toEqual({
    ...migratedStoredData(before.data), revision: before.data.revision + 1,
    drafts: [...before.data.drafts, editDraft],
  });
  Object.assign(result, {
    first_v6_write_trigger: "Explicit Rückblick bearbeiten creates a review-edit draft",
    first_v6_write_storage_version: opened.storageVersion, first_v6_write_data_version: opened.data.version,
    first_v6_write_main_json_sha256: hash(json(opened)),
    first_v6_write_preserves_existing_reviews_and_journal_draft: true,
    retained_review_growth_after_first_write: opened.data.retainedReviewGrowth,
  });

  await expect(page.getByRole("switch", { name: "Erfahrung im Alltag selbst bestätigen", exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true }).fill(editedReviewText);
  await expect(page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await raw()).data.drafts.find(draft => draft.type === "review-edit")?.values.text).toBe(editedReviewText);
  const draftedRecords = await otherRecordsUnchanged(beforeRecords, "Review draft autosave must preserve every non-main record");
  const drafted = main(draftedRecords), savedEditDraft = drafted.data.drafts.find(draft => draft.type === "review-edit");
  expect(savedEditDraft.values).toEqual({ ...editDraft.values, text: editedReviewText });
  expect(savedEditDraft.id).toBe(editDraft.id);
  expect(savedEditDraft.revision).toBeGreaterThan(editDraft.revision);
  expect(drafted.data.revision).toBeGreaterThan(opened.data.revision);
  expect(drafted.data).toEqual({
    ...migratedStoredData(before.data), revision: drafted.data.revision,
    drafts: [...before.data.drafts, savedEditDraft],
  });
  await page.getByRole("button", { name: "Rückblickänderung speichern", exact: true }).click();
  await expect.poll(async () => (await raw()).data.goals.find(goal => goal.id === beforeGoal.id)?.reviews.find(review => review.id === beforeReview.id)?.text).toBe(editedReviewText);
  const afterRecords = await otherRecordsUnchanged(beforeRecords, "Review text save must preserve every recovery copy and original archive");
  const after = main(afterRecords), afterGoal = after.data.goals.find(goal => goal.id === beforeGoal.id);
  const afterReview = afterGoal.reviews.find(review => review.id === beforeReview.id);
  expect(afterReview).toEqual({ ...beforeReview, text: editedReviewText, updatedAt: expect.any(String) });
  expect(Date.parse(afterReview.updatedAt)).toBeGreaterThanOrEqual(updateStartedAt);
  expect(afterGoal).toEqual({
    ...beforeGoal, revision: beforeGoal.revision + 1, updatedAt: afterReview.updatedAt,
    reviews: beforeGoal.reviews.map(review => review.id === beforeReview.id ? afterReview : review),
  });
  expect(after.data).toEqual({
    ...migratedStoredData(before.data), revision: drafted.data.revision + 1,
    goals: before.data.goals.map(goal => goal.id === beforeGoal.id ? afterGoal : goal),
  });
  expect(after.storageVersion).toBe(1);
  expect(after.data.drafts).toEqual(before.data.drafts);
  expect(after.data.drafts.find(draft => draft.type === "journal")).toEqual(journal);
  Object.assign(result, {
    persisted_data_version_after_explicit_edit: after.data.version, storage_format: after.storageVersion,
    review_edit_saved: true, review_identity_source_created_at_and_applied_preserved: true,
    review_edit_changes_only_text_and_updated_at: true, goal_revision_increased_once: true,
    baseline_goal_revision: beforeGoal.revision, edited_goal_revision: afterGoal.revision,
    growth_and_all_reading_progress_preserved: true, journal_draft_preserved_exactly: true,
    notes_and_other_goals_preserved: true, all_non_main_records_preserved_exactly: true,
    final_main_json_sha256: hash(json(after)), final_records: summaries(afterRecords),
  });

  result.phase = "offline-reload-and-artwork";
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId(`review-${beforeReview.id}`).getByText(editedReviewText, { exact: true })).toBeVisible();
  await page.getByTestId(`review-${beforeReview.id}`).scrollIntoViewIfNeeded();
  await unchanged(afterRecords, "Offline review reload must not write");
  await page.screenshot({ path: path.join(output, "offline-upgrade-review-mobile.png") });
  await page.goto(base + "/einstellungen");
  await expect(page.getByText("OLIVA · lokale Entwicklungsausgabe 0.7.0", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toHaveValue("Ada");
  await unchanged(afterRecords, "Offline settings must retain the final data");
  await page.goto(base + "/sammlung");
  for (const note of before.data.notes) await expect(page.getByText(note.text, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Entwurf fortsetzen", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Deine Worte", exact: true })).toHaveValue(draftText);
  await unchanged(afterRecords, "Resuming the old journal without typing must not rewrite it");
  await page.getByRole("textbox", { name: "Deine Worte", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, "offline-upgrade-journal-draft-mobile.png") });
  await page.goto(goalUrl);
  await expect(page.getByRole("heading", { name: beforeGoal.title, exact: true })).toBeVisible();
  await expect(page.getByTestId(`review-${beforeReview.id}`).getByText(editedReviewText, { exact: true })).toBeVisible();
  await unchanged(afterRecords, "Offline goal and review views must not write");
  await page.goto(base + "/garten");
  for (const stage of stages) {
    await page.getByRole("button", { name: `Stadium ${stage.index + 1} ansehen: ${stage.name}`, exact: true }).click();
    await readyTree(stage.index);
    await unchanged(afterRecords, "A51 stage preview must not change data");
  }
  await page.screenshot({ path: path.join(output, "offline-upgrade-a51-mobile.png") });
  // This is the first 0.7 visit to Johannes, with network already disabled.
  await page.goto(base + "/buch/JHN");
  await expect(page.getByRole("heading", { name: "Johannes", exact: true })).toBeVisible();
  await readyJohn();
  const johnCount = new Set(before.data.readChapters.filter(key => /^JHN:(?:[1-9]|1[0-9]|2[01])$/.test(key))).size;
  await expect(page.getByText(`${johnCount} von 21 Kapiteln gelesen`, { exact: true })).toBeVisible();
  await unchanged(afterRecords, "Offline Johannes artwork must not alter reading progress");
  await page.reload();
  await readyJohn();
  await unchanged(afterRecords, "Offline Johannes reload must not write");
  await page.screenshot({ path: path.join(output, "offline-upgrade-john-mobile.png") });
  await page.getByTestId("book-sword-artwork").screenshot({ path: path.join(output, "offline-upgrade-john-art.png") });

  const oldCacheProof = await page.evaluate(async ({ asset, oldId, newId }) => ({
    old: !!(await (await caches.open(oldId)).match(asset)),
    current: !!(await (await caches.open(newId)).match(asset)),
  }), { asset: originalAsset, oldId: oldWorker.expected, newId: newWorker.expected });
  expect(oldCacheProof.old).toBe(true);
  expect(oldCacheProof.current).toBe(false);
  const cachedOldHash = await cachedHash(originalAsset);
  expect(cachedOldHash).toBe(originalAssetHash);
  const finalRecords = await unchanged(afterRecords, "Final offline assets and old-cache fetch must leave all IDB records exact");
  const finalArchiveHash = hash(record(finalRecords, archiveKey));
  expect(record(finalRecords, archiveKey)).toBe(source);
  expect(finalArchiveHash).toBe(before.data.imports[0].sourceHash);
  const offlineWorker = await worker();
  expect(offlineWorker.controller.id).toBe(newWorker.expected);
  Object.assign(result, {
    passed: true, phase: "complete", profile_preserved: true, name_preserved: true,
    offline_reload_passed: true, offline_review_edit_preserved: true,
    offline_notes_goals_and_old_journal_draft_verified: true,
    offline_a51_stages_verified: stages.length, tree_previews_do_not_write_data: true,
    offline_book_route_verified: true, offline_john_png_decoded: true,
    offline_book_route_reload_passed: true, book_view_does_not_write_data: true,
    original_archive_blob_preserved: true, final_original_archive_blob_sha256: finalArchiveHash,
    unchanged_recovery_copy_and_original_archives: true,
    all_records_unchanged_after_explicit_review_save: true,
    old_cached_asset_verified: true, old_asset_present_in_old_cache: true,
    old_asset_absent_from_new_cache: true, old_cached_asset_path: originalAsset,
    old_cached_asset_sha256: cachedOldHash, current_build_id: newWorker.expected,
    offline_worker: offlineWorker, update_and_offline_check_ms: Date.now() - updateStartedAt,
  });
} catch (error) {
  result.error = String(error);
  if (page) {
    try { result.worker_diagnostic = await worker(); } catch {}
    try { await page.screenshot({ path: path.join(output, "offline-upgrade-failure.png") }); } catch {}
  }
  process.exitCode = 1;
} finally {
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, "offline-upgrade.json"), JSON.stringify({ ...result, checkedAt: new Date().toISOString() }, null, 2) + "\n");
  await context?.close();
  server?.kill();
  if (temp) await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify(result, null, 2));
