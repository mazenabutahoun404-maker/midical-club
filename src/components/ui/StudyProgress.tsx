import { studyProgressValue } from "./study-progress-value";

/** Native progress carries the real value; the decorative fill transitions on updates. */
export function StudyProgress({ value, max, label }: { value: number; max: number; label: string }) {
  const progress = studyProgressValue(value, max);
  return (
    <span className="study-progress">
      <progress
        className="study-progress-native"
        value={progress.value}
        max={progress.max}
        aria-label={label}
      />
      <span className="study-progress-track" aria-hidden="true">
        <span className="study-progress-fill" style={{ transform: `scaleX(${progress.ratio})` }} />
      </span>
    </span>
  );
}
