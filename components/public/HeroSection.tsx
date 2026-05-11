import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            #1 Home Office Resource
          </div>

          {/* Heading */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            Build Your{" "}
            <span className="relative inline-block">
              <span className="gradient-text">Dream</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9 C75 3, 150 3, 298 9" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
            {" "}Home Office
          </h1>

          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Expert reviews, in-depth buying guides, and honest recommendations for
            ergonomic chairs, standing desks, monitors, keyboards, and everything
            remote workers need.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog" className="btn-primary text-base !px-8 !py-3.5 shadow-accent animate-pulse-glow">
              Explore All Guides <ArrowRight size={18} />
            </Link>
            <Link
              href="/category/ergonomic-chairs"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold text-base"
            >
              🪑 Best Chairs
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background dark:from-[#0D1520] to-transparent" />
    </section>
  );
}
