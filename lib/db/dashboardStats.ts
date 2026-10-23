import { getD1, mapPost, postJoins, postSelect, PostRow } from "./d1";
import { listCategories, publishDueScheduledPosts } from "./content";
import { TRUCKS } from "@/data/trucks";

// Everything the dashboard home shows, computed in D1 (UTC days throughout).

const DAY_MS = 24 * 60 * 60 * 1000;
export const TREND_DAYS = 30;
export const RHYTHM_WEEKS = 12;
const STALE_AFTER_DAYS = 180;
const HEALTH_SAMPLE = 3;
/** Article types that recommend products, so they should have some in the Products tab */
const PRODUCT_TYPES = ["best-list-vehicle", "best-list-type", "review"];

export interface DashboardData {
  counts: { total: number; published: number; drafts: number; scheduled: number; views: number; views30: number };
  /** Oldest → newest, one entry per day, zero-filled */
  viewsByDay: { day: string; views: number }[];
  topPosts: { id: string; title: string; views: number }[];
  /** Every truck in data/trucks.ts order, with its published article count */
  trucks: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  /** Oldest → newest; weeks start on Monday */
  publishedPerWeek: { weekStart: string; count: number }[];
  health: { id: string; label: string; hint: string; total: number; posts: { id: string; title: string }[] }[];
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Monday (UTC) of the week containing `ms`. */
function weekStart(ms: number): number {
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

export async function getDashboardData(): Promise<DashboardData> {
  await publishDueScheduledPosts();
  const db = getD1();
  const now = Date.now();
  const today = isoDay(now);
  const trendStart = isoDay(now - (TREND_DAYS - 1) * DAY_MS);
  const firstWeek = weekStart(now) - (RHYTHM_WEEKS - 1) * 7 * DAY_MS;
  const staleBefore = isoDay(now - STALE_AFTER_DAYS * DAY_MS);

  const [counts, dailyRows, topRows, truckRows, categories, publishedRows, healthRows] = await Promise.all([
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
      .bind(trendStart).all<{ day: string; views: number }>(),
    db.prepare(`
      SELECT ${postSelect} FROM posts p ${postJoins}
      WHERE p.status = 'published' AND p.views > 0
      ORDER BY p.views DESC LIMIT 8
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
      SELECT id, title, type, author_id, faqs_json, affiliate_products_json, updated_on
      FROM posts WHERE status = 'published'
      ORDER BY COALESCE(updated_on, substr(published_at, 1, 10)) ASC
    `).all<{
      id: string; title: string; type: string; author_id: string | null;
      faqs_json: string; affiliate_products_json: string; updated_on: string | null;
    }>(),
  ]);

  const viewsOn = new Map((dailyRows.results ?? []).map((row) => [row.day, row.views]));
  const viewsByDay = Array.from({ length: TREND_DAYS }, (_, i) => {
    const day = isoDay(now - (TREND_DAYS - 1 - i) * DAY_MS);
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

  const live = healthRows.results ?? [];
  const isEmptyJson = (json: string) => !json || json.trim() === "[]";
  const check = (id: string, label: string, hint: string, matches: (row: (typeof live)[number]) => boolean) => {
    const hits = live.filter(matches);
    return { id, label, hint, total: hits.length, posts: hits.slice(0, HEALTH_SAMPLE).map(({ id, title }) => ({ id, title })) };
  };

  return {
    counts: counts ?? { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0, views30: 0 },
    viewsByDay,
    topPosts: (topRows.results ?? []).map(mapPost).map((post) => ({ id: post._id, title: post.title, views: post.views })),
    trucks: TRUCKS.map((truck) => ({ name: truck.name, count: truckCounts.get(truck.slug) ?? 0 })),
    categories: categories.map((category) => ({ name: category.name, count: category.postCount })),
    publishedPerWeek,
    health: [
      check("no-products", "Best lists & reviews without products", "Add picks in the Products tab",
        (row) => PRODUCT_TYPES.includes(row.type) && isEmptyJson(row.affiliate_products_json)),
      check("no-author", "No author", "Pick an author so the byline and author page show",
        (row) => !row.author_id),
      check("stale", "Not updated in 6+ months", "Recheck products, prices and fitment",
        (row) => (row.updated_on ?? today) < staleBefore),
      check("no-faqs", "No FAQs", "FAQs can win extra space in Google results",
        (row) => isEmptyJson(row.faqs_json)),
    ],
  };
}
