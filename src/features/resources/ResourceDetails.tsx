import type { Resource } from "../../types/content";
import { useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { DetailFacts } from "../../components/data-display/DetailFacts";
import { Notice } from "../../components/feedback/Notice";
import { Button } from "../../components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
export function ResourceDetails({ item }: { item: Resource }) {
  const { data } = useCourses();
  const { state, send, isPending } = useWorkspace();
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
            value: `${t(item.format)} · ${item.durationMinutes ? `${item.durationMinutes} min` : `${item.pages} ${label("pages")}`}`,
          },
          {
            label: label("batch"),
            value: label(
              item.audience === "shared" ? "sharedResource" : "batchResource",
            ),
          },
          { label: label("contributor"), value: t(item.contributor) },
          {
            label: label("updated"),
            value: formatDate(item.updatedAt, locale),
          },
        ]}
      />
      <Notice>{label("fileUnavailable")}</Notice>
      <div className="resource-review-control">
        <Button
          variant="outline"
          disabled={isPending}
          aria-pressed={state.reviewedResourceIds.includes(item.id)}
          onClick={() => void send({ type: "toggle-reviewed", id: item.id })}
        >
          <CheckCircle2 size={17} />
          {label(
            state.reviewedResourceIds.includes(item.id)
              ? "unmarkReviewed"
              : "markReviewed",
          )}
        </Button>
        <small>{label("reviewNote")}</small>
      </div>
    </>
  );
}
