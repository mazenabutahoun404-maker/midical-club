import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Timer,
  X,
  Calculator,
  Maximize2,
} from "lucide-react";
import { StudentNotes } from "../utilities/StudentNotes";
import { GpaCalculator } from "../utilities/GpaCalculator";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useMovableDock } from "./useMovableDock";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SectionLayoutControl } from "./SectionLayoutControl";
import type { SectionLayout } from "./study-state";
import {
  emptyStudyTools,
  normalizeStudyTools,
  timerRemaining,
  togglePageBookmark,
  type StudyToolState,
} from "./study-tools-state";

interface StudyToolsValue {
  tool: "timer" | "notes" | "gpa";
  setTool: (tool: "timer" | "notes" | "gpa") => void;
  state: StudyToolState;
  update: (change: (previous: StudyToolState) => StudyToolState) => void;
  persistent: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  reader: { id: string; title: string; page: number } | null;
  setReader: (
    reader: { id: string; title: string; page: number } | null,
  ) => void;
  toggleBookmark: (id: string, page: number) => void;
}
const Context = createContext<StudyToolsValue | null>(null);
export const useStudyTools = () => useContext(Context);
export function StudyToolsProvider({
  storageKey,
  children,
}: {
  storageKey: string;
  children: ReactNode;
}) {
  const key = storageKey + ":tools:v1";
  const [state, setState] = useState(() => {
    try {
      return normalizeStudyTools(
        JSON.parse(localStorage.getItem(key) || "null"),
      );
    } catch {
      return emptyStudyTools();
    }
  });
  const current = useRef(state),
    dirty = useRef(false),
    debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [persistent, setPersistent] = useState(true),
    [open, setOpen] = useState(false);
  const [tool, setTool] = useState<StudyToolsValue["tool"]>("timer");
  const [reader, setReader] = useState<StudyToolsValue["reader"]>(null);
  function flush() {
    if (!dirty.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(current.current));
      dirty.current = false;
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }
  function update(change: (previous: StudyToolState) => StudyToolState) {
    current.current = change(current.current);
    dirty.current = true;
    setState(current.current);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(flush, 400);
  }
  useEffect(() => {
    const storage = (event: StorageEvent) => {
      if (event.key === key && !dirty.current) {
        try {
          current.current = normalizeStudyTools(
            JSON.parse(event.newValue || "null"),
          );
          setState(current.current);
        } catch {}
      }
    };
    const visibility = () => {
      if (document.hidden) flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(debounce.current);
      if (dirty.current) {
        try {
          localStorage.setItem(key, JSON.stringify(current.current));
        } catch {}
      }
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [key]);
  return (
    <Context.Provider
      value={{
        state,
        tool,
        setTool,
        update,
        persistent,
        open,
        setOpen,
        reader,
        setReader,
        toggleBookmark: (id, page) =>
          update((previous) => togglePageBookmark(previous, id, page)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function StudyToolsButton() {
  const tools = useStudyTools(),
    { t } = useLocale();
  if (!tools) return null;
  return (
    <button
      type="button"
      className="notebook-button study-tools-trigger"
      aria-expanded={tools.open}
      aria-controls="study-tools-panel"
      onClick={() => tools.setOpen(!tools.open)}
      aria-label={t({ en: "Study tools", ar: "أدوات الدراسة" })}
      title={t({ en: "Study tools", ar: "أدوات الدراسة" })}
    >
      <NotebookPen size={18} />
      <span>{t({ en: "Tools", ar: "الأدوات" })}</span>
    </button>
  );
}
export function StudyToolsPanel({
  courseId,
  storageKey,
  sectionLayout,
  onSectionLayoutChange,
}: {
  courseId: string;
  storageKey: string;
  sectionLayout: SectionLayout;
  onSectionLayoutChange: (layout: SectionLayout) => void;
}) {
  const tools = useStudyTools(),
    { t } = useLocale();
  const { focus, setFocus, courseNavigationVisible } = useStudyChrome();
  const dock = useMovableDock(
    storageKey,
    courseNavigationVisible,
    !!tools?.open,
  );
  const [now, setNow] = useState(Date.now());
  const panel = useRef<HTMLElement>(null),
    lastTrigger = useRef<HTMLElement | null>(null);
  const timer = tools?.state.timer;
  const remaining = timer ? timerRemaining(timer, now) : 0;
  useEffect(() => {
    if (!timer?.startedAt) return;
    setNow(Date.now());
    let interval: ReturnType<typeof setInterval> | undefined;
    const resume = () => {
      clearInterval(interval);
      if (!document.hidden) {
        setNow(Date.now());
        interval = setInterval(() => setNow(Date.now()), 1000);
      }
    };
    resume();
    document.addEventListener("visibilitychange", resume);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [timer?.startedAt]);
  useEffect(() => {
    if (timer?.startedAt && remaining === 0)
      tools?.update((previous) => ({
        ...previous,
        timer: { ...previous.timer, remaining: 0, startedAt: null },
      }));
  }, [remaining, timer?.startedAt]);
  useEffect(() => {
    if (!tools?.open) return;
    lastTrigger.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() =>
      panel.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true }),
    );
  }, [tools?.open]);
  if (!tools) return null;
  function close() {
    tools!.setOpen(false);
    lastTrigger.current?.focus({ preventScroll: true });
  }
  return (
    <div
      className="study-tool-dock"
      ref={dock.root}
      style={dock.style}
      data-movable
      data-dragging={dock.dragging || undefined}
      data-edge={dock.edge || undefined}
      data-tucked={dock.tucked || undefined}
      {...dock.surface}
    >
      {dock.edge && (
        <button
          ref={dock.handle}
          type="button"
          className="study-dock-handle"
          aria-label={t({
            en: "Reveal study tools",
            ar: "إظهار أدوات الدراسة",
          })}
          aria-expanded={!dock.tucked}
          aria-controls="study-tool-strip"
          {...dock.handleGrip}
          onClick={dock.handleAction}
          title={t({
            en: "Hover or click to open · Drag to move · Arrow keys to adjust",
            ar: "مرّر أو اضغط للفتح · اسحب للتحريك · الأسهم للضبط",
          })}
        >
          <span className="study-dock-tab" aria-hidden="true">
            <i className="study-dock-dots" />
          </span>
          {timer!.startedAt && (
            <output
              className="study-dock-time"
              aria-label={t({ en: "Time remaining", ar: "الوقت المتبقّي" })}
              aria-live="off"
            >
              {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, "0")}
            </output>
          )}
        </button>
      )}
      <div
        className="study-tool-content"
        inert={dock.tucked || undefined}
        aria-hidden={dock.tucked || undefined}
      >
        <button
          type="button"
          className="study-tool-grip"
          {...dock.grip}
          aria-label={t({ en: "Move study tools", ar: "تحريك أدوات الدراسة" })}
          title={t({
            en: "Drag to move · Arrow keys to adjust · Home to reset",
            ar: "اسحب للتحريك · الأسهم للضبط · Home لإعادة الموضع",
          })}
        >
          <span aria-hidden="true" />
        </button>
        <div
          className="study-tool-strip"
          id="study-tool-strip"
          role="toolbar"
          aria-label={t({
            en: "Study tools",
            ar: "أدوات الدراسة",
          })}
        >
          {(["timer", "notes", "gpa"] as const).map((tool) => {
            const Icon =
              tool === "timer"
                ? Timer
                : tool === "notes"
                  ? NotebookPen
                  : Calculator;
            const name = t(
              tool === "timer"
                ? { en: "Focus timer", ar: "مؤقّت التركيز" }
                : tool === "notes"
                  ? { en: "Private notes", ar: "ملاحظات خاصة" }
                  : { en: "GPA calculator", ar: "حاسبة المعدّل" },
            );
            return (
              <button
                type="button"
                key={tool}
                title={name}
                aria-label={name}
                aria-pressed={tools.open && tools.tool === tool}
                aria-controls="study-tools-panel"
                onClick={() => {
                  tools.setTool(tool);
                  tools.setOpen(!(tools.open && tools.tool === tool));
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {tool === "timer" &&
                  (!tools.open || tools.tool !== "timer") &&
                  (timer!.startedAt ||
                    timer!.remaining < timer!.minutes * 60) && (
                    <output
                      className="study-timer-badge"
                      role="timer"
                      aria-live="off"
                      data-below={Number(dock.style.top) < 65 || undefined}
                      data-running={!!timer!.startedAt}
                      aria-label={t({
                        en: "Time remaining",
                        ar: "الوقت المتبقّي",
                      })}
                    >
                      {Math.floor(remaining / 60)}:
                      {String(remaining % 60).padStart(2, "0")}
                    </output>
                  )}
                <span>
                  {t(
                    tool === "timer"
                      ? { en: "Timer", ar: "مؤقّت" }
                      : tool === "notes"
                        ? { en: "Notes", ar: "ملاحظات" }
                        : { en: "GPA", ar: "المعدّل" },
                  )}
                </span>
              </button>
            );
          })}
          <SectionLayoutControl
            value={sectionLayout}
            focus={focus}
            onChange={onSectionLayoutChange}
          />
          {focus && (
            <button
              type="button"
              className="study-exit-focus"
              aria-label={t({
                en: "Exit study focus",
                ar: "الخروج من تركيز الدراسة",
              })}
              title={t({
                en: "Exit study focus",
                ar: "الخروج من تركيز الدراسة",
              })}
              onClick={() => {
                close();
                setFocus(false);
                requestAnimationFrame(() => {
                  const mobile = document.querySelector<HTMLButtonElement>(
                    ".shelf-mobile-control button",
                  );
                  const target = mobile?.getBoundingClientRect().height
                    ? mobile
                    : document.querySelector<HTMLButtonElement>(
                        '.notebook-tools button[aria-pressed="false"]',
                      );
                  target?.focus({ preventScroll: true });
                });
              }}
            >
              <Maximize2 size={17} aria-hidden="true" />
              <span>{t({ en: "Exit", ar: "خروج" })}</span>
            </button>
          )}
        </div>
      </div>
      <aside
        ref={panel}
        id="study-tools-panel"
        className="study-tools-panel"
        style={dock.panelStyle}
        data-open={tools.open || undefined}
        hidden={!tools.open}
        aria-label={t({ en: "Study tools", ar: "أدوات الدراسة" })}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <header>
          <strong>
            {t(
              tools.tool === "timer"
                ? { en: "Your study desk", ar: "مكتب دراستك" }
                : tools.tool === "notes"
                  ? { en: "Your private notebook", ar: "دفتر ملاحظاتك الخاص" }
                  : { en: "Grade planning", ar: "تخطيط الدرجات" },
            )}
          </strong>
          <button
            type="button"
            className="notebook-icon-button"
            aria-label={t({
              en: "Close study tools",
              ar: "إغلاق أدوات الدراسة",
            })}
            onClick={close}
          >
            <X size={18} />
          </button>
        </header>
        {tools.tool === "timer" && (
          <section className="study-focus-timer">
            <label htmlFor="study-timer-duration">
              <Timer size={17} />
              {t({ en: "Focus timer", ar: "مؤقّت التركيز" })}
            </label>
            <select
              id="study-timer-duration"
              value={timer!.minutes}
              onChange={(event) => {
                const minutes = Number(event.target.value);
                tools.update((previous) => ({
                  ...previous,
                  timer: { minutes, remaining: minutes * 60, startedAt: null },
                }));
                setNow(Date.now());
              }}
            >
              {[5, 15, 25, 45].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} {t({ en: "minutes", ar: "دقيقة" })}
                </option>
              ))}
            </select>
            <output
              role="timer"
              aria-live="off"
              aria-label={t({ en: "Time remaining", ar: "الوقت المتبقّي" })}
            >
              {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, "0")}
            </output>
            <div>
              <button
                type="button"
                onClick={() => {
                  const at = Date.now();
                  setNow(at);
                  tools.update((previous) => ({
                    ...previous,
                    timer: {
                      ...previous.timer,
                      remaining: previous.timer.startedAt
                        ? timerRemaining(previous.timer, at)
                        : previous.timer.remaining ||
                          previous.timer.minutes * 60,
                      startedAt: previous.timer.startedAt ? null : at,
                    },
                  }));
                }}
              >
                {timer!.startedAt ? <Pause size={16} /> : <Play size={16} />}
                {t(
                  timer!.startedAt
                    ? { en: "Pause", ar: "إيقاف مؤقت" }
                    : { en: "Start", ar: "ابدأ" },
                )}
              </button>
              <button
                type="button"
                aria-label={t({ en: "Reset timer", ar: "إعادة ضبط المؤقّت" })}
                onClick={() =>
                  tools.update((previous) => ({
                    ...previous,
                    timer: {
                      ...previous.timer,
                      remaining: previous.timer.minutes * 60,
                      startedAt: null,
                    },
                  }))
                }
              >
                <RotateCcw size={16} />
              </button>
            </div>
            {remaining === 0 && (
              <p role="status">
                {t({
                  en: "Session complete. Take a short break.",
                  ar: "اكتملت الجلسة. خذ استراحة قصيرة.",
                })}
              </p>
            )}
          </section>
        )}
        {tools.tool === "notes" && (
          <StudentNotes
            courseId={courseId}
            legacyKey={storageKey}
            reference={
              tools.reader
                ? tools.reader.title +
                  " · " +
                  t({ en: "Page", ar: "صفحة" }) +
                  " " +
                  tools.reader.page
                : undefined
            }
          />
        )}
        {tools.tool === "gpa" && <GpaCalculator />}
      </aside>
    </div>
  );
}
