import DashboardHero, { VIEW_RANGES, ViewRange } from "@/components/dashboard/DashboardHero";
import UpNext from "@/components/dashboard/UpNext";
import GetStarted from "@/components/dashboard/GetStarted";
import ChartCard from "@/components/dashboard/charts/ChartCard";
import ViewsTrendChart from "@/components/dashboard/charts/ViewsTrendChart";
import BarList from "@/components/dashboard/charts/BarList";
import WeeklyColumns from "@/components/dashboard/charts/WeeklyColumns";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import Histogram from "@/components/dashboard/charts/Histogram";
import CoverageGrid from "@/components/dashboard/charts/CoverageGrid";
import { getSessionUser } from "@/lib/auth";
import { DashboardData, getDashboardData, RHYTHM_WEEKS, TARGET_WORDS } from "@/lib/db/dashboardStats";

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

export default async function DashboardPage({ searchParams }: { searchParams: { range?: string } }) {
  const range: ViewRange = (VIEW_RANGES as readonly number[]).includes(Number(searchParams.range))
    ? (Number(searchParams.range) as ViewRange)
    : 30;
  const [data, user] = await Promise.all([loadDashboard(), getSessionUser().catch(() => null)]);
  const counts = data?.counts ?? { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0, views30: 0 };
  const viewsInRange = (data?.viewsByDay ?? []).slice(-range);
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div>
      <DashboardHero
        name={firstName}
        counts={counts}
        range={range}
        viewsInRange={viewsInRange.reduce((sum, d) => sum + d.views, 0)}
        sparkline={viewsInRange.map((d) => d.views)}
      />

      {data && !data.onboarding.hasPublished && (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <GetStarted onboarding={data.onboarding} className="lg:col-span-8" />
          <UpNext items={data.upNext} className="lg:col-span-4" />
        </div>
      )}

      {data && data.onboarding.hasPublished && (
        <div className="space-y-6">
          {/* items-start: each card keeps its own height instead of stretching to its neighbour's */}
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <UpNext items={data.upNext} className="lg:col-span-4" />
            <ChartCard
              className="lg:col-span-8"
              title="Reader views"
              subtitle={`Per day, last ${range} days (UTC) · signed-in editors and bots aren't counted`}
              empty={viewsInRange.some((d) => d.views) ? null : `No reader views in the last ${range} days yet.`}
              table={{ columns: ["Day", "Views"], rows: viewsInRange.map((d) => [shortDate(d.day), d.views]) }}
            >
              <ViewsTrendChart data={viewsInRange} />
            </ChartCard>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard
              title="Articles by category"
              subtitle="Published articles"
              table={{ columns: ["Category", "Articles"], rows: data.categories.map((c) => [c.name, c.count]) }}
            >
              <DonutChart items={data.categories.map((c) => ({ label: c.name, value: c.count }))} totalLabel="articles" />
            </ChartCard>
            <ChartCard
              title="Articles by type"
              subtitle="How the category pages group them"
              table={{ columns: ["Type", "Articles"], rows: data.typeGroups.map((g) => [g.name, g.count]) }}
            >
              <DonutChart items={data.typeGroups.map((g) => ({ label: g.name, value: g.count }))} totalLabel="articles" />
            </ChartCard>
            <ChartCard
              className="md:col-span-2 xl:col-span-1"
              title="Most-read articles"
              subtitle="All-time reader views"
              empty={data.topPosts.length ? null : "Your most-read articles will show here."}
              table={{ columns: ["Article", "Views"], rows: data.topPosts.map((p) => [p.title, p.views]) }}
            >
              <BarList unit="views" items={data.topPosts.map((p) => ({ label: p.title, value: p.views, href: `/dashboard/posts/edit/${p.id}` }))} />
            </ChartCard>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ChartCard
              title="Article length"
              subtitle={`Words per published article · the plan aims for ${TARGET_WORDS.min.toLocaleString("en-US")}–${TARGET_WORDS.max.toLocaleString("en-US")}`}
              table={{ columns: ["Words", "Articles"], rows: data.lengths.map((b) => [b.label, b.count]) }}
            >
              <Histogram bins={data.lengths} target={{ ...TARGET_WORDS, label: "Plan target" }} />
            </ChartCard>
            <ChartCard
              title="Publishing rhythm"
              subtitle={`Articles published per week, last ${RHYTHM_WEEKS} weeks`}
              empty={data.publishedPerWeek.some((w) => w.count) ? null : `Nothing published in the last ${RHYTHM_WEEKS} weeks.`}
              table={{ columns: ["Week of", "Published"], rows: data.publishedPerWeek.map((w) => [shortDate(w.weekStart), w.count]) }}
            >
              <WeeklyColumns data={data.publishedPerWeek} />
            </ChartCard>
          </div>

          <ChartCard
            title="Truck coverage"
            subtitle="Published articles tagged with each truck — pale or dashed tiles show what to write next"
            table={{ columns: ["Truck", "Articles"], rows: data.trucks.map((t) => [t.name, t.count]) }}
          >
            <CoverageGrid trucks={data.trucks} />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
