import { ScrollHeader } from "./ScrollHeader";
import { NotebookFittings } from "./NotebookFittings";
import { ThemeMenu } from "./ThemeMenu";
import { SearchGlyph } from "./SearchGlyph";
import { LocationTitle } from "./LocationTitle";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { Brand } from "./Brand";
import { LanguageMenu } from "./LanguageMenu";
import { AppearanceSettings } from "./AppearanceSettings";
import { AppLink } from "./AppLink";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
export function WorkspaceHeader({ site }: { site: SiteContent }) {
  const { label } = useLocale();
  const { openSearch } = useOverlays();
  const auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  return (
    <ScrollHeader className="workspace-header container">
      <NotebookFittings axis="header" />
      <LocationTitle />
      <div className="phone-brand">
        <Brand brand={site.brand} />
      </div>
      <div className="workspace-actions">
        <button
          className="workspace-search"
          data-search-trigger
          onClick={openSearch}
          aria-label={label("searchLabel")}
        >
          <SearchGlyph />
        </button>
        <LanguageMenu />
        <ThemeMenu />
        <AppearanceSettings compact />
        <AppLink
          href={signedIn ? "/my" : signInPath("/my")}
          className="workspace-account"
        >
          <span className="account-symbol">
            m<span>c</span>
          </span>
          <span>{label(signedIn ? "myProfile" : "signIn")}</span>
          <ArrowUpRight size={16} className="directional" />
        </AppLink>
      </div>
    </ScrollHeader>
  );
}
