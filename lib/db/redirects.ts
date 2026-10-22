import { permanentRedirect, redirect } from "next/navigation";
import { getD1 } from "./d1";

/**
 * Before showing a 404, check the dashboard's redirects table. Called from every route
 * that can receive an unknown URL: /[category], /[category]/[slug] and the catch-all.
 * Throws Next's redirect when a rule matches, otherwise returns.
 */
export async function redirectIfMoved(pathname: string): Promise<void> {
  const rule = await getD1()
    .prepare("SELECT destination, type FROM redirects WHERE source = ? AND active = 1")
    .bind(pathname)
    .first<{ destination: string; type: number }>();
  if (!rule) return;
  if (rule.type === 301) permanentRedirect(rule.destination);
  redirect(rule.destination);
}
