import { notFound, redirect, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import BlogCard from "@/components/public/BlogCard";
import {
  buildCanonical, buildOpenGraph, buildTwitter, paginatedPath, paginatedTitle, parsePageParam,
} from "@/lib/utils/seo";
import { SITE_NAME } from "@/lib/site";
import { getD1 } from "@/lib/db/d1";
import { getCategoryBySlug, listPosts } from "@/lib/db/content";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  return getCategoryBySlug(slug);
}

async function getPosts(categoryId: string, page = 1) {
  return listPosts({ category: categoryId, page, limit: 9, status: "published" });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}): Promise<Metadata> {
  const cat = await getCategory(params.category);
  if (!cat) return { title: "Category not found" };

  const page  = parsePageParam(searchParams.page);
  const title = paginatedTitle(cat.metaTitle || `${cat.name} — Truck Bed Guides`, page);
  const baseDesc = cat.metaDescription || cat.description
    || `The best ${cat.name.toLowerCase()} for your pickup: fitment-first reviews, buying guides and honest pros and cons from ${SITE_NAME}.`;
  const desc  = page > 1 ? `${baseDesc} Page ${page}.` : baseDesc;
  const canonical = buildCanonical(paginatedPath(`/category/${params.category}`, page));

  return {
    title:       cat.metaTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description: desc, url: canonical }),
    twitter: buildTwitter({ title, description: desc }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}) {
  const cat = await getCategory(params.category);
  if (!cat) {
    const db = getD1();
    const doc = await db
      .prepare("SELECT destination, type FROM redirects WHERE source = ? AND active = 1")
      .bind(`/category/${params.category}`)
      .first<{ destination: string; type: number }>();
    if (doc) {
      if (doc.type === 301) permanentRedirect(doc.destination);
      else redirect(doc.destination);
    }
    notFound();
  }

  const page = parsePageParam(searchParams.page);
  const { posts, pages } = await getPosts(cat._id, page);
  // A page past the end would be an empty "soft 404" — return a real 404 instead.
  if (page > 1 && page > pages) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-accent transition-colors">Home</a>
        <span>/</span>
        <a href="/blog" className="hover:text-accent transition-colors">Blog</a>
        <span>/</span>
        <span className="text-slate-400">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-5xl mb-4 block">{cat.icon}</span>
        <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-3">
          {cat.name}
        </h1>
        {cat.description && (
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {cat.description}
          </p>
        )}
        <p className="text-sm text-slate-400 mt-2">{cat.postCount} articles</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: Parameters<typeof BlogCard>[0]["post"], i: number) => (
            <BlogCard key={post._id} post={post} priority={i === 0} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <p>No posts in this category yet.</p>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={paginatedPath(`/category/${params.category}`, p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-accent text-primary"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
