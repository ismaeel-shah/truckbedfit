import { NextRequest } from "next/server";
import { extractAsin, isValidAsin } from "@/lib/products";
import { incrementAmazonClick } from "@/lib/db/content";
import { requestCountry } from "@/lib/geo";
import { inBackground, isCountableVisitor } from "@/lib/views";

const MAX_PATH = 200;

/**
 * Beacon from AmazonClickTracker when a reader clicks an Amazon link: { path, href }.
 * The link itself goes straight to Amazon; this only counts the click (country, page, ASIN).
 * Bots and signed-in editors aren't counted. Always 204 so the beacon never retries or errors.
 */
export async function POST(req: NextRequest) {
  const done = new Response(null, { status: 204 });
  if (!isCountableVisitor()) return done;

  let body: { path?: unknown; href?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done;
  }
  if (typeof body.path !== "string" || typeof body.href !== "string") return done;

  // Only the site's own pages, without query string or fragment.
  const path = body.path.split(/[?#]/)[0];
  if (!path.startsWith("/") || path.startsWith("//") || path.length > MAX_PATH) return done;

  let href: URL;
  try {
    href = new URL(body.href);
  } catch {
    return done;
  }
  if (!/(^|\.)amazon\.com$/i.test(href.hostname)) return done;
  const asin = extractAsin(href.pathname);
  if (!isValidAsin(asin)) return done;

  inBackground(incrementAmazonClick(requestCountry(), path, asin), "Amazon click count");
  return done;
}
