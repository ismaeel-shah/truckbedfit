import type { ReactNode } from "react";

/**
 * Card shell for a dashboard chart: title, optional subtitle, the chart, and a collapsible table
 * with the same numbers (so no value is only reachable by hovering).
 */
export default function ChartCard({ title, subtitle, children, table, empty, className = "" }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Rows for the "Show as table" view: [label, value] */
  table?: { columns: [string, string]; rows: [string, string | number][] };
  /** Replaces the chart when there's nothing to plot yet */
  empty?: string | null;
  className?: string;
}) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <header className="mb-4">
        <h2 className="font-heading text-lg font-bold text-primary dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </header>

      {empty ? (
        <p className="flex flex-1 items-center justify-center rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400 dark:bg-slate-900/40">
          {empty}
        </p>
      ) : (
        <div className="flex-1">{children}</div>
      )}

      {table && !empty && (
        <details className="group mt-4 border-t border-slate-100 pt-3 dark:border-slate-700/60">
          <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 hover:text-accent dark:text-slate-400">
            Show as table
          </summary>
          <div className="mt-2 max-h-64 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400">
                <tr>
                  <th scope="col" className="py-1.5 pr-4 font-medium">{table.columns[0]}</th>
                  <th scope="col" className="py-1.5 text-right font-medium">{table.columns[1]}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-slate-600 dark:text-slate-300">
                {table.rows.map(([label, value], i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700/60">
                    <td className="py-1.5 pr-4">{label}</td>
                    <td className="py-1.5 text-right">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
