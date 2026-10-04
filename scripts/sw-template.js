const BUILD = "__BUILD__";
const PREFIX = "faithpath:" + self.registration.scope;
const CACHE = PREFIX + BUILD;
const ASSETS = __ASSETS__;
const absolute = (p) => new URL(p, self.registration.scope).href;
const allowed = new Set(ASSETS.map(absolute));
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Fetch a coherent, complete release. A failed download never replaces a working version.
      try {
        for (let i = 0; i < ASSETS.length; i += 8)
          await Promise.all(
            ASSETS.slice(i, i + 8).map(async (file) => {
              const req = new Request(absolute(file), { cache: "reload" }),
                response = await fetch(req);
              if (!response.ok)
                throw new Error("Offline asset missing: " + file);
              if (
                file.endsWith(".json") &&
                !response.headers.get("content-type")?.includes("json")
              )
                throw new Error("Invalid content: " + file);
              await cache.put(req, response);
            }),
          );
        await cache.put(absolute("./offline-ready"), new Response(BUILD));
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
      // An update waits. The UI activates it only on a deliberate user action.
    })(),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const keys = await caches.keys(),
        ours = keys.filter((k) => k.startsWith(PREFIX));
      // Keep the previous release for already-open tabs. Never delete another application's cache.
      const old = ours.filter((k) => k !== CACHE);
      for (const key of old.slice(0, -1)) await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "STATUS")
    event.waitUntil(
      caches
        .open(CACHE)
        .then((c) => c.match(absolute("./offline-ready")))
        .then((ready) =>
          event.ports[0]?.postMessage({ ready: !!ready, build: BUILD }),
        ),
    );
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // QA reports/downloads are standalone documents, not application navigation.
  // Serving the cached app shell here breaks reports for already-controlled browsers.
  if (url.pathname.startsWith(new URL("./qa/", self.registration.scope).pathname)) return;
  // Browser update checks for sw.js and unknown requests stay on the network.
  if (url.pathname.endsWith("/sw.js")) return;
  if (request.mode === "navigate") {
    event.respondWith(
      caches
        .open(CACHE)
        .then((c) => c.match(absolute("./index.html")))
        .then((r) => r || fetch(request)),
    );
    return;
  }
  if (!allowed.has(url.href) && !url.pathname.includes("/releases/")) return;
  event.respondWith(
    (async () => {
      const own = await caches.open(CACHE),
        cached = await own.match(request);
      if (cached) return cached;
      if (url.pathname.includes("/releases/")) {
        const keys = (await caches.keys()).filter((k) => k.startsWith(PREFIX));
        for (const key of keys) {
          const found = await (await caches.open(key)).match(request);
          if (found) return found;
        }
      }
      return fetch(request);
    })(),
  );
});
