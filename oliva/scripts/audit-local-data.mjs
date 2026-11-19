import { chromium, expect as baseExpect } from "@playwright/test";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";

const evidence = process.argv[2] ?? "docs/evidence/privacy-security-rights/local-data.json";
const directory = path.resolve(process.argv[3] ?? "dist");
const expect = baseExpect.configure({timeout: 20000});
const port = await new Promise(resolve => {
  const probe = net.createServer();
  probe.listen(0, "127.0.0.1", () => { const {port} = probe.address(); probe.close(() => resolve(port)); });
});
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs", directory], {env:{...process.env, PORT:String(port)}, stdio:"ignore"});
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(origin)).ok) break; } catch {}
  await new Promise(resolve => setTimeout(resolve, 100));
}
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium", args:["--no-sandbox"]});
const context = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:"reduce", acceptDownloads:true});
const page = await context.newPage();
const report = {browser:"Local Chromium", syntheticDataOnly:true, testedHost:"loopback", runtimeOriginIsNotPrivateProductionOrigin:true,
  cases:[], requestCounts:{}, consoleCounts:{}, pageErrors:0, outgoingMarkerSeen:false, consoleMarkerSeen:false, sqlOnPhysicalDevice:false};
const marker = "OLIVA-AUDIT-LITERAL-20261118";
const literal = `<em>${marker} & Text</em>`;
const add = (counter, key) => counter[key] = (counter[key] ?? 0) + 1;
const bytesHash = value => createHash("sha256").update(value).digest("hex");
context.on("request", request => {
  const url = new URL(request.url());
  if (!['http:', 'https:'].includes(url.protocol)) return;
  const host = url.origin === origin ? "same-origin" : "cross-origin";
  add(report.requestCounts, `${host} ${request.method()} ${request.resourceType()}`);
  const body = request.postData() ?? "";
  if (request.url().includes(marker) || body.includes(marker)) report.outgoingMarkerSeen = true;
});
page.on("console", message => {
  add(report.consoleCounts, message.type());
  if (message.text().includes(marker)) report.consoleMarkerSeen = true;
});
page.on("pageerror", () => report.pageErrors++);
const button = name => page.getByRole("button", {name, exact:true});
const snapshots = async () => page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open("oliva-local-v1", 1);
  request.onerror = () => reject(request.error);
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("state", "readonly");
    const items = tx.objectStore("state");
    const keys = items.getAllKeys(), values = items.getAll();
    tx.oncomplete = () => { db.close(); resolve(keys.result.map((key, i) => [key, values.result[i]])); };
    tx.onerror = () => reject(tx.error);
  };
}));
const findMain = data => data.find(([key]) => key === "main")?.[1];
const selectFile = async (label, text, fileName) => {
  const chooser = page.waitForEvent("filechooser");
  await button(label).click();
  await (await chooser).setFiles({name:fileName, mimeType:"application/json", buffer:Buffer.from(text)});
};

try {
  await page.goto(origin + "/einstellungen");
  await page.getByRole("textbox", {name:"Dein Vorname (freiwillig)",exact:true}).fill("Prüfprofil");
  await button("Namen speichern").click();
  await expect.poll(async () => findMain(await snapshots())?.data.name).toBe("Prüfprofil");
  await expect(page.getByText("Für den Offline-Neustart bereit.", {exact:true})).toBeVisible({timeout:30000});
  report.build = await page.locator('meta[name="oliva-build"]').getAttribute("content");
  report.cookieCount = (await context.cookies()).length;
  const baseline = await snapshots();

  await page.goto(origin + "/importieren");
  await selectFile("FaithPath-Datei auswählen", JSON.stringify({app:"FaithPath",schemaVersion:999,data:{}}), "invalid-version.json");
  await expect(page.getByText(/Erwartet wird eine FaithPath-Sicherung mit Datenschema 5/)).toBeVisible();
  expect(await snapshots()).toEqual(baseline);
  report.cases.push({case:"Unsupported FaithPath schema", rejected:true, rawRecordsExact:true});

  const fixture = faithpathFixture();
  fixture.data.journal[0].text = literal;
  fixture.data.reflections[0].text = literal;
  fixture.data.paths[0].reviews[0].text = literal;
  const source = JSON.stringify(fixture, null, 2);
  await selectFile("FaithPath-Datei auswählen", source, "synthetic-faithpath.json");
  await expect(button("Jetzt sichern und Import übernehmen")).toBeVisible();
  expect(await snapshots()).toEqual(baseline);
  await button("Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const imported = await snapshots(), main = findMain(imported), archived = imported.find(([key]) => String(key).startsWith("archive:"));
  expect(main.storageVersion).toBe(1);
  expect(main.data.version).toBe(11);
  expect(archived[1]).toBe(source);
  expect(imported.some(([key]) => key === "before-faithpath-import")).toBe(true);
  report.cases.push({case:"Confirmed FaithPath import", previewReadOnly:true, archiveBytesExact:true, sourceSha256:bytesHash(source), recoveryCopyPresent:true,
    keys: imported.map(([key]) => String(key).startsWith("archive:") ? "archive:<sha256>" : key)});

  await page.goto(origin + "/sammlung");
  await expect(page.getByText(literal, {exact:true})).toBeVisible();
  await expect(page.locator("em").filter({hasText:marker})).toHaveCount(0);
  await page.goto(origin + "/garten");
  await button("Frühere FaithPath-Momente ansehen").click();
  await button("In Ruhe zuhören").click();
  await expect(page.getByTestId("archive-readable-history").getByText(literal, {exact:true})).toBeVisible();
  await expect(page.locator("em").filter({hasText:marker})).toHaveCount(0);
  expect(await snapshots()).toEqual(imported);
  report.cases.push({case:"HTML-shaped text in note and legacy history", escapedTextInTwoViews:true, rawRecordsExact:true, activePayloadUsed:false});

  await page.goto(origin + "/einstellungen");
  const offered = page.waitForEvent("download");
  await expect(button("Sicherung erstellen").or(button("Sicherung exportieren"))).toBeVisible();
  if (await button("Sicherung erstellen").isVisible()) {
    await button("Sicherung erstellen").click();
    await button("Unverschlüsselte Sicherung").click();
    await button("Unverschlüsselt exportieren").click();
  } else await button("Sicherung exportieren").click();
  const download = await offered;
  const bytes = await readFile(await download.path());
  const backup = JSON.parse(bytes.toString());
  expect(backup.version).toBe(11);
  expect(backup.imports[0].sourceText).toBe(source);
  expect(backup.notes.some(note => note.text === literal)).toBe(true);
  expect(Object.keys(backup)).not.toContain("before-faithpath-import");
  expect(await snapshots()).toEqual(imported);
  report.cases.push({case:"Export", mimicsRealUserDownload:true, plainJSON:true, currentPrivateNotesAndArchiveInExport:true,
    recoveryCopyNotInRegularExport:true, bytes:bytes.length, exportSha256:bytesHash(bytes)});
  await download.delete();

  await button("Sicherung wiederherstellen").click();
  await selectFile("OLIVA-Sicherungsdatei auswählen", '{"version":999,"notes":[]}', "invalid-oliva.json");
  await expect(page.getByText(/keine gültige OLIVA-Sicherung/)).toBeVisible();
  expect(await snapshots()).toEqual(imported);
  backup.name = "Wiederhergestellt";
  await selectFile("OLIVA-Sicherungsdatei auswählen", JSON.stringify(backup), "valid-oliva.json");
  await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();
  expect(await snapshots()).toEqual(imported);
  await button("Daten durch diese Sicherung ersetzen").click();
  await expect(page.getByText("Die Sicherung wurde wiederhergestellt.", {exact:true})).toBeVisible();
  const restored = await snapshots();
  expect(findMain(restored).data.name).toBe("Wiederhergestellt");
  expect(restored.find(([key]) => key === archived[0])[1]).toBe(source);
  report.cases.push({case:"Restore", invalidRejectedWithoutWrite:true, validPreviewReadOnly:true, explicitApplyWorked:true, originalArchiveExact:true,
    recoveryCopyStillPresent:restored.some(([key]) => key === "before-faithpath-import")});

  await context.setOffline(true);
  await page.goto(origin + "/sammlung");
  await expect(page.getByText(literal, {exact:true})).toBeVisible();
  expect(await snapshots()).toEqual(restored);
  report.cases.push({case:"Offline reread after restore", passed:true, rawRecordsExact:true});
  const headers = {};
  for (const route of ["/", "/sw.js", "/manifest.webmanifest"]) {
    const response = await fetch(origin+route);
    const names = ["content-type","cache-control","content-security-policy","x-content-type-options","referrer-policy","x-frame-options","permissions-policy","strict-transport-security"];
    headers[route] = {status:response.status, headers:Object.fromEntries(names.map(name => [name, response.headers.get(name)]))};
    await response.body.cancel();
  }
  report.localHeaders = headers;
  expect(Object.keys(report.requestCounts).every(key => key.startsWith("same-origin GET "))).toBe(true);
  expect(report.outgoingMarkerSeen || report.consoleMarkerSeen || report.pageErrors > 0).toBe(false);
  report.passed = true;
} catch (error) {
  report.failure = String(error.stack ?? error);
  report.passed = false;
  process.exitCode = 1;
} finally {
  await mkdir(path.dirname(evidence), {recursive:true});
  await writeFile(evidence, JSON.stringify(report, null, 2) + "\n");
  await browser.close(); server.kill("SIGTERM");
  console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,requestCounts:report.requestCounts,failure:report.failure}));
}
