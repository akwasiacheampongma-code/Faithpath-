import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = process.cwd(), dist = path.resolve(root, "dist");
const hash = b => createHash("sha256").update(b).digest("hex");
const check = (v, message) => { if (!v) throw new Error(message); };
async function files(folder) {
  const found = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const p = path.join(folder, item.name);
    if (item.isDirectory()) found.push(...await files(p));
    else if (item.isFile()) found.push(p);
  }
  return found;
}
const manifest = JSON.parse(await readFile(path.join(root,"art/spiritual-sword/runtime.json")));
const archive = JSON.parse(await readFile(path.join(root,"art/swords/historical-runtime-assets/manifest.json")));
const retired = new Set(archive.assets.map(a => a.sha256).filter(sha => sha !== manifest.activeAsset.sha256));
const inventory = [];
for (const file of await files(dist)) {
  const bytes = await readFile(file), sha = hash(bytes), name = path.relative(dist,file).split(path.sep).join("/");
  check(!retired.has(sha), `Retired book-sword asset leaked into build: ${name}`);
  if (name.endsWith(".js") && name !== "sw.js") {
    check(!/book-sword-artwork|sword-confirmation|Schwert der Gnade|Schwert des Anfangs|Dein Buchschwert entdecken/.test(bytes.toString()),
      `Obsolete book-sword UI remains in build: ${name}`);
  }
  inventory.push({path:name,bytes:bytes.length,sha256:sha});
}
const active = inventory.filter(f => f.sha256 === manifest.activeAsset.sha256);
check(active.length === 1, "Expected exactly one actual sword image in web export");
const report = {checkedAt:new Date().toISOString(),activeSwordAssets:active,activeImageCount:1,
  retiredAssetHashesExcluded:retired.size,noRetiredBookSwordUi:true,
  javascriptBytes:inventory.filter(f=>f.path.endsWith(".js")).reduce((n,f)=>n+f.bytes,0),
  totalBytes:inventory.reduce((n,f)=>n+f.bytes,0),files:inventory.length,
  scope:"Actual production web files; not device or independent specialist acceptance."};
const target=process.env.OLIVA_RUNTIME_REPORT;
if(target)await writeFile(path.resolve(root,target),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report));
