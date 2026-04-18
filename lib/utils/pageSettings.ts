import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/lib/models/SiteSettings";

export async function getPageMeta(
  key: string
): Promise<{ metaTitle?: string; metaDescription?: string }> {
  try {
    await connectDB();
    const row = await SiteSettings.findOne({ key }).lean();
    return (row?.value as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}
