import { Suspense } from "react";
import HeroSection from "@/components/public/HeroSection";
import BlogCard from "@/components/public/BlogCard";
import PostSlider from "@/components/public/PostSlider";
import MagazineSection from "@/components/public/MagazineSection";
import TrendingSection from "@/components/public/TrendingSection";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { buildCanonical } from "@/lib/utils/seo";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const meta  = await getPageMeta("page_home");
  const title = meta.metaTitle || "Home Desk Essentials — Home Office Equipment Reviews & Guides";
  const desc  = meta.metaDescription || "Expert reviews and buying guides for ergonomic chairs, standing desks, monitors, and more.";
  return {
    title:       { absolute: title },
    description: desc,
    alternates:  { canonical: buildCanonical("/") },
    openGraph: {
      title, description: desc,
      url:  buildCanonical("/"),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function fetchPosts(params: string) {
  try {
    const res = await fetch(`${base()}/api/posts?status=published&${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const { posts } = await res.json();
    return posts ?? [];
  } catch { return []; }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${base()}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

type Post = {
  _id: string; title: string; slug: string; excerpt: string;
  featuredImage: string; readingTime: number; publishedAt: string | Date;
  category: { name: string; slug: string; icon: string };
};

type Category = { _id: string; name: string; slug: string; icon: string; postCount: number };

export default async function HomePage() {
  const [
    categories,
    latestPosts,
    chairPosts,
    monitorPosts,
    deskPosts,
    keyboardPosts,
    lightingPosts,
  ] = await Promise.all([
    fetchCategories(),
    fetchPosts("limit=8"),
    fetchPosts("category=ergonomic-chairs&limit=6"),
    fetchPosts("category=monitors-displays&limit=4"),
    fetchPosts("category=desks-workstations&limit=4"),
    fetchPosts("category=keyboards-mice&limit=6"),
    fetchPosts("category=lighting-webcams&limit=4"),
  ]);

  const featured   = latestPosts[0] as Post | undefined;
  const heroGrid   = latestPosts.slice(1, 4) as Post[];
  const trending   = latestPosts.slice(0, 4) as Post[];

  return (
    <div className="bg-background dark:bg-[#0D1520]">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-14">

        {/* ── 1. FEATURED + LATEST GRID ───────────────────────── */}
        {(featured || heroGrid.length > 0) && (
          <section>
            <SectionHeader title="Latest Guides" icon={<Flame size={18} className="text-orange-500" />} />
            <div className="grid lg:grid-cols-5 gap-5 mt-6">
              {/* Big featured */}
              {featured && (
                <div className="lg:col-span-3">
                  <BlogCard post={featured} featured />
                </div>
              )}
              {/* 3 small stacked */}
              {heroGrid.length > 0 && (
                <div className="lg:col-span-2 flex flex-col gap-5">
                  {heroGrid.map((post) => (
                    <article key={post._id} className="card group flex gap-4 p-4 hover:shadow-card-hover transition-all duration-300">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                        {post.featuredImage
                          ? <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          : <div className="w-full h-full bg-gradient-to-br from-primary/60 to-accent/20 flex items-center justify-center text-xl">{post.category?.icon}</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-accent font-semibold mb-1">{post.category?.icon} {post.category?.name}</p>
                        <Link href={`/blog/${post.slug}`}>
                          <h3 className="font-heading font-bold text-sm text-primary dark:text-white leading-snug group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">{post.readingTime}m read</p>
                      </div>
                    </article>
                  ))}
                  <Link href="/blog" className="btn-secondary !py-2.5 text-sm justify-center">
                    All Posts <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 2. ERGONOMIC CHAIRS — SLIDER ────────────────────── */}
        {chairPosts.length > 0 && (
          <Suspense fallback={null}>
            <PostSlider
              posts={chairPosts}
              title="Best Ergonomic Chairs"
              icon="🪑"
              categorySlug="ergonomic-chairs"
            />
          </Suspense>
        )}

        {/* ── 3. MONITORS — 3-COL GRID ────────────────────────── */}
        {monitorPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🖥️</span>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary dark:text-white">
                  Monitors & Displays
                </h2>
              </div>
              <Link href="/category/monitors-displays" className="inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:gap-2.5 transition-all">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {monitorPosts.slice(0, 3).map((post: Post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ── 4. TRENDING DARK SECTION ────────────────────────── */}
        {trending.length > 0 && (
          <TrendingSection posts={trending} />
        )}

        {/* ── 5. DESKS — MAGAZINE LAYOUT ──────────────────────── */}
        {deskPosts.length > 0 && (
          <MagazineSection
            posts={deskPosts}
            title="Desks & Workstations"
            icon="🗂️"
            categorySlug="desks-workstations"
          />
        )}

        {/* ── 6. KEYBOARDS — SLIDER ───────────────────────────── */}
        {keyboardPosts.length > 0 && (
          <Suspense fallback={null}>
            <PostSlider
              posts={keyboardPosts}
              title="Keyboards & Mice"
              icon="⌨️"
              categorySlug="keyboards-mice"
            />
          </Suspense>
        )}

        {/* ── 8. LIGHTING — MAGAZINE FLIP ─────────────────────── */}
        {lightingPosts.length > 0 && (
          <MagazineSection
            posts={lightingPosts}
            title="Lighting & Webcams"
            icon="💡"
            categorySlug="lighting-webcams"
            flip
          />
        )}

        {/* ── 9. BROWSE ALL CATEGORIES ────────────────────────── */}
        {categories.length > 0 && (
          <section>
            <SectionHeader title="Browse All Categories" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
              {categories.map((cat: Category) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="group card p-4 text-center hover:shadow-card-hover hover:-translate-y-1.5 hover:border-accent/30 transition-all duration-300"
                >
                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <p className="font-semibold text-xs text-primary dark:text-white group-hover:text-accent transition-colors leading-tight">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{cat.postCount} articles</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary dark:text-white">{title}</h2>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}
