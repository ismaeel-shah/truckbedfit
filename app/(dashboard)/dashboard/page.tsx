import { FileText, Eye, BookOpen, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const [allRes, publishedRes, draftRes] = await Promise.all([
      fetch(`${base}/api/posts?limit=1`, { cache: "no-store" }),
      fetch(`${base}/api/posts?limit=1&status=published`, { cache: "no-store" }),
      fetch(`${base}/api/posts?limit=1&status=draft`, { cache: "no-store" }),
    ]);
    const [all, published, draft] = await Promise.all([
      allRes.json(),
      publishedRes.json(),
      draftRes.json(),
    ]);
    return {
      total: all.total ?? 0,
      published: published.total ?? 0,
      drafts: draft.total ?? 0,
    };
  } catch {
    return { total: 0, published: 0, drafts: 0 };
  }
}

async function getRecentPosts() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/posts?limit=5`, { cache: "no-store" });
    const { posts } = await res.json();
    return posts ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [stats, recentPosts] = await Promise.all([getStats(), getRecentPosts()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">
          Dashboard
        </h1>
        <Link href="/dashboard/posts/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Total Posts" value={stats.total} icon={FileText} />
        <StatsCard label="Published" value={stats.published} icon={BookOpen} color="text-green-500" />
        <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="text-yellow-500" />
        <StatsCard label="Total Views" value="—" icon={Eye} color="text-blue-500" />
      </div>

      {/* Recent posts */}
      <div className="card p-6">
        <h2 className="font-heading font-bold text-lg text-primary dark:text-white mb-4">
          Recent Posts
        </h2>
        {recentPosts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentPosts.map((post: { _id: string; title: string; status: string; slug: string; category?: { name: string } }) => (
                <tr key={post._id}>
                  <td className="py-3 font-medium text-primary dark:text-white truncate max-w-xs">
                    {post.title}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : post.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {post.category?.name ?? "—"}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/posts/edit/${post._id}`}
                      className="text-accent hover:underline text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-400 text-sm">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
