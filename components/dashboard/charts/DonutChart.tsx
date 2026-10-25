"use client";

import { useState } from "react";
import { useMounted } from "./chartUtils";
import { CATEGORICAL } from "./palette";

const SIZE = 168;
const R = 64;
const STROKE = 26;
const C = 2 * Math.PI * R;
/** 2px surface gap between segments, measured along the ring */
const GAP = 2;

/**
 * Part-to-whole donut (≤ 6 segments, fixed palette order). Centre shows the total — or the hovered
 * segment — and the legend always lists every value with its share, so nothing depends on colour or hover.
 */
export default function DonutChart({ items, totalLabel }: {
  items: { label: string; value: number }[];
  /** Caption under the centre number, e.g. "articles" */
  totalLabel: string;
}) {
  const mounted = useMounted();
  const [active, setActive] = useState<number | null>(null);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const shown = active !== null ? items[active] : null;

  let offset = 0;
  const segments = items.map((item, i) => {
    const length = total ? (item.value / total) * C : 0;
    const segment = { i, start: offset, length: Math.max(0, length - (item.value && items.filter((x) => x.value).length > 1 ? GAP : 0)) };
    offset += length;
    return segment;
  });

  return (
    // Legend beside the ring only when the card is wide; stacked otherwise so labels never get squeezed out.
    <div className="flex flex-col items-center gap-5 2xl:flex-row">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden="true">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" strokeWidth={STROKE} className="stroke-slate-100 dark:stroke-slate-700/60" />
          {segments.map(({ i, start, length }) =>
            length > 0 ? (
              <circle
                key={i}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                strokeWidth={active === i ? STROKE + 6 : STROKE}
                className={`${CATEGORICAL[i % CATEGORICAL.length].stroke} cursor-pointer transition-[stroke-dasharray,stroke-width] duration-700 ease-out motion-reduce:transition-none`}
                strokeDasharray={mounted ? `${length} ${C - length}` : `0 ${C}`}
                strokeDashoffset={-start}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
              />
            ) : null
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold leading-none text-primary dark:text-white">{shown ? shown.value : total}</span>
          <span className="mt-1 max-w-[6.5rem] truncate text-[11px] text-slate-500 dark:text-slate-400">
            {shown ? shown.label : totalLabel}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1.5">
        {items.map((item, i) => (
          <li
            key={item.label}
            tabIndex={0}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs outline-none transition-colors ${
              active === i ? "bg-slate-100 dark:bg-slate-700/50" : ""
            } focus-visible:ring-2 focus-visible:ring-accent/40`}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${CATEGORICAL[i % CATEGORICAL.length].bg}`} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">{item.label}</span>
            <span className="font-semibold tabular-nums text-primary dark:text-white">{item.value}</span>
            <span className="w-9 text-right tabular-nums text-slate-400">{total ? Math.round((item.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
