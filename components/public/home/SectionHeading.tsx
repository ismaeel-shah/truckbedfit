import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  icon?: string;
  href?: string;
  tone?: "light" | "dark";
}

export default function SectionHeading({ title, eyebrow, icon, href, tone = "light" }: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={clsx("flex items-end justify-between gap-4 border-b-2 pb-3", dark ? "border-white/20" : "border-primary")}>
      <div className="min-w-0">
        {eyebrow && (
          <p className={clsx("text-[11px] font-bold uppercase tracking-[0.25em] mb-1", dark ? "text-slate-400" : "text-slate-500")}>
            {eyebrow}
          </p>
        )}
        <h2
          className={clsx(
            "font-heading uppercase font-extrabold text-3xl md:text-4xl leading-none flex items-center gap-3",
            dark ? "text-white" : "text-primary"
          )}
        >
          <span className="w-3 h-3 bg-accent shrink-0" aria-hidden="true" />
          {icon && <span className="text-2xl md:text-3xl" aria-hidden="true">{icon}</span>}
          <span className="truncate">{title}</span>
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className={clsx(
            "shrink-0 inline-flex items-center gap-1.5 font-heading uppercase font-bold tracking-wider text-sm transition-colors hover:text-accent",
            dark ? "text-white" : "text-primary"
          )}
        >
          View all<span className="sr-only">: {title}</span> <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
