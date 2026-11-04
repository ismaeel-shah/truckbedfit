import ArticleBody from "@/components/public/article/ArticleBody";
import FaqSection from "@/components/public/article/FaqSection";
import ShortAnswer from "@/components/public/article/ShortAnswer";
import TableOfContents from "@/components/public/TableOfContents";
import JsonLd from "@/components/public/JsonLd";
import { faqSchema } from "@/lib/utils/schema";
import type { HubPage } from "@/lib/db/hubPages";

const hasBody = (hub: HubPage | null) => Boolean(hub?.content.replace(/<[^>]*>/g, "").trim());

/** A hub's short answer on its own, for pages that place it above their generated sections. */
export function HubShortAnswer({ hub, className = "" }: { hub: HubPage | null; className?: string }) {
  if (!hub?.shortAnswer.trim()) return null;
  return <ShortAnswer text={hub.shortAnswer} className={`max-w-3xl ${className}`} />;
}

/**
 * A hub's written content (shortcodes work) with a sticky "On this page" sidebar on large screens,
 * like an article. `withShortAnswer` puts the short answer above the text; leave it off when the
 * page shows <HubShortAnswer> elsewhere.
 */
export function HubArticle({ hub, trucks = [], withShortAnswer = false, id }: {
  hub: HubPage | null;
  trucks?: string[];
  withShortAnswer?: boolean;
  /** Anchor for jump links */
  id?: string;
}) {
  const showShortAnswer = withShortAnswer && Boolean(hub?.shortAnswer.trim());
  if (!hub || (!hasBody(hub) && !showShortAnswer)) return null;
  return (
    <section id={id} className="grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 max-w-3xl space-y-8">
        {showShortAnswer && <ShortAnswer text={hub.shortAnswer} />}
        {hasBody(hub) && <ArticleBody html={hub.content} trucks={trucks} />}
      </div>
      {hasBody(hub) && (
        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>
      )}
    </section>
  );
}

/** A hub's FAQs (anchor #faq), at the end of the page, plus their FAQPage JSON-LD. */
export function HubFaqs({ hub }: { hub: HubPage | null }) {
  if (!hub?.faqs.length) return null;
  return (
    <div className="max-w-3xl">
      <JsonLd data={faqSchema(hub.faqs)} />
      <FaqSection faqs={hub.faqs} />
    </div>
  );
}
