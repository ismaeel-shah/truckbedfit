import type { Truck } from "@/data/trucks";

/**
 * Compact bed sizes for one truck: a row per generation with each bed's inside length.
 * Unverified lengths say so, never estimated (same data as BedSizeTable).
 */
export default function BedSizeGlance({ truck }: { truck: Truck }) {
  if (!truck.generations.some((gen) => gen.beds.length)) {
    return <p className="text-sm text-slate-500">Verified bed sizes for this truck are coming soon.</p>;
  }

  return (
    <dl className="divide-y divide-slate-100">
      {truck.generations.map((gen) => (
        <div key={gen.years} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:items-center">
          <dt className="text-sm font-semibold text-primary">{gen.years}</dt>
          <dd className="flex flex-wrap gap-2">
            {gen.beds.map((bed) => (
              <span
                key={bed.label}
                title={bed.notes}
                className="inline-flex items-baseline gap-1.5 rounded-md border border-slate-200 bg-background px-2.5 py-1 text-sm"
              >
                <span className="font-heading font-bold text-primary">{bed.label}</span>
                {bed.insideLengthIn !== null ? (
                  <span className="text-xs text-slate-500">{bed.insideLengthIn} in</span>
                ) : (
                  <span className="text-xs text-slate-400">not verified yet</span>
                )}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
