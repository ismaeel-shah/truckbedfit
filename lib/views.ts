import { cookies, headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { incrementCountryViews, incrementPostViews } from "@/lib/db/content";
import { requestCountry } from "@/lib/geo";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i;

/** NextAuth's session cookie (the "__Secure-" name is used on HTTPS in production). */
const SESSION_COOKIES = ["next-auth.session-token", "__Secure-next-auth.session-token"];

/** A real reader: not a bot, and not a signed-in dashboard user (the site's own editors checking their work). */
export function isCountableVisitor(): boolean {
  const userAgent = headers().get("user-agent") ?? "";
  if (!userAgent || BOT_UA.test(userAgent)) return false;
  const cookieStore = cookies();
  return !SESSION_COOKIES.some((name) => cookieStore.has(name));
}

/** Runs a stats write after the response is sent (Workers waitUntil); errors are only logged. */
export function inBackground(work: Promise<unknown>, label: string) {
  const update = work.catch((err) => console.error(`${label} failed:`, err));
  try {
    getCloudflareContext().ctx.waitUntil(update);
  } catch {
    // Outside the Workers runtime the promise simply runs on its own.
  }
}

/** Counts a reader's page view (post totals + the reader's country) without delaying the response. */
export function countView(postId: string) {
  if (!isCountableVisitor()) return;
  inBackground(Promise.all([incrementPostViews(postId), incrementCountryViews(requestCountry())]), "view count");
}
