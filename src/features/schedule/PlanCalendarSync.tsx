import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { Confirm, useScheduleAction, useScheduleConnection } from "./shared";
export function PlanCalendarSync({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) {
  const { api } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction(),
    [confirm, setConfirm] = useState(false);
  return (
    <div className="student-connected-panel">
      <h3>{t({ en: "Calendar synchronization", ar: "مزامنة التقويم" })}</h3>
      <p>
        {t(
          enabled
            ? {
                en: "Calendar sync is enabled for this saved plan.",
                ar: "مزامنة التقويم مفعّلة لهذه الخطة المحفوظة.",
              }
            : {
                en: "Send this plan's saved sessions to your account calendar.",
                ar: "أرسل جلسات هذه الخطة المحفوظة إلى تقويم حسابك.",
              },
        )}
      </p>
      <div className="student-connected-actions">
        <Button
          variant="outline"
          disabled={action.busy}
          onClick={() => setConfirm(true)}
        >
          {t({
            en: "Synchronize saved sessions",
            ar: "مزامنة الجلسات المحفوظة",
          })}
        </Button>
        <AppLink href="/my/calendar">
          {t({ en: "Open calendar", ar: "فتح التقويم" })}
        </AppLink>
      </div>
      {confirm && (
        <Confirm
          busy={action.busy}
          onCancel={() => setConfirm(false)}
          onConfirm={() =>
            void action.run(
              () =>
                api.post_api_v1_study_plans_by_id_calendar_sync({
                  path: { id },
                }),
              () => setConfirm(false),
              t({
                en: "Calendar synchronization request completed. Open the calendar to review the entries.",
                ar: "اكتمل طلب المزامنة. افتح التقويم لمراجعة المواعيد.",
              }),
            )
          }
        >
          {t({
            en: "Synchronize the saved sessions of this plan? Unsaved preview changes are not included.",
            ar: "مزامنة جلسات هذه الخطة المحفوظة؟ لن تتضمن التغييرات غير المحفوظة في المعاينة.",
          })}
        </Confirm>
      )}
      {action.feedback}
    </div>
  );
}
