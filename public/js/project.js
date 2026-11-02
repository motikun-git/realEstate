/* =========================================================================
   PROJECT PAGE  —  project.html?id=<project-id>
   Banner, At A Glance, gallery, amenities, price estimate, location,
   enquiry form and more projects nearby.
   ========================================================================= */

(function () {
  const { $, $$, fmt, money, esc, params, ALL, findProject, projectUrl, art, details, card, initViewDot, reveal, validate, sendForm, toast, STATUS, DATA, SITE } = window.IE;
  const page = $("#projectPage");
  const p = findProject(params.get("id"));

  if (!p) {
    document.body.classList.remove("page-dark-top");
    page.innerHTML = `
      <section class="nf">
        <div>
          <p class="nf__code">404</p>
          <h1 class="title title--sm"><b>We couldn't find</b> <em>that project</em></h1>
          <p class="lead" style="margin:18px auto 0;max-width:520px">It may have been renamed or removed.</p>
          <a class="pill pill--solid pill--lg" href="projects.html" style="margin-top:30px">See all projects</a>
        </div>
      </section>`;
    return;
  }

  const d = details(p);
  const SQM = 10.7639;
  document.title = `${p.name} — ${SITE.brand}`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", `${p.name}: ${p.type.toLowerCase()} in ${p.area.name}, ${p.city.name}. From ${money(p.area.rates[p.status])} per sq ft.`);

  const room = (seed) => (p.interiorImage ? `url("${esc(p.interiorImage)}")` : Art.interior(seed));
  const gallery = [
    art(p, { w: 1200, h: 900 }),
    room(p.name),
    Art.pool(p.name),
    art({ ...p, name: p.name + " evening" }, { w: 1200, h: 600 }),
    room(p.name + " bedroom"),
    Art.pool(p.name + " deck")
  ];

  page.innerHTML = `
    <section class="pbanner" style='--banner:${art(p, { w: 1600, h: 860 })}'>
      <div class="container pbanner__inner">
        <div class="reveal">
          <nav class="crumbs" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span>/</span><a href="projects.html">Projects</a><span>/</span>
            <a href="projects.html?city=${p.city.id}">${esc(p.city.name)}</a><span>/</span><span>${esc(p.area.name)}</span>
          </nav>
          <span class="badge badge--${p.status}">${STATUS[p.status].label}</span>
          <h1 class="pbanner__title" style="margin-top:18px">${esc(p.name)}</h1>
          <p class="pbanner__meta">${esc(p.area.name)} || ${esc(p.type)} || Handover ${esc(p.handover)}</p>
        </div>
        <p class="pbanner__intro reveal d1">${esc(d.intro)}</p>
      </div>
    </section>

    <section class="section">
      <div class="container glance__grid">
        <div>
          <h2 class="title title--lg reveal"><em>At A Glance</em></h2>
          <p class="glance__lead reveal">${esc(p.name)} offers ${esc(d.unitTypes.toLowerCase())} in ${esc(p.area.name)}, built around comfort, light and a well-connected address in ${esc(p.city.name)}.</p>
          <dl class="facts reveal">
            ${[
              ["Location", d.location],
              ["Plot Area", d.plot],
              ["Building Height", d.height],
              ["Number of Units", d.units],
              ["Number of Parking", d.parking],
              ["Size of Units", d.sizeText],
              ["Unit Types", d.unitTypes],
              ["Status", STATUS[p.status].label],
              ["Handover", d.handover],
              ["Price per sq ft", `${money(p.area.rates[p.status])} (est.)`]
            ].map(([k, v]) => `<div class="facts__row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
          </dl>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:32px" class="reveal">
            <a class="pill pill--solid" href="#enquire">Book a visit</a>
            <a class="pill pill--line" href="#estimate">Estimate cost</a>
          </div>
        </div>
        <div class="glance__media reveal-right" aria-hidden="true">
          <span class="glance__main" style='background-image:${art(p)}'></span>
          <span class="glance__brush" style='background-image:${Art.brush()}'></span>
          <span class="glance__small" style='background-image:${room(p.name)}'></span>
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="section__head section__head--row">
          <div class="reveal"><p class="eyebrow">Gallery</p><h2 class="title"><b>Take a</b> <em>closer look</em></h2></div>
          <p class="lead reveal" style="max-width:420px">Artist's impressions for illustration. Final finishes may vary.</p>
        </div>
        <div class="gallery reveal" id="gallery">
          ${gallery.map((g, i) => `<button type="button" style='background-image:${g}' data-gi="${i}" aria-label="Open image ${i + 1} of ${gallery.length}"></button>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head reveal"><p class="eyebrow">Amenities</p><h2 class="title"><b>Everything you need,</b> <em>close to home</em></h2></div>
        <ul class="amen reveal">${d.amenities.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section section--tint" id="estimate">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">Price estimate</p>
          <h2 class="title"><b>What would your home</b> <em>cost?</em></h2>
          <p class="lead">Based on the estimated price per sq ft in ${esc(p.area.name)}. Pick a stage and a size.</p>
        </div>
        <div class="pest__grid reveal">
          <div>
            <div class="pest__stages" id="pStages"></div>
            <div class="pest__size">
              <label class="field-label" for="pSize">Home size (sq ft)</label>
              <input class="num-input" type="number" id="pSize" min="100" max="20000" step="10" inputmode="numeric">
              <div class="presets" id="pSizes"></div>
            </div>
          </div>
          <div class="result result--big" id="pResult" aria-live="polite"></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container location">
        <div class="reveal-left">
          <p class="eyebrow">Location</p>
          <h2 class="title title--sm"><b>${esc(p.area.name)},</b> <em>${esc(p.city.name)}</em></h2>
          <p class="lead" style="margin-top:18px">${esc(p.area.blurb)}</p>
          <a class="pill pill--line" style="margin-top:26px" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.area.name}, ${p.city.name}, UAE`)}">Open in Google Maps</a>
        </div>
        <div class="map reveal-right"><iframe title="Map of ${esc(p.area.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(`${p.area.name}, ${p.city.name}, UAE`)}&z=13&output=embed"></iframe></div>
      </div>
    </section>

    <section class="section section--tint" id="enquire">
      <div class="container split">
        <div class="reveal-left">
          <p class="eyebrow">Enquire</p>
          <h2 class="title title--sm"><b>Interested in</b> <em>${esc(p.name)}?</em></h2>
          <p class="lead" style="margin-top:18px">Leave your details for floor plans, availability and a site visit or video walkthrough.</p>
        </div>
        <form class="form reveal-right" id="enquiry" novalidate>
          <div class="form__grid">
            <label>Full name<input name="name" required autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
            <label>Preferred visit<select name="visit"><option>Site visit</option><option>Video walkthrough</option><option>Call me back</option></select></label>
            <label class="form__full">Message<textarea name="message" rows="3">I'm interested in ${esc(p.name)} (${esc(p.area.name)}, ${esc(p.city.name)}).</textarea></label>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          </div>
          <button class="pill pill--solid pill--lg" type="submit">Send enquiry</button>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head section__head--row">
          <div class="reveal"><p class="eyebrow">Explore more</p><h2 class="title"><b>More in</b> <em>${esc(p.city.name)}</em></h2></div>
          <a class="pill pill--line reveal" href="projects.html?city=${p.city.id}">All ${esc(p.city.name)} projects</a>
        </div>
        <div class="projects projects--3" id="moreProjects"></div>
      </div>
    </section>`;

  /* ---------------- estimate ---------------- */
  const sizes = [d.sizes[0], Math.round((d.sizes[0] + d.sizes[1]) / 20) * 10, d.sizes[1]];
  const est = { status: p.status, sqft: sizes[0] };
  const maxRate = Math.max(...Object.values(p.area.rates));
  function renderEstimate() {
    $("#pStages").innerHTML = Object.entries(STATUS).map(([k, s]) => `
      <button class="stage ${k === est.status ? "is-on" : ""}" type="button" data-stage="${k}" aria-pressed="${k === est.status}">
        <span class="stage__label">${s.label}${k === p.status ? " <em>this project</em>" : ""}</span>
        <span class="stage__val">${money(p.area.rates[k])} <small>/ sq ft</small></span>
        <span class="rate__bar"><i style="width:${(p.area.rates[k] / maxRate) * 100}%"></i></span>
      </button>`).join("");
    $("#pSizes").innerHTML = sizes.map((s, i) => `<button type="button" data-psize="${s}" class="${s === est.sqft ? "is-on" : ""}">${["Smallest", "Typical", "Largest"][i]} · ${fmt(s)}</button>`).join("");
    if (document.activeElement !== $("#pSize")) $("#pSize").value = est.sqft;
    const r = p.area.rates[est.status];
    const base = r * est.sqft, fee = base * (p.city.fee.pct / 100), total = base + fee;
    $("#pResult").innerHTML = `
      <p class="result__where">${esc(p.name)} · ${STATUS[est.status].label}</p>
      <p class="result__total">${money(total)}</p>
      <p class="result__usd">≈ USD ${fmt(total * DATA.usdRate)}</p>
      <ul class="result__lines">
        <li><span>Price per sq ft</span><b>${money(r)}</b></li>
        <li><span>Size</span><b>${fmt(est.sqft)} sq ft (${fmt(est.sqft / SQM)} sq m)</b></li>
        <li><span>Property price</span><b>${money(base)}</b></li>
        <li><span>${esc(p.city.fee.label)} (${p.city.fee.pct}%)</span><b>${money(fee)}</b></li>
      </ul>
      <a class="pill pill--solid" href="#enquire">Book a visit</a>`;
  }
  $("#estimate").addEventListener("click", (e) => {
    let el;
    if ((el = e.target.closest("[data-stage]"))) { est.status = el.dataset.stage; renderEstimate(); }
    else if ((el = e.target.closest("[data-psize]"))) { est.sqft = +el.dataset.psize; renderEstimate(); }
  });
  $("#pSize").addEventListener("input", (e) => { const v = parseFloat(e.target.value); if (v > 0) { est.sqft = Math.min(50000, v); renderEstimate(); } });
  $("#pSize").addEventListener("blur", renderEstimate);
  renderEstimate();

  /* ---------------- gallery lightbox ---------------- */
  const lb = $("#lightbox");
  let gi = 0, lastFocus;
  const showImg = (n) => { gi = (n + gallery.length) % gallery.length; $("#lbImg").style.backgroundImage = gallery[gi]; };
  const openLb = (n) => { lastFocus = document.activeElement; showImg(n); lb.hidden = false; lb.classList.add("is-open"); document.body.classList.add("no-scroll"); $("#lbClose").focus(); };
  const closeLb = () => { lb.classList.remove("is-open"); lb.hidden = true; document.body.classList.remove("no-scroll"); lastFocus?.focus(); };
  $("#gallery").addEventListener("click", (e) => { const b = e.target.closest("[data-gi]"); if (b) openLb(+b.dataset.gi); });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => showImg(gi - 1));
  $("#lbNext").addEventListener("click", () => showImg(gi + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") showImg(gi - 1);
    if (e.key === "ArrowRight") showImg(gi + 1);
  });

  /* ---------------- enquiry form ---------------- */
  const form = $("#enquiry");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.website.value) return;                      // spam trap
    if (!validate(form)) { toast("Please add your name and a valid email."); return; }
    const ok = await sendForm(`Enquiry: ${p.name}`, {
      Project: `${p.name} — ${p.area.name}, ${p.city.name}`,
      Name: form.name.value.trim(),
      Email: form.email.value.trim(),
      Phone: form.phone.value.trim(),
      "Preferred visit": form.visit.value,
      Message: form.message.value.trim()
    });
    if (ok) toast(`Thank you, ${form.name.value.trim().split(" ")[0]}. We'll be in touch shortly.`);
  });

  /* ---------------- more projects ---------------- */
  const others = ALL.filter((x) => x.id !== p.id && x.city.id === p.city.id)
    .sort((a, b) => (b.area.id === p.area.id) - (a.area.id === p.area.id)).slice(0, 3);
  $("#moreProjects").innerHTML = others.map((x, i) => card(x, { delay: i * 90 })).join("");
  initViewDot($("#moreProjects"));

  reveal();
})();
