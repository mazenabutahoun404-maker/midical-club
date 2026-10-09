import { RouteViewport } from "../router/RouteJourney";
import {
  AdaptiveNavigation,
  useAdaptiveNavigation,
} from "../../components/navigation/AdaptiveNavigation";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "../../components/navigation/AdminHeader";
import { AdminNavigation } from "../../components/navigation/AdminNavigation";
import { useAppearance } from "../providers/AppearanceProvider";
import { useLocale } from "../providers/LocaleProvider";

export function AdminLayout() {
  const { navigation, sidebarCollapsed } = useAppearance();
  const adaptive = useAdaptiveNavigation();
  const { label } = useLocale();
  return (
    <div
      className="app-shell admin-shell"
      data-navigation={navigation}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-space="admin"
      data-nav-adaptive={adaptive.secondary ? "section" : "scroll"}
      data-nav-hidden={adaptive.hidden || undefined}
      data-nav-manual-hidden={adaptive.manualHidden || undefined}
      data-nav-pinned={adaptive.pinned || undefined}
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <AdaptiveNavigation state={adaptive}>
        <AdminNavigation />
      </AdaptiveNavigation>
      <div className="app-content">
        <AdminHeader />
        <p className="container admin-preview-notice" role="status">
          <ShieldCheckMark />
          {label("adminPreviewNotice")}
        </p>
        <main id="main" tabIndex={-1}>
          <RouteViewport>
            <Outlet />
          </RouteViewport>
        </main>
      </div>
    </div>
  );
}

function ShieldCheckMark() {
  return (
    <span className="admin-notice-mark" aria-hidden="true">
      mc
    </span>
  );
}
