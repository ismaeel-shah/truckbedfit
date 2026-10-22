import BlogCard from "./BlogCard";
import SectionHeading from "./home/SectionHeading";
import type { HomePost } from "./home/types";

interface ArticleGridProps {
  title: string;
  posts: HomePost[];
  /** Anchor id, e.g. "best-by-truck" for /tonneau-covers#best-by-truck */
  id?: string;
  eyebrow?: string;
  /** "View all" link next to the heading */
  href?: string;
  icon?: string;
}

/** A headed section of article cards. Renders nothing when empty, so empty groups disappear. */
export default function ArticleGrid({ title, posts, id, eyebrow, href, icon }: ArticleGridProps) {
  if (!posts.length) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeading title={title} eyebrow={eyebrow} href={href} icon={icon} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
