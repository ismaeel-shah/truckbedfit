-- Written content for the generated hub pages: /trucks and /trucks/<truck>.
-- The page keeps its generated parts (bed table, article lists); this adds an editable H1, SEO
-- fields, an intro written in the dashboard editor (shortcodes work) and FAQs.
CREATE TABLE IF NOT EXISTS hub_pages (
  path TEXT PRIMARY KEY, -- "/trucks" or "/trucks/<truck slug>"
  title TEXT NOT NULL DEFAULT '', -- H1; empty = the generated default
  meta_title TEXT NOT NULL DEFAULT '', -- may contain {year}
  meta_description TEXT NOT NULL DEFAULT '',
  focus_keyword TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  faqs_json TEXT NOT NULL DEFAULT '[]',
  updated_on TEXT, -- YYYY-MM-DD, sitemap lastmod
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
