import type { Truck } from "@/data/trucks";

/**
 * Bed sizes from data/trucks.ts. Unverified lengths are shown as "Not verified yet",
 * never estimated. `showTruck` adds a truck column when several trucks share one table.
 */
export default function BedSizeTable({ trucks, showTruck = false }: { trucks: Truck[]; showTruck?: boolean }) {
  const rows = trucks.flatMap((truck) =>
    truck.generations.flatMap((gen) => gen.beds.map((bed) => ({ truck, years: gen.years, bed })))
  );

  if (!rows.length) {
    return <p className="text-sm text-slate-500">Verified bed sizes for this truck are coming soon.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border-2 border-slate-200">
      <table className="w-full min-w-[22rem] text-left text-sm">
        <thead className="bg-primary text-white">
          <tr>
            {showTruck && <th scope="col" className="px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider">Truck</th>}
            <th scope="col" className="px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider">Model years</th>
            <th scope="col" className="px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider">Bed</th>
            <th scope="col" className="px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider">Inside length</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map(({ truck, years, bed }) => (
            <tr key={`${truck.slug}-${years}-${bed.label}`}>
              {showTruck && <td className="px-4 py-3 font-semibold text-primary">{truck.name}</td>}
              <td className="px-4 py-3 text-slate-600">{years}</td>
              <td className="px-4 py-3 font-semibold text-primary">{bed.label}</td>
              <td className="px-4 py-3 text-slate-600">
                {bed.insideLengthIn !== null ? `${bed.insideLengthIn} in` : <span className="text-slate-400">Not verified yet</span>}
                {bed.notes && <span className="ml-2 text-xs text-slate-400">({bed.notes})</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
