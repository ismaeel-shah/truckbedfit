import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** One short line under the value, e.g. "of 12 posts" */
  caption?: ReactNode;
  /** Optional mini chart shown beside the value (e.g. a sparkline) */
  trend?: ReactNode;
  /** "dark" for tiles inside the dashboard's dark hero band */
  tone?: "light" | "dark";
}

/** Stat tile: label + icon on top, the number large below, a muted caption, optional trend. */
export default function StatsCard({ label, value, icon: Icon, caption, trend, tone = "light" }: StatsCardProps) {
  const dark = tone === "dark";
  return (
    <div
      className={clsx(
        "flex flex-col p-5",
        dark ? "rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm" : "card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={clsx("truncate text-sm font-medium", dark ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>{label}</p>
        <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-accent", dark ? "bg-accent/15" : "bg-accent/10")}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className={clsx("text-3xl font-bold leading-none", dark ? "text-white" : "text-primary dark:text-white")}>{value}</p>
        {trend}
      </div>
      {caption && <p className="mt-2 truncate text-xs text-slate-400">{caption}</p>}
    </div>
  );
}
