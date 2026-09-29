import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Ticket, Telescope, FilePenLine } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import {
  involvementItems,
  involvedLabel,
  isInvolvementPath,
  lastInvolvementPath,
  rememberInvolvement,
} from "./involvement";
const icons = [Ticket, Telescope, FilePenLine];
export function InvolvementEntry() {
  return <Navigate to={lastInvolvementPath()} replace />;
}
export function InvolvementNavigation() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  useEffect(() => rememberInvolvement(pathname), [pathname]);
  if (!isInvolvementPath(pathname)) return null;
  return (
    <nav
      className="involvement-navigation container"
      aria-label={t(involvedLabel)}
    >
      {involvementItems.map((item, index) => {
        const Icon = icons[index];
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <AppLink
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "active" : ""}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{t(item.label)}</span>
          </AppLink>
        );
      })}
    </nav>
  );
}
