import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";
/** An isolated, unchanged upstream renderer. No original app or user data. */
export async function originalA51(page: Page, stage: number, width: number) {
  await page.route("http://a51.reference.test/**", async route => {
    const url = new URL(route.request().url()), name = decodeURIComponent(url.pathname);
    if(name === "/") {
      await route.fulfill({contentType:"text/html",body:`<!doctype html><html lang="de"><head><link rel="stylesheet" href="/reference/tree.css"><style>body{margin:24px;background:#efeee5}#tree{width:${width}px}</style></head><body><div id="tree"></div><script type="module">import {createTreeScene} from '/reference/tree-scene.js';const root=document.getElementById('tree');const scene=createTreeScene(root,{stage:${stage},autoplay:false});root.olivaTree=()=>scene.metrics;</script></body></html>`});return;
    }
    const file = name.startsWith("/reference/assets/runtime/")
      ? path.resolve("assets/a51",path.basename(name))
      : path.resolve("art/a51/reference/runtime",name.replace(/^\/reference\//,""));
    if(!file.startsWith(path.resolve("assets/a51")+path.sep)&&!file.startsWith(path.resolve("art/a51/reference/runtime")+path.sep)) {await route.abort();return;}
    await route.fulfill({body:await readFile(file),contentType:name.endsWith(".css")?"text/css":name.endsWith(".webp")?"image/webp":"text/javascript"});
  });
  await page.goto(`http://a51.reference.test/?stage=${stage}`);
}
