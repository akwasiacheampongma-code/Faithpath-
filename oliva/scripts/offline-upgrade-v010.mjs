/** Real same-origin, same-profile 0.9 -> 0.10 service-worker upgrade.
 * Seed data goes through the real 0.9 UI. Read-only hydration to RAM V7 must
 * leave every raw V6/recovery/archive record exact. An explicit invitation
 * opt-in alone commits V7; all earlier fields and raw archives must survive.
 * Historical upgrade scripts and their evidence stay unchanged.
 * Local automated Chromium evidence only: no hosted Site or physical device QA.
 */
import { chromium, expect as baseExpect } from "@playwright/test";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  symlink,
  rename,
  rm,
  writeFile,
  mkdir,
  readFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";

const expect = baseExpect.configure({ timeout: 30000 });
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const baseline = path.resolve(
  process.argv[2] ?? "/workspace/oliva-v09-book-gallery-control-dist",
);
const current = path.resolve(process.argv[3] ?? path.join(project, "dist"));
const output = process.env.OLIVA_EVIDENCE_DIR
  ? path.resolve(process.env.OLIVA_EVIDENCE_DIR)
  : path.join(project, "docs/evidence/invitations/upgrade");
const source = JSON.stringify(faithpathFixture(), null, 2) + "\n";
const draftText =
  "Mein offener, unveränderter Gedanke aus OLIVA 0.9.\n  Diese Worte bleiben als Entwurf erhalten.  ";
const reviewDraftText =
  "Mein offener Rückblickentwurf aus OLIVA 0.9.\n  Diese Bearbeitung bleibt unverändert.  ";
const originalReviewText =
  "Mein eigener Rückblick aus OLIVA 0.9: Heute war Raum für eine offene Frage.";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
const result = {
  baseline_version: "0.9.0",
  target_version: "0.10.0",
  synthetic_data: true,
  passed: false,
  physical_device_test: false,
  hosted_qa: false,
  evidence_scope:
    "Local automated Chromium; one persistent profile and origin throughout the worker update",
  byte_comparison:
    "Exact UTF-8 JSON serialization of raw IndexedDB values, not database-file bytes",
  phase: "preflight",
};
let temp, server, context, page;

// Read every object store independently of the application's decoder. These
// observations never write, restore, import, or migrate an IndexedDB record.
async function snapshot() {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("oliva-local-v1", 1);
        open.onupgradeneeded = () => open.transaction?.abort();
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result,
            names = Array.from(db.objectStoreNames).sort();
          const tx = db.transaction(names, "readonly"),
            stores = {};
          for (const name of names) {
            const store = tx.objectStore(name),
              keys = store.getAllKeys(),
              values = store.getAll();
            stores[name] = { keys, values };
          }
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error);
          };
          tx.oncomplete = () => {
            const records = names.flatMap((name) =>
              stores[name].keys.result.map((key, index) => ({
                store: name,
                key,
                value: stores[name].values.result[index],
              })),
            );
            const version = db.version;
            db.close();
            resolve({
              database: "oliva-local-v1",
              version,
              stores: names,
              records,
            });
          };
        };
      }),
  );
}
const record = (state, key) =>
  state.records.find((item) => item.store === "state" && item.key === key)
    ?.value;
const main = (state) => record(state, "main");
const summaries = (state) =>
  state.records.map(({ store, key, value }) => ({
    store,
    key,
    json_utf8_bytes: Buffer.byteLength(json(value)),
    json_sha256: hash(json(value)),
  }));
async function raw() {
  return main(await snapshot());
}
async function unchanged(expected, message) {
  const actual = await snapshot();
  expect(json(actual), message).toBe(json(expected));
  return actual;
}
async function worker() {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    async function inspect(target) {
      if (!target) return null;
      return new Promise((resolve) => {
        const channel = new MessageChannel(),
          timer = setTimeout(() => {
            channel.port1.close();
            resolve(null);
          }, 1500);
        channel.port1.onmessage = (event) => {
          clearTimeout(timer);
          channel.port1.close();
          resolve(event.data);
        };
        target.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
      });
    }
    return {
      expected: document
        .querySelector('meta[name="oliva-build"]')
        ?.getAttribute("content"),
      controller: await inspect(navigator.serviceWorker.controller),
      active: await inspect(registration?.active),
      waiting: await inspect(registration?.waiting),
      caches: (await caches.keys()).filter((key) => key.startsWith("oliva-")),
    };
  });
}
async function cachedHash(asset, cacheId) {
  return page.evaluate(
    async ({ asset, cacheId }) => {
      const response = cacheId
        ? await (await caches.open(cacheId)).match(asset)
        : await fetch(asset);
      if (!response?.ok) throw new Error("Cached asset unavailable: " + asset);
      return Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await response.arrayBuffer()),
        ),
      )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    },
    { asset, cacheId },
  );
}

try {
  await mkdir(output, { recursive: true });
  const baselineHtml = await readFile(
    path.join(baseline, "index.html"),
    "utf8",
  );
  const originalAsset = [
    ...baselineHtml.matchAll(/<script\b[^>]*src="([^"]+)"/g),
  ]
    .map((match) => match[1])
    .find(
      (asset) =>
        asset.startsWith("/") &&
        asset.endsWith(".js") &&
        !existsSync(path.join(current, asset.slice(1))),
    );
  if (!originalAsset)
    throw new Error(
      "Baseline must contain an old JS chunk absent from the target build to prove old-cache fallback",
    );
  const originalAssetHash = hash(
    await readFile(path.join(baseline, originalAsset.slice(1))),
  );
  temp = await mkdtemp(path.join(tmpdir(), "oliva-upgrade-v010-"));
  const live = path.join(temp, "live");
  await symlink(baseline, live);
  const port = await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
  server = spawn(
    process.execPath,
    [path.join(project, "scripts/serve.mjs"), live],
    {
      cwd: project,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
    },
  );
  const base = `http://127.0.0.1:${port}`;
  await expect
    .poll(async () => {
      try {
        return (await fetch(base)).ok;
      } catch {
        return false;
      }
    })
    .toBe(true);
  context = await chromium.launchPersistentContext(
    path.join(temp, "browser-profile"),
    {
      executablePath:
        process.env.CHROMIUM_PATH ??
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    },
  );
  page = context.pages()[0] ?? (await context.newPage());
  page.setDefaultTimeout(30000);
  result.browser_version = context.browser()?.version() ?? "unreported";
  result.origin = base;
  result.phase = "baseline-ui-seed";

  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.9.0", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Ada");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await raw())?.data?.name).toBe("Ada");
  await page.goto(base + "/importieren");
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-v5.json",
    mimeType: "application/json",
    buffer: Buffer.from(source),
  });
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.goto(base + "/lesen/GEN?chapter=1");
  await page
    .getByRole("button", {
      name: "Kapitel als gelesen bestätigen",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await raw())?.data?.readChapters?.includes("GEN:1"))
    .toBe(true);

  // Imported historical reviews stay in their original archive. Create a real
  // new, owned review on the imported goal through the 0.9 UI before upgrading.
  const seededGoal = (await raw()).data.goals.find((goal) => !goal.archivedAt);
  expect(seededGoal).toBeTruthy();
  const goalUrl = base + "/vorhaben/" + encodeURIComponent(seededGoal.id);
  await page.goto(goalUrl);
  await page
    .getByRole("button", {
      name: "Freiwilligen Rückblick schreiben",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Dein freiwilliger Rückblick", exact: true })
    .fill(originalReviewText);
  await page
    .getByRole("switch", {
      name: "Erfahrung im Alltag selbst bestätigen",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Rückblick festhalten", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await raw()).data.goals
        .find((goal) => goal.id === seededGoal.id)
        ?.reviews.some((review) => review.text === originalReviewText),
    )
    .toBe(true);

  await page.goto(base + "/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill(draftText);
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await raw()).data.drafts.find((draft) => draft.type === "journal")
          ?.values.text,
    )
    .toBe(draftText);
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await worker()).controller?.version)
    .toBe("0.9.0");

  // Preserve a second, independently autosaved draft through a real 0.9 edit.
  await page.goto(goalUrl);
  const seedReview = (await raw()).data.goals
    .find((g) => g.id === seededGoal.id)
    .reviews.find((r) => r.text === originalReviewText);
  await page
    .getByTestId(`review-${seedReview.id}`)
    .getByRole("button", { name: "Rückblick bearbeiten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true })
    .fill(reviewDraftText);
  await expect
    .poll(
      async () =>
        (await raw()).data.drafts.find((d) => d.type === "review-edit")?.values
          .text,
    )
    .toBe(reviewDraftText);
  await page
    .getByRole("button", {
      name: "Editor schließen und Entwurf behalten",
      exact: true,
    })
    .click();

  // Select Romans through the real predecessor reader, then leave the reader
  // before the raw baseline snapshot. The new Home portrait must be read-only.
  await page.goto(base + "/lesen/ROM?chapter=5&from=1&to=1");
  await expect(page.getByRole("button", { name: /^Vers 1:/ })).toBeVisible();
  await expect
    .poll(async () => (await raw()).data.reading)
    .toEqual({ book: "ROM", chapter: 5, from: 1, to: 1 });
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");

  const beforeRecords = await snapshot(),
    before = main(beforeRecords);
  const beforeGoal = before.data.goals.find(
    (goal) => goal.id === seededGoal.id,
  );
  const beforeReview = beforeGoal.reviews.find(
    (review) => review.text === originalReviewText,
  );
  const journal = before.data.drafts.find((draft) => draft.type === "journal");
  const archiveKey = "archive:" + before.data.imports[0].sourceHash;
  expect(before.storageVersion).toBe(1);
  expect(before.data.version).toBe(6);
  expect(before.data.retainedReviewGrowth).toEqual({
    reflections: 0,
    actions: 0,
  });
  expect(before.data.notes.length).toBeGreaterThan(0);
  expect(beforeReview.applied).toBe(true);
  expect(beforeReview).not.toHaveProperty("updatedAt");
  expect(journal.values.text).toBe(draftText);
  const reviewDraft = before.data.drafts.find((d) => d.type === "review-edit");
  expect(reviewDraft.values.text).toBe(reviewDraftText);
  expect(before.data).not.toHaveProperty("invitations");
  expect(record(beforeRecords, archiveKey)).toBe(source);
  expect(hash(record(beforeRecords, archiveKey))).toBe(
    before.data.imports[0].sourceHash,
  );
  expect(before.data.imports[0].sourceText).toBeUndefined();
  expect(record(beforeRecords, "before-faithpath-import")).toBeTruthy();
  expect(record(beforeRecords, "recovery-index")).toBeTruthy();
  const oldWorker = await worker();
  expect(oldWorker.controller.id).toBe(oldWorker.expected);
  expect(oldWorker.caches).toContain(oldWorker.expected);
  expect(await cachedHash(originalAsset, oldWorker.expected)).toBe(
    originalAssetHash,
  );
  Object.assign(result, {
    baseline_private_storage_version: before.storageVersion,
    baseline_data_version: before.data.version,
    baseline_build_id: oldWorker.expected,
    baseline_worker: oldWorker,
    baseline_review_id: beforeReview.id,
    baseline_goal_revision: beforeGoal.revision,
    baseline_main_json_sha256: hash(json(before)),
    baseline_records: summaries(beforeRecords),
    original_archive_blob_sha256: hash(source),
    baseline_cached_asset_sha256: originalAssetHash,
  });

  // Swap only the served filesystem root. The running browser, persistent
  // profile, page, origin, service-worker registration and IndexedDB stay put.
  result.phase = "worker-update-and-read-only-hydration";
  await symlink(current, path.join(temp, "next"));
  const updateStartedAt = Date.now();
  await rename(path.join(temp, "next"), live);
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.10.0", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await worker()).controller?.version)
    .toBe("0.10.0");
  const newWorker = await worker();
  expect(newWorker.controller.id).toBe(newWorker.expected);
  expect(newWorker.active.id).toBe(newWorker.expected);
  expect(newWorker.expected).not.toBe(oldWorker.expected);
  expect(newWorker.caches).toContain(oldWorker.expected);
  expect(newWorker.caches).toContain(newWorker.expected);
  await unchanged(
    beforeRecords,
    "Opening 0.10 must not rewrite raw V6, recovery, or archive records",
  );
  await page.goto(goalUrl);
  const reviewCard = page.getByTestId(`review-${beforeReview.id}`);
  await expect(
    reviewCard.getByText(originalReviewText, { exact: true }),
  ).toBeVisible();
  await expect(
    reviewCard.getByRole("button", {
      name: "Rückblick bearbeiten",
      exact: true,
    }),
  ).toBeVisible();
  await unchanged(
    beforeRecords,
    "Viewing a pre-existing review after update must not write",
  );
  Object.assign(result, {
    new_worker: newWorker,
    worker_activation_verified: true,
    same_origin_and_persistent_profile: true,
    old_cache_retained: true,
    data_version_before_hydration: 6,
    durable_data_version_after_hydration: 6,
    ram_migration: "V6 -> V7 with invitations disabled, no durable write",
    private_storage_version_before_and_after: 1,
    migration_committed_only_by_explicit_action: true,
    durable_v6_main_unchanged_after_hydration: true,
    all_raw_records_unchanged_after_update: true,
  });

  result.phase = "read-only-invitation-opt-out";
  await page.goto(base + "/einladungen");
  await expect(
    page.getByRole("heading", { name: "Was dir wichtig bleibt.", exact: true }),
  ).toBeVisible();
  const invitationSwitch = () =>
    page.getByRole("switch", {
      name: "Einladungen in der App erlauben",
      exact: true,
    });
  await expect(invitationSwitch()).not.toBeChecked();
  await expect(page.getByTestId("due-invitations")).toHaveCount(0);
  await unchanged(
    beforeRecords,
    "Default-disabled invitation screen must not persist RAM migration or any other value",
  );
  await page.reload();
  await expect(invitationSwitch()).not.toBeChecked();
  await unchanged(
    beforeRecords,
    "Reloading 0.10 with invitations disabled must keep every raw V6/recovery/archive value exact",
  );
  await page.screenshot({
    path: path.join(output, "read-only-v6-invitations-opt-out.png"),
  });
  Object.assign(result, {
    default_opt_out_visible: true,
    all_raw_records_exact_before_explicit_opt_in: true,
    durable_v6_survives_read_only_invitation_reload: true,
  });

  // Only this deliberate UI action is allowed to commit the in-memory V7 shape.
  result.phase = "explicit-invitation-opt-in";
  await invitationSwitch().click();
  await expect(invitationSwitch()).toBeChecked();
  await expect
    .poll(async () => (await raw()).data.invitations?.enabled)
    .toBe(true);
  const afterOptInRecords = await snapshot(),
    afterOptIn = main(afterOptInRecords);
  expect(afterOptIn.storageVersion).toBe(before.storageVersion);
  expect(afterOptIn.data.version).toBe(7);
  expect(afterOptIn.data.revision).toBe(before.data.revision + 1);
  expect(afterOptIn.data.invitations).toEqual({
    enabled: true,
    snoozed: {},
    dismissed: {},
  });
  expect(Object.keys(afterOptIn).sort()).toEqual(Object.keys(before).sort());
  expect(Object.keys(afterOptIn.data).sort()).toEqual(
    [...Object.keys(before.data), "invitations"].sort(),
  );
  const preservedFields = [];
  for (const [key, value] of Object.entries(before.data)) {
    if (key === "version" || key === "revision") continue;
    expect(
      json(afterOptIn.data[key]),
      `Opt-in must preserve the exact raw V6 field ${key}`,
    ).toBe(json(value));
    preservedFields.push({
      field: key,
      json_sha256: hash(json(value)),
      json_utf8_bytes: Buffer.byteLength(json(value)),
    });
  }
  for (const item of beforeRecords.records) {
    if (item.store === "state" && item.key === "main") continue;
    const after = afterOptInRecords.records.find(
      (r) => r.store === item.store && r.key === item.key,
    );
    expect(
      json(after),
      `Explicit opt-in must preserve raw record ${String(item.key)}`,
    ).toBe(json(item));
  }
  expect(afterOptInRecords.records.map((r) => [r.store, r.key])).toEqual(
    beforeRecords.records.map((r) => [r.store, r.key]),
  );
  expect(record(afterOptInRecords, archiveKey)).toBe(source);
  expect(afterOptIn.data.growthStage).toBe(before.data.growthStage);
  await page.screenshot({
    path: path.join(output, "explicit-v7-invitations-opt-in.png"),
  });
  Object.assign(result, {
    explicit_opt_in_committed_v7: true,
    revision_increment: 1,
    only_changed_or_added_data_fields: ["version", "revision", "invitations"],
    all_previous_v6_fields_preserved: preservedFields,
    recovery_and_archives_exact_after_opt_in: true,
    growth_unchanged_by_opt_in: true,
    after_opt_in_main_json_sha256: hash(json(afterOptIn)),
    after_opt_in_records: summaries(afterOptInRecords),
  });

  result.phase = "offline-invitation-and-original-data-reload";
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Was dir wichtig bleibt.", exact: true }),
  ).toBeVisible();
  await expect(invitationSwitch()).toBeChecked();
  await expect(page.getByTestId("due-invitations")).toBeVisible();
  await unchanged(
    afterOptInRecords,
    "Offline invitation reload must not write or change controls",
  );
  await page.screenshot({
    path: path.join(output, "offline-v7-invitations-reload.png"),
  });

  await page.goto(base + "/sammlung");
  for (const note of before.data.notes)
    await expect(
      page.getByText(note.text, { exact: true }).first(),
    ).toBeVisible();
  await page
    .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue(draftText);
  await unchanged(
    afterOptInRecords,
    "Offline journal draft resume must preserve all V7 records exactly",
  );
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(output, "offline-journal-draft-preserved.png"),
  });

  await page.goto(goalUrl);
  await expect(
    page
      .getByTestId(`review-${beforeReview.id}`)
      .getByText(originalReviewText, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Diesen Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(reviewDraftText);
  await unchanged(
    afterOptInRecords,
    "Offline review and review-edit draft must retain original timestamps, snapshots and words",
  );
  await page
    .getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(output, "offline-review-edit-draft-preserved.png"),
  });

  await page.goto(base + "/einladungen");
  await expect(invitationSwitch()).toBeChecked();
  const oldCacheProof = await page.evaluate(
    async ({ asset, oldId, newId }) => ({
      old: !!(await (await caches.open(oldId)).match(asset)),
      current: !!(await (await caches.open(newId)).match(asset)),
    }),
    {
      asset: originalAsset,
      oldId: oldWorker.expected,
      newId: newWorker.expected,
    },
  );
  expect(oldCacheProof.old).toBe(true);
  expect(oldCacheProof.current).toBe(false);
  const cachedOldHash = await cachedHash(originalAsset);
  expect(cachedOldHash).toBe(originalAssetHash);
  const finalRecords = await unchanged(
    afterOptInRecords,
    "Final offline invitation/old-cache check must leave all records exact",
  );
  const finalArchiveHash = hash(record(finalRecords, archiveKey));
  expect(record(finalRecords, archiveKey)).toBe(source);
  expect(finalArchiveHash).toBe(before.data.imports[0].sourceHash);
  const offlineWorker = await worker();
  expect(offlineWorker.controller.id).toBe(newWorker.expected);
  Object.assign(result, {
    passed: true,
    phase: "complete",
    profile_preserved: true,
    name_preserved: true,
    offline_reload_passed: true,
    offline_new_invitation_route_verified: true,
    explicit_opt_in_controls_survive_offline_reload: true,
    pre_existing_review_preserved: true,
    offline_notes_goals_journal_and_review_edit_draft_verified: true,
    original_archive_blob_preserved: true,
    original_untyped_faithpath_fields_retained_in_exact_archive: true,
    final_original_archive_blob_sha256: finalArchiveHash,
    unchanged_recovery_copy_and_original_archives: true,
    all_records_unchanged_after_explicit_opt_in: true,
    final_main_json_sha256: hash(json(main(finalRecords))),
    final_records: summaries(finalRecords),
    old_cached_asset_verified: true,
    old_asset_present_in_old_cache: true,
    old_asset_absent_from_new_cache: true,
    old_cached_asset_path: originalAsset,
    old_cached_asset_sha256: cachedOldHash,
    current_build_id: newWorker.expected,
    offline_worker: offlineWorker,
    update_and_offline_check_ms: Date.now() - updateStartedAt,
  });
} catch (error) {
  result.error = String(error);
  if (page) {
    try {
      result.worker_diagnostic = await worker();
    } catch {}
    try {
      await page.screenshot({
        path: path.join(output, "offline-upgrade-failure.png"),
      });
    } catch {}
  }
  process.exitCode = 1;
} finally {
  await mkdir(output, { recursive: true });
  await writeFile(
    path.join(output, "offline-upgrade.json"),
    JSON.stringify(
      { ...result, checkedAt: new Date().toISOString() },
      null,
      2,
    ) + "\n",
  );
  await context?.close();
  server?.kill();
  if (temp) await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify(result, null, 2));
