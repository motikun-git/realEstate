// Builds public/sitemap.xml and public/robots.txt from js/site-config.js (siteUrl)
// and js/data.js (one URL per project).   Run:  npm run sitemap
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const pub = path.join(__dirname, "..", "public");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["js/site-config.js", "js/data.js"]) vm.runInContext(fs.readFileSync(path.join(pub, f), "utf8"), ctx);
const { SITE, MARKET_DATA } = ctx.window;
const base = SITE.siteUrl.replace(/\/$/, "");
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const today = new Date().toISOString().slice(0, 10);

const pages = ["index.html", "about.html", "projects.html", "contact.html"];
const projects = MARKET_DATA.cities.flatMap((c) => c.areas.flatMap((a) => a.projects.map((p) => `project.html?id=${p.id || slug(p.name)}`)));
const urls = [...pages, ...projects]
  .map((u) => `  <url><loc>${base}/${u.replace(/&/g, "&amp;")}</loc><lastmod>${today}</lastmod></url>`)
  .join("\n");

fs.writeFileSync(path.join(pub, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(pub, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
console.log(`sitemap.xml: ${pages.length + projects.length} URLs for ${base}`);
