import { NavigationSelection } from "./NavigationSelection";
import { NotebookFittings } from "./NotebookFittings";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  House,
  BookOpen,
  Users,
  ShoppingBag,
  ChevronDown,
  ArrowUpRight,
  UserRound,
  Timer,
  Heart,
  HeartHandshake,
  FileCheck2,
} from "lucide-react";
import { publicMainItems, isInvolvementPath } from "./involvement";
import { NavigationControls } from "./AdaptiveNavigation";
import {
  Route,
  Signpost,
  BadgePlus,
  Ticket,
  Telescope,
  Compass,
} from "lucide-react";
import { SidebarToggle } from "./SidebarToggle";
import { NavigationHint } from "./NavigationHint";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { MegaMenu } from "./MegaMenu";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
import { MorphIcon } from "../ui/MorphIcon";
const icons = {
  community: Users,
  opportunities: Telescope,
  recruitment: BadgePlus,
  "get-involved": Route,
  events: Ticket,
  store: ShoppingBag,
  mentorship: HeartHandshake,
  contributions: FileCheck2,
};
export function DesktopNavigation({ site }: { site: SiteContent }) {
  const { label, t } = useLocale();
  const { navigation } = useAppearance();
  const auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLElement>(null);
  const learnLink = useRef<HTMLAnchorElement>(null);
  const learnArea = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const cancelLearningTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };
  const closeLearning = () => {
    cancelLearningTimers();
    setExpanded(false);
  };
  const keepLearningOpen = () => {
    cancelLearningTimers();
  };
  const leaveLearning = () => {
    cancelLearningTimers();
    closeTimer.current = setTimeout(() => {
      const focused = document.activeElement;
      if (
        learnArea.current?.contains(focused) ||
        root.current?.querySelector("#learn-menu")?.contains(focused)
      )
        return;
      setExpanded(false);
    }, 220);
  };
  const { scrollArea, scrollCues } = useNavigationScrollCues(
    `${location.pathname}:${navigation}:${expanded}`,
  );
  useEffect(() => {
    closeLearning();
    return cancelLearningTimers;
  }, [location.key]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) closeLearning();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const active = (href: string) =>
    href === "/"
      ? location.pathname === "/" && !location.hash
      : href === "/community" && location.pathname.startsWith("/journal")
        ? true
        : href === "/get-involved"
          ? isInvolvementPath(location.pathname)
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
          closeLearning();
          learnLink.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          closeLearning();
      }}
    >
      <NotebookFittings axis="rail" />
      <div className="navigation-brand shell-brand">
        <SidebarToggle controls="public-sidebar-links" />
        <span className="shell-brand-caption">
          <strong>{site.brand.name}</strong>
          <small>{t(site.brand.caption)}</small>
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
          id="public-sidebar-links"
        >
          <NavigationSelection />
          <p className="navigation-label">{label("exploreLabel")}</p>
          <nav className="navigation-primary" aria-label={label("discover")}>
            <NavigationHint label={label("home")}>
              <AppLink
                href="/"
                className={`navigation-item ${active("/") ? "active" : ""}`}
                aria-current={active("/") ? "page" : undefined}
              >
                <MorphIcon icon={House} size={20} />
                <span>{label("home")}</span>
              </AppLink>
            </NavigationHint>
            <div
              className="learn-disclosure"
              ref={learnArea}
              onPointerLeave={leaveLearning}
            >
              <NavigationHint label={label("learn")}>
                <AppLink
                  href="/learn"
                  ref={learnLink}
                  className={`navigation-item ${active("/learn") ? "active" : ""}`}
                  aria-current={active("/learn") ? "page" : undefined}
                  aria-controls="learn-menu"
                  aria-expanded={expanded}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    cancelLearningTimers();
                    openTimer.current = setTimeout(
                      () => setExpanded(true),
                      140,
                    );
                  }}
                  onClick={closeLearning}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      cancelLearningTimers();
                      setExpanded(true);
                      requestAnimationFrame(() =>
                        root.current
                          ?.querySelector<HTMLAnchorElement>("#learn-menu a")
                          ?.focus(),
                      );
                    }
                  }}
                >
                  <MorphIcon icon={BookOpen} size={20} />
                  <ChevronDown
                    size={12}
                    className="learn-disclosure-indicator"
                    aria-hidden="true"
                  />
                  <span className="learn-destination-label">
                    {label("learn")}
                  </span>
                </AppLink>
              </NavigationHint>
              {expanded && navigation !== "horizontal" && (
                <MegaMenu
                  navigation={site.navigation}
                  onNavigate={closeLearning}
                  onPointerEnter={keepLearningOpen}
                  onPointerLeave={leaveLearning}
                />
              )}
            </div>
            {publicMainItems(site).map((item) => {
              const Icon = icons[item.id as keyof typeof icons] || Compass;
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
                    <MorphIcon
                      icon={Icon}
                      to={item.id === "get-involved" ? Signpost : undefined}
                      size={20}
                    />
                    <span>{t(item.label)}</span>
                  </AppLink>
                </NavigationHint>
              );
            })}
          </nav>
          <div className="navigation-workspace">
            <p className="navigation-label">{label("workspace")}</p>
            <NavigationHint label={label(signedIn ? "myProfile" : "signIn")}>
              <AppLink
                className={`navigation-item workspace-portal-item profile-portal space-portal-link ${active("/my") ? "active" : ""}`}
                href={signedIn ? "/my" : signInPath("/my")}
                aria-current={active("/my") ? "page" : undefined}
              >
                <MorphIcon icon={UserRound} size={20} />
                <span>{label(signedIn ? "myProfile" : "signIn")}</span>
              </AppLink>
            </NavigationHint>
            <NavigationHint label={label("studyToolsShort")}>
              <AppLink
                className={`navigation-item ${active("/utilities") ? "active" : ""}`}
                href="/utilities"
                aria-current={active("/utilities") ? "page" : undefined}
              >
                <MorphIcon icon={Timer} size={20} />
                <span>{label("studyToolsShort")}</span>
              </AppLink>
            </NavigationHint>
          </div>
        </div>
      </div>
      {expanded && navigation === "horizontal" && (
        <MegaMenu
          navigation={site.navigation}
          onNavigate={closeLearning}
          onPointerEnter={keepLearningOpen}
          onPointerLeave={leaveLearning}
        />
      )}
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
        <div className="navigation-version navigation-controls-row">
          <span className="navigation-status-copy"><span className="status-dot" />{label("previewShort")}</span>
          <div className="navigation-controls-slot"><NavigationControls /></div>
        </div>
      </div>
    </aside>
  );
}
