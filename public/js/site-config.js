/* =========================================================================
   SITE CONFIG  —  brand, contact details, hero video and reviews.
   Change things here; the page fills itself from this file.
   ========================================================================= */

window.SITE = {
  brand: "Infusions Estate",
  shortBrand: "INFUSIONS",          // big wordmark in the header
  subBrand: "ESTATE",

  // Put your video at public/videos/hero.mp4 (MP4, H.264, ~10–20 MB max).
  // Until the file exists the poster image is shown instead.
  hero: {
    video: "videos/hero.mp4",
    poster: "",                      // optional image; empty = built-in skyline artwork
    eyebrow: "Homes across the UAE",
    title: "Where every address<br>becomes a legacy",
    subtitle: "Explore communities in Dubai, Abu Dhabi, Sharjah and Ras Al Khaimah — and see the estimated price of your home before you visit."
  },

  // TODO: replace every value below with InfusionsTech's real details.
  contact: {
    phone: "+880 1XXX-XXXXXX",
    whatsapp: "",                    // digits only with country code, e.g. "8801712345678"
    email: "info@example.com",
    address: "Office address, Dhaka, Bangladesh",
    hours: "Sun – Thu, 10:00 – 18:00",
    mapUrl: ""                       // optional Google Maps link
  },

  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#"
  },

  /* Customer reviews.
     The entries below are PLACEHOLDERS so you can see the layout.
     Replace them with real client feedback (with the client's permission)
     and set sample: false. While sample is true a "Sample" tag is shown. */
  reviews: [
    {
      sample: true,
      name: "Client name",
      role: "Homeowner · Dubai Hills",
      rating: 5,
      text: "Replace this with a real review. Keep it short — two or three sentences about the client's experience works best."
    },
    {
      sample: true,
      name: "Client name",
      role: "Investor · Dubai Marina",
      rating: 5,
      text: "Replace this with a real review. Mention what the client bought and what they valued most about working with you."
    },
    {
      sample: true,
      name: "Client name",
      role: "Family buyer · Abu Dhabi",
      rating: 4,
      text: "Replace this with a real review. Real names and photos (with permission) make this section far more convincing."
    }
  ]
};
