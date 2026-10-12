import { RouteViewport } from "../router/RouteJourney";
import { Outlet } from "react-router-dom";
import { useAppearance } from "../providers/AppearanceProvider";
import { useLocale } from "../providers/LocaleProvider";
import { useStudentProfile } from "../../hooks/useContent";
import { PersonalNavigation } from "../../components/navigation/PersonalNavigation";
import { PersonalHeader } from "../../components/navigation/PersonalHeader";
import { useWorkspace } from "../providers/WorkspaceProvider";
import {
  AdaptiveNavigation,
  useAdaptiveNavigation,
} from "../../components/navigation/AdaptiveNavigation";
export function PersonalLayout() {
  const { navigation, sidebarCollapsed } = useAppearance();
  const { label } = useLocale();
  const profile = useStudentProfile();
  const workspace = useWorkspace();
  const adaptive = useAdaptiveNavigation();
  return (
    <div
      className="app-shell personal-shell"
      data-navigation={navigation}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-space="personal"
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
      <AdaptiveNavigation state={adaptive} personal>
        <PersonalNavigation />
      </AdaptiveNavigation>
      <div className="app-content">
        {!adaptive.studying && <PersonalHeader profile={profile.data} />}
        <main id="main" tabIndex={-1}>
          {!workspace.persistent && (
            <p className="container workspace-warning" role="status">
              {label("sessionNotice")}
            </p>
          )}
          <RouteViewport>
            <Outlet />
          </RouteViewport>
        </main>
        <p className="personal-footnote container">
          {label("personalFootnote")}
        </p>
      </div>
    </div>
  );
}
