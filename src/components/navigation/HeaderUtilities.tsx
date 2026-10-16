import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderNotes } from "./HeaderNotes";
import { SearchGlyph } from "./SearchGlyph";
import { useOverlays } from "../../app/providers/OverlayProvider";

/** Shared order keeps public and personal utility controls in the same positions. */
export function HeaderUtilities({
  searchLabel,
  showNotifications = true,
  searchClassName = "workspace-icon",
}: {
  searchLabel: string;
  showNotifications?: boolean;
  searchClassName?: string;
}) {
  const { openSearch } = useOverlays();
  return (
    <>
      <button
        type="button"
        className={searchClassName}
        data-search-trigger
        onClick={openSearch}
        aria-label={searchLabel}
      >
        <SearchGlyph />
      </button>
      {showNotifications && <HeaderNotifications />}
      <HeaderNotes />
    </>
  );
}
