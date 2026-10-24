-- The content plan maps several target keywords to each article ("use ALL of these").
-- One keyword per line; the SEO tab shows which ones the article already uses.
ALTER TABLE posts ADD COLUMN secondary_keywords TEXT NOT NULL DEFAULT '';
