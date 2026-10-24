import { MetadataRoute } from "next";
import { listCategories, listLiveAuthors, listPosts } from "@/lib/db/content";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES, PAGES_LAST_UPDATED, SITE_URL as base } from "@/lib/site";
import { isPillarType } from "@/lib/articleTypes";
import { authorPath, categoryPath, truckPath } from "@/lib/urls";
import { TRUCKS } from "@/data/trucks";
import { listHubPages, TRUCKS_INDEX_PATH } from "@/lib/db/hubPages";

export const dynamic = "force-dynamic";

/** Keeps the latest YYYY-MM-DD per key. */
function bump(map: Map<string, string>, key: string, date: string) {
  if (date > (map.get(key) ?? "")) map.set(key, date);
}

// Only published content and live hubs are listed (the visibility rules). Every URL has a
// date-only <lastmod> from the articles' editorial "last updated" dates — never "now".
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedPages: MetadataRoute.Sitemap = [
    { url: `${base}/about`, lastModified: PAGES_LAST_UPDATED },
    { url: `${base}/how-we-research`, lastModified: PAGES_LAST_UPDATED },
    { url: `${base}/contact`, lastModified: PAGES_LAST_UPDATED },
    ...LEGAL_PAGES.map((page) => ({ url: `${base}${page.href}`, lastModified: LEGAL_LAST_UPDATED })),
  ];

  try {
    const [{ posts }, categories, authors, hubs] = await Promise.all([
      listPosts({ limit: 5000, status: "published" }),
      listCategories(),
      listLiveAuthors(),
      listHubPages(),
    ]);

    const byCategory = new Map<string, string>();
    const byTruck = new Map<string, string>();
    let newest = "";
    for (const post of posts) {
      if (post.updatedOn > newest) newest = post.updatedOn;
      bump(byCategory, post.categoryId, post.updatedOn);
      for (const truck of post.trucks) bump(byTruck, truck, post.updatedOn);
    }
    const siteDate = newest || PAGES_LAST_UPDATED;

    const articleUrls = posts
      .filter((post) => !isPillarType(post.type)) // a pillar *is* its category page
      .map((post) => ({ url: `${base}${post.url}`, lastModified: post.updatedOn }));

    const categoryUrls = categories
      .filter((category) => byCategory.has(category._id))
      .map((category) => ({ url: `${base}${categoryPath(category.slug)}`, lastModified: byCategory.get(category._id)! }));

    // A hub's written content (Dashboard → Truck pages) counts toward its lastmod too.
    const hubUpdated = new Map(hubs.filter((hub) => hub.updatedOn).map((hub) => [hub.path, hub.updatedOn!]));
    const latest = (...days: (string | undefined)[]) => days.filter(Boolean).sort().pop()!;
    const truckUrls = TRUCKS
      .filter((truck) => byTruck.has(truck.slug))
      .map((truck) => ({
        url: `${base}${truckPath(truck.slug)}`,
        lastModified: latest(byTruck.get(truck.slug), hubUpdated.get(truckPath(truck.slug))),
      }));

    const authorUrls = authors.map((author) => ({ url: `${base}${authorPath(author.slug)}`, lastModified: author.updatedOn }));

    return [
      { url: base, lastModified: siteDate },
      ...(truckUrls.length ? [{ url: `${base}/trucks`, lastModified: latest(siteDate, hubUpdated.get(TRUCKS_INDEX_PATH)) }] : []),
      ...categoryUrls,
      ...truckUrls,
      ...articleUrls,
      ...authorUrls,
      ...fixedPages,
    ];
  } catch {
    return [{ url: base, lastModified: PAGES_LAST_UPDATED }, ...fixedPages];
  }
}
