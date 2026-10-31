import { Metadata } from "next";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { staticPageMetadata } from "@/lib/utils/seo";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_contact");
  const base = staticPageMetadata(
    meta.metaTitle || "Contact",
    meta.metaDescription || `Questions about a guide, a fitment problem or a product I should review? Get in touch with ${SITE_NAME}.`,
    "/contact"
  );
  return meta.metaTitle ? { ...base, title: { absolute: meta.metaTitle } } : base;
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
