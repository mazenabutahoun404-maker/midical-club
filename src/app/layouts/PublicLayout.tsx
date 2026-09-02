import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useSiteContent } from "../../hooks/useContent";
import { useAppearance } from "../providers/AppearanceProvider";
import { WorkspaceHeader } from "../../components/navigation/WorkspaceHeader";
import { Navbar } from "../../components/navigation/Navbar";
import { Footer } from "../../components/navigation/Footer";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
export function PublicLayout() {
  const site = useSiteContent();
  const { navigation, sidebarCollapsed } = useAppearance();
  if (site.isPending)
    return (
      <main id="main">
        <LoadingState />
      </main>
    );
  if (site.isError)
    return (
      <main id="main">
        <ErrorState retry={() => void site.refetch()} />
      </main>
    );
  return (
    <div
      className="app-shell"
      data-navigation={navigation}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-space="public"
    >
      <Navbar site={site.data} />
      <div className="app-content">
        <WorkspaceHeader site={site.data} />
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer site={site.data} />
      </div>
    </div>
  );
}
