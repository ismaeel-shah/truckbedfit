import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

/** Short "how we picked" note editors can drop into an article with [trustbox]. */
export default function TrustBox() {
  return (
    <aside className="not-prose my-8 flex gap-4 rounded-md border-l-4 border-accent bg-white p-5">
      <ClipboardCheck size={22} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-slate-700">
        <strong className="text-primary">How we picked:</strong> specs, fitment guides and owner reports. We don&apos;t
        test products ourselves.{" "}
        <Link href="/how-we-research" className="font-semibold text-accent hover:underline">
          How we research
        </Link>
      </p>
    </aside>
  );
}
