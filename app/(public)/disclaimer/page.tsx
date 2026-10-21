import Link from "next/link";
import LegalPage from "@/components/public/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "Disclaimer",
  `${BUSINESS_NAME}'s guides are general information. Always verify fitment, installation and safety details for your truck.`,
  "/disclaimer"
);

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer">
      <p className="lead">
        Our reviews and buying guides are for general information only. Every truck is different — always confirm
        fitment and follow the manufacturer&apos;s instructions before you buy or install anything.
      </p>

      <h2>General information only</h2>
      <p>
        The content on {BUSINESS_NAME} is based on our research, product specifications, manufacturer information and
        experience. It is not professional automotive, mechanical, engineering, legal or safety advice, and it does not
        replace the guidance of the manufacturer or a qualified installer.
      </p>

      <h2>Fitment and compatibility</h2>
      <p>
        Whether an accessory fits depends on many details, including your truck&apos;s <strong>make, model, model year,
        trim, cab style and bed length</strong>, as well as factory options and accessories you already have installed
        (such as bed liners, rail or cargo-management systems, tool boxes or tailgate features). Manufacturers also change
        designs over time.
      </p>
      <p>
        Fitment notes on our site are a starting point, not a guarantee. <strong>Always verify compatibility with the
        product&apos;s manufacturer or seller before purchasing.</strong> {BUSINESS_NAME} is not responsible for products
        that do not fit, returns, restocking fees or related costs.
      </p>

      <h2>Installation and safety</h2>
      <ul>
        <li>Follow the manufacturer&apos;s installation instructions and torque specifications.</li>
        <li>Never exceed load ratings, your truck&apos;s payload capacity or its Gross Vehicle Weight Rating (GVWR).</li>
        <li>Secure cargo properly and check it before and during every trip.</li>
        <li>Some modifications may affect your vehicle or product warranty — check before installing.</li>
        <li>Follow local laws on cargo securement, lighting, visibility and vehicle modifications.</li>
        <li>If you are unsure, have a qualified professional install the product.</li>
      </ul>
      <p>
        You use, install and operate any product at your own risk. {BUSINESS_NAME} is not liable for any damage, injury
        or loss resulting from the selection, installation or use of products discussed on the site.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We work to keep our content accurate and up to date, but specifications, prices, availability and product
        details can change without notice, and errors can happen. We make no guarantees about the completeness or accuracy
        of any information on the site. If you spot a mistake, please let us know.
      </p>

      <h2>No endorsement by manufacturers</h2>
      <p>
        {BUSINESS_NAME} is an independent publication. We are not affiliated with, sponsored by or endorsed by any vehicle
        or accessory manufacturer mentioned on the site, unless we clearly say so. All trademarks belong to their
        respective owners.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some links on our site are affiliate links, which means we may earn a commission at no extra cost to you. See our{" "}
        <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for details.
      </p>

      <h2>External links</h2>
      <p>
        We link to third-party websites for your convenience. We do not control and are not responsible for their content,
        products or policies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer? Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
