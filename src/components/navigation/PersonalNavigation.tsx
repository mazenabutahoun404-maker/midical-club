import { NotebookFittings } from "./NotebookFittings";
import { NavigationControls } from "./AdaptiveNavigation";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  House,
  BookOpen,
  Bookmark,
  Timer,
  UserRound,
  SlidersHorizontal,
  Sparkles,
  CalendarDays,
  Bell,
  Menu,
  CalendarCheck,
  Telescope,
  HeartHandshake,
  FileCheck2,
  PackageCheck,
  ClipboardList,
  ContactRound,
  ShieldCheck,
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { StudentProfile } from "../../types/student";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";
import { NavigationHint } from "./NavigationHint";
import { SidebarToggle } from "./SidebarToggle";
import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";
import { useAuth } from "../../app/providers/AuthProvider";
import { useAccess } from "../../admin/governance/useGovernance";
import { MorphIcon } from "../ui/MorphIcon";
const items = [
  { href: "/my", label: "mySpace", icon: House },
  { href: "/my/learning", label: "myLearning", icon: BookOpen },
  { href: "/my/progress", label: "myProgress", icon: ChartNoAxesCombined },
  { href: "/my/library", label: "libraryShort", icon: Bookmark },
  { href: "/my/calendar", label: "calendar", icon: CalendarDays },
  { href: "/my/notifications", label: "notifications", icon: Bell },
  { href: "/my/events", label: "myEvents", icon: CalendarCheck },
  { href: "/my/opportunities", label: "myOpportunities", icon: Telescope },
  { href: "/my/mentorship", label: "myMentorship", icon: HeartHandshake },
  { href: "/my/contributions", label: "myContributions", icon: FileCheck2 },
  { href: "/my/orders", label: "myOrders", icon: PackageCheck },
  { href: "/my/applications", label: "myApplications", icon: ClipboardList },
  { href: "/my/team", label: "teamProfile", icon: ContactRound },
  { href: "/my/focus", label: "myFocus", icon: Timer },
  { href: "/my/profile", label: "myProfile", icon: UserRound },
  { href: "/my/settings", label: "personalSettings", icon: SlidersHorizontal },
] satisfies { href: string; label: MessageKey; icon: typeof House }[];
const phonePrimaryHrefs = new Set([
  "/my",
  "/my/learning",
  "/my/library",
  "/my/calendar",
]);
export function PersonalNavigation({ profile }: { profile?: StudentProfile }) {
  const { label, t } = useLocale();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const auth = useAuth();
  const access = useAccess();
  const canOpenAdmin =
    access.data?.capabilities.includes("admin.access") ?? false;
  const phonePrimary = items.filter((item) => phonePrimaryHrefs.has(item.href));
  const phoneMore = items.filter((item) => !phonePrimaryHrefs.has(item.href));
  const { scrollArea, scrollCues } = useNavigationScrollCues(pathname);
  useEffect(() => setMoreOpen(false), [pathname]);
  const active = (href: string) =>
    href === "/my"
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
                    <MorphIcon icon={Icon} size={20} />
                    <span>{label(key)}</span>
                  </AppLink>
                </NavigationHint>
              ))}
            </nav>
          </div>
        </div>
        {canOpenAdmin && (
          <NavigationHint label={label("governancePortalTitle")}>
            <AppLink href="/admin" className="personal-admin-portal">
              <MorphIcon
                icon={ShieldCheck}
                size={19}
                className="personal-admin-portal-icon"
              />
              <span>
                <small>{label("governancePriority")}</small>
                <strong>{label("governancePortalTitle")}</strong>
              </span>
              <ArrowUpRight size={16} className="directional" />
            </AppLink>
          </NavigationHint>
        )}
        <NavigationControls />
        <div className="personal-sidebar-footer">
          <span className="personal-mini-avatar" aria-hidden="true">
            {profile ? t(profile.initials) : <UserRound size={20} />}
          </span>
          <div>
            <strong>{profile ? t(profile.name) : label("myProfile")}</strong>
            <span>{auth.snapshot.user?.email || label("verifiedAccount")}</span>
          </div>
        </div>
      </aside>
      <nav
        className="phone-navigation personal-phone-navigation"
        aria-label={label("personalMobileNavigation")}
      >
        {phonePrimary.map(({ href, label: key, icon: Icon }) => (
          <AppLink
            href={href}
            data-library-destination={href === "/my/library" ? "" : undefined}
            key={href}
            className={active(href) ? "active" : ""}
            aria-current={active(href) ? "page" : undefined}
          >
            <MorphIcon icon={Icon} size={21} />
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
              className="personal-mobile-admin-portal"
              href="/admin"
              onClick={() => setMoreOpen(false)}
            >
              <MorphIcon icon={ShieldCheck} size={21} />
              <span>
                <small>{label("governancePriority")}</small>
                {label("governancePortalTitle")}
              </span>
              <ArrowUpRight size={17} className="directional" />
            </AppLink>
          )}
          {phoneMore.map(({ href, label: key, icon: Icon }) => (
            <AppLink
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              aria-current={active(href) ? "page" : undefined}
            >
              <MorphIcon icon={Icon} size={21} />
              {label(key)}
            </AppLink>
          ))}
          <AppLink href="/" onClick={() => setMoreOpen(false)}>
            {label("backToMedClub")}
          </AppLink>
        </nav>
      </Modal>
    </>
  );
}
