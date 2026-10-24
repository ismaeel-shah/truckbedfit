/**
 * The page's 40–60 word answer, right under the H1 — the spot Google most often lifts for a
 * featured snippet. Plain text from the post's "Short answer" field.
 */
export default function ShortAnswer({ text, className = "" }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return (
    <div className={`rounded-md border-l-4 border-accent bg-white px-5 py-4 shadow-sm ${className}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-accent">Short answer</p>
      <p className="mt-1.5 text-base leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
