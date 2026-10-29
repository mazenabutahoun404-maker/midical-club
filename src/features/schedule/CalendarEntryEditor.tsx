import { useState } from "react";
import { ApiError } from "../../services/api/client";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { APP_TIMEZONE } from "../../constants/config";
import type { Schemas } from "../../services/api/schema.generated";
import { localDateTime, zonedInstant } from "../../lib/calendar-time";
import { shiftDay } from "../../lib/calendar";
import {
  calendarRequest,
  invalid,
} from "../../services/api/schedule-contracts";
import { useScheduleAction, useScheduleConnection } from "./shared";
import {
  AudienceFields,
  audienceRequest,
  emptyAudience,
} from "./AudienceFields";
type Entry = Schemas["CalendarEntry"];
export function CalendarEntryEditor({
  entry,
  day,
  admin = false,
  close,
}: {
  entry?: Entry;
  day: string;
  admin?: boolean;
  close: () => void;
}) {
  const { api } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction();
  const [draft, setDraft] = useState(() => ({
    title: entry?.title || "",
    description: entry?.description || "",
    allDay: entry?.allDay || false,
    timeZone: entry?.timeZone || APP_TIMEZONE,
    start: entry?.startsAt
      ? localDateTime(entry.startsAt, entry.timeZone || APP_TIMEZONE)
      : day + "T09:00",
    end: entry?.endsAt
      ? localDateTime(entry.endsAt, entry.timeZone || APP_TIMEZONE)
      : day + "T10:00",
    startDate: entry?.startDate || day,
    endDate: entry?.endDate || shiftDay(day, 1),
    startOffset: "",
    endOffset: "",
    color: entry?.color || "",
    targetType: entry?.targetType || "",
    targetId: entry?.targetId || "",
    teamId: entry?.teamId || "",
  }));
  const [version, setVersion] = useState(entry?.version),
    [latest, setLatest] = useState<Entry | null>(null);
  const [reminders, setReminders] = useState<Schemas["ReminderRequest"][]>([]),
    [ack, setAck] = useState(false),
    [audience, setAudience] = useState(emptyAudience);
  const patch = (v: Partial<typeof draft>) =>
    setDraft((old) => ({ ...old, ...v }));
  function body(): Schemas["CalendarRequest"] {
    if (entry && !ack)
      invalid("Review the complete reminder replacement before saving.");
    const time = (local: string, offset: string, original?: string | null) =>
      original &&
      entry?.timeZone === draft.timeZone &&
      localDateTime(original, draft.timeZone) === local &&
      !offset
        ? original
        : zonedInstant(local, draft.timeZone, offset || undefined);
    const result: Schemas["CalendarRequest"] = {
      title: draft.title.trim(),
      description: draft.description || null,
      allDay: draft.allDay,
      timeZone: draft.timeZone,
      startsAt: draft.allDay
        ? null
        : time(draft.start, draft.startOffset, entry?.startsAt),
      endsAt: draft.allDay
        ? null
        : time(draft.end, draft.endOffset, entry?.endsAt),
      startDate: draft.allDay ? draft.startDate : null,
      endDate: draft.allDay ? draft.endDate : null,
      color: draft.color || null,
      targetType: draft.targetType || null,
      targetId: draft.targetId || null,
      reminders,
      ...(entry ? { version } : {}),
      ...(admin
        ? {
            teamId: draft.teamId || null,
            ...(!entry ? { audience: audienceRequest(audience) } : {}),
          }
        : {}),
    };
    calendarRequest(result);
    return result;
  }
  return (
    <Modal
      open
      onClose={close}
      title={t(
        entry
          ? { en: "Edit calendar entry", ar: "تعديل موعد التقويم" }
          : { en: "New calendar entry", ar: "موعد جديد" },
      )}
      description={t({
        en: "Times follow the selected time zone. Saving updates your account calendar.",
        ar: "تتبع الأوقات المنطقة الزمنية المحددة. يحدّث الحفظ تقويم حسابك.",
      })}
    >
      <form
        className="schedule-fields"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() => {
            const request = body();
            return admin
              ? entry
                ? api.put_api_v1_admin_calendar_entries_by_id({
                    path: { id: entry.id! },
                    body: request,
                  })
                : api.post_api_v1_admin_calendar_entries({ body: request })
              : entry
                ? api.put_api_v1_calendar_personal_entries_by_id({
                    path: { id: entry.id! },
                    body: request,
                  })
                : api.post_api_v1_calendar_personal_entries({ body: request });
          }, close);
        }}
      >
        <label>
          {t({ en: "Title", ar: "العنوان" })}
          <input
            required
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label>
          {t({ en: "Description", ar: "الوصف" })}
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </label>
        <label className="schedule-inline">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(e) => patch({ allDay: e.target.checked })}
          />
          {t({ en: "All day", ar: "طوال اليوم" })}
        </label>
        <label>
          {t({ en: "Time zone", ar: "المنطقة الزمنية" })}
          <input
            required
            value={draft.timeZone}
            onChange={(e) => patch({ timeZone: e.target.value })}
          />
        </label>
        <div className="student-connected-grid">
          {draft.allDay ? (
            <>
              <label>
                {t({ en: "Start date", ar: "تاريخ البداية" })}
                <input
                  type="date"
                  required
                  value={draft.startDate}
                  onChange={(e) => patch({ startDate: e.target.value })}
                />
              </label>
              <label>
                {t({ en: "End date", ar: "تاريخ النهاية" })}
                <input
                  type="date"
                  required
                  value={draft.endDate}
                  onChange={(e) => patch({ endDate: e.target.value })}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                {t({ en: "Starts", ar: "البداية" })}
                <input
                  type="datetime-local"
                  required
                  value={draft.start}
                  onChange={(e) => patch({ start: e.target.value })}
                />
              </label>
              <label>
                {t({ en: "Ends", ar: "النهاية" })}
                <input
                  type="datetime-local"
                  required
                  value={draft.end}
                  onChange={(e) => patch({ end: e.target.value })}
                />
              </label>
            </>
          )}
        </div>
        {!draft.allDay && (
          <details>
            <summary>
              {t({
                en: "UTC offsets for repeated daylight-saving times",
                ar: "فرق التوقيت للأوقات المتكررة عند تغيير التوقيت الصيفي",
              })}
            </summary>
            <label>
              {t({
                en: "Start offset (optional)",
                ar: "فرق البداية (اختياري)",
              })}
              <input
                placeholder="+03:00"
                value={draft.startOffset}
                onChange={(e) => patch({ startOffset: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "End offset (optional)", ar: "فرق النهاية (اختياري)" })}
              <input
                placeholder="+03:00"
                value={draft.endOffset}
                onChange={(e) => patch({ endOffset: e.target.value })}
              />
            </label>
          </details>
        )}
        <fieldset>
          <legend>{t({ en: "Reminders", ar: "التذكيرات" })}</legend>
          {entry && (
            <p className="schedule-note">
              {t({
                en: "The API does not return existing reminders. Enter the complete desired list; saving may replace the previous list.",
                ar: "لا تعيد الخدمة التذكيرات الحالية. أدخل القائمة المطلوبة كاملة؛ قد يستبدل الحفظ القائمة السابقة.",
              })}
            </p>
          )}
          {reminders.map((r, index) => (
            <div key={index} className="schedule-reminder">
              <div>
                <label>
                  {t({ en: "Reminder timing", ar: "وقت التذكير" })}
                  <select
                    value={r.at != null ? "at" : "before"}
                    onChange={(e) =>
                      setReminders((v) =>
                        v.map((x, i) =>
                          i === index
                            ? e.target.value === "at"
                              ? { at: "" }
                              : { minutesBefore: 15 }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="before">
                      {t({ en: "Minutes before", ar: "دقائق قبل الموعد" })}
                    </option>
                    <option value="at">
                      {t({
                        en: "Exact time (ISO with offset)",
                        ar: "وقت دقيق بصيغة ISO مع فرق التوقيت",
                      })}
                    </option>
                  </select>
                </label>
                {r.at != null ? (
                  <label>
                    {t({ en: "Exact reminder time", ar: "وقت التذكير الدقيق" })}
                    <input
                      required
                      placeholder="2026-10-26T09:00:00+03:00"
                      value={r.at}
                      onChange={(e) =>
                        setReminders((v) =>
                          v.map((x, i) =>
                            i === index ? { at: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                ) : (
                  <label>
                    {t({ en: "Minutes before", ar: "دقائق قبل الموعد" })}
                    <input
                      type="number"
                      required
                      min="0"
                      value={r.minutesBefore ?? 15}
                      onChange={(e) =>
                        setReminders((v) =>
                          v.map((x, i) =>
                            i === index
                              ? { minutesBefore: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setReminders((v) => v.filter((_, i) => i !== index))
                }
              >
                {t({ en: "Remove reminder", ar: "إزالة التذكير" })}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setReminders((v) => [...v, { minutesBefore: 15 }])}
          >
            {t({ en: "Add reminder", ar: "إضافة تذكير" })}
          </Button>
          {entry && (
            <label className="schedule-inline">
              <input
                type="checkbox"
                required
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              {t({
                en: "I reviewed the complete reminder list to send",
                ar: "راجعت قائمة التذكيرات الكاملة التي ستُرسل",
              })}
            </label>
          )}
        </fieldset>
        <details>
          <summary>
            {t({ en: "Optional metadata", ar: "بيانات إضافية" })}
          </summary>
          <label>
            {t({ en: "Color", ar: "اللون" })}
            <input
              value={draft.color}
              onChange={(e) => patch({ color: e.target.value })}
            />
          </label>
          <label>
            {t({ en: "Target type", ar: "نوع الهدف" })}
            <input
              value={draft.targetType}
              onChange={(e) => patch({ targetType: e.target.value })}
            />
          </label>
          <label>
            {t({ en: "Target ID", ar: "معرّف الهدف" })}
            <input
              value={draft.targetId}
              onChange={(e) => patch({ targetId: e.target.value })}
            />
          </label>
          {admin && (
            <label>
              {t({ en: "Team ID (optional)", ar: "معرّف الفريق (اختياري)" })}
              <input
                value={draft.teamId}
                onChange={(e) => patch({ teamId: e.target.value })}
              />
            </label>
          )}
        </details>
        {admin && !entry && (
          <AudienceFields value={audience} onChange={setAudience} />
        )}
        {entry &&
          action.error instanceof ApiError &&
          [409, 412].includes(action.error.status) && (
            <Button
              type="button"
              variant="outline"
              disabled={action.busy}
              onClick={() =>
                void action.run(
                  () =>
                    api.get_api_v1_calendar_by_id({ path: { id: entry.id! } }),
                  (result) => setLatest(result as Entry),
                  t({
                    en: "Latest saved entry loaded. Your draft is kept.",
                    ar: "حُمّل الموعد المحفوظ الحالي. احتفظنا بمسودتك.",
                  }),
                )
              }
            >
              {t({
                en: "Review latest saved entry",
                ar: "مراجعة الموعد المحفوظ الحالي",
              })}
            </Button>
          )}
        {latest && (
          <aside className="schedule-confirm">
            <h3>
              {t({ en: "Latest saved entry", ar: "الموعد المحفوظ الحالي" })}
            </h3>
            <strong>{latest.title}</strong>
            <p>{latest.description}</p>
            <p>
              {latest.allDay
                ? `${latest.startDate} – ${latest.endDate || ""}`
                : `${latest.startsAt} – ${latest.endsAt || ""}`}{" "}
              · {latest.timeZone}
            </p>
            <p>
              {t({
                en: "Your draft remains unchanged. Choosing it replaces the saved entry's fields on your next Save.",
                ar: "تبقى مسودتك دون تغيير. سيستبدل اختيارها حقول الموعد المحفوظ عند الحفظ التالي.",
              })}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={latest.isDeleted || latest.isCancelled || action.busy}
              onClick={() => {
                setVersion(latest.version);
                setLatest(null);
              }}
            >
              {t({
                en: "Keep my draft over this saved entry",
                ar: "استخدام مسودتي بدلاً من هذا الموعد المحفوظ",
              })}
            </Button>
          </aside>
        )}
        {action.feedback}
        <div className="student-connected-actions">
          <Button disabled={action.busy}>
            {t({ en: "Save entry", ar: "حفظ الموعد" })}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={action.busy}
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
