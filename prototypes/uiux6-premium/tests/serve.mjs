/** Static development server with correct SVG/font MIME types. No app service worker. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  reference = path.resolve(root, "../uiux6");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer((req, res) => {
    let requested;
    try {
      requested = decodeURIComponent(new URL(req.url, "http://local").pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    const isRef = requested.startsWith("/uiux6/"),
      base = isRef ? reference : root,
      rel = isRef ? requested.slice("/uiux6".length) : requested;
    let file = path.resolve(base, "." + rel);
    if (file !== base && !file.startsWith(base + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(Number(process.env.PORT || 4492), "0.0.0.0", () =>
    console.log("Premium design preview ready; SVG/font MIME explicit."),
  );
