-- Reader views and Amazon-button clicks per day by visitor country, for the dashboard.
-- Country is Cloudflare's 2-letter code (CF-IPCountry); "XX" = unknown. No IP address is stored.
-- History starts the day this table is created.
CREATE TABLE IF NOT EXISTS views_by_country_daily (
  day TEXT NOT NULL, -- YYYY-MM-DD (UTC)
  country TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country)
);

CREATE TABLE IF NOT EXISTS amazon_clicks_daily (
  day TEXT NOT NULL, -- YYYY-MM-DD (UTC)
  country TEXT NOT NULL,
  path TEXT NOT NULL, -- the page the reader clicked on, e.g. /tonneau-covers/some-guide
  asin TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country, path, asin)
);

CREATE INDEX IF NOT EXISTS idx_amazon_clicks_daily_day ON amazon_clicks_daily(day);
