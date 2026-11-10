/** Real, same-origin OLIVA 0.11 -> actual NT release service-worker upgrade.
 * All seed state is created through the real frozen 0.11 interface. Inspecting
 * IndexedDB is read-only. This script never injects state or calls app internals.
 * Local Chromium automation only; no hosted, simulator or physical-device claim.
 * Refuses a same-version development build and preserves existing evidence.
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
  process.argv[2] ?? "/workspace/oliva-v011-reader-flow-control-dist",
);
const current = path.resolve(process.argv[3] ?? path.join(project, "dist"));
const fixedNow = "2027-01-01T12:00:00.000Z";
const legacyDone = "2026-11-01T10:00:00.000Z";
const seed = faithpathFixture();
seed.data.quiz = {
  10000: { done: legacyDone },
  10001: { done: "2026-11-01" },
  unknown: {
    done: legacyDone,
    preserved: "Keine Antworten aus einem Abschluss erfinden.",
  },
};
const source = JSON.stringify(seed, null, 2) + "\n";
const draftText =
  "Mein offener Gedanke aus OLIVA 0.11.\n  Diese Worte bleiben als Entwurf erhalten.  ";
const reviewDraftText =
  "Mein offener Rückblickentwurf aus OLIVA 0.11.\n  Diese Bearbeitung bleibt unverändert.  ";
const originalReviewText =
  "Mein eigener Rückblick aus OLIVA 0.11: Heute war Raum für eine offene Frage.";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value);
async function buildMetadata(root) {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  const sw = await readFile(path.join(root, "sw.js"), "utf8");
  const id = html.match(/<meta name="oliva-build" content="([^"]+)">/)?.[1];
  const version = sw.match(/,VERSION=("[^"\n]+");/)?.[1];
  if (!id || !version || !sw.startsWith(`const ID=${JSON.stringify(id)},URLS=`))
    throw new Error(`Unrecognized immutable PWA build metadata: ${root}`);
  return {
    root,
    id,
    version: JSON.parse(version),
    html,
    html_sha256: hash(html),
    worker_sha256: hash(sw),
  };
}
const oldBuild = await buildMetadata(baseline),
  targetBuild = await buildMetadata(current);
if (oldBuild.version !== "0.11.0" || oldBuild.id !== "oliva-01c4b9f640bc0931")
  throw new Error(
    "The predecessor must be the frozen, actually released 0.11 control build",
  );
if (targetBuild.version === oldBuild.version || targetBuild.id === oldBuild.id)
  throw new Error(
    "Assign and build the actual NT release first; a same-version development build is not an upgrade candidate",
  );
const output = process.env.OLIVA_EVIDENCE_DIR
  ? path.resolve(process.env.OLIVA_EVIDENCE_DIR)
  : path.join(project, "docs/evidence/nt-catalog/upgrade", targetBuild.id);
if (existsSync(path.join(output, "offline-upgrade.json")))
  throw new Error(
    "Evidence already exists; choose a new OLIVA_EVIDENCE_DIR to preserve the previous result",
  );
const result = {
  baseline_version: oldBuild.version,
  target_version: targetBuild.version,
  baseline_build_id: oldBuild.id,
  target_build_id: targetBuild.id,
  baseline_html_sha256: oldBuild.html_sha256,
  baseline_worker_sha256: oldBuild.worker_sha256,
  target_html_sha256: targetBuild.html_sha256,
  target_worker_sha256: targetBuild.worker_sha256,
  synthetic_data: true,
  synthetic_clock: fixedNow,
  passed: false,
  physical_device_test: false,
  simulator_test: false,
  hosted_qa: false,
  evidence_scope:
    "Local automated Chromium; one persistent profile and origin through the real worker update",
  byte_comparison:
    "Exact UTF-8 JSON serialization of every raw IndexedDB value, not database-file bytes",
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
    const main = node.closest('[role="main"]'),
      bounds = main?.getBoundingClientRect();
    const fragment = Array.from(node.getClientRects()).find(
      (rect) => rect.width > 0 && rect.height > 0,
    );
    return {
      fragment: fragment
        ? {
            top: fragment.top,
            bottom: fragment.bottom,
            left: fragment.left,
            right: fragment.right,
          }
        : null,
      viewport: bounds
        ? {
            top: bounds.top,
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
          }
        : null,
      in_resume_band:
        !!fragment &&
        !!bounds &&
        fragment.top >= bounds.top &&
        fragment.top < bounds.top + 120 &&
        fragment.top < innerHeight &&
        fragment.right > bounds.left &&
        fragment.left < bounds.right,
    };
  });
}
async function atVerse120() {
  await expect
    .poll(async () => (await verse120Observation()).in_resume_band)
    .toBe(true);
}
async function exactPsalmText() {
  const canonical = JSON.parse(
    await readFile(path.join(project, "src/data/bible.json"), "utf8"),
  ).PSA["119"];
  expect(canonical).toHaveLength(176);
  const flow = page.getByTestId("reader-flow").filter({ visible: true });
  expect(
    await flow.locator("[data-verse]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        n: Number(node.getAttribute("data-verse")),
        text: node.textContent,
      })),
    ),
  ).toEqual(canonical.map((v) => ({ n: v.n, text: `${v.n} ${v.text}` })));
  expect((await flow.locator("p").allTextContents()).join(" ")).toBe(
    canonical.map((v) => `${v.n} ${v.text}`).join(" "),
  );
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
  temp = await mkdtemp(path.join(tmpdir(), "oliva-upgrade-nt-"));
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
  await page.clock.setFixedTime(new Date(fixedNow));
  result.browser_version = context.browser()?.version() ?? "unreported";
  result.origin = base;
  enterPhase("baseline-ui-seed");

  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText("OLIVA · lokale Entwicklungsausgabe 0.11.0", {
      exact: true,
    }),
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

  // The fixed synthetic clock makes the genuinely old imported goal eligible.
  // Create the opt-in and snooze through the predecessor's real interface.
  const importedGoal = (await raw()).data.goals.find(
    (goal) => !goal.archivedAt,
  );
  expect(importedGoal).toBeTruthy();
  await page.goto(base + "/einladungen");
  const invitationSwitch = page.getByRole("switch", {
    name: "Einladungen in der App erlauben",
    exact: true,
  });
  await expect(invitationSwitch).not.toBeChecked();
  await invitationSwitch.click();
  const invitationCard = page
    .getByTestId(`invitation-goal:${importedGoal.id}`)
    .filter({ visible: true });
  await expect(invitationCard).toBeVisible();
  await invitationCard
    .getByRole("button", { name: "Für 14 Tage zurückstellen", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await raw()).data.invitations.snoozed[`goal:${importedGoal.id}`],
    )
    .toBe("2027-01-15T12:00:00.000Z");

  // Imported historical reviews stay in their original archive. Create a real
  // new, owned review on the imported goal through the 0.11 UI before upgrading.
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
    .toBe("0.11.0");

  // Preserve a second, independently autosaved draft through a real 0.11 edit.
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

  // Seed the real predecessor inline reader through its explicit verse route.
  // Observe restoration; never scroll the target into position. Leave before
  // the raw snapshot so unmount/debounced position writes have completed.
  await page.goto(base + "/lesen/PSA?chapter=119&verse=120");
  await expect(
    page.getByTestId("reader-flow").filter({ visible: true }),
  ).toHaveAttribute("data-renderer", "web-inline");
  await atVerse120();
  await expect
    .poll(async () => (await raw()).data.readingPosition)
    .toEqual({
      ref: { book: "PSA", chapter: 119 },
      verse: 120,
      mode: "read",
    });
  await expect
    .poll(async () => (await raw()).data.reading)
    .toEqual({ book: "PSA", chapter: 119 });
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
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
  const reviewDraft = before.data.drafts.find(
    (draft) => draft.type === "review-edit",
  );
  const receipt = before.data.imports[0],
    archiveKey = "archive:" + receipt.sourceHash;
  expect(before.storageVersion).toBe(1);
  expect(before.data.version).toBe(7);
  expect(before.data).not.toHaveProperty("ntStudy");
  expect(before.data.invitations.enabled).toBe(true);
  expect(before.data.invitations.snoozed[`goal:${seededGoal.id}`]).toBe(
    "2027-01-15T12:00:00.000Z",
  );
  expect(beforeReview.applied).toBe(true);
  expect(beforeReview).not.toHaveProperty("updatedAt");
  expect(journal.values.text).toBe(draftText);
  expect(reviewDraft.values.text).toBe(reviewDraftText);
  expect(record(beforeRecords, archiveKey)).toBe(source);
  expect(hash(record(beforeRecords, archiveKey))).toBe(receipt.sourceHash);
  expect(receipt.sourceText).toBeUndefined();
  expect(record(beforeRecords, "before-faithpath-import")).toBeTruthy();
  expect(record(beforeRecords, "recovery-index")).toBeTruthy();
  const oldWorker = await worker();
  expect(oldWorker.controller.id).toBe(oldBuild.id);
  expect(oldWorker.caches).toContain(oldBuild.id);
  expect(await cachedHash(originalAsset, oldBuild.id)).toBe(originalAssetHash);
  Object.assign(result, {
    baseline_worker: oldWorker,
    baseline_private_storage_version: before.storageVersion,
    baseline_data_version: before.data.version,
    baseline_main_json_sha256: hash(json(before)),
    baseline_records: summaries(beforeRecords),
    baseline_goal_id: beforeGoal.id,
    baseline_review_id: beforeReview.id,
    baseline_invitations: before.data.invitations,
    baseline_reading_position: before.data.readingPosition,
    baseline_journal_draft_sha256: hash(draftText),
    baseline_review_edit_draft_sha256: hash(reviewDraftText),
    original_archive_blob_sha256: hash(source),
    baseline_cached_asset_sha256: originalAssetHash,
  });

  enterPhase("worker-update-and-read-only-hydration");
  await symlink(current, path.join(temp, "next"));
  const updateStartedAt = Date.now();
  await rename(path.join(temp, "next"), live);
  await page.goto(base + "/einstellungen");
  await expect(
    page.getByText(
      `OLIVA · lokale Entwicklungsausgabe ${targetBuild.version}`,
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await worker()).controller?.version)
    .toBe(targetBuild.version);
  const newWorker = await worker();
  expect(newWorker.controller.id).toBe(targetBuild.id);
  expect(newWorker.active.id).toBe(targetBuild.id);
  expect(newWorker.caches).toContain(oldBuild.id);
  expect(newWorker.caches).toContain(targetBuild.id);
  await unchanged(
    beforeRecords,
    "Hydrating V7 as V8 in RAM must not rewrite any raw record",
  );
  Object.assign(result, {
    new_worker: newWorker,
    same_origin_and_persistent_profile: true,
    worker_activation_verified: true,
    old_cache_retained: true,
    schema_migration_expected:
      "V7 -> V8 in RAM; first explicit action writes V8",
    durable_v7_main_unchanged_after_hydration: true,
    all_raw_records_unchanged_after_update: true,
  });

  enterPhase("offline-first-ever-nt-bank-visit");
  await context.setOffline(true);
  const bankText = await readFile(
    path.join(project, "src/data/nt-catalog.json"),
    "utf8",
  );
  const bank = JSON.parse(bankText).chapters;
  expect(bank).toHaveLength(260);
  expect(
    bank.reduce((count, chapter) => count + chapter.questions.length, 0),
  ).toBe(1300);
  const mat = bank.find(
    (chapter) => chapter.book === "MAT" && chapter.chapter === 1,
  );
  const rev = bank.find(
    (chapter) => chapter.book === "REV" && chapter.chapter === 22,
  );
  const heading = () =>
    page.getByTestId("nt-question-heading").filter({ visible: true });
  const button = (name) =>
    page.getByRole("button", { name, exact: true }).filter({ visible: true });
  await page.goto(base + "/verstehen/MAT?chapter=1");
  await expect(heading()).toHaveText(mat.questions[0].prompt);
  await expect(page.getByRole("radio").filter({ visible: true })).toHaveCount(
    4,
  );
  for (const option of mat.questions[0].options)
    await expect(
      page
        .getByRole("radio", { name: option, exact: true })
        .filter({ visible: true }),
    ).toBeVisible();
  await unchanged(
    beforeRecords,
    "First-ever offline MAT study loads without activating old quiz history or writing V8",
  );
  await page.goto(base + "/verstehen/REV?chapter=22");
  await expect(heading()).toHaveText(rev.questions[0].prompt);
  await unchanged(
    beforeRecords,
    "The final NT chapter is available on its first offline visit without writing",
  );
  await page.reload();
  await expect(heading()).toHaveText(rev.questions[0].prompt);
  await unchanged(
    beforeRecords,
    "Offline NT reload must leave old raw V7 untouched",
  );
  await page.goto(base + "/verstehen/MAT?chapter=1");
  await expect(heading()).toHaveText(mat.questions[0].prompt);
  await page.screenshot({
    path: path.join(output, "offline-first-nt-question-before-write.png"),
    fullPage: true,
  });
  Object.assign(result, {
    offline_first_nt_route: "/verstehen/MAT?chapter=1",
    offline_last_nt_route: "/verstehen/REV?chapter=22",
    offline_first_nt_and_last_chapters_verified: true,
    catalog_source_chapters: bank.length,
    browser_nt_chapters_exercised: ["MAT:1", "REV:22"],
    all_1300_questions_individually_exercised_in_browser: false,
    catalog_source_questions: bank.reduce(
      (count, chapter) => count + chapter.questions.length,
      0,
    ),
    catalog_source_sha256: hash(bankText),
    every_raw_record_preserved_before_explicit_action: true,
    legacy_done_not_automatically_activated: true,
  });

  enterPhase("first-explicit-answer-commits-v8-only");
  const question = mat.questions[0],
    choice = (question.correctIndex + 1) % 4;
  await page
    .getByRole("radio", { name: question.options[choice], exact: true })
    .filter({ visible: true })
    .check();
  await unchanged(
    beforeRecords,
    "Choosing an option alone must not persist or migrate V7",
  );
  await button("Antwort prüfen").click();
  await expect(button("Antwort ändern")).toBeVisible();
  await expect(
    page.getByText(question.explanation, { exact: true }),
  ).toBeVisible();
  const answerRecords = await snapshot(),
    answerMain = main(answerRecords);
  expect(answerRecords.database).toBe(beforeRecords.database);
  expect(answerRecords.version).toBe(beforeRecords.version);
  expect(answerRecords.stores).toEqual(beforeRecords.stores);
  const nonMain = (state) =>
    state.records.filter(
      (item) => !(item.store === "state" && item.key === "main"),
    );
  expect(json(nonMain(answerRecords))).toBe(json(nonMain(beforeRecords)));
  const oldPersonal = (({ version, revision, ...personal }) => personal)(
    before.data,
  );
  const newPersonal = (({ version, revision, ntStudy, ...personal }) =>
    personal)(answerMain.data);
  expect(json(newPersonal)).toBe(json(oldPersonal));
  expect(answerMain.storageVersion).toBe(1);
  expect(answerMain.data.version).toBe(8);
  expect(answerMain.data.revision).toBe(before.data.revision + 1);
  const answerKey = `${question.id}:${question.hash}`;
  const answer = answerMain.data.ntStudy.answers[answerKey];
  expect(answerMain.data.ntStudy).toEqual({
    answers: {
      [answerKey]: { question, choice, createdAt: fixedNow, revision: 1 },
    },
    completions: {},
    legacyCompletions: [],
    position: { book: "MAT", chapter: 1, index: 0 },
  });
  expect(answer.question).toEqual(question);
  await page.reload();
  await expect(heading()).toHaveText(question.prompt);
  await expect(
    page
      .getByRole("radio", { name: question.options[choice], exact: true })
      .filter({ visible: true }),
  ).toBeChecked();
  await expect(button("Antwort ändern")).toBeVisible();
  await unchanged(
    answerRecords,
    "Offline NT answer reload preserves exact V8 main and all archives/recovery",
  );
  await page.screenshot({
    path: path.join(output, "offline-saved-nt-answer-v8.png"),
    fullPage: true,
  });
  Object.assign(result, {
    first_answer_source_snapshot_verified: true,
    first_answer_wrong_choice_accepted_without_score: true,
    first_explicit_action_committed_v8: true,
    only_version_revision_and_ntStudy_changed: true,
    all_other_personal_fields_preserved_exactly: true,
    first_action_non_main_records_unchanged: true,
    private_storage_version_before_and_after: 1,
    first_answer_revision_increment: 1,
    saved_question_id: question.id,
    saved_question_hash: question.hash,
    offline_answer_reload_preserves_all_raw_records: true,
  });

  enterPhase("explicit-original-archive-activation");
  await page.goto(base + "/importarchiv/" + encodeURIComponent(receipt.id));
  await expect(
    page.getByRole("heading", {
      name: "Dein früherer Kapitelabschluss.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /1 eindeutig belegte Abschlüsse.*0 bereits sichtbar.*1 noch übernehmbar/,
    ),
  ).toBeVisible();
  await unchanged(
    answerRecords,
    "Inspecting the real old source and NT preview must not activate anything",
  );
  await button("NT-Abschlüsse aus diesem Archiv übernehmen").click();
  await expect(
    page.getByText(
      /1 eindeutig belegte Abschlüsse.*1 bereits sichtbar.*0 noch übernehmbar/,
    ),
  ).toBeVisible();
  const legacyRecords = await snapshot(),
    legacyMain = main(legacyRecords);
  expect(json(nonMain(legacyRecords))).toBe(json(nonMain(beforeRecords)));
  expect(legacyMain.data.revision).toBe(answerMain.data.revision + 1);
  expect(legacyMain.data.ntStudy.legacyCompletions).toEqual([
    {
      importId: receipt.id,
      sourceHash: receipt.sourceHash,
      sourceUnitId: "10000",
      book: "MAT",
      chapter: 1,
      completedAt: legacyDone,
    },
  ]);
  expect(legacyMain.data.ntStudy.answers).toEqual(
    answerMain.data.ntStudy.answers,
  );
  expect(legacyMain.data.ntStudy.completions).toEqual({});
  expect(legacyMain.data.ntStudy.position).toEqual(
    answerMain.data.ntStudy.position,
  );
  expect(
    json(
      (({ version, revision, ntStudy, ...personal }) => personal)(
        legacyMain.data,
      ),
    ),
  ).toBe(json(oldPersonal));
  await page.reload();
  await expect(
    page.getByText(
      /1 eindeutig belegte Abschlüsse.*1 bereits sichtbar.*0 noch übernehmbar/,
    ),
  ).toBeVisible();
  await unchanged(
    legacyRecords,
    "Reloading activated history must not rewrite its fact or fabricate answers",
  );
  await page.goto(base + "/verstehen/MAT?chapter=1");
  await expect(heading()).toHaveText(question.prompt);
  await expect(
    page.getByText("Aus deiner FaithPath-Geschichte", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /FaithPath hielt fest, dass die fünf Fragen angesehen wurden/,
    ),
  ).toBeVisible();
  await unchanged(
    legacyRecords,
    "Showing source-linked legacy history in the study must be read-only",
  );
  await page.screenshot({
    path: path.join(output, "offline-original-nt-history.png"),
    fullPage: true,
  });
  Object.assign(result, {
    legacy_activation_explicit: true,
    legacy_done_provenance_verified: true,
    legacy_canonical_completions_activated: 1,
    invalid_date_and_unknown_unit_remain_archived_only: true,
    legacy_activation_does_not_fabricate_answers_or_current_completion: true,
    legacy_activation_non_main_records_unchanged: true,
    legacy_source_view_and_reload_preserve_all_raw_records: true,
  });

  enterPhase("real-export-and-restore-validation-preview");
  await page.goto(base + "/einstellungen");
  const downloadPromise = page.waitForEvent("download");
  await button("Sicherung exportieren").click();
  const download = await downloadPromise;
  const exportedText = await readFile(await download.path(), "utf8");
  const exported = JSON.parse(exportedText);
  const expanded = {
    ...legacyMain.data,
    imports: legacyMain.data.imports.map((item) => ({
      ...item,
      sourceText: record(legacyRecords, "archive:" + item.sourceHash),
    })),
  };
  expect(exported).toEqual(expanded);
  expect(exported.ntStudy.answers[answerKey].question).toEqual(question);
  expect(exported.imports[0].sourceText).toBe(source);
  await unchanged(legacyRecords, "Export must not write user data");
  await button("Sicherung wiederherstellen").click();
  const backupChooser = page.waitForEvent("filechooser");
  await button("OLIVA-Sicherungsdatei auswählen").click();
  await (
    await backupChooser
  ).setFiles({
    name: "synthetic-oliva-v8-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportedText),
  });
  await expect(
    page.getByText(
      "Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();
  await unchanged(
    legacyRecords,
    "Validation of a real V8 export must not perform an unrequested restore",
  );
  await page.screenshot({
    path: path.join(output, "offline-v8-export-restore-preview.png"),
    fullPage: true,
  });
  Object.assign(result, {
    real_backup_download_verified: true,
    exported_json_utf8_bytes: Buffer.byteLength(exportedText),
    exported_json_sha256: hash(exportedText),
    export_preserves_snapshot_and_original_source_exactly: true,
    real_restore_picker_and_v8_validation_preview_passed: true,
    restore_was_not_applied: true,
    export_and_validation_preview_do_not_write: true,
  });

  enterPhase("offline-old-drafts-reader-and-artwork");
  await page.goto(base + "/sammlung");
  for (const note of before.data.notes)
    await expect(
      page.getByText(note.text, { exact: true }).first(),
    ).toBeVisible();
  await button("Entwurf fortsetzen").click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue(draftText);
  await unchanged(
    legacyRecords,
    "Resuming the pre-upgrade journal without editing must not write",
  );
  await page.goto(goalUrl);
  await expect(
    page
      .getByTestId(`review-${beforeReview.id}`)
      .getByText(originalReviewText, { exact: true }),
  ).toBeVisible();
  await button("Diesen Entwurf fortsetzen").click();
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(reviewDraftText);
  await unchanged(
    legacyRecords,
    "Resuming the pre-upgrade review edit without editing must not write",
  );
  await page.goto(base + "/lesen/PSA?chapter=119");
  await expect(
    page.getByTestId("reader-flow").filter({ visible: true }),
  ).toHaveAttribute("data-renderer", "web-inline");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await atVerse120();
  await exactPsalmText();
  await unchanged(
    legacyRecords,
    "The original PSA119 verse120 anchor remains restored after the independent NT commits",
  );
  await page.goto(base + "/garten");
  for (const stage of stages) {
    await button(`Stadium ${stage.index + 1} ansehen: ${stage.name}`).click();
    await readyTree(stage.index);
    await unchanged(
      legacyRecords,
      "Each of the seven offline A51 previews preserves data",
    );
  }
  await page.screenshot({
    path: path.join(output, "offline-seven-a51-stages.png"),
  });
  for (const code of ["JHN", "ROM"]) {
    await page.goto(base + "/buch/" + code);
    await readyJohn();
    await unchanged(
      legacyRecords,
      `First offline ${code} artwork view must not write`,
    );
    await page.reload();
    await readyJohn();
    await unchanged(
      legacyRecords,
      `Offline ${code} artwork reload must not write`,
    );
    await page
      .getByTestId("book-sword-artwork")
      .screenshot({ path: path.join(output, `offline-book-${code}.png`) });
  }
  await page.goto(base + "/bibel");
  await button("Eine Geschichte entdecken").click();
  const decodedStories = [];
  for (const id of [
    "noah",
    "abraham",
    "david-before-goliath",
    "nativity",
    "easter-dawn",
  ]) {
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
    decodedStories.push(
      await page.getByTestId(`story-image-${id}`).evaluate((node) => {
        const image =
          node instanceof HTMLImageElement ? node : node.querySelector("img");
        return {
          width: image.naturalWidth,
          height: image.naturalHeight,
          source: new URL(image.currentSrc).pathname,
        };
      }),
    );
    await unchanged(
      legacyRecords,
      `Offline ${id} image decoding must not write`,
    );
  }
  const oldCacheProof = await page.evaluate(
    async ({ asset, oldId, newId }) => ({
      old: !!(await (await caches.open(oldId)).match(asset)),
      current: !!(await (await caches.open(newId)).match(asset)),
    }),
    { asset: originalAsset, oldId: oldBuild.id, newId: targetBuild.id },
  );
  expect(oldCacheProof.old).toBe(true);
  expect(oldCacheProof.current).toBe(false);
  expect(await cachedHash(originalAsset)).toBe(originalAssetHash);
  const finalRecords = await unchanged(
    legacyRecords,
    "Final offline artwork and exclusive predecessor chunk fetch must preserve all raw values",
  );
  expect(record(finalRecords, archiveKey)).toBe(source);
  expect(json(nonMain(finalRecords))).toBe(json(nonMain(beforeRecords)));
  const offlineWorker = await worker();
  expect(offlineWorker.controller.id).toBe(targetBuild.id);
  Object.assign(result, {
    passed: true,
    phase: "complete",
    profile_preserved: true,
    name_preserved: true,
    offline_first_visit_and_reload_passed: true,
    offline_old_journal_draft_verified: true,
    offline_old_review_edit_draft_verified: true,
    pre_existing_review_preserved: true,
    all_invitation_controls_preserved: true,
    reader_scope_and_verse120_preserved: true,
    complete_psalm_176_verses_exact: true,
    offline_a51_stages_verified: stages.length,
    offline_book_illustrations_first_visit_and_reload: ["JHN", "ROM"],
    offline_story_images: decodedStories,
    offline_story_count: decodedStories.length,
    original_archive_blob_preserved: true,
    recovery_and_archive_records_exact_through_two_nt_commits: true,
    final_original_archive_blob_sha256: hash(record(finalRecords, archiveKey)),
    final_main_json_sha256: hash(json(main(finalRecords))),
    final_records: summaries(finalRecords),
    old_asset_present_in_old_cache: true,
    old_asset_absent_from_new_cache: true,
    old_cached_asset_verified: true,
    old_cached_asset_path: originalAsset,
    old_cached_asset_sha256: originalAssetHash,
    offline_worker: offlineWorker,
    update_and_offline_check_ms: Date.now() - updateStartedAt,
  });
} catch (error) {
  result.error = String(error);
  result.error_stack = error?.stack;
  if (page) {
    try {
      result.failure_records = summaries(await snapshot());
    } catch {}
    try {
      result.worker_diagnostic = await worker();
    } catch {}
    try {
      await page.screenshot({
        path: path.join(output, "offline-upgrade-failure.png"),
        fullPage: true,
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
  try {
    await context?.close();
  } finally {
    server?.kill();
    if (temp) await rm(temp, { recursive: true, force: true });
  }
}
console.log(JSON.stringify(result, null, 2));
