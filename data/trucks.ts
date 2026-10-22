// Truck reference data for truck hubs, the post editor's "Fits these trucks" list and <BedChart>.
//
// ONLY verified figures go here. Anything unknown stays empty with a TODO — never guess
// a bed length: fitment advice is the whole point of the site.
// Order matters: it is the display order, and the navbar's "Trucks" menu shows the first 8 live ones.

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
          { label: "6 ft", insideLengthIn: 73.5 },
        ],
      },
      // TODO: 2024–2026 bed sizes — not verified yet.
      { years: "2024–2026", beds: [] },
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
      // TODO: inside length for the 2024+ US 5 ft bed — not verified yet.
      { years: "2024+", beds: [{ label: "5 ft", insideLengthIn: null, notes: "US models: 5 ft bed only" }] },
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
    // TODO: bed sizes — not verified yet.
    generations: [],
    fitmentNotes: [],
  },
  {
    slug: "ram-2500-3500",
    name: "Ram 2500/3500",
    make: "Ram",
    // TODO: bed sizes — not verified yet.
    generations: [],
    fitmentNotes: [],
  },
];

export const TRUCK_SLUGS = TRUCKS.map((t) => t.slug);

export function getTruck(slug: string): Truck | undefined {
  return TRUCKS.find((t) => t.slug === slug);
}

/** "2015–2026" style span across all generations, or "" when unknown. */
export function truckYears(truck: Truck): string {
  return truck.generations.map((g) => g.years).join(", ");
}
