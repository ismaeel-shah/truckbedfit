"use client";

import { useState } from "react";
import { SERIES_COLOR, shortDay, useMounted } from "./chartUtils";

const PLOT_H = 140;

/** Articles published per week: ≤24px columns from one baseline, count on the cap, hover/focus tooltip. */
export default function WeeklyColumns({ data }: { data: { weekStart: string; count: number }[] }) {
  const mounted = useMounted();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const labelEvery = Math.ceil(data.length / 4);

  return (
    <div>
      <div className="relative flex items-end gap-1 border-b border-slate-300 dark:border-slate-600" style={{ height: PLOT_H + 18 }}>
        {data.map((d, i) => {
          const h = (d.count / max) * PLOT_H;
          return (
            <button
              key={d.weekStart}
              type="button"
              className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`Week of ${shortDay(d.weekStart)}: ${d.count} published`}
            >
              {d.count > 0 && (
                <span className="mb-1 text-[11px] font-semibold tabular-nums text-primary dark:text-white">{d.count}</span>
              )}
              <span
                className="block w-full max-w-[24px] rounded-t-[4px] transition-[height] duration-700 ease-out group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-accent/40 motion-reduce:transition-none"
                style={{ height: mounted ? h : 0, background: SERIES_COLOR, transitionDelay: `${i * 30}ms` }}
              />
              {active === i && (
                <span
                  className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  style={{ bottom: h + 26 }}
                >
                  <span className="block text-sm font-bold text-primary dark:text-white">
                    {d.count} {d.count === 1 ? "article" : "articles"}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">Week of {shortDay(d.weekStart)}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {data.map((d, i) => (
          <span key={d.weekStart} className="flex flex-1 justify-center whitespace-nowrap text-[11px] text-slate-400">
            {i % labelEvery === 0 || i === data.length - 1 ? shortDay(d.weekStart) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
