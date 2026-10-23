import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AtSign, Globe, User } from "lucide-react";
import PageHeader from "@/components/public/PageHeader";
import ArticleGrid from "@/components/public/ArticleGrid";
import TrustStatement from "@/components/public/home/TrustStatement";
import JsonLd from "@/components/public/JsonLd";
import { getAuthorBySlug, listPosts } from "@/lib/db/content";
import { redirectIfMoved } from "@/lib/db/redirects";
import { authorPath, twitterUrl } from "@/lib/urls";
import { profilePageSchema } from "@/lib/utils/schema";
import { buildCanonical, buildOpenGraph, buildTwitter, truncate } from "@/lib/utils/seo";
import { imgLoadingProps } from "@/lib/utils/imageProps";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

/** The author and their published articles — or null if the page isn't live. */
async function loadAuthorPage(slug: string) {
  const author = await getAuthorBySlug(slug);
  if (!author) return null;
  const { posts } = await listPosts({ authorId: author._id, status: "published", limit: 500 });
  // Visibility rule: an author page exists only once they have a published article.
  if (!posts.length) return null;
  return { author, posts };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadAuthorPage(params.slug);
  if (!data) return { title: "Page not found" };
  const { author } = data;
  const title = `${author.name}, Author`;
  const description = author.bio
    ? truncate(author.bio.replace(/\s+/g, " "), 155)
    : `Truck bed accessory guides and buying advice written by ${author.name} for ${SITE_NAME}.`;
  const canonical = buildCanonical(authorPath(author.slug));
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      type: "profile",
      ...(author.photo && { images: [{ url: author.photo, alt: author.name }] }),
    }),
    twitter: buildTwitter({ title: `${title} | ${SITE_NAME}`, description }),
  };
}

export default async function AuthorPage({ params }: Params) {
  const data = await loadAuthorPage(params.slug);
  if (!data) {
    await redirectIfMoved(`/authors/${params.slug}`);
    notFound();
  }
  const { author, posts } = data;
  // Blank lines (or single line breaks) in the dashboard bio become paragraphs.
  const bio = author.bio.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="bg-background">
      <JsonLd data={profilePageSchema(author)} />
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: author.name }]}
        path={authorPath(author.slug)}
        eyebrow="Author"
        title={author.name}
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-8 rounded-md border-2 border-slate-200 bg-white p-6 sm:flex-row md:p-8">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-accent/20 ring-4 ring-accent/20 md:h-36 md:w-36">
            {author.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.photo} alt={author.name} className="h-full w-full object-cover" {...imgLoadingProps(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User size={48} className="text-accent" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-extrabold uppercase text-primary">About {author.name}</h2>
            {bio.length > 0 && (
              <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-slate-600">
                {bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            )}
            {(author.website || author.twitter) && (
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-accent">
                    <Globe size={15} aria-hidden="true" /> Website
                  </a>
                )}
                {author.twitter && (
                  <a href={twitterUrl(author.twitter)} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-accent">
                    <AtSign size={15} aria-hidden="true" /> {author.twitter.replace(/^@/, "").replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")}
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <ArticleGrid
          title={`Articles by ${author.name}`}
          eyebrow={`${posts.length} ${posts.length === 1 ? "guide" : "guides"}`}
          posts={posts}
        />
      </div>

      <TrustStatement />
    </div>
  );
}
