import { Suspense } from "react";
import { Metadata } from "next";
import BlogCard from "@/components/public/BlogCard";
import CategoryFilter from "@/components/public/CategoryFilter";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { buildCanonical } from "@/lib/utils/seo";
import { Search } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}): Promise<Metadata> {
  const meta  = await getPageMeta("page_blog");
  const title = meta.metaTitle || "Blog";
  const desc  = meta.metaDescription || "All home office buying guides, reviews, and tips from WorkNest.";
  const page  = parseInt(searchParams.page ?? "1");
  const isSearch = !!searchParams.search;

  return {
    title:       meta.metaTitle ? { absolute: title } : title,
    description: desc,
    // Noindex search result pages to prevent duplicate content
    robots: isSearch ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: buildCanonical("/blog"),
      ...(page > 1 && { prev: buildCanonical(page === 2 ? "/blog" : `/blog?page=${page - 1}`) }),
    },
    openGraph: {
      title, description: desc,
      url:  buildCanonical("/blog"),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

async function getData(searchParams: { page?: string; search?: string; category?: string }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const page = searchParams.page ?? "1";
  const search = searchParams.search ?? "";
  const category = searchParams.category ?? "";

  const [postsRes, catsRes] = await Promise.all([
    fetch(
      `${base}/api/posts?page=${page}&limit=9&status=published${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${base}/api/categories`, { next: { revalidate: 3600 } }),
  ]);

  const [{ posts, total, pages }, categories] = await Promise.all([
    postsRes.json(),
    catsRes.json(),
  ]);

  return { posts, total, pages: pages ?? 1, categories, page: parseInt(page) };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const { posts, pages, categories, page } = await getData(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-2">
          Home Office Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Expert guides, reviews, and tips for remote workers
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
            {posts.map((post: Parameters<typeof BlogCard>[0]["post"]) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
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
