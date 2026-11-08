import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const provenance=JSON.parse(await readFile("art/a51/provenance.json","utf8")), native=JSON.parse(await readFile("art/a51/native-derivatives.json","utf8"));
const files=[...provenance.original_files,...native.groups.flatMap(g=>[g.full,...g.layers]).map(p=>({...p,path:p.file}))];
for(const item of files) {
  const bytes=await readFile(item.path);
  if(createHash("sha256").update(bytes).digest("hex")!==item.sha256) throw new Error(`A51 file changed: ${item.path}`);
  if(bytes.length!==item.bytes) throw new Error(`A51 size mismatch: ${item.path}`);
  if(item.path.endsWith(".png")&&!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`Invalid PNG: ${item.path}`);
}
if(provenance.master_count!==7||provenance.webp_count!==21||native.groups.length!==14) throw new Error("Incomplete seven-stage family");
const result={checkedAt:new Date().toISOString(),study:provenance.study,originalsVerified:provenance.original_files.length,masterCount:7,webpCount:21,nativePngCount:native.groups.reduce((n,g)=>n+1+g.layers.length,0),allFileHashesMatch:true,sourceSnapshot:provenance.snapshot_commit,originalsUnmodified:true,nativeDeviceTest:false};
const evidence=process.env.OLIVA_EVIDENCE_DIR??"docs/evidence/latest";
await mkdir(evidence,{recursive:true});await writeFile(`${evidence}/a51-asset-integrity.json`,JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result));
