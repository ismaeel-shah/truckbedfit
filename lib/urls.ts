import { isPillarType } from "@/lib/articleTypes";

// Every public URL is built here so the scheme lives in one place:
//   /[category]            category page (its pillar/hub article renders here)
//   /[category]/[slug]     article
//   /trucks, /trucks/[truck]
//   /authors/[author]
// No trailing slash; never put years or dates in a URL.

/**
 * Root-level paths owned by other pages. Category slugs live at the root (/[category]),
 * so a category may never use one of these.
 */
export const RESERVED_ROOT_SLUGS = [
  "trucks", "authors", "about", "contact", "how-we-research", "privacy-policy", "terms", "disclaimer",
  "affiliate-disclosure", "login", "dashboard", "api", "blog", "category", "guides",
  "sitemap.xml", "robots.txt", "icon.svg", "favicon.ico", "og-default.png", "_next",
] as const;

export function isReservedRootSlug(slug: string): boolean {
  return (RESERVED_ROOT_SLUGS as readonly string[]).includes(slug);
}

export function categoryPath(categorySlug: string): string {
  return `/${categorySlug}`;
}

export function truckPath(truckSlug: string): string {
  return `/trucks/${truckSlug}`;
}

export function authorPath(authorSlug: string): string {
  return `/authors/${authorSlug}`;
}

/** An author's X/Twitter field ("@handle", "handle" or a full URL) → profile URL. */
export function twitterUrl(handle: string): string {
  if (/^https?:\/\//i.test(handle)) return handle;
  return `https://x.com/${handle.replace(/^@/, "")}`;
}

export function articlePath(post: {
  slug: string;
  type?: string | null;
  category?: { slug: string } | null;
}): string {
  const categorySlug = post.category?.slug ?? "";
  if (isPillarType(post.type)) return categoryPath(categorySlug);
  return `/${categorySlug}/${post.slug}`;
}
