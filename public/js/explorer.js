/* =========================================================================
   PRICE EXPLORER  —  emirate → area → price per sq ft by stage, plus the
   cost estimator. Used on the home page inside <section id="explorer">.
   Reads ?city=<id> and ?status=<new|ongoing|completed> from the URL.
   ========================================================================= */

(function () {
  const root = document.getElementById("explorer");
  if (!root) return;
  const { $, $$, fmt, money, esc, params, ALL, card, initViewDot, STATUS, DATA } = window.IE;
  const SQM = 10.7639;

  const state = {
    cityId: DATA.cities.some((c) => c.id === params.get("city")) ? params.get("city") : DATA.cities[0].id,
    areaId: null,
    filter: STATUS[params.get("status")] ? params.get("status") : "all",
    calcStatus: STATUS[params.get("status")] ? params.get("status") : "completed",
    sqft: 1250,
    unit: "sqft",
    picked: null
  };
  const city = () => DATA.cities.find((c) => c.id === state.cityId);
  const area = () => (state.areaId ? city().areas.find((a) => a.id === state.areaId) : null);

  function renderFilters() {
    const opts = [["all", "All"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])];
    $("#statusFilters").innerHTML = opts
      .map(([k, label]) => `<button class="chip ${state.filter === k ? "is-on" : ""}" data-filter="${k}" aria-pressed="${state.filter === k}">${label}</button>`).join("");
  }

  function renderCities() {
    $("#cities").innerHTML = DATA.cities
      .map((c) => `<button class="chip ${c.id === state.cityId ? "is-on" : ""}" data-city="${c.id}" aria-pressed="${c.id === state.cityId}">${esc(c.name)}</button>`).join("");
  }

  function renderAreas() {
    const c = city();
    const maxRate = Math.max(...c.areas.map((a) => Math.max(...Object.values(a.rates))));
    $("#areas").innerHTML = c.areas.map((a) => {
      const open = a.id === state.areaId;
      const rates = Object.entries(STATUS).map(([k, s]) => `
        <button class="rate ${open && state.calcStatus === k ? "is-on" : ""}" data-area="${a.id}" data-status="${k}">
          <span class="rate__label"><i class="rate__dot"></i>${s.label}</span>
          <span class="rate__val">${money(a.rates[k])} <small>/ sq ft</small></span>
          <span class="rate__bar"><i style="width:${(a.rates[k] / maxRate) * 100}%"></i></span>
        </button>`).join("");
      return `
        <div class="area ${open ? "is-open" : ""}">
          <button class="area__head" data-toggle-area="${a.id}" aria-expanded="${open}">
            <span class="area__name">${esc(a.name)}</span>
            <span class="area__from">from <b>${fmt(Math.min(...Object.values(a.rates)))}</b>/sq ft<i class="area__chev"></i></span>
          </button>
          <div class="area__body"><div class="area__inner">
            <p class="area__blurb">${esc(a.blurb)}</p>
            <div class="rates">${rates}</div>
          </div></div>
        </div>`;
    }).join("");
  }

  function renderProjects() {
    const c = city();
    const list = ALL.filter((p) => p.city.id === c.id && (!state.areaId || p.area.id === state.areaId) && (state.filter === "all" || p.status === state.filter));
    const a = area();
    $("#crumbs").innerHTML =
      `<span>${esc(c.name)}</span>` +
      (a ? `<span>/</span><b>${esc(a.name)}</b><span>·</span><button data-clear-area>Show all areas</button>` : "") +
      `<span>· ${list.length} project${list.length === 1 ? "" : "s"}</span>`;
    $("#projects").innerHTML = list.length
      ? list.map((p, i) => card(p, { estimate: true, delay: i * 70, picked: state.picked === p.id })).join("")
      : `<div class="empty">No ${state.filter === "all" ? "" : STATUS[state.filter].label.toLowerCase() + " "}projects here yet. Try another stage or area.</div>`;
  }

  function renderCalcControls() {
    $("#calcStatus").innerHTML = Object.entries(STATUS)
      .map(([k, s]) => `<button data-calc-status="${k}" class="${k === state.calcStatus ? "is-on" : ""}" aria-pressed="${k === state.calcStatus}">${s.label}</button>`).join("");
    $("#presets").innerHTML = DATA.presets
      .map((p) => `<button data-preset="${p.sqft}" class="${p.sqft === state.sqft ? "is-on" : ""}">${p.label} · ${fmt(state.unit === "sqft" ? p.sqft : p.sqft / SQM)}</button>`).join("");
    $$("#unitToggle button").forEach((b) => b.classList.toggle("is-on", b.dataset.unit === state.unit));
    const input = $("#sizeInput"), slider = $("#sizeRange");
    const shown = state.unit === "sqft" ? state.sqft : state.sqft / SQM;
    if (document.activeElement !== input) input.value = Math.round(shown);
    if (state.unit === "sqft") { slider.min = 200; slider.max = 8000; slider.step = 10; }
    else { slider.min = 20; slider.max = 750; slider.step = 1; }
    slider.value = Math.round(shown);
  }

  function renderResult() {
    const c = city(), a = area();
    const r = a ? a.rates[state.calcStatus] : c.areas.reduce((s, x) => s + x.rates[state.calcStatus], 0) / c.areas.length;
    const base = r * state.sqft;
    const fee = base * (c.fee.pct / 100);
    const total = base + fee;
    const picked = ALL.find((p) => p.id === state.picked);
    const sizeText = state.unit === "sqft" ? `${fmt(state.sqft)} sq ft` : `${fmt(state.sqft / SQM)} sq m (${fmt(state.sqft)} sq ft)`;
    $("#result").innerHTML = `
      <p class="result__where">${picked ? esc(picked.name) + " · " : ""}${a ? esc(a.name) + ", " + esc(c.name) : esc(c.name) + " · city average"} · ${STATUS[state.calcStatus].label}</p>
      <p class="result__total">${money(total)}</p>
      <p class="result__usd">≈ USD ${fmt(total * DATA.usdRate)}</p>
      <ul class="result__lines">
        <li><span>Price per sq ft</span><b>${money(r)}</b></li>
        <li><span>Size</span><b>${sizeText}</b></li>
        <li><span>Property price</span><b>${money(base)}</b></li>
        <li><span>${esc(c.fee.label)} (${c.fee.pct}%)</span><b>${money(fee)}</b></li>
      </ul>
      ${a ? "" : `<p class="result__usd" style="margin-top:12px">Open an area above for its exact rate.</p>`}
      <a class="pill pill--solid" href="${bookHref()}">Book a visit</a>`;
  }

  function bookHref() {
    const q = new URLSearchParams({ type: "buyer" });
    if (state.picked) q.set("project", state.picked);
    else if (state.areaId) q.set("note", `${area().name}, ${city().name} · ${STATUS[state.calcStatus].label} · ${fmt(state.sqft)} sq ft`);
    else q.set("note", `${city().name} · ${STATUS[state.calcStatus].label} · ${fmt(state.sqft)} sq ft`);
    return `contact.html?${q}`;
  }

  const renderAll = () => { renderFilters(); renderCities(); renderAreas(); renderProjects(); renderCalcControls(); renderResult(); };
  const setSize = (v) => { state.sqft = Math.max(50, Math.min(50000, v || 0)); renderCalcControls(); renderResult(); };

  function pick(id) {
    const p = ALL.find((x) => x.id === id);
    if (!p) return;
    Object.assign(state, { cityId: p.city.id, areaId: p.area.id, calcStatus: p.status, picked: p.id });
    renderAll();
    if (window.matchMedia("(max-width: 960px)").matches) $("#calc").scrollIntoView({ behavior: "smooth", block: "start" });
    else $("#panel").scrollTo({ top: $("#calc").offsetTop - 8, behavior: "smooth" });
  }

  root.addEventListener("click", (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest("[data-filter]"))) {
      state.filter = el.dataset.filter;
      if (state.filter !== "all") state.calcStatus = state.filter;
      renderAll();
    } else if ((el = t.closest("[data-city]"))) {
      Object.assign(state, { cityId: el.dataset.city, areaId: null, picked: null });
      renderAll();
    } else if ((el = t.closest("[data-toggle-area]"))) {
      state.areaId = state.areaId === el.dataset.toggleArea ? null : el.dataset.toggleArea;
      state.picked = null;
      renderAreas(); renderProjects(); renderResult();
    } else if ((el = t.closest(".rate"))) {
      Object.assign(state, { areaId: el.dataset.area, calcStatus: el.dataset.status });
      renderAreas(); renderCalcControls(); renderResult();
    } else if (t.closest("[data-clear-area]")) {
      Object.assign(state, { areaId: null, picked: null });
      renderAreas(); renderProjects(); renderResult();
    } else if ((el = t.closest("[data-calc-status]"))) {
      state.calcStatus = el.dataset.calcStatus;
      renderAreas(); renderCalcControls(); renderResult();
    } else if ((el = t.closest("[data-preset]"))) {
      setSize(+el.dataset.preset);
    } else if ((el = t.closest("#unitToggle button"))) {
      state.unit = el.dataset.unit;
      renderCalcControls(); renderResult();
    } else if ((el = t.closest("[data-estimate]"))) {
      pick(el.dataset.estimate);
    }
  });
  $("#sizeInput").addEventListener("input", (e) => {
    const v = parseFloat(e.target.value);
    if (v) setSize(state.unit === "sqft" ? v : v * SQM);
  });
  $("#sizeInput").addEventListener("blur", renderCalcControls);
  $("#sizeRange").addEventListener("input", (e) => setSize(state.unit === "sqft" ? +e.target.value : +e.target.value * SQM));

  initViewDot($("#projects"));
  renderAll();
  window.IE.pickProject = pick;
})();
