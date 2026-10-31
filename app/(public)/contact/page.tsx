import PageHeader from "@/components/public/PageHeader";
import ContactForm from "@/components/public/ContactForm";
import { CONTACT_EMAIL } from "@/lib/site";

export default function ContactPage() {
  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        path="/contact"
        eyebrow="Get in touch"
        title="Contact me"
        lead="Questions about a guide, a fitment problem, or a product I should cover? I'd love to hear from you."
      />
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <ContactForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Prefer email? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">{CONTACT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}
