import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
}

export default function StatsCard({ label, value, icon: Icon, color = "text-accent" }: StatsCardProps) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-700 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-primary dark:text-white">{value}</p>
      </div>
    </div>
  );
}
