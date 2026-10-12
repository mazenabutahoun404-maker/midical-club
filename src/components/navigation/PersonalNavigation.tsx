import { isPersonalActivityPath } from "./personal-activities";
import { NavigationSelection } from "./NavigationSelection";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotebookFittings } from "./NotebookFittings";
import { NavigationControls } from "./AdaptiveNavigation";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  House,
  BookOpen,
  Bookmark,
  Timer,
  CalendarDays,
  Menu,
  HeartHandshake,
  PackageCheck,
  ClipboardList,
  ContactRound,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Layers2,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";
import { NavigationHint } from "./NavigationHint";
import { SidebarToggle } from "./SidebarToggle";
import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";
import { useAccess } from "../../admin/governance/useGovernance";
import { MorphIcon } from "../ui/MorphIcon";
const items = [
  { href: "/my", label: "mySpace", icon: House },
  { href: "/my/learning", label: "myLearning", icon: BookOpen },
  { href: "/my/library", label: "libraryShort", icon: Bookmark },
  { href: "/my/calendar", label: "calendar", icon: CalendarDays },
  { href: "/my/activities", label: "myActivities", icon: Layers },
  { href: "/my/mentorship", label: "myMentorship", icon: HeartHandshake },
  { href: "/my/orders", label: "myOrders", icon: PackageCheck },
  { href: "/my/applications", label: "myApplications", icon: ClipboardList },
  { href: "/my/team", label: "teamProfile", icon: ContactRound },
  { href: "/my/focus", label: "myFocus", icon: Timer },
] satisfies { href: string; label: MessageKey; icon: typeof House }[];
const phonePrimaryHrefs = new Set([
  "/my",
  "/my/learning",
  "/my/library",
  "/my/calendar",
]);
export function PersonalNavigation() {
  const { label } = useLocale();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const access = useAccess();
  const canOpenAdmin =
    access.data?.capabilities.includes("admin.access") ?? false;
  const phonePrimary = items.filter((item) => phonePrimaryHrefs.has(item.href));
  const phoneMore = items.filter((item) => !phonePrimaryHrefs.has(item.href));
  const { scrollArea, scrollCues } = useNavigationScrollCues(pathname);
  useEffect(() => setMoreOpen(false), [pathname]);
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
      <aside
        className="desktop-navigation personal-navigation"
        aria-label={label("personalNavigation")}
      >
        <NotebookFittings axis="rail" />
        <div className="shell-brand">
          <SidebarToggle controls="personal-sidebar-links" />
          <span className="shell-brand-caption">
            <strong>{label("my")}</strong>
            <small>{label("ownCorner")}</small>
          </span>
        </div>
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
              {items.map(({ href, label: key, icon: Icon }) => (
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
              ))}
            </nav>
          </div>
        </div>
        <div className="personal-nav-footer">
          <AppearanceSettings />
          <div className="navigation-version navigation-controls-row">
            <span className="navigation-status-copy"><span className="status-dot" />{label("previewShort")}</span>
            <div className="navigation-controls-slot"><NavigationControls /></div>
          </div>
        </div>
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
              <ArrowUpRight size={16} className="directional" aria-hidden="true" />
            </AppLink>
          </NavigationHint>
        )}
      </aside>
      <nav
        className="phone-navigation personal-phone-navigation"
        aria-label={label("personalMobileNavigation")}
      >
        <NavigationSelection />
        {phonePrimary.map(({ href, label: key, icon: Icon }) => (
          <AppLink
            href={href}
            data-library-destination={href === "/my/library" ? "" : undefined}
            key={href}
            className={active(href) ? "active" : ""}
            aria-current={active(href) ? "page" : undefined}
          >
            <MorphIcon
              icon={Icon}
              to={href === "/my/activities" ? Layers2 : undefined}
              size={21}
            />
            <span>
              {label(
                key === "mySpace"
                  ? "home"
                  : key === "myLearning"
                    ? "learn"
                    : key === "libraryShort"
                      ? "savedShort"
                      : "calendarShort",
              )}
            </span>
          </AppLink>
        ))}
        <button
          type="button"
          className={`navigation-more-button ${
            phoneMore.some((item) => active(item.href)) ? "active" : ""
          }`}
          aria-current={
            phoneMore.some((item) => active(item.href)) ? "page" : undefined
          }
          aria-label={label("more")}
          onClick={() => setMoreOpen(true)}
        >
          <Menu size={21} aria-hidden="true" />
          <span>{label("more")}</span>
        </button>
      </nav>
      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={label("my")}
        description={label("ownCorner")}
        className="personal-menu-modal"
      >
        <nav
          className="personal-more-links"
          aria-label={label("personalNavigation")}
        >
          {canOpenAdmin && (
            <AppLink
              className="personal-mobile-admin-portal control-room-portal space-portal-link"
              href="/admin"
              aria-label={label("governancePortalTitle")}
              onClick={() => setMoreOpen(false)}
            >
              <MorphIcon icon={ShieldCheck} size={21} />
              <span className="control-room-copy">
                <small>{label("governancePriority")}</small>
                <strong>{label("governancePortalTitle")}</strong>
              </span>
              <ArrowUpRight size={17} className="directional" aria-hidden="true" />
            </AppLink>
          )}
          {phoneMore.map(({ href, label: key, icon: Icon }) => (
            <AppLink
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              aria-current={active(href) ? "page" : undefined}
            >
              <MorphIcon
                icon={Icon}
                to={href === "/my/activities" ? Layers2 : undefined}
                size={21}
              />
              {label(key)}
            </AppLink>
          ))}
          <AppLink href="/" onClick={() => setMoreOpen(false)}>
            {label("backToMedClub")}
          </AppLink>
        </nav>
        <div className="personal-more-preferences">
          <AppearanceSettings />
        </div>
      </Modal>
    </>
  );
}
