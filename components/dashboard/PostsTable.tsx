"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category?: { name: string; icon: string };
  publishedAt?: string;
  updatedAt?: string;
  views: number;
  readingTime: number;
}

const STATUS_TABS = ["all", "published", "draft", "scheduled"] as const;

export default function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const seen = new Map<string, { name: string; icon: string }>();
    posts.forEach((p) => {
      if (p.category) seen.set(p.category.name, p.category);
    });
    return Array.from(seen.values());
  }, [posts]);

  const filtered = useMemo(() => posts.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCat = categoryFilter === "all" || p.category?.name === categoryFilter;
    return matchStatus && matchCat;
  }), [posts, statusFilter, categoryFilter]);

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
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-primary dark:hover:text-white"
              }`}
            >
              {s === "all" ? `All (${posts.length})` : `${s} (${posts.filter(p => p.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        )}

        {(statusFilter !== "all" || categoryFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); }}
            className="text-xs text-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No posts match the selected filters.</div>
      ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400">
            <th className="pb-3 font-medium">Title</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Published</th>
            <th className="pb-3 font-medium">Updated</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((post) => (
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
                {post.updatedAt && post.publishedAt && new Date(post.updatedAt) > new Date(post.publishedAt)
                  ? format(new Date(post.updatedAt), "MMM d, yyyy")
                  : "—"}
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
      )}
    </div>
  );
}
