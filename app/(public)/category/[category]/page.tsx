import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogCard from "@/components/public/BlogCard";
import { buildCanonical } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  if (!res.ok) return null;
  const cats = await res.json();
  return cats.find((c: { slug: string }) => c.slug === slug) ?? null;
}

async function getPosts(categoryId: string, page = 1) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(
    `${base}/api/posts?category=${categoryId}&page=${page}&limit=9&status=published`,
    { cache: "no-store" }
  );
  if (!res.ok) return { posts: [], pages: 1 };
  return res.json();
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

  const title = cat.metaTitle || `${cat.name} — Home Office Guides`;
  const desc  = cat.metaDescription || cat.description
    || `Best ${cat.name.toLowerCase()} reviews and buying guides for your home office.`;
  const page  = parseInt(searchParams.page ?? "1");
  const canonical = buildCanonical(`/category/${params.category}`);

  return {
    title:       cat.metaTitle ? { absolute: title } : title,
    description: desc,
    alternates: {
      canonical,
      ...(page > 1 && { prev: buildCanonical(page === 2 ? `/category/${params.category}` : `/category/${params.category}?page=${page - 1}`) }),
    },
    openGraph: {
      title, description: desc,
      url:  canonical,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: desc },
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
  if (!cat) notFound();

  const page = parseInt(searchParams.page ?? "1");
  const { posts, pages } = await getPosts(cat._id, page);

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
          {posts.map((post: Parameters<typeof BlogCard>[0]["post"]) => (
            <BlogCard key={post._id} post={post} />
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
              href={`/category/${params.category}?page=${p}`}
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
