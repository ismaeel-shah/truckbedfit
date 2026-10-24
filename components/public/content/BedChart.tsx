import BedSizeTable from "@/components/public/trucks/BedSizeTable";
import { getTruck, TRUCKS, type Truck } from "@/data/trucks";

/** "2004-2014" / "2004 – 2014" → "2004–2014", for matching a generation's years loosely. */
const normalizeYears = (years: string) => years.toLowerCase().replace(/\s+/g, "").replace(/-/g, "–");

/**
 * Bed sizes from data/trucks.ts. `trucks` comes from the shortcode; without it the chart
 * uses the article's own trucks, and if the article has none, every truck with verified sizes.
 * `years` keeps only the generations whose years contain it (e.g. an older-generation page).
 */
export default function BedChart({ trucks, years = null, fallbackTrucks = [] }: {
  trucks: string[] | null;
  years?: string | null;
  fallbackTrucks?: string[];
}) {
  const slugs = trucks ?? fallbackTrucks;
  const chosen = slugs.length
    ? slugs.map(getTruck).filter((t): t is Truck => Boolean(t))
    : TRUCKS.filter((t) => t.generations.some((g) => g.beds.length));
  const selected = years
    ? chosen.map((t) => ({ ...t, generations: t.generations.filter((g) => normalizeYears(g.years).includes(normalizeYears(years))) }))
    : chosen;
  if (!selected.length) return null;

  return (
    <figure className="not-prose my-8">
      <BedSizeTable trucks={selected} showTruck={selected.length > 1} />
      <figcaption className="mt-2 text-xs text-slate-500">
        Inside bed lengths. Always confirm your exact bed length and cab style before ordering.
      </figcaption>
    </figure>
  );
}
