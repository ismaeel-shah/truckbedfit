"use client";

import { Plus, Trash2 } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

const fieldClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent";

/** FAQ tab shared by posts and hub pages: question/answer pairs, shown at the end of the page and as FAQPage JSON-LD. */
export default function FaqEditor({ faqs, onChange, intro }: {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
  /** Hint at the top of the tab */
  intro?: string;
}) {
  const update = (i: number, field: keyof FaqItem, value: string) =>
    onChange(faqs.map((faq, idx) => (idx === i ? { ...faq, [field]: value } : faq)));

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        {intro ?? "FAQs appear at the end of the article and as FAQ rich results in Google."}
      </p>
      {faqs.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">
          No FAQs yet. Click &quot;Add FAQ&quot; to add your first question.
        </div>
      )}

      {faqs.map((faq, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary dark:text-white">FAQ {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(faqs.filter((_, idx) => idx !== i))}
              aria-label={`Remove FAQ ${i + 1}`}
              className="text-red-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => update(i, "question", e.target.value)}
              placeholder="e.g. Will this tonneau cover fit a 5.5 ft bed?"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
            <textarea
              rows={3}
              value={faq.answer}
              onChange={(e) => update(i, "answer", e.target.value)}
              placeholder="Write a detailed answer…"
              className={`${fieldClass} resize-none`}
            />
          </div>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...faqs, { question: "", answer: "" }])} className="btn-secondary flex items-center gap-2 text-sm">
        <Plus size={16} /> Add FAQ
      </button>
    </div>
  );
}
