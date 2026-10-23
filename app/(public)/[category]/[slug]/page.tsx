import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Clock, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import Breadcrumbs, { Crumb } from "@/components/public/Breadcrumbs";
import TableOfContents from "@/components/public/TableOfContents";
import ReadingProgress from "@/components/public/ReadingProgress";
import AuthorCard from "@/components/public/AuthorCard";
import ArticleGrid from "@/components/public/ArticleGrid";
import AffiliateNotice from "@/components/public/article/AffiliateNotice";
import ArticleBody from "@/components/public/article/ArticleBody";
import TopPicks from "@/components/public/content/TopPicks";
import FaqSection from "@/components/public/article/FaqSection";
import JsonLd from "@/components/public/JsonLd";
import { getPublishedArticle, listPosts } from "@/lib/db/content";
import { countView } from "@/lib/views";
import { redirectIfMoved } from "@/lib/db/redirects";
import { getProductImages } from "@/lib/amazon/productImages";
import { PILLAR_TYPES } from "@/lib/articleTypes";
import { authorPath, categoryPath, truckPath } from "@/lib/urls";
import { getTruck } from "@/data/trucks";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/utils/schema";
import { articleSeoTitle, buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/utils/seo";
import { imgLoadingProps } from "@/lib/utils/imageProps";
import { articleDates } from "@/lib/utils/articleDates";

export const dynamic = "force-dynamic";

const RELATED_LIMIT = 6;

type Params = { params: { category: string; slug: string } };
type Article = NonNullable<Awaited<ReturnType<typeof getPublishedArticle>>>;

/** "More for your [truck]": the first of the post's trucks that has other articles. */
async function moreForTruck(post: Article) {
  for (const slug of post.trucks) {
    const truck = getTruck(slug);
    if (!truck) continue;
    const { posts } = await listPosts({
      truck: slug, excludeId: post._id, excludeTypes: PILLAR_TYPES, status: "published", limit: RELATED_LIMIT,
    });
    if (posts.length) return { truck, posts };
  }
  return null;
}

/** "More in [category]", skipping anything already shown in the truck box. */
async function moreInCategory(post: Article, shownIds: Set<string>) {
  const { posts } = await listPosts({
    category: post.categoryId,
    excludeId: post._id,
    excludeTypes: PILLAR_TYPES,
    status: "published",
    limit: RELATED_LIMIT + shownIds.size,
  });
  return posts.filter((p) => !shownIds.has(p._id)).slice(0, RELATED_LIMIT);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPublishedArticle(params.category, params.slug);
  if (!post) return { title: "Page not found" };

  const title = articleSeoTitle(post);
  const description = post.metaDescription || post.excerpt;
  const canonical = buildCanonical(post.url);
  // OG image → featured image → site default (from buildOpenGraph). Dimensions are
  // omitted for post images because we don't know their real size.
  const shareImage = post.ogImage || post.featuredImage;

  return {
    // A custom SEO title is used exactly as written; otherwise the H1 gets the " | TruckBedFit" suffix.
    title: post.metaTitle ? { absolute: title } : post.title,
    description,
    openGraph: buildOpenGraph({
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: `${post.updatedOn}T12:00:00Z`,
      ...(shareImage && { images: [{ url: shareImage, alt: post.title }] }),
    }),
    twitter: buildTwitter({
      title,
      description,
      ...(shareImage && { images: [shareImage] }),
    }),
    alternates: { canonical },
  };
}

export default async function ArticlePage({ params }: Params) {
  const post = await getPublishedArticle(params.category, params.slug);
  if (!post) {
    await redirectIfMoved(`/${params.category}/${params.slug}`);
    notFound();
  }

  countView(post._id);

  const [truckBox, productImages] = await Promise.all([
    moreForTruck(post),
    getProductImages(post.products.map((product) => product.asin)),
  ]);
  const categoryPosts = await moreInCategory(post, new Set(truckBox?.posts.map((p) => p._id)));

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: post.category.name, href: categoryPath(post.category.slug) },
    { label: post.title },
  ];
  const dates = articleDates(post);
  const trucks = post.trucks.map(getTruck).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <ReadingProgress />
      <JsonLd data={articleSchema(post)} />
      <JsonLd data={breadcrumbSchema(crumbs, post.url)} />
      {post.faqs.length > 0 && <JsonLd data={faqSchema(post.faqs)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          <article className="min-w-0">
            <header className="mb-8">
              <Link
                href={categoryPath(post.category.slug)}
                className="inline-block bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 hover:bg-orange-500 transition-colors"
              >
                {post.category.icon} {post.category.name}
              </Link>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-slate-500 text-lg leading-relaxed mb-6">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                {post.author?.slug && (
                  <span>
                    By{" "}
                    <Link href={authorPath(post.author.slug)} rel="author" className="font-semibold text-primary hover:text-accent">
                      {post.author.name}
                    </Link>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} aria-hidden="true" />
                  {dates.updated ? `Published ${dates.published} · Updated ${dates.updated}` : `Published ${dates.published}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden="true" /> {post.readingTime} min read
                </span>
                {trucks.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1.5">
                    Fits:
                    {trucks.map((truck, i) => (
                      <span key={truck.slug}>
                        <Link href={truckPath(truck.slug)} className="font-semibold text-primary hover:text-accent">
                          {truck.name}
                        </Link>
                        {i < trucks.length - 1 && ","}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </header>

            <div className="mb-8">
              <AffiliateNotice />
            </div>

            {post.featuredImage && (
              <div className="w-full rounded-2xl overflow-hidden mb-10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-auto block"
                  // The featured image is usually the LCP element: fetch it first.
                  {...imgLoadingProps(true)}
                />
              </div>
            )}

            <TopPicks products={post.products} images={productImages} />
            <ArticleBody html={post.content} trucks={post.trucks} products={post.products} images={productImages} />

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-slate-100">
                <Tag size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.author && <AuthorCard author={post.author} />}
          </article>

          {/* Sidebar — ends here, so the sticky TOC stops before the FAQs */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>

        {post.faqs.length > 0 && (
          <div className="mt-12 lg:pr-[320px]">
            <FaqSection faqs={post.faqs} />
          </div>
        )}

        <div className="mt-16 space-y-16 border-t border-slate-200 pt-12">
          {truckBox && (
            <ArticleGrid
              title={`More for your ${truckBox.truck.name}`}
              eyebrow="Same truck"
              href={truckPath(truckBox.truck.slug)}
              posts={truckBox.posts}
            />
          )}
          <ArticleGrid
            title={`More in ${post.category.name}`}
            eyebrow="Keep reading"
            href={categoryPath(post.category.slug)}
            posts={categoryPosts}
          />
        </div>
      </div>
    </>
  );
}
