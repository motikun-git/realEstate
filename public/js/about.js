/* =========================================================================
   ABOUT PAGE  —  story text, values and figures (counted from data.js).
   ========================================================================= */

(function () {
  const { $, fmt, esc, ALL, art, reveal, DATA, SITE } = window.IE;
  const featured = ALL.filter((p) => p.featured);

  $("#aboutLead").textContent = SITE.intro.left;
  $("#storyLeft").textContent = SITE.intro.left;
  $("#storyRight").textContent = SITE.intro.right;
  $("#storyA").style.backgroundImage = art(featured[0] || ALL[0], { w: 700, h: 800 });
  $("#storyB").style.backgroundImage = Art.interior("about-story");

  const pics = [Art.interior("value-1"), Art.pool("value-2"), art(featured[1] || ALL[1], { w: 600, h: 800 }), art(featured[2] || ALL[2], { w: 600, h: 800 })];
  $("#principleList").innerHTML = SITE.principles.map((p, i) => `
    <article class="principle reveal ${i % 2 ? "d1" : ""}">
      <div class="principle__img" style='background-image:${pics[i % pics.length]}' aria-hidden="true"></div>
      <span class="principle__num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.text)}</p>
    </article>`).join("");

  const areas = DATA.cities.flatMap((c) => c.areas);
  const stats = [
    { n: DATA.cities.length, label: "Emirates" },
    { n: areas.length, label: "Communities" },
    { n: ALL.length, label: "Projects listed" },
    { n: ALL.filter((p) => p.status === "completed").length, label: "Ready to move in" }
  ];
  $("#stats").innerHTML = stats.map((s) => `<div><div class="stat__num">${fmt(s.n)}</div><div class="stat__label">${s.label}</div></div>`).join("");

  reveal();
})();
