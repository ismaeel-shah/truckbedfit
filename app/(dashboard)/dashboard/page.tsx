import { FileText, CalendarClock, BookOpen, Clock, Pencil, Eye, TrendingUp } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ContentHealth from "@/components/dashboard/ContentHealth";
import ChartCard from "@/components/dashboard/charts/ChartCard";
import ViewsTrendChart from "@/components/dashboard/charts/ViewsTrendChart";
import BarList from "@/components/dashboard/charts/BarList";
import WeeklyColumns from "@/components/dashboard/charts/WeeklyColumns";
import Link from "next/link";
import { getD1, mapPost, postJoins, postSelect, PostRow } from "@/lib/db/d1";
import { DashboardData, getDashboardData, RHYTHM_WEEKS, TREND_DAYS } from "@/lib/db/dashboardStats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

async function loadDashboard(): Promise<DashboardData | null> {
  try {
    return await getDashboardData();
  } catch (err) {
    console.error("dashboard stats failed:", err);
    return null;
  }
}

const shortDate = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

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
  const [data, recentPosts] = await Promise.all([loadDashboard(), getRecentPosts()]);
  const stats = data?.counts ?? { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0, views30: 0 };

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
        <StatsCard label="Total posts" value={stats.total} icon={FileText} />
        <StatsCard label="Published" value={stats.published} icon={BookOpen} color="text-green-500" />
        <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="text-yellow-500" />
        <StatsCard label="Scheduled" value={stats.scheduled} icon={CalendarClock} color="text-blue-500" />
        <StatsCard label={`Views (${TREND_DAYS} days)`} value={stats.views30.toLocaleString("en-US")} icon={TrendingUp} color="text-orange-500" />
        <StatsCard label="All-time views" value={stats.views.toLocaleString("en-US")} icon={Eye} color="text-orange-500" />
      </div>

      {data && (
        <div className="mb-10 space-y-6">
          {/* items-start: each card keeps its own height instead of stretching to its neighbour's */}
          <div className="grid items-start gap-6 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Reader views"
              subtitle={`Per day, last ${TREND_DAYS} days (UTC) · signed-in editors and bots aren't counted`}
              empty={data.viewsByDay.some((d) => d.views) ? null : "No reader views yet — they'll show here as people read your articles."}
              table={{ columns: ["Day", "Views"], rows: data.viewsByDay.map((d) => [shortDate(d.day), d.views]) }}
            >
              <ViewsTrendChart data={data.viewsByDay} />
            </ChartCard>
            <ChartCard
              title="Publishing rhythm"
              subtitle={`Articles published per week, last ${RHYTHM_WEEKS} weeks`}
              empty={data.publishedPerWeek.some((w) => w.count) ? null : "Nothing published in the last 12 weeks yet."}
              table={{ columns: ["Week of", "Published"], rows: data.publishedPerWeek.map((w) => [shortDate(w.weekStart), w.count]) }}
            >
              <WeeklyColumns data={data.publishedPerWeek} />
            </ChartCard>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Most-read articles"
              subtitle="All-time reader views"
              empty={data.topPosts.length ? null : "Your most-read articles will show here."}
              table={{ columns: ["Article", "Views"], rows: data.topPosts.map((p) => [p.title, p.views]) }}
            >
              <BarList unit="views" items={data.topPosts.map((p) => ({ label: p.title, value: p.views, href: `/dashboard/posts/edit/${p.id}` }))} />
            </ChartCard>
            <ContentHealth checks={data.health} published={stats.published} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ChartCard
              title="Truck coverage"
              subtitle="Published articles tagged with each truck — short bars show what to write next"
              table={{ columns: ["Truck", "Articles"], rows: data.trucks.map((t) => [t.name, t.count]) }}
            >
              <BarList unit="articles" items={data.trucks.map((t) => ({ label: t.name, value: t.count }))} />
            </ChartCard>
            <ChartCard
              title="Articles by category"
              subtitle="Published articles in each category"
              table={{ columns: ["Category", "Articles"], rows: data.categories.map((c) => [c.name, c.count]) }}
            >
              <BarList unit="articles" items={data.categories.map((c) => ({ label: c.name, value: c.count }))} />
            </ChartCard>
          </div>
        </div>
      )}

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
                      <Link href={post.url} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-accent transition-colors">
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
