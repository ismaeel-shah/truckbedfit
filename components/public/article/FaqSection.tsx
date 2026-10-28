export interface Faq {
  question: string;
  answer: string;
}

/** Collapsible FAQ list from the post's FAQ fields (also emitted as FAQPage JSON-LD). */
export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="scroll-mt-24">
      <h2 className="font-heading text-2xl font-extrabold uppercase text-primary mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group card p-0 overflow-hidden">
            <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-primary text-sm select-none hover:text-accent transition-colors">
              {/* H3 for the outline; font-body keeps the question in the same text style */}
              <h3 className="font-body">{faq.question}</h3>
              <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" aria-hidden="true">▾</span>
            </summary>
            <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
