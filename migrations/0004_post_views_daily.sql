-- Reader views per post per day (UTC), for the dashboard's views-over-time chart.
-- posts.views keeps the all-time total; this table starts counting from the day it's created.
CREATE TABLE IF NOT EXISTS post_views_daily (
  post_id TEXT NOT NULL,
  day TEXT NOT NULL, -- YYYY-MM-DD
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, day)
);

CREATE INDEX IF NOT EXISTS idx_post_views_daily_day ON post_views_daily(day);
