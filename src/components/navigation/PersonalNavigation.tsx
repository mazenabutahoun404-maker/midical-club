import { useLocation } from "react-router-dom";
import {
  House,
  BookOpen,
  Bookmark,
  Timer,
  UserRound,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
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
  { href: "/my/focus", label: "myFocus", icon: Timer },
  { href: "/my/profile", label: "myProfile", icon: UserRound },
  { href: "/my/settings", label: "personalSettings", icon: SlidersHorizontal },
] satisfies { href: string; label: MessageKey; icon: typeof House }[];
export function PersonalNavigation({ profile }: { profile?: StudentProfile }) {
  const { label, t } = useLocale();
  const { pathname } = useLocation();
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
        <div className="navigation-scroll" id="personal-sidebar-links">
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
        {items.slice(0, 5).map(({ href, label: key, icon: Icon }) => (
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
                      : key === "myFocus"
                        ? "focusShort"
                        : "profileShort",
              )}
            </span>
          </AppLink>
        ))}
      </nav>
    </>
  );
}
