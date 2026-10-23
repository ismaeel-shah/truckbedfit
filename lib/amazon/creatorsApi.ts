// Minimal Amazon Creators API client: OAuth token + GetItems for product images.
// Docs: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/get-items
// Server only — it reads the credential secret.

import { AMAZON_TAG } from "@/lib/site";

const GET_ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
const MARKETPLACE = "www.amazon.com";
/** GetItems accepts at most 10 ASINs per request. */
const BATCH_SIZE = 10;
const TIMEOUT_MS = 3000;

/** Login with Amazon token endpoint per credential version (assigned by the store's home region). */
const TOKEN_URLS: Record<string, string> = {
  "3.1": "https://api.amazon.com/auth/o2/token",
  "3.2": "https://api.amazon.co.uk/auth/o2/token",
  "3.3": "https://api.amazon.co.jp/auth/o2/token",
};

export interface AmazonImage {
  url: string;
  width: number | null;
  height: number | null;
}

/** Per ASIN: the primary image (null if the item has none), or "not_found". */
export type AmazonItemResult = AmazonImage | null | "not_found";

const credentials = () => ({
  id: process.env.AMAZON_CREDENTIAL_ID ?? "",
  secret: process.env.AMAZON_CREDENTIAL_SECRET ?? "",
  tokenUrl: TOKEN_URLS[process.env.AMAZON_CREDENTIAL_VERSION || "3.1"] ?? TOKEN_URLS["3.1"],
});

/** Credentials and a partner tag are all set; otherwise the site runs without API data. */
export function isAmazonApiConfigured(): boolean {
  const { id, secret } = credentials();
  return Boolean(id && secret && AMAZON_TAG);
}

export class AmazonApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Tokens last an hour; reuse one per Worker isolate until shortly before it expires.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const { id, secret, tokenUrl } = credentials();
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new AmazonApiError(`token request failed (${res.status})`, res.status);
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new AmazonApiError("token response had no access_token", 500);
  cachedToken = { value: data.access_token, expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000 };
  return cachedToken.value;
}

type RawImage = { url?: unknown; width?: unknown; height?: unknown };
type RawItem = { asin?: unknown; images?: { primary?: { large?: RawImage } } };

const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/**
 * Pulls each requested ASIN's primary image out of a GetItems response. Items can come back in any
 * order, so they're matched by ASIN; requested ASINs missing from the response are "not_found".
 * The docs show both `itemResults` and `itemsResult` as the envelope, so either is accepted.
 */
export function parseGetItemsResponse(json: unknown, requested: string[]): Map<string, AmazonItemResult> {
  const body = (json ?? {}) as { itemResults?: { items?: RawItem[] }; itemsResult?: { items?: RawItem[] } };
  const items = body.itemResults?.items ?? body.itemsResult?.items ?? [];
  const found = new Map<string, AmazonItemResult>();
  for (const item of items) {
    if (typeof item?.asin !== "string") continue;
    const large = item.images?.primary?.large;
    const image = typeof large?.url === "string" && large.url.startsWith("https://")
      ? { url: large.url, width: toNumber(large.width), height: toNumber(large.height) }
      : null;
    found.set(item.asin.toUpperCase(), image);
  }
  return new Map(requested.map((asin) => [asin, found.has(asin) ? found.get(asin)! : "not_found"]));
}

async function getItemsBatch(asins: string[], retried = false): Promise<Map<string, AmazonItemResult>> {
  const res = await fetch(GET_ITEMS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
      "x-marketplace": MARKETPLACE,
    },
    body: JSON.stringify({
      itemIds: asins,
      itemIdType: "ASIN",
      marketplace: MARKETPLACE,
      partnerTag: AMAZON_TAG,
      resources: ["images.primary.large"],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 401 && !retried) {
    cachedToken = null; // expired or revoked token: get a fresh one once
    return getItemsBatch(asins, true);
  }
  if (!res.ok) {
    // e.g. 403 AssociateNotEligible while Amazon reviews access, 429 when over the rate limit
    const detail = await res.text().catch(() => "");
    throw new AmazonApiError(`GetItems failed (${res.status}) ${detail.slice(0, 200)}`, res.status);
  }
  return parseGetItemsResponse(await res.json(), asins);
}

/** Primary images for up to any number of ASINs (requested 10 at a time). Throws on API errors. */
export async function fetchAmazonItems(asins: string[]): Promise<Map<string, AmazonItemResult>> {
  const results = new Map<string, AmazonItemResult>();
  for (let i = 0; i < asins.length; i += BATCH_SIZE) {
    (await getItemsBatch(asins.slice(i, i + BATCH_SIZE))).forEach((result, asin) => results.set(asin, result));
  }
  return results;
}
