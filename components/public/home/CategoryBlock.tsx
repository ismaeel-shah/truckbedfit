import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import clsx from "clsx";
import SectionHeading from "./SectionHeading";
import PostImage from "./PostImage";
import type { HomeCategory, HomePost } from "./types";

interface CategoryBlockProps {
  category: HomeCategory;
  posts: HomePost[];
  index: number;
}

/** One homepage section per category; alternates between a card row and a feature + list layout. */
export default function CategoryBlock({ category, posts, index }: CategoryBlockProps) {
  if (!posts.length) return null;

  const isRow = index % 2 === 0;
  const eyebrow = `Gear type ${String(index + 1).padStart(2, "0")}${category.postCount ? ` · ${category.postCount} guides` : ""}`;

  return (
    <section className={clsx(isRow ? "bg-white" : "bg-background")}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title={category.name}
          eyebrow={eyebrow}
          icon={category.icon || undefined}
          href={`/category/${category.slug}`}
        />
        {isRow ? <CardRow posts={posts} /> : <FeatureWithList posts={posts} />}
      </div>
    </section>
  );
}

function CardRow({ posts }: { posts: HomePost[] }) {
  return (
    <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {posts.slice(0, 4).map((post) => (
        <GearCard key={post._id} post={post} />
      ))}
    </div>
  );
}

function GearCard({ post }: { post: HomePost }) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-primary">
          <PostImage post={post} />
          <span className="absolute bottom-0 left-0 flex items-center gap-1 bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Clock size={11} /> {post.readingTime} min
          </span>
        </div>
        <h3 className="mt-4 line-clamp-2 font-heading text-xl font-bold leading-snug text-primary transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary transition-colors group-hover:text-accent">
          Read guide <ArrowRight size={12} />
        </span>
      </Link>
    </article>
  );
}

function FeatureWithList({ posts }: { posts: HomePost[] }) {
  const [lead, ...rest] = posts;
  const others = rest.slice(0, 4);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-12">
      <Link
        href={`/blog/${lead.slug}`}
        className={clsx(
          "group relative block min-h-[320px] overflow-hidden rounded-md bg-primary",
          others.length ? "lg:col-span-7" : "lg:col-span-12"
        )}
      >
        <PostImage post={lead} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-8">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 border-l-2 border-accent pl-2 text-xs font-bold uppercase tracking-widest text-white">
              <Clock size={12} /> {lead.readingTime} min read
            </p>
            <h3 className="mt-2 font-heading text-3xl font-bold uppercase leading-[1.05] transition-colors group-hover:text-accent md:text-4xl">
              {lead.title}
            </h3>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-primary transition-colors group-hover:bg-accent">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>

      {others.length > 0 && (
        <ul className="divide-y divide-slate-200 border-y-2 border-primary lg:col-span-5">
          {others.map((post) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug}`} className="group flex items-center gap-4 py-4">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md">
                  <PostImage post={post} className="text-2xl" />
                </div>
                <div className="min-w-0">
                  <h4 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-primary transition-colors group-hover:text-accent">
                    {post.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">{post.readingTime} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
