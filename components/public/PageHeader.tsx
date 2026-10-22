import Breadcrumbs, { Crumb } from "./Breadcrumbs";
import JsonLd from "./JsonLd";
import { breadcrumbSchema } from "@/lib/utils/schema";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  /** Short intro under the H1 */
  lead?: string;
  breadcrumbs?: Crumb[];
  /** This page's path. With `breadcrumbs`, also emits the matching BreadcrumbList JSON-LD. */
  path?: string;
  /** Extra content under the lead (e.g. a "last updated" line) */
  children?: React.ReactNode;
}

/** Dark striped page header shared by category pages, truck pages and static pages. */
export default function PageHeader({ title, eyebrow, lead, breadcrumbs, path, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {breadcrumbs && path && <JsonLd data={breadcrumbSchema(breadcrumbs, path)} />}
      <div className="absolute inset-0 bg-stripes" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} tone="dark" />
          </div>
        )}
        {eyebrow && (
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
            <span className="h-0.5 w-8 bg-accent" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl font-heading text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{lead}</p>}
        {children}
      </div>
      <div className="relative h-2 hazard-stripe" aria-hidden="true" />
    </section>
  );
}
