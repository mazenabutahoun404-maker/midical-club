import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { APP_TIMEZONE } from "../../constants/config";
import { localDateTime } from "../../lib/calendar-time";
import { shiftMonth } from "../../lib/calendar";
import { CalendarEntryEditor } from "../../features/schedule/CalendarEntryEditor";
import {
  AudienceFields,
  audienceRequest,
  emptyAudience,
} from "../../features/schedule/AudienceFields";
import {
  Panel,
  Pager,
  QueryStatus,
  Confirm,
  useScheduleAction,
  useScheduleConnection,
  useScheduleQuery,
} from "../../features/schedule/shared";
import type { Schemas } from "../../services/api/schema.generated";
import { ApiError } from "../../services/api/client";
import { Campaigns } from "./Campaigns";
export default function AdminSchedulePage() {
  const { owner } = useScheduleConnection();
  return <ScheduleAdmin key={owner} />;
}
function ScheduleAdmin() {
  const { t } = useLocale(),
    access = useAccess(),
    [tab, setTab] = useState("calendar");
  const calendar = !!access.data?.permissions?.includes(
      "calendar.admin.manage",
    ),
    campaigns = !!access.data?.permissions?.includes(
      "notifications.campaigns.manage",
    );
  const active =
    (tab === "calendar" && calendar) || !campaigns ? "calendar" : "campaigns";
  return (
    <div className="container student-connected">
      <PageIntro
        title={t({ en: "Calendar & notifications", ar: "التقويم والإشعارات" })}
        description={t({
          en: "Manage shared calendar entries and review notification audiences before publishing.",
          ar: "أدر المواعيد المشتركة وراجع جمهور الإشعارات قبل النشر.",
        })}
      />
      <QueryStatus query={access} />
      <nav className="student-connected-tabs">
        {calendar && (
          <Button
            variant="outline"
            aria-pressed={active === "calendar"}
            onClick={() => setTab("calendar")}
          >
            {t({ en: "Calendar entries", ar: "مواعيد التقويم" })}
          </Button>
        )}
        {campaigns && (
          <Button
            variant="outline"
            aria-pressed={active === "campaigns"}
            onClick={() => setTab("campaigns")}
          >
            {t({ en: "Notification campaigns", ar: "حملات الإشعارات" })}
          </Button>
        )}
      </nav>
      {active === "calendar" && calendar && <AdminCalendar />}
      {active === "campaigns" && campaigns && <Campaigns />}
    </div>
  );
}
function AdminCalendar() {
  const { api } = useScheduleConnection(),
    { t, locale } = useLocale(),
    action = useScheduleAction();
  const today = localDateTime(new Date().toISOString(), APP_TIMEZONE).slice(
    0,
    10,
  );
  const [from, setFrom] = useState(today.slice(0, 7) + "-01"),
    [to, setTo] = useState(shiftMonth(today.slice(0, 7), 1) + "-01"),
    [team, setTeam] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState("");
  const [editor, setEditor] = useState<{
      day: string;
      entry?: Schemas["CalendarEntry"];
    } | null>(null),
    [remove, setRemove] = useState(false),
    [audience, setAudience] = useState<Schemas["CalendarEntry"] | null>(null);
  const list = useScheduleQuery(
    "admin-calendar",
    (signal) =>
      api.get_api_v1_admin_calendar_entries({
        query: {
          from,
          to,
          Page: page,
          PageSize: 20,
          teamId: team || undefined,
        },
        signal,
      }),
    [from, to, page, team],
  );
  const detail = useScheduleQuery(
      "calendar-entry",
      (signal) =>
        api.get_api_v1_calendar_by_id({ path: { id: selected }, signal }),
      selected,
      !!selected,
    ),
    entry = detail.data;
  return (
    <>
      <Panel title={t({ en: "Shared entries", ar: "المواعيد المشتركة" })}>
        <div className="schedule-fields student-connected-grid">
          <label>
            {t({ en: "From", ar: "من" })}
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {t({ en: "To", ar: "إلى" })}
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {t({ en: "Team ID (optional)", ar: "معرّف الفريق (اختياري)" })}
            <input
              value={team}
              onChange={(e) => {
                setTeam(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <QueryStatus query={list} />
        {list.data?.items.map((row) => (
          <div key={row.id} className="student-connected-row">
            <div>
              <strong>{row.title}</strong>
              <small>
                {row.allDay
                  ? `${row.startDate}${row.endDate ? " – " + row.endDate : ""}`
                  : new Date(row.startsAt!).toLocaleString(locale, {
                      timeZone: row.timeZone,
                    })}{" "}
                · {row.source}
                {row.isCancelled ? " · Cancelled" : ""}
                {row.isDeleted ? " · Deleted" : ""}
              </small>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(row.id);
                setRemove(false);
              }}
            >
              {t({ en: "Open entry", ar: "فتح الموعد" })}
            </Button>
          </div>
        ))}
        {!list.isPending && !list.error && !list.data?.items.length && (
          <p>
            {t({
              en: "No entries in this range.",
              ar: "لا توجد مواعيد في هذه المدة.",
            })}
          </p>
        )}
        <Pager page={page} total={list.data?.total || 0} onChange={setPage} />
        <Button onClick={() => setEditor({ day: today })}>
          {t({ en: "New shared entry", ar: "موعد مشترك جديد" })}
        </Button>
      </Panel>
      {selected && (
        <Panel
          title={
            entry?.title || t({ en: "Calendar entry", ar: "موعد التقويم" })
          }
        >
          <QueryStatus query={detail} />
          {entry && (
            <>
              <p>{entry.description}</p>
              <p>
                {entry.timeZone} · {entry.source}
              </p>
              {!entry.isDeleted && !entry.isCancelled && (
                <div className="student-connected-actions">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEditor({ day: today, entry: { ...entry } })
                    }
                  >
                    {t({ en: "Edit entry", ar: "تعديل الموعد" })}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAudience({ ...entry })}
                  >
                    {t({ en: "Replace audience", ar: "استبدال الجمهور" })}
                  </Button>
                  <Button variant="outline" onClick={() => setRemove(true)}>
                    {t({ en: "Delete entry", ar: "حذف الموعد" })}
                  </Button>
                </div>
              )}
              {remove && (
                <Confirm
                  busy={action.busy}
                  onCancel={() => setRemove(false)}
                  onConfirm={() =>
                    void action.run(
                      () =>
                        api.delete_api_v1_admin_calendar_entries_by_id({
                          path: { id: entry.id! },
                          query: { version: entry.version },
                        }),
                      () => {
                        setSelected("");
                        setRemove(false);
                      },
                    )
                  }
                >
                  {t({
                    en: "Delete this shared entry using its reviewed version?",
                    ar: "حذف هذا الموعد المشترك بالإصدار الذي راجعته؟",
                  })}
                </Confirm>
              )}
            </>
          )}
        </Panel>
      )}
      {editor && (
        <CalendarEntryEditor admin {...editor} close={() => setEditor(null)} />
      )}
      {audience && (
        <AudienceReplacement
          key={`${audience.id}:${audience.version}`}
          entry={audience}
          close={() => setAudience(null)}
        />
      )}
      {action.feedback}
    </>
  );
}
function AudienceReplacement({
  entry,
  close,
}: {
  entry: Schemas["CalendarEntry"];
  close: () => void;
}) {
  const { api } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction(),
    [audience, setAudience] = useState(emptyAudience),
    [ack, setAck] = useState(false);
  return (
    <Panel
      title={t({
        en: "Replace calendar audience",
        ar: "استبدال جمهور التقويم",
      })}
    >
      <p>
        {t({
          en: "The current audience is not included in the entry response. Enter the complete replacement audience; this is not an addition to the existing one.",
          ar: "لا يتضمن رد الموعد الجمهور الحالي. أدخل الجمهور البديل كاملاً؛ لن يُضاف إلى الجمهور السابق.",
        })}
      </p>
      <form
        className="schedule-fields"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() => {
            if (!ack)
              throw new ApiError(
                "Confirm complete audience replacement.",
                422,
                "CONFIRM_REQUIRED",
              );
            return api.put_api_v1_admin_calendar_entries_by_id_audience({
              path: { id: entry.id! },
              body: {
                version: entry.version!,
                audience: audienceRequest(audience),
              },
            });
          }, close);
        }}
      >
        <AudienceFields value={audience} onChange={setAudience} />
        <label className="schedule-inline">
          <input
            type="checkbox"
            checked={ack}
            required
            onChange={(e) => setAck(e.target.checked)}
          />
          {t({
            en: "I reviewed this complete replacement",
            ar: "راجعت الاستبدال الكامل",
          })}
        </label>
        <div className="student-connected-actions">
          <Button disabled={action.busy}>
            {t({ en: "Replace audience", ar: "استبدال الجمهور" })}
          </Button>
          <Button type="button" variant="outline" onClick={close}>
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
        </div>
        {action.feedback}
      </form>
    </Panel>
  );
}
