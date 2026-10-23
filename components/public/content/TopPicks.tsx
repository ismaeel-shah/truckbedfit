import { ExternalLink, Star } from "lucide-react";
import type { TopPick } from "@/lib/utils/shortcodes";
import { amazonProductUrl, isValidAsin } from "./ProductBox";

// TODO(Amazon Creators API): add each product's image from the API once access is approved.
// Never download or hotlink Amazon images directly, and never show a price (Amazon policy).

/** "Quick picks" grid from consecutive [toppick] shortcodes: label, name, one-line reason, Amazon button. */
export default function TopPicks({ picks }: { picks: TopPick[] }) {
  // Skip picks with a missing name or bad ASIN rather than render a broken affiliate link.
  const valid = picks.filter((pick) => pick.name && isValidAsin(pick.asin));
  if (!valid.length) return null;

  return (
    <aside className="not-prose my-8" aria-label="Quick picks">
      <p className="mb-4 flex items-center gap-2 font-heading text-lg font-bold uppercase tracking-wide text-primary">
        <Star size={18} className="fill-accent text-accent" aria-hidden="true" /> Quick picks
      </p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {valid.map((pick) => (
          <li key={`${pick.asin}-${pick.label}`} className="flex flex-col rounded-md border-2 border-slate-200 bg-white p-5">
            {pick.label && (
              <span className="self-start rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {pick.label}
              </span>
            )}
            <p className="mt-3 font-heading text-xl font-extrabold uppercase leading-tight text-primary">{pick.name}</p>
            {pick.note && <p className="mt-2 text-sm leading-relaxed text-slate-600">{pick.note}</p>}
            <div className="mt-auto pt-5">
              <a
                href={amazonProductUrl(pick.asin)}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="amazon-btn w-full text-sm"
              >
                Check price on Amazon <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
