import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import assert from "node:assert/strict";
const baseline=JSON.parse(await readFile("baseline-runtime.json","utf8"));
async function htmlEntries(dir, relative="") {
 const found=[];
 for(const item of await readdir(path.join(dir,relative),{withFileTypes:true})) {
  const name=path.posix.join(relative,item.name);
  if(item.isDirectory()) found.push(...await htmlEntries(dir,name));
  else if(name.endsWith(".html")) found.push(name);
 }
 return found.sort();
}
// Observed static hosting uses SPA fallback only for a single HTML entry.
// Keep review material in SVG; another HTML document breaks deep-link reloads.
assert.deepEqual(await htmlEntries("dist"),["index.html"]);
for (const file of baseline.files) {
 const raw=await readFile(path.join("dist",file.path));
 assert.equal(createHash("sha256").update(raw).digest("hex"),file.sha256,file.path);
}
const manifest=JSON.parse(await readFile("dist/manifest.webmanifest","utf8"));
assert.equal(manifest.display,"standalone");assert.equal(manifest.start_url,"/");assert.equal(manifest.scope,"/");
for (const icon of manifest.icons) {
 const png=await readFile("dist"+icon.src);const n=Number(icon.sizes.split("x")[0]);
 assert.equal(png.readUInt32BE(16),n);assert.equal(png.readUInt32BE(20),n);
}
const html=await readFile("dist/index.html","utf8"),sw=await readFile("dist/sw.js","utf8");
assert.match(html,/<html lang="de">/);assert.match(html,/rel="manifest"/);assert.match(html,/viewport-fit=cover/);
const id=JSON.parse(sw.match(/^const ID=("[^"]+")/)[1]);
assert.ok(html.includes('name="oliva-build" content="'+id+'"'));
const urls=JSON.parse(sw.match(/URLS=(\[[\s\S]*?\]),VERSION=/)[1]);
assert.equal(new Set(urls).size,urls.length);
assert.ok(urls.includes("/manifest.webmanifest"));assert.ok(urls.includes("/icon-512.png"));
assert.ok(!urls.some(x=>x.includes("_headers")||x.includes("_redirects")));
for(const url of urls){assert.ok(url.startsWith("/")&&!url.includes(".."));assert.ok((await stat("dist"+url)).isFile());}
const rules=await readFile("dist/_redirects","utf8");
for(const route of ["/bibel","/einladungen","/garten","/sammlung","/wege","/einstellungen","/lesen/*","/buch/*","/weg/*","/vorhaben/*","/importarchiv/*"])assert.ok(rules.includes(route+" /index.html 200"));
const result={version:baseline.version ?? "0.4.0",checkedAt:new Date().toISOString(),runtime_files_verified:baseline.files.length, unchanged_runtime_asset_bytes:baseline.files.filter(f => !f.rewritten_asset_urls).length, rewritten_uri_files:baseline.files.filter(f => f.rewritten_asset_urls).length,all_runtime_hashes_match:true,pwa_manifest_valid:true,icons_valid:true,cache_files_verified:urls.length,build_id:id,app_routes_rewritten:true,source_build:baseline.source_build, source_validation:baseline.validation ?? null,managed_sites_browser_qa:"unavailable: cua_repl.js not exposed",physical_phone_test:false};
await writeFile("preview-validation.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result));
