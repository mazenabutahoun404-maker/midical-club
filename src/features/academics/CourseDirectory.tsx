import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, SlidersHorizontal, X } from "lucide-react";
import type { Course, Track } from "../../types/content";
import { useBatches } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { SearchInput } from "../../components/forms/SearchInput";
import { SelectField } from "../../components/forms/SelectField";
import { CourseCard } from "../../components/cards/CourseCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { courseMatches } from "./course-finder";
import "./course-directory.css";

export function CourseDirectory({
  courses,
  track: fixedTrack,
}: {
  courses: Course[];
  track?: Track;
}) {
  const { t, label } = useLocale();
  const auth = useAuth();
  const batches = useBatches();
  const [params, setParams] = useSearchParams();
  const search = (params.get("q") || "").slice(0, 200);
  const track =
    fixedTrack ||
    (["basic", "clinical"].includes(params.get("track") || "")
      ? params.get("track")!
      : "all");
  const year = params.get("year") || "";
  const batch = params.get("batch") || "";
  const [limit, setLimit] = useState(12);
  const heading = useId();
  useEffect(() => setLimit(12), [search, track, year, batch]);
  const years = [
    ...new Set(
      courses
        .filter((c) => track === "all" || c.track === track)
        .map((c) => c.year),
    ),
  ].sort((a, b) => a - b);
  const selectedBatch = batches.data?.find((b) => b.id === batch);
  const records = useMemo(
    () =>
      courses.filter(
        (c) =>
          (track === "all" || c.track === track) &&
          (!year || String(c.year) === year) &&
          (!batch ||
            c.sharedWithBatchIds.includes(batch) ||
            (selectedBatch &&
              (c.batch.en === selectedBatch.name.en ||
                c.batch.ar === selectedBatch.name.ar))) &&
          courseMatches(c, search),
      ),
    [courses, track, year, batch, selectedBatch, search],
  );
  const change = (key: string, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value && value !== "all") next.set(key, value);
        else next.delete(key);
        if (key === "track") next.delete("year");
        return next;
      },
      { replace: key === "q", preventScrollReset: true },
    );
  const filtered = !!(
    search ||
    year ||
    batch ||
    (!fixedTrack && track !== "all")
  );
  const reset = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const key of ["q", "track", "year", "batch"]) next.delete(key);
        return next;
      },
      { preventScrollReset: true },
    );
  return (
    <section className="course-directory" aria-labelledby={heading}>
      <div className="course-directory-heading">
        <div>
          <span className="academic-kicker">
            <BookOpen size={16} aria-hidden="true" />
            {t({ en: "Straight to your course", ar: "إلى مساقك مباشرة" })}
          </span>
          <h2 id={heading}>
            {t({
              en: "Find it. Open it. Start studying.",
              ar: "ابحث وافتح وابدأ الدراسة.",
            })}
          </h2>
          <p>
            {t({
              en: "Search by course name or code. Year and batch are optional filters.",
              ar: "ابحث باسم المساق أو رمزه. السنة والدفعة فلاتر اختيارية.",
            })}
          </p>
        </div>
        {auth.snapshot.status === "authenticated" && (
          <AppLink className="text-link" href="/my/learning">
            {label("myLearning")}
            <ArrowRight className="directional" size={17} />
          </AppLink>
        )}
      </div>
      <div className="course-directory-controls">
        <SearchInput
          value={search}
          onChange={(value) => change("q", value.slice(0, 200))}
          label={t({
            en: "Search course name or code",
            ar: "ابحث باسم المساق أو رمزه",
          })}
        />
        <div className="course-directory-filters">
          {!fixedTrack && (
            <SelectField
              label={t({ en: "Pathway", ar: "المسار" })}
              value={track}
              onChange={(event) => change("track", event.target.value)}
            >
              <option value="all">{label("allCourses")}</option>
              <option value="basic">{label("basic")}</option>
              <option value="clinical">{label("clinical")}</option>
            </SelectField>
          )}
          <SelectField
            label={label("year")}
            value={year}
            onChange={(event) => change("year", event.target.value)}
          >
            <option value="">
              {t({ en: "All years", ar: "جميع السنوات" })}
            </option>
            {year && !years.includes(Number(year)) && (
              <option value={year}>
                {t({ en: "Selected year", ar: "السنة المحددة" })}
              </option>
            )}
            {years.map((value) => (
              <option key={value} value={String(value)}>
                {label("year")} {value}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t({ en: "Batch (optional)", ar: "الدفعة (اختياري)" })}
            value={batch}
            disabled={batches.isPending || batches.isError}
            onChange={(event) => change("batch", event.target.value)}
          >
            <option value="">
              {t({ en: "All batches", ar: "جميع الدفعات" })}
            </option>
            {batch && !selectedBatch && (
              <option value={batch}>
                {t({ en: "Selected batch", ar: "الدفعة المحددة" })}
              </option>
            )}
            {batches.data?.map((value) => (
              <option key={value.id} value={value.id}>
                {t(value.name)}
              </option>
            ))}
          </SelectField>
        </div>
        {batches.isError && (
          <p className="course-directory-filter-error">
            {t({
              en: "The batch filter is unavailable. All courses can still be searched.",
              ar: "فلتر الدفعات غير متاح. لا يزال بإمكانك البحث في المساقات.",
            })}
            <button type="button" onClick={() => void batches.refetch()}>
              {label("retry")}
            </button>
          </p>
        )}
      </div>
      <div className="course-directory-result-bar">
        <p role="status" aria-live="polite">
          {records.length} {t({ en: "courses", ar: "مساقاً" })}
        </p>
        {filtered ? (
          <button type="button" onClick={reset}>
            <X size={15} aria-hidden="true" />
            {t({ en: "Clear filters", ar: "مسح الفلاتر" })}
          </button>
        ) : (
          <span>
            <SlidersHorizontal size={14} aria-hidden="true" />
            {t({
              en: "No batch selection required",
              ar: "لا يلزم اختيار دفعة",
            })}
          </span>
        )}
      </div>
      {records.length ? (
        <div className="course-directory-grid">
          {records.slice(0, limit).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={label("emptyCourses")}
          description={t({
            en: "Try a different name or clear the optional filters.",
            ar: "جرّب اسماً آخر أو امسح الفلاتر الاختيارية.",
          })}
        />
      )}
      {records.length > limit && (
        <button
          type="button"
          className="button button-outline course-directory-more"
          onClick={() => setLimit((value) => value + 12)}
        >
          {t({ en: "Show more courses", ar: "عرض المزيد من المساقات" })}
        </button>
      )}
    </section>
  );
}
