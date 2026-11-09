/** Real same-origin, same-profile 0.10 -> 0.11 service-worker upgrade.
 * Seed data goes through the real 0.10 UI. The update, story artwork, tree
 * previews and book artwork must leave every raw V7/recovery/archive record
 * exact. Historical upgrade scripts and their evidence stay unchanged.
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
  process.argv[2] ?? "/workspace/oliva-v010-invitations-control-dist",
);
const current = path.resolve(process.argv[3] ?? path.join(project, "dist"));
const output = process.env.OLIVA_EVIDENCE_DIR
  ? path.resolve(process.env.OLIVA_EVIDENCE_DIR)
  : path.join(project, "docs/evidence/reader-flow/upgrade");
const source = JSON.stringify(faithpathFixture(), null, 2) + "\n";
const draftText =
  "Mein offener, unveränderter Gedanke aus OLIVA 0.10.\n  Diese Worte bleiben als Entwurf erhalten.  ";
const reviewDraftText =
  "Mein offener Rückblickentwurf aus OLIVA 0.10.\n  Diese Bearbeitung bleibt unverändert.  ";
const originalReviewText =
  "Mein eigener Rückblick aus OLIVA 0.10: Heute war Raum für eine offene Frage.";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
const result = {
  baseline_version: "0.10.0",
  target_version: "0.11.0",
  synthetic_data: true,
  passed: false,
  physical_device_test: false,
  hosted_qa: false,
  evidence_scope:
    "Local automated Chromium; one persistent profile and origin throughout the worker update",
  byte_comparison:
    "Exact UTF-8 JSON serialization of raw IndexedDB values, not database-file bytes",
  phase: "preflight",
  phases: [],
};
let temp, server, context, page;
function enterPhase(name) {
  result.phase = name;
  result.phases.push({ name, startedAt: new Date().toISOString() });
  console.log(`Upgrade phase: ${name}`);
}

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
  // Observe beyond the reader's measurement and persistence debounces so a
  // late unintended write cannot be hidden by an immediate equality check.
  await page.waitForTimeout(1000);
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
async function readyTree(stage) {
  const tree = page.getByTestId("olive-tree");
  await tree.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      tree.evaluate((node) => {
        const data = node.olivaTree?.();
        return data?.ready ? data.stage : null;
      }),
    )
    .toBe(stage);
  await expect(tree.locator("img.tree-fallback")).toBeVisible();
}
async function readyJohn() {
  await expect(page.getByTestId("book-sword-artwork")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(page.getByTestId("book-sword-vector")).toHaveCount(0);
  await expect
    .poll(() =>
      page.getByTestId("book-sword-image").evaluate((node) => {
        const image =
          node instanceof HTMLImageElement ? node : node.querySelector("img");
        return !!image && image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
}
// Read fragment geometry without focus, click or scroll on the target verse.
async function verse120Observation() {
  return page.getByRole("button", { name: /^Vers 120:/ }).evaluate((node) => {
    const main = node.closest('[role="main"]'), bounds = main?.getBoundingClientRect();
    const fragment = Array.from(node.getClientRects()).find((rect) => rect.width > 0 && rect.height > 0);
    return { fragment: fragment ? { top: fragment.top, bottom: fragment.bottom, left: fragment.left, right: fragment.right } : null,
      viewport: bounds ? { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right } : null,
      in_resume_band: !!fragment && !!bounds && fragment.top >= bounds.top && fragment.top < bounds.top + 120 && fragment.top < innerHeight && fragment.right > bounds.left && fragment.left < bounds.right };
  });
}
async function atVerse120() {
  await expect.poll(async () => (await verse120Observation()).in_resume_band).toBe(true);
}
async function exactPsalmText() {
  const canonical = JSON.parse(await readFile(path.join(project, "src/data/bible.json"), "utf8")).PSA["119"];
  expect(canonical).toHaveLength(176);
  const flow = page.getByTestId("reader-flow").filter({ visible: true });
  expect(await flow.locator("[data-verse]").evaluateAll((nodes) => nodes.map((node) => ({ n: Number(node.getAttribute("data-verse")), text: node.textContent })))).toEqual(canonical.map((v) => ({ n: v.n, text: `${v.n} ${v.text}` })));
  expect((await flow.locator("p").allTextContents()).join(" ")).toBe(canonical.map((v) => `${v.n} ${v.text}`).join(" "));
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
  const stages = JSON.parse(
    await readFile(
      path.join(project, "src/features/garden/a51/stage-data.json"),
      "utf8",
    ),
  ).stages;
  expect(stages).toHaveLength(7);
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
  temp = await mkdtemp(path.join(tmpdir(), "oliva-upgrade-v011-"));
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
  enterPhase("baseline-ui-seed");

  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.10.0", { exact: true }),
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
  // new, owned review on the imported goal through the 0.10 UI before upgrading.
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
    .toBe("0.10.0");

  // Preserve a second, independently autosaved draft through a real 0.10 edit.
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

  // Seed the predecessor block reader through its real explicit verse route.
  // Observe restoration; never scroll the target into position. Leave before
  // the raw snapshot so unmount/debounced position writes have completed.
  await page.goto(base + "/lesen/PSA?chapter=119&verse=120");
  await expect(page.getByTestId("reader-flow").filter({ visible: true })).toHaveCount(0);
  await atVerse120();
  await expect.poll(async () => (await raw()).data.readingPosition).toEqual({
    ref: { book: "PSA", chapter: 119 }, verse: 120, mode: "read",
  });
  await expect.poll(async () => (await raw()).data.reading).toEqual({ book: "PSA", chapter: 119 });
  await page.goto(base + "/einstellungen");
  await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toHaveValue("Ada");
  await page.waitForTimeout(1000);

  const beforeRecords = await snapshot(),
    before = main(beforeRecords);
  const beforeGoal = before.data.goals.find(
    (goal) => goal.id === seededGoal.id,
  );
  const beforeReview = beforeGoal.reviews.find(
    (review) => review.text === originalReviewText,
  );
  const journal = before.data.drafts.find((draft) => draft.type === "journal");
  const reviewDraft = before.data.drafts.find((draft) => draft.type === "review-edit");
  expect(reviewDraft.values.text).toBe(reviewDraftText);
  expect(before.data.invitations).toEqual({ enabled: false, snoozed: {}, dismissed: {} });
  const archiveKey = "archive:" + before.data.imports[0].sourceHash;
  expect(before.storageVersion).toBe(1);
  expect(before.data.version).toBe(7);
  expect(before.data.retainedReviewGrowth).toEqual({
    reflections: 0,
    actions: 0,
  });
  expect(before.data.notes.length).toBeGreaterThan(0);
  expect(beforeReview.applied).toBe(true);
  expect(beforeReview).not.toHaveProperty("updatedAt");
  expect(journal.values.text).toBe(draftText);
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
    baseline_reading_position: before.data.readingPosition,
    baseline_review_edit_draft_sha256: hash(reviewDraftText),
    baseline_journal_draft_sha256: hash(draftText),
    baseline_block_reader_verse_120_observed: true,
    original_archive_blob_sha256: hash(source),
    baseline_cached_asset_sha256: originalAssetHash,
  });

  // Swap only the served filesystem root. The running browser, persistent
  // profile, page, origin, service-worker registration and IndexedDB stay put.
  enterPhase("worker-update-and-read-only-hydration");
  await symlink(current, path.join(temp, "next"));
  const updateStartedAt = Date.now();
  await rename(path.join(temp, "next"), live);
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.11.0", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await worker()).controller?.version)
    .toBe("0.11.0");
  const newWorker = await worker();
  expect(newWorker.controller.id).toBe(newWorker.expected);
  expect(newWorker.active.id).toBe(newWorker.expected);
  expect(newWorker.expected).not.toBe(oldWorker.expected);
  expect(newWorker.caches).toContain(oldWorker.expected);
  expect(newWorker.caches).toContain(newWorker.expected);
  await unchanged(
    beforeRecords,
    "Opening 0.11 must not rewrite raw V7, recovery, or archive records",
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
  // The independently saved review-edit draft intentionally blocks starting
  // another editor; its own resume action is verified offline below.
  await expect(
    reviewCard.getByRole("button", {
      name: "Rückblick bearbeiten",
      exact: true,
    }),
  ).toBeDisabled();
  await unchanged(
    beforeRecords,
    "Viewing a pre-existing review after update must not write",
  );
  Object.assign(result, {
    new_worker: newWorker,
    worker_activation_verified: true,
    same_origin_and_persistent_profile: true,
    old_cache_retained: true,
    data_version_before_and_after: 7,
    private_storage_version_before_and_after: 1,
    baseline_and_target_data_schema: "V7",
    schema_migration_expected: false,
    schema_migration_needed: false,
    durable_v7_main_unchanged_after_hydration: true,
    all_raw_records_unchanged_after_update: true,
  });

  enterPhase("offline-first-flow-reader-restoration");
  await context.setOffline(true);
  // First target-build reader visit is offline, with NO verse query. The old
  // canonical position must restore itself across the block-to-inline change.
  await page.goto(base + "/lesen/PSA?chapter=119");
  expect(new URL(page.url()).searchParams.has("verse")).toBe(false);
  await expect(page.getByTestId("reader-flow").filter({ visible: true })).toHaveAttribute("data-renderer", "web-inline");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await atVerse120();
  await exactPsalmText();
  await unchanged(beforeRecords, "First offline inline restoration must preserve every raw V7/recovery/archive record");
  const flowRestoration = await verse120Observation();
  await page.screenshot({ path: path.join(output, "offline-flow-resume-120.png") });

  enterPhase("offline-reader-focus-start-exit-and-reload");
  // Focus the public control without scrolling, then activate it with a real
  // keyboard event. No scroll is injected to manufacture the restored anchor.
  await page.getByRole("button", { name: "Lesefokus starten", exact: true }).evaluate((node) => node.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Lesefokus beenden", exact: true })).toBeInViewport();
  await atVerse120();
  await exactPsalmText();
  await unchanged(beforeRecords, "Focus start must retain the exact canonical position and every raw record");
  await page.screenshot({ path: path.join(output, "offline-flow-focus-120.png") });
  await page.getByRole("button", { name: "Lesefokus beenden", exact: true }).click();
  await expect(page.getByRole("button", { name: "Lesefokus starten", exact: true })).toBeFocused();
  await atVerse120();
  await exactPsalmText();
  await unchanged(beforeRecords, "Focus exit must retain the exact canonical position and every raw record");
  await page.reload();
  await expect(page.getByTestId("reader-flow").filter({ visible: true })).toHaveAttribute("data-renderer", "web-inline");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await atVerse120();
  await exactPsalmText();
  await expect(page.getByRole("button", { name: "Lesefokus beenden", exact: true })).toHaveCount(0);
  await unchanged(beforeRecords, "Offline reader reload must leave all raw records exact");
  Object.assign(result, {
    offline_first_reader_route: "/lesen/PSA?chapter=119",
    no_explicit_verse_query_in_target_reader: true,
    old_block_reader_position_restored_to_inline: true,
    restored_canonical_verse: 120,
    inline_first_fragment_observation: flowRestoration,
    complete_psalm_176_verses_exact: true,
    focus_start_and_exit_preserve_all_raw_records: true,
    focus_start_method: "Focus public button with preventScroll, then real Enter key activation",
    reader_target_never_forcibly_scrolled_into_view: true,
    offline_reader_reload_preserves_all_raw_records: true,
  });
  await page.goto(goalUrl);
  enterPhase("offline-reload-and-artwork");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page
      .getByTestId(`review-${beforeReview.id}`)
      .getByText(originalReviewText, { exact: true }),
  ).toBeVisible();
  await page.getByTestId(`review-${beforeReview.id}`).scrollIntoViewIfNeeded();
  await unchanged(beforeRecords, "Offline review reload must not write");
  await page.screenshot({
    path: path.join(output, "offline-upgrade-review-mobile.png"),
  });
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.11.0", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
  await unchanged(beforeRecords, "Offline settings must retain the final data");
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
    beforeRecords,
    "Resuming the old journal without typing must not rewrite it",
  );
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(output, "offline-upgrade-journal-draft-mobile.png"),
  });
  await page.goto(goalUrl);
  await page.getByRole("button", { name: "Diesen Entwurf fortsetzen", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true })).toHaveValue(reviewDraftText);
  await unchanged(beforeRecords, "Offline review-edit draft resume must retain all raw records");
  await page.screenshot({ path: path.join(output, "offline-review-edit-draft-preserved.png") });
  await page.goto(goalUrl);
  await expect(
    page.getByRole("heading", { name: beforeGoal.title, exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId(`review-${beforeReview.id}`)
      .getByText(originalReviewText, { exact: true }),
  ).toBeVisible();
  await unchanged(
    beforeRecords,
    "Offline goal and review views must not write",
  );
  await page.goto(base + "/garten");
  for (const stage of stages) {
    await page
      .getByRole("button", {
        name: `Stadium ${stage.index + 1} ansehen: ${stage.name}`,
        exact: true,
      })
      .click();
    await readyTree(stage.index);
    await unchanged(beforeRecords, "A51 stage preview must not change data");
  }
  await page.screenshot({
    path: path.join(output, "offline-upgrade-a51-mobile.png"),
  });
  // This is the first 0.11 visit to Johannes, with network already disabled.
  await page.goto(base + "/buch/JHN");
  await expect(
    page.getByRole("heading", { name: "Johannes", exact: true }),
  ).toBeVisible();
  await readyJohn();
  const johnCount = new Set(
    before.data.readChapters.filter((key) =>
      /^JHN:(?:[1-9]|1[0-9]|2[01])$/.test(key),
    ),
  ).size;
  await expect(
    page.getByText(`${johnCount} von 21 Kapiteln gelesen`, { exact: true }),
  ).toBeVisible();
  await unchanged(
    beforeRecords,
    "Offline Johannes artwork must not alter reading progress",
  );
  await page.reload();
  await readyJohn();
  await unchanged(beforeRecords, "Offline Johannes reload must not write");
  await page.screenshot({
    path: path.join(output, "offline-upgrade-john-mobile.png"),
  });
  await page
    .getByTestId("book-sword-artwork")
    .screenshot({ path: path.join(output, "offline-upgrade-john-art.png") });

  // First visit to each target-build book gallery is genuinely offline.
  const readyRomans = async () => {
    const frame = page.getByTestId("book-sword-artwork").filter({ visible: true });
    await expect(frame).toHaveAttribute("aria-busy", "false");
    await expect.poll(() => frame.getByTestId("book-sword-image").evaluate(node => {
      const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
      return !!image && image.complete && image.naturalWidth > 0 && image.currentSrc.includes("romans-grace-pilot-");
    })).toBe(true);
  };
  await page.goto(base + "/buch/ROM");
  await expect(page.getByRole("heading", { name: "Römer", exact: true })).toBeVisible();
  await readyRomans();
  await unchanged(beforeRecords, "First offline Romans illustration must not write");
  await page.reload();
  await readyRomans();
  await unchanged(beforeRecords, "Offline Romans reload must not write");
  await page.getByTestId("book-sword-artwork").filter({ visible: true }).screenshot({ path: path.join(output, "offline-upgrade-romans-art.png") });
  // No story has been visited in 0.11 before this point. Network is already
  // disabled, so every actual decoded image must come from the installed PWA.
  await page.goto(base + "/bibel");
  await page
    .getByRole("button", { name: "Eine Geschichte entdecken", exact: true })
    .click();
  const storyIds = [
    "noah",
    "abraham",
    "david-before-goliath",
    "nativity",
    "easter-dawn",
  ];
  const decodedStories = [];
  for (const id of storyIds) {
    const artwork = page.getByTestId(`story-artwork-${id}`);
    await artwork.scrollIntoViewIfNeeded();
    await expect(artwork).toHaveAttribute("aria-busy", "false");
    await expect(page.getByTestId(`story-error-${id}`)).toHaveCount(0);
    await expect
      .poll(() =>
        page.getByTestId(`story-image-${id}`).evaluate((node) => {
          const image =
            node instanceof HTMLImageElement ? node : node.querySelector("img");
          return !!image && image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
    const decoded = await page
      .getByTestId(`story-image-${id}`)
      .evaluate((node) => {
        const image =
          node instanceof HTMLImageElement ? node : node.querySelector("img");
        return {
          width: image.naturalWidth,
          height: image.naturalHeight,
          source: new URL(image.currentSrc).pathname,
        };
      });
    decodedStories.push({ id, ...decoded });
    await unchanged(
      beforeRecords,
      `Offline ${id} image decode and viewing must not write`,
    );
  }
  await page
    .getByTestId("story-card-david-before-goliath")
    .screenshot({
      path: path.join(output, "offline-upgrade-david-mobile.png"),
    });
  await page.reload();
  await page
    .getByRole("button", { name: "Eine Geschichte entdecken", exact: true })
    .click();
  await expect(
    page.getByTestId("story-artwork-david-before-goliath"),
  ).toHaveAttribute("aria-busy", "false");
  await expect
    .poll(() =>
      page.getByTestId("story-image-david-before-goliath").evaluate((node) => {
        const image =
          node instanceof HTMLImageElement ? node : node.querySelector("img");
        return !!image && image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
  await unchanged(
    beforeRecords,
    "Offline story reload must not change any raw record",
  );

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
    beforeRecords,
    "Final offline assets and old-cache fetch must leave all IDB records exact",
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
    pre_existing_review_preserved: true,
    offline_story_count: decodedStories.length,
    offline_story_images: decodedStories,
    offline_david_first_visit_and_reload_decoded: true,
    story_views_do_not_write_data: true,
    offline_notes_goals_and_old_journal_draft_verified: true,
    offline_a51_stages_verified: stages.length,
    tree_previews_do_not_write_data: true,
    offline_book_route_verified: true,
    offline_john_png_decoded: true,
    offline_romans_first_visit_and_reload_decoded: true,
    reader_scope_kept_psalm119_through_all_read_only_views: true,
    offline_review_edit_draft_verified: true,
    offline_book_route_reload_passed: true,
    book_view_does_not_write_data: true,
    original_archive_blob_preserved: true,
    final_original_archive_blob_sha256: finalArchiveHash,
    unchanged_recovery_copy_and_original_archives: true,
    all_records_unchanged_through_update_reader_focus_reload_and_artwork_views: true,
    final_reading_position: main(finalRecords).data.readingPosition,
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
  result.error_stack = error?.stack;
  if (page) {
    try { result.failure_records = summaries(await snapshot()); result.failure_reading_position = (await raw())?.data?.readingPosition; result.failure_verse120_geometry = await verse120Observation(); } catch {}
  }
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
