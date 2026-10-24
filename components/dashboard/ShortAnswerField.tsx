"use client";

import { SHORT_ANSWER_WORDS, wordCount } from "@/lib/utils/seo";

const fieldClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent";

/** The 40–60 word answer shown in a box right under the H1 (featured-snippet spot), with a word counter. */
export default function ShortAnswerField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const words = wordCount(value);
  const inRange = words >= SHORT_ANSWER_WORDS.min && words <= SHORT_ANSWER_WORDS.max;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Short answer <span className="font-normal text-slate-400">(shown in a box under the H1)</span>
        </label>
        <span className={`text-xs font-medium ${!words ? "text-slate-400" : inRange ? "text-green-600" : "text-amber-600"}`}>
          {words} / {SHORT_ANSWER_WORDS.min}–{SHORT_ANSWER_WORDS.max} words
        </span>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Answer the reader's question directly in 40–60 words: the best pick or the key fact first, then what to check."
        className={`${fieldClass} resize-y`}
      />
    </div>
  );
}
