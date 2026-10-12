import { throwToTrash } from "../../components/feedback/action-flight";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  Download,
  LockKeyhole,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import { PageIntro } from "../../components/data-display/PageIntro";
import { useCourses, useResources } from "../../hooks/useContent";
import { downloadCsv } from "../../lib/csv";
import { formatDate } from "../../lib/dates";
import { assessmentPercent, consecutiveStudyDays } from "../../lib/insights";
import { coursePath } from "../../constants/routes";
import { AttemptBars } from "./InsightCharts";
import { useAcademicInsights } from "./useInsights";

export default function AcademicProgressPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { label, t, locale } = useLocale();
  const courses = useCourses();
  const resources = useResources();
  const insights = useAcademicInsights();
  const workspace = useWorkspace();
  const [formOpen, setFormOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [correct, setCorrect] = useState("");
  const [total, setTotal] = useState("");
  const [completedAt, setCompletedAt] = useState("2026-09-08");

  const selectedCourses = useMemo(
    () =>
      courses.data?.filter((course) =>
        insights.profile.data?.courseIds.includes(course.id),
      ) || [],
    [courses.data, insights.profile.data?.courseIds],
  );
  const courseNames = useMemo(
    () =>
      new Map(selectedCourses.map((course) => [course.id, t(course.title)])),
    [selectedCourses, t],
  );
  if (
    courses.isPending ||
    resources.isPending ||
    insights.isPending ||
    workspace.isPending
  )
    return <LoadingState />;
  if (
    courses.isError ||
    resources.isError ||
    insights.isError ||
    workspace.isError ||
    !insights.record
  )
    return (
      <ErrorState
        retry={() => {
          void courses.refetch();
          void resources.refetch();
          insights.retry();
          workspace.retry();
        }}
      />
    );

  const record = insights.record;
  const reviewed = workspace.state.reviewedResourceIds.length;
  const average = record.attempts.length
    ? Math.round(
        record.attempts.reduce(
          (sum, attempt) => sum + assessmentPercent(attempt),
          0,
        ) / record.attempts.length,
      )
    : 0;
  const streak = consecutiveStudyDays([
    ...record.attempts.map((attempt) => attempt.completedAt),
    ...workspace.state.studyEntries.map((entry) => entry.date),
  ]);
  const courseSignals = selectedCourses.map((course) => {
    const courseResources = resources.data.filter(
      (resource) => resource.courseId === course.id,
    );
    const ids = new Set(courseResources.map((resource) => resource.id));
    const confidence = record.confidence.find(
      (item) => item.courseId === course.id,
    )?.value;
    return {
      course,
      resources: courseResources.length,
      reviewed: workspace.state.reviewedResourceIds.filter((id) => ids.has(id))
        .length,
      viewed: new Set(
        workspace.state.recentResources
          .filter((item) => ids.has(item.resourceId))
          .map((item) => item.resourceId),
      ).size,
      saved: workspace.state.savedIds.filter((id) => ids.has(id)).length,
      confidence,
    };
  });
  const next = [...courseSignals].sort(
    (a, b) =>
      (a.confidence || 0) - (b.confidence || 0) || a.reviewed - b.reviewed,
  )[0];

  const setConfidence = async (id: string, value: number) => {
    try {
      await insights.setConfidence({ courseId: id, value });
    } catch {
      toast.error(label("progressSaveFailed"));
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await insights.recordAssessment({
        courseId,
        title,
        correct: Number(correct),
        total: Number(total),
        completedAt,
      });
      setTitle("");
      setCorrect("");
      setTotal("");
      setFormOpen(false);
      toast.success(label("progressAttemptSaved"));
    } catch {
      toast.error(label("progressSaveFailed"));
    }
  };
  const remove = async (id: string) => {
    try {
      const source =
        [...document.querySelectorAll<HTMLElement>("[data-attempt-id]")].find(
          (row) => row.dataset.attemptId === id,
        ) || null;
      await throwToTrash(
        source,
        record.attempts.find((attempt) => attempt.id === id)?.title ||
          label("progressAttemptDeleted"),
      ).finished;
      await insights.deleteAssessment(id);
    } catch {
      toast.error(label("progressSaveFailed"));
    }
  };
  const exportProgress = () => {
    downloadCsv("my-medclub-study-insights.csv", [
      [
        "course_id",
        "course",
        "confidence",
        "practice_title",
        "correct",
        "total",
        "completed_at",
      ],
      ...record.attempts.map((attempt) => [
        attempt.courseId,
        courseNames.get(attempt.courseId) || attempt.courseId,
        record.confidence.find((item) => item.courseId === attempt.courseId)
          ?.value || "",
        attempt.title,
        attempt.correct,
        attempt.total,
        attempt.completedAt,
      ]),
    ]);
    toast.success(label("insightsExported"));
  };
  return (
    <div
      className={`${embedded ? "learning-insights" : "container"} academic-progress-page`}
    >
      <section className="progress-hero">
        <PageIntro
          headingLevel={embedded ? 2 : 1}
          eyebrow={label("progressEyebrow")}
          title={label("progressTitle")}
          description={label("progressBody")}
        />
        <div className="progress-hero-visual" aria-hidden="true">
          <BrainCircuit size={30} />
          <i />
          <b />
          <span />
        </div>
      </section>
      {!record.persistent && (
        <p className="workspace-warning" role="status">
          {label("progressPersistenceWarning")}
        </p>
      )}
      <section className="progress-metrics" aria-label={label("myProgress")}>
        <article>
          <span className="progress-metric-mark">
            <Sparkles size={19} />
          </span>
          <strong>{streak}</strong>
          <p>{label("progressStudyDays")}</p>
          <small>{label("progressRecorded")}</small>
        </article>
        <article>
          <span className="progress-metric-mark">
            <BookOpenCheck size={19} />
          </span>
          <strong>{reviewed}</strong>
          <p>{label("progressResourcesReviewed")}</p>
          <small>{label("progressRecorded")}</small>
        </article>
        <article>
          <span className="progress-metric-mark">
            <BrainCircuit size={19} />
          </span>
          <strong>{record.attempts.length ? `${average}%` : "—"}</strong>
          <p>{label("progressPracticeAverage")}</p>
          <small>{label("progressSelfRated")}</small>
        </article>
      </section>
      {next && (
        <AppLink
          href={coursePath(next.course.slug)}
          className="progress-next-step"
        >
          <span>
            <small>{label("progressNextStep")}</small>
            <strong>{t(next.course.title)}</strong>
            <p>{label("progressNextStepBody")}</p>
          </span>
          <ArrowUpRight size={21} className="directional" />
        </AppLink>
      )}
      <section className="progress-section">
        <header className="progress-section-heading">
          <div>
            <h2>{label("progressCourseSignals")}</h2>
            <p>{label("progressCourseSignalsBody")}</p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={exportProgress}
          >
            <Download size={17} />
            {label("insightsExport")}
          </button>
        </header>
        <div className="course-signal-grid">
          {courseSignals.map((signal) => (
            <article
              key={signal.course.id}
              className="course-signal-card"
              data-accent={signal.course.accent}
            >
              <header>
                <span>{signal.course.code}</span>
                <h3>{t(signal.course.title)}</h3>
              </header>
              <dl>
                <div>
                  <dt>{label("progressReviewed")}</dt>
                  <dd>
                    {signal.reviewed}/{signal.resources}
                  </dd>
                </div>
                <div>
                  <dt>{label("progressViewed")}</dt>
                  <dd>{signal.viewed}</dd>
                </div>
                <div>
                  <dt>{label("progressSaved")}</dt>
                  <dd>{signal.saved}</dd>
                </div>
              </dl>
              <fieldset>
                <legend>
                  {label("progressConfidence")}{" "}
                  <small>{label("progressSelfRated")}</small>
                </legend>
                <div className="confidence-scale">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={signal.confidence === value}
                      aria-label={`${label("progressConfidence")}: ${label(`progressConfidence${value}` as "progressConfidence1")}`}
                      onClick={() =>
                        void setConfidence(signal.course.id, value)
                      }
                      disabled={insights.isMutating}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p>
                  {signal.confidence
                    ? label(
                        `progressConfidence${signal.confidence}` as "progressConfidence1",
                      )
                    : label("progressConfidence1")}
                </p>
              </fieldset>
              <AppLink href={coursePath(signal.course.slug)}>
                {label("courseHome")}
                <ArrowUpRight size={16} className="directional" />
              </AppLink>
            </article>
          ))}
        </div>
      </section>
      <section className="progress-practice progress-section">
        <header className="progress-section-heading">
          <div>
            <h2>{label("progressPracticeHistory")}</h2>
            <p>{label("progressPracticeBody")}</p>
          </div>
          <button
            className="button"
            type="button"
            onClick={() => {
              setCourseId(courseId || selectedCourses[0]?.id || "");
              setFormOpen((open) => !open);
            }}
          >
            {label("progressAddAttempt")}
          </button>
        </header>
        {formOpen && (
          <form className="practice-form" onSubmit={submit}>
            <label>
              <span>{label("progressCourse")}</span>
              <select
                required
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                {selectedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {t(course.title)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{label("progressAssessmentTitle")}</span>
              <input
                required
                maxLength={80}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              <span>{label("progressCorrect")}</span>
              <input
                required
                type="number"
                min="0"
                max="300"
                value={correct}
                onChange={(event) => setCorrect(event.target.value)}
              />
            </label>
            <label>
              <span>{label("progressTotal")}</span>
              <input
                required
                type="number"
                min="1"
                max="300"
                value={total}
                onChange={(event) => setTotal(event.target.value)}
              />
            </label>
            <label>
              <span>{label("progressCompleted")}</span>
              <input
                required
                type="date"
                max="2026-09-08"
                value={completedAt}
                onChange={(event) => setCompletedAt(event.target.value)}
              />
            </label>
            <button
              className="button"
              type="submit"
              disabled={insights.isMutating}
            >
              {label("progressSaveAttempt")}
            </button>
          </form>
        )}
        {record.attempts.length ? (
          <>
            <AttemptBars attempts={record.attempts} courseNames={courseNames} />
            <div className="practice-history">
              {[...record.attempts]
                .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
                .map((attempt) => (
                  <article key={attempt.id} data-attempt-id={attempt.id}>
                    <span>
                      <strong>{attempt.title}</strong>
                      <small>
                        {courseNames.get(attempt.courseId)} ·{" "}
                        {formatDate(attempt.completedAt, locale)}
                      </small>
                    </span>
                    <b>
                      {attempt.correct}/{attempt.total} ·{" "}
                      {assessmentPercent(attempt)}%
                    </b>
                    <button
                      type="button"
                      onClick={() => void remove(attempt.id)}
                      aria-label={`${label("progressDeleteAttempt")}: ${attempt.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))}
            </div>
          </>
        ) : (
          <p className="progress-empty">{label("progressNoAttempts")}</p>
        )}
      </section>
      <aside className="progress-privacy">
        <LockKeyhole size={22} />
        <span>
          <strong>{label("progressPrivacy")}</strong>
          <p>{label("progressPrivacyBody")}</p>
        </span>
      </aside>
    </div>
  );
}
