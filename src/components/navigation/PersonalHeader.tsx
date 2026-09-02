import { ArrowLeft, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { AppLink } from "./AppLink";
import { LanguageMenu } from "./LanguageMenu";
export function PersonalHeader() {
  const { label } = useLocale();
  const { openSearch } = useOverlays();
  return (
    <header className="personal-header container">
      <AppLink className="back-to-medclub" href="/">
        <ArrowLeft size={17} className="directional" />
        <span>{label("backToMedClub")}</span>
      </AppLink>
      <div className="personal-header-mark">
        <Sparkles size={14} />
        {label("ownCorner")}
      </div>
      <div className="personal-header-actions">
        <button
          className="workspace-icon"
          aria-label={label("personalSearch")}
          onClick={openSearch}
        >
          <Search size={19} />
        </button>
        <LanguageMenu />
        <AppLink
          href="/my/settings"
          className="workspace-icon"
          aria-label={label("personalSettings")}
        >
          <SlidersHorizontal size={19} />
        </AppLink>
      </div>
    </header>
  );
}
