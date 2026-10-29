import { useShellArrival } from "../../hooks/useShellArrival";
import { RouteViewport } from "../router/RouteJourney";
import {
  AdaptiveNavigation,
  NavigationProvider,
  useAdaptiveNavigation,
} from "../../components/navigation/AdaptiveNavigation";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "../../components/navigation/AdminHeader";
import { AdminNavigation } from "../../components/navigation/AdminNavigation";
import { useAppearance } from "../providers/AppearanceProvider";
import { useLocale } from "../providers/LocaleProvider";
import { useServices } from "../providers/ServicesProvider";

export function AdminLayout() {
  const { navigation, sidebarCollapsed } = useAppearance();
  const adaptive = useAdaptiveNavigation();
  const { label } = useLocale();
  const preview = useServices().contentSnapshot?.kind !== "live";
  const arrival = useShellArrival("admin");
  return (
    <NavigationProvider state={adaptive}>
      <div
        className="app-shell admin-shell"
        ref={arrival}
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
          {preview && (
            <p className="container admin-preview-notice" role="status">
              <ShieldCheckMark />
              {label("adminPreviewNotice")}
            </p>
          )}
          <main id="main" tabIndex={-1}>
            <RouteViewport>
              <Outlet />
            </RouteViewport>
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}

function ShieldCheckMark() {
  return (
    <span className="admin-notice-mark" aria-hidden="true">
      mc
    </span>
  );
}
