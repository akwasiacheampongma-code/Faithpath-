const BUILD = "FP4-20260916-F";
const PREFIX = "faithpath:" + self.registration.scope;
const CACHE = PREFIX + BUILD;
const ASSETS = ["./404.html","./BUILD.txt","./data/bibles/LUTHER1912-NOTICE.txt","./data/bibles/OTB-LICENSE.txt","./data/bibles/l1912/1CH.json","./data/bibles/l1912/1CO.json","./data/bibles/l1912/1JN.json","./data/bibles/l1912/1KI.json","./data/bibles/l1912/1PE.json","./data/bibles/l1912/1SA.json","./data/bibles/l1912/1TH.json","./data/bibles/l1912/1TI.json","./data/bibles/l1912/2CH.json","./data/bibles/l1912/2CO.json","./data/bibles/l1912/2JN.json","./data/bibles/l1912/2KI.json","./data/bibles/l1912/2PE.json","./data/bibles/l1912/2SA.json","./data/bibles/l1912/2TH.json","./data/bibles/l1912/2TI.json","./data/bibles/l1912/3JN.json","./data/bibles/l1912/ACT.json","./data/bibles/l1912/AMO.json","./data/bibles/l1912/COL.json","./data/bibles/l1912/DAN.json","./data/bibles/l1912/DEU.json","./data/bibles/l1912/ECC.json","./data/bibles/l1912/EPH.json","./data/bibles/l1912/EST.json","./data/bibles/l1912/EXO.json","./data/bibles/l1912/EZK.json","./data/bibles/l1912/EZR.json","./data/bibles/l1912/GAL.json","./data/bibles/l1912/GEN.json","./data/bibles/l1912/HAB.json","./data/bibles/l1912/HAG.json","./data/bibles/l1912/HEB.json","./data/bibles/l1912/HOS.json","./data/bibles/l1912/ISA.json","./data/bibles/l1912/JAS.json","./data/bibles/l1912/JDG.json","./data/bibles/l1912/JER.json","./data/bibles/l1912/JHN.json","./data/bibles/l1912/JOB.json","./data/bibles/l1912/JOL.json","./data/bibles/l1912/JON.json","./data/bibles/l1912/JOS.json","./data/bibles/l1912/JUD.json","./data/bibles/l1912/LAM.json","./data/bibles/l1912/LEV.json","./data/bibles/l1912/LUK.json","./data/bibles/l1912/MAL.json","./data/bibles/l1912/MAT.json","./data/bibles/l1912/MIC.json","./data/bibles/l1912/MRK.json","./data/bibles/l1912/NAM.json","./data/bibles/l1912/NEH.json","./data/bibles/l1912/NUM.json","./data/bibles/l1912/OBA.json","./data/bibles/l1912/PHM.json","./data/bibles/l1912/PHP.json","./data/bibles/l1912/PRO.json","./data/bibles/l1912/PSA.json","./data/bibles/l1912/REV.json","./data/bibles/l1912/ROM.json","./data/bibles/l1912/RUT.json","./data/bibles/l1912/SNG.json","./data/bibles/l1912/TIT.json","./data/bibles/l1912/ZEC.json","./data/bibles/l1912/ZEP.json","./data/bibles/otb/1CH.json","./data/bibles/otb/1CO.json","./data/bibles/otb/1JN.json","./data/bibles/otb/1KI.json","./data/bibles/otb/1PE.json","./data/bibles/otb/1SA.json","./data/bibles/otb/1TH.json","./data/bibles/otb/1TI.json","./data/bibles/otb/2CH.json","./data/bibles/otb/2CO.json","./data/bibles/otb/2JN.json","./data/bibles/otb/2KI.json","./data/bibles/otb/2PE.json","./data/bibles/otb/2SA.json","./data/bibles/otb/2TH.json","./data/bibles/otb/2TI.json","./data/bibles/otb/3JN.json","./data/bibles/otb/ACT.json","./data/bibles/otb/AMO.json","./data/bibles/otb/COL.json","./data/bibles/otb/DAN.json","./data/bibles/otb/DEU.json","./data/bibles/otb/ECC.json","./data/bibles/otb/EPH.json","./data/bibles/otb/EST.json","./data/bibles/otb/EXO.json","./data/bibles/otb/EZK.json","./data/bibles/otb/EZR.json","./data/bibles/otb/GAL.json","./data/bibles/otb/GEN.json","./data/bibles/otb/HAB.json","./data/bibles/otb/HAG.json","./data/bibles/otb/HEB.json","./data/bibles/otb/HOS.json","./data/bibles/otb/ISA.json","./data/bibles/otb/JAS.json","./data/bibles/otb/JDG.json","./data/bibles/otb/JER.json","./data/bibles/otb/JHN.json","./data/bibles/otb/JOB.json","./data/bibles/otb/JOL.json","./data/bibles/otb/JON.json","./data/bibles/otb/JOS.json","./data/bibles/otb/JUD.json","./data/bibles/otb/LAM.json","./data/bibles/otb/LEV.json","./data/bibles/otb/LUK.json","./data/bibles/otb/MAL.json","./data/bibles/otb/MAT.json","./data/bibles/otb/MIC.json","./data/bibles/otb/MRK.json","./data/bibles/otb/NAM.json","./data/bibles/otb/NEH.json","./data/bibles/otb/NUM.json","./data/bibles/otb/OBA.json","./data/bibles/otb/PHM.json","./data/bibles/otb/PHP.json","./data/bibles/otb/PRO.json","./data/bibles/otb/PSA.json","./data/bibles/otb/REV.json","./data/bibles/otb/ROM.json","./data/bibles/otb/RUT.json","./data/bibles/otb/SNG.json","./data/bibles/otb/TIT.json","./data/bibles/otb/ZEC.json","./data/bibles/otb/ZEP.json","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest","./releases/FP4-20260916-F/data/content-report.json","./releases/FP4-20260916-F/data/index.json","./releases/FP4-20260916-F/data/reference-index.json","./releases/FP4-20260916-F/data/stories.json","./releases/FP4-20260916-F/src/app.js","./releases/FP4-20260916-F/src/content.js","./releases/FP4-20260916-F/src/domain.js","./releases/FP4-20260916-F/src/store.js","./releases/FP4-20260916-F/src/version.js","./releases/FP4-20260916-F/styles.css","./trees/tree-stage-1.webp","./trees/tree-stage-2.webp","./trees/tree-stage-3.webp","./trees/tree-stage-4.webp","./trees/tree-stage-5.webp","./trees/tree-stage-6.webp","./trees/tree-stage-7.webp"];
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
