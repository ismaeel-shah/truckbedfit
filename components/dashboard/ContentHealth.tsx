import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DashboardData } from "@/lib/db/dashboardStats";

/** Fix-list for published posts: each check with its count, a few affected posts and what to do. */
export default function ContentHealth({ checks, published }: { checks: DashboardData["health"]; published: number }) {
  return (
    <section className="card flex flex-col p-5">
      <header className="mb-4">
        <h2 className="font-heading text-lg font-bold text-primary dark:text-white">Content health</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Published articles that need attention</p>
      </header>

      {published === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400 dark:bg-slate-900/40">
          Checks run once you publish your first article.
        </p>
      ) : (
        <ul className="space-y-3">
          {checks.map((check) => (
            <li key={check.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700/60">
              <div className="flex items-start gap-2.5">
                {check.total ? (
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline justify-between gap-2 text-sm font-medium text-primary dark:text-white">
                    {check.label}
                    <span className={`text-xs font-semibold ${check.total ? "text-amber-600" : "text-green-600"}`}>
                      {check.total ? check.total : "All good"}
                    </span>
                  </p>
                  {check.total > 0 && (
                    <>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{check.hint}</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {check.posts.map((post) => (
                          <li key={post.id} className="truncate text-xs">
                            <Link href={`/dashboard/posts/edit/${post.id}`} className="text-slate-600 hover:text-accent dark:text-slate-300">
                              {post.title}
                            </Link>
                          </li>
                        ))}
                        {check.total > check.posts.length && (
                          <li className="text-xs text-slate-400">+{check.total - check.posts.length} more</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
