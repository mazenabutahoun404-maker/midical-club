import { BadgePlus, ClipboardList, ContactRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes, signInPath } from "../../constants/routes";
import { AppLink } from "./AppLink";

export function RecruitmentNavigation() {
  const { label } = useLocale();
  const { pathname } = useLocation();
  const auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  const items = [
    {
      href: routes.recruitment,
      label: label("openPositions"),
      icon: BadgePlus,
      active: pathname.startsWith("/recruitment"),
    },
    {
      href: signedIn
        ? routes.myApplications
        : signInPath(routes.myApplications),
      label: label("myApplications"),
      icon: ClipboardList,
      active: pathname === routes.myApplications,
    },
    {
      href: signedIn ? routes.myTeam : signInPath(routes.myTeam),
      label: label("teamProfile"),
      icon: ContactRound,
      active: pathname === routes.myTeam,
    },
  ];
  return (
    <nav
      className="recruitment-navigation"
      aria-label={label("recruitmentNavigation")}
    >
      {items.map(({ href, label: itemLabel, icon: Icon, active }) => (
        <AppLink
          key={itemLabel}
          href={href}
          className={active ? "active" : ""}
          aria-current={active ? "page" : undefined}
        >
          <Icon aria-hidden="true" size={19} className="recruitment-nav-icon" />
          {itemLabel}
        </AppLink>
      ))}
    </nav>
  );
}
