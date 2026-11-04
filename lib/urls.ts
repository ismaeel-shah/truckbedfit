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

/** A profile field ("@handle", "handle" or a full URL) → profile URL on the given site. */
function profileUrl(value: string, base: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(trimmed)) return `https://${trimmed}`;
  return `${base}${trimmed.replace(/^@/, "")}`;
}

/** An author's X/Twitter field ("@handle", "handle" or a full URL) → profile URL. */
export function twitterUrl(handle: string): string {
  return profileUrl(handle, "https://x.com/");
}

export type AuthorProfile = { network: "website" | "x" | "instagram" | "facebook" | "linkedin"; label: string; href: string };

/** An author's filled-in profiles, in display order, as links. */
export function authorProfiles(author: {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}): AuthorProfile[] {
  const profiles: AuthorProfile[] = [];
  if (author.website?.trim()) profiles.push({ network: "website", label: "Website", href: profileUrl(author.website, "https://") });
  if (author.twitter?.trim()) profiles.push({ network: "x", label: "X", href: twitterUrl(author.twitter) });
  if (author.instagram?.trim()) profiles.push({ network: "instagram", label: "Instagram", href: profileUrl(author.instagram, "https://www.instagram.com/") });
  if (author.facebook?.trim()) profiles.push({ network: "facebook", label: "Facebook", href: profileUrl(author.facebook, "https://www.facebook.com/") });
  if (author.linkedin?.trim()) profiles.push({ network: "linkedin", label: "LinkedIn", href: profileUrl(author.linkedin, "https://www.linkedin.com/in/") });
  return profiles;
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
