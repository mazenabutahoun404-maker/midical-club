import { StudyTimerControls, type TimerAction } from "./StudyTimerControls";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NotebookPen, Timer, X, Calculator, Maximize2 } from "lucide-react";
import { StudentNotes } from "../utilities/StudentNotes";
import { GpaCalculator } from "../utilities/GpaCalculator";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useMovableDock } from "./useMovableDock";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { SectionLayout } from "./study-state";
import type { Resource } from "../../types/content";
import type { PageAnchor } from "../../types/study-hub";
import type { CourseNoteRequest, NotesReader } from "../utilities/course-note-model";
import {
  finishStudyTimer,
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
  reader: NotesReader | null;
  setReader: (
    reader: NotesReader | null,
  ) => void;
  noteRequest: CourseNoteRequest | null;
  addNote: (request: Omit<CourseNoteRequest, "token">) => void;
  noteJump: { token: number; anchor: PageAnchor } | null;
  openNote: (anchor: PageAnchor, courseId: string) => boolean;
  registerNoteOpener: (opener: ((anchor: PageAnchor, courseId: string) => boolean) | null) => void;
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
  const [noteRequest, setNoteRequest] = useState<CourseNoteRequest | null>(null);
  const [noteJump, setNoteJump] = useState<StudyToolsValue["noteJump"]>(null);
  const noteSequence = useRef(0);
  const noteOpener = useRef<((anchor: PageAnchor, courseId: string) => boolean) | null>(null);
  const registerNoteOpener = useCallback((opener: typeof noteOpener.current) => { noteOpener.current = opener; }, []);
  const openNote = useCallback((anchor: PageAnchor, courseId: string) => {
    if (!noteOpener.current?.(anchor, courseId)) return false;
    setNoteJump({ token: ++noteSequence.current, anchor });
    setOpen(false);
    return true;
  }, []);
  const flush = useCallback(() => {
    if (!dirty.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(current.current));
      dirty.current = false;
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [key]);
  const update = useCallback((change: (previous: StudyToolState) => StudyToolState) => {
    current.current = change(current.current);
    dirty.current = true;
    setState(current.current);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(flush, 400);
  }, [flush]);
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
  }, [key, flush]);
  const addNote = useCallback((request: Omit<CourseNoteRequest, "token">) => {
    setNoteRequest({ ...request, token: ++noteSequence.current });
    setTool("notes"); setOpen(true);
  }, []);
  const toggleBookmark = useCallback((id: string, page: number) =>
    update((previous) => togglePageBookmark(previous, id, page)), [update]);
  const value = useMemo(() => ({ state, tool, setTool, update, persistent, open,
    setOpen, reader, setReader, noteRequest, noteJump, openNote, registerNoteOpener,
    addNote, toggleBookmark }), [state, tool, update, persistent, open, reader,
      noteRequest, noteJump, openNote, registerNoteOpener, addNote, toggleBookmark]);
  return (
    <Context.Provider value={value}>
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
  resources = [],
}: {
  courseId: string;
  storageKey: string;
  sectionLayout: SectionLayout;
  onSectionLayoutChange: (layout: SectionLayout) => void;
  resources?: Resource[];
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
  const [timerNotice, setTimerNotice] = useState<{
    kind: TimerAction;
    token: number;
    text: string;
  } | null>(null);
  const noticeSequence = useRef(0);
  useEffect(() => {
    if (!timerNotice || timerNotice.kind === "completed") return;
    const timeout = setTimeout(() => setTimerNotice(null), 1600);
    return () => clearTimeout(timeout);
  }, [timerNotice]);
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
    if (!timer || !tools) return;
    const completed = finishStudyTimer(timer, now);
    if (completed) {
      tools.update((previous) => ({ ...previous, timer: completed.timer }));
      const text = t(
        completed.ended !== "rest" && completed.timer.phase !== "rest"
          ? { en: "Session complete", ar: "اكتملت الجلسة" }
          : completed.ended === "rest"
            ? { en: "Rest complete", ar: "اكتملت الاستراحة" }
            : completed.ended === "relax"
              ? {
                  en: "Relaxation complete. Rest is ready.",
                  ar: "اكتمل الاسترخاء. الاستراحة جاهزة.",
                }
              : {
                  en: "Focus complete. Rest is ready.",
                  ar: "اكتمل التركيز. الاستراحة جاهزة.",
                },
      );
      setTimerNotice({
        kind: "completed",
        token: ++noticeSequence.current,
        text,
      });
    }
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
      data-timer-notice={timerNotice?.kind}
      data-dragging={dock.dragging || undefined}
      data-edge={dock.edge || undefined}
      data-tucked={dock.tucked || undefined}
      {...dock.surface}
    >
      <span className="sr-only" role="status">
        {timerNotice?.text}
      </span>
      {timerNotice && (
        <span
          key={timerNotice.token}
          className="study-timer-action-ring"
          aria-hidden="true"
        />
      )}
      {timerNotice?.kind === "completed" && !dock.tucked && (
        <div className="study-timer-complete-note">
          {timerNotice.text}
          <button
            type="button"
            aria-label={t({
              en: "Dismiss timer notice",
              ar: "إغلاق إشعار المؤقّت",
            })}
            onClick={() => setTimerNotice(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
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
          {timerNotice?.kind === "completed" && (
            <span className="study-dock-alert" aria-hidden="true" />
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
                  !dock.tucked &&
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
          <StudyTimerControls
            timer={timer!}
            remaining={remaining}
            onChange={(next, kind) => {
              setNow(Date.now());
              tools.update((previous) => ({ ...previous, timer: next }));
              setTimerNotice({
                kind,
                token: ++noticeSequence.current,
                text: t(
                  kind === "configured"
                    ? { en: "Timer configured", ar: "تم ضبط المؤقّت" }
                    : kind === "started"
                      ? { en: "Timer started", ar: "بدأ المؤقّت" }
                      : kind === "paused"
                        ? { en: "Timer paused", ar: "تم إيقاف المؤقّت مؤقتاً" }
                        : { en: "Timer reset", ar: "تمت إعادة ضبط المؤقّت" },
                ),
              });
            }}
          />
        )}
        {tools.tool === "notes" && (
          <div className="study-notes-book">
            <StudentNotes
              courseId={courseId}
              legacyKey={storageKey}
              resources={resources}
              reader={tools.reader}
              request={tools.noteRequest}
              onOpenAnchor={tools.openNote}
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
          </div>
        )}
        {tools.tool === "gpa" && <GpaCalculator />}
      </aside>
    </div>
  );
}
