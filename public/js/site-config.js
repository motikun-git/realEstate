/* =========================================================================
   SITE CONFIG  —  brand, texts, contact details, forms and reviews.
   Change things here; every page fills itself from this file.
   ========================================================================= */

window.SITE = {
  brand: "Infusions Estate",
  shortBrand: "INFUSIONS",
  subBrand: "ESTATE",
  tagline: "A name you can trust",

  // Your live address, used for share links and SEO (no trailing slash)
  siteUrl: "https://www.example.com",

  /* Default colour theme for first-time visitors: "light" or "dark".
     Visitors can switch with the toggle in the header. */
  defaultTheme: "light",

  hero: {
    // Put your video at public/videos/hero.mp4 (MP4, H.264, under ~20 MB).
    // Until the file exists, the poster artwork is shown instead.
    video: "videos/hero.mp4",
    poster: "",                         // optional image path; empty = built-in artwork
    words: ["Innovation", "Quality", "Trust"],
    line: "Building dream homes across the UAE"
  },

  intro: {
    title: "Building dream homes & enriching lifestyles with <em>trust and excellence</em>",
    left: "At Infusions Estate we don't just create properties; we craft homes that reflect innovation, reliability and the way you want to live.",
    right: "Your home should be a reflection of you. From the first visit to the final handover, we make sure it is more than a place to live — it is a legacy of comfort and style."
  },

  principles: [
    { title: "Integrity", text: "Clear prices, honest timelines and no surprises at handover." },
    { title: "Quality", text: "Materials, finishes and workmanship we would choose for our own homes." },
    { title: "Innovation", text: "Smart layouts, efficient buildings and tools like our price explorer." },
    { title: "Customer focus", text: "One advisor with you from first question to final key." }
  ],

  // TODO: replace every value below with InfusionsTech's real details.
  contact: {
    phone: "+880 1XXX-XXXXXX",
    whatsapp: "",                        // digits with country code, e.g. "8801712345678"
    email: "info@example.com",
    address: "Office address, Dhaka, Bangladesh",
    hours: "Sun – Thu, 10:00 – 18:00",
    mapQuery: "Dhaka, Bangladesh",       // what the office map searches for
    mapUrl: ""                           // optional Google Maps share link
  },

  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#"
  },

  /* FORMS — there is no database yet, so choose where form messages go:
       "mailto"   -> opens the visitor's email app with the message filled in (default)
       "whatsapp" -> opens WhatsApp to contact.whatsapp with the message filled in
       "endpoint" -> POSTs JSON to forms.endpoint (e.g. Formspree, or your own API later) */
  forms: {
    mode: "mailto",
    endpoint: ""
  },

  /* Customer reviews.
     These are PLACEHOLDERS so you can see the layout. Replace them with real
     client feedback (with the client's permission) and set sample: false.
     While sample is true a "Sample" tag is shown on the card. */
  reviews: [
    {
      sample: true,
      name: "Client name",
      role: "Homeowner · Dubai Hills",
      text: "Replace this with a real review. Two or three sentences about the client's experience — the consultation, the handover, what they valued most — works best."
    },
    {
      sample: true,
      name: "Client name",
      role: "Investor · Dubai Marina",
      text: "Replace this with a real review. Mention what the client bought and why they chose to work with you."
    },
    {
      sample: true,
      name: "Client name",
      role: "Family buyer · Abu Dhabi",
      text: "Replace this with a real review. Real names and photos (with permission) make this section far more convincing."
    }
  ]
};
