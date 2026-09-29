import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
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
  ChevronDown,
  Medal,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";

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

const isHonor = (href: string) =>
  href === routes.honorPlate || href === routes.hallOfHonor;

export function CommunityNavigation() {
  const { pathname } = useLocation();
  const { label, t, dir } = useLocale();
  const [honorsOpen, setHonorsOpen] = useState(false);
  useEffect(() => setHonorsOpen(false), [pathname]);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1150px)");
    const change = () => {
      if (!query.matches) setHonorsOpen(false);
    };
    query.addEventListener?.("change", change);
    return () => query.removeEventListener?.("change", change);
  }, []);
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
          className={`${active(href) ? "active" : ""} ${isHonor(href) ? "community-honor-standalone" : ""}`}
          aria-current={active(href) ? "page" : undefined}
        >
          <Icon aria-hidden="true" size={18} className="community-tab-icon" />
          <span>{label(key)}</span>
        </AppLink>
      ))}
      <div className="community-honors-menu">
        <DropdownMenu dir={dir} open={honorsOpen} onOpenChange={setHonorsOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`community-honors-trigger ${active(routes.honorPlate) || active(routes.hallOfHonor) ? "active" : ""}`}
              aria-label={t({ en: "Honors", ar: "التكريم" })}
            >
              <Medal size={18} aria-hidden="true" />
              <span>{t({ en: "Honors", ar: "التكريم" })}</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="community-honors-dropdown"
          >
            {items
              .filter((item) => isHonor(item.href))
              .map(({ href, label: key, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <AppLink
                    href={href}
                    aria-current={active(href) ? "page" : undefined}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{label(key)}</span>
                  </AppLink>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
