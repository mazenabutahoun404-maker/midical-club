import { useLocale } from "../../app/providers/LocaleProvider";
import { useResources } from "../../hooks/useContent";
import { Button } from "../../components/ui/button";
import { collectApiPages, record, string } from "../../services/api/mapping";
import { resolveLearningTarget } from "../../services/api/learning-target";
import { ApiError } from "../../services/api/client";
import {
  useStudentAction,
  useStudentConnection,
  useStudentQuery,
} from "./shared";
export function LiveReviewButton({ id }: { id: string }) {
  const { api, services, authenticated } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction(),
    resources = useResources();
  const assetId = id.split(":")[0];
  const list = useStudentQuery(
    "all-progress",
    () =>
      collectApiPages(services.api!, (Page) =>
        api.get_api_v1_student_learning_progress({
          query: { Page, PageSize: 100 },
        }),
      ),
    "",
    authenticated,
  );
  const entry = list.data?.find(
      (row) => record(row.progress).contentId === assetId,
    ),
    progress = record(entry?.progress),
    reviewed = progress.isCompleted === true;
  return (
    <div>
      <Button
        variant="outline"
        disabled={
          !authenticated || action.busy || list.isPending || !!list.error
        }
        aria-pressed={reviewed}
        onClick={() =>
          void action.run(async () => {
            const resource = resources.data?.find((r) => r.id === id);
            let path = string(progress.contentType)
              ? {
                  contentType: string(progress.contentType),
                  contentId: assetId,
                }
              : resource
                ? await resolveLearningTarget(api, assetId, t(resource.title))
                : null;
            if (!path)
              throw new ApiError(
                "Open Search to choose the published learning resource.",
                422,
                "LEARNING_TARGET_UNAVAILABLE",
              );
            let current: unknown = null;
            try {
              current =
                await api.get_api_v1_student_learning_progress_by_contentType_by_contentId(
                  { path },
                );
            } catch (e) {
              if (!(e instanceof ApiError && e.status === 404)) throw e;
            }
            if (record(current).contentChanged)
              throw new ApiError(
                "The published content changed. Open its current version first.",
                409,
                "CONTENT_CHANGED",
              );
            let version = string(record(record(current).progress).version);
            if (!version) {
              const created =
                await api.put_api_v1_student_learning_progress_by_contentType_by_contentId(
                  {
                    path,
                    body: {
                      occurredAt: new Date().toISOString(),
                      positionPercent: 0,
                      expectedVersion: null,
                    },
                  },
                );
              version = string(record(record(created).progress).version);
            }
            await api.post_api_v1_student_learning_progress_by_contentType_by_contentId_complete(
              {
                path,
                body: { completed: !reviewed, expectedVersion: version },
              },
            );
          })
        }
      >
        {t(
          reviewed
            ? { en: "Unmark reviewed", ar: "إلغاء المراجعة" }
            : { en: "Mark reviewed", ar: "تمت المراجعة" },
        )}
      </Button>
      {action.feedback}
    </div>
  );
}
