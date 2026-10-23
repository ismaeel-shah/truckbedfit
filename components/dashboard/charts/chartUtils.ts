"use client";

import { useEffect, useRef, useState } from "react";

/** The one series colour (brand accent) — validated ≥3:1 on both the light and dark card surfaces. */
export const SERIES_COLOR = "#EA580C";

/** 1,284 → "1,284"; 12,900 → "12.9K" */
export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);

/** "2026-10-23" → "Oct 23" */
export const shortDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** A clean axis maximum (1, 2, 5 × 10ⁿ) at or above `max`, and evenly spaced ticks from 0. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const stepInt = Math.max(1, Math.round(step)); // view counts are whole numbers
  const top = Math.ceil(max / stepInt) * stepInt;
  return Array.from({ length: top / stepInt + 1 }, (_, i) => i * stepInt);
}

/** Width of an element, kept up to date (charts draw at their real pixel width so text never stretches). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** False on the first paint, true right after — lets marks animate in from zero. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}
