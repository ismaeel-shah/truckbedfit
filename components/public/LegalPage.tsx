import Link from "next/link";
import { format } from "date-fns";
import clsx from "clsx";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, LEGAL_PAGES } from "@/lib/site";

interface LegalPageProps {
  title: string;
  /** This page's path, to highlight it in the side menu. */
  path: (typeof LEGAL_PAGES)[number]["href"];
  children: React.ReactNode;
}

/** Shared shell for Privacy Policy, Terms, Affiliate Disclosure and Disclaimer. */
export default function LegalPage({ title, path, children }: LegalPageProps) {
  // Noon UTC so the date never shifts a day when formatted in another timezone.
  const updated = format(new Date(`${LEGAL_LAST_UPDATED}T12:00:00Z`), "MMMM d, yyyy");

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-stripes" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
            <span className="h-0.5 w-8 bg-accent" aria-hidden="true" />
            Legal
          </p>
          <h1 className="mt-4 font-heading text-5xl font-extrabold uppercase leading-none md:text-6xl">{title}</h1>
          <p className="mt-4 text-sm text-slate-400">Last updated: {updated}</p>
        </div>
        <div className="relative h-2 hazard-stripe" aria-hidden="true" />
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8">
        <article className="prose prose-slate max-w-3xl prose-headings:font-heading prose-headings:uppercase prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-lg prose-li:my-1">
          {children}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Legal pages" className="rounded-md border-2 border-slate-200 bg-white">
            <p className="border-b border-slate-200 px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Legal pages
            </p>
            <ul className="p-2">
              {LEGAL_PAGES.map((page) => {
                const current = page.href === path;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      aria-current={current ? "page" : undefined}
                      className={clsx(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        current ? "bg-accent/10 text-accent" : "text-slate-600 hover:bg-background hover:text-primary"
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-slate-200 px-5 py-4 text-xs leading-relaxed text-slate-500">
              Questions? Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </nav>
        </aside>
      </div>
    </div>
  );
}
