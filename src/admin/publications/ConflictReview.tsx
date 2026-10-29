import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import { publicationVersion } from "../../services/api/publication-contracts";
import { usePublicationAction } from "../../features/publications/shared";
import { PublicDocument } from "../../features/publications/Publications";
import { PublishedContent } from "../../features/resources/PublishedContent";
export function ConflictReview({
  load,
  onUse,
  about = false,
}: {
  load: () => Promise<unknown>;
  onUse: (version: string) => void;
  about?: boolean;
}) {
  const { t } = useLocale(),
    [latest, setLatest] = useState<Record<string, unknown> | null>(null),
    action = usePublicationAction();
  return (
    <section className="publication-conflict">
      <p>
        {t({
          en: "Your editor draft is kept. Review the latest saved record before choosing a version for your next save.",
          ar: "تبقى مسودة المحرر محفوظة هنا. راجع أحدث سجل محفوظ قبل اختيار إصدار لمحاولة الحفظ التالية.",
        })}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={action.busy}
        onClick={() =>
          void action.run(
            load,
            (v) => setLatest(record(v)),
            t({
              en: "Latest record loaded for review",
              ar: "حُمّل أحدث سجل للمراجعة",
            }),
          )
        }
      >
        {t({ en: "Review latest saved record", ar: "مراجعة أحدث سجل محفوظ" })}
      </Button>
      {action.feedback}
      {latest && (
        <>
          <p>
            {t({ en: "Latest saved version", ar: "أحدث إصدار محفوظ" })}:{" "}
            <code>{string(latest.version)}</code>
          </p>
          {about ? (
            <PublishedContent
              content={{ ...record(latest.document), visible: true }}
            />
          ) : (
            <PublicDocument value={latest.document} />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onUse(publicationVersion(latest.version))}
          >
            {t({
              en: "Keep my draft using this reviewed version",
              ar: "الاحتفاظ بمسودتي باستخدام هذا الإصدار المراجع",
            })}
          </Button>
          <p>
            {t({
              en: "This only chooses the reviewed version. Save draft remains a separate action and replaces the complete draft document.",
              ar: "يختار هذا الإصدار المراجع فقط. يظل حفظ المسودة إجراءً منفصلًا يستبدل مستند المسودة الكامل.",
            })}
          </p>
        </>
      )}
    </section>
  );
}
