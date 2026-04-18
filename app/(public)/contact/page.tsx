"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <Mail size={40} className="text-accent mx-auto mb-4" />
        <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-2">
          Contact Us
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Questions, partnerships, or product review requests? We&apos;d love to hear
          from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Message
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Sending…" : <><Send size={16} /> Send Message</>}
        </button>
      </form>
    </div>
  );
}
