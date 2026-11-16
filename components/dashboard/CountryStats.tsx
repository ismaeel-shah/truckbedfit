import ChartCard from "@/components/dashboard/charts/ChartCard";
import BarList from "@/components/dashboard/charts/BarList";
import { countryName } from "@/lib/geo";
import type { DashboardData } from "@/lib/db/dashboardStats";

const TOP_COUNTRIES = 8;
const TOP_PAGES = 6;
const NO_DATA = "Nothing yet. Countries are counted from the day this update went live; earlier views have none.";

/** First UTC day (YYYY-MM-DD) of the last `range` days, today included. */
function sinceDay(range: number) {
  return new Date(Date.now() - (range - 1) * 86_400_000).toISOString().slice(0, 10);
}

/** Sums values by key, largest first. */
function totals<T>(rows: T[], key: (row: T) => string, value: (row: T) => number) {
  const sums = new Map<string, number>();
  for (const row of rows) sums.set(key(row), (sums.get(key(row)) ?? 0) + value(row));
  return Array.from(sums, ([k, v]) => ({ key: k, value: v })).sort((a, b) => b.value - a.value);
}

/** Top countries plus one "Other countries" row, labelled with name and share. (No flag emoji: Windows shows them as letters.) */
function countryItems(rows: { key: string; value: number }[], total: number) {
  const top = rows.slice(0, TOP_COUNTRIES);
  const rest = rows.slice(TOP_COUNTRIES).reduce((sum, row) => sum + row.value, 0);
  const share = (n: number) => `${Math.round((n / total) * 100)}%`;
  return [
    ...top.map((row) => ({ label: `${countryName(row.key)} · ${share(row.value)}`, value: row.value })),
    ...(rest ? [{ label: `Other countries · ${share(rest)}`, value: rest }] : []),
  ];
}

const countryTable = (rows: { key: string; value: number }[]) =>
  rows.map((row): [string, number] => [countryName(row.key), row.value]);

/** Reader views in the selected range, by country. */
export function CountryViews({ rows, range, className }: { rows: DashboardData["countryViews"]; range: number; className?: string }) {
  const since = sinceDay(range);
  const byCountry = totals(rows.filter((row) => row.day >= since), (row) => row.country, (row) => row.views);
  const total = byCountry.reduce((sum, row) => sum + row.value, 0);

  return (
    <ChartCard
      className={className}
      title="Readers by country"
      subtitle={`Reader views, last ${range} days · ${total.toLocaleString("en-US")} ${total === 1 ? "view" : "views"}`}
      empty={total ? null : NO_DATA}
      table={{ columns: ["Country", "Views"], rows: countryTable(byCountry) }}
    >
      <BarList unit="views" items={countryItems(byCountry, total)} />
    </ChartCard>
  );
}

/** Clicks on "Check price on Amazon" links in the selected range: total, US share, countries and pages. */
export function AmazonClicks({ rows, range, pageTitles, className }: {
  rows: DashboardData["amazonClicks"];
  range: number;
  pageTitles: Record<string, string>;
  className?: string;
}) {
  const since = sinceDay(range);
  const inRange = rows.filter((row) => row.day >= since);
  const byCountry = totals(inRange, (row) => row.country, (row) => row.clicks);
  const byPage = totals(inRange, (row) => row.path, (row) => row.clicks).slice(0, TOP_PAGES);
  const total = byCountry.reduce((sum, row) => sum + row.value, 0);
  const us = byCountry.find((row) => row.key === "US")?.value ?? 0;

  return (
    <ChartCard
      className={className}
      title="Amazon clicks"
      subtitle={`Clicks on Amazon links, last ${range} days · Amazon.com pays on US purchases`}
      empty={total ? null : NO_DATA}
      table={{ columns: ["Country", "Clicks"], rows: countryTable(byCountry) }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900/40">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Clicks</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary dark:text-white">{total.toLocaleString("en-US")}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900/40">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">From the US</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary dark:text-white">
            {total ? Math.round((us / total) * 100) : 0}%
          </p>
        </div>
      </div>
      <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">By country</p>
      <BarList unit="clicks" items={countryItems(byCountry, total)} />
      <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Top pages</p>
      <BarList
        unit="clicks"
        items={byPage.map((row) => ({ label: pageTitles[row.key] ?? row.key, value: row.value, href: row.key }))}
      />
    </ChartCard>
  );
}
