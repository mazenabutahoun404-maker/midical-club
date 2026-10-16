import { useLocation } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { MessageKey } from "../../constants/messages";
import { involvementItems, involvedLabel } from "./involvement";
const titles: [string, MessageKey][] = [
  ["/my/exams", "exams"],
  ["/admin/exams", "exams"],
  ["/learn/electronic-exams", "exams"],
  ["/my/study/recall", "recallDesk"],
  ["/my/study/offline", "offlinePacks"],
  ["/my/study/rooms", "quietRooms"],
  ["/my/study", "studyDesk"],
  ["/my/portfolio", "campusPortfolio"],
  ["/portfolio", "campusPortfolio"],
  ["/my/learning", "myLearning"],
  ["/my/progress", "myProgress"],
  ["/my/library", "libraryShort"],
  ["/my/calendar", "calendar"],
  ["/my/notifications", "notifications"],
  ["/my/activities", "myActivities"],
  ["/my/events", "myEvents"],
  ["/my/opportunities", "myOpportunities"],
  ["/my/mentorship", "myMentorship"],
  ["/my/contributions", "myContributions"],
  ["/my/orders", "myOrders"],
  ["/my/applications", "myApplications"],
  ["/my/team", "teamProfile"],
  ["/my/focus", "myFocus"],
  ["/my/profile", "myProfile"],
  ["/my/settings", "personalSettings"],
  ["/my", "mySpace"],
  ["/admin/content-health", "adminContentHealth"],
  ["/admin/analytics", "adminAnalytics"],
  ["/admin/governance", "governanceNavigation"],
  ["/admin/approvals", "governanceApprovals"],
  ["/admin/roles", "governanceRoles"],
  ["/admin/users", "governanceUsers"],
  ["/admin/versions", "adminVersions"],
  ["/admin/activity", "adminActivity"],
  ["/admin/content", "adminContent"],
  ["/admin/builder", "builderNavigation"],
  ["/admin", "adminControlRoom"],
  ["/search", "search"],
  ["/my/search", "personalSearch"],
  ["/learn", "learn"],
  ["/community/media", "media"],
  ["/community/activities", "activities"],
  ["/community/executive-bodies", "executiveBodies"],
  ["/community/honor-plate", "honorPlate"],
  ["/community/hall-of-honor", "hallOfHonor"],
  ["/community/about", "aboutMedClub"],
  ["/community", "community"],
  ["/journal", "journal"],
  ["/mentorship", "mentorship"],
  ["/store", "store"],
  ["/recruitment", "recruitment"],
  ["/utilities", "studyToolsShort"],
  ["/", "home"],
];
export function LocationTitle() {
  const { pathname } = useLocation();
  const { label, t } = useLocale();
  const involved = involvementItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const match = [...titles]
    .sort((a, b) => b[0].length - a[0].length)
    .find(
      ([path]) =>
        pathname === path || (path !== "/" && pathname.startsWith(path + "/")),
    );
  return (
    <div
      className="shell-location"
      aria-label={t({ en: "Current location", ar: "الموقع الحالي" })}
    >
      <span className="shell-location-dot" aria-hidden="true" />
      {involved ? (
        <>
          <span className="shell-location-parent">{t(involvedLabel)}</span>
          <span className="shell-location-separator" aria-hidden="true">
            /
          </span>
          <strong>{t(involved.label)}</strong>
        </>
      ) : (
        <strong>{match ? label(match[1]) : label("home")}</strong>
      )}
    </div>
  );
}
