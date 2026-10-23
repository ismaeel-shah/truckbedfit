import { format } from "date-fns";

/** "YYYY-MM-DD" or an ISO timestamp → its calendar day, formatted (noon UTC so no timezone shifts it). */
const formatDay = (day: string, pattern: string) => format(new Date(`${day.slice(0, 10)}T12:00:00Z`), pattern);

/**
 * The dates shown on an article: always the publish day, plus the "updated" day only when the
 * article was revised on a later day (both are set automatically when it's saved).
 */
export function articleDates(post: { publishedAt: string; updatedOn: string }, pattern = "MMM d, yyyy") {
  const publishedDay = post.publishedAt.slice(0, 10);
  return {
    published: formatDay(publishedDay, pattern),
    updated: post.updatedOn > publishedDay ? formatDay(post.updatedOn, pattern) : null,
  };
}
