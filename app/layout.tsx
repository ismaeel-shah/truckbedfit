import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worknest.example.com";

export const metadata: Metadata = {
  title: {
    default: "WorkNest — Home Office Blog",
    template: "%s | WorkNest",
  },
  description:
    "Expert reviews and guides for home office equipment — ergonomic chairs, standing desks, monitors, keyboards, and more.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "WorkNest",
    locale:   "en_US",
    type:     "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type":    "Organization",
  name:        "WorkNest",
  url:         siteUrl,
  description: "Expert reviews and buying guides for home office equipment.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  name:       "WorkNest",
  url:        siteUrl,
  potentialAction: {
    "@type":       "SearchAction",
    target:        `${siteUrl}/blog?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body bg-background text-primary antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
