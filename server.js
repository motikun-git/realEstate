// Infusions Estate — static file server (no packages needed).
// Run:  npm start   (or  node server.js)  then open http://localhost:3000
//
// - Clean URLs: /about  ->  about.html
// - Custom 404 page (public/404.html)
// - Video streaming (Range requests) for the hero video
// - Basic security + cache headers
//
// The site is plain static files, so it can also be hosted as-is on
// Netlify, Vercel, Cloudflare Pages or GitHub Pages (publish the /public folder).

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2"
};

const SECURITY = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

function resolve(urlPath) {
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const file = path.join(ROOT, path.normalize(urlPath));
  if (!file.startsWith(ROOT)) return null;                 // stay inside /public
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  if (!path.extname(file) && fs.existsSync(file + ".html")) return file + ".html";   // clean URLs
  return undefined;
}

function send(res, status, file, extra = {}) {
  const stat = fs.statSync(file);
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const cache = type.startsWith("text/html") ? "no-cache" : "public, max-age=3600";
  res.writeHead(status, { ...SECURITY, "Content-Type": type, "Content-Length": stat.size, "Cache-Control": cache, "Accept-Ranges": "bytes", ...extra });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  const file = resolve(urlPath);
  if (file === null) { res.writeHead(403).end("Forbidden"); return; }
  if (!file) { send(res, 404, path.join(ROOT, "404.html")); return; }

  // Videos: support Range so browsers can stream and loop them
  const type = TYPES[path.extname(file).toLowerCase()] || "";
  const range = req.headers.range;
  if (range && type.startsWith("video/")) {
    const size = fs.statSync(file).size;
    const [s, e] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(s, 10) || 0;
    const end = e ? parseInt(e, 10) : size - 1;
    if (start >= size || end >= size) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
      return;
    }
    res.writeHead(206, { ...SECURITY, "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }

  send(res, 200, file);
});

server.listen(PORT, () => {
  console.log(`Infusions Estate running at http://localhost:${PORT}`);
});
