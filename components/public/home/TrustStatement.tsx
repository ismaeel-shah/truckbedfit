import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

/** Short, honest "how we pick" note on the homepage, linking to the full method page. */
export default function TrustStatement() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 rounded-md border-2 border-primary bg-white p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-accent">
            <ClipboardCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-2xl font-extrabold uppercase leading-none text-primary">How we pick</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              We compare manufacturer specs, official fitment guides and owner reports, and we check bed length,
              cab style and model year before recommending anything. We don&apos;t test products ourselves.
            </p>
          </div>
        </div>
        <Link
          href="/how-we-research"
          className="inline-flex shrink-0 items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-primary hover:text-accent"
        >
          How we research <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
