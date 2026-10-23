import { processContent } from "@/lib/utils/processContent";
import { splitShortcodes } from "@/lib/utils/shortcodes";
import ProductBox from "@/components/public/content/ProductBox";
import TrustBox from "@/components/public/content/TrustBox";
import BedChart from "@/components/public/content/BedChart";
import TopPicks from "@/components/public/content/TopPicks";

/**
 * Editor HTML rendered with the site's article typography, with [productbox], [trustbox],
 * [bedchart] and [toppick] shortcodes swapped for components. Everything stays inside one `.prose`
 * wrapper so the table of contents still finds every heading.
 */
export default function ArticleBody({ html, trucks = [] }: { html: string; trucks?: string[] }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-accent prose-img:rounded-xl">
      {splitShortcodes(html).map((segment, i) => {
        switch (segment.kind) {
          case "html":
            return <div key={i} dangerouslySetInnerHTML={{ __html: processContent(segment.html) }} />;
          case "productbox":
            return <ProductBox key={i} {...segment} />;
          case "trustbox":
            return <TrustBox key={i} />;
          case "bedchart":
            return <BedChart key={i} trucks={segment.trucks} fallbackTrucks={trucks} />;
          case "toppicks":
            return <TopPicks key={i} picks={segment.picks} />;
        }
      })}
    </div>
  );
}
