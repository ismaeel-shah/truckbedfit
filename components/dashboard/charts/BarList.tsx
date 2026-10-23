"use client";

import Link from "next/link";
import { compactNumber, SERIES_COLOR, useMounted } from "./chartUtils";

/**
 * Horizontal bars, one series: label on the left, bar growing from a shared baseline,
 * value at the tip. Bars are 12px with a 4px rounded data-end and square baseline.
 */
export default function BarList({ items, unit }: {
  items: { label: string; value: number; href?: string }[];
  /** e.g. "views", "articles" — used in the accessible label */
  unit: string;
}) {
  const mounted = useMounted();
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <li
            key={`${item.label}-${i}`}
            className="group grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 rounded-md px-1.5 py-1 hover:bg-slate-50 sm:grid-cols-[minmax(0,12rem)_1fr] dark:hover:bg-slate-700/30"
            aria-label={`${item.label}: ${item.value} ${unit}`}
          >
            {item.href ? (
              <Link href={item.href} title={item.label} className="truncate text-xs text-slate-600 hover:text-accent dark:text-slate-300">
                {item.label}
              </Link>
            ) : (
              <span title={item.label} className="truncate text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
            )}
            <div className="flex items-center gap-2">
              <div
                className="h-3 rounded-r-[4px] transition-[width] duration-700 ease-out group-hover:brightness-110 motion-reduce:transition-none"
                style={{ width: mounted ? `calc(${pct}% - 2.5rem * ${pct / 100})` : 0, background: SERIES_COLOR, transitionDelay: `${i * 40}ms` }}
                aria-hidden="true"
              />
              <span className={`text-xs tabular-nums ${item.value ? "font-semibold text-primary dark:text-white" : "text-slate-400"}`}>
                {compactNumber(item.value)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
