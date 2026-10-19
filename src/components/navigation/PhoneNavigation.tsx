import { useRef, useState, type PointerEvent } from "react";
import { House, BookOpen, Search, UsersRound, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { AppLink } from "./AppLink";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
import { phoneDockPaths } from "./phone-destinations";
import { MorphIcon } from "../ui/MorphIcon";

/** Fixed physical endpoints keep Home left and Profile right in both languages. */
export function PhoneNavigation({
  personal = false,
}: {
  site?: SiteContent;
  personal?: boolean;
}) {
  const { label, t } = useLocale(),
    { openSearch } = useOverlays();
  const { pathname, hash } = useLocation(),
    auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  const [home, learn, community] = phoneDockPaths(personal);
  const profile = signedIn ? "/my/profile" : signInPath("/my/profile");
  const active =
    pathname === home && !hash
      ? 0
      : pathname === community || pathname.startsWith(community + "/")
        ? 3
        : pathname === "/my/profile" || pathname.startsWith("/my/profile/")
          ? 4
          : (pathname === learn || pathname.startsWith(learn + "/")) &&
              !pathname.startsWith("/learn/electronic-exams")
            ? 1
            : -1;
  const [preview, setPreview] = useState<number | null>(null);
  const nav = useRef<HTMLElement>(null);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    rect: DOMRect;
    drag: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const indexAt = (x: number, rect: DOMRect) =>
    Math.max(
      0,
      Math.min(4, Math.floor((x - rect.left - 6) / ((rect.width - 12) / 5))),
    );
  function reset() {
    gesture.current = null;
    setPreview(null);
  }
  function move(e: PointerEvent<HTMLElement>) {
    const g = gesture.current;
    if (!g) {
      if (e.pointerType === "mouse")
        setPreview(indexAt(e.clientX, e.currentTarget.getBoundingClientRect()));
      return;
    }
    const dx = Math.abs(e.clientX - g.x),
      dy = Math.abs(e.clientY - g.y);
    if (!g.drag && dy > 10 && dy > dx) {
      reset();
      return;
    }
    if (!g.drag && dx > 10 && dx > dy * 1.3) {
      g.drag = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (g.drag) {
      e.preventDefault();
      setPreview(indexAt(e.clientX, g.rect));
    }
  }
  const destinations = [
    { href: home, icon: House, name: label("home") },
    { href: learn, icon: BookOpen, name: t({ en: "Courses", ar: "المساقات" }) },
    null,
    {
      href: community,
      icon: UsersRound,
      name: t({ en: "Community", ar: "المجتمع" }),
    },
    { href: profile, icon: UserRound, name: label("myProfile") },
  ];
  const selected = preview ?? active;
  return (
    <nav
      ref={nav}
      className={`phone-navigation liquid-phone-dock${personal ? " personal-phone-navigation" : ""}`}
      aria-label={label(
        personal ? "personalMobileNavigation" : "mobileNavigation",
      )}
      data-dock-visible={selected >= 0}
      style={{ "--dock-index": Math.max(0, selected) } as React.CSSProperties}
      onPointerDown={(e) => {
        if (!e.isPrimary || e.button !== 0) return;
        suppressClick.current = false;
        gesture.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          rect: e.currentTarget.getBoundingClientRect(),
          drag: false,
        };
      }}
      onDragStart={(e) => e.preventDefault()}
      onPointerMove={move}
      onPointerUp={(e) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        if (g.drag) {
          e.preventDefault();
          suppressClick.current = true;
          if (
            e.clientX >= g.rect.left &&
            e.clientX <= g.rect.right &&
            e.clientY >= g.rect.top - 20 &&
            e.clientY <= g.rect.bottom + 20
          )
            nav.current
              ?.querySelectorAll<HTMLElement>("[data-dock-destination]")
              [indexAt(e.clientX, g.rect)]?.click();
        }
        reset();
      }}
      onClickCapture={(e) => {
        if (suppressClick.current && e.nativeEvent.isTrusted && e.detail > 0) {
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onPointerCancel={reset}
      onLostPointerCapture={(e) => {
        if (e.target === e.currentTarget) reset();
      }}
      onPointerLeave={() => {
        if (!gesture.current) setPreview(null);
      }}
      onFocusCapture={(e) => {
        const node = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-dock-destination]",
        );
        if (node) setPreview(Number(node.dataset.dockDestination));
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPreview(null);
      }}
    >
      <span className="phone-dock-lens" aria-hidden="true" />
      {destinations.map((item, i) =>
        item ? (
          <AppLink
            key={i}
            draggable={false}
            href={item.href}
            data-dock-destination={i}
            data-library-destination={i === 4 && signedIn ? "" : undefined}
            className={active === i ? "active" : ""}
            aria-label={item.name}
            aria-current={active === i ? "page" : undefined}
          >
            <MorphIcon icon={item.icon} size={22} />
            <span className="sr-only dock-caption">{item.name}</span>
          </AppLink>
        ) : (
          <button
            key={i}
            type="button"
            className="phone-search"
            data-dock-destination={i}
            data-search-trigger
            onClick={openSearch}
            aria-label={label("searchLabel")}
          >
            <Search
              size={23}
              className="phone-search-icon"
              aria-hidden="true"
            />
            <span className="sr-only dock-caption">{label("search")}</span>
          </button>
        ),
      )}
    </nav>
  );
}
