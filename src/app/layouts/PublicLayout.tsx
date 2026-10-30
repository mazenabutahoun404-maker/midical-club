import { useShellArrival } from "../../hooks/useShellArrival";
import { RouteViewport, RouteFooter } from "../router/RouteJourney";
import { InvolvementNavigation } from "../../components/navigation/InvolvementNavigation";
import { Outlet, useLocation } from "react-router-dom";
import { isExamSessionPath } from "../../features/exams/session-layout";
import "../../styles/exam-session-shell.css";
import { useSiteContent } from "../../hooks/useContent";
import { useAppearance } from "../providers/AppearanceProvider";
import { WorkspaceHeader } from "../../components/navigation/WorkspaceHeader";
import { Navbar } from "../../components/navigation/Navbar";
import { Footer } from "../../components/navigation/Footer";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import {
  AdaptiveNavigation,
  NavigationProvider,
  useAdaptiveNavigation,
} from "../../components/navigation/AdaptiveNavigation";
import { useLocale } from "../providers/LocaleProvider";
export function PublicLayout() {
  const site = useSiteContent();
  const { navigation, sidebarCollapsed } = useAppearance();
  const adaptive = useAdaptiveNavigation();
  const { label } = useLocale();
  const { pathname } = useLocation();
  const arrival = useShellArrival(
    "public",
    !site.isPending &&
      !site.isError &&
      !isExamSessionPath(pathname) &&
      !adaptive.studying,
  );
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
  if (isExamSessionPath(pathname))
    return (
      <div className="app-shell" data-space="public" data-exam-studio="true">
        <a className="skip-link" href="#main">
          {label("skip")}
        </a>
        <div className="app-content">
          <main id="main" tabIndex={-1}>
            <RouteViewport>
              <Outlet />
            </RouteViewport>
          </main>
        </div>
      </div>
    );
  return (
    <NavigationProvider state={adaptive}>
      <div
        className="app-shell"
        ref={arrival}
        data-navigation={navigation}
        data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
        data-space="public"
        data-nav-adaptive={adaptive.secondary ? "section" : "scroll"}
        data-nav-manual-hidden={adaptive.manualHidden || undefined}
        data-nav-hidden={adaptive.hidden || undefined}
        data-nav-pinned={adaptive.pinned || undefined}
        data-study-focus={adaptive.focus || undefined}
        data-study-environment={adaptive.studying || undefined}
      >
        <a className="skip-link" href="#main">
          {label("skip")}
        </a>
        <AdaptiveNavigation state={adaptive}>
          <Navbar site={site.data} />
        </AdaptiveNavigation>
        <div className="app-content">
          {!adaptive.studying && <WorkspaceHeader site={site.data} />}
          <main id="main" tabIndex={-1}>
            <InvolvementNavigation />
            <RouteViewport>
              <Outlet />
            </RouteViewport>
          </main>
          {!adaptive.studying && (
            <RouteFooter>
              <Footer site={site.data} />
            </RouteFooter>
          )}
        </div>
      </div>
    </NavigationProvider>
  );
}
