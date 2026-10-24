import { Menu, ArrowUpRight, Route, Signpost, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { useAuth } from "../../app/providers/AuthProvider";
import { AppearanceSettings } from "./AppearanceSettings";
import { useSiteContent } from "../../hooks/useContent";
import { useAccess } from "../../admin/governance/useGovernance";
import { publicMainItems } from "./involvement";
import { personalNavigationItems } from "./personal-navigation-items";
import { phoneDockPaths } from "./phone-destinations";
import { MorphIcon } from "../ui/MorphIcon";
import "../../styles/phone-menu-priority-v1353.css";

type MenuItem = { href: string; label: string };
const personalDock = new Set(phoneDockPaths(true));
const publicDock = new Set(phoneDockPaths(false));

/** More complements the daily dock with the current sidebar's main destinations. */
export function MobileNavigation({
  site: supplied,
}: { site?: SiteContent } = {}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const { label, t } = useLocale(),
    location = useLocation(),
    auth = useAuth();
  const site = useSiteContent(),
    access = useAccess();
  const signedIn = auth.snapshot.status === "authenticated";
  const personal =
    location.pathname === "/my" || location.pathname.startsWith("/my/");
  const content = supplied || site.data;
  function openMenu() {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  }
  function closeMenu() {
    if (!open || closing) return;
    clearTimeout(closeTimer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      setClosing(false);
      return;
    }
    // Keep native modality, content and focus intact until the short exit finishes.
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 160);
  }
  useEffect(() => {
    closeMenu();
  }, [location.key]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  if (location.pathname.startsWith("/admin")) return null;
  const item = (href: string, en: string, ar: string): MenuItem => ({
    href,
    label: t({ en, ar }),
  });
  const publicItems = content ? publicMainItems(content) : [];
  const promoted: MenuItem[] = [
    publicItems.find((n) => n.href === "/get-involved")
      ? {
          href: "/get-involved",
          label: t(publicItems.find((n) => n.href === "/get-involved")!.label),
        }
      : item("/get-involved", "Get involved", "شارك"),
    publicItems.find((n) => n.href === "/store")
      ? {
          href: "/store",
          label: t(publicItems.find((n) => n.href === "/store")!.label),
        }
      : item("/store", "Store", "المتجر"),
  ];
  const remaining: MenuItem[] = personal
    ? personalNavigationItems
        .filter((n) => !personalDock.has(n.href))
        .map((n) => ({ href: n.href, label: label(n.label) }))
    : [
        ...(content
          ? publicItems.map((n) => ({
              href: n.href,
              label: t(n.label),
            }))
          : []),
        item(
          "/learn/electronic-exams",
          "Electronic exams",
          "الامتحانات الإلكترونية",
        ),
        item("/utilities", "Study tools", "أدوات الدراسة"),
      ];
  const sections = [...promoted, ...remaining];
  const workspace: MenuItem[] = [
    ...(signedIn
      ? [item("/my/profile", "Account settings", "إعدادات الحساب")]
      : []),
    ...(personal
      ? [item("/", "MedClub home", "رئيسية مدكلوب")]
      : signedIn
        ? [item("/my", "My space", "مساحتي")]
        : []),
    ...(signedIn && access.data?.capabilities.includes("admin.access")
      ? [item("/admin", "Admin control room", "غرفة التحكم")]
      : []),
  ];
  const seen = new Set(personal ? personalDock : publicDock);
  const groups = [
    {
      title: personal
        ? t({ en: "Quick access", ar: "الوصول السريع" })
        : label("discover"),
      items: sections,
    },
    { title: label("workspace"), items: workspace },
  ]
    .map((g) => ({
      ...g,
      items: g.items.filter((n) => {
        const key = n.href.replace(/\/$/, "") || "/";
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    }))
    .filter((g) => g.items.length);

  return (
    <>
      <button
        type="button"
        className="workspace-icon mobile-sections-trigger"
        aria-label={label("more")}
        aria-haspopup="dialog"
        aria-expanded={open && !closing}
        onClick={openMenu}
      >
        <Menu size={21} aria-hidden="true" />
      </button>
      <Modal
        open={open}
        onClose={closeMenu}
        title={label("more")}
        description={t({
          en: "Get involved. Find your next opportunity.",
          ar: "شارك واكتشف فرصتك القادمة.",
        })}
        className={`mobile-menu-dialog phone-sections-dialog${closing ? " is-closing" : ""}`}
      >
        <nav className="phone-sections-groups" aria-label={label("menuTitle")}>
          {groups.map((g, groupIndex) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              <div
                className={groupIndex === 0 ? "phone-menu-links" : undefined}
              >
                {g.items.map((n) => (
                  <AppLink
                    key={n.href}
                    href={n.href}
                    onClick={closeMenu}
                    className={
                      n.href === "/get-involved"
                        ? "phone-menu-involved"
                        : n.href === "/store"
                          ? "phone-menu-store"
                          : undefined
                    }
                    data-library-destination={
                      n.href === "/my/library" ? "" : undefined
                    }
                    aria-current={
                      location.pathname === n.href ||
                      location.pathname.startsWith(n.href + "/")
                        ? "page"
                        : undefined
                    }
                  >
                    {n.href === "/get-involved" ? (
                      <>
                        <span
                          className="phone-menu-feature-icons"
                          aria-hidden="true"
                        >
                          <MorphIcon icon={Route} to={Signpost} size={28} />
                          <ArrowUpRight size={18} className="directional" />
                        </span>
                        <strong>{n.label}</strong>
                      </>
                    ) : (
                      <>
                        {n.href === "/store" && (
                          <ShoppingBag size={18} aria-hidden="true" />
                        )}
                        <span>{n.label}</span>
                        <ArrowUpRight
                          size={15}
                          className="directional"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </AppLink>
                ))}
              </div>
            </section>
          ))}
        </nav>
        <div className="mobile-more-appearance">
          <AppearanceSettings />
        </div>
      </Modal>
    </>
  );
}
