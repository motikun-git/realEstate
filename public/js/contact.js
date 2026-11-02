/* =========================================================================
   CONTACT PAGE  —  one form for buyers, brokers and job applicants.
   ?type=buyer|broker|career  picks the tab
   ?project=<id>              pre-fills the project (from "Book a visit")
   ?note=<text>               pre-fills the message (from the price explorer)
   ========================================================================= */

(function () {
  const { $, $$, esc, params, ALL, findProject, reveal, validate, sendForm, toast, DATA, SITE } = window.IE;

  const TYPES = {
    buyer: {
      label: "Buyer",
      extraLabel: "Interested in",
      options: ["Any project", ...ALL.map((p) => `${p.name} — ${p.area.name}`)],
      placeholder: "Which home are you looking for? Budget, size, move-in date…"
    },
    broker: {
      label: "Broker",
      extraLabel: "Main market",
      options: DATA.cities.map((c) => c.name),
      placeholder: "Your agency, RERA/broker number and the areas you cover"
    },
    career: {
      label: "Career",
      extraLabel: "Department",
      options: ["Sales", "Marketing", "Design & Architecture", "Engineering", "Customer care"],
      placeholder: "The role you're interested in and a link to your CV or LinkedIn"
    }
  };

  const form = $("#contactForm");
  let type = TYPES[params.get("type")] ? params.get("type") : "buyer";

  function setType(t) {
    type = t;
    const cfg = TYPES[t];
    $("#cType").innerHTML = Object.entries(TYPES)
      .map(([k, v]) => `<button type="button" role="radio" class="chip ${k === t ? "is-on" : ""}" aria-checked="${k === t}" data-type="${k}">${v.label}</button>`).join("");
    $("#cExtraLabel").textContent = cfg.extraLabel;
    $("#cExtra").innerHTML = cfg.options.map((o) => `<option>${esc(o)}</option>`).join("");
    form.message.placeholder = cfg.placeholder;
  }
  $("#cType").addEventListener("click", (e) => { const b = e.target.closest("[data-type]"); if (b) setType(b.dataset.type); });
  setType(type);

  // pre-fill from links
  const proj = findProject(params.get("project"));
  if (proj && type === "buyer") {
    $("#cExtra").value = `${proj.name} — ${proj.area.name}`;
    form.message.value = `I'd like to book a visit to ${proj.name} in ${proj.area.name}, ${proj.city.name}.`;
  } else if (params.get("note")) {
    form.message.value = `I'd like to know more about: ${params.get("note")}.`;
  }

  const modeNote = {
    mailto: "Sending opens your email app with this message filled in.",
    whatsapp: "Sending opens WhatsApp with this message filled in.",
    endpoint: "We reply within one working day."
  };
  $("#formNote").textContent = modeNote[SITE.forms?.mode] || modeNote.mailto;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.website.value) return;                      // spam trap
    if (!validate(form)) { toast("Please add your name and a valid email."); return; }
    const ok = await sendForm(`${TYPES[type].label} enquiry — ${SITE.brand}`, {
      Type: TYPES[type].label,
      Name: form.name.value.trim(),
      Email: form.email.value.trim(),
      Phone: form.phone.value.trim(),
      [TYPES[type].extraLabel]: form.extra.value,
      Message: form.message.value.trim()
    });
    if (ok) {
      toast(`Thank you, ${form.name.value.trim().split(" ")[0]}. We'll be in touch shortly.`);
      if (SITE.forms?.mode === "endpoint") form.reset();
    }
  });

  // office details + map
  const c = SITE.contact;
  $("#contactInfo").innerHTML = `
    <li><span>Phone</span><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ""))}">${esc(c.phone)}</a></li>
    <li><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
    ${c.whatsapp ? `<li><span>WhatsApp</span><a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener">Chat with us</a></li>` : ""}
    <li><span>Office</span>${c.mapUrl ? `<a href="${esc(c.mapUrl)}" target="_blank" rel="noopener">${esc(c.address)}</a>` : esc(c.address)}</li>
    <li><span>Hours</span>${esc(c.hours)}</li>`;
  $("#contactSocials").innerHTML = $("#footer .socials")?.innerHTML || "";
  $("#contactMap").innerHTML = `<iframe title="Office location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(c.mapQuery || c.address)}&z=14&output=embed"></iframe>`;

  reveal();
})();
