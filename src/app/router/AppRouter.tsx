import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { PersonalLayout } from "../layouts/PersonalLayout";
import { useOverlays } from "../providers/OverlayProvider";
import { RouteEffects } from "./RouteEffects";
import { SpaceTransition } from "./SpaceTransition";
import { AcademicTransition } from "./AcademicTransition";
import { MedicalTransition } from "./MedicalTransition";
import { isPersonalPath } from "../../constants/routes";
import { PlannedFeaturePage } from "../../components/feedback/PlannedFeaturePage";
import { useLocale } from "../providers/LocaleProvider";
import { ActionLink } from "../../components/ui/ActionLink";
const Homepage = lazy(() => import("../../features/homepage/Homepage"));
const AppOverlays = lazy(() =>
  import("../layouts/AppOverlays").then((module) => ({
    default: module.AppOverlays,
  })),
);
const CalendarPage = lazy(() => import("../../features/calendar/CalendarPage"));
const NotificationsPage = lazy(
  () => import("../../features/notifications/NotificationsPage"),
);
const SearchPage = lazy(() => import("../../features/search/SearchPage"));
const LearnLandingPage = lazy(
  () => import("../../features/academics/LearnLandingPage"),
);
const BasicSciencesPage = lazy(
  () => import("../../features/academics/BasicSciencesPage"),
);
const BatchPage = lazy(() => import("../../features/academics/BatchPage"));
const ClinicalSciencesPage = lazy(
  () => import("../../features/academics/ClinicalSciencesPage"),
);
const ClinicalYearPage = lazy(
  () => import("../../features/academics/ClinicalYearPage"),
);
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
const EventsPage = lazy(() => import("../../features/events/EventsPage"));
const EventPage = lazy(() => import("../../features/events/EventPage"));
const OpportunitiesPage = lazy(
  () => import("../../features/opportunities/OpportunitiesPage"),
);
const OpportunityPage = lazy(
  () => import("../../features/opportunities/OpportunityPage"),
);
const MyEventsPage = lazy(() => import("../../features/events/MyEventsPage"));
const MyOpportunitiesPage = lazy(
  () => import("../../features/opportunities/MyOpportunitiesPage"),
);
const CommunityPage = lazy(
  () => import("../../features/community/CommunityPage"),
);
const ActivitiesPage = lazy(
  () => import("../../features/community/ActivitiesPage"),
);
const MediaPage = lazy(() => import("../../features/community/MediaPage"));
const ExecutiveBodiesPage = lazy(
  () => import("../../features/community/ExecutiveBodiesPage"),
);
const RecognitionPage = lazy(
  () => import("../../features/community/RecognitionPage"),
);
const AboutPage = lazy(() => import("../../features/community/AboutPage"));
const JournalPage = lazy(() => import("../../features/community/JournalPage"));
const JournalArticlePage = lazy(
  () => import("../../features/community/JournalArticlePage"),
);
const MentorshipPage = lazy(
  () => import("../../features/mentorship/MentorshipPage"),
);
const GroupSessionsPage = lazy(
  () => import("../../features/mentorship/GroupSessionsPage"),
);
const MentorshipQAPage = lazy(
  () => import("../../features/mentorship/MentorshipQAPage"),
);
const MyMentorshipPage = lazy(
  () => import("../../features/mentorship/MyMentorshipPage"),
);
const ContributionsPage = lazy(
  () => import("../../features/contributions/ContributionsPage"),
);
const MyContributionsPage = lazy(
  () => import("../../features/contributions/MyContributionsPage"),
);
const StorePage = lazy(() => import("../../features/store/StorePage"));
const ProductPage = lazy(() => import("../../features/store/ProductPage"));
const CartPage = lazy(() => import("../../features/store/CartPage"));
const MyOrdersPage = lazy(() => import("../../features/store/MyOrdersPage"));
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
  const { searchOpen, detail } = useOverlays();
  const { label } = useLocale();
  const space = isPersonalPath(location.pathname) ? "personal" : "public";
  return (
    <>
      <SpaceTransition space={space}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Homepage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:slug" element={<EventPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/:slug" element={<OpportunityPage />} />
            <Route
              path="community"
              element={
                <MedicalTransition>
                  <CommunityPage />
                </MedicalTransition>
              }
            />
            <Route
              path="community/activities"
              element={
                <MedicalTransition>
                  <ActivitiesPage />
                </MedicalTransition>
              }
            />
            <Route
              path="community/media"
              element={
                <MedicalTransition>
                  <MediaPage />
                </MedicalTransition>
              }
            />
            <Route
              path="community/executive-bodies"
              element={
                <MedicalTransition>
                  <ExecutiveBodiesPage />
                </MedicalTransition>
              }
            />
            <Route
              path="community/honor-plate"
              element={
                <MedicalTransition>
                  <RecognitionPage kind="honor-plate" />
                </MedicalTransition>
              }
            />
            <Route
              path="community/hall-of-honor"
              element={
                <MedicalTransition>
                  <RecognitionPage kind="hall-of-honor" />
                </MedicalTransition>
              }
            />
            <Route
              path="community/about"
              element={
                <MedicalTransition>
                  <AboutPage />
                </MedicalTransition>
              }
            />
            <Route
              path="journal"
              element={
                <MedicalTransition>
                  <JournalPage />
                </MedicalTransition>
              }
            />
            <Route
              path="journal/:slug"
              element={
                <MedicalTransition>
                  <JournalArticlePage />
                </MedicalTransition>
              }
            />
            <Route
              path="mentorship"
              element={
                <MedicalTransition>
                  <MentorshipPage />
                </MedicalTransition>
              }
            />
            <Route
              path="mentorship/sessions"
              element={
                <MedicalTransition>
                  <GroupSessionsPage />
                </MedicalTransition>
              }
            />
            <Route
              path="mentorship/qa"
              element={
                <MedicalTransition>
                  <MentorshipQAPage />
                </MedicalTransition>
              }
            />
            <Route
              path="contribute"
              element={
                <MedicalTransition>
                  <ContributionsPage />
                </MedicalTransition>
              }
            />
            <Route
              path="learn"
              element={
                <AcademicTransition>
                  <LearnLandingPage />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/basic-sciences"
              element={
                <AcademicTransition>
                  <BasicSciencesPage />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/basic-sciences/batches/:batchSlug"
              element={
                <AcademicTransition>
                  <BatchPage view="current" />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/basic-sciences/batches/:batchSlug/current"
              element={
                <AcademicTransition>
                  <BatchPage view="current" />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/basic-sciences/batches/:batchSlug/archive"
              element={
                <AcademicTransition>
                  <BatchPage view="archive" />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/clinical-sciences"
              element={
                <AcademicTransition>
                  <ClinicalSciencesPage />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/clinical-sciences/:yearSlug"
              element={
                <AcademicTransition>
                  <ClinicalYearPage />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/courses/:slug"
              element={
                <AcademicTransition>
                  <CoursePage />
                </AcademicTransition>
              }
            />
            <Route
              path="learn/electronic-exams"
              element={<PlannedFeaturePage titleKey="exams" />}
            />
            <Route
              path="store"
              element={
                <MedicalTransition>
                  <StorePage />
                </MedicalTransition>
              }
            />
            <Route
              path="store/products/:slug"
              element={
                <MedicalTransition>
                  <ProductPage />
                </MedicalTransition>
              }
            />
            <Route
              path="store/cart"
              element={
                <MedicalTransition>
                  <CartPage />
                </MedicalTransition>
              }
            />
            <Route
              path="store/orders"
              element={<Navigate to="/my/orders" replace />}
            />
            <Route path="utilities" element={<StudyToolsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="my" element={<PersonalLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<Navigate to="/my" replace />} />
            <Route path="learning" element={<MyLearningPage />} />
            <Route
              path="learning/:slug"
              element={
                <AcademicTransition>
                  <CoursePage />
                </AcademicTransition>
              }
            />
            <Route path="library" element={<LibraryPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="events" element={<MyEventsPage />} />
            <Route path="opportunities" element={<MyOpportunitiesPage />} />
            <Route path="mentorship" element={<MyMentorshipPage />} />
            <Route path="contributions" element={<MyContributionsPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="focus" element={<PersonalFocusPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound personal />} />
          </Route>
        </Routes>
      </SpaceTransition>
      {(searchOpen || detail) && (
        <Suspense
          fallback={
            <div className="overlay-loading" role="status">
              {label("loading")}
            </div>
          }
        >
          <AppOverlays />
        </Suspense>
      )}
      <RouteEffects />
    </>
  );
}
