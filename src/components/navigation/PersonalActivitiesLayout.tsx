import { Outlet, useLocation } from "react-router-dom";
import { Ticket, Telescope, FilePenLine } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { personalActivityItems } from "./personal-activities";

const icons = [Ticket, Telescope, FilePenLine];

/** Existing URLs and page workflows survive the navigation consolidation. */
export function PersonalActivitiesLayout() {
  const { pathname } = useLocation();
  const { label } = useLocale();
  return (
    <>
      <nav
        className="involvement-navigation personal-activity-navigation"
        aria-label={label("myActivities")}
      >
        {personalActivityItems.map((item, index) => {
          const Icon = icons[index];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <AppLink
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label(item.label)}</span>
            </AppLink>
          );
        })}
      </nav>
      <Outlet />
    </>
  );
}
