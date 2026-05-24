import { getD1, parseJson } from "@/lib/db/d1";

export async function getPageMeta(
  key: string
): Promise<{ metaTitle?: string; metaDescription?: string }> {
  try {
    const db = getD1();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = ?")
      .bind(key)
      .first<{ value_json: string }>();
    return parseJson<Record<string, string>>(row?.value_json, {});
  } catch {
    return {};
  }
}
