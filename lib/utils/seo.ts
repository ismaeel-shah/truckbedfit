import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

export function buildCanonical(path: string): string {
  return `${SITE_URL}${path}`;
}

/** Replaces {year} with the current year, so "Best Covers ({year})" never goes stale. */
export function withYear(text: string): string {
  return text.replace(/\{year\}/g, String(new Date().getFullYear()));
}

/** The <title> for an article: its SEO title (with {year} filled in) or, failing that, its H1. */
export function articleSeoTitle(post: { title: string; metaTitle: string }): string {
  return withYear(post.metaTitle.trim()) || post.title;
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

/**
 * Metadata for a generated hub page (/trucks, /trucks/<truck>): the SEO title/description written in the
 * dashboard when set (title used exactly as written, `{year}` filled in), otherwise the generated defaults.
 */
export function hubPageMetadata(
  hub: { metaTitle: string; metaDescription: string } | null,
  fallback: { title: string; description: string },
  path: string
): Metadata {
  const description = hub?.metaDescription.trim() || fallback.description;
  const custom = hub?.metaTitle.trim() ? withYear(hub.metaTitle.trim()) : "";
  const base = staticPageMetadata(fallback.title, description, path);
  if (!custom) return base;
  return {
    ...base,
    title: { absolute: custom },
    openGraph: buildOpenGraph({ title: custom, description, url: buildCanonical(path) }),
    twitter: buildTwitter({ title: custom, description }),
  };
}

export function buildTwitter(twitter: Twitter = {}): Twitter {
  return {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
    ...twitter,
  } as Twitter;
}

/** Words in a piece of plain text or HTML. */
export const wordCount = (text: string) => text.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

/** The content plan's short-answer length (featured-snippet sized). */
export const SHORT_ANSWER_WORDS = { min: 40, max: 60 } as const;

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
  /** Checked only when given (pages that have a short-answer field) */
  shortAnswer?: string;
}): SEOCheckResult[] {
  const { title, metaTitle, metaDescription, focusKeyword, content, slug, shortAnswer } =
    data;
  const kw = focusKeyword.toLowerCase();
  const plainContent = content.replace(/<[^>]*>/g, "").toLowerCase();
  const answerWords = shortAnswer === undefined ? 0 : wordCount(shortAnswer);

  return [
    ...(shortAnswer === undefined ? [] : [{
      id: "short_answer_length",
      label: `Short answer is ${SHORT_ANSWER_WORDS.min}–${SHORT_ANSWER_WORDS.max} words`,
      pass: answerWords >= SHORT_ANSWER_WORDS.min && answerWords <= SHORT_ANSWER_WORDS.max,
    }]),
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
