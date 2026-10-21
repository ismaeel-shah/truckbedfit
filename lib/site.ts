// Single source of truth for site branding. NEXT_PUBLIC_* values are inlined at
// build time, so the fallbacks below are what production builds (CI) use.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "TruckBedFit";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.truckbedfit.com").replace(/\/$/, "");

export const SITE_TAGLINE = "Truck Bed Accessory Reviews & Fitment Guides";

export const SITE_DESCRIPTION =
  "Honest reviews and fitment-first buying guides for truck bed covers, liners, toolboxes, racks, and every accessory your pickup needs.";

export const DEFAULT_EMAIL_FROM = `${SITE_NAME} <noreply@truckbedfit.com>`;

// ── Legal ────────────────────────────────────────────────────────
export const BUSINESS_NAME = "TruckBedFit";
export const SITE_DOMAIN = "truckbedfit.com";
export const CONTACT_EMAIL = "contact@truckbedfit.com";
/** Shown as "Last updated" on every legal page — bump it when you edit one. */
export const LEGAL_LAST_UPDATED = "2026-10-20";

/**
 * Sitemap date for pages whose content lives in code (About, Contact) — bump it when
 * you edit them. Also used for Home/Blog until the first post is published.
 */
export const PAGES_LAST_UPDATED = "2026-10-21";

export const LEGAL_PAGES = [
  { label: "Privacy Policy",       href: "/privacy-policy" },
  { label: "Terms & Conditions",   href: "/terms" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Disclaimer",           href: "/disclaimer" },
] as const;

/** 1200×630 share image used when a page or post has none (public/og-default.png). */
export const DEFAULT_OG_IMAGE = { url: "/og-default.png", width: 1200, height: 630, alt: SITE_NAME };
