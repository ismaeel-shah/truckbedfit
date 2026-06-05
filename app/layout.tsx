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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homedeskessentials.com";

export const metadata: Metadata = {
  verification: { google: "3Qpnog2762ZXbSYtcsrcwlelS3jxo1OaJPaBgm_Zauw" },
  title: {
    default: "Home Desk Essentials — Home Office Blog",
    template: "%s | Home Desk Essentials",
  },
  description:
    "Expert reviews and guides for home office equipment — ergonomic chairs, standing desks, monitors, keyboards, and more.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Home Desk Essentials",
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
  name:        "Home Desk Essentials",
  url:         siteUrl,
  description: "Expert reviews and buying guides for home office equipment.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  name:       "Home Desk Essentials",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5KNVMXJ4');`,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body bg-background text-primary antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KNVMXJ4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
