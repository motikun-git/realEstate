# Infusions Estate

Real estate website for the UAE (Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah):
project showcase, project pages, per-square-foot price explorer and cost estimator.
Plain HTML, CSS and JavaScript — no database, no build step, no packages.

## Run it locally

```bash
npm start          # or: node server.js
```

Open http://localhost:3000

> Windows PowerShell says "running scripts is disabled"? Use `node server.js`
> or `npm.cmd start` instead.

## Pages

| Page | File | Notes |
|---|---|---|
| Home | `index.html` | Typographic hero + video with a property search bar (community, type, bedrooms, price, advanced filters), projects sliding in from left/right, intro, featured slider, price explorer, principles, testimonials, contact blocks, office map |
| About | `about.html` | Story, mission & vision, values, figures, how it works |
| Projects | `projects.html` | All projects with the same search bar + stage, text search and sort. Filters stay in the URL: `?city=dubai&area=palm&kind=villa&beds=4&price=u10&status=new` |
| Project | `project.html?id=<id>` | Banner, At A Glance, gallery + lightbox, amenities, price estimate, map, enquiry form, more projects |
| Contact | `contact.html` | Buyer / Broker / Career form, office details, map, FAQ. `?type=broker`, `?project=<id>` pre-fill it |
| 404 | `404.html` | Shown for unknown URLs |

## Folder layout

```
infusions-estate/
├─ server.js                Node static server: clean URLs, 404 page, video streaming, security headers
├─ package.json             npm start / npm run sitemap
├─ tools/make-sitemap.js    builds sitemap.xml + robots.txt from your data
└─ public/                  ← this folder IS the website
   ├─ *.html                pages
   ├─ css/style.css         all styles (light theme in :root, dark theme below it)
   ├─ js/site-config.js     brand, texts, contact info, forms, reviews        ← edit
   ├─ js/data.js            emirates, areas, prices per sq ft, projects        ← edit
   ├─ js/art.js             draws all pictures as SVG (no photos needed)
   ├─ js/layout.js          shared header, menu, footer, theme, forms, animations
   ├─ js/search.js           property search bar + advanced filters (home + projects)
   ├─ js/home.js, explorer.js, projects.js, project.js, about.js, contact.js
   ├─ videos/hero.mp4       your hero video (add it)
   ├─ images/               real photos (optional)
   ├─ favicon.svg, icon-512.png, og-image.png, site.webmanifest
   └─ sitemap.xml, robots.txt
```

## Before going live — checklist

1. **Contact details** — `js/site-config.js` → `contact` (phone, WhatsApp, email, address, hours, `mapQuery`).
2. **Your domain** — `siteUrl` in `js/site-config.js`, then run `npm run sitemap`.
3. **Forms** — `forms.mode` in `js/site-config.js`:
   - `"mailto"` (default): opens the visitor's email app with the message filled in.
   - `"whatsapp"`: opens WhatsApp to your number.
   - `"endpoint"`: POSTs JSON to `forms.endpoint` (e.g. a free Formspree form now, your own API/database later).
4. **Reviews** — replace the sample reviews in `site-config.js` with real ones (with permission) and set `sample: false`.
5. **Prices** — the rates in `js/data.js` are demo estimates. Check current figures.
6. **Hero video** — `public/videos/hero.mp4` (MP4/H.264, under ~20 MB, 10–20 s loop).
7. **Social links** — `site-config.js` → `socials`.

## Editing content

| What | Where |
|---|---|
| Add / edit a project | `data.js` → an area's `projects`. Status: `new`, `ongoing` or `completed`. `featured: true` puts it in the home showcase + slider |
| Real photos | add `image: "images/x.jpg"` and/or `interiorImage: "images/y.jpg"` to a project |
| Real "At A Glance" facts | add `details: { plot, height, units, parking, sizeText, unitTypes, intro }` to a project (otherwise demo values are generated from the building type) |
| Prices | each area's `rates: { new, ongoing, completed }` (AED per sq ft) |
| Bedrooms / home sizes for search | add `details: { beds: [1, 3], sizes: [700, 1900] }` to a project (beds 0 = studio). Otherwise defaults by type are used |
| Search price ranges | `PRICES` at the top of `js/search.js` |
| Registration fee | each emirate's `fee.pct` |
| Hero words, intro text, principles | `site-config.js` |
| Default theme | `site-config.js` → `defaultTheme: "light"` or `"dark"` |
| Colours / fonts | top of `css/style.css` (`--accent` re-colours the whole site) |

## Price estimate

```
property price = price per sq ft (area + stage) × size in sq ft
total          = property price + registration fee (% of the emirate)
```

## Hosting

`public/` is a complete static website, so you can host it without the Node server:

- **Netlify / Vercel / Cloudflare Pages** — publish directory: `public`
- **GitHub Pages** — publish the `public` folder (e.g. with a GitHub Action, or move its contents to `/docs`)
- **Any Node host** (Render, Railway, a VPS) — `npm start`, port from `PORT`

When you add a database later, set `forms.mode = "endpoint"` and point `forms.endpoint`
at your API; projects can be moved from `data.js` to an API that returns the same shape.
