import { useStudentProfile } from "../../hooks/useContent";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import StudyToolsPage from "./StudyToolsPage";
export default function PersonalFocusPage() {
  const { t } = useLocale();
  const profile = useStudentProfile();
  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState retry={() => void profile.refetch()} />;
  return (
    <>
      <div className="container study-desk-entry">
        <AppLink href="/my/study" className="text-link">
          {t({
            en: "Open your Study Desk: recall, offline packs, and quiet rooms",
            ar: "افتح مكتب الدراسة: الاسترجاع والحزم وغرف الدراسة",
          })}{" "}
          →
        </AppLink>
      </div>
      <StudyToolsPage durationSeconds={profile.data.focusMinutes * 60} />
    </>
  );
}
