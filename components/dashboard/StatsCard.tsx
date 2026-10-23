import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** One short line under the value, e.g. "of 12 posts" */
  caption?: ReactNode;
  /** Optional mini chart shown beside the value (e.g. a sparkline) */
  trend?: ReactNode;
}

/** Stat tile: label + icon on top, the number large below, a muted caption, optional trend. */
export default function StatsCard({ label, value, icon: Icon, caption, trend }: StatsCardProps) {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold leading-none text-primary dark:text-white">{value}</p>
        {trend}
      </div>
      {caption && <p className="mt-2 truncate text-xs text-slate-400">{caption}</p>}
    </div>
  );
}
