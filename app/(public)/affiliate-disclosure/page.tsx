import Link from "next/link";
import LegalPage from "@/components/public/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "Affiliate Disclosure",
  `How ${BUSINESS_NAME} earns money through affiliate links, including the Amazon Associates Program.`,
  "/affiliate-disclosure"
);

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage title="Affiliate Disclosure" path="/affiliate-disclosure">
      <p className="lead">
        {BUSINESS_NAME} is reader-supported. When you buy through links on our site, we may earn an affiliate
        commission — at no extra cost to you.
      </p>

      <h2>Amazon Associates Program</h2>
      <p>
        <strong>
          {BUSINESS_NAME} is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program
          designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
        </strong>
      </p>
      <p>
        <strong>As an Amazon Associate, we earn from qualifying purchases.</strong>
      </p>

      <h2>What this means for you</h2>
      <ul>
        <li>Many product links on our site — including &quot;View on Amazon&quot; buttons — are affiliate links.</li>
        <li>If you click one and make a qualifying purchase, the retailer pays us a small commission.</li>
        <li>You pay exactly the same price whether or not you use our link.</li>
        <li>We may also join other affiliate programs in the future; this page will be updated if we do.</li>
      </ul>

      <h2>Our editorial independence</h2>
      <p>
        Commissions help us cover the cost of research, testing and running the site, and keep our guides free to read.
        They do not decide what we recommend. We choose products based on fitment, build quality, features, value and
        real-world feedback, and we point out downsides as well as strengths. Brands cannot pay for a placement or a
        positive review.
      </p>

      <h2>FTC compliance</h2>
      <p>
        This disclosure is provided in accordance with the U.S. Federal Trade Commission&apos;s guidelines on endorsements
        and testimonials in advertising (16 CFR Part 255). A short disclosure also appears on our articles and in the
        footer of every page.
      </p>

      <h2>Prices and availability</h2>
      <p>
        Prices and availability change often. Any price shown on our site is accurate as of the date indicated and may be
        different on the retailer&apos;s site; the price shown at checkout is the one that applies. See our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link> for details.
      </p>

      <h2>Questions</h2>
      <p>
        If you have any questions about this disclosure, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
