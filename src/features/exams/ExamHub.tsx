import { ExamLaunchArt } from "./ExamLaunchArt";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { useState } from "react";
import { CustomExamBuilder } from "./CustomExamBuilder";
import { ExamQuickStart } from "./ExamQuickStart";
import { useStudentProfile } from "../../hooks/useContent";

export default function ExamHub() {
  const { t } = useLocale(),
    { service, base } = useExams(),
    error = useExamError();
  const catalog = useExamQuery("catalog", (signal) => service.catalog(signal));
  const profile = useStudentProfile();
  const attempts = useExamQuery("attempts", (signal) =>
    service.attempts(signal),
  );
  const [params, setParams] = useSearchParams(),
    [builder, setBuilder] = useState(false);
  const [quickStart, setQuickStart] = useState<"quick" | "exam" | null>(null);
  const courseId = params.get("course") || "",
    year = params.get("year") || "",
    track = params.get("track") || "",
    semester = params.get("semester") || "",
    query = params.get("q") || "";
  const course = catalog.data?.courses.find((c) => c.id === courseId);
  const courses = (catalog.data?.courses || []).filter(
    (c) =>
      (!year || String(c.year) === year) &&
      (!track || c.track === track) &&
      (!semester || String(((c.semester - 1) % 2) + 1) === semester) &&
      `${c.title.en} ${c.title.ar} ${c.code}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (base === "/my/exams")
    courses.sort(
      (a, b) =>
        Number(profile.data?.courseIds.includes(b.id)) -
        Number(profile.data?.courseIds.includes(a.id)),
    );
  const sets =
    catalog.data?.sets.filter(
      (e) =>
        e.courseId === courseId &&
        (!params.get("batch") || e.batch.en === params.get("batch")) &&
        (!params.get("kind") || e.kind === params.get("kind")),
    ) || [];
  const active = attempts.data?.find((a) => a.status === "active");
  function filter(name: string, value: string) {
    const next = new URLSearchParams(params);
    value ? next.set(name, value) : next.delete(name);
    if (name === "track" && value === "clinical") next.delete("semester");
    setParams(next, { replace: true });
  }
  if (catalog.isPending) return <LoadingState />;
  if (catalog.isError)
    return (
      <ExamFailure
        message={error(catalog.error)}
        retry={() => void catalog.refetch()}
      />
    );
  return (
    <>
      {quickStart && (
        <ExamQuickStart
          courses={catalog.data.courses}
          quick={quickStart === "quick"}
          close={() => setQuickStart(null)}
        />
      )}
      {!course ? (
        <>
          <section className="exam-hub-hero">
            <div>
              <h1 data-page-heading tabIndex={-1}>
                {t({
                  en: "Electronic exams",
                  ar: "الامتحانات الإلكترونية",
                })}
              </h1>
              <p>
                {t({
                  en: "Choose a course, then practice, test or recall.",
                  ar: "اختر مساقك، ثم تدرّب أو اختبر نفسك أو راجع بطاقاتك.",
                })}
              </p>
              <div className="exam-hero-actions">
                <a href="#exam-courses" className="button button-primary">
                  {t({ en: "Find my course", ar: "اختيار مساقي" })}
                  <ArrowUpRight className="directional" size={18} />
                </a>
                <AppLink href={base + "/history"} className="text-link">
                  {t({ en: "My attempts", ar: "محاولاتي" })}
                </AppLink>
              </div>
            </div>
            <aside
              className="exam-hero-ledger"
              data-resumable={!!active || undefined}
            >
              <ExamLaunchArt />
              {active ? (
                <>
                  <h2>
                    {t({
                      en: "Your session is waiting.",
                      ar: "جلستك بانتظارك.",
                    })}
                  </h2>
                  <p>
                    {Object.keys(active.progress.answers).length}/
                    {active.questions.length}{" "}
                    {t({ en: "answered", ar: "تمت الإجابة عنها" })}
                  </p>
                  <AppLink
                    className="button button-secondary"
                    href={`${base}/attempt/${active.id}`}
                  >
                    {t({ en: "Continue my session", ar: "متابعة جلستي" })}
                    <ArrowUpRight className="directional" size={17} />
                  </AppLink>
                </>
              ) : null}
            </aside>
          </section>
          <nav
            className="exam-intent-actions"
            aria-label={t({
              en: "Choose your next step",
              ar: "اختر خطوتك التالية",
            })}
          >
            <AppLink
              href={
                active ? `${base}/attempt/${active.id}` : "/my/study/recall"
              }
            >
              <strong>
                {t(
                  active
                    ? { en: "Continue my session", ar: "متابعة جلستي" }
                    : { en: "My recall cards", ar: "بطاقات الاسترجاع" },
                )}
              </strong>
              <span>
                {t(
                  active
                    ? { en: "Right where you left off", ar: "من حيث توقفت" }
                    : {
                        en: "Think first, then turn the card",
                        ar: "فكّر أولاً ثم اقلب البطاقة",
                      },
                )}
              </span>
              <ArrowUpRight size={19} className="directional" />
            </AppLink>
            <button
              type="button"
              data-intent="quick"
              onClick={() => setQuickStart("quick")}
            >
              <strong>
                {t({ en: "I have 5 minutes", ar: "لديّ 5 دقائق" })}
              </strong>
              <span>
                {t({
                  en: "A short set, at your own pace",
                  ar: "مجموعة قصيرة على وتيرتك",
                })}
              </span>
              <Sparkles size={19} />
            </button>
            <button
              type="button"
              data-intent="exam"
              onClick={() => setQuickStart("exam")}
            >
              <strong>
                {t({ en: "Prepare for an exam", ar: "الاستعداد لامتحان" })}
              </strong>
              <span>
                {t({
                  en: "Choose your course and session",
                  ar: "اختر المساق والجلسة",
                })}
              </span>
              <BookOpen size={19} />
            </button>
          </nav>
          <section id="exam-courses" className="exam-catalog">
            <ExamHeading
              eyebrow=""
              title={t({ en: "Choose your course", ar: "اختر مساقك" })}
              heading="h2"
            />
            <div className="exam-filters">
              <label className="exam-search-field">
                <Search size={18} />
                <input
                  aria-label={t({ en: "Find a course", ar: "البحث عن مساق" })}
                  placeholder={t({
                    en: "Course name or code",
                    ar: "اسم المساق أو رمزه",
                  })}
                  value={query}
                  onChange={(e) => filter("q", e.target.value)}
                />
              </label>
              <select
                aria-label={t({ en: "Academic year", ar: "السنة الدراسية" })}
                value={year}
                onChange={(e) => filter("year", e.target.value)}
              >
                <option value="">
                  {t({ en: "All years", ar: "كل السنوات" })}
                </option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option value={n} key={n}>
                    {t({ en: "Year", ar: "السنة" })} {n}
                  </option>
                ))}
              </select>
              <select
                aria-label={t({ en: "Track", ar: "المسار" })}
                value={track}
                onChange={(e) => filter("track", e.target.value)}
              >
                <option value="">
                  {t({ en: "All sciences", ar: "كل العلوم" })}
                </option>
                <option value="basic">
                  {t({ en: "Basic sciences", ar: "العلوم الأساسية" })}
                </option>
                <option value="clinical">
                  {t({ en: "Clinical sciences", ar: "العلوم السريرية" })}
                </option>
              </select>
              {track !== "clinical" && (
                <select
                  aria-label={t({ en: "Semester", ar: "الفصل" })}
                  value={semester}
                  onChange={(e) => filter("semester", e.target.value)}
                >
                  <option value="">
                    {t({ en: "All semesters", ar: "كل الفصول" })}
                  </option>
                  <option value="1">
                    {t({ en: "First semester", ar: "الفصل الأول" })}
                  </option>
                  <option value="2">
                    {t({ en: "Second semester", ar: "الفصل الثاني" })}
                  </option>
                </select>
              )}
              {params.size > 0 && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setParams({})}
                >
                  {t({ en: "Clear filters", ar: "مسح المرشحات" })}
                </button>
              )}
            </div>
            <div className="exam-subject-grid">
              {courses.map((c) => {
                const count = catalog.data!.sets.filter(
                  (e) => e.courseId === c.id && e.questionIds.length,
                ).length;
                return (
                  <AppLink
                    className="exam-subject-card"
                    data-accent={c.accent}
                    key={c.id}
                    href={`${base}?course=${encodeURIComponent(c.id)}`}
                  >
                    <span className="exam-subject-code">
                      <BookOpen size={19} />
                      <bdi>{c.code}</bdi>
                      <small>
                        {t({ en: "Year", ar: "السنة" })} {c.year}
                      </small>
                    </span>
                    <h2>{t(c.title)}</h2>
                    <p>
                      {t(c.batch)} · {t({ en: "Semester", ar: "الفصل" })}{" "}
                      {((c.semester - 1) % 2) + 1}
                    </p>
                    <footer>
                      <span>
                        {count
                          ? `${count} ${t(count === 1 ? { en: "question set", ar: "مجموعة أسئلة" } : { en: "question sets", ar: "مجموعات أسئلة" })}`
                          : t({
                              en: "Waiting for its first questions",
                              ar: "بانتظار أسئلته الأولى",
                            })}
                      </span>
                      <ArrowUpRight className="directional" size={19} />
                    </footer>
                  </AppLink>
                );
              })}
            </div>
            {!courses.length && (
              <ExamEmpty
                title={t({
                  en: "No course matches yet",
                  ar: "لا توجد مساقات مطابقة",
                })}
                body={t({
                  en: "Try another course name or clear your filters.",
                  ar: "جرّب اسم مساق آخر أو امسح المرشحات.",
                })}
              />
            )}
          </section>
        </>
      ) : (
        <>
          <button
            type="button"
            className="text-link"
            onClick={() => setParams({})}
          >
            <ArrowLeft className="directional" size={17} />
            {t({ en: "All courses", ar: "كل المساقات" })}
          </button>
          <ExamHeading
            eyebrow={`${course.code} · ${t(course.batch)}`}
            title={t(course.title)}
            body={t({
              en: "Choose a set, or bring together exactly the questions you want to revisit.",
              ar: "اختر مجموعة أو اجمع الأسئلة التي تريد مراجعتها.",
            })}
          >
            <button
              type="button"
              className="button button-primary"
              onClick={() => setBuilder(true)}
            >
              <Sparkles size={18} />
              {t({ en: "Build my session", ar: "إنشاء جلستي" })}
            </button>
          </ExamHeading>
          <div className="exam-filters">
            <select
              aria-label={t({ en: "Exam batch", ar: "دفعة الامتحان" })}
              value={params.get("batch") || ""}
              onChange={(e) => filter("batch", e.target.value)}
            >
              <option value="">
                {t({ en: "All batches", ar: "كل الدفعات" })}
              </option>
              {[
                ...new Set(
                  catalog
                    .data!.sets.filter((e) => e.courseId === course.id)
                    .map((e) => e.batch.en),
                ),
              ].map((batch) => (
                <option key={batch}>{batch}</option>
              ))}
            </select>
            <select
              aria-label={t({ en: "Set type", ar: "نوع المجموعة" })}
              value={params.get("kind") || ""}
              onChange={(e) => filter("kind", e.target.value)}
            >
              <option value="">
                {t({ en: "All types", ar: "كل الأنواع" })}
              </option>
              {["practice", "midterm", "final", "custom"].map((kind) => (
                <option key={kind} value={kind}>
                  {t({
                    en: kind,
                    ar: (
                      {
                        practice: "تدريب",
                        midterm: "نصفي",
                        final: "نهائي",
                        custom: "مخصص",
                      } as Record<string, string>
                    )[kind],
                  })}
                </option>
              ))}
            </select>
          </div>
          <div className="exam-set-grid">
            {sets.map((set) => (
              <AppLink
                className="exam-set-card"
                key={set.id}
                href={`${base}/set/${encodeURIComponent(set.id)}`}
              >
                <span className="exam-kicker">
                  {t(set.batch)}
                  {set.year ? ` · ${set.year}` : ""}
                </span>
                <h2>{t(set.title)}</h2>
                <p>{t(set.description)}</p>
                <footer>
                  <span>
                    {set.questionIds.length}{" "}
                    {t({ en: "questions", ar: "سؤال" })} ·{" "}
                    {set.suggestedMinutes}{" "}
                    {t({ en: "min suggested", ar: "دقيقة مقترحة" })}
                  </span>
                  <ArrowUpRight className="directional" size={18} />
                </footer>
              </AppLink>
            ))}
          </div>
          {!sets.length && (
            <ExamEmpty
              title={t({
                en: "A shelf ready to be filled",
                ar: "رف جاهز ليمتلئ",
              })}
              body={t({
                en: "There are no published sets matching these filters yet.",
                ar: "لا توجد مجموعات منشورة تطابق المرشحات بعد.",
              })}
            />
          )}
          {builder && (
            <CustomExamBuilder
              course={course}
              close={() => setBuilder(false)}
            />
          )}
        </>
      )}
    </>
  );
}
