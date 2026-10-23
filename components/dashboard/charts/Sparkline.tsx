const W = 96;
const H = 28;
const PAD = 3;

/** Tiny trend line for a stat tile (decorative: the full chart and its table carry the values). */
export default function Sparkline({ values, color = "#EA580C" }: { values: number[]; color?: string }) {
  if (values.length < 2 || !values.some(Boolean)) return null;
  const max = Math.max(...values);
  const x = (i: number) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (max ? (v / max) * (H - PAD * 2) : 0);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const last = values.length - 1;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="shrink-0 overflow-visible">
      <path d={`${d}L${x(last)},${H - PAD}L${x(0)},${H - PAD}Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r={2.5} fill={color} />
    </svg>
  );
}
