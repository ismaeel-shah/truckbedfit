import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Every upload lives under this R2 prefix. */
export const MEDIA_PREFIX = "uploads/";

export interface MediaItem {
  key: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

function env() {
  return getCloudflareContext().env as unknown as AppCloudflareEnv;
}

export function getMediaBucket() {
  const bucket = env().MEDIA_BUCKET;
  if (!bucket) throw new Error("R2 bucket not configured");
  return bucket;
}

/** Only keys we created: "uploads/…", no path tricks. */
export function isMediaKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith(MEDIA_PREFIX) && !key.includes("..");
}

/**
 * Public URL for an uploaded object. In `next dev` the R2 bucket is a local
 * simulation that the public media domain can't see, so files are served
 * through /api/media/file instead.
 */
export function mediaUrl(key: string) {
  if (process.env.NODE_ENV === "development") return `/api/media/file/${key}`;
  const base = env().R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL env var not set");
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Original file name from metadata, else the key without its date folder and UUID prefix. */
function displayName(object: R2ObjectInfo) {
  const fromMeta = object.customMetadata?.originalName;
  if (fromMeta) return fromMeta;
  const base = object.key.split("/").pop() ?? object.key;
  return base.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

export function toMediaItem(object: R2ObjectInfo): MediaItem {
  return {
    key: object.key,
    url: mediaUrl(object.key),
    name: displayName(object),
    size: object.size,
    contentType: object.httpMetadata?.contentType ?? "",
    uploadedAt: new Date(object.uploaded).toISOString(),
  };
}

// R2 lists keys alphabetically only, so we page through everything and sort by
// upload time. A cap keeps a runaway bucket from making the request unbounded.
const MAX_LISTED_OBJECTS = 5000;

export async function listMedia(): Promise<{ items: MediaItem[]; truncated: boolean }> {
  const bucket = getMediaBucket();
  const objects: R2ObjectInfo[] = [];
  let cursor: string | undefined;
  let truncated = false;

  do {
    const page = await bucket.list({
      prefix: MEDIA_PREFIX,
      cursor,
      limit: 1000,
      include: ["httpMetadata", "customMetadata"],
    });
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
    if (objects.length >= MAX_LISTED_OBJECTS && cursor) {
      truncated = true;
      break;
    }
  } while (cursor);

  const items = objects
    .map(toMediaItem)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return { items, truncated };
}
