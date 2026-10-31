import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

/** FTC: disclose affiliate links before readers reach them. */
export default function AffiliateNotice() {
  return (
    <p className="border-l-2 border-accent bg-white px-4 py-3 text-xs leading-relaxed text-slate-500">
      {SITE_NAME} is reader-supported. When you buy through links on this site, I may earn an affiliate
      commission at no extra cost to you.{" "}
      <Link href="/affiliate-disclosure" className="font-semibold text-accent hover:underline">
        Read the affiliate disclosure
      </Link>
    </p>
  );
}
