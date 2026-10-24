// Truck reference data for truck hubs, the post editor's "Fits these trucks" list and <BedChart>.
//
// ONLY verified figures go here. Anything unknown stays empty with a TODO — never guess
// a bed length: fitment advice is the whole point of the site.
// Order matters: it is the display order, and the navbar's "Trucks" menu shows the first 8 live ones.
// Older generations and trucks without a hub page are listed so articles can be tagged with them
// and [bedchart] can show them once their figures are verified.

export interface BedSize {
  /** As owners say it, e.g. "5.5 ft" or "5'7\"" */
  label: string;
  /** Inside bed length in inches; null when not verified yet */
  insideLengthIn: number | null;
  notes?: string;
}

export interface TruckGeneration {
  /** e.g. "2015–2026" */
  years: string;
  beds: BedSize[];
}

export interface Truck {
  slug: string;
  name: string;
  make: string;
  generations: TruckGeneration[];
  fitmentNotes: string[];
  /** false = taggable on articles but no /trucks page, menu entry or sitemap URL (the content plan has no hub for it) */
  hub?: false;
}

export const TRUCKS: Truck[] = [
  {
    slug: "ford-f-150",
    name: "Ford F-150",
    make: "Ford",
    generations: [
      {
        years: "2015–2026",
        beds: [
          { label: "5.5 ft", insideLengthIn: 67.1 },
          { label: "6.5 ft", insideLengthIn: 78.9 },
          { label: "8 ft", insideLengthIn: 97.6 },
        ],
      },
      {
        // Source: Ford 2014 technical specifications.
        years: "2009–2014",
        beds: [
          { label: "5.5 ft", insideLengthIn: 67.0 },
          { label: "6.5 ft", insideLengthIn: 78.8 },
          { label: "8 ft", insideLengthIn: 97.4 },
        ],
      },
      {
        // Source: dealer spec data (2007). TODO: 5.5 ft and 8 ft inside lengths — not verified yet.
        years: "2004–2008",
        beds: [
          { label: "5.5 ft", insideLengthIn: null },
          { label: "6.5 ft", insideLengthIn: 78.8 },
          { label: "8 ft", insideLengthIn: null },
        ],
      },
    ],
    fitmentNotes: [
      "2024+ models can have the Pro Access Tailgate — confirm an accessory supports it before buying.",
    ],
  },
  {
    slug: "chevy-silverado-1500",
    name: "Chevy Silverado 1500",
    make: "Chevrolet",
    generations: [
      {
        years: "2019–2026",
        beds: [
          { label: "5'10\"", insideLengthIn: 69.9 },
          { label: "6'7\"", insideLengthIn: 79.4 },
          { label: "8'", insideLengthIn: 98.2 },
        ],
      },
      {
        // Source: GM 2014 spec sheet.
        years: "2014–2018 + 2019 Legacy",
        beds: [
          { label: "5'8\"", insideLengthIn: 69.3 },
          { label: "6'6\"", insideLengthIn: 78.9 },
          { label: "8'", insideLengthIn: 97.8 },
        ],
      },
    ],
    fitmentNotes: [
      "Multi-Flex tailgate: confirm an accessory supports it before buying.",
      "2019 Silverado 1500 Legacy is a different body from the 2019+ redesign — confirm which one you have.",
    ],
  },
  {
    slug: "gmc-sierra-1500",
    name: "GMC Sierra 1500",
    make: "GMC",
    generations: [
      {
        // Same bed dimensions as the Silverado 1500.
        years: "2019–2026",
        beds: [
          { label: "5'10\"", insideLengthIn: 69.9 },
          { label: "6'7\"", insideLengthIn: 79.4 },
          { label: "8'", insideLengthIn: 98.2 },
        ],
      },
      {
        // Same bed as the 2014–2018 Silverado 1500 (shared GM platform); source: GM 2014 spec sheet.
        years: "2014–2018 + 2019 Limited",
        beds: [
          { label: "5'8\"", insideLengthIn: 69.3 },
          { label: "6'6\"", insideLengthIn: 78.9 },
          { label: "8'", insideLengthIn: 97.8 },
        ],
      },
    ],
    fitmentNotes: [
      "MultiPro tailgate: confirm an accessory supports it before buying.",
      "CarbonPro bed: confirm an accessory is listed as compatible with it.",
      "2019 Sierra 1500 Limited is a different body from the 2019+ redesign — confirm which one you have.",
    ],
  },
  {
    slug: "ram-1500",
    name: "Ram 1500",
    make: "Ram",
    generations: [
      {
        years: "2019–2026",
        beds: [
          { label: "5'7\"", insideLengthIn: 67.4 },
          { label: "6'4\"", insideLengthIn: 76.3 },
        ],
      },
      {
        // Source: Ram 2014 spec sheet.
        years: "2009–2018 + 1500 Classic",
        beds: [
          { label: "5'7\"", insideLengthIn: 67.4 },
          { label: "6'4\"", insideLengthIn: 76.3 },
          { label: "8'", insideLengthIn: 98.3 },
        ],
      },
    ],
    fitmentNotes: [
      "RamBox cargo management: confirm an accessory is listed as RamBox-compatible.",
      "Multifunction tailgate: confirm an accessory supports it before buying.",
      "Ram 1500 Classic is a different body from the 2019+ Ram 1500 — confirm which one you have.",
    ],
  },
  {
    slug: "toyota-tacoma",
    name: "Toyota Tacoma",
    make: "Toyota",
    generations: [
      {
        years: "2016–2023",
        beds: [
          { label: "5 ft", insideLengthIn: 60.5, notes: "approx." },
          { label: "6 ft", insideLengthIn: 73.7 },
        ],
      },
      {
        // Source: Toyota 2024 product information (short and long bed).
        years: "2024–2026",
        beds: [
          { label: "5 ft", insideLengthIn: 60.3 },
          { label: "6 ft", insideLengthIn: 73.5 },
        ],
      },
    ],
    fitmentNotes: [
      "Deck Rail system: confirm an accessory is listed as compatible with it.",
      "The bed was redesigned for 2024 — accessories for 2016–2023 may not fit 2024+ trucks.",
    ],
  },
  {
    slug: "ford-maverick",
    name: "Ford Maverick",
    make: "Ford",
    generations: [{ years: "2022–2026", beds: [{ label: "4.5 ft", insideLengthIn: 54.4 }] }],
    fitmentNotes: [],
  },
  {
    slug: "jeep-gladiator",
    name: "Jeep Gladiator",
    make: "Jeep",
    generations: [{ years: "2020–2026", beds: [{ label: "5 ft", insideLengthIn: 60.3 }] }],
    fitmentNotes: [],
  },
  {
    slug: "chevy-colorado-gmc-canyon",
    name: "Chevy Colorado / GMC Canyon",
    make: "Chevrolet / GMC",
    generations: [
      {
        years: "2015–2026",
        beds: [
          { label: "5'2\"", insideLengthIn: 61.7 },
          { label: "6'2\"", insideLengthIn: 74 },
        ],
      },
    ],
    fitmentNotes: [],
  },
  {
    slug: "toyota-tundra",
    name: "Toyota Tundra",
    make: "Toyota",
    generations: [
      {
        years: "2022–2026",
        beds: [
          { label: "5.5 ft", insideLengthIn: 65.6 },
          { label: "6.5 ft", insideLengthIn: 77.6 },
          { label: "8.1 ft", insideLengthIn: 96.5 },
        ],
      },
    ],
    fitmentNotes: [],
  },
  {
    slug: "ford-ranger",
    name: "Ford Ranger",
    make: "Ford",
    generations: [
      {
        years: "2019–2023",
        beds: [
          { label: "5 ft", insideLengthIn: 61.0 },
          { label: "6 ft", insideLengthIn: 72.8 },
        ],
      },
      // Source: Ford 2024 technical specifications.
      { years: "2024+", beds: [{ label: "5 ft", insideLengthIn: 59.6, notes: "US models: 5 ft bed only" }] },
    ],
    fitmentNotes: [],
  },
  {
    slug: "nissan-frontier",
    name: "Nissan Frontier",
    make: "Nissan",
    generations: [
      {
        years: "2022–2026",
        beds: [
          { label: "5 ft", insideLengthIn: 59.5 },
          { label: "6 ft", insideLengthIn: 73.3 },
        ],
      },
    ],
    fitmentNotes: [],
  },
  {
    slug: "honda-ridgeline",
    name: "Honda Ridgeline",
    make: "Honda",
    generations: [{ years: "2017–2026", beds: [{ label: "5'4\"", insideLengthIn: 64.0 }] }],
    fitmentNotes: [],
  },
  {
    slug: "nissan-titan",
    name: "Nissan Titan",
    make: "Nissan",
    generations: [
      {
        years: "2016–2024",
        beds: [
          { label: "5.5 ft", insideLengthIn: 67.1 },
          { label: "6.5 ft", insideLengthIn: 78.7 },
          { label: "8 ft", insideLengthIn: 98.0 },
        ],
      },
    ],
    fitmentNotes: [],
  },
  {
    slug: "hyundai-santa-cruz",
    name: "Hyundai Santa Cruz",
    make: "Hyundai",
    generations: [{ years: "2022–2026", beds: [{ label: "4.3 ft", insideLengthIn: 52.1 }] }],
    fitmentNotes: [],
  },
  {
    slug: "ford-super-duty",
    name: "Ford Super Duty (F-250/F-350)",
    make: "Ford",
    generations: [
      {
        // Source: Ford 2026 technical specifications.
        years: "2017–2026",
        beds: [
          { label: "6.75 ft", insideLengthIn: 81.9 },
          { label: "8 ft", insideLengthIn: 98.1 },
        ],
      },
      {
        // Source: TruckDimensions database.
        years: "2011–2016",
        beds: [
          { label: "6.75 ft", insideLengthIn: 81.8 },
          { label: "8 ft", insideLengthIn: 98 },
        ],
      },
    ],
    fitmentNotes: [],
  },
  {
    slug: "ram-2500-3500",
    name: "Ram 2500/3500",
    make: "Ram",
    generations: [
      {
        // 5th generation. Source: Ram cargo box PDF.
        years: "2019–2026",
        beds: [
          { label: "6'4\"", insideLengthIn: 76.3 },
          { label: "8'", insideLengthIn: 98.3 },
        ],
      },
      // TODO: bed sizes for the 2010–2018 Ram HD — not verified yet.
      { years: "2010–2018", beds: [] },
    ],
    fitmentNotes: [],
  },
  // Trucks the content plan writes about without a hub page of their own.
  {
    slug: "chevy-silverado-gmc-sierra-hd",
    name: "Chevy Silverado HD / GMC Sierra HD",
    make: "Chevrolet / GMC",
    generations: [
      {
        // Source: dealer spec data (2024).
        years: "2020–2026",
        beds: [
          { label: "Standard bed", insideLengthIn: 82.25 },
          { label: "Long bed", insideLengthIn: 98.27 },
        ],
      },
    ],
    fitmentNotes: [],
    hub: false,
  },
  {
    slug: "chevy-s10",
    name: "Chevy S10 / GMC Sonoma",
    make: "Chevrolet / GMC",
    generations: [
      {
        // Source: KBB (bed sizes). The 6 ft length is a rounded range; TODO: the 7.3 ft and Crew Cab
        // 4.5 ft inside lengths — not verified yet.
        years: "1994–2004",
        beds: [
          { label: "6 ft", insideLengthIn: 72, notes: "approx. 72–73 in" },
          { label: "7.3 ft", insideLengthIn: null },
          { label: "4.5 ft", insideLengthIn: null, notes: "Crew Cab, 2001–2004" },
        ],
      },
    ],
    fitmentNotes: [],
    hub: false,
  },
  {
    slug: "rivian-r1t",
    name: "Rivian R1T",
    make: "Rivian",
    generations: [
      {
        // Source: Rivian official specifications.
        years: "2022+",
        beds: [{ label: "Standard bed", insideLengthIn: 54, notes: "83.6 in with the tailgate down" }],
      },
    ],
    fitmentNotes: [],
    hub: false,
  },
];

export const TRUCK_SLUGS = TRUCKS.map((t) => t.slug);

/** Whether the truck has its own /trucks/<slug> page. */
export const hasHub = (truck: Truck) => truck.hub !== false;

export function getTruck(slug: string): Truck | undefined {
  return TRUCKS.find((t) => t.slug === slug);
}

/** "2015–2026" style span across all generations, or "" when unknown. */
export function truckYears(truck: Truck): string {
  return truck.generations.map((g) => g.years).join(", ");
}
