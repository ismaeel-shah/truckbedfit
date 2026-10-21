import Link from "next/link";
import LegalPage from "@/components/public/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL, SITE_DOMAIN } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "Terms & Conditions",
  `The terms that govern your use of ${SITE_DOMAIN}, including product information, affiliate links and liability.`,
  "/terms"
);

export default function TermsPage() {
  const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage title="Terms & Conditions" path="/terms">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of {SITE_DOMAIN} (the
        &quot;Site&quot;), operated by {BUSINESS_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By using
        the Site, you agree to these Terms and to our <Link href="/privacy-policy">Privacy Policy</Link>. If you do not
        agree, please do not use the Site.
      </p>

      <h2>1. About the Site</h2>
      <p>
        The Site publishes reviews, buying guides and general information about truck bed accessories. We do not sell
        products directly. Purchases you make through links on the Site are made with third-party retailers such as
        Amazon, under their own terms.
      </p>

      <h2>2. Using the Site</h2>
      <p>You may use the Site for your personal, non-commercial use. You agree not to:</p>
      <ul>
        <li>Use the Site in any way that violates applicable law.</li>
        <li>Copy, republish or redistribute our content without written permission, except for brief quotes with a link back to the Site.</li>
        <li>Scrape, crawl or harvest content or data from the Site by automated means, except for search-engine indexing.</li>
        <li>Attempt to gain unauthorized access to the Site, its admin area or its systems, or interfere with its operation.</li>
        <li>Use the contact form to send spam, malware, or unlawful or abusive content.</li>
      </ul>

      <h2>3. Intellectual property</h2>
      <p>
        The Site&apos;s text, graphics, logos and design are owned by {BUSINESS_NAME} or its licensors and are protected
        by U.S. and international copyright and trademark laws. Product names, brand names and trademarks mentioned on the
        Site (for example, vehicle and accessory manufacturers) belong to their respective owners. Their use does not imply
        any affiliation with or endorsement by them.
      </p>

      <h2>4. Product information, prices and availability</h2>
      <p>
        We try to keep product details accurate, but specifications, fitment, prices and availability can change at any
        time and may differ from what is shown on the Site.{" "}
        <strong>
          Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price
          and availability information displayed on Amazon at the time of purchase will apply to the purchase of the product.
        </strong>
      </p>
      <p>
        Always confirm details — especially fitment for your truck&apos;s make, model, year, cab and bed length — on the
        retailer&apos;s or manufacturer&apos;s page before you buy. See our <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>5. Affiliate links</h2>
      <p>
        Some links on the Site are affiliate links, and we may earn a commission if you make a purchase through them, at no
        extra cost to you. Learn more in our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
      </p>

      <h2>6. Third-party websites</h2>
      <p>
        The Site links to websites we do not own or control. We are not responsible for their content, products, services,
        policies or practices. Any purchase, warranty claim or return is between you and the seller or manufacturer.
      </p>

      <h2>7. No professional advice</h2>
      <p>
        Content on the Site is for general information only and is not professional automotive, mechanical, legal or
        safety advice. You are responsible for how you choose, install and use any product.
      </p>

      <h2>8. Messages you send us</h2>
      <p>
        If you send us feedback, suggestions or other messages, you grant us permission to use them to improve the Site
        without any obligation to you. Please do not send confidential or sensitive information through the contact form.
      </p>

      <h2>9. Disclaimer of warranties</h2>
      <p>
        THE SITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY
        KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY AND
        NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE OR FREE OF HARMFUL COMPONENTS.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, {BUSINESS_NAME.toUpperCase()} WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA OR USE, ARISING FROM YOUR USE
        OF THE SITE OR ANY PRODUCT YOU LEARN ABOUT OR BUY THROUGH IT. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SITE
        WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US$100). Some jurisdictions do not allow certain limitations, so some of
        the above may not apply to you.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {BUSINESS_NAME} from any claims, losses or expenses (including reasonable
        attorneys&apos; fees) arising from your violation of these Terms or your misuse of the Site.
      </p>

      <h2>12. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the United States of America and the applicable laws of the state in which{" "}
        {BUSINESS_NAME} operates, without regard to conflict-of-law principles. Any dispute arising from these Terms or the
        Site will be resolved exclusively in the state or federal courts located in the United States, and you consent to
        their jurisdiction. Before filing a claim, you agree to first contact us at {email} and try to resolve the dispute
        informally for at least 30 days.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &quot;Last updated&quot; date above shows when they last changed.
        Continuing to use the Site after changes take effect means you accept the updated Terms.
      </p>

      <h2>14. Contact us</h2>
      <p>
        {BUSINESS_NAME}
        <br />
        Email: {email}
      </p>
    </LegalPage>
  );
}
