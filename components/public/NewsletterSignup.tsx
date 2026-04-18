"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterSignup() {
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("You're in! Check your inbox.");
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-hero-gradient text-white px-6 py-14 md:px-14 md:py-16 my-16">
      {/* BG decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="relative max-w-xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 mb-5">
          <Mail size={26} className="text-accent" />
        </div>

        <h3 className="font-heading text-3xl md:text-4xl font-bold mb-3">
          Get the Best Deals First
        </h3>
        <p className="text-slate-300 mb-8 leading-relaxed">
          Join <span className="text-accent font-semibold">5,000+</span> remote workers getting
          weekly home office guides and Amazon deal alerts — straight to your inbox.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 bg-accent/20 border border-accent/30 rounded-2xl px-6 py-4">
            <CheckCircle2 size={22} className="text-accent" />
            <p className="font-semibold">You&apos;re subscribed! Welcome aboard.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        )}

        <p className="text-xs text-slate-500 mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
