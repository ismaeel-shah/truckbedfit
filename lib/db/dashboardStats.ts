import { getD1, mapPost, postJoins, postSelect, PostRow } from "./d1";
import { listCategories, listLiveTrucks, publishDueScheduledPosts } from "./content";
import { listHubPages, TRUCKS_INDEX_PATH } from "./hubPages";
import { hasHub, TRUCKS } from "@/data/trucks";
import { CATEGORY_GROUPS, PILLAR_TYPES } from "@/lib/articleTypes";
import { AMAZON_TAG } from "@/lib/site";
import { truckPath } from "@/lib/urls";
import { wordCount } from "@/lib/utils/seo";

// Everything the dashboard home shows, computed in D1 (UTC days throughout).

const DAY_MS = 24 * 60 * 60 * 1000;
export const TREND_DAYS = 30;
/** Views are loaded for this many days; the chart's 7 / 30 / 90 toggle slices them. */
export const VIEW_HISTORY_DAYS = 90;
export const RHYTHM_WEEKS = 12;
const STALE_AFTER_DAYS = 180;
const UP_NEXT_LIMIT = 6;
/** Article types that recommend products, so they should have some in the Products tab */
const PRODUCT_TYPES = ["best-list-vehicle", "best-list-type", "review"];
/** Word-count bins for the article-length histogram (upper bounds; the last is open-ended) */
const LENGTH_BINS = [1000, 2000, 3000, 4000, 5000, Infinity];
/** The content plan's typical article length */
export const TARGET_WORDS = { min: 1500, max: 3800 } as const;

export interface UpNextItem {
  id: string;
  kind: "scheduled" | "draft" | "fix" | "hub";
  title: string;
  detail: string;
  href: string;
}

export interface DashboardData {
  counts: { total: number; published: number; drafts: number; scheduled: number; views: number; views30: number };
  /** Oldest → newest, one entry per day for VIEW_HISTORY_DAYS, zero-filled */
  viewsByDay: { day: string; views: number }[];
  topPosts: { id: string; title: string; views: number }[];
  /** Hub trucks in data/trucks.ts order, with their published article count */
  trucks: { name: string; slug: string; count: number }[];
  categories: { name: string; count: number }[];
  /** Published articles per category-page group, plus the main (pillar/hub) pages */
  typeGroups: { name: string; count: number }[];
  /** Published articles per word-count bin */
  lengths: { label: string; from: number; to: number; count: number }[];
  /** Oldest → newest; weeks start on Monday */
  publishedPerWeek: { weekStart: string; count: number }[];
  upNext: UpNextItem[];
  /** "Get started" checklist (shown until the first article is published) */
  onboarding: { hasAuthor: boolean; hasPillar: boolean; hasPublished: boolean; trucksIntro: boolean; amazonTag: boolean };
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** Monday (UTC) of the week containing `ms`. */
function weekStart(ms: number): number {
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

type LiveRow = {
  id: string; title: string; type: string; author_id: string | null; content: string;
  faqs_json: string; affiliate_products_json: string; updated_on: string | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  await publishDueScheduledPosts();
  const db = getD1();
  const now = Date.now();
  const today = isoDay(now);
  const trendStart = isoDay(now - (TREND_DAYS - 1) * DAY_MS);
  const historyStart = isoDay(now - (VIEW_HISTORY_DAYS - 1) * DAY_MS);
  const firstWeek = weekStart(now) - (RHYTHM_WEEKS - 1) * 7 * DAY_MS;
  const staleBefore = isoDay(now - STALE_AFTER_DAYS * DAY_MS);

  const [counts, dailyRows, topRows, truckRows, categories, publishedRows, liveRows, draftRows, scheduledRows, authorRow, hubs, liveTrucks] =
    await Promise.all([
      db.prepare(`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(status = 'published'), 0) AS published,
          COALESCE(SUM(status = 'draft'), 0) AS drafts,
          COALESCE(SUM(status = 'scheduled'), 0) AS scheduled,
          COALESCE(SUM(views), 0) AS views,
          (SELECT COALESCE(SUM(views), 0) FROM post_views_daily WHERE day >= ?) AS views30
        FROM posts
      `).bind(trendStart).first<DashboardData["counts"]>(),
      db.prepare(`SELECT day, SUM(views) AS views FROM post_views_daily WHERE day >= ? GROUP BY day`)
        .bind(historyStart).all<{ day: string; views: number }>(),
      db.prepare(`
        SELECT ${postSelect} FROM posts p ${postJoins}
        WHERE p.status = 'published' AND p.views > 0
        ORDER BY p.views DESC LIMIT 6
      `).all<PostRow>(),
      db.prepare(`
        SELECT j.value AS slug, COUNT(*) AS count
        FROM posts p, json_each(p.trucks_json) j
        WHERE p.status = 'published'
        GROUP BY j.value
      `).all<{ slug: string; count: number }>(),
      listCategories(),
      db.prepare(`SELECT published_at FROM posts WHERE status = 'published' AND published_at >= ?`)
        .bind(new Date(firstWeek).toISOString()).all<{ published_at: string }>(),
      db.prepare(`
        SELECT id, title, type, author_id, content, faqs_json, affiliate_products_json, updated_on
        FROM posts WHERE status = 'published'
        ORDER BY COALESCE(updated_on, substr(published_at, 1, 10)) ASC
      `).all<LiveRow>(),
      db.prepare(`SELECT id, title, updated_at FROM posts WHERE status = 'draft' ORDER BY updated_at DESC LIMIT ?`)
        .bind(UP_NEXT_LIMIT).all<{ id: string; title: string; updated_at: string }>(),
      db.prepare(`SELECT id, title, scheduled_at FROM posts WHERE status = 'scheduled' ORDER BY scheduled_at ASC LIMIT ?`)
        .bind(UP_NEXT_LIMIT).all<{ id: string; title: string; scheduled_at: string }>(),
      db.prepare(`SELECT COUNT(*) AS n FROM authors`).first<{ n: number }>(),
      listHubPages(),
      listLiveTrucks(),
    ]);

  const viewsOn = new Map((dailyRows.results ?? []).map((row) => [row.day, row.views]));
  const viewsByDay = Array.from({ length: VIEW_HISTORY_DAYS }, (_, i) => {
    const day = isoDay(now - (VIEW_HISTORY_DAYS - 1 - i) * DAY_MS);
    return { day, views: viewsOn.get(day) ?? 0 };
  });

  const truckCounts = new Map((truckRows.results ?? []).map((row) => [row.slug, row.count]));

  const perWeek = new Map<number, number>();
  for (const row of publishedRows.results ?? []) {
    const week = weekStart(Date.parse(row.published_at));
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }
  const publishedPerWeek = Array.from({ length: RHYTHM_WEEKS }, (_, i) => {
    const week = firstWeek + i * 7 * DAY_MS;
    return { weekStart: isoDay(week), count: perWeek.get(week) ?? 0 };
  });

  const live = liveRows.results ?? [];
  const typeGroups = [
    { name: "Main pages", count: live.filter((row) => (PILLAR_TYPES as readonly string[]).includes(row.type)).length },
    ...CATEGORY_GROUPS.map((group) => ({
      name: group.title,
      count: live.filter((row) => (group.types as readonly string[]).includes(row.type)).length,
    })),
  ];

  const words = live.map((row) => wordCount(row.content));
  const lengths = LENGTH_BINS.map((to, i) => {
    const from = i ? LENGTH_BINS[i - 1] : 0;
    return {
      label: to === Infinity ? `${from / 1000}k+` : `${from / 1000}–${to / 1000}k`,
      from,
      to,
      count: words.filter((w) => w >= from && w < to).length,
    };
  });

  // "Up next": what to do today, most time-sensitive first.
  const isEmptyJson = (json: string) => !json || json.trim() === "[]";
  const fixes: [string, (row: LiveRow) => boolean][] = [
    ["Add products (Products tab)", (row) => PRODUCT_TYPES.includes(row.type) && isEmptyJson(row.affiliate_products_json)],
    ["Pick an author", (row) => !row.author_id],
    ["Not updated in 6+ months — recheck it", (row) => (row.updated_on ?? today) < staleBefore],
    ["Add FAQs", (row) => isEmptyJson(row.faqs_json)],
  ];
  const writtenHubs = new Set(hubs.filter((hub) => hub.content.replace(/<[^>]*>/g, "").trim()).map((hub) => hub.path));
  const unwrittenHubs = [
    ...(liveTrucks.length && !writtenHubs.has(TRUCKS_INDEX_PATH) ? [{ path: TRUCKS_INDEX_PATH, name: "All trucks (/trucks)" }] : []),
    ...liveTrucks
      .filter(({ truck }) => !writtenHubs.has(truckPath(truck.slug)))
      .map(({ truck }) => ({ path: truckPath(truck.slug), name: truck.name })),
  ];
  const upNext: UpNextItem[] = [
    ...(scheduledRows.results ?? []).map((row) => ({
      id: `s-${row.id}`, kind: "scheduled" as const, title: row.title,
      detail: `Goes live ${shortDate(row.scheduled_at)}`, href: `/dashboard/posts/edit/${row.id}`,
    })),
    ...(draftRows.results ?? []).map((row) => ({
      id: `d-${row.id}`, kind: "draft" as const, title: row.title || "Untitled draft",
      detail: "Draft — finish and publish", href: `/dashboard/posts/edit/${row.id}`,
    })),
    ...fixes.flatMap(([detail, matches]) =>
      live.filter(matches).slice(0, 2).map((row) => ({
        id: `f-${detail}-${row.id}`, kind: "fix" as const, title: row.title, detail, href: `/dashboard/posts/edit/${row.id}`,
      }))
    ),
    ...unwrittenHubs.map((hub) => ({
      id: `h-${hub.path}`, kind: "hub" as const, title: hub.name,
      detail: "Live truck page — write its intro", href: `/dashboard/truck-pages/edit?path=${encodeURIComponent(hub.path)}`,
    })),
  ].slice(0, UP_NEXT_LIMIT);

  return {
    counts: counts ?? { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0, views30: 0 },
    viewsByDay,
    topPosts: (topRows.results ?? []).map(mapPost).map((post) => ({ id: post._id, title: post.title, views: post.views })),
    trucks: TRUCKS.filter(hasHub).map((truck) => ({ name: truck.name, slug: truck.slug, count: truckCounts.get(truck.slug) ?? 0 })),
    categories: categories.map((category) => ({ name: category.name, count: category.postCount })),
    typeGroups,
    lengths,
    publishedPerWeek,
    upNext,
    onboarding: {
      hasAuthor: (authorRow?.n ?? 0) > 0,
      hasPillar: live.some((row) => (PILLAR_TYPES as readonly string[]).includes(row.type)),
      hasPublished: live.length > 0,
      trucksIntro: writtenHubs.has(TRUCKS_INDEX_PATH),
      amazonTag: Boolean(AMAZON_TAG),
    },
  };
}
