import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { truckPath } from "@/lib/urls";
import { truckYears, type Truck } from "@/data/trucks";

/** Homepage "pick your truck" grid — links to each live truck hub. */
export default function TruckPicker({ trucks }: { trucks: { truck: Truck; count: number }[] }) {
  if (!trucks.length) return null;
  return (
    <section id="truck-picker" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title="Pick your truck" eyebrow="Gear that fits your bed" href="/trucks" />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {trucks.map(({ truck }) => (
          <li key={truck.slug}>
            <Link
              href={truckPath(truck.slug)}
              className="group flex h-full items-center justify-between gap-3 rounded-md border-2 border-slate-200 bg-white p-4 transition-colors hover:border-accent"
            >
              <span className="min-w-0">
                <span className="block font-heading text-lg font-bold uppercase leading-tight text-primary group-hover:text-accent">
                  {truck.name}
                </span>
                {truckYears(truck) && <span className="text-xs text-slate-500">{truckYears(truck)}</span>}
              </span>
              <ArrowRight size={16} className="shrink-0 text-slate-400 group-hover:text-accent" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
