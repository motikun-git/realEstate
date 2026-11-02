/* =========================================================================
   LAYOUT  —  shared by every page: header, full-screen menu, theme toggle,
   footer, WhatsApp button, scroll animations, forms and helpers (IE.*).
   ========================================================================= */

(function () {
  const SITE = window.SITE;
  const DATA = window.MARKET_DATA;
  const STATUS = DATA.statuses;
  const PAGE = document.body.dataset.page || "";

  /* ---------------- helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
  const money = (n) => `${DATA.currency} ${fmt(n)}`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const params = new URLSearchParams(location.search);

  function rng(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- project data ---------------- */
  const ALL = DATA.cities.flatMap((city) =>
    city.areas.flatMap((area) =>
      area.projects.map((p) => ({ ...p, id: p.id || slug(p.name), area, city, water: area.water }))
    )
  );
  const findProject = (id) => ALL.find((p) => p.id === id);
  const projectUrl = (p) => `project.html?id=${encodeURIComponent(p.id)}`;
  const art = (p, size) => (p.image ? `url("${esc(p.image)}")` : Art.project(p, size));
  const rate = (p) => p.area.rates[p.status];

  const AMENITIES = {
    tower: ["Infinity pool", "Residents' gym", "Concierge lobby", "Covered parking", "Kids' play area", "Landscaped podium", "24/7 security", "Smart home ready"],
    villa: ["Private garden", "Private pool option", "Community clubhouse", "Cycling & jogging tracks", "Parks & play areas", "Gated security", "Maid's room", "Two-car garage"],
    town: ["Community pool", "Family parks", "Clubhouse & gym", "Retail nearby", "Gated security", "Covered parking", "Cycling tracks", "Schools nearby"]
  };

  /* "At a glance" facts. Anything written in data.js under details: {...}
     wins; the rest is filled with demo values based on the building type. */
  function details(p) {
    const r = rng(p.name);
    const between = (a, b, step = 1) => Math.round((a + r() * (b - a)) / step) * step;
    const type = p.type.toLowerCase();
    let d, kind = "tower";
    if (type.includes("villa")) {
      kind = "villa";
      const units = between(24, 140, 2);
      d = { height: "G + 1", units, parking: `${units * 2} (2 per villa)`, sizes: [between(3200, 4200, 50), between(5200, 7500, 50)], beds: [4, 6], unitTypes: "4 – 6 Bed villas", plot: `${between(8, 40)} acres` };
    } else if (type.includes("town")) {
      kind = "town";
      const units = between(40, 220, 2);
      d = { height: "G + 2", units, parking: `${units * 2} (2 per home)`, sizes: [between(1850, 2300, 50), between(2700, 3400, 50)], beds: [3, 4], unitTypes: "3 – 4 Bed townhouses", plot: `${between(5, 25)} acres` };
    } else if (type.includes("pent")) {
      const units = between(60, 160);
      d = { height: `G + ${between(28, 48)}`, units, parking: `${units * 2}`, sizes: [between(2400, 3200, 50), between(5500, 8000, 50)], beds: [3, 5], unitTypes: "3 – 5 Bed residences & penthouses", plot: `${fmt(between(30000, 60000, 500))} sq ft` };
    } else if (type.includes("sky")) {
      const units = between(260, 620);
      d = { height: `G + 4P + ${between(40, 72)}`, units, parking: `${Math.round(units * 1.3)}`, sizes: [between(600, 800, 10), between(2200, 3000, 50)], beds: [1, 4], unitTypes: "1 – 4 Bed apartments", plot: `${fmt(between(35000, 80000, 500))} sq ft` };
    } else {
      const units = between(120, 460);
      d = { height: `G + 2P + ${between(12, 32)}`, units, parking: `${Math.round(units * 1.2)}`, sizes: [between(420, 520, 10), between(1500, 2100, 50)], beds: [0, 3], unitTypes: "Studio – 3 Bed apartments", plot: `${fmt(between(20000, 55000, 500))} sq ft` };
    }
    return {
      intro: `${p.name} brings ${p.type.toLowerCase()} to ${p.area.name}, ${p.city.name}. ${p.area.blurb} Thoughtful layouts, generous light and resort-style amenities make it as easy to live in as it is to invest in.`,
      location: `${p.area.name}, ${p.city.name}, UAE`,
      plot: d.plot,
      height: d.height,
      units: typeof d.units === "number" ? `${fmt(d.units)} Nos` : d.units,
      parking: d.parking,
      unitTypes: d.unitTypes,
      beds: d.beds,
      sizes: d.sizes,
      sizeText: `${fmt(d.sizes[0])} – ${fmt(d.sizes[1])} sq ft (Approx.)`,
      handover: p.handover,
      amenities: AMENITIES[kind],
      ...(p.details || {})
    };
  }


  /* ---------------- homes: kind, bedrooms and price range of a project ----------------
     Used by the search bar and the cards. beds 0 = studio.
     Price for a bedroom count = rate x a size between the smallest and largest home. */
  const KINDS = { apartment: "Apartment", villa: "Villa", townhouse: "Townhouse", penthouse: "Penthouse" };
  function kindOf(p) {
    const t = p.type.toLowerCase();
    if (t.includes("villa")) return "villa";
    if (t.includes("town")) return "townhouse";
    if (t.includes("pent")) return "penthouse";
    return "apartment";
  }
  const homesCache = new Map();
  function homes(p) {
    if (homesCache.has(p.id)) return homesCache.get(p.id);
    const d = details(p), r = rate(p);
    const [b0, b1] = d.beds || [1, 3], [s0, s1] = d.sizes || [800, 2000];
    const sizeFor = (b) => (b1 === b0 ? s0 : Math.round(s0 + (s1 - s0) * (Math.min(Math.max(b, b0), b1) - b0) / (b1 - b0)));
    const h = { kind: kindOf(p), beds: [b0, b1], sizes: [s0, s1], from: r * s0, to: r * s1, sizeFor, priceFor: (b) => r * sizeFor(b) };
    homesCache.set(p.id, h);
    return h;
  }
  const bedLabel = (b) => (b === 0 ? "Studio" : `${b} Bed`);
  const bedsText = (h) => (h.beds[0] === h.beds[1] ? bedLabel(h.beds[0]) : `${h.beds[0] === 0 ? "Studio" : h.beds[0]} – ${h.beds[1]} Bed`);
  function shortMoney(n) {
    const cur = DATA.currency;
    if (n >= 1e6) return `${cur} ${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "")}M`;
    if (n >= 1e3) return `${cur} ${Math.round(n / 1e3)}K`;
    return `${cur} ${fmt(n)}`;
  }

  /* Project card (projects grid, "more projects") */
  function card(p, { delay = 0, estimate = false, picked = false, beds = null } = {}) {
    const h = homes(p);
    const from = beds === null ? h.from : h.priceFor(beds);
    const homesLine = beds === null ? bedsText(h) : bedLabel(Math.min(Math.max(beds, h.beds[0]), h.beds[1]));
    return `
      <article class="pcard ${picked ? "is-picked" : ""}" style="animation-delay:${delay}ms">
        <a class="pcard__media" href="${projectUrl(p)}" aria-label="View details of ${esc(p.name)}">
          <span class="pcard__img" style='background-image:${art(p)}'></span>
          <span class="badge badge--${p.status}">${STATUS[p.status].label}</span>
          <span class="pcard__meta">${esc(p.area.name)} || ${esc(p.type)}</span>
          <span class="view-dot" aria-hidden="true">View<br>Details</span>
        </a>
        <div class="pcard__body">
          <h3 class="pcard__title"><a href="${projectUrl(p)}">${esc(p.name)}</a></h3>
          <p class="pcard__homes">${esc(homesLine)} · from <b>${shortMoney(from)}</b></p>
          <div class="pcard__row">
            <p class="pcard__price">${money(rate(p))} <small>/ sq ft</small></p>
            ${estimate ? `<button class="link-btn" type="button" data-estimate="${esc(p.id)}">Estimate cost &rarr;</button>` : `<a class="link-btn" href="${projectUrl(p)}">Details &rarr;</a>`}
          </div>
        </div>
      </article>`;
  }

  // The "View Details" circle follows the mouse over an image
  function initViewDot(root = document) {
    root.addEventListener("pointermove", (e) => {
      const m = e.target.closest?.("[data-dot], .pcard__media");
      if (!m) return;
      const b = m.getBoundingClientRect();
      m.style.setProperty("--x", `${e.clientX - b.left}px`);
      m.style.setProperty("--y", `${e.clientY - b.top}px`);
    });
  }

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 3600);
  }

  /* ---------------- scroll animations ----------------
     .reveal        fade up
     .reveal-left   slide in from the left edge
     .reveal-right  slide in from the right edge
     .reveal-zoom   image un-masks and settles               */
  /* .reveal-group     a wrapper; when it scrolls into view every animated
                       child inside it starts together (used for clipped images) */
  const REVEAL = ".reveal, .reveal-left, .reveal-right, .reveal-zoom";
  let revealIO;
  function reveal(root = document) {
    if (!revealIO) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          if (en.target.classList.contains("reveal-group")) $$(REVEAL, en.target).forEach((el) => el.classList.add("is-in"));
          revealIO.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    }
    $$(".reveal-group", root).filter((el) => !el.classList.contains("is-in")).forEach((el) => revealIO.observe(el));
    $$(REVEAL, root)
      .filter((el) => !el.classList.contains("is-in") && !el.closest(".reveal-group"))
      .forEach((el) => revealIO.observe(el));
  }

  /* ---------------- forms (no database yet) ---------------- */
  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach((el) => {
      const bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  /* Sends a form according to SITE.forms.mode. `fields` is an object of
     label -> value. Returns true when the message was handed off. */
  async function sendForm(subject, fields) {
    const lines = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    const body = lines.join("\n");
    const mode = SITE.forms?.mode || "mailto";
    if (mode === "endpoint" && SITE.forms.endpoint) {
      try {
        const res = await fetch(SITE.forms.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ subject, ...fields })
        });
        if (!res.ok) throw new Error(res.status);
        return true;
      } catch {
        toast("Sorry, we couldn't send that. Please call or email us instead.");
        return false;
      }
    }
    if (mode === "whatsapp" && SITE.contact.whatsapp) {
      const text = `${subject}\n\n${body}`;
      window.open(`https://wa.me/${SITE.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      return true;
    }
    location.href = `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return true;
  }

  /* ---------------- theme ---------------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }
  };
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $$(".theme-toggle").forEach((b) => {
      b.setAttribute("aria-pressed", theme === "dark");
      b.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  /* ---------------- header + menu ---------------- */
  const logo = (cls = "") => `
    <a href="index.html" class="logo ${cls}" aria-label="${esc(SITE.brand)} home">
      <span class="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40"><path d="M6 33 L20 9 L34 33" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M13 33 L20 21 L27 33" fill="var(--accent)"/><circle cx="29" cy="11" r="3" fill="var(--accent)"/></svg>
      </span>
      <span class="logo__text"><span class="logo__main">${esc(SITE.shortBrand)}</span><span class="logo__sub">${esc(SITE.subBrand)}</span></span>
    </a>`;

  const NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "about", label: "About Us", href: "about.html" },
    {
      key: "projects", label: "Projects", href: "projects.html",
      sub: Object.entries(STATUS).map(([k, s]) => ({ label: s.label, href: `projects.html?status=${k}` }))
    },
    {
      key: "explorer", label: "Price Explorer", href: "index.html#explorer",
      sub: DATA.cities.map((c) => ({ label: c.name, href: `index.html?city=${c.id}#explorer` }))
    },
    {
      key: "contact", label: "Contact Us", href: "contact.html",
      sub: [
        { label: "As a Buyer", href: "contact.html?type=buyer" },
        { label: "As a Broker", href: "contact.html?type=broker" },
        { label: "Careers", href: "contact.html?type=career" }
      ]
    }
  ];

  function renderHeader() {
    const header = $("#header");
    if (!header) return;
    header.innerHTML = `
      <div class="header__inner">
        ${logo()}
        <div class="header__right">
          <button class="theme-toggle" type="button">
            <svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>
            <svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>
          </button>
          <a class="pill pill--line header__cta" href="contact.html">Get In Touch</a>
          <button class="pill pill--solid menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">
            <span class="menu-btn__lines" aria-hidden="true"><i></i><i></i></span><span>Menu</span>
          </button>
        </div>
      </div>`;

    const picFor = (i) => {
      const pool = ALL.filter((p) => p.featured);
      return art(pool[i % pool.length], { w: 600, h: 720 });
    };
    const c = SITE.contact;
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.id = "menu";
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("aria-label", "Site menu");
    menu.innerHTML = `
      <div class="menu__left">
        <div class="menu__top">${logo("logo--menu")}<div class="menu__actions"><button class="theme-toggle" type="button">
            <svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>
            <svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>
          </button><button class="pill pill--line menu__close" type="button">Close <span aria-hidden="true">&times;</span></button></div></div>
        <nav class="menu__nav" aria-label="Main">
          ${NAV.map((n, i) => `
            <div class="menu__item" data-pic="${i}">
              <a class="menu__link ${n.key === PAGE ? "is-current" : ""}" href="${n.href}">${n.label}</a>
              ${n.sub ? `<div class="menu__sub">${n.sub.map((s) => `<a href="${s.href}">${esc(s.label)}</a>`).join("")}</div>` : ""}
            </div>`).join("")}
        </nav>
      </div>
      <aside class="menu__right">
        <div class="menu__pic" aria-hidden="true">${NAV.map((_, i) => `<span style='background-image:${picFor(i)}' class="${i === 0 ? "is-on" : ""}"></span>`).join("")}</div>
        <ul class="menu__contact">
          <li><span>Call</span><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ""))}">${esc(c.phone)}</a></li>
          <li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
          <li><span>Office</span>${esc(c.address)}</li>
        </ul>
      </aside>`;
    document.body.append(menu);

    const btn = $("#menuBtn");
    const pics = $$(".menu__pic span", menu);
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", !open);
      menu.inert = !open;
      btn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("no-scroll", open);
      if (open) $(".menu__close", menu).focus();
    };
    menu.inert = true;
    btn.addEventListener("click", () => setMenu(true));
    $(".menu__close", menu).addEventListener("click", () => { setMenu(false); btn.focus(); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    menu.addEventListener("pointerover", (e) => {
      const item = e.target.closest(".menu__item");
      if (item) pics.forEach((p, i) => p.classList.toggle("is-on", i === +item.dataset.pic));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); btn.focus(); }
    });

    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const saved = store.get("ie-theme");
    applyTheme(saved === "dark" || saved === "light" ? saved : SITE.defaultTheme || "light");
    $$(".theme-toggle").forEach((b) => b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("ie-theme", next);
    }));
  }

  /* ---------------- footer ---------------- */
  const ICONS = {
    facebook: '<path d="M14 8h2V5h-2.5C11 5 10 6.6 10 9v2H8v3h2v7h3v-7h2.4l.6-3h-3V9.3c0-.8.3-1.3 1-1.3z" fill="currentColor"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor"/>',
    linkedin: '<path d="M6.5 9.5h3v9h-3zM8 5a1.7 1.7 0 110 3.4A1.7 1.7 0 018 5zm3.5 4.5h2.9v1.3c.4-.8 1.4-1.5 2.9-1.5 3 0 3.5 1.9 3.5 4.4v4.8h-3v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.4h-3z" fill="currentColor"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor"/>'
  };
  const socials = () => Object.entries(SITE.socials)
    .filter(([k, url]) => url && ICONS[k])
    .map(([k, url]) => `<a href="${esc(url)}" aria-label="${k}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></a>`).join("");

  function renderFooter() {
    const foot = $("#footer");
    if (!foot) return;
    const c = SITE.contact;
    foot.innerHTML = `
      <div class="container footer__cta">
        <h2 class="title title--lg"><b>Let's find</b> <em>your next home</em></h2>
        <div class="footer__cta-btns">
          <a class="pill pill--solid pill--lg" href="contact.html">Get In Touch</a>
          <a class="pill pill--line pill--lg" href="projects.html">View Projects</a>
        </div>
      </div>
      <div class="container footer__grid">
        <div class="footer__brand">
          ${logo()}
          <p class="footer__tag">${esc(SITE.tagline)}.</p>
          <p>Homes and communities across Dubai, Abu Dhabi, Sharjah and Ras Al Khaimah.</p>
          <div class="socials">${socials()}</div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul class="footer__links">${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h4>Emirates</h4>
          <ul class="footer__links">${DATA.cities.map((x) => `<li><a href="projects.html?city=${x.id}">${esc(x.name)}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="footer__contact">
            <li><span>Phone</span><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ""))}">${esc(c.phone)}</a></li>
            <li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
            <li><span>Office</span>${c.mapUrl ? `<a href="${esc(c.mapUrl)}" target="_blank" rel="noopener">${esc(c.address)}</a>` : esc(c.address)}</li>
            <li><span>Hours</span>${esc(c.hours)}</li>
          </ul>
        </div>
      </div>
      <div class="container footer__bottom">
        <p>&copy; ${new Date().getFullYear()} ${esc(SITE.brand)}. All rights reserved.</p>
        <p class="footer__disclaimer">Prices, sizes and project details are estimates for guidance only and may change. Final figures are confirmed at reservation.</p>
      </div>`;
  }

  /* ---------------- WhatsApp button ---------------- */
  function renderWhatsApp() {
    const num = (SITE.contact.whatsapp || "").replace(/\D/g, "");
    const a = document.createElement("a");
    a.className = "wa";
    a.setAttribute("aria-label", num ? "Chat on WhatsApp" : "Contact us");
    if (num) {
      a.href = `https://wa.me/${num}?text=${encodeURIComponent(`Hello ${SITE.brand}, I'd like to know more about your projects.`)}`;
      a.target = "_blank"; a.rel = "noopener";
    } else {
      a.href = "contact.html";
    }
    a.innerHTML = `<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16 3.5A12.4 12.4 0 005.3 22.3L3.6 28.5l6.4-1.7A12.4 12.4 0 1016 3.5zm0 22.6c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.8 1 1-3.7-.2-.4A10.2 10.2 0 1116 26.1zm5.6-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.1-.4.2-.7 0a8.4 8.4 0 01-4.2-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.3c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7 6.3 6.3 0 001.3 3.3c.2.2 2.2 3.4 5.4 4.7 2 .9 2.8.9 3.8.8.6-.1 1.8-.8 2.1-1.5s.3-1.3.2-1.5-.4-.2-.7-.4z"/></svg>`;
    document.body.append(a);
  }

  /* ---------------- decorative backgrounds ---------------- */
  function decorate() {
    $$("[data-leaf]").forEach((el) => el.style.setProperty("--leaf", Art.leaf("#8a7a62")));
    $$("[data-dust]").forEach((el) => el.style.setProperty("--dust", Art.dust()));
  }

  /* ---------------- start ---------------- */
  renderHeader();
  renderFooter();
  renderWhatsApp();
  decorate();

  window.IE = {
    $, $$, fmt, money, esc, slug, params, ALL, findProject, projectUrl, art, rate, details, card,
    homes, KINDS, bedLabel, bedsText, shortMoney, initViewDot, toast, reveal, validate, sendForm, STATUS, DATA, SITE
  };
})();
