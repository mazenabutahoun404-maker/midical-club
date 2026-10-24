import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderNotes } from "./HeaderNotes";
import { SearchGlyph } from "./SearchGlyph";
import { MobileNavigation } from "./MobileNavigation";
import { useOverlays } from "../../app/providers/OverlayProvider";

/** The same visible search, notes and bell in each workspace. */
export function HeaderUtilities({
  searchLabel,
  more = true,
}: {
  searchLabel: string;
  more?: boolean;
}) {
  const { openSearch } = useOverlays();
  return (
    <>
      <button
        type="button"
        className="header-search-bar"
        data-search-trigger
        onClick={openSearch}
        aria-label={searchLabel}
        aria-haspopup="dialog"
      >
        <SearchGlyph />
        <span>{searchLabel}</span>
      </button>
      <HeaderNotes />
      <HeaderNotifications />
      {more && <MobileNavigation />}
    </>
  );
}
