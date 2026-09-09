import { House, BookOpen, Search, Bookmark } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { AppLink } from "./AppLink";
import { MobileNavigation } from "./MobileNavigation";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
import { MorphIcon } from "../ui/MorphIcon";
export function PhoneNavigation({ site }: { site: SiteContent }) {
  const { label } = useLocale();
  const { openSearch } = useOverlays();
  const { pathname, hash } = useLocation();
  const auth = useAuth();
  const libraryHref =
    auth.snapshot.status === "authenticated"
      ? "/my/library"
      : signInPath("/my/library");
  return (
    <nav className="phone-navigation" aria-label={label("mobileNavigation")}>
      <AppLink
        href="/"
        className={pathname === "/" && !hash ? "active" : ""}
        aria-current={pathname === "/" && !hash ? "page" : undefined}
      >
        <MorphIcon icon={House} size={21} />
        <span>{label("home")}</span>
      </AppLink>
      <AppLink
        href="/learn"
        className={pathname.startsWith("/learn") ? "active" : ""}
        aria-current={pathname.startsWith("/learn") ? "page" : undefined}
      >
        <MorphIcon icon={BookOpen} size={21} />
        <span>{label("learn")}</span>
      </AppLink>
      <button
        className="phone-search"
        onClick={openSearch}
        aria-label={label("searchLabel")}
      >
        <Search size={22} className="phone-search-icon" aria-hidden="true" />
        <span>{label("search")}</span>
      </button>
      <AppLink
        href={libraryHref}
        data-library-destination
        className={pathname === "/my/library" ? "active" : ""}
        aria-current={pathname === "/my/library" ? "page" : undefined}
      >
        <MorphIcon icon={Bookmark} size={21} />
        <span>{label("savedShort")}</span>
      </AppLink>
      <MobileNavigation site={site} />
    </nav>
  );
}
