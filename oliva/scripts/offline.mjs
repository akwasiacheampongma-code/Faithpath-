import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await files(p)));
    else result.push(p);
  }
  return result;
}
// Serialized below; it runs in the worker, not in Node.
function workerRuntime() {
  self.addEventListener("install", (event) =>
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open(ID);
          await cache.addAll(URLS.map(url => new Request(url, { cache: "reload" })));
          await self.skipWaiting();
        } catch (error) {
          await caches.delete(ID);
          throw error;
        }
      })(),
    ),
  );
  self.addEventListener("activate", (event) =>
    event.waitUntil(
      (async () => {
        const names = (await caches.keys()).filter((k) =>
            k.startsWith("oliva-"),
          ),
          older = names.filter((k) => k !== ID);
        await Promise.all(older.slice(0, -1).map((k) => caches.delete(k)));
        await self.clients.claim();
      })(),
    ),
  );
  self.addEventListener("message", (event) => {
    if (event.data?.type === "OLIVA_BUILD")
      event.ports[0]?.postMessage({ id: ID, version: VERSION });
    if (event.data?.type === "OLIVA_ACTIVATE" && event.data.id === ID)
      event.waitUntil(self.skipWaiting());
  });
  self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET" || url.origin !== self.location.origin)
      return;
    event.respondWith(
      (async () => {
        const cache = await caches.open(ID);
        if (event.request.mode === "navigate") {
          try {
            return await fetch(event.request);
          } catch {
            return (
              (await cache.match("/index.html")) ??
              new Response("OLIVA ist offline noch nicht bereit.", {
                status: 503,
              })
            );
          }
        }
        const current = await cache.match(event.request);
        if (current) return current;
        // Old open clients may still ask for a previous build's immutable chunks.
        if (
          url.pathname.startsWith("/_expo/") ||
          url.pathname.startsWith("/assets/") ||
          url.pathname.startsWith("/preview-")
        ) {
          const older = (await caches.keys())
            .filter((k) => k.startsWith("oliva-") && k !== ID)
            .reverse();
          for (const key of older) {
            const old = await (await caches.open(key)).match(event.request);
            if (old) return old;
          }
        }
        return fetch(event.request);
      })(),
    );
  });
}
const all = (await files("dist")).filter((p) => !p.endsWith("sw.js")).sort(),
  hash = createHash("sha256");
const config = JSON.parse(await readFile("app.json", "utf8"));
hash.update(workerRuntime.toString());
hash.update(String(config.expo.version));
let baseHtml = "";
for (const p of all) {
  hash.update(p);
  hash.update("\0");
  if (p === "dist/index.html") {
    baseHtml = (await readFile(p, "utf8")).replace(
      /<meta name="oliva-build" content="[^"]*">/g,
      "",
    );
    hash.update(baseHtml);
  } else hash.update(await readFile(p));
}
const id = "oliva-" + hash.digest("hex").slice(0, 16),
  urls = all.map((p) => "/" + p.replace(/^dist\//, ""));
if (!baseHtml.includes("<head>"))
  throw new Error("Missing HTML head for offline build marker");
await writeFile(
  "dist/index.html",
  baseHtml.replace(
    "<head>",
    '<head><meta name="oliva-build" content="' + id + '">',
  ),
);
await writeFile(
  "dist/sw.js",
  "const ID=" +
    JSON.stringify(id) +
    ",URLS=" +
    JSON.stringify(urls) +
    ",VERSION=" +
    JSON.stringify(config.expo.version) +
    ";\n(" +
    workerRuntime.toString() +
    ")();\n",
);
console.log("Offline bundle: " + id + ", " + urls.length + " files");
