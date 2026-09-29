import { ScrollHeader } from "./ScrollHeader";
import { NotebookFittings } from "./NotebookFittings";
import { ThemeMenu } from "./ThemeMenu";
import { LocationTitle } from "./LocationTitle";
import { SearchGlyph } from "./SearchGlyph";
import { ArrowLeft, SlidersHorizontal, Bell } from "lucide-react";
import { useNotifications } from "../../features/notifications/useNotifications";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { AppLink } from "./AppLink";
import { LanguageMenu } from "./LanguageMenu";
export function PersonalHeader() {
  const { label } = useLocale();
  const { openSearch } = useOverlays();
  const notifications = useNotifications();
  return (
    <ScrollHeader className="personal-header container">
      <NotebookFittings axis="header" />
      <AppLink className="back-to-medclub space-portal-link" href="/">
        <ArrowLeft size={17} className="directional" aria-hidden="true" />
        <span>{label("backToMedClub")}</span>
      </AppLink>
      <LocationTitle />
      <div className="personal-header-actions">
        <AppLink
          href="/my/notifications"
          className="workspace-icon notification-bell"
          aria-label={label("notifications")}
        >
          <Bell size={19} aria-hidden="true" />
          {!notifications.isPending && notifications.unread > 0 && (
            <span
              className="notification-badge"
              aria-label={`${notifications.unread} ${label("unreadUpdates")}`}
            >
              {notifications.unread}
            </span>
          )}
        </AppLink>
        <button
          className="workspace-icon"
          aria-label={label("personalSearch")}
          data-search-trigger
          onClick={openSearch}
        >
          <SearchGlyph />
        </button>
        <LanguageMenu />
        <ThemeMenu />
        <AppLink
          href="/my/settings"
          className="workspace-icon"
          aria-label={label("personalSettings")}
        >
          <SlidersHorizontal size={19} aria-hidden="true" />
        </AppLink>
      </div>
    </ScrollHeader>
  );
}
