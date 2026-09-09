import { useLocation } from "react-router-dom";
import {
  Activity,
  Award,
  Camera,
  HeartPulse,
  Landmark,
  Newspaper,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";
import { MorphIcon } from "../ui/MorphIcon";

const items = [
  { href: routes.community, label: "communityHub", icon: HeartPulse },
  { href: routes.activities, label: "activities", icon: Activity },
  { href: routes.journal, label: "journal", icon: Newspaper },
  { href: routes.media, label: "media", icon: Camera },
  { href: routes.executiveBodies, label: "leadership", icon: ShieldCheck },
  { href: routes.honorPlate, label: "honorPlate", icon: Award },
  { href: routes.hallOfHonor, label: "hallOfHonor", icon: Landmark },
  { href: routes.about, label: "aboutMedClub", icon: Info },
] satisfies { href: string; label: MessageKey; icon: typeof Activity }[];

export function CommunityNavigation() {
  const { pathname } = useLocation();
  const { label } = useLocale();
  const active = (href: string) =>
    href === routes.community ? pathname === href : pathname.startsWith(href);
  return (
    <nav
      className="community-navigation"
      aria-label={label("communityNavigation")}
    >
      {items.map(({ href, label: key, icon: Icon }) => (
        <AppLink
          key={href}
          href={href}
          className={active(href) ? "active" : ""}
          aria-current={active(href) ? "page" : undefined}
        >
          <MorphIcon icon={Icon} size={18} className="community-tab-icon" />
          <span>{label(key)}</span>
        </AppLink>
      ))}
    </nav>
  );
}
