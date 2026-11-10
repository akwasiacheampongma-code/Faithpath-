import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { localData } from "./persistence";
const appConfig = JSON.parse(readFileSync(new URL("../../app.json", import.meta.url), "utf8"));

const ready = "Für den Offline-Neustart bereit.",
  unavailable = "Offline-Paket noch nicht vollständig. Mit Verbindung erneut öffnen.",
  update = "Aktualisierung verfügbar. Eingaben sichern und App erneut öffnen.";

type BuildReply = { id: string; version: string };
type Probe = {
  remaining: number;
  delayMs: number;
  replies: BuildReply[];
  delayed: number;
  delivered: number;
  closedReceivingPorts: number;
  closedSendingPorts: number;
  onlineEvents: number;
  controllerChanges: number;
};
declare global {
  interface Window {
    __offlineProbe: Probe;
    __offlineNativeChannel: typeof MessageChannel;
    __pendingRegistration: {
      started: number;
      nativeResolved: number;
      nativeRejected: number;
      returnedSettled: number;
      onlineEvents: number;
      controllerChanges: number;
    };
    __offlineNativeGetRegistration?: () => Promise<ServiceWorkerRegistration | undefined>;
    __uncontrolledRegistration: {
      started: number;
      nativeResolved: number;
      returnedSettled: number;
      lookupStarted: number;
      lookupNativeResolved: number;
      lookupActive?: string;
      controllerChanges: number;
      onlineEvents: number;
      release: () => void;
    };
  }
}

// Delay only genuine OLIVA_BUILD replies from the real service worker. React's
// scheduler channels and the independent worker inspection below stay native.
async function delayBuildReplies(page: Page, remaining: number, delayMs: number) {
  await page.addInitScript(({ remaining, delayMs }) => {
    const Native = MessageChannel,
      descriptor = Object.getOwnPropertyDescriptor(MessagePort.prototype, "onmessage")!;
    window.__offlineNativeChannel = Native;
    const probe: Probe = window.__offlineProbe = {
      remaining, delayMs, replies: [], delayed: 0, delivered: 0,
      closedReceivingPorts: 0, closedSendingPorts: 0,
      onlineEvents: 0, controllerChanges: 0,
    };
    window.addEventListener("online", () => probe.onlineEvents++);
    navigator.serviceWorker.addEventListener("controllerchange", () => probe.controllerChanges++);
    window.MessageChannel = class extends Native {
      constructor() {
        super();
        let buildChannel = false;
        for (const [port, counter] of [
          [this.port1, "closedReceivingPorts"],
          [this.port2, "closedSendingPorts"],
        ] as const) {
          const close = port.close.bind(port);
          let closed = false;
          port.close = () => {
            if (buildChannel && !closed) probe[counter]++;
            closed = true;
            close();
          };
        }
        Object.defineProperty(this.port1, "onmessage", {
          configurable: true,
          get() { return descriptor.get!.call(this); },
          set(callback) {
            descriptor.set!.call(this, typeof callback === "function" ? (event: MessageEvent) => {
              if (typeof event.data?.id === "string" && event.data.id.startsWith("oliva-")) {
                buildChannel = true;
                probe.replies.push({ id: event.data.id, version: event.data.version });
                if (probe.remaining !== 0) {
                  if (probe.remaining > 0) probe.remaining--;
                  probe.delayed++;
                  // Intentionally deliver the queued callback even after close:
                  // late real replies must not overwrite a newer verification.
                  setTimeout(() => {
                    probe.delivered++;
                    callback.call(this, event);
                  }, probe.delayMs);
                  return;
                }
              }
              callback.call(this, event);
            } : callback);
          },
        });
      }
    };
  }, { remaining, delayMs });
}

async function worker(page: Page) {
  return page.evaluate(async () => {
    const registration = await (window.__offlineNativeGetRegistration?.() ?? navigator.serviceWorker.getRegistration());
    const inspect = (target?: ServiceWorker | null): Promise<BuildReply | null> =>
      !target ? Promise.resolve(null) : new Promise(resolve => {
        const Channel = window.__offlineNativeChannel ?? MessageChannel,
          channel = new Channel();
        const finish = (value: BuildReply | null) => {
          clearTimeout(timer);
          channel.port1.close();
          channel.port2.close();
          resolve(value);
        };
        const timer = setTimeout(() => finish(null), 2000);
        channel.port1.onmessage = event => finish(event.data);
        target.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
      });
    return {
      expected: document.querySelector('meta[name="oliva-build"]')?.getAttribute("content"),
      controller: await inspect(navigator.serviceWorker.controller),
      controllerState: navigator.serviceWorker.controller?.state,
      active: await inspect(registration?.active),
      caches: (await caches.keys()).filter(name => name.startsWith("oliva-")),
    };
  });
}

// Compare every raw record independently of the application decoder. This
// observation never imports, repairs, migrates or rewrites private data.
async function rawSnapshot(page: Page) {
  return page.evaluate(() => new Promise<string>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result,
        names = Array.from(db.objectStoreNames).sort(),
        tx = db.transaction(names, "readonly"),
        stores = names.map(name => ({
          name, keys: tx.objectStore(name).getAllKeys(), values: tx.objectStore(name).getAll(),
        }));
      tx.oncomplete = () => {
        const result = JSON.stringify({
          version: db.version,
          stores: stores.map(({ name, keys, values }) => ({ name, keys: keys.result, values: values.result })),
        });
        db.close();
        resolve(result);
      };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  }));
}

async function seed(page: Page) {
  await page.goto("/einstellungen");
  await expect(page.getByText(ready, { exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Offline-Wiederanlauf");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Offline-Wiederanlauf");
  await matchingWorker(page);
  return rawSnapshot(page);
}

async function matchingWorker(page: Page) {
  const actual = await worker(page);
  expect(actual.expected).toMatch(/^oliva-/);
  expect(actual.controllerState).toBe("activated");
  expect(actual.controller).toEqual({ id: actual.expected, version: appConfig.expo.version });
  expect(actual.active).toEqual(actual.controller);
  expect(actual.caches).toContain(actual.expected);
  return actual;
}

const probe = (page: Page) => page.evaluate(() => window.__offlineProbe);

async function holdUncontrolledRegistration(page: Page, holdLookup = false) {
  await page.addInitScript(({ holdLookup }) => {
    const nativeRegister = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    const nativeLookup = navigator.serviceWorker.getRegistration.bind(navigator.serviceWorker);
    window.__offlineNativeGetRegistration = nativeLookup;
    let release = () => {};
    const gate = new Promise<void>(resolve => { release = resolve; });
    const observation = window.__uncontrolledRegistration = {
      started: 0, nativeResolved: 0, returnedSettled: 0,
      lookupStarted: 0, lookupNativeResolved: 0, lookupActive: undefined as string | undefined,
      controllerChanges: 0, onlineEvents: 0, release,
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => observation.controllerChanges++);
    window.addEventListener("online", () => observation.onlineEvents++);
    navigator.serviceWorker.register = (...args) => {
      observation.started++;
      const native = nativeRegister(...args);
      void native.then(() => observation.nativeResolved++, () => {});
      return Promise.all([native, gate]).then(([registration]) => {
        observation.returnedSettled++;
        return registration;
      });
    };
    navigator.serviceWorker.getRegistration = (...args) => {
      observation.lookupStarted++;
      const native = nativeLookup(...args);
      void native.then(registration => {
        observation.lookupNativeResolved++;
        observation.lookupActive = registration?.active?.state;
      }, () => {});
      return holdLookup ? Promise.all([native, gate]).then(([registration]) => registration) : native;
    };
  }, { holdLookup });
  // A genuine force reload bypasses control for this document. The active
  // registration and its cache remain native and available for the next load.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");
  await Promise.all([page.waitForEvent("load"), cdp.send("Page.reload", { ignoreCache: true })]);
  await cdp.detach();
  await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toBeVisible();
  expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
}

test("eine verspätete echte Workerantwort erholt sich ohne Neustart und erhält die lokalen Daten", async ({ page, context }) => {
  const before = await seed(page);
  await delayBuildReplies(page, 1, 1100);
  await page.reload();
  await expect.poll(async () => (await probe(page)).delayed, { timeout: 30000 }).toBe(1);
  // A native registration result can already trigger another valid reply.
  // Require verified readiness and safe delivery of the late real callback,
  // rather than requiring a transient "preparing" paint to remain visible.
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  await expect.poll(async () => (await probe(page)).delivered).toBe(1);
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  const verified = await matchingWorker(page), observation = await probe(page);
  expect(observation.replies.length).toBeGreaterThan(1);
  expect(observation.delivered).toBe(1);
  expect(observation.onlineEvents).toBe(0);
  expect(observation.controllerChanges).toBe(0);
  expect(observation.closedReceivingPorts).toBe(observation.replies.length);
  expect(observation.closedSendingPorts).toBe(observation.replies.length);
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("verified-transient-timeout", {
    contentType: "application/json", body: JSON.stringify({ verified, observation, privateRecordsUnchanged: true }),
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(ready, { exact: true })).toBeVisible({ timeout: 30000 });
  await matchingWorker(page);
  expect(await rawSnapshot(page)).toBe(before);
});

test("wiederholt verspätete echte Antworten enden ehrlich und erzeugen kein Dauerpolling", async ({ page }) => {
  const before = await seed(page);
  await delayBuildReplies(page, -1, 1100);
  await page.reload();
  await expect(page.getByText(unavailable, { exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(ready, { exact: true })).toHaveCount(0);
  const verified = await matchingWorker(page), exhausted = await probe(page);
  expect(exhausted.replies.length).toBeGreaterThan(1);
  expect(exhausted.replies.length).toBeLessThanOrEqual(6);
  // A quiet observation window distinguishes finite recovery from ongoing work.
  await page.waitForTimeout(5000);
  const quiet = await probe(page);
  expect(quiet.replies).toEqual(exhausted.replies);
  expect(quiet.delivered).toBe(quiet.delayed);
  expect(quiet.closedReceivingPorts).toBe(quiet.replies.length);
  expect(quiet.closedSendingPorts).toBe(quiet.replies.length);
  await expect(page.getByText(unavailable, { exact: true })).toBeVisible();
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("verified-finite-timeouts", {
    contentType: "application/json", body: JSON.stringify({ verified, quiet, privateRecordsUnchanged: true }),
  });
});

test("eine ältere echte Antwort überschreibt keinen neueren Buildkonflikt", async ({ page }) => {
  const before = await seed(page);
  await delayBuildReplies(page, 1, 500);
  await page.reload();
  await expect.poll(async () => (await probe(page)).delayed, { timeout: 30000, intervals: [10] }).toBe(1);
  // Model a newer document while retaining the real active worker. Neither the
  // worker nor its actual reply is forged; only the document's required ID moves.
  await page.evaluate(() => {
    document.querySelector('meta[name="oliva-build"]')!.setAttribute("content", "oliva-newer-document-required");
    window.dispatchEvent(new Event("online"));
  });
  await expect(page.getByText(update, { exact: true })).toBeVisible();
  await expect.poll(async () => (await probe(page)).delivered).toBe(1);
  await expect(page.getByText(update, { exact: true })).toBeVisible();
  await expect(page.getByText(ready, { exact: true })).toHaveCount(0);
  const actual = await worker(page), observation = await probe(page);
  expect(actual.controllerState).toBe("activated");
  expect(actual.controller?.id).not.toBe(actual.expected);
  expect(actual.controller?.version).toBe(appConfig.expo.version);
  expect(actual.caches).toContain(actual.controller?.id);
  expect(observation.replies.length).toBeGreaterThan(1);
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("verified-stale-reply-guard", {
    contentType: "application/json", body: JSON.stringify({ actual, observation, privateRecordsUnchanged: true }),
  });
});

test("ein bereits aktiver Worker wird trotz offenbleibender erneuter Registrierung sofort verifiziert", async ({ page }) => {
  const before = await seed(page);
  await page.addInitScript(() => {
    const nativeRegister = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    const observation = window.__pendingRegistration = {
      started: 0, nativeResolved: 0, nativeRejected: 0, returnedSettled: 0,
      onlineEvents: 0, controllerChanges: 0,
    };
    window.addEventListener("online", () => observation.onlineEvents++);
    navigator.serviceWorker.addEventListener("controllerchange", () => observation.controllerChanges++);
    navigator.serviceWorker.register = (...args) => {
      observation.started++;
      // Invoke the real browser API. Only its returned promise is held pending;
      // the genuine existing worker, messages and complete cache are untouched.
      const native = nativeRegister(...args);
      void native.then(
        () => observation.nativeResolved++,
        () => observation.nativeRejected++,
      );
      const held = new Promise<void>(() => {});
      const result = Promise.all([native, held]).then(([registration]) => registration);
      void result.then(
        () => observation.returnedSettled++,
        () => observation.returnedSettled++,
      );
      return result;
    };
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__pendingRegistration.started)).toBe(1);
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  const verified = await matchingWorker(page);
  const observation = await page.evaluate(() => window.__pendingRegistration);
  expect(observation.returnedSettled).toBe(0);
  expect(observation.onlineEvents).toBe(0);
  expect(observation.controllerChanges).toBe(0);
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("real-controller-verified-before-registration-settles", {
    contentType: "application/json",
    body: JSON.stringify({ verified, observation, privateRecordsUnchanged: true }),
  });
});

test("ein unkontrolliertes Dokument entdeckt den echten aktiven Worker vor dem Ende einer offenen Registrierung", async ({ page, context }) => {
  const before = await seed(page);
  await holdUncontrolledRegistration(page);
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  const observation = await page.evaluate(() => window.__uncontrolledRegistration);
  expect(observation.started).toBe(1);
  expect(observation.returnedSettled).toBe(0);
  expect(observation.lookupStarted).toBeGreaterThan(0);
  expect(observation.lookupNativeResolved).toBeGreaterThan(0);
  expect(observation.lookupActive).toBe("activated");
  expect(observation.controllerChanges).toBe(0);
  expect(observation.onlineEvents).toBe(0);
  const actual = await worker(page);
  expect(actual.controller).toBeNull();
  expect(actual.active).toEqual({ id: actual.expected, version: appConfig.expo.version });
  expect(actual.caches).toContain(actual.expected);
  expect(await rawSnapshot(page)).toBe(before);

  // Keep the real worker and its replies. A different required document ID
  // must still reject readiness on the independently discovered registration.
  await page.evaluate(() => {
    document.querySelector('meta[name="oliva-build"]')!.setAttribute("content", "oliva-newer-uncontrolled-document-required");
    window.dispatchEvent(new Event("online"));
  });
  await expect(page.getByText(update, { exact: true })).toBeVisible();
  await expect(page.getByText(ready, { exact: true })).toHaveCount(0);
  await page.evaluate(() => window.__uncontrolledRegistration.release());
  await expect(page.getByText(update, { exact: true })).toBeVisible();
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("real-uncontrolled-registration-discovery", {
    contentType: "application/json", body: JSON.stringify({ actual, observation, privateRecordsUnchanged: true, mismatchedDocumentRejected: true }),
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  await matchingWorker(page);
  expect(await rawSnapshot(page)).toBe(before);
});

test("eine offene Registrierung und eine offene Suche beenden die Prüfung weiterhin endlich", async ({ page }) => {
  const before = await seed(page);
  await holdUncontrolledRegistration(page, true);
  await expect(page.getByText(unavailable, { exact: true })).toBeVisible();
  await expect(page.getByText(ready, { exact: true })).toHaveCount(0);
  const actual = await worker(page);
  expect(actual.controller).toBeNull();
  expect(actual.active).toEqual({ id: actual.expected, version: appConfig.expo.version });
  const observation = await page.evaluate(() => window.__uncontrolledRegistration);
  expect(observation.started).toBe(1);
  expect(observation.returnedSettled).toBe(0);
  expect(observation.lookupStarted).toBe(1);
  expect(observation.lookupActive).toBe("activated");
  expect(await rawSnapshot(page)).toBe(before);
  await page.evaluate(() => window.__uncontrolledRegistration.release());
  await expect(page.getByText(ready, { exact: true })).toBeVisible();
  expect(await rawSnapshot(page)).toBe(before);
  await test.info().attach("finite-uncontrolled-registration-lookups", {
    contentType: "application/json", body: JSON.stringify({ actual, observation, privateRecordsUnchanged: true }),
  });
});
