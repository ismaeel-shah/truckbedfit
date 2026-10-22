import { notFound } from "next/navigation";
import PostForm from "@/components/dashboard/PostForm";
import { getD1, mapPost, postJoins, postSelect, PostRow } from "@/lib/db/d1";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Post" };

async function getPost(id: string) {
  try {
    const db = getD1();
    const row = await db
      .prepare(`SELECT ${postSelect} FROM posts p ${postJoins} WHERE p.id = ?`)
      .bind(id)
      .first<PostRow>();
    return row ? mapPost(row) : null;
  } catch {
    return null;
  }
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) notFound();

  const initial = {
    _id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    category: post.category?._id ?? "",
    author: post.author?._id ?? "",
    tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags ?? ""),
    status: post.status as "draft" | "published" | "scheduled",
    scheduledAt: post.scheduledAt ?? "",
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    focusKeyword: post.focusKeyword,
    ogImage: post.ogImage,
    faqs: post.faqs,
    articleId: post.articleId,
    type: post.type,
    trucks: post.trucks,
    updatedOn: post.updatedOn,
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">
        Edit Post
      </h1>
      <PostForm initial={initial} />
    </div>
  );
}
