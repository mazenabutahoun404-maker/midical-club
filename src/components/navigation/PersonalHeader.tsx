import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  Bell,
} from "lucide-react";
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
    <header className="personal-header container">
      <AppLink className="back-to-medclub space-portal-link" href="/">
        <ArrowLeft size={17} className="directional" aria-hidden="true" />
        <span>{label("backToMedClub")}</span>
      </AppLink>
      <div className="personal-header-mark">
        <Sparkles size={14} />
        {label("ownCorner")}
      </div>
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
          onClick={openSearch}
        >
          <Search size={19} aria-hidden="true" />
        </button>
        <LanguageMenu />
        <AppLink
          href="/my/settings"
          className="workspace-icon"
          aria-label={label("personalSettings")}
        >
          <SlidersHorizontal size={19} aria-hidden="true" />
        </AppLink>
      </div>
    </header>
  );
}
