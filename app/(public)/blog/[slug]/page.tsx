import { notFound, redirect, permanentRedirect } from "next/navigation";
import { format } from "date-fns";
import { Clock, Calendar, Tag } from "lucide-react";
import { Metadata } from "next";
import TableOfContents from "@/components/public/TableOfContents";
import ReadingProgress from "@/components/public/ReadingProgress";
import AmazonProductBox from "@/components/public/AmazonProductBox";
import RelatedPosts from "@/components/public/RelatedPosts";
import AuthorCard from "@/components/public/AuthorCard";
import { buildCanonical } from "@/lib/utils/seo";
import { processContent } from "@/lib/utils/processContent";
import { connectDB } from "@/lib/mongodb";
import RedirectModel from "@/lib/models/Redirect";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts?slug=${slug}&status=published`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { posts } = await res.json();
  return posts?.find((p: { slug: string }) => p.slug === slug) ?? null;
}

async function getRelated(categoryId: string, excludeSlug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(
    `${base}/api/posts?category=${categoryId}&limit=4&status=published`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const { posts } = await res.json();
  return posts.filter((p: { slug: string }) => p.slug !== excludeSlug).slice(0, 3);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.ogImage || post.featuredImage
        ? [{ url: post.ogImage || post.featuredImage, width: 1200, height: 630, alt: post.title }]
        : [],
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
    },
    alternates: { canonical: buildCanonical(`/blog/${params.slug}`) },
  };
}

export default async function SinglePostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) {
    await connectDB();
    const doc = await RedirectModel.findOne({ source: `/blog/${params.slug}`, active: true }).lean() as { destination: string; type: number } | null;
    if (doc) {
      if (doc.type === 301) permanentRedirect(doc.destination);
      else redirect(doc.destination);
    }
    notFound();
  }

  const related = await getRelated(post.category?._id, params.slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homedeskessentials.com";
  const postUrl = `${siteUrl}/blog/${params.slug}`;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type":    "BlogPosting",
    url:          postUrl,
    headline:     post.title,
    description:  post.excerpt,
    image:        post.featuredImage,
    datePublished: post.publishedAt,
    dateModified:  post.updatedAt,
    author:    { "@type": "Person", name: post.author?.name ?? "Home Desk Essentials" },
    publisher: { "@type": "Organization", name: "Home Desk Essentials", url: siteUrl },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog",  item: `${siteUrl}/blog` },
      ...(post.category ? [{
        "@type": "ListItem", position: 3,
        name: post.category.name,
        item: `${siteUrl}/category/${post.category.slug}`,
      }] : []),
      { "@type": "ListItem", position: post.category ? 4 : 3, name: post.title, item: postUrl },
    ],
  };

  const faqSchema = post.faqs?.length > 0 ? {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: post.faqs.map((faq: { question: string; answer: string }) => ({
      "@type":         "Question",
      name:            faq.question,
      acceptedAnswer:  { "@type": "Answer", text: faq.answer },
    })),
  } : null;

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-accent">Home</a> /
          <a href="/blog" className="hover:text-accent">Blog</a> /
          {post.category && (
            <>
              <a href={`/category/${post.category.slug}`} className="hover:text-accent">{post.category.name}</a> /
            </>
          )}
          <span className="text-slate-400 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          {/* Main content */}
          <article>
            {/* Header */}
            <header className="mb-8">
              {post.category && (
                <span className="inline-block bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {post.category.icon} {post.category.name}
                </span>
              )}
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-white leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readingTime} min read
                </span>
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {format(new Date(post.publishedAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </header>

            {/* Featured image */}
            {post.featuredImage && (
              <div className="w-full rounded-2xl overflow-hidden mb-10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-auto block"
                />
              </div>
            )}

            {/* Affiliate products (above content) */}
            {post.affiliateProducts?.length > 0 && (
              <AmazonProductBox products={post.affiliateProducts} />
            )}

            {/* Body */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-accent prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Tag size={14} className="text-slate-400 shrink-0" />
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author card */}
            {post.author && <AuthorCard author={post.author} />}

          </article>

          {/* Sidebar — ends here, so TOC sticky stops before FAQs */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>

        {/* FAQs — outside the grid so TOC sticky stops above them */}
        {post.faqs?.length > 0 && (
          <div className="mt-10 lg:pr-[320px]">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {post.faqs.map((faq: { question: string; answer: string }, i: number) => (
                <details key={i} className="group card p-0 overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-primary dark:text-white text-sm select-none hover:text-accent transition-colors">
                    <span>{faq.question}</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0">▾</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts — full width below */}
        <RelatedPosts posts={related} />
      </div>
    </>
  );
}
