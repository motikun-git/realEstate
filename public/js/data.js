/* =========================================================================
   MARKET DATA (UAE)  —  edit this file to change cities, areas, prices
   and projects. No other file needs to change.

   rates  = estimated price per SQUARE FOOT in AED
            new       -> New Launch (off-plan)
            ongoing   -> Under construction
            completed -> Ready to move in

   fee    = government registration / transfer fee for that emirate (%).

   water: true    -> project artwork shows the sea (waterfront areas)
   featured: true -> project appears in the home page showcase + slider

   Optional per project:
     image: "images/x.jpg"          real exterior photo (replaces the drawing)
     interiorImage: "images/y.jpg"  real interior photo
     details: { plot, height, units, parking, sizeText, unitTypes, intro }
       -> real "At A Glance" facts (otherwise demo values are generated)

   IMPORTANT: All prices are rough ESTIMATES for the demo website, based on
   general market levels. Check current figures before going live.
   ========================================================================= */

window.MARKET_DATA = {
  currency: "AED",
  usdRate: 0.2723,          // 1 AED ≈ 0.2723 USD (pegged)

  statuses: {
    new:       { label: "New Launch", short: "New" },
    ongoing:   { label: "Ongoing",    short: "Ongoing" },
    completed: { label: "Completed",  short: "Ready" }
  },

  // Quick size presets for the calculator (sq ft)
  presets: [
    { label: "Studio", sqft: 450 },
    { label: "1 Bed",  sqft: 800 },
    { label: "2 Bed",  sqft: 1250 },
    { label: "3 Bed",  sqft: 1800 },
    { label: "Villa",  sqft: 3500 }
  ],

  cities: [
    /* ---------------------------------------------------------- DUBAI */
    {
      id: "dubai",
      name: "Dubai",
      tagline: "A skyline like no other",
      fee: { label: "DLD fee", pct: 4 },
      areas: [
        {
          id: "downtown", name: "Downtown Dubai",
          blurb: "The city's centrepiece of towers, boulevards and fountains.",
          rates: { new: 3100, ongoing: 3250, completed: 3450 },
          projects: [
            { name: "Boulevard Crest", featured: true, type: "Sky Apartments", status: "ongoing", handover: "Q1 2028" },
            { name: "Opera Heights", type: "Penthouses", status: "completed", handover: "Ready" }
          ]
        },
        {
          id: "palm", name: "Palm Jumeirah", water: true,
          blurb: "Iconic island living with private beaches.",
          rates: { new: 4600, ongoing: 4850, completed: 5200 },
          projects: [
            { name: "Frond Villas", featured: true, type: "Villas", status: "completed", handover: "Ready" },
            { name: "Crescent Residences", type: "Apartments", status: "new", handover: "Q4 2029" }
          ]
        },
        {
          id: "marina", name: "Dubai Marina", water: true,
          blurb: "Waterfront high-rise living along the canal.",
          rates: { new: 2250, ongoing: 2350, completed: 2500 },
          projects: [
            { name: "Marina Vista", type: "Apartments", status: "completed", handover: "Ready" },
            { name: "Harbour Edge", type: "Sky Apartments", status: "new", handover: "Q3 2029" }
          ]
        },
        {
          id: "business-bay", name: "Business Bay", water: true,
          blurb: "Canal-side towers minutes from Downtown.",
          rates: { new: 2250, ongoing: 2350, completed: 2450 },
          projects: [
            { name: "Canal Point", type: "Apartments", status: "ongoing", handover: "Q2 2027" }
          ]
        },
        {
          id: "dubai-hills", name: "Dubai Hills Estate",
          blurb: "Green, golf-side community for families.",
          rates: { new: 2150, ongoing: 2300, completed: 2550 },
          projects: [
            { name: "Parkside Villas", featured: true, type: "Villas", status: "new", handover: "Q2 2029" },
            { name: "Fairway Residences", type: "Townhouses", status: "ongoing", handover: "Q3 2027" }
          ]
        },
        {
          id: "creek", name: "Dubai Creek Harbour", water: true,
          blurb: "New waterfront district beside the wildlife sanctuary.",
          rates: { new: 2300, ongoing: 2400, completed: 2550 },
          projects: [
            { name: "Creekside Towers", featured: true, type: "Apartments", status: "ongoing", handover: "Q4 2027" },
            { name: "Lagoon Terraces", type: "Apartments", status: "new", handover: "Q1 2030" }
          ]
        },
        {
          id: "jvc", name: "Jumeirah Village Circle",
          blurb: "Popular, value-focused community with good rental demand.",
          rates: { new: 1300, ongoing: 1380, completed: 1450 },
          projects: [
            { name: "Circle Gardens", type: "Apartments", status: "completed", handover: "Ready" },
            { name: "Village Townhomes", type: "Townhouses", status: "new", handover: "Q2 2028" }
          ]
        },
        {
          id: "dubai-south", name: "Dubai South",
          blurb: "Growing district by the new airport and Expo City.",
          rates: { new: 1100, ongoing: 1150, completed: 1250 },
          projects: [
            { name: "Skyway Homes", type: "Townhouses", status: "ongoing", handover: "Q1 2028" }
          ]
        }
      ]
    },

    /* ------------------------------------------------------ ABU DHABI */
    {
      id: "abu-dhabi",
      name: "Abu Dhabi",
      tagline: "Islands, culture and calm",
      fee: { label: "Registration fee", pct: 2 },
      areas: [
        {
          id: "saadiyat", name: "Saadiyat Island", water: true,
          blurb: "Beaches, museums and low-density villas.",
          rates: { new: 2300, ongoing: 2450, completed: 2600 },
          projects: [
            { name: "Saadiyat Shores", featured: true, type: "Villas", status: "new", handover: "Q1 2030" },
            { name: "Gallery Residences", type: "Apartments", status: "completed", handover: "Ready" }
          ]
        },
        {
          id: "yas", name: "Yas Island", water: true,
          blurb: "Entertainment island with family homes.",
          rates: { new: 1500, ongoing: 1600, completed: 1700 },
          projects: [
            { name: "Yas Grove", type: "Townhouses", status: "ongoing", handover: "Q4 2027" },
            { name: "Marina Walk", type: "Apartments", status: "new", handover: "Q3 2029" }
          ]
        },
        {
          id: "al-reem", name: "Al Reem Island", water: true,
          blurb: "Waterfront towers next to the city centre.",
          rates: { new: 1350, ongoing: 1450, completed: 1550 },
          projects: [
            { name: "Reem Bay", type: "Sky Apartments", status: "completed", handover: "Ready" }
          ]
        },
        {
          id: "al-raha", name: "Al Raha Beach", water: true,
          blurb: "Beachfront canal community near the airport.",
          rates: { new: 1450, ongoing: 1550, completed: 1650 },
          projects: [
            { name: "Raha Quay", type: "Apartments", status: "ongoing", handover: "Q2 2028" }
          ]
        }
      ]
    },

    /* -------------------------------------------------------- SHARJAH */
    {
      id: "sharjah",
      name: "Sharjah",
      tagline: "Culture, family and value",
      fee: { label: "Registration fee", pct: 4 },
      areas: [
        {
          id: "aljada", name: "Aljada",
          blurb: "Large master-planned district with parks and retail.",
          rates: { new: 1050, ongoing: 1120, completed: 1200 },
          projects: [
            { name: "Aljada Park Homes", type: "Apartments", status: "ongoing", handover: "Q3 2027" },
            { name: "East Boulevard", type: "Townhouses", status: "new", handover: "Q2 2029" }
          ]
        },
        {
          id: "maryam", name: "Maryam Island", water: true,
          blurb: "Waterfront living in the heart of Sharjah.",
          rates: { new: 1200, ongoing: 1280, completed: 1350 },
          projects: [
            { name: "Island Quay", type: "Apartments", status: "completed", handover: "Ready" }
          ]
        },
        {
          id: "al-khan", name: "Al Khan", water: true,
          blurb: "Lagoon-side towers close to Dubai.",
          rates: { new: 700, ongoing: 760, completed: 820 },
          projects: [
            { name: "Lagoon View", type: "Apartments", status: "completed", handover: "Ready" },
            { name: "Khan Heights", type: "Sky Apartments", status: "new", handover: "Q1 2029" }
          ]
        }
      ]
    },

    /* -------------------------------------------------- RAS AL KHAIMAH */
    {
      id: "rak",
      name: "Ras Al Khaimah",
      tagline: "Mountains meet the sea",
      fee: { label: "Registration fee", pct: 4 },
      areas: [
        {
          id: "marjan", name: "Al Marjan Island", water: true,
          blurb: "Resort island with fast-growing demand.",
          rates: { new: 2000, ongoing: 2100, completed: 2200 },
          projects: [
            { name: "Coral Bay Residences", featured: true, type: "Apartments", status: "new", handover: "Q4 2028" },
            { name: "Marjan Beach Villas", type: "Villas", status: "ongoing", handover: "Q2 2028" }
          ]
        },
        {
          id: "mina-al-arab", name: "Mina Al Arab", water: true,
          blurb: "Calm lagoon community with beaches and mangroves.",
          rates: { new: 1100, ongoing: 1170, completed: 1250 },
          projects: [
            { name: "Lagoon Townhouses", type: "Townhouses", status: "completed", handover: "Ready" }
          ]
        }
      ]
    }
  ]
};
