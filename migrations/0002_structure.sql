-- Affiliate-site structure: typed articles tied to trucks, plus the six fixed categories.

-- Article type drives the category page groups (see lib/articleTypes.ts)
ALTER TABLE posts ADD COLUMN type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN (
  'pillar', 'category-hub', 'best-list-vehicle', 'best-list-type',
  'review', 'brand', 'comparison', 'guide', 'parts'
));

-- Truck slugs from data/trucks.ts, JSON array
ALTER TABLE posts ADD COLUMN trucks_json TEXT NOT NULL DEFAULT '[]';

-- Editorial "last updated" date (YYYY-MM-DD) shown on the article and used as sitemap lastmod.
-- Set by the editor, so typo fixes don't change it.
ALTER TABLE posts ADD COLUMN updated_on TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_category_type ON posts(category_id, type);

-- The six categories (editable later in the dashboard). Slugs are part of every URL — don't rename casually.
INSERT OR IGNORE INTO categories (id, name, slug, description, icon, meta_title, meta_description, created_at, updated_at) VALUES
  ('cat-tonneau-covers', 'Tonneau Covers', 'tonneau-covers',
   'Hard folding, soft roll-up, retractable and tri-fold bed covers — and how to pick one that fits your truck''s bed length and rail system.',
   '🛻', '', '', '2026-10-23T00:00:01.000Z', '2026-10-23T00:00:01.000Z'),
  ('cat-bed-liners', 'Bed Liners & Mats', 'bed-liners',
   'Spray-in and drop-in bed liners and rubber bed mats — what each protects against and how to match one to your bed.',
   '🧱', '', '', '2026-10-23T00:00:02.000Z', '2026-10-23T00:00:02.000Z'),
  ('cat-toolboxes', 'Toolboxes', 'toolboxes',
   'Crossover, chest, side-mount and under-cover truck toolboxes — sizes, mounting styles and how they work with bed covers.',
   '🧰', '', '', '2026-10-23T00:00:03.000Z', '2026-10-23T00:00:03.000Z'),
  ('cat-bed-racks', 'Bed Racks', 'bed-racks',
   'Bed racks and ladder racks for overlanding, work and hauling — mounting options and how they fit with covers.',
   '🪜', '', '', '2026-10-23T00:00:04.000Z', '2026-10-23T00:00:04.000Z'),
  ('cat-bed-extenders', 'Bed Extenders & Cargo', 'bed-extenders',
   'Bed extenders, cargo bars, nets and organizers that help you carry more and keep it in place.',
   '📦', '', '', '2026-10-23T00:00:05.000Z', '2026-10-23T00:00:05.000Z'),
  ('cat-bed-accessories', 'Bed Accessories', 'bed-accessories',
   'Every truck bed accessory we cover, in one place — start here and jump to the category you need.',
   '🔧', '', '', '2026-10-23T00:00:06.000Z', '2026-10-23T00:00:06.000Z');
