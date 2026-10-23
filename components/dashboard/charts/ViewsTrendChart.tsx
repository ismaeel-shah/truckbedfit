"use client";

import { useState } from "react";
import { compactNumber, niceTicks, SERIES_COLOR, shortDay, useElementWidth, useMounted } from "./chartUtils";

const HEIGHT = 220;
const M = { top: 12, right: 14, bottom: 26, left: 40 };

/** Daily reader views: one series, area wash + 2px line, crosshair tooltip that snaps to the day. */
export default function ViewsTrendChart({ data }: { data: { day: string; views: number }[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const mounted = useMounted();
  const [active, setActive] = useState<number | null>(null);

  const ticks = niceTicks(Math.max(...data.map((d) => d.views)));
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const x = (i: number) => M.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => M.top + plotH - (v / top) * plotH;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const last = data.length - 1;
  const labelEvery = Math.ceil(data.length / 5);

  const pick = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left - M.left) / plotW;
    setActive(Math.min(last, Math.max(0, Math.round(ratio * last))));
  };

  const shown = active ?? null;

  return (
    <div ref={ref} className="relative w-full" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Reader views per day, last ${data.length} days`}
          tabIndex={0}
          className="overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? last) - 1));
            if (e.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? last) + 1));
          }}
          onFocus={() => setActive(last)}
        >
          {/* Recessive grid + y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={1} />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
                {compactNumber(t)}
              </text>
            </g>
          ))}
          {/* X labels: a handful of dates */}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === last ? (
              <text key={d.day} x={x(i)} y={HEIGHT - 6} textAnchor={i === last ? "end" : i === 0 ? "start" : "middle"} className="fill-slate-400 text-[11px]">
                {shortDay(d.day)}
              </text>
            ) : null
          )}

          <path
            d={area}
            fill={SERIES_COLOR}
            className="transition-opacity duration-700 motion-reduce:transition-none"
            style={{ opacity: mounted ? 0.1 : 0 }}
          />
          <path
            d={line}
            fill="none"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
            style={{ strokeDashoffset: mounted ? 0 : 1 }}
          />

          {/* Crosshair + hovered point, or the end marker at rest */}
          {shown !== null ? (
            <g pointerEvents="none">
              <line x1={x(shown)} x2={x(shown)} y1={M.top} y2={M.top + plotH} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth={1} />
              <circle cx={x(shown)} cy={y(data[shown].views)} r={4} fill={SERIES_COLOR} strokeWidth={2} className="stroke-white dark:stroke-slate-800" />
            </g>
          ) : (
            <circle cx={x(last)} cy={y(data[last].views)} r={4} fill={SERIES_COLOR} strokeWidth={2} className="stroke-white dark:stroke-slate-800" />
          )}
        </svg>
      )}

      {shown !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          style={{ left: Math.min(Math.max(x(shown), 70), width - 70), top: Math.max(0, y(data[shown].views) - 64) }}
        >
          <p className="text-sm font-bold text-primary dark:text-white">
            {data[shown].views.toLocaleString("en-US")} {data[shown].views === 1 ? "view" : "views"}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES_COLOR }} aria-hidden="true" />
            {shortDay(data[shown].day)}
          </p>
        </div>
      )}
    </div>
  );
}
