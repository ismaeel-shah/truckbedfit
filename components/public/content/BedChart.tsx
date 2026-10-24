import BedSizeTable from "@/components/public/trucks/BedSizeTable";
import { getTruck, TRUCKS, type Truck } from "@/data/trucks";

/** "2004-2014" / "2004 – 2014" → "2004–2014", for matching a generation's years loosely. */
const normalizeYears = (years: string) => years.toLowerCase().replace(/\s+/g, "").replace(/-/g, "–");

/**
 * The year span a text covers: "2004–2014" → [2004, 2014], "2014–2018 + 2019 Legacy" → [2014, 2019],
 * "2024+" → [2024, ∞]; null when it names no year (e.g. "Current models").
 */
function yearSpan(text: string): [number, number] | null {
  const years = (text.match(/\b(19|20)\d{2}\b/g) ?? []).map(Number);
  if (!years.length) return null;
  const openEnded = /\b(?:19|20)\d{2}\s*\+/.test(text) && Math.max(...years) === Number(text.match(/\b((?:19|20)\d{2})\s*\+/)?.[1]);
  return [Math.min(...years), openEnded ? Infinity : Math.max(...years)];
}

/** A generation belongs to `years` when their spans overlap (or, without years, when the text matches). */
function generationMatches(generationYears: string, years: string): boolean {
  const wanted = yearSpan(years);
  const span = yearSpan(generationYears);
  if (wanted && span) return span[0] <= wanted[1] && wanted[0] <= span[1];
  return normalizeYears(generationYears).includes(normalizeYears(years));
}

/**
 * Bed sizes from data/trucks.ts. `trucks` comes from the shortcode; without it the chart
 * uses the article's own trucks, and if the article has none, every truck with verified sizes.
 * `years` keeps only the generations whose years overlap it (e.g. an older-generation page:
 * years="2004-2014" shows both the 2009–2014 and the 2004–2008 F-150).
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
    ? chosen.map((t) => ({ ...t, generations: t.generations.filter((g) => generationMatches(g.years, years)) }))
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
