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

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">
        Edit Post
      </h1>
      <PostForm initial={{ ...post, category: post.category?._id ?? post.category }} />
    </div>
  );
}
