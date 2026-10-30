import { useMemo } from "react";
import { useCourses } from "../../../hooks/useContent";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { HomeCourseScene } from "./HomeCourseScene";
export function LatestResources() {
  const { t } = useLocale(),
    courses = useCourses();
  const preview = useMemo(
    () => courses.data?.slice(0, 8) || [],
    [courses.data],
  );
  if (courses.isPending) return <LoadingState />;
  if (courses.isError)
    return <ErrorState retry={() => void courses.refetch()} />;
  if (!preview.length)
    return (
      <EmptyState
        title={t({ en: "No courses yet", ar: "لا توجد مساقات بعد" })}
      />
    );
  return <HomeCourseScene courses={preview} />;
}
