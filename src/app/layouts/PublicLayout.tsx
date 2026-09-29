import { RouteViewport, RouteFooter } from "../router/RouteJourney";
import { InvolvementNavigation } from "../../components/navigation/InvolvementNavigation";
import { Outlet } from "react-router-dom";
import { useSiteContent } from "../../hooks/useContent";
import { useAppearance } from "../providers/AppearanceProvider";
import { WorkspaceHeader } from "../../components/navigation/WorkspaceHeader";
import { Navbar } from "../../components/navigation/Navbar";
import { Footer } from "../../components/navigation/Footer";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { WelcomeSequence } from "../../components/feedback/WelcomeSequence";
import {
  AdaptiveNavigation,
  useAdaptiveNavigation,
} from "../../components/navigation/AdaptiveNavigation";
import { useLocale } from "../providers/LocaleProvider";
export function PublicLayout() {
  const site = useSiteContent();
  const { navigation, sidebarCollapsed } = useAppearance();
  const adaptive = useAdaptiveNavigation();
  const { label } = useLocale();
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
      data-nav-adaptive={adaptive.secondary ? "section" : "scroll"}
      data-nav-manual-hidden={adaptive.manualHidden || undefined}
      data-nav-hidden={adaptive.hidden || undefined}
      data-nav-pinned={adaptive.pinned || undefined}
      data-study-focus={adaptive.focus || undefined}
    >
      <WelcomeSequence />
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <AdaptiveNavigation state={adaptive}>
        <Navbar site={site.data} />
      </AdaptiveNavigation>
      <div className="app-content">
        <WorkspaceHeader site={site.data} />
        <main id="main" tabIndex={-1}>
          <InvolvementNavigation />
          <RouteViewport>
            <Outlet />
          </RouteViewport>
        </main>
        <RouteFooter>
          <Footer site={site.data} />
        </RouteFooter>
      </div>
    </div>
  );
}
