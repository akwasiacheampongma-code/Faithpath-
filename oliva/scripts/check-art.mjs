import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = process.cwd(),
  manifest = JSON.parse(await readFile("art/manifest.json", "utf8")),
  seen = new Set();
async function checked(name, expected) {
  const p = path.resolve(root, name);
  if (!p.startsWith(root + path.sep))
    throw new Error("Asset path outside project");
  const bytes = await readFile(p),
    hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== expected) throw new Error("Asset hash mismatch: " + name);
  return bytes;
}
let variants = 0;
for (const asset of manifest.assets) {
  if (
    seen.has(asset.id) ||
    !asset.prompt_version ||
    !asset.license_status ||
    !asset.approval
  )
    throw new Error("Incomplete/duplicate art metadata");
  seen.add(asset.id);
  const master = await checked(asset.master, asset.master_sha256);
  if (master.subarray(1, 4).toString() !== "PNG")
    throw new Error("Invalid master format");
  for (const variant of asset.variants) {
    const data = await checked(variant.file, variant.sha256);
    if (
      data.length !== variant.bytes ||
      data.subarray(8, 12).toString() !== "WEBP"
    )
      throw new Error("Invalid variant: " + variant.file);
    variants++;
  }
  if (asset.prompt_record)
    await readFile(path.resolve(root, asset.prompt_record), "utf8");
}
console.log(
  JSON.stringify({
    masters: seen.size,
    variants,
    all_hashes_match: true,
    release_approval:
      "Read individual metadata; this check does not grant approval.",
  }),
);
