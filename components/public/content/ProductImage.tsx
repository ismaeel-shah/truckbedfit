import type { AmazonImage } from "@/lib/amazon/creatorsApi";
import { imgLoadingProps } from "@/lib/utils/imageProps";
import { amazonProductUrl } from "@/lib/products";

/**
 * Amazon product image from the Creators API, shown as served by Amazon (never downloaded or
 * re-hosted) and linked to the product like the "Check price" button.
 */
export default function ProductImage({ image, asin, alt, className = "" }: {
  image: AmazonImage;
  asin: string;
  alt: string;
  /** Size of the white frame, e.g. "h-40 w-full" */
  className?: string;
}) {
  return (
    <a
      href={amazonProductUrl(asin)}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`flex items-center justify-center rounded-md bg-white p-3 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        className="max-h-full max-w-full object-contain"
        referrerPolicy="no-referrer"
        {...imgLoadingProps(false)}
      />
    </a>
  );
}
