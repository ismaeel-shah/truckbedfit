import { processContent } from "@/lib/utils/processContent";

/** Editor HTML rendered with the site's article typography. */
export default function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-accent prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: processContent(html) }}
    />
  );
}
