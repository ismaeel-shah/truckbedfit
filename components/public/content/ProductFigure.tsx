import { ExternalLink } from "lucide-react";
import { amazonProductUrl, isCompleteProduct, PostProduct } from "@/lib/products";
import type { AmazonImage } from "@/lib/amazon/creatorsApi";
import ProductImage from "./ProductImage";

/**
 * Just the product's photo, placed with [product N image], captioned with its name and a
 * "Check price" link. Without an image from the Creators API only the caption shows.
 */
export default function ProductFigure({ product, image }: { product: PostProduct; image?: AmazonImage }) {
  // A bad ASIN would produce a broken affiliate link — render nothing rather than that.
  if (!isCompleteProduct(product)) return null;
  const { name, asin } = product;

  return (
    <figure className="not-prose my-8">
      {image && (
        <ProductImage image={image} asin={asin} alt={name} className="h-64 w-full border border-slate-200 sm:h-80" />
      )}
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-primary">{name}</span>
        <a
          href={amazonProductUrl(asin)}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
        >
          Check price on Amazon <ExternalLink size={13} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
