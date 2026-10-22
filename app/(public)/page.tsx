import { Metadata } from "next";
import GarageHero from "@/components/public/home/GarageHero";
import TruckPicker from "@/components/public/home/TruckPicker";
import GearTypeGrid from "@/components/public/home/GearTypeGrid";
import LatestList from "@/components/public/home/LatestList";
import TrustStatement from "@/components/public/home/TrustStatement";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/utils/seo";
import { listLiveCategories, listLiveTrucks, listPosts } from "@/lib/db/content";
import { PILLAR_TYPES } from "@/lib/articleTypes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

const LATEST_LIMIT = 6;

export async function generateMetadata(): Promise<Metadata> {
  const meta  = await getPageMeta("page_home");
  const title = meta.metaTitle || `${SITE_NAME} — ${SITE_TAGLINE}`;
  const desc  = meta.metaDescription || SITE_DESCRIPTION;
  return {
    title:       { absolute: title },
    description: desc,
    alternates:  { canonical: buildCanonical("/") },
    openGraph: buildOpenGraph({ title, description: desc, url: buildCanonical("/") }),
    twitter: buildTwitter({ title, description: desc }),
  };
}

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [trucks, categories, latest] = await Promise.all([
    safe(listLiveTrucks, []),
    safe(listLiveCategories, []),
    // Pillars/hubs are category pages, not "articles" — keep them out of the latest list.
    safe(async () => (await listPosts({ status: "published", excludeTypes: PILLAR_TYPES, limit: LATEST_LIMIT + 1 })).posts, []),
  ]);

  const [featured, ...rest] = latest;
  const cta = trucks.length
    ? { href: "#truck-picker", label: "Find gear for your truck" }
    : categories.length
      ? { href: "#categories", label: "Browse gear by type" }
      : undefined;

  return (
    <div className="bg-background">
      <GarageHero featured={featured} cta={cta} />
      <TruckPicker trucks={trucks} />
      <GearTypeGrid categories={categories} />
      <LatestList posts={rest} />
      <TrustStatement />
    </div>
  );
}
