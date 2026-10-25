import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronRight, PenLine, Truck, Wrench } from "lucide-react";
import type { UpNextItem } from "@/lib/db/dashboardStats";

const ICONS = { scheduled: CalendarClock, draft: PenLine, fix: Wrench, hub: Truck } as const;

/** "What to do today": scheduled posts, drafts to finish, fixes on live articles and unwritten truck pages. */
export default function UpNext({ items, className = "" }: { items: UpNextItem[]; className?: string }) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <header className="mb-3">
        <h2 className="font-heading text-lg font-bold text-primary dark:text-white">Up next</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">What needs you today</p>
      </header>
      {items.length ? (
        <ul className="-mx-2 space-y-0.5">
          {items.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={item.id}>
                <Link href={item.href} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-primary dark:text-white">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-slate-300 transition-colors group-hover:text-accent" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <CheckCircle2 size={24} className="text-green-600" aria-hidden="true" />
          All caught up — nothing waiting.
        </p>
      )}
    </section>
  );
}
