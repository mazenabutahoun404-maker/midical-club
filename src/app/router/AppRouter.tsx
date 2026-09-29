import { RouteJourneyContext, useRouteJourney } from "./RouteJourney";
import { lazy, Suspense } from "react";
import { SearchDialog } from "../../features/search/SearchDialog";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { InvolvementEntry } from "../../components/navigation/InvolvementNavigation";
import { PublicLayout } from "../layouts/PublicLayout";
import { PersonalLayout } from "../layouts/PersonalLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { useOverlays } from "../providers/OverlayProvider";
import { RouteEffects } from "./RouteEffects";
import { SpaceTransition } from "./SpaceTransition";
import { AcademicTransition } from "./AcademicTransition";
import { MedicalTransition } from "./MedicalTransition";
import { isAdminPath, isPersonalPath } from "../../constants/routes";
import { PlannedFeaturePage } from "../../components/feedback/PlannedFeaturePage";
import { useLocale } from "../providers/LocaleProvider";
import { ActionLink } from "../../components/ui/ActionLink";
import { RequireAuth } from "./RequireAuth";
import { CapabilityGate } from "./CapabilityGate";
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
const AcademicProgressPage = lazy(
  () => import("../../features/insights/AcademicProgressPage"),
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
const SignInPage = lazy(() => import("../../features/auth/SignInPage"));
const RegisterPage = lazy(() => import("../../features/auth/RegisterPage"));
const VerifyPage = lazy(() => import("../../features/auth/VerifyPage"));
const RecoverPage = lazy(() => import("../../features/auth/RecoverPage"));
const RecruitmentPage = lazy(
  () => import("../../features/recruitment/RecruitmentPage"),
);
const RecruitmentPositionPage = lazy(
  () => import("../../features/recruitment/RecruitmentPositionPage"),
);
const MyApplicationsPage = lazy(
  () => import("../../features/recruitment/MyApplicationsPage"),
);
const TeamProfilePage = lazy(
  () => import("../../features/recruitment/TeamProfilePage"),
);
const AdminDashboardPage = lazy(
  () => import("../../admin/dashboard/AdminDashboardPage"),
);
const AdminContentPage = lazy(
  () => import("../../admin/content/AdminContentPage"),
);
const AdminActivityPage = lazy(
  () => import("../../admin/activity/AdminActivityPage"),
);
const AdminVersionsPage = lazy(
  () => import("../../admin/versions/AdminVersionsPage"),
);
const BuilderLibraryPage = lazy(
  () => import("../../admin/builder/BuilderLibraryPage"),
);
const PageBuilderPage = lazy(
  () => import("../../admin/builder/PageBuilderPage"),
);
const GovernancePage = lazy(
  () => import("../../admin/governance/GovernancePage"),
);
const AdminUsersPage = lazy(() => import("../../admin/users/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("../../admin/roles/AdminRolesPage"));
const AdminApprovalsPage = lazy(
  () => import("../../admin/approvals/AdminApprovalsPage"),
);
const AdminAnalyticsPage = lazy(
  () => import("../../admin/analytics/AdminAnalyticsPage"),
);
const AdminContentHealthPage = lazy(
  () => import("../../admin/health/AdminContentHealthPage"),
);
function NotFound({
  personal = false,
  admin = false,
}: {
  personal?: boolean;
  admin?: boolean;
}) {
  const { label } = useLocale();
  return (
    <div className="container not-found">
      <h1>{label("notFound")}</h1>
      <p>{label("notFoundBody")}</p>
      <ActionLink href={admin ? "/admin" : personal ? "/my" : "/"}>
        {label(admin ? "adminOverview" : personal ? "backToMySpace" : "back")}
      </ActionLink>
    </div>
  );
}
export function AppRouter() {
  const target = useLocation();
  const journey = useRouteJourney(target);
  const location = journey.location;
  const { searchOpen, detail } = useOverlays();
  const { label } = useLocale();
  const space = location.pathname.startsWith("/auth")
    ? "auth"
    : isAdminPath(location.pathname)
      ? "admin"
      : isPersonalPath(location.pathname)
        ? "personal"
        : "public";
  return (
    <>
      <RouteJourneyContext.Provider value={journey}>
        <SpaceTransition space={space}>
          <Routes location={location}>
            <Route path="auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="sign-in" replace />} />
              <Route path="sign-in" element={<SignInPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify" element={<VerifyPage />} />
              <Route path="recover" element={<RecoverPage />} />
              <Route path="*" element={<Navigate to="sign-in" replace />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route index element={<Homepage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="get-involved" element={<InvolvementEntry />} />
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
                path="recruitment"
                element={
                  <MedicalTransition>
                    <RecruitmentPage />
                  </MedicalTransition>
                }
              />
              <Route
                path="recruitment/:slug"
                element={
                  <MedicalTransition>
                    <RecruitmentPositionPage />
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
            <Route element={<RequireAuth />}>
              <Route path="my" element={<PersonalLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route
                  path="dashboard"
                  element={<Navigate to="/my" replace />}
                />
                <Route path="learning" element={<MyLearningPage />} />
                <Route path="progress" element={<AcademicProgressPage />} />
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
                <Route path="applications" element={<MyApplicationsPage />} />
                <Route path="team" element={<TeamProfilePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="focus" element={<PersonalFocusPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound personal />} />
              </Route>
              <Route path="admin" element={<AdminLayout />}>
                <Route
                  index
                  element={
                    <CapabilityGate capability="admin.access">
                      <AdminDashboardPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="content"
                  element={
                    <CapabilityGate capability="content.review">
                      <AdminContentPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="builder"
                  element={
                    <CapabilityGate capability="builder.manage">
                      <BuilderLibraryPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="builder/:pageId"
                  element={
                    <CapabilityGate capability="builder.manage">
                      <PageBuilderPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="activity"
                  element={
                    <CapabilityGate capability="activity.view">
                      <AdminActivityPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="versions"
                  element={
                    <CapabilityGate capability="versions.restore">
                      <AdminVersionsPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="governance"
                  element={
                    <CapabilityGate capability="admin.access">
                      <GovernancePage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="users"
                  element={
                    <CapabilityGate capability="users.view">
                      <AdminUsersPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="roles"
                  element={
                    <CapabilityGate capability="roles.manage">
                      <AdminRolesPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="approvals"
                  element={
                    <CapabilityGate capability="governance.approve">
                      <AdminApprovalsPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <CapabilityGate capability="activity.view">
                      <AdminAnalyticsPage />
                    </CapabilityGate>
                  }
                />
                <Route
                  path="content-health"
                  element={
                    <CapabilityGate capability="content.review">
                      <AdminContentHealthPage />
                    </CapabilityGate>
                  }
                />
                <Route path="*" element={<NotFound admin />} />
              </Route>
            </Route>
          </Routes>
        </SpaceTransition>
      </RouteJourneyContext.Provider>
      {searchOpen && <SearchDialog />}
      {detail && (
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
      <RouteEffects location={location} />
    </>
  );
}
