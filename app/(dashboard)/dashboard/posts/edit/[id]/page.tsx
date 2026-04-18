import { notFound } from "next/navigation";
import PostForm from "@/components/dashboard/PostForm";

export const metadata = { title: "Edit Post" };

async function getPost(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
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
