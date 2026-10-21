import { Suspense } from "react";
import { Metadata } from "next";
import BlogCard from "@/components/public/BlogCard";
import CategoryFilter from "@/components/public/CategoryFilter";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { notFound } from "next/navigation";
import {
  buildCanonical, buildOpenGraph, buildTwitter, paginatedPath, paginatedTitle, parsePageParam,
} from "@/lib/utils/seo";
import { SITE_NAME } from "@/lib/site";
import { listCategories, listPosts } from "@/lib/db/content";
import { Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}): Promise<Metadata> {
  const meta  = await getPageMeta("page_blog");
  const page  = parsePageParam(searchParams.page);
  const title = paginatedTitle(meta.metaTitle || "Truck Bed Guides & Reviews", page);
  const baseDesc = meta.metaDescription || `All truck bed accessory buying guides, reviews, and fitment tips from ${SITE_NAME}.`;
  const desc  = page > 1 ? `${baseDesc} Page ${page}.` : baseDesc;
  const canonical = buildCanonical(paginatedPath("/blog", page));
  // Search results and ?category= filters duplicate other pages: keep them out of the
  // index but let crawlers follow their links.
  const isFilteredView = Boolean(searchParams.search || searchParams.category);

  return {
    title:       meta.metaTitle ? { absolute: title } : title,
    description: desc,
    robots: isFilteredView ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description: desc, url: canonical }),
    twitter: buildTwitter({ title, description: desc }),
  };
}

/** Page 1 links to the bare /blog URL so pagination never creates a ?page=1 duplicate. */
function blogPageHref(page: number, search?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

async function getData(searchParams: { page?: string; search?: string; category?: string }) {
  const page = parsePageParam(searchParams.page);
  const search = searchParams.search ?? "";
  const category = searchParams.category ?? "";

  const [{ posts, total, pages }, categories] = await Promise.all([
    listPosts({ page, limit: 9, status: "published", search, category }),
    listCategories(),
  ]);

  return { posts, total, pages: pages ?? 1, categories, page };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const { posts, pages, categories, page } = await getData(searchParams);
  // A page past the end would be an empty "soft 404" — return a real 404 instead.
  if (page > 1 && page > pages) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-2">
          Truck Bed Guides &amp; Reviews
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Buying guides, reviews, and fitment tips for pickup owners
        </p>
      </div>

      {/* Search */}
      <form method="get" className="max-w-md mx-auto mb-6 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Search posts…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </form>

      <Suspense fallback={null}>
        <CategoryFilter categories={categories} />
      </Suspense>

      {posts.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {posts.map((post: Parameters<typeof BlogCard>[0]["post"], i: number) => (
              <BlogCard key={post._id} post={post} priority={i === 0} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={blogPageHref(p, searchParams.search)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-accent text-primary"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <p>No posts found.</p>
        </div>
      )}
    </div>
  );
}
