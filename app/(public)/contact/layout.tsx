import { Metadata } from "next";
import { getPageMeta } from "@/lib/utils/pageSettings";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_contact");
  return {
    title: meta.metaTitle
      ? { absolute: meta.metaTitle }
      : "Contact",
    description: meta.metaDescription || "Get in touch with the Home Desk Essentials team.",
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
