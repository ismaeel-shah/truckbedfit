import { getD1 } from "@/lib/db/d1";
import { isValidAsin } from "@/lib/products";
import { AmazonImage, fetchAmazonItems, isAmazonApiConfigured } from "./creatorsApi";

// Amazon product images for the Products tab, cached in D1 (amazon_items).
// Amazon allows caching images for 1 day: older data is refetched and never shown. After a failed
// request (rate limit, access not approved yet, timeout) an ASIN isn't retried for a few minutes,
// so a busy page can't hammer the API. Any failure just means no image — pages never break.

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_MS = 15 * 60 * 1000;

type ItemRow = {
  asin: string;
  status: "ok" | "not_found";
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  fetched_at: string | null;
  checked_at: string;
};

export type AmazonItemStatus =
  | { status: "ok"; image: AmazonImage | null }
  | { status: "not_found" }
  /** No fresh answer from Amazon (API not set up, not approved yet, or failing) */
  | { status: "unavailable" };

const age = (iso: string | null, now: number) => (iso ? now - Date.parse(iso) : Infinity);

export async function getAmazonItems(asinList: string[]): Promise<Record<string, AmazonItemStatus>> {
  const asins = Array.from(new Set(asinList.filter(isValidAsin)));
  const result: Record<string, AmazonItemStatus> = Object.fromEntries(asins.map((asin) => [asin, { status: "unavailable" }]));
  if (!asins.length || !isAmazonApiConfigured()) return result;

  try {
    const db = getD1();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const { results: rows = [] } = await db
      .prepare(`SELECT * FROM amazon_items WHERE asin IN (${asins.map(() => "?").join(", ")})`)
      .bind(...asins)
      .all<ItemRow>();
    const byAsin = new Map(rows.map((row) => [row.asin, row]));

    const toFetch = asins.filter((asin) => {
      const row = byAsin.get(asin);
      return !row || (age(row.fetched_at, now) >= MAX_AGE_MS && age(row.checked_at, now) >= RETRY_AFTER_MS);
    });

    if (toFetch.length) {
      try {
        const fetched = await fetchAmazonItems(toFetch);
        await Promise.all(Array.from(fetched, ([asin, item]) => {
          const image = item && item !== "not_found" ? item : null;
          const row: ItemRow = {
            asin,
            status: item === "not_found" ? "not_found" : "ok",
            image_url: image?.url ?? null,
            image_width: image?.width ?? null,
            image_height: image?.height ?? null,
            fetched_at: nowIso,
            checked_at: nowIso,
          };
          byAsin.set(asin, row);
          return db.prepare(`
            INSERT INTO amazon_items (asin, status, image_url, image_width, image_height, fetched_at, checked_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(asin) DO UPDATE SET
              status = excluded.status, image_url = excluded.image_url, image_width = excluded.image_width,
              image_height = excluded.image_height, fetched_at = excluded.fetched_at, checked_at = excluded.checked_at
          `).bind(row.asin, row.status, row.image_url, row.image_width, row.image_height, row.fetched_at, row.checked_at).run();
        }));
      } catch (err) {
        console.error("Amazon Creators API:", err instanceof Error ? err.message : err);
        // Remember the attempt (not the answer) so these ASINs wait before the next try.
        await Promise.all(toFetch.map((asin) => db.prepare(`
          INSERT INTO amazon_items (asin, checked_at) VALUES (?, ?)
          ON CONFLICT(asin) DO UPDATE SET checked_at = excluded.checked_at
        `).bind(asin, nowIso).run()));
      }
    }

    for (const asin of asins) {
      const row = byAsin.get(asin);
      if (!row || age(row.fetched_at, now) >= MAX_AGE_MS) continue;
      result[asin] = row.status === "not_found"
        ? { status: "not_found" }
        : {
            status: "ok",
            image: row.image_url ? { url: row.image_url, width: row.image_width, height: row.image_height } : null,
          };
    }
  } catch (err) {
    // e.g. the amazon_items migration hasn't been applied yet
    console.error("Amazon image cache:", err instanceof Error ? err.message : err);
  }
  return result;
}

/** ASIN → primary image, for rendering product cards and boxes. Missing entries mean "no image". */
export async function getProductImages(asins: string[]): Promise<Record<string, AmazonImage>> {
  const items = await getAmazonItems(asins);
  const images: Record<string, AmazonImage> = {};
  for (const [asin, item] of Object.entries(items)) {
    if (item.status === "ok" && item.image) images[asin] = item.image;
  }
  return images;
}
