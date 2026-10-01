import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2] || "dist"),
  port = Number(process.env.PORT || 4174);
const securityHeaders = {};
if (fs.existsSync(path.join(root, "_headers")))
  for (const line of fs
    .readFileSync(path.join(root, "_headers"), "utf8")
    .split("\n")
    .slice(1)) {
    if (!line.startsWith("  ")) break;
    const i = line.indexOf(":");
    if (i > 0)
      securityHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".png": "image/png",
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
    let file = path.resolve(root, "." + requested);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      if (!path.extname(requested)) file = path.join(root, "index.html");
      else {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("Not found");
        return;
      }
    }
    res.writeHead(200, {
      ...securityHeaders,
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "0.0.0.0", () => console.log(`Serving ${root} on ${port}`));
