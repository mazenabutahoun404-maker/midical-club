import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
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
  const latestParams = useRef(params);
  useEffect(() => {
    latestParams.current = params;
  }, [params]);
  const search = (params.get("q") || "").slice(0, 200);
  const track =
    fixedTrack ||
    (["basic", "clinical"].includes(params.get("track") || "")
      ? params.get("track")!
      : "all");
  const year = params.get("year") || "";
  const batch = params.get("batch") || "";
  const [limit, setLimit] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const heading = useId();
  const filtersId = `${heading}-filters`;
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
  // Keep fast consecutive edits on the latest requested query, even while the
  // route view is committing the preceding search or reset.
  const updateParams = (
    edit: (next: URLSearchParams) => void,
    replace = false,
  ) => {
    const next = new URLSearchParams(latestParams.current);
    edit(next);
    latestParams.current = next;
    setParams(next, { replace, preventScrollReset: true });
  };
  const change = (key: string, value: string) =>
    updateParams((next) => {
      if (value && value !== "all") next.set(key, value);
      else next.delete(key);
      if (key === "track") next.delete("year");
    }, key === "q");
  const filtered = !!(
    search ||
    year ||
    batch ||
    (!fixedTrack && track !== "all")
  );
  const reset = () =>
    updateParams((next) => {
      for (const key of ["q", "track", "year", "batch"]) next.delete(key);
    });
  return (
    <section className="course-directory" aria-labelledby={heading}>
      <div className="course-directory-heading">
        <div>
          <h2 id={heading}>
            {t({ en: "Course library", ar: "مكتبة المساقات" })}
          </h2>
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
        <button
          type="button"
          className="course-directory-filter-toggle"
          aria-expanded={showFilters}
          aria-controls={filtersId}
          onClick={() => setShowFilters((value) => !value)}
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>{t({ en: "Filters", ar: "الفلاتر" })}</span>
          {filtered && (
            <i aria-label={t({ en: "Filters applied", ar: "فلاتر مفعّلة" })} />
          )}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <div
          id={filtersId}
          hidden={!showFilters}
          className="course-directory-filter-panel"
        >
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
      </div>
      <div className="course-directory-result-bar">
        <p role="status" aria-live="polite">
          {records.length} {t({ en: "courses", ar: "مساقاً" })}
        </p>
        <div className="course-directory-view-actions">
          {filtered && (
            <button type="button" onClick={reset}>
              <X size={15} aria-hidden="true" />
              {t({ en: "Clear filters", ar: "مسح الفلاتر" })}
            </button>
          )}
        </div>
      </div>
      {records.length ? (
        <div className="course-directory-grid">
          {records.slice(0, limit).map((course) => (
            <CourseCard course={course} key={course.id} />
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
