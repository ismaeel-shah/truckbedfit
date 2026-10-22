import Link from "next/link";
import { format } from "date-fns";
import SectionHeading from "./SectionHeading";
import PostImage from "./PostImage";
import type { HomePost } from "./types";

/** Numbered two-column list of the newest guides. */
export default function LatestList({ posts }: { posts: HomePost[] }) {
  if (!posts.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title="Latest Guides" eyebrow="Fresh off the bench" />
      <ol className="mt-2 grid gap-x-12 md:grid-cols-2">
        {posts.map((post, i) => (
          <li key={post._id} className="border-b border-slate-200">
            <Link href={post.url} className="group flex items-center gap-5 py-5">
              <span className="w-14 shrink-0 font-heading text-5xl font-extrabold leading-none text-outline" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md">
                <PostImage post={post} className="text-2xl" />
              </div>
              <div className="min-w-0">
                {post.category?.name && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-accent">{post.category.name}</p>
                )}
                <h3 className="mt-0.5 line-clamp-2 font-heading text-xl font-bold leading-snug text-primary transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {post.readingTime} min read
                  {post.publishedAt && <> · {format(new Date(post.publishedAt), "MMM d, yyyy")}</>}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
