"use client";

import { useState } from "react";
import { SERIES_COLOR, useMounted } from "./chartUtils";

const PLOT_H = 150;

/**
 * Distribution of article lengths: adjacent bins (2px gaps) from one baseline, count on each cap,
 * and a shaded band behind the bins for the content plan's target range.
 */
export default function Histogram({ bins, target, unit = "articles" }: {
  bins: { label: string; from: number; to: number; count: number }[];
  /** Shaded "aim for this" range in the same units as the bins (e.g. words) */
  target?: { min: number; max: number; label: string };
  unit?: string;
}) {
  const mounted = useMounted();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...bins.map((b) => b.count));

  // Position of a value along the x axis, in % (bins are equal width; the last one is open-ended).
  const xOf = (value: number) => {
    const i = bins.findIndex((b) => value < b.to);
    if (i < 0) return 100;
    const bin = bins[i];
    const within = bin.to === Infinity ? 0 : (value - bin.from) / (bin.to - bin.from);
    return ((i + within) / bins.length) * 100;
  };

  return (
    <div>
      {/* Extra headroom above the tallest bar keeps its count clear of the target label. */}
      <div className="relative border-b border-slate-300 dark:border-slate-600" style={{ height: PLOT_H + 40 }}>
        {target && (
          <div
            className="absolute inset-y-0 rounded-t-md bg-green-500/10 dark:bg-green-400/10"
            style={{ left: `${xOf(target.min)}%`, width: `${xOf(target.max) - xOf(target.min)}%` }}
            aria-hidden="true"
          >
            <span className="absolute left-1.5 top-1 text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
              {target.label}
            </span>
          </div>
        )}
        <div className="relative flex h-full items-end gap-[2px]">
          {bins.map((bin, i) => {
            const h = (bin.count / max) * PLOT_H;
            return (
              <button
                key={bin.label}
                type="button"
                className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${bin.label} words: ${bin.count} ${unit}`}
              >
                {bin.count > 0 && (
                  <span className="mb-1 text-[11px] font-semibold tabular-nums text-primary dark:text-white">{bin.count}</span>
                )}
                <span
                  className="block w-full rounded-t-[4px] transition-[height] duration-700 ease-out group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-accent/40 motion-reduce:transition-none"
                  style={{ height: mounted ? h : 0, background: SERIES_COLOR, transitionDelay: `${i * 50}ms` }}
                />
                {active === i && (
                  <span
                    className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    style={{ bottom: h + 26 }}
                  >
                    <span className="block text-sm font-bold text-primary dark:text-white">
                      {bin.count} {bin.count === 1 ? unit.replace(/s$/, "") : unit}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{bin.label} words</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-[2px]">
        {bins.map((bin) => (
          <span key={bin.label} className="flex-1 text-center text-[11px] text-slate-400">{bin.label}</span>
        ))}
      </div>
    </div>
  );
}
