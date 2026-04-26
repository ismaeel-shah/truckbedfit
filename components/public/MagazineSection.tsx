import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  readingTime: number;
  publishedAt: string | Date;
  category: { name: string; slug: string; icon: string };
}

interface MagazineSectionProps {
  posts: Post[];
  title: string;
  icon?: string;
  categorySlug?: string;
  flip?: boolean; // flip big/small side
}

export default function MagazineSection({
  posts,
  title,
  icon,
  categorySlug,
  flip = false,
}: MagazineSectionProps) {
  if (!posts?.length) return null;

  const [big, ...small] = posts;
  const smalls = small.slice(0, 3);

  const BigCard = (
    <article className="group card overflow-hidden h-full flex flex-col hover:shadow-card-hover transition-all duration-300">
      <div className="relative h-64 md:h-80 overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
        {big.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={big.featuredImage}
            alt={big.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/30 flex items-center justify-center">
            <span className="text-7xl opacity-40">{big.category?.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="badge !bg-accent !text-primary !border-0 mb-2 text-xs">
            {big.category?.icon} {big.category?.name}
          </span>
          <Link href={`/blog/${big.slug}`}>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-snug group-hover:text-accent transition-colors line-clamp-3">
              {big.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
            <span className="flex items-center gap-1"><Clock size={11} /> {big.readingTime}m</span>
            <span>
              {big.publishedAt
                ? formatDistanceToNow(new Date(big.publishedAt), { addSuffix: true })
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{big.excerpt}</p>
        <Link
          href={`/blog/${big.slug}`}
          className="inline-flex items-center gap-1.5 text-accent font-semibold text-sm hover:gap-2.5 transition-all"
        >
          Read article <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );

  const SmallCards = (
    <div className="flex flex-col gap-4 h-full">
      {smalls.map((post) => (
        <article
          key={post._id}
          className="group card overflow-hidden flex gap-4 p-4 hover:shadow-card-hover transition-all duration-300"
        >
          {/* Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
            {post.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-accent/20 flex items-center justify-center">
                <span className="text-2xl">{post.category?.icon}</span>
              </div>
            )}
          </div>
          {/* Text */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-xs text-accent font-semibold mb-1">
              {post.category?.icon} {post.category?.name}
            </span>
            <Link href={`/blog/${post.slug}`}>
              <h4 className="font-heading font-bold text-sm text-primary dark:text-white leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h4>
            </Link>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock size={11} /> {post.readingTime}m
            </span>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary dark:text-white">
            {title}
          </h2>
        </div>
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:gap-2.5 transition-all"
          >
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className={`grid md:grid-cols-5 gap-5 ${flip ? "md:grid-flow-dense" : ""}`}>
        <div className={flip ? "md:col-span-2 md:col-start-4" : "md:col-span-3"}>
          {BigCard}
        </div>
        <div className={flip ? "md:col-span-3 md:col-start-1 md:row-start-1" : "md:col-span-2"}>
          {SmallCards}
        </div>
      </div>
    </section>
  );
}
