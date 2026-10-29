import { useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { APP_TIMEZONE } from "../../constants/config";
import { monthDays, shiftMonth, shiftDay } from "../../lib/calendar";
import { entryDay, localDateTime } from "../../lib/calendar-time";
import { collectApiPages } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import { CalendarSubscriptions } from "./CalendarSubscriptions";
import {
  QueryStatus,
  Confirm,
  useScheduleConnection,
  useScheduleQuery,
  useScheduleAction,
  downloadCalendar,
} from "./shared";
type Entry = Schemas["CalendarEntry"];
export default function LiveCalendar() {
  const { owner } = useScheduleConnection();
  return <Calendar key={owner} />;
}
function Calendar() {
  const { api, services, owner } = useScheduleConnection(),
    { t, label, locale, dir } = useLocale(),
    action = useScheduleAction();
  const today = localDateTime(new Date().toISOString(), APP_TIMEZONE).slice(
    0,
    10,
  );
  const [month, setMonth] = useState(today.slice(0, 7)),
    [day, setDay] = useState<string | null>(today),
    [view, setView] = useState<"month" | "agenda">("month"),
    [source, setSource] = useState("");
  const [detail, setDetail] = useState(""),
    [editor, setEditor] = useState<{ day: string; entry?: Entry } | null>(null),
    [remove, setRemove] = useState(false),
    [subscriptions, setSubscriptions] = useState(false);
  const days = monthDays(month),
    from = days[0],
    to = days.at(-1)!;
  const calendar = useScheduleQuery(
    "calendar",
    (signal) =>
      collectApiPages(services.api!, (Page) =>
        api.get_api_v1_calendar({
          query: {
            from,
            to,
            Page,
            PageSize: 100,
            sources: source ? [source] : undefined,
          },
          signal,
        }),
      ),
    [from, to, source],
  );
  const selected = useScheduleQuery(
    "calendar-entry",
    (signal) => api.get_api_v1_calendar_by_id({ path: { id: detail }, signal }),
    detail,
    !!detail,
  );
  const items = (calendar.data || []).filter(
    (row) => !row.isDeleted && !row.isCancelled,
  ) as Entry[];
  const visible = items.filter(
    (item) =>
      entryDay(item, APP_TIMEZONE).startsWith(month) &&
      (!day || view === "agenda" || entryDay(item, APP_TIMEZONE) === day),
  );
  const sources = [
    ...new Set(
      [...items.map((row) => row.source || ""), source].filter(Boolean),
    ),
  ];
  const formatDay = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      ...options,
      timeZone: "UTC",
    }).format(new Date(date + "T12:00:00Z"));
  const dateLabel = (row: Entry) =>
    row.allDay
      ? `${row.startDate}${row.endDate ? " – " + row.endDate : ""} · ${t({ en: "All day", ar: "طوال اليوم" })}`
      : new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: APP_TIMEZONE,
        }).format(new Date(row.startsAt!)) +
        (row.endsAt
          ? " – " +
            new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: APP_TIMEZONE,
            }).format(new Date(row.endsAt))
          : "");
  function monthMove(count: number) {
    setMonth((m) => shiftMonth(m, count));
    setDay(null);
  }
  function moveFocus(e: KeyboardEvent<HTMLButtonElement>, date: string) {
    let target: string | undefined;
    if (e.key === "ArrowRight") target = shiftDay(date, dir === "rtl" ? -1 : 1);
    if (e.key === "ArrowLeft") target = shiftDay(date, dir === "rtl" ? 1 : -1);
    if (e.key === "ArrowDown") target = shiftDay(date, 7);
    if (e.key === "ArrowUp") target = shiftDay(date, -7);
    if (e.key === "Home")
      target = shiftDay(
        date,
        -((new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7),
      );
    if (e.key === "End")
      target = shiftDay(
        date,
        6 - ((new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7),
      );
    if (target) {
      e.preventDefault();
      setDay(target);
      setMonth(target.slice(0, 7));
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLButtonElement>(
            `button[data-calendar-date="${target}"]`,
          )
          ?.focus(),
      );
    }
  }
  const entry = selected.data,
    editable =
      !!entry &&
      entry.userId === owner &&
      /^(Personal|PersonalEntry)$/i.test(entry.source || "") &&
      !entry.isCancelled &&
      !entry.isDeleted;
  return (
    <div className="container calendar-v3">
      <PageIntro
        eyebrow={label("calendarEyebrow")}
        title={label("calendarTitle")}
        description={t({
          en: "Your account calendar: personal entries and updates from your activities and study plans.",
          ar: "تقويم حسابك: مواعيدك الشخصية وتحديثات أنشطتك وخطط دراستك.",
        })}
      />
      <div className="calendar-toolbar">
        <div className="calendar-month-controls">
          <button
            className="workspace-icon"
            aria-label={label("previousMonth")}
            onClick={() => monthMove(-1)}
          >
            <ChevronLeft className="directional" size={20} />
          </button>
          <h2 aria-live="polite">
            {formatDay(month + "-01", { month: "long", year: "numeric" })}
          </h2>
          <button
            className="workspace-icon"
            aria-label={label("nextMonth")}
            onClick={() => monthMove(1)}
          >
            <ChevronRight className="directional" size={20} />
          </button>
        </div>
        <div className="calendar-toolbar-actions">
          <button
            className="quiet-button"
            onClick={() => {
              setMonth(today.slice(0, 7));
              setDay(today);
            }}
          >
            {t({ en: "Today", ar: "اليوم" })}
          </button>
          <div className="segmented-pills">
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  setDay(null);
                }}
              >
                {label(v === "agenda" ? "calendarAgenda" : "month")}
              </button>
            ))}
          </div>
          <Button
            className="button button-primary"
            onClick={() => setEditor({ day: day || month + "-01" })}
          >
            <Plus size={17} />
            {t({ en: "Add entry", ar: "إضافة موعد" })}
          </Button>
        </div>
      </div>
      <div className="calendar-legend schedule-fields">
        <label>
          {t({ en: "Source", ar: "المصدر" })}
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">
              {t({ en: "All sources", ar: "كل المصادر" })}
            </option>
            {sources.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <QueryStatus query={calendar} />
      {
        <div
          className={
            view === "month"
              ? "calendar-workbench"
              : "calendar-workbench agenda-only"
          }
        >
          {view === "month" && (
            <div className="calendar-board">
              <table className="month-grid" aria-busy={calendar.isFetching}>
                <caption className="sr-only">
                  {formatDay(month + "-01", { month: "long", year: "numeric" })}
                </caption>
                <thead>
                  <tr>
                    {days.slice(0, 7).map((d) => (
                      <th key={d} scope="col">
                        {formatDay(d, { weekday: "short" })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }, (_, row) => (
                    <tr key={row}>
                      {days.slice(row * 7, row * 7 + 7).map((date) => {
                        const entries = items.filter(
                          (v) => entryDay(v, APP_TIMEZONE) === date,
                        );
                        return (
                          <td key={date}>
                            <button
                              data-calendar-date={date}
                              data-outside={!date.startsWith(month)}
                              data-today={date === today}
                              aria-pressed={day === date}
                              tabIndex={
                                date === (day || month + "-01") ? 0 : -1
                              }
                              aria-label={`${formatDay(date, { dateStyle: "full" })}, ${entries.length} ${label("calendar")}`}
                              onKeyDown={(e) => moveFocus(e, date)}
                              onClick={() => {
                                setDay(date);
                                setMonth(date.slice(0, 7));
                              }}
                            >
                              <span>
                                {new Intl.NumberFormat(locale).format(
                                  Number(date.slice(-2)),
                                )}
                              </span>
                              <div className="day-markers" aria-hidden="true">
                                {entries.slice(0, 3).map((v) => (
                                  <i key={v.id} data-kind="study" />
                                ))}
                                {entries.length > 3 && <small>+</small>}
                              </div>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="workspace-note">
                {t({
                  en: `Timed entries are displayed in ${APP_TIMEZONE}. All-day dates stay date-only. Multi-day entries are listed on their starting date.`,
                  ar: `تُعرض المواعيد المؤقتة بتوقيت ${APP_TIMEZONE}. تبقى مواعيد اليوم الكامل دون تحويل زمني. تظهر المواعيد متعددة الأيام في تاريخ بدايتها.`,
                })}
              </p>
            </div>
          )}
          <section className="day-agenda">
            <div className="agenda-heading">
              <CalendarDays size={21} />
              <h3>
                {day
                  ? formatDay(day, { dateStyle: "medium" })
                  : label("calendarAgenda")}
              </h3>
              {day && (
                <button className="quiet-button" onClick={() => setDay(null)}>
                  {label("clearDayFilter")}
                </button>
              )}
            </div>
            {visible.map((row) => (
              <button
                key={row.id}
                className="agenda-entry"
                data-kind="study"
                onClick={() => {
                  setDetail(row.id!);
                  setRemove(false);
                }}
              >
                <span className="agenda-copy">
                  <small>{row.source}</small>
                  <strong>{row.title}</strong>
                  <span>{dateLabel(row)}</span>
                </span>
              </button>
            ))}
            {!calendar.isPending && !calendar.error && !visible.length && (
              <div className="agenda-empty">
                <CalendarDays size={34} />
                <p>{label(day ? "noDayItems" : "noMonthItems")}</p>
              </div>
            )}
          </section>
        </div>
      }
      <div className="calendar-live-tools">
        <div className="student-connected-actions">
          <Button
            variant="outline"
            disabled={action.busy}
            onClick={() =>
              void action.run(
                async () =>
                  downloadCalendar(
                    await api.get_api_v1_calendar_export_ics({
                      query: {
                        from,
                        to,
                        sources: source ? [source] : undefined,
                      },
                    }),
                  ),
                undefined,
                t({ en: "Calendar file downloaded", ar: "نُزّل ملف التقويم" }),
              )
            }
          >
            <Download size={17} />
            {t({ en: "Export visible date range", ar: "تصدير المدة المعروضة" })}
          </Button>
          <Button variant="outline" onClick={() => setSubscriptions((v) => !v)}>
            {t(
              subscriptions
                ? { en: "Close subscriptions", ar: "إغلاق الاشتراكات" }
                : { en: "Calendar subscriptions", ar: "اشتراكات التقويم" },
            )}
          </Button>
        </div>
        {subscriptions && <CalendarSubscriptions />}
        {action.feedback}
      </div>
      {detail && (
        <Modal
          open
          onClose={() => setDetail("")}
          title={
            entry?.title || t({ en: "Calendar entry", ar: "موعد التقويم" })
          }
          description={entry?.description || ""}
        >
          <QueryStatus query={selected} />
          {entry && (
            <>
              <p>{dateLabel(entry)}</p>
              <p>
                {entry.timeZone} · {entry.source}
              </p>
              {(entry.isCancelled || entry.isDeleted) && (
                <p role="alert">
                  {t({
                    en: "This entry is no longer active.",
                    ar: "لم يعد هذا الموعد فعالاً.",
                  })}
                </p>
              )}
              {editable ? (
                <div className="student-connected-actions">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditor({
                        day: entryDay(entry, entry.timeZone || APP_TIMEZONE),
                        entry: { ...entry },
                      });
                      setDetail("");
                    }}
                  >
                    {t({
                      en: "Edit personal entry",
                      ar: "تعديل الموعد الشخصي",
                    })}
                  </Button>
                  <Button variant="outline" onClick={() => setRemove(true)}>
                    {t({ en: "Delete entry", ar: "حذف الموعد" })}
                  </Button>
                </div>
              ) : (
                <p className="schedule-note">
                  {t({
                    en: "This entry is managed by its source. Update the activity or study plan that created it.",
                    ar: "تدير جهة المصدر هذا الموعد. حدّث النشاط أو خطة الدراسة التي أنشأته.",
                  })}
                </p>
              )}
              {remove && (
                <Confirm
                  busy={action.busy}
                  onCancel={() => setRemove(false)}
                  onConfirm={() =>
                    void action.run(
                      () =>
                        api.delete_api_v1_calendar_personal_entries_by_id({
                          path: { id: entry.id! },
                          query: { version: entry.version },
                        }),
                      () => setDetail(""),
                    )
                  }
                >
                  {t({
                    en: "Delete this personal calendar entry?",
                    ar: "حذف هذا الموعد الشخصي؟",
                  })}
                </Confirm>
              )}
              {action.feedback}
            </>
          )}
        </Modal>
      )}
      {editor && (
        <CalendarEntryEditor {...editor} close={() => setEditor(null)} />
      )}
    </div>
  );
}
