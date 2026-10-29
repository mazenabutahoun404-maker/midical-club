import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { usePublicationAction } from "../../features/publications/shared";
import { publicationVersion } from "../../services/api/publication-contracts";
import type { Action } from "./actions";
export type ActionKind =
  | "publish"
  | "archive"
  | "schedule"
  | "restore"
  | "retry"
  | "cancel"
  | "set-current";
export const actionNames: Record<ActionKind, { en: string; ar: string }> = {
  publish: { en: "Publish", ar: "نشر" },
  archive: { en: "Archive", ar: "أرشفة" },
  schedule: { en: "Schedule publication", ar: "جدولة النشر" },
  restore: { en: "Restore to draft", ar: "استعادة إلى المسودة" },
  retry: { en: "Retry schedule", ar: "إعادة محاولة الجدولة" },
  cancel: { en: "Cancel schedule", ar: "إلغاء الجدولة" },
  "set-current": {
    en: "Set current executive body",
    ar: "تعيين الهيئة الحالية",
  },
};
export function ActionDialog({
  kind,
  title,
  version,
  versionId,
  extra = {},
  onExecute,
  onClose,
  allowCompatibility = false,
  allowFutureArchive = true,
}: {
  kind: ActionKind;
  title: string;
  version: string;
  versionId?: string;
  extra?: Partial<Action>;
  onExecute: (body: Action, compatibility: boolean) => Promise<unknown>;
  onClose: () => void;
  allowCompatibility?: boolean;
  allowFutureArchive?: boolean;
}) {
  const { t } = useLocale(),
    [captured] = useState(() => ({
      version: publicationVersion(version),
      versionId,
      ...extra,
    })),
    [reason, setReason] = useState(""),
    [publishAt, setPublishAt] = useState(""),
    [archiveAt, setArchiveAt] = useState(""),
    [compatibility, setCompatibility] = useState(false),
    [reviewed, setReviewed] = useState(false),
    action = usePublicationAction();
  return (
    <Modal
      open
      title={t(actionNames[kind])}
      description={title}
      onClose={onClose}
      className="publication-modal"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              onExecute(
                {
                  ...captured,
                  reason: reason.trim(),
                  ...(publishAt ? { publishAt } : {}),
                  ...(archiveAt ? { archiveAt } : {}),
                },
                compatibility,
              ),
            onClose,
          );
        }}
      >
        <p>
          {kind === "publish"
            ? t({
                en: "This makes the selected saved version public. Unsaved editor changes are not included.",
                ar: "يصبح الإصدار المحفوظ المحدد عامًا. لا تتضمن العملية تغييرات المحرر غير المحفوظة.",
              })
            : kind === "restore"
              ? t({
                  en: "The selected historical version will replace the draft. Review and publish separately.",
                  ar: "يستبدل الإصدار التاريخي المحدد المسودة. راجع وانشر بشكل منفصل.",
                })
              : kind === "schedule"
                ? t({
                    en: "The schedule freezes the selected saved version. Workers recheck permissions and assets at execution.",
                    ar: "تجمّد الجدولة الإصدار المحفوظ المحدد. تُراجع الصلاحيات والملفات عند التنفيذ.",
                  })
                : t({
                    en: "Confirm this change to the reviewed record.",
                    ar: "أكّد هذا التغيير على السجل المراجع.",
                  })}
        </p>
        <label>
          {t({ en: "Reason", ar: "السبب" })}
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {kind === "schedule" && (
          <label>
            {t({
              en: "Publish at — include UTC offset",
              ar: "موعد النشر — أضف فرق التوقيت",
            })}
            <input
              required
              placeholder="2026-11-01T09:00:00+03:00"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
          </label>
        )}
        {((kind === "archive" && allowFutureArchive) ||
          kind === "schedule") && (
          <label>
            {t({
              en:
                kind === "archive"
                  ? "Archive at (optional; blank means now)"
                  : "Archive at (optional)",
              ar:
                kind === "archive"
                  ? "موعد الأرشفة (اختياري؛ الفراغ يعني الآن)"
                  : "موعد الأرشفة (اختياري)",
            })}
            <input
              placeholder="2026-12-01T09:00:00+03:00"
              value={archiveAt}
              onChange={(e) => setArchiveAt(e.target.value)}
            />
          </label>
        )}
        {allowCompatibility && kind === "schedule" && (
          <details>
            <summary>
              {t({ en: "Compatibility option", ar: "خيار التوافق" })}
            </summary>
            <label className="publication-check">
              <input
                type="checkbox"
                checked={compatibility}
                onChange={(e) => setCompatibility(e.target.checked)}
              />
              {t({
                en: "Use the legacy schedule alias for this request",
                ar: "استخدم مسار الجدولة القديم لهذا الطلب",
              })}
            </label>
          </details>
        )}
        <p className="muted">
          {t({ en: "Captured version", ar: "الإصدار الملتقط" })}:{" "}
          <code>{captured.version}</code>
          {versionId && <> · {versionId}</>}
        </p>
        <label className="publication-check">
          <input
            required
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          {t({
            en: "I reviewed the selected record and action.",
            ar: "راجعت السجل والإجراء المحددين.",
          })}
        </label>
        {action.feedback}
        <Button
          type="submit"
          disabled={action.busy || !reviewed || !reason.trim()}
        >
          {t(actionNames[kind])}
        </Button>
      </form>
    </Modal>
  );
}
