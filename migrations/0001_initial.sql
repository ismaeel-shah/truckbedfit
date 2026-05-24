CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  twitter TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  bio TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  twitter TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  reset_token TEXT,
  reset_token_expiry TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
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
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  type INTEGER NOT NULL DEFAULT 301 CHECK (type IN (301, 302)),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_redirects_source_active ON redirects(source, active);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
