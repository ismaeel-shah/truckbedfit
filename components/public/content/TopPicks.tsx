import { ExternalLink, Package, Star } from "lucide-react";
import { amazonProductUrl, isCompleteProduct, PostProduct } from "@/lib/products";
import type { AmazonImage } from "@/lib/amazon/creatorsApi";
import ProductImage from "./ProductImage";

// Images only ever come from the Creators API (Amazon policy); never show a price.

/** "Our top picks" cards from the post's Products tab: image, label, name, one-line reason, Amazon button. */
export default function TopPicks({ products, images = {} }: {
  products: PostProduct[];
  /** ASIN → Amazon image (from getProductImages) */
  images?: Record<string, AmazonImage>;
}) {
  // Skip products with a missing name or bad ASIN rather than render a broken affiliate link.
  const picks = products.filter(isCompleteProduct);
  if (!picks.length) return null;
  const anyImage = picks.some((pick) => images[pick.asin]);

  return (
    <section className="mb-10" aria-labelledby="top-picks-heading">
      <p id="top-picks-heading" className="mb-4 flex items-center gap-2 font-heading text-xl font-bold uppercase tracking-wide text-primary">
        <Star size={20} className="fill-accent text-accent" aria-hidden="true" /> Our top picks
      </p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((pick, i) => (
          <li key={i} className="flex flex-col rounded-md border-2 border-slate-200 bg-white p-5">
            {images[pick.asin] ? (
              <ProductImage image={images[pick.asin]} asin={pick.asin} alt={pick.name} className="mb-4 h-40 w-full" />
            ) : anyImage && (
              // Same-size frame keeps the cards' text aligned when only some products have an image.
              <div className="mb-4 flex h-40 w-full items-center justify-center rounded-md bg-slate-50" aria-hidden="true">
                <Package size={36} className="text-slate-300" />
              </div>
            )}
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
