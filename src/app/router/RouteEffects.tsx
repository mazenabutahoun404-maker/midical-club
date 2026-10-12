import { useEffect } from "react";
import type { Location } from "react-router-dom";
import { useLocale } from "../providers/LocaleProvider";
export function RouteEffects({ location }: { location: Location }) {
  const { label, locale } = useLocale();
  useEffect(() => {
    const keys = {
      "/": "home",
      "/my/study": "studyDesk",
      "/my/study/recall": "recallDesk",
      "/my/study/offline": "offlinePacks",
      "/my/study/rooms": "quietRooms",
      "/my/portfolio": "campusPortfolio",
      "/search": "search",
      "/my/search": "personalSearch",
      "/my/calendar": "calendar",
      "/my/notifications": "notifications",
      "/my/activities": "myActivities",
      "/my/events": "myEvents",
      "/my/opportunities": "myOpportunities",
      "/my/mentorship": "myMentorship",
      "/my/contributions": "myContributions",
      "/my/orders": "myOrders",
      "/my/applications": "myApplications",
      "/my/team": "teamProfile",
      "/events": "events",
      "/opportunities": "opportunities",
      "/community": "community",
      "/community/activities": "activities",
      "/community/media": "media",
      "/community/executive-bodies": "executiveBodies",
      "/community/honor-plate": "honorPlate",
      "/community/hall-of-honor": "hallOfHonor",
      "/community/about": "aboutMedClub",
      "/journal": "journal",
      "/mentorship": "mentorship",
      "/mentorship/sessions": "groupSessions",
      "/mentorship/qa": "mentorQA",
      "/contribute": "contribute",
      "/recruitment": "recruitment",
      "/learn": "learn",
      "/learn/basic-sciences": "basic",
      "/learn/clinical-sciences": "clinical",
      "/my": "mySpace",
      "/my/learning": "myLearning",
      "/my/progress": "myProgress",
      "/my/library": "libraryShort",
      "/my/focus": "myFocus",
      "/my/profile": "myProfile",
      "/my/settings": "personalSettings",
      "/utilities": "tools",
      "/store": "store",
      "/store/cart": "cart",
      "/auth/sign-in": "signIn",
      "/auth/register": "createAccount",
      "/auth/verify": "verifyEmail",
      "/auth/recover": "forgotPassword",
      "/admin": "adminOverview",
      "/admin/content": "adminContent",
      "/admin/builder": "builderNavigation",
      "/admin/activity": "adminActivity",
      "/admin/versions": "adminVersions",
      "/admin/governance": "governanceNavigation",
      "/admin/users": "governanceUsers",
      "/admin/roles": "governanceRoles",
      "/admin/approvals": "governanceApprovals",
      "/admin/analytics": "adminAnalytics",
      "/admin/content-health": "adminContentHealth",
      "/learn/electronic-exams": "exams",
    } as const;
    const key = keys[location.pathname as keyof typeof keys];
    const academicChild =
      location.pathname.includes("/batches/") ||
      /^\/learn\/clinical-sciences\/(fourth|fifth|sixth)-year$/.test(
        location.pathname,
      );
    document.title = `${key ? label(key) : label(location.pathname.startsWith("/portfolio/") ? "campusPortfolio" : location.pathname.startsWith("/admin/builder/") ? "builderEditor" : location.pathname.startsWith("/events/") ? "event" : location.pathname.startsWith("/opportunities/") ? "opportunity" : location.pathname.startsWith("/journal/") ? "journal" : location.pathname.startsWith("/store/products/") ? "product" : location.pathname.startsWith("/recruitment/") ? "position" : location.pathname.startsWith("/learn/courses/") || location.pathname.startsWith("/my/learning/") ? "course" : academicChild ? "academic" : "notFound")} | MedClub`;
  }, [location.pathname, locale, label]);
  return null;
}
