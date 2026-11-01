/* =========================================================================
   PROJECT PAGE  —  project.html?id=<project-id>
   Banner, "At A Glance" facts, price estimate for this project, and more
   projects nearby. Facts come from IE.details() (see layout.js).
   ========================================================================= */

(function () {
  const { $, $$, fmt, money, esc, ALL, findProject, details, card, initCardHover, reveal, STATUS, DATA } = window.IE;
  const page = $("#projectPage");
  const id = new URLSearchParams(location.search).get("id");
  const p = findProject(id);

  if (!p) {
    page.innerHTML = `
      <section class="section notfound">
        <div class="container">
          <p class="eyebrow">Not found</p>
          <h1 class="section__title">We couldn't find that project</h1>
          <p class="section__lead">It may have been renamed or removed.</p>
          <a class="btn btn--gold" href="index.html#work" style="margin-top:32px">See all projects</a>
        </div>
      </section>`;
    $("#header").classList.add("is-solid");
    return;
  }

  document.title = `${p.name} — ${window.SITE.brand}`;
  const d = details(p);
  const banner = p.image ? `url("${esc(p.image)}")` : Art.project(p, { w: 1600, h: 820 });
  const main = p.image ? `url("${esc(p.image)}")` : Art.project(p);
  const room = p.interiorImage ? `url("${esc(p.interiorImage)}")` : Art.interior(p.name);

  /* ---------------- markup ---------------- */
  page.innerHTML = `
    <section class="pbanner" style='--banner:${banner}'>
      <div class="pbanner__shade"></div>
      <div class="container pbanner__inner">
        <div class="pbanner__left reveal">
          <nav class="crumbs" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span>/</span>
            <a href="index.html?city=${p.city.id}#work">${esc(p.city.name)}</a><span>/</span>
            <span>${esc(p.area.name)}</span>
          </nav>
          <h1 class="pbanner__title">${esc(p.name)}</h1>
          <p class="pbanner__meta">${esc(p.area.name)} || ${esc(p.type)} || ${STATUS[p.status].label}</p>
        </div>
        <p class="pbanner__intro reveal">${esc(d.intro)}</p>
      </div>
    </section>

    <section class="section glance">
      <div class="container glance__grid">
        <div class="glance__text">
          <h2 class="glance__title reveal">At A Glance</h2>
          <p class="glance__lead reveal">${esc(p.name)} offers ${esc(d.unitTypes.toLowerCase())} in ${esc(p.area.name)}, built around comfort, light and a well-connected location in ${esc(p.city.name)}.</p>
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
        </div>
        <div class="glance__media reveal" aria-hidden="true">
          <span class="glance__main" style='background-image:${main}'></span>
          <span class="glance__brush" style='background-image:${Art.brush()}'></span>
          <span class="glance__small" style='background-image:${room}'></span>
        </div>
      </div>
    </section>

    <section class="section pest" id="estimate">
      <div class="container">
        <div class="section__head section__head--row reveal">
          <div>
            <p class="eyebrow">Price estimate</p>
            <h2 class="section__title">What would your home cost?</h2>
            <p class="section__lead">Based on the estimated price per sq ft in ${esc(p.area.name)}. Pick a stage and a size.</p>
          </div>
        </div>
        <div class="pest__grid reveal">
          <div>
            <div class="pest__stages" id="pStages"></div>
            <div class="pest__size">
              <label for="pSize">Home size (sq ft)</label>
              <input type="number" id="pSize" min="100" max="20000" step="10" inputmode="numeric">
              <div class="presets" id="pSizes"></div>
            </div>
          </div>
          <div class="result result--big" id="pResult" aria-live="polite"></div>
        </div>
      </div>
    </section>

    <section class="section more">
      <div class="container">
        <div class="section__head section__head--row reveal">
          <div>
            <p class="eyebrow">Explore more</p>
            <h2 class="section__title">More in ${esc(p.city.name)}</h2>
          </div>
          <a class="btn btn--line" href="index.html?city=${p.city.id}#work">All ${esc(p.city.name)} projects</a>
        </div>
        <div class="projects projects--3" id="moreProjects"></div>
      </div>
    </section>`;

  /* ---------------- estimate ---------------- */
  const sizes = [d.sizes[0], Math.round((d.sizes[0] + d.sizes[1]) / 2 / 10) * 10, d.sizes[1]];
  const est = { status: p.status, sqft: sizes[0] };
  const maxRate = Math.max(...Object.values(p.area.rates));

  function renderEstimate() {
    $("#pStages").innerHTML = Object.entries(STATUS).map(([k, s]) => `
      <button class="stage ${k === est.status ? "is-on" : ""}" data-stage="${k}">
        <span class="stage__label">${s.label}${k === p.status ? ' <em>this project</em>' : ""}</span>
        <span class="stage__val">${money(p.area.rates[k])} <small>/ sq ft</small></span>
        <span class="rate__bar"><i style="width:${(p.area.rates[k] / maxRate) * 100}%"></i></span>
      </button>`).join("");

    $("#pSizes").innerHTML = sizes.map((s, i) => `<button data-psize="${s}" class="${s === est.sqft ? "is-on" : ""}">${["Smallest", "Typical", "Largest"][i]} · ${fmt(s)}</button>`).join("");
    const input = $("#pSize");
    if (document.activeElement !== input) input.value = est.sqft;

    const rate = p.area.rates[est.status];
    const base = rate * est.sqft;
    const fee = base * (p.city.fee.pct / 100);
    const total = base + fee;
    $("#pResult").innerHTML = `
      <p class="result__where">${esc(p.name)} · ${STATUS[est.status].label}</p>
      <p class="result__total">${money(total)}</p>
      <p class="result__usd">≈ USD ${fmt(total * DATA.usdRate)}</p>
      <ul class="result__lines">
        <li><span>Price per sq ft</span><b>${money(rate)}</b></li>
        <li><span>Size</span><b>${fmt(est.sqft)} sq ft (${fmt(est.sqft / 10.7639)} sq m)</b></li>
        <li><span>Property price</span><b>${money(base)}</b></li>
        <li><span>${esc(p.city.fee.label)} (${p.city.fee.pct}%)</span><b>${money(fee)}</b></li>
      </ul>
      <a class="btn btn--gold" href="index.html?project=${encodeURIComponent(p.id)}#join">Book a visit</a>`;
  }

  $("#estimate").addEventListener("click", (e) => {
    let el;
    if ((el = e.target.closest("[data-stage]"))) { est.status = el.dataset.stage; renderEstimate(); }
    else if ((el = e.target.closest("[data-psize]"))) { est.sqft = +el.dataset.psize; renderEstimate(); }
  });
  $("#pSize").addEventListener("input", (e) => {
    const v = parseFloat(e.target.value);
    if (v > 0) { est.sqft = Math.min(50000, v); renderEstimate(); }
  });
  $("#pSize").addEventListener("blur", renderEstimate);
  renderEstimate();

  /* ---------------- more projects ---------------- */
  const others = ALL.filter((x) => x.id !== p.id && x.city.id === p.city.id)
    .sort((a, b) => (b.area.id === p.area.id) - (a.area.id === p.area.id))
    .slice(0, 3);
  $("#moreProjects").innerHTML = others.map((x, i) => card(x, { delay: i * 80 })).join("");
  initCardHover($("#moreProjects"));

  reveal();
})();
