import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildCanonical } from "@/lib/utils/seo";
import { authorPath, twitterUrl } from "@/lib/urls";

// schema.org JSON-LD builders. Rendered with <JsonLd />.

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/og-default.png` },
};

export function articleSchema(post: {
  title: string;
  url: string;
  excerpt: string;
  metaDescription: string;
  featuredImage: string;
  publishedAt: string;
  updatedOn: string;
  author?: { name: string; slug?: string } | null;
}) {
  const url = buildCanonical(post.url);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.featuredImage && { image: [post.featuredImage] }),
    datePublished: post.publishedAt,
    dateModified: `${post.updatedOn}T12:00:00Z`,
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
          ...(post.author.slug && { url: buildCanonical(authorPath(post.author.slug)) }),
        }
      : { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher,
  };
}

/** Author page: a ProfilePage about the Person, linking their other profiles via sameAs. */
export function profilePageSchema(author: {
  name: string;
  slug: string;
  bio: string;
  photo: string;
  twitter: string;
  website: string;
}) {
  const url = buildCanonical(authorPath(author.slug));
  const sameAs = [author.website, author.twitter && twitterUrl(author.twitter)].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: author.name,
      url,
      ...(author.bio && { description: author.bio }),
      ...(author.photo && { image: author.photo }),
      ...(sameAs.length && { sameAs }),
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  };
}

/** Breadcrumb trail; the last crumb (current page, no href) uses `currentPath`. */
export function breadcrumbSchema(crumbs: { label: string; href?: string }[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: buildCanonical(crumb.href ?? currentPath),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** The articles listed on a category page or truck hub, in display order. */
export function itemListSchema(name: string, items: { title: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: buildCanonical(item.url),
      name: item.title,
    })),
  };
}
