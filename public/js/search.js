/* =========================================================================
   PROPERTY SEARCH BAR  —  Community · Property type · Bedrooms · Price
   + an "Advanced filters" panel (emirate, area, type, availability,
   bedrooms, price range) with a live count.

   Used on:
     home      -> hero bar; "Search" opens projects.html with the filters
     projects  -> the same bar filters the grid live

   Filters live in the URL:
     ?city=dubai&area=downtown&kind=villa&beds=3&price=u5&status=new
   ========================================================================= */

(function () {
  const { $, esc, ALL, homes, KINDS, bedLabel, STATUS, DATA } = window.IE;

  const PRICES = [
    { id: "u1.5", label: "Under AED 1.5M", max: 1.5e6 },
    { id: "u2", label: "Under AED 2M", max: 2e6 },
    { id: "u3", label: "Under AED 3M", max: 3e6 },
    { id: "u5", label: "Under AED 5M", max: 5e6 },
    { id: "u10", label: "Under AED 10M", max: 1e7 },
    { id: "o10", label: "AED 10M+", min: 1e7 }
  ].map((p) => ({ ...p, label: p.label.replace("AED", DATA.currency) }));
  const BEDS = [0, 1, 2, 3, 4, 5];
  const bedName = (b) => (b === 5 ? "5+ bedrooms" : b === 0 ? "Studio" : `${b} bedroom${b > 1 ? "s" : ""}`);
  const EMPTY = { city: "all", area: "all", kind: "all", beds: "all", price: "all", status: "all" };

  /* ---------- state <-> URL ---------- */
  function fromParams(params) {
    const s = { ...EMPTY };
    const city = DATA.cities.find((c) => c.id === params.get("city"));
    if (city) {
      s.city = city.id;
      if (city.areas.some((a) => a.id === params.get("area"))) s.area = params.get("area");
    }
    let kind = params.get("kind");
    if (!kind && params.get("type")) {            // old links: ?type=Villas
      const t = params.get("type").toLowerCase();
      kind = Object.keys(KINDS).find((k) => t.includes(k.slice(0, 4)));
    }
    if (KINDS[kind]) s.kind = kind;
    const beds = Number(params.get("beds"));
    if (params.get("beds") !== null && BEDS.includes(beds)) s.beds = beds;
    if (PRICES.some((p) => p.id === params.get("price"))) s.price = params.get("price");
    if (STATUS[params.get("status")]) s.status = params.get("status");
    return s;
  }

  function toQuery(s, extra = {}) {
    const q = new URLSearchParams();
    Object.entries(s).forEach(([k, v]) => { if (v !== "all" && v !== "" && v !== undefined) q.set(k, v); });
    Object.entries(extra).forEach(([k, v]) => { if (v) q.set(k, v); });
    return q.toString();
  }

  /* ---------- matching ---------- */
  function matches(p, s) {
    if (s.city !== "all" && p.city.id !== s.city) return false;
    if (s.area !== "all" && p.area.id !== s.area) return false;
    if (s.status !== "all" && p.status !== s.status) return false;
    const h = homes(p);
    if (s.kind !== "all" && h.kind !== s.kind) return false;
    if (s.beds !== "all") {
      if (s.beds === 5 ? h.beds[1] < 5 : (s.beds < h.beds[0] || s.beds > h.beds[1])) return false;
    }
    if (s.price !== "all") {
      const band = PRICES.find((x) => x.id === s.price);
      const b = s.beds === "all" ? null : Math.max(s.beds, h.beds[0]);
      const low = b === null ? h.from : h.priceFor(b);
      const high = b === null ? h.to : h.priceFor(s.beds === 5 ? h.beds[1] : b);
      if (band.max && low >= band.max) return false;
      if (band.min && high < band.min) return false;
    }
    return true;
  }
  const count = (s) => ALL.filter((p) => matches(p, s)).length;

  /* ---------- labels ---------- */
  function locLabel(s) {
    if (s.area !== "all") {
      const c = DATA.cities.find((x) => x.id === s.city);
      return c.areas.find((a) => a.id === s.area).name;
    }
    if (s.city !== "all") return `All of ${DATA.cities.find((x) => x.id === s.city).name}`;
    return "Any";
  }
  const kindLabel = (s) => (s.kind === "all" ? "Any" : KINDS[s.kind]);
  const bedsLabel = (s) => (s.beds === "all" ? "Any" : bedName(s.beds));
  const priceLabel = (s) => (s.price === "all" ? "Any" : PRICES.find((p) => p.id === s.price).label);

  /* ---------- icons ---------- */
  const CHEV = `<svg class="sbar__chev" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
  const TICK = `<svg class="sbar__tick" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 6.5l2.6 2.6L10 3.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
  const SLIDERS = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>`;
  const CLOSE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

  let uid = 0;

  /* =======================================================================
     SearchBar(root, { variant: "hero" | "page", state, onChange, onSearch })
     ======================================================================= */
  function SearchBar(root, opts = {}) {
    const id = `sb${++uid}`;
    const variant = opts.variant || "hero";
    const state = { ...EMPTY, ...(opts.state || {}) };
    const onChange = opts.onChange || (() => {});

    /* option lists for each dropdown: [value, label, extraClass] */
    const lists = {
      loc: () => [["all", "Any"], ...DATA.cities.flatMap((c) => [
        [`c:${c.id}`, `All of ${c.name}`, "is-group"],
        ...c.areas.map((a) => [`a:${c.id}:${a.id}`, a.name, "is-sub"])
      ])],
      kind: () => [["all", "Any"], ...Object.entries(KINDS)],
      beds: () => [["all", "Any"], ...BEDS.map((b) => [String(b), bedName(b)])],
      price: () => [["all", "Any"], ...PRICES.map((p) => [p.id, p.label])]
    };
    const current = {
      loc: () => (state.area !== "all" ? `a:${state.city}:${state.area}` : state.city !== "all" ? `c:${state.city}` : "all"),
      kind: () => state.kind,
      beds: () => String(state.beds),
      price: () => state.price
    };
    const labels = { loc: locLabel, kind: kindLabel, beds: bedsLabel, price: priceLabel };
    const titles = { loc: "Community", kind: "Property type", beds: "Bedrooms", price: "Price" };

    function set(field, value) {
      if (field === "loc") {
        const [t, c, a] = value.split(":");
        state.city = t === "all" ? "all" : c;
        state.area = t === "a" ? a : "all";
      } else if (field === "beds") {
        state.beds = value === "all" ? "all" : Number(value);
      } else {
        state[field] = value;
      }
      refresh();
      onChange({ ...state });
    }

    const field = (f) => `
      <div class="sbar__field" data-field="${f}">
        <span class="sbar__label" id="${id}-${f}-l">${titles[f]}</span>
        <button class="sbar__btn" type="button" aria-haspopup="listbox" aria-expanded="false"
          aria-labelledby="${id}-${f}-l ${id}-${f}-v" aria-controls="${id}-${f}-m">
          <span class="sbar__val" id="${id}-${f}-v"></span>${CHEV}
        </button>
        <ul class="sbar__menu" id="${id}-${f}-m" role="listbox" aria-labelledby="${id}-${f}-l" tabindex="-1"></ul>
      </div>`;

    root.classList.add("sbar", `sbar--${variant}`);
    root.setAttribute("role", "search");
    root.innerHTML = `
      <div class="sbar__bar">
        ${field("loc")}${field("kind")}${field("beds")}${field("price")}
        <button class="sbar__adv" type="button" aria-expanded="false" aria-controls="${id}-panel" aria-label="Advanced filters" title="Advanced filters">${SLIDERS}<span class="sbar__dot" hidden></span></button>
        <button class="sbar__go" type="submit">Search</button>
      </div>
      <div class="sbar__panel" id="${id}-panel" role="dialog" aria-label="Advanced filters" hidden>
        <div class="sbar__phead">
          <p class="sbar__ptitle"><i></i>Advanced filters</p>
          <button class="sbar__close" type="button" aria-label="Close filters">${CLOSE}</button>
        </div>
        <div class="sbar__pbody">
          <div class="sbar__group sbar__group--wide"><p class="sbar__glabel">Emirate</p><div class="sbar__chips" data-chips="city"></div></div>
          <div class="sbar__group sbar__group--wide"><p class="sbar__glabel">Community</p><div class="sbar__chips" data-chips="area"></div></div>
          <div class="sbar__group"><p class="sbar__glabel">Property type</p><div class="sbar__chips" data-chips="kind"></div></div>
          <div class="sbar__group"><p class="sbar__glabel">Bedrooms</p><div class="sbar__chips" data-chips="beds"></div></div>
          <div class="sbar__group"><p class="sbar__glabel">Availability</p><div class="sbar__chips" data-chips="status"></div></div>
          <div class="sbar__group"><p class="sbar__glabel">Price range</p><div class="sbar__chips" data-chips="price"></div></div>
        </div>
        <div class="sbar__pfoot">
          <p class="sbar__count" aria-live="polite"></p>
          <div class="sbar__pbtns">
            <button class="sbar__reset" type="button">Reset</button>
            <button class="sbar__apply" type="button">${variant === "page" ? "Done" : "Search"}</button>
          </div>
        </div>
      </div>`;

    const panel = root.querySelector(".sbar__panel");
    const advBtn = root.querySelector(".sbar__adv");

    /* ---------- chips in the panel ---------- */
    const chip = (key, val, label, on) =>
      `<button class="sbar__chip ${on ? "is-on" : ""}" type="button" data-k="${key}" data-v="${esc(String(val))}" aria-pressed="${on}">${esc(label)}</button>`;

    function renderChips() {
      const areas = state.city === "all"
        ? DATA.cities.flatMap((c) => c.areas.map((a) => ({ c, a })))
        : DATA.cities.find((c) => c.id === state.city).areas.map((a) => ({ c: DATA.cities.find((x) => x.id === state.city), a }));
      const groups = {
        city: chip("city", "all", "Any", state.city === "all") + DATA.cities.map((c) => chip("city", c.id, c.name, state.city === c.id)).join(""),
        area: chip("area", "all", "Any", state.area === "all") + areas.map(({ c, a }) => chip("area", `${c.id}:${a.id}`, a.name, state.area === a.id && state.city === c.id)).join(""),
        kind: chip("kind", "all", "Any", state.kind === "all") + Object.entries(KINDS).map(([k, l]) => chip("kind", k, l, state.kind === k)).join(""),
        beds: chip("beds", "all", "Any", state.beds === "all") + BEDS.map((b) => chip("beds", b, b === 5 ? "5+" : b === 0 ? "Studio" : String(b), state.beds === b)).join(""),
        status: chip("status", "all", "Any status", state.status === "all") + Object.entries(STATUS).map(([k, s]) => chip("status", k, s.label, state.status === k)).join(""),
        price: chip("price", "all", "Any", state.price === "all") + PRICES.map((p) => chip("price", p.id, p.label, state.price === p.id)).join("")
      };
      root.querySelectorAll("[data-chips]").forEach((el) => { el.innerHTML = groups[el.dataset.chips]; });
      const n = count(state);
      root.querySelector(".sbar__count").innerHTML = n
        ? `<b>${n}</b> project${n === 1 ? "" : "s"} match your criteria.`
        : `No projects match yet — try fewer filters.`;
    }

    panel.addEventListener("click", (e) => {
      const c = e.target.closest(".sbar__chip");
      if (!c) return;
      const { k, v } = c.dataset;
      if (k === "city") { state.city = v; state.area = "all"; }
      else if (k === "area") {
        if (v === "all") state.area = "all";
        else { const [ci, a] = v.split(":"); state.city = ci; state.area = a; }
      }
      else if (k === "beds") state.beds = v === "all" ? "all" : Number(v);
      else state[k] = v;
      refresh();
      onChange({ ...state });
    });

    /* ---------- open up or down, whichever has room ---------- */
    const wide = window.matchMedia("(min-width: 961px)");
    function place(needed) {
      if (!wide.matches) { root.classList.remove("is-up"); return; }
      const r = root.querySelector(".sbar__bar").getBoundingClientRect();
      const header = (document.getElementById("header")?.offsetHeight || 0) + 12;
      const above = r.top - header, below = window.innerHeight - r.bottom - 12;
      root.classList.toggle("is-up", below < needed && above > below);
    }

    /* ---------- dropdowns ---------- */
    let openField = null;

    function renderMenu(f) {
      const ul = root.querySelector(`[data-field="${f}"] .sbar__menu`);
      const cur = current[f]();
      ul.innerHTML = lists[f]().map(([v, l, cls = ""]) =>
        `<li class="sbar__opt ${cls}" role="option" tabindex="-1" data-v="${esc(v)}" aria-selected="${v === cur}">${esc(l)}${TICK}</li>`).join("");
    }

    function open(f) {
      close(false);
      openField = f;
      const wrap = root.querySelector(`[data-field="${f}"]`);
      renderMenu(f);
      place(Math.min(360, wrap.querySelector(".sbar__menu").scrollHeight + 10));
      wrap.classList.add("is-open");
      wrap.querySelector(".sbar__btn").setAttribute("aria-expanded", "true");
      const sel = wrap.querySelector('[aria-selected="true"]') || wrap.querySelector(".sbar__opt");
      sel.focus({ preventScroll: true });
      sel.scrollIntoView({ block: "nearest" });
    }

    function close(focusBack = true) {
      if (!openField) return;
      const wrap = root.querySelector(`[data-field="${openField}"]`);
      wrap.classList.remove("is-open");
      const btn = wrap.querySelector(".sbar__btn");
      btn.setAttribute("aria-expanded", "false");
      if (focusBack) btn.focus({ preventScroll: true });
      openField = null;
    }

    root.querySelectorAll(".sbar__field").forEach((wrap) => {
      const f = wrap.dataset.field;
      const btn = wrap.querySelector(".sbar__btn"), ul = wrap.querySelector(".sbar__menu");
      btn.addEventListener("click", () => (openField === f ? close() : open(f)));
      btn.addEventListener("keydown", (e) => {
        if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); open(f); }
      });
      ul.addEventListener("click", (e) => {
        const o = e.target.closest(".sbar__opt");
        if (!o) return;
        set(f, o.dataset.v);
        close();
      });
      ul.addEventListener("keydown", (e) => {
        const opts = [...ul.querySelectorAll(".sbar__opt")];
        const i = opts.indexOf(document.activeElement);
        const go = (j) => { e.preventDefault(); opts[Math.max(0, Math.min(opts.length - 1, j))].focus(); };
        if (e.key === "ArrowDown") go(i + 1);
        else if (e.key === "ArrowUp") go(i - 1);
        else if (e.key === "Home") go(0);
        else if (e.key === "End") go(opts.length - 1);
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (opts[i]) { set(f, opts[i].dataset.v); close(); } }
        else if (e.key === "Escape") { e.preventDefault(); close(); }
        else if (e.key === "Tab") close(false);
      });
    });

    /* ---------- advanced panel ---------- */
    function togglePanel(show = panel.hidden) {
      close(false);
      panel.hidden = !show;
      root.classList.toggle("is-panel", show);
      advBtn.setAttribute("aria-expanded", String(show));
      document.documentElement.classList.toggle("sbar-lock", show && window.matchMedia("(max-width: 760px)").matches);
      if (show) {
        renderChips();
        place(panel.offsetHeight + 12);
        if (root.classList.contains("is-up") && wide.matches) {
          const top = panel.getBoundingClientRect().top, header = (document.getElementById("header")?.offsetHeight || 0) + 12;
          if (top < header) window.scrollBy({ top: top - header });
        }
        panel.querySelector(".sbar__chip.is-on")?.focus({ preventScroll: true }); }
    }
    advBtn.addEventListener("click", () => togglePanel());
    root.querySelector(".sbar__close").addEventListener("click", () => { togglePanel(false); advBtn.focus(); });
    root.querySelector(".sbar__reset").addEventListener("click", () => {
      Object.assign(state, EMPTY);
      refresh();
      onChange({ ...state });
    });
    root.querySelector(".sbar__apply").addEventListener("click", () => {
      togglePanel(false);
      if (variant === "page") opts.onSearch?.({ ...state });
      else submit();
    });
    panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { togglePanel(false); advBtn.focus(); } });

    /* ---------- outside click ---------- */
    document.addEventListener("pointerdown", (e) => {
      if (openField && !e.target.closest(`[data-field="${openField}"]`)) close(false);
      if (!panel.hidden && !root.contains(e.target)) togglePanel(false);
    });

    /* ---------- submit ---------- */
    function submit() {
      if (opts.onSearch) opts.onSearch({ ...state });
      else location.href = `projects.html${toQuery(state) ? "?" + toQuery(state) : ""}#results`;
    }
    root.addEventListener("submit", (e) => { e.preventDefault(); togglePanel(false); submit(); });

    /* ---------- refresh labels ---------- */
    function refresh() {
      ["loc", "kind", "beds", "price"].forEach((f) => {
        const wrap = root.querySelector(`[data-field="${f}"]`);
        wrap.querySelector(".sbar__val").textContent = labels[f](state);
        wrap.classList.toggle("is-set", current[f]() !== "all");
        if (openField === f) renderMenu(f);
      });
      root.querySelector(".sbar__dot").hidden = state.status === "all";
      if (!panel.hidden) renderChips();
    }

    refresh();
    return {
      get state() { return { ...state }; },
      set(next) { Object.assign(state, EMPTY, next); refresh(); },
      reset() { Object.assign(state, EMPTY); refresh(); }
    };
  }

  Object.assign(window.IE, {
    SearchBar,
    search: { EMPTY, PRICES, BEDS, bedName, fromParams, toQuery, matches, count }
  });
})();
