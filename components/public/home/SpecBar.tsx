import { BadgeCheck, Ruler, Wrench } from "lucide-react";

const SPECS = [
  { icon: Ruler,      title: "Fitment first",  text: "Bed length, cab style and model year checked before we recommend." },
  { icon: Wrench,     title: "Real-world specs", text: "Materials, weight, install time and what the listing leaves out." },
  { icon: BadgeCheck, title: "Straight answers", text: "Clear pros and cons on every pick, without the fluff." },
];

export default function SpecBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
        {SPECS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary text-accent">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-heading text-xl font-bold uppercase leading-none text-primary">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
