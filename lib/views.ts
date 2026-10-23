import { cookies, headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { incrementPostViews } from "@/lib/db/content";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i;

/** NextAuth's session cookie (the "__Secure-" name is used on HTTPS in production). */
const SESSION_COOKIES = ["next-auth.session-token", "__Secure-next-auth.session-token"];

/**
 * Counts a reader's page view without delaying the response. Bots and signed-in dashboard
 * users (the site's own editors checking their work) aren't counted.
 */
export function countView(postId: string) {
  const userAgent = headers().get("user-agent") ?? "";
  if (!userAgent || BOT_UA.test(userAgent)) return;
  const cookieStore = cookies();
  if (SESSION_COOKIES.some((name) => cookieStore.has(name))) return;

  const update = incrementPostViews(postId).catch((err) => console.error("view count failed:", err));
  try {
    getCloudflareContext().ctx.waitUntil(update);
  } catch {
    // Outside the Workers runtime the promise simply runs on its own.
  }
}
