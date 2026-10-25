import Link from "next/link";
import clsx from "clsx";
import { BookOpen, Clock, ExternalLink, Eye, Plus, TrendingUp, Truck } from "lucide-react";
import StatsCard from "./StatsCard";
import Sparkline from "./charts/Sparkline";

export const VIEW_RANGES = [7, 30, 90] as const;
export type ViewRange = (typeof VIEW_RANGES)[number];

/**
 * Dark, branded top band of the dashboard: greeting, quick actions, the views range filter (it scopes
 * the views tile and the views chart below) and the four headline numbers.
 */
export default function DashboardHero({ name, counts, viewsInRange, range, sparkline }: {
  name: string;
  counts: { total: number; published: number; drafts: number; scheduled: number; views: number };
  /** Reader views in the selected range */
  viewsInRange: number;
  range: ViewRange;
  /** Daily views for the selected range (oldest → newest) */
  sparkline: number[];
}) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl bg-primary text-white shadow-lg">
      <div className="absolute inset-0 bg-stripes opacity-60" aria-hidden="true" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{today}</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase leading-none md:text-4xl">
              Welcome back{name ? `, ${name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {counts.published} live · {counts.drafts} {counts.drafts === 1 ? "draft" : "drafts"} · {counts.scheduled} scheduled
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/posts/new" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-orange-500">
              <Plus size={16} aria-hidden="true" /> New post
            </Link>
            <Link href="/dashboard/truck-pages" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">
              <Truck size={16} aria-hidden="true" /> Truck pages
            </Link>
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">
              <ExternalLink size={16} aria-hidden="true" /> View site
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Views:</span>
          {VIEW_RANGES.map((days) => (
            <Link
              key={days}
              href={days === 30 ? "/dashboard" : `/dashboard?range=${days}`}
              scroll={false}
              aria-current={days === range ? "true" : undefined}
              className={clsx(
                "rounded-full px-3 py-1 font-semibold transition-colors",
                days === range ? "bg-accent text-primary" : "bg-white/10 text-slate-200 hover:bg-white/20"
              )}
            >
              Last {days} days
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard tone="dark" label="Published" value={counts.published} icon={BookOpen}
            caption={`of ${counts.total} ${counts.total === 1 ? "post" : "posts"}`} />
          <StatsCard tone="dark" label="Not live yet" value={counts.drafts + counts.scheduled} icon={Clock}
            caption={`${counts.drafts} ${counts.drafts === 1 ? "draft" : "drafts"} · ${counts.scheduled} scheduled`} />
          <StatsCard tone="dark" label={`Views · ${range} days`} value={viewsInRange.toLocaleString("en-US")} icon={TrendingUp}
            caption="Readers only — no bots or editors" trend={<Sparkline values={sparkline} />} />
          <StatsCard tone="dark" label="All-time views" value={counts.views.toLocaleString("en-US")} icon={Eye}
            caption="Across every article" />
        </div>
      </div>
      <div className="relative h-1.5 hazard-stripe" aria-hidden="true" />
    </section>
  );
}
