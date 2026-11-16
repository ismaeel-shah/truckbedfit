import { headers } from "next/headers";

/** Country code stored when Cloudflare doesn't know it (also local dev, where the header is absent). */
export const UNKNOWN_COUNTRY = "XX";

/**
 * The visitor's country as a 2-letter ISO code, from Cloudflare's CF-IPCountry header.
 * Cloudflare's own non-countries ("XX" unknown, "T1" Tor) and anything malformed become "XX".
 */
export function requestCountry(): string {
  const code = (headers().get("cf-ipcountry") ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "T1" ? code : UNKNOWN_COUNTRY;
}

/** "US" → "United States"; unknown codes → "Unknown". */
export function countryName(code: string): string {
  if (code === UNKNOWN_COUNTRY) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
