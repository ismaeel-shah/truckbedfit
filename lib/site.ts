// Single source of truth for site branding. NEXT_PUBLIC_* values are inlined at
// build time, so the fallbacks below are what production builds (CI) use.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "TruckBedFit";

// Canonical host is the bare domain (no www); middleware 301s www → bare.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://truckbedfit.com").replace(/\/$/, "");

export const SITE_TAGLINE = "Truck Bed Accessory Reviews & Fitment Guides";

export const SITE_DESCRIPTION =
  "Honest reviews and fitment-first buying guides for truck bed covers, liners, toolboxes, racks, and every accessory your pickup needs.";

export const DEFAULT_EMAIL_FROM = `${SITE_NAME} <noreply@truckbedfit.com>`;

/**
 * Amazon Associates tracking ID (e.g. "truckbedfit-20"), added to every ProductBox link.
 * Build-time value: set NEXT_PUBLIC_AMAZON_TAG in .env.local and as a GitHub repository variable.
 */
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

// ── Legal ────────────────────────────────────────────────────────
export const BUSINESS_NAME = "TruckBedFit";
export const SITE_DOMAIN = "truckbedfit.com";
export const CONTACT_EMAIL = "contactismaeel69@gmail.com";
/** Shown as "Last updated" on every legal page — bump it when you edit one. */
export const LEGAL_LAST_UPDATED = "2026-10-31";

/**
 * Sitemap date for pages whose content lives in code (About, Contact) — bump it when
 * you edit them. Also used for Home/Blog until the first post is published.
 */
export const PAGES_LAST_UPDATED = "2026-10-31";

export const LEGAL_PAGES = [
  { label: "Privacy Policy",       href: "/privacy-policy" },
  { label: "Terms & Conditions",   href: "/terms" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Disclaimer",           href: "/disclaimer" },
] as const;

/** The site's social profiles: shown in the footer and listed as `sameAs` in the Organization JSON-LD. */
export const SOCIAL_LINKS = [
  { network: "instagram", label: "Instagram", href: "https://www.instagram.com/truckbedfit/" },
  { network: "pinterest", label: "Pinterest", href: "https://www.pinterest.com/truckbedfit/" },
  { network: "x", label: "X", href: "https://x.com/truckbedfit" },
] as const;

/** The site's X account, credited on shared link cards (twitter:site). */
export const X_HANDLE = "@truckbedfit";

/** 1200×630 share image used when a page or post has none (public/og-default.png). */
export const DEFAULT_OG_IMAGE = { url: "/og-default.png", width: 1200, height: 630, alt: SITE_NAME };
