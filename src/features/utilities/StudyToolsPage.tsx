import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { NotebookPen, Timer, Calculator, Check } from "lucide-react";
import { StudentNotes } from "./StudentNotes";
import { GpaCalculator } from "./GpaCalculator";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useSiteContent } from "../../hooks/useContent";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { StudyTimerControls } from "../courses/StudyTimerControls";
import {
  emptyStudyTools,
  finishStudyTimer,
  normalizeStudyTools,
  timerRemaining,
} from "../courses/study-tools-state";
import { Checkbox } from "../../components/ui/checkbox";
import "../../styles/study-tools-desk.css";

type Tool = "timer" | "notes" | "gpa";
function Desk({
  duration,
  title,
  description,
}: {
  duration: number;
  title: string;
  description: string;
}) {
  const { snapshot } = useAuth();
  const userId =
    snapshot.status === "authenticated" ? snapshot.user!.id : "guest";
  return (
    <DeskSession
      key={userId}
      storageKey={`medclub:study-tools:${userId}:v1`}
      duration={duration}
      title={title}
      description={description}
    />
  );
}
function DeskSession({
  storageKey,
  duration,
  title,
  description,
}: {
  storageKey: string;
  duration: number;
  title: string;
  description: string;
}) {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const requested = params.get("tool");
  const initialTool: Tool = requested === "notes" || requested === "gpa" ? requested : "timer";
  const [active, setActive] = useState<Tool>(initialTool),
    [visited, setVisited] = useState<Tool[]>([initialTool]);
  const [timer, setTimer] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return normalizeStudyTools({ timer: JSON.parse(raw) }).timer;
    } catch {}
    return {
      ...emptyStudyTools().timer,
      minutes: Math.max(1, Math.min(180, Math.ceil(duration / 60))),
      remaining: duration,
    };
  });
  const [now, setNow] = useState(Date.now()),
    [notice, setNotice] = useState("");
  const [noticeToken, setNoticeToken] = useState(0);
  const current = useRef(timer);
  current.current = timer;
  useEffect(() => {
    const flush = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(current.current));
      } catch {}
    };
    const timeout = setTimeout(flush, 350);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(timeout);
      flush();
      window.removeEventListener("pagehide", flush);
    };
  }, [timer, storageKey]);
  useEffect(() => {
    if (timer.startedAt === null) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(interval);
      if (!document.hidden) {
        setNow(Date.now());
        interval = setInterval(() => setNow(Date.now()), 1000);
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [timer.startedAt]);
  useEffect(() => {
    const completed = finishStudyTimer(timer, now);
    if (!completed) return;
    setTimer(completed.timer);
    setNoticeToken((value) => value + 1);
    setNotice(
      t(
        completed.ended === "rest"
          ? { en: "Rest complete", ar: "اكتملت الاستراحة" }
          : completed.timer.phase === "rest"
            ? {
                en: "Session complete. Your rest timer is ready.",
                ar: "اكتملت الجلسة. مؤقّت الاستراحة جاهز.",
              }
            : { en: "Session complete", ar: "اكتملت الجلسة" },
      ),
    );
  }, [timer, now, t]);
  const names = {
    timer: t({ en: "Timer", ar: "المؤقّت" }),
    notes: t({ en: "Notes", ar: "الملاحظات" }),
    gpa: t({ en: "GPA calculator", ar: "حاسبة المعدّل" }),
  };
  function select(tool: Tool) {
    setActive(tool);
    setVisited((previous) =>
      previous.includes(tool) ? previous : [...previous, tool],
    );
  }
  return (
    <>
      <section
        className="study-tools-hero"
        aria-label={t({ en: "Study desk", ar: "مكتب الدراسة" })}
      >
        <header className="study-desk-intro">
          <span className="eyebrow">
            {t({ en: "Your study desk", ar: "مكتب دراستك" })}
          </span>
          <h1 tabIndex={-1} data-page-heading>
            {title}
          </h1>
          <p>{description}</p>
          <small>
            {t({
              en: "Choose a tool below. Your timer keeps running while you write.",
              ar: "اختر أداة بالأسفل. يستمر المؤقّت أثناء الكتابة.",
            })}
          </small>
        </header>
        <div className="study-tool-stage" data-active-tool={active}>
          <section
            id="tool-stage-timer"
            className="study-tool-scene"
            hidden={active !== "timer"}
            aria-label={names.timer}
          >
            <StudyTimerControls
              timer={timer}
              remaining={timerRemaining(timer, now)}
              onChange={(next, action) => {
                setNow(Date.now());
                setTimer(next);
                setNoticeToken((value) => value + 1);
                setNotice(
                  t(
                    action === "started"
                      ? { en: "Timer started", ar: "بدأ المؤقّت" }
                      : action === "paused"
                        ? { en: "Timer paused", ar: "تم إيقاف المؤقّت مؤقتاً" }
                        : action === "reset"
                          ? { en: "Timer reset", ar: "أُعيد ضبط المؤقّت" }
                          : { en: "Timer configured", ar: "تم ضبط المؤقّت" },
                  ),
                );
              }}
            />
          </section>
          {visited.includes("notes") && (
            <section
              id="tool-stage-notes"
              className="study-tool-scene study-notes-book"
              hidden={active !== "notes"}
              aria-label={names.notes}
            >
              <StudentNotes courseId={params.get("course") || undefined} />
            </section>
          )}
          {visited.includes("gpa") && (
            <section
              id="tool-stage-gpa"
              className="study-tool-scene"
              hidden={active !== "gpa"}
              aria-label={names.gpa}
            >
              <GpaCalculator />
            </section>
          )}
        </div>
      </section>
      <div className="study-desk-notice" role="status">
        {notice && (
          <span key={noticeToken}>
            <Check size={15} aria-hidden="true" />
            {notice}
          </span>
        )}
      </div>
      <nav
        className="study-desk-tools"
        aria-label={t({ en: "Choose a study tool", ar: "اختر أداة دراسة" })}
      >
        {(["timer", "notes", "gpa"] as const).map((tool) => {
          const Icon =
            tool === "timer"
              ? Timer
              : tool === "notes"
                ? NotebookPen
                : Calculator;
          return (
            <button
              type="button"
              key={tool}
              aria-pressed={active === tool}
              aria-controls={`tool-stage-${tool}`}
              onClick={() => select(tool)}
            >
              <Icon size={24} aria-hidden="true" />
              <strong>{names[tool]}</strong>
              <small>
                {t(
                  tool === "timer"
                    ? {
                        en: "Focus · relaxation · rest",
                        ar: "تركيز · استرخاء · استراحة",
                      }
                    : tool === "notes"
                      ? {
                          en: "Your private notebook",
                          ar: "دفتر ملاحظاتك الخاص",
                        }
                      : { en: "Plan your grades", ar: "خطّط لدرجاتك" },
                )}
              </small>
            </button>
          );
        })}
      </nav>
    </>
  );
}
export default function StudyToolsPage({
  durationSeconds,
}: {
  durationSeconds?: number;
}) {
  const query = useSiteContent(),
    { t, label } = useLocale();
  const [checked, setChecked] = useState<number[]>([]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (!query.data) return null;
  const data = query.data;
  const duration = Math.max(
    1,
    Math.min(10800, durationSeconds || data.study.durationSeconds || 1500),
  );
  return (
    <div className="container study-tools-page">
      <Desk
        duration={duration}
        title={t(data.study.title)}
        description={t(data.study.description)}
      />
      <section className="study-desk-checklist">
        <h2>{label("before")}</h2>
        <div className="study-checklist">
          {data.study.checklist.map((item, index) => (
            <label key={index}>
              <Checkbox
                checked={checked.includes(index)}
                onCheckedChange={(value) =>
                  setChecked((previous) =>
                    value === true
                      ? [...previous, index]
                      : previous.filter((i) => i !== index),
                  )
                }
              />
              <span className={checked.includes(index) ? "completed-task" : ""}>
                {t(item)}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
