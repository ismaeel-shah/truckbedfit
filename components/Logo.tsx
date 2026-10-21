import clsx from "clsx";

interface LogoProps {
  /** Unique per page so multiple logos don't share an SVG gradient id */
  id: string;
  /** "light" = dark text for light backgrounds, "dark" = white text for dark backgrounds */
  tone?: "light" | "dark";
  size?: number;
  subtitle?: string;
}

export function LogoMark({ id, size = 38 }: { id: string; size?: number }) {
  const gradId = `logoGrad-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="38" rx="10" fill={`url(#${gradId})`} />
      {/* Bed */}
      <rect x="4" y="15.5" width="14" height="7" rx="1.2" fill="white" opacity="0.9" />
      <rect x="5.5" y="17" width="11" height="2" rx="1" fill="#1F2328" opacity="0.25" />
      {/* Cab + hood */}
      <path d="M18.5 22.5V12.5a2 2 0 0 1 2-2h5.2l3.6 5H32a2 2 0 0 1 2 2v5z" fill="white" />
      {/* Window */}
      <path d="M21 12.8h4l2.3 3.2H21z" fill="#1F2328" opacity="0.35" />
      {/* Chassis */}
      <rect x="3.5" y="21.5" width="31" height="3" rx="1.5" fill="white" />
      {/* Wheels */}
      <circle cx="10.5" cy="26" r="3.6" fill="#1F2328" stroke="white" strokeWidth="1.8" />
      <circle cx="10.5" cy="26" r="1.1" fill="white" />
      <circle cx="27.5" cy="26" r="3.6" fill="#1F2328" stroke="white" strokeWidth="1.8" />
      <circle cx="27.5" cy="26" r="1.1" fill="white" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1F2328" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ id, tone = "light", size = 38, subtitle = "Truck Bed Gear Guides" }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark id={id} size={size} />
      <span className="flex flex-col leading-none text-left">
        <span
          className={clsx(
            "font-heading font-bold tracking-tight",
            size >= 38 ? "text-[18px]" : "text-[16px]",
            tone === "dark" ? "text-white" : "text-primary"
          )}
        >
          TruckBed<span className="text-accent">Fit</span>
        </span>
        <span className="text-[9px] font-semibold text-slate-400 tracking-[0.2em] uppercase mt-0.5">
          {subtitle}
        </span>
      </span>
    </span>
  );
}
