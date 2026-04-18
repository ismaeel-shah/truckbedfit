import Link from "next/link";
import PostsTable from "@/components/dashboard/PostsTable";

export const metadata = { title: "Posts" };

async function getPosts() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts?limit=100`, { cache: "no-store" });
  if (!res.ok) return [];
  const { posts } = await res.json();
  return posts ?? [];
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
