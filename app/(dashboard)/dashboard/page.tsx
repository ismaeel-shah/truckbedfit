import { FileText, CalendarClock, BookOpen, Clock, Pencil, Eye } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import Link from "next/link";
import { getD1, mapPost, postJoins, postSelect, PostRow } from "@/lib/db/d1";
import { publishDueScheduledPosts } from "@/lib/db/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

async function getStats() {
  try {
    await publishDueScheduledPosts();
    const row = await getD1().prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'published'), 0) AS published,
        COALESCE(SUM(status = 'draft'), 0) AS drafts,
        COALESCE(SUM(status = 'scheduled'), 0) AS scheduled,
        COALESCE(SUM(views), 0) AS views
      FROM posts
    `).first<{ total: number; published: number; drafts: number; scheduled: number; views: number }>();

    return row ?? { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0 };
  } catch {
    return { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0 };
  }
}

async function getRecentPosts() {
  try {
    const db = getD1();
    const { results = [] } = await db.prepare(`
      SELECT ${postSelect}
      FROM posts p
      ${postJoins}
      ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.created_at DESC
      LIMIT 6
    `).all<PostRow>();
    return results.map(mapPost);
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatsCard label="Total Posts" value={stats.total} icon={FileText} />
        <StatsCard label="Published" value={stats.published} icon={BookOpen} color="text-green-500" />
        <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="text-yellow-500" />
        <StatsCard label="Scheduled" value={stats.scheduled} icon={CalendarClock} color="text-blue-500" />
        <StatsCard label="Total Views" value={stats.views} icon={Eye} color="text-orange-500" />
      </div>

      <div>
        <div className="mb-5">
          <h2 className="font-heading font-bold text-xl text-primary dark:text-white">
            Recent Posts
          </h2>
        </div>

        {recentPosts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <div key={post._id} className="card p-0 overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
                <div className="relative h-36 bg-gradient-to-br from-primary/80 to-accent/30 overflow-hidden flex-shrink-0">
                  {post.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-40">{post.category?.icon ?? ""}</span>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                    post.status === "published"
                      ? "bg-green-500 text-white"
                      : post.status === "scheduled"
                      ? "bg-yellow-500 text-white"
                      : "bg-slate-600 text-white"
                  }`}>
                    {post.status}
                  </span>
                </div>

                <div className="p-4">
                  {post.category && (
                    <p className="text-xs text-accent font-semibold mb-1.5">
                      {post.category.icon} {post.category.name}
                    </p>
                  )}
                  <h3 className="font-heading font-bold text-sm text-primary dark:text-white leading-snug line-clamp-2 mb-3">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">{post.readingTime ?? 0}m read</span>
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-accent transition-colors">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/dashboard/posts/edit/${post._id}`} className="p-1.5 rounded-lg hover:bg-accent/10 text-slate-400 hover:text-accent transition-colors">
                        <Pencil size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-400">
            <p className="text-sm">No posts yet.</p>
            <Link href="/dashboard/posts/new" className="btn-primary mt-4 inline-block text-sm">
              Create your first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
