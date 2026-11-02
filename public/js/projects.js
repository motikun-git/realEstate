/* =========================================================================
   PROJECTS PAGE  —  the search bar (community, type, bedrooms, price,
   advanced filters) + stage chips, text search and sort.
   Filters are kept in the URL (?city=dubai&kind=villa&beds=4&price=u10)
   so a search from the home page, or a shared link, opens the same results.
   ========================================================================= */

(function () {
  const { $, esc, params, ALL, card, homes, initViewDot, reveal, STATUS, SearchBar, search } = window.IE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = { ...search.fromParams(params), q: params.get("q") || "", sort: ["low", "high", "name"].includes(params.get("sort")) ? params.get("sort") : "featured" };
  const filters = () => { const { q, sort, ...f } = state; return f; };

  const bar = SearchBar($("#pageSearch"), {
    variant: "page",
    state: filters(),
    onChange: (f) => { Object.assign(state, f); renderStatus(); renderGrid(); },
    onSearch: () => $("#results").scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
  });

  function renderStatus() {
    $("#fStatus").innerHTML = [["all", "All"], ...Object.entries(STATUS).map(([k, s]) => [k, s.label])]
      .map(([id, label]) => `<button class="chip ${state.status === id ? "is-on" : ""}" type="button" data-status="${id}" aria-pressed="${state.status === id}">${esc(label)}</button>`).join("");
  }

  function syncUrl() {
    const q = search.toQuery(filters(), { q: state.q.trim(), sort: state.sort === "featured" ? "" : state.sort });
    history.replaceState(null, "", (q ? `?${q}` : location.pathname) + location.hash);
  }

  function renderGrid() {
    const term = state.q.trim().toLowerCase();
    const beds = state.beds === "all" ? null : state.beds;
    const price = (p) => (beds === null ? homes(p).from : homes(p).priceFor(beds));
    let list = ALL.filter((p) => search.matches(p, filters()) &&
      (!term || `${p.name} ${p.area.name} ${p.city.name} ${p.type}`.toLowerCase().includes(term)));

    const sorters = {
      featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      low: (a, b) => price(a) - price(b),
      high: (a, b) => price(b) - price(a),
      name: (a, b) => a.name.localeCompare(b.name)
    };
    list = list.slice().sort(sorters[state.sort]);

    $("#count").textContent = `${list.length} project${list.length === 1 ? "" : "s"} found`;
    $("#grid").innerHTML = list.length
      ? list.map((p, i) => card(p, { delay: (i % 6) * 80, beds })).join("")
      : `<div class="empty">No projects match these filters. <button class="link-btn" type="button" id="reset">Clear filters</button></div>`;
    syncUrl();
  }

  $("#fSearch").value = state.q;
  $("#fSort").value = state.sort;

  $("#fStatus").addEventListener("click", (e) => {
    const s = e.target.closest("[data-status]");
    if (!s) return;
    state.status = s.dataset.status;
    bar.set(filters());
    renderStatus(); renderGrid();
  });
  $("#fSort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
  let t;
  $("#fSearch").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; renderGrid(); }, 180); });
  $("#grid").addEventListener("click", (e) => {
    if (!e.target.closest("#reset")) return;
    Object.assign(state, search.EMPTY, { q: "" });
    $("#fSearch").value = "";
    bar.reset();
    renderStatus(); renderGrid();
  });

  initViewDot($("#grid"));
  renderStatus();
  renderGrid();
  reveal();
  if (location.hash === "#results") requestAnimationFrame(() => $("#results").scrollIntoView());
})();
