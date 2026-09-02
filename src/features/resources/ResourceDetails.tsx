import type { Resource } from "../../types/content";
import { useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { DetailFacts } from "../../components/data-display/DetailFacts";
import { Notice } from "../../components/feedback/Notice";
export function ResourceDetails({ item }: { item: Resource }) {
  const { data } = useCourses();
  const { t, label, locale } = useLocale();
  const course = data?.find((c) => c.id === item.courseId);
  return (
    <>
      <DetailFacts
        items={[
          {
            label: label("course"),
            value: course ? t(course.title) : item.courseId,
          },
          {
            label: label("format"),
            value: `${label(item.kind)} · ${item.pages} ${label("pages")}`,
          },
          { label: label("contributor"), value: t(item.contributor) },
          {
            label: label("updated"),
            value: formatDate(item.updatedAt, locale),
          },
        ]}
      />
      <Notice>{label("fileUnavailable")}</Notice>
    </>
  );
}
