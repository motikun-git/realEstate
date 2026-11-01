# Infusions Estate

Front-end real estate website for the UAE (Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah)
with a per-square-foot price explorer and cost estimator.
Plain HTML, CSS and JavaScript, served by a small Node.js server (no packages).

## Run it

```bash
npm start
```

Open http://localhost:3000

## Folder layout

```
infusions-estate/
├─ server.js              Node static server (supports video streaming)
├─ package.json
└─ public/
   ├─ index.html          Home page (hero, journey, projects + price explorer, reviews, join us)
   ├─ project.html        Project detail page  → project.html?id=<project-id>
   ├─ css/style.css       All styles — dark theme in :root, light theme below it
   ├─ js/site-config.js   Brand name, hero video, contact info, WhatsApp, reviews   ← edit
   ├─ js/data.js          Emirates, areas, prices per sq ft, projects                ← edit
   ├─ js/art.js           Draws the project/interior pictures (SVG, no photos needed)
   ├─ js/layout.js        Shared: header, full-screen menu, dark/light toggle, footer, WhatsApp button
   ├─ js/app.js           Home page behaviour (explorer, calculator, form…)
   ├─ js/project.js       Project page (banner, At A Glance, price estimate, more projects)
   ├─ videos/             Put hero.mp4 here
   └─ images/             Optional real project photos
```

## Things to change

| What | Where |
|---|---|
| Hero video | Copy your file to `public/videos/hero.mp4` (MP4/H.264, ideally under 20 MB, 10–20 s loop). Until it exists, a skyline drawing is shown. |
| Contact info | `site-config.js` → `contact` (phone, email, address, hours, map link) |
| Social links | `site-config.js` → `socials` |
| Reviews | `site-config.js` → `reviews`. The current ones are placeholders marked **Sample**; replace with real client reviews and set `sample: false`. |
| Prices | `data.js` → each area's `rates: { new, ongoing, completed }` (AED per sq ft) |
| Registration fee | `data.js` → each emirate's `fee.pct` |
| Projects | `data.js` → `projects` inside an area. Status must be `new`, `ongoing` or `completed`. |
| Real photo for a project | Add `image: "images/photo.jpg"` (and optionally `interiorImage: "images/room.jpg"`) to that project; it replaces the drawing. |
| "At A Glance" facts | Generated demo values per building type. Override any of them per project in `data.js`: `details: { plot: "5 Katha", height: "G + 9", units: "8 Nos", parking: "8 Nos", sizeText: "2,850 sq ft", unitTypes: "3 Bed", intro: "…" }` |
| WhatsApp button | `site-config.js` → `contact.whatsapp` (digits with country code). Empty = button opens the Join Us form. |
| Default theme | Dark. Visitors can switch to Light with the toggle in the header (remembered in their browser). |
| Colours / fonts | Top of `css/style.css` (`:root`) |

## How the estimate works

```
property price = price per sq ft (area + project stage) × size in sq ft
total          = property price + registration fee (% of the emirate)
```

If no area is open, the city average for that stage is used.
Sizes typed in sq m are converted (1 sq m = 10.7639 sq ft).

> All prices in `data.js` are rough estimates for the demo. Check current market
> figures before publishing.
