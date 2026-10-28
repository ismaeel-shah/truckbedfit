import { processContent } from "@/lib/utils/processContent";
import { splitShortcodes } from "@/lib/utils/shortcodes";
import type { PostProduct } from "@/lib/products";
import type { AmazonImage } from "@/lib/amazon/creatorsApi";
import ProductBox from "@/components/public/content/ProductBox";
import ProductFigure from "@/components/public/content/ProductFigure";
import TrustBox from "@/components/public/content/TrustBox";
import BedChart from "@/components/public/content/BedChart";
import TruckTable from "@/components/public/content/TruckTable";
import { PILLAR_CATEGORY_SLUG } from "@/lib/articleTypes";

/**
 * Editor HTML rendered with the site's article typography, with [product N], [product N image], [trustbox],
 * [bedchart] and [trucktable] shortcodes swapped for components. Everything stays inside one `.prose`
 * wrapper so the table of contents still finds every heading.
 */
export default function ArticleBody({ html, trucks = [], products = [], images = {}, categorySlug }: {
  html: string;
  trucks?: string[];
  /** The page's category, the default for [trucktable] (tonneau covers when the page has none) */
  categorySlug?: string;
  /** The post's Products tab, for [product N] */
  products?: PostProduct[];
  /** ASIN → Amazon image for those products */
  images?: Record<string, AmazonImage>;
}) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-accent prose-img:rounded-xl">
      {splitShortcodes(html).map((segment, i) => {
        switch (segment.kind) {
          case "html":
            return <div key={i} dangerouslySetInnerHTML={{ __html: processContent(segment.html) }} />;
          case "product": {
            const product = products[segment.number - 1];
            if (!product) return null;
            return segment.display === "image"
              ? <ProductFigure key={i} product={product} image={images[product.asin]} />
              : <ProductBox key={i} product={product} image={images[product.asin]} />;
          }
          case "trustbox":
            return <TrustBox key={i} />;
          case "bedchart":
            return <BedChart key={i} trucks={segment.trucks} years={segment.years} fallbackTrucks={trucks} />;
          case "trucktable":
            return <TruckTable key={i} category={segment.category ?? categorySlug ?? PILLAR_CATEGORY_SLUG} />;
        }
      })}
    </div>
  );
}
