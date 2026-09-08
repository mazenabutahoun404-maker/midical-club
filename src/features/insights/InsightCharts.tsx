import type { CSSProperties } from "react";
import type { AnalyticsPoint, AssessmentAttempt } from "../../types/insights";
import { assessmentPercent } from "../../lib/insights";

function pathFor(values: number[]) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 88 - ((value - min) / spread) * 72;
      return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function EngagementTrend({
  points,
  labels,
}: {
  points: AnalyticsPoint[];
  labels: { opens: string; searches: string; saves: string; accessible: string };
}) {
  const series = [
    { id: "opens", label: labels.opens, values: points.map((point) => point.resourceOpens) },
    { id: "searches", label: labels.searches, values: points.map((point) => point.searches) },
    { id: "saves", label: labels.saves, values: points.map((point) => point.saves) },
  ];
  return (
    <div className="insight-trend" role="img" aria-label={labels.accessible}>
      <div className="insight-chart-legend" aria-hidden="true">
        {series.map((item) => <span key={item.id} data-series={item.id}><i />{item.label}</span>)}
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <g className="insight-grid-lines"><path d="M0 16H100M0 40H100M0 64H100M0 88H100" /></g>
        {series.map((item) => <path key={item.id} data-series={item.id} d={pathFor(item.values)} vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="insight-chart-dates" aria-hidden="true"><span>{points[0]?.date}</span><span>{points.at(-1)?.date}</span></div>
      <ul className="sr-only">
        {points.map((point) => <li key={point.date}>{point.date}: {labels.opens} {point.resourceOpens}, {labels.searches} {point.searches}, {labels.saves} {point.saves}</li>)}
      </ul>
    </div>
  );
}

export function AttemptBars({ attempts, courseNames }: { attempts: AssessmentAttempt[]; courseNames: Map<string, string> }) {
  const visible = [...attempts].sort((a, b) => a.completedAt.localeCompare(b.completedAt)).slice(-8);
  return (
    <div className="attempt-bars" aria-label="Practice result chart">
      {visible.map((attempt) => {
        const score = assessmentPercent(attempt);
        return (
          <div className="attempt-bar" key={attempt.id} title={`${attempt.title}: ${score}%`}>
            <span className="attempt-bar-fill" style={{ "--score": score } as CSSProperties} />
            <strong>{score}%</strong>
            <small>{courseNames.get(attempt.courseId) || attempt.courseId}</small>
          </div>
        );
      })}
    </div>
  );
}
