import ArticleBody from "@/components/public/article/ArticleBody";
import FaqSection from "@/components/public/article/FaqSection";
import JsonLd from "@/components/public/JsonLd";
import { faqSchema } from "@/lib/utils/schema";
import type { HubPage } from "@/lib/db/hubPages";

/** A hub's written intro (shortcodes work), rendered above the page's generated sections. */
export function HubIntro({ hub, trucks = [] }: { hub: HubPage | null; trucks?: string[] }) {
  if (!hub?.content.replace(/<[^>]*>/g, "").trim()) return null;
  return (
    <section className="max-w-3xl">
      <ArticleBody html={hub.content} trucks={trucks} />
    </section>
  );
}

/** A hub's FAQs, at the end of the page, plus their FAQPage JSON-LD. */
export function HubFaqs({ hub }: { hub: HubPage | null }) {
  if (!hub?.faqs.length) return null;
  return (
    <div className="max-w-3xl">
      <JsonLd data={faqSchema(hub.faqs)} />
      <FaqSection faqs={hub.faqs} />
    </div>
  );
}
