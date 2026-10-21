import Link from "next/link";
import PostsTable from "@/components/dashboard/PostsTable";
import { getD1, mapPost, postJoins, postSelect, PostRow } from "@/lib/db/d1";
import { publishDueScheduledPosts } from "@/lib/db/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Posts" };

async function getPosts() {
  try {
    await publishDueScheduledPosts();
    const db = getD1();
    const { results = [] } = await db.prepare(`
      SELECT ${postSelect}
      FROM posts p
      ${postJoins}
      ORDER BY p.created_at DESC
      LIMIT 200
    `).all<PostRow>();
    return results.map(mapPost);
  } catch {
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Posts</h1>
        <Link href="/dashboard/posts/new" className="btn-primary">
          + New Post
        </Link>
      </div>
      <div className="card p-6">
        <PostsTable posts={posts} />
      </div>
    </div>
  );
}
