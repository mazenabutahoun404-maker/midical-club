import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import { QuestionView } from "./QuestionView";
import { QuestionTools } from "./QuestionTools";
export default function ExamSearch() {
  const { t } = useLocale(),
    { service } = useExams(),
    errorText = useExamError(),
    [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("q") || ""),
    [course, setCourse] = useState(params.get("course") || ""),
    [limit, setLimit] = useState(10);
  const query = useDeferredValue(params.get("q") || ""),
    catalog = useExamQuery("catalog", (signal) => service.catalog(signal));
  const results = useExamQuery(
    "search",
    (signal) => service.search(query, course || undefined, signal),
    `${query}:${course}`,
    query.trim().length >= 2,
  );
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setParams({ q: input.trim(), ...(course ? { course } : {}) });
    setLimit(10);
  }
  return (
    <>
      <ExamHeading
        eyebrow={t({
          en: "Less hunting. More understanding.",
          ar: "بحث أقل وفهم أكثر",
        })}
        title={t({
          en: "Find the question\nyou came for.",
          ar: "ابحث عن السؤال\nالذي تحتاجه.",
        })}
        body={t({
          en: "Search question text, chapters or lecturer names. Your language can be English or Arabic.",
          ar: "ابحث في نص السؤال أو الفصل أو اسم المحاضر بالعربية أو الإنجليزية.",
        })}
      />
      <form className="exam-search-form" onSubmit={submit}>
        <label className="exam-search-field">
          <Search size={19} />
          <input
            value={input}
            minLength={2}
            maxLength={200}
            onChange={(e) => setInput(e.target.value)}
            aria-label={t({ en: "Search questions", ar: "البحث في الأسئلة" })}
            placeholder={t({
              en: "A topic, phrase or chapter…",
              ar: "موضوع أو عبارة أو فصل…",
            })}
            required
          />
        </label>
        <select
          value={course}
          onChange={(e) => {
            setCourse(e.target.value);
            setLimit(10);
          }}
          aria-label={t({ en: "Search course", ar: "مساق البحث" })}
        >
          <option value="">
            {t({ en: "All courses", ar: "كل المساقات" })}
          </option>
          {catalog.data?.courses.map((c) => (
            <option key={c.id} value={c.id}>
              {t(c.title)}
            </option>
          ))}
        </select>
        <button type="submit" className="button button-primary">
          {t({ en: "Search", ar: "بحث" })}
        </button>
      </form>
      {query.trim().length < 2 ? (
        <ExamEmpty
          title={t({
            en: "Start with a little detail",
            ar: "ابدأ بتفصيل صغير",
          })}
          body={t({
            en: "Enter at least two characters to search the question bank.",
            ar: "أدخل حرفين على الأقل للبحث في بنك الأسئلة.",
          })}
        />
      ) : results.isPending ? (
        <LoadingState />
      ) : results.isError ? (
        <ExamFailure
          message={errorText(results.error)}
          retry={() => void results.refetch()}
        />
      ) : results.data?.length ? (
        <>
          <p className="exam-search-count" role="status">
            {results.data.length}{" "}
            {t({ en: "matching questions", ar: "أسئلة مطابقة" })}
          </p>
          {results.data.slice(0, limit).map((q, i) => (
            <article key={q.id} className="exam-review-card">
              <QuestionView question={q} reveal locked number={i + 1} />
              <QuestionTools questionId={q.id} />
            </article>
          ))}
          {results.data.length > limit && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setLimit((n) => n + 10)}
            >
              {t({ en: "Show more", ar: "عرض المزيد" })}
            </button>
          )}
        </>
      ) : (
        <ExamEmpty
          title={t({ en: "No matching questions", ar: "لا توجد أسئلة مطابقة" })}
          body={t({
            en: "Try a shorter phrase or another course.",
            ar: "جرّب عبارة أقصر أو مساقاً آخر.",
          })}
        />
      )}
    </>
  );
}
