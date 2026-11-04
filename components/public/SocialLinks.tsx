import { Mail } from "lucide-react";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";
import BrandIcon from "./BrandIcon";

const iconLinkClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-primary";

/** Round icon links: the site's social profiles, then email (dark footer styling). */
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map(({ network, label, href }) => (
        <li key={network}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={`TruckBedFit on ${label}`}
            title={label}
            className={iconLinkClass}
          >
            <BrandIcon brand={network} />
          </a>
        </li>
      ))}
      <li>
        <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email ${CONTACT_EMAIL}`} title={CONTACT_EMAIL} className={iconLinkClass}>
          <Mail size={16} aria-hidden="true" />
        </a>
      </li>
    </ul>
  );
}
