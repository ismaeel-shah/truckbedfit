"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Clock } from "lucide-react";
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

interface PostSliderProps {
  posts: Post[];
  title: string;
  categorySlug?: string;
  icon?: string;
  accentColor?: string;
}

export default function PostSlider({
  posts,
  title,
  categorySlug,
  icon,
}: PostSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!posts?.length) return null;

  return (
    <section className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary dark:text-white">
            {title}
          </h2>
          <div className="hidden sm:block h-px w-16 bg-accent/30 mt-1" />
        </div>
        <div className="flex items-center gap-2">
          {categorySlug && (
            <Link
              href={`/category/${categorySlug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:gap-2.5 transition-all"
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
          <button
            onClick={scrollPrev}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-accent hover:text-accent transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-accent hover:text-accent transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div ref={emblaRef} className="overflow-hidden -mx-2">
        <div className="flex gap-0 touch-pan-y">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex-none w-72 sm:w-80 px-2"
            >
              <article className="card group overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                    <Clock size={11} /> {post.readingTime}m read
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-slate-400 mb-2">
                    {post.publishedAt
                      ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                      : "Draft"}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-heading font-bold text-base text-primary dark:text-white leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-accent text-xs font-semibold hover:gap-2 transition-all mt-auto"
                  >
                    Read more <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
