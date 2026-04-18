"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category?: { name: string; icon: string };
  publishedAt?: string;
  views: number;
  readingTime: number;
}

export default function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Post deleted");
      router.refresh();
    } else {
      toast.error("Delete failed");
    }
  };

  if (!posts.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>No posts yet.</p>
        <Link href="/dashboard/posts/new" className="btn-primary mt-4 inline-block">
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400">
            <th className="pb-3 font-medium">Title</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Published</th>
            <th className="pb-3 font-medium">Read</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {posts.map((post) => (
            <tr key={post._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="py-3 pr-4">
                <p className="font-medium text-primary dark:text-white truncate max-w-xs">
                  {post.title}
                </p>
                <p className="text-xs text-slate-400">/blog/{post.slug}</p>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : post.status === "scheduled"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                {post.category ? `${post.category.icon} ${post.category.name}` : "—"}
              </td>
              <td className="py-3 pr-4 text-slate-400 text-xs">
                {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "—"}
              </td>
              <td className="py-3 pr-4 text-slate-400 text-xs">
                {post.readingTime}m
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/blog/${post.slug}`} target="_blank" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-accent">
                    <Eye size={15} />
                  </Link>
                  <Link href={`/dashboard/posts/edit/${post._id}`} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-accent">
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id, post.title)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
