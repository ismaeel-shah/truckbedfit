import { ExternalLink, Star } from "lucide-react";
import { isCompleteProduct, PostProduct } from "@/lib/products";
import { amazonProductUrl } from "./ProductBox";

// TODO(Amazon Creators API): add each product's image from the API once access is approved.
// Never download or hotlink Amazon images directly, and never show a price (Amazon policy).

/** "Our top picks" cards from the post's Products tab: label, name, one-line reason, Amazon button. */
export default function TopPicks({ products }: { products: PostProduct[] }) {
  // Skip products with a missing name or bad ASIN rather than render a broken affiliate link.
  const picks = products.filter(isCompleteProduct);
  if (!picks.length) return null;

  return (
    <section className="mb-10" aria-labelledby="top-picks-heading">
      <p id="top-picks-heading" className="mb-4 flex items-center gap-2 font-heading text-xl font-bold uppercase tracking-wide text-primary">
        <Star size={20} className="fill-accent text-accent" aria-hidden="true" /> Our top picks
      </p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((pick, i) => (
          <li key={i} className="flex flex-col rounded-md border-2 border-slate-200 bg-white p-5">
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
    </section>
  );
}
