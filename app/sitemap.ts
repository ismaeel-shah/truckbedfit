import { MetadataRoute } from "next";
import { listCategories, listPosts } from "@/lib/db/content";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES, PAGES_LAST_UPDATED, SITE_URL as base } from "@/lib/site";

export const dynamic = "force-dynamic";

/** "2026-10-20T09:00:00.000Z" → "2026-10-20". Next writes strings into <lastmod> as-is. */
function day(value: string) {
  return value.slice(0, 10);
}

// Every URL gets a date-only <lastmod> that reflects a real content change:
// posts use their own update date, listings use their newest post, and pages
// whose content lives in code use the dates kept in lib/site.ts.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedPages: MetadataRoute.Sitemap = [
    { url: `${base}/about`, lastModified: PAGES_LAST_UPDATED },
    { url: `${base}/contact`, lastModified: PAGES_LAST_UPDATED },
    ...LEGAL_PAGES.map((page) => ({ url: `${base}${page.href}`, lastModified: LEGAL_LAST_UPDATED })),
  ];

  try {
    const [{ posts }, categories] = await Promise.all([
      listPosts({ limit: 1000, status: "published" }),
      listCategories(),
    ]);

    const newestByCategory = new Map<string, string>();
    let newest = "";
    for (const post of posts) {
      if (post.updatedAt > newest) newest = post.updatedAt;
      const slug = post.category?.slug;
      if (slug && post.updatedAt > (newestByCategory.get(slug) ?? "")) {
        newestByCategory.set(slug, post.updatedAt);
      }
    }
    const listingDate = newest ? day(newest) : PAGES_LAST_UPDATED;

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: day(post.updatedAt),
    }));

    // Empty categories are thin pages; leave them out until they have posts.
    const categoryUrls: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.postCount > 0)
      .map((cat) => ({
        url: `${base}/category/${cat.slug}`,
        lastModified: day(newestByCategory.get(cat.slug) ?? cat.updatedAt),
      }));

    return [
      { url: base, lastModified: listingDate },
      { url: `${base}/blog`, lastModified: listingDate },
      ...categoryUrls,
      ...postUrls,
      ...fixedPages,
    ];
  } catch {
    return [
      { url: base, lastModified: PAGES_LAST_UPDATED },
      { url: `${base}/blog`, lastModified: PAGES_LAST_UPDATED },
      ...fixedPages,
    ];
  }
}
