import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

export function buildCanonical(path: string): string {
  return `${SITE_URL}${path}`;
}

/** `?page=` value → positive integer, defaulting to 1 for missing/invalid input. */
export function parsePageParam(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** Paginated listings: page 1 is the bare path, later pages keep their own self-referencing URL. */
export function paginatedPath(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}

/** "Blog" → "Blog – Page 2" so paginated pages don't share one title. */
export function paginatedTitle(title: string, page: number): string {
  return page > 1 ? `${title} – Page ${page}` : title;
}

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type Twitter = NonNullable<Metadata["twitter"]>;

// Next.js replaces (does not merge) a parent's openGraph/twitter when a page sets
// its own, so every page builds them from these defaults to keep the site name,
// locale and a share image.
export function buildOpenGraph(og: OpenGraph = {}): OpenGraph {
  return {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
    ...og,
  } as OpenGraph;
}

/** Metadata for simple static pages (legal pages etc.): title, description, canonical, share tags. */
export function staticPageMetadata(title: string, description: string, path: string): Metadata {
  const url = buildCanonical(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ title: `${title} | ${SITE_NAME}`, description, url }),
    twitter: buildTwitter({ title: `${title} | ${SITE_NAME}`, description }),
  };
}

export function buildTwitter(twitter: Twitter = {}): Twitter {
  return {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
    ...twitter,
  } as Twitter;
}

export interface SEOCheckResult {
  id: string;
  label: string;
  pass: boolean;
}

export function runSEOChecklist(data: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  content: string;
  slug: string;
}): SEOCheckResult[] {
  const { title, metaTitle, metaDescription, focusKeyword, content, slug } =
    data;
  const kw = focusKeyword.toLowerCase();
  const plainContent = content.replace(/<[^>]*>/g, "").toLowerCase();

  return [
    {
      id: "focus_keyword",
      label: "Focus keyword is set",
      pass: kw.length > 0,
    },
    {
      id: "meta_title_length",
      label: "Meta title is under 60 characters",
      pass: metaTitle.length > 0 && metaTitle.length <= 60,
    },
    {
      id: "meta_title_kw",
      label: "Focus keyword in meta title",
      pass: kw.length > 0 && metaTitle.toLowerCase().includes(kw),
    },
    {
      id: "meta_desc_length",
      label: "Meta description is 50–160 characters",
      pass:
        metaDescription.length >= 50 && metaDescription.length <= 160,
    },
    {
      id: "meta_desc_kw",
      label: "Focus keyword in meta description",
      pass: kw.length > 0 && metaDescription.toLowerCase().includes(kw),
    },
    {
      id: "title_kw",
      label: "Focus keyword in post title",
      pass: kw.length > 0 && title.toLowerCase().includes(kw),
    },
    {
      id: "slug_kw",
      label: "Focus keyword in slug",
      pass: kw.length > 0 && slug.includes(kw.replace(/\s+/g, "-")),
    },
    {
      id: "content_length",
      label: "Content is at least 1500 words",
      pass: plainContent.trim().split(/\s+/).length >= 1500,
    },
    {
      id: "content_kw",
      label: "Focus keyword appears in content",
      pass: kw.length > 0 && plainContent.includes(kw),
    },
  ];
}
