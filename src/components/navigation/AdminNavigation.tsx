import { NavigationSelection } from "./NavigationSelection";
import { NotebookFittings } from "./NotebookFittings";
import { FileSearch, FileCheck, BadgeCheck, ShieldPlus } from "lucide-react";
import { NavigationControls } from "./AdaptiveNavigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ChartNoAxesCombined,
  FileClock,
  Fingerprint,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  FileQuestion,
  Menu,
  PanelsTopLeft,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  useAccess,
  useAccessRequests,
} from "../../admin/governance/useGovernance";
import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";
import type { MessageKey } from "../../constants/messages";
import type { Capability } from "../../types/governance";
import { Modal } from "../ui/Modal";
import { AppLink } from "./AppLink";
import { AppearanceSettings } from "./AppearanceSettings";
import { NavigationHint } from "./NavigationHint";
import { SidebarToggle } from "./SidebarToggle";
import { MorphIcon } from "../ui/MorphIcon";

type NavItem = {
  href: string;
  label: MessageKey;
  icon: typeof LayoutDashboard;
  capability: Capability;
  priority?: boolean;
  badge?: boolean;
};
const operations: NavItem[] = [
  {
    href: "/admin",
    label: "adminOverview",
    icon: LayoutDashboard,
    capability: "admin.access",
  },
  {
    href: "/admin/content",
    label: "adminContent",
    icon: FileSearch,
    capability: "content.review",
  },
  { href: "/admin/exams", label: "exams", icon: FileQuestion, capability: "content.review" },
  {
    href: "/admin/builder",
    label: "builderNavigation",
    icon: PanelsTopLeft,
    capability: "builder.manage",
  },
];
const insights: NavItem[] = [
  {
    href: "/admin/analytics",
    label: "adminAnalytics",
    icon: ChartNoAxesCombined,
    capability: "activity.view",
  },
  {
    href: "/admin/content-health",
    label: "adminContentHealth",
    icon: HeartPulse,
    capability: "content.review",
  },
];
const safety: NavItem[] = [
  {
    href: "/admin/governance",
    label: "governanceNavigation",
    icon: Fingerprint,
    capability: "admin.access",
    priority: true,
  },
  {
    href: "/admin/users",
    label: "governanceUsers",
    icon: UsersRound,
    capability: "users.view",
  },
  {
    href: "/admin/roles",
    label: "governanceRoles",
    icon: KeyRound,
    capability: "roles.manage",
  },
  {
    href: "/admin/approvals",
    label: "governanceApprovals",
    icon: ShieldPlus,
    capability: "governance.approve",
    badge: true,
  },
  {
    href: "/admin/activity",
    label: "adminActivity",
    icon: Activity,
    capability: "activity.view",
  },
  {
    href: "/admin/versions",
    label: "adminVersions",
    icon: FileClock,
    capability: "versions.restore",
  },
];

export function AdminNavigation() {
  const { label } = useLocale();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const access = useAccess();
  const requests = useAccessRequests();
  const pending =
    requests.data?.filter((request) => request.status === "pending").length ||
    0;
  const { scrollArea, scrollCues } = useNavigationScrollCues(pathname);
  useEffect(() => setMoreOpen(false), [pathname]);
  const active = (href: string) =>
    href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const navItem = ({
    href,
    label: key,
    icon: Icon,
    priority,
    badge,
  }: NavItem) => (
    <NavigationHint label={label(key)} key={href}>
      <AppLink
        href={href}
        className={`navigation-item ${priority ? "admin-priority-item" : ""} ${active(href) ? "active" : ""}`}
        aria-current={active(href) ? "page" : undefined}
      >
        <MorphIcon
          to={
            Icon === FileSearch
              ? FileCheck
              : Icon === ShieldPlus
                ? BadgeCheck
                : undefined
          }
          icon={Icon}
          size={20}
          className="admin-nav-icon"
        />
        <span className="navigation-item-label">{label(key)}</span>
        {badge && pending > 0 && (
          <b
            className="admin-nav-badge"
            aria-label={`${pending} ${label("governancePending")}`}
          >
            {pending}
          </b>
        )}
      </AppLink>
    </NavigationHint>
  );
  const allowed = (item: NavItem) =>
    access.data?.capabilities.includes(item.capability) ?? false;
  const visibleOperations = operations.filter(allowed);
  const visibleInsights = insights.filter(allowed);
  const visibleSafety = safety.filter(allowed);
  const phonePrimary = [
    ...visibleOperations.slice(0, 3),
    ...visibleSafety.filter((item) => item.priority),
  ].slice(0, 4);
  const phoneMore = [
    ...visibleInsights,
    ...visibleSafety.filter((item) => !item.priority),
    ...visibleOperations.slice(3),
  ];
  return (
    <>
      <aside
        className="desktop-navigation admin-navigation"
        aria-label={label("adminNavigation")}
      >
        <NotebookFittings axis="rail" />
        <div className="shell-brand">
          <SidebarToggle controls="admin-sidebar-links" />
          <span className="shell-brand-caption">
            <strong>{label("admin")}</strong>
            <small>{label("adminControlRoom")}</small>
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
            id="admin-sidebar-links"
          >
            <NavigationSelection />
            <nav
              className="navigation-primary"
              aria-label={label("adminNavigation")}
            >
              <p className="navigation-label">
                {label("governanceOperationsGroup")}
              </p>
              {visibleOperations.map(navItem)}
              <p className="navigation-label admin-insights-label">
                {label("adminInsightsGroup")}
              </p>
              {visibleInsights.map(navItem)}
              <p className="navigation-label admin-safety-label">
                {label("governanceSafetyGroup")}
              </p>
              {visibleSafety.map(navItem)}
            </nav>
          </div>
        </div>
        <div className="admin-nav-footer">
          <AppearanceSettings />
          <div className="navigation-version navigation-controls-row">
            <span className="navigation-status-copy"><span className="status-dot" />{label("insightsPreviewShort")}</span>
            <div className="navigation-controls-slot"><NavigationControls /></div>
          </div>
        </div>
      </aside>
      <nav
        className="phone-navigation admin-phone-navigation"
        aria-label={label("adminMobileNavigation")}
      >
        <NavigationSelection />
        {phonePrimary.map(({ href, label: key, icon: Icon }) => (
          <AppLink
            href={href}
            key={href}
            className={active(href) ? "active" : ""}
            aria-current={active(href) ? "page" : undefined}
            aria-label={label(key)}
          >
            <MorphIcon
              to={
                Icon === FileSearch
                  ? FileCheck
                  : Icon === ShieldPlus
                    ? BadgeCheck
                    : undefined
              }
              icon={Icon}
              size={20}
              className="admin-nav-icon"
            />
            <span className="dock-caption">{label(key)}</span>
          </AppLink>
        ))}
        <button
          type="button"
          className={`navigation-more-button ${phoneMore.some((item) => active(item.href)) ? "active" : ""}`}
          aria-label={label("governanceMobileMore")}
          onClick={() => setMoreOpen(true)}
        >
          <Menu size={20} aria-hidden="true" />
          <span className="dock-caption">{label("more")}</span>
          {pending > 0 && <b>{pending}</b>}
        </button>
      </nav>
      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={label("governanceMobileMore")}
        description={label("governanceMobileMoreBody")}
        className="admin-mobile-menu-modal"
      >
        <nav
          className="admin-mobile-more-links"
          aria-label={label("adminNavigation")}
        >
          {phoneMore.map(({ href, label: key, icon: Icon, badge }) => (
            <AppLink
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              aria-current={active(href) ? "page" : undefined}
            >
              <MorphIcon
                to={
                  Icon === FileSearch
                    ? FileCheck
                    : Icon === ShieldPlus
                      ? BadgeCheck
                      : undefined
                }
                icon={Icon}
                size={21}
                className="admin-nav-icon"
              />
              <span>{label(key)}</span>
              {badge && pending > 0 && <b>{pending}</b>}
            </AppLink>
          ))}
          <AppLink
            className="admin-mobile-exit"
            href="/my/profile"
            onClick={() => setMoreOpen(false)}
          >
            {label("governanceBackPersonal")}
          </AppLink>
          <AppLink
            className="admin-mobile-exit"
            href="/"
            onClick={() => setMoreOpen(false)}
          >
            {label("adminBackHome")}
          </AppLink>
        </nav>
        <div className="mobile-more-appearance">
          <AppearanceSettings />
        </div>
      </Modal>
    </>
  );
}
