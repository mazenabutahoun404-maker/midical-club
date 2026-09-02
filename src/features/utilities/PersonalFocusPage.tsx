import { useStudentProfile } from "../../hooks/useContent";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import StudyToolsPage from "./StudyToolsPage";
export default function PersonalFocusPage() {
  const profile = useStudentProfile();
  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState retry={() => void profile.refetch()} />;
  return <StudyToolsPage durationSeconds={profile.data.focusMinutes * 60} />;
}
