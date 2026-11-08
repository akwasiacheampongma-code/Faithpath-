/** Static-only hosting package. Never publishes, changes access, or uses credentials.
 * Usage: node scripts/package-private-preview.mjs /absolute/separate/site/project
 * The destination must already have its own .openai/hosting.json binding.
 */
import { readFile, writeFile, cp, rm, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
const project=process.cwd(),target=path.resolve(process.argv[2]??"");
if(!process.argv[2]||target===project||target.startsWith(project+path.sep)||project.startsWith(target+path.sep)) throw new Error("Use a separate existing private Site project directory.");
const binding=JSON.parse(await readFile(path.join(target,".openai/hosting.json"),"utf8"));
if(!binding.project_id||binding.static?.directory!=="dist") throw new Error("Private Site static binding missing.");
const config=JSON.parse(await readFile("app.json","utf8")),html=await readFile("dist/index.html","utf8");
const originalBuild=html.match(/name="oliva-build" content="([^"]+)"/)?.[1];
if(!originalBuild) throw new Error("Build and test the offline export first.");
const namespace=`preview-v${config.expo.version.replaceAll(".","-")}-${originalBuild.slice(-10)}`;
const dist=path.join(target,"dist"),sha=bytes=>createHash("sha256").update(bytes).digest("hex");
async function list(root,relative="") {
  const files=[];for(const entry of await readdir(path.join(root,relative),{withFileTypes:true})) {
    const name=path.posix.join(relative,entry.name);
    if(entry.isDirectory()) files.push(...await list(root,name));else files.push(name);
  }return files.sort();
}
const originals=await list(path.resolve("dist"));
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
const files=[];
for(const original of originals) {
  if(original==="sw.js") continue;
  const name=original.replace(/^_expo\//,namespace+"/_expo/").replace(/^assets\/node_modules\//,"assets/vendor/");
  const source=await readFile(path.join("dist",original));let bytes=source;
  if(/\.(?:js|json|css|html)$/.test(original)) bytes=Buffer.from(source.toString("utf8").replaceAll("_expo/",namespace+"/_expo/").replaceAll("assets/node_modules/","assets/vendor/"));
  if(name==="index.html") bytes=Buffer.from(bytes.toString().replace("</head>",'<meta name="robots" content="noindex,nofollow"></head>'));
  const destination=path.join(dist,name);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes);
  if(original!=="index.html") files.push({path:name,original_path:original,sha256:sha(bytes),source_sha256:sha(source),rewritten_asset_urls:!bytes.equals(source)});
}
await writeFile(path.join(dist,"robots.txt"),"User-agent: *\nDisallow: /\n");
await writeFile(path.join(dist,"_headers"),"/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n/index.html\n  Cache-Control: private, no-cache\n/sw.js\n  Cache-Control: private, no-cache\n/manifest.webmanifest\n  Cache-Control: private, no-cache\n");
const routes=["/bibel","/einstellungen","/garten","/importieren","/quellen","/sammlung","/start","/vorhaben","/wege","/lesen/*","/weg/*","/vorhaben/*","/importarchiv/*"];
await writeFile(path.join(dist,"_redirects"),routes.map(r=>`${r} /index.html 200`).join("\n")+"\n");
await writeFile(path.join(dist,"preview-package.json"),JSON.stringify({version:config.expo.version,source_build:originalBuild,asset_namespace:namespace,private_only:true,a51:true},null,2)+"\n");
// Review material stays outside the product navigation and offline payload.
await mkdir(path.join(dist,"review/a51"),{recursive:true});
await cp("docs/evidence/a51/comparison.svg",path.join(dist,"review/a51/comparison.svg"));
await cp("docs/evidence/a51/screens",path.join(dist,"review/a51/screens"),{recursive:true});
await writeFile(path.join(target,"app.json"),JSON.stringify(config,null,2)+"\n");
await mkdir(path.join(target,"scripts"),{recursive:true});
let worker=await readFile("scripts/offline.mjs","utf8");
worker=worker.replace('!p.endsWith("sw.js")','!p.endsWith("sw.js") && !["_headers", "_redirects"].includes(path.basename(p))');
worker=worker.replace('!p.endsWith("sw.js")','!p.endsWith("sw.js") && !p.startsWith("dist/review/")');
await writeFile(path.join(target,"scripts/offline.mjs"),worker);
await writeFile(path.join(target,"baseline-runtime.json"),JSON.stringify({version:config.expo.version,source_build:originalBuild,source_export:path.resolve("dist"),namespace,files},null,2)+"\n");
execFileSync(process.execPath,["scripts/offline.mjs"],{cwd:target,stdio:"inherit"});
console.log(JSON.stringify({project_id:binding.project_id,version:config.expo.version,sourceBuild:originalBuild,namespace,runtimeFiles:files.length,literalUriRewrites:files.filter(f=>f.rewritten_asset_urls).length,published:false}));
