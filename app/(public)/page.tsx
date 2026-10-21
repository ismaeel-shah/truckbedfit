import { Fragment } from "react";
import { Metadata } from "next";
import GarageHero from "@/components/public/home/GarageHero";
import SpecBar from "@/components/public/home/SpecBar";
import LatestList from "@/components/public/home/LatestList";
import CategoryBlock from "@/components/public/home/CategoryBlock";
import MostRead from "@/components/public/home/MostRead";
import GearTypeGrid from "@/components/public/home/GearTypeGrid";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/utils/seo";
import { listCategories, listPosts } from "@/lib/db/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

const SECTION_POST_LIMIT = 6;
const LATEST_LIST_LIMIT = 6;
/** "Most Read" band is inserted after this many category sections. */
const MOST_READ_AFTER_SECTION = 2;

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

async function fetchPosts(params: { category?: string; limit?: number; orderBy?: "latest" | "views" }) {
  try {
    const { posts } = await listPosts({ ...params, status: "published" });
    return posts ?? [];
  } catch { return []; }
}

async function fetchCategories() {
  try {
    return await listCategories();
  } catch { return []; }
}

export default async function HomePage() {
  const [categories, latestPosts, popularPosts] = await Promise.all([
    fetchCategories(),
    fetchPosts({ limit: LATEST_LIST_LIMIT + 1 }),
    fetchPosts({ limit: 4, orderBy: "views" }),
  ]);

  // Every category with published posts gets its own section, oldest category first.
  const sections = await Promise.all(
    categories
      .filter((category) => category.postCount > 0)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(async (category) => ({
        category,
        posts: await fetchPosts({ category: category._id, limit: SECTION_POST_LIMIT }),
      }))
  );

  const [featured, ...latest] = latestPosts;
  const mostRead = popularPosts.some((post) => post.views > 0) ? popularPosts : latestPosts.slice(0, 4);
  const mostReadBlock = latestPosts.length >= 4 ? <MostRead posts={mostRead} /> : null;

  return (
    <div className="bg-background">
      <GarageHero featured={featured} />
      <SpecBar />

      <LatestList posts={latest} />

      {sections.map(({ category, posts }, i) => (
        <Fragment key={category._id}>
          <CategoryBlock category={category} posts={posts} index={i} />
          {i === MOST_READ_AFTER_SECTION - 1 && mostReadBlock}
        </Fragment>
      ))}
      {sections.length < MOST_READ_AFTER_SECTION && mostReadBlock}

      <GearTypeGrid categories={categories} />
    </div>
  );
}
