-- The content plan gives /trucks and every truck hub a 40–60 word short answer under the H1,
-- like articles (whose short answer is stored in posts.excerpt).
ALTER TABLE hub_pages ADD COLUMN short_answer TEXT NOT NULL DEFAULT '';
