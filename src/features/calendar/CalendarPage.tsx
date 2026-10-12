import { useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock3,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { SelectField } from "../../components/forms/SelectField";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { formatDate } from "../../lib/dates";
import {
  calendarDate,
  dateAtNoon,
  monthDays,
  shiftDay,
  shiftMonth,
} from "../../lib/calendar";
import { DEMO_TODAY } from "../../constants/config";
import { useCalendar } from "./useCalendar";
import { StudyEditor } from "./StudyEditor";
import type { CalendarItem, StudyEntry } from "../../types/workspace";
export const calendarKindLabels = {
  study: "studyBlock",
  exam: "examDate",
  event: "savedEvent",
  deadline: "deadlineDate",
  mentorship: "mentorship",
  recruitment: "recruitment",
} as const;
export default function CalendarPage() {
  const { label, t, locale, dir } = useLocale();
  const workspace = useWorkspace(),
    calendar = useCalendar();
  const [month, setMonth] = useState(DEMO_TODAY.slice(0, 7)),
    [day, setDay] = useState<string | null>(DEMO_TODAY);
  const [view, setView] = useState<"month" | "agenda">("month"),
    [kind, setKind] = useState("");
  const [editor, setEditor] = useState<{
      day: string;
      entry?: StudyEntry;
    } | null>(null),
    [detail, setDetail] = useState<CalendarItem | null>(null);
  if (calendar.isError) return <ErrorState retry={calendar.retry} />;
  if (calendar.isPending) return <LoadingState />;
  const visible = calendar.items.filter(
    (i) =>
      (!kind || kind === i.kind) && calendarDate(i.startsAt).startsWith(month),
  );
  const selectedItems = visible.filter(
    (i) => !day || calendarDate(i.startsAt) === day,
  );
  const days = monthDays(month);
  const moveMonth = (count: number) => {
    setMonth(shiftMonth(month, count));
    setDay(null);
  };
  function moveFocus(e: KeyboardEvent<HTMLButtonElement>, date: string) {
    let target: string | undefined;
    if (e.key === "ArrowRight") target = shiftDay(date, dir === "rtl" ? -1 : 1);
    if (e.key === "ArrowLeft") target = shiftDay(date, dir === "rtl" ? 1 : -1);
    if (e.key === "ArrowDown") target = shiftDay(date, 7);
    if (e.key === "ArrowUp") target = shiftDay(date, -7);
    if (e.key === "Home")
      target = shiftDay(
        date,
        -((new Date(dateAtNoon(date)).getUTCDay() + 6) % 7),
      );
    if (e.key === "End")
      target = shiftDay(
        date,
        6 - ((new Date(dateAtNoon(date)).getUTCDay() + 6) % 7),
      );
    if (!target) return;
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
  const openItem = (item: CalendarItem) => {
    if (item.kind === "study")
      setEditor({
        day: calendarDate(item.startsAt),
        entry: workspace.state.studyEntries.find((e) => e.id === item.id),
      });
    else setDetail(item);
  };
  return (
    <div className="container calendar-v3">
      <PageIntro
        eyebrow={label("calendarEyebrow")}
        title={label("calendarTitle")}
        description={label("calendarDescription")}
      />
      <div className="calendar-toolbar">
        <div className="calendar-month-controls">
          <button
            className="workspace-icon"
            aria-label={label("previousMonth")}
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft className="directional" size={20} />
          </button>
          <h2 aria-live="polite">
            {formatDate(dateAtNoon(month + "-01"), locale, {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            className="workspace-icon"
            aria-label={label("nextMonth")}
            onClick={() => moveMonth(1)}
          >
            <ChevronRight className="directional" size={20} />
          </button>
        </div>
        <div className="calendar-toolbar-actions">
          <button
            className="quiet-button"
            onClick={() => {
              setMonth(DEMO_TODAY.slice(0, 7));
              setDay(DEMO_TODAY);
            }}
          >
            {label("today")}
          </button>
          <div className="segmented-pills" aria-label={label("calendar")}>
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  setDay(null);
                }}
              >
                {label(v === "agenda" ? "calendarAgenda" : v)}
              </button>
            ))}
          </div>
          <Button
            className="button button-primary"
            onClick={() => setEditor({ day: day || month + "-01" })}
          >
            <Plus size={17} />
            {label("addStudy")}
          </Button>
        </div>
      </div>
      <div className="calendar-legend">
        <SelectField
          label={label("searchType")}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">{label("allTypes")}</option>
          {Object.entries(calendarKindLabels).map(([key, value]) => (
            <option key={key} value={key}>
              {label(value)}
            </option>
          ))}
        </SelectField>
        <div>
          {Object.entries(calendarKindLabels).map(([key, value]) => (
            <span key={key}>
              <i data-kind={key} />
              {label(value)}
            </span>
          ))}
        </div>
      </div>
      <div
        className={
          view === "month"
            ? "calendar-workbench"
            : "calendar-workbench agenda-only"
        }
      >
        {view === "month" && (
          <div className="calendar-board">
            <table className="month-grid">
              <caption className="sr-only">
                {formatDate(dateAtNoon(month + "-01"), locale, {
                  month: "long",
                  year: "numeric",
                })}
              </caption>
              <thead>
                <tr>
                  {days.slice(0, 7).map((d) => (
                    <th scope="col" key={d}>
                      {formatDate(dateAtNoon(d), locale, { weekday: "short" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, row) => (
                  <tr key={row}>
                    {days.slice(row * 7, row * 7 + 7).map((date) => {
                      const entries = calendar.items.filter(
                        (i) =>
                          (!kind || kind === i.kind) &&
                          calendarDate(i.startsAt) === date,
                      );
                      return (
                        <td key={date}>
                          <button
                            data-calendar-date={date}
                            data-outside={!date.startsWith(month)}
                            data-today={date === DEMO_TODAY}
                            aria-pressed={day === date}
                            tabIndex={date === (day || month + "-01") ? 0 : -1}
                            aria-label={`${formatDate(dateAtNoon(date), locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${entries.length} ${label("calendar")}`}
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
                              {entries.slice(0, 3).map((item) => (
                                <i key={item.id} data-kind={item.kind} />
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
            <p className="workspace-note">{label("timezoneNote")}</p>
          </div>
        )}
        <section className="day-agenda">
          <div className="agenda-heading">
            <CalendarDays size={21} />
            <h3>
              {day
                ? formatDate(dateAtNoon(day), locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })
                : label("calendarAgenda")}
            </h3>
            {day && (
              <button className="quiet-button" onClick={() => setDay(null)}>
                {label("clearDayFilter")}
              </button>
            )}
          </div>
          {(view === "month" ? selectedItems : visible).map((item) => (
            <button
              key={item.id}
              className="agenda-entry"
              data-kind={item.kind}
              data-study-entry-id={item.id}
              onClick={() => openItem(item)}
            >
              <span className="agenda-date">
                {formatDate(item.startsAt, locale, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="agenda-copy">
                <small>{label(calendarKindLabels[item.kind])}</small>
                <strong>{t(item.title)}</strong>
                <span>
                  <Clock3 size={13} />
                  {formatDate(item.startsAt, locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {item.endsAt &&
                    ` – ${formatDate(item.endsAt, locale, { hour: "2-digit", minute: "2-digit" })}`}
                </span>
              </span>
            </button>
          ))}
          {!(view === "month" ? selectedItems : visible).length && (
            <div className="agenda-empty">
              <CalendarDays size={34} />
              <p>{label(day ? "noDayItems" : "noMonthItems")}</p>
              <button
                className="text-link"
                onClick={() => setEditor({ day: day || month + "-01" })}
              >
                {label("addStudy")} <Plus size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
      <p className="workspace-note">{label("calendarSampleNote")}</p>
      {editor && (
        <StudyEditor
          day={editor.day}
          entry={editor.entry}
          close={() => setEditor(null)}
        />
      )}
      {detail && (
        <Modal
          open
          onClose={() => setDetail(null)}
          title={t(detail.title)}
          description={t(detail.description)}
        >
          <p>
            {formatDate(detail.startsAt, locale, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <p className="workspace-note">{label("calendarSampleNote")}</p>
        </Modal>
      )}
    </div>
  );
}
