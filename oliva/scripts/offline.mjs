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
const all = (await files("dist")).filter((p) => !p.endsWith("sw.js")).sort();
const hash = createHash("sha256");
for (const p of all) hash.update(await readFile(p));
const id = `oliva-${hash.digest("hex").slice(0, 16)}`,
  urls = all.map((p) => "/" + p.replace(/^dist\//, ""));
await writeFile(
  "dist/sw.js",
  `const ID=${JSON.stringify(id)},URLS=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(ID);await cache.addAll(URLS);}catch(error){await caches.delete(ID);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=(await caches.keys()).filter(k=>k.startsWith('oliva-'));const older=names.filter(k=>k!==ID);await Promise.all(older.slice(0,-1).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(ID);if(event.request.mode==='navigate'){try{return await fetch(event.request);}catch{return await cache.match('/index.html')??new Response('OLIVA ist offline noch nicht bereit.',{status:503});}}return await cache.match(event.request)??fetch(event.request);})());});
`,
);
console.log(`Offline bundle: ${id}, ${urls.length} files`);
