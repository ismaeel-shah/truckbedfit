import Link from "next/link";
import PostsTable from "@/components/dashboard/PostsTable";
import { connectDB } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import "@/lib/models/Category";
import "@/lib/models/Author";

export const dynamic = "force-dynamic";
export const metadata = { title: "Posts" };

async function getPosts() {
  try {
    await connectDB();
    const posts = await Post.find()
      .populate("category", "name slug icon")
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return posts;
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
