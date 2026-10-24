import { isPersonalActivityPath } from "./personal-activities";
import { NavigationSelection } from "./NavigationSelection";

import { NotebookFittings } from "./NotebookFittings";
import { RailBrand, RailSettings, RailProfile } from "./RailFurniture";
import { SidebarToggle } from "./SidebarToggle";
import { useLocation } from "react-router-dom";
import { ShieldCheck, ArrowUpRight, Layers2 } from "lucide-react";
import { personalNavigationItems } from "./personal-navigation-items";
import { PhoneNavigation } from "./PhoneNavigation";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { NavigationHint } from "./NavigationHint";

import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";
import { useAccess } from "../../admin/governance/useGovernance";
import { MorphIcon } from "../ui/MorphIcon";
export function PersonalNavigation() {
  const { label } = useLocale();
  const { pathname } = useLocation();
  const access = useAccess();
  const canOpenAdmin =
    access.data?.capabilities.includes("admin.access") ?? false;
  const { scrollArea, scrollCues } = useNavigationScrollCues(pathname);
  const active = (href: string) =>
    href === "/my/focus"
      ? pathname === href ||
        pathname === "/my/study" ||
        pathname.startsWith("/my/study/")
      : href === "/my/learning"
        ? pathname === "/my/progress" ||
          pathname === href ||
          pathname.startsWith(href + "/")
        : href === "/my/activities"
          ? isPersonalActivityPath(pathname)
          : href === "/my"
            ? pathname === "/my"
            : pathname === href || pathname.startsWith(href + "/");
  return (
    <>
      <RailBrand title={label("my")} caption={label("ownCorner")} />
      <aside
        className="desktop-navigation personal-navigation"
        aria-label={label("personalNavigation")}
      >
        <NotebookFittings axis="rail" />
        <SidebarToggle controls="personal-sidebar-links" />
        <div
          className="navigation-scroll-frame"
          data-scroll-before={scrollCues.before || undefined}
          data-scroll-after={scrollCues.after || undefined}
        >
          <div
            ref={scrollArea}
            className="navigation-scroll"
            id="personal-sidebar-links"
          >
            <NavigationSelection />
            <p className="navigation-label">{label("workspace")}</p>
            <nav
              className="navigation-primary"
              aria-label={label("personalNavigation")}
            >
              {personalNavigationItems.map(
                ({ href, label: key, icon: Icon }) => (
                  <NavigationHint label={label(key)} key={href}>
                    <AppLink
                      href={href}
                      data-library-destination={
                        href === "/my/library" ? "" : undefined
                      }
                      className={`navigation-item ${active(href) ? "active" : ""}`}
                      aria-current={active(href) ? "page" : undefined}
                    >
                      <MorphIcon
                        icon={Icon}
                        to={href === "/my/activities" ? Layers2 : undefined}
                        size={20}
                      />
                      <span>{label(key)}</span>
                    </AppLink>
                  </NavigationHint>
                ),
              )}
            </nav>
          </div>
        </div>
        <div className="personal-nav-footer rail-footer">
          <RailSettings />
          {canOpenAdmin && (
            <NavigationHint label={label("governancePortalTitle")}>
              <AppLink
                href="/admin"
                className="personal-admin-portal control-room-portal space-portal-link"
                aria-label={label("governancePortalTitle")}
              >
                <MorphIcon
                  icon={ShieldCheck}
                  size={19}
                  className="personal-admin-portal-icon"
                />
                <span className="control-room-copy">
                  <small>{label("governancePriority")}</small>
                  <strong>{label("governancePortalTitle")}</strong>
                </span>
                <ArrowUpRight
                  size={16}
                  className="directional"
                  aria-hidden="true"
                />
              </AppLink>
            </NavigationHint>
          )}
          <RailProfile />
        </div>
      </aside>
      <PhoneNavigation personal />
    </>
  );
}
