import type { CSSProperties } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
export function StudyClockFace({
  remaining,
  duration,
  running,
}: {
  remaining: number;
  duration: number;
  running: boolean;
}) {
  const { t } = useLocale();
  const fraction = Math.max(0, Math.min(1, remaining / Math.max(1, duration)));
  return (
    <div
      className="study-alarm-clock"
      data-running={running || undefined}
      style={{ "--clock-fraction": fraction } as CSSProperties}
    >
      <i className="clock-bell clock-bell-left" />
      <i className="clock-bell clock-bell-right" />
      <div className="clock-face">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="clock-dial">
          <circle cx="50" cy="50" r="45" className="clock-track" />
          <circle
            cx="50"
            cy="50"
            r="45"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={(1 - fraction) * 100}
            className="clock-progress"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="M50 12v4"
              transform={`rotate(${i * 30} 50 50)`}
              className="clock-tick"
            />
          ))}
          <path
            d="M50 50V28"
            transform={`rotate(${(1 - fraction) * 360} 50 50)`}
            className="clock-hand"
          />
          <path d="M50 50L36 43" className="clock-hand" />
          <circle cx="50" cy="50" r="2.5" className="clock-hub" />
        </svg>
        <output
          role="timer"
          aria-live="off"
          aria-label={t({ en: "Time remaining", ar: "الوقت المتبقّي" })}
          dir="ltr"
        >
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </output>
      </div>
      <i className="clock-foot clock-foot-left" />
      <i className="clock-foot clock-foot-right" />
    </div>
  );
}
