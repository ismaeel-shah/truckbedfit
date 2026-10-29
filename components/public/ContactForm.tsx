"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent";

export default function ContactForm() {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  // After a successful send the form is replaced by a confirmation in the same card.
  const [sentTo, setSentTo]   = useState<string | null>(null);
  const [error, setError]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSentTo(form.email);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="card p-8 text-center sm:p-10" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={30} aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-extrabold uppercase text-primary">Message sent</h2>
        <p className="mx-auto mt-2 max-w-sm text-slate-600">
          Thanks for reaching out. We&apos;ll reply to <span className="font-semibold text-primary">{sentTo}</span> as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-6 text-sm font-semibold text-accent hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Your message couldn&apos;t be sent. Please try again in a moment.
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Sending…" : <><Send size={16} aria-hidden="true" /> Send Message</>}
      </button>
    </form>
  );
}
