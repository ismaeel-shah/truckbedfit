import Link from "next/link";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export interface Crumb {
  label: string;
  /** Omit for the current page (last crumb) */
  href?: string;
}

/** Visible breadcrumb trail. The BreadcrumbList JSON-LD is built from the same items. */
export default function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={13} className={dark ? "text-slate-500" : "text-slate-400"} aria-hidden="true" />}
            {item.href ? (
              <Link
                href={item.href}
                className={clsx("whitespace-nowrap transition-colors hover:text-accent", dark ? "text-slate-300" : "text-slate-500")}
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={clsx("truncate max-w-[16rem]", dark ? "text-slate-400" : "text-slate-400")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
