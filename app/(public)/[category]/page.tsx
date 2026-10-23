import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";
import PageHeader from "@/components/public/PageHeader";
import ArticleGrid from "@/components/public/ArticleGrid";
import GearTypeGrid from "@/components/public/home/GearTypeGrid";
import AffiliateNotice from "@/components/public/article/AffiliateNotice";
import ArticleBody from "@/components/public/article/ArticleBody";
import TopPicks from "@/components/public/content/TopPicks";
import FaqSection from "@/components/public/article/FaqSection";
import AuthorCard from "@/components/public/AuthorCard";
import JsonLd from "@/components/public/JsonLd";
import { getCategoryBySlug, getCategoryPillar, listLiveCategories, listPosts } from "@/lib/db/content";
import { articleSchema, faqSchema, itemListSchema } from "@/lib/utils/schema";
import { redirectIfMoved } from "@/lib/db/redirects";
import { getProductImages } from "@/lib/amazon/productImages";
import { CATEGORY_GROUPS, PILLAR_TYPES, UMBRELLA_CATEGORY_SLUG } from "@/lib/articleTypes";
import { authorPath, categoryPath } from "@/lib/urls";
import { articleSeoTitle, buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/utils/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

/** The category, its pillar/hub and its other published posts — or null if it isn't a live category. */
async function loadCategory(slug: string) {
  const category = await getCategoryBySlug(slug);
  // Visibility rule: a category page exists only once it has a published article.
  if (!category || category.postCount === 0) return null;
  const [pillar, { posts }] = await Promise.all([
    getCategoryPillar(category._id),
    listPosts({ category: category._id, excludeTypes: PILLAR_TYPES, status: "published", limit: 500 }),
  ]);
  return { category, pillar, posts };
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const data = await loadCategory(params.category);
  if (!data) return { title: "Page not found" };
  const { category, pillar } = data;

  // A custom SEO title (pillar's, else the category's) is used exactly as written; otherwise
  // the H1 gets the " | TruckBedFit" suffix from the root title template.
  const customTitle = pillar?.metaTitle ? articleSeoTitle(pillar) : category.metaTitle;
  const title = customTitle || pillar?.title || `${category.name} — Reviews & Buying Guides`;
  const description = pillar?.metaDescription || category.metaDescription || category.description
    || `The best ${category.name.toLowerCase()} for your pickup: fitment-first buying guides and honest pros and cons from ${SITE_NAME}.`;
  const canonical = buildCanonical(categoryPath(category.slug));

  return {
    title: customTitle ? { absolute: customTitle } : title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const data = await loadCategory(params.category);
  if (!data) {
    await redirectIfMoved(`/${params.category}`);
    notFound();
  }
  const { category, pillar, posts } = data;

  const groups = CATEGORY_GROUPS
    .map((group) => ({ ...group, posts: posts.filter((post) => group.types.includes(post.type)) }))
    .filter((group) => group.posts.length > 0);

  // The umbrella category links out to every other live category.
  const otherCategories = category.slug === UMBRELLA_CATEGORY_SLUG
    ? (await listLiveCategories()).filter((c) => c._id !== category._id)
    : [];

  const listed = groups.flatMap((group) => group.posts);
  const productImages = pillar ? await getProductImages(pillar.products.map((product) => product.asin)) : {};

  return (
    <div className="bg-background">
      {listed.length > 0 && <JsonLd data={itemListSchema(`${category.name} guides`, listed)} />}
      {otherCategories.length > 0 && (
        <JsonLd
          data={itemListSchema(
            "Truck bed accessory categories",
            otherCategories.map((c) => ({ title: c.name, url: categoryPath(c.slug) }))
          )}
        />
      )}
      {pillar && <JsonLd data={articleSchema(pillar)} />}
      {pillar && pillar.faqs.length > 0 && <JsonLd data={faqSchema(pillar.faqs)} />}
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: category.name }]}
        path={categoryPath(category.slug)}
        eyebrow={`${category.icon ? `${category.icon} ` : ""}${category.name}`}
        title={pillar?.title ?? category.name}
        lead={category.description}
      >
        {groups.length > 1 && (
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-sm border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 transition-colors hover:border-accent hover:bg-accent hover:text-primary"
              >
                {group.title} <span className="text-slate-400">({group.posts.length})</span>
              </a>
            ))}
          </nav>
        )}
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        {pillar && (
          <article className="max-w-3xl space-y-8">
            <p className="text-sm text-slate-500">
              {pillar.author?.slug && (
                <>
                  By{" "}
                  <Link href={authorPath(pillar.author.slug)} rel="author" className="font-semibold text-primary hover:text-accent">
                    {pillar.author.name}
                  </Link>
                  {" · "}
                </>
              )}
              Last updated {format(new Date(`${pillar.updatedOn}T12:00:00Z`), "MMMM d, yyyy")}
            </p>
            <AffiliateNotice />
            <TopPicks products={pillar.products} images={productImages} />
            <ArticleBody html={pillar.content} trucks={pillar.trucks} products={pillar.products} images={productImages} />
            <FaqSection faqs={pillar.faqs} />
            {pillar.author && <AuthorCard author={pillar.author} />}
          </article>
        )}

        {groups.map((group) => (
          <ArticleGrid
            key={group.id}
            id={group.id}
            title={group.title}
            eyebrow={category.name}
            posts={group.posts}
          />
        ))}

        {otherCategories.length > 0 && <GearTypeGrid categories={otherCategories} />}
      </div>
    </div>
  );
}
