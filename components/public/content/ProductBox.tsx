import { Check, ExternalLink } from "lucide-react";
import { AMAZON_TAG } from "@/lib/site";

// TODO(Amazon Creators API): once API access is approved, fetch the product's title/image
// server-side by ASIN and render them here. Keep this exact text-only box as the fallback
// whenever the API returns nothing. Never show a hard-coded price (Amazon policy).

const ASIN_RE = /^[A-Z0-9]{10}$/;

export function amazonProductUrl(asin: string): string {
  const tag = AMAZON_TAG ? `?tag=${encodeURIComponent(AMAZON_TAG)}` : "";
  return `https://www.amazon.com/dp/${asin}/${tag}`;
}

interface ProductBoxProps {
  name: string;
  asin: string;
  bullets: string[];
  /** Kept for future non-Amazon retailers; the button currently always links to Amazon. */
  retailer?: string;
}

/** Text-only product box: name, the editor's bullet points and a "Check price on Amazon" button. */
export default function ProductBox({ name, asin, bullets }: ProductBoxProps) {
  // A bad ASIN would produce a broken affiliate link — render nothing rather than that.
  if (!name || !ASIN_RE.test(asin)) return null;

  return (
    <aside className="not-prose my-8 rounded-md border-2 border-primary bg-white">
      <div className="h-1.5 hazard-stripe" aria-hidden="true" />
      <div className="p-5 sm:p-6">
        <p className="font-heading text-2xl font-extrabold uppercase leading-tight text-primary">{name}</p>
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
