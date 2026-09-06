import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  House,
  BookOpen,
  Users,
  Sparkles,
  CalendarDays,
  ShoppingBag,
  ChevronDown,
  ArrowUpRight,
  UserRound,
  Timer,
  Heart,
  HeartHandshake,
  FileCheck2,
} from "lucide-react";
import { SidebarToggle } from "./SidebarToggle";
import { NavigationHint } from "./NavigationHint";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Brand } from "./Brand";
import { AppLink } from "./AppLink";
import { MegaMenu } from "./MegaMenu";
import { AppearanceSettings } from "./AppearanceSettings";
const icons = {
  community: Users,
  opportunities: Sparkles,
  events: CalendarDays,
  store: ShoppingBag,
  mentorship: HeartHandshake,
  contributions: FileCheck2,
};
export function DesktopNavigation({ site }: { site: SiteContent }) {
  const { label, t } = useLocale();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => setExpanded(false), [location.key]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const active = (href: string) =>
    href === "/"
      ? location.pathname === "/" && !location.hash
      : href.startsWith("/#")
        ? location.pathname === "/" && location.hash === href.slice(1)
        : location.pathname.startsWith(href);
  return (
    <aside
      className="desktop-navigation"
      ref={root}
      aria-label={label("mainNavigation")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          setExpanded(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setExpanded(false);
      }}
    >
      <SidebarToggle controls="public-sidebar-links" />
      <div className="navigation-brand">
        <Brand brand={site.brand} />
      </div>
      <div className="navigation-scroll" id="public-sidebar-links">
        <p className="navigation-label">{label("exploreLabel")}</p>
        <nav className="navigation-primary" aria-label={label("discover")}>
          <NavigationHint label={label("home")}>
            <AppLink
              href="/"
              className={`navigation-item ${active("/") ? "active" : ""}`}
              aria-current={active("/") ? "page" : undefined}
            >
              <House size={20} />
              <span>{label("home")}</span>
            </AppLink>
          </NavigationHint>
          <div className="learn-disclosure">
            <NavigationHint label={label("learn")}>
              <button
                ref={trigger}
                className={`navigation-item ${active("/learn") ? "active" : ""}`}
                aria-expanded={expanded}
                aria-controls="learn-menu"
                onClick={() => setExpanded((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setExpanded(true);
                    requestAnimationFrame(() =>
                      root.current
                        ?.querySelector<HTMLAnchorElement>("#learn-menu a")
                        ?.focus(),
                    );
                  }
                }}
              >
                <BookOpen size={20} />
                <span>{label("learn")}</span>
                <ChevronDown size={15} className="disclosure-chevron" />
              </button>
            </NavigationHint>
            {expanded && (
              <MegaMenu
                navigation={site.navigation}
                onNavigate={() => setExpanded(false)}
              />
            )}
          </div>
          {site.navigation.main.map((item) => {
            const Icon = icons[item.id as keyof typeof icons] || Sparkles;
            return (
              <NavigationHint label={t(item.label)} key={item.id}>
                <AppLink
                  href={item.href}
                  className={`navigation-item ${active(item.href) ? "active" : ""}`}
                  aria-current={
                    active(item.href)
                      ? item.href.startsWith("/#")
                        ? "location"
                        : "page"
                      : undefined
                  }
                >
                  <Icon size={20} />
                  <span>{t(item.label)}</span>
                </AppLink>
              </NavigationHint>
            );
          })}
        </nav>
        <div className="navigation-workspace">
          <p className="navigation-label">{label("workspace")}</p>
          <NavigationHint label={label("myProfile")}>
            <AppLink
              className={`navigation-item ${active("/my") ? "active" : ""}`}
              href="/my"
              aria-current={active("/my") ? "page" : undefined}
            >
              <UserRound size={20} />
              <span>{label("myProfile")}</span>
            </AppLink>
          </NavigationHint>
          <NavigationHint label={label("studyToolsShort")}>
            <AppLink
              className={`navigation-item ${active("/utilities") ? "active" : ""}`}
              href="/utilities"
              aria-current={active("/utilities") ? "page" : undefined}
            >
              <Timer size={20} />
              <span>{label("studyToolsShort")}</span>
            </AppLink>
          </NavigationHint>
        </div>
      </div>
      <div className="navigation-bottom">
        <div className="sidebar-note">
          <span className="sidebar-note-icon">
            <Heart size={19} />
          </span>
          <p>{t(site.hero.note)}</p>
          <AppLink href="/community">
            {label("findYourPeople")}
            <ArrowUpRight size={18} className="directional" />
          </AppLink>
        </div>
        <AppearanceSettings />
        <div className="navigation-version">
          <span className="status-dot" />
          {label("previewShort")}
        </div>
      </div>
    </aside>
  );
}
