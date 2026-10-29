import { HomeSectionState } from "./HomeSectionState";
import { useMemo } from "react";
import { useCourses } from "../../../hooks/useContent";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { HomeCourseScene } from "./HomeCourseScene";
export function LatestResources() {
  const { t } = useLocale(),
    courses = useCourses();
  const preview = useMemo(
    () => courses.data?.slice(0, 8) || [],
    [courses.data],
  );
  if (courses.isPending || courses.isError || !preview.length)
    return <HomeSectionState kind="courses" query={courses} />;
  return <HomeCourseScene courses={preview} />;
}
