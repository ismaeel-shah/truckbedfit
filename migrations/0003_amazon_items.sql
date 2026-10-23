-- Cache of Amazon Creators API product data (primary image only), keyed by ASIN.
-- Amazon allows images to be cached for at most 1 day, so rows older than that are refetched
-- and never shown. No customer data is stored here.
CREATE TABLE IF NOT EXISTS amazon_items (
  asin TEXT PRIMARY KEY,
  -- 'ok' (found; image may still be missing) or 'not_found' (Amazon returned no item for the ASIN)
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'not_found')),
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  -- last successful answer from Amazon (NULL until the first one)
  fetched_at TEXT,
  -- last attempt, successful or not (throttles retries after errors)
  checked_at TEXT NOT NULL
);
