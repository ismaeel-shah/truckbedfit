import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { DashboardData } from "@/lib/db/dashboardStats";

/** Shown until the first article is published, instead of empty charts: the site's first steps. */
export default function GetStarted({ onboarding, className = "" }: { onboarding: DashboardData["onboarding"]; className?: string }) {
  const steps = [
    { done: onboarding.hasAuthor, title: "Create your author profile", hint: "Photo and a real bio build trust with readers and Google.", href: "/dashboard/authors" },
    { done: onboarding.hasPillar, title: "Write the Tonneau Covers pillar", hint: "Type “Pillar” in the Tonneau Covers category — it becomes /tonneau-covers.", href: "/dashboard/posts/new" },
    { done: onboarding.hasPublished, title: "Publish your first truck page", hint: "A “Best list — by truck” article, e.g. Best Tonneau Covers for Ford F-150.", href: "/dashboard/posts/new" },
    { done: onboarding.trucksIntro, title: "Write the /trucks intro", hint: "Short answer, intro and FAQs under Truck pages.", href: "/dashboard/truck-pages/edit?path=%2Ftrucks" },
    { done: onboarding.amazonTag, title: "Set your Amazon tracking ID", hint: "GitHub → Settings → Variables → NEXT_PUBLIC_AMAZON_TAG, then redeploy.", href: null },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section className={`card p-6 ${className}`}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary dark:text-white">Get started</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Charts and stats fill in here as soon as your first article is live.
          </p>
        </div>
        <span className="text-sm font-semibold text-primary dark:text-white">{doneCount} of {steps.length} done</span>
      </header>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>

      <ol className="mt-5 space-y-2">
        {steps.map((step, i) => {
          const body = (
            <>
              {step.done ? (
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
              ) : (
                <Circle size={20} className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${step.done ? "text-slate-400 line-through" : "text-primary dark:text-white"}`}>
                  {i + 1}. {step.title}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{step.hint}</span>
              </span>
              {step.href && !step.done && <ArrowRight size={16} className="mt-0.5 shrink-0 text-slate-300 group-hover:text-accent" aria-hidden="true" />}
            </>
          );
          return (
            <li key={step.title}>
              {step.href && !step.done ? (
                <Link href={step.href} className="group flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-accent/40 hover:bg-accent/5 dark:border-slate-700">
                  {body}
                </Link>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-700">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
