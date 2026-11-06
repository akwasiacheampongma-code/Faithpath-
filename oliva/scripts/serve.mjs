import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
const root = path.resolve(process.argv[2] ?? "dist"),
  port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost"),
      name = decodeURIComponent(url.pathname),
      file = path.resolve(root, "." + name);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    let target = file;
    try {
      if (!(await stat(target)).isFile())
        target = path.join(root, "index.html");
    } catch {
      if (path.extname(name)) {
        res.writeHead(404).end("Not found");
        return;
      }
      target = path.join(root, "index.html");
    }
    const body = await readFile(target),
      ext = path.extname(target),
      compressed =
        /\.(?:js|json|html|css|svg)$/.test(target) &&
        req.headers["accept-encoding"]?.includes("gzip");
    res.writeHead(200, {
      "Content-Type": types[ext] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": name === "/sw.js" ? "no-cache" : "no-cache",
      ...(compressed
        ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" }
        : {}),
    });
    res.end(compressed ? gzipSync(body) : body);
  } catch {
    res.writeHead(500).end("Local preview error");
  }
});
server.listen(port, "0.0.0.0", () =>
  console.log(`OLIVA preview: http://localhost:${port}`),
);
