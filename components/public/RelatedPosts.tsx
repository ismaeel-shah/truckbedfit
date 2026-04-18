import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  readingTime: number;
  category: { name: string; icon: string; slug: string };
}

export default function RelatedPosts({ posts }: { posts: Post[] }) {
  if (!posts?.length) return null;

  return (
    <section className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 not-prose">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
            Keep Reading
          </p>
          <h2 className="font-heading text-2xl font-bold text-primary dark:text-white">
            Related Articles
          </h2>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group card overflow-hidden flex flex-col hover:shadow-card-hover transition-all duration-200"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {post.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  <span className="text-3xl opacity-30">📄</span>
                </div>
              )}
              {/* Category badge */}
              {post.category && (
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full text-primary dark:text-white">
                  {post.category.icon} {post.category.name}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-heading font-bold text-sm text-primary dark:text-white leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3 flex-1">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {post.readingTime} min read
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
                  Read <ArrowRight size={11} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
