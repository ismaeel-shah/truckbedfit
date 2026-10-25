import Link from "next/link";
import { truckPath } from "@/lib/urls";
import { COUNT_RAMP, COUNT_STEP_LABELS, countStep } from "./palette";

/**
 * Truck coverage as a heat grid: one tile per hub truck, shaded by its published article count
 * (orange ordinal ramp; 0 = outlined), with the count written on the tile and a legend for the steps.
 */
export default function CoverageGrid({ trucks }: { trucks: { name: string; slug: string; count: number }[] }) {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {trucks.map((truck) => {
          const step = countStep(truck.count);
          const tone = step === null
            ? "border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-700"
            : `${COUNT_RAMP[step].bg} ${COUNT_RAMP[step].ink}`;
          const body = (
            <>
              <span className="block text-2xl font-bold leading-none tabular-nums">{truck.count}</span>
              <span className="mt-1.5 block truncate text-[11px] font-medium leading-tight">{truck.name}</span>
            </>
          );
          return (
            <li key={truck.slug} title={`${truck.name}: ${truck.count} published ${truck.count === 1 ? "article" : "articles"}`}>
              {truck.count > 0 ? (
                <Link href={truckPath(truck.slug)} target="_blank" className={`block rounded-lg p-3 transition-transform hover:-translate-y-0.5 ${tone}`}>
                  {body}
                </Link>
              ) : (
                <div className={`rounded-lg p-3 ${tone}`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Articles:</span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border-2 border-dashed border-slate-300 dark:border-slate-600" aria-hidden="true" /> 0
        </span>
        {COUNT_RAMP.map((step, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded-sm ${step.bg}`} aria-hidden="true" /> {COUNT_STEP_LABELS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
