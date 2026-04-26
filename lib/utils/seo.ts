export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

export function buildCanonical(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://homedeskessentials.com";
  return `${base}${path}`;
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
