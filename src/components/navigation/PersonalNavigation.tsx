import { useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { StudentProfile } from "../../types/student";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";
import { NavigationHint } from "./NavigationHint";
import { SidebarToggle } from "./SidebarToggle";
const items = [
  { href: "/my", label: "mySpace", icon: House },
  { href: "/my/learning", label: "myLearning", icon: BookOpen },
  { href: "/my/library", label: "libraryShort", icon: Bookmark },
  { href: "/my/calendar", label: "calendar", icon: CalendarDays },
  { href: "/my/notifications", label: "notifications", icon: Bell },
  { href: "/my/events", label: "myEvents", icon: CalendarCheck },
  { href: "/my/opportunities", label: "myOpportunities", icon: Telescope },
  { href: "/my/mentorship", label: "myMentorship", icon: HeartHandshake },
  { href: "/my/contributions", label: "myContributions", icon: FileCheck2 },
  { href: "/my/orders", label: "myOrders", icon: PackageCheck },
  { href: "/my/focus", label: "myFocus", icon: Timer },
  { href: "/my/profile", label: "myProfile", icon: UserRound },
  { href: "/my/settings", label: "personalSettings", icon: SlidersHorizontal },
] satisfies { href: string; label: MessageKey; icon: typeof House }[];
export function PersonalNavigation({ profile }: { profile?: StudentProfile }) {
  const { label, t } = useLocale();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const scrollArea = useRef<HTMLDivElement>(null);
  const [scrollCues, setScrollCues] = useState({ before: false, after: false });
  const updateScrollCues = useCallback(() => {
    const node = scrollArea.current;
    if (!node) return;
    const horizontal = node.scrollWidth > node.clientWidth + 2;
    const position = horizontal ? Math.abs(node.scrollLeft) : node.scrollTop;
    const maximum = horizontal
      ? node.scrollWidth - node.clientWidth
      : node.scrollHeight - node.clientHeight;
    setScrollCues({
      before: position > 2,
      after: maximum - position > 2,
    });
  }, []);
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    const node = scrollArea.current;
    if (!node) return;
    const refresh = () => requestAnimationFrame(updateScrollCues);
    refresh();
    node.addEventListener("scroll", updateScrollCues, { passive: true });
    window.addEventListener("resize", refresh);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refresh);
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);
    return () => {
      node.removeEventListener("scroll", updateScrollCues);
      window.removeEventListener("resize", refresh);
      observer?.disconnect();
    };
  }, [pathname, updateScrollCues]);
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
        <SidebarToggle controls="personal-sidebar-links" />
        <AppLink href="/my" className="personal-brand" aria-label={label("my")}>
          <span className="personal-brand-mark">
            <Sparkles size={23} />
          </span>
          <span>
            <strong>{label("my")}</strong>
            <small>{label("ownCorner")}</small>
          </span>
        </AppLink>
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
                    className={`navigation-item ${active(href) ? "active" : ""}`}
                    aria-current={active(href) ? "page" : undefined}
                  >
                    <Icon size={20} />
                    <span>{label(key)}</span>
                  </AppLink>
                </NavigationHint>
              ))}
            </nav>
          </div>
        </div>
        <div className="personal-sidebar-footer">
          <span className="personal-mini-avatar" aria-hidden="true">
            {profile ? t(profile.initials) : <UserRound size={20} />}
          </span>
          <div>
            <strong>{profile ? t(profile.name) : label("myProfile")}</strong>
            <span>{label("sampleProfile")}</span>
          </div>
        </div>
      </aside>
      <nav
        className="phone-navigation personal-phone-navigation"
        aria-label={label("personalMobileNavigation")}
      >
        {items.slice(0, 4).map(({ href, label: key, icon: Icon }) => (
          <AppLink
            href={href}
            key={href}
            className={active(href) ? "active" : ""}
            aria-current={active(href) ? "page" : undefined}
          >
            <Icon size={21} />
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
          className={
            items.slice(4).some((item) => active(item.href)) ? "active" : ""
          }
          aria-current={
            items.slice(4).some((item) => active(item.href))
              ? "page"
              : undefined
          }
          aria-label={label("more")}
          onClick={() => setMoreOpen(true)}
        >
          <Menu size={21} />
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
          {items.slice(4).map(({ href, label: key, icon: Icon }) => (
            <AppLink
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              aria-current={active(href) ? "page" : undefined}
            >
              <Icon size={21} />
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
