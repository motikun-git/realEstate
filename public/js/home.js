/* =========================================================================
   HOME PAGE  —  hero, left/right project showcase, intro, featured slider,
   principles, testimonials, contact blocks, office map.
   The price explorer lives in explorer.js.
   ========================================================================= */

(function () {
  const { $, $$, fmt, money, esc, ALL, projectUrl, art, rate, initViewDot, reveal, STATUS, DATA, SITE } = window.IE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FEATURED = ALL.filter((p) => p.featured).length ? ALL.filter((p) => p.featured) : ALL.slice(0, 5);

  /* ---------------- hero ---------------- */
  function hero() {
    const [w1, w2, w3] = SITE.hero.words;
    $("#heroWords").innerHTML = `
      <span class="hero__row"><span class="hero__w"><span>${esc(w1)}</span></span><span class="hero__line">${esc(SITE.hero.line)}</span></span>
      <span class="hero__row"><span class="hero__w hero__w--serif"><span>${esc(w2)}</span></span><span class="hero__w"><span>${esc(w3)}</span></span></span>`;

    const poster = SITE.hero.poster ||
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(Art.skyline({ mood: "dusk", seed: "hero", raw: true }));
    const band = $("#heroBand"), video = $("#heroVideo"), sound = $("#heroSound");
    band.style.backgroundImage = `url("${poster}")`;
    video.poster = poster;
    video.addEventListener("error", () => { sound.hidden = true; video.hidden = true; });
    video.src = SITE.hero.video;
    video.play?.().catch(() => {});
    sound.addEventListener("click", () => {
      video.muted = !video.muted;
      sound.classList.toggle("is-on", !video.muted);
      sound.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    });
    window.IE.SearchBar($("#heroSearch"), { variant: "hero" });
    requestAnimationFrame(() => setTimeout(() => document.body.classList.add("is-ready"), 60));
  }

  /* ---------------- showcase: alternating left / right ---------------- */
  function showcase() {
    $("#showcase").innerHTML = FEATURED.map((p, i) => {
      const flip = i % 2 === 1;
      return `
        <article class="show reveal-group ${flip ? "show--flip" : ""}">
          <a class="show__media ${flip ? "reveal-right" : "reveal-left"}" href="${projectUrl(p)}" aria-label="View ${esc(p.name)}">
            <span class="show__img" style='background-image:${art(p, { w: 1000, h: 800 })}'></span>
            <span class="badge badge--${p.status}">${STATUS[p.status].label}</span>
            <span class="view-dot" aria-hidden="true">View<br>Details</span>
          </a>
          <div class="show__body ${flip ? "reveal-left" : "reveal-right"}">
            <span class="show__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            <p class="show__area">${esc(p.area.name)} · ${esc(p.city.name)}</p>
            <h3 class="show__name">${esc(p.name)}</h3>
            <p class="show__text">${esc(p.area.blurb)}</p>
            <dl class="show__facts">
              <div><dt>From</dt><dd>${money(rate(p))}<small style="font-weight:400"> /sq ft</small></dd></div>
              <div><dt>Type</dt><dd>${esc(p.type)}</dd></div>
              <div><dt>Handover</dt><dd>${esc(p.handover)}</dd></div>
            </dl>
            <div class="show__btns">
              <a class="pill pill--solid" href="${projectUrl(p)}">View details</a>
              <button class="pill pill--line" type="button" data-show-estimate="${esc(p.id)}">Estimate cost</button>
            </div>
          </div>
        </article>`;
    }).join("");

    $("#showcase").addEventListener("click", (e) => {
      const b = e.target.closest("[data-show-estimate]");
      if (!b) return;
      window.IE.pickProject(b.dataset.showEstimate);
      document.getElementById("explorer").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
    initViewDot($("#showcase"));

    // gentle parallax on the showcase images
    if (reduce) return;
    const imgs = $$(".show__img");
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      imgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = (r.top + r.height / 2 - vh / 2) * -0.07;
        img.style.setProperty("--py", `${offset.toFixed(1)}px`);
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------------- intro ---------------- */
  function intro() {
    $("#introTitle").innerHTML = SITE.intro.title;       // allows <em>
    $("#introLeft").textContent = SITE.intro.left;
    $("#introRight").textContent = SITE.intro.right;
    $("#introSmall").style.backgroundImage = Art.pool("intro");
    $("#introBig").style.backgroundImage = Art.skyline({ mood: "dawn", seed: "intro" });
  }

  /* ---------------- featured slider ---------------- */
  function featured() {
    const box = $("#featured");
    let i = 0, timer;
    const show = (n, animate = true) => {
      i = (n + FEATURED.length) % FEATURED.length;
      const p = FEATURED[i];
      const paint = () => {
        $("#featArea").textContent = `${p.area.name} · ${STATUS[p.status].label}`;
        $("#featName").textContent = p.name;
        $("#featBlurb").textContent = `${p.type} in ${p.area.name}, ${p.city.name}. ${p.area.blurb}`;
        $("#featPrice").innerHTML = `From ${money(rate(p))} <span style="color:var(--muted);font-weight:400">per sq ft · Handover ${esc(p.handover)}</span>`;
        $("#featCount").textContent = `${String(i + 1).padStart(2, "0")} / ${String(FEATURED.length).padStart(2, "0")}`;
        $("#featA").style.backgroundImage = art(p, { w: 640, h: 780 });
        $("#featB").style.backgroundImage = p.interiorImage ? `url("${esc(p.interiorImage)}")` : Art.interior(p.name);
        $("#featC").style.backgroundImage = Art.pool(p.name);
        $("#featLink").href = projectUrl(p);
        $("#featLink").setAttribute("aria-label", `Learn more about ${p.name}`);
        box.classList.remove("is-swapping");
      };
      if (!animate || reduce) return paint();
      box.classList.add("is-swapping");
      setTimeout(paint, 420);
    };
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 6500); };
    $("#featPrev").addEventListener("click", () => { show(i - 1); restart(); });
    $("#featNext").addEventListener("click", () => { show(i + 1); restart(); });
    box.addEventListener("pointerenter", () => clearInterval(timer));
    box.addEventListener("pointerleave", restart);
    box.addEventListener("focusin", () => clearInterval(timer));
    initViewDot(box);
    show(0, false);
    restart();
  }

  /* ---------------- principles + stats ---------------- */
  function principles() {
    const pics = [Art.interior("principle-1"), Art.pool("principle-2"), art(FEATURED[0], { w: 600, h: 800 }), art(FEATURED[FEATURED.length - 1], { w: 600, h: 800 })];
    $("#principleList").innerHTML = SITE.principles.map((p, i) => `
      <article class="principle reveal ${i % 2 ? "d1" : ""}">
        <div class="principle__img" style='background-image:${pics[i % pics.length]}' aria-hidden="true"></div>
        <span class="principle__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </article>`).join("");

    const areas = DATA.cities.flatMap((c) => c.areas);
    const minRate = Math.min(...areas.map((a) => Math.min(...Object.values(a.rates))));
    const stats = [
      { n: DATA.cities.length, label: "Emirates" },
      { n: areas.length, label: "Communities" },
      { n: ALL.length, label: "Projects listed" },
      { n: minRate, label: `${DATA.currency} / sq ft from` }
    ];
    const box = $("#stats");
    box.innerHTML = stats.map((s) => `<div><div class="stat__num" data-count="${s.n}">${reduce ? fmt(s.n) : 0}</div><div class="stat__label">${s.label}</div></div>`).join("");
    if (reduce) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      $$("[data-count]", box).forEach((el) => {
        const end = +el.dataset.count, t0 = performance.now();
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / 1400);
          el.textContent = fmt(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe(box);
  }

  /* ---------------- testimonials ---------------- */
  function testimonials() {
    const list = SITE.reviews;
    if (!list.length) { $("#reviews").hidden = true; return; }
    const box = $("#testi");
    let i = 0, timer;
    const show = (n, animate = true) => {
      i = (n + list.length) % list.length;
      const r = list[i];
      const paint = () => {
        $("#tAvatar").textContent = r.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        $("#tName").textContent = r.name;
        $("#tRole").textContent = r.role;
        $("#tText").textContent = r.text;
        $("#tSample").hidden = !r.sample;
        box.classList.remove("is-swapping");
      };
      if (!animate || reduce) return paint();
      box.classList.add("is-swapping");
      setTimeout(paint, 380);
    };
    const restart = () => { clearInterval(timer); if (!reduce && list.length > 1) timer = setInterval(() => show(i + 1), 8000); };
    $("#tPrev").addEventListener("click", () => { show(i - 1); restart(); });
    $("#tNext").addEventListener("click", () => { show(i + 1); restart(); });
    if (list.length < 2) $$("#testi .arrows").forEach((a) => (a.hidden = true));
    show(0, false);
    restart();
  }

  /* ---------------- contact blocks + office ---------------- */
  function contactBlocks() {
    $("#duoBuy").style.setProperty("--img", Art.skyline({ mood: "day", seed: "duo-buy" }));
    $("#duoPartner").style.setProperty("--img", Art.pool("duo-partner"));

    const c = SITE.contact;
    $("#officeInfo").innerHTML = `
      <li><span>Address</span>${esc(c.address)}</li>
      <li><span>Phone</span><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ""))}">${esc(c.phone)}</a></li>
      <li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
      <li><span>Hours</span>${esc(c.hours)}</li>`;
    const q = encodeURIComponent(c.mapQuery || c.address);
    $("#officeMap").href = c.mapUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;
    $("#homeMap").innerHTML = `<iframe title="Office location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${q}&z=13&output=embed"></iframe>`;
  }

  /* ---------------- start ---------------- */
  hero();
  showcase();
  intro();
  featured();
  principles();
  testimonials();
  contactBlocks();
  reveal();
})();
