-- Removes the posts added by seed-placeholders.sql (local dev only).
DELETE FROM posts WHERE id IN ('placeholder-pillar', 'placeholder-f150', 'placeholder-guide');
