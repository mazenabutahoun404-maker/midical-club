import { useState } from "react";
import type { Resource } from "../../types/content";
import { resourceId } from "../../lib/resource-identity";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import { record, string } from "../../services/api/mapping";
import { resolveLearningTarget } from "../../services/api/learning-target";
import { useStudentConnection, useStudentAction } from "./shared";

/** Explicit sync: local reader position stays local until the student saves it. */
export function ReaderProgress({
  item,
  page,
}: {
  item: Resource;
  page: number;
}) {
  const { services, owner } = useStudentConnection();
  if (!services.studentApi || !owner || !item.assetId) return null;
  return (
    <ProgressButton
      key={`${owner}:${item.id}:${item.sourceRevision}`}
      item={item}
      page={page}
    />
  );
}
function ProgressButton({ item, page }: { item: Resource; page: number }) {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [saved, setSaved] = useState<number | null>(null);
  return (
    <div className="student-reader-sync">
      <Button
        variant="outline"
        disabled={action.busy}
        onClick={() =>
          void action.run(
            async () => {
              const path = await resolveLearningTarget(
                api,
                resourceId(item),
                t(item.title),
              );
              let response: unknown = null;
              try {
                response =
                  await api.get_api_v1_student_learning_progress_by_contentType_by_contentId(
                    { path },
                  );
              } catch (e) {
                if (!(e instanceof ApiError && e.status === 404)) throw e;
              }
              const current = record(response),
                progress = record(current.progress);
              if (current.contentChanged)
                throw new ApiError(
                  "The published content changed. Reload before saving progress.",
                  409,
                  "CONTENT_CHANGED",
                );
              await api.put_api_v1_student_learning_progress_by_contentType_by_contentId(
                {
                  path,
                  body: {
                    occurredAt: new Date().toISOString(),
                    expectedVersion: string(progress.version) || null,
                    lastPage: page,
                    totalPages: item.pages > 0 ? item.pages : null,
                    publishedVersionId:
                      string(progress.publishedVersionId) || null,
                  },
                },
              );
              await api.post_api_v1_student_recent_items_by_itemType_by_itemId_opened(
                {
                  path: { itemType: path.contentType, itemId: path.contentId },
                },
              );
            },
            () => setSaved(page),
          )
        }
      >
        {t({ en: "Save reading position", ar: "حفظ موضع القراءة" })}
      </Button>
      {saved !== null && (
        <small role="status">
          {t({
            en: `Page ${saved} saved to your account`,
            ar: `حُفظت الصفحة ${saved} في حسابك`,
          })}
        </small>
      )}
      {action.feedback}
    </div>
  );
}
