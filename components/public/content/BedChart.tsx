import BedSizeTable from "@/components/public/trucks/BedSizeTable";
import { getTruck, TRUCKS, type Truck } from "@/data/trucks";

/**
 * Bed sizes from data/trucks.ts. `trucks` comes from the shortcode; without it the chart
 * uses the article's own trucks, and if the article has none, every truck with verified sizes.
 */
export default function BedChart({ trucks, fallbackTrucks = [] }: { trucks: string[] | null; fallbackTrucks?: string[] }) {
  const slugs = trucks ?? fallbackTrucks;
  const selected = slugs.length
    ? slugs.map(getTruck).filter((t): t is Truck => Boolean(t))
    : TRUCKS.filter((t) => t.generations.some((g) => g.beds.length));
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
