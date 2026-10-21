import Link from "next/link";
import LegalPage from "@/components/public/LegalPage";
import { BUSINESS_NAME, CONTACT_EMAIL, SITE_DOMAIN } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "Privacy Policy",
  `How ${BUSINESS_NAME} collects, uses and protects your information, including cookies and affiliate links.`,
  "/privacy-policy"
);

export default function PrivacyPolicyPage() {
  const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage title="Privacy Policy" path="/privacy-policy">
      <p>
        This Privacy Policy explains how {BUSINESS_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects,
        uses and shares information when you visit {SITE_DOMAIN} (the &quot;Site&quot;). By using the Site, you agree
        to the practices described here. If you do not agree, please do not use the Site.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you give us</h3>
      <p>
        When you use our contact form, we receive the <strong>name, email address and message</strong> you submit.
        This is delivered to us by email so we can reply. We do not save contact-form messages in a database on the Site.
      </p>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Technical data.</strong> Like most websites, our hosting and security provider processes technical
          information such as your IP address, browser type, device information, referring page and the pages you request.
          This is used to deliver the Site, keep it secure and prevent abuse.
        </li>
        <li>
          <strong>Article view counts.</strong> We keep a simple count of how many times each article is viewed so we know
          which guides are popular. This count is not linked to you and contains no personal information.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> currently use analytics services, advertising networks or tracking cookies on the Site.
        If that changes, we will update this policy before doing so.
      </p>

      <h2>2. How we use information</h2>
      <ul>
        <li>To respond to your questions and messages.</li>
        <li>To operate, maintain, secure and improve the Site.</li>
        <li>To understand which content is useful to readers (using aggregate view counts).</li>
        <li>To comply with legal obligations and enforce our <Link href="/terms">Terms &amp; Conditions</Link>.</li>
      </ul>

      <h2>3. Cookies and similar technologies</h2>
      <p>
        The Site itself does not set tracking or advertising cookies for visitors. The only cookies we set are strictly
        necessary cookies used when an authorized staff member signs in to the Site&apos;s admin area.
      </p>
      <p>
        <strong>
          Third parties, including Amazon and other advertisers, may place and read cookies on your browser, or use web
          beacons and similar technologies, to collect information when you visit the Site or click links to their sites.
        </strong>{" "}
        For example, when you click an Amazon link on the Site, Amazon may set a cookie so it can attribute any qualifying
        purchase to us. Product images on the Site may also be loaded from Amazon&apos;s servers. These third parties&apos;
        use of information is governed by their own privacy policies, such as the{" "}
        <a href="https://www.amazon.com/privacy" target="_blank" rel="noopener noreferrer">Amazon Privacy Notice</a>.
      </p>
      <p>
        Most browsers let you block or delete cookies in their settings. Blocking cookies will not prevent you from reading
        the Site.
      </p>

      <h2>4. How we share information</h2>
      <p>We share information only as needed to run the Site:</p>
      <ul>
        <li><strong>Hosting and security:</strong> Cloudflare, which hosts and protects the Site.</li>
        <li><strong>Email delivery:</strong> Resend, which delivers contact-form messages to our inbox.</li>
        <li><strong>Legal reasons:</strong> when required by law, or to protect the rights, property or safety of {BUSINESS_NAME}, our users or others.</li>
        <li><strong>Business transfers:</strong> if the Site is sold or transferred, information may be transferred as part of that transaction.</li>
      </ul>
      <p>
        <strong>We do not sell your personal information</strong>, and we do not &quot;share&quot; it for cross-context
        behavioral advertising as those terms are defined under U.S. state privacy laws.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep contact-form messages for as long as needed to respond and to keep a reasonable record of our
        correspondence, and then delete them. You can ask us to delete your messages at any time.
      </p>

      <h2>6. Your privacy rights</h2>
      <p>
        Depending on where you live — including California (CCPA/CPRA), Virginia, Colorado, Connecticut, Utah and other
        U.S. states with consumer privacy laws — you may have the right to:
      </p>
      <ul>
        <li>Know what personal information we have collected about you and how it is used.</li>
        <li>Request a copy of your personal information.</li>
        <li>Request that we correct or delete your personal information.</li>
        <li>Opt out of the sale or sharing of personal information (we do not sell or share it).</li>
        <li>Not be discriminated against for exercising these rights.</li>
      </ul>
      <p>
        To make a request, email us at {email}. We will verify your request using the email address you contacted us
        from and respond within 45 days. You may use an authorized agent to make a request on your behalf.
      </p>
      <p>
        <strong>Visitors outside the United States:</strong> the Site is operated from and hosted in the United States.
        If you contact us from another country, your information will be processed in the United States. You may contact
        us to access, correct or delete your information.
      </p>

      <h2>7. Do Not Track and Global Privacy Control</h2>
      <p>
        Because we do not track visitors across websites, &quot;Do Not Track&quot; browser signals do not change how the
        Site works. We treat a Global Privacy Control (GPC) signal as a request to opt out of any sale or sharing of
        personal information.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        The Site is intended for adults and is not directed to children under 13. We do not knowingly collect personal
        information from children under 13. If you believe a child has sent us personal information, contact us and we
        will delete it.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect information, including encrypted (HTTPS)
        connections. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
      </p>

      <h2>10. Links to other websites</h2>
      <p>
        The Site links to Amazon and other third-party websites. We are not responsible for their content or privacy
        practices. Please review their privacy policies before providing them with any information.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will change the &quot;Last updated&quot; date
        above. Material changes will be highlighted on this page.
      </p>

      <h2>12. Contact us</h2>
      <p>
        {BUSINESS_NAME}
        <br />
        Email: {email}
        <br />
        Website: <Link href="/">{SITE_DOMAIN}</Link>
      </p>
    </LegalPage>
  );
}
