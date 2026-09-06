import { Search, ArrowUpRight, Sparkles } from "lucide-react";
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
    <header className="workspace-header container">
      <div className="workspace-welcome">
        <span className="welcome-spark">
          <Sparkles size={17} />
        </span>
        <span>{label("welcomeLine")}</span>
      </div>
      <div className="phone-brand">
        <Brand brand={site.brand} />
      </div>
      <div className="workspace-actions">
        <button
          className="workspace-search"
          onClick={openSearch}
          aria-label={label("searchLabel")}
        >
          <Search size={18} />
          <span>{label("searchSomething")}</span>
          <kbd>/</kbd>
        </button>
        <LanguageMenu />
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
    </header>
  );
}
