/* =========================================================================
   ART  —  draws original building illustrations as SVG, so the site needs
   no stock photos. Each project gets its own picture, generated from its
   name (same name = same picture every time).

   Art.project(project) -> "url(data:image/svg+xml,...)"  (for CSS)
   Art.skyline(options) -> same, a wide city skyline (hero + Join Us)

   To use real photos later, add  image: "images/my-photo.jpg"  to a
   project in data.js — app.js uses it instead of the drawing.
   ========================================================================= */

(function () {
  /* ---------- seeded random numbers ---------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const range = (r, min, max) => min + r() * (max - min);
  const f = (n) => Math.round(n * 10) / 10;

  /* ---------- colour moods ---------- */
  const PALETTES = {
    dusk: {
      sky: ["#2d3150", "#8a6a83", "#e9a77d"], sun: "#f8d7a4", haze: "#6f5d78",
      glassA: "#3a4060", glassB: "#1d2134", side: "#14172496", lit: "#f6c879",
      wall: "#e7dccb", wallShade: "#c2b29b", ground: "#5b4c48", water: ["#7b6a80", "#2a2b40"], palm: "#1d1f2b"
    },
    day: {
      sky: ["#86b4cc", "#bcd6de", "#f1e7d6"], sun: "#fff6e3", haze: "#a9c0c6",
      glassA: "#9cc0cf", glassB: "#56798b", side: "#2f4c5c55", lit: "#e9f3f6",
      wall: "#f4efe6", wallShade: "#d7cdbd", ground: "#d9c7a6", water: ["#6fa6bb", "#2f6a82"], palm: "#3f5b45"
    },
    dawn: {
      sky: ["#c9b7c4", "#efd3c0", "#faefe2"], sun: "#fff1dc", haze: "#d8c4bf",
      glassA: "#c8b9b4", glassB: "#7f6f73", side: "#4b3d4344", lit: "#fff3df",
      wall: "#f7efe4", wallShade: "#ddcbb6", ground: "#e2cfb2", water: ["#cdb7bd", "#7c7088"], palm: "#5b5446"
    },
    night: {
      sky: ["#070b17", "#141c35", "#2c3558"], sun: "#e9e4d4", haze: "#232b47",
      glassA: "#1f2740", glassB: "#0e1322", side: "#00000066", lit: "#ffd68a",
      wall: "#3a3d4c", wallShade: "#272a36", ground: "#1b1e29", water: ["#1d2541", "#06080f"], palm: "#05070d"
    }
  };

  /* ---------- small building blocks ---------- */
  function gradient(id, stops, vertical = true) {
    const attrs = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
    const s = stops.map((c, i) => `<stop offset="${f((i / (stops.length - 1)) * 100)}%" stop-color="${c}"/>`).join("");
    return `<linearGradient id="${id}" ${attrs}>${s}</linearGradient>`;
  }

  function palm(x, y, s, color) {
    const lean = s * 0.25;
    let out = `<path d="M${f(x)} ${f(y)} Q${f(x + lean * 0.4)} ${f(y - s * 0.6)} ${f(x + lean)} ${f(y - s)}" stroke="${color}" stroke-width="${f(s * 0.05)}" fill="none" stroke-linecap="round"/>`;
    const cx = x + lean, cy = y - s;
    const fronds = [[-1, 0.15], [-0.75, -0.25], [-0.25, -0.45], [0.3, -0.42], [0.8, -0.2], [1, 0.2]];
    for (const [dx, dy] of fronds) {
      const ex = cx + dx * s * 0.45, ey = cy + dy * s * 0.35 + s * 0.12;
      const mx = cx + dx * s * 0.25, my = cy + dy * s * 0.45 - s * 0.05;
      out += `<path d="M${f(cx)} ${f(cy)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}" stroke="${color}" stroke-width="${f(s * 0.045)}" fill="none" stroke-linecap="round"/>`;
    }
    return out;
  }

  function crane(x, y, h, color) {
    const top = y - h;
    let out = `<g stroke="${color}" stroke-width="1.6" fill="none" opacity="0.9">`;
    out += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(top)}"/>`;
    out += `<line x1="${f(x - 30)}" y1="${f(top + 6)}" x2="${f(x + 95)}" y2="${f(top + 6)}"/>`;
    out += `<line x1="${f(x)}" y1="${f(top - 12)}" x2="${f(x + 95)}" y2="${f(top + 6)}"/>`;
    out += `<line x1="${f(x)}" y1="${f(top - 12)}" x2="${f(x - 30)}" y2="${f(top + 6)}"/>`;
    out += `<line x1="${f(x + 70)}" y1="${f(top + 6)}" x2="${f(x + 70)}" y2="${f(top + 40)}" stroke-width="0.8"/>`;
    for (let yy = y; yy > top + 10; yy -= 12) {
      out += `<line x1="${f(x - 3)}" y1="${f(yy)}" x2="${f(x + 3)}" y2="${f(yy - 12)}" stroke-width="0.7"/>`;
    }
    return out + `<rect x="${f(x - 30)}" y="${f(top + 6)}" width="12" height="8" fill="${color}"/></g>`;
  }

  /* A glass tower. opts.partial (0–1) = how much is built (ongoing). */
  function tower(id, x, w, h, groundY, pal, r, opts = {}) {
    const top = groundY - h;
    const built = opts.partial ? h * opts.partial : h;
    const bTop = groundY - built;
    let defs = gradient(id, [pal.glassA, pal.glassB], false);
    let out = "";

    // crown variants (only drawn when complete)
    const crownType = opts.partial ? "none" : pick(r, ["flat", "setback", "spire", "slant", "setback"]);

    // unbuilt part as a dashed outline
    if (opts.partial) {
      out += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h - built)}" fill="none" stroke="${pal.glassA}" stroke-dasharray="4 4" stroke-width="1" opacity="0.7"/>`;
    }

    out += `<rect x="${f(x)}" y="${f(bTop)}" width="${f(w)}" height="${f(built)}" fill="url(#${id})"/>`;
    out += `<rect x="${f(x + w * 0.68)}" y="${f(bTop)}" width="${f(w * 0.32)}" height="${f(built)}" fill="${pal.side}"/>`;

    // floor lines
    const floor = Math.max(6, w / 9);
    for (let y = bTop + floor; y < groundY - 2; y += floor) {
      out += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + w)}" y2="${f(y)}" stroke="#ffffff" stroke-opacity="0.13" stroke-width="0.7"/>`;
    }
    // mullions
    const cols = Math.max(3, Math.round(w / 14));
    for (let c = 1; c < cols; c++) {
      const xx = x + (w / cols) * c;
      out += `<line x1="${f(xx)}" y1="${f(bTop)}" x2="${f(xx)}" y2="${f(groundY)}" stroke="#000" stroke-opacity="0.12" stroke-width="0.6"/>`;
    }
    // lit windows
    const lit = opts.litChance ?? 0.08;
    for (let y = bTop + floor * 0.25; y < groundY - floor; y += floor) {
      for (let c = 0; c < cols; c++) {
        if (r() < lit) {
          out += `<rect x="${f(x + (w / cols) * c + 1.5)}" y="${f(y + 1)}" width="${f(w / cols - 3)}" height="${f(floor * 0.55)}" fill="${pal.lit}" opacity="${f(range(r, 0.5, 0.95))}"/>`;
        }
      }
    }
    // penthouse glow on top floors
    if (opts.penthouse && !opts.partial) {
      out += `<rect x="${f(x)}" y="${f(top + 2)}" width="${f(w)}" height="${f(floor * 2.2)}" fill="${pal.lit}" opacity="0.55"/>`;
    }

    if (crownType === "setback") {
      const sw = w * 0.62, sh = h * 0.08;
      out += `<rect x="${f(x + (w - sw) / 2)}" y="${f(top - sh)}" width="${f(sw)}" height="${f(sh)}" fill="url(#${id})"/>`;
      out += `<rect x="${f(x + w / 2 - 1)}" y="${f(top - sh - h * 0.05)}" width="2" height="${f(h * 0.05)}" fill="${pal.glassB}"/>`;
    } else if (crownType === "spire") {
      out += `<polygon points="${f(x + w * 0.5 - 2)},${f(top)} ${f(x + w * 0.5)},${f(top - h * 0.18)} ${f(x + w * 0.5 + 2)},${f(top)}" fill="${pal.glassB}"/>`;
    } else if (crownType === "slant") {
      out += `<polygon points="${f(x)},${f(top)} ${f(x + w)},${f(top - w * 0.45)} ${f(x + w)},${f(top)}" fill="url(#${id})"/>`;
    }
    return { defs, out };
  }

  function villa(x, groundY, w, pal, r, opts = {}) {
    const h1 = w * 0.22, h2 = w * 0.2;
    const upperX = x + w * range(r, 0.05, 0.3), upperW = w * range(r, 0.5, 0.65);
    let out = "";
    // ground floor
    out += `<rect x="${f(x)}" y="${f(groundY - h1)}" width="${f(w)}" height="${f(h1)}" fill="${pal.wall}"/>`;
    out += `<rect x="${f(x + w * 0.08)}" y="${f(groundY - h1 * 0.82)}" width="${f(w * 0.55)}" height="${f(h1 * 0.82)}" fill="${pal.glassB}" opacity="0.85"/>`;
    for (let i = 1; i < 5; i++) {
      out += `<line x1="${f(x + w * 0.08 + (w * 0.55 / 5) * i)}" y1="${f(groundY - h1 * 0.82)}" x2="${f(x + w * 0.08 + (w * 0.55 / 5) * i)}" y2="${f(groundY)}" stroke="${pal.wall}" stroke-width="1.2"/>`;
    }
    out += `<rect x="${f(x + w * 0.72)}" y="${f(groundY - h1)}" width="${f(w * 0.28)}" height="${f(h1)}" fill="${pal.wallShade}"/>`;
    // slab
    out += `<rect x="${f(x - w * 0.04)}" y="${f(groundY - h1 - 4)}" width="${f(w * 1.08)}" height="5" fill="${pal.wallShade}"/>`;
    // upper floor
    const uy = groundY - h1 - 4 - h2;
    out += `<rect x="${f(upperX)}" y="${f(uy)}" width="${f(upperW)}" height="${f(h2)}" fill="${pal.wall}"/>`;
    out += `<rect x="${f(upperX + upperW * 0.1)}" y="${f(uy + h2 * 0.18)}" width="${f(upperW * 0.55)}" height="${f(h2 * 0.64)}" fill="${pal.glassA}" opacity="0.9"/>`;
    if (opts.lit) out += `<rect x="${f(upperX + upperW * 0.1)}" y="${f(uy + h2 * 0.18)}" width="${f(upperW * 0.55)}" height="${f(h2 * 0.64)}" fill="${pal.lit}" opacity="0.45"/>`;
    out += `<rect x="${f(upperX - w * 0.05)}" y="${f(uy - 5)}" width="${f(upperW + w * 0.1)}" height="5" fill="${pal.wallShade}"/>`;
    // pool
    if (opts.pool) {
      out += `<rect x="${f(x + w * 0.05)}" y="${f(groundY + 6)}" width="${f(w * 0.6)}" height="10" fill="#7cc4d6" opacity="0.85"/>`;
    }
    return out;
  }

  function townhouses(x, groundY, w, pal, r, count) {
    const uw = w / count;
    let out = "";
    for (let i = 0; i < count; i++) {
      const ux = x + i * uw;
      const h = uw * range(r, 0.95, 1.25);
      const shade = i % 2 ? pal.wallShade : pal.wall;
      out += `<rect x="${f(ux)}" y="${f(groundY - h)}" width="${f(uw)}" height="${f(h)}" fill="${shade}" stroke="${pal.wallShade}" stroke-width="0.8"/>`;
      out += `<rect x="${f(ux + uw * 0.15)}" y="${f(groundY - h * 0.85)}" width="${f(uw * 0.7)}" height="${f(h * 0.3)}" fill="${pal.glassA}" opacity="0.9"/>`;
      out += `<rect x="${f(ux + uw * 0.15)}" y="${f(groundY - h * 0.42)}" width="${f(uw * 0.35)}" height="${f(h * 0.42)}" fill="${pal.glassB}" opacity="0.85"/>`;
      out += `<rect x="${f(ux - 2)}" y="${f(groundY - h - 4)}" width="${f(uw + 4)}" height="4" fill="${pal.wallShade}"/>`;
      if (r() < 0.35) out += `<rect x="${f(ux + uw * 0.15)}" y="${f(groundY - h * 0.85)}" width="${f(uw * 0.7)}" height="${f(h * 0.3)}" fill="${pal.lit}" opacity="0.4"/>`;
    }
    return out;
  }

  function backdrop(W, H, groundY, pal, r, water, sunX) {
    let defs = gradient("sky", pal.sky) + gradient("sea", pal.water);
    let out = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
    // sun / moon
    const sx = sunX ?? range(r, W * 0.15, W * 0.85), sy = range(r, H * 0.12, H * 0.32), sr = range(r, W * 0.05, W * 0.08);
    out += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 2.4)}" fill="${pal.sun}" opacity="0.18"/>`;
    out += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${pal.sun}" opacity="0.95"/>`;
    // hazy distant skyline
    let x = -10;
    while (x < W) {
      const bw = range(r, W * 0.03, W * 0.08), bh = range(r, H * 0.06, H * 0.26);
      out += `<rect x="${f(x)}" y="${f(groundY - bh)}" width="${f(bw)}" height="${f(bh)}" fill="${pal.haze}" opacity="0.55"/>`;
      x += bw + range(r, 0, W * 0.015);
    }
    // ground or water
    if (water) {
      out += `<rect x="0" y="${f(groundY)}" width="${W}" height="${f(H - groundY)}" fill="url(#sea)"/>`;
      for (let i = 0; i < 14; i++) {
        const ly = range(r, groundY + 6, H - 4), lx = range(r, 0, W), lw = range(r, 20, W * 0.25);
        out += `<line x1="${f(lx)}" y1="${f(ly)}" x2="${f(lx + lw)}" y2="${f(ly)}" stroke="#fff" stroke-opacity="${f(range(r, 0.08, 0.25))}" stroke-width="1"/>`;
      }
    } else {
      out += `<rect x="0" y="${f(groundY)}" width="${W}" height="${f(H - groundY)}" fill="${pal.ground}"/>`;
      out += `<rect x="0" y="${f(groundY)}" width="${W}" height="3" fill="#000" opacity="0.12"/>`;
    }
    return { defs, out };
  }

  function toCss(svg) {
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }

  /* ---------- public: one project picture (4:5 by default, or {w, h}) ---------- */
  function project(p, opts = {}) {
    const r = rng(hash(p.name + (p.type || "")));
    const W = opts.w || 400, H = opts.h || 500;
    const S = Math.min(W, H * 0.8), ox = (W - S) / 2;   // subject width + offset (wide banners)
    const mood = pick(r, ["dusk", "day", "dawn", "night", "dusk", "day"]);
    const pal = PALETTES[mood];
    const groundY = H * (p.water ? 0.8 : 0.84);
    const night = mood === "night" || mood === "dusk";
    const bg = backdrop(W, H, groundY, pal, r, p.water);
    let defs = bg.defs, out = bg.out;

    const type = (p.type || "").toLowerCase();
    const ongoing = p.status === "ongoing";
    const isNew = p.status === "new";

    let subj = "";
    if (type.includes("villa")) {
      subj += villa(S * 0.12, groundY, S * 0.76, pal, r, { pool: p.water || r() < 0.4, lit: night });
      subj += palm(S * 0.08, groundY, 120, pal.palm) + palm(S * 0.9, groundY, 100, pal.palm);
    } else if (type.includes("town")) {
      subj += townhouses(S * 0.06, groundY, S * 0.88, pal, r, 4 + Math.floor(r() * 2));
      subj += palm(S * 0.05, groundY, 95, pal.palm) + palm(S * 0.95, groundY, 85, pal.palm);
    } else {
      // towers: 1–3 depending on type
      const sky = type.includes("sky");
      const count = sky ? 1 + Math.floor(r() * 2) : 2 + Math.floor(r() * 2);
      const gap = S * 0.05;
      const totalW = S * (count === 1 ? 0.3 : count === 2 ? 0.55 : 0.72);
      const tw = (totalW - gap * (count - 1)) / count;
      let x = (S - totalW) / 2;
      for (let i = 0; i < count; i++) {
        const h = (sky ? range(r, 0.62, 0.75) : range(r, 0.42, 0.62)) * groundY * (i === Math.floor(count / 2) ? 1.08 : 1);
        const t = tower(`g${i}`, x, tw, h, groundY, pal, r, {
          partial: ongoing && i === count - 1 ? range(r, 0.55, 0.75) : 0,
          penthouse: type.includes("pent"),
          litChance: night ? 0.16 : 0.05
        });
        defs += t.defs; subj += t.out;
        if (ongoing && i === count - 1) subj += crane(x + tw * 0.5, groundY - h * 0.2, h * 0.95, pal.glassB);
        x += tw + gap;
      }
      subj += palm(S * 0.1, groundY, 70, pal.palm) + palm(S * 0.9, groundY, 64, pal.palm);
    }

    out += `<g transform="translate(${f(ox)} 0)">${subj}</g>`;

    // reflections on water
    if (p.water) {
      out += `<rect x="0" y="${f(groundY)}" width="${W}" height="${f((H - groundY) * 0.6)}" fill="${pal.lit}" opacity="0.05"/>`;
    }
    // "New Launch" = architectural render feel: soft white veil + plan grid
    if (isNew) {
      out += `<rect width="${W}" height="${H}" fill="#fff" opacity="0.06"/>`;
      for (let gx = 0; gx <= W; gx += 40) out += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="#fff" stroke-opacity="0.05"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${out}</svg>`;
    return toCss(svg);
  }

  /* ---------- public: wide skyline (hero, Join Us) ---------- */
  function skyline(opts = {}) {
    const r = rng(hash(opts.seed || "skyline"));
    const W = 1600, H = opts.height || 900;
    const pal = PALETTES[opts.mood || "dusk"];
    const groundY = H * 0.78;
    const bg = backdrop(W, H, groundY, pal, r, true, opts.sunX ?? W * 0.8);
    let defs = bg.defs, out = bg.out;
    let x = 20, i = 0;
    while (x < W - 40) {
      const tw = range(r, 50, 110);
      const hero = i === 6;                        // one landmark tower
      const h = hero ? groundY * 0.88 : range(r, 0.22, 0.6) * groundY;
      const t = tower(`s${i}`, x, tw, h, groundY, pal, r, { litChance: opts.mood === "night" ? 0.18 : 0.1 });
      defs += t.defs; out += t.out;
      x += tw + range(r, 8, 40);
      i++;
    }
    for (let k = 0; k < 7; k++) out += palm(range(r, 0, W), groundY + 4, range(r, 60, 90), pal.palm);
    out += `<rect x="0" y="${f(groundY)}" width="${W}" height="${f(H - groundY)}" fill="${pal.lit}" opacity="0.05"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${out}</svg>`;
    return opts.raw ? svg : toCss(svg);
  }


  /* ---------- public: interior scene (living room) ---------- */
  function interior(seed = "room") {
    const r = rng(hash(seed + "-interior"));
    const W = 400, H = 470;
    const walls = [["#ece6dc", "#d9d0c2"], ["#e6ded3", "#cfc3b2"], ["#efe9e1", "#ddd3c6"]];
    const [wall, wallShade] = pick(r, walls);
    const sofa = pick(r, ["#f1ece4", "#e3dccf", "#d8cbb8"]);
    const wood = pick(r, ["#9b7653", "#8a6a4c", "#b08a63"]);
    const floorY = H * 0.74;
    let o = `<rect width="${W}" height="${H}" fill="${wall}"/>`;
    o += `<rect x="${W * 0.62}" width="${W * 0.38}" height="${floorY}" fill="${wallShade}" opacity="0.45"/>`;
    // window with light
    o += `<rect x="${W * 0.08}" y="${H * 0.1}" width="${W * 0.3}" height="${H * 0.42}" fill="#f8f4ec" stroke="${wallShade}" stroke-width="6"/>`;
    o += `<line x1="${W * 0.23}" y1="${H * 0.1}" x2="${W * 0.23}" y2="${H * 0.52}" stroke="${wallShade}" stroke-width="3"/>`;
    o += `<polygon points="${W * 0.08},${floorY} ${W * 0.38},${floorY} ${W * 0.6},${H} ${W * 0.0},${H}" fill="#fff" opacity="0.18"/>`;
    // fireplace or art
    if (r() < 0.6) {
      o += `<rect x="${W * 0.52}" y="${H * 0.12}" width="${W * 0.3}" height="${floorY - H * 0.12}" fill="${wallShade}"/>`;
      o += `<rect x="${W * 0.57}" y="${H * 0.5}" width="${W * 0.2}" height="${H * 0.12}" fill="#2a2522"/>`;
      o += `<path d="M${W * 0.62} ${H * 0.62} q8 -24 14 -6 q6 -22 12 4 q4 -12 8 2 z" fill="#e0662f"/>`;
    } else {
      o += `<rect x="${W * 0.55}" y="${H * 0.18}" width="${W * 0.24}" height="${H * 0.28}" fill="#c9b49a"/>`;
      o += `<circle cx="${W * 0.67}" cy="${H * 0.3}" r="${W * 0.06}" fill="#9a7b51" opacity="0.7"/>`;
    }
    // floor
    o += `<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="${wood}" opacity="0.55"/>`;
    // sofa
    const sx = W * 0.14, sy = floorY - H * 0.18, sw = W * 0.62;
    o += `<rect x="${sx}" y="${sy}" width="${sw}" height="${H * 0.14}" rx="10" fill="${sofa}"/>`;
    o += `<rect x="${sx - 10}" y="${sy + H * 0.06}" width="${sw + 20}" height="${H * 0.13}" rx="10" fill="${sofa}" stroke="#00000014"/>`;
    o += `<rect x="${sx + 20}" y="${sy + 8}" width="46" height="34" rx="6" fill="#9c8a72"/>`;
    o += `<rect x="${sx + sw - 70}" y="${sy + 8}" width="46" height="34" rx="6" fill="#b5926a"/>`;
    // coffee table
    o += `<rect x="${W * 0.26}" y="${floorY + 16}" width="${W * 0.4}" height="14" fill="${wood}"/>`;
    o += `<rect x="${W * 0.28}" y="${floorY + 30}" width="${W * 0.36}" height="30" fill="${wood}" opacity="0.8"/>`;
    o += `<rect x="${W * 0.36}" y="${floorY + 4}" width="10" height="14" fill="#f2efe9"/>`;
    // plant
    const px = W * 0.88;
    o += `<path d="M${px - 16} ${floorY + 30} h32 l-5 -46 h-22 z" fill="#6b5b4d"/>`;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32;
      o += `<line x1="${px}" y1="${floorY - 16}" x2="${f(px + Math.cos(a) * 70)}" y2="${f(floorY - 16 + Math.sin(a) * 90)}" stroke="#5a5040" stroke-width="2"/>`;
      o += `<circle cx="${f(px + Math.cos(a) * 70)}" cy="${f(floorY - 16 + Math.sin(a) * 90)}" r="5" fill="#7d6f5a"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${o}</svg>`;
    return toCss(svg);
  }

  /* ---------- public: gold brush stroke ---------- */
  function brush(color = "#e2bd62") {
    const r = rng(hash("brush"));
    let o = `<path d="M20 120 C60 40 160 20 250 30 C300 36 300 80 270 110 C240 140 160 150 90 160 C50 166 10 150 20 120 Z" fill="${color}" opacity="0.92"/>`;
    for (let i = 0; i < 26; i++) {
      const y = range(r, 30, 160), x1 = range(r, 10, 80), x2 = range(r, 200, 310);
      o += `<line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y + range(r, -30, 10))}" stroke="${color}" stroke-width="${f(range(r, 1, 4))}" stroke-linecap="round" opacity="${f(range(r, 0.4, 0.9))}"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190">${o}</svg>`;
    return toCss(svg);
  }

  window.Art = { project, skyline, interior, brush };
})();
