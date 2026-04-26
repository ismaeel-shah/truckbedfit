import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string;
  readingTime: number;
  category: { name: string; slug: string; icon: string };
}

export default function TrendingSection({ posts }: { posts: Post[] }) {
  if (!posts?.length) return null;

  return (
    <section className="bg-primary rounded-3xl p-6 md:p-10 text-white overflow-hidden relative">
      {/* BG decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp size={20} className="text-accent" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold">
            Trending Now
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.slice(0, 4).map((post, i) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 transition-all duration-300"
            >
              {/* Number */}
              <div className="flex items-center justify-between">
                <span className="font-heading text-4xl font-black text-white/10 group-hover:text-accent/20 transition-colors leading-none">
                  0{i + 1}
                </span>
                <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
                  {post.readingTime}m
                </span>
              </div>

              {/* Thumbnail */}
              {post.featuredImage && (
                <div className="relative h-32 rounded-xl overflow-hidden bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                </div>
              )}

              <div>
                <p className="text-xs text-accent/80 mb-1">
                  {post.category?.icon} {post.category?.name}
                </p>
                <h3 className="font-heading font-bold text-sm text-white leading-snug group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1 text-xs text-white/50 group-hover:text-accent transition-colors mt-auto">
                Read <ArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
