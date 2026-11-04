-- More author profiles for the author card, author page and Person JSON-LD (sameAs).
-- Each holds a handle or a full profile URL; empty = not shown.
ALTER TABLE authors ADD COLUMN instagram TEXT NOT NULL DEFAULT '';
ALTER TABLE authors ADD COLUMN facebook TEXT NOT NULL DEFAULT '';
ALTER TABLE authors ADD COLUMN linkedin TEXT NOT NULL DEFAULT '';
