import { NavigationSelection } from "./NavigationSelection";
import { NotebookFittings } from "./NotebookFittings";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  House,
  BookOpen,
  Users,
  ShoppingBag,
  ChevronDown,
  Timer,
  HeartHandshake,
  FileCheck2,
} from "lucide-react";
import { publicMainItems, isInvolvementPath } from "./involvement";
import { RailBrand, RailSettings, RailProfile } from "./RailFurniture";
import {
  Route,
  Signpost,
  BadgePlus,
  Ticket,
  Telescope,
  Compass,
} from "lucide-react";

import { NavigationHint } from "./NavigationHint";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { LearnSubpanel } from "./LearnSubpanel";
import { SidebarToggle } from "./SidebarToggle";

import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useNavigationScrollCues } from "../../hooks/useNavigationScrollCues";

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
  const { navigation, sidebarCollapsed } = useAppearance();
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
  const cancelLearningTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);
  const closeLearning = useCallback(() => {
    cancelLearningTimers();
    setExpanded(false);
  }, [cancelLearningTimers]);
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
  }, [
    location.key,
    navigation,
    sidebarCollapsed,
    closeLearning,
    cancelLearningTimers,
  ]);
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
    <>
      <RailBrand title={site.brand.name} caption={t(site.brand.caption)} />
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
        <SidebarToggle controls="public-sidebar-links" />
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
                  <span className="navigation-item-label">{label("home")}</span>
                </AppLink>
              </NavigationHint>
              <div
                className="learn-disclosure"
                ref={learnArea}
                onPointerLeave={leaveLearning}
              >
                <NavigationHint label={label("learn")} disabled={expanded}>
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
                    <span className="navigation-item-label learn-destination-label">
                      {label("learn")}
                    </span>
                  </AppLink>
                </NavigationHint>
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
                      <span className="navigation-item-label">
                        {t(item.label)}
                      </span>
                    </AppLink>
                  </NavigationHint>
                );
              })}
            </nav>
            <div className="navigation-workspace">
              <p className="navigation-label">{label("workspace")}</p>
              <NavigationHint label={label("studyToolsShort")}>
                <AppLink
                  className={`navigation-item ${active("/utilities") ? "active" : ""}`}
                  href="/utilities"
                  aria-current={active("/utilities") ? "page" : undefined}
                >
                  <MorphIcon icon={Timer} size={20} />
                  <span className="navigation-item-label">
                    {label("studyToolsShort")}
                  </span>
                </AppLink>
              </NavigationHint>
            </div>
          </div>
        </div>
        {expanded && (
          <LearnSubpanel
            anchor={learnLink}
            rail={root}
            horizontal={navigation === "horizontal"}
            navigation={site.navigation}
            onNavigate={closeLearning}
            onPointerEnter={keepLearningOpen}
            onPointerLeave={leaveLearning}
          />
        )}
        <div className="navigation-bottom rail-footer">
          <RailSettings />
          <RailProfile />
        </div>
      </aside>
    </>
  );
}
