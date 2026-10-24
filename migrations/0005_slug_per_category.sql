-- Slugs are unique per category, not site-wide: the content plan has pages like
-- /tonneau-covers/ford-f150 AND /bed-liners/ford-f150. SQLite can't change a UNIQUE constraint
-- in place, so the posts table is rebuilt with UNIQUE(category_id, slug) and every row copied over.
-- (Columns listed explicitly so a stray local-only column is simply left behind.)

PRAGMA defer_foreign_keys = true;

CREATE TABLE posts_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured_image TEXT NOT NULL DEFAULT '',
  featured_image_alt TEXT NOT NULL DEFAULT '',
  category_id TEXT NOT NULL,
  author_id TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TEXT,
  scheduled_at TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  focus_keyword TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  affiliate_products_json TEXT NOT NULL DEFAULT '[]',
  faqs_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN (
    'pillar', 'category-hub', 'best-list-vehicle', 'best-list-type',
    'review', 'brand', 'comparison', 'guide', 'parts'
  )),
  trucks_json TEXT NOT NULL DEFAULT '[]',
  updated_on TEXT,
  UNIQUE (category_id, slug),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

INSERT INTO posts_new (
  id, title, slug, excerpt, content, featured_image, featured_image_alt, category_id, author_id, tags_json,
  status, published_at, scheduled_at, views, reading_time, meta_title, meta_description, focus_keyword, og_image,
  affiliate_products_json, faqs_json, created_at, updated_at, type, trucks_json, updated_on
)
SELECT
  id, title, slug, excerpt, content, featured_image, featured_image_alt, category_id, author_id, tags_json,
  status, published_at, scheduled_at, views, reading_time, meta_title, meta_description, focus_keyword, og_image,
  affiliate_products_json, faqs_json, created_at, updated_at, type, trucks_json, updated_on
FROM posts;

DROP TABLE posts;
ALTER TABLE posts_new RENAME TO posts;

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_type ON posts(category_id, type);
