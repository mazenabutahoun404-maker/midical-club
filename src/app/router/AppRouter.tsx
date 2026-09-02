import { lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { PersonalLayout } from "../layouts/PersonalLayout";
import { AppOverlays } from "../layouts/AppOverlays";
import { RouteEffects } from "./RouteEffects";
import { SpaceTransition } from "./SpaceTransition";
import { isPersonalPath } from "../../constants/routes";
import { PlannedFeaturePage } from "../../components/feedback/PlannedFeaturePage";
import { useLocale } from "../providers/LocaleProvider";
import { ActionLink } from "../../components/ui/ActionLink";
const Homepage = lazy(() => import("../../features/homepage/Homepage"));
const CatalogPage = lazy(() => import("../../features/academics/CatalogPage"));
const CoursePage = lazy(() => import("../../features/courses/CoursePage"));
const LibraryPage = lazy(() => import("../../features/library/LibraryPage"));
const StudyToolsPage = lazy(
  () => import("../../features/utilities/StudyToolsPage"),
);
const StudentDashboard = lazy(
  () => import("../../features/student-dashboard/StudentDashboard"),
);
const MyLearningPage = lazy(
  () => import("../../features/academics/MyLearningPage"),
);
const ProfilePage = lazy(() => import("../../features/profile/ProfilePage"));
const SettingsPage = lazy(() => import("../../features/settings/SettingsPage"));
const PersonalFocusPage = lazy(
  () => import("../../features/utilities/PersonalFocusPage"),
);
function NotFound({ personal = false }: { personal?: boolean }) {
  const { label } = useLocale();
  return (
    <div className="container not-found">
      <h1>{label("notFound")}</h1>
      <p>{label("notFoundBody")}</p>
      <ActionLink href={personal ? "/my" : "/"}>
        {label(personal ? "backToMySpace" : "back")}
      </ActionLink>
    </div>
  );
}
export function AppRouter() {
  const location = useLocation();
  const space = isPersonalPath(location.pathname) ? "personal" : "public";
  return (
    <>
      <SpaceTransition space={space}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Homepage />} />
            <Route path="learn" element={<CatalogPage />} />
            <Route
              path="learn/basic-sciences"
              element={<CatalogPage key="basic" track="basic" />}
            />
            <Route
              path="learn/clinical-sciences"
              element={<CatalogPage key="clinical" track="clinical" />}
            />
            <Route path="learn/courses/:slug" element={<CoursePage />} />
            <Route
              path="learn/electronic-exams"
              element={<PlannedFeaturePage titleKey="exams" />}
            />
            <Route
              path="store"
              element={<PlannedFeaturePage titleKey="store" />}
            />
            <Route path="utilities" element={<StudyToolsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="my" element={<PersonalLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<Navigate to="/my" replace />} />
            <Route path="learning" element={<MyLearningPage />} />
            <Route path="learning/:slug" element={<CoursePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="focus" element={<PersonalFocusPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound personal />} />
          </Route>
        </Routes>
      </SpaceTransition>
      <AppOverlays />
      <RouteEffects />
    </>
  );
}
