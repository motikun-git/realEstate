/* =========================================================================
   LAYOUT  —  shared by every page: header, full-screen menu, dark/light
   theme, footer, WhatsApp button, scroll-reveal and small helpers (IE.*).
   ========================================================================= */

(function () {
  const SITE = window.SITE;
  const DATA = window.MARKET_DATA;
  const STATUS = DATA.statuses;

  /* ---------------- helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
  const money = (n) => `${DATA.currency} ${fmt(n)}`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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

  // Every project, with its id, area and city attached
  const ALL = DATA.cities.flatMap((city) =>
    city.areas.flatMap((area) =>
      area.projects.map((p) => ({ ...p, id: p.id || slug(p.name), area, city, water: area.water }))
    )
  );
  const findProject = (id) => ALL.find((p) => p.id === id);

  /* "At a glance" facts for a project.
     Anything you write in data.js under  details: { ... }  wins; the rest
     is filled with sensible demo values based on the building type. */
  function details(p) {
    const r = rng(p.name);
    const between = (a, b, step = 1) => Math.round((a + r() * (b - a)) / step) * step;
    const type = p.type.toLowerCase();
    let d;
    if (type.includes("villa")) {
      const units = between(24, 140, 2);
      d = { height: "G + 1", units, parking: `${units * 2} (2 per villa)`, sizes: [between(3200, 4200, 50), between(5200, 7500, 50)], unitTypes: "4 – 6 Bed villas", plot: `${between(8, 40)} acres` };
    } else if (type.includes("town")) {
      const units = between(40, 220, 2);
      d = { height: "G + 2", units, parking: `${units * 2} (2 per home)`, sizes: [between(1850, 2300, 50), between(2700, 3400, 50)], unitTypes: "3 – 4 Bed townhouses", plot: `${between(5, 25)} acres` };
    } else if (type.includes("pent")) {
      const floors = between(28, 48);
      const units = between(60, 160);
      d = { height: `G + ${floors}`, units, parking: `${Math.round(units * 2)}`, sizes: [between(2400, 3200, 50), between(5500, 8000, 50)], unitTypes: "3 – 5 Bed residences & penthouses", plot: `${fmt(between(30000, 60000, 500))} sq ft` };
    } else if (type.includes("sky")) {
      const floors = between(40, 72);
      const units = between(260, 620);
      d = { height: `G + 4P + ${floors}`, units, parking: `${Math.round(units * 1.3)}`, sizes: [between(600, 800, 10), between(2200, 3000, 50)], unitTypes: "1 – 4 Bed apartments", plot: `${fmt(between(35000, 80000, 500))} sq ft` };
    } else {
      const floors = between(12, 32);
      const units = between(120, 460);
      d = { height: `G + 2P + ${floors}`, units, parking: `${Math.round(units * 1.2)}`, sizes: [between(420, 520, 10), between(1500, 2100, 50)], unitTypes: "Studio – 3 Bed apartments", plot: `${fmt(between(20000, 55000, 500))} sq ft` };
    }
    const intro = `${p.name} brings ${p.type.toLowerCase()} to ${p.area.name}, ${p.city.name}. ${p.area.blurb} Thoughtful layouts, generous light and resort-style amenities make it as easy to live in as it is to invest in.`;
    return {
      intro,
      location: `${p.area.name}, ${p.city.name}, UAE`,
      plot: d.plot,
      height: d.height,
      units: typeof d.units === "number" ? `${fmt(d.units)} Nos` : d.units,
      parking: d.parking,
      unitTypes: d.unitTypes,
      sizes: d.sizes,
      sizeText: `${fmt(d.sizes[0])} – ${fmt(d.sizes[1])} sq ft (Approx.)`,
      handover: p.handover,
      ...(p.details || {})
    };
  }

  /* Project card — used on the home page and the project page */
  function card(p, { estimate = false, delay = 0, picked = false } = {}) {
    const art = p.image ? `url("${esc(p.image)}")` : Art.project(p);
    const rate = p.area.rates[p.status];
    return `
      <article class="pcard ${picked ? "is-picked" : ""}" style="animation-delay:${delay}ms">
        <a class="pcard__media" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="View details of ${esc(p.name)}">
          <span class="pcard__img" style='background-image:${art}'></span>
          <span class="pcard__badge pcard__badge--${p.status}">${STATUS[p.status].label}</span>
          <span class="pcard__meta">${esc(p.area.name)} || ${esc(p.type)} || ${STATUS[p.status].label}</span>
          <span class="pcard__view" aria-hidden="true">View<br>Details</span>
        </a>
        <div class="pcard__body">
          <h3 class="pcard__title"><a href="project.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
          <div class="pcard__row">
            <p class="pcard__price">${money(rate)} <small>/ sq ft</small></p>
            ${estimate ? `<button class="pcard__est" data-estimate="${esc(p.id)}">Estimate cost &rarr;</button>` : ""}
          </div>
        </div>
      </article>`;
  }

  // "View Details" circle follows the mouse over a card image
  function initCardHover(root = document) {
    root.addEventListener("pointermove", (e) => {
      const m = e.target.closest?.(".pcard__media");
      if (!m) return;
      const b = m.getBoundingClientRect();
      m.style.setProperty("--x", `${e.clientX - b.left}px`);
      m.style.setProperty("--y", `${e.clientY - b.top}px`);
    });
  }

  let toastTimer;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 3200);
  }

  function reveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.is-in)").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 80}ms`; io.observe(el); });
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
      $(".theme-toggle__label", b).textContent = theme === "dark" ? "Dark" : "Light";
    });
  }

  /* ---------------- header + menu ---------------- */
  const logo = (cls = "") => `
    <a href="index.html" class="logo ${cls}" aria-label="${esc(SITE.brand)} home">
      <span class="logo__mark" aria-hidden="true"><i></i></span>
      <span class="logo__text"><span class="logo__main">${esc(SITE.shortBrand)}</span><span class="logo__sub">${esc(SITE.subBrand)}</span></span>
    </a>`;

  function renderHeader() {
    const header = $("#header");
    header.innerHTML = `
      <div class="header__inner">
        ${logo()}
        <div class="header__right">
          <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
            <span class="switch"><i></i></span><span class="theme-toggle__label">Dark</span>
          </button>
          <span class="header__sep" aria-hidden="true"></span>
          <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">
            <span class="menu-btn__label">Menu</span><span class="menu-btn__lines"><i></i><i></i></span>
          </button>
        </div>
      </div>`;

    const statusLinks = Object.entries(STATUS).map(([k, s]) => `<a href="index.html?status=${k}#work">${s.label}</a>`).join("");
    const cityLinks = DATA.cities.map((c) => `<a href="index.html?city=${c.id}#work">${esc(c.name)}</a>`).join("");
    const pics = ALL.slice(0, 6).map((p) => `<span class="menu__pic" style='background-image:${Art.project(p)}'></span>`).join("");

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.id = "menu";
    menu.setAttribute("aria-hidden", "true");
    menu.innerHTML = `
      <div class="menu__left">
        <div class="menu__top">${logo("logo--menu")}<button class="menu__close" type="button" aria-label="Close menu">Close <span>&times;</span></button></div>
        <nav class="menu__nav" aria-label="Main">
          <a class="menu__link" href="index.html#home">Home</a>
          <a class="menu__link" href="index.html#journey">Discover Us</a>
          <a class="menu__link" href="index.html#work">Projects</a>
          <div class="menu__sub">${statusLinks}</div>
          <a class="menu__link" href="index.html#work">Price Explorer</a>
          <div class="menu__sub">${cityLinks}</div>
          <a class="menu__link" href="index.html#reviews">Testimonials</a>
          <a class="menu__link" href="index.html#join">Join Us</a>
          <div class="menu__sub">
            <a href="index.html?join=buyer#join">As a Buyer</a>
            <a href="index.html?join=broker#join">As a Broker</a>
            <a href="index.html?join=career#join">Career</a>
          </div>
          <a class="menu__link" href="#contact">Contact Us</a>
        </nav>
      </div>
      <div class="menu__right" aria-hidden="true"><div class="menu__pics">${pics}${pics}</div></div>`;
    document.body.append(menu);

    // open / close
    const btn = $("#menuBtn");
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", !open);
      btn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("no-scroll", open);
      if (open) $(".menu__close", menu).focus();
    };
    btn.addEventListener("click", () => setMenu(true));
    $(".menu__close", menu).addEventListener("click", () => { setMenu(false); btn.focus(); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); btn.focus(); } });

    // highlight current page link
    const here = location.pathname.endsWith("project.html") ? "Projects" : "Home";
    $$(".menu__link", menu).forEach((a) => a.classList.toggle("is-current", a.textContent === here));

    // header turns solid after scrolling
    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // theme
    const saved = store.get("ie-theme");
    applyTheme(saved === "light" ? "light" : "dark");
    $$(".theme-toggle").forEach((b) => b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("ie-theme", next);
    }));
  }

  /* ---------------- footer ---------------- */
  function renderFooter() {
    const c = SITE.contact;
    const icons = {
      facebook: '<path d="M14 8h2V5h-2.5C11 5 10 6.6 10 9v2H8v3h2v7h3v-7h2.4l.6-3h-3V9.3c0-.8.3-1.3 1-1.3z" fill="currentColor"/>',
      instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor"/>',
      linkedin: '<path d="M6.5 9.5h3v9h-3zM8 5a1.7 1.7 0 110 3.4A1.7 1.7 0 018 5zm3.5 4.5h2.9v1.3c.4-.8 1.4-1.5 2.9-1.5 3 0 3.5 1.9 3.5 4.4v4.8h-3v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.4h-3z" fill="currentColor"/>',
      youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor"/>'
    };
    const socials = Object.entries(SITE.socials)
      .filter(([k, url]) => url && icons[k])
      .map(([k, url]) => `<a href="${esc(url)}" aria-label="${k}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24">${icons[k]}</svg></a>`).join("");

    $("#contact").innerHTML = `
      <div class="container footer__grid">
        <div class="footer__brand">
          ${logo()}
          <p>Homes and communities across the United Arab Emirates.</p>
          <div class="socials">${socials}</div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul class="footer__links">
            <li><a href="index.html#journey">Discover Us</a></li>
            <li><a href="index.html#work">Projects</a></li>
            <li><a href="index.html#reviews">Testimonials</a></li>
            <li><a href="index.html#join">Join Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Emirates</h4>
          <ul class="footer__links">${DATA.cities.map((x) => `<li><a href="index.html?city=${x.id}#work">${esc(x.name)}</a></li>`).join("")}</ul>
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
        <p class="footer__disclaimer">Prices and project details shown are estimates for guidance only and may change. Final prices are confirmed at reservation.</p>
      </div>`;
  }

  /* ---------------- WhatsApp button ---------------- */
  function renderWhatsApp() {
    const num = (SITE.contact.whatsapp || "").replace(/\D/g, "");
    const a = document.createElement("a");
    a.className = "wa";
    a.setAttribute("aria-label", "Chat on WhatsApp");
    if (num) {
      a.href = `https://wa.me/${num}?text=${encodeURIComponent(`Hello ${SITE.brand}, I'd like to know more about your projects.`)}`;
      a.target = "_blank"; a.rel = "noopener";
    } else {
      a.href = "index.html#join";          // no number set yet → go to the form
    }
    a.innerHTML = `<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor"><path d="M16 3.5A12.4 12.4 0 005.3 22.3L3.6 28.5l6.4-1.7A12.4 12.4 0 1016 3.5zm0 22.6c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.8 1 1-3.7-.2-.4A10.2 10.2 0 1116 26.1zm5.6-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.1-.4.2-.7 0a8.4 8.4 0 01-4.2-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.3c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7 6.3 6.3 0 001.3 3.3c.2.2 2.2 3.4 5.4 4.7 2 .9 2.8.9 3.8.8.6-.1 1.8-.8 2.1-1.5s.3-1.3.2-1.5-.4-.2-.7-.4z"/></svg>`;
    document.body.append(a);
  }

  /* ---------------- start ---------------- */
  renderHeader();
  renderFooter();
  renderWhatsApp();

  window.IE = { $, $$, fmt, money, esc, slug, ALL, findProject, details, card, initCardHover, toast, reveal, STATUS, DATA, SITE };
})();
