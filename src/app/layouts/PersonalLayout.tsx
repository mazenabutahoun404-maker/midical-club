import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useAppearance } from "../providers/AppearanceProvider";
import { useLocale } from "../providers/LocaleProvider";
import { useStudentProfile } from "../../hooks/useContent";
import { PersonalNavigation } from "../../components/navigation/PersonalNavigation";
import { PersonalHeader } from "../../components/navigation/PersonalHeader";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useWorkspace } from "../providers/WorkspaceProvider";
export function PersonalLayout() {
  const { navigation, sidebarCollapsed } = useAppearance();
  const { label } = useLocale();
  const profile = useStudentProfile();
  const workspace = useWorkspace();
  return (
    <div
      className="app-shell personal-shell"
      data-navigation={navigation}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-space="personal"
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <PersonalNavigation profile={profile.data} />
      <div className="app-content">
        <PersonalHeader />
        <main id="main" tabIndex={-1}>
          {!workspace.persistent && (
            <p className="container workspace-warning" role="status">
              {label("sessionNotice")}
            </p>
          )}
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <p className="personal-footnote container">
          {label("personalFootnote")}
        </p>
      </div>
    </div>
  );
}
