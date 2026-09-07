import { BriefcaseBusiness, ClipboardList, ContactRound } from "lucide-react";
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
      icon: BriefcaseBusiness,
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
          <span className="recruitment-nav-icon" aria-hidden="true">
            <Icon size={19} />
            <i />
          </span>
          {itemLabel}
        </AppLink>
      ))}
    </nav>
  );
}
