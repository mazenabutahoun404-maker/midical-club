import { Pause, Play, RotateCcw, Timer, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { StudyClockFace } from "./StudyClockFace";
import "../../styles/physical-study-tools.css";
import { timerRemaining, type StudyTimer } from "./study-tools-state";
export type TimerAction =
  "configured" | "started" | "paused" | "reset" | "completed";
export function StudyTimerControls({
  timer,
  remaining,
  onChange,
}: {
  timer: StudyTimer;
  remaining: number;
  onChange: (timer: StudyTimer, action: TimerAction) => void;
}) {
  const { t } = useLocale();
  const [sessionInput, setSessionInput] = useState(String(timer.minutes)),
    [restInput, setRestInput] = useState(String(timer.restMinutes));
  useEffect(() => {
    setSessionInput(String(timer.minutes));
    setRestInput(String(timer.restMinutes));
  }, [timer.minutes, timer.restMinutes]);
  const invalid =
    !sessionInput ||
    !Number.isInteger(Number(sessionInput)) ||
    Number(sessionInput) < 1 ||
    Number(sessionInput) > 180 ||
    !restInput ||
    !Number.isInteger(Number(restInput)) ||
    Number(restInput) < 0 ||
    Number(restInput) > 60;
  return (
    <section className="study-focus-timer" data-timer-phase={timer.phase}>
      <div
        className="study-timer-modes"
        role="group"
        aria-label={t({ en: "Timer type", ar: "نوع المؤقّت" })}
      >
        {(["focus", "relax"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={timer.mode === mode}
            onClick={() => {
              const minutes = mode === "focus" ? 25 : 10;
              onChange(
                {
                  ...timer,
                  mode,
                  phase: mode,
                  minutes,
                  remaining: minutes * 60,
                  startedAt: null,
                },
                "configured",
              );
            }}
          >
            {mode === "focus" ? <Timer size={16} /> : <Leaf size={16} />}{" "}
            {t(
              mode === "focus"
                ? { en: "Focus", ar: "تركيز" }
                : { en: "Relaxation", ar: "استرخاء" },
            )}
          </button>
        ))}
      </div>
      <div className="study-timer-durations">
        <label>
          {t({ en: "Session minutes", ar: "دقائق الجلسة" })}
          <input
            type="number"
            min={1}
            max={180}
            value={sessionInput}
            aria-invalid={
              !sessionInput ||
              Number(sessionInput) < 1 ||
              Number(sessionInput) > 180 ||
              !Number.isInteger(Number(sessionInput))
            }
            onBlur={() => setSessionInput(String(timer.minutes))}
            onChange={(event) => {
              setSessionInput(event.target.value);
              const minutes = Number(event.target.value);
              if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 180)
                onChange(
                  {
                    ...timer,
                    minutes,
                    phase: timer.mode,
                    remaining: minutes * 60,
                    startedAt: null,
                  },
                  "configured",
                );
            }}
          />
        </label>
        <label>
          {t({ en: "Rest minutes", ar: "دقائق الاستراحة" })}
          <input
            type="number"
            min={0}
            max={60}
            value={restInput}
            aria-invalid={
              !restInput ||
              Number(restInput) < 0 ||
              Number(restInput) > 60 ||
              !Number.isInteger(Number(restInput))
            }
            onBlur={() => setRestInput(String(timer.restMinutes))}
            onChange={(event) => {
              setRestInput(event.target.value);
              if (!event.target.value) return;
              const restMinutes = Number(event.target.value);
              if (
                Number.isInteger(restMinutes) &&
                restMinutes >= 0 &&
                restMinutes <= 60
              )
                onChange(
                  {
                    ...timer,
                    restMinutes,
                    phase: timer.mode,
                    remaining: timer.minutes * 60,
                    startedAt: null,
                  },
                  "configured",
                );
            }}
          />
        </label>
      </div>
      {invalid && (
        <small role="status">
          {t({
            en: "Session: 1–180 minutes. Rest: 0–60 minutes.",
            ar: "الجلسة: ١–١٨٠ دقيقة. الاستراحة: ٠–٦٠ دقيقة.",
          })}
        </small>
      )}
      <p className="study-timer-phase-label">
        {t(
          timer.phase === "rest"
            ? {
                en: "Rest · start when you are ready",
                ar: "استراحة · ابدأ عندما تكون مستعداً",
              }
            : timer.mode === "relax"
              ? { en: "Relaxation session", ar: "جلسة استرخاء" }
              : { en: "Focus session", ar: "جلسة تركيز" },
        )}
      </p>
      <StudyClockFace
        remaining={remaining}
        duration={
          (timer.phase === "rest" ? timer.restMinutes : timer.minutes) * 60
        }
        running={timer.startedAt !== null}
      />
      <div className="study-timer-actions">
        <button
          type="button"
          disabled={invalid}
          onClick={() => {
            const at = Date.now();
            const running = timer.startedAt !== null;
            onChange(
              {
                ...timer,
                remaining: running
                  ? timerRemaining(timer, at)
                  : timer.remaining ||
                    (timer.phase === "rest"
                      ? timer.restMinutes
                      : timer.minutes) * 60,
                startedAt: running ? null : at,
              },
              running ? "paused" : "started",
            );
          }}
        >
          {timer.startedAt ? <Pause size={16} /> : <Play size={16} />}{" "}
          {t(
            timer.startedAt
              ? { en: "Pause", ar: "إيقاف مؤقت" }
              : { en: "Start", ar: "ابدأ" },
          )}
        </button>
        <button
          type="button"
          aria-label={t({ en: "Reset timer", ar: "إعادة ضبط المؤقّت" })}
          onClick={() =>
            onChange(
              {
                ...timer,
                phase: timer.mode,
                remaining: timer.minutes * 60,
                startedAt: null,
              },
              "reset",
            )
          }
        >
          <RotateCcw size={16} />
        </button>
      </div>
      {remaining === 0 && (
        <p role="status">
          {t({ en: "Session complete.", ar: "اكتملت الجلسة." })}
        </p>
      )}
    </section>
  );
}
