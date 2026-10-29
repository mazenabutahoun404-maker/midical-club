import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { collectApiPages } from "../../services/api/mapping";
import type { Resource } from "../../types/content";
import { ApiError } from "../../services/api/client";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { FileUploadWorkbench } from "../resources/FileUploadWorkbench";
import { createRecordId } from "../../lib/record-id";
export function usePrivateCourseFiles(offeringId: string, enabled: boolean) {
  const services = useServices(),
    { snapshot } = useAuth();
  const owner = snapshot.user?.id;
  const query = useQuery({
    queryKey: ["study-files", owner, offeringId],
    queryFn: async () => {
      const rows = await collectApiPages(services.api!, (Page) =>
        services.assets!.study.list({
          OfferingId: offeringId,
          Page,
          PageSize: 100,
        }),
      );
      if (
        rows.some(
          (row) => row.ownerId !== owner || row.offeringId !== offeringId,
        )
      )
        throw new ApiError(
          "File ownership or course context changed.",
          401,
          "SESSION_CHANGED",
        );
      return rows;
    },
    enabled:
      enabled &&
      !!offeringId &&
      !!services.assets &&
      snapshot.status === "authenticated",
    retry: false,
  });
  const resources: Resource[] = (
    enabled && snapshot.status === "authenticated" ? query.data || [] : []
  )
    .filter(
      (row) => row.status === "Ready" && row.malwareScanStatus === "Clean",
    )
    .map((row) => ({
      id: String(row.id),
      assetId: String(row.id),
      sourceRevision: String(row.resourceRevision || row.version),
      courseId: offeringId,
      kind: "notes",
      title: {
        en: String(row.originalFileName),
        ar: String(row.originalFileName),
      },
      updatedAt: String(row.updatedAt),
      pages: 0,
      description: { en: "Private study PDF", ar: "ملف دراسة PDF خاص" },
      contributor: { en: "Your private files", ar: "ملفاتك الخاصة" },
      fileUrl: null,
      keywords: [],
      audience: "batch",
      batchIds: [],
      format: { en: "Private PDF", ar: "PDF خاص" },
      mediaType: "pdf",
      previewAllowed: true,
      downloadAllowed: true,
    }));
  return { query, resources };
}
export function PrivateCourseFiles({
  offeringId,
  query,
}: {
  offeringId: string;
  query: ReturnType<typeof usePrivateCourseFiles>["query"];
}) {
  const { t } = useLocale(),
    services = useServices();
  const [selected, setSelected] = useState<{
      id: string;
      version: string;
      name: string;
      key: string;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  return (
    <section className="access-management-card">
      <h2>
        {t({
          en: "Your private course PDFs",
          ar: "ملفات PDF الخاصة بك لهذا المساق",
        })}
      </h2>
      <FileUploadWorkbench
        scope="study"
        offeringId={offeringId}
        onQueued={() => void query.refetch()}
      />
      <Button
        variant="outline"
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        {t({ en: "Refresh verification status", ar: "تحديث حالة التحقق" })}
      </Button>
      <ApiActionError
        error={query.error || error}
        onReload={() => void query.refetch()}
      />
      {query.data?.map((row) => (
        <div className="access-row" key={String(row.id)}>
          <span>
            <strong>{String(row.originalFileName)}</strong>
            <small>
              {String(row.status)} · {String(row.malwareScanStatus)}
            </small>
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setSelected({
                id: String(row.id),
                version: String(row.version),
                name: String(row.originalFileName),
                key: createRecordId(),
              });
            }}
          >
            {t({ en: "Remove", ar: "إزالة" })}
          </Button>
        </div>
      ))}
      <Modal
        open={!!selected}
        onClose={() => {
          if (!busy) setSelected(null);
        }}
        title={t({ en: "Remove private file", ar: "إزالة الملف الخاص" })}
        description={selected?.name || ""}
      >
        <p>
          {t({
            en: "Remove this file from your private course files?",
            ar: "هل تريد إزالة هذا الملف من ملفات المساق الخاصة بك؟",
          })}
        </p>
        <ApiActionError
          error={error}
          onReload={() => {
            setSelected(null);
            void query.refetch();
          }}
        />
        <Button
          disabled={busy}
          onClick={async () => {
            if (!selected) return;
            setBusy(true);
            try {
              await services.assets!.study.remove(
                selected.id,
                selected.version,
                selected.key,
              );
              setSelected(null);
              await query.refetch();
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          {t({ en: "Confirm removal", ar: "تأكيد الإزالة" })}
        </Button>
      </Modal>
    </section>
  );
}
