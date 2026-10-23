import { Check, ExternalLink } from "lucide-react";
import { AMAZON_TAG } from "@/lib/site";
import { isCompleteProduct, PostProduct } from "@/lib/products";

// TODO(Amazon Creators API): once API access is approved, fetch the product's title/image
// server-side by ASIN and render them here. Keep this exact text-only box as the fallback
// whenever the API returns nothing. Never show a hard-coded price (Amazon policy).

export function amazonProductUrl(asin: string): string {
  const tag = AMAZON_TAG ? `?tag=${encodeURIComponent(AMAZON_TAG)}` : "";
  return `https://www.amazon.com/dp/${asin}/${tag}`;
}

/** Full product box placed with [product N]: label, name, key points and a "Check price on Amazon" button. */
export default function ProductBox({ product }: { product: PostProduct }) {
  // A bad ASIN would produce a broken affiliate link — render nothing rather than that.
  if (!isCompleteProduct(product)) return null;
  const { label, name, asin, bullets } = product;

  return (
    <aside className="not-prose my-8 rounded-md border-2 border-primary bg-white">
      <div className="h-1.5 hazard-stripe" aria-hidden="true" />
      <div className="p-5 sm:p-6">
        {label && (
          <span className="inline-block rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {label}
          </span>
        )}
        <p className={`${label ? "mt-3 " : ""}font-heading text-2xl font-extrabold uppercase leading-tight text-primary`}>{name}</p>
        {bullets.length > 0 && (
          <ul className="mt-4 space-y-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
        <a
          href={amazonProductUrl(asin)}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="amazon-btn mt-5 w-full text-sm sm:w-auto"
        >
          Check price on Amazon <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
