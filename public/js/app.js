/* =========================================================================
   HOME PAGE  —  hero, stats, projects + price explorer, reviews, join form.
   Shared pieces (header, menu, footer, helpers) live in layout.js.
   ========================================================================= */

(function () {
  const { $, $$, fmt, money, esc, ALL, card, initCardHover, toast, reveal, STATUS, DATA, SITE } = window.IE;
  const SQM_TO_SQFT = 10.7639;
  const params = new URLSearchParams(location.search);

  /* ---------------- state ---------------- */
  const state = {
    cityId: DATA.cities.some((c) => c.id === params.get("city")) ? params.get("city") : DATA.cities[0].id,
    areaId: null,
    filter: STATUS[params.get("status")] ? params.get("status") : "all",
    calcStatus: STATUS[params.get("status")] ? params.get("status") : "completed",
    sqft: 1250,
    unit: "sqft",
    pickedProject: null
  };
  const city = () => DATA.cities.find((c) => c.id === state.cityId);
  const area = () => (state.areaId ? city().areas.find((a) => a.id === state.areaId) : null);

  /* ---------------- hero ---------------- */
  function initHero() {
    $("#heroEyebrow").textContent = SITE.hero.eyebrow;
    $("#heroTitle").innerHTML = SITE.hero.title;
    $("#heroSub").textContent = SITE.hero.subtitle;

    const video = $("#heroVideo");
    const posterUrl = SITE.hero.poster ||
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(Art.skyline({ mood: "dusk", seed: "hero", raw: true }));
    video.poster = posterUrl;
    $(".hero__media").style.background = `url("${posterUrl}") center / cover`;

    const sound = $("#heroSound");
    video.addEventListener("error", () => { sound.hidden = true; });
    video.src = SITE.hero.video;
    video.play?.().catch(() => {});
    sound.addEventListener("click", () => {
      video.muted = !video.muted;
      sound.classList.toggle("is-on", !video.muted);
      sound.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    });
  }

  /* ---------------- stats (counted from data.js) ---------------- */
  function renderStats() {
    const areas = DATA.cities.flatMap((c) => c.areas);
    const minRate = Math.min(...areas.map((a) => Math.min(...Object.values(a.rates))));
    const stats = [
      { n: DATA.cities.length, label: "Emirates" },
      { n: areas.length, label: "Communities" },
      { n: ALL.length, label: "Projects listed" },
      { n: minRate, label: `${DATA.currency} / sq ft from` }
    ];
    const box = $("#stats");
    box.innerHTML = stats.map((s) => `<div><div class="stat__num" data-count="${s.n}">0</div><div class="stat__label">${s.label}</div></div>`).join("");
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      $$("[data-count]", box).forEach((el) => {
        const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe(box);
  }

  /* ---------------- explorer ---------------- */
  function renderFilters() {
    const opts = [["all", "All"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])];
    $("#statusFilters").innerHTML = opts
      .map(([k, label]) => `<button role="tab" data-filter="${k}" aria-selected="${state.filter === k}" class="${state.filter === k ? "is-on" : ""}">${label}</button>`)
      .join("");
  }

  function renderCities() {
    $("#cities").innerHTML = DATA.cities
      .map((c) => `<button data-city="${c.id}" class="${c.id === state.cityId ? "is-on" : ""}">${esc(c.name)}</button>`).join("");
  }

  function renderAreas() {
    const c = city();
    const maxRate = Math.max(...c.areas.map((a) => Math.max(...Object.values(a.rates))));
    $("#areas").innerHTML = c.areas.map((a) => {
      const open = a.id === state.areaId;
      const from = Math.min(...Object.values(a.rates));
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
            <span class="area__from">from <b>${fmt(from)}</b>/sq ft<i class="area__chev"></i></span>
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
    const list = ALL.filter((p) =>
      p.city.id === c.id &&
      (!state.areaId || p.area.id === state.areaId) &&
      (state.filter === "all" || p.status === state.filter));

    const a = area();
    $("#crumbs").innerHTML =
      `<span>${esc(c.name)}</span>` +
      (a ? `<span>/</span><b>${esc(a.name)}</b><span>·</span><button data-clear-area>Show all areas</button>` : "") +
      `<span>· ${list.length} project${list.length === 1 ? "" : "s"}</span>`;

    $("#projects").innerHTML = list.length
      ? list.map((p, i) => card(p, { estimate: true, delay: i * 60, picked: state.pickedProject === p.id })).join("")
      : `<div class="empty">No ${state.filter === "all" ? "" : STATUS[state.filter].label.toLowerCase() + " "}projects here yet. Try another stage or area.</div>`;
  }

  function renderCalcControls() {
    $("#calcStatus").innerHTML = Object.entries(STATUS)
      .map(([k, s]) => `<button data-calc-status="${k}" class="${k === state.calcStatus ? "is-on" : ""}">${s.label}</button>`).join("");
    $("#presets").innerHTML = DATA.presets
      .map((p) => `<button data-preset="${p.sqft}" class="${p.sqft === state.sqft ? "is-on" : ""}">${p.label} · ${fmt(state.unit === "sqft" ? p.sqft : p.sqft / SQM_TO_SQFT)}</button>`).join("");
    $$("#unitToggle button").forEach((b) => b.classList.toggle("is-on", b.dataset.unit === state.unit));

    const input = $("#sizeInput"), slider = $("#sizeRange");
    const shown = state.unit === "sqft" ? state.sqft : state.sqft / SQM_TO_SQFT;
    if (document.activeElement !== input) input.value = Math.round(shown);
    if (state.unit === "sqft") { slider.min = 200; slider.max = 8000; slider.step = 10; }
    else { slider.min = 20; slider.max = 750; slider.step = 1; }
    slider.value = Math.round(shown);
  }

  function renderResult() {
    const c = city(), a = area();
    const rate = a ? a.rates[state.calcStatus]
      : c.areas.reduce((sum, x) => sum + x.rates[state.calcStatus], 0) / c.areas.length;
    const where = a ? `${a.name}, ${c.name}` : `${c.name} · city average`;
    const base = rate * state.sqft;
    const fee = base * (c.fee.pct / 100);
    const total = base + fee;
    const sizeText = state.unit === "sqft" ? `${fmt(state.sqft)} sq ft` : `${fmt(state.sqft / SQM_TO_SQFT)} sq m (${fmt(state.sqft)} sq ft)`;
    const picked = ALL.find((p) => p.id === state.pickedProject);

    $("#result").innerHTML = `
      <p class="result__where">${picked ? esc(picked.name) + " · " : ""}${esc(where)} · ${STATUS[state.calcStatus].label}</p>
      <p class="result__total">${money(total)}</p>
      <p class="result__usd">≈ USD ${fmt(total * DATA.usdRate)}</p>
      <ul class="result__lines">
        <li><span>Price per sq ft</span><b>${money(rate)}</b></li>
        <li><span>Size</span><b>${sizeText}</b></li>
        <li><span>Property price</span><b>${money(base)}</b></li>
        <li><span>${esc(c.fee.label)} (${c.fee.pct}%)</span><b>${money(fee)}</b></li>
      </ul>
      ${a ? "" : `<p class="result__usd" style="margin-top:12px">Open an area above for its exact rate.</p>`}
      <a href="#join" class="btn btn--gold" data-book>Book a visit</a>`;
  }

  function renderExplorer() {
    renderFilters(); renderCities(); renderAreas(); renderProjects(); renderCalcControls(); renderResult();
  }

  function setSize(sqft) {
    state.sqft = Math.max(50, Math.min(50000, sqft || 0));
    renderCalcControls(); renderResult();
  }

  function pickProject(id) {
    const p = ALL.find((x) => x.id === id);
    if (!p) return;
    state.areaId = p.area.id;
    state.calcStatus = p.status;
    state.pickedProject = p.id;
    renderAreas(); renderProjects(); renderCalcControls(); renderResult();
    if (window.matchMedia("(max-width: 960px)").matches) {
      $("#calc").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      $("#panel").scrollTo({ top: $("#calc").offsetTop - 8, behavior: "smooth" });
    }
  }

  function initExplorer() {
    const work = $("#work");
    work.addEventListener("click", (e) => {
      const t = e.target;
      let el;
      if ((el = t.closest("[data-filter]"))) {
        state.filter = el.dataset.filter;
        if (state.filter !== "all") state.calcStatus = state.filter;
        renderExplorer();
      } else if ((el = t.closest("[data-city]"))) {
        state.cityId = el.dataset.city; state.areaId = null; state.pickedProject = null;
        renderExplorer();
      } else if ((el = t.closest("[data-toggle-area]"))) {
        const id = el.dataset.toggleArea;
        state.areaId = state.areaId === id ? null : id;
        state.pickedProject = null;
        renderAreas(); renderProjects(); renderResult();
      } else if ((el = t.closest(".rate"))) {
        state.areaId = el.dataset.area; state.calcStatus = el.dataset.status;
        renderAreas(); renderCalcControls(); renderResult();
      } else if (t.closest("[data-clear-area]")) {
        state.areaId = null; state.pickedProject = null;
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
        pickProject(el.dataset.estimate);
      } else if (t.closest("[data-book]")) {
        prefillJoin();
      }
    });

    $("#sizeInput").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      if (v) setSize(state.unit === "sqft" ? v : v * SQM_TO_SQFT);
    });
    $("#sizeInput").addEventListener("blur", renderCalcControls);
    $("#sizeRange").addEventListener("input", (e) => {
      const v = +e.target.value;
      setSize(state.unit === "sqft" ? v : v * SQM_TO_SQFT);
    });

    initCardHover($("#projects"));
  }

  function prefillJoin() {
    const c = city(), a = area();
    const form = $("#joinForm");
    const picked = ALL.find((p) => p.id === state.pickedProject);
    form.city.value = c.id;
    const size = state.unit === "sqft" ? `${fmt(state.sqft)} sq ft` : `${fmt(state.sqft / SQM_TO_SQFT)} sq m`;
    form.message.value = `I'd like to visit${picked ? " " + picked.name : ""} — ${a ? a.name + ", " : ""}${c.name} (${STATUS[state.calcStatus].label}), around ${size}.`;
  }

  /* ---------------- reviews ---------------- */
  function renderReviews() {
    const track = $("#reviewsTrack");
    track.innerHTML = SITE.reviews.map((r) => {
      const initials = r.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      return `
        <article class="review">
          ${r.sample ? '<span class="review__sample">Sample</span>' : ""}
          <div class="review__quote" aria-hidden="true">&ldquo;</div>
          <div class="review__stars" aria-label="${r.rating} out of 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <p class="review__text">${esc(r.text)}</p>
          <div class="review__who">
            <div class="review__avatar">${esc(initials)}</div>
            <div><p class="review__name">${esc(r.name)}</p><p class="review__role">${esc(r.role)}</p></div>
          </div>
        </article>`;
    }).join("");
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 28;
    $("#revPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    $("#revNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  }

  /* ---------------- join form ---------------- */
  function initJoin() {
    const form = $("#joinForm");
    const placeholders = {
      buyer: "Tell us what you're looking for",
      broker: "Your agency and the areas you cover",
      career: "The role you're interested in and a link to your CV"
    };
    let type = "buyer";
    const setType = (t) => {
      type = t;
      $$("#joinType button").forEach((x) => x.classList.toggle("is-on", x.dataset.type === t));
      form.message.placeholder = placeholders[t];
    };
    $("#joinCity").innerHTML = `<option value="">Any emirate</option>` +
      DATA.cities.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");

    $("#joinType").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) setType(b.dataset.type);
    });

    // links like index.html?join=broker#join  or  ?project=<id>#join
    if (placeholders[params.get("join")]) setType(params.get("join"));
    const fromProject = ALL.find((p) => p.id === params.get("project"));
    if (fromProject) {
      form.city.value = fromProject.city.id;
      form.message.value = `I'd like to visit ${fromProject.name} — ${fromProject.area.name}, ${fromProject.city.name}.`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      form.name.classList.toggle("is-invalid", !name);
      form.email.classList.toggle("is-invalid", badEmail);
      if (!name || badEmail) { toast("Please add your name and a valid email."); return; }
      // TODO: send to your backend later, e.g. fetch("/api/join", { method: "POST", body: ... })
      console.log("Join form:", { type, name, email, phone: form.phone.value, city: form.city.value, message: form.message.value });
      form.reset();
      toast(`Thank you, ${name.split(" ")[0]}. We'll be in touch soon.`);
    });
  }

  /* ---------------- start ---------------- */
  initHero();
  renderStats();
  renderExplorer();
  initExplorer();
  renderReviews();
  initJoin();
  reveal();
})();
