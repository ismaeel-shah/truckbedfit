import { AMAZON_TAG } from "@/lib/site";

// Products added in the dashboard's Products tab. Stored on the post (affiliate_products_json),
// shown as "Our top picks" cards above the article, and as a full box wherever the body says
// [product N]. No prices or images: Amazon only allows those through its API.

export interface PostProduct {
  /** Badge such as "Best overall" */
  label: string;
  name: string;
  asin: string;
  /** One line on why it made the list */
  note: string;
  /** Key points for the full product box */
  bullets: string[];
}

export const MAX_PRODUCTS = 20;

/** Amazon product page with our Associates tag (when set). */
export function amazonProductUrl(asin: string): string {
  const tag = AMAZON_TAG ? `?tag=${encodeURIComponent(AMAZON_TAG)}` : "";
  return `https://www.amazon.com/dp/${asin}/${tag}`;
}

const ASIN_RE = /^[A-Z0-9]{10}$/;

export const isValidAsin = (asin: string) => ASIN_RE.test(asin);

/**
 * An ASIN, or an Amazon product link (/dp/…, /gp/product/…) → the uppercase ASIN.
 * Anything else that looks like a link (e.g. an amzn.to short link) is returned unchanged.
 */
export function extractAsin(input: string): string {
  const value = input.trim();
  const fromUrl = value.match(/\/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Za-z0-9]{10})(?:[/?#]|$)/);
  if (fromUrl) return fromUrl[1].toUpperCase();
  return /[/.]/.test(value) ? value : value.toUpperCase();
}

/** Why an ASIN field isn't usable yet, or null when it is. */
export function asinProblem(asin: string): string | null {
  if (isValidAsin(asin)) return null;
  if (/amzn\.(to|com\/d)/i.test(asin)) {
    return "Short links don't include the ASIN — open the product on Amazon and paste the full page link";
  }
  if (/[/.]/.test(asin)) return "Couldn't find an ASIN in this link — paste the product page link (it contains /dp/…)";
  return "Needs a 10-character ASIN (letters and numbers), e.g. B0ABCD1234";
}

/** Ready to render: has a name and a well-formed ASIN. */
export const isCompleteProduct = (product: PostProduct) => Boolean(product.name.trim()) && isValidAsin(product.asin);

/** Normalises stored or submitted products and drops rows the editor left completely empty. */
export function cleanProducts(raw: unknown): PostProduct[] {
  if (!Array.isArray(raw)) return [];
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  return raw
    .map((p) => ({
      label: text(p?.label),
      name: text(p?.name),
      asin: extractAsin(text(p?.asin)),
      note: text(p?.note),
      bullets: Array.isArray(p?.bullets) ? p.bullets.map(text).filter(Boolean) : [],
    }))
    .filter((p) => p.label || p.name || p.asin || p.note || p.bullets.length);
}
