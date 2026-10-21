import Link from "next/link";
import SectionHeading from "./SectionHeading";
import type { HomePost } from "./types";

/** Dark full-width band of the most viewed guides, ranked. */
export default function MostRead({ posts }: { posts: HomePost[] }) {
  if (!posts.length) return null;

  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 bg-stripes" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="Most Read" eyebrow="What truck owners are reading" tone="dark" />
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((post, i) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-4">
                <span className="font-heading text-7xl font-extrabold leading-[0.8] text-outline" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0 border-l border-white/15 pl-4">
                  {post.category?.name && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-accent">{post.category.name}</p>
                  )}
                  <h3 className="mt-1 line-clamp-3 font-heading text-xl font-bold leading-snug transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">{post.readingTime} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
