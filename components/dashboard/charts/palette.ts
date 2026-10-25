// Chart colours shared by server and client chart components (no "use client", so both can import it).

/**
 * Categorical slots for part-to-whole charts (dataviz reference palette, fixed order — never cycled).
 * Light steps validated on #ffffff, dark steps on #1e293b (validate_palette.js: all checks pass; three
 * light slots sit below 3:1, so charts using them always show value labels and a table view).
 * Class names are written out in full so Tailwind generates them.
 */
export const CATEGORICAL = [
  { fill: "fill-[#2a78d6] dark:fill-[#3987e5]", stroke: "stroke-[#2a78d6] dark:stroke-[#3987e5]", bg: "bg-[#2a78d6] dark:bg-[#3987e5]" },
  { fill: "fill-[#eb6834] dark:fill-[#d95926]", stroke: "stroke-[#eb6834] dark:stroke-[#d95926]", bg: "bg-[#eb6834] dark:bg-[#d95926]" },
  { fill: "fill-[#1baf7a] dark:fill-[#199e70]", stroke: "stroke-[#1baf7a] dark:stroke-[#199e70]", bg: "bg-[#1baf7a] dark:bg-[#199e70]" },
  { fill: "fill-[#eda100] dark:fill-[#c98500]", stroke: "stroke-[#eda100] dark:stroke-[#c98500]", bg: "bg-[#eda100] dark:bg-[#c98500]" },
  { fill: "fill-[#e87ba4] dark:fill-[#d55181]", stroke: "stroke-[#e87ba4] dark:stroke-[#d55181]", bg: "bg-[#e87ba4] dark:bg-[#d55181]" },
  { fill: "fill-[#008300] dark:fill-[#008300]", stroke: "stroke-[#008300] dark:stroke-[#008300]", bg: "bg-[#008300] dark:bg-[#008300]" },
] as const;

/**
 * Orange ordinal ramp for counts (low → high), validated with --ordinal: light #fb923c → #7c2d12 on
 * #ffffff, dark #9a3412 → #fb923c on #1e293b. `ink` keeps the label readable on each fill.
 */
export const COUNT_RAMP = [
  { bg: "bg-[#fb923c] dark:bg-[#9a3412]", ink: "text-primary dark:text-white" },
  { bg: "bg-[#ea580c] dark:bg-[#c2410c]", ink: "text-white" },
  { bg: "bg-[#c2410c] dark:bg-[#ea580c]", ink: "text-white" },
  { bg: "bg-[#7c2d12] dark:bg-[#fb923c]", ink: "text-white dark:text-primary" },
] as const;

/** Ramp step for an article count: 1 · 2 · 3–4 · 5+ (null for 0). */
export const countStep = (count: number) => (count <= 0 ? null : count === 1 ? 0 : count === 2 ? 1 : count <= 4 ? 2 : 3);
export const COUNT_STEP_LABELS = ["1", "2", "3–4", "5+"] as const;
