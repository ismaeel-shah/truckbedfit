import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BlogCardProps {
  post: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
    readingTime: number;
    publishedAt: string | Date;
    category: { name: string; slug: string; icon: string };
  };
  featured?: boolean;
  variant?: "default" | "horizontal" | "minimal";
}

export default function BlogCard({ post, featured = false, variant = "default" }: BlogCardProps) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : "Draft";

  if (variant === "horizontal" || featured) {
    return (
      <article className="group card overflow-hidden flex flex-col md:flex-row hover:shadow-card-hover transition-all duration-300">
        {/* Image */}
        <div className="relative md:w-80 lg:w-96 flex-shrink-0 h-56 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-700">
          {post.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent/30 flex items-center justify-center">
              <span className="text-6xl opacity-50">{post.category?.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
          {/* Category */}
          <span className="absolute top-4 left-4 badge !bg-accent !text-primary !border-accent/30">
            {post.category?.icon} {post.category?.name}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 md:p-8">
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {post.readingTime} min read
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary dark:text-white leading-snug mb-3 group-hover:text-accent transition-colors">
              {post.title}
            </h2>
          </Link>

          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          <Link
            href={`/blog/${post.slug}`}
            className="mt-auto inline-flex items-center gap-2 text-accent font-semibold text-sm hover:gap-3 transition-all duration-200"
          >
            Read Guide <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/20 flex items-center justify-center">
            <span className="text-5xl opacity-60">{post.category?.icon}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Category badge */}
        <span className="absolute top-3 left-3 badge !bg-accent !text-primary !border-accent/30 text-xs">
          {post.category?.icon} {post.category?.name}
        </span>
        {/* Reading time */}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
          <Clock size={11} /> {post.readingTime}m
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-slate-400 mb-2">{timeAgo}</p>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-heading text-lg font-bold text-primary dark:text-white leading-snug mb-2.5 group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:gap-2.5 transition-all duration-200"
        >
          Read more <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
