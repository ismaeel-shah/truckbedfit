import { processContent } from "@/lib/utils/processContent";
import { splitShortcodes } from "@/lib/utils/shortcodes";
import type { PostProduct } from "@/lib/products";
import type { AmazonImage } from "@/lib/amazon/creatorsApi";
import ProductBox from "@/components/public/content/ProductBox";
import TrustBox from "@/components/public/content/TrustBox";
import BedChart from "@/components/public/content/BedChart";

/**
 * Editor HTML rendered with the site's article typography, with [product N], [trustbox]
 * and [bedchart] shortcodes swapped for components. Everything stays inside one `.prose`
 * wrapper so the table of contents still finds every heading.
 */
export default function ArticleBody({ html, trucks = [], products = [], images = {} }: {
  html: string;
  trucks?: string[];
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
            return product ? <ProductBox key={i} product={product} image={images[product.asin]} /> : null;
          }
          case "trustbox":
            return <TrustBox key={i} />;
          case "bedchart":
            return <BedChart key={i} trucks={segment.trucks} years={segment.years} fallbackTrucks={trucks} />;
        }
      })}
    </div>
  );
}
