import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "../../components/navigation/AdminHeader";
import { AdminNavigation } from "../../components/navigation/AdminNavigation";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAppearance } from "../providers/AppearanceProvider";
import { useLocale } from "../providers/LocaleProvider";

export function AdminLayout() {
  const { navigation, sidebarCollapsed } = useAppearance();
  const { label } = useLocale();
  return (
    <div
      className="app-shell admin-shell"
      data-navigation={navigation}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-space="admin"
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <AdminNavigation />
      <div className="app-content">
        <AdminHeader />
        <p className="container admin-preview-notice" role="status">
          <ShieldCheckMark />
          {label("adminPreviewNotice")}
        </p>
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
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
